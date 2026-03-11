import { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';

// ── 공통 레이아웃 래퍼 ────────────────────────────────────────────────────────
function PageShell({ step, totalSteps, children }) {
  return (
    <div className="min-h-screen flex flex-col bg-white">

      {/* 상단 네비 + 스텝 진행바 */}
      <nav className="sticky top-0 z-50 bg-white border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center gap-3">
          <Link to="/login" className="w-9 h-9 flex items-center justify-center rounded-xl hover:bg-slate-100 transition-colors">
            <span className="material-icons text-slate-500 text-[20px]">arrow_back</span>
          </Link>
          <span className="text-[15px] font-bold text-slate-900">비밀번호 재설정</span>
        </div>
        {/* Progress bar */}
        <div className="h-0.5 bg-slate-100">
          <div
            className="h-full bg-primary transition-all duration-500 ease-out"
            style={{ width: `${(step / totalSteps) * 100}%` }}
          />
        </div>
      </nav>

      <main className="flex-1 flex items-start justify-center pt-14 pb-20 px-6">
        <div className="w-full max-w-[420px]">
          {children}
        </div>
      </main>
    </div>
  );
}

// ── 라우터 ────────────────────────────────────────────────────────────────────
function PasswordReset() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');

  if (token) return <ResetPasswordForm token={token} />;
  return <RequestResetForm />;
}

// ── STEP 1 : 이메일 입력 ──────────────────────────────────────────────────────
function RequestResetForm() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e) => {
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
      setSent(true);
    } catch {
      setError('서버에 연결할 수 없습니다. 잠시 후 다시 시도해주세요.');
    } finally {
      setLoading(false);
    }
  };

  // ── 발송 완료 화면 ──
  if (sent) {
    return (
      <PageShell step={2} totalSteps={3}>
        <div className="text-center pt-6">
          {/* 아이콘 */}
          <div className="w-20 h-20 bg-primary rounded-2xl flex items-center justify-center mx-auto mb-8 shadow-xl shadow-emerald-100">
            <span className="material-icons text-white text-[36px]">mark_email_read</span>
          </div>

          <h1 className="text-[26px] font-extrabold text-slate-900 tracking-tight mb-2">
            메일을 확인해주세요
          </h1>
          <p className="text-[15px] text-slate-400 font-medium mb-1">
            <span className="text-slate-600 font-semibold">{email}</span> 으로
          </p>
          <p className="text-[15px] text-slate-400 font-medium mb-10">
            재설정 링크를 보냈어요
          </p>

          {/* 안내 */}
          <div className="bg-slate-50 rounded-2xl px-5 py-4 mb-10 text-left space-y-3">
            <div className="flex items-start gap-3">
              <span className="material-icons text-primary text-[18px] mt-0.5 flex-shrink-0">schedule</span>
              <p className="text-[13px] text-slate-500 leading-relaxed">
                링크는 <span className="font-bold text-slate-700">30분</span> 동안만 유효해요
              </p>
            </div>
            <div className="flex items-start gap-3">
              <span className="material-icons text-primary text-[18px] mt-0.5 flex-shrink-0">inbox</span>
              <p className="text-[13px] text-slate-500 leading-relaxed">
                메일이 안 보이면 스팸함을 확인해주세요
              </p>
            </div>
          </div>

          <Link
            to="/login"
            className="block w-full py-4 bg-primary hover:bg-emerald-500 active:scale-[0.98] text-white text-[16px] font-bold rounded-2xl shadow-lg shadow-emerald-100 transition-all"
          >
            로그인으로 돌아가기
          </Link>
        </div>
      </PageShell>
    );
  }

  // ── 이메일 입력 화면 ──
  return (
    <PageShell step={1} totalSteps={3}>
      {/* 타이틀 */}
      <div className="mb-10 pt-2">
        <p className="text-[12px] font-bold text-slate-400 tracking-widest uppercase mb-3">STEP 1 / 3</p>
        <h1 className="text-[26px] font-extrabold text-slate-900 tracking-tight mb-2">
          이메일 확인
        </h1>
        <p className="text-[14px] text-slate-400 font-medium leading-relaxed">
          가입 시 사용한 이메일을 입력하면<br />재설정 링크를 보내드려요
        </p>
      </div>

      {/* 에러 */}
      {error && (
        <div className="flex items-center gap-2 mb-6 text-red-500 text-[13px] font-medium">
          <span className="material-icons text-[15px] flex-shrink-0">error_outline</span>
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="space-y-2">
          <label className="text-[12px] font-bold text-slate-400 tracking-widest uppercase">이메일 주소</label>
          <input
            className="w-full px-0 py-3 bg-transparent border-0 border-b-2 border-slate-200 text-slate-900 text-[16px] font-medium placeholder:text-slate-300 focus:border-primary focus:outline-none transition-colors"
            placeholder="example@email.com"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={loading}
          />
          <p className="text-[12px] text-slate-400 pt-1">
            가입 여부와 관계없이 동일한 응답을 드려요
          </p>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-4 bg-primary hover:bg-emerald-500 active:scale-[0.98] text-white text-[16px] font-bold rounded-2xl shadow-lg shadow-emerald-100 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
              </svg>
              발송 중...
            </span>
          ) : '재설정 링크 보내기'}
        </button>
      </form>
    </PageShell>
  );
}

// ── STEP 3 : 새 비밀번호 입력 (토큰 기반) ─────────────────────────────────────
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
    if (password.length < 8) { setError('비밀번호는 8자 이상이어야 합니다.'); return; }
    if (password !== passwordConfirm) { setError('비밀번호가 일치하지 않습니다.'); return; }
    try {
      setLoading(true);
      const res = await fetch('/api/auth/password/reset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, newPassword: password })
      });
      const data = await res.json();
      if (!data.success) { setError(data.message); return; }
      setSuccess(true);
    } catch {
      setError('서버에 연결할 수 없습니다. 잠시 후 다시 시도해주세요.');
    } finally {
      setLoading(false);
    }
  };

  // ── 변경 완료 화면 ──
  if (success) {
    return (
      <PageShell step={3} totalSteps={3}>
        <div className="text-center pt-6">
          <div className="relative w-20 h-20 mx-auto mb-8">
            <div className="absolute inset-0 bg-primary/10 rounded-full animate-ping" />
            <div className="relative w-20 h-20 bg-primary rounded-full flex items-center justify-center shadow-xl shadow-emerald-200">
              <span className="material-icons text-white text-[34px]">check</span>
            </div>
          </div>
          <h1 className="text-[26px] font-extrabold text-slate-900 tracking-tight mb-2">
            비밀번호 변경 완료
          </h1>
          <p className="text-[15px] text-slate-400 font-medium mb-10">
            새 비밀번호로 로그인해주세요
          </p>
          <Link
            to="/login"
            className="block w-full py-4 bg-primary hover:bg-emerald-500 active:scale-[0.98] text-white text-[16px] font-bold rounded-2xl shadow-lg shadow-emerald-100 transition-all"
          >
            로그인하러 가기
          </Link>
        </div>
      </PageShell>
    );
  }

  // ── 새 비밀번호 입력 화면 ──
  return (
    <PageShell step={3} totalSteps={3}>
      {/* 타이틀 */}
      <div className="mb-10 pt-2">
        <p className="text-[12px] font-bold text-slate-400 tracking-widest uppercase mb-3">STEP 3 / 3</p>
        <h1 className="text-[26px] font-extrabold text-slate-900 tracking-tight mb-2">
          새 비밀번호 설정
        </h1>
        <p className="text-[14px] text-slate-400 font-medium leading-relaxed">
          새로운 비밀번호를 입력해주세요
        </p>
      </div>

      {/* 에러 */}
      {error && (
        <div className="flex items-center gap-2 mb-6 text-red-500 text-[13px] font-medium">
          <span className="material-icons text-[15px] flex-shrink-0">error_outline</span>
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-7">
        {/* 새 비밀번호 */}
        <div className="space-y-2">
          <label className="text-[12px] font-bold text-slate-400 tracking-widest uppercase">새 비밀번호</label>
          <input
            className="w-full px-0 py-3 bg-transparent border-0 border-b-2 border-slate-200 text-slate-900 text-[16px] font-medium placeholder:text-slate-300 focus:border-primary focus:outline-none transition-colors"
            placeholder="8자 이상 영문, 숫자 조합"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={loading}
          />
          {password && (
            <div className="flex items-center gap-3 pt-1">
              <div className="flex gap-1 flex-1">
                {[1, 2, 3, 4].map((n) => (
                  <div key={n} className={`h-1 flex-1 rounded-full transition-all ${n <= strength.level ? strength.color : 'bg-slate-100'}`} />
                ))}
              </div>
              <span className={`text-[12px] font-bold w-8 text-right ${
                strength.level <= 1 ? 'text-red-400' :
                strength.level === 2 ? 'text-yellow-500' : 'text-primary'
              }`}>{strength.label}</span>
            </div>
          )}
          <p className="text-[12px] text-slate-400 pt-0.5">영문, 숫자, 특수문자를 조합하면 더 안전해요</p>
        </div>

        {/* 비밀번호 확인 */}
        <div className="space-y-2">
          <label className="text-[12px] font-bold text-slate-400 tracking-widest uppercase">비밀번호 확인</label>
          <input
            className={`w-full px-0 py-3 bg-transparent border-0 border-b-2 text-slate-900 text-[16px] font-medium placeholder:text-slate-300 focus:outline-none transition-colors ${
              passwordConfirm && password !== passwordConfirm ? 'border-red-400' :
              passwordConfirm && password === passwordConfirm ? 'border-primary' :
              'border-slate-200 focus:border-primary'
            }`}
            placeholder="비밀번호를 한 번 더 입력해주세요"
            type="password"
            value={passwordConfirm}
            onChange={(e) => setPasswordConfirm(e.target.value)}
            disabled={loading}
          />
          {passwordConfirm && password !== passwordConfirm && (
            <p className="flex items-center gap-1 text-[12px] text-red-500 font-medium pt-0.5">
              <span className="material-icons text-[14px]">cancel</span>
              비밀번호가 일치하지 않습니다
            </p>
          )}
          {passwordConfirm && password === passwordConfirm && (
            <p className="flex items-center gap-1 text-[12px] text-primary font-medium pt-0.5">
              <span className="material-icons text-[14px]">check_circle</span>
              비밀번호가 일치합니다
            </p>
          )}
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-4 bg-primary hover:bg-emerald-500 active:scale-[0.98] text-white text-[16px] font-bold rounded-2xl shadow-lg shadow-emerald-100 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
              </svg>
              변경 중...
            </span>
          ) : '비밀번호 변경하기'}
        </button>
      </form>
    </PageShell>
  );
}

export default PasswordReset;
