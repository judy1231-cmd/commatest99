package com.comma.domain.challenge.controller;

import com.comma.domain.challenge.model.Challenge;
import com.comma.domain.challenge.service.ChallengeService;
import com.comma.global.util.ApiResponse;
import com.comma.global.util.FileUploadService;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/challenges")
@RequiredArgsConstructor
public class ChallengeController {

    private final ChallengeService challengeService;
    private final FileUploadService fileUploadService;

    // GET /api/challenges  — 전체 챌린지 목록 (비로그인도 가능, 로그인 시 참여 여부 포함)
    @GetMapping
    public ResponseEntity<ApiResponse<List<Challenge>>> getChallenges(HttpServletRequest request) {
        String commaNo = (String) request.getAttribute("쉼표번호");
        List<Challenge> challenges = challengeService.getChallenges(commaNo);
        return ResponseEntity.ok(ApiResponse.ok(challenges, "챌린지 목록 조회 성공"));
    }

    // GET /api/challenges/{id}
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<Challenge>> getChallenge(
            HttpServletRequest request,
            @PathVariable Long id) {
        String commaNo = (String) request.getAttribute("쉼표번호");
        try {
            Challenge challenge = challengeService.getChallenge(id, commaNo);
            return ResponseEntity.ok(ApiResponse.ok(challenge, "챌린지 조회 성공"));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(404).body(ApiResponse.fail(e.getMessage()));
        }
    }

    // GET /api/challenges/my  [JWT 필요]  — 내가 참여 중인 챌린지
    @GetMapping("/my")
    public ResponseEntity<ApiResponse<List<Challenge>>> getMyChallenges(HttpServletRequest request) {
        String commaNo = (String) request.getAttribute("쉼표번호");
        List<Challenge> challenges = challengeService.getMyChallenges(commaNo);
        return ResponseEntity.ok(ApiResponse.ok(challenges, "내 챌린지 조회 성공"));
    }

    // POST /api/challenges/{id}/join  [JWT 필요]  — 참여/취소 토글
    @PostMapping("/{id}/join")
    public ResponseEntity<ApiResponse<Map<String, Object>>> toggleJoin(
            HttpServletRequest request,
            @PathVariable Long id) {
        String commaNo = (String) request.getAttribute("쉼표번호");
        Map<String, Object> result = challengeService.toggleJoin(id, commaNo);
        boolean joined = Boolean.TRUE.equals(result.get("joined"));
        return ResponseEntity.ok(ApiResponse.ok(result, joined ? "챌린지에 참여했습니다." : "챌린지 참여를 취소했습니다."));
    }

    // POST /api/challenges/upload-photo  [JWT 필요]  — 인증 사진 업로드
    @PostMapping("/upload-photo")
    public ResponseEntity<ApiResponse<Map<String, Object>>> uploadPhoto(
            HttpServletRequest request,
            @RequestParam("file") MultipartFile file) {
        try {
            String url = fileUploadService.uploadChallengePhoto(file);
            return ResponseEntity.ok(ApiResponse.ok(Map.of("url", url), "사진 업로드 성공"));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(400).body(ApiResponse.fail(e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(ApiResponse.fail("사진 업로드에 실패했어요."));
        }
    }

    // POST /api/challenges/{id}/certify  [JWT 필요]  — 오늘 인증
    @PostMapping("/{id}/certify")
    public ResponseEntity<ApiResponse<Map<String, Object>>> certifyToday(
            HttpServletRequest request,
            @PathVariable Long id,
            @RequestBody(required = false) Map<String, String> body) {
        String commaNo = (String) request.getAttribute("쉼표번호");
        String memo = body != null ? body.getOrDefault("memo", "") : "";
        String photoUrl = body != null ? body.getOrDefault("photoUrl", null) : null;
        try {
            Map<String, Object> result = challengeService.certifyToday(id, commaNo, memo, photoUrl);
            boolean completed = Boolean.TRUE.equals(result.get("completed"));
            String msg = completed ? "챌린지를 완료했어요! 정말 대단해요 🎉" : "오늘 인증 완료! 내일도 화이팅 💪";
            return ResponseEntity.ok(ApiResponse.ok(result, msg));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(400).body(ApiResponse.fail(e.getMessage()));
        } catch (IllegalStateException e) {
            return ResponseEntity.status(409).body(ApiResponse.fail(e.getMessage()));
        }
    }

    // GET /api/challenges/{id}/certify/status  [JWT 필요]  — 인증 상태 조회
    @GetMapping("/{id}/certify/status")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getCertifyStatus(
            HttpServletRequest request,
            @PathVariable Long id) {
        String commaNo = (String) request.getAttribute("쉼표번호");
        Map<String, Object> result = challengeService.getCertifyStatus(id, commaNo);
        return ResponseEntity.ok(ApiResponse.ok(result, "인증 상태 조회 성공"));
    }

    // GET /api/admin/challenges  [ADMIN 전용]
    @GetMapping("/admin")
    public ResponseEntity<ApiResponse<List<Challenge>>> getAdminChallenges() {
        List<Challenge> challenges = challengeService.getAllForAdmin();
        return ResponseEntity.ok(ApiResponse.ok(challenges, "관리자 챌린지 목록 조회 성공"));
    }

    // PUT /api/admin/challenges/{id}/active  [ADMIN 전용]
    @PutMapping("/admin/{id}/active")
    public ResponseEntity<ApiResponse<Void>> updateActive(
            @PathVariable Long id,
            @RequestBody Map<String, Object> body) {
        boolean isActive = Boolean.TRUE.equals(body.get("isActive"));
        challengeService.updateIsActive(id, isActive);
        return ResponseEntity.ok(ApiResponse.ok(isActive ? "챌린지가 활성화되었습니다." : "챌린지가 비활성화되었습니다."));
    }
}
