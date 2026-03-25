package com.comma.domain.diagnosis.controller;

import com.comma.domain.diagnosis.mapper.DiagnosisMapper;
import com.comma.domain.diagnosis.model.DiagnosisResult;
import com.comma.domain.diagnosis.model.MeasurementSession;
import com.comma.domain.diagnosis.service.DiagnosisService;
import com.comma.domain.user.mapper.UserMapper;
import com.comma.domain.user.model.User;
import com.comma.global.util.ApiResponse;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.net.URLDecoder;
import java.nio.charset.StandardCharsets;
import java.util.List;
import java.util.Map;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@RestController
@RequestMapping("/api/diagnosis")
@RequiredArgsConstructor
public class DiagnosisController {

    private static final Logger log = LoggerFactory.getLogger(DiagnosisController.class);

    private final DiagnosisService diagnosisService;
    private final DiagnosisMapper diagnosisMapper;
    private final UserMapper userMapper;

    // ==================== 심박 측정 세션 ====================

    // POST /api/diagnosis/sessions/start  [JWT 필요]
    @PostMapping("/sessions/start")
    public ResponseEntity<ApiResponse<MeasurementSession>> startSession(
            HttpServletRequest request,
            @RequestBody Map<String, String> body) {
        String 쉼표번호 = (String) request.getAttribute("쉼표번호");
        String deviceType = body.getOrDefault("deviceType", "manual");
        MeasurementSession session = diagnosisService.startSession(쉼표번호, deviceType);
        return ResponseEntity.ok(ApiResponse.ok(session, "측정 세션이 시작되었습니다."));
    }

    // POST /api/diagnosis/sessions/{sessionId}/end  [JWT 필요]
    @PostMapping("/sessions/{sessionId}/end")
    public ResponseEntity<ApiResponse<Void>> endSession(
            HttpServletRequest request,
            @PathVariable Long sessionId) {
        String 쉼표번호 = (String) request.getAttribute("쉼표번호");
        try {
            diagnosisService.endSession(sessionId, 쉼표번호);
            return ResponseEntity.ok(ApiResponse.ok("측정 세션이 종료되었습니다."));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(ApiResponse.fail(e.getMessage()));
        }
    }

    // POST /api/diagnosis/sessions/{sessionId}/measurements  [JWT 필요]
    @PostMapping("/sessions/{sessionId}/measurements")
    public ResponseEntity<ApiResponse<Void>> saveMeasurement(
            HttpServletRequest request,
            @PathVariable Long sessionId,
            @RequestBody Map<String, Object> body) {
        String 쉼표번호 = (String) request.getAttribute("쉼표번호");
        try {
            Integer bpm = (Integer) body.get("bpm");
            Double hrv = body.get("hrv") != null ? ((Number) body.get("hrv")).doubleValue() : null;
            diagnosisService.saveMeasurement(sessionId, 쉼표번호, bpm, hrv);
            return ResponseEntity.ok(ApiResponse.ok("심박 데이터가 저장되었습니다."));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(ApiResponse.fail(e.getMessage()));
        }
    }

    // GET /api/diagnosis/sessions/{sessionId}/measurements/latest  [JWT 필요] — 웹 폴링용
    @GetMapping("/sessions/{sessionId}/measurements/latest")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getLatestMeasurement(
            HttpServletRequest request,
            @PathVariable Long sessionId) {
        String 쉼표번호 = (String) request.getAttribute("쉼표번호");
        MeasurementSession session = diagnosisService.getSessionEntity(sessionId, 쉼표번호);
        var latest = diagnosisService.getLatestMeasurement(sessionId);
        Map<String, Object> result = new java.util.HashMap<>();
        result.put("session", session);
        result.put("latest", latest);
        result.put("measurementCount", diagnosisService.getMeasurementCount(sessionId));
        return ResponseEntity.ok(ApiResponse.ok(result, "최신 측정값 조회 성공"));
    }

    // GET /api/diagnosis/sessions/{sessionId}  [JWT 필요]
    @GetMapping("/sessions/{sessionId}")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getSession(
            HttpServletRequest request,
            @PathVariable Long sessionId) {
        String 쉼표번호 = (String) request.getAttribute("쉼표번호");
        try {
            Map<String, Object> result = diagnosisService.getSession(sessionId, 쉼표번호);
            return ResponseEntity.ok(ApiResponse.ok(result, "세션 조회 성공"));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(ApiResponse.fail(e.getMessage()));
        }
    }

    // GET /api/diagnosis/measurements/device  [JWT 없음] — 애플워치 단축어 전용 (GET 쿼리 파라미터 방식, 3단계 단순화)
    @GetMapping("/measurements/device")
    public ResponseEntity<ApiResponse<Void>> saveMeasurementFromDeviceGet(
            @RequestParam String deviceToken,
            @RequestParam String bpm,
            @RequestParam String key,
            @RequestParam(required = false) String hrv) {
        if (!"comma-apple-watch-2026".equals(key)) {
            return ResponseEntity.status(401).body(ApiResponse.fail("유효하지 않은 키입니다."));
        }
        if (deviceToken == null || deviceToken.isBlank()) {
            return ResponseEntity.badRequest().body(ApiResponse.fail("deviceToken이 필요합니다."));
        }
        if (bpm == null || bpm.isBlank()) {
            return ResponseEntity.badRequest().body(ApiResponse.fail("bpm 값이 비어있습니다. 단축어에서 심박수 변수가 올바르게 연결됐는지 확인해주세요."));
        }
        User user = userMapper.findByDeviceToken(deviceToken);
        if (user == null) {
            return ResponseEntity.status(401).body(ApiResponse.fail("유효하지 않은 deviceToken입니다."));
        }
        try {
            Integer bpmInt = Integer.parseInt(bpm.trim());
            Double hrvDouble = (hrv != null && !hrv.isBlank()) ? Double.parseDouble(hrv.trim()) : null;
            diagnosisService.saveMeasurementToLatestSession(user.get쉼표번호(), bpmInt, hrvDouble);
            log.info("[device-get] 심박수 저장 완료: 쉼표번호={}, bpm={}", user.get쉼표번호(), bpmInt);
            return ResponseEntity.ok(ApiResponse.ok("심박수가 저장되었습니다."));
        } catch (NumberFormatException e) {
            return ResponseEntity.badRequest().body(ApiResponse.fail("bpm 값이 숫자가 아닙니다: " + bpm));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(ApiResponse.fail(e.getMessage()));
        }
    }

    // POST /api/diagnosis/measurements/device  [JWT 없음] — 애플워치 단축어 전용 (JSON/form 자동 감지)
    @PostMapping("/measurements/device")
    public ResponseEntity<ApiResponse<Void>> saveMeasurementFromDevice(
            HttpServletRequest request,
            @RequestBody String rawBody) {
        log.info("[device] X-Device-Key={}, Content-Type={}, body={}", request.getHeader("X-Device-Key"), request.getContentType(), rawBody);
        String deviceKey = request.getHeader("X-Device-Key");
        if (!"comma-apple-watch-2026".equals(deviceKey)) {
            return ResponseEntity.status(401).body(ApiResponse.fail("유효하지 않은 디바이스 키입니다."));
        }
        try {
            // 단축어가 URL인코딩해서 보내는 경우 디코딩 (=%7B...%7D 형태)
            String body = rawBody.trim();
            if (body.contains("%")) {
                body = URLDecoder.decode(body, StandardCharsets.UTF_8).trim();
            }
            // 앞에 = 붙어있으면 제거 (단축어 quirk)
            if (body.startsWith("=")) {
                body = body.substring(1).trim();
            }
            log.info("[device] decoded body={}", body);

            // key=value 형식이면 form 파싱, 아니면 JSON 파싱
            String deviceToken, bpmStr, hrvStr;
            if (body.startsWith("{")) {
                com.fasterxml.jackson.databind.ObjectMapper mapper = new com.fasterxml.jackson.databind.ObjectMapper();
                Map<String, Object> json = mapper.readValue(body, new com.fasterxml.jackson.core.type.TypeReference<>() {});
                deviceToken = unwrapString(json.get("deviceToken"));
                Number bpmNum = json.get("bpm") != null ? unwrapNumber(json.get("bpm")) : null;
                Number hrvNum = json.get("hrv") != null ? unwrapNumber(json.get("hrv")) : null;
                bpmStr = bpmNum != null ? bpmNum.toString() : null;
                hrvStr = hrvNum != null ? hrvNum.toString() : null;
            } else {
                Map<String, String> params = parseFormBody(body);
                deviceToken = params.get("deviceToken");
                bpmStr = params.get("bpm");
                hrvStr = params.get("hrv");
            }
            if (deviceToken == null || deviceToken.isBlank()) {
                return ResponseEntity.badRequest().body(ApiResponse.fail("deviceToken이 필요합니다."));
            }
            User user = userMapper.findByDeviceToken(deviceToken);
            if (user == null) {
                return ResponseEntity.status(401).body(ApiResponse.fail("유효하지 않은 deviceToken입니다."));
            }
            // bpm 빈값 체크 — 단축어에서 건강 샘플 변수가 연결되지 않은 경우
            if (bpmStr == null || bpmStr.isBlank()) {
                log.warn("[device] bpm 값이 비어있음. 단축어의 건강 샘플 변수 연결을 확인해주세요. body={}", rawBody);
                return ResponseEntity.badRequest().body(ApiResponse.fail(
                    "bpm 값이 비어있습니다. 단축어에서 '건강 샘플 찾기' 변수가 bpm 필드에 올바르게 연결됐는지 확인해주세요."));
            }
            Integer bpm = Integer.parseInt(bpmStr.trim());
            Double hrv = (hrvStr != null && !hrvStr.isBlank()) ? Double.parseDouble(hrvStr.trim()) : null;
            diagnosisService.saveMeasurementToLatestSession(user.get쉼표번호(), bpm, hrv);
            return ResponseEntity.ok(ApiResponse.ok("심박 데이터가 저장되었습니다."));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(ApiResponse.fail(e.getMessage()));
        } catch (Exception e) {
            log.error("[device] 파싱 오류: {}", e.getMessage());
            return ResponseEntity.badRequest().body(ApiResponse.fail("요청 형식이 올바르지 않습니다: " + e.getMessage()));
        }
    }

    // key=value&key=value 형식 파싱
    private Map<String, String> parseFormBody(String body) {
        Map<String, String> result = new java.util.HashMap<>();
        for (String pair : body.split("&")) {
            String[] kv = pair.split("=", 2);
            if (kv.length == 2) result.put(kv[0].trim(), kv[1].trim());
        }
        return result;
    }

    /**
     * 애플 단축어 {=값} 형태 언래핑 — String 추출
     * 일반 String이면 그대로, Map{"": value} 형태면 value 반환
     */
    private String unwrapString(Object raw) {
        if (raw == null) return null;
        if (raw instanceof String) return (String) raw;
        if (raw instanceof Map) {
            Object inner = ((Map<?, ?>) raw).values().stream().findFirst().orElse(null);
            return inner != null ? inner.toString() : null;
        }
        return raw.toString();
    }

    /**
     * 애플 단축어 {=값} 형태 언래핑 — Number 추출
     * {"": ""} 처럼 빈 문자열인 경우 null 반환 (건강 변수 미연결 상태)
     */
    private Number unwrapNumber(Object raw) {
        if (raw == null) return null;
        if (raw instanceof Number) return (Number) raw;
        if (raw instanceof Map) {
            Object inner = ((Map<?, ?>) raw).values().stream().findFirst().orElse(null);
            if (inner instanceof Number) return (Number) inner;
            if (inner == null) return null;
            String s = inner.toString().trim();
            if (s.isEmpty()) return null; // 빈 문자열 — 건강 샘플 변수 미연결
            return Double.parseDouble(s);
        }
        if (raw instanceof String) {
            String s = ((String) raw).trim();
            if (s.isEmpty()) return null;
            return Double.parseDouble(s);
        }
        return null;
    }

    // POST /api/diagnosis/measurements  [JWT 필요] — iPhone 단축어 전용 (세션ID 불필요, 고정 URL)
    @PostMapping("/measurements")
    public ResponseEntity<ApiResponse<Void>> saveMeasurementAuto(
            HttpServletRequest request,
            @RequestBody Map<String, Object> body) {
        String 쉼표번호 = (String) request.getAttribute("쉼표번호");
        try {
            Integer bpm = ((Number) body.get("bpm")).intValue();
            Double hrv = body.get("hrv") != null ? ((Number) body.get("hrv")).doubleValue() : null;
            diagnosisService.saveMeasurementToLatestSession(쉼표번호, bpm, hrv);
            return ResponseEntity.ok(ApiResponse.ok("심박 데이터가 저장되었습니다."));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(ApiResponse.fail(e.getMessage()));
        }
    }

    // GET /api/diagnosis/measurements/my-latest  [JWT 필요] — 마운트 시 초기 BPM 표시용
    @GetMapping("/measurements/my-latest")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getMyLatestMeasurement(HttpServletRequest request) {
        String 쉼표번호 = (String) request.getAttribute("쉼표번호");
        MeasurementSession session = diagnosisMapper.findLatestActiveSessionBy쉼표번호(쉼표번호);
        if (session == null) {
            return ResponseEntity.ok(ApiResponse.ok(null, "진행 중인 세션이 없습니다."));
        }
        var latest = diagnosisService.getLatestMeasurement(session.getId());
        if (latest == null) {
            return ResponseEntity.ok(ApiResponse.ok(null, "측정 데이터가 없습니다."));
        }
        Map<String, Object> result = new java.util.HashMap<>();
        result.put("id", latest.getId());
        result.put("bpm", latest.getBpm());
        result.put("hrv", latest.getHrv());
        result.put("measuredAt", latest.getMeasuredAt() != null ? latest.getMeasuredAt().toString() : null);
        result.put("sessionId", session.getId());
        return ResponseEntity.ok(ApiResponse.ok(result, "최신 BPM 조회 성공"));
    }

    // ==================== 진단 ====================

    // POST /api/diagnosis/calculate  [JWT 필요]
    @PostMapping("/calculate")
    public ResponseEntity<ApiResponse<DiagnosisResult>> calculate(
            HttpServletRequest request,
            @RequestBody Map<String, Object> body) {
        String 쉼표번호 = (String) request.getAttribute("쉼표번호");
        try {
            Object rawSessionId = body.get("sessionId");
            Long sessionId = rawSessionId != null ? ((Number) rawSessionId).longValue() : null;
            DiagnosisResult result = diagnosisService.calculateDiagnosis(쉼표번호, sessionId);
            return ResponseEntity.ok(ApiResponse.ok(result, "진단이 완료되었습니다."));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(ApiResponse.fail(e.getMessage()));
        }
    }

    // GET /api/diagnosis/latest  [JWT 필요]
    @GetMapping("/latest")
    public ResponseEntity<ApiResponse<DiagnosisResult>> getLatest(HttpServletRequest request) {
        String 쉼표번호 = (String) request.getAttribute("쉼표번호");
        try {
            DiagnosisResult result = diagnosisService.getLatestDiagnosis(쉼표번호);
            return ResponseEntity.ok(ApiResponse.ok(result, "최신 진단 결과 조회 성공"));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(404).body(ApiResponse.fail(e.getMessage()));
        }
    }

    // GET /api/diagnosis/history  [JWT 필요]
    @GetMapping("/history")
    public ResponseEntity<ApiResponse<List<Map<String, Object>>>> getHistory(HttpServletRequest request) {
        String 쉼표번호 = (String) request.getAttribute("쉼표번호");
        List<Map<String, Object>> history = diagnosisService.getDiagnosisHistory(쉼표번호);
        return ResponseEntity.ok(ApiResponse.ok(history, "진단 이력 조회 성공"));
    }
}
