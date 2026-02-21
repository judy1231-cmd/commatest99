import { Link } from 'react-router-dom';

function PasswordReset() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[#f8fbfb]">
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
          <form className="space-y-5">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700 ml-1">가입한 이메일</label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-xl">mail</span>
                <input
                  className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all placeholder:text-gray-400"
                  placeholder="이메일을 입력하세요"
                  type="email"
                />
              </div>
            </div>

            <button
              className="w-full bg-[#4fd1c5] hover:bg-[#3dbbb1] text-white font-bold py-4 rounded-lg shadow-lg transition-all active:scale-[0.98]"
              type="submit"
            >
              재설정 링크 보내기
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
