package com.comma.domain.diagnosis.controller;

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

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/diagnosis")
@RequiredArgsConstructor
public class DiagnosisController {

    private final DiagnosisService diagnosisService;
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

    // POST /api/diagnosis/measurements/device  [JWT 없음] — 애플워치 단축어 전용 (X-Device-Key + deviceToken)
    @PostMapping("/measurements/device")
    public ResponseEntity<ApiResponse<Void>> saveMeasurementFromDevice(
            HttpServletRequest request,
            @RequestBody Map<String, Object> body) {
        String deviceKey = request.getHeader("X-Device-Key");
        if (!"comma-apple-watch-2026".equals(deviceKey)) {
            return ResponseEntity.status(401).body(ApiResponse.fail("유효하지 않은 디바이스 키입니다."));
        }
        String deviceToken = (String) body.get("deviceToken");
        if (deviceToken == null || deviceToken.isBlank()) {
            return ResponseEntity.badRequest().body(ApiResponse.fail("deviceToken이 필요합니다."));
        }
        User user = userMapper.findByDeviceToken(deviceToken);
        if (user == null) {
            return ResponseEntity.status(401).body(ApiResponse.fail("유효하지 않은 deviceToken입니다."));
        }
        try {
            Integer bpm = ((Number) body.get("bpm")).intValue();
            Double hrv = body.get("hrv") != null ? ((Number) body.get("hrv")).doubleValue() : null;
            diagnosisService.saveMeasurementToLatestSession(user.get쉼표번호(), bpm, hrv);
            return ResponseEntity.ok(ApiResponse.ok("심박 데이터가 저장되었습니다."));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(ApiResponse.fail(e.getMessage()));
        }
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
