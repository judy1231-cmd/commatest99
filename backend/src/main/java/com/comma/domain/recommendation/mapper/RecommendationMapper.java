package com.comma.domain.recommendation.mapper;

import com.comma.domain.recommendation.model.Recommendation;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

@Mapper
public interface RecommendationMapper {

    void insertRecommendation(Recommendation recommendation);

    List<Recommendation> findBy쉼표번호(@Param("쉼표번호") String 쉼표번호);

    Recommendation findById(@Param("id") Long id);

    void updateClicked(@Param("id") Long id);

    void updateSaved(@Param("id") Long id, @Param("saved") boolean saved);

    List<Recommendation> findHistoryBy쉼표번호(@Param("쉼표번호") String 쉼표번호);
}
