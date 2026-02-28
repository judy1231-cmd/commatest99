package com.comma.domain.place.service;

import com.comma.domain.place.mapper.PlaceMapper;
import com.comma.domain.place.model.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class PlaceService {

    private final PlaceMapper placeMapper;

    public Map<String, Object> getPlaces(String keyword, String restType, int page, int size) {
        int offset = (page - 1) * size;
        List<Place> places = placeMapper.findPlaces(keyword, restType, offset, size);
        int total = placeMapper.countPlaces(keyword, restType);

        Map<String, Object> result = new HashMap<>();
        result.put("places", places);
        result.put("total", total);
        result.put("page", page);
        result.put("totalPages", (int) Math.ceil((double) total / size));
        return result;
    }

    /**
     * 장소 상세 — 기본정보 + 태그 + 사진을 한 번에 반환
     * 프론트에서 여러 번 API를 호출하지 않아도 되도록 조합
     */
    public Map<String, Object> getPlaceDetail(Long placeId) {
        Place place = placeMapper.findById(placeId);
        if (place == null) throw new IllegalArgumentException("존재하지 않는 장소입니다.");

        List<PlaceTag> tags = placeMapper.findTagsByPlaceId(placeId);
        List<PlacePhoto> photos = placeMapper.findPhotosByPlaceId(placeId);
        List<PlaceReview> reviews = placeMapper.findReviewsByPlaceId(placeId);

        Map<String, Object> result = new HashMap<>();
        result.put("place", place);
        result.put("tags", tags);
        result.put("photos", photos);
        result.put("reviews", reviews);
        return result;
    }

    @Transactional
    public PlaceReview writeReview(String 쉼표번호, Long placeId, Integer rating, String content) {
        Place place = placeMapper.findById(placeId);
        if (place == null) throw new IllegalArgumentException("존재하지 않는 장소입니다.");
        if (rating < 1 || rating > 5) throw new IllegalArgumentException("별점은 1~5 사이여야 합니다.");

        PlaceReview review = new PlaceReview();
        review.set쉼표번호(쉼표번호);
        review.setPlaceId(placeId);
        review.setRating(rating);
        review.setContent(content);
        review.setVerified(false);
        review.setCreatedAt(LocalDateTime.now());
        placeMapper.insertReview(review);
        return review;
    }

    public List<PlaceReview> getReviews(Long placeId) {
        return placeMapper.findReviewsByPlaceId(placeId);
    }

    /**
     * 북마크 토글 — 이미 있으면 삭제, 없으면 추가
     * @return true면 추가됨, false면 삭제됨
     */
    @Transactional
    public boolean toggleBookmark(String 쉼표번호, Long placeId) {
        PlaceBookmark existing = placeMapper.findBookmark(쉼표번호, placeId);
        if (existing != null) {
            placeMapper.deleteBookmark(쉼표번호, placeId);
            return false;
        }

        PlaceBookmark bookmark = new PlaceBookmark();
        bookmark.set쉼표번호(쉼표번호);
        bookmark.setPlaceId(placeId);
        bookmark.setCreatedAt(LocalDateTime.now());
        placeMapper.insertBookmark(bookmark);
        return true;
    }

    public List<Place> getMyBookmarks(String 쉼표번호) {
        return placeMapper.findBookmarkedPlaces(쉼표번호);
    }

    public List<Place> getNearbyPlaces(double lat, double lng, double radius) {
        return placeMapper.findNearbyPlaces(lat, lng, radius);
    }
}
