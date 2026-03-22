package com.comma.domain.community.service;

import com.comma.domain.community.mapper.CommentMapper;
import com.comma.domain.community.mapper.PostMapper;
import com.comma.domain.community.mapper.PostPhotoMapper;
import com.comma.domain.community.model.Comment;
import com.comma.domain.community.model.Post;
import com.comma.domain.community.model.PostPhoto;
import com.comma.global.util.FileUploadService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class PostService {

    private final PostMapper postMapper;
    private final PostPhotoMapper postPhotoMapper;
    private final CommentMapper commentMapper;
    private final FileUploadService fileUploadService;

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

    // 게시글 작성 (사진 포함)
    @Transactional
    public Post createPost(String 쉼표번호, Post post, List<MultipartFile> images) throws IOException {
        post.set쉼표번호(쉼표번호);
        post.setStatus("visible");
        postMapper.insertPost(post);

        if (images != null && !images.isEmpty()) {
            List<String> photoUrls = fileUploadService.uploadPostPhotos(images);
            for (String url : photoUrls) {
                postPhotoMapper.insertPhoto(post.getId(), url);
            }
        }
        return post;
    }

    // 게시글 사진 목록 조회
    public List<PostPhoto> getPostPhotos(Long postId) {
        return postPhotoMapper.findByPostId(postId);
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

    // 댓글 목록 조회
    public List<Comment> getComments(Long postId) {
        return commentMapper.findByPostId(postId);
    }

    // 댓글 작성
    @Transactional
    public Comment writeComment(String commaNo, Long postId, String content) {
        if (content == null || content.isBlank()) throw new IllegalArgumentException("댓글 내용을 입력해주세요.");
        Comment comment = new Comment();
        comment.set쉼표번호(commaNo);
        comment.setPostId(postId);
        comment.setContent(content.trim());
        commentMapper.insertComment(comment);
        return commentMapper.findById(comment.getId());
    }

    // 댓글 삭제
    @Transactional
    public void deleteComment(String commaNo, Long commentId) {
        Comment comment = commentMapper.findById(commentId);
        if (comment == null) throw new IllegalArgumentException("댓글을 찾을 수 없습니다.");
        if (!comment.get쉼표번호().equals(commaNo)) throw new SecurityException("삭제 권한이 없습니다.");
        commentMapper.softDeleteComment(commentId, commaNo);
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
