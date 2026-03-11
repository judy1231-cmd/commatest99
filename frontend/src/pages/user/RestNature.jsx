import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import UserNavbar from '../../components/user/UserNavbar';
import { useRestActivities } from '../../api/useRestActivities';


const places = [
  { type: 'Arboretum', name: '고요한 수목원', location: '경기도 가평군', rating: '4.8', color: '#16a34a', lat: 37.7956, lng: 127.4538, img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDXzxs2h0HKB3GCbgt1N7mJrlSCMVAzFcJVSMzZwA9bnYLLKN86Fw3KNB-n2XgcaC0FsYG0muTIsjvYpbDXG0Aqam7JO22V46BuLcOjlcIkbmzoEddBAGRKnHB_yc6e5VdO8rsnxm_7SzMAKRTjDAgYF02_hxnjEBqYVDXGEPk11e5x7XVzdZNMx4FBO1b3kSKXk-umF8cZN1_PKsxI97OPEC8PS5hOeeoW8_JcB2XyqR1MjQUC6Gt_5ydjIfwuGXY5fpqoccV8F1c' },
  { type: 'Trail', name: '산들바람 숲길', location: '서울 관악구', rating: '4.6', color: '#15803d', lat: 37.4650, lng: 126.9526, img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAfyj0KTtXer_EUNY_TWyPl4QHhQZXWz1pJGaJK1HPkPH5uN3wlujZOZDgaSarb6HXQX-jCLGKdURhsXdza3_dfew1YXC-U09zxmsRF-BmarHXfxpu_qXwJKK3ABcFXdk0OOY35YHrRW-fsw7ehYNU2OtH7ar6wvsZYTPRx6nI38tXYPdDsC88jcJyAwY2O3bGy_zJ8_auLf7g5WTU5xi5gXLs9JGxiyJkoWpRRce9XSLyAwIdSwqHqAJ6V79a0s1ed4CbsdtRBIe8' },
  { type: 'Beach', name: '달빛 해변', location: '강원도 양양군', rating: '4.9', color: '#0284c7', lat: 38.0754, lng: 128.6231, img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuC8wwu6cJsXj07JmoHANvYHus3UIuhJ9-lEK7SlZIRPo78Juqk9ox3WUr3KOMBBO6_WcIJLA9QA3g_p65Y4gal_0CUCpSvd8TdPA08txF1nH0C4bsTWjxnflc_re6Wzh66tK7xXvuH9slLHOHesH7iQiY7911vUCKF_RVRgNGwnNFQ74-_UVyz1TjjQzdZT3_h7E-6em9-wssFeqVdCj-nS78-qkJOPWU4j-sxHV37IaAmv8fkJFKCfjzNNG2tkAnKOLyr2IHlZLGw' },
  { type: 'Nature Park', name: '비밀의 정원', location: '제주 서귀포시', rating: '4.7', color: '#059669', lat: 33.2541, lng: 126.5601, img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAwK_x6GismrvUQt0ZUWnogmUiKmmO4R6FrqA-qSy9t1qpndd1J4WtvszjAgquU-RTtFkgVJhqLYt3f8uz1f5OVMBzkRyNbKKG_ArS-4f8d0F5FilvTK5iZkJRZrLBkikBITpvTZDXE9dofqxUjD8o9yNxSV0ClVpUixgBYH7lNC0sl7zJ-hSbV2waNIphW0EPLI3ePHGKrThdTNSVzqQJVcYarG6rPGprL86eiwvImYmS80pWC87Fsk_lnk9XhN3SxSE4clyfuH0A' },
];

// category: 'walk' | 'trekking' | 'travel'
// walkLevel: 'light'(가볍게) | 'active'(활기차게)  — walk 탭에서만 사용
// lat/lng: 지도 마커 표시용
const WALK_PLACES = [
  // ── 산책 / 가볍게 ──────────────────────────────────────
  {
    name: '서울숲', location: '서울 성동구', distance: '1~3km',
    desc: '도심 속 숲. 평지 위주라 가볍게 걷기에 딱 좋아',
    category: 'walk', walkLevel: 'light', weather: ['sunny', 'cloudy'],
    tags: ['숲길', '평지', '가족'], icon: 'forest', color: '#16a34a',
    lat: 37.5444, lng: 127.0374,
  },
  {
    name: '올림픽공원', location: '서울 송파구', distance: '둘레 6.5km 중 일부',
    desc: '평탄한 산책로와 넓은 잔디밭. 벤치가 많아 중간 휴식 가능',
    category: 'walk', walkLevel: 'light', weather: ['sunny', 'cloudy'],
    tags: ['공원', '포장길', '벤치'], icon: 'park', color: '#059669',
    lat: 37.5220, lng: 127.1219,
  },
  {
    name: '국립중앙박물관 야외정원', location: '서울 용산구', distance: '0.5~1km',
    desc: '조용한 정원 산책. 거리 짧고 지붕 있는 회랑도 있어',
    category: 'walk', walkLevel: 'light', weather: ['sunny', 'cloudy', 'indoor'],
    tags: ['정원', '짧은 거리', '실내연결'], icon: 'museum', color: '#b45309',
    lat: 37.5238, lng: 126.9804,
  },
  {
    name: '코엑스 아쿠아리움 & 별마당도서관', location: '서울 강남구', distance: '실내 자유 이동',
    desc: '비 오는 날 실내에서 자연 감성 충전. 물과 식물 가득',
    category: 'walk', walkLevel: 'light', weather: ['indoor'],
    tags: ['실내', '비오는날', '도심'], icon: 'water_drop', color: '#6366f1',
    lat: 37.5126, lng: 127.0595,
  },
  {
    name: '아침고요수목원', location: '경기 가평군', distance: '1~2km',
    desc: '흐린 날도 초록이 가득. 사계절 모두 아름답고 온실도 있어',
    category: 'walk', walkLevel: 'light', weather: ['sunny', 'cloudy', 'indoor'],
    tags: ['수목원', '온실', '당일치기'], icon: 'local_florist', color: '#16a34a',
    lat: 37.7956, lng: 127.4538,
  },

  // ── 산책 / 활기차게 ─────────────────────────────────────
  {
    name: '한강 반포지구', location: '서울 서초구', distance: '1~5km 자유 코스',
    desc: '탁 트인 한강변. 바람 맞으며 원하는 만큼 걸을 수 있어',
    category: 'walk', walkLevel: 'active', weather: ['sunny'],
    tags: ['강변', '평지', '야경'], icon: 'water', color: '#0284c7',
    lat: 37.5046, lng: 126.9948,
  },
  {
    name: '북한산 둘레길', location: '서울 은평구', distance: '구간별 3~7km',
    desc: '경사 완만한 숲길. 피톤치드 가득한 자연 속 걷기',
    category: 'walk', walkLevel: 'active', weather: ['sunny', 'cloudy'],
    tags: ['숲길', '경사', '자연'], icon: 'landscape', color: '#15803d',
    lat: 37.6627, lng: 126.9593,
  },
  {
    name: '경의선 숲길 (전 구간)', location: '서울 마포구', distance: '6.3km',
    desc: '마을과 자연이 어우러진 선형 공원. 중간에 카페도 많아',
    category: 'walk', walkLevel: 'active', weather: ['sunny', 'cloudy'],
    tags: ['선형공원', '포장길', '카페'], icon: 'route', color: '#65a30d',
    lat: 37.5503, lng: 126.9281,
  },
  {
    name: '올림픽공원 (전 코스)', location: '서울 송파구', distance: '둘레 6.5km',
    desc: '88호수 한 바퀴 + 몽촌토성 코스. 숲과 호수를 함께 즐기는 코스',
    category: 'walk', walkLevel: 'active', weather: ['sunny', 'cloudy'],
    tags: ['공원', '전코스', '호수'], icon: 'park', color: '#059669',
    lat: 37.5220, lng: 127.1219,
  },

  // ── 트레킹 ─────────────────────────────────────────────
  {
    name: '북한산 국립공원 (백운대)', location: '서울 강북구', distance: '약 8km (왕복)',
    desc: '서울에서 가장 유명한 트레킹 코스. 정상에서 서울 전체 조망 가능',
    category: 'trekking', weather: ['sunny'],
    tags: ['등산', '정상', '서울조망'], icon: 'landscape', color: '#78716c',
    lat: 37.6593, lng: 126.9763,
  },
  {
    name: '설악산 울산바위', location: '강원 속초시', distance: '약 6km (왕복)',
    desc: '기암절벽과 탁 트인 동해 뷰. 당일치기 가능한 강원 대표 트레킹',
    category: 'trekking', weather: ['sunny'],
    tags: ['트레킹', '동해뷰', '당일치기'], icon: 'terrain', color: '#57534e',
    lat: 38.1198, lng: 128.4656,
  },
  {
    name: '지리산 둘레길', location: '전남/전북/경남', distance: '구간별 10~20km',
    desc: '3개 도에 걸친 장거리 트레킹. 마을과 자연이 이어진 치유의 길',
    category: 'trekking', weather: ['sunny', 'cloudy'],
    tags: ['장거리', '둘레길', '힐링'], icon: 'hiking', color: '#65a30d',
    lat: 35.3373, lng: 127.7281,
  },
  {
    name: '한라산 성판악 코스', location: '제주 제주시', distance: '약 19km (왕복)',
    desc: '제주 최고봉 트레킹. 예약 필수, 체력 소모 크지만 성취감 최고',
    category: 'trekking', weather: ['sunny'],
    tags: ['제주', '예약필수', '고난이도'], icon: 'filter_hdr', color: '#0891b2',
    lat: 33.3617, lng: 126.5292,
  },

  // ── 여행 — 국내 힐링 공원 + 해외 자연 코스 ─────────────
  {
    name: '아침고요수목원', location: '경기 가평군', distance: '2~3km',
    desc: '봄 튤립·여름 수국·가을 단풍·겨울 설경까지. 사계절 내내 다른 얼굴의 힐링 공간',
    category: 'travel', weather: ['sunny', 'cloudy'],
    tags: ['수목원', '사계절', '포토스팟'], icon: 'local_florist', color: '#ec4899',
    lat: 37.7956, lng: 127.4538,
  },
  {
    name: '내장산 단풍 트레일', location: '전북 정읍시', distance: '5~8km',
    desc: '국내 최고의 단풍 명소. 가을엔 온 산이 붉게 물들어 비현실적인 풍경',
    category: 'travel', weather: ['sunny', 'cloudy'],
    tags: ['단풍', '가을', '국립공원'], icon: 'forest', color: '#dc2626',
    lat: 35.4848, lng: 126.8813,
  },
  {
    name: '태안 꽃지해수욕장 석양', location: '충남 태안군', distance: '해변 자유 산책',
    desc: '할미·할아비바위 너머로 지는 석양. 한국에서 가장 아름다운 일몰 중 하나',
    category: 'travel', weather: ['sunny'],
    tags: ['석양', '바다', '힐링'], icon: 'beach_access', color: '#f97316',
    lat: 36.5367, lng: 126.3206,
  },
  {
    name: '창덕궁 후원 (비원)', location: '서울 종로구', distance: '약 1.5km',
    desc: '조선의 비밀 정원. 예약 필수, 소규모 해설 투어로만 입장 가능한 고요한 공간',
    category: 'travel', weather: ['sunny', 'cloudy'],
    tags: ['궁궐정원', '예약필수', '고요함'], icon: 'account_balance', color: '#7c3aed',
    lat: 37.5796, lng: 126.9912,
  },
  {
    name: '🌌 아이슬란드 오로라', location: '아이슬란드 레이캬비크', distance: '현지 투어 참여',
    desc: '하늘을 가득 채운 녹색 빛의 춤. 살면서 꼭 한 번은 봐야 할 자연의 기적',
    category: 'travel', weather: ['sunny'],
    tags: ['오로라', '해외', '버킷리스트'], icon: 'nights_stay', color: '#6366f1',
    lat: 64.1355, lng: -21.8954,
  },
  {
    name: '🏔️ 노르웨이 피오르드', location: '노르웨이 게이랑에르', distance: '크루즈 / 하이킹',
    desc: '수천 년 빙하가 만든 웅장한 협곡. 폭포 소리와 함께하는 숙연한 자연 치유',
    category: 'travel', weather: ['sunny', 'cloudy'],
    tags: ['피오르드', '해외', '크루즈'], icon: 'water', color: '#0284c7',
    lat: 62.1013, lng: 7.2062,
  },
  {
    name: '🌿 뉴질랜드 밀퍼드 사운드', location: '뉴질랜드 사우스랜드', distance: '크루즈 / 트레킹',
    desc: '세계 8대 절경. 끝없이 펼쳐진 피오르드와 쏟아지는 폭포가 온몸의 감각을 열어줘',
    category: 'travel', weather: ['sunny', 'cloudy'],
    tags: ['절경', '해외', '밀퍼드'], icon: 'landscape', color: '#059669',
    lat: -44.6696, lng: 167.9237,
  },
  {
    name: '🏔️ 스위스 융프라우', location: '스위스 인터라켄', distance: '등반 열차 + 트레킹',
    desc: '만년설 위에서 내려다보는 알프스 전경. 공기부터 다른 해발 3,454m의 세계',
    category: 'travel', weather: ['sunny'],
    tags: ['설산', '해외', '알프스'], icon: 'filter_hdr', color: '#64748b',
    lat: 46.5480, lng: 7.9853,
  },
];

const WEATHER_OPTIONS = [
  { key: 'sunny',  label: '맑음', emoji: '☀️' },
  { key: 'cloudy', label: '흐림', emoji: '⛅' },
  { key: 'indoor', label: '비/눈', emoji: '🌧️' },
];

const checklist = [
  '창문 없는 방에 갇힌 기분이 든다.',
  '디지털 기기 없이는 불안하다.',
  '이유 없는 만성 피로가 계속된다.',
  '계절의 변화를 감각하지 못한다.',
];

function RestNature() {
  const navigate = useNavigate();

  // 메인 탭: walk(산책) | trekking(트레킹) | travel(여행)
  const [mainTab, setMainTab] = useState('walk');
  // 산책 탭 서브: light(가볍게) | active(활기차게)
  const [walkLevel, setWalkLevel] = useState('light');
  const [weather, setWeather] = useState('sunny');
  const [liked, setLiked] = useState({});
  const { activities, loading: activitiesLoading } = useRestActivities('nature');

  // API 장소
  const [apiPlaces, setApiPlaces] = useState([]);
  const [apiLoading, setApiLoading] = useState(false);

  useEffect(() => {
    const loadApiPlaces = async () => {
      setApiLoading(true);
      try {
        const res = await fetch('/api/places?restType=nature&page=1&size=20');
        const data = await res.json();
        if (data.success && data.data) {
          setApiPlaces(data.data.places || []);
        }
      } catch {
        // 서버 미연결 시 조용히 무시
      } finally {
        setApiLoading(false);
      }
    };
    loadApiPlaces();
  }, []);

  // 하드코딩 장소 필터
  const filteredPlaces = WALK_PLACES.filter(p => {
    if (mainTab === 'trekking') return p.category === 'trekking';
    if (mainTab === 'travel')   return p.category === 'travel';
    // walk 탭
    return p.category === 'walk' && p.walkLevel === walkLevel && p.weather.includes(weather);
  });

  const MAIN_TABS = [
    { key: 'walk',     label: '산책',   emoji: '🌿' },
    { key: 'trekking', label: '트레킹', emoji: '🥾' },
    { key: 'travel',   label: '여행',   emoji: '✈️' },
  ];

  return (
    <div className="min-h-screen bg-[#F9F7F2]">
      <UserNavbar />
      <main className="max-w-6xl mx-auto px-6 py-10 space-y-20 pb-24 md:pb-10">

        {/* Back */}
        <Link to="/" className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-green-600 transition-colors">
          <span className="material-symbols-outlined text-base">arrow_back</span>
          홈으로
        </Link>

        {/* Hero */}
        <section className="relative h-[500px] rounded-3xl overflow-hidden group">
          <div
            className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105"
            style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuARiHDaxqOu1ze_Oz4cq5MI7ac8Zjh50rum7acFRR7JvVAmmNvD5K-itK_aI3uxaR6t-KTH48wO89hU6MitL8UMrtAdYQ8Po5tYhZVZcZvxrOEcZaY0FsmkVdCWJSdLPwv5DHK6EZtBlpAkj9O_TKhBWZoNbQjnLw0IbsiAAPbJgDUIAJLNCONt85IyY9fx7_ZI1EK4bTwXKXEi5qOtSwdV3cNlpQw7arL3HZH_V0u2ls5vzj1g0zgJoWtoPFgM0t9ZyeCwbgCecdM')" }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent flex flex-col justify-end p-10 lg:p-16">
            <span className="text-green-400 font-semibold mb-4 bg-white/20 backdrop-blur-sm w-fit px-4 py-1 rounded-full text-sm uppercase tracking-widest">Connection with Nature</span>
            <h2 className="text-4xl lg:text-6xl font-bold text-white mb-6">자연의 연결</h2>
            <p className="text-lg lg:text-xl text-white/90 max-w-2xl leading-relaxed">
              도시의 소음을 뒤로하고 자연의 리듬에 몸을 맡기며<br className="hidden md:block" />
              생명력을 회복하는 시간입니다.
            </p>
          </div>
        </section>

        {/* Why + Effects */}
        <section className="grid md:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 text-green-800 bg-green-50 px-4 py-2 rounded-lg font-semibold">
              <span className="material-symbols-outlined">health_and_safety</span>
              <span>자연 결핍과 회복의 원리</span>
            </div>
            <h3 className="text-3xl font-bold leading-tight">자연 결핍 증후군이란?</h3>
            <p className="text-gray-600 leading-relaxed text-lg">
              현대인이 자연과 멀어지며 겪는 정서적 불안과 스트레스 상태를 의미합니다. 시멘트 숲에서 벗어나 초록색을 바라보는 것만으로도 우리 뇌는 휴식 모드로 전환됩니다.
            </p>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-white rounded-xl shadow-sm border border-green-100">
                <span className="material-symbols-outlined text-green-500 mb-2 block">park</span>
                <h4 className="font-bold text-sm">정서적 고립감 해소</h4>
                <p className="text-xs text-gray-500">우울감 28% 감소 효과</p>
              </div>
              <div className="p-4 bg-white rounded-xl shadow-sm border border-green-100">
                <span className="material-symbols-outlined text-green-500 mb-2 block">psychology</span>
                <h4 className="font-bold text-sm">집중력 향상</h4>
                <p className="text-xs text-gray-500">인지 능력의 자연스러운 회복</p>
              </div>
            </div>
          </div>
          <div className="bg-green-500/10 rounded-3xl p-8 lg:p-12 relative overflow-hidden">
            <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-40 h-40 bg-white/30 rounded-full blur-3xl" />
            <h4 className="text-xl font-bold mb-6 text-green-900">자연이 주는 치유 효과</h4>
            <ul className="space-y-4">
              {[
                { title: '스트레스 호르몬(코르티솔) 감소', desc: '숲에서 20분만 걸어도 유의미한 수치 하락' },
                { title: '신체적 그라운딩 효과', desc: '지구의 에너지를 받아 면역력 강화' },
                { title: '심신 안정 및 수면 개선', desc: '자연의 백색소음으로 깊은 숙면 유도' },
              ].map((item, i) => (
                <li key={i} className="flex items-start gap-3">
                  <span className="material-symbols-outlined text-green-500">check_circle</span>
                  <div>
                    <p className="font-semibold">{item.title}</p>
                    <p className="text-sm text-gray-600">{item.desc}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* Activities */}
        <section>
          <div className="flex justify-between items-end mb-8">
            <div>
              <h3 className="text-2xl font-bold text-gray-800">추천 활동</h3>
              <p className="text-gray-500 mt-2">지금 바로 시작할 수 있는 작은 자연과의 교감</p>
            </div>
          </div>
          {activitiesLoading ? (
            <div className="flex justify-center py-10">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500" />
            </div>
          ) : activities.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-2xl border border-slate-100">
              <span className="material-icons text-4xl text-slate-300 block mb-2">pending</span>
              <p className="text-slate-400 text-sm">활동 정보를 불러올 수 없어요</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {activities.map((act) => (
                <div key={act.id} className="group bg-white rounded-2xl border border-slate-100 shadow-sm p-6 hover:shadow-md transition-all cursor-pointer" onClick={() => navigate('/rest-record')}>
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-11 h-11 rounded-xl flex items-center justify-center bg-green-50">
                      <span className="material-icons text-green-600">forest</span>
                    </div>
                    <button onClick={(e) => { e.stopPropagation(); setLiked(prev => ({ ...prev, [act.id]: !prev[act.id] })); }} className="p-1">
                      <span className={`material-icons text-xl transition-colors ${liked[act.id] ? 'text-red-500' : 'text-slate-300 hover:text-red-300'}`}>favorite</span>
                    </button>
                  </div>
                  <h4 className="font-bold text-slate-900 mb-1">{act.activityName}</h4>
                  {act.durationMinutes && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full inline-block mb-2 bg-green-50 text-green-600">{act.durationMinutes}분</span>
                  )}
                  <p className="text-slate-500 text-sm leading-relaxed">{act.guideContent}</p>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* ===== 장소 추천 섹션 ===== */}
        <section>
          <div className="mb-6">
            <h3 className="text-2xl font-bold text-gray-800">오늘 어디로 갈까요?</h3>
            <p className="text-gray-500 mt-2">유형을 선택하면 딱 맞는 자연 장소를 추천해줄게요</p>
          </div>

          {/* ── 메인 탭: 산책 / 트레킹 / 여행 ── */}
          <div className="flex gap-2 mb-6">
            {MAIN_TABS.map(tab => (
              <button
                key={tab.key}
                onClick={() => { setMainTab(tab.key); setLiked({}); }}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-full font-bold text-sm transition-all border-2 ${
                  mainTab === tab.key
                    ? 'bg-green-500 border-green-500 text-white shadow-md'
                    : 'bg-white border-slate-200 text-slate-600 hover:border-green-300'
                }`}
              >
                <span>{tab.emoji}</span>
                {tab.label}
              </button>
            ))}
          </div>

          {/* ── 산책 탭: 서브 옵션 ── */}
          {mainTab === 'walk' && (
            <div className="mb-5 space-y-4">
              {/* 가볍게 / 활기차게 */}
              <div>
                <p className="text-sm font-bold text-slate-600 mb-2">강도 선택</p>
                <div className="flex gap-3">
                  <button
                    onClick={() => setWalkLevel('light')}
                    className={`flex items-center gap-2 px-5 py-2.5 rounded-full border-2 font-bold text-sm transition-all ${
                      walkLevel === 'light'
                        ? 'bg-emerald-500 border-emerald-500 text-white'
                        : 'bg-emerald-50 border-emerald-200 text-emerald-700 hover:border-emerald-400'
                    }`}
                  >
                    🌿 가볍게 <span className="font-normal text-xs opacity-70">(~1시간)</span>
                  </button>
                  <button
                    onClick={() => setWalkLevel('active')}
                    className={`flex items-center gap-2 px-5 py-2.5 rounded-full border-2 font-bold text-sm transition-all ${
                      walkLevel === 'active'
                        ? 'bg-teal-500 border-teal-500 text-white'
                        : 'bg-teal-50 border-teal-200 text-teal-700 hover:border-teal-400'
                    }`}
                  >
                    🏃 활기차게 <span className="font-normal text-xs opacity-70">(2시간+)</span>
                  </button>
                </div>
              </div>

              {/* 날씨 */}
              <div>
                <p className="text-sm font-bold text-slate-600 mb-2">오늘 날씨</p>
                <div className="flex gap-3">
                  {WEATHER_OPTIONS.map(opt => (
                    <button
                      key={opt.key}
                      onClick={() => setWeather(opt.key)}
                      className={`flex items-center gap-2 px-4 py-2 rounded-full border-2 font-bold text-sm transition-all ${
                        weather === opt.key
                          ? 'bg-green-500 border-green-500 text-white'
                          : 'bg-white border-slate-200 text-slate-600 hover:border-green-300'
                      }`}
                    >
                      <span>{opt.emoji}</span>{opt.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ── API 장소 (있을 때만 표시) ── */}
          {apiLoading && (
            <div className="flex justify-center py-6">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-green-500" />
            </div>
          )}
          {!apiLoading && apiPlaces.length > 0 && (
            <div className="mb-6">
              <p className="text-xs font-bold text-green-600 uppercase tracking-wider mb-3 flex items-center gap-1">
                <span className="material-icons text-sm">location_on</span>
                공공데이터 연계 장소
              </p>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {apiPlaces.map((place, i) => (
                  <div
                    key={`api-${i}`}
                    onClick={() => navigate(`/places/${place.id}`)}
                    className="bg-white rounded-2xl border border-green-100 shadow-sm p-4 hover:shadow-md transition-shadow cursor-pointer"
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center shrink-0">
                        <span className="material-icons text-green-500 text-base">forest</span>
                      </div>
                      <div className="flex-1">
                        <h4 className="font-bold text-slate-800 text-sm">{place.name}</h4>
                        <p className="text-xs text-slate-400">{place.address}</p>
                      </div>
                      <button
                        onClick={(e) => { e.stopPropagation(); setLiked(prev => ({ ...prev, [`api-${i}`]: !prev[`api-${i}`] })); }}
                        className="p-1"
                      >
                        <span className={`material-icons text-lg transition-colors ${liked[`api-${i}`] ? 'text-red-500' : 'text-slate-200 hover:text-red-300'}`}>favorite</span>
                      </button>
                    </div>
                    {place.aiScore && (
                      <div className="flex items-center gap-1 text-xs text-amber-500">
                        <span className="material-icons text-sm">star</span>
                        <span className="font-bold">{Number(place.aiScore).toFixed(1)}</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── 하드코딩 장소 ── */}
          {filteredPlaces.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-2xl border border-slate-100">
              <span className="text-4xl mb-3 block">🌿</span>
              <p className="text-slate-500 font-medium">이 조건에 맞는 장소를 찾는 중이에요</p>
              <p className="text-slate-400 text-sm mt-1">날씨나 강도를 바꿔보세요</p>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredPlaces.map((place, i) => (
                <div
                  key={i}
                  onClick={() => navigate('/map', { state: { highlightPlace: place } })}
                  className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 hover:shadow-md transition-shadow cursor-pointer"
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: `${place.color}18` }}>
                      <span className="material-icons text-base" style={{ color: place.color }}>{place.icon}</span>
                    </div>
                    <div className="flex-1">
                      <h4 className="font-bold text-slate-800 text-sm">{place.name}</h4>
                      <p className="text-xs text-slate-400">{place.location}</p>
                    </div>
                    <button
                      onClick={(e) => { e.stopPropagation(); setLiked(prev => ({ ...prev, [i]: !prev[i] })); }}
                      className="p-1"
                    >
                      <span className={`material-icons text-lg transition-colors ${liked[i] ? 'text-red-500' : 'text-slate-200 hover:text-red-300'}`}>favorite</span>
                    </button>
                  </div>
                  <div className="flex items-center gap-1.5 mb-2">
                    <span className="material-icons text-slate-400" style={{ fontSize: '13px' }}>straighten</span>
                    <span className="text-xs font-semibold text-slate-500">{place.distance}</span>
                  </div>
                  <p className="text-xs text-slate-500 leading-relaxed mb-3">{place.desc}</p>
                  <div className="flex flex-wrap gap-1.5">
                    {place.tags.map((tag, j) => (
                      <span key={j} className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ backgroundColor: `${place.color}15`, color: place.color }}>
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="mt-6 text-center">
            <button
              onClick={() => navigate('/map', { state: { flyToMyLocation: true } })}
              className="inline-flex items-center gap-2 bg-green-500 text-white font-bold px-6 py-3 rounded-xl hover:bg-green-600 transition-colors"
            >
              <span className="material-icons text-base">my_location</span>
              지도에서 내 주변 자연 장소 찾기
            </button>
          </div>
        </section>

        {/* Checklist + Places */}
        <section className="grid lg:grid-cols-3 gap-10">
          <div className="lg:col-span-1 bg-white p-8 rounded-3xl border border-green-100 shadow-sm h-fit">
            <h3 className="text-xl font-bold mb-2">자연이 필요한 신호</h3>
            <p className="text-gray-400 text-sm mb-6">최근 당신의 상태를 체크해보세요.</p>
            <div className="space-y-4">
              {checklist.map((item, i) => (
                <label key={i} className="flex items-center gap-3 cursor-pointer group">
                  <input type="checkbox" className="w-5 h-5 rounded text-green-500 focus:ring-green-400 border-gray-300" />
                  <span className="text-sm text-gray-700">{item}</span>
                </label>
              ))}
            </div>
            <div className="mt-8 pt-6 border-t border-gray-100 text-center">
              <p className="text-xs text-gray-400 mb-3">2개 이상 체크 시 자연 처방이 필요합니다.</p>
              <button
                onClick={() => navigate('/map', { state: { flyToMyLocation: true } })}
                className="block w-full bg-green-500 text-white py-3 rounded-xl font-bold hover:bg-green-700 transition-colors text-center"
              >
                내 주변 명소 찾기
              </button>
            </div>
          </div>

          <div className="lg:col-span-2 space-y-6">
            <h3 className="text-2xl font-bold">함께 가보면 좋은 곳</h3>
            <div className="grid sm:grid-cols-2 gap-6">
              {places.map((place, i) => (
                <div key={i} onClick={() => navigate('/map', { state: { highlightPlace: place } })} className="flex gap-4 p-4 rounded-2xl bg-white hover:shadow-md transition-shadow cursor-pointer">
                  <div className="w-24 h-24 rounded-xl bg-cover bg-center flex-shrink-0" style={{ backgroundImage: `url('${place.img}')` }} />
                  <div className="flex flex-col justify-between py-1 flex-1">
                    <div>
                      <span className="text-[10px] font-bold text-green-500 uppercase tracking-wider">{place.type}</span>
                      <h4 className="font-bold text-gray-800">{place.name}</h4>
                      <p className="text-xs text-gray-500 mt-1">{place.location}</p>
                    </div>
                    <div className="flex items-center gap-1 text-xs text-yellow-500">
                      <span className="material-symbols-outlined text-sm">star</span>
                      <span className="font-bold">{place.rating}</span>
                    </div>
                  </div>
                  <button
                    onClick={(e) => { e.stopPropagation(); setLiked(prev => ({ ...prev, [`bottom-${i}`]: !prev[`bottom-${i}`] })); }}
                    className="self-start mt-1 p-1"
                  >
                    <span className={`material-icons text-xl transition-colors ${liked[`bottom-${i}`] ? 'text-red-500' : 'text-slate-200 hover:text-red-300'}`}>favorite</span>
                  </button>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* AI Pick */}
        <section className="bg-gradient-to-br from-green-800 to-green-950 text-white rounded-[2rem] p-10 lg:p-20 overflow-hidden relative">
          <div className="relative z-10 max-w-4xl mx-auto text-center space-y-12">
            <div className="space-y-4">
              <span className="inline-block px-4 py-1 bg-green-400/20 border border-green-400/30 rounded-full text-green-400 font-bold text-sm tracking-widest">AI THERAPY PICK</span>
              <h3 className="text-3xl lg:text-5xl font-bold leading-tight italic">"자연은 서두르지 않지만,<br />모든 것을 이룹니다."</h3>
              <p className="text-white/60">— 노자 (Lao Tzu)</p>
            </div>
            <div className="grid md:grid-cols-2 gap-8 text-left">
              <div className="bg-white/10 backdrop-blur-xl p-6 rounded-2xl border border-white/10">
                <div className="flex items-center gap-4 mb-4">
                  <span className="material-symbols-outlined text-green-400 text-4xl">graphic_eq</span>
                  <div>
                    <h4 className="font-bold">오늘의 힐링 사운드</h4>
                    <p className="text-sm text-white/70">ASMR | 빗소리와 숲의 대화</p>
                  </div>
                </div>
                <div className="h-2 w-full bg-white/10 rounded-full mb-4 overflow-hidden">
                  <div className="h-full bg-green-400 w-2/3" />
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span>02:14</span>
                  <div className="flex gap-4">
                    <span className="material-symbols-outlined cursor-pointer">skip_previous</span>
                    <span className="material-symbols-outlined cursor-pointer text-green-400">pause</span>
                    <span className="material-symbols-outlined cursor-pointer">skip_next</span>
                  </div>
                  <span>05:30</span>
                </div>
              </div>
              <div className="bg-white/10 backdrop-blur-xl p-6 rounded-2xl border border-white/10 flex gap-4 items-center group cursor-pointer">
                <div
                  className="w-20 h-20 rounded-xl bg-cover bg-center flex-shrink-0 relative overflow-hidden"
                  style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuAGW65Z8APr9FtOKYw6MvaDuoBvUyaKAj-B_QuCltms7V1DcrOWGoAg9Y8Ws3PTUFuaBLISzJMHvYDJqe777sRUYU0O-SYC95rrWkugX7wJtXOP-pZw4p7KO7EH8cTjNusaRo3oYor1DrrqBT2Du4iGILAdN-i4zcstFwZ_D10sAvsLpwskYP06C7mbWEyNbPtyAh_U3hQKnPHsh1enc7PAIjZ9gys7D3oywhWEBqis7ywSRb8pLxZRxbjzeTWADKpLcV2aSDFulic')" }}
                >
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                    <span className="material-symbols-outlined text-white">play_arrow</span>
                  </div>
                </div>
                <div>
                  <h4 className="font-bold">추천 치유 영상</h4>
                  <p className="text-sm text-white/70">4K 스위스 알프스 치유 영상</p>
                  <button className="mt-2 text-xs font-bold text-green-400 group-hover:underline">지금 시청하기</button>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

export default RestNature;
