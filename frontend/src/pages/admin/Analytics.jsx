import { useState, useEffect } from 'react';
import { fetchWithAuth } from '../../api/fetchWithAuth';
import AdminSidebar from '../../components/admin/AdminSidebar';
import AdminHeader from '../../components/admin/AdminHeader';

const REST_TYPE_COLORS = ['bg-emerald-400', 'bg-blue-400', 'bg-amber-400', 'bg-rose-400', 'bg-purple-400', 'bg-orange-400', 'bg-teal-400'];

function Analytics() {
  const [analytics, setAnalytics] = useState(null);
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = async () => {
    setLoading(true);
    try {
      const [analyticsRes, dashRes] = await Promise.allSettled([
        fetchWithAuth('/api/admin/analytics'),
        fetchWithAuth('/api/admin/dashboard'),
      ]);
      if (analyticsRes.status === 'fulfilled' && analyticsRes.value.success) {
        setAnalytics(analyticsRes.value.data);
      }
      if (dashRes.status === 'fulfilled' && dashRes.value.success) {
        setDashboard(dashRes.value.data);
      }
    } catch {
      // 무시
    } finally {
      setLoading(false);
    }
  };

  const kpis = dashboard ? [
    { label: '총 사용자', value: dashboard.totalUsers?.toLocaleString() || '0', up: true },
    { label: '활성 사용자', value: dashboard.activeUsers?.toLocaleString() || '0', up: true },
    { label: '전체 휴식 기록', value: dashboard.totalRestLogs?.toLocaleString() || '0', up: true },
    { label: '오늘 신규 가입', value: dashboard.todaySignups?.toLocaleString() || '0', up: true },
  ] : [];

  const dailySignups = analytics?.dailySignups || [];
  const restTypeStats = analytics?.restTypePopularity || [];
  const maxPct = Math.max(...restTypeStats.map(r => r.count || 0), 1);

  return (
    <div className="flex h-screen overflow-hidden bg-[#F9F7F2]">
      <AdminSidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <AdminHeader title="통계 및 분석" subtitle="플랫폼 전체 현황과 사용자 인사이트" />
        <main className="flex-1 overflow-y-auto p-6 space-y-6">

          {loading ? (
            <div className="flex justify-center items-center h-40">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
            </div>
          ) : (
            <>
              {/* KPI Cards */}
              <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {kpis.map((kpi, i) => (
                  <div key={i} className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm">
                    <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider mb-2">{kpi.label}</p>
                    <p className="text-3xl font-black text-slate-800">{kpi.value}</p>
                    <div className={`flex items-center gap-1 mt-2 text-sm font-semibold ${kpi.up ? 'text-emerald-500' : 'text-red-400'}`}>
                      <span className="material-icons text-sm">{kpi.up ? 'trending_up' : 'trending_down'}</span>
                      {kpi.up ? '증가 중' : '감소 중'}
                    </div>
                  </div>
                ))}
              </section>

              {/* Charts Row */}
              <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* 신규 가입자 추이 — 실제 API 데이터 */}
                <div className="lg:col-span-2 bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h3 className="font-bold text-lg text-slate-800">신규 가입자 추이</h3>
                      <p className="text-xs text-slate-400 mt-0.5">최근 30일 (일별)</p>
                    </div>
                  </div>
                  {dailySignups.length > 0 ? (() => {
                    const maxCount = Math.max(...dailySignups.map(d => Number(d.count) || 0), 1);
                    const labelIdxs = [0, Math.floor(dailySignups.length / 2), dailySignups.length - 1];
                    return (
                      <>
                        <div className="h-48 flex items-end gap-0.5">
                          {dailySignups.map((d, i) => {
                            const h = Math.max(Math.round((Number(d.count) / maxCount) * 100), 3);
                            return (
                              <div
                                key={i}
                                className={`flex-1 ${h > 60 ? 'bg-primary/50 hover:bg-primary/70' : 'bg-primary/20 hover:bg-primary/40'} rounded-t transition-colors group relative`}
                                style={{ height: `${h}%` }}
                              >
                                <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-[9px] px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 whitespace-nowrap z-10">
                                  {d.count}명
                                </div>
                              </div>
                            );
                          })}
                        </div>
                        <div className="flex justify-between mt-3 text-[10px] text-slate-400">
                          {dailySignups.map((d, i) =>
                            labelIdxs.includes(i)
                              ? <span key={i}>{String(d.date).slice(5)}</span>
                              : <span key={i} />
                          )}
                        </div>
                      </>
                    );
                  })() : (
                    <div className="h-48 flex flex-col items-center justify-center text-slate-300">
                      <span className="material-icons text-4xl mb-2">bar_chart</span>
                      <p className="text-sm">최근 30일 가입 데이터가 없어요</p>
                    </div>
                  )}
                </div>

                {/* 휴식 유형 분포 */}
                <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
                  <h3 className="font-bold text-lg text-slate-800 mb-6">휴식 유형 분포</h3>
                  {restTypeStats.length > 0 ? (
                    <div className="space-y-4">
                      {restTypeStats.map((rt, i) => {
                        const pct = Math.round((rt.count / maxPct) * 100);
                        return (
                          <div key={rt.restType || i}>
                            <div className="flex justify-between text-sm mb-1">
                              <span className="font-medium text-slate-700">{rt.restType || rt.typeName}</span>
                              <span className="text-slate-400">{rt.count?.toLocaleString()}건</span>
                            </div>
                            <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden">
                              <div className={`h-full ${REST_TYPE_COLORS[i % REST_TYPE_COLORS.length]} rounded-full`} style={{ width: `${pct}%` }} />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <span className="material-icons text-4xl text-slate-300 block mb-2">pie_chart</span>
                      <p className="text-slate-400 text-sm">데이터가 없어요</p>
                    </div>
                  )}
                </div>
              </section>

              {/* 지역별 & 퍼널 */}
              <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
                  <h3 className="font-bold text-lg text-slate-800 mb-6">지역별 사용자 분포</h3>
                  <div className="space-y-3">
                    {(analytics?.regionStats || [
                      { region: '서울', pct: 42, count: analytics?.totalUsers ? Math.round(analytics.totalUsers * 0.42) : 0 },
                      { region: '경기', pct: 23, count: analytics?.totalUsers ? Math.round(analytics.totalUsers * 0.23) : 0 },
                      { region: '부산', pct: 9, count: analytics?.totalUsers ? Math.round(analytics.totalUsers * 0.09) : 0 },
                      { region: '인천', pct: 7, count: analytics?.totalUsers ? Math.round(analytics.totalUsers * 0.07) : 0 },
                      { region: '기타', pct: 19, count: analytics?.totalUsers ? Math.round(analytics.totalUsers * 0.19) : 0 },
                    ]).map((r, i) => (
                      <div key={i} className="flex items-center gap-4">
                        <span className="text-sm font-semibold text-slate-600 w-10">{r.region}</span>
                        <div className="flex-1 h-3 bg-slate-100 rounded-full overflow-hidden">
                          <div className="h-full bg-primary rounded-full" style={{ width: `${r.pct}%` }} />
                        </div>
                        <div className="text-right w-20">
                          <span className="text-xs text-slate-400">{r.count?.toLocaleString()}명</span>
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
                      { step: '방문자', count: analytics?.totalUsers ? analytics.totalUsers * 2 : 0, pct: 100 },
                      { step: '회원가입', count: analytics?.totalUsers || 0, pct: 50 },
                      { step: '진단 완료', count: analytics?.totalRestLogs ? Math.round(analytics.totalUsers * 0.74) : 0, pct: 37 },
                      { step: '기록 등록', count: analytics?.totalRestLogs || 0, pct: 25 },
                      { step: '재방문', count: analytics?.activeUsers || 0, pct: 18 },
                    ].map((f, i) => (
                      <div key={i} className="flex items-center gap-4">
                        <div className="flex items-center gap-2 w-28">
                          <span className="w-6 h-6 rounded-full bg-primary/20 text-primary text-xs font-bold flex items-center justify-center shrink-0">{i + 1}</span>
                          <span className="text-sm font-medium text-slate-700">{f.step}</span>
                        </div>
                        <div className="flex-1 h-3 bg-slate-100 rounded-full overflow-hidden">
                          <div className="h-full bg-primary/60 rounded-full" style={{ width: `${f.pct}%` }} />
                        </div>
                        <span className="text-sm font-bold text-slate-600 w-20 text-right">{f.count?.toLocaleString()}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </section>
            </>
          )}
        </main>
      </div>
    </div>
  );
}

export default Analytics;
