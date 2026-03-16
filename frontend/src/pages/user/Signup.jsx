import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Toast from '../../components/common/Toast';

const KakaoLogo = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="#3c1e1e">
    <path d="M12 3C6.477 3 2 6.477 2 10.5c0 2.548 1.504 4.788 3.785 6.178l-.964 3.584a.25.25 0 0 0 .373.277L9.77 18.1A11.6 11.6 0 0 0 12 18c5.523 0 10-3.477 10-7.5S17.523 3 12 3z"/>
  </svg>
);

// 스텝 정의
const STEPS = ['계정 정보', '비밀번호', '약관 동의'];

function Signup() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    email: '',
    username: '',
    password: '',
    passwordConfirm: ''
  });
  const [agreements, setAgreements] = useState({
    all: false,
    age: false,
    terms: false,
    privacy: false,
    marketing: false
  });
  const [expandedTerm, setExpandedTerm] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [toast, setToast] = useState(null);
  const [step, setStep] = useState(1); // 1 | 2 | 3

  const handleSocialLogin = (provider) => {
    if (provider === '카카오') {
      window.location.href = '/api/auth/kakao/login';
      return;
    }
    setToast({ message: `${provider} 로그인은 준비 중이에요.`, type: 'info' });
  };
  const [usernameCheck, setUsernameCheck] = useState({ status: null, message: '' });
  const [usernameChecking, setUsernameChecking] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    if (e.target.name === 'username') {
      setUsernameCheck({ status: null, message: '' });
    }
  };

  const handleCheckUsername = async () => {
    if (!form.username.trim()) {
      setUsernameCheck({ status: 'error', message: '아이디를 입력해주세요.' });
      return;
    }
    try {
      setUsernameChecking(true);
      const res = await fetch(`/api/auth/check/username?username=${encodeURIComponent(form.username.trim())}`);
      const data = await res.json();
      if (data.success) {
        setUsernameCheck({ status: 'ok', message: '사용 가능한 아이디입니다.' });
      } else {
        setUsernameCheck({ status: 'error', message: data.message });
      }
    } catch {
      setUsernameCheck({ status: 'error', message: '확인 중 오류가 발생했습니다.' });
    } finally {
      setUsernameChecking(false);
    }
  };

  const handleAgreementChange = (key) => {
    if (key === 'all') {
      const newValue = !agreements.all;
      setAgreements({ all: newValue, age: newValue, terms: newValue, privacy: newValue, marketing: newValue });
    } else {
      const updated = { ...agreements, [key]: !agreements[key] };
      updated.all = updated.age && updated.terms && updated.privacy && updated.marketing;
      setAgreements(updated);
    }
  };

  const TERM_DETAILS = {
    terms: `제1조 (목적)\n본 약관은 쉼표(이하 "서비스")가 제공하는 휴식 추천 플랫폼 서비스의 이용과 관련하여 필요한 사항을 규정합니다.\n\n제2조 (서비스 이용)\n회원은 서비스를 통해 휴식 진단, 장소 추천, 기록 관리 등의 기능을 이용할 수 있습니다.\n\n제3조 (이용 제한)\n타인의 정보를 무단으로 사용하거나 서비스를 악의적으로 이용하는 경우 이용이 제한될 수 있습니다.\n\n제4조 (면책조항)\n서비스는 천재지변, 불가항력적 사유로 인한 서비스 중단에 대해 책임을 지지 않습니다.`,
    privacy: `수집 항목: 이메일, 아이디, 닉네임, 심박수 측정 데이터, 설문 응답, 휴식 기록\n\n수집 목적: 회원 식별 및 인증, 휴식 유형 진단 및 맞춤 추천, 서비스 개선\n\n보유 기간: 회원 탈퇴 시까지 (단, 관계 법령에 따라 일정 기간 보관)\n\n귀하는 개인정보 수집에 동의하지 않을 권리가 있으나, 동의 거부 시 서비스 이용이 불가합니다.`,
    marketing: `수집 항목: 이메일, 이용 기록\n\n수집 목적: 신규 서비스 및 이벤트 안내, 맞춤형 혜택 정보 발송\n\n보유 기간: 동의 철회 시까지\n\n귀하는 마케팅 정보 수신에 동의하지 않아도 서비스를 정상 이용할 수 있습니다.`,
  };

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

  // 스텝별 다음 버튼 유효성
  const handleNextStep = () => {
    setError(null);
    if (step === 1) {
      if (!form.email.trim()) { setError('이메일을 입력해주세요.'); return; }
      if (!form.username.trim()) { setError('아이디를 입력해주세요.'); return; }
      if (form.username.length < 2 || form.username.length > 20) { setError('아이디는 2~20자로 입력해주세요.'); return; }
      if (usernameCheck.status !== 'ok') { setError('아이디 중복확인을 해주세요.'); return; }
    }
    if (step === 2) {
      if (form.password.length < 8) { setError('비밀번호는 8자 이상이어야 합니다.'); return; }
      if (form.password !== form.passwordConfirm) { setError('비밀번호가 일치하지 않습니다.'); return; }
    }
    setStep(step + 1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!form.email.trim()) { setError('이메일을 입력해주세요.'); return; }
    if (!form.username.trim()) { setError('아이디를 입력해주세요.'); return; }
    if (form.username.length < 2 || form.username.length > 20) { setError('아이디는 2~20자로 입력해주세요.'); return; }
    if (usernameCheck.status !== 'ok') { setError('아이디 중복확인을 해주세요.'); return; }
    if (form.password.length < 8) { setError('비밀번호는 8자 이상이어야 합니다.'); return; }
    if (form.password !== form.passwordConfirm) { setError('비밀번호가 일치하지 않습니다.'); return; }
    if (!agreements.age || !agreements.terms || !agreements.privacy) {
      setError('필수 약관에 모두 동의해주세요.');
      return;
    }

    try {
      setLoading(true);
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: form.email,
          username: form.username,
          password: form.password
        })
      });
      const data = await res.json();
      if (!data.success) { setError(data.message); return; }
      navigate('/signup-complete');
    } catch (e) {
      setError('서버에 연결할 수 없습니다. 잠시 후 다시 시도해주세요.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-white">

      {/* 상단 네비게이션 */}
      <nav className="sticky top-0 z-50 bg-white border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5 hover:opacity-80 transition-opacity">
            <div className="w-9 h-9 bg-primary rounded-xl flex items-center justify-center shadow-sm overflow-hidden">
              <img src="/logo_comma.png" alt="쉼표" className="w-4 h-4 object-contain" />
            </div>
            <span className="text-xl font-extrabold tracking-tight text-slate-900">쉼표</span>
          </Link>
          <Link to="/login" className="text-sm font-semibold text-slate-500 hover:text-primary transition-colors">로그인하기</Link>
        </div>

        {/* Progress bar */}
        <div className="h-0.5 bg-slate-100">
          <div
            className="h-full bg-primary transition-all duration-500 ease-out"
            style={{ width: `${(step / 3) * 100}%` }}
          />
        </div>
      </nav>

      <main className="flex-1 flex items-start justify-center pt-10 pb-32 px-6">
        <div className="w-full max-w-[480px]">

          {/* Step indicator */}
          <div className="flex items-center justify-between mb-10">
            {STEPS.map((label, i) => {
              const n = i + 1;
              const isActive = n === step;
              const isDone = n < step;
              return (
                <div key={label} className="flex items-center gap-2">
                  <div className={`flex items-center justify-center w-7 h-7 rounded-full text-[13px] font-bold transition-all ${
                    isDone ? 'bg-primary text-white' :
                    isActive ? 'bg-primary text-white shadow-lg shadow-emerald-200' :
                    'bg-slate-100 text-slate-400'
                  }`}>
                    {isDone
                      ? <span className="material-icons text-[15px]">check</span>
                      : n}
                  </div>
                  <span className={`text-[13px] font-semibold hidden sm:block ${isActive ? 'text-slate-800' : isDone ? 'text-primary' : 'text-slate-400'}`}>
                    {label}
                  </span>
                  {i < STEPS.length - 1 && (
                    <div className={`w-12 h-px mx-2 ${isDone ? 'bg-primary' : 'bg-slate-200'}`} />
                  )}
                </div>
              );
            })}
          </div>

          {/* 타이틀 */}
          <div className="mb-8">
            <h1 className="text-[26px] font-extrabold text-slate-900 tracking-tight">
              {step === 1 && '반가워요 👋'}
              {step === 2 && '비밀번호 설정'}
              {step === 3 && '거의 다 왔어요'}
            </h1>
            <p className="text-slate-400 text-[15px] mt-1.5 font-medium">
              {step === 1 && '로그인에 사용할 계정 정보를 입력해주세요'}
              {step === 2 && '안전한 비밀번호를 설정해주세요'}
              {step === 3 && '서비스 이용을 위해 약관에 동의해주세요'}
            </p>
          </div>

          {/* 에러 메시지 */}
          {error && (
            <div className="flex items-center gap-2 mb-6 text-red-500 text-sm font-medium">
              <span className="material-icons text-base flex-shrink-0">error_outline</span>
              {error}
            </div>
          )}

          {/* ==================== STEP 1: 계정 정보 ==================== */}
          {step === 1 && (
            <div className="space-y-7">
              {/* 이메일 */}
              <div className="space-y-2">
                <label className="text-[13px] font-bold text-slate-500 tracking-wide uppercase">이메일 주소</label>
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

              {/* 아이디 */}
              <div className="space-y-2">
                <label className="text-[13px] font-bold text-slate-500 tracking-wide uppercase">아이디</label>
                <div className="flex items-end gap-3">
                  <input
                    className={`flex-1 px-0 py-3 bg-transparent border-0 border-b-2 text-slate-900 text-[16px] font-medium placeholder:text-slate-300 focus:outline-none transition-colors ${
                      usernameCheck.status === 'ok' ? 'border-primary' :
                      usernameCheck.status === 'error' ? 'border-red-400' :
                      'border-slate-200 focus:border-primary'
                    }`}
                    placeholder="2~20자 영문, 숫자"
                    type="text"
                    name="username"
                    value={form.username}
                    onChange={handleChange}
                    disabled={loading}
                  />
                  <button
                    type="button"
                    onClick={handleCheckUsername}
                    disabled={usernameChecking || loading}
                    className="shrink-0 px-4 py-2 rounded-xl border-2 border-primary text-primary text-[13px] font-bold hover:bg-primary hover:text-white transition-all disabled:opacity-40 whitespace-nowrap mb-1"
                  >
                    {usernameChecking ? '확인 중' : '중복확인'}
                  </button>
                </div>
                {usernameCheck.status === 'ok' && (
                  <p className="flex items-center gap-1 text-[12px] text-primary font-medium pt-0.5">
                    <span className="material-icons text-[14px]">check_circle</span>
                    {usernameCheck.message}
                  </p>
                )}
                {usernameCheck.status === 'error' && (
                  <p className="flex items-center gap-1 text-[12px] text-red-500 font-medium pt-0.5">
                    <span className="material-icons text-[14px]">cancel</span>
                    {usernameCheck.message}
                  </p>
                )}
              </div>

              {/* 간편가입 */}
              <div className="pt-2">
                <div className="flex items-center gap-3 mb-4">
                  <div className="flex-1 h-px bg-slate-100" />
                  <span className="text-[12px] text-slate-300 font-semibold tracking-widest">간편 회원가입</span>
                  <div className="flex-1 h-px bg-slate-100" />
                </div>
                <div className="flex gap-3">
                  <button type="button" onClick={() => handleSocialLogin('구글')}
                    className="flex-1 flex items-center justify-center gap-2 py-3 bg-white border border-slate-200 rounded-2xl hover:bg-slate-50 transition-all text-[13px] font-semibold text-slate-700">
                    <svg className="w-4 h-4" viewBox="0 0 24 24">
                      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
                      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                    </svg>
                    Google
                  </button>
                  <button type="button" onClick={() => handleSocialLogin('카카오')}
                    className="flex-1 flex items-center justify-center gap-2 py-3 bg-[#FEE500] hover:brightness-95 rounded-2xl transition-all text-[13px] font-semibold text-[#3c1e1e]">
                    <KakaoLogo />
                    카카오
                  </button>
                  <button type="button" onClick={() => handleSocialLogin('네이버')}
                    className="flex-1 flex items-center justify-center gap-2 py-3 bg-[#03C75A] hover:brightness-95 rounded-2xl transition-all text-[13px] font-semibold text-white">
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="white">
                      <path d="M16.273 12.845L7.376 0H0v24h7.727V11.155L16.624 24H24V0h-7.727z"/>
                    </svg>
                    네이버
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ==================== STEP 2: 비밀번호 ==================== */}
          {step === 2 && (
            <div className="space-y-7">
              <div className="space-y-2">
                <label className="text-[13px] font-bold text-slate-500 tracking-wide uppercase">비밀번호</label>
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
                        <div key={n} className={`h-1 flex-1 rounded-full transition-all ${n <= strength.level ? strength.color : 'bg-slate-100'}`} />
                      ))}
                    </div>
                    <span className={`text-[12px] font-bold w-8 text-right ${
                      strength.level <= 1 ? 'text-red-400' :
                      strength.level === 2 ? 'text-yellow-500' :
                      'text-primary'
                    }`}>{strength.label}</span>
                  </div>
                )}
                <p className="text-[12px] text-slate-400 pt-1">영문, 숫자, 특수문자를 조합하면 더 안전해요</p>
              </div>

              <div className="space-y-2">
                <label className="text-[13px] font-bold text-slate-500 tracking-wide uppercase">비밀번호 확인</label>
                <input
                  className={`w-full px-0 py-3 bg-transparent border-0 border-b-2 text-slate-900 text-[16px] font-medium placeholder:text-slate-300 focus:outline-none transition-colors ${
                    form.passwordConfirm && form.password !== form.passwordConfirm
                      ? 'border-red-400'
                      : form.passwordConfirm && form.password === form.passwordConfirm
                      ? 'border-primary'
                      : 'border-slate-200 focus:border-primary'
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
          )}

          {/* ==================== STEP 3: 약관 동의 ==================== */}
          {step === 3 && (
            <form onSubmit={handleSubmit}>
              <div className="space-y-3">
                {/* 전체 동의 */}
                <label className={`flex items-center gap-4 p-5 rounded-2xl border-2 cursor-pointer transition-all ${
                  agreements.all ? 'border-primary bg-emerald-50/60' : 'border-slate-200 bg-slate-50/50 hover:border-slate-300'
                }`}>
                  <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all ${
                    agreements.all ? 'bg-primary border-primary' : 'border-slate-300'
                  }`}>
                    {agreements.all && <span className="material-icons text-white text-[14px]">check</span>}
                  </div>
                  <input type="checkbox" className="hidden" checked={agreements.all} onChange={() => handleAgreementChange('all')} />
                  <div>
                    <p className="text-[15px] font-bold text-slate-900">약관 전체 동의</p>
                    <p className="text-[12px] text-slate-400 mt-0.5">선택 항목 포함 모든 약관에 동의합니다</p>
                  </div>
                </label>

                {/* 구분선 */}
                <div className="h-px bg-slate-100 mx-1" />

                {/* 개별 항목 */}
                {[
                  { key: 'age',       label: '만 14세 이상입니다',             required: true,  detail: false },
                  { key: 'terms',     label: '서비스 이용약관 동의',             required: true,  detail: true  },
                  { key: 'privacy',   label: '개인정보 수집 및 이용 동의',       required: true,  detail: true  },
                  { key: 'marketing', label: '마케팅 정보 수신 동의',            required: false, detail: true  },
                ].map(({ key, label, required, detail }) => (
                  <div key={key}>
                    <div className="flex items-center gap-4 px-2 py-3 group">
                      <div
                        className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all cursor-pointer ${
                          agreements[key] ? 'bg-primary border-primary' : 'border-slate-300 group-hover:border-primary/50'
                        }`}
                        onClick={() => handleAgreementChange(key)}
                      >
                        {agreements[key] && <span className="material-icons text-white text-[12px]">check</span>}
                      </div>
                      <span
                        className="flex-1 text-[14px] text-slate-700 font-medium cursor-pointer"
                        onClick={() => handleAgreementChange(key)}
                      >
                        <span className={`text-[11px] font-bold mr-1.5 ${required ? 'text-primary' : 'text-slate-400'}`}>
                          {required ? '[필수]' : '[선택]'}
                        </span>
                        {label}
                      </span>
                      {detail && (
                        <button
                          type="button"
                          onClick={() => setExpandedTerm(expandedTerm === key ? null : key)}
                          className="p-1 transition-colors"
                        >
                          <span className={`material-icons text-[18px] transition-transform duration-200 ${
                            expandedTerm === key ? 'rotate-90 text-primary' : 'text-slate-300 hover:text-slate-400'
                          }`}>chevron_right</span>
                        </button>
                      )}
                    </div>
                    {detail && expandedTerm === key && (
                      <div className="mx-2 mb-2 p-4 bg-slate-50 rounded-xl border border-slate-100">
                        <p className="text-[12px] text-slate-500 leading-relaxed whitespace-pre-line">
                          {TERM_DETAILS[key]}
                        </p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </form>
          )}

        </div>
      </main>

      {/* 하단 고정 버튼 */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-slate-100 px-6 py-4 shadow-[0_-4px_20px_rgba(0,0,0,0.04)]">
        <div className="max-w-[480px] mx-auto space-y-3">
          {step < 3 ? (
            <button
              type="button"
              onClick={handleNextStep}
              className="w-full bg-primary hover:bg-emerald-500 active:scale-[0.98] text-white font-bold text-[16px] py-4 rounded-2xl shadow-lg shadow-emerald-100 transition-all"
            >
              다음
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSubmit}
              disabled={loading}
              className="w-full bg-primary hover:bg-emerald-500 active:scale-[0.98] text-white font-bold text-[16px] py-4 rounded-2xl shadow-lg shadow-emerald-100 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
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

          {step > 1 && (
            <button
              type="button"
              onClick={() => { setStep(step - 1); setError(null); }}
              className="w-full py-3 text-[14px] font-semibold text-slate-400 hover:text-slate-600 transition-colors"
            >
              이전으로
            </button>
          )}

          {step === 1 && (
            <p className="text-center text-[13px] text-slate-400 font-medium">
              이미 계정이 있으신가요?{' '}
              <Link to="/login" className="text-primary font-bold hover:underline">로그인하기</Link>
            </p>
          )}
        </div>
      </div>

      {toast && (
        <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />
      )}
    </div>
  );
}

export default Signup;
