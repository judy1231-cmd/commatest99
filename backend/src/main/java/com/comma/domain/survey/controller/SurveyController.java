package com.comma.domain.survey.controller;

import com.comma.domain.survey.model.SurveyResponse;
import com.comma.domain.survey.service.SurveyService;
import com.comma.global.util.ApiResponse;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/survey")
@RequiredArgsConstructor
public class SurveyController {

    private final SurveyService surveyService;

    // ==================== 설문 질문 조회 (공개) ====================
    // GET /api/survey/questions
    @GetMapping("/questions")
    public ResponseEntity<ApiResponse<List<Map<String, Object>>>> getQuestions() {
        List<Map<String, Object>> questions = surveyService.getActiveQuestions();
        return ResponseEntity.ok(ApiResponse.ok(questions, "설문 질문 조회 성공"));
    }

    // ==================== 설문 응답 제출 [JWT 필요] ====================
    // POST /api/survey/responses
    @PostMapping("/responses")
    public ResponseEntity<ApiResponse<Void>> submitResponses(
            HttpServletRequest request,
            @RequestBody List<SurveyResponse> responses) {
        String 쉼표번호 = (String) request.getAttribute("쉼표번호");
        try {
            surveyService.submitResponses(쉼표번호, responses);
            return ResponseEntity.ok(ApiResponse.ok("설문 응답이 저장되었습니다."));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(ApiResponse.fail(e.getMessage()));
        }
    }
}
