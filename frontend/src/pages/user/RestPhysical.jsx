import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import UserNavbar from '../../components/user/UserNavbar';

const activities = [
  {
    icon: 'hot_tub',
    title: '온천 & 목욕',
    desc: '따뜻한 물에 몸을 담가 근육을 이완시키고 혈액순환을 촉진합니다.',
    img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBlkWXkQeEdsN3rMbEq-HJoAWXbm_heXj0lDotkOIIjTSe-pZt2eul98AjGvgtnd732G4g2aBUabGuHOpsjpJT10IoeI8RGLYbWM0geVdd4naFyqxM9kVql1oNkrql7qKYSSH_KCqP8-icc4I9yK6T0U8Io5aUiPGh4sNJvozK_JK4x2_jfHanVCm0G2WBY5GyFeIPwEzhRIvTsY9ikPHrD72ariDFiVnLPaJW_EfoD8EmXI6v-SUMNPfGTBj0P48ISouBCD68cVcQ',
  },
  {
    icon: 'self_improvement',
    title: '스트레칭',
    desc: '10분간 전신 스트레칭으로 굳어있는 근육을 풀어줍니다.',
    img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuARMyoXsjBEwG0HbxvhkxbVjDRYsvhwT_ordMU7mGaVXtenucoUMrf1CjTHLT95a90PPiIHaPHcJHe-0iq_xCPRcqwB-txk8jI5nP43Pqh9dHVu-PemHJDE3t23dh6ZaxgAr9OvjraI8N88n6YQcIKORrjKvhEBkauLifUt-vjaTlbmCOBtssc0a3_1EkNhXV5_zXp1Nf7rxDatO2V5D_6vFKhz72bsk6l7h5gepOwlHjjVIB67SDGYpcWkDSWgXpNh1t3HbrFRDa4',
  },
  {
    icon: 'bedtime',
    title: '수면 최적화',
    desc: '완벽한 수면 환경을 만들어 깊은 잠으로 신체를 완전히 회복시킵니다.',
    img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuD9YA02Qrhlax2MQpT-TtboYEbRVzpBreEWwUv_olaFb18WQsTQPjT7kTAkLv7wvJGHeXlEPeNeFygpmARx53NctmzGrdgiF8S8CR5e0_5TcQliztEbyZThYnZnykqbdL_Y6upUpqPX1W6BaNYpkKnMSkNirIHeoh_Ccma3VE6a7RW5jI7dYyNvuqlr1RnWJSBolH8DnTAzsHHPeKQsmTMO3tND0d4ZB0kCshXfouqe-5fwc3f9EoBqRPU3waNU5_H6yS4emYQcdVo',
  },
];

const places = [
  { name: '해운대 스파랜드', location: '부산 해운대구', tag: '온천/스파', rating: '4.9', img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuD9YA02Qrhlax2MQpT-TtboYEbRVzpBreEWwUv_olaFb18WQsTQPjT7kTAkLv7wvJGHeXlEPeNeFygpmARx53NctmzGrdgiF8S8CR5e0_5TcQliztEbyZThYnZnykqbdL_Y6upUpqPX1W6BaNYpkKnMSkNirIHeoh_Ccma3VE6a7RW5jI7dYyNvuqlr1RnWJSBolH8DnTAzsHHPeKQsmTMO3tND0d4ZB0kCshXfouqe-5fwc3f9EoBqRPU3waNU5_H6yS4emYQcdVo' },
  { name: '이천 테르메덴', location: '경기 이천시', tag: '스파/리조트', rating: '4.8', img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBlkWXkQeEdsN3rMbEq-HJoAWXbm_heXj0lDotkOIIjTSe-pZt2eul98AjGvgtnd732G4g2aBUabGuHOpsjpJT10IoeI8RGLYbWM0geVdd4naFyqxM9kVql1oNkrql7qKYSSH_KCqP8-icc4I9yK6T0U8Io5aUiPGh4sNJvozK_JK4x2_jfHanVCm0G2WBY5GyFeIPwEzhRIvTsY9ikPHrD72ariDFiVnLPaJW_EfoD8EmXI6v-SUMNPfGTBj0P48ISouBCD68cVcQ' },
  { name: '제주 힐링 요가원', location: '제주 서귀포시', tag: '요가/명상', rating: '4.7', img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuARMyoXsjBEwG0HbxvhkxbVjDRYsvhwT_ordMU7mGaVXtenucoUMrf1CjTHLT95a90PPiIHaPHcJHe-0iq_xCPRcqwB-txk8jI5nP43Pqh9dHVu-PemHJDE3t23dh6ZaxgAr9OvjraI8N88n6YQcIKORrjKvhEBkauLifUt-vjaTlbmCOBtssc0a3_1EkNhXV5_zXp1Nf7rxDatO2V5D_6vFKhz72bsk6l7h5gepOwlHjjVIB67SDGYpcWkDSWgXpNh1t3HbrFRDa4' },
];

const INTENSITY_OPTIONS = [
  { key: 'light',  label: '가볍게', emoji: '🧘', desc: '스트레칭·요가·가벼운 산책', color: 'bg-red-50 border-red-200 text-red-600', activeColor: 'bg-red-400 border-red-400 text-white' },
  { key: 'medium', label: '보통',   emoji: '🚴', desc: '수영·자전거·필라테스',       color: 'bg-red-50 border-red-200 text-red-600', activeColor: 'bg-red-500 border-red-500 text-white' },
  { key: 'hard',   label: '강하게', emoji: '🏋️', desc: '웨이트·클라이밍·크로스핏',  color: 'bg-red-50 border-red-200 text-red-600', activeColor: 'bg-red-700 border-red-700 text-white' },
];

const PLACE_TYPE_OPTIONS = [
  { key: 'indoor',  label: '실내', emoji: '🏢' },
  { key: 'outdoor', label: '실외', emoji: '🌤️' },
  { key: 'home',    label: '홈트', emoji: '🏠' },
];

const EXERCISE_PLACES = [
  { name: '스트레칭 루틴 (유튜브)', location: '집에서', desc: '10~15분 전신 스트레칭. 코어힐링TV, 하루10분 채널 추천', intensity: ['light'], type: ['home'], tags: ['무료', '유튜브', '즉시가능'], icon: 'play_circle', color: '#EF4444' },
  { name: '요가원 (동네)', location: '가까운 요가원', desc: '초보반 60분. 몸의 긴장을 천천히 풀어주는 회복 요가', intensity: ['light', 'medium'], type: ['indoor'], tags: ['요가', '60분', '예약'], icon: 'self_improvement', color: '#f97316' },
  { name: '실내 수영장', location: '구청·주민센터 수영장', desc: '저강도 자유형 30분. 관절 부담 없이 전신 운동', intensity: ['medium'], type: ['indoor'], tags: ['수영', '관절부담없음', '저렴'], icon: 'pool', color: '#0ea5e9' },
  { name: '필라테스 스튜디오', location: '동네 필라테스', desc: '소도구 필라테스 50분. 코어와 자세 교정에 효과적', intensity: ['light', 'medium'], type: ['indoor'], tags: ['필라테스', '소그룹', '자세교정'], icon: 'accessibility_new', color: '#ec4899' },
  { name: '한강 자전거길', location: '서울 한강변', desc: '한강 자전거 대여 후 왕복 10~20km. 바람 맞으며 유산소', intensity: ['medium'], type: ['outdoor'], tags: ['자전거', '한강', '대여가능'], icon: 'directions_bike', color: '#10b981' },
  { name: '클라이밍 짐', location: '홍대·신촌·강남', desc: '볼더링 입문 2시간. 문제 풀 듯 집중하며 전신 운동', intensity: ['hard'], type: ['indoor'], tags: ['클라이밍', '집중력', '초보가능'], icon: 'sports_gymnastics', color: '#8b5cf6' },
  { name: '크로스핏 박스', location: '동네 크로스핏', desc: '고강도 기능성 운동 1시간. 땀 흠뻑 흘리고 싶을 때', intensity: ['hard'], type: ['indoor'], tags: ['고강도', '땀', '동기부여'], icon: 'fitness_center', color: '#dc2626' },
  { name: '공원 인터벌 러닝', location: '올림픽공원·한강공원', desc: '달리기 20분+걷기 10분 반복. 유산소 최대 효율', intensity: ['hard'], type: ['outdoor'], tags: ['러닝', '인터벌', '무료'], icon: 'directions_run', color: '#f59e0b' },
  { name: '홈 웨이트 (유튜브)', location: '집에서', desc: '맨몸 웨이트 30분. 덤벨 없어도 충분한 자극', intensity: ['medium', 'hard'], type: ['home'], tags: ['홈트', '맨몸운동', '무료'], icon: 'sports_mma', color: '#EF4444' },
];

const checklist = [
  '어깨와 목이 항상 뭉쳐있다.',
  '잠을 자도 피로가 풀리지 않는다.',
  '만성적인 두통이나 눈의 피로가 있다.',
  '온몸에 힘이 없고 무거운 느낌이 든다.',
  '소화가 잘 안 되거나 속이 불편하다.',
  '집중하기 어렵고 몸이 늘 긴장되어 있다.',
];

function RestPhysical() {
  const navigate = useNavigate();
  const [intensity, setIntensity] = useState('light');
  const [placeType, setPlaceType] = useState('indoor');
  const [liked, setLiked] = useState({});
  const filteredPlaces = EXERCISE_PLACES.filter(
    p => p.intensity.includes(intensity) && p.type.includes(placeType)
  );

  return (
    <div className="min-h-screen bg-[#F9F7F2]">
      <UserNavbar />
      <main className="max-w-7xl mx-auto px-6 py-10 space-y-20 pb-24 md:pb-10">

        {/* Back */}
        <Link to="/" className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-emerald-600 transition-colors">
          <span className="material-symbols-outlined text-base">arrow_back</span>
          홈으로
        </Link>

        {/* Hero */}
        <section className="relative h-[480px] rounded-3xl overflow-hidden">
          <img
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuARMyoXsjBEwG0HbxvhkxbVjDRYsvhwT_ordMU7mGaVXtenucoUMrf1CjTHLT95a90PPiIHaPHcJHe-0iq_xCPRcqwB-txk8jI5nP43Pqh9dHVu-PemHJDE3t23dh6ZaxgAr9OvjraI8N88n6YQcIKORrjKvhEBkauLifUt-vjaTlbmCOBtssc0a3_1EkNhXV5_zXp1Nf7rxDatO2V5D_6vFKhz72bsk6l7h5gepOwlHjjVIB67SDGYpcWkDSWgXpNh1t3HbrFRDa4"
            alt="신체적 이완"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-slate-900/70 via-slate-900/30 to-transparent flex flex-col justify-center px-12">
            <span className="inline-block px-4 py-1.5 bg-emerald-500/90 text-white rounded-full text-sm font-bold mb-6 w-fit uppercase tracking-wider">Body Rest</span>
            <h2 className="text-5xl font-bold text-white leading-tight mb-4">신체적 이완</h2>
            <p className="text-white/80 text-lg max-w-md leading-relaxed">몸이 보내는 신호에 귀를 기울이고,<br />쌓인 긴장을 부드럽게 풀어주는 시간입니다.</p>
            <div className="flex gap-4 mt-8">
              <button className="px-8 py-3 bg-emerald-500 text-white rounded-xl font-bold hover:bg-emerald-600 transition-colors shadow-lg">휴식 시작하기</button>
              <button className="px-8 py-3 bg-white/20 backdrop-blur text-white border border-white/30 rounded-xl font-bold hover:bg-white/30 transition-colors">자세히 알아보기</button>
            </div>
          </div>
        </section>

        {/* Why section */}
        <section>
          <div className="mb-8">
            <h3 className="text-2xl font-bold text-slate-900">신체적 이완이 필요한 이유</h3>
            <p className="text-slate-500 mt-2">현대인의 몸은 스트레스로 인해 만성 긴장 상태에 있습니다.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { icon: 'accessibility_new', title: '근육 긴장 완화', desc: '장시간 좌식 생활과 스트레스로 굳어진 근육을 이완시켜 혈액순환을 개선합니다.', color: 'text-emerald-500 bg-emerald-50' },
              { icon: 'psychology', title: '뇌 피로 회복', desc: '신체 이완을 통해 자율신경계가 안정되고 뇌의 피로 물질이 효과적으로 제거됩니다.', color: 'text-blue-500 bg-blue-50' },
              { icon: 'health_and_safety', title: '면역력 강화', desc: '충분한 신체적 휴식은 면역 세포를 활성화시켜 전반적인 건강을 향상시킵니다.', color: 'text-amber-500 bg-amber-50' },
            ].map((item, i) => (
              <div key={i} className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                <div className={`w-12 h-12 rounded-xl ${item.color} flex items-center justify-center mb-4`}>
                  <span className="material-symbols-outlined">{item.icon}</span>
                </div>
                <h4 className="font-bold text-slate-900 mb-2">{item.title}</h4>
                <p className="text-slate-500 text-sm leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Recommended Activities */}
        <section>
          <div className="mb-8">
            <h3 className="text-2xl font-bold text-slate-900">추천 휴식 활동</h3>
            <p className="text-slate-500 mt-2">지금 당신에게 가장 필요한 활동들을 골라보았습니다.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {activities.map((act, i) => (
              <div key={i} className="group cursor-pointer" onClick={() => navigate('/rest-record')}>
                <div className="relative aspect-video rounded-2xl overflow-hidden mb-4">
                  <img className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" src={act.img} alt={act.title} />
                  <div className="absolute top-4 right-4 p-2 bg-white/90 backdrop-blur rounded-full shadow">
                    <span className="material-symbols-outlined text-emerald-600">{act.icon}</span>
                  </div>
                </div>
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h4 className="text-lg font-bold text-slate-900 group-hover:text-emerald-600 transition-colors">{act.title}</h4>
                    <p className="text-slate-500 text-sm mt-1">{act.desc}</p>
                  </div>
                  <button onClick={(e) => { e.stopPropagation(); setLiked(prev => ({ ...prev, [`act-${i}`]: !prev[`act-${i}`] })); }} className="mt-1 p-1 shrink-0">
                    <span className={`material-icons text-xl transition-colors ${liked[`act-${i}`] ? 'text-red-500' : 'text-slate-300 hover:text-red-300'}`}>favorite</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ===== 오늘 어떤 운동을 할까요? ===== */}
        <section>
          <div className="mb-8">
            <h3 className="text-2xl font-bold text-gray-800">오늘 어떤 운동을 할까요?</h3>
            <p className="text-gray-500 mt-2">강도와 장소를 선택하면 딱 맞는 활동을 추천해줄게요</p>
          </div>

          <div className="mb-6">
            <p className="text-sm font-bold text-slate-600 mb-3">운동 강도</p>
            <div className="grid grid-cols-3 gap-3">
              {INTENSITY_OPTIONS.map(opt => (
                <button key={opt.key} onClick={() => setIntensity(opt.key)}
                  className={`p-4 rounded-2xl border-2 text-left transition-all ${intensity === opt.key ? opt.activeColor : opt.color}`}>
                  <div className="text-2xl mb-2">{opt.emoji}</div>
                  <p className="font-bold text-sm">{opt.label}</p>
                  <p className={`text-xs mt-1 ${intensity === opt.key ? 'text-white/80' : 'opacity-70'}`}>{opt.desc}</p>
                </button>
              ))}
            </div>
          </div>

          <div className="mb-8">
            <p className="text-sm font-bold text-slate-600 mb-3">장소 유형</p>
            <div className="flex gap-3">
              {PLACE_TYPE_OPTIONS.map(opt => (
                <button key={opt.key} onClick={() => setPlaceType(opt.key)}
                  className={`flex items-center gap-2 px-5 py-2.5 rounded-full border-2 font-bold text-sm transition-all ${placeType === opt.key ? 'bg-red-500 border-red-500 text-white' : 'bg-white border-slate-200 text-slate-600 hover:border-red-300'}`}>
                  <span>{opt.emoji}</span>{opt.label}
                </button>
              ))}
            </div>
          </div>

          {filteredPlaces.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-2xl border border-slate-100">
              <span className="text-4xl mb-3 block">💪</span>
              <p className="text-slate-500 font-medium">이 조건에 맞는 활동을 준비 중이에요</p>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredPlaces.map((place, i) => (
                <div key={i} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 hover:shadow-md transition-shadow">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: `${place.color}20` }}>
                      <span className="material-icons text-base" style={{ color: place.color }}>{place.icon}</span>
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-800 text-sm">{place.name}</h4>
                      <p className="text-xs text-slate-400">{place.location}</p>
                    </div>
                  </div>
                  <p className="text-xs text-slate-500 leading-relaxed mb-3">{place.desc}</p>
                  <div className="flex flex-wrap gap-1.5">
                    {place.tags.map((tag, j) => (
                      <span key={j} className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ backgroundColor: `${place.color}15`, color: place.color }}>#{tag}</span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="mt-6 text-center">
            <a href="/map?restType=physical" className="inline-flex items-center gap-2 bg-red-500 text-white font-bold px-6 py-3 rounded-xl hover:bg-red-600 transition-colors">
              <span className="material-icons text-base">map</span>
              지도에서 내 주변 운동 시설 찾기
            </a>
          </div>
        </section>

        {/* Checklist + Places */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Checklist */}
          <div className="bg-emerald-50 rounded-2xl p-8 border border-emerald-100">
            <div className="flex items-center gap-3 mb-6">
              <span className="material-symbols-outlined text-emerald-600 text-3xl">checklist</span>
              <h3 className="text-xl font-bold text-slate-900">신체적 휴식이 필요한 신호</h3>
            </div>
            <div className="space-y-3">
              {checklist.map((item, i) => (
                <label key={i} className="flex items-center p-3 bg-white rounded-xl cursor-pointer group hover:border-emerald-200 border border-transparent transition-all shadow-sm">
                  <input type="checkbox" className="w-5 h-5 rounded text-emerald-600 focus:ring-emerald-500 border-gray-300" />
                  <span className="ml-3 text-slate-700 text-sm font-medium">{item}</span>
                </label>
              ))}
            </div>
            <div className="mt-6 p-4 bg-emerald-100 rounded-xl">
              <p className="text-sm text-emerald-800 font-medium">※ 3개 이상 해당된다면, 오늘은 신체적 이완에 집중하세요.</p>
            </div>
          </div>

          {/* Places */}
          <div>
            <h3 className="text-xl font-bold text-slate-900 mb-6">추천 장소</h3>
            <div className="space-y-4">
              {places.map((place, i) => (
                <div key={i} onClick={() => navigate('/map')} className="flex gap-4 bg-white rounded-2xl p-4 border border-gray-100 shadow-sm hover:shadow-md transition-shadow cursor-pointer">
                  <div className="w-20 h-20 rounded-xl overflow-hidden flex-shrink-0">
                    <img src={place.img} alt={place.name} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider">{place.tag}</span>
                    </div>
                    <h4 className="font-bold text-slate-900">{place.name}</h4>
                    <p className="text-xs text-slate-400 mt-1 flex items-center gap-1">
                      <span className="material-symbols-outlined text-sm">location_on</span>
                      {place.location}
                    </p>
                    <div className="flex items-center gap-1 mt-1 text-xs text-amber-500">
                      <span className="material-symbols-outlined text-sm">star</span>
                      <span className="font-bold">{place.rating}</span>
                    </div>
                  </div>
                  <button
                    onClick={(e) => { e.stopPropagation(); setLiked(prev => ({ ...prev, [i]: !prev[i] })); }}
                    className="self-start mt-1 p-1"
                  >
                    <span className={`material-icons text-xl transition-colors ${liked[i] ? 'text-red-500' : 'text-slate-200 hover:text-red-300'}`}>favorite</span>
                  </button>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* AI Pick */}
        <section className="bg-slate-900 rounded-3xl p-10 text-white">
          <div className="flex flex-col lg:flex-row gap-10">
            <div className="flex-1">
              <div className="flex items-center gap-2 text-emerald-400 font-bold mb-4 text-sm uppercase tracking-widest">
                <span className="material-symbols-outlined">auto_awesome</span> AI Rest Pick
              </div>
              <h3 className="text-3xl font-bold mb-4">오늘 당신을 위한 AI 큐레이션</h3>
              <div className="bg-white/10 rounded-2xl p-6 mb-6">
                <p className="text-lg italic leading-relaxed">"몸이 쉬어야 마음도 쉴 수 있습니다. 오늘은 당신의 몸에게 고마운 시간을 선물해주세요."</p>
              </div>
            </div>
            <div className="flex-1 space-y-4">
              {[
                { icon: 'library_music', title: '이완 유도 ASMR 플레이리스트', desc: '빗소리와 자연의 소리 • 60분' },
                { icon: 'video_library', title: '10분 전신 스트레칭 가이드', desc: '집에서 하는 근육 이완 • 초급' },
                { icon: 'menu_book', title: '숙면을 위한 저녁 루틴', desc: '에디터의 추천 아티클 • 5분 독서' },
              ].map((item, i) => (
                <div key={i} className="flex items-center p-4 bg-white/10 rounded-2xl group cursor-pointer hover:bg-white/20 transition-colors">
                  <div className="w-12 h-12 bg-emerald-500/20 rounded-xl flex items-center justify-center text-emerald-400 mr-4">
                    <span className="material-symbols-outlined">{item.icon}</span>
                  </div>
                  <div className="flex-1">
                    <h5 className="font-bold">{item.title}</h5>
                    <p className="text-xs text-white/60">{item.desc}</p>
                  </div>
                  <span className="material-symbols-outlined text-white/40 group-hover:text-emerald-400">play_circle</span>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

export default RestPhysical;
