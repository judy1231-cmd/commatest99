package com.comma.domain.admin.service;

import com.comma.domain.admin.mapper.AdminSettingsMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class AdminSettingsService {

    private final AdminSettingsMapper adminSettingsMapper;

    /** 전체 설정 조회 — List<Map> → Map<String, String> 변환 */
    public Map<String, String> getSettings() {
        List<Map<String, Object>> rows = adminSettingsMapper.findAllSettings();
        Map<String, String> result = new HashMap<>();
        for (Map<String, Object> row : rows) {
            String key   = String.valueOf(row.get("setting_key"));
            String value = String.valueOf(row.get("setting_value"));
            result.put(key, value);
        }
        return result;
    }

    /** 설정 일괄 저장 */
    public void saveSettings(Map<String, String> settings) {
        settings.forEach((key, value) -> adminSettingsMapper.upsertSetting(key, value));
    }
}
