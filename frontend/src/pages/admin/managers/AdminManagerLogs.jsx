import { useState, useEffect, useCallback } from 'react';
import { fetchWithAuth } from '../../../api/fetchWithAuth';
import AdminSidebar from '../../../components/admin/AdminSidebar';
import AdminHeader from '../../../components/admin/AdminHeader';

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

  return (
    <div className="flex h-screen overflow-hidden bg-background-light">
      <AdminSidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <AdminHeader title="관리자 활동 로그" subtitle="관리자 계정의 모든 활동 내역입니다." />
        <main className="flex-1 overflow-y-auto p-6">
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            {loading ? (
              <div className="flex justify-center items-center h-40">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
              </div>
            ) : logs.length === 0 ? (
              <div className="text-center py-16">
                <span className="material-icons text-4xl text-gray-300 block mb-2">history</span>
                <p className="text-gray-400 text-sm">활동 로그가 없습니다</p>
              </div>
            ) : (
              <>
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      {['번호','관리자','액션','대상유형','대상ID','일시'].map(h => (
                        <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {logs.map(log => (
                      <tr key={log.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 text-gray-500 text-xs">{log.id}</td>
                        <td className="px-4 py-3 font-medium text-gray-800">{log.admin쉼표번호 || '-'}</td>
                        <td className="px-4 py-3 text-gray-600">{log.action || '-'}</td>
                        <td className="px-4 py-3 text-gray-500">{log.targetType || '-'}</td>
                        <td className="px-4 py-3 text-gray-500">{log.targetId || '-'}</td>
                        <td className="px-4 py-3 text-gray-400 text-xs">{log.createdAt ? new Date(log.createdAt).toLocaleString('ko-KR') : '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {totalPages > 1 && (
                  <div className="flex justify-center items-center gap-3 p-4 border-t border-gray-100">
                    <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                      className="px-3 py-1.5 text-sm border border-gray-200 rounded-lg disabled:opacity-40 hover:bg-gray-50">이전</button>
                    <span className="text-sm text-gray-500">{page} / {totalPages}</span>
                    <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                      className="px-3 py-1.5 text-sm border border-gray-200 rounded-lg disabled:opacity-40 hover:bg-gray-50">다음</button>
                  </div>
                )}
              </>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}

export default AdminManagerLogs;
