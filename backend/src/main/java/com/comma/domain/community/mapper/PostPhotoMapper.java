package com.comma.domain.community.mapper;

import com.comma.domain.community.model.PostPhoto;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

@Mapper
public interface PostPhotoMapper {

    void insertPhoto(@Param("postId") Long postId, @Param("photoUrl") String photoUrl);

    List<PostPhoto> findByPostId(@Param("postId") Long postId);

    void deleteByPostId(@Param("postId") Long postId);
}
