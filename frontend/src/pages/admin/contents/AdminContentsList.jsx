import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminSidebar from '../../../components/admin/AdminSidebar';
import AdminHeader from '../../../components/admin/AdminHeader';
import { fetchWithAuth } from '../../../api/fetchWithAuth';

const REST_TYPE_LABELS = {
  physical: '신체적 이완', mental: '정신적 고요', sensory: '감각의 정화',
  emotional: '정서적 지지', social: '사회적 휴식', nature: '자연의 연결', creative: '창조적 몰입',
};

const REST_TYPE_COLORS = {
  physical:  'bg-blue-50 text-blue-600 border border-blue-200',
  mental:    'bg-violet-50 text-violet-600 border border-violet-200',
  sensory:   'bg-cyan-50 text-cyan-600 border border-cyan-200',
  emotional: 'bg-pink-50 text-pink-600 border border-pink-200',
  social:    'bg-orange-50 text-orange-600 border border-orange-200',
  nature:    'bg-emerald-50 text-emerald-600 border border-emerald-200',
  creative:  'bg-amber-50 text-amber-600 border border-amber-200',
};

const PAGE_SIZE = 15;

function AdminContentsList() {
  const navigate = useNavigate();
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  /* ── UI 전용 상태 ── */
  const [search, setSearch] = useState('');
  const [page, setPage]     = useState(1);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const data = await fetchWithAuth('/api/admin/activities');
        if (data.success && data.data) setActivities(data.data);
      } catch { } finally { setLoading(false); }
    })();
  }, []);

  const filtered = filter === 'all' ? activities : activities.filter(a => a.restType === filter || a.restTypeName === filter);

  /* 검색 필터 + 페이지네이션 (기존 filtered 보존) */
  const searched   = search.trim()
    ? filtered.filter(a => (a.activityName || a.name || '').includes(search.trim()))
    : filtered;
  const totalPages = Math.max(1, Math.ceil(searched.length / PAGE_SIZE));
  const paginated  = searched.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const handleFilter = (val) => { setFilter(val); setPage(1); };
  const handleSearch = (val) => { setSearch(val); setPage(1); };

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      <AdminSidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <AdminHeader title="콘텐츠 관리" subtitle="휴식 활동 콘텐츠 목록입니다." />
        <main className="flex-1 overflow-y-auto p-6 space-y-5">

          {/* ── 상단 툴바: 검색(좌) + 새 콘텐츠(우) ── */}
          <div className="flex items-center justify-between gap-4">
            <div className="relative w-72">
              <span className="material-icons absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xl">search</span>
              <input
                value={search}
                onChange={(e) => handleSearch(e.target.value)}
                placeholder="활동명으로 검색"
                className="w-full pl-10 pr-4 h-10 bg-white border border-gray-200 rounded-lg text-sm text-gray-700 placeholder:text-gray-400 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all shadow-sm"
              />
            </div>
            <button
              onClick={() => navigate('/admin/contents/new')}
              className="flex items-center gap-1.5 h-10 px-4 bg-primary hover:bg-primary/90 text-white text-sm font-bold rounded-lg transition-colors shadow-sm shrink-0"
            >
              <span className="material-icons text-[18px]">add</span>
              새 콘텐츠 작성
            </button>
          </div>

          {/* ── 테이블 카드 ── */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">

            {/* 유형 칩 필터 */}
            <div className="px-5 py-3.5 border-b border-gray-100 flex items-center justify-between">
              <div className="flex items-center gap-1.5 flex-wrap">
                <button
                  onClick={() => handleFilter('all')}
                  className={`h-7 px-3 rounded-lg text-xs font-semibold border transition-all ${
                    filter === 'all'
                      ? 'bg-primary text-white border-primary'
                      : 'bg-white text-gray-500 border-gray-200 hover:border-gray-300'
                  }`}
                >
                  전체
                </button>
                {Object.entries(REST_TYPE_LABELS).map(([key, label]) => (
                  <button
                    key={key}
                    onClick={() => handleFilter(key)}
                    className={`h-7 px-3 rounded-lg text-xs font-semibold border transition-all ${
                      filter === key
                        ? 'bg-primary text-white border-primary'
                        : 'bg-white text-gray-500 border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
              <span className="text-xs text-gray-400 shrink-0 ml-3">
                총 <span className="font-semibold text-gray-600">{searched.length}</span>개
              </span>
            </div>

            {/* ── 테이블 ── */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200">
                    <th className="px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider w-8">#</th>
                    <th className="px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">활동명</th>
                    <th className="px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider w-32">유형</th>
                    <th className="px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider w-24">소요시간</th>
                    <th className="px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider w-20">상태</th>
                    <th className="px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right w-28">관리</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    [...Array(8)].map((_, i) => (
                      <tr key={i} className={`border-b border-gray-100 ${i % 2 === 1 ? 'bg-gray-50/60' : ''}`}>
                        <td className="px-5 py-3.5"><div className="w-5 h-3 bg-gray-200 rounded animate-pulse" /></td>
                        <td className="px-5 py-3.5">
                          <div className="space-y-1.5">
                            <div className="w-36 h-3 bg-gray-200 rounded animate-pulse" />
                            <div className="w-56 h-2.5 bg-gray-100 rounded animate-pulse" />
                          </div>
                        </td>
                        <td className="px-5 py-3.5"><div className="w-20 h-5 bg-gray-200 rounded-full animate-pulse" /></td>
                        <td className="px-5 py-3.5"><div className="w-12 h-3 bg-gray-200 rounded animate-pulse" /></td>
                        <td className="px-5 py-3.5"><div className="w-14 h-5 bg-gray-200 rounded-full animate-pulse" /></td>
                        <td className="px-5 py-3.5 text-right">
                          <div className="flex justify-end gap-2">
                            <div className="w-10 h-6 bg-gray-200 rounded-lg animate-pulse" />
                            <div className="w-10 h-6 bg-gray-200 rounded-lg animate-pulse" />
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : paginated.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-16 text-center">
                        <div className="flex flex-col items-center gap-2 text-gray-300">
                          <span className="material-icons text-4xl">library_books</span>
                          <p className="text-sm text-gray-400">
                            {search ? '검색 결과가 없습니다' : '콘텐츠가 없습니다'}
                          </p>
                          {!search && (
                            <p className="text-xs text-gray-300">rest_activities 테이블에 데이터를 추가해주세요</p>
                          )}
                        </div>
                      </td>
                    </tr>
                  ) : (
                    paginated.map((a, idx) => {
                      const typeKey   = a.restType || '';
                      const typeLabel = REST_TYPE_LABELS[typeKey] || a.restTypeName || typeKey || '-';
                      const typeColor = REST_TYPE_COLORS[typeKey] || 'bg-gray-100 text-gray-500 border border-gray-200';
                      const rowNum    = (page - 1) * PAGE_SIZE + idx + 1;

                      return (
                        <tr
                          key={a.id || idx}
                          className={`border-b border-gray-100 hover:bg-primary/5 transition-colors ${idx % 2 === 1 ? 'bg-gray-50/50' : 'bg-white'}`}
                        >
                          {/* # */}
                          <td className="px-5 py-3.5 text-xs text-gray-400 tabular-nums">{rowNum}</td>

                          {/* 활동명 + 설명 */}
                          <td className="px-5 py-3.5">
                            <p className="font-semibold text-gray-900">{a.activityName || a.name || '-'}</p>
                            <p className="text-xs text-gray-400 mt-0.5 line-clamp-1 max-w-sm">
                              {a.guideContent || a.description || ''}
                            </p>
                          </td>

                          {/* 유형 배지 */}
                          <td className="px-5 py-3.5">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold ${typeColor}`}>
                              {typeLabel}
                            </span>
                          </td>

                          {/* 소요시간 */}
                          <td className="px-5 py-3.5 text-sm text-gray-600 tabular-nums">
                            {a.durationMinutes || a.duration
                              ? <span>{a.durationMinutes || a.duration}<span className="text-xs text-gray-400 ml-0.5">분</span></span>
                              : <span className="text-gray-300">—</span>
                            }
                          </td>

                          {/* 상태 배지 */}
                          <td className="px-5 py-3.5">
                            {a.isActive === false
                              ? <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-gray-100 text-gray-500 border border-gray-200">
                                  <span className="w-1.5 h-1.5 rounded-full bg-gray-400 inline-block" />비공개
                                </span>
                              : <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-green-50 text-green-600 border border-green-200">
                                  <span className="w-1.5 h-1.5 rounded-full bg-green-500 inline-block" />공개
                                </span>
                            }
                          </td>

                          {/* 관리 버튼 */}
                          <td className="px-5 py-3.5 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                onClick={() => navigate(`/admin/contents/${a.id}/edit`)}
                                className="px-2.5 py-1 text-[11px] font-bold text-blue-600 border border-blue-200 rounded-lg hover:bg-blue-50 transition-colors"
                              >
                                수정
                              </button>
                              <button
                                className="px-2.5 py-1 text-[11px] font-bold text-red-500 border border-red-200 rounded-lg hover:bg-red-50 transition-colors"
                              >
                                삭제
                              </button>
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
                  {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, searched.length)} / {searched.length}개
                </p>
                <div className="flex items-center gap-1">
                  <button
                    disabled={page === 1}
                    onClick={() => setPage(p => p - 1)}
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
                    onClick={() => setPage(p => p + 1)}
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

export default AdminContentsList;
