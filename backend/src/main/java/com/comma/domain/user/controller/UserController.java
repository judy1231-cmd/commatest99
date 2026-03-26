package com.comma.domain.user.controller;

import com.comma.domain.user.mapper.UserMapper;
import com.comma.domain.user.model.User;
import com.comma.domain.user.model.UserSettings;
import com.comma.domain.user.service.UserService;
import com.comma.global.util.ApiResponse;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.nio.charset.StandardCharsets;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/user")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;
    private final UserMapper userMapper;

    // GET /api/user/profile  [JWT 필요]
    @GetMapping("/profile")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getProfile(HttpServletRequest request) {
        String 쉼표번호 = (String) request.getAttribute("쉼표번호");
        try {
            Map<String, Object> profile = userService.getProfile(쉼표번호);
            return ResponseEntity.ok(ApiResponse.ok(profile, "프로필 조회 성공"));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(404).body(ApiResponse.fail(e.getMessage()));
        }
    }

    // PUT /api/user/profile  [JWT 필요]
    @PutMapping("/profile")
    public ResponseEntity<ApiResponse<Void>> updateProfile(
            HttpServletRequest request,
            @RequestBody Map<String, String> body) {
        String 쉼표번호 = (String) request.getAttribute("쉼표번호");
        try {
            userService.updateProfile(쉼표번호, body.get("nickname"));
            return ResponseEntity.ok(ApiResponse.ok("프로필이 수정되었습니다."));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(ApiResponse.fail(e.getMessage()));
        }
    }

    // GET /api/user/settings  [JWT 필요]
    @GetMapping("/settings")
    public ResponseEntity<ApiResponse<UserSettings>> getSettings(HttpServletRequest request) {
        String 쉼표번호 = (String) request.getAttribute("쉼표번호");
        UserSettings settings = userService.getSettings(쉼표번호);
        return ResponseEntity.ok(ApiResponse.ok(settings, "설정 조회 성공"));
    }

    // PUT /api/user/settings  [JWT 필요]
    @PutMapping("/settings")
    public ResponseEntity<ApiResponse<Void>> updateSettings(
            HttpServletRequest request,
            @RequestBody UserSettings settings) {
        String 쉼표번호 = (String) request.getAttribute("쉼표번호");
        userService.updateSettings(쉼표번호, settings);
        return ResponseEntity.ok(ApiResponse.ok("설정이 저장되었습니다."));
    }

    // PATCH /api/auth/me/nickname  [JWT 필요] — MyPage.jsx 호환용
    @PatchMapping("/nickname")
    public ResponseEntity<ApiResponse<Map<String, Object>>> updateNickname(
            HttpServletRequest request,
            @RequestBody Map<String, String> body) {
        String 쉼표번호 = (String) request.getAttribute("쉼표번호");
        String nickname = body.get("nickname");
        if (nickname == null || nickname.isBlank() || nickname.length() < 2 || nickname.length() > 20) {
            return ResponseEntity.badRequest().body(ApiResponse.fail("닉네임은 2~20자로 입력해주세요."));
        }
        try {
            userService.updateProfile(쉼표번호, nickname.trim());
            Map<String, Object> data = new java.util.HashMap<>();
            data.put("쉼표번호", 쉼표번호);
            data.put("nickname", nickname.trim());
            return ResponseEntity.ok(ApiResponse.ok(data, "닉네임이 변경되었습니다."));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(ApiResponse.fail(e.getMessage()));
        }
    }

    // POST /api/user/device-token  [JWT 필요] — 애플워치 단축어 연동용 토큰 발급 (이미 있으면 기존 토큰 반환)
    @PostMapping("/device-token")
    public ResponseEntity<ApiResponse<Map<String, String>>> issueDeviceToken(HttpServletRequest request) {
        String 쉼표번호 = (String) request.getAttribute("쉼표번호");
        String token = userService.issueDeviceToken(쉼표번호);
        return ResponseEntity.ok(ApiResponse.ok(Map.of("deviceToken", token), "디바이스 토큰이 발급되었습니다."));
    }

    // POST /api/user/device-token/reissue  [JWT 필요] — 토큰 재발급 (기존 토큰 무효화)
    @PostMapping("/device-token/reissue")
    public ResponseEntity<ApiResponse<Map<String, String>>> reissueDeviceToken(HttpServletRequest request) {
        String 쉼표번호 = (String) request.getAttribute("쉼표번호");
        String token = userService.reissueDeviceToken(쉼표번호);
        return ResponseEntity.ok(ApiResponse.ok(Map.of("deviceToken", token), "디바이스 토큰이 재발급되었습니다."));
    }

    // GET /api/user/shortcut?deviceToken=  [JWT 없음] — 애플워치 단축어 파일 다운로드 (QR 스캔 → 단축어 1탭 설치)
    @GetMapping("/shortcut")
    public ResponseEntity<byte[]> downloadShortcut(
            HttpServletRequest request,
            @RequestParam String deviceToken) {
        User user = userMapper.findByDeviceToken(deviceToken);
        if (user == null) {
            return ResponseEntity.status(401).build();
        }

        // 서버 URL 동적 생성 (개발/배포 자동 대응)
        int port = request.getServerPort();
        String serverUrl = request.getScheme() + "://" + request.getServerName() +
                ((port == 80 || port == 443) ? "" : ":" + port);
        String baseUrl = serverUrl + "/api/diagnosis/measurements/device"
                + "?deviceToken=" + deviceToken
                + "&amp;key=comma-apple-watch-2026&amp;bpm=";

        String uuid1 = UUID.randomUUID().toString().toUpperCase();
        String uuid2 = UUID.randomUUID().toString().toUpperCase();
        int attachOffset = baseUrl.length() - "&amp;".length() * 2 + 2; // XML 디코딩 후 실제 문자열 길이

        // &amp; → & 로 치환된 실제 URL 길이 계산
        String actualBaseUrl = baseUrl.replace("&amp;", "&");
        int actualOffset = actualBaseUrl.length();

        String xml = "<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n"
                + "<!DOCTYPE plist PUBLIC \"-//Apple//DTD PLIST 1.0//EN\" \"http://www.apple.com/DTDs/PropertyList-1.0.dtd\">\n"
                + "<plist version=\"1.0\">\n"
                + "<dict>\n"
                + "    <key>WFWorkflowActions</key>\n"
                + "    <array>\n"
                // 1. 건강 샘플 찾기 (심박수 최신 1개)
                + "        <dict>\n"
                + "            <key>WFWorkflowActionIdentifier</key>\n"
                + "            <string>is.workflow.actions.health.quantity.find</string>\n"
                + "            <key>WFWorkflowActionParameters</key>\n"
                + "            <dict>\n"
                + "                <key>WFHealthQuantityType</key>\n"
                + "                <string>Heart Rate</string>\n"
                + "                <key>WFHealthOrder</key>\n"
                + "                <string>Latest</string>\n"
                + "                <key>WFHealthMaximumQuantity</key>\n"
                + "                <integer>1</integer>\n"
                + "                <key>UUID</key>\n"
                + "                <string>" + uuid1 + "</string>\n"
                + "            </dict>\n"
                + "        </dict>\n"
                // 2. 세부 사항 가져오기 (숫자값 추출)
                + "        <dict>\n"
                + "            <key>WFWorkflowActionIdentifier</key>\n"
                + "            <string>is.workflow.actions.properties.healthsample</string>\n"
                + "            <key>WFWorkflowActionParameters</key>\n"
                + "            <dict>\n"
                + "                <key>WFProperty</key>\n"
                + "                <string>Value</string>\n"
                + "                <key>WFInput</key>\n"
                + "                <dict>\n"
                + "                    <key>Value</key>\n"
                + "                    <dict>\n"
                + "                        <key>OutputName</key>\n"
                + "                        <string>Health Samples</string>\n"
                + "                        <key>OutputUUID</key>\n"
                + "                        <string>" + uuid1 + "</string>\n"
                + "                        <key>Type</key>\n"
                + "                        <string>ActionOutput</string>\n"
                + "                    </dict>\n"
                + "                    <key>WFSerializationTypeIdentifier</key>\n"
                + "                    <string>WFTextTokenAttachment</string>\n"
                + "                </dict>\n"
                + "                <key>UUID</key>\n"
                + "                <string>" + uuid2 + "</string>\n"
                + "            </dict>\n"
                + "        </dict>\n"
                // 3. GET 요청 (bpm 변수 URL에 삽입)
                + "        <dict>\n"
                + "            <key>WFWorkflowActionIdentifier</key>\n"
                + "            <string>is.workflow.actions.downloadurl</string>\n"
                + "            <key>WFWorkflowActionParameters</key>\n"
                + "            <dict>\n"
                + "                <key>WFHTTPMethod</key>\n"
                + "                <string>GET</string>\n"
                + "                <key>WFURL</key>\n"
                + "                <dict>\n"
                + "                    <key>Value</key>\n"
                + "                    <dict>\n"
                + "                        <key>attachmentsByRange</key>\n"
                + "                        <dict>\n"
                + "                            <key>{" + actualOffset + ", 1}</key>\n"
                + "                            <dict>\n"
                + "                                <key>OutputName</key>\n"
                + "                                <string>Details</string>\n"
                + "                                <key>OutputUUID</key>\n"
                + "                                <string>" + uuid2 + "</string>\n"
                + "                                <key>Type</key>\n"
                + "                                <string>ActionOutput</string>\n"
                + "                            </dict>\n"
                + "                        </dict>\n"
                + "                        <key>string</key>\n"
                + "                        <string>" + actualBaseUrl + "\uFFFC</string>\n"
                + "                    </dict>\n"
                + "                    <key>WFSerializationTypeIdentifier</key>\n"
                + "                    <string>WFTextTokenString</string>\n"
                + "                </dict>\n"
                + "            </dict>\n"
                + "        </dict>\n"
                + "    </array>\n"
                + "    <key>WFWorkflowClientVersion</key>\n"
                + "    <string>1249</string>\n"
                + "    <key>WFWorkflowIcon</key>\n"
                + "    <dict>\n"
                + "        <key>WFWorkflowIconGlyphNumber</key>\n"
                + "        <integer>59511</integer>\n"
                + "        <key>WFWorkflowIconStartColor</key>\n"
                + "        <integer>431817727</integer>\n"
                + "    </dict>\n"
                + "    <key>WFWorkflowImportQuestions</key>\n"
                + "    <array/>\n"
                + "    <key>WFWorkflowMinimumClientVersion</key>\n"
                + "    <integer>900</integer>\n"
                + "    <key>WFWorkflowName</key>\n"
                + "    <string>심박수 전송</string>\n"
                + "    <key>WFWorkflowTypes</key>\n"
                + "    <array/>\n"
                + "</dict>\n"
                + "</plist>";

        org.springframework.http.HttpHeaders headers = new org.springframework.http.HttpHeaders();
        headers.add("Content-Type", "application/octet-stream");
        headers.add("Content-Disposition", "attachment; filename=\"shortcut.shortcut\"");
        return ResponseEntity.ok().headers(headers).body(xml.getBytes(StandardCharsets.UTF_8));
    }

    // DELETE /api/user/account  [JWT 필요]
    @DeleteMapping("/account")
    public ResponseEntity<ApiResponse<Void>> deleteAccount(HttpServletRequest request) {
        String 쉼표번호 = (String) request.getAttribute("쉼표번호");
        userService.deleteAccount(쉼표번호);
        return ResponseEntity.ok(ApiResponse.ok("회원 탈퇴가 처리되었습니다."));
    }
}
