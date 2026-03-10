import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { fetchWithAuth } from '../../../api/fetchWithAuth';
import AdminSidebar from '../../../components/admin/AdminSidebar';
import AdminHeader from '../../../components/admin/AdminHeader';

const STATUS_BADGE = {
  active:  { label: '활성', cls: 'bg-green-50 text-green-600' },
  dormant: { label: '휴면', cls: 'bg-gray-100 text-gray-500' },
  banned:  { label: '제한', cls: 'bg-red-50 text-red-500' },
};

function AdminUserDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [statusMsg, setStatusMsg] = useState('');

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const data = await fetchWithAuth(`/api/admin/users?keyword=${id}&size=10`);
        if (data.success && data.data) {
          const found = (data.data.users || []).find(u => u.쉼표번호 === id || u.username === id || u.email === id);
          setUser(found || null);
        }
      } catch { } finally { setLoading(false); }
    })();
  }, [id]);

  const handleStatusChange = async (newStatus) => {
    if (!user) return;
    const label = STATUS_BADGE[newStatus]?.label || newStatus;
    if (!window.confirm(`상태를 '${label}'(으)로 변경할까요?`)) return;
    try {
      await fetchWithAuth(`/api/admin/users/${user.쉼표번호}/status`, {
        method: 'PUT',
        body: JSON.stringify({ status: newStatus }),
      });
      setUser(prev => ({ ...prev, status: newStatus }));
      setStatusMsg(`상태가 '${label}'(으)로 변경되었습니다.`);
    } catch { setStatusMsg('변경에 실패했습니다.'); }
  };

  const rows = user ? [
    { label: '쉼표번호', value: user.쉼표번호 },
    { label: '이메일', value: user.email },
    { label: '아이디', value: user.username },
    { label: '권한', value: user.role },
    { label: '가입일', value: user.createdAt ? new Date(user.createdAt).toLocaleString('ko-KR') : '-' },
  ] : [];

  return (
    <div className="flex h-screen overflow-hidden bg-background-light">
      <AdminSidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <AdminHeader title="사용자 상세" subtitle="사용자 정보 및 활동 내역" />
        <main className="flex-1 overflow-y-auto p-6 space-y-6 max-w-2xl">
          <button onClick={() => navigate(-1)} className="flex items-center gap-1 text-sm text-gray-500 hover:text-primary transition-colors">
            <span className="material-icons text-base">arrow_back</span> 목록으로
          </button>

          {loading ? (
            <div className="flex justify-center items-center h-40">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
            </div>
          ) : !user ? (
            <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
              <span className="material-icons text-4xl text-gray-300 block mb-2">person_off</span>
              <p className="text-gray-400">사용자를 찾을 수 없습니다</p>
            </div>
          ) : (
            <>
              {statusMsg && (
                <div className="bg-green-50 border border-green-200 rounded-xl p-3 text-sm text-green-700">{statusMsg}</div>
              )}
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                    <span className="material-icons text-primary">person</span>
                  </div>
                  <div>
                    <p className="font-bold text-gray-900">{user.username}</p>
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${STATUS_BADGE[user.status]?.cls || 'bg-gray-100 text-gray-500'}`}>
                      {STATUS_BADGE[user.status]?.label || user.status}
                    </span>
                  </div>
                </div>
                <dl className="space-y-3">
                  {rows.map(({ label, value }) => (
                    <div key={label} className="flex justify-between py-2 border-b border-gray-50 text-sm">
                      <dt className="text-gray-500 font-medium">{label}</dt>
                      <dd className="text-gray-800 font-mono text-xs">{value}</dd>
                    </div>
                  ))}
                </dl>
              </div>

              <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
                <h3 className="font-bold text-gray-800 mb-4">상태 변경</h3>
                <div className="flex gap-3">
                  {Object.entries(STATUS_BADGE).map(([key, { label, cls }]) => (
                    <button key={key} onClick={() => handleStatusChange(key)}
                      className={`px-4 py-2 rounded-xl text-sm font-bold border transition-all ${user.status === key ? `${cls} border-current` : 'border-gray-200 text-gray-500 hover:border-gray-300'}`}>
                      {label}
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}
        </main>
      </div>
    </div>
  );
}

export default AdminUserDetail;
