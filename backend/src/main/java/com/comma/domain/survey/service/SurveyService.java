package com.comma.domain.survey.service;

import com.comma.domain.survey.mapper.SurveyMapper;
import com.comma.domain.survey.model.SurveyChoice;
import com.comma.domain.survey.model.SurveyQuestion;
import com.comma.domain.survey.model.SurveyResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class SurveyService {

    private final SurveyMapper surveyMapper;

    /**
     * 활성 질문 + 선택지를 함께 반환
     * — 프론트에서 질문마다 선택지를 한 번에 렌더링할 수 있도록
     */
    public List<Map<String, Object>> getActiveQuestions() {
        List<SurveyQuestion> questions = surveyMapper.findActiveQuestions();

        return questions.stream().map(question -> {
            List<SurveyChoice> choices = surveyMapper.findChoicesByQuestionId(question.getId());
            Map<String, Object> entry = new HashMap<>();
            entry.put("question", question);
            entry.put("choices", choices);
            return entry;
        }).toList();
    }

    /**
     * 설문 응답 일괄 저장
     * — 기존 응답이 있으면 삭제 후 재저장 (재설문 허용)
     */
    @Transactional
    public void submitResponses(String 쉼표번호, List<SurveyResponse> responses) {
        if (responses == null || responses.isEmpty()) {
            throw new IllegalArgumentException("응답 데이터가 없습니다.");
        }

        surveyMapper.deleteResponsesBy쉼표번호(쉼표번호);

        for (SurveyResponse response : responses) {
            response.set쉼표번호(쉼표번호);
            response.setRespondedAt(LocalDateTime.now());
            surveyMapper.insertResponse(response);
        }
    }
}
