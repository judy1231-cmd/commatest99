package com.comma.domain.rest.mapper;

import com.comma.domain.rest.model.RestActivity;
import com.comma.domain.rest.model.RestLog;
import com.comma.domain.rest.model.RestType;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;
import java.util.Map;

@Mapper
public interface RestLogMapper {

    // ==================== 휴식 기록 ====================

    void insertRestLog(RestLog restLog);

    List<RestLog> findByCommaNo(@Param("쉼표번호") String 쉼표번호,
                                @Param("offset") int offset,
                                @Param("size") int size);

    int countByCommaNo(@Param("쉼표번호") String 쉼표번호);

    RestLog findById(@Param("id") Long id);

    void updateRestLog(RestLog restLog);

    // soft delete — 실제 삭제 대신 deleted 플래그 변경
    void softDeleteRestLog(@Param("id") Long id);

    // ==================== 휴식 유형 / 활동 ====================

    List<RestType> findAllRestTypes();

    List<RestActivity> findActivitiesByRestTypeId(@Param("restTypeId") Long restTypeId);

    // ==================== 콘텐츠 (공개 — rest_activities 기반) ====================

    List<Map<String, Object>> findAllContents(@Param("category") String category);

    Map<String, Object> findContentById(@Param("id") Long id);
}
