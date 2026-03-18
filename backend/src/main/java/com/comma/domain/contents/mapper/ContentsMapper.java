package com.comma.domain.contents.mapper;

import com.comma.domain.contents.model.Contents;
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
    void updateImageUrlByCategory(@Param("category") String category, @Param("imageUrl") String imageUrl);
}
