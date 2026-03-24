package com.comma.global.util;

import com.comma.domain.admin.mapper.AdminMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import java.util.Map;

/**
 * 사용자 행동 이벤트 수집 서비스
 * - 비동기(@Async) 처리로 메인 흐름에 영향 없음
 * - 실패해도 예외 무시 (데이터 수집 실패가 서비스 장애로 이어지면 안 됨)
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class AnalyticsService {

    private final AdminMapper adminMapper;

    @Async
    public void track(String commaNo, String eventType, Map<String, Object> data) {
        try {
            String json = data == null ? null : toJson(data);
            adminMapper.insertAnalyticsEvent(commaNo, eventType, json);
        } catch (Exception e) {
            log.warn("analytics track 실패: {} - {}", eventType, e.getMessage());
        }
    }

    // 외부 의존성 없이 간단한 JSON 직렬화
    private String toJson(Map<String, Object> data) {
        StringBuilder sb = new StringBuilder("{");
        boolean first = true;
        for (Map.Entry<String, Object> entry : data.entrySet()) {
            if (!first) sb.append(",");
            sb.append("\"").append(entry.getKey()).append("\":");
            Object val = entry.getValue();
            if (val == null) {
                sb.append("null");
            } else if (val instanceof Number) {
                sb.append(val);
            } else if (val instanceof Boolean) {
                sb.append(val);
            } else {
                sb.append("\"").append(val.toString().replace("\"", "\\\"")).append("\"");
            }
            first = false;
        }
        sb.append("}");
        return sb.toString();
    }
}
