import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

function AuthVerifyEmail() {
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const email = user.email || '';

  const [resendLoading, setResendLoading] = useState(false);
  const [resendDone, setResendDone] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [cooldown]);

  const handleResend = async () => {
    if (resendLoading || cooldown > 0) return;
    try {
      setResendLoading(true);
      const res = await fetch('/api/auth/email/resend', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      const data = await res.json();
      if (data.success) {
        setResendDone(true);
        setCooldown(60);
      }
    } catch {
      // silent fail
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-white">

      {/* Nav */}
      <nav className="sticky top-0 z-50 bg-white border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center">
          <Link to="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
            <div className="w-9 h-9 bg-primary rounded-xl flex items-center justify-center shadow-sm overflow-hidden">
              <img src="/logo_comma.png" alt="쉼표" className="w-5 h-5 object-contain" />
            </div>
            <span className="text-[18px] font-extrabold tracking-tight text-slate-900">쉼표</span>
          </Link>
        </div>
      </nav>

      <main className="flex-1 flex items-center justify-center px-6 py-20">
        <div className="w-full max-w-[420px] text-center">

          {/* 이메일 아이콘 */}
          <div className="relative w-28 h-28 mx-auto mb-10">
            <div className="absolute inset-0 bg-primary/10 rounded-3xl rotate-6" />
            <div className="relative w-28 h-28 bg-primary rounded-3xl flex items-center justify-center shadow-2xl shadow-emerald-200">
              <span className="material-icons text-white text-[52px]">mark_email_unread</span>
            </div>
          </div>

          {/* 메인 타이틀 */}
          <h1 className="text-[30px] font-extrabold text-slate-900 tracking-tight leading-tight mb-3">
            이메일을 확인해주세요
          </h1>

          {email ? (
            <p className="text-[15px] text-slate-400 font-medium mb-1">
              <span className="text-slate-700 font-semibold">{email}</span> 으로
            </p>
          ) : null}
          <p className="text-[15px] text-slate-400 font-medium mb-10">
            인증 링크를 보냈어요. 링크를 클릭하면 가입이 완료돼요.
          </p>

          {/* 안내 카드 */}
          <div className="bg-slate-50 rounded-2xl px-5 py-4 mb-10 text-left space-y-3">
            <div className="flex items-start gap-3">
              <span className="material-icons text-primary text-[18px] mt-0.5 flex-shrink-0">schedule</span>
              <p className="text-[13px] text-slate-500 leading-relaxed">
                링크는 <span className="font-bold text-slate-700">24시간</span> 동안만 유효해요
              </p>
            </div>
            <div className="flex items-start gap-3">
              <span className="material-icons text-primary text-[18px] mt-0.5 flex-shrink-0">inbox</span>
              <p className="text-[13px] text-slate-500 leading-relaxed">
                메일이 안 보이면 스팸함을 확인해주세요
              </p>
            </div>
            <div className="flex items-start gap-3">
              <span className="material-icons text-primary text-[18px] mt-0.5 flex-shrink-0">info</span>
              <p className="text-[13px] text-slate-500 leading-relaxed">
                인증 전에도 일부 기능을 이용할 수 있어요
              </p>
            </div>
          </div>

          {/* 재발송 완료 메시지 */}
          {resendDone && (
            <div className="flex items-center justify-center gap-2 mb-4 text-primary text-[13px] font-semibold">
              <span className="material-icons text-[16px]">check_circle</span>
              인증 메일을 다시 보냈어요
            </div>
          )}

          {/* 재발송 버튼 (outline, 작게) */}
          <button
            onClick={handleResend}
            disabled={resendLoading || cooldown > 0}
            className="w-full py-3 border-2 border-slate-200 hover:border-primary hover:text-primary text-slate-500 text-[14px] font-semibold rounded-2xl transition-all disabled:opacity-50 disabled:cursor-not-allowed mb-4"
          >
            {resendLoading ? '발송 중...' :
             cooldown > 0 ? `재발송 (${cooldown}초 후 가능)` :
             '인증 메일 다시 받기'}
          </button>

          {/* 로그인으로 */}
          <Link
            to="/auth/login"
            className="block w-full py-4 bg-primary hover:bg-emerald-500 active:scale-[0.98] text-white text-[16px] font-bold rounded-2xl shadow-lg shadow-emerald-100 transition-all"
          >
            로그인으로 돌아가기
          </Link>

        </div>
      </main>

    </div>
  );
}

export default AuthVerifyEmail;
