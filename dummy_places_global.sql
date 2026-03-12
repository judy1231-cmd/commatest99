-- 전국 + 해외 더미 장소 데이터 (타입별 15개, 총 105개)
SET NAMES utf8mb4;
SET CHARACTER SET utf8mb4;

-- ─────────────────────────────────────────────
-- 1. 신체적 이완 (physical)
-- ─────────────────────────────────────────────
INSERT INTO places (name, address, latitude, longitude, operating_hours, ai_score, status) VALUES
('해운대 블루라인파크 해변열차', '부산광역시 해운대구 달맞이길 62번길 11', 35.1607, 129.1604, '09:00-18:00 (연중무휴)', 91, 'approved'),
('제주 올레길 1코스', '제주특별자치도 서귀포시 성산읍 시흥리 112', 33.4612, 126.9293, '일출-일몰 (연중무휴)', 95, 'approved'),
('설악산 국립공원 비선대', '강원도 속초시 설악산로 833', 38.1185, 128.4659, '일출-일몰 (연중무휴)', 94, 'approved'),
('지리산 노고단 등산로', '전라남도 구례군 산동면 노고단로 894', 35.3243, 127.4843, '05:00-일몰 (연중무휴)', 93, 'approved'),
('경주 보문 호반 산책로', '경상북도 경주시 보문로 446', 35.8442, 129.2726, '24시간 (연중무휴)', 88, 'approved'),
('전주 완산칠봉 트레킹 코스', '전라북도 전주시 완산구 동완산동 산 10', 35.8130, 127.1405, '05:00-21:00 (연중무휴)', 85, 'approved'),
('인천 송도 센트럴파크 수상택시', '인천광역시 연수구 컨벤시아대로 160', 37.3916, 126.6434, '10:00-22:00 (연중무휴)', 87, 'approved'),
('강릉 경포 해수욕장 해변', '강원도 강릉시 경포로 365', 37.7965, 128.9064, '24시간 (연중무휴)', 90, 'approved'),
('후쿠오카 오호리 공원 조깅로', '일본 후쿠오카현 후쿠오카시 주오구 오호리 공원 1-2', 33.5890, 130.3727, '24시간 (연중무휴)', 88, 'approved'),
('방콕 룸피니 공원 새벽 운동', '태국 방콕 팟텀완 구 룸피니 공원', 13.7289, 100.5418, '05:00-21:00 (연중무휴)', 85, 'approved'),
('도쿄 하치코 트레킹 다카오산', '일본 도쿄도 하치오지시 다카오마치 2176', 35.6257, 139.2432, '일출-일몰 (연중무휴)', 92, 'approved'),
('발리 우붓 라이스필드 워킹투어', '인도네시아 발리주 우붓 캄포안 릿지 워크', -8.5069, 115.2625, '06:00-18:00 (연중무휴)', 94, 'approved'),
('뉴질랜드 퀸스타운 벤 로몬드 트레킹', '뉴질랜드 퀸스타운 벤 로몬드 국립공원', -45.0312, 168.6626, '일출-일몰 (연중무휴)', 96, 'approved'),
('바르셀로나 몬세라트 산 하이킹', '스페인 바르셀로나 몬세라트 국립공원', 41.5931, 1.8369, '09:00-17:00 (연중무휴)', 93, 'approved'),
('시드니 본다이 비치 서핑', '호주 뉴사우스웨일스주 웨이벌리 카운슬 본다이 비치', -33.8914, 151.2767, '24시간 (연중무휴)', 91, 'approved');

INSERT INTO place_tags (place_id, tag_name, rest_type) SELECT id, '산책', 'physical' FROM places WHERE name = '해운대 블루라인파크 해변열차';
INSERT INTO place_tags (place_id, tag_name, rest_type) SELECT id, '해변', 'physical' FROM places WHERE name = '해운대 블루라인파크 해변열차';
INSERT INTO place_tags (place_id, tag_name, rest_type) SELECT id, '트레킹', 'physical' FROM places WHERE name = '제주 올레길 1코스';
INSERT INTO place_tags (place_id, tag_name, rest_type) SELECT id, '자연', 'physical' FROM places WHERE name = '제주 올레길 1코스';
INSERT INTO place_tags (place_id, tag_name, rest_type) SELECT id, '등산', 'physical' FROM places WHERE name = '설악산 국립공원 비선대';
INSERT INTO place_tags (place_id, tag_name, rest_type) SELECT id, '등산', 'physical' FROM places WHERE name = '지리산 노고단 등산로';
INSERT INTO place_tags (place_id, tag_name, rest_type) SELECT id, '산책', 'physical' FROM places WHERE name = '경주 보문 호반 산책로';
INSERT INTO place_tags (place_id, tag_name, rest_type) SELECT id, '트레킹', 'physical' FROM places WHERE name = '전주 완산칠봉 트레킹 코스';
INSERT INTO place_tags (place_id, tag_name, rest_type) SELECT id, '수상스포츠', 'physical' FROM places WHERE name = '인천 송도 센트럴파크 수상택시';
INSERT INTO place_tags (place_id, tag_name, rest_type) SELECT id, '해변', 'physical' FROM places WHERE name = '강릉 경포 해수욕장 해변';
INSERT INTO place_tags (place_id, tag_name, rest_type) SELECT id, '조깅', 'physical' FROM places WHERE name = '후쿠오카 오호리 공원 조깅로';
INSERT INTO place_tags (place_id, tag_name, rest_type) SELECT id, '산책', 'physical' FROM places WHERE name = '방콕 룸피니 공원 새벽 운동';
INSERT INTO place_tags (place_id, tag_name, rest_type) SELECT id, '등산', 'physical' FROM places WHERE name = '도쿄 하치코 트레킹 다카오산';
INSERT INTO place_tags (place_id, tag_name, rest_type) SELECT id, '트레킹', 'physical' FROM places WHERE name = '발리 우붓 라이스필드 워킹투어';
INSERT INTO place_tags (place_id, tag_name, rest_type) SELECT id, '서핑', 'physical' FROM places WHERE name = '시드니 본다이 비치 서핑';

-- ─────────────────────────────────────────────
-- 2. 정신적 고요 (mental)
-- ─────────────────────────────────────────────
INSERT INTO places (name, address, latitude, longitude, operating_hours, ai_score, status) VALUES
('해인사 팔만대장경 경내', '경상남도 합천군 가야면 해인사길 122', 35.7998, 128.1048, '08:30-18:00 (연중무휴)', 95, 'approved'),
('통도사 경내 산책로', '경상남도 양산시 하북면 통도사로 108', 35.4888, 129.0614, '07:00-19:00 (연중무휴)', 93, 'approved'),
('제주 성산일출봉 일출 명소', '제주특별자치도 서귀포시 성산읍 일출로 284-12', 33.4581, 126.9425, '07:00-20:00 (연중무휴)', 96, 'approved'),
('경주 불국사 연화교', '경상북도 경주시 불국로 385', 35.7896, 129.3317, '07:00-18:00 (연중무휴)', 94, 'approved'),
('순천만 갈대밭 산책로', '전라남도 순천시 순천만길 513-25', 34.8892, 127.5148, '08:00-18:00 (연중무휴)', 92, 'approved'),
('부산 태종대 전망대', '부산광역시 영도구 전망로 24', 35.0609, 129.0838, '04:00-24:00 (연중무휴)', 91, 'approved'),
('교토 아라시야마 대나무 숲', '일본 교토부 교토시 우쿄구 사가 오구라야마 후미노이치초', 35.0168, 135.6715, '24시간 (연중무휴)', 96, 'approved'),
('발리 따나롯 사원 일몰', '인도네시아 발리주 타바난 브라반 따나롯 따바난', -8.6215, 115.0869, '07:00-19:00 (연중무휴)', 94, 'approved'),
('교토 긴카쿠지 선원', '일본 교토부 교토시 사쿄구 긴카쿠지초 2', 35.0394, 135.7984, '09:00-17:00 (연중무휴)', 93, 'approved'),
('치앙마이 도이수텝 사원', '태국 치앙마이주 수텝 탐본 도이수텝 길', 18.8049, 98.9219, '06:00-18:00 (연중무휴)', 92, 'approved'),
('파리 뤽상부르 공원 벤치', '프랑스 파리 6구 오귀스트 콩트 6번지', 48.8462, 2.3372, '07:30-21:30 (연중무휴)', 91, 'approved'),
('교토 철학의 길', '일본 교토부 교토시 사쿄구 오카자키', 35.0272, 135.7945, '24시간 (연중무휴)', 95, 'approved'),
('방콕 왓포 사원', '태국 방콕 프라나콘 구 왓포 2번지', 13.7465, 100.4927, '08:30-18:30 (연중무휴)', 90, 'approved'),
('싱가포르 가든스 바이 더 베이 새벽', '싱가포르 마리나 가든 드라이브 18번지', 1.2816, 103.8636, '05:00-02:00 (연중무휴)', 89, 'approved'),
('암스테르담 케이케나호프 튤립 공원', '네덜란드 사우스홀란드 리세 케이케나호프 공원', 52.2697, 4.5475, '08:00-19:30 (봄 시즌)', 93, 'approved');

INSERT INTO place_tags (place_id, tag_name, rest_type) SELECT id, '사찰', 'mental' FROM places WHERE name = '해인사 팔만대장경 경내';
INSERT INTO place_tags (place_id, tag_name, rest_type) SELECT id, '명상', 'mental' FROM places WHERE name = '해인사 팔만대장경 경내';
INSERT INTO place_tags (place_id, tag_name, rest_type) SELECT id, '사찰', 'mental' FROM places WHERE name = '통도사 경내 산책로';
INSERT INTO place_tags (place_id, tag_name, rest_type) SELECT id, '일출', 'mental' FROM places WHERE name = '제주 성산일출봉 일출 명소';
INSERT INTO place_tags (place_id, tag_name, rest_type) SELECT id, '사찰', 'mental' FROM places WHERE name = '경주 불국사 연화교';
INSERT INTO place_tags (place_id, tag_name, rest_type) SELECT id, '자연', 'mental' FROM places WHERE name = '순천만 갈대밭 산책로';
INSERT INTO place_tags (place_id, tag_name, rest_type) SELECT id, '전망', 'mental' FROM places WHERE name = '부산 태종대 전망대';
INSERT INTO place_tags (place_id, tag_name, rest_type) SELECT id, '자연', 'mental' FROM places WHERE name = '교토 아라시야마 대나무 숲';
INSERT INTO place_tags (place_id, tag_name, rest_type) SELECT id, '명상', 'mental' FROM places WHERE name = '교토 아라시야마 대나무 숲';
INSERT INTO place_tags (place_id, tag_name, rest_type) SELECT id, '일몰', 'mental' FROM places WHERE name = '발리 따나롯 사원 일몰';
INSERT INTO place_tags (place_id, tag_name, rest_type) SELECT id, '사찰', 'mental' FROM places WHERE name = '교토 긴카쿠지 선원';
INSERT INTO place_tags (place_id, tag_name, rest_type) SELECT id, '사찰', 'mental' FROM places WHERE name = '치앙마이 도이수텝 사원';
INSERT INTO place_tags (place_id, tag_name, rest_type) SELECT id, '사색', 'mental' FROM places WHERE name = '파리 뤽상부르 공원 벤치';
INSERT INTO place_tags (place_id, tag_name, rest_type) SELECT id, '산책', 'mental' FROM places WHERE name = '교토 철학의 길';
INSERT INTO place_tags (place_id, tag_name, rest_type) SELECT id, '자연', 'mental' FROM places WHERE name = '싱가포르 가든스 바이 더 베이 새벽';

-- ─────────────────────────────────────────────
-- 3. 감각의 정화 (sensory)
-- ─────────────────────────────────────────────
INSERT INTO places (name, address, latitude, longitude, operating_hours, ai_score, status) VALUES
('부산 감천문화마을', '부산광역시 사하구 감내2로 203', 35.0975, 129.0108, '09:00-18:00 (연중무휴)', 92, 'approved'),
('전주 한옥마을 전통찻집', '전라북도 전주시 완산구 기린대로 99', 35.8136, 127.1534, '10:00-20:00 (연중무휴)', 90, 'approved'),
('대구 근대골목 투어', '대구광역시 중구 진골목길 일대', 35.8680, 128.5980, '10:00-17:00 (월요일 휴무)', 87, 'approved'),
('광주 국립아시아문화전당', '광주광역시 동구 문화전당로 38', 35.1448, 126.9218, '10:00-18:00 (월요일 휴무)', 89, 'approved'),
('제주 유리의 성', '제주특별자치도 제주시 한경면 용수리 1203', 33.3369, 126.2141, '09:00-18:00 (연중무휴)', 88, 'approved'),
('오사카 도톤보리 야경 산책', '일본 오사카부 오사카시 주오구 도톤보리 1-7', 34.6687, 135.5012, '24시간 (연중무휴)', 91, 'approved'),
('도쿄 팀랩 borderless 전시', '일본 도쿄도 고토구 아오미 1-3-8', 35.6247, 139.7745, '10:00-19:00 (화요일 휴무)', 95, 'approved'),
('방콕 짜뚜짝 야시장', '태국 방콕 짜뚜짝구 까쎄트쎄막 2번길', 13.7999, 100.5502, '09:00-18:00 (토일)', 87, 'approved'),
('파리 루브르 박물관', '프랑스 파리 1구 리볼리 거리 99번지', 48.8606, 2.3376, '09:00-18:00 (화요일 휴무)', 96, 'approved'),
('뉴욕 MoMA 현대미술관', '미국 뉴욕주 뉴욕 맨해튼 53번가 11번지', 40.7614, -73.9776, '10:30-17:30 (화요일 휴무)', 94, 'approved'),
('마카오 타이파 빌리지 야경', '마카오 타이파 빌리지 쿠아이 람 거리', 22.1551, 113.5578, '24시간 (연중무휴)', 88, 'approved'),
('바르셀로나 사그라다 파밀리아', '스페인 바르셀로나 말로르카 401번지', 41.4036, 2.1744, '09:00-20:00 (연중무휴)', 97, 'approved'),
('도쿄 시부야 스카이 전망대', '일본 도쿄도 시부야구 도겐자카 2-24-12', 35.6591, 139.7022, '10:00-22:30 (연중무휴)', 93, 'approved'),
('싱가포르 마리나 베이 샌즈 야경', '싱가포르 베이프런트 애비뉴 10번지', 1.2834, 103.8607, '24시간 (연중무휴)', 95, 'approved'),
('홍콩 빅토리아 피크 야경', '홍콩 센트럴 더 피크 피크 타워', 22.2760, 114.1450, '10:00-23:00 (연중무휴)', 92, 'approved');

INSERT INTO place_tags (place_id, tag_name, rest_type) SELECT id, '문화', 'sensory' FROM places WHERE name = '부산 감천문화마을';
INSERT INTO place_tags (place_id, tag_name, rest_type) SELECT id, '전통', 'sensory' FROM places WHERE name = '전주 한옥마을 전통찻집';
INSERT INTO place_tags (place_id, tag_name, rest_type) SELECT id, '역사', 'sensory' FROM places WHERE name = '대구 근대골목 투어';
INSERT INTO place_tags (place_id, tag_name, rest_type) SELECT id, '전시', 'sensory' FROM places WHERE name = '광주 국립아시아문화전당';
INSERT INTO place_tags (place_id, tag_name, rest_type) SELECT id, '전시', 'sensory' FROM places WHERE name = '제주 유리의 성';
INSERT INTO place_tags (place_id, tag_name, rest_type) SELECT id, '야경', 'sensory' FROM places WHERE name = '오사카 도톤보리 야경 산책';
INSERT INTO place_tags (place_id, tag_name, rest_type) SELECT id, '전시', 'sensory' FROM places WHERE name = '도쿄 팀랩 borderless 전시';
INSERT INTO place_tags (place_id, tag_name, rest_type) SELECT id, '미디어아트', 'sensory' FROM places WHERE name = '도쿄 팀랩 borderless 전시';
INSERT INTO place_tags (place_id, tag_name, rest_type) SELECT id, '야시장', 'sensory' FROM places WHERE name = '방콕 짜뚜짝 야시장';
INSERT INTO place_tags (place_id, tag_name, rest_type) SELECT id, '미술관', 'sensory' FROM places WHERE name = '파리 루브르 박물관';
INSERT INTO place_tags (place_id, tag_name, rest_type) SELECT id, '미술관', 'sensory' FROM places WHERE name = '뉴욕 MoMA 현대미술관';
INSERT INTO place_tags (place_id, tag_name, rest_type) SELECT id, '야경', 'sensory' FROM places WHERE name = '마카오 타이파 빌리지 야경';
INSERT INTO place_tags (place_id, tag_name, rest_type) SELECT id, '건축', 'sensory' FROM places WHERE name = '바르셀로나 사그라다 파밀리아';
INSERT INTO place_tags (place_id, tag_name, rest_type) SELECT id, '전망', 'sensory' FROM places WHERE name = '도쿄 시부야 스카이 전망대';
INSERT INTO place_tags (place_id, tag_name, rest_type) SELECT id, '야경', 'sensory' FROM places WHERE name = '홍콩 빅토리아 피크 야경';

-- ─────────────────────────────────────────────
-- 4. 정서적 지지 (emotional)
-- ─────────────────────────────────────────────
INSERT INTO places (name, address, latitude, longitude, operating_hours, ai_score, status) VALUES
('부산 해리단길 감성카페 골목', '부산광역시 해운대구 중동2로 21번길 일대', 35.1588, 129.1601, '10:00-22:00 (연중무휴)', 88, 'approved'),
('강릉 안목 커피거리', '강원도 강릉시 창해로14번길 20 일대', 37.7749, 128.9439, '08:00-22:00 (연중무휴)', 90, 'approved'),
('제주 성이시돌 목장 테쉬폰', '제주특별자치도 제주시 한림읍 산록북로 166', 33.3856, 126.2623, '09:00-18:00 (연중무휴)', 87, 'approved'),
('담양 죽녹원 대나무 숲길', '전라남도 담양군 담양읍 죽녹원로 119', 35.3219, 126.9882, '09:00-18:00 (연중무휴)', 91, 'approved'),
('전주 객리단길 독립서점', '전라북도 전주시 완산구 객사3길 일대', 35.8186, 127.1481, '11:00-21:00 (월요일 휴무)', 86, 'approved'),
('경주 황리단길 감성숍', '경상북도 경주시 포석로 일대', 35.8357, 129.2196, '11:00-21:00 (연중무휴)', 89, 'approved'),
('교토 기온 골목 카페', '일본 교토부 교토시 히가시야마구 기온마치키타가와', 35.0037, 135.7784, '10:00-20:00 (연중무휴)', 92, 'approved'),
('발리 우붓 힐링 스파', '인도네시아 발리주 우붓 하노만 거리 35', -8.5072, 115.2640, '09:00-22:00 (연중무휴)', 93, 'approved'),
('프라하 구시가지 카페', '체코 프라하 1구 스타로메스트스케 광장 일대', 50.0875, 14.4213, '08:00-22:00 (연중무휴)', 91, 'approved'),
('치앙마이 님만해민 감성카페', '태국 치앙마이주 수텝 님만해민 로드', 18.8014, 98.9676, '09:00-23:00 (연중무휴)', 90, 'approved'),
('리스본 알파마 전망대 선셋', '포르투갈 리스본 알파마 포르타스 두 솔 광장', 38.7139, -9.1301, '24시간 (연중무휴)', 93, 'approved'),
('방콕 짜오프라야강 선셋 크루즈', '태국 방콕 반람푸 짜오프라야강 선착장', 13.7563, 100.5018, '17:00-21:00 (연중무휴)', 89, 'approved'),
('상하이 신천지 레트로 카페', '중국 상하이 황포구 태창로 181 신천지', 31.2198, 121.4738, '10:00-22:00 (연중무휴)', 87, 'approved'),
('빈 나슈마르크트 시장', '오스트리아 빈 6구 나슈마르크트', 48.1994, 16.3639, '06:00-19:30 (일요일 휴무)', 88, 'approved'),
('타이베이 지우펀 홍등 골목', '대만 신베이시 루이팡구 지산가', 25.1096, 121.8446, '10:00-21:00 (연중무휴)', 92, 'approved');

INSERT INTO place_tags (place_id, tag_name, rest_type) SELECT id, '카페', 'emotional' FROM places WHERE name = '부산 해리단길 감성카페 골목';
INSERT INTO place_tags (place_id, tag_name, rest_type) SELECT id, '카페', 'emotional' FROM places WHERE name = '강릉 안목 커피거리';
INSERT INTO place_tags (place_id, tag_name, rest_type) SELECT id, '힐링', 'emotional' FROM places WHERE name = '제주 성이시돌 목장 테쉬폰';
INSERT INTO place_tags (place_id, tag_name, rest_type) SELECT id, '자연', 'emotional' FROM places WHERE name = '담양 죽녹원 대나무 숲길';
INSERT INTO place_tags (place_id, tag_name, rest_type) SELECT id, '독서', 'emotional' FROM places WHERE name = '전주 객리단길 독립서점';
INSERT INTO place_tags (place_id, tag_name, rest_type) SELECT id, '감성', 'emotional' FROM places WHERE name = '경주 황리단길 감성숍';
INSERT INTO place_tags (place_id, tag_name, rest_type) SELECT id, '카페', 'emotional' FROM places WHERE name = '교토 기온 골목 카페';
INSERT INTO place_tags (place_id, tag_name, rest_type) SELECT id, '스파', 'emotional' FROM places WHERE name = '발리 우붓 힐링 스파';
INSERT INTO place_tags (place_id, tag_name, rest_type) SELECT id, '치유', 'emotional' FROM places WHERE name = '발리 우붓 힐링 스파';
INSERT INTO place_tags (place_id, tag_name, rest_type) SELECT id, '카페', 'emotional' FROM places WHERE name = '프라하 구시가지 카페';
INSERT INTO place_tags (place_id, tag_name, rest_type) SELECT id, '카페', 'emotional' FROM places WHERE name = '치앙마이 님만해민 감성카페';
INSERT INTO place_tags (place_id, tag_name, rest_type) SELECT id, '일몰', 'emotional' FROM places WHERE name = '리스본 알파마 전망대 선셋';
INSERT INTO place_tags (place_id, tag_name, rest_type) SELECT id, '크루즈', 'emotional' FROM places WHERE name = '방콕 짜오프라야강 선셋 크루즈';
INSERT INTO place_tags (place_id, tag_name, rest_type) SELECT id, '카페', 'emotional' FROM places WHERE name = '상하이 신천지 레트로 카페';
INSERT INTO place_tags (place_id, tag_name, rest_type) SELECT id, '야경', 'emotional' FROM places WHERE name = '타이베이 지우펀 홍등 골목';

-- ─────────────────────────────────────────────
-- 5. 사회적 휴식 (social)
-- ─────────────────────────────────────────────
INSERT INTO places (name, address, latitude, longitude, operating_hours, ai_score, status) VALUES
('부산 광안리 비치 바베큐', '부산광역시 수영구 광안해변로 219', 35.1531, 129.1183, '09:00-22:00 (연중무휴)', 89, 'approved'),
('제주 협재 해수욕장 피크닉', '제주특별자치도 제주시 한림읍 협재리 2447-1', 33.3944, 126.2394, '24시간 (연중무휴)', 91, 'approved'),
('대전 으능정이 문화거리', '대전광역시 중구 은행동 으능정이길 일대', 36.3285, 127.4268, '10:00-22:00 (연중무휴)', 84, 'approved'),
('춘천 닭갈비 막국수 골목', '강원도 춘천시 명동길 일대', 37.8804, 127.7280, '11:00-21:00 (연중무휴)', 88, 'approved'),
('홍콩 란콰이펑 파티거리', '홍콩 센트럴 란콰이펑 디 엔터테인먼트 거리', 22.2814, 114.1543, '18:00-04:00 (연중무휴)', 87, 'approved'),
('도쿄 오모테산도 힐즈 테라스', '일본 도쿄도 시부야구 진구마에 4-12-10', 35.6654, 139.7075, '11:00-21:00 (연중무휴)', 90, 'approved'),
('뉴욕 센트럴파크 피크닉 그린', '미국 뉴욕주 맨해튼 센트럴파크 웨스트', 40.7812, -73.9665, '06:00-01:00 (연중무휴)', 93, 'approved'),
('방콕 아시아티크 야시장', '태국 방콕 방코렘 짜런 낙혼 거리 2194', 13.7026, 100.5105, '17:00-00:00 (연중무휴)', 91, 'approved'),
('싱가포르 클락키 리버사이드', '싱가포르 클락 키 3번지', 1.2905, 103.8462, '18:00-02:00 (연중무휴)', 90, 'approved'),
('바르셀로나 보케리아 시장', '스페인 바르셀로나 람블라 거리 91번지', 41.3818, 2.1726, '08:00-20:30 (일요일 휴무)', 89, 'approved'),
('파리 몽마르트르 광장 카페', '프랑스 파리 18구 테르트르 광장', 48.8865, 2.3404, '09:00-23:00 (연중무휴)', 92, 'approved'),
('오사카 신사이바시 쇼핑 거리', '일본 오사카부 오사카시 주오구 신사이바시스지 1', 34.6726, 135.5004, '11:00-21:00 (연중무휴)', 88, 'approved'),
('뉴욕 브루클린 브릿지 파크', '미국 뉴욕주 브루클린 올드 펄튼 거리 334', 40.7024, -73.9876, '06:00-23:00 (연중무휴)', 91, 'approved'),
('멜버른 페더레이션 스퀘어', '호주 빅토리아주 멜버른 플린더스 거리', -37.8180, 144.9691, '24시간 (연중무휴)', 87, 'approved'),
('도쿄 시모키타자와 라이브 카페', '일본 도쿄도 세타가야구 키타자와 2-6-2', 35.6614, 139.6676, '16:00-23:00 (연중무휴)', 86, 'approved');

INSERT INTO place_tags (place_id, tag_name, rest_type) SELECT id, '바베큐', 'social' FROM places WHERE name = '부산 광안리 비치 바베큐';
INSERT INTO place_tags (place_id, tag_name, rest_type) SELECT id, '피크닉', 'social' FROM places WHERE name = '제주 협재 해수욕장 피크닉';
INSERT INTO place_tags (place_id, tag_name, rest_type) SELECT id, '문화', 'social' FROM places WHERE name = '대전 으능정이 문화거리';
INSERT INTO place_tags (place_id, tag_name, rest_type) SELECT id, '음식', 'social' FROM places WHERE name = '춘천 닭갈비 막국수 골목';
INSERT INTO place_tags (place_id, tag_name, rest_type) SELECT id, '나이트라이프', 'social' FROM places WHERE name = '홍콩 란콰이펑 파티거리';
INSERT INTO place_tags (place_id, tag_name, rest_type) SELECT id, '쇼핑', 'social' FROM places WHERE name = '도쿄 오모테산도 힐즈 테라스';
INSERT INTO place_tags (place_id, tag_name, rest_type) SELECT id, '피크닉', 'social' FROM places WHERE name = '뉴욕 센트럴파크 피크닉 그린';
INSERT INTO place_tags (place_id, tag_name, rest_type) SELECT id, '야시장', 'social' FROM places WHERE name = '방콕 아시아티크 야시장';
INSERT INTO place_tags (place_id, tag_name, rest_type) SELECT id, '모임', 'social' FROM places WHERE name = '싱가포르 클락키 리버사이드';
INSERT INTO place_tags (place_id, tag_name, rest_type) SELECT id, '시장', 'social' FROM places WHERE name = '바르셀로나 보케리아 시장';
INSERT INTO place_tags (place_id, tag_name, rest_type) SELECT id, '카페', 'social' FROM places WHERE name = '파리 몽마르트르 광장 카페';
INSERT INTO place_tags (place_id, tag_name, rest_type) SELECT id, '쇼핑', 'social' FROM places WHERE name = '오사카 신사이바시 쇼핑 거리';
INSERT INTO place_tags (place_id, tag_name, rest_type) SELECT id, '산책', 'social' FROM places WHERE name = '뉴욕 브루클린 브릿지 파크';
INSERT INTO place_tags (place_id, tag_name, rest_type) SELECT id, '광장', 'social' FROM places WHERE name = '멜버른 페더레이션 스퀘어';
INSERT INTO place_tags (place_id, tag_name, rest_type) SELECT id, '공연', 'social' FROM places WHERE name = '도쿄 시모키타자와 라이브 카페';

-- ─────────────────────────────────────────────
-- 6. 자연의 연결 (nature)
-- ─────────────────────────────────────────────
INSERT INTO places (name, address, latitude, longitude, operating_hours, ai_score, status) VALUES
('제주 한라산 어리목 탐방로', '제주특별자치도 제주시 1100로 2070-61', 33.3617, 126.4881, '05:00-13:00 (기상 악화 시 통제)', 97, 'approved'),
('오대산 국립공원 소금강', '강원도 강릉시 연곡면 삼산리 산1', 37.8057, 128.7047, '일출-일몰 (연중무휴)', 93, 'approved'),
('보성 녹차밭 대한다원', '전라남도 보성군 보성읍 녹차로 763-1', 34.8073, 127.0784, '09:00-18:00 (연중무휴)', 94, 'approved'),
('남해 독일마을 해안 산책로', '경상남도 남해군 삼동면 독일로 92', 34.7866, 127.9302, '24시간 (연중무휴)', 90, 'approved'),
('변산반도 국립공원 채석강', '전라북도 부안군 변산면 격포리 301-1', 35.6381, 126.4830, '일출-일몰 (연중무휴)', 91, 'approved'),
('내린천 래프팅 출발지', '강원도 인제군 상남면 내린천로 260', 37.9688, 128.2094, '09:00-17:00 (4~10월)', 88, 'approved'),
('백두대간 대덕산 구름바다', '강원도 태백시 창죽동 산 1', 37.1540, 128.9900, '일출-일몰 (연중무휴)', 92, 'approved'),
('후지산 고모쿠코 호수', '일본 야마나시현 미나미쓰루군 후지카와구치코 후나쓰 6663', 35.5076, 138.7538, '24시간 (연중무휴)', 96, 'approved'),
('하와이 나팔리 코스트 트레일', '미국 하와이주 카우아이 카이나리우', 22.1840, -159.6345, '06:00-18:00 (연중무휴)', 98, 'approved'),
('노르웨이 피요르드 크루즈 플롬', '노르웨이 베스틀란 오를란드 플롬항', 60.8630, 7.1166, '일출-일몰 (봄~가을)', 97, 'approved'),
('아이슬란드 오로라 관측지 레이캬비크', '아이슬란드 레이캬비크 근교 황야', 63.9977, -22.1220, '야간 (겨울 시즌)', 99, 'approved'),
('캐나다 밴프 국립공원 루이스 호수', '캐나다 앨버타주 밴프 레이크 루이스', 51.4254, -116.1773, '24시간 (연중무휴)', 98, 'approved'),
('뉴질랜드 밀포드 사운드', '뉴질랜드 사우스랜드 피오르드랜드 국립공원', -44.6415, 167.8974, '일출-일몰 (연중무휴)', 97, 'approved'),
('스위스 융프라우요흐 전망대', '스위스 베른주 인터라켄-오버하슬리 융프라우요흐', 46.5479, 7.9855, '06:00-18:00 (연중무휴)', 98, 'approved'),
('페루 마추픽추 유적지', '페루 쿠스코 우루밤바 마추픽추 아그라스 칼리엔테', -13.1631, -72.5450, '06:00-17:00 (연중무휴)', 99, 'approved');

INSERT INTO place_tags (place_id, tag_name, rest_type) SELECT id, '등산', 'nature' FROM places WHERE name = '제주 한라산 어리목 탐방로';
INSERT INTO place_tags (place_id, tag_name, rest_type) SELECT id, '자연', 'nature' FROM places WHERE name = '제주 한라산 어리목 탐방로';
INSERT INTO place_tags (place_id, tag_name, rest_type) SELECT id, '계곡', 'nature' FROM places WHERE name = '오대산 국립공원 소금강';
INSERT INTO place_tags (place_id, tag_name, rest_type) SELECT id, '자연', 'nature' FROM places WHERE name = '보성 녹차밭 대한다원';
INSERT INTO place_tags (place_id, tag_name, rest_type) SELECT id, '해안', 'nature' FROM places WHERE name = '남해 독일마을 해안 산책로';
INSERT INTO place_tags (place_id, tag_name, rest_type) SELECT id, '해안', 'nature' FROM places WHERE name = '변산반도 국립공원 채석강';
INSERT INTO place_tags (place_id, tag_name, rest_type) SELECT id, '래프팅', 'nature' FROM places WHERE name = '내린천 래프팅 출발지';
INSERT INTO place_tags (place_id, tag_name, rest_type) SELECT id, '자연', 'nature' FROM places WHERE name = '백두대간 대덕산 구름바다';
INSERT INTO place_tags (place_id, tag_name, rest_type) SELECT id, '호수', 'nature' FROM places WHERE name = '후지산 고모쿠코 호수';
INSERT INTO place_tags (place_id, tag_name, rest_type) SELECT id, '트레킹', 'nature' FROM places WHERE name = '하와이 나팔리 코스트 트레일';
INSERT INTO place_tags (place_id, tag_name, rest_type) SELECT id, '크루즈', 'nature' FROM places WHERE name = '노르웨이 피요르드 크루즈 플롬';
INSERT INTO place_tags (place_id, tag_name, rest_type) SELECT id, '오로라', 'nature' FROM places WHERE name = '아이슬란드 오로라 관측지 레이캬비크';
INSERT INTO place_tags (place_id, tag_name, rest_type) SELECT id, '호수', 'nature' FROM places WHERE name = '캐나다 밴프 국립공원 루이스 호수';
INSERT INTO place_tags (place_id, tag_name, rest_type) SELECT id, '자연', 'nature' FROM places WHERE name = '뉴질랜드 밀포드 사운드';
INSERT INTO place_tags (place_id, tag_name, rest_type) SELECT id, '전망', 'nature' FROM places WHERE name = '스위스 융프라우요흐 전망대';

-- ─────────────────────────────────────────────
-- 7. 창조적 몰입 (creative)
-- ─────────────────────────────────────────────
INSERT INTO places (name, address, latitude, longitude, operating_hours, ai_score, status) VALUES
('부산 흰여울문화마을 포토스팟', '부산광역시 영도구 영선동4가 604-4', 35.0682, 129.0236, '24시간 (연중무휴)', 88, 'approved'),
('제주 저지리 예술인마을', '제주특별자치도 제주시 한경면 저지리 2114', 33.3307, 126.2367, '10:00-18:00 (월요일 휴무)', 87, 'approved'),
('광주 양림동 역사문화마을 드로잉', '광주광역시 남구 양림로 지대', 35.1384, 126.9112, '24시간 (연중무휴)', 85, 'approved'),
('대전 소제동 카메라 필름 사진관', '대전광역시 동구 소제동 대전천동로 일대', 36.3353, 127.4463, '11:00-20:00 (월요일 휴무)', 83, 'approved'),
('전주 공예품 전시관 도자기 클래스', '전라북도 전주시 완산구 기린대로 45', 35.8086, 127.1535, '09:00-18:00 (월요일 휴무)', 86, 'approved'),
('도쿄 진보초 헌책방 거리', '일본 도쿄도 지요다구 진보초 일대', 35.6965, 139.7573, '10:00-19:00 (연중무휴)', 90, 'approved'),
('파리 몽마르트르 아뜰리에 드로잉 클래스', '프랑스 파리 18구 노르뱅 거리 75', 48.8842, 2.3377, '10:00-17:00 (월요일 휴무)', 92, 'approved'),
('포르투 세라미카 타일 공방', '포르투갈 포르투 생 벤투 역 근처 공방', 41.1455, -8.6094, '10:00-19:00 (일요일 휴무)', 89, 'approved'),
('도쿄 나카메구로 라이프스타일 서점 카울라', '일본 도쿄도 메구로구 나카메구로 3-8-3', 35.6430, 139.6988, '11:00-20:00 (연중무휴)', 88, 'approved'),
('발리 우붓 전통 목각 공방', '인도네시아 발리주 우붓 몽키포레스트 로드', -8.5187, 115.2615, '08:00-18:00 (연중무휴)', 85, 'approved'),
('뉴욕 브루클린 부시윅 거리 벽화', '미국 뉴욕주 부시윅 제퍼슨 거리 일대', 40.7049, -73.9178, '24시간 (연중무휴)', 87, 'approved'),
('런던 쇼디치 그래피티 거리', '영국 런던 쇼디치 브릭레인 일대', 51.5228, -0.0713, '24시간 (연중무휴)', 89, 'approved'),
('멜버른 피츠로이 아트 갤러리 거리', '호주 빅토리아주 멜버른 피츠로이 브런즈윅 거리', -37.7997, 144.9768, '10:00-18:00 (월요일 휴무)', 86, 'approved'),
('베를린 마우어파크 벼룩시장 드로잉', '독일 베를린 프렌츨라우어베르크 베르나우어 거리 63-64', 52.5418, 13.4026, '08:00-17:00 (일요일만)', 88, 'approved'),
('타이베이 화산 1914 문화창의산업원구', '대만 타이베이 중정구 팔덕로 1호', 25.0444, 121.5286, '11:00-21:00 (월요일 휴무)', 87, 'approved');

INSERT INTO place_tags (place_id, tag_name, rest_type) SELECT id, '사진', 'creative' FROM places WHERE name = '부산 흰여울문화마을 포토스팟';
INSERT INTO place_tags (place_id, tag_name, rest_type) SELECT id, '문화', 'creative' FROM places WHERE name = '제주 저지리 예술인마을';
INSERT INTO place_tags (place_id, tag_name, rest_type) SELECT id, '드로잉', 'creative' FROM places WHERE name = '광주 양림동 역사문화마을 드로잉';
INSERT INTO place_tags (place_id, tag_name, rest_type) SELECT id, '사진', 'creative' FROM places WHERE name = '대전 소제동 카메라 필름 사진관';
INSERT INTO place_tags (place_id, tag_name, rest_type) SELECT id, '도예', 'creative' FROM places WHERE name = '전주 공예품 전시관 도자기 클래스';
INSERT INTO place_tags (place_id, tag_name, rest_type) SELECT id, '독서', 'creative' FROM places WHERE name = '도쿄 진보초 헌책방 거리';
INSERT INTO place_tags (place_id, tag_name, rest_type) SELECT id, '드로잉', 'creative' FROM places WHERE name = '파리 몽마르트르 아뜰리에 드로잉 클래스';
INSERT INTO place_tags (place_id, tag_name, rest_type) SELECT id, '공방', 'creative' FROM places WHERE name = '포르투 세라미카 타일 공방';
INSERT INTO place_tags (place_id, tag_name, rest_type) SELECT id, '독서', 'creative' FROM places WHERE name = '도쿄 나카메구로 라이프스타일 서점 카울라';
INSERT INTO place_tags (place_id, tag_name, rest_type) SELECT id, '목각', 'creative' FROM places WHERE name = '발리 우붓 전통 목각 공방';
INSERT INTO place_tags (place_id, tag_name, rest_type) SELECT id, '그래피티', 'creative' FROM places WHERE name = '뉴욕 브루클린 부시윅 거리 벽화';
INSERT INTO place_tags (place_id, tag_name, rest_type) SELECT id, '그래피티', 'creative' FROM places WHERE name = '런던 쇼디치 그래피티 거리';
INSERT INTO place_tags (place_id, tag_name, rest_type) SELECT id, '갤러리', 'creative' FROM places WHERE name = '멜버른 피츠로이 아트 갤러리 거리';
INSERT INTO place_tags (place_id, tag_name, rest_type) SELECT id, '벼룩시장', 'creative' FROM places WHERE name = '베를린 마우어파크 벼룩시장 드로잉';
INSERT INTO place_tags (place_id, tag_name, rest_type) SELECT id, '문화', 'creative' FROM places WHERE name = '타이베이 화산 1914 문화창의산업원구';

-- 최종 확인
SELECT rest_type, COUNT(*) as cnt FROM place_tags GROUP BY rest_type ORDER BY cnt DESC;
