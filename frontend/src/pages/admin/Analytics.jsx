import AdminSidebar from '../../components/admin/AdminSidebar';
import AdminHeader from '../../components/admin/AdminHeader';

const kpis = [
  { label: '총 사용자', value: '24,832', change: '+18.4%', up: true },
  { label: '월간 활성 사용자', value: '12,405', change: '+9.2%', up: true },
  { label: '평균 세션 시간', value: '24.3분', change: '-1.8%', up: false },
  { label: '리텐션율 (D30)', value: '62.1%', change: '+4.5%', up: true },
];

const restTypes = [
  { type: '신체적 휴식', pct: 35, color: 'bg-emerald-400', value: '8,691명' },
  { type: '정신적 휴식', pct: 28, color: 'bg-blue-400', value: '6,953명' },
  { type: '감각적 휴식', pct: 20, color: 'bg-amber-400', value: '4,967명' },
  { type: '감정적 휴식', pct: 10, color: 'bg-rose-400', value: '2,483명' },
  { type: '창의적 휴식', pct: 7, color: 'bg-purple-400', value: '1,738명' },
];

function Analytics() {
  return (
    <div className="flex h-screen overflow-hidden bg-[#F9F7F2]">
      <AdminSidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <AdminHeader title="통계 및 분석" subtitle="플랫폼 전체 현황과 사용자 인사이트" />
        <main className="flex-1 overflow-y-auto p-6 space-y-6">

          {/* KPI Cards */}
          <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {kpis.map((kpi, i) => (
              <div key={i} className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm">
                <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider mb-2">{kpi.label}</p>
                <p className="text-3xl font-black text-slate-800">{kpi.value}</p>
                <div className={`flex items-center gap-1 mt-2 text-sm font-semibold ${kpi.up ? 'text-emerald-500' : 'text-red-400'}`}>
                  <span className="material-icons text-sm">{kpi.up ? 'trending_up' : 'trending_down'}</span>
                  {kpi.change} 지난 달 대비
                </div>
              </div>
            ))}
          </section>

          {/* Charts Row */}
          <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Line Chart (mock) */}
            <div className="lg:col-span-2 bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="font-bold text-lg text-slate-800">신규 가입자 추이</h3>
                  <p className="text-xs text-slate-400 mt-0.5">최근 12개월</p>
                </div>
                <select className="text-sm border border-slate-200 bg-slate-50 rounded-lg px-3 py-1.5 outline-none focus:ring-primary">
                  <option>12개월</option>
                  <option>6개월</option>
                  <option>3개월</option>
                </select>
              </div>
              <div className="h-48 flex items-end gap-1">
                {[30, 45, 38, 55, 42, 68, 75, 60, 80, 90, 85, 100].map((h, i) => (
                  <div key={i} className="flex-1 bg-primary/20 hover:bg-primary/40 rounded-t transition-colors group relative" style={{ height: `${h}%` }}>
                    <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-[9px] px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 whitespace-nowrap">
                      {[800, 1200, 980, 1450, 1100, 1800, 2000, 1600, 2100, 2400, 2250, 2700][i]}명
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex justify-between mt-3 text-[10px] text-slate-400 font-medium">
                {['1월', '2월', '3월', '4월', '5월', '6월', '7월', '8월', '9월', '10월', '11월', '12월'].map(m => (
                  <span key={m}>{m}</span>
                ))}
              </div>
            </div>

            {/* Rest Type Distribution */}
            <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
              <h3 className="font-bold text-lg text-slate-800 mb-6">휴식 유형 분포</h3>
              <div className="space-y-4">
                {restTypes.map((rt, i) => (
                  <div key={i}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="font-medium text-slate-700">{rt.type}</span>
                      <span className="text-slate-400">{rt.value}</span>
                    </div>
                    <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden">
                      <div className={`h-full ${rt.color} rounded-full`} style={{ width: `${rt.pct}%` }}></div>
                    </div>
                    <p className="text-right text-xs text-slate-400 mt-0.5">{rt.pct}%</p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Geo & Funnel */}
          <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
              <h3 className="font-bold text-lg text-slate-800 mb-6">지역별 사용자 분포</h3>
              <div className="space-y-3">
                {[
                  { region: '서울', pct: 42, count: '10,429명' },
                  { region: '경기', pct: 23, count: '5,711명' },
                  { region: '부산', pct: 9, count: '2,235명' },
                  { region: '인천', pct: 7, count: '1,738명' },
                  { region: '기타', pct: 19, count: '4,719명' },
                ].map((r, i) => (
                  <div key={i} className="flex items-center gap-4">
                    <span className="text-sm font-semibold text-slate-600 w-10">{r.region}</span>
                    <div className="flex-1 h-3 bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full bg-primary rounded-full" style={{ width: `${r.pct}%` }}></div>
                    </div>
                    <div className="text-right w-20">
                      <span className="text-xs text-slate-400">{r.count}</span>
                    </div>
                    <span className="text-sm font-bold text-primary w-8 text-right">{r.pct}%</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
              <h3 className="font-bold text-lg text-slate-800 mb-6">사용자 여정 퍼널</h3>
              <div className="space-y-3">
                {[
                  { step: '방문자', count: '50,000', pct: 100 },
                  { step: '회원가입', count: '24,832', pct: 50 },
                  { step: '진단 완료', count: '18,500', pct: 37 },
                  { step: '장소 방문', count: '9,200', pct: 18 },
                  { step: '챌린지 참여', count: '4,100', pct: 8 },
                ].map((f, i) => (
                  <div key={i} className="flex items-center gap-4">
                    <div className="flex items-center gap-2 w-28">
                      <span className="w-6 h-6 rounded-full bg-primary/20 text-primary text-xs font-bold flex items-center justify-center shrink-0">{i + 1}</span>
                      <span className="text-sm font-medium text-slate-700">{f.step}</span>
                    </div>
                    <div className="flex-1 h-3 bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full bg-primary/60 rounded-full" style={{ width: `${f.pct}%` }}></div>
                    </div>
                    <span className="text-sm font-bold text-slate-600 w-16 text-right">{f.count}</span>
                  </div>
                ))}
              </div>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}

export default Analytics;
