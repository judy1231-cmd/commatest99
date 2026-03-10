package com.comma.domain.place.controller;

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
}
