package com.comma.domain.place.controller;

import com.comma.domain.place.model.Place;
import com.comma.domain.place.model.PlaceReview;
import com.comma.domain.place.service.PlaceService;
import com.comma.global.util.ApiResponse;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/places")
@RequiredArgsConstructor
public class PlaceController {

    private final PlaceService placeService;

    // ==================== 공개 API ====================

    // GET /api/places?keyword=&restType=&page=1&size=10
    @GetMapping
    public ResponseEntity<ApiResponse<Map<String, Object>>> getPlaces(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) String restType,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int size) {
        Map<String, Object> result = placeService.getPlaces(keyword, restType, page, size);
        return ResponseEntity.ok(ApiResponse.ok(result, "장소 목록 조회 성공"));
    }

    // GET /api/places/{id}
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getPlaceDetail(@PathVariable Long id) {
        try {
            Map<String, Object> result = placeService.getPlaceDetail(id);
            return ResponseEntity.ok(ApiResponse.ok(result, "장소 상세 조회 성공"));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(404).body(ApiResponse.fail(e.getMessage()));
        }
    }

    // GET /api/places/{id}/reviews
    @GetMapping("/{id}/reviews")
    public ResponseEntity<ApiResponse<List<PlaceReview>>> getReviews(@PathVariable Long id) {
        List<PlaceReview> reviews = placeService.getReviews(id);
        return ResponseEntity.ok(ApiResponse.ok(reviews, "리뷰 조회 성공"));
    }

    // GET /api/places/nearby?lat=37.5&lng=127.0&radius=3
    @GetMapping("/nearby")
    public ResponseEntity<ApiResponse<List<Place>>> getNearby(
            @RequestParam double lat,
            @RequestParam double lng,
            @RequestParam(defaultValue = "3") double radius) {
        List<Place> places = placeService.getNearbyPlaces(lat, lng, radius);
        return ResponseEntity.ok(ApiResponse.ok(places, "주변 장소 조회 성공"));
    }

    // ==================== 인증 필요 API ====================

    // POST /api/places/{id}/reviews  [JWT 필요]
    @PostMapping("/{id}/reviews")
    public ResponseEntity<ApiResponse<PlaceReview>> writeReview(
            HttpServletRequest request,
            @PathVariable Long id,
            @RequestBody Map<String, Object> body) {
        String 쉼표번호 = (String) request.getAttribute("쉼표번호");
        try {
            Integer rating = (Integer) body.get("rating");
            String content = (String) body.get("content");
            PlaceReview review = placeService.writeReview(쉼표번호, id, rating, content);
            return ResponseEntity.ok(ApiResponse.ok(review, "리뷰가 등록되었습니다."));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(ApiResponse.fail(e.getMessage()));
        }
    }

    // PUT /api/places/{id}/reviews/{reviewId}  [JWT 필요]
    @PutMapping("/{id}/reviews/{reviewId}")
    public ResponseEntity<ApiResponse<PlaceReview>> updateReview(
            HttpServletRequest request,
            @PathVariable Long id,
            @PathVariable Long reviewId,
            @RequestBody Map<String, Object> body) {
        String 쉼표번호 = (String) request.getAttribute("쉼표번호");
        if (쉼표번호 == null) return ResponseEntity.status(401).body(ApiResponse.fail("로그인이 필요합니다."));
        try {
            Integer rating = (Integer) body.get("rating");
            String content = (String) body.get("content");
            PlaceReview review = placeService.updateReview(쉼표번호, reviewId, rating, content);
            return ResponseEntity.ok(ApiResponse.ok(review, "리뷰가 수정되었습니다."));
        } catch (SecurityException e) {
            return ResponseEntity.status(403).body(ApiResponse.fail(e.getMessage()));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(ApiResponse.fail(e.getMessage()));
        }
    }

    // DELETE /api/places/{id}/reviews/{reviewId}  [JWT 필요]
    @DeleteMapping("/{id}/reviews/{reviewId}")
    public ResponseEntity<ApiResponse<Void>> deleteReview(
            HttpServletRequest request,
            @PathVariable Long id,
            @PathVariable Long reviewId) {
        String 쉼표번호 = (String) request.getAttribute("쉼표번호");
        if (쉼표번호 == null) return ResponseEntity.status(401).body(ApiResponse.fail("로그인이 필요합니다."));
        try {
            placeService.deleteReview(쉼표번호, reviewId);
            return ResponseEntity.ok(ApiResponse.ok(null, "리뷰가 삭제되었습니다."));
        } catch (SecurityException e) {
            return ResponseEntity.status(403).body(ApiResponse.fail(e.getMessage()));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(ApiResponse.fail(e.getMessage()));
        }
    }

    // POST /api/places/{id}/bookmark  [JWT 필요]
    @PostMapping("/{id}/bookmark")
    public ResponseEntity<ApiResponse<Map<String, Boolean>>> toggleBookmark(
            HttpServletRequest request,
            @PathVariable Long id) {
        String 쉼표번호 = (String) request.getAttribute("쉼표번호");
        boolean bookmarked = placeService.toggleBookmark(쉼표번호, id);
        String message = bookmarked ? "북마크에 추가되었습니다." : "북마크가 해제되었습니다.";
        return ResponseEntity.ok(ApiResponse.ok(Map.of("bookmarked", bookmarked), message));
    }

    // GET /api/places/bookmarks  [JWT 필요]
    @GetMapping("/bookmarks")
    public ResponseEntity<ApiResponse<List<Place>>> getMyBookmarks(HttpServletRequest request) {
        String 쉼표번호 = (String) request.getAttribute("쉼표번호");
        List<Place> bookmarks = placeService.getMyBookmarks(쉼표번호);
        return ResponseEntity.ok(ApiResponse.ok(bookmarks, "북마크 조회 성공"));
    }
}
