package com.comma.domain.stats.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class MonthlyStats {

    private Long id;
    private String 쉼표번호;
    private String yearMonth;           // "2026-02" 형태
    private Integer totalRestMinutes;
    private String typeRatioJson;       // {"physical":30,"mental":20,...} 유형별 비율
    private Double avgEmotionScore;
    private Integer recordCount;
}
