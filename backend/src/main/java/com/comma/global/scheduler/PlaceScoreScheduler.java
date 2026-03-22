package com.comma.global.scheduler;

import com.comma.domain.place.mapper.PlaceMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

/**
 * 장소 AI 점수 자동 갱신 스케줄러
 *
 * 매일 자정에 모든 승인된 장소의 ai_score를 재계산한다.
 * 점수 = (평균 별점 × 20) + (북마크 수 × 2) + (추천 클릭 수 × 3), 최대 100점
 *
 * 점수가 높은 장소가 추천/지도 목록 상단에 자동으로 올라오는 효과.
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class PlaceScoreScheduler {

    private final PlaceMapper placeMapper;

    /**
     * cron: 매일 00:00:00 (서버 타임존 기준)
     * 배포 환경에서는 Asia/Seoul 기준이므로 별도 타임존 설정 불필요
     */
    @Scheduled(cron = "0 0 0 * * *")
    public void refreshPlaceScores() {
        log.info("[PlaceScoreScheduler] ai_score 갱신 시작");
        try {
            placeMapper.updateAllPlaceScores();
            log.info("[PlaceScoreScheduler] ai_score 갱신 완료");
        } catch (Exception e) {
            log.error("[PlaceScoreScheduler] ai_score 갱신 실패: {}", e.getMessage(), e);
        }
    }
}
