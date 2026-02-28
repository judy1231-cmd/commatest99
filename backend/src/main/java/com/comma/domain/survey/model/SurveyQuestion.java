package com.comma.domain.survey.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class SurveyQuestion {

    private Long id;
    private String questionContent;
    private String category;        // 설문 카테고리 (stress, emotion, physical 등)
    private Integer displayOrder;
    private Boolean active;
}
