import { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import UserNavbar from '../../components/user/UserNavbar';
import Toast from '../../components/common/Toast';

const KakaoLogo = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="#3c1e1e">
    <path d="M12 3C6.477 3 2 6.477 2 10.5c0 2.548 1.504 4.788 3.785 6.178l-.964 3.584a.25.25 0 0 0 .373.277L9.77 18.1A11.6 11.6 0 0 0 12 18c5.523 0 10-3.477 10-7.5S17.523 3 12 3z"/>
  </svg>
);

function Login() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [toast, setToast] = useState({ message: '', type: 'info' });

  useEffect(() => {
    if (searchParams.get('verified') === 'true') {
      setToast({ message: '이메일 인증이 완료되었습니다! 로그인해주세요.', type: 'success' });
    } else if (searchParams.get('verified') === 'false') {
      setToast({ message: '인증 링크가 유효하지 않거나 만료되었습니다.', type: 'error' });
    }
  }, []);

  const handleSocialLogin = (provider) => {
    if (provider === '카카오') {
      window.location.href = 'http://localhost:8080/api/auth/kakao/login';
      return;
    }
    setToast({ message: `${provider} 로그인은 준비 중이에요.`, type: 'info' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!identifier.trim()) {
      setError('아이디 또는 이메일을 입력해주세요.');
      return;
    }
    if (!password) {
      setError('비밀번호를 입력해주세요.');
      return;
    }

    try {
      setLoading(true);
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier, password })
      });
      const data = await res.json();

      if (!data.success) {
        setError(data.message);
        return;
      }

      // JWT 토큰 저장
      localStorage.setItem('accessToken', data.data.accessToken);
      localStorage.setItem('refreshToken', data.data.refreshToken);
      localStorage.setItem('user', JSON.stringify(data.data.user));

      navigate('/');
    } catch (e) {
      setError('서버에 연결할 수 없습니다. 잠시 후 다시 시도해주세요.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <UserNavbar />

      <main className="flex flex-col items-center justify-center min-h-[calc(100vh-64px)] px-6">
        <div className="w-full max-w-md py-12">

          {/* 로고 + 타이틀 */}
          <div className="text-center mb-12">
            <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center mx-auto mb-5 shadow-lg shadow-emerald-200">
              <img src="/logo_comma.png" alt="쉼표" className="w-8 h-8 object-contain" />
            </div>
            <h1 className="text-[28px] font-extrabold text-slate-900 tracking-tight">다시 만나서 반가워요</h1>
            <p className="text-slate-400 text-[15px] mt-2 font-medium">쉼표와 함께 오늘의 휴식을 시작해요</p>
          </div>

          {/* 에러 메시지 */}
          {error && (
            <div className="flex items-center gap-2 mb-6 text-red-500 text-sm font-medium">
              <span className="material-icons text-base">error_outline</span>
              {error}
            </div>
          )}

          {/* 입력 폼 */}
          <form className="space-y-5" onSubmit={handleSubmit}>
            {/* 아이디/이메일 */}
            <div className="space-y-2">
              <label className="text-[13px] font-bold text-slate-500 tracking-wide uppercase">아이디 또는 이메일</label>
              <input
                className="w-full px-0 py-3 bg-transparent border-0 border-b-2 border-slate-200 text-slate-900 text-[16px] font-medium placeholder:text-slate-300 focus:border-primary focus:outline-none transition-colors duration-200"
                placeholder="아이디 또는 이메일"
                type="text"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                disabled={loading}
                autoComplete="username"
              />
            </div>

            {/* 비밀번호 */}
            <div className="space-y-2">
              <label className="text-[13px] font-bold text-slate-500 tracking-wide uppercase">비밀번호</label>
              <input
                className="w-full px-0 py-3 bg-transparent border-0 border-b-2 border-slate-200 text-slate-900 text-[16px] font-medium placeholder:text-slate-300 focus:border-primary focus:outline-none transition-colors duration-200"
                placeholder="비밀번호"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
                autoComplete="current-password"
              />
            </div>

            {/* 비밀번호 찾기 */}
            <div className="flex justify-between items-center pt-1">
              <label className="flex items-center gap-2 cursor-pointer">
                <input className="w-4 h-4 rounded border-slate-300 text-primary focus:ring-primary" type="checkbox" />
                <span className="text-[13px] text-slate-400 font-medium">로그인 상태 유지</span>
              </label>
              <Link to="/password-reset" className="text-[13px] text-slate-400 font-medium hover:text-primary transition-colors">
                비밀번호 찾기
              </Link>
            </div>

            {/* 로그인 버튼 */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary hover:bg-emerald-500 active:scale-[0.98] text-white font-bold text-[16px] py-4 rounded-2xl shadow-lg shadow-emerald-100 transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed mt-2"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
                  </svg>
                  로그인 중...
                </span>
              ) : '로그인'}
            </button>
          </form>

          {/* 구분선 */}
          <div className="flex items-center gap-4 my-8">
            <div className="flex-1 h-px bg-slate-100" />
            <span className="text-[12px] text-slate-300 font-semibold tracking-widest">OR</span>
            <div className="flex-1 h-px bg-slate-100" />
          </div>

          {/* SNS 로그인 */}
          <div className="space-y-3">
            <button
              onClick={() => handleSocialLogin('구글')}
              className="w-full flex items-center gap-3 px-5 py-3.5 bg-white border border-slate-200 rounded-2xl hover:bg-slate-50 transition-all text-[14px] font-semibold text-slate-700"
            >
              <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05" />
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
              </svg>
              <span className="flex-1 text-center">Google로 계속하기</span>
            </button>

            <button
              onClick={() => handleSocialLogin('카카오')}
              className="w-full flex items-center gap-3 px-5 py-3.5 bg-[#FEE500] hover:brightness-95 rounded-2xl transition-all text-[14px] font-semibold text-[#3c1e1e]"
            >
              <KakaoLogo />
              <span className="flex-1 text-center">카카오로 계속하기</span>
            </button>

            <button
              onClick={() => handleSocialLogin('네이버')}
              className="w-full flex items-center gap-3 px-5 py-3.5 bg-[#03C75A] hover:brightness-95 rounded-2xl transition-all text-[14px] font-semibold text-white"
            >
              <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24" fill="white">
                <path d="M16.273 12.845L7.376 0H0v24h7.727V11.155L16.624 24H24V0h-7.727z"/>
              </svg>
              <span className="flex-1 text-center">네이버로 계속하기</span>
            </button>
          </div>

          {/* 회원가입 링크 */}
          <p className="text-center mt-10 text-[14px] text-slate-400 font-medium">
            아직 계정이 없으신가요?{' '}
            <Link to="/signup" className="text-primary font-bold hover:underline">
              회원가입
            </Link>
          </p>

        </div>
      </main>

      <Toast message={toast.message} type={toast.type} onClose={() => setToast({ message: '', type: 'info' })} />
    </div>
  );
}

export default Login;
