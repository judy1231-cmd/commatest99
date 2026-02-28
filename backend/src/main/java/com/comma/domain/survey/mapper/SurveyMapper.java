package com.comma.domain.survey.mapper;

import com.comma.domain.survey.model.SurveyChoice;
import com.comma.domain.survey.model.SurveyQuestion;
import com.comma.domain.survey.model.SurveyResponse;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

@Mapper
public interface SurveyMapper {

    List<SurveyQuestion> findActiveQuestions();

    List<SurveyChoice> findChoicesByQuestionId(@Param("questionId") Long questionId);

    void insertResponse(SurveyResponse response);

    // 재설문 시 기존 응답을 삭제하여 중복 방지
    void deleteResponsesBy쉼표번호(@Param("쉼표번호") String 쉼표번호);

    // 진단 계산용 — 해당 사용자의 카테고리별 점수 합산
    List<SurveyResponse> findResponsesBy쉼표번호(@Param("쉼표번호") String 쉼표번호);
}
