package com.comma.domain.admin.mapper;

import com.comma.domain.admin.model.AuditLog;
import com.comma.domain.admin.model.BlockedKeyword;
import com.comma.domain.place.model.Place;
import com.comma.domain.user.model.User;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;
import java.util.Map;

@Mapper
public interface AdminMapper {

    // ==================== 대시보드 ====================

    int countTotalUsers();

    int countTodaySignups();

    int countTotalRestLogs();

    int countActiveUsers();

    // ==================== 사용자 관리 ====================

    List<User> findUsers(@Param("keyword") String keyword,
                         @Param("status") String status,
                         @Param("offset") int offset,
                         @Param("size") int size);

    int countUsers(@Param("keyword") String keyword, @Param("status") String status);

    void updateUserStatus(@Param("쉼표번호") String 쉼표번호, @Param("status") String status);

    // ==================== 장소 관리 ====================

    List<Place> findPlacesByStatus(@Param("status") String status,
                                   @Param("offset") int offset,
                                   @Param("size") int size);

    int countPlacesByStatus(@Param("status") String status);

    void updatePlaceStatus(@Param("id") Long id, @Param("status") String status);

    void updatePlaceStatusBulk(@Param("ids") List<Long> ids, @Param("status") String status);

    // ==================== 분석 ====================

    List<Map<String, Object>> getDailySignups(@Param("startDate") String startDate, @Param("endDate") String endDate);

    List<Map<String, Object>> getDailyRestLogs(@Param("startDate") String startDate, @Param("endDate") String endDate);

    List<Map<String, Object>> getRestTypePopularity(@Param("startDate") String startDate, @Param("endDate") String endDate);

    List<Map<String, Object>> getRegionStats(@Param("startDate") String startDate, @Param("endDate") String endDate);

    int countNewSignups(@Param("startDate") String startDate, @Param("endDate") String endDate);

    int countDiagnosisUsers(@Param("startDate") String startDate, @Param("endDate") String endDate);

    int countRestLogUsers(@Param("startDate") String startDate, @Param("endDate") String endDate);

    int countRevisitUsers(@Param("startDate") String startDate, @Param("endDate") String endDate);

    // ==================== 감사 로그 ====================

    void insertAuditLog(AuditLog auditLog);

    List<AuditLog> findAuditLogs(@Param("offset") int offset, @Param("size") int size);

    int countAuditLogs();

    // ==================== 차단 키워드 ====================

    List<BlockedKeyword> findAllKeywords();

    void insertKeyword(BlockedKeyword keyword);

    void deleteKeyword(@Param("id") Long id);

    // ==================== 활동 콘텐츠 관리 ====================

    List<Map<String, Object>> findAllActivities();

    Map<String, Object> findActivityById(@Param("id") Long id);

    Long findRestTypeIdByName(@Param("typeName") String typeName);

    void insertActivity(@Param("restTypeId") Long restTypeId,
                        @Param("activityName") String activityName,
                        @Param("guideContent") String guideContent,
                        @Param("durationMinutes") Integer durationMinutes);

    Long lastInsertId();

    void updateActivity(@Param("id") Long id,
                        @Param("restTypeId") Long restTypeId,
                        @Param("activityName") String activityName,
                        @Param("guideContent") String guideContent,
                        @Param("durationMinutes") Integer durationMinutes);

    void deleteActivity(@Param("id") Long id);

    // ==================== 태그 관리 ====================

    List<Map<String, Object>> findAllTags();

    void deleteTag(@Param("id") Long id);
}
