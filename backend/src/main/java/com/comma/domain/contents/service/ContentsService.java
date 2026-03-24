package com.comma.domain.contents.service;

import com.comma.domain.contents.mapper.ContentsMapper;
import com.comma.domain.contents.model.Contents;
import com.comma.domain.contents.model.ContentReview;
import com.comma.domain.diagnosis.mapper.DiagnosisMapper;
import com.comma.domain.diagnosis.model.DiagnosisResult;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class ContentsService {

    private final ContentsMapper contentsMapper;
    private final DiagnosisMapper diagnosisMapper;

    public List<Contents> getContents(String category) {
        if (category == null || category.isBlank() || category.equals("all")) {
            return contentsMapper.findAll();
        }
        return contentsMapper.findByCategory(category);
    }

    public void deactivate(Long id) {
        contentsMapper.deactivateById(id);
    }

    public void updateContent(Long id, String title, String summary, String body) {
        contentsMapper.updateContent(id, title, summary, body);
    }

    public void fixCategoryImages() {
        contentsMapper.updateImageUrlByCategory("mental",
            "https://images.pexels.com/photos/167699/pexels-photo-167699.jpeg?auto=compress&cs=tinysrgb&w=800");
        contentsMapper.updateImageUrlByCategory("sensory",
            "https://images.pexels.com/photos/6724539/pexels-photo-6724539.jpeg?auto=compress&cs=tinysrgb&w=800");
        contentsMapper.updateImageUrlByCategory("emotional",
            "https://images.unsplash.com/photo-1474552226712-ac0f0961a954?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80");
        contentsMapper.updateImageUrlByCategory("social",
            "https://images.pexels.com/photos/1370295/pexels-photo-1370295.jpeg?auto=compress&cs=tinysrgb&w=800");
    }

    // 콘텐츠 단건 조회 (좋아요 여부 포함)
    public Contents getById(Long id, String 쉼표번호) {
        Contents content = contentsMapper.findById(id);
        if (content == null) return null;
        if (쉼표번호 != null) {
            content.setLiked(contentsMapper.findLike(쉼표번호, id));
        }
        return content;
    }

    // 좋아요 토글 — liked:true/false 반환
    public Map<String, Object> toggleLike(Long contentId, String 쉼표번호) {
        boolean liked = contentsMapper.findLike(쉼표번호, contentId);
        if (liked) {
            contentsMapper.deleteLike(쉼표번호, contentId);
        } else {
            contentsMapper.insertLike(쉼표번호, contentId);
        }
        int count = contentsMapper.countLikes(contentId);
        return Map.of("liked", !liked, "likeCount", count);
    }

    // 후기 목록
    public List<ContentReview> getReviews(Long contentId) {
        return contentsMapper.findReviewsByContentId(contentId);
    }

    // 후기 등록
    public ContentReview addReview(Long contentId, String 쉼표번호, int rating, String body) {
        ContentReview review = new ContentReview();
        review.set쉼표번호(쉼표번호);
        review.setContentId(contentId);
        review.setRating(rating);
        review.setBody(body);
        contentsMapper.insertReview(review);
        return contentsMapper.findReviewById(review.getId());
    }

    // 후기 삭제
    public void deleteReview(Long reviewId, String 쉼표번호) {
        contentsMapper.deleteReview(reviewId, 쉼표번호);
    }

    public List<Contents> getRecommended(String 쉼표번호) {
        if (쉼표번호 == null) return contentsMapper.findAll();
        DiagnosisResult latest = diagnosisMapper.findLatestBy쉼표번호(쉼표번호);
        if (latest == null) {
            return contentsMapper.findAll();
        }

        String primaryType = latest.getPrimaryRestType();
        List<Contents> result = new ArrayList<>();

        // 주요 유형 콘텐츠 먼저
        result.addAll(contentsMapper.findByCategory(primaryType));

        // 나머지 유형 중 3개씩 보완
        List<String> otherTypes = List.of(
            "physical", "mental", "sensory", "emotional", "social", "nature", "creative"
        ).stream().filter(t -> !t.equals(primaryType)).toList();

        List<Contents> others = contentsMapper.findByCategories(otherTypes);
        // 각 유형별로 최대 1개씩만 추가 (다양성)
        java.util.Map<String, Boolean> seen = new java.util.HashMap<>();
        for (Contents c : others) {
            if (!seen.containsKey(c.getCategory())) {
                result.add(c);
                seen.put(c.getCategory(), true);
            }
        }
        return result;
    }
}
