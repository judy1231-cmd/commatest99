package com.comma.domain.diagnosis.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class MeasurementSession {

    private Long id;
    private String 쉼표번호;
    private LocalDateTime startedAt;
    private LocalDateTime endedAt;
    private String deviceType;      // smartwatch, manual 등
    private Double reliability;     // 측정 신뢰도 (0.0 ~ 1.0)
}
