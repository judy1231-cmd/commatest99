package com.comma.global.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;

/**
 * Claude API 클라이언트
 * — 진단 결과 기반으로 AI 맞춤 휴식 추천 메시지를 생성
 *
 * 사용법:
 *   String advice = claudeApiClient.getRestAdvice("physical", 85, "직장인, 어깨통증");
 */
@Component
public class ClaudeApiClient {

    @Value("${claude.api.key:}")
    private String apiKey;

    @Value("${claude.model:claude-sonnet-4-20250514}")
    private String model;

    private static final String API_URL = "https://api.anthropic.com/v1/messages";
    private static final HttpClient httpClient = HttpClient.newBuilder()
            .connectTimeout(Duration.ofSeconds(10))
            .build();

    /**
     * 진단 결과 기반 맞춤 휴식 추천 메시지 생성
     *
     * @param primaryRestType 주요 휴식유형 (physical, mental 등)
     * @param stressIndex     스트레스 지수 (0~100)
     * @param userContext      사용자 컨텍스트 (직업, 증상 등)
     * @return AI가 생성한 맞춤 휴식 추천 메시지
     */
    public String getRestAdvice(String primaryRestType, int stressIndex, String userContext) {
        if (apiKey == null || apiKey.isBlank()) {
            return getDefaultAdvice(primaryRestType);
        }

        String prompt = String.format(
                "너는 휴식/웰니스 전문가야. 사용자의 진단 결과를 바탕으로 맞춤 휴식을 추천해줘.\n\n"
                        + "진단 결과:\n"
                        + "- 주요 휴식유형: %s\n"
                        + "- 스트레스 지수: %d/100\n"
                        + "- 사용자 상황: %s\n\n"
                        + "200자 이내로 따뜻하고 구체적인 휴식 추천을 해줘. "
                        + "구체적인 활동 1~2개를 포함해서 오늘 바로 실천할 수 있는 것으로.",
                primaryRestType, stressIndex, userContext
        );

        String requestBody = String.format(
                "{\"model\":\"%s\",\"max_tokens\":300,\"messages\":[{\"role\":\"user\",\"content\":\"%s\"}]}",
                model, escapeJson(prompt)
        );

        try {
            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create(API_URL))
                    .header("Content-Type", "application/json")
                    .header("x-api-key", apiKey)
                    .header("anthropic-version", "2023-06-01")
                    .POST(HttpRequest.BodyPublishers.ofString(requestBody))
                    .timeout(Duration.ofSeconds(30))
                    .build();

            HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());

            if (response.statusCode() == 200) {
                return extractTextFromResponse(response.body());
            }

            return getDefaultAdvice(primaryRestType);

        } catch (Exception e) {
            return getDefaultAdvice(primaryRestType);
        }
    }

    // Claude API 응답에서 텍스트 추출 (간단한 JSON 파싱)
    private String extractTextFromResponse(String responseBody) {
        // "text":"..." 패턴을 찾아서 추출
        int textStart = responseBody.indexOf("\"text\":\"");
        if (textStart == -1) return getDefaultAdvice("mental");

        textStart += 8; // "text":" 길이
        int textEnd = responseBody.indexOf("\"", textStart);
        // 이스케이프된 따옴표 건너뛰기
        while (textEnd > 0 && responseBody.charAt(textEnd - 1) == '\\') {
            textEnd = responseBody.indexOf("\"", textEnd + 1);
        }

        if (textEnd == -1) return getDefaultAdvice("mental");

        return responseBody.substring(textStart, textEnd)
                .replace("\\n", "\n")
                .replace("\\\"", "\"");
    }

    // API 키 없을 때 기본 추천 메시지
    private String getDefaultAdvice(String restType) {
        return switch (restType) {
            case "physical" -> "몸이 많이 지쳐있네요. 10분 스트레칭이나 가벼운 산책을 추천드려요. 혈액순환이 좋아지면 피로도 자연스럽게 풀릴 거예요.";
            case "mental" -> "마음이 복잡할 때는 5분 심호흡 명상이 좋아요. 눈을 감고 숨을 천천히 들이마시고 내뱉어보세요.";
            case "sensory" -> "감각이 예민해진 상태예요. 조용한 공간에서 눈을 감고 15분만 쉬어보세요. 디지털 기기도 잠시 내려놓으면 좋겠어요.";
            case "emotional" -> "감정적으로 지친 하루였군요. 좋아하는 음악을 들으며 따뜻한 차를 마셔보세요. 마음이 한결 편안해질 거예요.";
            case "social" -> "사람들과의 관계에서 에너지가 소진되었어요. 혼자만의 조용한 시간이나 편한 친구와의 가벼운 대화가 도움이 될 거예요.";
            case "nature" -> "자연이 당신을 부르고 있어요! 가까운 공원에서 30분 산책해보세요. 나무와 하늘을 보며 걷는 것만으로도 힐링이 됩니다.";
            case "creative" -> "창작 활동으로 스트레스를 풀어보세요. 낙서 그리기, 간단한 글쓰기, 요리 등 뭐든 좋아요. 몰입의 즐거움을 느껴보세요.";
            default -> "오늘 하루 수고했어요. 자신에게 맞는 작은 휴식을 선물해보세요.";
        };
    }

    private String escapeJson(String text) {
        return text.replace("\\", "\\\\")
                .replace("\"", "\\\"")
                .replace("\n", "\\n")
                .replace("\r", "\\r")
                .replace("\t", "\\t");
    }
}
