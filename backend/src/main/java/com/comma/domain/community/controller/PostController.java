package com.comma.domain.community.controller;

import com.comma.domain.community.model.Post;
import com.comma.domain.community.model.PostPhoto;
import com.comma.domain.community.service.PostService;
import com.comma.global.util.ApiResponse;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;
import java.util.Map;

@RestController
@RequiredArgsConstructor
public class PostController {

    private final PostService postService;
    private final ObjectMapper objectMapper;

    // GET /api/posts?category=&sort=latest&page=1&size=10
    @GetMapping("/api/posts")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getPosts(
            HttpServletRequest request,
            @RequestParam(required = false) String category,
            @RequestParam(defaultValue = "latest") String sort,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int size) {
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

    // GET /api/posts/{id}/photos
    @GetMapping("/api/posts/{id}/photos")
    public ResponseEntity<ApiResponse<List<PostPhoto>>> getPostPhotos(@PathVariable Long id) {
        List<PostPhoto> photos = postService.getPostPhotos(id);
        return ResponseEntity.ok(ApiResponse.ok(photos, "게시글 사진 조회 성공"));
    }

    /**
     * POST /api/posts  [JWT 필요]
     * multipart/form-data:
     *   - data: JSON 문자열 (title, content, category, anonymous)
     *   - images: 이미지 파일 (선택, 최대 5개)
     */
    @PostMapping(value = "/api/posts", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ApiResponse<Post>> createPost(
            HttpServletRequest request,
            @RequestPart("data") String postDataJson,
            @RequestPart(value = "images", required = false) List<MultipartFile> images) throws IOException {
        String 쉼표번호 = (String) request.getAttribute("쉼표번호");
        Post post = objectMapper.readValue(postDataJson, Post.class);
        Post created = postService.createPost(쉼표번호, post, images);
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

    // POST /api/posts/{id}/like  [JWT 필요]
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

    // PUT /api/admin/posts/{id}/status  [ADMIN]
    @PutMapping("/api/admin/posts/{id}/status")
    public ResponseEntity<ApiResponse<Void>> updatePostStatus(
            @PathVariable Long id,
            @RequestBody Map<String, String> body) {
        postService.updatePostStatus(id, body.get("status"));
        return ResponseEntity.ok(ApiResponse.ok("게시글 상태가 변경되었습니다."));
    }
}
