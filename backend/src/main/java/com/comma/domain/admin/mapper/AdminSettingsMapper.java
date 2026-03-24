package com.comma.domain.admin.mapper;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;
import java.util.Map;

@Mapper
public interface AdminSettingsMapper {

    // 전체 설정 조회 (각 행: {setting_key, setting_value})
    List<Map<String, Object>> findAllSettings();

    // 단일 설정 저장/갱신
    void upsertSetting(@Param("key") String key, @Param("value") String value);
}
