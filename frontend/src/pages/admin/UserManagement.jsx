import { useState, useEffect, useCallback } from 'react';
import { fetchWithAuth } from '../../api/fetchWithAuth';
import AdminSidebar from '../../components/admin/AdminSidebar';
import AdminHeader from '../../components/admin/AdminHeader';

const STATUS_STYLES = {
  active:  { label: '활성', style: 'bg-green-50 text-green-600 border border-green-200' },
  dormant: { label: '휴면', style: 'bg-gray-100 text-gray-500 border border-gray-200' },
  banned:  { label: '제한', style: 'bg-red-50 text-red-500 border border-red-200' },
};

const STATUS_FILTERS = [
  { value: '',        label: '전체' },
  { value: 'active',  label: '활성' },
  { value: 'dormant', label: '휴면' },
  { value: 'banned',  label: '제한' },
];

function UserManagement() {
  const [users, setUsers] = useState([]);
  const [keyword, setKeyword] = useState('');
  const [inputKeyword, setInputKeyword] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  // 금칙어
  const [blockedKeywords, setBlockedKeywords] = useState([]);
  const [newKeyword, setNewKeyword] = useState('');
  const [kwLoading, setKwLoading] = useState(false);

  const loadUsers = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page, size: 20 });
      if (keyword) params.set('keyword', keyword);
      if (statusFilter) params.set('status', statusFilter);

      const data = await fetchWithAuth(`/api/admin/users?${params}`);
      if (data.success && data.data) {
        setUsers(data.data.users || []);
        setTotal(data.data.total || 0);
        setTotalPages(data.data.totalPages || 1);
      }
    } catch {
      // 무시
    } finally {
      setLoading(false);
    }
  }, [page, keyword, statusFilter]);

  useEffect(() => { loadUsers(); }, [loadUsers]);

  const loadKeywords = useCallback(async () => {
    const data = await fetchWithAuth('/api/admin/keywords');
    if (data.success) setBlockedKeywords(data.data || []);
  }, []);

  useEffect(() => { loadKeywords(); }, [loadKeywords]);

  const handleAddKeyword = async (e) => {
    e.preventDefault();
    if (!newKeyword.trim()) return;
    setKwLoading(true);
    await fetchWithAuth('/api/admin/keywords', {
      method: 'POST',
      body: JSON.stringify({ keyword: newKeyword.trim() }),
    });
    setNewKeyword('');
    await loadKeywords();
    setKwLoading(false);
  };

  const handleDeleteKeyword = async (id) => {
    await fetchWithAuth(`/api/admin/keywords/${id}`, { method: 'DELETE' });
    setBlockedKeywords(prev => prev.filter(k => k.id !== id));
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setKeyword(inputKeyword);
    setPage(1);
  };

  const handleStatusChange = async (쉼표번호, newStatus) => {
    const label = STATUS_STYLES[newStatus]?.label || newStatus;
    if (!window.confirm(`사용자 상태를 '${label}'(으)로 변경할까요?`)) return;
    try {
      await fetchWithAuth(`/api/admin/users/${쉼표번호}/status`, {
        method: 'PUT',
        body: JSON.stringify({ status: newStatus }),
      });
      setUsers((prev) => prev.map((u) => (u.쉼표번호 === 쉼표번호 ? { ...u, status: newStatus } : u)));
    } catch {
      // 무시
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleDateString('ko-KR');
  };

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      <AdminSidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <AdminHeader title="사용자 관리" subtitle="전체 회원 현황 및 관리" />
        <main className="flex-1 overflow-y-auto p-6 space-y-5">

          {/* ── 요약 카드 ── */}
          <div className="grid grid-cols-4 gap-4">
            {[
              { label: '전체 회원',    value: total.toLocaleString(),                          icon: 'people',   iconCls: 'bg-primary/10 text-primary' },
              { label: '활성 사용자', value: users.filter(u => u.status === 'active').length,  icon: 'verified', iconCls: 'bg-green-50 text-green-600' },
              { label: '휴면',         value: users.filter(u => u.status === 'dormant').length, icon: 'hotel',    iconCls: 'bg-gray-100 text-gray-500' },
              { label: '제한',         value: users.filter(u => u.status === 'banned').length,  icon: 'block',    iconCls: 'bg-red-50 text-red-500' },
            ].map((s, i) => (
              <div key={i} className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 flex items-center gap-4">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${s.iconCls}`}>
                  <span className="material-icons-round text-[20px]">{s.icon}</span>
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900 leading-tight">{s.value}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{s.label}</p>
                </div>
              </div>
            ))}
          </div>

          {/* ── 검색 + 필터 + 테이블 ── */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">

            {/* 검색 바 */}
            <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-3">
              <form onSubmit={handleSearch} className="flex-1 flex gap-2">
                <div className="relative flex-1">
                  <span className="material-icons absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xl">search</span>
                  <input
                    className="w-full pl-10 pr-4 h-10 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-700 placeholder:text-gray-400 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                    placeholder="이름, 이메일, 쉼표번호로 검색"
                    value={inputKeyword}
                    onChange={(e) => setInputKeyword(e.target.value)}
                  />
                </div>
                <button
                  type="submit"
                  className="h-10 px-4 bg-primary hover:bg-primary/90 text-white text-sm font-bold rounded-lg transition-colors"
                >
                  검색
                </button>
              </form>

              {/* 상태 칩 필터 */}
              <div className="flex items-center gap-1.5 shrink-0">
                {STATUS_FILTERS.map(({ value, label }) => (
                  <button
                    key={value}
                    onClick={() => { setStatusFilter(value); setPage(1); }}
                    className={`h-8 px-3 rounded-lg text-xs font-semibold border transition-all ${
                      statusFilter === value
                        ? 'bg-primary text-white border-primary shadow-sm'
                        : 'bg-white text-gray-500 border-gray-200 hover:border-gray-300 hover:text-gray-700'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {/* ── 테이블 / skeleton ── */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200">
                    <th className="px-5 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider w-12">#</th>
                    <th className="px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">사용자</th>
                    <th className="px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">쉼표번호</th>
                    <th className="px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">상태</th>
                    <th className="px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">가입일</th>
                    <th className="px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">관리</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    /* skeleton rows */
                    [...Array(8)].map((_, i) => (
                      <tr key={i} className={`border-b border-gray-100 ${i % 2 === 1 ? 'bg-gray-50/60' : ''}`}>
                        <td className="px-5 py-3.5"><div className="w-6 h-3 bg-gray-200 rounded animate-pulse" /></td>
                        <td className="px-5 py-3.5">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-full bg-gray-200 animate-pulse shrink-0" />
                            <div className="space-y-1.5">
                              <div className="w-24 h-3 bg-gray-200 rounded animate-pulse" />
                              <div className="w-36 h-2.5 bg-gray-100 rounded animate-pulse" />
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-3.5"><div className="w-20 h-3 bg-gray-200 rounded animate-pulse" /></td>
                        <td className="px-5 py-3.5"><div className="w-12 h-5 bg-gray-200 rounded-full animate-pulse" /></td>
                        <td className="px-5 py-3.5"><div className="w-20 h-3 bg-gray-200 rounded animate-pulse" /></td>
                        <td className="px-5 py-3.5 text-right">
                          <div className="flex justify-end gap-1.5">
                            <div className="w-12 h-6 bg-gray-200 rounded-lg animate-pulse" />
                            <div className="w-12 h-6 bg-gray-200 rounded-lg animate-pulse" />
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : users.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-16 text-center">
                        <div className="flex flex-col items-center gap-2 text-gray-300">
                          <span className="material-icons text-4xl">manage_search</span>
                          <p className="text-sm text-gray-400">검색 결과가 없습니다</p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    users.map((user, idx) => {
                      const statusInfo = STATUS_STYLES[user.status] || { label: user.status, style: 'bg-gray-100 text-gray-500 border border-gray-200' };
                      const rowNum = (page - 1) * 20 + idx + 1;
                      return (
                        <tr
                          key={user.쉼표번호}
                          className={`border-b border-gray-100 hover:bg-primary/5 transition-colors ${idx % 2 === 1 ? 'bg-gray-50/50' : 'bg-white'}`}
                        >
                          <td className="px-5 py-3.5 text-xs text-gray-400 tabular-nums">{rowNum}</td>
                          <td className="px-5 py-3.5">
                            <div className="flex items-center gap-3">
                              <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0">
                                <span className="material-icons-round text-lg">person</span>
                              </div>
                              <div>
                                <p className="font-semibold text-gray-900">{user.nickname || '-'}</p>
                                <p className="text-xs text-gray-400">{user.email}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-5 py-3.5 font-mono text-xs text-gray-500">{user.쉼표번호}</td>
                          <td className="px-5 py-3.5">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold ${statusInfo.style}`}>
                              {statusInfo.label}
                            </span>
                          </td>
                          <td className="px-5 py-3.5 text-xs text-gray-500">{formatDate(user.createdAt)}</td>
                          <td className="px-5 py-3.5 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              {user.status !== 'active' && (
                                <button
                                  onClick={() => handleStatusChange(user.쉼표번호, 'active')}
                                  className="px-2.5 py-1 text-[11px] font-bold text-green-600 border border-green-200 rounded-lg hover:bg-green-50 transition-colors"
                                >
                                  활성화
                                </button>
                              )}
                              {user.status !== 'banned' && (
                                <button
                                  onClick={() => handleStatusChange(user.쉼표번호, 'banned')}
                                  className="px-2.5 py-1 text-[11px] font-bold text-red-500 border border-red-200 rounded-lg hover:bg-red-50 transition-colors"
                                >
                                  제한
                                </button>
                              )}
                              {user.status !== 'dormant' && (
                                <button
                                  onClick={() => handleStatusChange(user.쉼표번호, 'dormant')}
                                  className="px-2.5 py-1 text-[11px] font-bold text-gray-500 border border-gray-200 rounded-lg hover:bg-gray-100 transition-colors"
                                >
                                  휴면
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
            <div className="px-5 py-3.5 border-t border-gray-100 flex items-center justify-between">
              <p className="text-xs text-gray-400">
                전체 <span className="font-semibold text-gray-600">{total.toLocaleString()}</span>명 중{' '}
                {(page - 1) * 20 + 1}–{Math.min(page * 20, total)} 표시
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
                        p === page
                          ? 'bg-primary text-white shadow-sm'
                          : 'text-gray-500 hover:bg-gray-100'
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
          </div>

          {/* ── 금칙어 관리 ── */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-2">
              <span className="material-icons-round text-red-400 text-xl">block</span>
              <div>
                <p className="text-sm font-bold text-gray-800">금칙어 관리</p>
                <p className="text-xs text-gray-400 mt-0.5">등록된 키워드가 포함된 게시글·댓글은 자동으로 숨김 처리돼요</p>
              </div>
            </div>

            <div className="p-5">
              {/* 추가 폼 */}
              <form onSubmit={handleAddKeyword} className="flex gap-2 mb-4">
                <input
                  className="flex-1 h-10 px-4 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-700 placeholder:text-gray-400 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                  placeholder="추가할 금칙어 입력"
                  value={newKeyword}
                  onChange={e => setNewKeyword(e.target.value)}
                  maxLength={50}
                />
                <button
                  type="submit"
                  disabled={kwLoading || !newKeyword.trim()}
                  className="h-10 px-4 bg-primary hover:bg-primary/90 text-white text-sm font-bold rounded-lg transition-colors disabled:opacity-50"
                >
                  추가
                </button>
              </form>

              {/* 금칙어 목록 */}
              {blockedKeywords.length === 0 ? (
                <p className="text-sm text-gray-400 text-center py-4">등록된 금칙어가 없어요</p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {blockedKeywords.map(kw => (
                    <span
                      key={kw.id}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-red-50 border border-red-100 rounded-full text-sm text-red-600 font-medium"
                    >
                      {kw.keyword}
                      <button
                        onClick={() => handleDeleteKeyword(kw.id)}
                        className="text-red-300 hover:text-red-500 transition-colors ml-0.5"
                      >
                        <span className="material-icons-round text-sm leading-none">close</span>
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>

        </main>
      </div>
    </div>
  );
}

export default UserManagement;
