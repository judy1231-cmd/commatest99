package com.comma.domain.community.mapper;

import com.comma.domain.community.model.Post;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

@Mapper
public interface PostMapper {

    // 게시글 목록 (카테고리 필터 + 정렬 + 페이지)
    List<Post> findAll(
            @Param("category") String category,
            @Param("sort") String sort,           // latest | popular
            @Param("commaNo") String commaNo,     // 좋아요 여부 확인용 (nullable)
            @Param("size") int size,
            @Param("offset") int offset
    );

    int countAll(@Param("category") String category);

    // 게시글 단건
    Post findById(@Param("id") Long id, @Param("commaNo") String commaNo);

    // 게시글 작성
    void insertPost(Post post);

    // 게시글 삭제 (soft delete)
    void softDeletePost(@Param("id") Long id, @Param("commaNo") String commaNo);

    // 좋아요 존재 여부
    int countLike(@Param("postId") Long postId, @Param("commaNo") String commaNo);

    // 좋아요 추가
    void insertLike(@Param("postId") Long postId, @Param("commaNo") String commaNo);

    // 좋아요 취소
    void deleteLike(@Param("postId") Long postId, @Param("commaNo") String commaNo);

    // 관리자용 — 전체 게시글 (삭제 포함)
    List<Post> findAllForAdmin(@Param("size") int size, @Param("offset") int offset);

    int countAllForAdmin();

    // 관리자용 — 게시글 상태 변경
    void updatePostStatus(@Param("id") Long id, @Param("status") String status);
}
