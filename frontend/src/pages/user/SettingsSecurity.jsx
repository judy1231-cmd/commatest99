import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { fetchWithAuth } from '../../api/fetchWithAuth';
import UserNavbar from '../../components/user/UserNavbar';
import Toast from '../../components/common/Toast';

function SettingsSecurity() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [pwForm, setPwForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [pwErrors, setPwErrors] = useState({});
  const [pwSaving, setPwSaving] = useState(false);
  const [toast, setToast] = useState({ message: '', type: 'success' });
  const [connectedProviders, setConnectedProviders] = useState([]);

  useEffect(() => {
    fetchWithAuth('/api/auth/social/providers')
      .then(data => { if (data.success) setConnectedProviders(data.data || []); })
      .catch(() => {});
    const linked = searchParams.get('linked');
    const providerNames = { kakao: '카카오', google: 'Google', naver: '네이버' };
    if (linked && providerNames[linked]) {
      setToast({ message: `${providerNames[linked]} 계정이 연동되었습니다.`, type: 'success' });
    } else if (linked === 'true') {
      setToast({ message: '소셜 계정이 연동되었습니다.', type: 'success' });
    }
  }, []);

  const validatePassword = (pw) => {
    if (pw.length < 8) return '8자 이상 입력해주세요.';
    if (!/[A-Z]/.test(pw)) return '대문자를 포함해주세요.';
    if (!/[0-9]/.test(pw)) return '숫자를 포함해주세요.';
    if (!/[!@#$%^&*]/.test(pw)) return '특수문자(!@#$%^&*)를 포함해주세요.';
    return '';
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    const errors = {};
    if (!pwForm.currentPassword) errors.currentPassword = '현재 비밀번호를 입력해주세요.';
    const newPwError = validatePassword(pwForm.newPassword);
    if (newPwError) errors.newPassword = newPwError;
    if (pwForm.newPassword !== pwForm.confirmPassword) errors.confirmPassword = '새 비밀번호가 일치하지 않습니다.';
    if (Object.keys(errors).length > 0) { setPwErrors(errors); return; }

    setPwSaving(true);
    setPwErrors({});
    try {
      const data = await fetchWithAuth('/api/user/password', {
        method: 'PATCH',
        body: JSON.stringify({ currentPassword: pwForm.currentPassword, newPassword: pwForm.newPassword }),
      });
      if (data.success) {
        setPwForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
        setToast({ message: '비밀번호가 변경되었습니다.', type: 'success' });
      } else {
        setPwErrors({ currentPassword: data.message || '비밀번호 변경에 실패했습니다.' });
      }
    } catch {
      setToast({ message: '요청에 실패했습니다. 다시 시도해주세요.', type: 'error' });
    } finally { setPwSaving(false); }
  };

  const handleWithdraw = () => {
    if (!window.confirm('정말 탈퇴하시겠어요?\n탈퇴 후 모든 데이터가 삭제되며 복구할 수 없습니다.')) return;
    fetchWithAuth('/api/user/account', { method: 'DELETE' })
      .then(() => { localStorage.clear(); navigate('/'); })
      .catch(() => setToast({ message: '탈퇴 처리에 실패했습니다.', type: 'error' }));
  };

  return (
    <div className="min-h-screen bg-[#F9F7F2] pb-24">
      <UserNavbar />
      <div className="max-w-lg mx-auto px-4 pt-6 space-y-4">
        <div className="flex items-center gap-3 mb-2">
          <button onClick={() => navigate('/my')} className="p-1.5 rounded-lg text-slate-400 hover:text-primary hover:bg-green-50">
            <span className="material-icons text-xl">arrow_back</span>
          </button>
          <h1 className="text-xl font-bold text-slate-800">보안 및 로그인</h1>
        </div>

        {/* 비밀번호 변경 */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
          <h2 className="font-bold text-slate-700 mb-4 flex items-center gap-2">
            <span className="material-icons text-primary text-base">lock</span>비밀번호 변경
          </h2>
          <form onSubmit={handlePasswordChange} className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1.5">현재 비밀번호</label>
              <input
                type="password"
                value={pwForm.currentPassword}
                onChange={e => setPwForm(f => ({ ...f, currentPassword: e.target.value }))}
                placeholder="현재 비밀번호"
                className="w-full h-12 px-4 rounded-xl border border-gray-200 bg-gray-50 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
              />
              {pwErrors.currentPassword && <p className="text-xs text-red-500 mt-1">{pwErrors.currentPassword}</p>}
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1.5">새 비밀번호</label>
              <input
                type="password"
                value={pwForm.newPassword}
                onChange={e => setPwForm(f => ({ ...f, newPassword: e.target.value }))}
                placeholder="8자 이상, 대문자·숫자·특수문자 포함"
                className="w-full h-12 px-4 rounded-xl border border-gray-200 bg-gray-50 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
              />
              {pwErrors.newPassword && <p className="text-xs text-red-500 mt-1">{pwErrors.newPassword}</p>}
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1.5">새 비밀번호 확인</label>
              <input
                type="password"
                value={pwForm.confirmPassword}
                onChange={e => setPwForm(f => ({ ...f, confirmPassword: e.target.value }))}
                placeholder="새 비밀번호 다시 입력"
                className="w-full h-12 px-4 rounded-xl border border-gray-200 bg-gray-50 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
              />
              {pwErrors.confirmPassword && <p className="text-xs text-red-500 mt-1">{pwErrors.confirmPassword}</p>}
            </div>
            <button
              type="submit"
              disabled={pwSaving}
              className="w-full h-11 bg-primary text-white font-bold rounded-xl text-sm hover:bg-primary/90 disabled:opacity-50 mt-2"
            >
              {pwSaving ? '변경 중...' : '비밀번호 변경'}
            </button>
          </form>
        </div>

        {/* 소셜 로그인 연동 */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
          <h2 className="font-bold text-slate-700 mb-4 flex items-center gap-2">
            <span className="material-icons text-primary text-base">link</span>소셜 로그인 연동
          </h2>
          <div className="space-y-3">
            {[
              { name: 'Google',  provider: 'google', ready: true, linkUrl: 'http://localhost:8080/api/auth/google/link', icon: (
                <svg viewBox="0 0 24 24" className="w-5 h-5"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
              )},
              { name: 'Naver',   provider: 'naver',  ready: true, linkUrl: 'http://localhost:8080/api/auth/naver/link', icon: (
                <svg viewBox="0 0 24 24" className="w-5 h-5"><rect width="24" height="24" rx="4" fill="#03C75A"/><path d="M13.56 12.27L10.2 7H7v10h3.44l3.36-5.27V17H17V7h-3.44z" fill="white"/></svg>
              )},
              { name: 'Kakao',   provider: 'kakao',  ready: true, linkUrl: 'http://localhost:8080/api/auth/kakao/link', icon: (
                <svg viewBox="0 0 24 24" className="w-5 h-5"><rect width="24" height="24" rx="4" fill="#FEE500"/><path fill="#3C1E1E" d="M12 5.5C8.13 5.5 5 7.97 5 11c0 1.9 1.14 3.57 2.89 4.6l-.74 2.74a.2.2 0 0 0 .3.22l3.22-1.75c.43.06.87.1 1.33.1 3.87 0 7-2.47 7-5.5S15.87 5.5 12 5.5z"/></svg>
              )},
            ].map(social => {
              const isConnected = connectedProviders.includes(social.provider);
              return (
                <div key={social.name} className="flex items-center justify-between p-3 rounded-xl border border-gray-100">
                  <div className="flex items-center gap-3">
                    {social.icon}
                    <span className="text-sm font-medium text-slate-700">{social.name}</span>
                  </div>
                  {!social.ready ? (
                    <span className="text-xs text-slate-400 bg-gray-100 px-2.5 py-1 rounded-full">준비 중</span>
                  ) : isConnected ? (
                    <span className="text-xs text-primary bg-green-50 border border-primary/20 px-2.5 py-1 rounded-full font-medium">연동됨</span>
                  ) : (
                    <button
                      onClick={() => {
                        const token = localStorage.getItem('accessToken');
                        window.location.href = `${social.linkUrl}?token=${token}`;
                      }}
                      className="text-xs text-white bg-primary px-2.5 py-1 rounded-full font-medium hover:bg-primary/90"
                    >
                      연동하기
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* 로그아웃 / 회원탈퇴 */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
          <h2 className="font-bold text-slate-700 mb-4 flex items-center gap-2">
            <span className="material-icons text-slate-400 text-base">manage_accounts</span>계정 관리
          </h2>
          <div className="space-y-2">
            <button
              onClick={() => { localStorage.clear(); navigate('/login'); }}
              className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 text-slate-600 text-sm font-medium border border-gray-100"
            >
              <span className="material-icons text-slate-400 text-base">logout</span>로그아웃
            </button>
            <button
              onClick={handleWithdraw}
              className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-red-50 text-red-400 text-sm font-medium border border-gray-100 hover:border-red-100"
            >
              <span className="material-icons text-red-300 text-base">person_remove</span>회원 탈퇴
            </button>
          </div>
        </div>
      </div>

      <Toast message={toast.message} type={toast.type} onClose={() => setToast({ message: '', type: 'success' })} />
    </div>
  );
}

export default SettingsSecurity;
