package com.comma.global.util;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;
import java.util.Set;
import java.util.UUID;

/**
 * 파일 업로드 보안 처리 서비스
 * - MIME 타입 화이트리스트 검증
 * - 파일 크기 제한 (5MB)
 * - UUID 기반 파일명 생성 (경로 탐색 방지)
 * - 허용된 확장자만 저장
 */
@Service
public class FileUploadService {

    private static final long MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
    private static final int MAX_FILES_PER_POST = 5;

    private static final Set<String> ALLOWED_MIME_TYPES = Set.of(
            "image/jpeg", "image/png", "image/gif", "image/webp"
    );

    private static final Set<String> ALLOWED_EXTENSIONS = Set.of(
            "jpg", "jpeg", "png", "gif", "webp"
    );

    @Value("${app.upload.dir:uploads}")
    private String uploadBaseDir;

    @Value("${app.base-url:http://localhost:8080}")
    private String baseUrl;

    /**
     * 커뮤니티 게시글 사진 업로드
     *
     * @param files 업로드할 파일 목록 (최대 5개)
     * @return 저장된 파일의 접근 URL 목록
     */
    public List<String> uploadPostPhotos(List<MultipartFile> files) throws IOException {
        if (files == null || files.isEmpty()) return List.of();

        if (files.size() > MAX_FILES_PER_POST) {
            throw new IllegalArgumentException("사진은 최대 " + MAX_FILES_PER_POST + "개까지 업로드할 수 있습니다.");
        }

        Path uploadPath = Paths.get(uploadBaseDir, "community").toAbsolutePath();
        Files.createDirectories(uploadPath);

        return files.stream()
                .filter(file -> file != null && !file.isEmpty())
                .map(file -> {
                    try {
                        return saveFile(file, uploadPath);
                    } catch (IOException e) {
                        throw new RuntimeException("파일 저장 중 오류가 발생했습니다: " + e.getMessage(), e);
                    }
                })
                .toList();
    }

    private String saveFile(MultipartFile file, Path uploadPath) throws IOException {
        validateFile(file);

        String originalFilename = file.getOriginalFilename();
        String extension = extractExtension(originalFilename);
        String savedFilename = UUID.randomUUID().toString().replace("-", "") + "." + extension;

        Path targetPath = uploadPath.resolve(savedFilename);
        file.transferTo(targetPath.toFile());

        return baseUrl + "/uploads/community/" + savedFilename;
    }

    private void validateFile(MultipartFile file) {
        if (file.getSize() > MAX_FILE_SIZE) {
            throw new IllegalArgumentException("파일 크기는 5MB를 초과할 수 없습니다.");
        }

        String contentType = file.getContentType();
        if (contentType == null || !ALLOWED_MIME_TYPES.contains(contentType.toLowerCase())) {
            throw new IllegalArgumentException("허용되지 않는 파일 형식입니다. JPG, PNG, GIF, WEBP만 가능합니다.");
        }

        String originalFilename = file.getOriginalFilename();
        String extension = extractExtension(originalFilename);
        if (!ALLOWED_EXTENSIONS.contains(extension.toLowerCase())) {
            throw new IllegalArgumentException("허용되지 않는 파일 확장자입니다.");
        }
    }

    private String extractExtension(String filename) {
        if (filename == null || !filename.contains(".")) {
            throw new IllegalArgumentException("올바른 파일 형식이 아닙니다.");
        }
        String ext = filename.substring(filename.lastIndexOf('.') + 1);
        // 확장자에 경로 구분자 등 특수문자가 있으면 거부
        if (ext.contains("/") || ext.contains("\\") || ext.contains("..")) {
            throw new IllegalArgumentException("올바른 파일 확장자가 아닙니다.");
        }
        return ext.toLowerCase();
    }
}
