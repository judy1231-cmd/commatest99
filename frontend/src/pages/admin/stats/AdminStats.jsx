import { useState, useEffect } from 'react';
import { fetchWithAuth } from '../../../api/fetchWithAuth';
import AdminSidebar from '../../../components/admin/AdminSidebar';
import AdminHeader from '../../../components/admin/AdminHeader';

const REST_TYPE_KR = {
  physical: '신체적 이완', mental: '정신적 고요', sensory: '감각의 정화',
  emotional: '정서적 지지', social: '사회적 휴식', nature: '자연의 연결', creative: '창조적 몰입',
};
const TYPE_COLORS = ['bg-emerald-400','bg-blue-400','bg-amber-400','bg-rose-400','bg-purple-400','bg-orange-400','bg-teal-400'];

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
    { label: '전체 회원', value: dashboard.totalUsers?.toLocaleString() || '0', icon: 'people', color: 'bg-blue-50 text-blue-600' },
    { label: '휴식 기록 수', value: dashboard.totalRestLogs?.toLocaleString() || '0', icon: 'event_note', color: 'bg-emerald-50 text-emerald-600' },
    { label: '활성 사용자', value: dashboard.activeUsers?.toLocaleString() || '0', icon: 'verified', color: 'bg-amber-50 text-amber-600' },
    { label: '오늘 신규 가입', value: dashboard.todaySignups?.toLocaleString() || '0', icon: 'person_add', color: 'bg-rose-50 text-rose-600' },
  ] : [];

  const popularity = analytics?.restTypePopularity || [];
  const maxCount = Math.max(...popularity.map(p => p.count || 0), 1);
  const recentLogs = (analytics?.dailyRestLogs || []).slice(-7).reverse();

  return (
    <div className="flex h-screen overflow-hidden bg-background-light">
      <AdminSidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <AdminHeader title="통계 & 분석" subtitle="플랫폼 전체 데이터를 분석합니다." />
        <main className="flex-1 overflow-y-auto p-6 space-y-6">
          {loading ? (
            <div className="flex justify-center items-center h-40">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
            </div>
          ) : (
            <>
              <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {summaryCards.map((card, i) => (
                  <div key={i} className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
                    <div className={`w-10 h-10 rounded-lg ${card.color} flex items-center justify-center mb-3`}>
                      <span className="material-icons text-xl">{card.icon}</span>
                    </div>
                    <p className="text-sm text-gray-500">{card.label}</p>
                    <p className="text-2xl font-bold text-gray-900 mt-1">{card.value}</p>
                  </div>
                ))}
              </section>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
                  <h3 className="font-bold text-gray-800 mb-4">휴식 유형 인기도</h3>
                  {popularity.length === 0 ? (
                    <p className="text-gray-400 text-sm text-center py-8">데이터가 없습니다</p>
                  ) : (
                    <div className="space-y-3">
                      {popularity.map((item, i) => (
                        <div key={item.restType}>
                          <div className="flex justify-between text-sm mb-1">
                            <span className="font-medium text-gray-700">{REST_TYPE_KR[item.restType] || item.restType}</span>
                            <span className="text-gray-500">{item.count}건</span>
                          </div>
                          <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                            <div className={`h-full rounded-full ${TYPE_COLORS[i % TYPE_COLORS.length]}`} style={{ width: `${(item.count / maxCount) * 100}%` }} />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
                  <h3 className="font-bold text-gray-800 mb-4">최근 7일 휴식 기록</h3>
                  {recentLogs.length === 0 ? (
                    <p className="text-gray-400 text-sm text-center py-8">데이터가 없습니다</p>
                  ) : (
                    <table className="w-full text-sm">
                      <thead><tr className="border-b border-gray-100">
                        <th className="text-left py-2 text-xs font-semibold text-gray-500">날짜</th>
                        <th className="text-right py-2 text-xs font-semibold text-gray-500">기록 수</th>
                      </tr></thead>
                      <tbody>{recentLogs.map((row, i) => (
                        <tr key={i} className="border-b border-gray-50">
                          <td className="py-2 text-gray-700">{row.date}</td>
                          <td className="py-2 text-right font-bold text-primary">{row.count}건</td>
                        </tr>
                      ))}</tbody>
                    </table>
                  )}
                </div>
              </div>

              <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
                <h3 className="font-bold text-gray-800 mb-4">신규 가입자 추이 (최근 10일)</h3>
                {(analytics?.dailySignups || []).length === 0 ? (
                  <p className="text-gray-400 text-sm text-center py-8">데이터가 없습니다</p>
                ) : (
                  <table className="w-full text-sm">
                    <thead><tr className="bg-gray-50">
                      <th className="text-left px-4 py-2 text-xs font-semibold text-gray-500">날짜</th>
                      <th className="text-right px-4 py-2 text-xs font-semibold text-gray-500">신규 가입</th>
                    </tr></thead>
                    <tbody>{[...analytics.dailySignups].reverse().slice(0, 10).map((row, i) => (
                      <tr key={i} className="border-b border-gray-50 hover:bg-gray-50">
                        <td className="px-4 py-2 text-gray-700">{row.date}</td>
                        <td className="px-4 py-2 text-right font-bold text-blue-600">{row.count}명</td>
                      </tr>
                    ))}</tbody>
                  </table>
                )}
              </div>
            </>
          )}
        </main>
      </div>
    </div>
  );
}

export default AdminStats;
