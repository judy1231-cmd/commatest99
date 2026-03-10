import { useState, useEffect } from 'react';
import { fetchWithAuth } from '../../../api/fetchWithAuth';
import AdminSidebar from '../../../components/admin/AdminSidebar';
import AdminHeader from '../../../components/admin/AdminHeader';

function AdminRecords() {
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

  const dailyLogs = analytics?.dailyRestLogs || [];

  return (
    <div className="flex h-screen overflow-hidden bg-background-light">
      <AdminSidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <AdminHeader title="휴식 기록 관리" subtitle="전체 사용자의 휴식 기록 현황입니다." />
        <main className="flex-1 overflow-y-auto p-6 space-y-6">
          {loading ? (
            <div className="flex justify-center items-center h-40">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
                  <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center mb-3">
                    <span className="material-icons">event_note</span>
                  </div>
                  <p className="text-sm text-gray-500">전체 휴식 기록</p>
                  <p className="text-3xl font-bold text-gray-900 mt-1">{dashboard?.totalRestLogs?.toLocaleString() || '0'}건</p>
                </div>
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
                  <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center mb-3">
                    <span className="material-icons">today</span>
                  </div>
                  <p className="text-sm text-gray-500">오늘 기록</p>
                  <p className="text-3xl font-bold text-gray-900 mt-1">
                    {dailyLogs.length > 0 ? (dailyLogs[dailyLogs.length - 1].count || 0) : 0}건
                  </p>
                </div>
              </div>

              <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-gray-800">일별 휴식 기록 현황</h3>
                  <span className="text-xs text-gray-400">최근 30일</span>
                </div>
                {dailyLogs.length === 0 ? (
                  <p className="text-gray-400 text-sm text-center py-8">데이터가 없습니다</p>
                ) : (
                  <table className="w-full text-sm">
                    <thead><tr className="bg-gray-50">
                      <th className="text-left px-4 py-2 text-xs font-semibold text-gray-500">날짜</th>
                      <th className="text-right px-4 py-2 text-xs font-semibold text-gray-500">기록 수</th>
                    </tr></thead>
                    <tbody>
                      {[...dailyLogs].reverse().map((row, i) => (
                        <tr key={i} className="border-b border-gray-50 hover:bg-gray-50">
                          <td className="px-4 py-2 text-gray-700">{row.date}</td>
                          <td className="px-4 py-2 text-right font-bold text-primary">{row.count}건</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
                <p className="text-xs text-gray-400 mt-4">* 개별 기록 상세 조회는 추후 지원 예정입니다.</p>
              </div>
            </>
          )}
        </main>
      </div>
    </div>
  );
}

export default AdminRecords;
