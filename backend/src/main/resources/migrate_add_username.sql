-- ============================================================
-- 마이그레이션: username 컬럼 추가 + 테스트 계정 생성
-- 기존 DB에 한 번만 실행하세요
-- ============================================================
USE comma_db;

-- 1. username 컬럼 추가 (이미 있으면 오류 무시)
ALTER TABLE users
    ADD COLUMN username VARCHAR(50) NOT NULL DEFAULT '' AFTER password;

ALTER TABLE users
    ADD UNIQUE KEY uq_username (username);

-- 2. 기존 사용자가 있다면 username을 쉼표번호로 채워줌 (임시)
UPDATE users SET username = `쉼표번호` WHERE username = '';

-- 3. 테스트 계정 삽입 (아이디: test / 비밀번호: test1234)
INSERT IGNORE INTO users (`쉼표번호`, email, password, username, nickname, status, email_verified, role)
VALUES ('쉼표0001', 'test@comma.com', '$2a$10$zCFxR/CGBI9KgTlKf/v9A.cHwfjMzzikKt5yVXZSYVElvOYoLoF7O', 'test', '쉼표0001', 'active', 1, 'USER');
