package com.comma.domain.contents.mapper;

import com.comma.domain.contents.model.Contents;
import com.comma.domain.contents.model.ContentReview;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

@Mapper
public interface ContentsMapper {
    List<Contents> findAll();
    List<Contents> findByCategory(@Param("category") String category);
    List<Contents> findByCategories(@Param("categories") List<String> categories);
    Contents findById(@Param("id") Long id);
    void deactivateById(@Param("id") Long id);
    void updateContent(@Param("id") Long id, @Param("title") String title, @Param("summary") String summary, @Param("body") String body);
    void updateImageUrlByCategory(@Param("category") String category, @Param("imageUrl") String imageUrl);

    // 좋아요
    boolean findLike(@Param("쉼표번호") String 쉼표번호, @Param("contentId") Long contentId);
    void insertLike(@Param("쉼표번호") String 쉼표번호, @Param("contentId") Long contentId);
    void deleteLike(@Param("쉼표번호") String 쉼표번호, @Param("contentId") Long contentId);
    int countLikes(@Param("contentId") Long contentId);

    // 후기
    List<ContentReview> findReviewsByContentId(@Param("contentId") Long contentId);
    void insertReview(ContentReview review);
    ContentReview findReviewById(@Param("id") Long id);
    void deleteReview(@Param("id") Long id, @Param("쉼표번호") String 쉼표번호);
    int countReviews(@Param("contentId") Long contentId);
}
