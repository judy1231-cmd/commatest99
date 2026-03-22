package com.comma.global.scheduler;

import com.comma.domain.diagnosis.mapper.DiagnosisMapper;
import com.comma.domain.notification.mapper.NotificationMapper;
import com.comma.domain.notification.model.Notification;
import com.comma.domain.place.mapper.PlaceMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.List;

/**
 * 자동 운용 배치 스케줄러
 *
 * [1] 장소 AI 점수 갱신 — 매일 자정
 *     점수 = (평균 별점 × 20) + (북마크 수 × 2) + (추천 클릭 수 × 3), 최대 100점
 *     점수가 높은 장소가 추천/지도 목록 상단에 자동으로 올라옴
 *
 * [2] 스트레스 패턴 감지 → 자동 알림 — 매일 오전 9시
 *     최근 3회 진단 평균 스트레스 지수 70 이상 사용자 → 알림 발송
 *     24시간 내 중복 알림 방지
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class PlaceScoreScheduler {

    private static final int HIGH_STRESS_THRESHOLD = 70;   // 스트레스 경고 기준
    private static final int RECENT_DIAGNOSIS_COUNT = 3;   // 최근 N회 진단 기준

    private final PlaceMapper placeMapper;
    private final DiagnosisMapper diagnosisMapper;
    private final NotificationMapper notificationMapper;

    /** [1] 매일 자정: ai_score 재계산 */
    @Scheduled(cron = "0 0 0 * * *")
    public void refreshPlaceScores() {
        log.info("[Scheduler] ai_score 갱신 시작");
        try {
            placeMapper.updateAllPlaceScores();
            log.info("[Scheduler] ai_score 갱신 완료");
        } catch (Exception e) {
            log.error("[Scheduler] ai_score 갱신 실패: {}", e.getMessage(), e);
        }
    }

    /** [2] 매일 오전 9시: 스트레스 패턴 감지 → 알림 발송 */
    @Scheduled(cron = "0 0 9 * * *")
    public void detectHighStressAndNotify() {
        log.info("[Scheduler] 스트레스 패턴 감지 시작");
        try {
            List<String> targetUsers = diagnosisMapper.findHighStressUsers(
                    HIGH_STRESS_THRESHOLD, RECENT_DIAGNOSIS_COUNT);

            for (String commaNo : targetUsers) {
                sendStressNotification(commaNo);
            }
            log.info("[Scheduler] 스트레스 알림 발송 완료: {}명", targetUsers.size());
        } catch (Exception e) {
            log.error("[Scheduler] 스트레스 패턴 감지 실패: {}", e.getMessage(), e);
        }
    }

    /**
     * 스트레스 알림 발송
     * 24시간 내 동일 타입 알림이 이미 있으면 건너뜀 (중복 방지)
     */
    private void sendStressNotification(String commaNo) {
        int alreadySent = notificationMapper.countRecentByType(commaNo, "stress", 24);
        if (alreadySent > 0) return;

        Notification notification = new Notification();
        notification.set쉼표번호(commaNo);
        notification.setType("stress");
        notification.setTitle("요즘 많이 지치셨나요?");
        notification.setContent(
                "최근 스트레스 지수가 계속 높게 나타나고 있어요. " +
                "오늘 10분이라도 나만의 휴식 시간을 가져보는 건 어떨까요? 🌿"
        );
        notification.setCreatedAt(LocalDateTime.now());
        notificationMapper.insertNotification(notification);
    }
}
