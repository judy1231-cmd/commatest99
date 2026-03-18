package com.comma.domain.place.mapper;

import com.comma.domain.place.model.*;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

@Mapper
public interface PlaceMapper {

    // ==================== 장소 ====================

    List<Place> findPlaces(@Param("keyword") String keyword,
                           @Param("restType") String restType,
                           @Param("offset") int offset,
                           @Param("size") int size);

    int countPlaces(@Param("keyword") String keyword,
                    @Param("restType") String restType);

    Place findById(@Param("id") Long id);

    List<PlaceTag> findTagsByPlaceId(@Param("placeId") Long placeId);

    List<PlacePhoto> findPhotosByPlaceId(@Param("placeId") Long placeId);

    // ==================== 리뷰 ====================

    void insertReview(PlaceReview review);

    List<PlaceReview> findReviewsByPlaceId(@Param("placeId") Long placeId);

    PlaceReview findReviewById(@Param("id") Long id);

    void updateReview(PlaceReview review);

    void deleteReview(@Param("id") Long id, @Param("쉼표번호") String 쉼표번호);

    // ==================== 북마크 ====================

    PlaceBookmark findBookmark(@Param("쉼표번호") String 쉼표번호,
                               @Param("placeId") Long placeId);

    void insertBookmark(PlaceBookmark bookmark);

    void deleteBookmark(@Param("쉼표번호") String 쉼표번호,
                        @Param("placeId") Long placeId);

    List<Place> findBookmarkedPlaces(@Param("쉼표번호") String 쉼표번호);

    void insertPhoto(PlacePhoto photo);

    int countPhotosByPlaceId(@Param("placeId") Long placeId);

    List<Place> findAllApproved();

    // ==================== 주변 검색 ====================

    List<Place> findNearbyPlaces(@Param("lat") double lat,
                                 @Param("lng") double lng,
                                 @Param("radius") double radius);

    // ==================== Seed (관리자) ====================

    boolean existsByNameAndAddress(@Param("name") String name, @Param("address") String address);

    void insertPlace(Place place);

    void insertPlaceTag(PlaceTag tag);

    void deleteAllPlaces();

    void deleteAllPlaceTags();

    void deleteTagsByPlaceNameFilter();

    int deleteInappropriatePlaces();

    int deleteUnrelatedPlaces();

    void deleteTagsByUnrelatedFilter();

    int deleteDuplicatesByName();

    void deleteTagsForDuplicates();
}
