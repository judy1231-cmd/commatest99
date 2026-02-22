import { Link, useNavigate } from 'react-router-dom';

function Login() {
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    localStorage.setItem('isLoggedIn', 'true');
    navigate('/');
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[#f8fbfb]">
      {/* Decorative Background */}
      <div className="fixed top-0 left-0 -z-10 w-full h-full overflow-hidden pointer-events-none opacity-20">
        <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] rounded-full blur-[120px] bg-[#4fd1c5]/40"></div>
        <div className="absolute -bottom-[10%] -right-[10%] w-[40%] h-[40%] rounded-full blur-[120px] bg-[#4fd1c5]/40"></div>
      </div>

      <div className="max-w-md w-full">
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center text-white mb-4 shadow-lg">
            <span className="material-symbols-outlined text-3xl">spa</span>
          </div>
          <h1 className="text-3xl font-black text-[#221610] tracking-tight">쉼표</h1>
          <p className="text-gray-500 mt-2 font-medium">잠시 쉬어가는 시간, 로그인이 필요합니다.</p>
        </div>

        {/* Login Card */}
        <div className="bg-white rounded-xl shadow-xl p-8 border border-gray-100">
          <form className="space-y-5" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700 ml-1">이메일</label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-xl">mail</span>
                <input
                  className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all placeholder:text-gray-400"
                  placeholder="이메일을 입력하세요"
                  type="email"
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700 ml-1">비밀번호</label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-xl">lock</span>
                <input
                  className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all placeholder:text-gray-400"
                  placeholder="비밀번호를 입력하세요"
                  type="password"
                />
              </div>
            </div>
            <div className="flex items-center justify-between py-1">
              <label className="flex items-center gap-2 cursor-pointer">
                <input className="w-5 h-5 rounded border-gray-300 text-primary" type="checkbox" />
                <span className="text-sm text-gray-600">로그인 상태 유지</span>
              </label>
            </div>
            <button
              className="w-full bg-[#4fd1c5] hover:bg-[#3dbbb1] text-white font-bold py-4 rounded-lg shadow-lg transition-all active:scale-[0.98] flex items-center justify-center gap-2"
              type="submit"
            >
              로그인
            </button>
          </form>

          <div className="flex justify-center gap-4 mt-6 text-sm text-gray-500">
            <Link to="/password-reset" className="hover:text-primary transition-colors">비밀번호 찾기</Link>
            <span className="text-gray-300">|</span>
            <Link to="/signup" className="hover:text-primary transition-colors">회원가입</Link>
          </div>

          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-100"></div>
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white px-4 text-gray-400 font-medium">SNS 계정으로 시작하기</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <button className="flex items-center justify-center gap-2 py-3 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-all shadow-sm">
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05" />
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
              </svg>
              <span className="text-sm font-bold text-gray-700">구글</span>
            </button>
            <button className="flex items-center justify-center gap-2 py-3 bg-[#FEE500] rounded-lg hover:brightness-95 transition-all shadow-sm">
              <span className="material-symbols-outlined text-xl text-[#3c1e1e]">chat_bubble</span>
              <span className="text-sm font-bold text-[#3c1e1e]">카카오</span>
            </button>
          </div>
        </div>

        <p className="text-center mt-8 text-xs text-gray-400">
          © 2024 쉼표. All rights reserved.<br />
          따뜻한 휴식을 위한 커뮤니티
        </p>
      </div>
    </div>
  );
}

export default Login;
