import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

// 비밀번호 강도 계산
function getPasswordStrength(pw) {
  if (!pw) return { level: 0, label: '', color: 'bg-gray-200' };
  let score = 0;
  if (pw.length >= 8) score++;
  if (/[a-zA-Z]/.test(pw)) score++;
  if (/[0-9]/.test(pw)) score++;
  if (/[^a-zA-Z0-9]/.test(pw)) score++;
  if (score <= 1) return { level: 1, label: '약함', color: 'bg-red-400' };
  if (score === 2) return { level: 2, label: '보통', color: 'bg-yellow-400' };
  if (score === 3) return { level: 3, label: '좋음', color: 'bg-primary' };
  return { level: 4, label: '강함', color: 'bg-green-500' };
}

const STEPS = ['이메일 입력', '인증 코드', '비밀번호 재설정'];

function StepIndicator({ current }) {
  return (
    <div className="flex items-center justify-center gap-2 mb-8">
      {STEPS.map((label, idx) => {
        const step = idx + 1;
        const isDone = step < current;
        const isActive = step === current;
        return (
          <div key={step} className="flex items-center gap-2">
            <div className="flex flex-col items-center gap-1">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
                isDone ? 'bg-primary text-white' :
                isActive ? 'bg-primary text-white ring-4 ring-primary/20' :
                'bg-gray-100 text-gray-400'
              }`}>
                {isDone ? <span className="material-icons text-base">check</span> : step}
              </div>
              <span className={`text-xs font-medium ${isActive ? 'text-primary' : 'text-gray-400'}`}>
                {label}
              </span>
            </div>
            {idx < STEPS.length - 1 && (
              <div className={`w-12 h-0.5 mb-4 transition-all ${step < current ? 'bg-primary' : 'bg-gray-200'}`} />
            )}
          </div>
        );
      })}
    </div>
  );
}

function AuthFindPassword() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const strength = getPasswordStrength(password);

  // 1단계: 이메일로 인증 코드 발송
  const handleSendCode = async (e) => {
    e.preventDefault();
    setError(null);
    if (!email.trim()) { setError('이메일을 입력해주세요.'); return; }

    try {
      setLoading(true);
      const res = await fetch('/api/auth/password/reset-request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim() })
      });
      const data = await res.json();
      if (!data.success) { setError(data.message); return; }
      setStep(2);
    } catch {
      setError('서버에 연결할 수 없습니다. 잠시 후 다시 시도해주세요.');
    } finally {
      setLoading(false);
    }
  };

  // 2단계: 인증 코드 확인
  const handleVerifyCode = async (e) => {
    e.preventDefault();
    setError(null);
    if (!code.trim()) { setError('인증 코드를 입력해주세요.'); return; }

    try {
      setLoading(true);
      const res = await fetch('/api/auth/password/verify-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), code: code.trim() })
      });
      const data = await res.json();
      if (!data.success) { setError(data.message); return; }
      setStep(3);
    } catch {
      setError('서버에 연결할 수 없습니다. 잠시 후 다시 시도해주세요.');
    } finally {
      setLoading(false);
    }
  };

  // 3단계: 새 비밀번호 설정
  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError(null);
    if (password.length < 8) { setError('비밀번호는 8자 이상이어야 합니다.'); return; }
    if (password !== passwordConfirm) { setError('비밀번호가 일치하지 않습니다.'); return; }

    try {
      setLoading(true);
      const res = await fetch('/api/auth/password/reset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), code: code.trim(), newPassword: password })
      });
      const data = await res.json();
      if (!data.success) { setError(data.message); return; }
      setStep(4); // 완료
    } catch {
      setError('서버에 연결할 수 없습니다. 잠시 후 다시 시도해주세요.');
    } finally {
      setLoading(false);
    }
  };

  // 완료 화면
  if (step === 4) {
    return (
      <div className="min-h-screen flex flex-col bg-[#F9F7F2]">
        <Nav />
        <main className="flex-1 flex items-center justify-center px-4 py-16">
          <div className="w-full max-w-md text-center">
            <div className="relative w-24 h-24 mx-auto mb-6">
              <div className="absolute inset-0 bg-primary/20 rounded-full animate-ping" />
              <div className="relative w-24 h-24 bg-primary rounded-full flex items-center justify-center shadow-lg">
                <span className="material-icons text-white text-4xl">check</span>
              </div>
            </div>
            <h1 className="text-2xl font-bold text-slate-800 mb-2">비밀번호 변경 완료!</h1>
            <p className="text-slate-500 mb-8">새 비밀번호로 로그인해주세요.</p>
            <button
              onClick={() => navigate('/auth/login')}
              className="w-full py-4 bg-primary text-white font-bold rounded-xl hover:bg-primary/90 transition-all active:scale-[0.98] shadow-lg"
            >
              로그인하러 가기
            </button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#F9F7F2]">
      <Nav />

      <main className="flex-1 flex items-center justify-center px-4 py-16">
        <div className="w-full max-w-md">

          {/* 타이틀 */}
          <div className="text-center mb-6">
            <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
              <span className="material-icons text-white text-2xl">lock_reset</span>
            </div>
            <h1 className="text-2xl font-bold text-slate-800">비밀번호 찾기</h1>
            <p className="text-slate-500 text-sm mt-1">
              {step === 1 && '가입한 이메일로 인증 코드를 보내드릴게요.'}
              {step === 2 && `${email} 로 발송된 인증 코드를 입력해주세요.`}
              {step === 3 && '새로운 비밀번호를 설정해주세요.'}
            </p>
          </div>

          <StepIndicator current={step} />

          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8">
            {error && (
              <div className="mb-5 p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600">
                {error}
              </div>
            )}

            {/* 1단계: 이메일 입력 */}
            {step === 1 && (
              <form className="space-y-5" onSubmit={handleSendCode}>
                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-slate-700">이메일 주소</label>
                  <div className="relative">
                    <span className="material-icons absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-xl">mail</span>
                    <input
                      className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all placeholder:text-slate-400"
                      placeholder="가입한 이메일을 입력하세요"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      disabled={loading}
                    />
                  </div>
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-primary hover:bg-primary/90 text-white font-bold py-3.5 rounded-xl shadow-sm transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? '발송 중...' : '인증 코드 발송'}
                </button>
              </form>
            )}

            {/* 2단계: 인증 코드 입력 */}
            {step === 2 && (
              <form className="space-y-5" onSubmit={handleVerifyCode}>
                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-slate-700">인증 코드</label>
                  <input
                    className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-center tracking-[0.4em] font-mono text-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all placeholder:text-slate-400 placeholder:tracking-normal"
                    placeholder="코드 6자리 입력"
                    type="text"
                    maxLength={6}
                    value={code}
                    onChange={(e) => setCode(e.target.value.replace(/[^0-9a-zA-Z]/g, ''))}
                    disabled={loading}
                  />
                  <p className="text-xs text-slate-400 text-center">코드는 30분 동안 유효합니다.</p>
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-primary hover:bg-primary/90 text-white font-bold py-3.5 rounded-xl shadow-sm transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? '확인 중...' : '코드 확인'}
                </button>
                <button
                  type="button"
                  onClick={() => { setStep(1); setCode(''); setError(null); }}
                  className="w-full text-sm text-slate-400 hover:text-primary transition-colors"
                >
                  이메일 다시 입력하기
                </button>
              </form>
            )}

            {/* 3단계: 새 비밀번호 입력 */}
            {step === 3 && (
              <form className="space-y-5" onSubmit={handleResetPassword}>
                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-slate-700">새 비밀번호</label>
                  <div className="relative">
                    <span className="material-icons absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-xl">lock</span>
                    <input
                      className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all placeholder:text-slate-400"
                      placeholder="8자 이상 영문, 숫자 조합"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      disabled={loading}
                    />
                  </div>
                  {password && (
                    <div className="flex items-center gap-2 pt-1">
                      <div className="flex-1 h-1.5 rounded-full bg-gray-200 overflow-hidden">
                        <div className={`h-full ${strength.color} transition-all`} style={{ width: `${strength.level * 25}%` }} />
                      </div>
                      <span className={`text-xs font-medium ${strength.level <= 1 ? 'text-red-400' : strength.level === 2 ? 'text-yellow-500' : 'text-primary'}`}>
                        {strength.label}
                      </span>
                    </div>
                  )}
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-slate-700">비밀번호 확인</label>
                  <div className="relative">
                    <span className="material-icons absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-xl">lock</span>
                    <input
                      className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all placeholder:text-slate-400"
                      placeholder="비밀번호를 한번 더 입력해주세요"
                      type="password"
                      value={passwordConfirm}
                      onChange={(e) => setPasswordConfirm(e.target.value)}
                      disabled={loading}
                    />
                  </div>
                  {passwordConfirm && password !== passwordConfirm && (
                    <p className="text-xs text-red-500">비밀번호가 일치하지 않습니다.</p>
                  )}
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-primary hover:bg-primary/90 text-white font-bold py-3.5 rounded-xl shadow-sm transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? '변경 중...' : '비밀번호 변경하기'}
                </button>
              </form>
            )}

            <div className="flex justify-center mt-6">
              <Link to="/auth/login" className="text-sm text-slate-400 hover:text-primary transition-colors flex items-center gap-1">
                <span className="material-icons text-base">arrow_back</span>
                로그인으로 돌아가기
              </Link>
            </div>
          </div>
        </div>
      </main>

      <footer className="w-full py-8 text-center bg-gray-50 border-t border-gray-100">
        <p className="text-xs text-gray-400">&copy; 2025 쉼표. All rights reserved.</p>
      </footer>
    </div>
  );
}

function Nav() {
  return (
    <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center">
        <Link to="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
          <div className="w-9 h-9 bg-primary rounded-full flex items-center justify-center shadow-sm overflow-hidden">
            <img src="/logo_comma.png" alt="쉼표" className="w-4 h-4 object-contain" />
          </div>
          <span className="text-2xl font-bold tracking-tight text-slate-900">쉼표</span>
        </Link>
      </div>
    </nav>
  );
}

export default AuthFindPassword;
