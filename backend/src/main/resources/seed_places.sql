-- ============================================================
-- 쉼표(,) 장소 Seed 데이터 — 서울 실제 장소 25개
-- 실행 순서: schema.sql → seed_data.sql → seed_places.sql
-- ============================================================
USE comma_db;

-- ============================================================
-- [1] places — 25개 (status='approved')
-- ============================================================
INSERT INTO places (name, address, latitude, longitude, operating_hours, ai_score, status) VALUES

-- 🌿 자연과의 연결 (nature) ——————————————————————————
('서울숲',              '서울 성동구 뚝섬로 273',          37.5443097, 127.0374612, '상시 개방',                          92.5, 'approved'),
('여의도 한강공원',      '서울 영등포구 여의동로 330',       37.5284174, 126.9326004, '상시 개방',                          90.0, 'approved'),
('북한산 둘레길',        '서울 강북구 삼양로173길 99',       37.6595180, 126.9779300, '05:00~21:00',                        94.0, 'approved'),
('경의선 숲길',          '서울 마포구 와우산로 94',          37.5566000, 126.9241000, '상시 개방',                          88.5, 'approved'),
('청계천 산책로',        '서울 종로구 청계천로 40',          37.5698000, 126.9783000, '상시 개방 (야간 조명 22:00까지)',     87.0, 'approved'),

-- 🧘 신체적 이완 / 정신적 고요 ——————————————————————
('꿈마루 한강 요가원',   '서울 마포구 마포대로 155',         37.5470000, 126.9462000, '07:00~22:00',                        89.0, 'approved'),
('마음챙김 명상 스튜디오','서울 강남구 테헤란로 82',         37.4985000, 127.0286000, '09:00~21:00 (일요일 휴무)',           91.5, 'approved'),
('필라테스 홈트 스튜디오','서울 서초구 강남대로 479',        37.4966000, 127.0278000, '07:00~22:00',                        85.0, 'approved'),
('한강 노을공원',        '서울 마포구 하늘공원로 95',        37.5666000, 126.8986000, '상시 개방 (일몰 명소)',               93.0, 'approved'),
('낙산공원',             '서울 종로구 낙산길 41',            37.5813000, 127.0063000, '상시 개방 (야경 명소)',               88.0, 'approved'),

-- ☕ 감각의 정화 / 정신적 고요 (카페·독서) ——————————
('어반플레이 카페',      '서울 마포구 성미산로29길 34',      37.5596000, 126.9256000, '11:00~22:00',                        86.5, 'approved'),
('북바이북 독서 카페',   '서울 종로구 율곡로 83',            37.5741000, 126.9946000, '10:00~22:00',                        90.0, 'approved'),
('힐링 사운드 카페',     '서울 용산구 이태원로 240',         37.5357000, 126.9943000, '12:00~23:00',                        87.5, 'approved'),
('무인 조용한 카페',     '서울 성동구 서울숲2길 32',         37.5448000, 127.0421000, '09:00~21:00',                        84.0, 'approved'),

-- 💜 정서적 지지 / 창조적 몰입 ——————————————————————
('국립현대미술관 서울관','서울 종로구 삼청로 30',            37.5791000, 126.9796000, '10:00~18:00 (월요일 휴관)',           92.0, 'approved'),
('서울시립미술관',       '서울 중구 덕수궁길 61',            37.5648000, 126.9752000, '10:00~20:00 (월요일 휴관)',           91.0, 'approved'),
('아크앤북 성수',        '서울 성동구 왕십리로 83-21',       37.5446000, 127.0556000, '10:00~22:00',                        88.0, 'approved'),
('도예 공방 흙이야기',   '서울 마포구 홍익로6길 38',         37.5538000, 126.9241000, '10:00~20:00 (화요일 휴무)',           83.5, 'approved'),
('원데이 드로잉 클래스', '서울 강남구 압구정로 42길 10',     37.5278000, 127.0290000, '11:00~20:00 (사전예약 필수)',         85.5, 'approved'),

-- 👥 사회적 휴식 ——————————————————————————————————
('보드게임 카페 피스',   '서울 광진구 능동로 209',          37.5408000, 127.0705000, '12:00~02:00',                        82.0, 'approved'),
('공유 라운지 헤이그라운드','서울 성동구 뚝섬로 1길 49',    37.5441000, 127.0460000, '09:00~22:00',                        87.0, 'approved'),
('익선동 한옥 카페거리',  '서울 종로구 익선동 166',          37.5743000, 126.9983000, '11:00~22:00',                        89.5, 'approved'),

-- 🛁 신체적 이완 (스파·찜질) ——————————————————————
('용산 드래곤힐스파',    '서울 용산구 한강대로 95',          37.5302000, 126.9644000, '06:00~02:00 (연중무휴)',              88.5, 'approved'),
('워커힐 아쿠아월드',    '서울 광진구 광나루로 177',         37.5476000, 127.1002000, '09:00~20:00',                        86.0, 'approved'),
('한강 수영장 뚝섬',     '서울 광진구 강변북로 139',         37.5384000, 127.0737000, '09:00~18:00 (7~8월 운영)',            84.5, 'approved');


-- ============================================================
-- [2] place_tags — 각 장소에 휴식유형 + 키워드 태그
-- ============================================================

-- 서울숲 (id=1)
INSERT INTO place_tags (place_id, tag_name, rest_type) VALUES
(1, '공원', 'nature'), (1, '산책', 'nature'), (1, '피크닉', 'physical');

-- 여의도 한강공원 (id=2)
INSERT INTO place_tags (place_id, tag_name, rest_type) VALUES
(2, '한강', 'nature'), (2, '자전거', 'physical'), (2, '야경', 'sensory');

-- 북한산 둘레길 (id=3)
INSERT INTO place_tags (place_id, tag_name, rest_type) VALUES
(3, '등산', 'nature'), (3, '트레킹', 'physical'), (3, '숲길', 'nature');

-- 경의선 숲길 (id=4)
INSERT INTO place_tags (place_id, tag_name, rest_type) VALUES
(4, '산책', 'nature'), (4, '홍대', 'social'), (4, '공원', 'nature');

-- 청계천 산책로 (id=5)
INSERT INTO place_tags (place_id, tag_name, rest_type) VALUES
(5, '도심', 'nature'), (5, '산책', 'nature'), (5, '야경', 'sensory');

-- 요가원 (id=6)
INSERT INTO place_tags (place_id, tag_name, rest_type) VALUES
(6, '요가', 'physical'), (6, '스트레칭', 'physical'), (6, '명상', 'mental');

-- 명상 스튜디오 (id=7)
INSERT INTO place_tags (place_id, tag_name, rest_type) VALUES
(7, '명상', 'mental'), (7, '마음챙김', 'mental'), (7, '호흡', 'mental');

-- 필라테스 (id=8)
INSERT INTO place_tags (place_id, tag_name, rest_type) VALUES
(8, '필라테스', 'physical'), (8, '코어', 'physical'), (8, '이완', 'physical');

-- 노을공원 (id=9)
INSERT INTO place_tags (place_id, tag_name, rest_type) VALUES
(9, '일몰', 'sensory'), (9, '산책', 'nature'), (9, '캠핑', 'nature');

-- 낙산공원 (id=10)
INSERT INTO place_tags (place_id, tag_name, rest_type) VALUES
(10, '야경', 'sensory'), (10, '산책', 'nature'), (10, '성곽길', 'nature');

-- 어반플레이 카페 (id=11)
INSERT INTO place_tags (place_id, tag_name, rest_type) VALUES
(11, '카페', 'sensory'), (11, '조용함', 'mental'), (11, '독서', 'mental');

-- 북바이북 (id=12)
INSERT INTO place_tags (place_id, tag_name, rest_type) VALUES
(12, '독서카페', 'sensory'), (12, '책', 'mental'), (12, '조용함', 'mental');

-- 힐링 사운드 카페 (id=13)
INSERT INTO place_tags (place_id, tag_name, rest_type) VALUES
(13, '음악', 'emotional'), (13, '감성', 'emotional'), (13, '카페', 'sensory');

-- 무인 조용한 카페 (id=14)
INSERT INTO place_tags (place_id, tag_name, rest_type) VALUES
(14, '무인카페', 'sensory'), (14, '조용함', 'mental'), (14, '디지털디톡스', 'sensory');

-- 국립현대미술관 (id=15)
INSERT INTO place_tags (place_id, tag_name, rest_type) VALUES
(15, '미술관', 'creative'), (15, '문화', 'creative'), (15, '전시', 'creative');

-- 서울시립미술관 (id=16)
INSERT INTO place_tags (place_id, tag_name, rest_type) VALUES
(16, '미술관', 'creative'), (16, '전시', 'creative'), (16, '예술', 'creative');

-- 아크앤북 성수 (id=17)
INSERT INTO place_tags (place_id, tag_name, rest_type) VALUES
(17, '복합문화공간', 'creative'), (17, '책', 'mental'), (17, '성수', 'social');

-- 도예 공방 (id=18)
INSERT INTO place_tags (place_id, tag_name, rest_type) VALUES
(18, '도예', 'creative'), (18, '공방', 'creative'), (18, '만들기', 'creative');

-- 드로잉 클래스 (id=19)
INSERT INTO place_tags (place_id, tag_name, rest_type) VALUES
(19, '그림', 'creative'), (19, '클래스', 'creative'), (19, '원데이', 'creative');

-- 보드게임 카페 (id=20)
INSERT INTO place_tags (place_id, tag_name, rest_type) VALUES
(20, '보드게임', 'social'), (20, '놀이', 'social'), (20, '모임', 'social');

-- 헤이그라운드 (id=21)
INSERT INTO place_tags (place_id, tag_name, rest_type) VALUES
(21, '공유공간', 'social'), (21, '코워킹', 'social'), (21, '라운지', 'mental');

-- 익선동 (id=22)
INSERT INTO place_tags (place_id, tag_name, rest_type) VALUES
(22, '한옥', 'sensory'), (22, '골목', 'sensory'), (22, '감성', 'emotional');

-- 드래곤힐스파 (id=23)
INSERT INTO place_tags (place_id, tag_name, rest_type) VALUES
(23, '찜질방', 'physical'), (23, '스파', 'physical'), (23, '사우나', 'physical');

-- 아쿠아월드 (id=24)
INSERT INTO place_tags (place_id, tag_name, rest_type) VALUES
(24, '수영', 'physical'), (24, '워터파크', 'physical'), (24, '물놀이', 'social');

-- 뚝섬 수영장 (id=25)
INSERT INTO place_tags (place_id, tag_name, rest_type) VALUES
(25, '야외수영장', 'physical'), (25, '한강', 'nature'), (25, '여름', 'physical');
