package com.comma.domain.survey.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class SurveyResponse {

    private Long id;
    private String 쉼표번호;
    private Long questionId;
    private Long choiceId;
    private LocalDateTime respondedAt;
}
