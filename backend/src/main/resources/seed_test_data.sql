-- ============================================================
-- 테스트 계정 Seed 데이터
-- ============================================================
USE comma_db;

-- 일반 사용자 3명 (비밀번호: test1234)
INSERT INTO users (`쉼표번호`, email, password, nickname, status, email_verified, role) VALUES
('쉼표1001', 'user1@comma.com', '$2b$12$yMa/BccgKTxu4xmRjIm7fuCTD47LWLrJysOwkX2gxAHsw7fOFOGf2', '테스터1', 'active', 1, 'USER'),
('쉼표1002', 'user2@comma.com', '$2b$12$yMa/BccgKTxu4xmRjIm7fuCTD47LWLrJysOwkX2gxAHsw7fOFOGf2', '테스터2', 'active', 1, 'USER'),
('쉼표1003', 'user3@comma.com', '$2b$12$yMa/BccgKTxu4xmRjIm7fuCTD47LWLrJysOwkX2gxAHsw7fOFOGf2', '테스터3', 'active', 1, 'USER');

-- 관리자 3명 (비밀번호: admin1234)
INSERT INTO users (`쉼표번호`, email, password, nickname, status, email_verified, role) VALUES
('쉼표9001', 'admin1@comma.com', '$2b$12$dbuXX4uw.d1i1ijJIcp1zuSsHcNz9BN9SrxTrcPy3ECLv/THKspGy', '슈퍼관리자', 'active', 1, 'ADMIN'),
('쉼표9002', 'admin2@comma.com', '$2b$12$dbuXX4uw.d1i1ijJIcp1zuSsHcNz9BN9SrxTrcPy3ECLv/THKspGy', '관리자2', 'active', 1, 'ADMIN'),
('쉼표9003', 'admin3@comma.com', '$2b$12$dbuXX4uw.d1i1ijJIcp1zuSsHcNz9BN9SrxTrcPy3ECLv/THKspGy', '관리자3', 'active', 1, 'ADMIN');

-- admin_users 등록
INSERT INTO admin_users (`쉼표번호`, permission_level) VALUES
('쉼표9001', 9),
('쉼표9002', 1),
('쉼표9003', 1);
