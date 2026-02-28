import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import UserNavbar from '../../components/user/UserNavbar';

const SCALE_OPTIONS = [
  { key: 'solo',   label: '나홀로', emoji: '🧍', desc: '혼자지만 사회적인 공간에서' },
  { key: 'duo',    label: '둘이서', emoji: '👫', desc: '친한 한 명과 조용히' },
  { key: 'group',  label: '소그룹', emoji: '👥', desc: '3~5명 편한 모임으로' },
];

const VIBE_OPTIONS = [
  { key: 'quiet',  label: '조용히', emoji: '🤫' },
  { key: 'active', label: '활기차게', emoji: '🎉' },
];

const SOCIAL_PLACES = [
  { name: '조용한 브런치 카페', location: '연남동·성수동', desc: '혼자 가도 어색하지 않은 분위기. 창가 자리에서 사람 구경', scale: ['solo'], vibe: ['quiet'], tags: ['브런치', '혼카페', '창가자리'], icon: 'local_cafe', color: '#8B5CF6' },
  { name: '독립서점', location: '전국 동네 서점', desc: '취향 맞는 책 구경하다 점원과 짧게 대화. 가벼운 연결감', scale: ['solo'], vibe: ['quiet'], tags: ['서점', '취향', '혼자'], icon: 'menu_book', color: '#7c3aed' },
  { name: '소규모 북클럽', location: '도서관·서점 프로그램', desc: '같은 책을 읽은 3~5명이 이야기 나누기. 깊은 연결', scale: ['group'], vibe: ['quiet'], tags: ['독서모임', '소그룹', '공감'], icon: 'groups', color: '#6366f1' },
  { name: '조용한 찻집 둘이서', location: '인사동·북촌', desc: '친한 한 명과 차 마시며 천천히 이야기', scale: ['duo'], vibe: ['quiet'], tags: ['찻집', '둘이서', '대화'], icon: 'emoji_food_beverage', color: '#b45309' },
  { name: '보드게임 카페', location: '홍대·강남·건대', desc: '2~6명이 신나게 게임. 웃음이 넘치는 사회적 휴식', scale: ['duo','group'], vibe: ['active'], tags: ['보드게임', '웃음', '경쟁'], icon: 'casino', color: '#0ea5e9' },
  { name: '방탈출 카페', location: '전국 방탈출', desc: '2~4명 팀으로 협력. 몰입하다 보면 일상 스트레스 잊혀', scale: ['duo','group'], vibe: ['active'], tags: ['방탈출', '협력', '몰입'], icon: 'lock', color: '#dc2626' },
  { name: '취미 원데이클래스', location: '플리마켓·문화센터', desc: '낯선 사람들과 같은 것 만들기. 자연스러운 대화와 연결', scale: ['solo','group'], vibe: ['active'], tags: ['원데이클래스', '취미', '새로운 인연'], icon: 'brush', color: '#10b981' },
  { name: '혼자 가기 좋은 재즈바', location: '이태원·홍대', desc: '바 카운터에 앉아 라이브 재즈 감상. 혼자지만 외롭지 않은 밤', scale: ['solo'], vibe: ['active'], tags: ['재즈바', '라이브', '분위기'], icon: 'music_note', color: '#f97316' },
];

const activities = [
  {
    icon: 'smartphone',
    title: '디지털 디톡스',
    desc: '2시간 동안 모든 SNS와 메신저 알림을 끕니다.',
    img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBoTnL799Pv0hFOwoNRv_Ap-KNcaLvZGpLi2sAk-g1yscJM9HAyUA5IlnI_FPfoCp_s4qaQJjJ2yvE10djldE40BSNrSR1vPrLldyp-p9l-V9cLvLc2aVh6cm99IRgQYJMBcl8ga_e6RVYQdGgPQFzXon_TVKqkqzjKfS-OfiiHruSByBqG2P1WpJa6Myi6YuCU1no88zObH4Er0FMTksJy5Ys_cmdffHVxWqBvBFAS_Jgyyyx4Ug-i2JPgMhZKhJtfseNO045liHM',
  },
  {
    icon: 'group',
    title: '안전한 관계 맺기',
    desc: '에너지를 뺏지 않는 편안한 친구와 짧은 산책을 합니다.',
    img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuA1pjQhcRF9En98G4AN0jXreiDTc1SEIRy1YvbcEWaLmFLORcICgz_RHOYYVf0KNS9BQXhIWAqVo3ajSJOmUWFVyW-dwyNdKr5s7OmcEZvlVw89NaGl2KxHqcNxIv-ZjVIoXt1RsOaqjPrBfQkX4UuRqvuONAbYGLA59NIvyqlj5Ly1L7oSyCl-RL7ok1COYXFwbkk4nR7b-tLTE7ALu3de8-gjJrk2KsPYrEr7KUa0pJqzo4_iMG3EdfqnGuRL1yVGXbei_ZBcYTk',
  },
  {
    icon: 'hiking',
    title: '나홀로 로컬 여행',
    desc: '익숙하지 않은 동네에서 타인이 되어 걸어봅니다.',
    img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDTESxurgZnUwQRAiKRNmldoPAHbQlathM-LYLRBtG0qH7ymTp0zH3irKA4oYtL-qO74PtRw4Ivl9EWiCnTOWyfqER0e4PPSLPqAFCVW66gY2ey8grV2_awQ5BMVTg76Ef43QPmc-kTsdxFMYHdqk2hVHLrnuTyRthiHoRc7RmWPGMPpUVrmw6rR384fVrR4MWMdu4ApsePeH8w2P5-ITWiuOmu-5SZNLJGBtLY2IJTajy0efAGJ1t7VGE-IZT94b3GsEAuhMcb4w8',
  },
];

const places = [
  { name: "북스테이 '침묵의 시간'", location: '경기 가평군', tags: ['혼자 가기 좋음', '와이파이 없음'], rating: '4.9', img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBYhrJAGkOuzu7zFWSiaMCUFsIPfoAPrw3PDFtRoKp7nJuzeYbt5lCiw4tVNmCEjN0_RLWE7RTkssYt7j7GFXY9gaqTaeRX37B837oJtrfrGyawwm5Y9CmlhqmI2VQL2SvrzQg6AGgJ-cDxYkHM_bAjBECsmiZOav-jORa__0QUGWpnsvzvQZ_mCtoReYnD0NVaN8_TUv5hQtq-q_TgUt5P3ZpT3UWW1sJJWfUb4CxzgQRDbWwzT47wBJcecyLQey8oI_yQoOZXGlE' },
  { name: "카페 '무인도'", location: '서울 마포구', tags: ['LP 음악', '예약제'], rating: '4.7', img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCfTSkvtGQouW9OmWDcQeZ_f4we5oZVK8BUy4gVeMzBGCr_nkZOoGGNZ6aYlAY71mC2zJaleMtfFsrByui_Rj_y6CiUxhZqCCKcIa1jUINPw1TLkY8apXngujgqpIsq_TxCyatM72aD7ozeJ37UIRUsM5a265BRYsrNSAx2NVNM7Rak2CpITrohCdknW9vhQ9VI0IQn-m6ekEry6wEVX62Fdn1wbonpjt8vdu8N-prD2bg6UesywRaGZ67lzQSa8mEfLs-QgVm6geQ' },
  { name: '고요 캠프장', location: '강원 평창군', tags: ['불멍 가능', '1인 전용'], rating: '4.8', img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBRAVSEbr68zM4So5xon7q_0L2gT702G247UaORHw1o3I1NOf40eY47wS0wtSgBWnc5mLuuWGABpwqB8XJlDRfweay8GqE8i8umQpAodJptGYR06-I-xRYVRcM83XTf15J2U_crv9Y-UggpqAvr7d9tgxpVcDpbsL9ybOg1MBtjVNrvFYCiYqXmFPV7DddPvxnTgOG-iEY976zJ-6htVLEEWZAqoXzd5Nd4f64tSshnVDw03QMyczxcVZvaAwOF8lp-HudqGa7B9sM' },
];

const checklist = [
  '낯선 사람과의 짧은 대화가 유난히 버겁다.',
  '친한 친구의 연락에도 답장하기가 귀찮다.',
  '사람들이 많은 곳에 가면 숨이 막히는 기분이 든다.',
  '혼자 있고 싶으면서도 고립되는 것 같은 불안감이 든다.',
];

function RestSocial() {
  const navigate = useNavigate();
  const [scale, setScale] = useState('solo');
  const [vibe, setVibe] = useState('quiet');
  const [liked, setLiked] = useState({});
  const filteredPlaces = SOCIAL_PLACES.filter(
    p => p.scale.includes(scale) && p.vibe.includes(vibe)
  );

  return (
    <div className="min-h-screen bg-[#F9F7F2]">
      <UserNavbar />
      <main className="max-w-7xl mx-auto px-6 py-10 space-y-20 pb-24 md:pb-10">

        {/* Back */}
        <Link to="/" className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-green-600 transition-colors">
          <span className="material-symbols-outlined text-base">arrow_back</span>
          홈으로
        </Link>

        {/* Hero */}
        <section className="relative h-[480px] rounded-2xl overflow-hidden bg-green-100">
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuDVHo44IXrLwpURnrayBLJRTzZW1ecO2YS5dA8pxsfc3pR8DE4eC-0uE62eWoyYaTSe5u9EOkhaqv_1Gv_KhfwTeKtMsjW1zbEj5aP08qYJggiAq9eFuQkXj7pW8wQqlwJEEcdMJ7HD8VFjS2c082xowr9hTYspsZbgJZVaD9qPQmkzfmbxHrwvdvPnuuv8lOJF4n3NmvyHbuSOmtS5GaOU-rFPBcgePgvAiKpmdM3pC-ARLcgJqVS33p8SYdia3GQM-fRo1OTYXMQ')" }}
          />
          <div className="absolute inset-0 bg-gradient-to-r from-white/90 via-white/40 to-transparent" />
          <div className="relative h-full flex flex-col justify-center px-12 max-w-2xl">
            <span className="inline-block px-4 py-1.5 bg-green-200 text-green-700 rounded-full text-sm font-bold mb-6 uppercase tracking-wider w-fit">Social Rest</span>
            <h2 className="text-4xl md:text-5xl font-bold text-slate-900 leading-tight mb-6">사회적 휴식</h2>
            <p className="text-lg text-slate-700 leading-relaxed">
              타인의 시선에서 벗어나 온전히 나에게 집중하거나,<br />
              편안한 관계 속에서 에너지를 채우는 시간입니다.
            </p>
            <div className="mt-8 flex gap-4">
              <button className="px-8 py-3 bg-green-600 text-white rounded-xl font-bold hover:bg-green-700 transition-colors shadow-lg shadow-green-200/50">휴식 시작하기</button>
              <button className="px-8 py-3 bg-white text-slate-700 border border-gray-200 rounded-xl font-bold hover:bg-gray-50 transition-colors">자세히 알아보기</button>
            </div>
          </div>
        </section>

        {/* Status cards */}
        <section>
          <div className="mb-8">
            <h3 className="text-2xl font-bold text-slate-900">나의 사회적 상태 & 효과</h3>
            <p className="text-slate-500 mt-2">오늘의 사회적 에너지 잔량을 체크해보세요.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-8 bg-white border border-gray-100 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-6">
                <span className="p-3 bg-green-50 text-green-600 rounded-xl material-symbols-outlined">battery_horiz_075</span>
                <span className="text-xs font-bold text-green-600 uppercase tracking-wider">Social Fatigue</span>
              </div>
              <p className="text-slate-500 text-sm font-medium">현재 사회적 피로도</p>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-4xl font-bold text-slate-900">75%</span>
                <span className="text-sm font-semibold text-rose-500">+15% vs 어제</span>
              </div>
              <div className="mt-6 w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                <div className="bg-green-500 h-full w-3/4" />
              </div>
            </div>
            <div className="p-8 bg-white border border-gray-100 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-6">
                <span className="p-3 bg-green-50 text-green-600 rounded-xl material-symbols-outlined">auto_awesome</span>
                <span className="text-xs font-bold text-green-600 uppercase tracking-wider">Expected Benefits</span>
              </div>
              <p className="text-slate-500 text-sm font-medium">예상 회복 효과</p>
              <div className="mt-4 space-y-3">
                {['신진대사 원활화', '대인관계 에너지 상승', '심리적 안정감 회복'].map((v, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-green-500 text-lg">check_circle</span>
                    <span className="text-slate-700 font-medium">{v}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="p-8 bg-green-600 text-white rounded-2xl shadow-xl flex flex-col justify-between">
              <div>
                <h4 className="text-xl font-bold mb-2">오늘의 휴식 조언</h4>
                <p className="text-green-50 opacity-90 leading-relaxed">오늘은 낯선 모임보다는 혼자만의 독서나 아주 가까운 친구 1명과의 조용한 대화가 더 효과적입니다.</p>
              </div>
              <button className="mt-6 py-2 px-4 bg-white/20 hover:bg-white/30 rounded-lg text-sm font-bold transition-colors">리포트 상세보기</button>
            </div>
          </div>
        </section>

        {/* Activities */}
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
                    <span className="material-symbols-outlined text-green-600">{act.icon}</span>
                  </div>
                </div>
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h4 className="text-lg font-bold text-slate-900 group-hover:text-green-600 transition-colors">{act.title}</h4>
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

        {/* Places carousel */}
        <section>
          <div className="mb-8">
            <h3 className="text-2xl font-bold text-slate-900">추천 장소</h3>
            <p className="text-slate-500 mt-2">나만 알고 싶은 조용한 공간들</p>
          </div>
          <div className="flex gap-6 overflow-x-auto pb-4 snap-x">
            {places.map((place, i) => (
              <div key={i} onClick={() => navigate('/map')} className="min-w-[320px] snap-start bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm cursor-pointer hover:shadow-md transition-shadow">
                <div className="relative">
                  <img className="h-48 w-full object-cover" src={place.img} alt={place.name} />
                  <button
                    onClick={(e) => { e.stopPropagation(); setLiked(prev => ({ ...prev, [i]: !prev[i] })); }}
                    className="absolute top-3 right-3 w-9 h-9 bg-white/90 backdrop-blur rounded-full flex items-center justify-center shadow"
                  >
                    <span className={`material-icons text-lg transition-colors ${liked[i] ? 'text-red-500' : 'text-slate-300 hover:text-red-300'}`}>favorite</span>
                  </button>
                </div>
                <div className="p-6">
                  <div className="flex justify-between items-start mb-2">
                    <h5 className="font-bold text-lg">{place.name}</h5>
                    <span className="flex items-center gap-1 text-green-600 text-sm font-bold">
                      <span className="material-symbols-outlined text-sm">star</span> {place.rating}
                    </span>
                  </div>
                  <p className="text-slate-500 text-sm mb-4">{place.location}</p>
                  <div className="flex gap-2 flex-wrap">
                    {place.tags.map((tag, j) => (
                      <span key={j} className="px-2 py-1 bg-gray-100 text-[10px] font-bold text-slate-500 rounded uppercase">{tag}</span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ===== 오늘 어떤 사회적 휴식을 원해요? ===== */}
        <section>
          <div className="mb-8">
            <h3 className="text-2xl font-bold text-gray-800">오늘 어떤 사회적 휴식을 원해요?</h3>
            <p className="text-gray-500 mt-2">함께할 인원과 분위기를 선택하면 딱 맞는 장소를 추천해줄게요</p>
          </div>

          <div className="mb-6">
            <p className="text-sm font-bold text-slate-600 mb-3">함께할 인원</p>
            <div className="grid grid-cols-3 gap-3">
              {SCALE_OPTIONS.map(opt => (
                <button key={opt.key} onClick={() => setScale(opt.key)}
                  className={`p-4 rounded-2xl border-2 text-left transition-all ${scale === opt.key ? 'bg-purple-500 border-purple-500 text-white' : 'bg-purple-50 border-purple-200 text-purple-700'}`}>
                  <div className="text-2xl mb-2">{opt.emoji}</div>
                  <p className="font-bold text-sm">{opt.label}</p>
                  <p className={`text-xs mt-1 ${scale === opt.key ? 'text-white/80' : 'opacity-70'}`}>{opt.desc}</p>
                </button>
              ))}
            </div>
          </div>

          <div className="mb-8">
            <p className="text-sm font-bold text-slate-600 mb-3">원하는 분위기</p>
            <div className="flex gap-3">
              {VIBE_OPTIONS.map(opt => (
                <button key={opt.key} onClick={() => setVibe(opt.key)}
                  className={`flex items-center gap-2 px-5 py-2.5 rounded-full border-2 font-bold text-sm transition-all ${vibe === opt.key ? 'bg-purple-500 border-purple-500 text-white' : 'bg-white border-slate-200 text-slate-600 hover:border-purple-300'}`}>
                  <span>{opt.emoji}</span>{opt.label}
                </button>
              ))}
            </div>
          </div>

          {filteredPlaces.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-2xl border border-slate-100">
              <span className="text-4xl mb-3 block">🎭</span>
              <p className="text-slate-500 font-medium">이 조건에 맞는 장소를 준비 중이에요</p>
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
            <a href="/map?restType=social" className="inline-flex items-center gap-2 bg-purple-500 text-white font-bold px-6 py-3 rounded-xl hover:bg-purple-600 transition-colors">
              <span className="material-icons text-base">map</span>
              지도에서 사회적 휴식 공간 찾기
            </a>
          </div>
        </section>

        {/* Checklist + Community */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <div className="p-10 bg-green-50 rounded-2xl border border-green-100">
            <div className="flex items-center gap-3 mb-8">
              <span className="material-symbols-outlined text-green-600 text-3xl">battery_charging_20</span>
              <h3 className="text-2xl font-bold text-slate-900">사회적 배터리 방전 신호</h3>
            </div>
            <div className="space-y-4">
              {checklist.map((item, i) => (
                <label key={i} className="flex items-center p-4 bg-white rounded-xl cursor-pointer group hover:border-green-200 border border-transparent transition-all shadow-sm">
                  <input type="checkbox" className="w-6 h-6 rounded-md text-green-600 focus:ring-green-500 border-gray-300" />
                  <span className="ml-4 text-slate-700 font-medium">{item}</span>
                </label>
              ))}
            </div>
            <div className="mt-8 p-4 bg-green-100/50 rounded-xl border border-green-200/50">
              <p className="text-sm text-green-800 font-medium">※ 3개 이상 체크되었다면, 오늘 저녁은 약속을 취소하고 사회적 휴식을 가질 것을 권장합니다.</p>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-2xl font-bold text-slate-900">커뮤니티 이야기</h3>
              <Link to="/community" className="text-green-600 font-bold text-sm flex items-center gap-1 hover:underline">
                더보기 <span className="material-symbols-outlined text-sm">arrow_forward</span>
              </Link>
            </div>
            <div className="space-y-6">
              {[
                { name: '고요한밤', time: '10분 전', content: '오늘 처음으로 북스테이에 왔는데, 휴대폰 없이 지내니까 정말 마음이 편안해요. 사회적 배터리 충전 중...' },
                { name: '민트라떼', time: '2시간 전', content: '거절하는 법을 배우는 것도 사회적 휴식의 일부라는 걸 오늘 깨달았습니다. 편안한 저녁 되세요!' },
                { name: '여행자A', time: '5시간 전', content: "카페 '무인도' 다녀왔습니다. 혼자만의 시간이 이렇게 달콤할 수 있다니 놀랐어요." },
              ].map((post, i) => (
                <div key={i} className="flex gap-4 p-4 hover:bg-green-50 rounded-xl transition-colors">
                  <div className="w-12 h-12 rounded-full bg-green-100 flex-shrink-0 flex items-center justify-center">
                    <span className="material-symbols-outlined text-green-600">person</span>
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-bold text-slate-900">{post.name}</span>
                      <span className="text-xs text-slate-400">{post.time}</span>
                    </div>
                    <p className="text-slate-600 text-sm line-clamp-2">{post.content}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* AI Pick */}
        <section className="bg-green-50 rounded-[32px] p-12 border border-green-100">
          <div className="flex flex-col lg:flex-row gap-12">
            <div className="flex-1">
              <div className="flex items-center gap-2 text-green-600 font-bold mb-4 uppercase tracking-widest text-sm">
                <span className="material-symbols-outlined">psychology</span> AI Rest Pick
              </div>
              <h3 className="text-3xl font-bold text-slate-900 mb-6">오늘 당신을 위한 AI 큐레이션</h3>
              <div className="p-6 bg-white rounded-2xl shadow-sm border border-green-100 mb-6">
                <p className="text-xl font-medium text-slate-800 leading-relaxed italic">
                  "가끔은 아무것도 하지 않는 것이, 무엇인가를 하는 것보다 훨씬 더 큰 용기가 필요하다."
                </p>
                <p className="text-right mt-4 text-slate-500">— 헤르만 헤세</p>
              </div>
            </div>
            <div className="flex-1 space-y-4">
              {[
                { icon: 'library_music', title: '어쿠스틱 힐링 플레이리스트', desc: '따뜻한 기타 연주곡 모음 • 45분', action: 'play_circle' },
                { icon: 'video_library', title: '나홀로 제주 숲 산책 Vlog', desc: 'ASMR | 자연의 소리 | 15분', action: 'play_circle' },
                { icon: 'menu_book', title: '관계의 거리 조절법', desc: '에디터의 추천 아티클 • 5분 독서', action: 'open_in_new' },
              ].map((item, i) => (
                <div key={i} className="flex items-center p-4 bg-white rounded-2xl shadow-sm border border-green-100 group cursor-pointer">
                  <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center text-green-600 mr-4">
                    <span className="material-symbols-outlined">{item.icon}</span>
                  </div>
                  <div className="flex-1">
                    <h5 className="font-bold text-slate-900">{item.title}</h5>
                    <p className="text-xs text-slate-500">{item.desc}</p>
                  </div>
                  <span className="material-symbols-outlined text-slate-400 group-hover:text-green-600">{item.action}</span>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

export default RestSocial;
