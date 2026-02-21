import UserNavbar from '../../components/user/UserNavbar';

const challenges = [
  { title: '7일 자연 산책 챌린지', desc: '일주일 동안 매일 30분 이상 자연 속에서 산책하기', progress: 72, participants: '1,284명', icon: 'park', color: 'from-soft-mint to-white', tag: '신체적 휴식', badge: '인기' },
  { title: '디지털 디톡스 3일 챌린지', desc: '하루 2시간 스마트폰 없이 온전한 나만의 시간 갖기', progress: 45, participants: '892명', icon: 'phone_disabled', color: 'from-pale-blue to-white', tag: '정신적 휴식', badge: '추천' },
  { title: '명상 21일 챌린지', desc: '매일 아침 10분 마음챙김 명상으로 하루 시작하기', progress: 30, participants: '2,150명', icon: 'self_improvement', color: 'from-purple-50 to-white', tag: '정신적 휴식', badge: '' },
  { title: '감사 일기 30일 챌린지', desc: '매일 감사한 일 3가지를 기록하며 긍정 에너지 채우기', progress: 60, participants: '3,421명', icon: 'edit_note', color: 'from-warm-beige to-white', tag: '감정적 휴식', badge: '인기' },
];

function Challenge() {
  return (
    <div className="min-h-screen bg-[#F9FAFB]">
      <UserNavbar />
      <main className="max-w-7xl mx-auto px-6 py-10 pb-24 md:pb-10">
        {/* Header */}
        <div className="mb-10">
          <h1 className="text-3xl font-bold text-slate-800 mb-2">챌린지</h1>
          <p className="text-slate-500">함께하면 더 쉬운 휴식 습관 만들기</p>
        </div>

        {/* My Challenge Progress */}
        <div className="bg-gradient-to-r from-primary to-[#10b981] rounded-2xl p-8 text-white mb-10 shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-white/70 text-sm font-medium">참여 중인 챌린지</p>
              <h2 className="text-2xl font-bold">7일 자연 산책 챌린지</h2>
            </div>
            <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center">
              <span className="material-icons text-white text-3xl">park</span>
            </div>
          </div>
          <div className="mb-2 flex justify-between text-sm">
            <span>진행률</span>
            <span className="font-bold">5/7일 완료</span>
          </div>
          <div className="w-full h-3 bg-white/20 rounded-full overflow-hidden">
            <div className="h-full bg-white rounded-full" style={{ width: '72%' }}></div>
          </div>
          <p className="text-white/70 text-xs mt-3">🎉 2일만 더 완료하면 배지를 획득할 수 있어요!</p>
        </div>

        {/* Challenge List */}
        <h2 className="text-xl font-bold text-slate-800 mb-6">진행 중인 챌린지</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {challenges.map((c, i) => (
            <div key={i} className={`relative bg-gradient-to-br ${c.color} border border-slate-200 rounded-2xl p-6 shadow-soft hover:shadow-hover transition-all`}>
              {c.badge && (
                <span className="absolute top-4 right-4 bg-primary text-white text-[10px] font-bold px-2 py-1 rounded-full">{c.badge}</span>
              )}
              <div className="flex items-start gap-4 mb-4">
                <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-sm">
                  <span className="material-icons text-primary">{c.icon}</span>
                </div>
                <div>
                  <span className="text-xs font-bold text-primary bg-soft-mint px-2 py-0.5 rounded-full">{c.tag}</span>
                  <h3 className="font-bold text-slate-800 mt-1">{c.title}</h3>
                </div>
              </div>
              <p className="text-sm text-slate-500 mb-4 leading-relaxed">{c.desc}</p>
              <div className="mb-2 flex justify-between text-xs text-slate-400">
                <span className="flex items-center gap-1"><span className="material-icons text-xs">people</span>{c.participants} 참여</span>
                <span>{c.progress}% 완료</span>
              </div>
              <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden mb-4">
                <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${c.progress}%` }}></div>
              </div>
              <button className="w-full py-2.5 bg-primary text-white font-bold rounded-xl text-sm hover:bg-primary/90 transition-all active:scale-95">
                참여하기
              </button>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}

export default Challenge;
