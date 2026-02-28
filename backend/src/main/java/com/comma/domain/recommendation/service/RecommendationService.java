package com.comma.domain.recommendation.service;

import com.comma.domain.diagnosis.mapper.DiagnosisMapper;
import com.comma.domain.diagnosis.model.DiagnosisResult;
import com.comma.domain.diagnosis.model.RestTypeScore;
import com.comma.domain.place.mapper.PlaceMapper;
import com.comma.domain.place.model.Place;
import com.comma.domain.recommendation.mapper.RecommendationMapper;
import com.comma.domain.recommendation.model.Recommendation;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class RecommendationService {

    private final RecommendationMapper recommendationMapper;
    private final DiagnosisMapper diagnosisMapper;
    private final PlaceMapper placeMapper;

    /**
     * 진단 결과 기반 추천 생성
     * — 가장 높은 휴식유형에 맞는 장소를 매칭하여 추천 로그 저장
     * — 추천 로그를 반드시 저장해야 통계/분석 화면이 실제 데이터로 동작
     */
    @Transactional
    public List<Recommendation> createRecommendations(String 쉼표번호, Long diagnosisResultId) {
        DiagnosisResult diagnosis = diagnosisMapper.findLatestBy쉼표번호(쉼표번호);
        if (diagnosis == null) {
            throw new IllegalArgumentException("진단 결과가 없습니다. 설문을 먼저 완료해주세요.");
        }

        List<RestTypeScore> scores = diagnosisMapper.findScoresByDiagnosisId(diagnosisResultId);
        if (scores.isEmpty()) {
            throw new IllegalArgumentException("휴식유형 점수가 없습니다.");
        }

        // 상위 3개 유형에 맞는 장소를 추천
        List<RestTypeScore> topTypes = scores.stream()
                .sorted((a, b) -> a.getRanking() - b.getRanking())
                .limit(3)
                .toList();

        for (RestTypeScore typeScore : topTypes) {
            List<Place> matchedPlaces = placeMapper.findPlaces(null, typeScore.getRestType(), 0, 3);
            for (Place place : matchedPlaces) {
                Recommendation rec = new Recommendation();
                rec.set쉼표번호(쉼표번호);
                rec.setDiagnosisResultId(diagnosisResultId);
                rec.setPlaceId(place.getId());
                rec.setCriteria(typeScore.getRestType() + " 유형 매칭 (점수: " + typeScore.getScore() + ")");
                rec.setClicked(false);
                rec.setSaved(false);
                rec.setRecommendedAt(LocalDateTime.now());
                recommendationMapper.insertRecommendation(rec);
            }
        }

        return recommendationMapper.findBy쉼표번호(쉼표번호);
    }

    public List<Recommendation> getMyRecommendations(String 쉼표번호) {
        return recommendationMapper.findBy쉼표번호(쉼표번호);
    }

    @Transactional
    public void markClicked(Long id, String 쉼표번호) {
        Recommendation rec = recommendationMapper.findById(id);
        if (rec == null) throw new IllegalArgumentException("존재하지 않는 추천입니다.");
        if (!rec.get쉼표번호().equals(쉼표번호)) throw new IllegalArgumentException("접근 권한이 없습니다.");
        recommendationMapper.updateClicked(id);
    }

    @Transactional
    public boolean toggleSaved(Long id, String 쉼표번호) {
        Recommendation rec = recommendationMapper.findById(id);
        if (rec == null) throw new IllegalArgumentException("존재하지 않는 추천입니다.");
        if (!rec.get쉼표번호().equals(쉼표번호)) throw new IllegalArgumentException("접근 권한이 없습니다.");
        boolean newSaved = !Boolean.TRUE.equals(rec.getSaved());
        recommendationMapper.updateSaved(id, newSaved);
        return newSaved;
    }
}
