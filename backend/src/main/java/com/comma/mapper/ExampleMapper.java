package com.comma.mapper;

import com.comma.model.Example;
import org.apache.ibatis.annotations.Mapper;

import java.util.List;

@Mapper
public interface ExampleMapper {
    List<Example> findAll();
    Example findById(Long id);
    int insert(Example example);
    int update(Example example);
    int delete(Long id);
}
