package com.comma.domain.community.mapper;

import com.comma.domain.community.model.Comment;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

@Mapper
public interface CommentMapper {

    List<Comment> findByPostId(@Param("postId") Long postId);

    void insertComment(Comment comment);

    Comment findById(@Param("id") Long id);

    void updateComment(@Param("id") Long id, @Param("commaNo") String commaNo, @Param("content") String content);

    void softDeleteComment(@Param("id") Long id, @Param("commaNo") String commaNo);
}
