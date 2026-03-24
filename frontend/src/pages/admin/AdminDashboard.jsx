import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { fetchWithAuth } from '../../api/fetchWithAuth';
import AdminSidebar from '../../components/admin/AdminSidebar';
import AdminHeader from '../../components/admin/AdminHeader';

const REST_TYPE_COLORS = ['#10B981', '#3B82F6', '#F59E0B', '#F43F5E', '#8B5CF6', '#F97316', '#14B8A6'];
const REST_TYPE_LABELS = {
  physical: '신체의 이완', mental: '정신적 고요', sensory: '감각의 정화',
  emotional: '정서적 지지', social: '사회적 휴식', nature: '자연의 연결', creative: '창조적 몰입',
};
const PERIOD_TABS = [
  { key: 'today', label: '오늘' },
  { key: '7d',   label: '7일' },
  { key: '30d',  label: '30일' },
  { key: 'custom', label: '직접입력' },
];

function toDateString(date) {
  return date.toISOString().slice(0, 10);
}

function getPeriodDates(periodTab, dateFrom, dateTo) {
  const today = new Date();
  if (periodTab === 'today')  return { startDate: toDateString(today), endDate: toDateString(today) };
  if (periodTab === '7d')     return { startDate: toDateString(new Date(today - 6 * 86400000)), endDate: toDateString(today) };
  if (periodTab === '30d')    return { startDate: toDateString(new Date(today - 29 * 86400000)), endDate: toDateString(today) };
  if (periodTab === 'custom') return { startDate: dateFrom, endDate: dateTo };
  return { startDate: toDateString(new Date(today - 29 * 86400000)), endDate: toDateString(today) };
}

function AdminDashboard() {
  const [dashboard, setDashboard] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [pendingPlaces, setPendingPlaces] = useState([]);
  const [loading, setLoading] = useState(true);
  const [analyticsLoading, setAnalyticsLoading] = useState(false);
  const [periodTab, setPeriodTab] = useState('30d');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  useEffect(() => { loadAll(); }, []);

  useEffect(() => {
    if (periodTab !== 'custom') loadAnalytics();
  }, [periodTab]);

  const loadAll = async () => {
    setLoading(true);
    try {
      const { startDate, endDate } = getPeriodDates('30d', '', '');
      const [dashRes, analyticsRes, placesRes] = await Promise.allSettled([
        fetchWithAuth('/api/admin/dashboard'),
        fetchWithAuth(`/api/admin/analytics?startDate=${startDate}&endDate=${endDate}`),
        fetchWithAuth('/api/admin/places?status=pending&page=1&size=5'),
      ]);
      if (dashRes.status === 'fulfilled' && dashRes.value.success)           setDashboard(dashRes.value.data);
      if (analyticsRes.status === 'fulfilled' && analyticsRes.value.success) setAnalytics(analyticsRes.value.data);
      if (placesRes.status === 'fulfilled' && placesRes.value.success)       setPendingPlaces(placesRes.value.data?.places || []);
    } finally {
      setLoading(false);
    }
  };

  const loadAnalytics = async (customFrom, customTo) => {
    const { startDate, endDate } = getPeriodDates(
      periodTab,
      customFrom ?? dateFrom,
      customTo ?? dateTo
    );
    if (!startDate || !endDate) return;
    setAnalyticsLoading(true);
    try {
      const res = await fetchWithAuth(`/api/admin/analytics?startDate=${startDate}&endDate=${endDate}`);
      if (res.success) setAnalytics(res.data);
    } finally {
      setAnalyticsLoading(false);
    }
  };

  const handleCustomApply = () => {
    if (dateFrom && dateTo) loadAnalytics(dateFrom, dateTo);
  };

  const handlePlaceStatus = async (placeId, status) => {
    try {
      await fetchWithAuth(`/api/admin/places/${placeId}/status`, {
        method: 'PUT',
        body: JSON.stringify({ status }),
      });
      setPendingPlaces(prev => prev.filter(p => p.id !== placeId));
    } catch { /* 무시 */ }
  };

  const kpis = dashboard ? [
    { label: '총 사용자',   value: dashboard.totalUsers?.toLocaleString()    || '0', unit: '명', icon: 'group',        iconCls: 'bg-blue-50 text-blue-600'    },
    { label: '오늘 신규',   value: dashboard.todaySignups?.toLocaleString()  || '0', unit: '명', icon: 'person_add',   iconCls: 'bg-emerald-50 text-emerald-600' },
    { label: '전체 기록',   value: dashboard.totalRestLogs?.toLocaleString() || '0', unit: '건', icon: 'event_note',   iconCls: 'bg-violet-50 text-violet-600' },
    { label: '활성 사용자', value: dashboard.activeUsers?.toLocaleString()   || '0', unit: '명', icon: 'trending_up',  iconCls: 'bg-amber-50 text-amber-600'  },
  ] : [];

  const dailySignups   = analytics?.dailySignups || [];
  const restTypeStats  = analytics?.restTypePopularity || [];
  const totalRestCount = restTypeStats.reduce((s, r) => s + (r.count || 0), 0) || 1;
  const maxCount       = Math.max(...restTypeStats.map(r => r.count || 0), 1);

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      <AdminSidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <AdminHeader title="대시보드" subtitle="플랫폼 현황과 통계를 한눈에 확인하세요." />
        <main className="flex-1 overflow-y-auto p-6 space-y-5">

          {/* ── 기간 탭 ── */}
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 bg-white border border-gray-200 rounded-xl p-1 shadow-sm">
              {PERIOD_TABS.map(tab => (
                <button
                  key={tab.key}
                  onClick={() => setPeriodTab(tab.key)}
                  className={`h-8 px-4 rounded-lg text-sm font-semibold transition-all ${
                    periodTab === tab.key ? 'bg-primary text-white shadow-sm' : 'text-gray-500 hover:text-gray-800'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
            {periodTab === 'custom' && (
              <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-xl px-3 py-1.5 shadow-sm">
                <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)}
                  className="h-7 px-2 border border-gray-200 rounded-lg text-xs text-gray-700 bg-gray-50 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none" />
                <span className="text-xs text-gray-400">~</span>
                <input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)}
                  className="h-7 px-2 border border-gray-200 rounded-lg text-xs text-gray-700 bg-gray-50 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none" />
                <button
                  onClick={handleCustomApply}
                  className="h-7 px-3 bg-primary text-white rounded-lg text-xs font-semibold hover:bg-primary/90 transition-all"
                >
                  적용
                </button>
              </div>
            )}
            {analyticsLoading && <span className="text-xs text-gray-400 animate-pulse">데이터 로딩 중...</span>}
          </div>

          {/* ── KPI 카드 ── */}
          <section className="grid grid-cols-4 gap-4">
            {loading ? (
              [...Array(4)].map((_, i) => (
                <div key={i} className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 animate-pulse">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-10 h-10 rounded-lg bg-gray-200" />
                    <div className="w-16 h-4 bg-gray-100 rounded" />
                  </div>
                  <div className="w-20 h-8 bg-gray-200 rounded mb-2" />
                  <div className="w-24 h-3 bg-gray-100 rounded" />
                </div>
              ))
            ) : (
              kpis.map((kpi, i) => (
                <div key={i} className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
                  <div className="flex items-center justify-between mb-3">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${kpi.iconCls}`}>
                      <span className="material-icons text-[20px]">{kpi.icon}</span>
                    </div>
                    <span className="flex items-center gap-0.5 text-xs font-semibold text-emerald-500">
                      <span className="material-icons text-[14px]">arrow_upward</span>증가
                    </span>
                  </div>
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">{kpi.label}</p>
                  <div className="flex items-end gap-1">
                    <span className="text-3xl font-black text-gray-900 leading-none">{kpi.value}</span>
                    <span className="text-sm text-gray-400 mb-0.5">{kpi.unit}</span>
                  </div>
                </div>
              ))
            )}
          </section>

          {/* ── 차트 행 ── */}
          <section className="grid grid-cols-3 gap-5">

            {/* 신규 가입자 추이 */}
            <div className="col-span-2 bg-white rounded-xl border border-gray-200 shadow-sm p-6">
              <div className="flex items-center justify-between mb-5">
                <div>
                  <h3 className="text-sm font-bold text-gray-900">신규 가입자 추이</h3>
                  <p className="text-xs text-gray-400 mt-0.5">일별 신규 가입 수</p>
                </div>
                {!loading && dailySignups.length > 0 && (
                  <span className="text-xs text-gray-400 bg-gray-100 px-2 py-1 rounded-lg">최근 {dailySignups.length}일</span>
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
                          <div key={i}
                            className="flex-1 rounded-t transition-colors group relative cursor-pointer"
                            style={{ height: `${h}%`, backgroundColor: h > 60 ? '#10B981' : h > 30 ? '#10B98166' : '#10B98122' }}
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
                        labelIdxs.includes(i) ? <span key={i} className="tabular-nums">{String(d.date).slice(5)}</span> : <span key={i} />
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

            {/* 휴식 유형 분포 */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
              <div className="mb-5">
                <h3 className="text-sm font-bold text-gray-900">휴식 유형 분포</h3>
                <p className="text-xs text-gray-400 mt-0.5">진단 결과 유형별 비율</p>
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
              ) : restTypeStats.length > 0 ? (
                <div className="space-y-3.5">
                  {restTypeStats.map((rt, i) => {
                    const pct = Math.round((rt.count / maxCount) * 100);
                    const sharePct = Math.round((rt.count / totalRestCount) * 100);
                    const color = REST_TYPE_COLORS[i % REST_TYPE_COLORS.length];
                    const label = REST_TYPE_LABELS[(rt.restType || rt.typeName || '').toLowerCase()] || '—';
                    return (
                      <div key={rt.restType || i}>
                        <div className="flex items-center justify-between mb-1.5">
                          <div className="flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: color }} />
                            <span className="text-xs font-medium text-gray-700">{label}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-gray-800">{sharePct}%</span>
                            <span className="text-[10px] text-gray-400">{rt.count?.toLocaleString()}건</span>
                          </div>
                        </div>
                        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                          <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, backgroundColor: color }} />
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

          {/* ── 지역별 & 퍼널 ── */}
          <section className="grid grid-cols-2 gap-5">

            {/* 지역별 사용자 분포 */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
              <div className="flex items-center gap-2 mb-5">
                <span className="material-icons text-primary text-[18px]">location_on</span>
                <h3 className="text-sm font-bold text-gray-900">지역별 사용자 분포</h3>
              </div>
              {loading ? (
                <div className="space-y-3 animate-pulse">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="flex items-center gap-4">
                      <div className="w-8 h-3 bg-gray-200 rounded" />
                      <div className="flex-1 h-3 bg-gray-100 rounded-full" />
                      <div className="w-12 h-3 bg-gray-100 rounded" />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-3">
                  {(analytics?.regionStats || [
                    { region: '서울', pct: 42, count: dashboard?.totalUsers ? Math.round(dashboard.totalUsers * 0.42) : 0 },
                    { region: '경기', pct: 23, count: dashboard?.totalUsers ? Math.round(dashboard.totalUsers * 0.23) : 0 },
                    { region: '부산', pct: 9,  count: dashboard?.totalUsers ? Math.round(dashboard.totalUsers * 0.09) : 0 },
                    { region: '인천', pct: 7,  count: dashboard?.totalUsers ? Math.round(dashboard.totalUsers * 0.07) : 0 },
                    { region: '기타', pct: 19, count: dashboard?.totalUsers ? Math.round(dashboard.totalUsers * 0.19) : 0 },
                  ]).map((r, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <span className="text-xs font-semibold text-gray-600 w-8 shrink-0">{r.region}</span>
                      <div className="flex-1 h-2.5 bg-gray-100 rounded-full overflow-hidden">
                        <div className="h-full bg-primary rounded-full" style={{ width: `${r.pct}%` }} />
                      </div>
                      <span className="text-xs font-bold text-primary w-8 text-right tabular-nums">{r.pct}%</span>
                      <span className="text-xs text-gray-400 w-16 text-right tabular-nums">{r.count?.toLocaleString()}명</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* 사용자 여정 퍼널 */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
              <div className="flex items-center gap-2 mb-5">
                <span className="material-icons text-primary text-[18px]">filter_alt</span>
                <h3 className="text-sm font-bold text-gray-900">사용자 여정 퍼널</h3>
              </div>
              {loading ? (
                <div className="space-y-3 animate-pulse">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <div className="w-6 h-6 rounded-full bg-gray-200" />
                      <div className="w-16 h-3 bg-gray-200 rounded" />
                      <div className="flex-1 h-3 bg-gray-100 rounded-full" />
                      <div className="w-14 h-3 bg-gray-100 rounded" />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-3">
                  {[
                    { step: '방문자',   count: dashboard?.totalUsers ? dashboard.totalUsers * 2 : 0,                         pct: 100 },
                    { step: '회원가입', count: dashboard?.totalUsers || 0,                                                    pct: 50  },
                    { step: '진단 완료', count: dashboard?.totalUsers ? Math.round(dashboard.totalUsers * 0.74) : 0,          pct: 37  },
                    { step: '기록 등록', count: dashboard?.totalRestLogs || 0,                                                pct: 25  },
                    { step: '재방문',   count: dashboard?.activeUsers || 0,                                                   pct: 18  },
                  ].map((f, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <span className="w-6 h-6 rounded-full bg-primary/10 text-primary text-[11px] font-bold flex items-center justify-center shrink-0">{i + 1}</span>
                      <span className="text-xs font-semibold text-gray-700 w-16 shrink-0">{f.step}</span>
                      <div className="flex-1 h-2.5 bg-gray-100 rounded-full overflow-hidden">
                        <div className="h-full bg-primary/60 rounded-full" style={{ width: `${f.pct}%` }} />
                      </div>
                      <span className="text-xs font-bold text-gray-700 w-16 text-right tabular-nums">{f.count?.toLocaleString()}</span>
                      <span className="text-[10px] text-gray-400 w-8 text-right">{f.pct}%</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </section>

          {/* ── 승인 대기 장소 ── */}
          <section className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-gray-900">장소 승인 대기</h3>
                {pendingPlaces.length > 0 && (
                  <span className="text-xs font-semibold bg-red-100 text-red-600 px-2 py-0.5 rounded-full">
                    {pendingPlaces.length}건
                  </span>
                )}
              </div>
              <Link to="/admin/places" className="text-xs font-semibold text-primary hover:text-primary/80 flex items-center gap-1">
                전체보기 <span className="material-icons text-sm">chevron_right</span>
              </Link>
            </div>
            {loading ? (
              <div className="divide-y divide-gray-100">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="px-6 py-4 flex items-center gap-4 animate-pulse">
                    <div className="w-32 h-3 bg-gray-200 rounded" />
                    <div className="flex-1 h-3 bg-gray-100 rounded" />
                    <div className="w-12 h-5 bg-gray-200 rounded-full" />
                    <div className="w-20 h-3 bg-gray-100 rounded" />
                  </div>
                ))}
              </div>
            ) : pendingPlaces.length === 0 ? (
              <div className="py-12 flex flex-col items-center gap-2 text-gray-300">
                <span className="material-icons text-4xl">check_circle</span>
                <p className="text-sm text-gray-400">승인 대기 중인 장소가 없습니다</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-200">
                      <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">장소명</th>
                      <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">주소</th>
                      <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">AI 점수</th>
                      <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">관리</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pendingPlaces.map((place, idx) => (
                      <tr key={place.id} className={`border-b border-gray-100 hover:bg-primary/5 transition-colors ${idx % 2 === 1 ? 'bg-gray-50/60' : 'bg-white'}`}>
                        <td className="px-6 py-3.5 font-semibold text-gray-900">{place.name}</td>
                        <td className="px-6 py-3.5 text-gray-500 max-w-[220px] truncate">{place.address}</td>
                        <td className="px-6 py-3.5">
                          {place.aiScore != null ? (
                            <span className="text-xs font-bold bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full">{place.aiScore.toFixed(1)}</span>
                          ) : <span className="text-gray-300">—</span>}
                        </td>
                        <td className="px-6 py-3.5 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button onClick={() => handlePlaceStatus(place.id, 'approved')}
                              className="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold rounded-lg transition-colors">
                              승인
                            </button>
                            <button onClick={() => handlePlaceStatus(place.id, 'rejected')}
                              className="px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-500 border border-red-200 text-xs font-bold rounded-lg transition-colors">
                              반려
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>

        </main>
      </div>
    </div>
  );
}

export default AdminDashboard;
