-- ============================================================
-- 쉼표(,) 프로젝트 DB Schema
-- MySQL 8.0 기준
-- ============================================================

CREATE DATABASE IF NOT EXISTS comma_db DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE comma_db;

-- ============================================================
-- [A] 사용자/인증
-- ============================================================

CREATE TABLE IF NOT EXISTS users (
    쉼표번호        VARCHAR(12)  NOT NULL PRIMARY KEY COMMENT '쉼표+4자리숫자 (예: 쉼표1234)',
    email           VARCHAR(100) NOT NULL UNIQUE,
    password        VARCHAR(255) NOT NULL COMMENT 'BCrypt 해시',
    nickname        VARCHAR(50)  NOT NULL,
    status          ENUM('active','dormant','banned') NOT NULL DEFAULT 'active',
    email_verified  TINYINT(1)   NOT NULL DEFAULT 0,
    role            ENUM('USER','ADMIN') NOT NULL DEFAULT 'USER',
    created_at      DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at      DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB COMMENT='회원';

CREATE TABLE IF NOT EXISTS auth_provider (
    id              BIGINT       NOT NULL AUTO_INCREMENT PRIMARY KEY,
    쉼표번호        VARCHAR(12)  NOT NULL,
    provider        ENUM('kakao','google') NOT NULL,
    provider_id     VARCHAR(100) NOT NULL,
    created_at      DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY uq_provider (provider, provider_id),
    FOREIGN KEY (쉼표번호) REFERENCES users(쉼표번호) ON DELETE CASCADE
) ENGINE=InnoDB COMMENT='소셜 로그인 제공자';

CREATE TABLE IF NOT EXISTS password_reset_token (
    id              BIGINT       NOT NULL AUTO_INCREMENT PRIMARY KEY,
    쉼표번호        VARCHAR(12)  NOT NULL,
    token           VARCHAR(255) NOT NULL UNIQUE,
    expires_at      DATETIME     NOT NULL,
    used            TINYINT(1)   NOT NULL DEFAULT 0,
    created_at      DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (쉼표번호) REFERENCES users(쉼표번호) ON DELETE CASCADE
) ENGINE=InnoDB COMMENT='비밀번호 재설정 토큰';

CREATE TABLE IF NOT EXISTS email_verification (
    id              BIGINT       NOT NULL AUTO_INCREMENT PRIMARY KEY,
    쉼표번호        VARCHAR(12)  NOT NULL,
    token           VARCHAR(255) NOT NULL UNIQUE,
    verified        TINYINT(1)   NOT NULL DEFAULT 0,
    expires_at      DATETIME     NOT NULL,
    created_at      DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (쉼표번호) REFERENCES users(쉼표번호) ON DELETE CASCADE
) ENGINE=InnoDB COMMENT='이메일 인증';

CREATE TABLE IF NOT EXISTS user_settings (
    id              BIGINT       NOT NULL AUTO_INCREMENT PRIMARY KEY,
    쉼표번호        VARCHAR(12)  NOT NULL UNIQUE,
    notification_on TINYINT(1)   NOT NULL DEFAULT 1,
    theme           ENUM('light','dark') NOT NULL DEFAULT 'light',
    created_at      DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at      DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (쉼표번호) REFERENCES users(쉼표번호) ON DELETE CASCADE
) ENGINE=InnoDB COMMENT='회원 설정';

-- ============================================================
-- [B] 진단 (심박 + 설문)
-- ============================================================

CREATE TABLE IF NOT EXISTS measurement_sessions (
    id              BIGINT       NOT NULL AUTO_INCREMENT PRIMARY KEY,
    쉼표번호        VARCHAR(12)  NOT NULL,
    device_type     VARCHAR(50)  COMMENT '스마트워치 종류 등',
    started_at      DATETIME     NOT NULL,
    ended_at        DATETIME,
    created_at      DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (쉼표번호) REFERENCES users(쉼표번호) ON DELETE CASCADE
) ENGINE=InnoDB COMMENT='심박 측정 세션';

CREATE TABLE IF NOT EXISTS heart_rate_measurements (
    id              BIGINT       NOT NULL AUTO_INCREMENT PRIMARY KEY,
    쉼표번호        VARCHAR(12)  NOT NULL,
    session_id      BIGINT       NOT NULL,
    bpm             INT          NOT NULL COMMENT '심박수',
    hrv             DECIMAL(8,2) COMMENT '심박변이도',
    reliability     DECIMAL(5,2) COMMENT '신뢰도 (0~100)',
    device          VARCHAR(50),
    measured_at     DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_hrm_user_time (쉼표번호, measured_at),
    FOREIGN KEY (쉼표번호) REFERENCES users(쉼표번호) ON DELETE CASCADE,
    FOREIGN KEY (session_id) REFERENCES measurement_sessions(id) ON DELETE CASCADE
) ENGINE=InnoDB COMMENT='심박수 원천 데이터';

CREATE TABLE IF NOT EXISTS survey_questions (
    id              BIGINT       NOT NULL AUTO_INCREMENT PRIMARY KEY,
    content         TEXT         NOT NULL,
    category        VARCHAR(50),
    sort_order      INT          NOT NULL DEFAULT 0,
    is_active       TINYINT(1)   NOT NULL DEFAULT 1,
    created_at      DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB COMMENT='설문 질문';

CREATE TABLE IF NOT EXISTS survey_choices (
    id              BIGINT       NOT NULL AUTO_INCREMENT PRIMARY KEY,
    question_id     BIGINT       NOT NULL,
    content         VARCHAR(255) NOT NULL,
    score           INT          NOT NULL DEFAULT 0,
    sort_order      INT          NOT NULL DEFAULT 0,
    FOREIGN KEY (question_id) REFERENCES survey_questions(id) ON DELETE CASCADE
) ENGINE=InnoDB COMMENT='설문 선택지';

CREATE TABLE IF NOT EXISTS survey_responses (
    id              BIGINT       NOT NULL AUTO_INCREMENT PRIMARY KEY,
    쉼표번호        VARCHAR(12)  NOT NULL,
    question_id     BIGINT       NOT NULL,
    choice_id       BIGINT       NOT NULL,
    answered_at     DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (쉼표번호) REFERENCES users(쉼표번호) ON DELETE CASCADE,
    FOREIGN KEY (question_id) REFERENCES survey_questions(id),
    FOREIGN KEY (choice_id) REFERENCES survey_choices(id)
) ENGINE=InnoDB COMMENT='설문 응답';

CREATE TABLE IF NOT EXISTS diagnosis_results (
    id              BIGINT       NOT NULL AUTO_INCREMENT PRIMARY KEY,
    쉼표번호        VARCHAR(12)  NOT NULL,
    session_id      BIGINT,
    stress_index    DECIMAL(5,2) COMMENT '스트레스 지수 (0~100)',
    primary_rest_type VARCHAR(50) COMMENT '주요 휴식 유형',
    score_json      JSON         COMMENT '유형별 점수 전체',
    basis           TEXT         COMMENT '진단 근거 설명',
    created_at      DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_dr_user (쉼표번호),
    FOREIGN KEY (쉼표번호) REFERENCES users(쉼표번호) ON DELETE CASCADE,
    FOREIGN KEY (session_id) REFERENCES measurement_sessions(id) ON DELETE SET NULL
) ENGINE=InnoDB COMMENT='진단 결과 (산출물)';

CREATE TABLE IF NOT EXISTS rest_type_scores (
    id              BIGINT       NOT NULL AUTO_INCREMENT PRIMARY KEY,
    diagnosis_id    BIGINT       NOT NULL,
    rest_type       VARCHAR(50)  NOT NULL COMMENT '신체/정신/감각/정서/사회/창조/자연',
    score           INT          NOT NULL COMMENT '0~100',
    ranking         INT          NOT NULL,
    FOREIGN KEY (diagnosis_id) REFERENCES diagnosis_results(id) ON DELETE CASCADE
) ENGINE=InnoDB COMMENT='휴식 유형별 점수';

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
    ai_score        DECIMAL(5,2) COMMENT 'AI 추천 점수',
    status          ENUM('pending','approved','rejected') NOT NULL DEFAULT 'pending',
    created_at      DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at      DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_places_location (latitude, longitude)
) ENGINE=InnoDB COMMENT='장소';

CREATE TABLE IF NOT EXISTS place_tags (
    id              BIGINT       NOT NULL AUTO_INCREMENT PRIMARY KEY,
    place_id        BIGINT       NOT NULL,
    tag_name        VARCHAR(50)  NOT NULL,
    FOREIGN KEY (place_id) REFERENCES places(id) ON DELETE CASCADE
) ENGINE=InnoDB COMMENT='장소 태그 (휴식유형 등)';

CREATE TABLE IF NOT EXISTS place_photos (
    id              BIGINT       NOT NULL AUTO_INCREMENT PRIMARY KEY,
    place_id        BIGINT       NOT NULL,
    photo_url       VARCHAR(512) NOT NULL,
    source          VARCHAR(100),
    created_at      DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (place_id) REFERENCES places(id) ON DELETE CASCADE
) ENGINE=InnoDB COMMENT='장소 사진';

CREATE TABLE IF NOT EXISTS place_reviews (
    id              BIGINT       NOT NULL AUTO_INCREMENT PRIMARY KEY,
    쉼표번호        VARCHAR(12)  NOT NULL,
    place_id        BIGINT       NOT NULL,
    rating          TINYINT      NOT NULL COMMENT '1~5',
    content         TEXT,
    is_verified     TINYINT(1)   NOT NULL DEFAULT 0,
    created_at      DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (쉼표번호) REFERENCES users(쉼표번호) ON DELETE CASCADE,
    FOREIGN KEY (place_id) REFERENCES places(id) ON DELETE CASCADE
) ENGINE=InnoDB COMMENT='장소 리뷰';

CREATE TABLE IF NOT EXISTS place_bookmarks (
    id              BIGINT       NOT NULL AUTO_INCREMENT PRIMARY KEY,
    쉼표번호        VARCHAR(12)  NOT NULL,
    place_id        BIGINT       NOT NULL,
    created_at      DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY uq_bookmark (쉼표번호, place_id),
    FOREIGN KEY (쉼표번호) REFERENCES users(쉼표번호) ON DELETE CASCADE,
    FOREIGN KEY (place_id) REFERENCES places(id) ON DELETE CASCADE
) ENGINE=InnoDB COMMENT='장소 즐겨찾기';

CREATE TABLE IF NOT EXISTS recommendations (
    id              BIGINT       NOT NULL AUTO_INCREMENT PRIMARY KEY,
    쉼표번호        VARCHAR(12)  NOT NULL,
    diagnosis_id    BIGINT,
    place_id        BIGINT       NOT NULL,
    criteria        VARCHAR(100) COMMENT '추천 기준 (유형, 거리 등)',
    is_clicked      TINYINT(1)   NOT NULL DEFAULT 0,
    is_saved        TINYINT(1)   NOT NULL DEFAULT 0,
    recommended_at  DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_rec_user (쉼표번호, recommended_at),
    FOREIGN KEY (쉼표번호) REFERENCES users(쉼표번호) ON DELETE CASCADE,
    FOREIGN KEY (diagnosis_id) REFERENCES diagnosis_results(id) ON DELETE SET NULL,
    FOREIGN KEY (place_id) REFERENCES places(id) ON DELETE CASCADE
) ENGINE=InnoDB COMMENT='추천 로그 (통계 원천)';

-- ============================================================
-- [D] 휴식 기록 (핵심 도메인)
-- ============================================================

CREATE TABLE IF NOT EXISTS rest_types (
    id              BIGINT       NOT NULL AUTO_INCREMENT PRIMARY KEY,
    type_name       VARCHAR(50)  NOT NULL UNIQUE COMMENT '신체/정신/감각/정서/사회/창조/자연',
    description     TEXT,
    icon            VARCHAR(100) COMMENT 'material-icons 이름'
) ENGINE=InnoDB COMMENT='휴식 유형 마스터';

CREATE TABLE IF NOT EXISTS rest_activities (
    id              BIGINT       NOT NULL AUTO_INCREMENT PRIMARY KEY,
    rest_type_id    BIGINT       NOT NULL,
    activity_name   VARCHAR(100) NOT NULL,
    guide_content   TEXT,
    FOREIGN KEY (rest_type_id) REFERENCES rest_types(id)
) ENGINE=InnoDB COMMENT='휴식 활동 가이드';

CREATE TABLE IF NOT EXISTS rest_logs (
    id              BIGINT       NOT NULL AUTO_INCREMENT PRIMARY KEY,
    쉼표번호        VARCHAR(12)  NOT NULL,
    rest_type_id    BIGINT       NOT NULL,
    place_id        BIGINT       COMMENT '선택적 — 장소 연결',
    started_at      DATETIME     NOT NULL,
    ended_at        DATETIME,
    memo            TEXT,
    emotion_score   TINYINT      COMMENT '감정 점수 1~10',
    mood_tags       VARCHAR(255) COMMENT '기분 태그 (JSON 배열 또는 콤마 구분)',
    is_deleted      TINYINT(1)   NOT NULL DEFAULT 0 COMMENT 'Soft delete',
    created_at      DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_rl_user_time (쉼표번호, started_at),
    FOREIGN KEY (쉼표번호) REFERENCES users(쉼표번호) ON DELETE CASCADE,
    FOREIGN KEY (rest_type_id) REFERENCES rest_types(id),
    FOREIGN KEY (place_id) REFERENCES places(id) ON DELETE SET NULL
) ENGINE=InnoDB COMMENT='휴식 기록 (핵심)';

CREATE TABLE IF NOT EXISTS monthly_stats (
    id              BIGINT       NOT NULL AUTO_INCREMENT PRIMARY KEY,
    쉼표번호        VARCHAR(12)  NOT NULL,
    `year_month`    CHAR(7)      NOT NULL COMMENT 'YYYY-MM',
    total_minutes   INT          NOT NULL DEFAULT 0 COMMENT '총 휴식 시간(분)',
    type_ratio_json JSON         COMMENT '유형별 비율',
    avg_emotion     DECIMAL(4,2) COMMENT '평균 감정 점수',
    updated_at      DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY uq_stats (쉼표번호, `year_month`),
    FOREIGN KEY (쉼표번호) REFERENCES users(쉼표번호) ON DELETE CASCADE
) ENGINE=InnoDB COMMENT='월간 통계 집계 (배치 갱신)';

-- ============================================================
-- [E] 커뮤니티/챌린지 (2차 MVP)
-- ============================================================

CREATE TABLE IF NOT EXISTS posts (
    id              BIGINT       NOT NULL AUTO_INCREMENT PRIMARY KEY,
    쉼표번호        VARCHAR(12)  NOT NULL,
    category        VARCHAR(50),
    title           VARCHAR(200) NOT NULL,
    content         TEXT         NOT NULL,
    is_anonymous    TINYINT(1)   NOT NULL DEFAULT 0,
    status          ENUM('visible','hidden','deleted') NOT NULL DEFAULT 'visible',
    view_count      INT          NOT NULL DEFAULT 0,
    created_at      DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at      DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (쉼표번호) REFERENCES users(쉼표번호) ON DELETE CASCADE
) ENGINE=InnoDB COMMENT='커뮤니티 게시글';

CREATE TABLE IF NOT EXISTS comments (
    id              BIGINT       NOT NULL AUTO_INCREMENT PRIMARY KEY,
    post_id         BIGINT       NOT NULL,
    쉼표번호        VARCHAR(12)  NOT NULL,
    parent_id       BIGINT       COMMENT '대댓글용 부모 댓글 ID',
    content         TEXT         NOT NULL,
    status          ENUM('visible','hidden','deleted') NOT NULL DEFAULT 'visible',
    created_at      DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE,
    FOREIGN KEY (쉼표번호) REFERENCES users(쉼표번호) ON DELETE CASCADE,
    FOREIGN KEY (parent_id) REFERENCES comments(id) ON DELETE SET NULL
) ENGINE=InnoDB COMMENT='댓글';

CREATE TABLE IF NOT EXISTS post_likes (
    post_id         BIGINT       NOT NULL,
    쉼표번호        VARCHAR(12)  NOT NULL,
    created_at      DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (post_id, 쉼표번호),
    FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE,
    FOREIGN KEY (쉼표번호) REFERENCES users(쉼표번호) ON DELETE CASCADE
) ENGINE=InnoDB COMMENT='게시글 공감';

CREATE TABLE IF NOT EXISTS reports (
    id              BIGINT       NOT NULL AUTO_INCREMENT PRIMARY KEY,
    reporter_id     VARCHAR(12)  NOT NULL,
    target_type     ENUM('post','comment') NOT NULL,
    target_id       BIGINT       NOT NULL,
    reason          VARCHAR(255) NOT NULL,
    status          ENUM('pending','resolved','dismissed') NOT NULL DEFAULT 'pending',
    created_at      DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (reporter_id) REFERENCES users(쉼표번호) ON DELETE CASCADE
) ENGINE=InnoDB COMMENT='신고';

CREATE TABLE IF NOT EXISTS challenges (
    id              BIGINT       NOT NULL AUTO_INCREMENT PRIMARY KEY,
    title           VARCHAR(200) NOT NULL,
    description     TEXT,
    duration_days   INT          NOT NULL,
    auth_type       ENUM('photo','check','text') NOT NULL,
    badge_name      VARCHAR(100),
    is_active       TINYINT(1)   NOT NULL DEFAULT 1,
    created_at      DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB COMMENT='챌린지';

CREATE TABLE IF NOT EXISTS challenge_participants (
    id              BIGINT       NOT NULL AUTO_INCREMENT PRIMARY KEY,
    challenge_id    BIGINT       NOT NULL,
    쉼표번호        VARCHAR(12)  NOT NULL,
    achieved_days   INT          NOT NULL DEFAULT 0,
    status          ENUM('ongoing','completed','failed') NOT NULL DEFAULT 'ongoing',
    joined_at       DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY uq_participant (challenge_id, 쉼표번호),
    FOREIGN KEY (challenge_id) REFERENCES challenges(id) ON DELETE CASCADE,
    FOREIGN KEY (쉼표번호) REFERENCES users(쉼표번호) ON DELETE CASCADE
) ENGINE=InnoDB COMMENT='챌린지 참여자';

CREATE TABLE IF NOT EXISTS challenge_progress (
    id              BIGINT       NOT NULL AUTO_INCREMENT PRIMARY KEY,
    participant_id  BIGINT       NOT NULL,
    photo_url       VARCHAR(512),
    memo            TEXT,
    certified_at    DATE         NOT NULL COMMENT '하루 1회 제한',
    UNIQUE KEY uq_daily (participant_id, certified_at),
    FOREIGN KEY (participant_id) REFERENCES challenge_participants(id) ON DELETE CASCADE
) ENGINE=InnoDB COMMENT='챌린지 인증';

-- ============================================================
-- [F] 관리자/운영/통계
-- ============================================================

CREATE TABLE IF NOT EXISTS admin_users (
    id              BIGINT       NOT NULL AUTO_INCREMENT PRIMARY KEY,
    쉼표번호        VARCHAR(12)  NOT NULL UNIQUE,
    permission_level TINYINT     NOT NULL DEFAULT 1 COMMENT '1=일반관리자, 9=슈퍼관리자',
    created_at      DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (쉼표번호) REFERENCES users(쉼표번호) ON DELETE CASCADE
) ENGINE=InnoDB COMMENT='관리자';

CREATE TABLE IF NOT EXISTS audit_logs (
    id              BIGINT       NOT NULL AUTO_INCREMENT PRIMARY KEY,
    admin_id        VARCHAR(12)  NOT NULL,
    action          VARCHAR(100) NOT NULL,
    target_type     VARCHAR(50),
    target_id       VARCHAR(100),
    performed_at    DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (admin_id) REFERENCES users(쉼표번호)
) ENGINE=InnoDB COMMENT='관리자 행위 로그';

CREATE TABLE IF NOT EXISTS analytics_events (
    id              BIGINT       NOT NULL AUTO_INCREMENT PRIMARY KEY,
    쉼표번호        VARCHAR(12),
    event_type      VARCHAR(100) NOT NULL,
    event_data      JSON,
    occurred_at     DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_ae_type_time (event_type, occurred_at)
) ENGINE=InnoDB COMMENT='분석 이벤트 로그';

CREATE TABLE IF NOT EXISTS blocked_keywords (
    id              BIGINT       NOT NULL AUTO_INCREMENT PRIMARY KEY,
    keyword         VARCHAR(100) NOT NULL UNIQUE,
    is_active       TINYINT(1)   NOT NULL DEFAULT 1,
    created_at      DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB COMMENT='차단 키워드';

CREATE TABLE IF NOT EXISTS badges (
    id              BIGINT       NOT NULL AUTO_INCREMENT PRIMARY KEY,
    badge_name      VARCHAR(100) NOT NULL,
    description     TEXT,
    icon_url        VARCHAR(512),
    condition_type  VARCHAR(100) COMMENT '달성 조건 유형',
    created_at      DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB COMMENT='배지 정의';

CREATE TABLE IF NOT EXISTS user_badges (
    쉼표번호        VARCHAR(12)  NOT NULL,
    badge_id        BIGINT       NOT NULL,
    earned_at       DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (쉼표번호, badge_id),
    FOREIGN KEY (쉼표번호) REFERENCES users(쉼표번호) ON DELETE CASCADE,
    FOREIGN KEY (badge_id) REFERENCES badges(id)
) ENGINE=InnoDB COMMENT='회원 보유 배지';

CREATE TABLE IF NOT EXISTS notifications (
    id              BIGINT       NOT NULL AUTO_INCREMENT PRIMARY KEY,
    쉼표번호        VARCHAR(12)  NOT NULL,
    type            VARCHAR(50)  NOT NULL,
    title           VARCHAR(200) NOT NULL,
    content         TEXT,
    is_read         TINYINT(1)   NOT NULL DEFAULT 0,
    created_at      DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_noti_user (쉼표번호, is_read),
    FOREIGN KEY (쉼표번호) REFERENCES users(쉼표번호) ON DELETE CASCADE
) ENGINE=InnoDB COMMENT='알림';

-- ============================================================
-- Seed 데이터 — 휴식 유형 7개 (필수)
-- ============================================================

INSERT IGNORE INTO rest_types (type_name, description, icon) VALUES
('신체적 이완', '몸의 긴장을 풀고 신체를 편안하게 하는 휴식', 'fitness_center'),
('정신적 고요', '생각을 비우고 마음의 평화를 찾는 휴식', 'spa'),
('감각의 정화', '오감을 자극하고 감각을 정화하는 휴식', 'visibility_off'),
('정서적 지지', '감정을 표현하고 공감받는 휴식', 'favorite_border'),
('사회적 휴식', '혼자만의 시간으로 에너지를 충전하는 휴식', 'groups'),
('창조적 몰입', '창작 활동에 몰두하며 얻는 휴식', 'brush'),
('자연의 연결', '자연 속에서 회복하는 휴식', 'forest');
