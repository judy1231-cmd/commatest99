import UserNavbar from '../../components/user/UserNavbar';

function MyPage() {
  return (
    <div className="min-h-screen bg-[#F9F7F2]">
      <UserNavbar />
      <main className="max-w-7xl mx-auto px-6 py-10 pb-24 md:pb-10">
        <div className="grid grid-cols-12 gap-6">

          {/* Profile Section */}
          <section className="col-span-12 lg:col-span-8 p-8 rounded-2xl bg-white border border-slate-200 flex flex-col md:flex-row items-center gap-8 shadow-sm">
            <div className="relative group">
              <div className="w-32 h-32 rounded-full bg-slate-200 border-4 border-white ring-1 ring-slate-100 shadow-md overflow-hidden flex items-center justify-center">
                <span className="material-icons text-slate-400 text-5xl">person</span>
              </div>
              <button className="absolute bottom-1 right-1 bg-white text-slate-600 p-1.5 rounded-full flex items-center justify-center border border-slate-200 shadow-sm hover:bg-[#F9F7F2] transition-colors">
                <span className="material-icons text-sm">edit</span>
              </button>
            </div>
            <div className="flex-1 text-center md:text-left">
              <div className="flex flex-col md:flex-row md:items-center gap-3 mb-2">
                <h1 className="text-3xl font-bold text-slate-900">김지수 <span className="text-lg font-normal text-slate-400 ml-1">님</span></h1>
                <span className="inline-flex items-center px-3 py-1 rounded-full bg-green-50 text-green-600 text-xs font-bold uppercase tracking-wider">
                  Level. 4 숲속의 명상가
                </span>
              </div>
              <p className="text-slate-500 mb-6 font-medium">"오늘 하루도 충분히 고생하셨어요. 잠시 멈춰서 숨을 골라보세요."</p>
              <div className="flex flex-wrap gap-3 justify-center md:justify-start">
                <div className="bg-[#F9F7F2] px-5 py-3 rounded-xl border border-slate-100">
                  <span className="text-xs text-slate-400 block font-semibold mb-1">총 휴식 시간</span>
                  <span className="text-xl font-bold text-slate-800">128시간</span>
                </div>
                <div className="bg-green-50 px-5 py-3 rounded-xl border border-green-100">
                  <span className="text-xs text-green-500/60 block font-semibold mb-1">보유 쉼표</span>
                  <span className="text-xl font-bold text-green-600">2,450 P</span>
                </div>
              </div>
            </div>
          </section>

          {/* Rest Type Card */}
          <section className="col-span-12 lg:col-span-4 p-8 rounded-2xl bg-gradient-to-br from-primary to-[#10b981] text-white flex flex-col justify-between shadow-lg">
            <div>
              <h3 className="text-white/80 font-semibold mb-1">나의 휴식 성향</h3>
              <h2 className="text-4xl font-extrabold mb-4 leading-tight">조용한<br />산책자</h2>
              <p className="text-sm font-medium text-white/90 leading-relaxed mb-8">
                당신은 복잡한 도심보다는 고요한 숲이나 강가에서 에너지를 얻는 타입입니다.
              </p>
            </div>
            <button className="w-full py-3.5 bg-white text-primary rounded-xl font-bold hover:bg-opacity-90 transition-all shadow-md flex items-center justify-center gap-2">
              <span>테스트 다시하기</span>
              <span className="material-icons text-sm">chevron_right</span>
            </button>
          </section>

          {/* Heart Rate Chart */}
          <section className="col-span-12 lg:col-span-7 p-8 rounded-2xl bg-white border border-slate-200 shadow-sm">
            <div className="flex justify-between items-center mb-10">
              <div>
                <h3 className="text-xl font-bold flex items-center gap-2 text-slate-900">
                  <span className="material-icons text-red-400">favorite</span>
                  실시간 심박수 기록
                </h3>
                <p className="text-sm text-slate-500 mt-1">최근 7일간의 안정한 심박수 추이</p>
              </div>
              <div className="flex p-1 bg-slate-100 rounded-lg">
                <button className="px-4 py-1.5 rounded-md bg-white text-primary text-xs font-bold shadow-sm">주간</button>
                <button className="px-4 py-1.5 rounded-md text-slate-500 text-xs font-medium hover:text-slate-700 transition-colors">월간</button>
              </div>
            </div>
            <div className="h-48 flex items-end justify-between gap-4 px-4">
              {[40, 55, 45, 70, 50, 35, 42].map((h, i) => (
                <div key={i} className="flex-1 bg-primary/20 rounded-t-lg hover:bg-primary/40 relative group" style={{ height: `${h}%` }}>
                  <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-[11px] font-bold px-2 py-1 rounded invisible group-hover:visible whitespace-nowrap">
                    {[72, 78, 74, 82, 75, 68, 73][i]}bpm
                  </div>
                </div>
              ))}
            </div>
            <div className="flex justify-between mt-6 px-4 text-[11px] text-slate-400 font-bold uppercase tracking-wider">
              {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(d => <span key={d}>{d}</span>)}
            </div>
          </section>

          {/* Activity Feed */}
          <section className="col-span-12 lg:col-span-5 p-8 rounded-2xl bg-white border border-slate-200 shadow-sm flex flex-col">
            <h3 className="text-xl font-bold mb-8 flex items-center gap-2 text-slate-900">
              <span className="material-icons text-primary">history</span>
              최근 활동 기록
            </h3>
            <div className="space-y-2 flex-1">
              {[
                { icon: 'spa', color: 'bg-blue-50 text-blue-500', title: '심신 안정 명상', time: '2시간 전', desc: '20분간 명상을 완료했습니다.' },
                { icon: 'park', color: 'bg-green-50 text-primary', title: '한강 뚝섬 유원지', time: '어제', desc: '방문 인증 완료 +100P' },
                { icon: 'psychology', color: 'bg-orange-50 text-orange-500', title: '휴식 성향 테스트', time: '3일 전', desc: '결과: 조용한 산책자' },
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-4 p-4 rounded-xl hover:bg-[#F9F7F2] transition-colors">
                  <div className={`w-12 h-12 rounded-full ${item.color} flex items-center justify-center shadow-sm`}>
                    <span className="material-icons">{item.icon}</span>
                  </div>
                  <div className="flex-1 border-b border-slate-100 pb-2">
                    <div className="flex justify-between items-center mb-1">
                      <span className="font-bold text-slate-800">{item.title}</span>
                      <span className="text-xs font-medium text-slate-400">{item.time}</span>
                    </div>
                    <p className="text-sm text-slate-500">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
            <button className="mt-8 py-2 text-sm font-bold text-slate-400 hover:text-primary transition-colors border-t border-slate-100 pt-6">모든 활동 보기</button>
          </section>

          {/* Settings */}
          <section className="col-span-12 mt-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {[
                { icon: 'person_outline', label: '개인정보 관리' },
                { icon: 'security', label: '보안 및 로그인' },
                { icon: 'tune', label: '맞춤 추천 설정' },
                { icon: 'logout', label: '로그아웃', red: true },
              ].map((item, i) => (
                <button key={i} className={`flex items-center gap-4 p-5 rounded-2xl bg-white border border-slate-100 shadow-sm hover:shadow-md transition-all group w-full text-left ${item.red ? 'hover:border-red-100' : 'hover:border-primary/30'}`}>
                  <div className={`p-2 rounded-lg bg-[#F9F7F2] transition-colors ${item.red ? 'group-hover:bg-red-50 group-hover:text-red-400' : 'group-hover:bg-green-50 group-hover:text-primary'} text-slate-400`}>
                    <span className="material-icons">{item.icon}</span>
                  </div>
                  <span className="text-sm font-bold text-slate-700">{item.label}</span>
                </button>
              ))}
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}

export default MyPage;
