import { useState, useEffect } from 'react';
import { fetchWithAuth } from '../../api/fetchWithAuth';
import AdminSidebar from '../../components/admin/AdminSidebar';
import AdminHeader from '../../components/admin/AdminHeader';

const STATUS_STYLE = {
  pending:  { label: '대기', style: 'bg-amber-50 text-amber-700 border border-amber-200',  icon: 'schedule' },
  approved: { label: '승인', style: 'bg-green-50 text-green-700 border border-green-200', icon: 'check_circle' },
  rejected: { label: '반려', style: 'bg-red-50 text-red-600 border border-red-200',       icon: 'cancel' },
};

const TABS = [
  { value: 'pending',  label: '대기 중' },
  { value: 'approved', label: '승인됨' },
  { value: 'rejected', label: '반려됨' },
  { value: '',         label: '전체' },
];

function PlaceApproval() {
  const [places, setPlaces] = useState([]);
  const [summary, setSummary] = useState({ pending: 0, approved: 0, rejected: 0 });
  const [statusFilter, setStatusFilter] = useState('pending');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPlaces();
  }, [statusFilter, page]);

  const loadPlaces = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page, size: 12 });
      if (statusFilter) params.set('status', statusFilter);

      const data = await fetchWithAuth(`/api/admin/places?${params}`);
      if (data.success && data.data) {
        setPlaces(data.data.places || []);
        setTotalPages(data.data.totalPages || 1);
      }
    } catch {
      // 무시
    } finally {
      setLoading(false);
    }
  };

  const loadSummary = async () => {
    try {
      const [pending, approved, rejected] = await Promise.all([
        fetchWithAuth('/api/admin/places?status=pending&page=1&size=1'),
        fetchWithAuth('/api/admin/places?status=approved&page=1&size=1'),
        fetchWithAuth('/api/admin/places?status=rejected&page=1&size=1'),
      ]);
      setSummary({
        pending: pending.data?.total || 0,
        approved: approved.data?.total || 0,
        rejected: rejected.data?.total || 0,
      });
    } catch {
      // 무시
    }
  };

  useEffect(() => { loadSummary(); }, []);

  const handleStatus = async (placeId, status) => {
    try {
      await fetchWithAuth(`/api/admin/places/${placeId}/status`, {
        method: 'PUT',
        body: JSON.stringify({ status }),
      });
      setPlaces((prev) => prev.map((p) => p.id === placeId ? { ...p, status } : p));
      setSummary((prev) => ({
        ...prev,
        pending: prev.pending - 1,
        [status === 'approved' ? 'approved' : 'rejected']: prev[status === 'approved' ? 'approved' : 'rejected'] + 1,
      }));
    } catch {
      // 무시
    }
  };

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      <AdminSidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <AdminHeader title="장소 승인 관리" subtitle="등록 신청된 휴식 장소를 검토하고 승인하세요." />
        <main className="flex-1 overflow-y-auto p-6 space-y-5">

          {/* ── 요약 카드 3개 ── */}
          <div className="grid grid-cols-3 gap-4">
            {[
              { label: '승인 대기', value: summary.pending,  icon: 'schedule',     iconCls: 'bg-amber-50 text-amber-500',  valCls: 'text-amber-600' },
              { label: '승인 완료', value: summary.approved, icon: 'check_circle', iconCls: 'bg-green-50 text-green-600',  valCls: 'text-green-600' },
              { label: '반려',      value: summary.rejected, icon: 'cancel',       iconCls: 'bg-red-50 text-red-500',      valCls: 'text-red-500'   },
            ].map((s, i) => (
              <div key={i} className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 flex items-center gap-4">
                <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${s.iconCls}`}>
                  <span className="material-icons-round text-[22px]">{s.icon}</span>
                </div>
                <div>
                  <p className={`text-2xl font-bold leading-tight ${s.valCls}`}>{s.value}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{s.label}</p>
                </div>
              </div>
            ))}
          </div>

          {/* ── 테이블 카드 ── */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">

            {/* 탭 + 건수 */}
            <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                {TABS.map((tab) => (
                  <button
                    key={tab.value}
                    onClick={() => { setStatusFilter(tab.value); setPage(1); }}
                    className={`h-8 px-3.5 rounded-lg text-xs font-semibold border transition-all ${
                      statusFilter === tab.value
                        ? 'bg-primary text-white border-primary shadow-sm'
                        : 'bg-white text-gray-500 border-gray-200 hover:border-gray-300 hover:text-gray-700'
                    }`}
                  >
                    {tab.label}
                    {tab.value === 'pending' && summary.pending > 0 && (
                      <span className={`ml-1.5 text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                        statusFilter === 'pending' ? 'bg-white/30 text-white' : 'bg-amber-100 text-amber-600'
                      }`}>
                        {summary.pending}
                      </span>
                    )}
                  </button>
                ))}
              </div>
              <p className="text-xs text-gray-400">
                {statusFilter ? STATUS_STYLE[statusFilter]?.label : '전체'} 장소
              </p>
            </div>

            {/* ── 테이블 ── */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200">
                    <th className="px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">장소</th>
                    <th className="px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider w-24">AI 점수</th>
                    <th className="px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider w-24">상태</th>
                    <th className="px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right w-40">관리</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    [...Array(8)].map((_, i) => (
                      <tr key={i} className={`border-b border-gray-100 ${i % 2 === 1 ? 'bg-gray-50/60' : ''}`}>
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-gray-200 animate-pulse shrink-0" />
                            <div className="space-y-1.5">
                              <div className="w-28 h-3 bg-gray-200 rounded animate-pulse" />
                              <div className="w-44 h-2.5 bg-gray-100 rounded animate-pulse" />
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-4"><div className="w-12 h-5 bg-gray-200 rounded-full animate-pulse" /></td>
                        <td className="px-5 py-4"><div className="w-14 h-5 bg-gray-200 rounded-full animate-pulse" /></td>
                        <td className="px-5 py-4 text-right">
                          <div className="flex justify-end gap-2">
                            <div className="w-14 h-7 bg-gray-200 rounded-lg animate-pulse" />
                            <div className="w-14 h-7 bg-gray-200 rounded-lg animate-pulse" />
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : places.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="py-16 text-center">
                        <div className="flex flex-col items-center gap-2 text-gray-300">
                          <span className="material-icons text-4xl">location_off</span>
                          <p className="text-sm text-gray-400">해당하는 장소가 없습니다</p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    places.map((place, idx) => {
                      const statusInfo = STATUS_STYLE[place.status] || { label: place.status, style: 'bg-gray-100 text-gray-500 border border-gray-200', icon: 'help' };
                      const photo = place.photos?.[0]?.photoUrl;

                      return (
                        <tr
                          key={place.id}
                          className={`border-b border-gray-100 hover:bg-primary/5 transition-colors ${idx % 2 === 1 ? 'bg-gray-50/50' : 'bg-white'}`}
                        >
                          {/* 장소명 + 주소 */}
                          <td className="px-5 py-3.5">
                            <div className="flex items-center gap-3">
                              {/* 썸네일 */}
                              <div className="w-10 h-10 rounded-lg overflow-hidden bg-gray-100 shrink-0 flex items-center justify-center">
                                {photo
                                  ? <img src={photo} alt={place.name} className="w-full h-full object-cover" />
                                  : <span className="material-icons text-gray-300 text-xl">landscape</span>
                                }
                              </div>
                              <div>
                                <p className="font-semibold text-gray-900 text-sm">{place.name}</p>
                                <p className="text-xs text-gray-400 flex items-center gap-0.5 mt-0.5 max-w-xs truncate">
                                  <span className="material-icons-round text-[11px]">location_on</span>
                                  {place.address || '-'}
                                </p>
                              </div>
                            </div>
                          </td>

                          {/* AI 점수 */}
                          <td className="px-5 py-3.5">
                            {place.aiScore != null ? (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-50 text-blue-600 border border-blue-200">
                                {place.aiScore.toFixed(1)}
                              </span>
                            ) : (
                              <span className="text-gray-300 text-xs">—</span>
                            )}
                          </td>

                          {/* 상태 배지 */}
                          <td className="px-5 py-3.5">
                            <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold ${statusInfo.style}`}>
                              <span className="material-icons text-[12px]">{statusInfo.icon}</span>
                              {statusInfo.label}
                            </span>
                          </td>

                          {/* 관리 버튼 */}
                          <td className="px-5 py-3.5 text-right">
                            <div className="flex items-center justify-end gap-2">
                              {place.status === 'pending' && (
                                <>
                                  <button
                                    onClick={() => handleStatus(place.id, 'approved')}
                                    className="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold rounded-lg transition-colors"
                                  >
                                    승인
                                  </button>
                                  <button
                                    onClick={() => handleStatus(place.id, 'rejected')}
                                    className="px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-500 border border-red-200 text-xs font-bold rounded-lg transition-colors"
                                  >
                                    반려
                                  </button>
                                </>
                              )}
                              {place.status === 'approved' && (
                                <button
                                  onClick={() => handleStatus(place.id, 'rejected')}
                                  className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-500 border border-gray-200 text-xs font-bold rounded-lg transition-colors"
                                >
                                  반려로 변경
                                </button>
                              )}
                              {place.status === 'rejected' && (
                                <button
                                  onClick={() => handleStatus(place.id, 'approved')}
                                  className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-600 border border-emerald-200 text-xs font-bold rounded-lg transition-colors"
                                >
                                  재승인
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* ── 페이지네이션 ── */}
            {!loading && totalPages > 1 && (
              <div className="px-5 py-3.5 border-t border-gray-100 flex items-center justify-between">
                <p className="text-xs text-gray-400">
                  페이지 <span className="font-semibold text-gray-600">{page}</span> / {totalPages}
                </p>
                <div className="flex items-center gap-1">
                  <button
                    disabled={page === 1}
                    onClick={() => setPage(page - 1)}
                    className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                  >
                    <span className="material-icons text-lg">chevron_left</span>
                  </button>
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    const p = Math.max(1, page - 2) + i;
                    if (p > totalPages) return null;
                    return (
                      <button
                        key={p}
                        onClick={() => setPage(p)}
                        className={`w-8 h-8 rounded-lg text-sm font-medium transition-all ${
                          p === page ? 'bg-primary text-white shadow-sm' : 'text-gray-500 hover:bg-gray-100'
                        }`}
                      >
                        {p}
                      </button>
                    );
                  })}
                  <button
                    disabled={page === totalPages}
                    onClick={() => setPage(page + 1)}
                    className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                  >
                    <span className="material-icons text-lg">chevron_right</span>
                  </button>
                </div>
              </div>
            )}
          </div>

        </main>
      </div>
    </div>
  );
}

export default PlaceApproval;
