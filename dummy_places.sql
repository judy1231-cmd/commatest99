-- 휴식 유형별 더미 장소 데이터 (타입별 10개, 총 70개)
-- 실행 전: rest_types 테이블에서 각 유형의 id 확인 필요
-- 사용법: mysql -h 34.64.92.18 -u commatest -p comma_db < dummy_places.sql

SET NAMES utf8mb4;
SET CHARACTER SET utf8mb4;

-- ─────────────────────────────────────────────
-- 1. 신체적 이완 (physical)
-- ─────────────────────────────────────────────
INSERT INTO places (name, address, latitude, longitude, operating_hours, ai_score, status) VALUES
('한강 반포 수영장', '서울 서초구 반포동 한강공원 내', 37.5112, 126.9947, '06:00-21:00 (매주 월요일 휴무)', 88, 'approved'),
('스파 레이', '서울 마포구 합정동 92-5', 37.5494, 126.9109, '10:00-22:00 (연중무휴)', 85, 'approved'),
('올림픽 공원 산책로', '서울 송파구 방이동 88-2', 37.5218, 127.1220, '05:00-22:00 (연중무휴)', 90, 'approved'),
('북한산 둘레길 진입로', '서울 강북구 우이동 산 1-1', 37.6576, 127.0143, '일출-일몰 (연중무휴)', 92, 'approved'),
('서울숲 피크닉장', '서울 성동구 뚝섬로 273', 37.5444, 127.0370, '06:00-22:00 (연중무휴)', 87, 'approved'),
('국립중앙의료원 헬스케어센터', '서울 중구 을지로 245', 37.5640, 127.0064, '09:00-18:00 (주말 휴무)', 80, 'approved'),
('홍제천 유수지 산책로', '서울 서대문구 홍제천 일대', 37.5833, 126.9381, '24시간 (연중무휴)', 83, 'approved'),
('양재 시민의 숲', '서울 서초구 양재동 229', 37.4693, 127.0422, '06:00-22:00 (연중무휴)', 86, 'approved'),
('응봉산 팔각정', '서울 성동구 응봉동 산 1', 37.5479, 127.0299, '06:00-20:00 (연중무휴)', 84, 'approved'),
('삼성동 코엑스 아쿠아리움', '서울 강남구 영동대로 513', 37.5115, 127.0592, '10:00-20:00 (연중무휴)', 82, 'approved');

INSERT INTO place_tags (place_id, tag_name, rest_type)
SELECT id, '스트레칭', 'physical' FROM places WHERE name = '한강 반포 수영장' AND address LIKE '%반포동%';
INSERT INTO place_tags (place_id, tag_name, rest_type)
SELECT id, '수영', 'physical' FROM places WHERE name = '한강 반포 수영장' AND address LIKE '%반포동%';
INSERT INTO place_tags (place_id, tag_name, rest_type)
SELECT id, '스파', 'physical' FROM places WHERE name = '스파 레이';
INSERT INTO place_tags (place_id, tag_name, rest_type)
SELECT id, '마사지', 'physical' FROM places WHERE name = '스파 레이';
INSERT INTO place_tags (place_id, tag_name, rest_type)
SELECT id, '산책', 'physical' FROM places WHERE name = '올림픽 공원 산책로';
INSERT INTO place_tags (place_id, tag_name, rest_type)
SELECT id, '운동', 'physical' FROM places WHERE name = '올림픽 공원 산책로';
INSERT INTO place_tags (place_id, tag_name, rest_type)
SELECT id, '등산', 'physical' FROM places WHERE name = '북한산 둘레길 진입로';
INSERT INTO place_tags (place_id, tag_name, rest_type)
SELECT id, '트레킹', 'physical' FROM places WHERE name = '북한산 둘레길 진입로';
INSERT INTO place_tags (place_id, tag_name, rest_type)
SELECT id, '피크닉', 'physical' FROM places WHERE name = '서울숲 피크닉장';
INSERT INTO place_tags (place_id, tag_name, rest_type)
SELECT id, '산책', 'physical' FROM places WHERE name = '서울숲 피크닉장';
INSERT INTO place_tags (place_id, tag_name, rest_type)
SELECT id, '헬스케어', 'physical' FROM places WHERE name = '국립중앙의료원 헬스케어센터';
INSERT INTO place_tags (place_id, tag_name, rest_type)
SELECT id, '산책', 'physical' FROM places WHERE name = '홍제천 유수지 산책로';
INSERT INTO place_tags (place_id, tag_name, rest_type)
SELECT id, '조깅', 'physical' FROM places WHERE name = '홍제천 유수지 산책로';
INSERT INTO place_tags (place_id, tag_name, rest_type)
SELECT id, '피크닉', 'physical' FROM places WHERE name = '양재 시민의 숲';
INSERT INTO place_tags (place_id, tag_name, rest_type)
SELECT id, '산책', 'physical' FROM places WHERE name = '양재 시민의 숲';
INSERT INTO place_tags (place_id, tag_name, rest_type)
SELECT id, '산책', 'physical' FROM places WHERE name = '응봉산 팔각정';
INSERT INTO place_tags (place_id, tag_name, rest_type)
SELECT id, '전망', 'physical' FROM places WHERE name = '응봉산 팔각정';
INSERT INTO place_tags (place_id, tag_name, rest_type)
SELECT id, '관람', 'physical' FROM places WHERE name = '삼성동 코엑스 아쿠아리움';

-- ─────────────────────────────────────────────
-- 2. 정신적 고요 (mental)
-- ─────────────────────────────────────────────
INSERT INTO places (name, address, latitude, longitude, operating_hours, ai_score, status) VALUES
('국립중앙도서관 열람실', '서울 서초구 반포대로 201', 37.4945, 127.0043, '09:00-18:00 (월요일 휴무)', 91, 'approved'),
('경복궁 경회루 연못가', '서울 종로구 사직로 161', 37.5796, 126.9770, '09:00-18:00 (화요일 휴무)', 93, 'approved'),
('조계사 경내', '서울 종로구 우정국로 55', 37.5742, 126.9819, '04:00-21:00 (연중무휴)', 89, 'approved'),
('선정릉 역사공원', '서울 강남구 선릉로 100길 1', 37.5103, 127.0491, '09:00-21:00 (월요일 휴무)', 88, 'approved'),
('북촌한옥마을 산책로', '서울 종로구 북촌로 일대', 37.5826, 126.9833, '24시간 (연중무휴)', 87, 'approved'),
('창경궁 연지', '서울 종로구 창경궁로 185', 37.5789, 126.9952, '09:00-18:00 (월요일 휴무)', 90, 'approved'),
('서울도서관 정독 열람실', '서울 종로구 새문안로 55', 37.5668, 126.9769, '09:00-22:00 (연중무휴)', 85, 'approved'),
('성북동 길상사', '서울 성북구 선잠로5길 68', 37.5982, 127.0035, '07:00-19:00 (연중무휴)', 92, 'approved'),
('홍릉 산림과학관 숲길', '서울 동대문구 회기로 57', 37.5921, 127.0537, '09:00-18:00 (월요일 휴무)', 84, 'approved'),
('낙산공원 야경 벤치', '서울 종로구 낙산길 41', 37.5806, 127.0058, '24시간 (연중무휴)', 86, 'approved');

INSERT INTO place_tags (place_id, tag_name, rest_type) SELECT id, '독서', 'mental' FROM places WHERE name = '국립중앙도서관 열람실';
INSERT INTO place_tags (place_id, tag_name, rest_type) SELECT id, '집중', 'mental' FROM places WHERE name = '국립중앙도서관 열람실';
INSERT INTO place_tags (place_id, tag_name, rest_type) SELECT id, '사색', 'mental' FROM places WHERE name = '경복궁 경회루 연못가';
INSERT INTO place_tags (place_id, tag_name, rest_type) SELECT id, '역사', 'mental' FROM places WHERE name = '경복궁 경회루 연못가';
INSERT INTO place_tags (place_id, tag_name, rest_type) SELECT id, '명상', 'mental' FROM places WHERE name = '조계사 경내';
INSERT INTO place_tags (place_id, tag_name, rest_type) SELECT id, '사찰', 'mental' FROM places WHERE name = '조계사 경내';
INSERT INTO place_tags (place_id, tag_name, rest_type) SELECT id, '사색', 'mental' FROM places WHERE name = '선정릉 역사공원';
INSERT INTO place_tags (place_id, tag_name, rest_type) SELECT id, '산책', 'mental' FROM places WHERE name = '선정릉 역사공원';
INSERT INTO place_tags (place_id, tag_name, rest_type) SELECT id, '산책', 'mental' FROM places WHERE name = '북촌한옥마을 산책로';
INSERT INTO place_tags (place_id, tag_name, rest_type) SELECT id, '전통', 'mental' FROM places WHERE name = '북촌한옥마을 산책로';
INSERT INTO place_tags (place_id, tag_name, rest_type) SELECT id, '사색', 'mental' FROM places WHERE name = '창경궁 연지';
INSERT INTO place_tags (place_id, tag_name, rest_type) SELECT id, '독서', 'mental' FROM places WHERE name = '서울도서관 정독 열람실';
INSERT INTO place_tags (place_id, tag_name, rest_type) SELECT id, '명상', 'mental' FROM places WHERE name = '성북동 길상사';
INSERT INTO place_tags (place_id, tag_name, rest_type) SELECT id, '사찰', 'mental' FROM places WHERE name = '성북동 길상사';
INSERT INTO place_tags (place_id, tag_name, rest_type) SELECT id, '산책', 'mental' FROM places WHERE name = '홍릉 산림과학관 숲길';
INSERT INTO place_tags (place_id, tag_name, rest_type) SELECT id, '사색', 'mental' FROM places WHERE name = '낙산공원 야경 벤치';

-- ─────────────────────────────────────────────
-- 3. 감각의 정화 (sensory)
-- ─────────────────────────────────────────────
INSERT INTO places (name, address, latitude, longitude, operating_hours, ai_score, status) VALUES
('국립현대미술관 서울관', '서울 종로구 삼청로 30', 37.5793, 126.9810, '10:00-18:00 (월요일 휴무)', 92, 'approved'),
('예술의 전당 음악분수', '서울 서초구 남부순환로 2406', 37.4787, 127.0134, '10:00-21:00 (월요일 휴무)', 90, 'approved'),
('마포 아리수공원 사운드가든', '서울 마포구 마포대로 195', 37.5488, 121.9080, '09:00-22:00 (연중무휴)', 83, 'approved'),
('성수동 카페거리 감성카페', '서울 성동구 성수이로7길 21', 37.5444, 127.0560, '10:00-22:00 (연중무휴)', 88, 'approved'),
('인사동 전통찻집 거리', '서울 종로구 인사동길 일대', 37.5742, 126.9850, '10:00-20:00 (연중무휴)', 87, 'approved'),
('DDP 디자인 플라자 야경', '서울 중구 을지로 281', 37.5669, 127.0093, '10:00-22:00 (연중무휴)', 89, 'approved'),
('북서울꿈의숲 아트갤러리', '서울 강북구 월계로 173', 37.6231, 127.0445, '10:00-18:00 (월요일 휴무)', 85, 'approved'),
('서촌 한옥 카페 거리', '서울 종로구 자하문로7길 일대', 37.5780, 126.9716, '10:00-20:00 (연중무휴)', 86, 'approved'),
('국립민속박물관 야외전시', '서울 종로구 삼청로 37', 37.5827, 126.9796, '09:00-18:00 (화요일 휴무)', 84, 'approved'),
('해방촌 아트스페이스', '서울 용산구 신흥로 70', 37.5474, 126.9877, '12:00-20:00 (월요일 휴무)', 81, 'approved');

INSERT INTO place_tags (place_id, tag_name, rest_type) SELECT id, '미술관', 'sensory' FROM places WHERE name = '국립현대미술관 서울관';
INSERT INTO place_tags (place_id, tag_name, rest_type) SELECT id, '전시', 'sensory' FROM places WHERE name = '국립현대미술관 서울관';
INSERT INTO place_tags (place_id, tag_name, rest_type) SELECT id, '음악', 'sensory' FROM places WHERE name = '예술의 전당 음악분수';
INSERT INTO place_tags (place_id, tag_name, rest_type) SELECT id, '공연', 'sensory' FROM places WHERE name = '예술의 전당 음악분수';
INSERT INTO place_tags (place_id, tag_name, rest_type) SELECT id, '음악', 'sensory' FROM places WHERE name = '마포 아리수공원 사운드가든';
INSERT INTO place_tags (place_id, tag_name, rest_type) SELECT id, '카페', 'sensory' FROM places WHERE name = '성수동 카페거리 감성카페';
INSERT INTO place_tags (place_id, tag_name, rest_type) SELECT id, '감성', 'sensory' FROM places WHERE name = '성수동 카페거리 감성카페';
INSERT INTO place_tags (place_id, tag_name, rest_type) SELECT id, '차', 'sensory' FROM places WHERE name = '인사동 전통찻집 거리';
INSERT INTO place_tags (place_id, tag_name, rest_type) SELECT id, '전통', 'sensory' FROM places WHERE name = '인사동 전통찻집 거리';
INSERT INTO place_tags (place_id, tag_name, rest_type) SELECT id, '야경', 'sensory' FROM places WHERE name = 'DDP 디자인 플라자 야경';
INSERT INTO place_tags (place_id, tag_name, rest_type) SELECT id, '전시', 'sensory' FROM places WHERE name = 'DDP 디자인 플라자 야경';
INSERT INTO place_tags (place_id, tag_name, rest_type) SELECT id, '미술관', 'sensory' FROM places WHERE name = '북서울꿈의숲 아트갤러리';
INSERT INTO place_tags (place_id, tag_name, rest_type) SELECT id, '카페', 'sensory' FROM places WHERE name = '서촌 한옥 카페 거리';
INSERT INTO place_tags (place_id, tag_name, rest_type) SELECT id, '전통', 'sensory' FROM places WHERE name = '서촌 한옥 카페 거리';
INSERT INTO place_tags (place_id, tag_name, rest_type) SELECT id, '전시', 'sensory' FROM places WHERE name = '국립민속박물관 야외전시';
INSERT INTO place_tags (place_id, tag_name, rest_type) SELECT id, '갤러리', 'sensory' FROM places WHERE name = '해방촌 아트스페이스';

-- ─────────────────────────────────────────────
-- 4. 정서적 지지 (emotional)
-- ─────────────────────────────────────────────
INSERT INTO places (name, address, latitude, longitude, operating_hours, ai_score, status) VALUES
('마포 홍대 감성 서점 유어마인드', '서울 마포구 잔다리로 50', 37.5494, 126.9183, '13:00-21:00 (월화 휴무)', 88, 'approved'),
('이태원 반려동물 카페 멍냥이', '서울 용산구 이태원로 27길 25', 37.5344, 126.9944, '11:00-21:00 (수요일 휴무)', 86, 'approved'),
('청계천 광장 벤치', '서울 종로구 청계천로 일대', 37.5695, 126.9784, '24시간 (연중무휴)', 83, 'approved'),
('서대문 독립공원 기념비 앞', '서울 서대문구 통일로 251', 37.5739, 126.9585, '09:00-18:00 (연중무휴)', 82, 'approved'),
('낙원상가 뒤편 노을 포장마차', '서울 종로구 낙원동 283', 37.5718, 126.9847, '17:00-23:00 (연중무휴)', 80, 'approved'),
('종로 3가 피맛골 골목', '서울 종로구 종로 일대', 37.5704, 126.9823, '11:00-22:00 (연중무휴)', 81, 'approved'),
('마로니에 공원 야외무대', '서울 종로구 대학로 104', 37.5822, 127.0025, '24시간 (연중무휴)', 85, 'approved'),
('남산 팔각광장 야경 포인트', '서울 중구 남산공원길 105', 37.5511, 126.9878, '24시간 (연중무휴)', 90, 'approved'),
('합정동 당인리 문화창작발전소', '서울 마포구 당인리길 58', 37.5513, 126.9234, '10:00-20:00 (월요일 휴무)', 84, 'approved'),
('은평구 진관사 연꽃길', '서울 은평구 진관길 73', 37.6378, 126.9370, '07:00-19:00 (연중무휴)', 87, 'approved');

INSERT INTO place_tags (place_id, tag_name, rest_type) SELECT id, '독서', 'emotional' FROM places WHERE name = '마포 홍대 감성 서점 유어마인드';
INSERT INTO place_tags (place_id, tag_name, rest_type) SELECT id, '치유', 'emotional' FROM places WHERE name = '마포 홍대 감성 서점 유어마인드';
INSERT INTO place_tags (place_id, tag_name, rest_type) SELECT id, '반려동물', 'emotional' FROM places WHERE name = '이태원 반려동물 카페 멍냥이';
INSERT INTO place_tags (place_id, tag_name, rest_type) SELECT id, '치유', 'emotional' FROM places WHERE name = '이태원 반려동물 카페 멍냥이';
INSERT INTO place_tags (place_id, tag_name, rest_type) SELECT id, '산책', 'emotional' FROM places WHERE name = '청계천 광장 벤치';
INSERT INTO place_tags (place_id, tag_name, rest_type) SELECT id, '힐링', 'emotional' FROM places WHERE name = '청계천 광장 벤치';
INSERT INTO place_tags (place_id, tag_name, rest_type) SELECT id, '사색', 'emotional' FROM places WHERE name = '서대문 독립공원 기념비 앞';
INSERT INTO place_tags (place_id, tag_name, rest_type) SELECT id, '감성', 'emotional' FROM places WHERE name = '낙원상가 뒤편 노을 포장마차';
INSERT INTO place_tags (place_id, tag_name, rest_type) SELECT id, '음식', 'emotional' FROM places WHERE name = '종로 3가 피맛골 골목';
INSERT INTO place_tags (place_id, tag_name, rest_type) SELECT id, '공연', 'emotional' FROM places WHERE name = '마로니에 공원 야외무대';
INSERT INTO place_tags (place_id, tag_name, rest_type) SELECT id, '야경', 'emotional' FROM places WHERE name = '남산 팔각광장 야경 포인트';
INSERT INTO place_tags (place_id, tag_name, rest_type) SELECT id, '힐링', 'emotional' FROM places WHERE name = '남산 팔각광장 야경 포인트';
INSERT INTO place_tags (place_id, tag_name, rest_type) SELECT id, '문화', 'emotional' FROM places WHERE name = '합정동 당인리 문화창작발전소';
INSERT INTO place_tags (place_id, tag_name, rest_type) SELECT id, '힐링', 'emotional' FROM places WHERE name = '은평구 진관사 연꽃길';
INSERT INTO place_tags (place_id, tag_name, rest_type) SELECT id, '사찰', 'emotional' FROM places WHERE name = '은평구 진관사 연꽃길';

-- ─────────────────────────────────────────────
-- 5. 사회적 휴식 (social)
-- ─────────────────────────────────────────────
INSERT INTO places (name, address, latitude, longitude, operating_hours, ai_score, status) VALUES
('신촌 보드게임카페 주사위', '서울 서대문구 신촌로 83', 37.5552, 126.9370, '12:00-02:00 (연중무휴)', 84, 'approved'),
('홍대 라이브클럽 FF', '서울 마포구 와우산로 25', 37.5517, 126.9225, '19:00-02:00 (월화 휴무)', 82, 'approved'),
('서울 이노베이션 팝업 스토어', '서울 강남구 강남대로 390', 37.5030, 127.0249, '10:00-20:00 (연중무휴)', 80, 'approved'),
('한강 뚝섬 바베큐장', '서울 광진구 능동로 68', 37.5301, 127.0648, '09:00-22:00 (연중무휴)', 88, 'approved'),
('이태원 루프탑 바', '서울 용산구 이태원로 177', 37.5344, 126.9944, '16:00-01:00 (연중무휴)', 83, 'approved'),
('코엑스 컨퍼런스 라운지', '서울 강남구 봉은사로 524', 37.5115, 127.0593, '09:00-20:00 (주말 휴무)', 79, 'approved'),
('연남동 산책로 피크닉존', '서울 마포구 연남동 일대', 37.5615, 126.9234, '24시간 (연중무휴)', 86, 'approved'),
('강남 스타필드 코엑스몰 별마당 도서관', '서울 강남구 영동대로 513', 37.5115, 127.0592, '10:00-22:00 (연중무휴)', 90, 'approved'),
('한강 여의도 치맥존', '서울 영등포구 여의동 한강공원', 37.5284, 126.9342, '10:00-22:00 (연중무휴)', 87, 'approved'),
('망원동 루프탑 카페', '서울 마포구 망원동 418', 37.5553, 126.9103, '11:00-23:00 (연중무휴)', 85, 'approved');

INSERT INTO place_tags (place_id, tag_name, rest_type) SELECT id, '보드게임', 'social' FROM places WHERE name = '신촌 보드게임카페 주사위';
INSERT INTO place_tags (place_id, tag_name, rest_type) SELECT id, '모임', 'social' FROM places WHERE name = '신촌 보드게임카페 주사위';
INSERT INTO place_tags (place_id, tag_name, rest_type) SELECT id, '음악', 'social' FROM places WHERE name = '홍대 라이브클럽 FF';
INSERT INTO place_tags (place_id, tag_name, rest_type) SELECT id, '공연', 'social' FROM places WHERE name = '홍대 라이브클럽 FF';
INSERT INTO place_tags (place_id, tag_name, rest_type) SELECT id, '쇼핑', 'social' FROM places WHERE name = '서울 이노베이션 팝업 스토어';
INSERT INTO place_tags (place_id, tag_name, rest_type) SELECT id, '바베큐', 'social' FROM places WHERE name = '한강 뚝섬 바베큐장';
INSERT INTO place_tags (place_id, tag_name, rest_type) SELECT id, '모임', 'social' FROM places WHERE name = '한강 뚝섬 바베큐장';
INSERT INTO place_tags (place_id, tag_name, rest_type) SELECT id, '야경', 'social' FROM places WHERE name = '이태원 루프탑 바';
INSERT INTO place_tags (place_id, tag_name, rest_type) SELECT id, '모임', 'social' FROM places WHERE name = '이태원 루프탑 바';
INSERT INTO place_tags (place_id, tag_name, rest_type) SELECT id, '네트워킹', 'social' FROM places WHERE name = '코엑스 컨퍼런스 라운지';
INSERT INTO place_tags (place_id, tag_name, rest_type) SELECT id, '피크닉', 'social' FROM places WHERE name = '연남동 산책로 피크닉존';
INSERT INTO place_tags (place_id, tag_name, rest_type) SELECT id, '모임', 'social' FROM places WHERE name = '연남동 산책로 피크닉존';
INSERT INTO place_tags (place_id, tag_name, rest_type) SELECT id, '독서', 'social' FROM places WHERE name = '강남 스타필드 코엑스몰 별마당 도서관';
INSERT INTO place_tags (place_id, tag_name, rest_type) SELECT id, '모임', 'social' FROM places WHERE name = '강남 스타필드 코엑스몰 별마당 도서관';
INSERT INTO place_tags (place_id, tag_name, rest_type) SELECT id, '치맥', 'social' FROM places WHERE name = '한강 여의도 치맥존';
INSERT INTO place_tags (place_id, tag_name, rest_type) SELECT id, '모임', 'social' FROM places WHERE name = '한강 여의도 치맥존';
INSERT INTO place_tags (place_id, tag_name, rest_type) SELECT id, '카페', 'social' FROM places WHERE name = '망원동 루프탑 카페';
INSERT INTO place_tags (place_id, tag_name, rest_type) SELECT id, '야경', 'social' FROM places WHERE name = '망원동 루프탑 카페';

-- ─────────────────────────────────────────────
-- 6. 자연의 연결 (nature)
-- ─────────────────────────────────────────────
INSERT INTO places (name, address, latitude, longitude, operating_hours, ai_score, status) VALUES
('북한산 국립공원 탐방센터', '서울 강북구 우이동 산 1', 37.6576, 127.0143, '09:00-17:00 (연중무휴)', 95, 'approved'),
('남산 N서울타워 숲길', '서울 중구 남산공원길 105', 37.5511, 126.9882, '24시간 (연중무휴)', 92, 'approved'),
('수락산 정상 전망대', '서울 노원구 상계동 산 173', 37.6860, 127.0766, '일출-일몰 (연중무휴)', 91, 'approved'),
('구룡산 자연공원 억새밭', '서울 강남구 개포동 산 67', 37.4753, 127.0636, '06:00-22:00 (연중무휴)', 88, 'approved'),
('우이령길 탐방로', '서울 강북구 우이동 산 56', 37.6704, 127.0108, '05:30-14:00 (예약 필수)', 93, 'approved'),
('청계산 매봉 등산로', '경기 성남시 수정구 금토동 산 1', 37.4305, 127.0678, '05:00-일몰 (연중무휴)', 90, 'approved'),
('아차산 생태공원', '서울 광진구 워커힐로 177', 37.5497, 127.1015, '05:00-22:00 (연중무휴)', 87, 'approved'),
('한강 난지도 생태공원', '서울 마포구 한강난지로 101', 37.5699, 126.8995, '06:00-22:00 (연중무휴)', 86, 'approved'),
('불암산 생태탐방로', '서울 노원구 월계로 26', 37.6511, 127.0780, '05:00-22:00 (연중무휴)', 85, 'approved'),
('관악산 연주암 가는 길', '서울 관악구 신림동 산 56', 37.4498, 126.9625, '05:00-일몰 (연중무휴)', 89, 'approved');

INSERT INTO place_tags (place_id, tag_name, rest_type) SELECT id, '등산', 'nature' FROM places WHERE name = '북한산 국립공원 탐방센터';
INSERT INTO place_tags (place_id, tag_name, rest_type) SELECT id, '자연', 'nature' FROM places WHERE name = '북한산 국립공원 탐방센터';
INSERT INTO place_tags (place_id, tag_name, rest_type) SELECT id, '숲길', 'nature' FROM places WHERE name = '남산 N서울타워 숲길';
INSERT INTO place_tags (place_id, tag_name, rest_type) SELECT id, '자연', 'nature' FROM places WHERE name = '남산 N서울타워 숲길';
INSERT INTO place_tags (place_id, tag_name, rest_type) SELECT id, '등산', 'nature' FROM places WHERE name = '수락산 정상 전망대';
INSERT INTO place_tags (place_id, tag_name, rest_type) SELECT id, '전망', 'nature' FROM places WHERE name = '수락산 정상 전망대';
INSERT INTO place_tags (place_id, tag_name, rest_type) SELECT id, '자연', 'nature' FROM places WHERE name = '구룡산 자연공원 억새밭';
INSERT INTO place_tags (place_id, tag_name, rest_type) SELECT id, '억새', 'nature' FROM places WHERE name = '구룡산 자연공원 억새밭';
INSERT INTO place_tags (place_id, tag_name, rest_type) SELECT id, '트레킹', 'nature' FROM places WHERE name = '우이령길 탐방로';
INSERT INTO place_tags (place_id, tag_name, rest_type) SELECT id, '자연', 'nature' FROM places WHERE name = '우이령길 탐방로';
INSERT INTO place_tags (place_id, tag_name, rest_type) SELECT id, '등산', 'nature' FROM places WHERE name = '청계산 매봉 등산로';
INSERT INTO place_tags (place_id, tag_name, rest_type) SELECT id, '자연', 'nature' FROM places WHERE name = '청계산 매봉 등산로';
INSERT INTO place_tags (place_id, tag_name, rest_type) SELECT id, '생태', 'nature' FROM places WHERE name = '아차산 생태공원';
INSERT INTO place_tags (place_id, tag_name, rest_type) SELECT id, '자연', 'nature' FROM places WHERE name = '아차산 생태공원';
INSERT INTO place_tags (place_id, tag_name, rest_type) SELECT id, '생태', 'nature' FROM places WHERE name = '한강 난지도 생태공원';
INSERT INTO place_tags (place_id, tag_name, rest_type) SELECT id, '자연', 'nature' FROM places WHERE name = '한강 난지도 생태공원';
INSERT INTO place_tags (place_id, tag_name, rest_type) SELECT id, '등산', 'nature' FROM places WHERE name = '불암산 생태탐방로';
INSERT INTO place_tags (place_id, tag_name, rest_type) SELECT id, '자연', 'nature' FROM places WHERE name = '불암산 생태탐방로';
INSERT INTO place_tags (place_id, tag_name, rest_type) SELECT id, '등산', 'nature' FROM places WHERE name = '관악산 연주암 가는 길';
INSERT INTO place_tags (place_id, tag_name, rest_type) SELECT id, '사찰', 'nature' FROM places WHERE name = '관악산 연주암 가는 길';

-- ─────────────────────────────────────────────
-- 7. 창조적 몰입 (creative)
-- ─────────────────────────────────────────────
INSERT INTO places (name, address, latitude, longitude, operating_hours, ai_score, status) VALUES
('을지로 인쇄골목 공방', '서울 중구 을지로 일대', 37.5662, 126.9977, '10:00-19:00 (일요일 휴무)', 87, 'approved'),
('연남동 도예공방 흙손', '서울 마포구 연남동 241-15', 37.5613, 126.9262, '11:00-21:00 (월요일 휴무)', 85, 'approved'),
('홍대 그림책방 이상한나라', '서울 마포구 동교로 119', 37.5541, 126.9228, '12:00-21:00 (화요일 휴무)', 83, 'approved'),
('성수동 수제화 클래스 어반레더', '서울 성동구 성수이로7길 30', 37.5444, 127.0570, '10:00-19:00 (주말 휴무)', 82, 'approved'),
('삼청동 캘리그래피 공방', '서울 종로구 삼청로 88', 37.5820, 126.9790, '10:00-19:00 (월요일 휴무)', 84, 'approved'),
('이태원 비즈 공예 클래스', '서울 용산구 이태원로 212', 37.5340, 126.9942, '11:00-20:00 (수요일 휴무)', 80, 'approved'),
('수유리 사진 스튜디오 필름', '서울 강북구 수유동 315', 37.6481, 127.0258, '10:00-20:00 (화요일 휴무)', 81, 'approved'),
('한강 뚝섬 야외 드로잉', '서울 광진구 자양동 한강공원', 37.5301, 127.0648, '24시간 (연중무휴)', 86, 'approved'),
('서울 공예박물관', '서울 종로구 율곡로 3길 4', 37.5776, 126.9835, '10:00-18:00 (월요일 휴무)', 89, 'approved'),
('동대문 패브릭 클래스 바늘과실', '서울 중구 청계천로 155', 37.5695, 127.0073, '10:00-19:00 (일요일 휴무)', 78, 'approved');

INSERT INTO place_tags (place_id, tag_name, rest_type) SELECT id, '공방', 'creative' FROM places WHERE name = '을지로 인쇄골목 공방';
INSERT INTO place_tags (place_id, tag_name, rest_type) SELECT id, '인쇄', 'creative' FROM places WHERE name = '을지로 인쇄골목 공방';
INSERT INTO place_tags (place_id, tag_name, rest_type) SELECT id, '도예', 'creative' FROM places WHERE name = '연남동 도예공방 흙손';
INSERT INTO place_tags (place_id, tag_name, rest_type) SELECT id, '공방', 'creative' FROM places WHERE name = '연남동 도예공방 흙손';
INSERT INTO place_tags (place_id, tag_name, rest_type) SELECT id, '독서', 'creative' FROM places WHERE name = '홍대 그림책방 이상한나라';
INSERT INTO place_tags (place_id, tag_name, rest_type) SELECT id, '드로잉', 'creative' FROM places WHERE name = '홍대 그림책방 이상한나라';
INSERT INTO place_tags (place_id, tag_name, rest_type) SELECT id, '가죽공예', 'creative' FROM places WHERE name = '성수동 수제화 클래스 어반레더';
INSERT INTO place_tags (place_id, tag_name, rest_type) SELECT id, '공방', 'creative' FROM places WHERE name = '성수동 수제화 클래스 어반레더';
INSERT INTO place_tags (place_id, tag_name, rest_type) SELECT id, '캘리그래피', 'creative' FROM places WHERE name = '삼청동 캘리그래피 공방';
INSERT INTO place_tags (place_id, tag_name, rest_type) SELECT id, '공방', 'creative' FROM places WHERE name = '삼청동 캘리그래피 공방';
INSERT INTO place_tags (place_id, tag_name, rest_type) SELECT id, '비즈공예', 'creative' FROM places WHERE name = '이태원 비즈 공예 클래스';
INSERT INTO place_tags (place_id, tag_name, rest_type) SELECT id, '공방', 'creative' FROM places WHERE name = '이태원 비즈 공예 클래스';
INSERT INTO place_tags (place_id, tag_name, rest_type) SELECT id, '사진', 'creative' FROM places WHERE name = '수유리 사진 스튜디오 필름';
INSERT INTO place_tags (place_id, tag_name, rest_type) SELECT id, '스튜디오', 'creative' FROM places WHERE name = '수유리 사진 스튜디오 필름';
INSERT INTO place_tags (place_id, tag_name, rest_type) SELECT id, '드로잉', 'creative' FROM places WHERE name = '한강 뚝섬 야외 드로잉';
INSERT INTO place_tags (place_id, tag_name, rest_type) SELECT id, '야외', 'creative' FROM places WHERE name = '한강 뚝섬 야외 드로잉';
INSERT INTO place_tags (place_id, tag_name, rest_type) SELECT id, '공예', 'creative' FROM places WHERE name = '서울 공예박물관';
INSERT INTO place_tags (place_id, tag_name, rest_type) SELECT id, '전시', 'creative' FROM places WHERE name = '서울 공예박물관';
INSERT INTO place_tags (place_id, tag_name, rest_type) SELECT id, '패브릭', 'creative' FROM places WHERE name = '동대문 패브릭 클래스 바늘과실';
INSERT INTO place_tags (place_id, tag_name, rest_type) SELECT id, '공방', 'creative' FROM places WHERE name = '동대문 패브릭 클래스 바늘과실';

-- 완료 확인
SELECT rest_type, COUNT(*) as cnt FROM place_tags GROUP BY rest_type ORDER BY cnt DESC;
