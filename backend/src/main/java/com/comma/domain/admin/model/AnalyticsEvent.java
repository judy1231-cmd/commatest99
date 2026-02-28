package com.comma.domain.admin.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AnalyticsEvent {

    private Long id;
    private String 쉼표번호;            // nullable — 비로그인 사용자 이벤트도 가능
    private String eventType;           // page_view, click, recommendation_click 등
    private String eventDataJson;
    private LocalDateTime occurredAt;
}
