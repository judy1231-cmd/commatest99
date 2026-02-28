package com.comma.domain.survey.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class SurveyChoice {

    private Long id;
    private Long questionId;
    private String choiceContent;
    private Integer score;          // 이 선택지의 점수 — 진단 계산에 사용
    private Integer displayOrder;
}
