-- ============================================================
-- 쉼표(,) 프로젝트 DB Schema (commatest99용 — MyBatis 매핑 기준)
-- MySQL 8.0 기준
-- ============================================================

CREATE DATABASE IF NOT EXISTS comma_db DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE comma_db;

-- ============================================================
-- [A] 사용자/인증
-- ============================================================

CREATE TABLE IF NOT EXISTS users (
    `쉼표번호`      VARCHAR(12)  NOT NULL PRIMARY KEY,
    email           VARCHAR(100) NOT NULL UNIQUE,
    password        VARCHAR(255) NOT NULL,
    username        VARCHAR(50)  NOT NULL UNIQUE,   -- 사용자가 직접 정하는 로그인 아이디
    nickname        VARCHAR(50)  NOT NULL,           -- 자동 부여되는 쉼표번호 (표시용)
    status          ENUM('active','dormant','banned') NOT NULL DEFAULT 'active',
    email_verified  TINYINT(1)   NOT NULL DEFAULT 0,
    role            ENUM('USER','ADMIN') NOT NULL DEFAULT 'USER',
    created_at      DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at      DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS auth_provider (
    id              BIGINT       NOT NULL AUTO_INCREMENT PRIMARY KEY,
    `쉼표번호`      VARCHAR(12)  NOT NULL,
    provider        ENUM('kakao','google') NOT NULL,
    provider_id     VARCHAR(100) NOT NULL,
    created_at      DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY uq_provider (provider, provider_id),
    FOREIGN KEY (`쉼표번호`) REFERENCES users(`쉼표번호`) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS password_reset_token (
    id              BIGINT       NOT NULL AUTO_INCREMENT PRIMARY KEY,
    `쉼표번호`      VARCHAR(12)  NOT NULL,
    token           VARCHAR(255) NOT NULL UNIQUE,
    expires_at      DATETIME     NOT NULL,
    used            TINYINT(1)   NOT NULL DEFAULT 0,
    created_at      DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (`쉼표번호`) REFERENCES users(`쉼표번호`) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS email_verification (
    id              BIGINT       NOT NULL AUTO_INCREMENT PRIMARY KEY,
    `쉼표번호`      VARCHAR(12)  NOT NULL,
    token           VARCHAR(255) NOT NULL UNIQUE,
    verified        TINYINT(1)   NOT NULL DEFAULT 0,
    expires_at      DATETIME     NOT NULL,
    created_at      DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (`쉼표번호`) REFERENCES users(`쉼표번호`) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS user_settings (
    id                          BIGINT       NOT NULL AUTO_INCREMENT PRIMARY KEY,
    `쉼표번호`                  VARCHAR(12)  NOT NULL UNIQUE,
    notification_settings_json  JSON,
    theme                       VARCHAR(20)  NOT NULL DEFAULT 'light',
    smartwatch_type             VARCHAR(50),
    created_at                  DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at                  DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (`쉼표번호`) REFERENCES users(`쉼표번호`) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ============================================================
-- [B] 진단 (심박 + 설문)
-- ============================================================

CREATE TABLE IF NOT EXISTS measurement_sessions (
    id              BIGINT       NOT NULL AUTO_INCREMENT PRIMARY KEY,
    `쉼표번호`      VARCHAR(12)  NOT NULL,
    started_at      DATETIME     NOT NULL,
    ended_at        DATETIME,
    device_type     VARCHAR(50),
    reliability     DOUBLE,
    created_at      DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (`쉼표번호`) REFERENCES users(`쉼표번호`) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS heart_rate_measurements (
    id              BIGINT       NOT NULL AUTO_INCREMENT PRIMARY KEY,
    session_id      BIGINT       NOT NULL,
    `쉼표번호`      VARCHAR(12)  NOT NULL,
    bpm             INT          NOT NULL,
    hrv             DOUBLE,
    measured_at     DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_hrm_user_time (`쉼표번호`, measured_at),
    FOREIGN KEY (`쉼표번호`) REFERENCES users(`쉼표번호`) ON DELETE CASCADE,
    FOREIGN KEY (session_id) REFERENCES measurement_sessions(id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS survey_questions (
    id              BIGINT       NOT NULL AUTO_INCREMENT PRIMARY KEY,
    question_content TEXT        NOT NULL,
    category        VARCHAR(50),
    display_order   INT          NOT NULL DEFAULT 0,
    active          TINYINT(1)   NOT NULL DEFAULT 1,
    created_at      DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS survey_choices (
    id              BIGINT       NOT NULL AUTO_INCREMENT PRIMARY KEY,
    question_id     BIGINT       NOT NULL,
    choice_content  VARCHAR(255) NOT NULL,
    score           INT          NOT NULL DEFAULT 0,
    display_order   INT          NOT NULL DEFAULT 0,
    FOREIGN KEY (question_id) REFERENCES survey_questions(id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS survey_responses (
    id              BIGINT       NOT NULL AUTO_INCREMENT PRIMARY KEY,
    `쉼표번호`      VARCHAR(12)  NOT NULL,
    question_id     BIGINT       NOT NULL,
    choice_id       BIGINT       NOT NULL,
    responded_at    DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (`쉼표번호`) REFERENCES users(`쉼표번호`) ON DELETE CASCADE,
    FOREIGN KEY (question_id) REFERENCES survey_questions(id),
    FOREIGN KEY (choice_id) REFERENCES survey_choices(id)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS diagnosis_results (
    id              BIGINT       NOT NULL AUTO_INCREMENT PRIMARY KEY,
    `쉼표번호`      VARCHAR(12)  NOT NULL,
    session_id      BIGINT,
    stress_index    INT,
    primary_rest_type VARCHAR(50),
    scores_json     JSON,
    diagnosed_at    DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_dr_user (`쉼표번호`),
    FOREIGN KEY (`쉼표번호`) REFERENCES users(`쉼표번호`) ON DELETE CASCADE,
    FOREIGN KEY (session_id) REFERENCES measurement_sessions(id) ON DELETE SET NULL
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS rest_type_scores (
    id                  BIGINT   NOT NULL AUTO_INCREMENT PRIMARY KEY,
    diagnosis_result_id BIGINT   NOT NULL,
    rest_type           VARCHAR(50) NOT NULL,
    score               INT      NOT NULL,
    ranking             INT      NOT NULL,
    FOREIGN KEY (diagnosis_result_id) REFERENCES diagnosis_results(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ============================================================
-- [C] 장소/추천/지도
-- ============================================================

CREATE TABLE IF NOT EXISTS places (
    id              BIGINT       NOT NULL AUTO_INCREMENT PRIMARY KEY,
    name            VARCHAR(100) NOT NULL,
    address         VARCHAR(255) NOT NULL,
    latitude        DECIMAL(10,7) NOT NULL,
    longitude       DECIMAL(10,7) NOT NULL,
    operating_hours VARCHAR(255),
    ai_score        DOUBLE,
    status          ENUM('pending','approved','rejected') NOT NULL DEFAULT 'pending',
    created_at      DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at      DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_places_location (latitude, longitude)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS place_tags (
    id              BIGINT       NOT NULL AUTO_INCREMENT PRIMARY KEY,
    place_id        BIGINT       NOT NULL,
    tag_name        VARCHAR(50)  NOT NULL,
    rest_type       VARCHAR(50),
    FOREIGN KEY (place_id) REFERENCES places(id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS place_photos (
    id              BIGINT       NOT NULL AUTO_INCREMENT PRIMARY KEY,
    place_id        BIGINT       NOT NULL,
    photo_url       VARCHAR(512) NOT NULL,
    source          VARCHAR(100),
    created_at      DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (place_id) REFERENCES places(id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS place_reviews (
    id              BIGINT       NOT NULL AUTO_INCREMENT PRIMARY KEY,
    `쉼표번호`      VARCHAR(12)  NOT NULL,
    place_id        BIGINT       NOT NULL,
    rating          TINYINT      NOT NULL,
    content         TEXT,
    verified        TINYINT(1)   NOT NULL DEFAULT 0,
    created_at      DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (`쉼표번호`) REFERENCES users(`쉼표번호`) ON DELETE CASCADE,
    FOREIGN KEY (place_id) REFERENCES places(id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS place_bookmarks (
    id              BIGINT       NOT NULL AUTO_INCREMENT PRIMARY KEY,
    `쉼표번호`      VARCHAR(12)  NOT NULL,
    place_id        BIGINT       NOT NULL,
    created_at      DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY uq_bookmark (`쉼표번호`, place_id),
    FOREIGN KEY (`쉼표번호`) REFERENCES users(`쉼표번호`) ON DELETE CASCADE,
    FOREIGN KEY (place_id) REFERENCES places(id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS recommendations (
    id              BIGINT       NOT NULL AUTO_INCREMENT PRIMARY KEY,
    `쉼표번호`      VARCHAR(12)  NOT NULL,
    diagnosis_result_id BIGINT,
    place_id        BIGINT       NOT NULL,
    criteria        VARCHAR(100),
    clicked         TINYINT(1)   NOT NULL DEFAULT 0,
    saved           TINYINT(1)   NOT NULL DEFAULT 0,
    recommended_at  DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_rec_user (`쉼표번호`, recommended_at),
    FOREIGN KEY (`쉼표번호`) REFERENCES users(`쉼표번호`) ON DELETE CASCADE,
    FOREIGN KEY (diagnosis_result_id) REFERENCES diagnosis_results(id) ON DELETE SET NULL,
    FOREIGN KEY (place_id) REFERENCES places(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ============================================================
-- [D] 휴식 기록 (핵심 도메인)
-- ============================================================

CREATE TABLE IF NOT EXISTS rest_types (
    id              BIGINT       NOT NULL AUTO_INCREMENT PRIMARY KEY,
    type_name       VARCHAR(50)  NOT NULL UNIQUE,
    description     TEXT,
    icon            VARCHAR(100),
    color_code      VARCHAR(20)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS rest_activities (
    id              BIGINT       NOT NULL AUTO_INCREMENT PRIMARY KEY,
    rest_type_id    BIGINT       NOT NULL,
    activity_name   VARCHAR(100) NOT NULL,
    guide_content   TEXT,
    duration_minutes INT,
    FOREIGN KEY (rest_type_id) REFERENCES rest_types(id)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS rest_logs (
    id              BIGINT       NOT NULL AUTO_INCREMENT PRIMARY KEY,
    `쉼표번호`      VARCHAR(12)  NOT NULL,
    rest_type_id    BIGINT       NOT NULL,
    place_id        BIGINT,
    start_time      DATETIME     NOT NULL,
    end_time        DATETIME,
    memo            TEXT,
    emotion_before  TINYINT,
    emotion_after   TINYINT,
    mood_tags_json  VARCHAR(500),
    deleted         TINYINT(1)   NOT NULL DEFAULT 0,
    created_at      DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_rl_user_time (`쉼표번호`, start_time),
    FOREIGN KEY (`쉼표번호`) REFERENCES users(`쉼표번호`) ON DELETE CASCADE,
    FOREIGN KEY (rest_type_id) REFERENCES rest_types(id),
    FOREIGN KEY (place_id) REFERENCES places(id) ON DELETE SET NULL
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS monthly_stats (
    id                  BIGINT       NOT NULL AUTO_INCREMENT PRIMARY KEY,
    `쉼표번호`          VARCHAR(12)  NOT NULL,
    `year_month`        CHAR(7)      NOT NULL,
    total_rest_minutes  INT          NOT NULL DEFAULT 0,
    type_ratio_json     JSON,
    avg_emotion_score   DOUBLE,
    record_count        INT          NOT NULL DEFAULT 0,
    updated_at          DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY uq_stats (`쉼표번호`, `year_month`),
    FOREIGN KEY (`쉼표번호`) REFERENCES users(`쉼표번호`) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ============================================================
-- [E] 커뮤니티/챌린지 (2차 MVP)
-- ============================================================

CREATE TABLE IF NOT EXISTS posts (
    id              BIGINT       NOT NULL AUTO_INCREMENT PRIMARY KEY,
    `쉼표번호`      VARCHAR(12)  NOT NULL,
    category        VARCHAR(50),
    title           VARCHAR(200) NOT NULL,
    content         TEXT         NOT NULL,
    is_anonymous    TINYINT(1)   NOT NULL DEFAULT 0,
    status          ENUM('visible','hidden','deleted') NOT NULL DEFAULT 'visible',
    view_count      INT          NOT NULL DEFAULT 0,
    created_at      DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at      DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (`쉼표번호`) REFERENCES users(`쉼표번호`) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS comments (
    id              BIGINT       NOT NULL AUTO_INCREMENT PRIMARY KEY,
    post_id         BIGINT       NOT NULL,
    `쉼표번호`      VARCHAR(12)  NOT NULL,
    parent_id       BIGINT,
    content         TEXT         NOT NULL,
    status          ENUM('visible','hidden','deleted') NOT NULL DEFAULT 'visible',
    created_at      DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE,
    FOREIGN KEY (`쉼표번호`) REFERENCES users(`쉼표번호`) ON DELETE CASCADE,
    FOREIGN KEY (parent_id) REFERENCES comments(id) ON DELETE SET NULL
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS post_likes (
    post_id         BIGINT       NOT NULL,
    `쉼표번호`      VARCHAR(12)  NOT NULL,
    created_at      DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (post_id, `쉼표번호`),
    FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE,
    FOREIGN KEY (`쉼표번호`) REFERENCES users(`쉼표번호`) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS reports (
    id              BIGINT       NOT NULL AUTO_INCREMENT PRIMARY KEY,
    reporter_id     VARCHAR(12)  NOT NULL,
    target_type     ENUM('post','comment') NOT NULL,
    target_id       BIGINT       NOT NULL,
    reason          VARCHAR(255) NOT NULL,
    status          ENUM('pending','resolved','dismissed') NOT NULL DEFAULT 'pending',
    created_at      DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (reporter_id) REFERENCES users(`쉼표번호`) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS challenges (
    id              BIGINT       NOT NULL AUTO_INCREMENT PRIMARY KEY,
    title           VARCHAR(200) NOT NULL,
    description     TEXT,
    duration_days   INT          NOT NULL,
    auth_type       ENUM('photo','check','text') NOT NULL,
    badge_name      VARCHAR(100),
    is_active       TINYINT(1)   NOT NULL DEFAULT 1,
    created_at      DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS challenge_participants (
    id              BIGINT       NOT NULL AUTO_INCREMENT PRIMARY KEY,
    challenge_id    BIGINT       NOT NULL,
    `쉼표번호`      VARCHAR(12)  NOT NULL,
    achieved_days   INT          NOT NULL DEFAULT 0,
    status          ENUM('ongoing','completed','failed') NOT NULL DEFAULT 'ongoing',
    joined_at       DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY uq_participant (challenge_id, `쉼표번호`),
    FOREIGN KEY (challenge_id) REFERENCES challenges(id) ON DELETE CASCADE,
    FOREIGN KEY (`쉼표번호`) REFERENCES users(`쉼표번호`) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS challenge_progress (
    id              BIGINT       NOT NULL AUTO_INCREMENT PRIMARY KEY,
    participant_id  BIGINT       NOT NULL,
    photo_url       VARCHAR(512),
    memo            TEXT,
    certified_at    DATE         NOT NULL,
    UNIQUE KEY uq_daily (participant_id, certified_at),
    FOREIGN KEY (participant_id) REFERENCES challenge_participants(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ============================================================
-- [F] 관리자/운영/통계
-- ============================================================

CREATE TABLE IF NOT EXISTS audit_logs (
    id              BIGINT       NOT NULL AUTO_INCREMENT PRIMARY KEY,
    `admin_쉼표번호` VARCHAR(12) NOT NULL,
    action          VARCHAR(100) NOT NULL,
    target_type     VARCHAR(50),
    target_id       VARCHAR(100),
    performed_at    DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (`admin_쉼표번호`) REFERENCES users(`쉼표번호`)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS analytics_events (
    id              BIGINT       NOT NULL AUTO_INCREMENT PRIMARY KEY,
    `쉼표번호`      VARCHAR(12),
    event_type      VARCHAR(100) NOT NULL,
    event_data_json JSON,
    occurred_at     DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_ae_type_time (event_type, occurred_at)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS blocked_keywords (
    id              BIGINT       NOT NULL AUTO_INCREMENT PRIMARY KEY,
    keyword         VARCHAR(100) NOT NULL UNIQUE,
    active          TINYINT(1)   NOT NULL DEFAULT 1,
    created_at      DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS badges (
    id              BIGINT       NOT NULL AUTO_INCREMENT PRIMARY KEY,
    badge_name      VARCHAR(100) NOT NULL,
    description     TEXT,
    icon_url        VARCHAR(512),
    achievement_type VARCHAR(100),
    created_at      DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS user_badges (
    `쉼표번호`      VARCHAR(12)  NOT NULL,
    badge_id        BIGINT       NOT NULL,
    earned_at       DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`쉼표번호`, badge_id),
    FOREIGN KEY (`쉼표번호`) REFERENCES users(`쉼표번호`) ON DELETE CASCADE,
    FOREIGN KEY (badge_id) REFERENCES badges(id)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS notifications (
    id              BIGINT       NOT NULL AUTO_INCREMENT PRIMARY KEY,
    `쉼표번호`      VARCHAR(12)  NOT NULL,
    type            VARCHAR(50)  NOT NULL,
    title           VARCHAR(200) NOT NULL,
    content         TEXT,
    is_read         TINYINT(1)   NOT NULL DEFAULT 0,
    created_at      DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_noti_user (`쉼표번호`, is_read),
    FOREIGN KEY (`쉼표번호`) REFERENCES users(`쉼표번호`) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ============================================================
-- Seed 데이터
-- ============================================================

-- 휴식 유형 7개 (필수)
INSERT IGNORE INTO rest_types (type_name, description, icon, color_code) VALUES
('physical', '몸의 긴장을 풀고 신체를 편안하게 하는 휴식', 'fitness_center', '#EF4444'),
('mental', '생각을 비우고 마음의 평화를 찾는 휴식', 'spa', '#8B5CF6'),
('sensory', '오감을 자극하고 감각을 정화하는 휴식', 'visibility', '#F59E0B'),
('emotional', '감정을 표현하고 공감받는 휴식', 'favorite', '#EC4899'),
('social', '사람들과 함께 또는 혼자만의 시간', 'groups', '#3B82F6'),
('nature', '자연 속에서 회복하는 휴식', 'forest', '#10B981'),
('creative', '창작 활동에 몰두하며 얻는 휴식', 'brush', '#F97316');

-- 배지 5개 (필수)
INSERT IGNORE INTO badges (badge_name, description, icon_url, achievement_type) VALUES
('첫 발걸음', '첫 번째 휴식 기록을 남겼어요', '/badges/first.svg', 'first_log'),
('열 번의 쉼표', '휴식 기록 10개를 달성했어요', '/badges/ten.svg', 'total_10'),
('꾸준한 쉼표', '휴식 기록 30개를 달성했어요', '/badges/thirty.svg', 'total_30'),
('쉼표 마스터', '휴식 기록 50개를 달성했어요', '/badges/fifty.svg', 'total_50'),
('쉼표 전설', '휴식 기록 100개를 달성했어요', '/badges/hundred.svg', 'total_100');

-- 설문 질문 Seed (7개 — 각 휴식유형에 1개씩)
INSERT IGNORE INTO survey_questions (question_content, category, display_order, active) VALUES
('최근 몸이 뻣뻣하거나 근육통이 있나요?', 'physical', 1, 1),
('머리가 복잡하고 생각이 많은 편인가요?', 'mental', 2, 1),
('소음이나 밝은 빛에 예민해진 느낌이 있나요?', 'sensory', 3, 1),
('감정 기복이 심하거나 우울한 기분이 드나요?', 'emotional', 4, 1),
('사람들과의 관계에서 피로감을 느끼나요?', 'social', 5, 1),
('자연 속에서 시간을 보내고 싶은 욕구가 있나요?', 'nature', 6, 1),
('새로운 것을 만들거나 표현하고 싶은 마음이 있나요?', 'creative', 7, 1);

-- 설문 선택지 (각 질문당 4개)
INSERT IGNORE INTO survey_choices (question_id, choice_content, score, display_order) VALUES
(1, '전혀 그렇지 않다', 20, 1), (1, '약간 그렇다', 40, 2), (1, '꽤 그렇다', 70, 3), (1, '매우 그렇다', 100, 4),
(2, '전혀 그렇지 않다', 20, 1), (2, '약간 그렇다', 40, 2), (2, '꽤 그렇다', 70, 3), (2, '매우 그렇다', 100, 4),
(3, '전혀 그렇지 않다', 20, 1), (3, '약간 그렇다', 40, 2), (3, '꽤 그렇다', 70, 3), (3, '매우 그렇다', 100, 4),
(4, '전혀 그렇지 않다', 20, 1), (4, '약간 그렇다', 40, 2), (4, '꽤 그렇다', 70, 3), (4, '매우 그렇다', 100, 4),
(5, '전혀 그렇지 않다', 20, 1), (5, '약간 그렇다', 40, 2), (5, '꽤 그렇다', 70, 3), (5, '매우 그렇다', 100, 4),
(6, '전혀 그렇지 않다', 20, 1), (6, '약간 그렇다', 40, 2), (6, '꽤 그렇다', 70, 3), (6, '매우 그렇다', 100, 4),
(7, '전혀 그렇지 않다', 20, 1), (7, '약간 그렇다', 40, 2), (7, '꽤 그렇다', 70, 3), (7, '매우 그렇다', 100, 4);

-- 관리자 계정 (비밀번호: admin1234 — BCrypt 해시)
INSERT IGNORE INTO users (`쉼표번호`, email, password, nickname, status, email_verified, role) VALUES
('쉼표9001', 'admin@comma.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', '관리자', 'active', 1, 'ADMIN');

-- 테스트 사용자 (비밀번호: test1234)
INSERT IGNORE INTO users (`쉼표번호`, email, password, nickname, status, email_verified, role) VALUES
('쉼표0001', 'test@comma.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', '테스트유저', 'active', 1, 'USER');
