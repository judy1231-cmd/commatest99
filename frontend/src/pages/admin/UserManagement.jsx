import { useState, useEffect, useCallback } from 'react';
import { fetchWithAuth } from '../../api/fetchWithAuth';
import AdminSidebar from '../../components/admin/AdminSidebar';
import AdminHeader from '../../components/admin/AdminHeader';

const STATUS_STYLES = {
  active:  { label: '활성', style: 'bg-green-50 text-green-600' },
  dormant: { label: '휴면', style: 'bg-gray-100 text-gray-500' },
  banned:  { label: '제한', style: 'bg-red-50 text-red-500' },
};

function UserManagement() {
  const [users, setUsers] = useState([]);
  const [keyword, setKeyword] = useState('');
  const [inputKeyword, setInputKeyword] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

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
    <div className="flex h-screen overflow-hidden bg-background-light">
      <AdminSidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <AdminHeader title="사용자 관리" subtitle="전체 회원 현황 및 관리" />
        <main className="flex-1 overflow-y-auto p-6">

          {/* Summary */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            {[
              { label: '전체 회원', value: total.toLocaleString(), icon: 'people', color: 'text-primary' },
              { label: '활성 사용자', value: users.filter(u => u.status === 'active').length, icon: 'verified', color: 'text-green-500' },
              { label: '휴면', value: users.filter(u => u.status === 'dormant').length, icon: 'hotel', color: 'text-gray-400' },
              { label: '제한', value: users.filter(u => u.status === 'banned').length, icon: 'block', color: 'text-red-400' },
            ].map((s, i) => (
              <div key={i} className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm">
                <span className={`material-icons-round ${s.color} text-2xl`}>{s.icon}</span>
                <p className="text-2xl font-bold text-gray-900 mt-1">{s.value}</p>
                <p className="text-xs text-gray-500">{s.label}</p>
              </div>
            ))}
          </div>

          {/* Search & Filter */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-gray-100 flex flex-col md:flex-row items-start md:items-center gap-3">
              <form onSubmit={handleSearch} className="flex-1 flex gap-2">
                <div className="relative flex-1">
                  <span className="material-icons absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xl">search</span>
                  <input
                    className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                    placeholder="이름, 이메일, 쉼표번호로 검색"
                    value={inputKeyword}
                    onChange={(e) => setInputKeyword(e.target.value)}
                  />
                </div>
                <button type="submit" className="px-4 py-2.5 bg-primary text-white text-sm font-bold rounded-lg hover:bg-primary/90 transition-all">
                  검색
                </button>
              </form>
              <select
                value={statusFilter}
                onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
                className="px-3 py-2.5 border border-gray-200 bg-gray-50 rounded-lg text-sm text-gray-600 focus:ring-primary outline-none"
              >
                <option value="">전체 상태</option>
                <option value="active">활성</option>
                <option value="dormant">휴면</option>
                <option value="banned">제한</option>
              </select>
            </div>

            {/* Table */}
            {loading ? (
              <div className="flex justify-center items-center h-40">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-gray-50 text-gray-500 text-xs font-semibold uppercase">
                    <tr>
                      <th className="px-6 py-3">사용자</th>
                      <th className="px-6 py-3">쉼표번호</th>
                      <th className="px-6 py-3">상태</th>
                      <th className="px-6 py-3">가입일</th>
                      <th className="px-6 py-3 text-right">관리</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 text-sm">
                    {users.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="px-6 py-12 text-center text-gray-400">검색 결과가 없어요</td>
                      </tr>
                    ) : users.map((user) => {
                      const statusInfo = STATUS_STYLES[user.status] || { label: user.status, style: 'bg-gray-100 text-gray-500' };
                      return (
                        <tr key={user.쉼표번호} className="hover:bg-gray-50 transition-colors">
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="w-9 h-9 rounded-full bg-primary/20 flex items-center justify-center text-primary shrink-0">
                                <span className="material-icons-round text-lg">person</span>
                              </div>
                              <div>
                                <p className="font-semibold text-gray-900">{user.nickname || '-'}</p>
                                <p className="text-xs text-gray-400">{user.email}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-gray-500 font-mono text-xs">{user.쉼표번호}</td>
                          <td className="px-6 py-4">
                            <span className={`px-2 py-1 rounded-full text-[11px] font-bold ${statusInfo.style}`}>
                              {statusInfo.label}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-gray-500">{formatDate(user.createdAt)}</td>
                          <td className="px-6 py-4 text-right">
                            <div className="flex items-center justify-end gap-1">
                              {user.status !== 'active' && (
                                <button onClick={() => handleStatusChange(user.쉼표번호, 'active')} className="px-2 py-1 text-[11px] font-bold text-green-600 border border-green-200 rounded-lg hover:bg-green-50 transition-all">활성화</button>
                              )}
                              {user.status !== 'banned' && (
                                <button onClick={() => handleStatusChange(user.쉼표번호, 'banned')} className="px-2 py-1 text-[11px] font-bold text-red-500 border border-red-200 rounded-lg hover:bg-red-50 transition-all">제한</button>
                              )}
                              {user.status !== 'dormant' && (
                                <button onClick={() => handleStatusChange(user.쉼표번호, 'dormant')} className="px-2 py-1 text-[11px] font-bold text-gray-500 border border-gray-200 rounded-lg hover:bg-gray-50 transition-all">휴면</button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}

            {/* Pagination */}
            <div className="p-4 border-t border-gray-100 flex items-center justify-between">
              <p className="text-sm text-gray-500">전체 {total.toLocaleString()}명 중 {(page - 1) * 20 + 1}–{Math.min(page * 20, total)} 표시</p>
              <div className="flex gap-1">
                <button disabled={page === 1} onClick={() => setPage(page - 1)} className="w-8 h-8 rounded-lg text-sm font-medium hover:bg-gray-100 text-gray-500 disabled:opacity-30">‹</button>
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  const p = Math.max(1, page - 2) + i;
                  if (p > totalPages) return null;
                  return (
                    <button key={p} onClick={() => setPage(p)} className={`w-8 h-8 rounded-lg text-sm font-medium transition-all ${p === page ? 'bg-primary text-white' : 'hover:bg-gray-100 text-gray-500'}`}>{p}</button>
                  );
                })}
                <button disabled={page === totalPages} onClick={() => setPage(page + 1)} className="w-8 h-8 rounded-lg text-sm font-medium hover:bg-gray-100 text-gray-500 disabled:opacity-30">›</button>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

export default UserManagement;
