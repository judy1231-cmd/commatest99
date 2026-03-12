import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { fetchWithAuth } from '../../../api/fetchWithAuth';
import AdminSidebar from '../../../components/admin/AdminSidebar';
import AdminHeader from '../../../components/admin/AdminHeader';

const STATUS_BADGE = {
  active:  { label: '활성', cls: 'bg-green-50 text-green-600 border border-green-200' },
  dormant: { label: '휴면', cls: 'bg-gray-100 text-gray-500 border border-gray-200' },
  banned:  { label: '제한', cls: 'bg-red-50 text-red-500 border border-red-200' },
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

  /* 이니셜 아바타용 첫 글자 추출 */
  const initials = user
    ? (user.nickname || user.username || user.email || '?').charAt(0).toUpperCase()
    : '?';

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      <AdminSidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <AdminHeader title="사용자 상세" subtitle="사용자 정보 및 활동 내역" />
        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-3xl mx-auto space-y-5">

            {/* ── 뒤로가기 ── */}
            <button
              onClick={() => navigate(-1)}
              className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900 transition-colors group"
            >
              <span className="material-icons text-[18px] group-hover:-translate-x-0.5 transition-transform">arrow_back</span>
              목록으로
            </button>

            {/* ── 로딩 skeleton ── */}
            {loading ? (
              <div className="space-y-5">
                {/* 프로필 skeleton */}
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 animate-pulse">
                  <div className="flex items-center gap-4 pb-6 border-b border-gray-100">
                    <div className="w-16 h-16 rounded-full bg-gray-200 shrink-0" />
                    <div className="space-y-2">
                      <div className="w-32 h-4 bg-gray-200 rounded" />
                      <div className="w-48 h-3 bg-gray-100 rounded" />
                      <div className="w-14 h-5 bg-gray-200 rounded-full" />
                    </div>
                  </div>
                  <div className="pt-5 grid grid-cols-2 gap-x-8 gap-y-4">
                    {[...Array(5)].map((_, i) => (
                      <div key={i} className="space-y-1.5">
                        <div className="w-16 h-2.5 bg-gray-200 rounded" />
                        <div className="w-28 h-3.5 bg-gray-100 rounded" />
                      </div>
                    ))}
                  </div>
                </div>
                {/* 상태 변경 skeleton */}
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 animate-pulse space-y-3">
                  <div className="w-20 h-4 bg-gray-200 rounded" />
                  <div className="flex gap-2">
                    {[...Array(3)].map((_, i) => <div key={i} className="w-20 h-9 bg-gray-200 rounded-lg" />)}
                  </div>
                </div>
              </div>

            ) : !user ? (
              /* ── 사용자 없음 ── */
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm py-16 text-center">
                <span className="material-icons text-5xl text-gray-200 block mb-3">person_off</span>
                <p className="text-sm font-medium text-gray-400">사용자를 찾을 수 없습니다</p>
                <p className="text-xs text-gray-300 mt-1">ID: {id}</p>
              </div>

            ) : (
              <>
                {/* ── 상태 변경 결과 메시지 ── */}
                {statusMsg && (
                  <div className="flex items-center gap-2 px-4 py-3 bg-green-50 border border-green-200 rounded-xl text-sm text-green-700">
                    <span className="material-icons text-base text-green-500">check_circle</span>
                    {statusMsg}
                  </div>
                )}

                {/* ── 프로필 카드 ── */}
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">

                  {/* 헤더: 아바타 + 이름 + 이메일 + 배지 + 액션 */}
                  <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      {/* 이니셜 아바타 */}
                      <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                        <span className="text-xl font-bold text-primary">{initials}</span>
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-0.5">
                          <p className="text-base font-bold text-gray-900">
                            {user.nickname || user.username || '-'}
                          </p>
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold ${STATUS_BADGE[user.status]?.cls || 'bg-gray-100 text-gray-500 border border-gray-200'}`}>
                            {STATUS_BADGE[user.status]?.label || user.status}
                          </span>
                        </div>
                        <p className="text-sm text-gray-400">{user.email}</p>
                      </div>
                    </div>

                    {/* 빠른 액션 버튼 */}
                    <div className="flex items-center gap-2 shrink-0">
                      {user.status !== 'active' && (
                        <button
                          onClick={() => handleStatusChange('active')}
                          className="flex items-center gap-1.5 px-3 py-2 bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold rounded-lg transition-colors"
                        >
                          <span className="material-icons text-sm">check_circle</span>
                          활성화
                        </button>
                      )}
                      {user.status !== 'banned' && (
                        <button
                          onClick={() => handleStatusChange('banned')}
                          className="flex items-center gap-1.5 px-3 py-2 bg-red-50 hover:bg-red-100 text-red-500 border border-red-200 text-xs font-bold rounded-lg transition-colors"
                        >
                          <span className="material-icons text-sm">block</span>
                          제한
                        </button>
                      )}
                      {user.status !== 'dormant' && (
                        <button
                          onClick={() => handleStatusChange('dormant')}
                          className="flex items-center gap-1.5 px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-500 border border-gray-200 text-xs font-bold rounded-lg transition-colors"
                        >
                          <span className="material-icons text-sm">hotel</span>
                          휴면
                        </button>
                      )}
                    </div>
                  </div>

                  {/* 정보 2열 그리드 */}
                  <div className="px-6 py-5 grid grid-cols-2 gap-x-12 gap-y-5">
                    {rows.map(({ label, value }) => (
                      <div key={label}>
                        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">{label}</p>
                        <p className="text-sm font-medium text-gray-800 font-mono break-all">{value || '-'}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* ── 활동 이력 테이블 ── */}
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                  <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                    <h3 className="text-sm font-bold text-gray-900">활동 이력</h3>
                    <span className="text-xs text-gray-400">최근 30일</span>
                  </div>
                  <table className="w-full text-left text-sm">
                    <thead>
                      <tr className="bg-gray-50 border-b border-gray-200">
                        <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">날짜</th>
                        <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">활동 유형</th>
                        <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">상세</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td colSpan={3} className="py-12 text-center">
                          <div className="flex flex-col items-center gap-2 text-gray-300">
                            <span className="material-icons text-3xl">history</span>
                            <p className="text-sm text-gray-400">활동 이력 API 연결 준비 중입니다</p>
                          </div>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>

              </>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}

export default AdminUserDetail;
