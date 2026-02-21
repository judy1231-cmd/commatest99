package com.comma.controller;

import com.comma.model.Example;
import com.comma.service.ExampleService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/examples")
@RequiredArgsConstructor
public class ExampleController {

    private final ExampleService exampleService;

    @GetMapping
    public ResponseEntity<List<Example>> getAll() {
        return ResponseEntity.ok(exampleService.getAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Example> getById(@PathVariable Long id) {
        return ResponseEntity.ok(exampleService.getById(id));
    }

    @PostMapping
    public ResponseEntity<Example> create(@RequestBody Example example) {
        return ResponseEntity.ok(exampleService.create(example));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Example> update(@PathVariable Long id, @RequestBody Example example) {
        return ResponseEntity.ok(exampleService.update(id, example));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        exampleService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
