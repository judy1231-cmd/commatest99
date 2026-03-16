import { Link, useSearchParams } from 'react-router-dom';

function SignupComplete() {
  const [searchParams] = useSearchParams();
  const isSocial = searchParams.get('social') === 'true';

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white px-6 py-20">
      <div className="w-full max-w-sm text-center">

        {/* 체크마크 아이콘 */}
        <div className="relative w-28 h-28 mx-auto mb-10">
          <div className="absolute inset-0 bg-primary/10 rounded-full animate-ping" />
          <div className="absolute inset-0 bg-primary/5 rounded-full scale-110" />
          <div className="relative w-28 h-28 bg-primary rounded-full flex items-center justify-center shadow-2xl shadow-emerald-200">
            <span className="material-icons text-white text-[52px]">check</span>
          </div>
        </div>

        {/* 메인 타이틀 */}
        <h1 className="text-[36px] font-extrabold text-slate-900 tracking-tight leading-tight mb-3">
          가입 완료!
        </h1>
        <p className="text-[17px] text-slate-500 font-medium leading-relaxed mb-1">
          쉼표 가족이 되신 것을 환영해요 🎉
        </p>
        <p className="text-[14px] text-slate-400 font-medium mb-12">
          이제 나만의 휴식 여정을 시작해볼까요
        </p>

        {/* 이메일 인증 안내 — 소셜 가입 시 불필요 */}
        {!isSocial && (
          <div className="bg-emerald-50 border border-emerald-100 rounded-2xl px-5 py-4 mb-4 text-left">
            <div className="flex items-start gap-3">
              <span className="material-icons text-primary text-[22px] mt-0.5 flex-shrink-0">mark_email_read</span>
              <div>
                <p className="text-[14px] font-bold text-slate-800 mb-0.5">이메일 인증을 완료해주세요</p>
                <p className="text-[12px] text-slate-500 leading-relaxed">
                  가입하신 이메일로 인증 링크를 보냈어요.<br />24시간 내에 인증해주세요.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* 추천 활동 */}
        <div className="bg-slate-50 rounded-2xl px-5 py-4 mb-10 text-left">
          <p className="text-[12px] font-bold text-slate-400 tracking-widest uppercase mb-3">먼저 해볼 수 있어요</p>
          <div className="space-y-1">
            {[
              { icon: 'psychology',   text: '휴식 유형 테스트',   sub: '내 성향을 알아봐요',    link: '/rest-test'  },
              { icon: 'favorite',     text: '심박수 체크',         sub: '지금 내 상태 확인',     link: '/heartrate'  },
              { icon: 'map',          text: '주변 쉼터 찾기',      sub: '가까운 장소 탐색',      link: '/map'        },
            ].map((item) => (
              <Link
                key={item.link}
                to={item.link}
                className="flex items-center gap-3.5 p-3 rounded-xl hover:bg-white transition-all group"
              >
                <div className="w-9 h-9 rounded-xl bg-white group-hover:bg-emerald-50 flex items-center justify-center shadow-sm transition-colors flex-shrink-0">
                  <span className="material-icons text-primary text-[18px]">{item.icon}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-bold text-slate-800">{item.text}</p>
                  <p className="text-[11px] text-slate-400 font-medium">{item.sub}</p>
                </div>
                <span className="material-icons text-slate-300 text-[18px] group-hover:text-slate-500 transition-colors">chevron_right</span>
              </Link>
            ))}
          </div>
        </div>

        {/* 시작하기 버튼 */}
        <Link
          to="/"
          className="block w-full py-4 bg-primary hover:bg-emerald-500 active:scale-[0.98] text-white text-[16px] font-bold rounded-2xl shadow-xl shadow-emerald-100 transition-all"
        >
          시작하기
        </Link>

      </div>
    </div>
  );
}

export default SignupComplete;
