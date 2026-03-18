import { useState, useEffect } from 'react';
import { fetchWithAuth } from '../../../api/fetchWithAuth';
import AdminSidebar from '../../../components/admin/AdminSidebar';
import AdminHeader from '../../../components/admin/AdminHeader';

const TYPE_FILTERS = [
  { key: '', label: '전체' },
  { key: 'physical',  label: '신체의 이완' },
  { key: 'mental',    label: '정신적 고요' },
  { key: 'sensory',   label: '감각의 정화' },
  { key: 'emotional', label: '정서적 지지' },
  { key: 'social',    label: '사회적 휴식' },
  { key: 'nature',    label: '자연의 연결' },
  { key: 'creative',  label: '창조적 몰입' },
];

const TYPE_COLORS = {
  physical:  'bg-red-50 text-red-600 border border-red-200',
  mental:    'bg-emerald-50 text-emerald-600 border border-emerald-200',
  sensory:   'bg-amber-50 text-amber-600 border border-amber-200',
  emotional: 'bg-pink-50 text-pink-600 border border-pink-200',
  social:    'bg-purple-50 text-purple-600 border border-purple-200',
  nature:    'bg-teal-50 text-teal-600 border border-teal-200',
  creative:  'bg-orange-50 text-orange-600 border border-orange-200',
};

const PAGE_SIZE = 15;

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

  /* ── UI 전용 상태 ── */
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo,   setDateTo]   = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [page, setPage] = useState(1);

  /* 클라이언트 필터 (날짜 범위) */
  const filtered = [...dailyLogs].reverse().filter(row => {
    if (dateFrom && row.date < dateFrom) return false;
    if (dateTo   && row.date > dateTo)   return false;
    return true;
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated  = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const todayCount = dailyLogs.length > 0 ? (dailyLogs[dailyLogs.length - 1].count || 0) : 0;
  const totalCount = dashboard?.totalRestLogs ?? 0;
  const avgPerDay  = dailyLogs.length > 0
    ? (dailyLogs.reduce((s, r) => s + (r.count || 0), 0) / dailyLogs.length).toFixed(1)
    : '0';

  const clearFilters = () => { setDateFrom(''); setDateTo(''); setTypeFilter(''); setPage(1); };

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      <AdminSidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <AdminHeader title="휴식 기록 관리" subtitle="전체 사용자의 휴식 기록 현황입니다." />
        <main className="flex-1 overflow-y-auto p-6 space-y-5">

          {/* ── 요약 카드 ── */}
          <div className="grid grid-cols-4 gap-4">
            {[
              { icon: 'event_note', label: '전체 휴식 기록',  value: `${totalCount.toLocaleString()}건`, iconCls: 'bg-emerald-50 text-emerald-600' },
              { icon: 'today',      label: '오늘 기록',        value: `${todayCount}건`,                  iconCls: 'bg-blue-50 text-blue-600' },
              { icon: 'bar_chart',  label: '일평균 기록',      value: `${avgPerDay}건`,                   iconCls: 'bg-violet-50 text-violet-600' },
              { icon: 'date_range', label: '조회 기간',        value: `${dailyLogs.length}일`,            iconCls: 'bg-amber-50 text-amber-600' },
            ].map((card, i) => (
              <div key={i} className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 flex items-center gap-4">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${card.iconCls}`}>
                  <span className="material-icons text-[20px]">{card.icon}</span>
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900 leading-tight">{card.value}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{card.label}</p>
                </div>
              </div>
            ))}
          </div>

          {/* ── 테이블 카드 ── */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">

            {/* 필터 툴바 */}
            <div className="px-5 py-4 border-b border-gray-100 space-y-3">

              {/* 1행: 기간 + CSV */}
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <span className="material-icons text-gray-400 text-[18px]">date_range</span>
                  <span className="text-xs font-semibold text-gray-500">기간</span>
                  <input
                    type="date"
                    value={dateFrom}
                    onChange={e => { setDateFrom(e.target.value); setPage(1); }}
                    className="h-8 px-3 border border-gray-200 rounded-lg text-xs text-gray-700 bg-gray-50 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                  />
                  <span className="text-xs text-gray-400">~</span>
                  <input
                    type="date"
                    value={dateTo}
                    onChange={e => { setDateTo(e.target.value); setPage(1); }}
                    className="h-8 px-3 border border-gray-200 rounded-lg text-xs text-gray-700 bg-gray-50 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                  />
                  {(dateFrom || dateTo) && (
                    <button
                      onClick={clearFilters}
                      className="h-8 px-2.5 text-xs text-gray-400 hover:text-gray-700 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-1"
                    >
                      <span className="material-icons text-[14px]">close</span>
                      초기화
                    </button>
                  )}
                </div>
                <button
                  type="button"
                  disabled
                  title="CSV 내보내기 API 추후 지원 예정"
                  className="h-9 px-4 bg-gray-100 text-gray-400 text-sm font-semibold rounded-lg cursor-not-allowed flex items-center gap-1.5"
                >
                  <span className="material-icons text-[16px]">download</span>
                  CSV 내보내기
                </button>
              </div>

              {/* 2행: 유형 칩 필터 */}
              <div className="flex items-center gap-1.5 flex-wrap">
                {TYPE_FILTERS.map(t => (
                  <button
                    key={t.key}
                    onClick={() => { setTypeFilter(t.key); setPage(1); }}
                    className={`h-7 px-3 rounded-lg text-xs font-semibold border transition-all ${
                      typeFilter === t.key
                        ? 'bg-primary text-white border-primary'
                        : 'bg-white text-gray-500 border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            </div>

            {/* 건수 */}
            <div className="px-5 py-2 border-b border-gray-100 bg-gray-50/60">
              <p className="text-xs text-gray-400">
                총 <span className="font-semibold text-gray-600">{filtered.length}</span>일치 · 일별 집계 기준
                {typeFilter && (
                  <span className="ml-1.5 text-xs text-amber-600 bg-amber-50 border border-amber-200 px-1.5 py-0.5 rounded">
                    유형 필터는 개별 기록 API 연동 후 적용됩니다
                  </span>
                )}
              </p>
            </div>

            {/* 테이블 */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200">
                    <th className="px-5 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider w-12">#</th>
                    <th className="px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider w-40">사용자명</th>
                    <th className="px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider w-32">휴식 유형</th>
                    <th className="px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider w-32">기록일</th>
                    <th className="px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider w-20 text-center">기록 수</th>
                    <th className="px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">메모</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    [...Array(8)].map((_, i) => (
                      <tr key={i} className={`border-b border-gray-100 ${i % 2 === 1 ? 'bg-gray-50/60' : ''}`}>
                        <td className="px-5 py-3.5"><div className="w-6 h-3 bg-gray-200 rounded animate-pulse" /></td>
                        <td className="px-5 py-3.5"><div className="w-24 h-3 bg-gray-200 rounded animate-pulse" /></td>
                        <td className="px-5 py-3.5"><div className="w-20 h-5 bg-gray-200 rounded-full animate-pulse" /></td>
                        <td className="px-5 py-3.5"><div className="w-24 h-3 bg-gray-200 rounded animate-pulse" /></td>
                        <td className="px-5 py-3.5 text-center"><div className="w-10 h-3 bg-gray-200 rounded animate-pulse mx-auto" /></td>
                        <td className="px-5 py-3.5"><div className="w-48 h-3 bg-gray-100 rounded animate-pulse" /></td>
                      </tr>
                    ))
                  ) : paginated.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-16 text-center">
                        <div className="flex flex-col items-center gap-2 text-gray-300">
                          <span className="material-icons text-4xl">event_note</span>
                          <p className="text-sm text-gray-400">
                            {dateFrom || dateTo ? '해당 기간의 기록이 없습니다' : '휴식 기록이 없습니다'}
                          </p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    paginated.map((row, idx) => (
                      <tr
                        key={idx}
                        className={`border-b border-gray-100 hover:bg-primary/5 transition-colors ${idx % 2 === 1 ? 'bg-gray-50/50' : 'bg-white'}`}
                      >
                        {/* 번호 */}
                        <td className="px-5 py-3.5 text-xs text-gray-400 tabular-nums">
                          {(page - 1) * PAGE_SIZE + idx + 1}
                        </td>

                        {/* 사용자명 */}
                        <td className="px-5 py-3.5">
                          <span className="text-xs text-gray-400 italic">API 연동 예정</span>
                        </td>

                        {/* 유형 배지 */}
                        <td className="px-5 py-3.5">
                          <span className="text-xs text-gray-300">—</span>
                        </td>

                        {/* 기록일 */}
                        <td className="px-5 py-3.5">
                          <span className="text-sm font-medium text-gray-800">{row.date}</span>
                        </td>

                        {/* 기록 수 */}
                        <td className="px-5 py-3.5 text-center">
                          <span className="inline-flex items-center justify-center w-8 h-6 bg-primary/10 text-primary text-xs font-bold rounded-full">
                            {row.count}
                          </span>
                        </td>

                        {/* 메모 */}
                        <td className="px-5 py-3.5">
                          <span className="text-xs text-gray-300">—</span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* 하단: 안내 + 페이지네이션 */}
            {!loading && (
              <div className="px-5 py-3 border-t border-gray-100 flex items-center justify-between">
                <p className="text-xs text-gray-400">
                  * 사용자명·유형·메모 상세 조회는 개별 기록 API 연동 후 표시됩니다. 현재는 일별 집계 데이터입니다.
                </p>

                {/* 페이지네이션 */}
                {totalPages > 1 && (
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={() => setPage(p => Math.max(1, p - 1))}
                      disabled={page === 1}
                      className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                    >
                      <span className="material-icons text-[16px]">chevron_left</span>
                    </button>
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      const start = Math.max(1, Math.min(page - 2, totalPages - 4));
                      const p = start + i;
                      return p <= totalPages ? (
                        <button
                          key={p}
                          onClick={() => setPage(p)}
                          className={`w-8 h-8 flex items-center justify-center rounded-lg text-xs font-semibold border transition-all ${
                            page === p
                              ? 'bg-primary text-white border-primary'
                              : 'border-gray-200 text-gray-500 hover:bg-gray-50'
                          }`}
                        >
                          {p}
                        </button>
                      ) : null;
                    })}
                    <button
                      onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                      disabled={page === totalPages}
                      className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                    >
                      <span className="material-icons text-[16px]">chevron_right</span>
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

        </main>
      </div>
    </div>
  );
}

export default AdminRecords;
