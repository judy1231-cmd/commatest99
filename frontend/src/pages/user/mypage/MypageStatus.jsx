import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import UserNavbar from '../../../components/user/UserNavbar';
import { fetchWithAuth } from '../../../api/fetchWithAuth';

const STATUS_INFO = {
  active:  { label: '정상', icon: 'check_circle', cls: 'text-emerald-500', bg: 'bg-emerald-50' },
  dormant: { label: '휴면', icon: 'bedtime', cls: 'text-amber-500', bg: 'bg-amber-50' },
  banned:  { label: '이용 제한', icon: 'block', cls: 'text-red-500', bg: 'bg-red-50' },
};

function MypageStatus() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const data = await fetchWithAuth('/api/user/profile');
        if (data.success) setProfile(data.data);
      } catch { /* 무시 */ } finally { setLoading(false); }
    })();
  }, []);

  const user = profile?.user;
  const statusInfo = STATUS_INFO[user?.status] || STATUS_INFO.active;

  return (
    <>
      <UserNavbar />
      <main className="min-h-screen bg-[#F9F7F2]">
        <div className="max-w-md mx-auto px-4 pt-8 pb-24">
          <button onClick={() => navigate('/my')}
            className="flex items-center gap-1 text-sm text-slate-500 hover:text-primary mb-6 transition-colors">
            <span className="material-icons text-base">arrow_back</span> 마이페이지
          </button>

          <h1 className="text-xl font-bold text-slate-800 mb-6">계정 상태</h1>

          {loading ? (
            <div className="flex justify-center items-center h-40">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
            </div>
          ) : !user ? (
            <p className="text-slate-400 text-center">정보를 불러올 수 없어요.</p>
          ) : (
            <div className="space-y-4">
              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
                <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full ${statusInfo.bg} mb-4`}>
                  <span className={`material-icons text-lg ${statusInfo.cls}`}>{statusInfo.icon}</span>
                  <span className={`font-bold text-sm ${statusInfo.cls}`}>{statusInfo.label}</span>
                </div>
                <dl className="space-y-3 text-sm">
                  {[
                    { label: '쉼표번호', value: user.쉼표번호 },
                    { label: '이메일', value: user.email },
                    { label: '이메일 인증', value: user.emailVerified ? '완료' : '미완료' },
                    { label: '권한', value: user.role === 'ADMIN' ? '관리자' : '일반 회원' },
                    { label: '가입일', value: user.createdAt ? new Date(user.createdAt).toLocaleDateString('ko-KR') : '-' },
                  ].map(({ label, value }) => (
                    <div key={label} className="flex justify-between py-2 border-b border-slate-50">
                      <dt className="text-slate-500">{label}</dt>
                      <dd className="font-medium text-slate-700">{value}</dd>
                    </div>
                  ))}
                </dl>
              </div>
            </div>
          )}
        </div>
      </main>
    </>
  );
}

export default MypageStatus;
