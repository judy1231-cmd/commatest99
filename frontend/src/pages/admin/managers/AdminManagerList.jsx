import { useState, useEffect } from 'react';
import { fetchWithAuth } from '../../../api/fetchWithAuth';
import AdminSidebar from '../../../components/admin/AdminSidebar';
import AdminHeader from '../../../components/admin/AdminHeader';

const STATUS_BADGE = {
  active:  { label: '활성', cls: 'bg-green-50 text-green-600' },
  dormant: { label: '휴면', cls: 'bg-gray-100 text-gray-500' },
  banned:  { label: '제한', cls: 'bg-red-50 text-red-500' },
};

function AdminManagerList() {
  const [managers, setManagers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const data = await fetchWithAuth('/api/admin/users?size=100');
        if (data.success && data.data) {
          setManagers((data.data.users || []).filter(u => u.role === 'ADMIN'));
        }
      } catch { } finally { setLoading(false); }
    })();
  }, []);

  return (
    <div className="flex h-screen overflow-hidden bg-background-light">
      <AdminSidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <AdminHeader title="관리자 계정 관리" subtitle="ADMIN 권한 계정 목록입니다." />
        <main className="flex-1 overflow-y-auto p-6">
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            {loading ? (
              <div className="flex justify-center items-center h-40">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
              </div>
            ) : managers.length === 0 ? (
              <div className="text-center py-16">
                <span className="material-icons text-4xl text-gray-300 block mb-2">admin_panel_settings</span>
                <p className="text-gray-400 text-sm">관리자 계정이 없습니다</p>
              </div>
            ) : (
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    {['쉼표번호','이메일','아이디','상태','가입일'].map(h => (
                      <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {managers.map(u => {
                    const badge = STATUS_BADGE[u.status] || { label: u.status, cls: 'bg-gray-100 text-gray-500' };
                    return (
                      <tr key={u.쉼표번호} className="hover:bg-gray-50">
                        <td className="px-4 py-3 font-mono text-xs text-gray-600">{u.쉼표번호}</td>
                        <td className="px-4 py-3 text-gray-800">{u.email}</td>
                        <td className="px-4 py-3 text-gray-600">{u.username}</td>
                        <td className="px-4 py-3">
                          <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${badge.cls}`}>{badge.label}</span>
                        </td>
                        <td className="px-4 py-3 text-gray-400 text-xs">{u.createdAt ? new Date(u.createdAt).toLocaleDateString('ko-KR') : '-'}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}

export default AdminManagerList;
