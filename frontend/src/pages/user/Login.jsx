import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import UserNavbar from '../../components/user/UserNavbar';

const KakaoLogo = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="#3c1e1e">
    <path d="M12 3C6.477 3 2 6.477 2 10.5c0 2.548 1.504 4.788 3.785 6.178l-.964 3.584a.25.25 0 0 0 .373.277L9.77 18.1A11.6 11.6 0 0 0 12 18c5.523 0 10-3.477 10-7.5S17.523 3 12 3z"/>
  </svg>
);

function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!email.trim()) {
      setError('이메일을 입력해주세요.');
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
        body: JSON.stringify({ email, password })
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
    <div className="min-h-screen bg-[#F9F7F2]">
      <UserNavbar />

      <main className="flex items-center justify-center px-4 py-16">
        <div className="w-full max-w-md">

          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-14 h-14 bg-primary rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-soft">
              <span className="text-white font-black text-2xl">,</span>
            </div>
            <h1 className="text-2xl font-bold text-slate-800">다시 만나서 반가워요</h1>
            <p className="text-slate-500 text-sm mt-2">쉼표와 함께 오늘의 휴식을 시작해보세요</p>
          </div>

          {/* Card */}
          <div className="bg-white rounded-2xl shadow-soft border border-slate-100 p-8">
            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600">
                {error}
              </div>
            )}

            <form className="space-y-4" onSubmit={handleSubmit}>
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-slate-700">이메일</label>
                <div className="relative">
                  <span className="material-icons absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-xl">mail</span>
                  <input
                    className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all placeholder:text-slate-400"
                    placeholder="이메일을 입력하세요"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={loading}
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-slate-700">비밀번호</label>
                <div className="relative">
                  <span className="material-icons absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-xl">lock</span>
                  <input
                    className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all placeholder:text-slate-400"
                    placeholder="비밀번호를 입력하세요"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={loading}
                  />
                </div>
              </div>

              <div className="flex items-center justify-between py-1">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input className="w-4 h-4 rounded border-slate-300 text-primary focus:ring-primary" type="checkbox" />
                  <span className="text-sm text-slate-500">로그인 상태 유지</span>
                </label>
                <Link to="/password-reset" className="text-sm text-slate-400 hover:text-primary transition-colors">비밀번호 찾기</Link>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-primary hover:bg-primary/90 text-white font-bold py-3.5 rounded-xl shadow-soft transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? '로그인 중...' : '로그인'}
              </button>
            </form>

            {/* Divider */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-100"></div>
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="bg-white px-4 text-slate-400">SNS 계정으로 시작하기</span>
              </div>
            </div>

            {/* SNS */}
            <div className="grid grid-cols-2 gap-3">
              <button className="flex items-center justify-center gap-2 py-3 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-all shadow-sm text-sm font-semibold text-slate-700">
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05" />
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                </svg>
                구글
              </button>
              <button className="flex items-center justify-center gap-2 py-3 bg-[#FEE500] hover:brightness-95 rounded-xl transition-all text-sm font-semibold text-[#3c1e1e]">
                <KakaoLogo />
                카카오
              </button>
            </div>

            <p className="text-center mt-6 text-sm text-slate-400">
              아직 계정이 없으신가요?{' '}
              <Link to="/signup" className="text-primary font-bold hover:underline">회원가입</Link>
            </p>
          </div>

        </div>
      </main>
    </div>
  );
}

export default Login;
