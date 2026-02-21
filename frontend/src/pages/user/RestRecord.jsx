import UserNavbar from '../../components/user/UserNavbar';

const records = [
  { type: '정신적 고요', title: '심신 안정 명상', duration: '20분', date: '오늘 오후 2:00', bpm: 68, icon: 'spa', color: 'bg-soft-mint text-emerald-600' },
  { type: '신체적 이완', title: '한강 산책', duration: '45분', date: '어제 오전 7:30', bpm: 72, icon: 'directions_walk', color: 'bg-pale-blue text-blue-600' },
  { type: '감각적 휴식', title: '독서 타임', duration: '60분', date: '11월 21일', bpm: 65, icon: 'menu_book', color: 'bg-warm-beige text-amber-600' },
  { type: '창의적 휴식', title: '스케치 그리기', duration: '30분', date: '11월 20일', bpm: 70, icon: 'brush', color: 'bg-accent-pink text-rose-600' },
];

function RestRecord() {
  return (
    <div className="min-h-screen bg-slate-50">
      <UserNavbar />
      <main className="max-w-4xl mx-auto px-6 py-10 pb-24 md:pb-10">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-800 mb-2">휴식 기록</h1>
          <p className="text-slate-500">나의 휴식 패턴을 분석해드려요</p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: '이번 주 휴식', value: '4회', icon: 'calendar_today', color: 'text-primary' },
            { label: '총 휴식 시간', value: '155분', icon: 'schedule', color: 'text-blue-500' },
            { label: '평균 심박수', value: '69 BPM', icon: 'favorite', color: 'text-red-400' },
            { label: '연속 기록', value: '7일', icon: 'local_fire_department', color: 'text-orange-500' },
          ].map((stat, i) => (
            <div key={i} className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
              <span className={`material-icons ${stat.color} mb-2`}>{stat.icon}</span>
              <p className="text-2xl font-bold text-slate-800">{stat.value}</p>
              <p className="text-xs text-slate-400 font-medium">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Filter */}
        <div className="flex gap-2 mb-6 overflow-x-auto hide-scrollbar">
          {['전체', '정신적', '신체적', '감각적', '감정적', '창의적'].map((f, i) => (
            <button key={i} className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-bold transition-all ${i === 0 ? 'bg-primary text-white' : 'bg-white border border-slate-200 text-slate-600 hover:border-primary hover:text-primary'}`}>
              {f}
            </button>
          ))}
        </div>

        {/* Record List */}
        <div className="space-y-4">
          {records.map((rec, i) => (
            <div key={i} className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center gap-4">
                <div className={`w-14 h-14 rounded-2xl ${rec.color} flex items-center justify-center shrink-0`}>
                  <span className="material-icons text-xl">{rec.icon}</span>
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-bold text-primary bg-soft-mint px-2 py-0.5 rounded-full">{rec.type}</span>
                  </div>
                  <h3 className="font-bold text-slate-800">{rec.title}</h3>
                  <div className="flex items-center gap-4 mt-1 text-xs text-slate-400">
                    <span className="flex items-center gap-1"><span className="material-icons text-[12px]">schedule</span>{rec.duration}</span>
                    <span className="flex items-center gap-1"><span className="material-icons text-[12px]">calendar_today</span>{rec.date}</span>
                    <span className="flex items-center gap-1"><span className="material-icons text-[12px] text-red-400">favorite</span>{rec.bpm} BPM</span>
                  </div>
                </div>
                <button className="text-slate-400 hover:text-primary transition-colors">
                  <span className="material-icons">chevron_right</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}

export default RestRecord;
