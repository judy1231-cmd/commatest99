import { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';

function PasswordReset() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');

  // 토큰이 있으면 새 비밀번호 입력 모드, 없으면 이메일 입력 모드
  if (token) {
    return <ResetPasswordForm token={token} />;
  }
  return <RequestResetForm />;
}

// ==================== 이메일 입력 → 재설정 링크 요청 ====================
function RequestResetForm() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!email.trim()) {
      setError('이메일을 입력해주세요.');
      return;
    }

    try {
      setLoading(true);
      const res = await fetch('/api/auth/password/reset-request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim() })
      });
      const data = await res.json();

      if (!data.success) {
        setError(data.message);
        return;
      }

      setSent(true);
    } catch (e) {
      setError('서버에 연결할 수 없습니다. 잠시 후 다시 시도해주세요.');
    } finally {
      setLoading(false);
    }
  };

  if (sent) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-[#F9F7F2]">
        <div className="max-w-md w-full text-center">
          <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center text-white mx-auto mb-6 shadow-lg">
            <span className="material-symbols-outlined text-3xl">mark_email_read</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-800 mb-3">메일을 확인해주세요</h1>
          <p className="text-slate-500 mb-2">
            <span className="font-semibold text-slate-700">{email}</span> 으로
          </p>
          <p className="text-slate-500 mb-8">비밀번호 재설정 링크를 보냈어요.</p>

          <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm mb-6 text-left">
            <div className="space-y-3 text-sm text-slate-500">
              <div className="flex items-start gap-3">
                <span className="material-symbols-outlined text-primary text-lg mt-0.5">schedule</span>
                <span>링크는 <strong className="text-slate-700">30분</strong> 동안 유효합니다.</span>
              </div>
              <div className="flex items-start gap-3">
                <span className="material-symbols-outlined text-primary text-lg mt-0.5">inbox</span>
                <span>메일이 안 보이면 스팸함을 확인해주세요.</span>
              </div>
            </div>
          </div>

          <Link
            to="/login"
            className="block w-full py-4 bg-primary text-white font-bold rounded-xl hover:bg-primary/90 transition-all active:scale-[0.98] shadow-lg"
          >
            로그인으로 돌아가기
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[#F9F7F2]">
      <div className="fixed top-0 left-0 -z-10 w-full h-full overflow-hidden pointer-events-none opacity-20">
        <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] rounded-full blur-[120px] bg-[#4fd1c5]/40"></div>
        <div className="absolute -bottom-[10%] -right-[10%] w-[40%] h-[40%] rounded-full blur-[120px] bg-[#4fd1c5]/40"></div>
      </div>

      <div className="max-w-md w-full">
        <div className="flex flex-col items-center mb-8">
          <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center text-white mb-4 shadow-lg">
            <span className="material-symbols-outlined text-2xl">lock_reset</span>
          </div>
          <h1 className="text-3xl font-black text-[#221610] tracking-tight">비밀번호 재설정</h1>
          <p className="text-gray-500 mt-2 font-medium text-center">가입한 이메일로 재설정 링크를 보내드릴게요.</p>
        </div>

        <div className="bg-white rounded-xl shadow-xl p-8 border border-gray-100">
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600">
              {error}
            </div>
          )}

          <form className="space-y-5" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700 ml-1">가입한 이메일</label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-xl">mail</span>
                <input
                  className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all placeholder:text-gray-400"
                  placeholder="이메일을 입력하세요"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={loading}
                />
              </div>
            </div>

            <button
              className="w-full bg-[#4fd1c5] hover:bg-[#3dbbb1] text-white font-bold py-4 rounded-lg shadow-lg transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
              type="submit"
              disabled={loading}
            >
              {loading ? '발송 중...' : '재설정 링크 보내기'}
            </button>
          </form>

          <div className="flex justify-center mt-6">
            <Link to="/login" className="text-sm text-gray-500 hover:text-primary transition-colors flex items-center gap-1">
              <span className="material-symbols-outlined text-base">arrow_back</span>
              로그인으로 돌아가기
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

// ==================== 토큰 기반 새 비밀번호 입력 ====================
function ResetPasswordForm({ token }) {
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const getPasswordStrength = () => {
    if (!password) return { level: 0, label: '', color: 'bg-gray-200' };
    let score = 0;
    if (password.length >= 8) score++;
    if (/[a-zA-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^a-zA-Z0-9]/.test(password)) score++;

    if (score <= 1) return { level: 1, label: '약함', color: 'bg-red-400' };
    if (score === 2) return { level: 2, label: '보통', color: 'bg-yellow-400' };
    if (score === 3) return { level: 3, label: '좋음', color: 'bg-primary' };
    return { level: 4, label: '강함', color: 'bg-green-500' };
  };

  const strength = getPasswordStrength();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (password.length < 8) {
      setError('비밀번호는 8자 이상이어야 합니다.');
      return;
    }
    if (password !== passwordConfirm) {
      setError('비밀번호가 일치하지 않습니다.');
      return;
    }

    try {
      setLoading(true);
      const res = await fetch('/api/auth/password/reset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, newPassword: password })
      });
      const data = await res.json();

      if (!data.success) {
        setError(data.message);
        return;
      }

      setSuccess(true);
    } catch (e) {
      setError('서버에 연결할 수 없습니다. 잠시 후 다시 시도해주세요.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-[#F9F7F2]">
        <div className="max-w-md w-full text-center">
          <div className="relative w-24 h-24 mx-auto mb-6">
            <div className="absolute inset-0 bg-primary/20 rounded-full animate-ping"></div>
            <div className="relative w-24 h-24 bg-primary rounded-full flex items-center justify-center shadow-lg">
              <span className="material-symbols-outlined text-white text-4xl">check_circle</span>
            </div>
          </div>
          <h1 className="text-2xl font-bold text-slate-800 mb-3">비밀번호 변경 완료!</h1>
          <p className="text-slate-500 mb-8">새 비밀번호로 로그인해주세요.</p>
          <Link
            to="/login"
            className="block w-full py-4 bg-primary text-white font-bold rounded-xl hover:bg-primary/90 transition-all active:scale-[0.98] shadow-lg"
          >
            로그인하러 가기
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[#F9F7F2]">
      <div className="fixed top-0 left-0 -z-10 w-full h-full overflow-hidden pointer-events-none opacity-20">
        <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] rounded-full blur-[120px] bg-[#4fd1c5]/40"></div>
        <div className="absolute -bottom-[10%] -right-[10%] w-[40%] h-[40%] rounded-full blur-[120px] bg-[#4fd1c5]/40"></div>
      </div>

      <div className="max-w-md w-full">
        <div className="flex flex-col items-center mb-8">
          <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center text-white mb-4 shadow-lg">
            <span className="material-symbols-outlined text-2xl">lock_reset</span>
          </div>
          <h1 className="text-3xl font-black text-[#221610] tracking-tight">새 비밀번호 설정</h1>
          <p className="text-gray-500 mt-2 font-medium text-center">새로운 비밀번호를 입력해주세요.</p>
        </div>

        <div className="bg-white rounded-xl shadow-xl p-8 border border-gray-100">
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600">
              {error}
            </div>
          )}

          <form className="space-y-5" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700 ml-1">새 비밀번호</label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-xl">lock</span>
                <input
                  className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all placeholder:text-gray-400"
                  placeholder="8자 이상 영문, 숫자 조합"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={loading}
                />
              </div>
              {password && (
                <div className="flex items-center gap-2 mt-2">
                  <div className="flex-1 h-1.5 rounded-full bg-gray-200 overflow-hidden">
                    <div className={`h-full ${strength.color} transition-all`} style={{ width: `${strength.level * 25}%` }}></div>
                  </div>
                  <span className={`text-xs font-medium ${strength.level <= 1 ? 'text-red-400' : strength.level === 2 ? 'text-yellow-500' : 'text-primary'}`}>
                    {strength.label}
                  </span>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700 ml-1">비밀번호 확인</label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-xl">lock</span>
                <input
                  className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all placeholder:text-gray-400"
                  placeholder="비밀번호를 한번 더 입력해주세요"
                  type="password"
                  value={passwordConfirm}
                  onChange={(e) => setPasswordConfirm(e.target.value)}
                  disabled={loading}
                />
              </div>
              {passwordConfirm && password !== passwordConfirm && (
                <p className="text-xs text-red-500 ml-1">비밀번호가 일치하지 않습니다.</p>
              )}
            </div>

            <button
              className="w-full bg-[#4fd1c5] hover:bg-[#3dbbb1] text-white font-bold py-4 rounded-lg shadow-lg transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
              type="submit"
              disabled={loading}
            >
              {loading ? '변경 중...' : '비밀번호 변경하기'}
            </button>
          </form>

          <div className="flex justify-center mt-6">
            <Link to="/login" className="text-sm text-gray-500 hover:text-primary transition-colors flex items-center gap-1">
              <span className="material-symbols-outlined text-base">arrow_back</span>
              로그인으로 돌아가기
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PasswordReset;
