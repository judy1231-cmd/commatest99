import { Link } from 'react-router-dom';

function Signup() {
  return (
    <div className="min-h-screen flex flex-col bg-[#f8f9fa]">
      {/* Nav */}
      <nav className="w-full px-6 py-4 flex justify-between items-center border-b border-primary/10 bg-white/50 backdrop-blur-md sticky top-0 z-50">
        <div className="flex items-center gap-2 text-primary">
          <span className="material-symbols-outlined text-3xl font-bold">spa</span>
          <span className="text-2xl font-bold tracking-tight">쉼표</span>
        </div>
        <Link to="/login" className="text-sm font-semibold text-gray-600 hover:text-primary transition-colors">도움말</Link>
      </nav>

      <main className="flex-1 flex items-center justify-center p-6 sm:p-12">
        <div className="w-full max-w-[520px] bg-white rounded-xl shadow-xl p-8 md:p-12 border border-primary/5">
          <div className="text-center mb-10">
            <h1 className="text-3xl font-bold text-gray-900 mb-3">반가워요!</h1>
            <p className="text-gray-500">쉼표와 함께 따뜻한 휴식을 시작해보세요.</p>
          </div>

          <form className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">이메일 주소</label>
              <input
                className="w-full h-14 px-4 rounded-xl border border-gray-200 bg-gray-50 text-gray-900 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                placeholder="example@email.com"
                type="email"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">비밀번호</label>
              <div className="relative">
                <input
                  className="w-full h-14 px-4 rounded-xl border border-gray-200 bg-gray-50 text-gray-900 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                  placeholder="8자 이상 영문, 숫자 조합"
                  type="password"
                />
                <button className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-primary" type="button">
                  <span className="material-symbols-outlined">visibility</span>
                </button>
              </div>
              <div className="mt-3 flex items-center gap-2">
                <div className="flex-1 h-1.5 rounded-full bg-gray-200 overflow-hidden">
                  <div className="h-full bg-primary w-2/3"></div>
                </div>
                <span className="text-xs font-medium text-primary">보통</span>
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">비밀번호 확인</label>
              <input
                className="w-full h-14 px-4 rounded-xl border border-gray-200 bg-gray-50 text-gray-900 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                placeholder="비밀번호를 한번 더 입력해주세요"
                type="password"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">닉네임</label>
              <input
                className="w-full h-14 px-4 rounded-xl border border-gray-200 bg-gray-50 text-gray-900 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                placeholder="사용하실 닉네임을 입력해주세요"
                type="text"
              />
            </div>

            <div className="pt-4 border-t border-gray-100 space-y-4">
              <label className="flex items-center gap-3 cursor-pointer">
                <input className="w-5 h-5 rounded border-gray-300 text-primary focus:ring-primary" type="checkbox" />
                <span className="text-sm font-bold text-gray-900">전체 동의하기</span>
              </label>
              <div className="pl-8 space-y-3">
                <label className="flex items-center justify-between cursor-pointer">
                  <div className="flex items-center gap-3">
                    <input className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary" type="checkbox" />
                    <span className="text-xs text-gray-600">(필수) 만 14세 이상입니다</span>
                  </div>
                </label>
                <label className="flex items-center justify-between cursor-pointer">
                  <div className="flex items-center gap-3">
                    <input className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary" type="checkbox" />
                    <span className="text-xs text-gray-600">(필수) 이용약관 동의</span>
                  </div>
                  <span className="material-symbols-outlined text-gray-400 text-lg">chevron_right</span>
                </label>
                <label className="flex items-center justify-between cursor-pointer">
                  <div className="flex items-center gap-3">
                    <input className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary" type="checkbox" />
                    <span className="text-xs text-gray-600">(필수) 개인정보 수집 및 이용 동의</span>
                  </div>
                  <span className="material-symbols-outlined text-gray-400 text-lg">chevron_right</span>
                </label>
              </div>
            </div>

            <Link to="/signup-complete">
              <button
                className="w-full h-14 bg-primary hover:bg-primary/90 text-white font-bold text-lg rounded-xl transition-all shadow-lg active:scale-[0.98]"
                type="submit"
              >
                회원가입 완료
              </button>
            </Link>
          </form>

          <div className="mt-10">
            <div className="relative flex items-center justify-center mb-8">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200"></div>
              </div>
              <span className="relative px-4 bg-white text-xs text-gray-400 uppercase tracking-widest">간편 회원가입</span>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <button className="flex items-center justify-center gap-2 h-12 rounded-xl bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 font-semibold text-sm transition-all shadow-sm">
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05" />
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                </svg>
                구글
              </button>
              <button className="flex items-center justify-center gap-2 h-12 rounded-xl bg-[#FEE500] hover:bg-[#fada0a] text-[#3c1e1e] font-semibold text-sm transition-all">
                <span className="material-symbols-outlined text-xl">chat_bubble</span>
                카카오
              </button>
            </div>
          </div>

          <div className="mt-10 text-center">
            <p className="text-sm text-gray-500">
              이미 계정이 있으신가요?
              <Link to="/login" className="text-primary font-bold hover:underline ml-1">로그인하기</Link>
            </p>
          </div>
        </div>
      </main>

      <footer className="w-full py-8 text-center bg-gray-50 border-t border-gray-100">
        <p className="text-xs text-gray-400">© 2024 쉼표. All rights reserved.</p>
      </footer>
    </div>
  );
}

export default Signup;
