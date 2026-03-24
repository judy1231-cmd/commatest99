import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import UserNavbar from '../../components/user/UserNavbar';
import { useRestActivities } from '../../api/useRestActivities';
import ActivityModal from '../../components/user/ActivityModal';

const TYPE = {
  key: 'physical',
  name: '신체의 이완',
  engName: 'Body Rest',
  icon: 'fitness_center',
  desc: '쌓인 근육 긴장을 풀고 몸이 보내는 신호에 귀 기울이는 시간',
  color: '#4CAF82',
  heroImg: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
};

const CHECKLIST = [
  '어깨와 목이 항상 뭉쳐있다.',
  '잠을 자도 피로가 풀리지 않는다.',
  '만성적인 두통이나 눈의 피로가 있다.',
  '온몸에 힘이 없고 무거운 느낌이 든다.',
  '소화가 잘 안 되거나 속이 불편하다.',
  '집중하기 어렵고 몸이 늘 긴장되어 있다.',
];

const EFFECTS = [
  { icon: 'monitor_heart', stat: '28% ↓', label: '스트레스 호르몬 감소' },
  { icon: 'bedtime', stat: '수면 질 ↑', label: '깊은 수면 시간 증가' },
  { icon: 'shield', stat: '면역력 ↑', label: '자연살해세포 활성화' },
];

const ROUTINE = {
  totalTime: '약 45분',
  steps: [
    { title: '5분 전신 스트레칭', time: '5분', desc: '목→어깨→허리→다리 순서로 천천히. 숨을 내쉬며 근육 이완' },
    { title: '유산소 운동', time: '30분', desc: '걷기, 자전거, 수영 중 하나 선택. 대화할 수 있는 강도 유지' },
    { title: '쿨다운 + 수분 보충', time: '10분', desc: '천천히 걸으며 심박수 회복. 운동 직후 상온 물 500ml 섭취' },
  ],
};

const TIP = {
  quote: '몸을 움직이는 것만으로도 뇌에서 엔도르핀이 분비됩니다',
  body: '하버드 의과대학 연구에 따르면 주 3회 30분 이상의 유산소 운동은 우울증 치료제와 유사한 효과를 보입니다. 처음에는 10분 걷기로 시작해도 충분해요.',
  source: '하버드 의과대학 운동과 뇌 건강 연구 (2023)',
};

// 위도/경도 기반으로 국내 판단 (한국 영토: 33~38.6°N, 124.5~132°E)
const OVERSEAS_KW = ['인도네시아','일본','미국','중국','태국','베트남','프랑스','이탈리아','스위스','호주','뉴질랜드','필리핀','싱가포르','말레이시아','인도','스페인','독일','영국','그리스','터키','캐나다','페루','멕시코'];
function getLocation(place) {
  if (place.latitude && place.longitude) {
    const lat = Number(place.latitude), lng = Number(place.longitude);
    if (lat >= 33.0 && lat <= 38.6 && lng >= 124.5 && lng <= 132.0) return '국내';
    return '해외';
  }
  const addr = place.address || '';
  if (OVERSEAS_KW.some(k => addr.includes(k))) return '해외';
  return /[\uAC00-\uD7A3]/.test(addr) ? '국내' : '해외';
}

// 태그 키워드로 난이도 산출
const HARD_TAGS = ['등산', '하이킹', '암벽', '서핑', '다이빙', '트레킹', '래프팅', '클라이밍'];
const EASY_TAGS = ['카페', '공원', '독서', '산책', '미술관', '박물관', '수족관', '스파', '온천', '찜질'];
function getDifficulty(place) {
  const tags = (place.tags || []).join(' ');
  if (HARD_TAGS.some(k => tags.includes(k))) return '높음';
  if (EASY_TAGS.some(k => tags.includes(k))) return '낮음';
  return '보통';
}

const DIFFICULTY_COLORS = { 낮음: '#4CAF82', 보통: '#FFB830', 높음: '#EF4444' };

function getDistanceKm(lat1, lng1, lat2, lng2) {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = Math.sin(dLat/2)**2 + Math.cos(lat1*Math.PI/180)*Math.cos(lat2*Math.PI/180)*Math.sin(dLng/2)**2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
}

function RestPhysical() {
  const navigate = useNavigate();
  const [selectedActivity, setSelectedActivity] = useState(null);
  const { activities, loading: activitiesLoading } = useRestActivities('physical');

  const [nearbyPlaces, setNearbyPlaces] = useState([]);
  const [nearbyLoading, setNearbyLoading] = useState(false);
  const [locationFilter, setLocationFilter] = useState('전체');
  const [difficultyFilter, setDifficultyFilter] = useState('전체');
  const [userLocation, setUserLocation] = useState(null);

  const handleLocationFilter = (v) => {
    if (v === '내 주변' && !userLocation) {
      navigator.geolocation?.getCurrentPosition(
        pos => setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
        () => {}
      );
    }
    setLocationFilter(v);
  };

  useEffect(() => {
    setNearbyLoading(true);
    fetch(`/api/places?restType=${TYPE.key}&size=6`)
      .then(r => r.json())
      .then(data => {
        if (data.success && data.data?.places) setNearbyPlaces(data.data.places);
      })
      .catch(() => {})
      .finally(() => setNearbyLoading(false));
  }, []);

  const filteredPlaces = nearbyPlaces.filter(place => {
    if (locationFilter === '국내' && getLocation(place) !== '국내') return false;
    if (locationFilter === '해외' && getLocation(place) !== '해외') return false;
    if (locationFilter === '내 주변') {
      if (!userLocation || !place.latitude || !place.longitude) return false;
      if (getDistanceKm(userLocation.lat, userLocation.lng, Number(place.latitude), Number(place.longitude)) > 50) return false;
    }
    if (difficultyFilter !== '전체' && getDifficulty(place) !== difficultyFilter) return false;
    return true;
  });

  return (
    <>
    <div className="min-h-screen bg-[#F7F7F8]">
      <UserNavbar />

      <div className="relative">
        <div className="relative h-60 overflow-hidden">
          <img src={TYPE.heroImg} alt={TYPE.name} className="w-full h-full object-cover" onError={(e) => { e.target.style.display = 'none'; }} />
          <div className="absolute bottom-0 left-0 right-0 px-8 pb-6" style={{ textShadow: '0 1px 6px rgba(0,0,0,0.8)' }}>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full bg-white/20 backdrop-blur-sm text-white/90">
                {TYPE.engName}
              </span>
            </div>
            <h1 className="text-[28px] font-extrabold text-white tracking-tight">{TYPE.name}</h1>
            <p className="text-white/70 text-[13px] mt-0.5">{TYPE.desc}</p>
          </div>
        </div>

        <div className="relative -mt-5 bg-[#F7F7F8] rounded-t-3xl pt-6 px-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-9 h-9 rounded-full flex items-center justify-center" style={{ backgroundColor: '#F0FAF5' }}>
              <span className="material-icons text-[18px]" style={{ color: TYPE.color }}>{TYPE.icon}</span>
            </div>
            <div>
              <p className="text-[13px] font-extrabold" style={{ color: TYPE.color }}>{TYPE.name}</p>
              <p className="text-[11px] text-slate-400">신체 긴장 완화 · 순환 개선 · 면역 강화</p>
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

            {/* 체크리스트 */}
            <section className="mb-10">
              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
                <div className="flex items-center gap-2 mb-5">
                  <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ backgroundColor: TYPE.color + '15' }}>
                    <span className="material-icons text-sm" style={{ color: TYPE.color }}>checklist</span>
                  </div>
                  <div>
                    <h3 className="font-extrabold text-slate-800 text-sm">신체적 휴식이 필요한 신호</h3>
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
                  <p className="text-xs text-slate-400">※ 3개 이상 해당된다면 오늘은 신체의 이완에 집중하세요.</p>
                </div>
              </div>
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

            {/* 추천 활동 */}
            <section className="mb-10">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-[17px] font-extrabold text-slate-800">지금 바로 해봐요</h2>
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
                      className="group bg-white rounded-2xl border border-slate-100 shadow-sm p-5 cursor-pointer hover:shadow-md hover:border-green-200 transition-all">
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
                      <div className="mt-3 flex justify-end">
                        <button
                          onClick={(e) => { e.stopPropagation(); navigate('/rest-record', { state: { prefill: { restType: TYPE.key, activityName: act.activityName, duration: act.durationMinutes } } }); }}
                          className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-white text-[11px] font-bold hover:opacity-80 transition-opacity"
                          style={{ backgroundColor: TYPE.color }}
                        >
                          <span className="material-icons text-[13px]">edit_note</span>
                          기록
                        </button>
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

            {/* 더 찾아보기 */}
            <section className="mb-10">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-[17px] font-extrabold text-slate-800">더 찾아보기</h2>
                <span className="text-xs text-slate-400">{filteredPlaces.length}개 장소</span>
              </div>

              {/* 필터 칩 */}
              <div className="flex flex-wrap gap-2 mb-4">
                <div className="flex items-center gap-1.5 bg-white border border-slate-200 rounded-xl px-2.5 py-1.5">
                  <span className="material-icons text-[13px] text-slate-400">flight</span>
                  {['전체', '내 주변', '국내', '해외'].map(v => (
                    <button key={v} onClick={() => handleLocationFilter(v)}
                      className={`px-2.5 py-0.5 rounded-lg text-xs font-bold transition-all ${locationFilter === v ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-slate-600'}`}>
                      {v}
                    </button>
                  ))}
                </div>
                <div className="flex items-center gap-1.5 bg-white border border-slate-200 rounded-xl px-2.5 py-1.5">
                  <span className="material-icons text-[13px] text-slate-400">signal_cellular_alt</span>
                  {['전체', '낮음', '보통', '높음'].map(v => (
                    <button key={v} onClick={() => setDifficultyFilter(v)}
                      className={`px-2.5 py-0.5 rounded-lg text-xs font-bold transition-all ${difficultyFilter === v ? 'text-white' : 'text-slate-400 hover:text-slate-600'}`}
                      style={difficultyFilter === v && v !== '전체' ? { backgroundColor: DIFFICULTY_COLORS[v] } : difficultyFilter === v ? { backgroundColor: '#1e293b' } : {}}>
                      {v}
                    </button>
                  ))}
                </div>
              </div>

              {nearbyLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[1,2].map(i => <div key={i} className="bg-white rounded-2xl border border-slate-100 p-5 animate-pulse h-24" />)}
                </div>
              ) : filteredPlaces.length === 0 ? (
                <div className="bg-white rounded-2xl border border-slate-100 p-10 text-center">
                  <span className="material-icons text-4xl text-slate-200 block mb-2">location_off</span>
                  <p className="text-slate-400 text-sm font-medium">
                    {nearbyPlaces.length === 0 ? '장소 데이터를 준비 중이에요' : '조건에 맞는 장소가 없어요'}
                  </p>
                  <p className="text-slate-300 text-xs mt-1">지도에서 직접 탐색해보세요</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {filteredPlaces.map((place) => {
                    const difficulty = getDifficulty(place);
                    const location = getLocation(place);
                    return (
                    <div key={place.id}
                      onClick={() => navigate('/map', { state: { restType: TYPE.key, highlightPlace: { placeId: place.id, name: place.name, location: place.address } } })}
                      className="group bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden flex cursor-pointer hover:shadow-md hover:border-green-200 transition-all">
                      <div className="w-24 shrink-0 relative overflow-hidden" style={{ minHeight: '90px', background: `linear-gradient(135deg, ${TYPE.color}CC, ${TYPE.color}88)` }}>
                        <div className="absolute inset-0 flex items-center justify-center">
                          <span className="material-icons text-2xl text-white/90">{TYPE.icon}</span>
                        </div>
                        {place.photoUrl && (
                          <img src={place.photoUrl} alt={place.name} className="absolute inset-0 w-full h-full object-cover" onError={(e) => { e.currentTarget.style.display = 'none'; }} />
                        )}
                        {/* 국내/해외 뱃지 */}
                        <span className="absolute top-1.5 left-1.5 text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-black/40 text-white backdrop-blur-sm">
                          {location}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0 p-4">
                        <div className="flex items-start justify-between gap-1 mb-0.5">
                          <h4 className="font-bold text-slate-800 text-sm leading-snug">{place.name}</h4>
                          {/* 난이도 뱃지 */}
                          <span className="shrink-0 text-[9px] font-extrabold px-1.5 py-0.5 rounded-full text-white"
                            style={{ backgroundColor: DIFFICULTY_COLORS[difficulty] }}>
                            {difficulty}
                          </span>
                        </div>
                        <div className="flex items-center gap-1 mb-2">
                          <span className="material-icons text-[11px] text-slate-300">location_on</span>
                          <p className="text-[11px] text-slate-400 truncate">{place.address}</p>
                        </div>
                        {place.operatingHours && (
                          <p className="text-xs text-slate-400 flex items-center gap-1">
                            <span className="material-icons text-[11px]">schedule</span>
                            {place.operatingHours}
                          </p>
                        )}
                        {place.aiScore && (
                          <div className="flex items-center gap-0.5 mt-1">
                            <span className="material-icons text-amber-400 text-xs">star</span>
                            <span className="text-xs font-bold text-slate-600">{Number(place.aiScore).toFixed(1)}</span>
                          </div>
                        )}
                        {place.tags && place.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-2">
                            {place.tags.slice(0, 3).map((tag, j) => (
                              <span key={j} className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-50 text-slate-500">#{tag}</span>
                            ))}
                          </div>
                        )}
                      </div>
                      <div className="flex items-center pr-3 opacity-0 group-hover:opacity-100 transition-opacity">
                        <span className="material-icons text-slate-300">chevron_right</span>
                      </div>
                    </div>
                    );
                  })}
                </div>
              )}

              <Link to="/map"
                state={{ restType: TYPE.key }}
                className="flex items-center justify-center gap-2 w-full mt-4 py-3.5 rounded-2xl border border-slate-200 bg-white text-sm font-bold text-slate-500 hover:border-green-300 hover:text-green-600 transition-all">
                <span className="material-icons text-base">map</span>
                지도에서 더 보기
              </Link>
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
    </>
  );
}

export default RestPhysical;
