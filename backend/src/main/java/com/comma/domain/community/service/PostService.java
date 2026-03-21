package com.comma.domain.community.service;

import com.comma.domain.community.mapper.PostMapper;
import com.comma.domain.community.model.Post;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class PostService {

    private final PostMapper postMapper;

    // 게시글 목록 조회
    public Map<String, Object> getPosts(String category, String sort, String commaNo, int page, int size) {
        String cat = (category == null || category.isBlank() || "all".equals(category)) ? null : category;
        String sortMode = "popular".equals(sort) ? "popular" : "latest";
        int offset = (page - 1) * size;

        List<Post> posts = postMapper.findAll(cat, sortMode, commaNo, size, offset);
        int total = postMapper.countAll(cat);

        Map<String, Object> result = new HashMap<>();
        result.put("posts", posts);
        result.put("total", total);
        result.put("page", page);
        result.put("totalPages", (int) Math.ceil((double) total / size));
        return result;
    }

    // 게시글 단건 조회
    public Post getPost(Long id, String commaNo) {
        Post post = postMapper.findById(id, commaNo);
        if (post == null) throw new IllegalArgumentException("게시글을 찾을 수 없습니다.");
        return post;
    }

    // 게시글 작성
    public Post createPost(String 쉼표번호, Post post) {
        post.set쉼표번호(쉼표번호);
        post.setStatus("visible");
        postMapper.insertPost(post);
        return post;
    }

    // 게시글 삭제
    public void deletePost(Long id, String commaNo) {
        postMapper.softDeletePost(id, commaNo);
    }

    // 좋아요 토글 — 이미 있으면 취소, 없으면 추가
    public Map<String, Object> toggleLike(Long postId, String commaNo) {
        boolean alreadyLiked = postMapper.countLike(postId, commaNo) > 0;
        if (alreadyLiked) {
            postMapper.deleteLike(postId, commaNo);
        } else {
            postMapper.insertLike(postId, commaNo);
        }
        Map<String, Object> result = new HashMap<>();
        result.put("liked", !alreadyLiked);
        return result;
    }

    // 관리자용 상태 변경
    public void updatePostStatus(Long id, String status) {
        postMapper.updatePostStatus(id, status);
    }

    // 관리자용 목록
    public Map<String, Object> getPostsForAdmin(int page, int size) {
        int offset = (page - 1) * size;
        List<Post> posts = postMapper.findAllForAdmin(size, offset);
        int total = postMapper.countAllForAdmin();
        Map<String, Object> result = new HashMap<>();
        result.put("posts", posts);
        result.put("total", total);
        result.put("page", page);
        result.put("totalPages", (int) Math.ceil((double) total / size));
        return result;
    }
}
