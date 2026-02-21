import UserNavbar from '../../components/user/UserNavbar';

function HeartRateCheck() {
  return (
    <div className="min-h-screen bg-[#fcfdfd] font-display">
      <UserNavbar />
      <main className="flex-1 max-w-4xl mx-auto w-full px-6 py-12 flex flex-col items-center justify-center space-y-16">
        {/* Status */}
        <div className="text-center space-y-4">
          <h2 className="text-3xl font-bold tracking-tight text-gray-800">심박수를 측정하고 있습니다</h2>
          <p className="font-medium text-[#48c78e]">편안한 자세로 호흡에 집중해 주세요</p>
        </div>

        {/* Visualizer */}
        <div className="relative flex items-center justify-center">
          <div className="absolute inset-0 w-64 h-64 md:w-80 md:h-80 bg-[#48c78e]/10 rounded-full blur-3xl scale-125 opacity-30"></div>
          <div className="relative w-64 h-64 md:w-80 md:h-80 rounded-full bg-white shadow-2xl shadow-[#48c78e]/20 flex flex-col items-center justify-center border border-[#48c78e]/5">
            <div className="flex flex-col items-center">
              <span className="material-symbols-outlined text-5xl mb-2" style={{ color: '#ff6b6b' }}>favorite</span>
              <div className="text-7xl font-black text-gray-700 leading-none">72</div>
              <div className="text-lg font-bold text-[#48c78e]/60 mt-2">BPM</div>
            </div>
            <div className="absolute bottom-16 w-32 h-8">
              <svg className="w-full h-full fill-none stroke-2 stroke-[#4dabf7]/40" viewBox="0 0 100 20">
                <path d="M0 10 Q 10 0, 20 10 T 40 10 T 60 10 T 80 10 T 100 10" />
              </svg>
            </div>
          </div>
        </div>

        {/* Action */}
        <div className="flex flex-col items-center gap-6">
          <button className="bg-[#48c78e] text-white px-12 py-4 rounded-full font-bold text-lg shadow-xl hover:bg-[#48c78e]/90 transition-all transform hover:scale-105">
            측정 중단
          </button>
          <p className="text-sm text-gray-400 italic">"천천히 숨을 들이마시고 내뱉으세요"</p>
        </div>

        {/* Data Cards */}
        <div className="w-full grid md:grid-cols-2 gap-6 pt-12">
          <div className="bg-white/50 backdrop-blur-sm p-8 rounded-xl border border-[#48c78e]/5 space-y-6">
            <div className="flex items-center justify-between border-b border-[#48c78e]/10 pb-4">
              <h3 className="font-bold text-lg flex items-center gap-2">
                <span className="material-symbols-outlined text-[#48c78e]">history</span>
                최근 기록
              </h3>
              <button className="text-xs font-bold text-[#48c78e]">전체보기</button>
            </div>
            <ul className="space-y-4">
              {[
                { time: '오늘 오후 2:30', bpm: '68 BPM', color: 'text-gray-800' },
                { time: '어제 오전 9:15', bpm: '82 BPM', color: 'text-[#4dabf7]' },
                { time: '11월 20일 오후 10:45', bpm: '64 BPM', color: 'text-gray-800' },
              ].map((record, i) => (
                <li key={i} className="flex items-center justify-between">
                  <span className="text-sm opacity-60">{record.time}</span>
                  <span className={`font-bold ${record.color}`}>{record.bpm}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="bg-[#4dabf7]/5 p-8 rounded-xl border border-[#48c78e]/10 space-y-6">
            <div className="flex items-center border-b border-[#48c78e]/10 pb-4">
              <h3 className="font-bold text-lg flex items-center gap-2">
                <span className="material-symbols-outlined text-[#48c78e]">query_stats</span>
                이번 주 평균
              </h3>
            </div>
            <div className="flex items-end justify-between">
              <div className="space-y-1">
                <p className="text-4xl font-black text-[#48c78e]">74</p>
                <p className="text-sm opacity-70">평균 안정시 심박수</p>
              </div>
              <div className="flex gap-1 items-end h-16">
                {[60, 70, 90, 80, 65].map((h, i) => (
                  <div key={i} className={`w-2 rounded-full ${i === 2 ? 'bg-[#4dabf7]' : 'bg-[#4dabf7]/20'}`} style={{ height: `${h}%` }}></div>
                ))}
              </div>
            </div>
            <p className="text-xs leading-relaxed opacity-60">
              지난 주보다 평균 심박수가 3 BPM 낮아졌습니다. 매우 좋은 변화입니다.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}

export default HeartRateCheck;
