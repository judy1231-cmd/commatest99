package com.comma.domain.admin.service;

import com.comma.domain.admin.mapper.AdminMapper;
import com.comma.domain.admin.model.AuditLog;
import com.comma.domain.admin.model.BlockedKeyword;
import com.comma.domain.place.mapper.PlaceMapper;
import com.comma.domain.place.model.Place;
import com.comma.domain.place.model.PlacePhoto;
import com.comma.domain.place.model.PlaceTag;
import com.comma.domain.user.model.User;
import com.comma.global.util.YoloService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class AdminService {

    private final AdminMapper adminMapper;
    private final PlaceMapper placeMapper;
    private final YoloService yoloService;

    public Map<String, Object> getDashboardStats() {
        Map<String, Object> stats = new HashMap<>();
        stats.put("totalUsers", adminMapper.countTotalUsers());
        stats.put("todaySignups", adminMapper.countTodaySignups());
        stats.put("totalRestLogs", adminMapper.countTotalRestLogs());
        stats.put("activeUsers", adminMapper.countActiveUsers());
        return stats;
    }

    public Map<String, Object> getUsers(String keyword, String status, int page, int size) {
        int offset = (page - 1) * size;
        List<User> users = adminMapper.findUsers(keyword, status, offset, size);
        // 비밀번호 노출 방지
        users.forEach(u -> u.setPassword(null));
        int total = adminMapper.countUsers(keyword, status);

        Map<String, Object> result = new HashMap<>();
        result.put("users", users);
        result.put("total", total);
        result.put("page", page);
        result.put("totalPages", (int) Math.ceil((double) total / size));
        return result;
    }

    /**
     * 사용자 상태 변경 + 감사 로그 기록
     * — 관리자가 누구를, 언제, 무엇을 했는지 반드시 추적
     */
    @Transactional
    public void updateUserStatus(String admin쉼표번호, String target쉼표번호, String status) {
        adminMapper.updateUserStatus(target쉼표번호, status);
        logAudit(admin쉼표번호, "change_user_status_to_" + status, "user", target쉼표번호);
    }

    public Map<String, Object> getPlaces(String status, int page, int size) {
        int offset = (page - 1) * size;
        List<Place> places = adminMapper.findPlacesByStatus(status, offset, size);
        int total = adminMapper.countPlacesByStatus(status);

        Map<String, Object> result = new HashMap<>();
        result.put("places", places);
        result.put("total", total);
        result.put("page", page);
        result.put("totalPages", (int) Math.ceil((double) total / size));
        return result;
    }

    /** 장소 일괄 상태 변경 */
    @Transactional
    public void updatePlaceStatusBulk(String admin쉼표번호, List<Long> placeIds, String status) {
        if (placeIds == null || placeIds.isEmpty()) return;
        adminMapper.updatePlaceStatusBulk(placeIds, status);
        String targetIds = placeIds.stream().map(String::valueOf).collect(Collectors.joining(","));
        logAudit(admin쉼표번호, "bulk_change_place_status_to_" + status, "place", targetIds);

        if ("approved".equals(status)) {
            placeIds.forEach(this::autoTagByYolo);
        }
    }

    @Transactional
    public void updatePlaceStatus(String admin쉼표번호, Long placeId, String status) {
        adminMapper.updatePlaceStatus(placeId, status);
        logAudit(admin쉼표번호, "change_place_status_to_" + status, "place", String.valueOf(placeId));

        // 승인 시 YOLO로 장소 사진 자동 분류 → 휴식 유형 태그 추가
        if ("approved".equals(status)) {
            autoTagByYolo(placeId);
        }
    }

    /**
     * 장소 사진 첫 번째 URL을 YOLO에 보내 휴식 유형을 분류하고,
     * 결과가 있으면 place_tags 테이블에 자동으로 태그를 추가한다.
     * YOLO 서버가 꺼져 있거나 분류 실패해도 승인 자체는 그대로 진행된다.
     */
    private void autoTagByYolo(Long placeId) {
        List<PlacePhoto> photos = placeMapper.findPhotosByPlaceId(placeId);
        if (photos == null || photos.isEmpty()) return;

        String photoUrl = photos.get(0).getPhotoUrl();
        String suggestedCategory = yoloService.classifyByUrl(photoUrl);
        if (suggestedCategory == null) return;

        PlaceTag tag = new PlaceTag();
        tag.setPlaceId(placeId);
        tag.setTagName(suggestedCategory);
        tag.setRestType(suggestedCategory);
        placeMapper.insertPlaceTag(tag);
        log.info("YOLO 자동 태그 추가: place_id={}, category={}", placeId, suggestedCategory);
    }

    public Map<String, Object> getAnalytics(String startDate, String endDate) {
        Map<String, Object> analytics = new HashMap<>();
        analytics.put("dailySignups", adminMapper.getDailySignups(startDate, endDate));
        analytics.put("dailyRestLogs", adminMapper.getDailyRestLogs(startDate, endDate));
        analytics.put("restTypePopularity", adminMapper.getRestTypePopularity(startDate, endDate));
        analytics.put("regionStats", adminMapper.getRegionStats(startDate, endDate));
        analytics.put("funnelStats", buildFunnelStats(startDate, endDate));
        return analytics;
    }

    private Map<String, Object> buildFunnelStats(String startDate, String endDate) {
        int signups   = adminMapper.countNewSignups(startDate, endDate);
        int diagnosed = adminMapper.countDiagnosisUsers(startDate, endDate);
        int logged    = adminMapper.countRestLogUsers(startDate, endDate);
        int revisited = adminMapper.countRevisitUsers(startDate, endDate);

        Map<String, Object> funnel = new HashMap<>();
        funnel.put("signups",   signups);
        funnel.put("diagnosed", diagnosed);
        funnel.put("logged",    logged);
        funnel.put("revisited", revisited);
        return funnel;
    }

    public Map<String, Object> getAuditLogs(int page, int size) {
        int offset = (page - 1) * size;
        List<AuditLog> logs = adminMapper.findAuditLogs(offset, size);
        int total = adminMapper.countAuditLogs();

        Map<String, Object> result = new HashMap<>();
        result.put("logs", logs);
        result.put("total", total);
        result.put("page", page);
        result.put("totalPages", (int) Math.ceil((double) total / size));
        return result;
    }

    public List<BlockedKeyword> getBlockedKeywords() {
        return adminMapper.findAllKeywords();
    }

    @Transactional
    public void addBlockedKeyword(String keyword) {
        BlockedKeyword bk = new BlockedKeyword();
        bk.setKeyword(keyword);
        bk.setActive(true);
        adminMapper.insertKeyword(bk);
    }

    @Transactional
    public void deleteBlockedKeyword(Long id) {
        adminMapper.deleteKeyword(id);
    }

    // ==================== 활동 콘텐츠 관리 ====================

    public List<Map<String, Object>> getAllActivities() {
        return adminMapper.findAllActivities();
    }

    public Map<String, Object> getActivityById(Long id) {
        return adminMapper.findActivityById(id);
    }

    @Transactional
    public Long createActivity(String restType, String activityName, String guideContent, Integer durationMinutes) {
        Long restTypeId = adminMapper.findRestTypeIdByName(restType);
        if (restTypeId == null) throw new IllegalArgumentException("존재하지 않는 휴식 유형: " + restType);
        adminMapper.insertActivity(restTypeId, activityName, guideContent, durationMinutes);
        return adminMapper.lastInsertId();
    }

    @Transactional
    public void updateActivity(Long id, String restType, String activityName, String guideContent, Integer durationMinutes) {
        Long restTypeId = adminMapper.findRestTypeIdByName(restType);
        if (restTypeId == null) throw new IllegalArgumentException("존재하지 않는 휴식 유형: " + restType);
        adminMapper.updateActivity(id, restTypeId, activityName, guideContent, durationMinutes);
    }

    @Transactional
    public void deleteActivity(Long id) {
        adminMapper.deleteActivity(id);
    }

    // ==================== 태그 관리 ====================

    public List<Map<String, Object>> getAllTags() {
        return adminMapper.findAllTags();
    }

    @Transactional
    public void deleteTag(Long id) {
        adminMapper.deleteTag(id);
    }

    private void logAudit(String admin쉼표번호, String action, String targetType, String targetId) {
        AuditLog log = new AuditLog();
        log.setAdmin쉼표번호(admin쉼표번호);
        log.setAction(action);
        log.setTargetType(targetType);
        log.setTargetId(targetId);
        log.setPerformedAt(LocalDateTime.now());
        adminMapper.insertAuditLog(log);
    }
}
