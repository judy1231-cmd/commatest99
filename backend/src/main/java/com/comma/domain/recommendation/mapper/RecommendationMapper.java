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
}
