package com.comma.domain.diagnosis.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class HeartRateMeasurement {

    private Long id;
    private Long sessionId;
    private String 쉼표번호;
    private Integer bpm;            // 심박수 (beats per minute)
    private Double hrv;             // 심박변이도 (Heart Rate Variability)
    private LocalDateTime measuredAt;
}
