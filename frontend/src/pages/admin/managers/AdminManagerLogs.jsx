import { useState, useEffect, useCallback } from 'react';
import { fetchWithAuth } from '../../../api/fetchWithAuth';
import AdminSidebar from '../../../components/admin/AdminSidebar';
import AdminHeader from '../../../components/admin/AdminHeader';

const ACTION_BADGE = {
  CREATE: { label: '생성', cls: 'bg-emerald-50 text-emerald-700 border border-emerald-200', icon: 'add_circle' },
  UPDATE: { label: '수정', cls: 'bg-blue-50 text-blue-600 border border-blue-200',         icon: 'edit'        },
  DELETE: { label: '삭제', cls: 'bg-red-50 text-red-600 border border-red-200',            icon: 'delete'      },
  READ:   { label: '조회', cls: 'bg-gray-100 text-gray-500 border border-gray-200',        icon: 'visibility'  },
  LOGIN:  { label: '로그인', cls: 'bg-amber-50 text-amber-600 border border-amber-200',    icon: 'login'       },
};

const TARGET_TYPE_LABEL = {
  user:     '사용자',
  place:    '장소',
  content:  '콘텐츠',
  question: '설문문항',
  activity: '활동',
  log:      '기록',
  system:   '시스템',
};

const ACTION_FILTERS = [
  { key: '', label: '전체' },
  { key: 'CREATE', label: '생성' },
  { key: 'UPDATE', label: '수정' },
  { key: 'DELETE', label: '삭제' },
  { key: 'READ',   label: '조회' },
];

function AdminManagerLogs() {
  const [logs, setLogs] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);

  const loadLogs = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchWithAuth(`/api/admin/audit-logs?page=${page}&size=20`);
      if (data.success && data.data) {
        setLogs(data.data.logs || []);
        setTotalPages(data.data.totalPages || 1);
      }
    } catch { } finally { setLoading(false); }
  }, [page]);

  useEffect(() => { loadLogs(); }, [loadLogs]);

  /* ── UI 전용 상태 ── */
  const [dateFrom,     setDateFrom]     = useState('');
  const [dateTo,       setDateTo]       = useState('');
  const [adminFilter,  setAdminFilter]  = useState('');
  const [actionFilter, setActionFilter] = useState('');

  const filtered = logs.filter(log => {
    if (actionFilter) {
      const logAction = (log.action || '').toUpperCase();
      if (!logAction.includes(actionFilter)) return false;
    }
    if (adminFilter) {
      const q = adminFilter.toLowerCase();
      if (!(log.admin쉼표번호 || '').toLowerCase().includes(q)) return false;
    }
    if (dateFrom || dateTo) {
      const d = log.createdAt ? log.createdAt.slice(0, 10) : '';
      if (dateFrom && d < dateFrom) return false;
      if (dateTo   && d > dateTo)   return false;
    }
    return true;
  });

  const clearFilters = () => {
    setDateFrom(''); setDateTo(''); setAdminFilter(''); setActionFilter('');
  };
  const hasFilter = dateFrom || dateTo || adminFilter || actionFilter;

  const formatDate = (str) => {
    if (!str) return { date: '—', time: '' };
    const d = new Date(str);
    return {
      date: d.toLocaleDateString('ko-KR', { month: '2-digit', day: '2-digit' }),
      time: d.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
    };
  };

  const getActionBadge = (action) => {
    if (!action) return ACTION_BADGE.READ;
    const upper = action.toUpperCase();
    for (const key of Object.keys(ACTION_BADGE)) {
      if (upper.includes(key)) return ACTION_BADGE[key];
    }
    return { label: action, cls: 'bg-gray-100 text-gray-500 border border-gray-200', icon: 'info' };
  };

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      <AdminSidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <AdminHeader title="관리자 활동 로그" subtitle="관리자 계정의 모든 활동 내역입니다." />
        <main className="flex-1 overflow-y-auto p-6 space-y-5">

          {/* ── 테이블 카드 ── */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">

            {/* 필터 툴바 */}
            <div className="px-5 py-4 border-b border-gray-100 space-y-3">

              {/* 1행: 기간 + 관리자 검색 + 초기화 */}
              <div className="flex items-center gap-3 flex-wrap">
                <div className="flex items-center gap-2">
                  <span className="material-icons text-gray-400 text-[18px]">date_range</span>
                  <span className="text-xs font-semibold text-gray-500">기간</span>
                  <input
                    type="date"
                    value={dateFrom}
                    onChange={e => setDateFrom(e.target.value)}
                    className="h-8 px-3 border border-gray-200 rounded-lg text-xs text-gray-700 bg-gray-50 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                  />
                  <span className="text-xs text-gray-400">~</span>
                  <input
                    type="date"
                    value={dateTo}
                    onChange={e => setDateTo(e.target.value)}
                    className="h-8 px-3 border border-gray-200 rounded-lg text-xs text-gray-700 bg-gray-50 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                  />
                </div>

                <div className="relative">
                  <span className="material-icons absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 text-[15px]">manage_accounts</span>
                  <input
                    value={adminFilter}
                    onChange={e => setAdminFilter(e.target.value)}
                    placeholder="관리자 쉼표번호"
                    className="h-8 pl-8 pr-3 w-40 border border-gray-200 rounded-lg text-xs text-gray-700 placeholder:text-gray-400 bg-gray-50 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                  />
                </div>

                {hasFilter && (
                  <button
                    onClick={clearFilters}
                    className="h-8 px-2.5 text-xs text-gray-400 hover:text-gray-700 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-1"
                  >
                    <span className="material-icons text-[14px]">close</span>
                    초기화
                  </button>
                )}
              </div>

              {/* 2행: 액션 유형 칩 */}
              <div className="flex items-center gap-1.5">
                {ACTION_FILTERS.map(f => (
                  <button
                    key={f.key}
                    onClick={() => setActionFilter(f.key)}
                    className={`h-7 px-3 rounded-lg text-xs font-semibold border transition-all ${
                      actionFilter === f.key
                        ? 'bg-primary text-white border-primary'
                        : 'bg-white text-gray-500 border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </div>

            {/* 건수 */}
            <div className="px-5 py-2 border-b border-gray-100 bg-gray-50/60">
              <p className="text-xs text-gray-400">
                {loading ? '로딩 중...' : (
                  <>
                    표시 <span className="font-semibold text-gray-600">{filtered.length}</span>건
                    {hasFilter && (
                      <span className="ml-1 text-primary font-medium">· 필터 적용 중</span>
                    )}
                  </>
                )}
              </p>
            </div>

            {/* 테이블 */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200">
                    <th className="px-5 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider w-32">시간</th>
                    <th className="px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider w-36">관리자</th>
                    <th className="px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider w-28">액션 유형</th>
                    <th className="px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">대상</th>
                    <th className="px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider w-32">IP</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    [...Array(8)].map((_, i) => (
                      <tr key={i} className={`border-b border-gray-100 ${i % 2 === 1 ? 'bg-gray-50/60' : ''}`}>
                        <td className="px-5 py-3.5">
                          <div className="space-y-1.5">
                            <div className="w-14 h-2.5 bg-gray-200 rounded animate-pulse" />
                            <div className="w-20 h-2 bg-gray-100 rounded animate-pulse" />
                          </div>
                        </td>
                        <td className="px-5 py-3.5"><div className="w-24 h-3 bg-gray-200 rounded animate-pulse" /></td>
                        <td className="px-5 py-3.5"><div className="w-16 h-5 bg-gray-200 rounded-full animate-pulse" /></td>
                        <td className="px-5 py-3.5">
                          <div className="space-y-1.5">
                            <div className="w-16 h-3 bg-gray-200 rounded animate-pulse" />
                            <div className="w-28 h-2.5 bg-gray-100 rounded animate-pulse" />
                          </div>
                        </td>
                        <td className="px-5 py-3.5"><div className="w-24 h-3 bg-gray-100 rounded animate-pulse" /></td>
                      </tr>
                    ))
                  ) : filtered.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-16 text-center">
                        <div className="flex flex-col items-center gap-2 text-gray-300">
                          <span className="material-icons text-4xl">history</span>
                          <p className="text-sm text-gray-400">
                            {hasFilter ? '조건에 맞는 로그가 없습니다' : '활동 로그가 없습니다'}
                          </p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    filtered.map((log, idx) => {
                      const { date, time } = formatDate(log.createdAt);
                      const actionBadge = getActionBadge(log.action);
                      const targetType  = TARGET_TYPE_LABEL[(log.targetType || '').toLowerCase()] || log.targetType || '—';

                      return (
                        <tr
                          key={log.id}
                          className={`border-b border-gray-100 hover:bg-primary/5 transition-colors ${idx % 2 === 1 ? 'bg-gray-50/50' : 'bg-white'}`}
                        >
                          {/* 시간 */}
                          <td className="px-5 py-3.5">
                            <p className="text-xs font-semibold text-gray-700 tabular-nums">{date}</p>
                            <p className="text-[11px] text-gray-400 mt-0.5 tabular-nums">{time}</p>
                          </td>

                          {/* 관리자 */}
                          <td className="px-5 py-3.5">
                            <span className="text-xs font-mono text-gray-700 bg-gray-100 px-2 py-0.5 rounded">
                              {log.admin쉼표번호 || '—'}
                            </span>
                          </td>

                          {/* 액션 유형 배지 */}
                          <td className="px-5 py-3.5">
                            <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold ${actionBadge.cls}`}>
                              <span className="material-icons text-[11px]">{actionBadge.icon}</span>
                              {actionBadge.label}
                            </span>
                          </td>

                          {/* 대상 */}
                          <td className="px-5 py-3.5">
                            <p className="text-xs font-semibold text-gray-700">{targetType}</p>
                            {log.targetId && (
                              <p className="text-[11px] text-gray-400 font-mono mt-0.5">ID: {log.targetId}</p>
                            )}
                          </td>

                          {/* IP */}
                          <td className="px-5 py-3.5">
                            <span className="text-xs text-gray-400 italic">IP 미지원</span>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* 페이지네이션 */}
            {!loading && totalPages > 1 && (
              <div className="px-5 py-3 border-t border-gray-100 flex items-center justify-between">
                <p className="text-xs text-gray-400">
                  페이지 <span className="font-semibold text-gray-600">{page}</span> / {totalPages}
                </p>
                <div className="flex items-center gap-1">
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
              </div>
            )}

            {!loading && (
              <div className="px-5 py-3 border-t border-gray-100">
                <p className="text-xs text-gray-400">* IP 주소 기록은 audit_logs 테이블 컬럼 추가 후 지원됩니다.</p>
              </div>
            )}
          </div>

        </main>
      </div>
    </div>
  );
}

export default AdminManagerLogs;
