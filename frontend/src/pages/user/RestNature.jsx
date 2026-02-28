import { useState } from 'react';
import { Link } from 'react-router-dom';
import UserNavbar from '../../components/user/UserNavbar';

const activities = [
  {
    title: '숲캉스 (Forest Bathing)',
    desc: '피톤치드 가득한 숲에서 오감을 열고 걷기',
    badge: '인기',
    img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAoyd2BqutepbQSm-ZvCXv80NyR-OI5EbeIVMoND5sl4d_kUc4AaE3HBHCHSGKHMj1Ye6LeCX1eZ4Z7zTljklHlrH7c6RVrEu1ynQcud7tViQ6uLyB036rzY1K_KDhmKX3e4mJW1B7LAvFXJrMxQ0oYQZdtjwk_aORVYfRxkvrwLnsdnKM2GGV0L3iiyHWcQaO_qji21UeMVvhjv4xRxXVCziCYCxolI0220pyywIqad9K5TSmJDywi_stIxSDNuKau_LjTzRXKWOQ',
  },
  {
    title: '맨발 걷기 (Earthing)',
    desc: '대지의 감촉을 느끼며 땅과 직접 연결되기',
    img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBNPsmlUwtdOQQb3Edv4p44oYGvADOd7oYDE9TZ5LcZbHRk68f1o-RJ4Mu5GEEvoZihpQc7GfQTczkF9Z-6-vpIAEAU3PsXtRP33ucWGyIZ5rzsPx1nPKLonxbK-QFVpMHrWaXqc-OFkfJ1XiO96y9p7C_OEfChdNlSnGZwKVfs5FaUg6XPNwCwi-CWgBRBdT_fdvWwWAgSQncSqRx3rjR5sJAI57B5xDeRG4c_CCJFneKC3DqfNH_PbsbB_peZ4v_1c9WRNScLOYI',
  },
  {
    title: '별 헤는 밤 (Stargazing)',
    desc: '우주의 경이로움을 느끼며 잡념 비워내기',
    img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCN_Eo6CdOKvVoYL2J59RmertCKufAZNVP9xSdpGKE8bEtxmLRaLDkUH__aZngnnpcHGAByCtENAUSHBz6s7o5y_rHKD1cHHa_WqcbFK908zevSp_5wEVz3DeGFy1O-g17lUZ1Cw74mtZw_oo3iY1yOwOk1DM7zOWro6JgT9yHi1OoXRb4QiOgXXKlPOJN83Gpntexz62ihSP6e_ZPbN611bBq89d8xrw1hG8Th1LyNUeazOrC06KfS92bynQ58DMWi_xNAZtg6XjA',
  },
];

const places = [
  { type: 'Arboretum', name: '고요한 수목원', location: '경기도 가평군', rating: '4.8', img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDXzxs2h0HKB3GCbgt1N7mJrlSCMVAzFcJVSMzZwA9bnYLLKN86Fw3KNB-n2XgcaC0FsYG0muTIsjvYpbDXG0Aqam7JO22V46BuLcOjlcIkbmzoEddBAGRKnHB_yc6e5VdO8rsnxm_7SzMAKRTjDAgYF02_hxnjEBqYVDXGEPk11e5x7XVzdZNMx4FBO1b3kSKXk-umF8cZN1_PKsxI97OPEC8PS5hOeeoW8_JcB2XyqR1MjQUC6Gt_5ydjIfwuGXY5fpqoccV8F1c' },
  { type: 'Trail', name: '산들바람 숲길', location: '서울 관악구', rating: '4.6', img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAfyj0KTtXer_EUNY_TWyPl4QHhQZXWz1pJGaJK1HPkPH5uN3wlujZOZDgaSarb6HXQX-jCLGKdURhsXdza3_dfew1YXC-U09zxmsRF-BmarHXfxpu_qXwJKK3ABcFXdk0OOY35YHrRW-fsw7ehYNU2OtH7ar6wvsZYTPRx6nI38tXYPdDsC88jcJyAwY2O3bGy_zJ8_auLf7g5WTU5xi5gXLs9JGxiyJkoWpRRce9XSLyAwIdSwqHqAJ6V79a0s1ed4CbsdtRBIe8' },
  { type: 'Beach', name: '달빛 해변', location: '강원도 양양군', rating: '4.9', img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuC8wwu6cJsXj07JmoHANvYHus3UIuhJ9-lEK7SlZIRPo78Juqk9ox3WUr3KOMBBO6_WcIJLA9QA3g_p65Y4gal_0CUCpSvd8TdPA08txF1nH0C4bsTWjxnflc_re6Wzh66tK7xXvuH9slLHOHesH7iQiY7911vUCKF_RVRgNGwnNFQ74-_UVyz1TjjQzdZT3_h7E-6em9-wssFeqVdCj-nS78-qkJOPWU4j-sxHV37IaAmv8fkJFKCfjzNNG2tkAnKOLyr2IHlZLGw' },
  { type: 'Nature Park', name: '비밀의 정원', location: '제주 서귀포시', rating: '4.7', img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAwK_x6GismrvUQt0ZUWnogmUiKmmO4R6FrqA-qSy9t1qpndd1J4WtvszjAgquU-RTtFkgVJhqLYt3f8uz1f5OVMBzkRyNbKKG_ArS-4f8d0F5FilvTK5iZkJRZrLBkikBITpvTZDXE9dofqxUjD8o9yNxSV0ClVpUixgBYH7lNC0sl7zJ-hSbV2waNIphW0EPLI3ePHGKrThdTNSVzqQJVcYarG6rPGprL86eiwvImYmS80pWC87Fsk_lnk9XhN3SxSE4clyfuH0A' },
];

// 걷기 강도 옵션
const INTENSITY_OPTIONS = [
  {
    key: 'light',
    label: '산책',
    emoji: '🌿',
    time: '20~30분',
    distance: '1km 이하',
    desc: '천천히 걸으며 주변을 둘러보는 가벼운 산책',
    color: 'bg-emerald-50 border-emerald-200 text-emerald-700',
    activeColor: 'bg-emerald-500 border-emerald-500 text-white',
  },
  {
    key: 'moderate',
    label: '가볍게',
    emoji: '🚶',
    time: '1시간',
    distance: '1~3km',
    desc: '적당히 걷고 벤치에 앉아 쉬어가는 코스',
    color: 'bg-green-50 border-green-200 text-green-700',
    activeColor: 'bg-green-500 border-green-500 text-white',
  },
  {
    key: 'long',
    label: '활기차게',
    emoji: '🏃',
    time: '2시간+',
    distance: '3km 이상',
    desc: '땀 흘리며 자연 속을 충분히 누비는 코스',
    color: 'bg-teal-50 border-teal-200 text-teal-700',
    activeColor: 'bg-teal-500 border-teal-500 text-white',
  },
  {
    key: 'trekking',
    label: '트레킹',
    emoji: '🥾',
    time: '3시간+',
    distance: '5km 이상',
    desc: '등산로나 둘레길을 따라 자연 깊숙이 들어가는 코스',
    color: 'bg-stone-50 border-stone-200 text-stone-700',
    activeColor: 'bg-stone-600 border-stone-600 text-white',
  },
];

// 날씨 옵션
const WEATHER_OPTIONS = [
  { key: 'sunny',   label: '맑음',     emoji: '☀️' },
  { key: 'cloudy',  label: '흐림',     emoji: '⛅' },
  { key: 'indoor',  label: '비/눈',    emoji: '🌧️' },
];

// 장소 데이터 — intensity + weather 태그로 필터링
const WALK_PLACES = [
  {
    name: '올림픽공원',
    location: '서울 송파구',
    distance: '둘레 6.5km',
    desc: '평탄한 산책로와 넓은 잔디밭. 벤치가 많아 중간 휴식 가능',
    intensity: ['light', 'moderate', 'long'],
    weather: ['sunny', 'cloudy'],
    tags: ['공원', '포장길', '벤치'],
    icon: 'park',
    color: '#059669',
  },
  {
    name: '서울숲',
    location: '서울 성동구',
    distance: '1~3km 코스',
    desc: '도심 속 숲. 평지 위주라 가볍게 걷기에 딱 좋아',
    intensity: ['light', 'moderate'],
    weather: ['sunny', 'cloudy'],
    tags: ['숲길', '평지', '가족'],
    icon: 'forest',
    color: '#16a34a',
  },
  {
    name: '북한산 둘레길',
    location: '서울 은평구',
    distance: '구간별 3~7km',
    desc: '경사 완만한 숲길. 피톤치드 가득한 자연 속 걷기',
    intensity: ['moderate', 'long'],
    weather: ['sunny', 'cloudy'],
    tags: ['숲길', '경사', '자연'],
    icon: 'landscape',
    color: '#15803d',
  },
  {
    name: '한강 반포지구',
    location: '서울 서초구',
    distance: '1~5km 자유 코스',
    desc: '탁 트인 한강변. 바람 맞으며 원하는 만큼 걸을 수 있어',
    intensity: ['light', 'moderate', 'long'],
    weather: ['sunny'],
    tags: ['강변', '평지', '야경'],
    icon: 'water',
    color: '#0284c7',
  },
  {
    name: '국립중앙박물관 야외정원',
    location: '서울 용산구',
    distance: '0.5~1km',
    desc: '조용한 정원 산책. 거리 짧고 지붕 있는 회랑도 있어',
    intensity: ['light'],
    weather: ['sunny', 'cloudy', 'indoor'],
    tags: ['정원', '짧은 거리', '실내 연결'],
    icon: 'museum',
    color: '#b45309',
  },
  {
    name: '코엑스 아쿠아리움 & 별마당도서관',
    location: '서울 강남구',
    distance: '실내 자유 이동',
    desc: '비 오는 날 실내에서 자연 감성 충전. 물과 식물 가득',
    intensity: ['light'],
    weather: ['indoor'],
    tags: ['실내', '비오는날', '도심'],
    icon: 'water_drop',
    color: '#6366f1',
  },
  {
    name: '경의선 숲길',
    location: '서울 마포구',
    distance: '6.3km (전 구간)',
    desc: '마을과 자연이 어우러진 선형 공원. 중간에 카페도 많아',
    intensity: ['moderate', 'long'],
    weather: ['sunny', 'cloudy'],
    tags: ['선형공원', '포장길', '카페'],
    icon: 'route',
    color: '#65a30d',
  },
  {
    name: '수목원 (홈플식물원)',
    location: '경기 고양시',
    distance: '1~2km',
    desc: '흐린 날도 초록이 가득. 온실 있어 비가 와도 구경 가능',
    intensity: ['light', 'moderate'],
    weather: ['sunny', 'cloudy', 'indoor'],
    tags: ['식물원', '온실', '당일치기'],
    icon: 'local_florist',
    color: '#16a34a',
  },

  // 일본식 정원 / 일본풍 산책지
  {
    name: '순천만국가정원 일본정원',
    location: '전남 순천시',
    distance: '2~4km (정원 전체)',
    desc: '국내 유일 국가 공인 일본정원. 고요한 연못과 모래 정원이 명상 분위기를 만들어줘',
    intensity: ['light', 'moderate'],
    weather: ['sunny', 'cloudy'],
    tags: ['일본정원', '연못', '당일치기'],
    icon: 'temple_buddhist',
    color: '#b45309',
  },
  {
    name: '창덕궁 후원 (비원)',
    location: '서울 종로구',
    distance: '약 1.5km',
    desc: '조선의 비밀 정원. 일본 정원 감성과 비슷한 고요함. 예약 필수, 소규모 해설 투어',
    intensity: ['light'],
    weather: ['sunny', 'cloudy'],
    tags: ['궁궐정원', '예약필수', '고요함'],
    icon: 'account_balance',
    color: '#7c3aed',
  },
  {
    name: '담양 죽녹원',
    location: '전남 담양군',
    distance: '2.4km 산책로',
    desc: '대나무 숲이 만드는 일본 교토 같은 분위기. 바람 소리가 ASMR 그 자체',
    intensity: ['light', 'moderate'],
    weather: ['sunny', 'cloudy'],
    tags: ['대나무숲', '교토감성', '포토스팟'],
    icon: 'forest',
    color: '#15803d',
  },
  {
    name: '진해 경화역 공원',
    location: '경남 창원시 진해구',
    distance: '1km 내외',
    desc: '벚꽃 시즌엔 일본 우에노공원 부럽지 않은 풍경. 봄철 특히 추천',
    intensity: ['light'],
    weather: ['sunny'],
    tags: ['벚꽃', '봄시즌', '일본감성'],
    icon: 'local_florist',
    color: '#ec4899',
  },

  // 트레킹 전용
  {
    name: '북한산 국립공원 (백운대)',
    location: '서울 강북구',
    distance: '약 8km (왕복)',
    desc: '서울에서 가장 유명한 트레킹 코스. 정상에서 서울 전체 조망 가능',
    intensity: ['trekking'],
    weather: ['sunny'],
    tags: ['등산', '정상', '서울조망'],
    icon: 'landscape',
    color: '#78716c',
  },
  {
    name: '설악산 울산바위',
    location: '강원 속초시',
    distance: '약 6km (왕복)',
    desc: '기암절벽과 탁 트인 동해 뷰. 당일치기 가능한 강원 대표 트레킹',
    intensity: ['trekking'],
    weather: ['sunny'],
    tags: ['트레킹', '동해뷰', '당일치기'],
    icon: 'terrain',
    color: '#57534e',
  },
  {
    name: '지리산 둘레길',
    location: '전남/전북/경남',
    distance: '구간별 10~20km',
    desc: '3개 도에 걸친 장거리 트레킹. 마을과 자연이 이어진 치유의 길',
    intensity: ['trekking'],
    weather: ['sunny', 'cloudy'],
    tags: ['장거리', '둘레길', '힐링'],
    icon: 'hiking',
    color: '#65a30d',
  },
  {
    name: '한라산 성판악 코스',
    location: '제주 제주시',
    distance: '약 19km (왕복)',
    desc: '제주 최고봉 트레킹. 예약 필수, 체력 소모 크지만 성취감 최고',
    intensity: ['trekking'],
    weather: ['sunny'],
    tags: ['제주', '예약필수', '고난이도'],
    icon: 'filter_hdr',
    color: '#0891b2',
  },
];

const checklist = [
  '창문 없는 방에 갇힌 기분이 든다.',
  '디지털 기기 없이는 불안하다.',
  '이유 없는 만성 피로가 계속된다.',
  '계절의 변화를 감각하지 못한다.',
];

function RestNature() {
  const [intensity, setIntensity] = useState('light');
  const [weather, setWeather] = useState('sunny');

  const filteredPlaces = WALK_PLACES.filter(
    p => p.intensity.includes(intensity) && p.weather.includes(weather)
  );

  const currentIntensity = INTENSITY_OPTIONS.find(o => o.key === intensity);

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
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {activities.map((act, i) => (
              <div key={i} className="group cursor-pointer">
                <div className="relative aspect-[4/5] rounded-2xl overflow-hidden mb-4 shadow-md">
                  <div
                    className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-110"
                    style={{ backgroundImage: `url('${act.img}')` }}
                  />
                  {act.badge && (
                    <div className="absolute top-4 right-4 bg-white/80 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold">{act.badge}</div>
                  )}
                </div>
                <h4 className="text-lg font-bold group-hover:text-green-500 transition-colors">{act.title}</h4>
                <p className="text-gray-500 text-sm mt-1">{act.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ===== 오늘 어떻게 걸을까요? ===== */}
        <section>
          <div className="mb-8">
            <h3 className="text-2xl font-bold text-gray-800">오늘 어떻게 걸을까요?</h3>
            <p className="text-gray-500 mt-2">강도와 날씨를 선택하면 딱 맞는 장소를 추천해줄게요</p>
          </div>

          {/* 걷기 강도 선택 */}
          <div className="mb-6">
            <p className="text-sm font-bold text-slate-600 mb-3">걷기 강도</p>
            <div className="grid grid-cols-4 gap-3">
              {INTENSITY_OPTIONS.map(opt => (
                <button
                  key={opt.key}
                  onClick={() => setIntensity(opt.key)}
                  className={`p-4 rounded-2xl border-2 text-left transition-all ${
                    intensity === opt.key ? opt.activeColor : opt.color
                  }`}
                >
                  <div className="text-2xl mb-2">{opt.emoji}</div>
                  <p className="font-bold text-sm">{opt.label}</p>
                  <p className={`text-xs mt-1 ${intensity === opt.key ? 'text-white/80' : 'opacity-70'}`}>
                    {opt.time} · {opt.distance}
                  </p>
                </button>
              ))}
            </div>
            {currentIntensity && (
              <p className="text-sm text-slate-500 mt-3 pl-1">{currentIntensity.desc}</p>
            )}
          </div>

          {/* 날씨 선택 */}
          <div className="mb-8">
            <p className="text-sm font-bold text-slate-600 mb-3">오늘 날씨</p>
            <div className="flex gap-3">
              {WEATHER_OPTIONS.map(opt => (
                <button
                  key={opt.key}
                  onClick={() => setWeather(opt.key)}
                  className={`flex items-center gap-2 px-5 py-2.5 rounded-full border-2 font-bold text-sm transition-all ${
                    weather === opt.key
                      ? 'bg-green-500 border-green-500 text-white'
                      : 'bg-white border-slate-200 text-slate-600 hover:border-green-300'
                  }`}
                >
                  <span>{opt.emoji}</span>
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* 필터링된 장소 카드 */}
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
                  className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 hover:shadow-md transition-shadow"
                >
                  {/* 아이콘 + 이름 */}
                  <div className="flex items-center gap-3 mb-3">
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                      style={{ backgroundColor: `${place.color}18` }}
                    >
                      <span className="material-icons text-base" style={{ color: place.color }}>
                        {place.icon}
                      </span>
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-800 text-sm">{place.name}</h4>
                      <p className="text-xs text-slate-400">{place.location}</p>
                    </div>
                  </div>

                  {/* 거리 뱃지 */}
                  <div className="flex items-center gap-1.5 mb-2">
                    <span className="material-icons text-slate-400" style={{ fontSize: '13px' }}>straighten</span>
                    <span className="text-xs font-semibold text-slate-500">{place.distance}</span>
                  </div>

                  {/* 설명 */}
                  <p className="text-xs text-slate-500 leading-relaxed mb-3">{place.desc}</p>

                  {/* 태그 */}
                  <div className="flex flex-wrap gap-1.5">
                    {place.tags.map((tag, j) => (
                      <span
                        key={j}
                        className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                        style={{ backgroundColor: `${place.color}15`, color: place.color }}
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* 지도에서 실제 장소 찾기 버튼 */}
          <div className="mt-6 text-center">
            <Link
              to="/map?restType=nature"
              className="inline-flex items-center gap-2 bg-green-500 text-white font-bold px-6 py-3 rounded-xl hover:bg-green-600 transition-colors"
            >
              <span className="material-icons text-base">map</span>
              지도에서 내 주변 자연 장소 찾기
            </Link>
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
              <Link to="/map" className="block w-full bg-green-500 text-white py-3 rounded-xl font-bold hover:bg-green-700 transition-colors text-center">
                내 주변 명소 찾기
              </Link>
            </div>
          </div>

          <div className="lg:col-span-2 space-y-6">
            <h3 className="text-2xl font-bold">함께 가보면 좋은 곳</h3>
            <div className="grid sm:grid-cols-2 gap-6">
              {places.map((place, i) => (
                <div key={i} className="flex gap-4 p-4 rounded-2xl bg-white hover:shadow-md transition-shadow">
                  <div
                    className="w-24 h-24 rounded-xl bg-cover bg-center flex-shrink-0"
                    style={{ backgroundImage: `url('${place.img}')` }}
                  />
                  <div className="flex flex-col justify-between py-1">
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
