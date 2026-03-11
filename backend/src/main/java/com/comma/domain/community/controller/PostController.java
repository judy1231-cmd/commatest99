package com.comma.domain.community.controller;

import com.comma.domain.community.model.Post;
import com.comma.domain.community.service.PostService;
import com.comma.global.util.ApiResponse;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequiredArgsConstructor
public class PostController {

    private final PostService postService;

    // GET /api/posts?category=&sort=latest&page=1&size=10
    @GetMapping("/api/posts")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getPosts(
            HttpServletRequest request,
            @RequestParam(required = false) String category,
            @RequestParam(defaultValue = "latest") String sort,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int size) {
        // 비로그인도 열람 가능 — 좋아요 여부는 로그인 시에만
        String commaNo = (String) request.getAttribute("쉼표번호");
        Map<String, Object> result = postService.getPosts(category, sort, commaNo, page, size);
        return ResponseEntity.ok(ApiResponse.ok(result, "게시글 목록 조회 성공"));
    }

    // GET /api/posts/{id}
    @GetMapping("/api/posts/{id}")
    public ResponseEntity<ApiResponse<Post>> getPost(
            HttpServletRequest request,
            @PathVariable Long id) {
        String commaNo = (String) request.getAttribute("쉼표번호");
        try {
            Post post = postService.getPost(id, commaNo);
            return ResponseEntity.ok(ApiResponse.ok(post, "게시글 조회 성공"));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(404).body(ApiResponse.fail(e.getMessage()));
        }
    }

    // POST /api/posts  [JWT 필요]
    @PostMapping("/api/posts")
    public ResponseEntity<ApiResponse<Post>> createPost(
            HttpServletRequest request,
            @RequestBody Post post) {
        String 쉼표번호 = (String) request.getAttribute("쉼표번호");
        Post created = postService.createPost(쉼표번호, post);
        return ResponseEntity.ok(ApiResponse.ok(created, "게시글이 작성되었습니다."));
    }

    // DELETE /api/posts/{id}  [JWT 필요]
    @DeleteMapping("/api/posts/{id}")
    public ResponseEntity<ApiResponse<Void>> deletePost(
            HttpServletRequest request,
            @PathVariable Long id) {
        String commaNo = (String) request.getAttribute("쉼표번호");
        postService.deletePost(id, commaNo);
        return ResponseEntity.ok(ApiResponse.ok("게시글이 삭제되었습니다."));
    }

    // POST /api/posts/{id}/like  [JWT 필요]  — 좋아요 토글
    @PostMapping("/api/posts/{id}/like")
    public ResponseEntity<ApiResponse<Map<String, Object>>> toggleLike(
            HttpServletRequest request,
            @PathVariable Long id) {
        String commaNo = (String) request.getAttribute("쉼표번호");
        Map<String, Object> result = postService.toggleLike(id, commaNo);
        return ResponseEntity.ok(ApiResponse.ok(result, "좋아요 처리 완료"));
    }

    // GET /api/admin/posts?page=1&size=20  [ADMIN]
    @GetMapping("/api/admin/posts")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getPostsForAdmin(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "20") int size) {
        Map<String, Object> result = postService.getPostsForAdmin(page, size);
        return ResponseEntity.ok(ApiResponse.ok(result, "관리자 게시글 목록 조회 성공"));
    }
}
