import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { fetchWithAuth } from '../../../api/fetchWithAuth';
import AdminSidebar from '../../../components/admin/AdminSidebar';
import AdminHeader from '../../../components/admin/AdminHeader';

function AdminUserLogs() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

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

  return (
    <div className="flex h-screen overflow-hidden bg-background-light">
      <AdminSidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <AdminHeader title="사용자 활동 로그" subtitle={`대상: ${id}`} />
        <main className="flex-1 overflow-y-auto p-6 space-y-4">
          <button onClick={() => navigate(-1)} className="flex items-center gap-1 text-sm text-gray-500 hover:text-primary transition-colors">
            <span className="material-icons text-base">arrow_back</span> 돌아가기
          </button>
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            {loading ? (
              <div className="flex justify-center items-center h-40">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
              </div>
            ) : logs.length === 0 ? (
              <div className="text-center py-16">
                <span className="material-icons text-4xl text-gray-300 block mb-2">history</span>
                <p className="text-gray-400 text-sm">관련 활동 로그가 없습니다</p>
              </div>
            ) : (
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>{['번호','관리자','액션','대상유형','일시'].map(h => (
                    <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">{h}</th>
                  ))}</tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {logs.map(log => (
                    <tr key={log.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-gray-400 text-xs">{log.id}</td>
                      <td className="px-4 py-3 font-medium text-gray-800">{log.admin쉼표번호 || '-'}</td>
                      <td className="px-4 py-3 text-gray-600">{log.action || '-'}</td>
                      <td className="px-4 py-3 text-gray-500">{log.targetType || '-'}</td>
                      <td className="px-4 py-3 text-gray-400 text-xs">{log.createdAt ? new Date(log.createdAt).toLocaleString('ko-KR') : '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}

export default AdminUserLogs;
