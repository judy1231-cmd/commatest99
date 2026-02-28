package com.comma.domain.stats.controller;

import com.comma.domain.stats.model.MonthlyStats;
import com.comma.domain.stats.service.StatsService;
import com.comma.global.util.ApiResponse;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/stats")
@RequiredArgsConstructor
public class StatsController {

    private final StatsService statsService;

    // GET /api/stats/monthly?yearMonth=2026-02  [JWT 필요]
    @GetMapping("/monthly")
    public ResponseEntity<ApiResponse<MonthlyStats>> getMonthlyStats(
            HttpServletRequest request,
            @RequestParam(required = false) String yearMonth) {
        String 쉼표번호 = (String) request.getAttribute("쉼표번호");
        MonthlyStats stats = statsService.getMonthlyStats(쉼표번호, yearMonth);
        return ResponseEntity.ok(ApiResponse.ok(stats, "월간 통계 조회 성공"));
    }

    // GET /api/stats/monthly/range?startMonth=2025-12&endMonth=2026-02  [JWT 필요]
    @GetMapping("/monthly/range")
    public ResponseEntity<ApiResponse<List<MonthlyStats>>> getRange(
            HttpServletRequest request,
            @RequestParam String startMonth,
            @RequestParam String endMonth) {
        String 쉼표번호 = (String) request.getAttribute("쉼표번호");
        List<MonthlyStats> stats = statsService.getMonthlyStatsRange(쉼표번호, startMonth, endMonth);
        return ResponseEntity.ok(ApiResponse.ok(stats, "기간별 통계 조회 성공"));
    }

    // POST /api/stats/monthly/aggregate  [JWT 필요]
    @PostMapping("/monthly/aggregate")
    public ResponseEntity<ApiResponse<MonthlyStats>> aggregate(HttpServletRequest request) {
        String 쉼표번호 = (String) request.getAttribute("쉼표번호");
        MonthlyStats stats = statsService.aggregateMonthlyStats(쉼표번호);
        return ResponseEntity.ok(ApiResponse.ok(stats, "통계 집계 완료"));
    }
}
