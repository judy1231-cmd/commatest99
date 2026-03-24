package com.comma.domain.insight.service;

import com.comma.domain.diagnosis.mapper.DiagnosisMapper;
import com.comma.domain.diagnosis.model.DiagnosisResult;
import com.comma.domain.stats.mapper.StatsMapper;
import com.comma.global.config.ClaudeApiClient;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Map;

/**
 * Claude API 기반 개인화 인사이트 메시지 생성
 *
 * 사용자의 최근 진단 결과 + 이번 달 통계를 조합해
 * Claude에게 보내고, 맞춤 휴식 메시지를 받아 반환한다.
 * Claude API 키 없거나 오류 시 기본 메시지로 fallback.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class InsightService {

    private static final Map<String, String> TYPE_KO = Map.of(
            "physical",  "신체의 이완",
            "mental",    "정신적 고요",
            "sensory",   "감각의 정화",
            "emotional", "정서적 지지",
            "social",    "사회적 휴식",
            "creative",  "창조적 몰입",
            "nature",    "자연의 연결"
    );

    private final DiagnosisMapper diagnosisMapper;
    private final StatsMapper statsMapper;
    private final ClaudeApiClient claudeApiClient;

    /**
     * 개인화 메시지 생성
     * — 최근 진단 결과와 이번 달 통계를 결합해 Claude에게 컨텍스트 전달
     */
    public String getPersonalizedMessage(String commaNo) {
        try {
            DiagnosisResult latest = diagnosisMapper.findLatestBy쉼표번호(commaNo);
            if (latest == null) {
                return "오늘 처음 진단을 받아보세요. 나에게 맞는 휴식 유형을 찾아드릴게요. 🌿";
            }

            String yearMonth = LocalDate.now().format(DateTimeFormatter.ofPattern("yyyy-MM"));
            Double avgEmotion = statsMapper.avgEmotionScore(commaNo, yearMonth);
            Integer logCount = statsMapper.countRestLogs(commaNo, yearMonth);
            List<Map<String, Object>> typeRatioList = statsMapper.getTypeRatio(commaNo, yearMonth);

            String context = buildContext(latest, avgEmotion, logCount, typeRatioList);
            return claudeApiClient.getRestAdvice(latest.getPrimaryRestType(), latest.getStressIndex(), context);

        } catch (Exception e) {
            log.warn("개인화 메시지 생성 실패, 기본 메시지 반환: {}", e.getMessage());
            return "오늘 하루도 수고했어요. 잠깐 멈추고 나를 위한 쉼표를 찍어보세요. 🌿";
        }
    }

    /**
     * Claude에게 보낼 컨텍스트 문자열 조립
     * 진단 결과 + 이번 달 통계를 자연어로 요약
     */
    private String buildContext(DiagnosisResult latest, Double avgEmotion,
                                Integer logCount, List<Map<String, Object>> typeRatioList) {
        StringBuilder sb = new StringBuilder();

        String primaryKo = TYPE_KO.getOrDefault(latest.getPrimaryRestType(), latest.getPrimaryRestType());
        sb.append("주요 휴식 필요 유형: ").append(primaryKo);

        if (logCount != null && logCount > 0) {
            sb.append(", 이번 달 휴식 기록: ").append(logCount).append("회");
        }

        if (avgEmotion != null) {
            sb.append(", 평균 감정점수: ").append(String.format("%.1f", avgEmotion)).append("/10");
        }

        // 가장 많이 한 휴식 유형 1~2개 추가
        if (typeRatioList != null && !typeRatioList.isEmpty()) {
            sb.append(", 주로 한 휴식: ");
            typeRatioList.stream()
                    .limit(2)
                    .forEach(row -> {
                        String type = TYPE_KO.getOrDefault(
                                String.valueOf(row.get("rest_type")), String.valueOf(row.get("rest_type")));
                        sb.append(type).append(" ");
                    });
        }

        return sb.toString().trim();
    }
}
