package com.comma.service;

import com.comma.mapper.ExampleMapper;
import com.comma.model.Example;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ExampleService {

    private final ExampleMapper exampleMapper;

    public List<Example> getAll() {
        return exampleMapper.findAll();
    }

    public Example getById(Long id) {
        return exampleMapper.findById(id);
    }

    public Example create(Example example) {
        exampleMapper.insert(example);
        return example;
    }

    public Example update(Long id, Example example) {
        example.setId(id);
        exampleMapper.update(example);
        return exampleMapper.findById(id);
    }

    public void delete(Long id) {
        exampleMapper.delete(id);
    }
}
