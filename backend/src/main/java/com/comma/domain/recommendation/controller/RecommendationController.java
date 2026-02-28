package com.comma.domain.recommendation.controller;

import com.comma.domain.recommendation.model.Recommendation;
import com.comma.domain.recommendation.service.RecommendationService;
import com.comma.global.util.ApiResponse;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/recommendations")
@RequiredArgsConstructor
public class RecommendationController {

    private final RecommendationService recommendationService;

    // POST /api/recommendations  [JWT 필요]
    @PostMapping
    public ResponseEntity<ApiResponse<List<Recommendation>>> create(
            HttpServletRequest request,
            @RequestBody Map<String, Long> body) {
        String 쉼표번호 = (String) request.getAttribute("쉼표번호");
        try {
            Long diagnosisResultId = body.get("diagnosisResultId");
            List<Recommendation> recs = recommendationService.createRecommendations(쉼표번호, diagnosisResultId);
            return ResponseEntity.ok(ApiResponse.ok(recs, "추천이 생성되었습니다."));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(ApiResponse.fail(e.getMessage()));
        }
    }

    // GET /api/recommendations  [JWT 필요]
    @GetMapping
    public ResponseEntity<ApiResponse<List<Recommendation>>> getMyRecommendations(HttpServletRequest request) {
        String 쉼표번호 = (String) request.getAttribute("쉼표번호");
        List<Recommendation> recs = recommendationService.getMyRecommendations(쉼표번호);
        return ResponseEntity.ok(ApiResponse.ok(recs, "추천 목록 조회 성공"));
    }

    // PUT /api/recommendations/{id}/click  [JWT 필요]
    @PutMapping("/{id}/click")
    public ResponseEntity<ApiResponse<Void>> markClicked(
            HttpServletRequest request,
            @PathVariable Long id) {
        String 쉼표번호 = (String) request.getAttribute("쉼표번호");
        try {
            recommendationService.markClicked(id, 쉼표번호);
            return ResponseEntity.ok(ApiResponse.ok("클릭이 기록되었습니다."));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(ApiResponse.fail(e.getMessage()));
        }
    }

    // PUT /api/recommendations/{id}/save  [JWT 필요]
    @PutMapping("/{id}/save")
    public ResponseEntity<ApiResponse<Map<String, Boolean>>> toggleSaved(
            HttpServletRequest request,
            @PathVariable Long id) {
        String 쉼표번호 = (String) request.getAttribute("쉼표번호");
        try {
            boolean saved = recommendationService.toggleSaved(id, 쉼표번호);
            String message = saved ? "추천이 저장되었습니다." : "저장이 해제되었습니다.";
            return ResponseEntity.ok(ApiResponse.ok(Map.of("saved", saved), message));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(ApiResponse.fail(e.getMessage()));
        }
    }
}
