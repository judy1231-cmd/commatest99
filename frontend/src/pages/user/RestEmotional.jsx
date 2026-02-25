import { useState } from 'react';
import { Link } from 'react-router-dom';
import UserNavbar from '../../components/user/UserNavbar';

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
  const [selectedMood, setSelectedMood] = useState(0);

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
      </main>
    </div>
  );
}

export default RestEmotional;
