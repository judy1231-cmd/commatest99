-- ============================================================
-- 테스트 계정 Seed 데이터
-- ============================================================
USE comma_db;

-- 테스트 사용자 (아이디: test / 비밀번호: test1234)
INSERT INTO users (`쉼표번호`, email, password, username, nickname, status, email_verified, role) VALUES
('쉼표0001', 'test@comma.com', '$2a$10$zCFxR/CGBI9KgTlKf/v9A.cHwfjMzzikKt5yVXZSYVElvOYoLoF7O', 'test', '쉼표0001', 'active', 1, 'USER');

-- 일반 사용자 3명 (아이디: user1~3 / 비밀번호: test1234)
INSERT INTO users (`쉼표번호`, email, password, username, nickname, status, email_verified, role) VALUES
('쉼표1001', 'user1@comma.com', '$2a$10$zCFxR/CGBI9KgTlKf/v9A.cHwfjMzzikKt5yVXZSYVElvOYoLoF7O', 'user1', '쉼표1001', 'active', 1, 'USER'),
('쉼표1002', 'user2@comma.com', '$2a$10$zCFxR/CGBI9KgTlKf/v9A.cHwfjMzzikKt5yVXZSYVElvOYoLoF7O', 'user2', '쉼표1002', 'active', 1, 'USER'),
('쉼표1003', 'user3@comma.com', '$2a$10$zCFxR/CGBI9KgTlKf/v9A.cHwfjMzzikKt5yVXZSYVElvOYoLoF7O', 'user3', '쉼표1003', 'active', 1, 'USER');

-- 관리자 3명 (아이디: admin1~3 / 비밀번호: admin1234)
INSERT INTO users (`쉼표번호`, email, password, username, nickname, status, email_verified, role) VALUES
('쉼표9001', 'admin1@comma.com', '$2a$10$Vrqw.x6PG/Wzunv/u.pYXOWWKBRiXgq0SmiYSQS7QAxYfHkXWq8jC', 'admin1', '쉼표9001', 'active', 1, 'ADMIN'),
('쉼표9002', 'admin2@comma.com', '$2a$10$Vrqw.x6PG/Wzunv/u.pYXOWWKBRiXgq0SmiYSQS7QAxYfHkXWq8jC', 'admin2', '쉼표9002', 'active', 1, 'ADMIN'),
('쉼표9003', 'admin3@comma.com', '$2a$10$Vrqw.x6PG/Wzunv/u.pYXOWWKBRiXgq0SmiYSQS7QAxYfHkXWq8jC', 'admin3', '쉼표9003', 'active', 1, 'ADMIN');

-- admin_users 등록
INSERT INTO admin_users (`쉼표번호`, permission_level) VALUES
('쉼표9001', 9),
('쉼표9002', 1),
('쉼표9003', 1);
