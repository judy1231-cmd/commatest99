package com.comma.domain.survey.service;

import com.comma.global.config.ClaudeApiClient;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * 사용자가 입력한 자유 텍스트를 7가지 휴식유형으로 분류
 *
 * 1차: 키워드 매칭 (빠르고 API 키 불필요)
 * 2차: Claude API (키워드로 판별 불가 시, API 키 있을 때만)
 */
@Component
@RequiredArgsConstructor
public class RestTypeClassifier {

    private final ClaudeApiClient claudeApiClient;

    // 유형별 키워드 사전 — 실제 사용자가 쓸 법한 일상 표현 위주
    private static final Map<String, List<String>> TYPE_KEYWORDS = Map.of(
            "physical", List.of(
                    "운동", "스트레칭", "요가", "달리기", "러닝", "수영", "걷기", "산책",
                    "춤", "댄스", "필라테스", "헬스", "클라이밍", "자전거", "배드민턴",
                    "축구", "농구", "웨이트", "조깅", "폼롤러", "마사지", "근육"
            ),
            "mental", List.of(
                    "명상", "독서", "책", "생각", "고요", "침묵", "퍼즐", "사색",
                    "마인드풀니스", "심호흡", "호흡", "멍때리기", "비우기", "정리",
                    "집중", "조용", "고요함", "평온"
            ),
            "sensory", List.of(
                    "음악", "향기", "향초", "캔들", "아로마", "목욕", "반신욕", "입욕제",
                    "ASMR", "촉감", "인테리어", "조명", "차", "커피", "와인",
                    "맛", "향수", "디퓨저", "소리", "노래", "이불"
            ),
            "emotional", List.of(
                    "울기", "눈물", "포옹", "위로", "감정", "편지", "공감", "반려동물",
                    "강아지", "고양이", "가족", "사랑", "감동", "영화", "드라마",
                    "감사", "따뜻", "마음", "위안", "치유"
            ),
            "social", List.of(
                    "친구", "사람", "모임", "수다", "전화", "파티", "대화", "카톡",
                    "만남", "약속", "브런치", "술", "맥주", "보드게임", "여행",
                    "같이", "함께", "동아리", "클럽"
            ),
            "nature", List.of(
                    "숲", "산", "바다", "공원", "자연", "캠핑", "하늘", "꽃", "식물",
                    "정원", "트레킹", "하이킹", "텃밭", "별", "일출", "일몰",
                    "계곡", "강", "호수", "새소리", "나무", "잔디"
            ),
            "creative", List.of(
                    "글쓰기", "글", "그림", "그리기", "만들기", "요리", "베이킹", "사진",
                    "악기", "기타", "피아노", "노래", "DIY", "공예", "시", "소설",
                    "에세이", "블로그", "드로잉", "스케치", "뜨개질", "자수",
                    "영상", "편집", "작곡", "창작", "디자인", "캘리그라피"
            )
    );

    // 유형 이름 → score(유형ID) 매핑
    private static final Map<String, Integer> TYPE_TO_SCORE = Map.of(
            "physical", 1, "mental", 2, "sensory", 3,
            "emotional", 4, "social", 5, "nature", 6, "creative", 7
    );

    /**
     * 자유 텍스트를 분석하여 가장 적합한 휴식유형의 score(1~7)를 반환
     * 분류 불가 시 0 반환
     */
    public int classify(String text) {
        if (text == null || text.isBlank()) return 0;

        String normalized = text.toLowerCase().trim();

        // Step 1: 키워드 매칭
        Map<String, Integer> matchCounts = new HashMap<>();
        for (var entry : TYPE_KEYWORDS.entrySet()) {
            int count = 0;
            for (String keyword : entry.getValue()) {
                if (normalized.contains(keyword.toLowerCase())) {
                    count++;
                }
            }
            if (count > 0) {
                matchCounts.put(entry.getKey(), count);
            }
        }

        // 키워드 매칭 성공 → 가장 많이 매칭된 유형
        if (!matchCounts.isEmpty()) {
            String bestType = matchCounts.entrySet().stream()
                    .max(Map.Entry.comparingByValue())
                    .map(Map.Entry::getKey)
                    .orElse(null);
            if (bestType != null) {
                return TYPE_TO_SCORE.get(bestType);
            }
        }

        // Step 2: 키워드 매칭 실패 → Claude API 시도
        try {
            String prompt = String.format(
                    "다음 활동/취미가 7가지 휴식유형 중 어디에 해당하는지 한 단어로만 답해줘.\n"
                            + "유형: physical, mental, sensory, emotional, social, nature, creative\n"
                            + "활동: %s\n"
                            + "답 (유형 이름만):",
                    text
            );
            String response = claudeApiClient.getRestAdvice(text, 50, "분류 요청");

            // 응답에서 유형 이름 찾기
            for (String type : TYPE_TO_SCORE.keySet()) {
                if (response.toLowerCase().contains(type)) {
                    return TYPE_TO_SCORE.get(type);
                }
            }
        } catch (Exception ignored) {
            // API 실패 시 무시
        }

        return 0; // 분류 불가
    }
}
