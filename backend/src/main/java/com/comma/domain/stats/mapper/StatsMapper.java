package com.comma.domain.stats.mapper;

import com.comma.domain.stats.model.MonthlyStats;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;
import java.util.Map;

@Mapper
public interface StatsMapper {

    MonthlyStats findByCommaNoAndMonth(@Param("쉼표번호") String 쉼표번호,
                                       @Param("yearMonth") String yearMonth);

    List<MonthlyStats> findByCommaNoAndRange(@Param("쉼표번호") String 쉼표번호,
                                             @Param("startMonth") String startMonth,
                                             @Param("endMonth") String endMonth);

    // rest_logs 기반 집계 쿼리
    Integer sumRestMinutes(@Param("쉼표번호") String 쉼표번호, @Param("yearMonth") String yearMonth);

    Double avgEmotionScore(@Param("쉼표번호") String 쉼표번호, @Param("yearMonth") String yearMonth);

    Integer countRestLogs(@Param("쉼표번호") String 쉼표번호, @Param("yearMonth") String yearMonth);

    List<Map<String, Object>> getTypeRatio(@Param("쉼표번호") String 쉼표번호,
                                           @Param("yearMonth") String yearMonth);

    MonthlyStats findExisting(@Param("쉼표번호") String 쉼표번호, @Param("yearMonth") String yearMonth);

    void insertMonthlyStats(MonthlyStats stats);

    void updateMonthlyStats(MonthlyStats stats);
}
