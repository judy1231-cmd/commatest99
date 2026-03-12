import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { fetchWithAuth } from '../../api/fetchWithAuth';
import AdminSidebar from '../../components/admin/AdminSidebar';
import AdminHeader from '../../components/admin/AdminHeader';

const STATUS_LABELS = {
  pending: '대기',
  approved: '승인',
  rejected: '반려',
};

function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [pendingPlaces, setPendingPlaces] = useState([]);
  const [dailySignups, setDailySignups] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    setLoading(true);
    try {
      const [dashRes, placesRes, analyticsRes] = await Promise.allSettled([
        fetchWithAuth('/api/admin/dashboard'),
        fetchWithAuth('/api/admin/places?status=pending&page=1&size=5'),
        fetchWithAuth('/api/admin/analytics'),
      ]);

      if (dashRes.status === 'fulfilled' && dashRes.value.success) {
        setStats(dashRes.value.data);
      }
      if (placesRes.status === 'fulfilled' && placesRes.value.success) {
        setPendingPlaces(placesRes.value.data?.places || []);
      }
      if (analyticsRes.status === 'fulfilled' && analyticsRes.value.success) {
        setDailySignups(analyticsRes.value.data?.dailySignups || []);
      }
    } finally {
      setLoading(false);
    }
  };

  const handlePlaceStatus = async (placeId, status) => {
    try {
      await fetchWithAuth(`/api/admin/places/${placeId}/status`, {
        method: 'PUT',
        body: JSON.stringify({ status }),
      });
      setPendingPlaces((prev) => prev.filter((p) => p.id !== placeId));
    } catch {
      // 무시
    }
  };

  const statCards = stats ? [
    { label: '진단 테스트', value: stats.totalRestLogs?.toLocaleString() || '0', change: '전체 기록', icon: 'psychology', color: 'bg-primary/10 text-primary', changeColor: 'text-green-600 bg-green-50' },
    { label: '신규 회원 (오늘)', value: stats.todaySignups?.toLocaleString() || '0', change: '오늘 가입', icon: 'person_add', color: 'bg-blue-50 text-blue-600', changeColor: 'text-green-600 bg-green-50' },
    { label: '전체 회원', value: stats.totalUsers?.toLocaleString() || '0', change: '누적', icon: 'people', color: 'bg-accent-mint text-teal-600', changeColor: 'text-blue-600 bg-blue-50' },
    { label: '활성 사용자', value: stats.activeUsers?.toLocaleString() || '0', change: '활성', icon: 'verified', color: 'bg-amber-100 text-amber-600', changeColor: 'text-amber-600 bg-amber-50' },
    { label: '장소 승인 대기', value: pendingPlaces.length.toString(), change: '검토 필요', icon: 'map', color: 'bg-red-100 text-red-600', changeColor: 'text-red-600 bg-red-50', urgent: pendingPlaces.length > 0 },
  ] : [];

  /* ── Skeleton UI ── */
  if (loading) {
    return (
      <div className="flex h-screen overflow-hidden bg-gray-50">
        <AdminSidebar />
        <div className="flex-1 flex flex-col overflow-hidden">
          <AdminHeader title="실시간 대시보드" subtitle="플랫폼의 현재 상태와 실시간 통계를 확인하세요." />
          <main className="flex-1 overflow-y-auto p-6 space-y-6">
            {/* stat card skeletons */}
            <div className="grid grid-cols-5 gap-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="bg-white rounded-xl border border-gray-200 p-5 space-y-3 animate-pulse">
                  <div className="flex items-center justify-between">
                    <div className="w-9 h-9 bg-gray-200 rounded-lg" />
                    <div className="w-14 h-4 bg-gray-200 rounded-full" />
                  </div>
                  <div className="w-20 h-3 bg-gray-200 rounded" />
                  <div className="w-16 h-7 bg-gray-200 rounded" />
                </div>
              ))}
            </div>
            {/* chart skeletons */}
            <div className="grid grid-cols-3 gap-6">
              <div className="col-span-2 bg-white rounded-xl border border-gray-200 p-6 animate-pulse space-y-4">
                <div className="w-32 h-4 bg-gray-200 rounded" />
                <div className="h-48 bg-gray-100 rounded-lg" />
              </div>
              <div className="bg-white rounded-xl border border-gray-200 p-6 animate-pulse space-y-4">
                <div className="w-24 h-4 bg-gray-200 rounded" />
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="flex justify-between py-3 border-b border-gray-100">
                    <div className="w-20 h-3 bg-gray-200 rounded" />
                    <div className="w-12 h-3 bg-gray-200 rounded" />
                  </div>
                ))}
              </div>
            </div>
            {/* table skeleton */}
            <div className="bg-white rounded-xl border border-gray-200 p-6 animate-pulse space-y-3">
              <div className="w-36 h-4 bg-gray-200 rounded" />
              {[...Array(4)].map((_, i) => (
                <div key={i} className="flex gap-6 py-3 border-b border-gray-100">
                  <div className="w-32 h-3 bg-gray-200 rounded" />
                  <div className="flex-1 h-3 bg-gray-100 rounded" />
                  <div className="w-12 h-3 bg-gray-200 rounded" />
                  <div className="w-20 h-3 bg-gray-200 rounded" />
                </div>
              ))}
            </div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      <AdminSidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <AdminHeader title="실시간 대시보드" subtitle="플랫폼의 현재 상태와 실시간 통계를 확인하세요." />
        <main className="flex-1 overflow-y-auto p-6 space-y-6">

          {/* ── 통계 카드 ── */}
          <section className="grid grid-cols-5 gap-4">
            {statCards.map((stat, i) => (
              <div
                key={i}
                className={`bg-white rounded-xl border shadow-sm p-5 flex flex-col gap-3 transition-shadow hover:shadow-md ${stat.urgent ? 'border-l-4 border-l-red-400' : 'border-gray-200'}`}
              >
                <div className="flex items-center justify-between">
                  <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${stat.color}`}>
                    <span className="material-icons-round text-[18px]">{stat.icon}</span>
                  </div>
                  <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${stat.changeColor}`}>
                    {stat.change}
                  </span>
                </div>
                <div>
                  <p className="text-xs text-gray-400 mb-1">{stat.label}</p>
                  <p className="text-2xl font-bold text-gray-900 tracking-tight">{stat.value}</p>
                </div>
              </div>
            ))}
          </section>

          {/* ── 차트 + 회원 현황 ── */}
          <section className="grid grid-cols-3 gap-6">

            {/* 가입자 추이 바 차트 */}
            <div className="col-span-2 bg-white rounded-xl border border-gray-200 shadow-sm p-6">
              <div className="flex items-center justify-between mb-5">
                <div>
                  <h3 className="text-sm font-bold text-gray-900">신규 가입자 추이</h3>
                  <p className="text-xs text-gray-400 mt-0.5">최근 30일</p>
                </div>
              </div>

              {dailySignups.length > 0 ? (() => {
                const maxCount = Math.max(...dailySignups.map(d => Number(d.count) || 0), 1);
                const labelIdxs = [0, Math.floor(dailySignups.length / 2), dailySignups.length - 1];
                const gridLines = [25, 50, 75, 100];
                return (
                  <div>
                    {/* 그리드 + 바 */}
                    <div className="relative h-44 w-full">
                      {/* 수평 그리드 라인 */}
                      {gridLines.map((pct) => (
                        <div
                          key={pct}
                          className="absolute w-full border-t border-dashed border-gray-100"
                          style={{ bottom: `${pct}%` }}
                        />
                      ))}
                      {/* 바 */}
                      <div className="absolute inset-0 flex items-end gap-px px-0.5">
                        {dailySignups.map((d, i) => {
                          const h = Math.max(Math.round((Number(d.count) / maxCount) * 100), 3);
                          return (
                            <div
                              key={i}
                              className="flex-1 bg-primary/25 hover:bg-primary/60 transition-colors rounded-t group relative cursor-default"
                              style={{ height: `${h}%` }}
                            >
                              <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-[10px] py-1 px-2 rounded-md opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10 pointer-events-none shadow-lg">
                                {d.count}명
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                    {/* 날짜 레이블 */}
                    <div className="flex justify-between mt-2 px-0.5 text-[10px] text-gray-400">
                      {dailySignups.map((d, i) =>
                        labelIdxs.includes(i)
                          ? <span key={i}>{String(d.date).slice(5)}</span>
                          : <span key={i} />
                      )}
                    </div>
                  </div>
                );
              })() : (
                <div className="h-44 flex flex-col items-center justify-center gap-2 text-gray-300">
                  <span className="material-icons text-4xl">bar_chart</span>
                  <p className="text-sm text-gray-400">데이터가 없습니다</p>
                </div>
              )}
            </div>

            {/* 회원 현황 */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 flex flex-col">
              <h3 className="text-sm font-bold text-gray-900 mb-4">회원 현황</h3>
              {stats ? (
                <div className="flex-1 divide-y divide-gray-100">
                  {[
                    { label: '전체 회원', value: `${stats.totalUsers?.toLocaleString()}명`, cls: 'text-gray-900' },
                    { label: '활성 사용자', value: `${stats.activeUsers?.toLocaleString()}명`, cls: 'text-emerald-600' },
                    { label: '오늘 신규 가입', value: `${stats.todaySignups?.toLocaleString()}명`, cls: 'text-blue-600' },
                    { label: '전체 휴식 기록', value: `${stats.totalRestLogs?.toLocaleString()}건`, cls: 'text-primary' },
                  ].map(({ label, value, cls }) => (
                    <div key={label} className="flex items-center justify-between py-3">
                      <span className="text-xs text-gray-500">{label}</span>
                      <span className={`text-sm font-bold ${cls}`}>{value}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-400 mt-4">데이터가 없습니다</p>
              )}
            </div>
          </section>

          {/* ── 승인 대기 장소 테이블 ── */}
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
              <Link
                to="/admin/places"
                className="text-xs font-semibold text-primary hover:text-primary/80 flex items-center gap-1"
              >
                전체보기
                <span className="material-icons text-sm">chevron_right</span>
              </Link>
            </div>

            {pendingPlaces.length === 0 ? (
              <div className="py-14 flex flex-col items-center gap-2 text-gray-300">
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
                      <tr
                        key={place.id}
                        className={`border-b border-gray-100 hover:bg-primary/5 transition-colors ${idx % 2 === 1 ? 'bg-gray-50/60' : 'bg-white'}`}
                      >
                        <td className="px-6 py-3.5 font-semibold text-gray-900">{place.name}</td>
                        <td className="px-6 py-3.5 text-gray-500 max-w-[220px] truncate">{place.address}</td>
                        <td className="px-6 py-3.5">
                          {place.aiScore != null ? (
                            <span className="text-xs font-bold bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full">
                              {place.aiScore.toFixed(1)}
                            </span>
                          ) : (
                            <span className="text-gray-300">—</span>
                          )}
                        </td>
                        <td className="px-6 py-3.5 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => handlePlaceStatus(place.id, 'approved')}
                              className="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold rounded-lg transition-colors"
                            >
                              승인
                            </button>
                            <button
                              onClick={() => handlePlaceStatus(place.id, 'rejected')}
                              className="px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-500 border border-red-200 text-xs font-bold rounded-lg transition-colors"
                            >
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
