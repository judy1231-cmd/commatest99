package com.comma.domain.contents.controller;

import com.comma.domain.contents.model.Contents;
import com.comma.domain.contents.model.ContentReview;
import com.comma.domain.contents.service.ContentsService;
import com.comma.global.util.ApiResponse;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/contents")
@RequiredArgsConstructor
public class ContentsController {

    private final ContentsService contentsService;

    // GET /api/contents?category={type}  [JWT 불필요]
    @GetMapping
    public ResponseEntity<ApiResponse<List<Contents>>> getContents(
            @RequestParam(required = false) String category) {
        List<Contents> list = contentsService.getContents(category);
        return ResponseEntity.ok(ApiResponse.ok(list, "콘텐츠 조회 성공"));
    }

    // GET /api/contents/{id}  [JWT 선택]
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<Contents>> getContents(@PathVariable Long id, HttpServletRequest request) {
        String 쉼표번호 = (String) request.getAttribute("쉼표번호");
        Contents content = contentsService.getById(id, 쉼표번호);
        if (content == null) return ResponseEntity.status(404).body(ApiResponse.fail("콘텐츠를 찾을 수 없어요."));
        return ResponseEntity.ok(ApiResponse.ok(content, "콘텐츠 조회 성공"));
    }

    // POST /api/contents/{id}/like  [JWT 필요]
    @PostMapping("/{id}/like")
    public ResponseEntity<ApiResponse<Map<String, Object>>> toggleLike(
            @PathVariable Long id, HttpServletRequest request) {
        String 쉼표번호 = (String) request.getAttribute("쉼표번호");
        if (쉼표번호 == null) return ResponseEntity.status(401).body(ApiResponse.fail("로그인이 필요해요."));
        Map<String, Object> result = contentsService.toggleLike(id, 쉼표번호);
        return ResponseEntity.ok(ApiResponse.ok(result, "좋아요 처리 완료"));
    }

    // GET /api/contents/{id}/reviews  [JWT 불필요]
    @GetMapping("/{id}/reviews")
    public ResponseEntity<ApiResponse<List<ContentReview>>> getReviews(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.ok(contentsService.getReviews(id), "후기 조회 성공"));
    }

    // POST /api/contents/{id}/reviews  [JWT 필요]
    @PostMapping("/{id}/reviews")
    public ResponseEntity<ApiResponse<ContentReview>> addReview(
            @PathVariable Long id,
            @RequestBody Map<String, Object> body,
            HttpServletRequest request) {
        String 쉼표번호 = (String) request.getAttribute("쉼표번호");
        if (쉼표번호 == null) return ResponseEntity.status(401).body(ApiResponse.fail("로그인이 필요해요."));
        int rating = Integer.parseInt(body.get("rating").toString());
        String content = body.getOrDefault("body", "").toString();
        ContentReview review = contentsService.addReview(id, 쉼표번호, rating, content);
        return ResponseEntity.ok(ApiResponse.ok(review, "후기 등록 완료"));
    }

    // DELETE /api/contents/{contentId}/reviews/{reviewId}  [JWT 필요]
    @DeleteMapping("/{contentId}/reviews/{reviewId}")
    public ResponseEntity<ApiResponse<String>> deleteReview(
            @PathVariable Long reviewId, HttpServletRequest request) {
        String 쉼표번호 = (String) request.getAttribute("쉼표번호");
        if (쉼표번호 == null) return ResponseEntity.status(401).body(ApiResponse.fail("로그인이 필요해요."));
        contentsService.deleteReview(reviewId, 쉼표번호);
        return ResponseEntity.ok(ApiResponse.ok("완료", "후기 삭제 완료"));
    }

    // DELETE /api/contents/{id}  [관리자용 — 콘텐츠 비활성화]
    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<String>> deactivate(@PathVariable Long id) {
        contentsService.deactivate(id);
        return ResponseEntity.ok(ApiResponse.ok("완료", "콘텐츠 비활성화 완료"));
    }

    // POST /api/contents/fix-images  [임시 — 카테고리별 image_url 일괄 업데이트]
    @PostMapping("/fix-images")
    public ResponseEntity<ApiResponse<String>> fixImages() {
        contentsService.fixCategoryImages();
        return ResponseEntity.ok(ApiResponse.ok("완료", "이미지 URL 업데이트 완료"));
    }

    // GET /api/contents/recommend  [JWT 필요]
    @GetMapping("/recommend")
    public ResponseEntity<ApiResponse<List<Contents>>> getRecommended(HttpServletRequest request) {
        String 쉼표번호 = (String) request.getAttribute("쉼표번호");
        List<Contents> list = contentsService.getRecommended(쉼표번호);
        return ResponseEntity.ok(ApiResponse.ok(list, "맞춤 추천 조회 성공"));
    }
}
