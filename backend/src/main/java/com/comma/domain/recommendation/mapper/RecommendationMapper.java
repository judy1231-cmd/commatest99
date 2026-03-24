package com.comma.domain.recommendation.mapper;

import com.comma.domain.recommendation.model.Recommendation;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;
import java.util.Map;

@Mapper
public interface RecommendationMapper {

    void insertRecommendation(Recommendation recommendation);

    List<Recommendation> findBy쉼표번호(@Param("쉼표번호") String 쉼표번호);

    Recommendation findById(@Param("id") Long id);

    void updateClicked(@Param("id") Long id);

    void updateSaved(@Param("id") Long id, @Param("saved") boolean saved);

    List<Recommendation> findHistoryBy쉼표번호(@Param("쉼표번호") String 쉼표번호);

    /**
     * 최근 30일 휴식 기록에서 유형별 감정 향상도 조회
     * 반환: [{restType: "nature", avgImprovement: 3.5}, ...]
     * emotion_before / emotion_after 둘 다 입력된 기록만 집계
     */
    List<Map<String, Object>> findPersonalEffectiveness(@Param("commaNo") String commaNo);

    /**
     * 협업 필터링 — 유사 사용자들의 유형별 효과 집계
     * 나와 같은 휴식 유형을 2개 이상 사용한 사용자를 "유사 사용자"로 정의
     * 그들의 최근 90일 기록에서 유형별 평균 감정 향상도를 반환
     * 샘플 3개 미만인 유형은 제외 (신뢰도 확보)
     */
    List<Map<String, Object>> findCollaborativeEffectiveness(@Param("commaNo") String commaNo);

    /**
     * 개인 최적 패턴 학습 — 요일(0=일~6=토) × 시간대(아침/낮/저녁/밤)별 평균 감정 향상도
     * 현재 요일·시간대와 일치하는 최고 효과 유형을 찾아 추천에 반영
     */
    List<Map<String, Object>> findBestTypeByDayAndTime(@Param("commaNo") String commaNo,
                                                        @Param("dayOfWeek") int dayOfWeek,
                                                        @Param("timeSlot") String timeSlot);
}
