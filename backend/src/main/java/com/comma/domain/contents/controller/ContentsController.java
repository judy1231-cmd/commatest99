package com.comma.domain.contents.controller;

import com.comma.domain.contents.model.Contents;
import com.comma.domain.contents.service.ContentsService;
import com.comma.global.util.ApiResponse;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/contents")
@RequiredArgsConstructor
public class ContentsController {

    private final ContentsService contentsService;

    // GET /api/contents?category={type}  [JWT 불필요]
    @GetMapping
    public ResponseEntity<ApiResponse<List<Contents>>> getContents(
            @RequestParam(required = false) String category) {
        List<Contents> list = contentsService.getContents(category);
        return ResponseEntity.ok(ApiResponse.ok(list, "콘텐츠 조회 성공"));
    }

    // GET /api/contents/{id}  [JWT 불필요]
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<Contents>> getContents(@PathVariable Long id) {
        Contents content = contentsService.getById(id);
        if (content == null) return ResponseEntity.status(404).body(ApiResponse.fail("콘텐츠를 찾을 수 없어요."));
        return ResponseEntity.ok(ApiResponse.ok(content, "콘텐츠 조회 성공"));
    }

    // GET /api/contents/recommend  [JWT 필요]
    @GetMapping("/recommend")
    public ResponseEntity<ApiResponse<List<Contents>>> getRecommended(HttpServletRequest request) {
        String 쉼표번호 = (String) request.getAttribute("쉼표번호");
        List<Contents> list = contentsService.getRecommended(쉼표번호);
        return ResponseEntity.ok(ApiResponse.ok(list, "맞춤 추천 조회 성공"));
    }
}
