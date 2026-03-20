import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import UserNavbar from '../../components/user/UserNavbar';
import { useRestActivities } from '../../api/useRestActivities';
import ActivityModal from '../../components/user/ActivityModal';

const TYPE = {
  key: 'nature',
  name: '자연의 연결',
  engName: 'Nature Rest',
  icon: 'forest',
  desc: '자연 속에서 몸과 마음의 리듬을 되찾고 살아있음을 느끼는 시간',
  color: '#2ECC9A',
  chipBg: '#ECFDF5',
  heroImg: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
};

const MAIN_TABS = [
  { key: 'walk',     label: '산책',   icon: 'directions_walk' },
  { key: 'trekking', label: '트레킹', icon: 'hiking' },
  { key: 'travel',   label: '여행',   icon: 'luggage' },
];

const WALK_LEVEL = [
  { key: 'light',  label: '가볍게',   icon: 'self_improvement' },
  { key: 'active', label: '활기차게', icon: 'directions_run' },
];

const WEATHER_OPTIONS = [
  { key: 'sunny',  label: '맑음', icon: 'wb_sunny' },
  { key: 'cloudy', label: '흐림', icon: 'cloud' },
  { key: 'indoor', label: '비/눈', icon: 'umbrella' },
];

const WALK_PLACES = [
  { name: '서울숲', location: '서울 성동구', distance: '1~3km', desc: '도심 속 숲. 평지 위주라 가볍게 걷기에 딱 좋아', category: 'walk', walkLevel: 'light', weather: ['sunny', 'cloudy'], tags: ['숲길', '평지', '가족'], icon: 'forest', gradient: 'from-emerald-400 to-green-500' },
  { name: '올림픽공원', location: '서울 송파구', distance: '둘레 6.5km 중 일부', desc: '평탄한 산책로와 넓은 잔디밭. 벤치가 많아 중간 휴식 가능', category: 'walk', walkLevel: 'light', weather: ['sunny', 'cloudy'], tags: ['공원', '포장길', '벤치'], icon: 'park', gradient: 'from-green-400 to-teal-500' },
  { name: '국립중앙박물관 야외정원', location: '서울 용산구', distance: '0.5~1km', desc: '조용한 정원 산책. 거리 짧고 지붕 있는 회랑도 있어', category: 'walk', walkLevel: 'light', weather: ['sunny', 'cloudy', 'indoor'], tags: ['정원', '짧은 거리', '실내연결'], icon: 'museum', gradient: 'from-amber-500 to-orange-500' },
  { name: '코엑스 아쿠아리움 & 별마당도서관', location: '서울 강남구', distance: '실내 자유 이동', desc: '비 오는 날 실내에서 자연 감성 충전. 물과 식물 가득', category: 'walk', walkLevel: 'light', weather: ['indoor'], tags: ['실내', '비오는날', '도심'], icon: 'water_drop', gradient: 'from-indigo-400 to-violet-500' },
  { name: '아침고요수목원', location: '경기 가평군', distance: '1~2km', desc: '흐린 날도 초록이 가득. 사계절 모두 아름답고 온실도 있어', category: 'walk', walkLevel: 'light', weather: ['sunny', 'cloudy', 'indoor'], tags: ['수목원', '온실', '당일치기'], icon: 'local_florist', gradient: 'from-teal-400 to-emerald-500' },
  { name: '한강 반포지구', location: '서울 서초구', distance: '1~5km 자유 코스', desc: '탁 트인 한강변. 바람 맞으며 원하는 만큼 걸을 수 있어', category: 'walk', walkLevel: 'active', weather: ['sunny'], tags: ['강변', '평지', '야경'], icon: 'water', gradient: 'from-sky-400 to-blue-500' },
  { name: '북한산 둘레길', location: '서울 은평구', distance: '구간별 3~7km', desc: '경사 완만한 숲길. 피톤치드 가득한 자연 속 걷기', category: 'walk', walkLevel: 'active', weather: ['sunny', 'cloudy'], tags: ['숲길', '경사', '자연'], icon: 'landscape', gradient: 'from-green-500 to-emerald-700' },
  { name: '경의선 숲길 (전 구간)', location: '서울 마포구', distance: '6.3km', desc: '마을과 자연이 어우러진 선형 공원. 중간에 카페도 많아', category: 'walk', walkLevel: 'active', weather: ['sunny', 'cloudy'], tags: ['선형공원', '포장길', '카페'], icon: 'route', gradient: 'from-lime-400 to-green-500' },
  { name: '올림픽공원 (전 코스)', location: '서울 송파구', distance: '둘레 6.5km', desc: '88호수 한 바퀴 + 몽촌토성 코스. 숲과 호수를 함께 즐기는 코스', category: 'walk', walkLevel: 'active', weather: ['sunny', 'cloudy'], tags: ['공원', '전코스', '호수'], icon: 'park', gradient: 'from-emerald-500 to-teal-600' },
  { name: '북한산 국립공원 (백운대)', location: '서울 강북구', distance: '약 8km (왕복)', desc: '서울에서 가장 유명한 트레킹 코스. 정상에서 서울 전체 조망 가능', category: 'trekking', weather: ['sunny'], tags: ['등산', '정상', '서울조망'], icon: 'landscape', gradient: 'from-stone-400 to-slate-500' },
  { name: '설악산 울산바위', location: '강원 속초시', distance: '약 6km (왕복)', desc: '기암절벽과 탁 트인 동해 뷰. 당일치기 가능한 강원 대표 트레킹', category: 'trekking', weather: ['sunny'], tags: ['트레킹', '동해뷰', '당일치기'], icon: 'terrain', gradient: 'from-slate-400 to-zinc-600' },
  { name: '지리산 둘레길', location: '전남/전북/경남', distance: '구간별 10~20km', desc: '3개 도에 걸친 장거리 트레킹. 마을과 자연이 이어진 치유의 길', category: 'trekking', weather: ['sunny', 'cloudy'], tags: ['장거리', '둘레길', '힐링'], icon: 'hiking', gradient: 'from-green-600 to-emerald-700' },
  { name: '한라산 성판악 코스', location: '제주 제주시', distance: '약 19km (왕복)', desc: '제주 최고봉 트레킹. 예약 필수, 체력 소모 크지만 성취감 최고', category: 'trekking', weather: ['sunny'], tags: ['제주', '예약필수', '고난이도'], icon: 'filter_hdr', gradient: 'from-cyan-500 to-sky-600' },
  { name: '아침고요수목원', location: '경기 가평군', distance: '2~3km', desc: '봄 튤립·여름 수국·가을 단풍·겨울 설경까지. 사계절 내내 다른 얼굴의 힐링 공간', category: 'travel', weather: ['sunny', 'cloudy'], tags: ['수목원', '사계절', '포토스팟'], icon: 'local_florist', gradient: 'from-pink-400 to-rose-500' },
  { name: '내장산 단풍 트레일', location: '전북 정읍시', distance: '5~8km', desc: '국내 최고의 단풍 명소. 가을엔 온 산이 붉게 물들어 비현실적인 풍경', category: 'travel', weather: ['sunny', 'cloudy'], tags: ['단풍', '가을', '국립공원'], icon: 'forest', gradient: 'from-red-400 to-orange-500' },
  { name: '태안 꽃지해수욕장 석양', location: '충남 태안군', distance: '해변 자유 산책', desc: '할미·할아비바위 너머로 지는 석양. 한국에서 가장 아름다운 일몰 중 하나', category: 'travel', weather: ['sunny'], tags: ['석양', '바다', '힐링'], icon: 'beach_access', gradient: 'from-orange-400 to-amber-500' },
  { name: '창덕궁 후원 (비원)', location: '서울 종로구', distance: '약 1.5km', desc: '조선의 비밀 정원. 예약 필수, 소규모 해설 투어로만 입장 가능한 고요한 공간', category: 'travel', weather: ['sunny', 'cloudy'], tags: ['궁궐정원', '예약필수', '고요함'], icon: 'account_balance', gradient: 'from-violet-400 to-purple-600' },
  { name: '아이슬란드 오로라', location: '아이슬란드 레이캬비크', distance: '현지 투어 참여', desc: '하늘을 가득 채운 녹색 빛의 춤. 살면서 꼭 한 번은 봐야 할 자연의 기적', category: 'travel', weather: ['sunny'], tags: ['오로라', '해외', '버킷리스트'], icon: 'nights_stay', gradient: 'from-indigo-500 to-blue-700' },
];

const CHECKLIST = [
  '창문 없는 방에 갇힌 기분이 든다.',
  '디지털 기기 없이는 불안하다.',
  '이유 없는 만성 피로가 계속된다.',
  '계절의 변화를 감각하지 못한다.',
];

const EFFECTS = [
  { icon: 'air', stat: '21% ↓', label: '코르티솔 수치 감소' },
  { icon: 'visibility', stat: '20% ↑', label: '집중력 향상' },
  { icon: 'favorite', stat: '혈압 안정', label: '심박수·혈압 정상화' },
];

const ROUTINE = {
  totalTime: '약 30분',
  steps: [
    { title: '디지털 기기 주머니에 넣기', time: '1분', desc: '스마트폰 화면 끄고 주머니에. 사진 찍고 싶어도 처음 10분만 참기' },
    { title: '자연 속 천천히 걷기', time: '20분', desc: '빠르게 걷지 않기. 발바닥으로 땅을 느끼며. 보이는 색과 들리는 소리에 집중' },
    { title: '한 곳에 앉아 멈추기', time: '5분', desc: '벤치나 잔디에 앉아 아무것도 하지 않기. 자연이 주는 소리를 그냥 듣기' },
  ],
};

const TIP = {
  quote: '나무가 많은 곳에 20분만 있어도 뇌가 달라집니다',
  body: '일본의 "신린요쿠(숲욕)" 연구에 따르면 20~30분의 숲 산책 후 NK(자연살해)세포가 50% 증가하고 코르티솔이 21% 감소합니다. 피톤치드를 들이마시는 것만으로도 면역력이 올라가요.',
  source: '일본 의학박사 Qing Li, 신린요쿠 연구 (2010)',
};

function RestNature() {
  const navigate = useNavigate();
  const [mainTab, setMainTab] = useState('walk');
  const [walkLevel, setWalkLevel] = useState('light');
  const [weather, setWeather] = useState('sunny');
  const [selectedActivity, setSelectedActivity] = useState(null);
  const { activities, loading: activitiesLoading } = useRestActivities('nature');


  const filteredPlaces = WALK_PLACES.filter(p => {
    if (p.category !== mainTab) return false;
    if (mainTab === 'walk') return p.walkLevel === walkLevel && p.weather.includes(weather);
    if (mainTab === 'trekking') return p.weather.includes(weather);
    return true; // travel: 전체 표시
  });

  return (
    <div className="min-h-screen bg-[#F7F7F8]">
      <UserNavbar />

      {/* 히어로 */}
      <div className="relative">
        <div className="relative h-60 overflow-hidden">
          <img src={TYPE.heroImg} alt={TYPE.name} className="w-full h-full object-cover" onError={(e) => { e.target.style.display = 'none'; }} />
          <div className="absolute bottom-0 left-0 right-0 px-8 pb-6" style={{ textShadow: '0 1px 6px rgba(0,0,0,0.8)' }}>
            <span className="inline-block text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full mb-2 bg-white/20 backdrop-blur-sm text-white/90">
              {TYPE.engName}
            </span>
            <h1 className="text-[28px] font-extrabold text-white tracking-tight">{TYPE.name}</h1>
            <p className="text-white/70 text-[13px] mt-0.5">{TYPE.desc}</p>
          </div>
        </div>

        {/* 브릿지 */}
        <div className="relative -mt-5 bg-[#F7F7F8] rounded-t-3xl pt-6 px-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-9 h-9 rounded-full flex items-center justify-center" style={{ backgroundColor: TYPE.chipBg }}>
              <span className="material-icons text-[18px]" style={{ color: TYPE.color }}>{TYPE.icon}</span>
            </div>
            <div>
              <p className="text-[13px] font-extrabold" style={{ color: TYPE.color }}>{TYPE.name}</p>
              <p className="text-[11px] text-slate-400">피톤치드 충전 · 신체 리듬 회복 · 디지털 디톡스</p>
            </div>
          </div>

          <main className="max-w-4xl mx-auto">

            {/* 효과 배지 */}
            <section className="mb-8">
              <div className="grid grid-cols-3 gap-3">
                {EFFECTS.map((e, i) => (
                  <div key={i} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 text-center">
                    <div className="w-10 h-10 rounded-full mx-auto mb-2 flex items-center justify-center" style={{ backgroundColor: TYPE.color + '15' }}>
                      <span className="material-icons text-lg" style={{ color: TYPE.color }}>{e.icon}</span>
                    </div>
                    <p className="text-[15px] font-extrabold text-slate-800">{e.stat}</p>
                    <p className="text-[10px] text-slate-400 mt-0.5 leading-tight">{e.label}</p>
                  </div>
                ))}
              </div>
            </section>

            {/* 추천 활동 */}
            <section className="mb-10">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-[17px] font-extrabold text-slate-800">추천 활동</h2>
                <span className="text-xs text-slate-400">탭하면 기록할 수 있어요</span>
              </div>
              {activitiesLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {[1,2,3].map(i => <div key={i} className="bg-white rounded-2xl border border-slate-100 p-5 animate-pulse h-28" />)}
                </div>
              ) : activities.length === 0 ? (
                <div className="bg-white rounded-2xl border border-slate-100 p-8 text-center">
                  <span className="material-icons text-3xl text-slate-200 block mb-2">pending</span>
                  <p className="text-slate-400 text-sm">활동 정보를 불러올 수 없어요</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {activities.map((act) => (
                    <div key={act.id} onClick={() => setSelectedActivity(act)}
                      className="group bg-white rounded-2xl border border-slate-100 shadow-sm p-5 cursor-pointer hover:shadow-md hover:border-emerald-200 transition-all">
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-3" style={{ backgroundColor: TYPE.color + '18' }}>
                        <span className="material-icons text-lg" style={{ color: TYPE.color }}>{TYPE.icon}</span>
                      </div>
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <h4 className="font-bold text-slate-800 text-sm">{act.activityName}</h4>
                        {act.durationMinutes && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ backgroundColor: TYPE.color + '15', color: TYPE.color }}>{act.durationMinutes}분</span>
                        )}
                      </div>
                      <p className="text-xs text-slate-500 leading-relaxed">{act.guideContent}</p>
                      <div className="mt-3 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity" style={{ color: TYPE.color }}>
                        <span className="material-icons text-sm">edit_note</span>
                        <span className="text-xs font-bold">기록하기</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>

            {/* 오늘의 루틴 */}
            <section className="mb-10">
              <h2 className="text-[17px] font-extrabold text-slate-800 mb-4">지금 바로 시작하는 루틴</h2>
              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                <div className="px-5 py-3 border-b border-slate-50 flex items-center gap-2" style={{ background: `linear-gradient(135deg, ${TYPE.color}12, ${TYPE.color}04)` }}>
                  <span className="material-icons text-base" style={{ color: TYPE.color }}>timer</span>
                  <span className="text-sm font-bold text-slate-600">총 소요시간 {ROUTINE.totalTime}</span>
                </div>
                <div className="p-5 space-y-1">
                  {ROUTINE.steps.map((step, i) => (
                    <div key={i} className="flex gap-4">
                      <div className="shrink-0 flex flex-col items-center">
                        <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-extrabold" style={{ backgroundColor: TYPE.color }}>
                          {i + 1}
                        </div>
                        {i < ROUTINE.steps.length - 1 && (
                          <div className="w-px h-full mt-1 mb-1 min-h-[24px]" style={{ backgroundColor: TYPE.color + '30' }} />
                        )}
                      </div>
                      <div className="pb-5 flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-bold text-slate-800 text-sm">{step.title}</h4>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0" style={{ backgroundColor: TYPE.color + '15', color: TYPE.color }}>{step.time}</span>
                        </div>
                        <p className="text-xs text-slate-500 leading-relaxed">{step.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            {/* 필터 + 장소 */}
            <section className="mb-10">
              <h2 className="text-[17px] font-extrabold text-slate-800 mb-4">지금 어떻게 자연을 만나고 싶어요?</h2>

              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 mb-5 flex flex-wrap gap-6">
                {/* 메인 탭 */}
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">활동 유형</p>
                  <div className="flex gap-2">
                    {MAIN_TABS.map(opt => (
                      <button key={opt.key} onClick={() => setMainTab(opt.key)}
                        className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full border-2 text-xs font-bold transition-all"
                        style={mainTab === opt.key
                          ? { backgroundColor: TYPE.color, borderColor: TYPE.color, color: '#fff' }
                          : { backgroundColor: '#f8fafc', borderColor: '#e2e8f0', color: '#64748b' }}>
                        <span className="material-icons text-xs">{opt.icon}</span>{opt.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 산책 레벨 (walk 탭에서만) */}
                {mainTab === 'walk' && (
                  <>
                    <div className="w-px bg-slate-100 self-stretch" />
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">강도</p>
                      <div className="flex gap-2">
                        {WALK_LEVEL.map(opt => (
                          <button key={opt.key} onClick={() => setWalkLevel(opt.key)}
                            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full border-2 text-xs font-bold transition-all"
                            style={walkLevel === opt.key
                              ? { backgroundColor: TYPE.color, borderColor: TYPE.color, color: '#fff' }
                              : { backgroundColor: '#f8fafc', borderColor: '#e2e8f0', color: '#64748b' }}>
                            <span className="material-icons text-xs">{opt.icon}</span>{opt.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  </>
                )}

                {/* 날씨 (travel 제외) */}
                {mainTab !== 'travel' && (
                  <>
                    <div className="w-px bg-slate-100 self-stretch" />
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">날씨</p>
                      <div className="flex gap-2">
                        {WEATHER_OPTIONS.map(opt => (
                          <button key={opt.key} onClick={() => setWeather(opt.key)}
                            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full border-2 text-xs font-bold transition-all"
                            style={weather === opt.key
                              ? { backgroundColor: TYPE.color, borderColor: TYPE.color, color: '#fff' }
                              : { backgroundColor: '#f8fafc', borderColor: '#e2e8f0', color: '#64748b' }}>
                            <span className="material-icons text-xs">{opt.icon}</span>{opt.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  </>
                )}
              </div>

              {filteredPlaces.length === 0 ? (
                <div className="bg-white rounded-2xl border border-slate-100 p-12 text-center">
                  <span className="material-icons text-4xl text-slate-200 block mb-2">search_off</span>
                  <p className="text-slate-400 text-sm font-medium">이 조건에 맞는 공간을 준비 중이에요</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {filteredPlaces.map((place, i) => (
                    <div key={i} onClick={() => navigate('/rest-record')}
                      className="group bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden flex cursor-pointer hover:shadow-md hover:border-emerald-200 transition-all">
                      <div className={`w-16 shrink-0 bg-gradient-to-b ${place.gradient} flex items-center justify-center`}>
                        <span className="material-icons text-2xl text-white/90">{place.icon}</span>
                      </div>
                      <div className="flex-1 min-w-0 p-4">
                        <h4 className="font-bold text-slate-800 text-sm">{place.name}</h4>
                        <div className="flex items-center gap-2 mt-0.5 mb-2 flex-wrap">
                          <div className="flex items-center gap-1">
                            <span className="material-icons text-[11px] text-slate-300">location_on</span>
                            <p className="text-[11px] text-slate-400">{place.location}</p>
                          </div>
                          {place.distance && (
                            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-slate-50 text-slate-400">{place.distance}</span>
                          )}
                        </div>
                        <p className="text-xs text-slate-500 leading-relaxed mb-2">{place.desc}</p>
                        <div className="flex flex-wrap gap-1">
                          {place.tags.map((tag, j) => (
                            <span key={j} className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-50 text-slate-500">#{tag}</span>
                          ))}
                        </div>
                      </div>
                      <div className="flex items-center pr-3 opacity-0 group-hover:opacity-100 transition-opacity">
                        <span className="material-icons text-slate-300">chevron_right</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <Link to="/map?restType=nature"
                className="flex items-center justify-center gap-2 w-full mt-4 py-3.5 rounded-2xl border border-slate-200 bg-white text-sm font-bold text-slate-500 hover:border-emerald-300 hover:text-emerald-600 transition-all">
                <span className="material-icons text-base">map</span>
                지도에서 내 주변 자연 공간 찾기
              </Link>
            </section>

            {/* 전문가 팁 */}
            <section className="mb-10">
              <div className="rounded-2xl p-6 relative overflow-hidden" style={{ background: `linear-gradient(135deg, ${TYPE.color}14, ${TYPE.color}06)` }}>
                <span className="material-icons text-[64px] absolute top-2 right-3 opacity-[0.07]" style={{ color: TYPE.color }}>format_quote</span>
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-7 h-7 rounded-full flex items-center justify-center" style={{ backgroundColor: TYPE.color }}>
                    <span className="material-icons text-sm text-white">psychology</span>
                  </div>
                  <span className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">전문가 TIP</span>
                </div>
                <p className="text-[15px] font-bold text-slate-800 leading-relaxed mb-3">"{TIP.quote}"</p>
                <p className="text-xs text-slate-500 leading-relaxed">{TIP.body}</p>
                <p className="text-[11px] font-bold mt-3" style={{ color: TYPE.color }}>— {TIP.source}</p>
              </div>
            </section>

            {/* 체크리스트 */}
            <section className="mb-10">
              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
                <div className="flex items-center gap-2 mb-5">
                  <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ backgroundColor: TYPE.color + '15' }}>
                    <span className="material-icons text-sm" style={{ color: TYPE.color }}>checklist</span>
                  </div>
                  <div>
                    <h3 className="font-extrabold text-slate-800 text-sm">자연 단절 신호 체크</h3>
                    <p className="text-xs text-slate-400">해당하는 항목을 체크해보세요</p>
                  </div>
                </div>
                <div className="space-y-2">
                  {CHECKLIST.map((item, i) => (
                    <label key={i} className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 cursor-pointer transition-all">
                      <input type="checkbox" className="w-4 h-4 rounded shrink-0" style={{ accentColor: TYPE.color }} />
                      <span className="text-sm text-slate-600 font-medium">{item}</span>
                    </label>
                  ))}
                </div>
                <div className="mt-4 pt-4 border-t border-slate-100">
                  <p className="text-xs text-slate-400">※ 2개 이상 해당된다면 오늘은 자연의 연결이 필요합니다.</p>
                </div>
              </div>
            </section>

          </main>
        </div>
      </div>
    </div>

    {selectedActivity && (
      <ActivityModal
        activity={selectedActivity}
        typeColor={TYPE.color}
        typeName={TYPE.key}
        onClose={() => setSelectedActivity(null)}
      />
    )}
  );
}

export default RestNature;
