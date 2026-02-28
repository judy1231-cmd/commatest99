import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import UserNavbar from '../../components/user/UserNavbar';

const COMPANION_OPTIONS = [
  { key: 'alone',    label: '혼자',    emoji: '🧍', desc: '나 혼자 조용히 회복하고 싶어' },
  { key: 'together', label: '누군가와', emoji: '🤝', desc: '옆에 누가 있으면 좋겠어' },
  { key: 'pet',      label: '반려동물', emoji: '🐾', desc: '말 없는 따뜻한 존재가 필요해' },
];

const METHOD_OPTIONS = [
  { key: 'activity', label: '활동',  emoji: '🎭' },
  { key: 'viewing',  label: '감상',  emoji: '🎬' },
  { key: 'writing',  label: '기록',  emoji: '📝' },
];

const EMOTIONAL_PLACES = [
  { name: '동물카페', location: '홍대·합정·신촌', desc: '강아지·고양이와 교감. 무조건적인 애정으로 정서 충전', companion: ['pet'], method: ['activity'], tags: ['동물카페', '힐링', '귀여움'], icon: 'pets', color: '#EC4899' },
  { name: '반려동물 돌봄 봉사', location: '유기동물 보호센터', desc: '유기동물 돌보기 봉사. 나보다 더 필요한 존재에게 온기 나누기', companion: ['pet'], method: ['activity'], tags: ['봉사', '유기동물', '보람'], icon: 'favorite', color: '#f43f5e' },
  { name: '힐링 영화관 (독립영화)', location: '씨네큐브·아트하우스', desc: '감동적인 독립영화 관람. 울어도 되는 공간', companion: ['alone'], method: ['viewing'], tags: ['영화', '독립영화', '감동'], icon: 'movie', color: '#8b5cf6' },
  { name: 'OTT 감성 영화 마라톤', location: '집에서', desc: '넷플릭스·웨이브에서 감동 영화 연속 감상. 울고 싶을 때 마음껏', companion: ['alone'], method: ['viewing'], tags: ['넷플릭스', '영화마라톤', '집관'], icon: 'tv', color: '#6366f1' },
  { name: '편지 쓰기 카페', location: '연남동·망원동', desc: '종이에 손으로 편지 쓰기. 보내지 않아도 괜찮아, 쓰는 것만으로 치유', companion: ['alone'], method: ['writing'], tags: ['편지', '아날로그', '감정해소'], icon: 'mail', color: '#f59e0b' },
  { name: '감정 일기 쓰기', location: '집·카페 어디서든', desc: '오늘 느낀 감정 단어 5개 적기. 작은 것부터 시작', companion: ['alone'], method: ['writing'], tags: ['일기', '감정정리', '무료'], icon: 'book', color: '#10b981' },
  { name: '친한 친구와 야식 먹기', location: '편한 식당·집', desc: '맛있는 것 앞에서 하는 수다는 최고의 정서 치유', companion: ['together'], method: ['activity'], tags: ['친구', '야식', '수다'], icon: 'restaurant', color: '#f97316' },
  { name: '보드게임 카페 (소수)', location: '홍대·건대', desc: '2~4명이서 보드게임. 웃다 보면 어느새 기분이 풀려', companion: ['together'], method: ['activity'], tags: ['보드게임', '소규모', '웃음'], icon: 'casino', color: '#0ea5e9' },
];

const moods = [
  { icon: 'wb_sunny', label: '평온함' },
  { icon: 'cloudy_snowing', label: '지침' },
  { icon: 'favorite', label: '설렘' },
  { icon: 'rainy', label: '우울함' },
  { icon: 'sentiment_very_satisfied', label: '행복함' },
];

const weekData = [
  { day: '월', h: 48, active: false },
  { day: '화', h: 80, active: false },
  { day: '수', h: 112, active: true },
  { day: '목', h: 64, active: false },
  { day: '금', h: 96, active: false },
  { day: '토', h: 16, active: false },
  { day: '일', h: 16, active: false },
];

function RestEmotional() {
  const navigate = useNavigate();
  const [selectedMood, setSelectedMood] = useState(0);
  const [companion, setCompanion] = useState('alone');
  const [method, setMethod] = useState('activity');
  const [liked, setLiked] = useState({});
  const filteredEmotional = EMOTIONAL_PLACES.filter(
    p => p.companion.includes(companion) && p.method.includes(method)
  );

  return (
    <div className="min-h-screen bg-[#F9F7F2]">
      <UserNavbar />
      <main className="max-w-4xl mx-auto px-4 md:px-10 py-8 space-y-10 pb-24 md:pb-10">

        {/* Back */}
        <Link to="/" className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-teal-600 transition-colors">
          <span className="material-symbols-outlined text-base">arrow_back</span>
          홈으로
        </Link>

        {/* Hero */}
        <section className="relative min-h-[420px] flex flex-col items-center justify-center text-center p-8 rounded-3xl overflow-hidden bg-white border border-teal-100">
          <div
            className="absolute inset-0 opacity-20 pointer-events-none"
            style={{ backgroundImage: 'radial-gradient(circle at 20% 30%, #3a9b88 0%, transparent 50%), radial-gradient(circle at 80% 70%, #78909c 0%, transparent 50%)' }}
          />
          <div className="relative z-10 flex flex-col gap-6 max-w-2xl">
            <span className="inline-block px-4 py-1.5 rounded-full bg-teal-600/10 text-teal-600 text-sm font-bold tracking-wide self-center uppercase">Today's Warmth</span>
            <h1 className="text-slate-900 text-4xl md:text-5xl font-black leading-tight tracking-tight">
              오늘도 고생 많았어요.<br />잠시 쉬어가도 괜찮아요.
            </h1>
            <p className="text-slate-600 text-lg">
              숨을 깊게 들이마시고 내뱉으며,<br />당신의 마음을 돌보는 따뜻한 공간입니다.
            </p>
            <div className="flex flex-wrap justify-center gap-4 mt-2">
              <button className="flex h-12 items-center justify-center rounded-xl bg-teal-600 px-8 text-white font-bold shadow-lg shadow-teal-600/30 hover:bg-teal-700 transition-all">
                명상 시작하기
              </button>
              <button className="flex h-12 items-center justify-center rounded-xl border-2 border-teal-200 bg-white/50 px-8 text-teal-600 font-bold hover:bg-teal-50 transition-all">
                기분 기록하기
              </button>
            </div>
          </div>
        </section>

        {/* Mood Selection */}
        <section>
          <h2 className="text-slate-900 text-2xl font-bold mb-6">지금 당신의 기분은 어떤가요?</h2>
          <div className="flex gap-4 overflow-x-auto pb-2">
            {moods.map((mood, i) => (
              <button
                key={i}
                onClick={() => setSelectedMood(i)}
                className="flex flex-col items-center gap-3 shrink-0 group"
              >
                <div className={`w-16 h-16 flex items-center justify-center rounded-2xl transition-all shadow-sm ${
                  selectedMood === i
                    ? 'bg-teal-600 text-white'
                    : 'bg-slate-100 text-slate-500 group-hover:bg-teal-100 group-hover:text-teal-600'
                }`}>
                  <span className="material-symbols-outlined text-3xl">{mood.icon}</span>
                </div>
                <span className={`text-sm font-medium ${selectedMood === i ? 'text-teal-600' : 'text-slate-600'}`}>{mood.label}</span>
              </button>
            ))}
          </div>
        </section>

        {/* Featured Meditation */}
        <section>
          <div className="flex flex-col overflow-hidden rounded-3xl bg-white border border-teal-100 shadow-sm md:flex-row">
            <div className="w-full md:w-1/2 aspect-video bg-slate-200 relative overflow-hidden">
              <img
                className="w-full h-full object-cover opacity-90"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuA2JywuWQsFvZXZQ74gizuSGAjzAw9HN_ThfRAvMgNA8w_2EJY7-EDjG9o11jTiCsIhT27FedZRk4S7dSihvW63RxjNGqPIAPE84q3RwCfp_qr2MfQLw6dl5MzmidbcM2rcxvrUx676UpK0H0dBzq3FPxH4zvYmzaidKcH0y0eHaelrYh-GLS-femCdswPreEHDATRl0a0gTYVBJKGNzJ3e6eCOuPuonk6rkxNCzmElrr_m40gsIzOMSeS5lZjFxi4XuLq2iPabS3E"
                alt="명상"
              />
              <div className="absolute inset-0 bg-teal-600/10 flex items-center justify-center">
                <button className="w-16 h-16 rounded-full bg-white/30 backdrop-blur-md flex items-center justify-center text-white hover:scale-110 transition-transform">
                  <span className="material-symbols-outlined text-4xl">play_arrow</span>
                </button>
              </div>
            </div>
            <div className="flex w-full flex-col justify-center p-8 md:w-1/2 gap-4">
              <div>
                <p className="text-teal-600 text-sm font-bold mb-1">오늘의 명상</p>
                <h3 className="text-slate-900 text-2xl font-bold">마음 챙김 명상 - 고요한 숲의 소리</h3>
              </div>
              <p className="text-slate-600 leading-relaxed">자연의 소리와 함께 깊은 휴식을 취해보세요. 15분간의 짧은 여정으로 머릿속의 복잡한 생각들을 정리할 수 있습니다.</p>
              <div className="flex items-center gap-4 mt-2">
                <span className="flex items-center gap-1 text-xs text-slate-500">
                  <span className="material-symbols-outlined text-sm">schedule</span> 15분
                </span>
                <span className="flex items-center gap-1 text-xs text-slate-500">
                  <span className="material-symbols-outlined text-sm">equalizer</span> 초급
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* Journaling + Affirmation */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="flex flex-col gap-4 p-6 rounded-3xl border border-teal-100 bg-slate-50">
            <div className="flex items-center gap-3 mb-2">
              <span className="material-symbols-outlined text-teal-600">edit_note</span>
              <h3 className="text-xl font-bold">나를 위한 기록</h3>
            </div>
            <p className="text-slate-600 text-sm">지금 이 순간, 당신의 마음을 솔직하게 기록해보세요. 글로 옮기는 것만으로도 마음이 가벼워집니다.</p>
            <textarea
              className="w-full mt-2 min-h-[140px] rounded-xl border border-teal-100 bg-white focus:ring-2 focus:ring-teal-300 focus:border-transparent outline-none text-slate-800 placeholder:text-slate-400 p-3 text-sm"
              placeholder="오늘 나에게 해주고 싶은 말은 무엇인가요?"
            />
            <button className="mt-2 w-full flex h-10 items-center justify-center rounded-xl text-teal-600 font-bold hover:bg-teal-600 hover:text-white transition-all border border-teal-200">
              일기 저장하기
            </button>
          </div>

          <div className="flex flex-col gap-6 p-6 rounded-3xl bg-white border border-teal-100 justify-center">
            <div className="text-center flex flex-col gap-4">
              <span className="material-symbols-outlined text-4xl text-teal-600 opacity-50 mx-auto">format_quote</span>
              <p className="text-xl font-medium italic leading-relaxed text-slate-800">
                "당신은 충분히 잘하고 있습니다.<br />오늘 하루의 작은 결실들을<br />스스로 칭찬해주세요."
              </p>
              <div className="w-12 h-1 bg-teal-300 mx-auto rounded-full mt-2"></div>
              <button className="mt-4 flex items-center gap-2 self-center text-teal-600 font-bold text-sm group">
                다른 응원 메시지 보기
                <span className="material-symbols-outlined text-sm group-hover:translate-x-1 transition-transform">arrow_forward</span>
              </button>
            </div>
          </div>
        </section>

        {/* Recovery Journey */}
        <section className="mb-10">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-slate-900 text-2xl font-bold">나의 회복 여정</h2>
            <button className="text-sm font-medium text-teal-600 hover:underline">자세히 보기</button>
          </div>
          <div className="bg-white rounded-2xl p-6 border border-teal-100 shadow-sm">
            <div className="grid grid-cols-7 gap-2 h-32 items-end">
              {weekData.map((d, i) => (
                <div key={i} className="flex flex-col items-center gap-2">
                  <div
                    className={`w-full rounded-t-lg transition-all ${d.active ? 'bg-teal-600' : 'bg-slate-200'}`}
                    style={{ height: d.h }}
                  />
                  <span className={`text-[10px] ${d.active ? 'text-teal-600 font-bold' : 'text-slate-400'}`}>{d.day}</span>
                </div>
              ))}
            </div>
            <p className="text-center mt-4 text-slate-500 text-sm">이번 주에는 명상을 3번 실천하셨네요! 잘하고 있어요.</p>
          </div>
        </section>

        {/* ===== 지금 어떤 방식으로 위로받고 싶어요? ===== */}
        <section>
          <div className="mb-8">
            <h3 className="text-2xl font-bold text-gray-800">지금 어떤 방식으로 위로받고 싶어요?</h3>
            <p className="text-slate-500 mt-2">함께할 대상과 방식을 선택하면 딱 맞는 것을 추천해줄게요</p>
          </div>

          <div className="mb-6">
            <p className="text-sm font-bold text-slate-600 mb-3">함께할 대상</p>
            <div className="grid grid-cols-3 gap-3">
              {COMPANION_OPTIONS.map(opt => (
                <button key={opt.key} onClick={() => setCompanion(opt.key)}
                  className={`p-4 rounded-2xl border-2 text-left transition-all ${companion === opt.key ? 'bg-pink-500 border-pink-500 text-white' : 'bg-pink-50 border-pink-200 text-pink-700'}`}>
                  <div className="text-2xl mb-2">{opt.emoji}</div>
                  <p className="font-bold text-sm">{opt.label}</p>
                  <p className={`text-xs mt-1 ${companion === opt.key ? 'text-white/80' : 'opacity-70'}`}>{opt.desc}</p>
                </button>
              ))}
            </div>
          </div>

          <div className="mb-8">
            <p className="text-sm font-bold text-slate-600 mb-3">방식</p>
            <div className="flex gap-3">
              {METHOD_OPTIONS.map(opt => (
                <button key={opt.key} onClick={() => setMethod(opt.key)}
                  className={`flex items-center gap-2 px-5 py-2.5 rounded-full border-2 font-bold text-sm transition-all ${method === opt.key ? 'bg-pink-500 border-pink-500 text-white' : 'bg-white border-slate-200 text-slate-600 hover:border-pink-300'}`}>
                  <span>{opt.emoji}</span>{opt.label}
                </button>
              ))}
            </div>
          </div>

          {filteredEmotional.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-2xl border border-slate-100">
              <span className="text-4xl mb-3 block">💗</span>
              <p className="text-slate-500 font-medium">이 조건에 맞는 활동을 준비 중이에요</p>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 gap-4">
              {filteredEmotional.map((place, i) => (
                <div key={i} onClick={() => navigate('/map')} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 hover:shadow-md transition-shadow cursor-pointer">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: `${place.color}20` }}>
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
            <a href="/map?restType=emotional" className="inline-flex items-center gap-2 bg-pink-500 text-white font-bold px-6 py-3 rounded-xl hover:bg-pink-600 transition-colors">
              <span className="material-icons text-base">map</span>
              지도에서 정서 힐링 공간 찾기
            </a>
          </div>
        </section>
      </main>
    </div>
  );
}

export default RestEmotional;
