-- ============================================================
-- 쉼표(,) 핵심 Seed 데이터
-- 실행 순서: schema.sql → seed_data.sql → seed_places.sql → seed_test_data.sql(선택)
-- ※ rest_types(7개), badges(5개)는 schema.sql에 이미 포함되어 있음
-- ============================================================
USE comma_db;

-- ============================================================
-- [1] 휴식 활동 (rest_activities) — 유형별 3개씩 (총 21개)
-- rest_type_id: 1=physical, 2=mental, 3=sensory, 4=emotional, 5=social, 6=nature, 7=creative
-- ============================================================
INSERT INTO rest_activities (rest_type_id, activity_name, guide_content, duration_minutes) VALUES
-- 신체적 이완 (physical)
(1, '전신 스트레칭',    '목·어깨·허리·다리 순서로 각 부위를 10~15초씩 늘려주세요. 호흡은 천천히 내쉬면서.', 15),
(1, '가벼운 산책',      '빠르지 않게 동네 한 바퀴. 스마트폰은 주머니에 넣고 주변 풍경을 눈에 담아보세요.', 30),
(1, '하타 요가',        '기본 자세(산 자세·고양이 자세·아기 자세)를 순서대로 따라 해보세요.',               20),
-- 정신적 고요 (mental)
(2, '명상',             '눈을 감고 호흡에 집중하세요. 생각이 떠오르면 판단 없이 흘려보냅니다. 5분부터 시작.', 10),
(2, '4-7-8 호흡법',     '4초 들이쉬고 → 7초 참고 → 8초 내쉬기. 4회 반복하면 긴장이 풀려요.',               5),
(2, '차 마시기',        '좋아하는 차를 천천히 우려 향을 맡고, 온기를 느끼며 한 모금씩 마셔보세요.',           15),
-- 감각의 정화 (sensory)
(3, '디지털 디톡스',    '스마트폰·PC를 잠시 끄고 아날로그 활동(독서·낙서·산책)을 즐겨보세요.',             60),
(3, '눈 감고 쉬기',     '어두운 공간에서 눈을 감고 5분간 완전한 고요를 경험해보세요.',                       5),
(3, '아로마테라피',      '라벤더·유칼립투스 등 좋아하는 향의 디퓨저를 켜고 깊게 호흡하며 쉬어보세요.',        20),
-- 정서적 지지 (emotional)
(4, '감정 일기 쓰기',   '지금 느끼는 감정을 솔직하게 적어보세요. 잘 쓰는 것보다 쏟아내는 것이 중요해요.',    15),
(4, '좋아하는 음악',    '플레이리스트를 틀고 눈 감은 채 음악에만 집중해보세요.',                             20),
(4, '소중한 사람과 대화','안부 문자 한 통이라도 괜찮아요. 따뜻한 연결이 감정 에너지를 충전시켜 줍니다.',     30),
-- 사회적 휴식 (social)
(5, '친구와 수다',      '가볍게 카페에서 이야기를 나눠보세요. 깊은 고민보다 일상 이야기로 편하게.',            60),
(5, '혼자 카페 가기',   '좋아하는 음료 한 잔과 함께 나 자신에게 집중하는 혼자만의 시간을 가져보세요.',         45),
(5, '보드게임·소모임',  '가벼운 보드게임 모임이나 취미 소모임 참여로 새로운 에너지를 충전해보세요.',           120),
-- 자연과의 연결 (nature)
(6, '공원 산책',        '가까운 공원에서 맨발로 잔디를 걷거나 나무 아래 앉아 자연 소리를 들어보세요.',         30),
(6, '등산',             '가벼운 코스로 시작해보세요. 정상보다 과정에서 자연을 느끼는 것이 더 중요해요.',       120),
(6, '숲 속 힐링',       '산림욕장이나 둘레길에서 천천히 걸으며 나무 향과 새소리를 온몸으로 느껴보세요.',       60),
-- 창조적 몰입 (creative)
(7, '그림 그리기',      '잘 그리려 하지 마세요. 지금 기분을 색으로 표현하거나 눈앞의 것을 그냥 그려보세요.',   30),
(7, '자유 글쓰기',      '타이머 10분을 맞추고 머릿속 생각을 멈추지 않고 써내려가 보세요.',                    10),
(7, '요리·베이킹',      '좋아하는 간단한 레시피에 도전해보세요. 만드는 과정 자체에서 몰입감을 느낄 수 있어요.',60);

-- ============================================================
-- [2] 설문 질문 + 선택지 (survey_questions + survey_choices)
-- score 값(1~7)이 휴식유형 ID를 의미:
--   1=physical, 2=mental, 3=sensory, 4=emotional, 5=social, 6=nature, 7=creative
-- ============================================================
INSERT INTO survey_questions (question_content, category, display_order, active) VALUES
('오늘 하루 가장 많이 느낀 피로감은 어디인가요?',          'physical',  1, 1),
('지금 당장 가장 하고 싶은 것은 무엇인가요?',              'mental',    2, 1),
('최근 가장 스트레스를 받은 상황은?',                      'emotional', 3, 1),
('지금 나에게 가장 필요한 것은?',                          'social',    4, 1),
('이상적인 주말 오후를 고른다면?',                         'creative',  5, 1);

-- survey_choices — LAST_INSERT_ID() 방식 대신 서브쿼리 사용 (안전)
INSERT INTO survey_choices (question_id, choice_content, score, display_order)
SELECT id, '온몸이 무겁고 근육이 뭉친 느낌',               1, 1 FROM survey_questions WHERE question_content LIKE '오늘 하루 가장 많이%' UNION ALL
SELECT id, '머릿속이 꽉 찬 것 같은 두통',                  2, 2 FROM survey_questions WHERE question_content LIKE '오늘 하루 가장 많이%' UNION ALL
SELECT id, '눈이 피로하고 소음이 거슬림',                  3, 3 FROM survey_questions WHERE question_content LIKE '오늘 하루 가장 많이%' UNION ALL
SELECT id, '감정 기복이 있고 마음이 무거움',                4, 4 FROM survey_questions WHERE question_content LIKE '오늘 하루 가장 많이%' UNION ALL
SELECT id, '사람들과의 관계에서 에너지가 소모됨',           5, 5 FROM survey_questions WHERE question_content LIKE '오늘 하루 가장 많이%' UNION ALL
SELECT id, '실내에서만 있어서 답답함',                      6, 6 FROM survey_questions WHERE question_content LIKE '오늘 하루 가장 많이%' UNION ALL
SELECT id, '하고 싶은 게 많은데 손을 못 대고 있음',         7, 7 FROM survey_questions WHERE question_content LIKE '오늘 하루 가장 많이%';

INSERT INTO survey_choices (question_id, choice_content, score, display_order)
SELECT id, '아무것도 하지 않고 누워 있고 싶다',             1, 1 FROM survey_questions WHERE question_content LIKE '지금 당장%' UNION ALL
SELECT id, '조용한 곳에서 혼자 있고 싶다',                  2, 2 FROM survey_questions WHERE question_content LIKE '지금 당장%' UNION ALL
SELECT id, '스마트폰·PC를 다 끄고 싶다',                   3, 3 FROM survey_questions WHERE question_content LIKE '지금 당장%' UNION ALL
SELECT id, '누군가와 이야기하며 위로받고 싶다',              4, 4 FROM survey_questions WHERE question_content LIKE '지금 당장%' UNION ALL
SELECT id, '친한 친구를 만나 수다 떨고 싶다',               5, 5 FROM survey_questions WHERE question_content LIKE '지금 당장%' UNION ALL
SELECT id, '바깥 공기를 마시며 걷고 싶다',                  6, 6 FROM survey_questions WHERE question_content LIKE '지금 당장%' UNION ALL
SELECT id, '뭔가 만들거나 창작하고 싶다',                   7, 7 FROM survey_questions WHERE question_content LIKE '지금 당장%';

INSERT INTO survey_choices (question_id, choice_content, score, display_order)
SELECT id, '운동 부족, 허리·목 통증',                       1, 1 FROM survey_questions WHERE question_content LIKE '최근 가장 스트레스%' UNION ALL
SELECT id, '과중한 업무, 끊이지 않는 생각',                 2, 2 FROM survey_questions WHERE question_content LIKE '최근 가장 스트레스%' UNION ALL
SELECT id, '과도한 화면 노출, 알림 폭탄',                  3, 3 FROM survey_questions WHERE question_content LIKE '최근 가장 스트레스%' UNION ALL
SELECT id, '감정을 표현하지 못하고 혼자 삭힘',              4, 4 FROM survey_questions WHERE question_content LIKE '최근 가장 스트레스%' UNION ALL
SELECT id, '인간관계 갈등, 대화 단절',                     5, 5 FROM survey_questions WHERE question_content LIKE '최근 가장 스트레스%' UNION ALL
SELECT id, '도시·실내 생활의 피로감',                      6, 6 FROM survey_questions WHERE question_content LIKE '최근 가장 스트레스%' UNION ALL
SELECT id, '창의적 에너지를 발산할 곳이 없음',              7, 7 FROM survey_questions WHERE question_content LIKE '최근 가장 스트레스%';

INSERT INTO survey_choices (question_id, choice_content, score, display_order)
SELECT id, '몸을 쉬게 해줄 공간',                          1, 1 FROM survey_questions WHERE question_content LIKE '지금 나에게%' UNION ALL
SELECT id, '생각을 비울 수 있는 고요함',                    2, 2 FROM survey_questions WHERE question_content LIKE '지금 나에게%' UNION ALL
SELECT id, '자극 없는 조용한 환경',                         3, 3 FROM survey_questions WHERE question_content LIKE '지금 나에게%' UNION ALL
SELECT id, '감정을 나눌 수 있는 사람',                      4, 4 FROM survey_questions WHERE question_content LIKE '지금 나에게%' UNION ALL
SELECT id, '편하게 웃을 수 있는 시간',                      5, 5 FROM survey_questions WHERE question_content LIKE '지금 나에게%' UNION ALL
SELECT id, '자연과 함께하는 순간',                          6, 6 FROM survey_questions WHERE question_content LIKE '지금 나에게%' UNION ALL
SELECT id, '나만의 무언가를 만드는 시간',                   7, 7 FROM survey_questions WHERE question_content LIKE '지금 나에게%';

INSERT INTO survey_choices (question_id, choice_content, score, display_order)
SELECT id, '집에서 아무것도 안 하고 뒹굴기',               1, 1 FROM survey_questions WHERE question_content LIKE '이상적인 주말%' UNION ALL
SELECT id, '조용한 카페에서 책 읽기',                       2, 2 FROM survey_questions WHERE question_content LIKE '이상적인 주말%' UNION ALL
SELECT id, '스마트폰 없이 음악만 들으며 쉬기',              3, 3 FROM survey_questions WHERE question_content LIKE '이상적인 주말%' UNION ALL
SELECT id, '가족·연인과 함께 집에서 보내기',               4, 4 FROM survey_questions WHERE question_content LIKE '이상적인 주말%' UNION ALL
SELECT id, '친구들과 맛있는 걸 먹으러 나가기',              5, 5 FROM survey_questions WHERE question_content LIKE '이상적인 주말%' UNION ALL
SELECT id, '공원이나 숲길 산책하기',                        6, 6 FROM survey_questions WHERE question_content LIKE '이상적인 주말%' UNION ALL
SELECT id, '그림 그리기·요리·핸드메이드 만들기',            7, 7 FROM survey_questions WHERE question_content LIKE '이상적인 주말%';

-- ============================================================
-- [3] 챌린지 3개 (challenges) — 2차 MVP용
-- ============================================================
INSERT INTO challenges (title, description, duration_days, verification_type, achievement_badge_id) VALUES
('7일 산책 챌린지',  '일주일 동안 매일 산책하고 인증 사진을 올려보세요!', 7, 'photo', 4),
('마음 챙김 5일',    '5일 연속 명상 또는 호흡법을 실천하고 소감을 남겨보세요.', 5, 'text',  5),
('디지털 디톡스',    '7일 동안 하루 1시간 스마트폰 없이 지내고 체크해보세요.', 7, 'check', 1);
