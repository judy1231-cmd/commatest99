package com.comma.domain.place.controller;

import com.comma.domain.place.mapper.PlaceMapper;
import com.comma.domain.place.model.PlaceTag;
import com.comma.domain.place.service.PlaceSeedService;
import com.comma.global.util.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/admin/places")
@RequiredArgsConstructor
public class PlaceSeedController {

    private final PlaceSeedService placeSeedService;
    private final PlaceMapper placeMapper;

    /**
     * POST /api/admin/places/seed
     * VWorld POI API로 휴식 장소 데이터를 places 테이블에 자동 삽입
     * [ADMIN 전용 — JwtInterceptor에서 ADMIN 권한 체크]
     */
    @PostMapping("/seed")
    public ResponseEntity<ApiResponse<Map<String, Object>>> seedPlaces() {
        Map<String, Object> result = placeSeedService.seedFromVWorld();
        return ResponseEntity.ok(ApiResponse.ok(result, "장소 Seed 완료"));
    }

    /**
     * DELETE /api/admin/places/seed
     * 테스트용 — 삽입된 Seed 데이터 전체 삭제
     */
    @DeleteMapping("/seed")
    public ResponseEntity<ApiResponse<Void>> clearSeed() {
        placeSeedService.clearAllPlaces();
        return ResponseEntity.ok(ApiResponse.ok(null, "장소 데이터 초기화 완료"));
    }

    /**
     * DELETE /api/admin/places/cleanup
     * 화장실, 주차장 등 부적절한 장소 정리
     */
    @DeleteMapping("/cleanup")
    public ResponseEntity<ApiResponse<Map<String, Object>>> cleanupInappropriate() {
        int removed = placeSeedService.removeInappropriatePlaces();
        return ResponseEntity.ok(ApiResponse.ok(Map.of("removed", removed), "부적절한 장소 " + removed + "개 삭제 완료"));
    }

    /**
     * POST /api/admin/places/seed/media
     * 모든 장소에 사진 + 리뷰 seed 데이터 삽입
     */
    @PostMapping("/seed/media")
    public ResponseEntity<ApiResponse<Map<String, Object>>> seedMedia() {
        Map<String, Object> result = placeSeedService.seedMediaData();
        return ResponseEntity.ok(ApiResponse.ok(result,
            "미디어 seed 완료 — 사진 " + result.get("photoAdded") + "개, 리뷰 " + result.get("reviewAdded") + "개 추가"));
    }

    /**
     * POST /api/admin/places/{id}/tag
     * 특정 장소에 태그 추가 (미분류 장소 수동 분류용)
     */
    @PostMapping("/{id}/tag")
    public ResponseEntity<ApiResponse<Void>> addTag(
            @PathVariable Long id,
            @RequestBody Map<String, String> body) {
        PlaceTag tag = new PlaceTag();
        tag.setPlaceId(id);
        tag.setTagName(body.get("tagName"));
        tag.setRestType(body.get("restType"));
        placeMapper.insertPlaceTag(tag);
        return ResponseEntity.ok(ApiResponse.ok(null, "태그 추가 완료"));
    }

    /**
     * DELETE /api/admin/places/cleanup/full
     * 아파트·화장실 등 휴식 무관 장소 + 이름 중복 장소 한꺼번에 정리
     */
    @DeleteMapping("/cleanup/full")
    public ResponseEntity<ApiResponse<Map<String, Object>>> fullCleanup() {
        Map<String, Integer> result = placeSeedService.fullCleanup();
        return ResponseEntity.ok(ApiResponse.ok(
            Map.of("unrelated", result.get("unrelated"),
                   "inappropriate", result.get("inappropriate"),
                   "duplicates", result.get("duplicates"),
                   "total", result.get("total")),
            "정리 완료 — 총 " + result.get("total") + "개 삭제"
        ));
    }
}
