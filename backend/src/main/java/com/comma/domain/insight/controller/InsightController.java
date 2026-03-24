package com.comma.domain.insight.controller;

import com.comma.domain.insight.service.InsightService;
import com.comma.global.util.ApiResponse;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/insight")
@RequiredArgsConstructor
public class InsightController {

    private final InsightService insightService;

    /**
     * GET /api/insight/message  [JWT 필요]
     * 사용자의 최근 진단·통계를 바탕으로 Claude가 생성한 개인화 메시지 반환
     */
    @GetMapping("/message")
    public ResponseEntity<ApiResponse<Map<String, String>>> getMessage(HttpServletRequest request) {
        String commaNo = (String) request.getAttribute("쉼표번호");
        String message = insightService.getPersonalizedMessage(commaNo);
        return ResponseEntity.ok(ApiResponse.ok(Map.of("message", message), "인사이트 메시지 생성 성공"));
    }
}
