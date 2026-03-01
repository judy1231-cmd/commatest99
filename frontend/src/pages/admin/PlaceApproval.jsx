import { useState, useEffect } from 'react';
import { fetchWithAuth } from '../../api/fetchWithAuth';
import AdminSidebar from '../../components/admin/AdminSidebar';
import AdminHeader from '../../components/admin/AdminHeader';

const STATUS_STYLE = {
  pending:  { label: '대기', style: 'bg-amber-100 text-amber-700' },
  approved: { label: '승인', style: 'bg-green-100 text-green-700' },
  rejected: { label: '반려', style: 'bg-red-100 text-red-700' },
};

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
    <div className="flex h-screen overflow-hidden bg-background-light">
      <AdminSidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <AdminHeader title="장소 승인 관리" subtitle="등록 신청된 휴식 장소를 검토하고 승인하세요." />
        <main className="flex-1 overflow-y-auto p-6">

          {/* Summary */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            {[
              { label: '승인 대기', value: summary.pending, color: 'text-amber-500', bg: 'bg-amber-50' },
              { label: '승인 완료', value: summary.approved, color: 'text-primary', bg: 'bg-accent-mint' },
              { label: '반려', value: summary.rejected, color: 'text-red-500', bg: 'bg-red-50' },
            ].map((s, i) => (
              <div key={i} className={`${s.bg} rounded-xl p-5 border border-slate-200`}>
                <p className={`text-2xl font-black ${s.color}`}>{s.value}</p>
                <p className="text-sm text-slate-500 font-medium">{s.label}</p>
              </div>
            ))}
          </div>

          {/* Filter Tabs */}
          <div className="flex gap-2 mb-5">
            {[
              { value: 'pending', label: '대기 중' },
              { value: 'approved', label: '승인됨' },
              { value: 'rejected', label: '반려됨' },
              { value: '', label: '전체' },
            ].map((tab) => (
              <button
                key={tab.value}
                onClick={() => { setStatusFilter(tab.value); setPage(1); }}
                className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${statusFilter === tab.value ? 'bg-primary text-white' : 'bg-white border border-slate-200 text-slate-600 hover:border-primary hover:text-primary'}`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Place Grid */}
          {loading ? (
            <div className="flex justify-center items-center h-40">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
            </div>
          ) : places.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-2xl border border-gray-200">
              <span className="material-icons text-5xl text-gray-300 block mb-2">location_off</span>
              <p className="text-gray-400">해당하는 장소가 없어요</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {places.map((place) => {
                  const statusInfo = STATUS_STYLE[place.status] || { label: place.status, style: 'bg-gray-100 text-gray-500' };
                  const photo = place.photos?.[0]?.photoUrl;

                  return (
                    <div key={place.id} className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden hover:shadow-md transition-shadow">
                      <div className="relative h-44 overflow-hidden bg-slate-100">
                        {photo ? (
                          <img alt={place.name} className="w-full h-full object-cover" src={photo} />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <span className="material-icons text-slate-300 text-4xl">landscape</span>
                          </div>
                        )}
                        <div className={`absolute top-3 right-3 px-2.5 py-1 rounded-full text-[11px] font-bold ${statusInfo.style}`}>
                          {statusInfo.label}
                        </div>
                      </div>
                      <div className="p-5">
                        <h3 className="font-bold text-gray-900 mb-1">{place.name}</h3>
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-xs text-gray-400 flex items-center gap-1">
                            <span className="material-icons-round text-[12px]">location_on</span>
                            {place.address}
                          </span>
                        </div>
                        {place.aiScore != null && (
                          <div className="text-xs text-gray-400 mb-3">
                            AI 점수: <span className="font-bold text-primary">{place.aiScore.toFixed(1)}</span>
                          </div>
                        )}
                        {place.status === 'pending' && (
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleStatus(place.id, 'approved')}
                              className="flex-1 py-2 bg-primary text-white text-sm font-bold rounded-xl hover:bg-primary/90 transition-all"
                            >
                              승인
                            </button>
                            <button
                              onClick={() => handleStatus(place.id, 'rejected')}
                              className="flex-1 py-2 border border-red-200 text-red-500 text-sm font-bold rounded-xl hover:bg-red-50 transition-all"
                            >
                              반려
                            </button>
                          </div>
                        )}
                        {place.status === 'approved' && (
                          <div className="flex items-center gap-2 text-green-600 text-sm font-semibold">
                            <span className="material-icons-round text-lg">check_circle</span>
                            승인 완료
                          </div>
                        )}
                        {place.status === 'rejected' && (
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2 text-red-500 text-sm font-semibold">
                              <span className="material-icons-round text-lg">cancel</span>
                              반려됨
                            </div>
                            <button
                              onClick={() => handleStatus(place.id, 'approved')}
                              className="text-xs text-primary font-bold hover:underline"
                            >
                              재승인
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex justify-center gap-2 mt-6">
                  <button disabled={page === 1} onClick={() => setPage(page - 1)} className="w-9 h-9 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-30">‹</button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                    <button key={p} onClick={() => setPage(p)} className={`w-9 h-9 rounded-lg text-sm font-medium ${p === page ? 'bg-primary text-white' : 'border border-gray-200 text-gray-500 hover:bg-gray-50'}`}>{p}</button>
                  ))}
                  <button disabled={page === totalPages} onClick={() => setPage(page + 1)} className="w-9 h-9 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-30">›</button>
                </div>
              )}
            </>
          )}
        </main>
      </div>
    </div>
  );
}

export default PlaceApproval;
