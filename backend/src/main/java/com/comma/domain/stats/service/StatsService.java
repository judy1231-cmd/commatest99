package com.comma.domain.stats.service;

import com.comma.domain.stats.mapper.StatsMapper;
import com.comma.domain.stats.model.MonthlyStats;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class StatsService {

    private final StatsMapper statsMapper;

    public MonthlyStats getMonthlyStats(String 쉼표번호, String yearMonth) {
        if (yearMonth == null || yearMonth.isBlank()) {
            yearMonth = LocalDate.now().format(DateTimeFormatter.ofPattern("yyyy-MM"));
        }
        return statsMapper.findByCommaNoAndMonth(쉼표번호, yearMonth);
    }

    public List<MonthlyStats> getMonthlyStatsRange(String 쉼표번호, String startMonth, String endMonth) {
        return statsMapper.findByCommaNoAndRange(쉼표번호, startMonth, endMonth);
    }

    /**
     * 이번 달 통계 집계
     * rest_logs 테이블에서 총 휴식시간, 유형별 비율, 평균 감정점수, 기록 횟수를 계산
     * 이미 있으면 UPDATE, 없으면 INSERT (UPSERT 패턴)
     */
    @Transactional
    public MonthlyStats aggregateMonthlyStats(String 쉼표번호) {
        String yearMonth = LocalDate.now().format(DateTimeFormatter.ofPattern("yyyy-MM"));

        Integer totalMinutes = statsMapper.sumRestMinutes(쉼표번호, yearMonth);
        Double avgEmotion = statsMapper.avgEmotionScore(쉼표번호, yearMonth);
        Integer recordCount = statsMapper.countRestLogs(쉼표번호, yearMonth);
        List<Map<String, Object>> typeRatio = statsMapper.getTypeRatio(쉼표번호, yearMonth);

        // 유형별 비율을 JSON 문자열로 변환
        String ratioJson = buildTypeRatioJson(typeRatio);

        MonthlyStats existing = statsMapper.findExisting(쉼표번호, yearMonth);

        if (existing != null) {
            existing.setTotalRestMinutes(totalMinutes != null ? totalMinutes : 0);
            existing.setTypeRatioJson(ratioJson);
            existing.setAvgEmotionScore(avgEmotion != null ? avgEmotion : 0.0);
            existing.setRecordCount(recordCount != null ? recordCount : 0);
            statsMapper.updateMonthlyStats(existing);
            return existing;
        }

        MonthlyStats stats = new MonthlyStats();
        stats.set쉼표번호(쉼표번호);
        stats.setYearMonth(yearMonth);
        stats.setTotalRestMinutes(totalMinutes != null ? totalMinutes : 0);
        stats.setTypeRatioJson(ratioJson);
        stats.setAvgEmotionScore(avgEmotion != null ? avgEmotion : 0.0);
        stats.setRecordCount(recordCount != null ? recordCount : 0);
        statsMapper.insertMonthlyStats(stats);
        return stats;
    }

    private String buildTypeRatioJson(List<Map<String, Object>> typeRatio) {
        if (typeRatio == null || typeRatio.isEmpty()) return "{}";

        StringBuilder sb = new StringBuilder("{");
        for (int i = 0; i < typeRatio.size(); i++) {
            if (i > 0) sb.append(",");
            Map<String, Object> entry = typeRatio.get(i);
            sb.append("\"").append(entry.get("restTypeId")).append("\":").append(entry.get("ratio"));
        }
        sb.append("}");
        return sb.toString();
    }
}
