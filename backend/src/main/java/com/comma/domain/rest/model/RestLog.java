package com.comma.domain.rest.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class RestLog {

    private Long id;
    private String 쉼표번호;
    private Long restTypeId;
    private Long placeId;               // nullable — 장소 없이도 기록 가능
    private LocalDateTime startTime;
    private LocalDateTime endTime;
    private String memo;
    private Integer emotionBefore;      // 휴식 전 감정 (1~10)
    private Integer emotionAfter;       // 휴식 후 감정 (1~10)
    private String moodTagsJson;        // ["편안함","활력"] 형태 JSON
    private Boolean deleted;            // soft delete 여부
    private LocalDateTime createdAt;
}
