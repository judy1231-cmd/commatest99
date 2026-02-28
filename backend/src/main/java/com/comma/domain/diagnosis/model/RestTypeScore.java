package com.comma.domain.diagnosis.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class RestTypeScore {

    private Long id;
    private Long diagnosisResultId;
    private String restType;    // physical, mental, sensory, emotional, social, nature, creative
    private Integer score;      // 0~100
    private Integer ranking;    // 순위 (1이 가장 높음)
}
