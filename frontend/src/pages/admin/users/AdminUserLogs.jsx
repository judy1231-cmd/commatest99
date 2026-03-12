import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { fetchWithAuth } from '../../../api/fetchWithAuth';
import AdminSidebar from '../../../components/admin/AdminSidebar';
import AdminHeader from '../../../components/admin/AdminHeader';

/* 로그 타입 칩 목록 */
const LOG_TYPES = [
  { value: '',        label: '전체' },
  { value: 'USER',    label: '사용자' },
  { value: 'PLACE',   label: '장소' },
  { value: 'CONTENT', label: '콘텐츠' },
  { value: 'SYSTEM',  label: '시스템' },
];

const PAGE_SIZE = 15;

function AdminUserLogs() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  /* ── UI 전용 필터 상태 (fetch 로직 미변경) ── */
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo]     = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [page, setPage] = useState(1);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const data = await fetchWithAuth('/api/admin/audit-logs?page=1&size=100');
        if (data.success && data.data) {
          const filtered = (data.data.logs || []).filter(l =>
            String(l.targetId || '').includes(id) || String(l.admin쉼표번호 || '').includes(id)
          );
          setLogs(filtered);
        }
      } catch { } finally { setLoading(false); }
    })();
  }, [id]);

  /* ── 클라이언트 사이드 필터 ── */
  const filtered = logs.filter(log => {
    if (typeFilter && (log.targetType || '').toUpperCase() !== typeFilter) return false;
    if (dateFrom) {
      const logDate = log.createdAt ? new Date(log.createdAt) : null;
      if (!logDate || logDate < new Date(dateFrom)) return false;
    }
    if (dateTo) {
      const logDate = log.createdAt ? new Date(log.createdAt) : null;
      const toEnd = new Date(dateTo); toEnd.setHours(23, 59, 59);
      if (!logDate || logDate > toEnd) return false;
    }
    return true;
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated  = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const handleTypeFilter = (val) => { setTypeFilter(val); setPage(1); };
  const handleDateFrom   = (val) => { setDateFrom(val);   setPage(1); };
  const handleDateTo     = (val) => { setDateTo(val);     setPage(1); };

  const formatDate = (str) => {
    if (!str) return '-';
    const d = new Date(str);
    return { date: d.toLocaleDateString('ko-KR'), time: d.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' }) };
  };

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      <AdminSidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <AdminHeader title="사용자 활동 로그" subtitle={`대상: ${id}`} />
        <main className="flex-1 overflow-y-auto p-6 space-y-5">

          {/* ── 뒤로가기 ── */}
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900 transition-colors group"
          >
            <span className="material-icons text-[18px] group-hover:-translate-x-0.5 transition-transform">arrow_back</span>
            돌아가기
          </button>

          {/* ── 필터 바 ── */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm px-5 py-4 space-y-3">

            {/* 날짜 범위 */}
            <div className="flex items-center gap-3">
              <span className="material-icons text-gray-400 text-[18px]">date_range</span>
              <div className="flex items-center gap-2">
                <input
                  type="date"
                  value={dateFrom}
                  onChange={(e) => handleDateFrom(e.target.value)}
                  className="h-9 px-3 border border-gray-200 rounded-lg text-sm text-gray-600 bg-gray-50 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                />
                <span className="text-gray-400 text-sm">–</span>
                <input
                  type="date"
                  value={dateTo}
                  onChange={(e) => handleDateTo(e.target.value)}
                  className="h-9 px-3 border border-gray-200 rounded-lg text-sm text-gray-600 bg-gray-50 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                />
              </div>
              {(dateFrom || dateTo) && (
                <button
                  onClick={() => { handleDateFrom(''); handleDateTo(''); }}
                  className="text-xs text-gray-400 hover:text-gray-600 flex items-center gap-0.5"
                >
                  <span className="material-icons text-sm">close</span>초기화
                </button>
              )}
            </div>

            {/* 로그 타입 칩 */}
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider mr-1">타입</span>
              {LOG_TYPES.map(({ value, label }) => (
                <button
                  key={value}
                  onClick={() => handleTypeFilter(value)}
                  className={`h-7 px-3 rounded-lg text-xs font-semibold border transition-all ${
                    typeFilter === value
                      ? 'bg-primary text-white border-primary'
                      : 'bg-white text-gray-500 border-gray-200 hover:border-gray-300 hover:text-gray-700'
                  }`}
                >
                  {label}
                </button>
              ))}
              <span className="ml-auto text-xs text-gray-400">
                총 <span className="font-semibold text-gray-600">{filtered.length}</span>건
              </span>
            </div>
          </div>

          {/* ── 테이블 ── */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200">
                    <th className="px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider w-36">시간</th>
                    <th className="px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">활동</th>
                    <th className="px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider w-32">관리자</th>
                    <th className="px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">상세</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    /* skeleton rows */
                    [...Array(8)].map((_, i) => (
                      <tr key={i} className={`border-b border-gray-100 ${i % 2 === 1 ? 'bg-gray-50/60' : ''}`}>
                        <td className="px-5 py-3.5">
                          <div className="space-y-1">
                            <div className="w-16 h-2.5 bg-gray-200 rounded animate-pulse" />
                            <div className="w-12 h-2 bg-gray-100 rounded animate-pulse" />
                          </div>
                        </td>
                        <td className="px-5 py-3.5"><div className="w-28 h-3 bg-gray-200 rounded animate-pulse" /></td>
                        <td className="px-5 py-3.5"><div className="w-20 h-3 bg-gray-200 rounded animate-pulse" /></td>
                        <td className="px-5 py-3.5"><div className="w-40 h-3 bg-gray-100 rounded animate-pulse" /></td>
                      </tr>
                    ))
                  ) : paginated.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="py-16 text-center">
                        <div className="flex flex-col items-center gap-2 text-gray-300">
                          <span className="material-icons text-4xl">history</span>
                          <p className="text-sm text-gray-400">
                            {filtered.length === 0 && logs.length > 0
                              ? '필터 조건에 맞는 로그가 없습니다'
                              : '관련 활동 로그가 없습니다'}
                          </p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    paginated.map((log, idx) => {
                      const dt = formatDate(log.createdAt);
                      return (
                        <tr
                          key={log.id}
                          className={`border-b border-gray-100 hover:bg-primary/5 transition-colors ${idx % 2 === 1 ? 'bg-gray-50/50' : 'bg-white'}`}
                        >
                          {/* 시간: 연한 색, 작게 */}
                          <td className="px-5 py-3.5">
                            <p className="text-xs text-gray-400 tabular-nums">{dt.date}</p>
                            <p className="text-[11px] text-gray-300 tabular-nums mt-0.5">{dt.time}</p>
                          </td>
                          {/* 활동 */}
                          <td className="px-5 py-3.5">
                            <span className="inline-flex items-center gap-1.5">
                              <span className="material-icons text-sm text-gray-400">radio_button_checked</span>
                              <span className="font-medium text-gray-800">{log.action || '-'}</span>
                            </span>
                          </td>
                          {/* 관리자 */}
                          <td className="px-5 py-3.5 font-mono text-xs text-gray-500">
                            {log.admin쉼표번호 || '-'}
                          </td>
                          {/* 상세 */}
                          <td className="px-5 py-3.5 text-gray-500 text-xs">
                            {log.targetType && (
                              <span className="inline-flex items-center px-2 py-0.5 rounded bg-gray-100 text-gray-600 font-medium mr-2">
                                {log.targetType}
                              </span>
                            )}
                            {log.targetId ? `ID: ${log.targetId}` : '-'}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* ── 페이지네이션 ── */}
            {!loading && filtered.length > PAGE_SIZE && (
              <div className="px-5 py-3.5 border-t border-gray-100 flex items-center justify-between">
                <p className="text-xs text-gray-400">
                  {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, filtered.length)} / {filtered.length}건
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

export default AdminUserLogs;
