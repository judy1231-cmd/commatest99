import { useState, useEffect } from 'react';
import { fetchWithAuth } from '../../../api/fetchWithAuth';
import AdminSidebar from '../../../components/admin/AdminSidebar';
import AdminHeader from '../../../components/admin/AdminHeader';

const REST_TYPE_KR = {
  physical: '신체적 이완', mental: '정신적 고요', sensory: '감각의 정화',
  emotional: '정서적 지지', social: '사회적 휴식', nature: '자연의 연결', creative: '창조적 몰입',
};
const TYPE_COLORS = ['#10B981', '#3B82F6', '#F59E0B', '#F43F5E', '#8B5CF6', '#F97316', '#14B8A6'];

const PERIOD_TABS = [
  { key: 'today',  label: '오늘' },
  { key: '7d',     label: '7일' },
  { key: '30d',    label: '30일' },
  { key: 'custom', label: '직접입력' },
];

function AdminStats() {
  const [analytics, setAnalytics] = useState(null);
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const [a, d] = await Promise.allSettled([
          fetchWithAuth('/api/admin/analytics'),
          fetchWithAuth('/api/admin/dashboard'),
        ]);
        if (a.status === 'fulfilled' && a.value.success) setAnalytics(a.value.data);
        if (d.status === 'fulfilled' && d.value.success) setDashboard(d.value.data);
      } finally { setLoading(false); }
    })();
  }, []);

  const summaryCards = dashboard ? [
    { label: '전체 회원',      value: dashboard.totalUsers?.toLocaleString()    || '0', unit: '명', icon: 'people',      iconCls: 'bg-blue-50 text-blue-600',      trend: 'up' },
    { label: '휴식 기록 수',   value: dashboard.totalRestLogs?.toLocaleString() || '0', unit: '건', icon: 'event_note',  iconCls: 'bg-emerald-50 text-emerald-600', trend: 'up' },
    { label: '활성 사용자',    value: dashboard.activeUsers?.toLocaleString()   || '0', unit: '명', icon: 'verified',    iconCls: 'bg-amber-50 text-amber-600',     trend: 'up' },
    { label: '오늘 신규 가입', value: dashboard.todaySignups?.toLocaleString()  || '0', unit: '명', icon: 'person_add',  iconCls: 'bg-rose-50 text-rose-600',       trend: 'up' },
  ] : [];

  const popularity  = analytics?.restTypePopularity || [];
  const maxCount    = Math.max(...popularity.map(p => p.count || 0), 1);
  const totalPopCount = popularity.reduce((s, p) => s + (p.count || 0), 0) || 1;
  const recentLogs  = (analytics?.dailyRestLogs || []).slice(-7).reverse();
  const maxLogCount = Math.max(...recentLogs.map(r => r.count || 0), 1);
  const dailySignups = analytics?.dailySignups || [];

  /* ── UI 전용 상태 ── */
  const [periodTab, setPeriodTab] = useState('30d');
  const [dateFrom,  setDateFrom]  = useState('');
  const [dateTo,    setDateTo]    = useState('');

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      <AdminSidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <AdminHeader title="통계 & 분석" subtitle="플랫폼 전체 데이터를 분석합니다." />
        <main className="flex-1 overflow-y-auto p-6 space-y-5">

          {/* ── 기간 탭 ── */}
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 bg-white border border-gray-200 rounded-xl p-1 shadow-sm">
              {PERIOD_TABS.map(tab => (
                <button
                  key={tab.key}
                  onClick={() => setPeriodTab(tab.key)}
                  className={`h-8 px-4 rounded-lg text-sm font-semibold transition-all ${
                    periodTab === tab.key
                      ? 'bg-primary text-white shadow-sm'
                      : 'text-gray-500 hover:text-gray-800'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
            {periodTab === 'custom' && (
              <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-xl px-3 py-1.5 shadow-sm">
                <input
                  type="date"
                  value={dateFrom}
                  onChange={e => setDateFrom(e.target.value)}
                  className="h-7 px-2 border border-gray-200 rounded-lg text-xs text-gray-700 bg-gray-50 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                />
                <span className="text-xs text-gray-400">~</span>
                <input
                  type="date"
                  value={dateTo}
                  onChange={e => setDateTo(e.target.value)}
                  className="h-7 px-2 border border-gray-200 rounded-lg text-xs text-gray-700 bg-gray-50 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                />
              </div>
            )}
            <span className="text-xs text-gray-400 ml-1">* 기간 필터는 API 연동 후 적용됩니다</span>
          </div>

          {/* ── KPI 카드 ── */}
          <section className="grid grid-cols-4 gap-4">
            {loading ? (
              [...Array(4)].map((_, i) => (
                <div key={i} className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 animate-pulse">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-10 h-10 rounded-lg bg-gray-200" />
                    <div className="w-12 h-4 bg-gray-100 rounded" />
                  </div>
                  <div className="w-20 h-8 bg-gray-200 rounded mb-2" />
                  <div className="w-24 h-3 bg-gray-100 rounded" />
                </div>
              ))
            ) : (
              summaryCards.map((card, i) => (
                <div key={i} className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
                  <div className="flex items-center justify-between mb-3">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${card.iconCls}`}>
                      <span className="material-icons text-[20px]">{card.icon}</span>
                    </div>
                    <span className="flex items-center gap-0.5 text-xs font-semibold text-emerald-500">
                      <span className="material-icons text-[14px]">arrow_upward</span>
                      증가
                    </span>
                  </div>
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">{card.label}</p>
                  <div className="flex items-end gap-1">
                    <span className="text-3xl font-black text-gray-900 leading-none">{card.value}</span>
                    <span className="text-sm text-gray-400 mb-0.5">{card.unit}</span>
                  </div>
                </div>
              ))
            )}
          </section>

          {/* ── 차트 행 ── */}
          <section className="grid grid-cols-3 gap-5">

            {/* 신규 가입자 추이 (2/3) */}
            <div className="col-span-2 bg-white rounded-xl border border-gray-200 shadow-sm p-6">
              <div className="flex items-center justify-between mb-5">
                <div>
                  <h3 className="text-sm font-bold text-gray-900">신규 가입자 추이</h3>
                  <p className="text-xs text-gray-400 mt-0.5">일별 신규 가입 수</p>
                </div>
                {!loading && dailySignups.length > 0 && (
                  <span className="text-xs text-gray-400 bg-gray-100 px-2 py-1 rounded-lg">
                    최근 {dailySignups.length}일
                  </span>
                )}
              </div>

              {loading ? (
                <div className="h-52 bg-gray-50 rounded-xl animate-pulse" />
              ) : dailySignups.length > 0 ? (() => {
                const maxC = Math.max(...dailySignups.map(d => Number(d.count) || 0), 1);
                const labelIdxs = [0, Math.floor(dailySignups.length / 4), Math.floor(dailySignups.length / 2), Math.floor(dailySignups.length * 3 / 4), dailySignups.length - 1];
                return (
                  <div className="relative">
                    <div className="absolute inset-x-0 top-0 h-48 flex flex-col justify-between pointer-events-none">
                      {[100, 75, 50, 25, 0].map(pct => (
                        <div key={pct} className="flex items-center gap-2">
                          <span className="text-[10px] text-gray-300 w-6 text-right tabular-nums">{pct === 0 ? '0' : ''}</span>
                          <div className="flex-1 border-t border-gray-100" />
                        </div>
                      ))}
                    </div>
                    <div className="pl-8 h-48 flex items-end gap-0.5">
                      {dailySignups.map((d, i) => {
                        const h = Math.max(Math.round((Number(d.count) / maxC) * 100), 2);
                        return (
                          <div
                            key={i}
                            className="flex-1 rounded-t transition-colors group relative cursor-pointer"
                            style={{
                              height: `${h}%`,
                              backgroundColor: h > 60 ? '#10B981' : h > 30 ? '#10B98166' : '#10B98122',
                            }}
                          >
                            <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-[9px] px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 whitespace-nowrap z-10 pointer-events-none">
                              {d.count}명
                            </div>
                          </div>
                        );
                      })}
                    </div>
                    <div className="pl-8 flex justify-between mt-2 text-[10px] text-gray-400">
                      {dailySignups.map((d, i) =>
                        labelIdxs.includes(i)
                          ? <span key={i} className="tabular-nums">{String(d.date).slice(5)}</span>
                          : <span key={i} />
                      )}
                    </div>
                  </div>
                );
              })() : (
                <div className="h-52 flex flex-col items-center justify-center text-gray-200">
                  <span className="material-icons text-5xl mb-2">bar_chart</span>
                  <p className="text-sm text-gray-400">가입 데이터가 없습니다</p>
                </div>
              )}
            </div>

            {/* 휴식 유형 인기도 (1/3) */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
              <div className="mb-5">
                <h3 className="text-sm font-bold text-gray-900">휴식 유형 인기도</h3>
                <p className="text-xs text-gray-400 mt-0.5">유형별 기록 비율</p>
              </div>

              {loading ? (
                <div className="space-y-4">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="animate-pulse">
                      <div className="flex justify-between mb-1.5">
                        <div className="w-20 h-3 bg-gray-200 rounded" />
                        <div className="w-10 h-3 bg-gray-100 rounded" />
                      </div>
                      <div className="h-2 bg-gray-100 rounded-full" />
                    </div>
                  ))}
                </div>
              ) : popularity.length > 0 ? (
                <div className="space-y-3.5">
                  {popularity.map((item, i) => {
                    const pct      = Math.round((item.count / maxCount) * 100);
                    const sharePct = Math.round((item.count / totalPopCount) * 100);
                    const color    = TYPE_COLORS[i % TYPE_COLORS.length];
                    const label    = REST_TYPE_KR[(item.restType || '').toLowerCase()] || item.restType || '—';
                    return (
                      <div key={item.restType || i}>
                        <div className="flex items-center justify-between mb-1.5">
                          <div className="flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: color }} />
                            <span className="text-xs font-medium text-gray-700">{label}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-gray-800">{sharePct}%</span>
                            <span className="text-[10px] text-gray-400">{item.count?.toLocaleString()}건</span>
                          </div>
                        </div>
                        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all"
                            style={{ width: `${pct}%`, backgroundColor: color }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-40 text-gray-200">
                  <span className="material-icons text-5xl mb-2">pie_chart</span>
                  <p className="text-sm text-gray-400">데이터가 없습니다</p>
                </div>
              )}
            </div>
          </section>

          {/* ── 최근 7일 휴식 기록 바 차트 ── */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h3 className="text-sm font-bold text-gray-900">최근 7일 휴식 기록</h3>
                <p className="text-xs text-gray-400 mt-0.5">일별 전체 휴식 기록 수</p>
              </div>
              {!loading && recentLogs.length > 0 && (
                <span className="text-xs text-gray-400 bg-gray-100 px-2 py-1 rounded-lg">
                  최근 {recentLogs.length}일
                </span>
              )}
            </div>

            {loading ? (
              <div className="h-36 bg-gray-50 rounded-xl animate-pulse" />
            ) : recentLogs.length > 0 ? (
              <div className="flex items-end gap-3 h-36">
                {recentLogs.map((row, i) => {
                  const h = Math.max(Math.round((row.count / maxLogCount) * 100), 4);
                  return (
                    <div key={i} className="flex-1 flex flex-col items-center gap-2 group">
                      <div className="relative w-full flex items-end" style={{ height: '100px' }}>
                        <div
                          className="w-full rounded-t-lg transition-colors cursor-pointer"
                          style={{
                            height: `${h}%`,
                            backgroundColor: h > 60 ? '#10B981' : h > 30 ? '#10B98166' : '#10B98122',
                          }}
                        >
                          <div className="absolute -top-7 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-[9px] px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 whitespace-nowrap z-10 pointer-events-none">
                            {row.count}건
                          </div>
                        </div>
                      </div>
                      <div className="text-center">
                        <p className="text-[10px] text-gray-500 tabular-nums">{String(row.date).slice(5)}</p>
                        <p className="text-xs font-bold text-primary tabular-nums">{row.count}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="h-36 flex flex-col items-center justify-center text-gray-200">
                <span className="material-icons text-5xl mb-2">bar_chart</span>
                <p className="text-sm text-gray-400">데이터가 없습니다</p>
              </div>
            )}
          </div>

        </main>
      </div>
    </div>
  );
}

export default AdminStats;
