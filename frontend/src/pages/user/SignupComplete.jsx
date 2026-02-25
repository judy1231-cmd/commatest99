import { Link } from 'react-router-dom';

function SignupComplete() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F9F7F2] p-4">
      <div className="max-w-md w-full text-center">
        {/* Animation Circle */}
        <div className="relative w-32 h-32 mx-auto mb-8">
          <div className="absolute inset-0 bg-primary/20 rounded-full animate-ping"></div>
          <div className="relative w-32 h-32 bg-primary rounded-full flex items-center justify-center shadow-lg">
            <span className="material-symbols-outlined text-white text-5xl">check_circle</span>
          </div>
        </div>

        <h1 className="text-3xl font-black text-slate-800 mb-3">회원가입 완료!</h1>
        <p className="text-slate-500 mb-2">쉼표 가족이 되신 것을 환영해요.</p>
        <p className="text-slate-400 text-sm mb-10">이제 당신만의 휴식 여정을 시작해보세요.</p>

        <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm mb-6 text-left">
          <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
            <span className="material-icons text-primary">star</span>
            첫 번째 추천 활동
          </h3>
          <div className="space-y-3">
            {[
              { icon: 'psychology', text: '휴식 유형 테스트 참여하기', link: '/rest-test' },
              { icon: 'favorite', text: '심박수 체크해보기', link: '/heartrate' },
              { icon: 'map', text: '주변 쉼터 찾아보기', link: '/map' },
            ].map((item, i) => (
              <Link key={i} to={item.link} className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 hover:bg-soft-mint transition-colors">
                <span className="material-icons text-primary">{item.icon}</span>
                <span className="text-sm font-medium text-slate-700">{item.text}</span>
                <span className="material-icons text-slate-400 text-sm ml-auto">chevron_right</span>
              </Link>
            ))}
          </div>
        </div>

        <Link to="/" className="block w-full py-4 bg-primary text-white font-bold rounded-xl hover:bg-primary/90 transition-all active:scale-[0.98] shadow-lg mb-3">
          홈으로 시작하기
        </Link>
      </div>
    </div>
  );
}

export default SignupComplete;
