package com.comma.domain.rest.service;

import com.comma.domain.badge.service.BadgeService;
import com.comma.domain.rest.mapper.RestLogMapper;
import com.comma.domain.rest.model.RestActivity;
import com.comma.domain.rest.model.RestLog;
import com.comma.domain.rest.model.RestType;
import com.comma.domain.stats.service.StatsService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class RestLogService {

    private final RestLogMapper restLogMapper;
    private final BadgeService badgeService;
    private final StatsService statsService;

    @Transactional
    public RestLog createRestLog(String 쉼표번호, RestLog restLog) {
        restLog.set쉼표번호(쉼표번호);
        restLog.setDeleted(false);
        restLogMapper.insertRestLog(restLog);

        // 배지 자동 지급 체크
        badgeService.checkAndAwardBadges(쉼표번호);
        // 월간 통계 자동 집계
        statsService.aggregateMonthlyStats(쉼표번호);

        return restLog;
    }

    public Map<String, Object> getMyRestLogs(String 쉼표번호, int page, int size) {
        int offset = (page - 1) * size;
        List<RestLog> logs = restLogMapper.findByCommaNo(쉼표번호, offset, size);
        int total = restLogMapper.countByCommaNo(쉼표번호);

        Map<String, Object> result = new HashMap<>();
        result.put("logs", logs);
        result.put("total", total);
        result.put("page", page);
        result.put("totalPages", (int) Math.ceil((double) total / size));
        return result;
    }

    public RestLog getRestLogDetail(Long id, String 쉼표번호) {
        RestLog log = restLogMapper.findById(id);
        if (log == null) throw new IllegalArgumentException("존재하지 않는 기록입니다.");
        if (!log.get쉼표번호().equals(쉼표번호)) throw new IllegalArgumentException("접근 권한이 없습니다.");
        return log;
    }

    @Transactional
    public void updateRestLog(Long id, String 쉼표번호, RestLog updated) {
        RestLog existing = getRestLogDetail(id, 쉼표번호);
        existing.setRestTypeId(updated.getRestTypeId());
        existing.setPlaceId(updated.getPlaceId());
        existing.setStartTime(updated.getStartTime());
        existing.setEndTime(updated.getEndTime());
        existing.setMemo(updated.getMemo());
        existing.setEmotionBefore(updated.getEmotionBefore());
        existing.setEmotionAfter(updated.getEmotionAfter());
        existing.setMoodTagsJson(updated.getMoodTagsJson());
        restLogMapper.updateRestLog(existing);
        statsService.aggregateMonthlyStats(쉼표번호);
    }

    @Transactional
    public void deleteRestLog(Long id, String 쉼표번호) {
        getRestLogDetail(id, 쉼표번호); // 권한 확인
        restLogMapper.softDeleteRestLog(id);
        statsService.aggregateMonthlyStats(쉼표번호);
    }

    public List<RestType> getRestTypes() {
        return restLogMapper.findAllRestTypes();
    }

    public List<RestActivity> getActivities(Long restTypeId) {
        return restLogMapper.findActivitiesByRestTypeId(restTypeId);
    }

    public List<Map<String, Object>> getContents(String category) {
        return restLogMapper.findAllContents(category);
    }

    public Map<String, Object> getContentById(Long id) {
        return restLogMapper.findContentById(id);
    }

    // ==================== 감정 기록 ====================

    public List<Map<String, Object>> getEmotionLogs(String 쉼표번호) {
        return restLogMapper.findEmotionLogs(쉼표번호);
    }

    @Transactional
    public void createEmotionLog(String 쉼표번호, int score, String tagsJson, String memo) {
        RestLog log = new RestLog();
        log.set쉼표번호(쉼표번호);
        log.setRestTypeId(1L); // 기본값: 신체적 이완 (NOT NULL 제약 처리)
        java.time.LocalDateTime now = java.time.LocalDateTime.now();
        log.setStartTime(now);
        log.setEndTime(now);
        log.setEmotionBefore(score);
        log.setEmotionAfter(score);
        log.setMoodTagsJson(tagsJson);
        log.setMemo(memo);
        log.setDeleted(false);
        restLogMapper.insertRestLog(log);
    }
}
