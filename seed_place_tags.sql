SET NAMES utf8mb4;
USE comma_db;

-- ========================================================
-- EMOTIONAL 국내 567~586
-- ========================================================
INSERT INTO place_tags (place_id, tag_name, rest_type) VALUES
(567, '힐링', 'emotional'), (567, '문화', 'emotional'),
(568, '일몰', 'emotional'), (568, '치유', 'emotional'),
(569, '감성', 'emotional'), (569, '문화', 'emotional'),
(570, '야경', 'sensory'), (570, '감성', 'emotional'),
(571, '카페', 'emotional'), (571, '감성', 'emotional'),
(572, '감성', 'emotional'), (572, '문화', 'emotional'),
(573, '자연', 'nature'), (573, '산책', 'nature'),
(574, '감성', 'emotional'), (574, '문화', 'emotional'),
(575, '자연', 'nature'), (575, '힐링', 'emotional'),
(576, '야경', 'sensory'), (576, '감성', 'emotional'),
(577, '산책로', 'nature'), (577, '치유', 'emotional'),
(578, '감성', 'emotional'), (578, '사색', 'emotional'),
(579, '일몰', 'emotional'), (579, '자연', 'nature'),
(580, '문화', 'emotional'), (580, '음식', 'emotional'),
(581, '감성', 'emotional'), (581, '문화', 'emotional'),
(582, '일몰', 'emotional'), (582, '산책', 'nature'),
(583, '야경', 'sensory'), (583, '산책', 'nature'),
(584, '일몰', 'emotional'), (584, '자연', 'nature'),
(585, '자연', 'nature'), (585, '치유', 'emotional'),
(586, '자연', 'nature'), (586, '힐링', 'emotional');

-- EMOTIONAL 해외 587~606
INSERT INTO place_tags (place_id, tag_name, rest_type) VALUES
(587, '감성', 'emotional'), (587, '힐링', 'emotional'),
(588, '일몰', 'emotional'), (588, '감성', 'emotional'),
(589, '자연', 'nature'), (589, '치유', 'emotional'),
(590, '야경', 'sensory'), (590, '감성', 'emotional'),
(591, '감성', 'emotional'), (591, '문화', 'emotional'),
(592, '감성', 'emotional'), (592, '문화', 'emotional'),
(593, '감성', 'emotional'), (593, '자연', 'nature'),
(594, '일몰', 'emotional'), (594, '감성', 'emotional'),
(595, '자연', 'nature'), (595, '힐링', 'emotional'),
(596, '감성', 'emotional'), (596, '산책', 'nature'),
(597, '자연', 'nature'), (597, '산책', 'nature'),
(598, '산책', 'nature'), (598, '감성', 'emotional'),
(599, '카페', 'emotional'), (599, '감성', 'emotional'),
(600, '크루즈', 'emotional'), (600, '일몰', 'emotional'),
(601, '감성', 'emotional'), (601, '문화', 'emotional'),
(602, '야경', 'sensory'), (602, '힐링', 'emotional'),
(603, '일몰', 'emotional'), (603, '감성', 'emotional'),
(604, '자연', 'nature'), (604, '일몰', 'emotional'),
(605, '감성', 'emotional'), (605, '야경', 'sensory'),
(606, '감성', 'emotional'), (606, '치유', 'emotional');

-- ========================================================
-- CREATIVE 국내 607~624
-- ========================================================
INSERT INTO place_tags (place_id, tag_name, rest_type) VALUES
(607, '도예', 'creative'), (607, '공방', 'creative'),
(608, '캘리그래피', 'creative'), (608, '문화', 'creative'),
(609, '그래피티', 'creative'), (609, '야외', 'creative'),
(610, '공예', 'creative'), (610, '문화', 'creative'),
(611, '전시', 'sensory'), (611, '공예', 'creative'),
(612, '공방', 'creative'), (612, '감성', 'emotional'),
(613, '스튜디오', 'creative'), (613, '문화', 'creative'),
(614, '도예', 'creative'), (614, '공방', 'creative'),
(615, '공예', 'creative'), (615, '문화', 'creative'),
(616, '가죽공예', 'creative'), (616, '스튜디오', 'creative'),
(617, '사진', 'creative'), (617, '문화', 'creative'),
(618, '공예', 'creative'), (618, '문화', 'creative'),
(619, '드로잉', 'creative'), (619, '카페', 'emotional'),
(620, '공예', 'creative'), (620, '문화', 'creative'),
(621, '스튜디오', 'creative'), (621, '독서', 'mental'),
(622, '목각', 'creative'), (622, '공방', 'creative'),
(623, '사진', 'creative'), (623, '스튜디오', 'creative'),
(624, '비즈공예', 'creative'), (624, '공방', 'creative');

-- CREATIVE 해외 625~636
INSERT INTO place_tags (place_id, tag_name, rest_type) VALUES
(625, '가죽공예', 'creative'), (625, '공방', 'creative'),
(626, '드로잉', 'creative'), (626, '스튜디오', 'creative'),
(627, '공예', 'creative'), (627, '문화', 'creative'),
(628, '도예', 'creative'), (628, '공방', 'creative'),
(629, '공예', 'creative'), (629, '문화', 'creative'),
(630, '공예', 'creative'), (630, '문화', 'creative'),
(631, '그래피티', 'creative'), (631, '야외', 'creative'),
(632, '드로잉', 'creative'), (632, '야외', 'creative'),
(633, '공방', 'creative'), (633, '스튜디오', 'creative'),
(634, '드로잉', 'creative'), (634, '스튜디오', 'creative'),
(635, '공예', 'creative'), (635, '문화', 'creative'),
(636, '인쇄', 'creative'), (636, '스튜디오', 'creative');

-- ========================================================
-- SOCIAL 국내 637~646
-- ========================================================
INSERT INTO place_tags (place_id, tag_name, rest_type) VALUES
(637, '광장', 'social'), (637, '문화', 'social'),
(638, '문화', 'social'), (638, '공연', 'social'),
(639, '모임', 'social'), (639, '문화', 'social'),
(640, '피크닉', 'social'), (640, '산책', 'nature'),
(641, '음식', 'social'), (641, '문화', 'social'),
(642, '문화센터', 'social'), (642, '모임', 'social'),
(643, '야시장', 'social'), (643, '음식', 'social'),
(644, '야시장', 'social'), (644, '음식', 'social'),
(645, '바베큐', 'social'), (645, '문화', 'social'),
(646, '모임', 'social'), (646, '네트워킹', 'social');

-- SOCIAL 해외 647~654
INSERT INTO place_tags (place_id, tag_name, rest_type) VALUES
(647, '피크닉', 'social'), (647, '산책', 'nature'),
(648, '벼룩시장', 'creative'), (648, '문화', 'social'),
(649, '시장', 'social'), (649, '음식', 'social'),
(650, '야시장', 'social'), (650, '음식', 'social'),
(651, '카페', 'emotional'), (651, '산책', 'nature'),
(652, '시장', 'social'), (652, '음식', 'social'),
(653, '시장', 'social'), (653, '음식', 'social'),
(654, '야시장', 'social'), (654, '음식', 'social');

-- ========================================================
-- SENSORY 국내 655~664
-- ========================================================
INSERT INTO place_tags (place_id, tag_name, rest_type) VALUES
(655, '미술관', 'sensory'), (655, '전시', 'sensory'),
(656, '미술관', 'sensory'), (656, '전시', 'sensory'),
(657, '박물관', 'sensory'), (657, '문화', 'sensory'),
(658, '야경', 'sensory'), (658, '역사', 'sensory'),
(659, '박물관', 'sensory'), (659, '문화', 'sensory'),
(660, '박물관', 'sensory'), (660, '전통', 'sensory'),
(661, '미디어아트', 'sensory'), (661, '전시', 'sensory'),
(662, '박물관', 'sensory'), (662, '역사', 'sensory'),
(663, '박물관', 'sensory'), (663, '문화', 'sensory'),
(664, '박물관', 'sensory'), (664, '전통', 'sensory');

-- SENSORY 해외 665~672
INSERT INTO place_tags (place_id, tag_name, rest_type) VALUES
(665, '미술관', 'sensory'), (665, '전시', 'sensory'),
(666, '박물관', 'sensory'), (666, '문화', 'sensory'),
(667, '박물관', 'sensory'), (667, '역사', 'sensory'),
(668, '미술관', 'sensory'), (668, '전시', 'sensory'),
(669, '미술관', 'sensory'), (669, '건축', 'sensory'),
(670, '미술관', 'sensory'), (670, '전시', 'sensory'),
(671, '미디어아트', 'sensory'), (671, '전시', 'sensory'),
(672, '미술관', 'sensory'), (672, '문화', 'sensory');

-- ========================================================
-- NATURE 해외 673~682
-- ========================================================
INSERT INTO place_tags (place_id, tag_name, rest_type) VALUES
(673, '자연', 'nature'), (673, '크루즈', 'nature'),
(674, '자연', 'nature'), (674, '호수', 'nature'),
(675, '자연', 'nature'), (675, '생태', 'nature'),
(676, '자연', 'nature'), (676, '크루즈', 'nature'),
(677, '자연', 'nature'), (677, '트레킹', 'nature'),
(678, '자연', 'nature'), (678, '전망', 'nature'),
(679, '자연', 'nature'), (679, '트레킹', 'nature'),
(680, '자연', 'nature'), (680, '꽃공원', 'nature'),
(681, '자연', 'nature'), (681, '생태', 'nature'),
(682, '자연', 'nature'), (682, '해안', 'nature');

-- ========================================================
-- MENTAL 683~690
-- ========================================================
INSERT INTO place_tags (place_id, tag_name, rest_type) VALUES
(683, '템플스테이', 'mental'), (683, '사찰', 'mental'),
(684, '템플스테이', 'mental'), (684, '사찰', 'mental'),
(685, '자연', 'nature'), (685, '명상', 'mental'),
(686, '도서관', 'mental'), (686, '집중', 'mental'),
(687, '명상', 'mental'), (687, '사찰', 'mental'),
(688, '명상센터', 'mental'), (688, '힐링카페', 'mental'),
(689, '명상', 'mental'), (689, '사찰', 'mental'),
(690, '사찰', 'mental'), (690, '트레킹', 'nature');
