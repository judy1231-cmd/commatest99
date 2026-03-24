import { useState, useEffect } from 'react';
import { fetchWithAuth } from '../../api/fetchWithAuth';
import AdminSidebar from '../../components/admin/AdminSidebar';
import AdminHeader from '../../components/admin/AdminHeader';

const REST_TYPES = [
  { value: 'physical',  label: '신체의 이완' },
  { value: 'mental',    label: '정신적 고요' },
  { value: 'sensory',   label: '감각의 정화' },
  { value: 'emotional', label: '정서적 지지' },
  { value: 'social',    label: '사회적 휴식' },
  { value: 'nature',    label: '자연의 연결' },
  { value: 'creative',  label: '창조적 몰입' },
];

const DIFFICULTY_OPTIONS = [
  { value: 'easy',   label: '가벼운' },
  { value: 'medium', label: '보통' },
  { value: 'hard',   label: '활동적인' },
];

const STATUS_STYLE = {
  pending:  { label: '대기',   style: 'bg-amber-50 text-amber-700 border border-amber-200',  icon: 'schedule' },
  approved: { label: '등록됨', style: 'bg-green-50 text-green-700 border border-green-200',  icon: 'check_circle' },
  rejected: { label: '비공개', style: 'bg-red-50 text-red-600 border border-red-200',        icon: 'visibility_off' },
};

const TABS = [
  { value: 'approved', label: '등록됨' },
  { value: 'pending',  label: '대기 중' },
  { value: 'rejected', label: '비공개' },
  { value: '',         label: '전체' },
];

const EMPTY_FORM = {
  name: '', address: '', latitude: '', longitude: '',
  operatingHours: '', difficulty: '', restTypes: [], photoUrl: '',
};

function PlaceApproval() {
  const [places, setPlaces] = useState([]);
  const [summary, setSummary] = useState({ pending: 0, approved: 0, rejected: 0 });
  const [statusFilter, setStatusFilter] = useState('approved');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');

  useEffect(() => { loadPlaces(); }, [statusFilter, page]);
  useEffect(() => { loadSummary(); }, []);

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
        pending:  pending.data?.total  || 0,
        approved: approved.data?.total || 0,
        rejected: rejected.data?.total || 0,
      });
    } catch { /* 무시 */ }
  };

  const handleStatus = async (placeId, status) => {
    try {
      await fetchWithAuth(`/api/admin/places/${placeId}/status`, {
        method: 'PUT',
        body: JSON.stringify({ status }),
      });
      setPlaces(prev => prev.map(p => p.id === placeId ? { ...p, status } : p));
      loadSummary();
    } catch { /* 무시 */ }
  };

  const handleFormChange = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const toggleRestType = (value) => {
    setForm(prev => ({
      ...prev,
      restTypes: prev.restTypes.includes(value)
        ? prev.restTypes.filter(r => r !== value)
        : [...prev.restTypes, value],
    }));
  };

  const handleSubmit = async () => {
    if (!form.name.trim() || !form.address.trim()) {
      setFormError('장소명과 주소는 필수입니다.');
      return;
    }
    setSaving(true);
    setFormError('');
    try {
      const body = {
        name: form.name.trim(),
        address: form.address.trim(),
        latitude:  form.latitude  ? parseFloat(form.latitude)  : null,
        longitude: form.longitude ? parseFloat(form.longitude) : null,
        operatingHours: form.operatingHours.trim() || null,
        difficulty: form.difficulty || null,
        restTypes: form.restTypes.length > 0 ? form.restTypes : null,
        photoUrl: form.photoUrl.trim() || null,
      };
      const res = await fetchWithAuth('/api/admin/places', {
        method: 'POST',
        body: JSON.stringify(body),
      });
      if (res.success) {
        setShowForm(false);
        setForm(EMPTY_FORM);
        loadPlaces();
        loadSummary();
      } else {
        setFormError(res.message || '등록에 실패했습니다.');
      }
    } catch {
      setFormError('서버 오류가 발생했습니다.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      <AdminSidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <AdminHeader title="장소 관리" subtitle="등록된 휴식 장소를 관리하고 새로운 장소를 추가하세요." />
        <main className="flex-1 overflow-y-auto p-6 space-y-5">

          {/* ── 요약 카드 ── */}
          <div className="grid grid-cols-3 gap-4">
            {[
              { label: '등록됨',  value: summary.approved, icon: 'check_circle', iconCls: 'bg-green-50 text-green-600',  valCls: 'text-green-600' },
              { label: '대기 중', value: summary.pending,  icon: 'schedule',     iconCls: 'bg-amber-50 text-amber-500',  valCls: 'text-amber-600' },
              { label: '비공개',  value: summary.rejected, icon: 'visibility_off', iconCls: 'bg-red-50 text-red-500',   valCls: 'text-red-500'   },
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

            {/* 탭 + 등록 버튼 */}
            <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                {TABS.map(tab => (
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
                  </button>
                ))}
              </div>
              <button
                onClick={() => { setShowForm(true); setForm(EMPTY_FORM); setFormError(''); }}
                className="flex items-center gap-1.5 h-9 px-4 bg-primary hover:bg-primary/90 text-white text-xs font-bold rounded-xl transition-colors shadow-sm"
              >
                <span className="material-icons text-[16px]">add</span>
                장소 등록
              </button>
            </div>

            {/* ── 테이블 ── */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200">
                    <th className="px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">장소</th>
                    <th className="px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider w-28">운영시간</th>
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
                        <td className="px-5 py-4"><div className="w-20 h-3 bg-gray-100 rounded animate-pulse" /></td>
                        <td className="px-5 py-4"><div className="w-14 h-5 bg-gray-200 rounded-full animate-pulse" /></td>
                        <td className="px-5 py-4 text-right">
                          <div className="flex justify-end gap-2">
                            <div className="w-16 h-7 bg-gray-200 rounded-lg animate-pulse" />
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
                      return (
                        <tr key={place.id} className={`border-b border-gray-100 hover:bg-primary/5 transition-colors ${idx % 2 === 1 ? 'bg-gray-50/50' : 'bg-white'}`}>
                          <td className="px-5 py-3.5">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-lg overflow-hidden bg-gray-100 shrink-0 flex items-center justify-center">
                                {place.photoUrl ? (
                                  <img src={place.photoUrl} alt="" className="w-full h-full object-cover"
                                    onError={e => { e.currentTarget.style.display = 'none'; }} />
                                ) : (
                                  <span className="material-icons text-gray-300 text-xl">landscape</span>
                                )}
                              </div>
                              <div>
                                <p className="font-semibold text-gray-900 text-sm">{place.name}</p>
                                <p className="text-xs text-gray-400 flex items-center gap-0.5 mt-0.5 max-w-xs truncate">
                                  <span className="material-icons-round text-[11px]">location_on</span>
                                  {place.address || '—'}
                                </p>
                              </div>
                            </div>
                          </td>
                          <td className="px-5 py-3.5 text-xs text-gray-500">
                            {place.operatingHours || '—'}
                          </td>
                          <td className="px-5 py-3.5">
                            <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold ${statusInfo.style}`}>
                              <span className="material-icons text-[12px]">{statusInfo.icon}</span>
                              {statusInfo.label}
                            </span>
                          </td>
                          <td className="px-5 py-3.5 text-right">
                            <div className="flex items-center justify-end gap-2">
                              {place.status === 'approved' && (
                                <button onClick={() => handleStatus(place.id, 'rejected')}
                                  className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-500 border border-gray-200 text-xs font-bold rounded-lg transition-colors">
                                  비공개
                                </button>
                              )}
                              {place.status !== 'approved' && (
                                <button onClick={() => handleStatus(place.id, 'approved')}
                                  className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-600 border border-emerald-200 text-xs font-bold rounded-lg transition-colors">
                                  공개
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
                  <button disabled={page === 1} onClick={() => setPage(page - 1)}
                    className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors">
                    <span className="material-icons text-lg">chevron_left</span>
                  </button>
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    const p = Math.max(1, page - 2) + i;
                    if (p > totalPages) return null;
                    return (
                      <button key={p} onClick={() => setPage(p)}
                        className={`w-8 h-8 rounded-lg text-sm font-medium transition-all ${
                          p === page ? 'bg-primary text-white shadow-sm' : 'text-gray-500 hover:bg-gray-100'
                        }`}>
                        {p}
                      </button>
                    );
                  })}
                  <button disabled={page === totalPages} onClick={() => setPage(page + 1)}
                    className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors">
                    <span className="material-icons text-lg">chevron_right</span>
                  </button>
                </div>
              </div>
            )}
          </div>

        </main>
      </div>

      {/* ── 장소 등록 모달 ── */}
      {showForm && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
              <h2 className="text-base font-bold text-gray-900">새 장소 등록</h2>
              <button onClick={() => setShowForm(false)} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 text-gray-400 transition-colors">
                <span className="material-icons text-xl">close</span>
              </button>
            </div>

            <div className="px-6 py-5 space-y-4">

              {/* 장소명 */}
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">장소명 <span className="text-red-500">*</span></label>
                <input
                  type="text" value={form.name} onChange={e => handleFormChange('name', e.target.value)}
                  placeholder="예) 서울숲, 북촌 한옥마을"
                  className="w-full h-10 px-3.5 rounded-xl border border-gray-200 bg-gray-50 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                />
              </div>

              {/* 주소 */}
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">주소 <span className="text-red-500">*</span></label>
                <input
                  type="text" value={form.address} onChange={e => handleFormChange('address', e.target.value)}
                  placeholder="예) 서울 성동구 뚝섬로 273"
                  className="w-full h-10 px-3.5 rounded-xl border border-gray-200 bg-gray-50 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                />
              </div>

              {/* 위도/경도 */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5">위도 <span className="text-gray-400 font-normal">(선택)</span></label>
                  <input
                    type="number" step="any" value={form.latitude} onChange={e => handleFormChange('latitude', e.target.value)}
                    placeholder="37.5445"
                    className="w-full h-10 px-3.5 rounded-xl border border-gray-200 bg-gray-50 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5">경도 <span className="text-gray-400 font-normal">(선택)</span></label>
                  <input
                    type="number" step="any" value={form.longitude} onChange={e => handleFormChange('longitude', e.target.value)}
                    placeholder="127.0374"
                    className="w-full h-10 px-3.5 rounded-xl border border-gray-200 bg-gray-50 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                  />
                </div>
              </div>

              {/* 운영시간 */}
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">운영시간 <span className="text-gray-400 font-normal">(선택)</span></label>
                <input
                  type="text" value={form.operatingHours} onChange={e => handleFormChange('operatingHours', e.target.value)}
                  placeholder="예) 09:00~18:00 / 상시개방"
                  className="w-full h-10 px-3.5 rounded-xl border border-gray-200 bg-gray-50 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                />
              </div>

              {/* 난이도 */}
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">난이도 <span className="text-gray-400 font-normal">(선택)</span></label>
                <div className="flex gap-2">
                  {DIFFICULTY_OPTIONS.map(d => (
                    <button key={d.value} type="button"
                      onClick={() => handleFormChange('difficulty', form.difficulty === d.value ? '' : d.value)}
                      className={`flex-1 h-9 rounded-xl text-xs font-semibold border transition-all ${
                        form.difficulty === d.value
                          ? 'bg-primary text-white border-primary'
                          : 'bg-white text-gray-500 border-gray-200 hover:border-gray-300'
                      }`}>
                      {d.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* 휴식 유형 */}
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">휴식 유형 <span className="text-gray-400 font-normal">(선택, 복수 가능)</span></label>
                <div className="flex flex-wrap gap-1.5">
                  {REST_TYPES.map(rt => (
                    <button key={rt.value} type="button"
                      onClick={() => toggleRestType(rt.value)}
                      className={`h-7 px-3 rounded-full text-xs font-semibold border transition-all ${
                        form.restTypes.includes(rt.value)
                          ? 'bg-primary/10 text-primary border-primary/30'
                          : 'bg-white text-gray-500 border-gray-200 hover:border-gray-300'
                      }`}>
                      {rt.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* 사진 URL */}
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">사진 URL <span className="text-gray-400 font-normal">(선택)</span></label>
                <input
                  type="url" value={form.photoUrl} onChange={e => handleFormChange('photoUrl', e.target.value)}
                  placeholder="https://..."
                  className="w-full h-10 px-3.5 rounded-xl border border-gray-200 bg-gray-50 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                />
              </div>

              {formError && (
                <p className="text-xs text-red-500 font-semibold">{formError}</p>
              )}
            </div>

            <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-end gap-2">
              <button onClick={() => setShowForm(false)}
                className="h-10 px-5 rounded-xl border border-gray-200 text-sm font-semibold text-gray-500 hover:bg-gray-50 transition-colors">
                취소
              </button>
              <button onClick={handleSubmit} disabled={saving}
                className="h-10 px-6 rounded-xl bg-primary hover:bg-primary/90 disabled:opacity-50 text-white text-sm font-bold transition-colors">
                {saving ? '등록 중...' : '등록하기'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default PlaceApproval;
