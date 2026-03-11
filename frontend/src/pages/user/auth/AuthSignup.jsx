import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

function AuthSignup() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    passwordConfirm: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [step, setStep] = useState(1);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // 비밀번호 강도 계산
  const getPasswordStrength = () => {
    const pw = form.password;
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
  };

  const strength = getPasswordStrength();

  const handleNextStep = () => {
    setError(null);
    if (!form.name.trim()) { setError('이름을 입력해주세요.'); return; }
    if (!form.email.trim()) { setError('이메일을 입력해주세요.'); return; }
    setStep(2);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!form.name.trim()) { setError('이름을 입력해주세요.'); return; }
    if (!form.email.trim()) { setError('이메일을 입력해주세요.'); return; }
    if (form.password.length < 8) { setError('비밀번호는 8자 이상이어야 합니다.'); return; }
    if (form.password !== form.passwordConfirm) { setError('비밀번호가 일치하지 않습니다.'); return; }

    try {
      setLoading(true);
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          password: form.password
        })
      });
      const data = await res.json();
      if (!data.success) { setError(data.message); return; }
      navigate('/signup-complete');
    } catch {
      setError('서버에 연결할 수 없습니다. 잠시 후 다시 시도해주세요.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-white">

      {/* 상단 네비 + 진행바 */}
      <nav className="sticky top-0 z-50 bg-white border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center gap-3">
          {step === 1 ? (
            <Link
              to="/auth/login"
              className="w-9 h-9 flex items-center justify-center rounded-xl hover:bg-slate-100 transition-colors"
            >
              <span className="material-icons text-slate-500 text-[20px]">arrow_back</span>
            </Link>
          ) : (
            <button
              onClick={() => { setStep(1); setError(null); }}
              className="w-9 h-9 flex items-center justify-center rounded-xl hover:bg-slate-100 transition-colors"
            >
              <span className="material-icons text-slate-500 text-[20px]">arrow_back</span>
            </button>
          )}
          <span className="text-[15px] font-bold text-slate-900">회원가입</span>
        </div>
        {/* 진행바 */}
        <div className="h-0.5 bg-slate-100">
          <div
            className="h-full bg-primary transition-all duration-500 ease-out"
            style={{ width: `${(step / 2) * 100}%` }}
          />
        </div>
      </nav>

      <main className="flex-1 px-6 pt-12 pb-32 flex justify-center">
        <div className="w-full max-w-[420px]">

          {/* STEP 1: 계정 정보 */}
          {step === 1 && (
            <>
              <div className="mb-10">
                <p className="text-[12px] font-bold text-slate-400 tracking-widest uppercase mb-3">STEP 1 / 2</p>
                <h1 className="text-[26px] font-extrabold text-slate-900 tracking-tight mb-2">
                  기본 정보 입력
                </h1>
                <p className="text-[14px] text-slate-400 font-medium leading-relaxed">
                  쉼표에서 사용할 이름과 이메일을 입력해주세요
                </p>
              </div>

              {error && (
                <div className="flex items-center gap-2 mb-6 text-red-500 text-[13px] font-medium">
                  <span className="material-icons text-[15px] flex-shrink-0">error_outline</span>
                  {error}
                </div>
              )}

              <div className="space-y-8">
                {/* 이름 */}
                <div className="space-y-2">
                  <label className="text-[12px] font-bold text-slate-400 tracking-widest uppercase">이름</label>
                  <input
                    className="w-full px-0 py-3 bg-transparent border-0 border-b-2 border-slate-200 text-slate-900 text-[16px] font-medium placeholder:text-slate-300 focus:border-primary focus:outline-none transition-colors"
                    placeholder="홍길동"
                    type="text"
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    disabled={loading}
                  />
                </div>

                {/* 이메일 */}
                <div className="space-y-2">
                  <label className="text-[12px] font-bold text-slate-400 tracking-widest uppercase">이메일 주소</label>
                  <input
                    className="w-full px-0 py-3 bg-transparent border-0 border-b-2 border-slate-200 text-slate-900 text-[16px] font-medium placeholder:text-slate-300 focus:border-primary focus:outline-none transition-colors"
                    placeholder="example@email.com"
                    type="email"
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                    disabled={loading}
                  />
                </div>
              </div>
            </>
          )}

          {/* STEP 2: 비밀번호 */}
          {step === 2 && (
            <form onSubmit={handleSubmit}>
              <div className="mb-10">
                <p className="text-[12px] font-bold text-slate-400 tracking-widest uppercase mb-3">STEP 2 / 2</p>
                <h1 className="text-[26px] font-extrabold text-slate-900 tracking-tight mb-2">
                  비밀번호 설정
                </h1>
                <p className="text-[14px] text-slate-400 font-medium leading-relaxed">
                  안전한 비밀번호를 설정해주세요
                </p>
              </div>

              {error && (
                <div className="flex items-center gap-2 mb-6 text-red-500 text-[13px] font-medium">
                  <span className="material-icons text-[15px] flex-shrink-0">error_outline</span>
                  {error}
                </div>
              )}

              <div className="space-y-8">
                {/* 비밀번호 */}
                <div className="space-y-2">
                  <label className="text-[12px] font-bold text-slate-400 tracking-widest uppercase">비밀번호</label>
                  <input
                    className="w-full px-0 py-3 bg-transparent border-0 border-b-2 border-slate-200 text-slate-900 text-[16px] font-medium placeholder:text-slate-300 focus:border-primary focus:outline-none transition-colors"
                    placeholder="8자 이상 영문, 숫자 조합"
                    type="password"
                    name="password"
                    value={form.password}
                    onChange={handleChange}
                    disabled={loading}
                  />
                  {form.password && (
                    <div className="flex items-center gap-3 pt-1">
                      <div className="flex gap-1 flex-1">
                        {[1, 2, 3, 4].map((n) => (
                          <div
                            key={n}
                            className={`h-1 flex-1 rounded-full transition-all ${n <= strength.level ? strength.color : 'bg-slate-100'}`}
                          />
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
                      form.passwordConfirm && form.password !== form.passwordConfirm ? 'border-red-400' :
                      form.passwordConfirm && form.password === form.passwordConfirm ? 'border-primary' :
                      'border-slate-200 focus:border-primary'
                    }`}
                    placeholder="비밀번호를 한 번 더 입력해주세요"
                    type="password"
                    name="passwordConfirm"
                    value={form.passwordConfirm}
                    onChange={handleChange}
                    disabled={loading}
                  />
                  {form.passwordConfirm && form.password !== form.passwordConfirm && (
                    <p className="flex items-center gap-1 text-[12px] text-red-500 font-medium pt-0.5">
                      <span className="material-icons text-[14px]">cancel</span>
                      비밀번호가 일치하지 않습니다
                    </p>
                  )}
                  {form.passwordConfirm && form.password === form.passwordConfirm && (
                    <p className="flex items-center gap-1 text-[12px] text-primary font-medium pt-0.5">
                      <span className="material-icons text-[14px]">check_circle</span>
                      비밀번호가 일치합니다
                    </p>
                  )}
                </div>
              </div>
            </form>
          )}

        </div>
      </main>

      {/* 하단 고정 버튼 */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-100 px-6 py-4">
        <div className="max-w-[420px] mx-auto space-y-3">
          {step === 1 ? (
            <button
              onClick={handleNextStep}
              className="w-full py-4 bg-primary hover:bg-emerald-500 active:scale-[0.98] text-white text-[16px] font-bold rounded-2xl shadow-lg shadow-emerald-100 transition-all"
            >
              다음
            </button>
          ) : (
            <button
              type="submit"
              onClick={handleSubmit}
              disabled={loading}
              className="w-full py-4 bg-primary hover:bg-emerald-500 active:scale-[0.98] text-white text-[16px] font-bold rounded-2xl shadow-lg shadow-emerald-100 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
                  </svg>
                  가입 처리 중...
                </span>
              ) : '회원가입 완료'}
            </button>
          )}

          <p className="text-center text-[13px] text-slate-400 font-medium">
            이미 계정이 있으신가요?{' '}
            <Link to="/auth/login" className="text-primary font-bold hover:underline">
              로그인하기
            </Link>
          </p>
        </div>
      </div>

    </div>
  );
}

export default AuthSignup;
