import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { fetchWithAuth } from '../../api/fetchWithAuth';
import AdminSidebar from '../../components/admin/AdminSidebar';
import AdminHeader from '../../components/admin/AdminHeader';

const months = ['1월', '2월', '3월', '4월', '5월', '6월'];
const chartHeights = [40, 55, 45, 70, 85, 100];

const STATUS_LABELS = {
  pending: '대기',
  approved: '승인',
  rejected: '반려',
};

function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [pendingPlaces, setPendingPlaces] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    setLoading(true);
    try {
      const [dashRes, placesRes] = await Promise.allSettled([
        fetchWithAuth('/api/admin/dashboard'),
        fetchWithAuth('/api/admin/places?status=pending&page=1&size=5'),
      ]);

      if (dashRes.status === 'fulfilled' && dashRes.value.success) {
        setStats(dashRes.value.data);
      }
      if (placesRes.status === 'fulfilled' && placesRes.value.success) {
        setPendingPlaces(placesRes.value.data?.places || []);
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

  return (
    <div className="flex h-screen overflow-hidden bg-background-light">
      <AdminSidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <AdminHeader title="실시간 대시보드" subtitle="플랫폼의 현재 상태와 실시간 통계를 확인하세요." />
        <main className="flex-1 overflow-y-auto p-6 space-y-8">

          {loading ? (
            <div className="flex justify-center items-center h-40">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
            </div>
          ) : (
            <>
              {/* Stats Cards */}
              <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                {statCards.map((stat, i) => (
                  <div key={i} className={`bg-white p-5 rounded-xl border shadow-sm ${stat.urgent ? 'border-l-4 border-l-red-400 border-gray-200' : 'border-gray-200'}`}>
                    <div className="flex items-center justify-between mb-3">
                      <div className={`w-10 h-10 rounded-lg ${stat.color} flex items-center justify-center`}>
                        <span className="material-icons-round">{stat.icon}</span>
                      </div>
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${stat.changeColor}`}>{stat.change}</span>
                    </div>
                    <p className="text-sm text-gray-500">{stat.label}</p>
                    <h3 className="text-2xl font-bold mt-1 text-gray-900">{stat.value}</h3>
                  </div>
                ))}
              </section>

              {/* Charts */}
              <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="font-bold text-lg">사용자 증가 추이</h3>
                    <span className="text-xs text-gray-400">최근 6개월 (예시)</span>
                  </div>
                  <div className="relative h-48 w-full flex items-end gap-2 px-2">
                    {chartHeights.map((h, i) => (
                      <div key={i} className={`flex-1 ${h > 80 ? 'bg-primary/40 hover:bg-primary/60' : 'bg-primary/20 hover:bg-primary/40'} transition-colors rounded-t-lg group relative`} style={{ height: `${h}%` }}>
                        <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-[10px] py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                          {[12, 15, 14, 22, 28, 32][i]}k
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="flex justify-between mt-4 px-2 text-[10px] text-gray-400 font-medium uppercase tracking-wider">
                    {months.map(m => <span key={m}>{m}</span>)}
                  </div>
                </div>

                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex flex-col">
                  <h3 className="font-bold text-lg mb-4">회원 현황</h3>
                  {stats && (
                    <div className="flex-1 space-y-4">
                      <div className="flex justify-between items-center py-3 border-b border-gray-100">
                        <span className="text-sm text-gray-600">전체 회원</span>
                        <span className="font-bold text-gray-900">{stats.totalUsers?.toLocaleString()}명</span>
                      </div>
                      <div className="flex justify-between items-center py-3 border-b border-gray-100">
                        <span className="text-sm text-gray-600">활성 사용자</span>
                        <span className="font-bold text-emerald-600">{stats.activeUsers?.toLocaleString()}명</span>
                      </div>
                      <div className="flex justify-between items-center py-3 border-b border-gray-100">
                        <span className="text-sm text-gray-600">오늘 신규 가입</span>
                        <span className="font-bold text-blue-600">{stats.todaySignups?.toLocaleString()}명</span>
                      </div>
                      <div className="flex justify-between items-center py-3">
                        <span className="text-sm text-gray-600">전체 휴식 기록</span>
                        <span className="font-bold text-primary">{stats.totalRestLogs?.toLocaleString()}건</span>
                      </div>
                    </div>
                  )}
                </div>
              </section>

              {/* Pending Places */}
              <section className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                  <h3 className="font-bold text-lg">장소 승인 대기 목록</h3>
                  <Link to="/admin/places" className="text-sm font-semibold text-primary hover:underline">전체보기</Link>
                </div>
                {pendingPlaces.length === 0 ? (
                  <div className="p-8 text-center text-gray-400 text-sm">
                    <span className="material-icons text-3xl block mb-2 text-gray-300">check_circle</span>
                    승인 대기 중인 장소가 없어요
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left">
                      <thead className="bg-gray-50 text-gray-500 text-xs font-semibold uppercase">
                        <tr>
                          <th className="px-6 py-3">장소명</th>
                          <th className="px-6 py-3">주소</th>
                          <th className="px-6 py-3">AI 점수</th>
                          <th className="px-6 py-3 text-right">관리</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100 text-sm">
                        {pendingPlaces.map((place) => (
                          <tr key={place.id} className="hover:bg-gray-50 transition-colors">
                            <td className="px-6 py-4 font-medium text-gray-900">{place.name}</td>
                            <td className="px-6 py-4 text-gray-500">{place.address}</td>
                            <td className="px-6 py-4 text-gray-500">
                              {place.aiScore != null ? place.aiScore.toFixed(1) : '-'}
                            </td>
                            <td className="px-6 py-4 text-right">
                              <div className="flex items-center justify-end gap-2">
                                <button
                                  onClick={() => handlePlaceStatus(place.id, 'approved')}
                                  className="px-3 py-1 bg-primary text-white text-xs font-bold rounded-lg hover:bg-primary/90 transition-all"
                                >
                                  승인
                                </button>
                                <button
                                  onClick={() => handlePlaceStatus(place.id, 'rejected')}
                                  className="px-3 py-1 border border-red-200 text-red-500 text-xs font-bold rounded-lg hover:bg-red-50 transition-all"
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
            </>
          )}
        </main>
      </div>
    </div>
  );
}

export default AdminDashboard;
