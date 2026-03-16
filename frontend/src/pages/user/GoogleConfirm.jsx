import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

const GoogleLogo = () => (
  <svg viewBox="0 0 24 24" className="w-7 h-7">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05" />
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
  </svg>
);

/**
 * 구글 신규 가입 확인 페이지 — /google/confirm?pendingToken=xxx
 */
function GoogleConfirm() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const pendingToken = searchParams.get('pendingToken');

  const [nickname, setNickname] = useState('');
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [usernameStatus, setUsernameStatus] = useState(null); // null | 'checking' | 'available' | 'taken' | 'invalid'
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!pendingToken) {
      navigate('/login?error=invalid_request', { replace: true });
      return;
    }
    try {
      const payload = JSON.parse(atob(pendingToken.split('.')[1]));
      setNickname(payload.nickname || '');
      setEmail(payload.email || '');
    } catch {
      // 파싱 실패해도 서버에서 검증
    }
  }, [pendingToken, navigate]);

  const isUsernameFormatValid = (val) => /^[a-zA-Z0-9_]{4,20}$/.test(val);

  const handleUsernameChange = (e) => {
    const val = e.target.value.trim();
    setUsername(val);
    setUsernameStatus(null);
    setError(null);
  };

  const checkUsername = async () => {
    if (!isUsernameFormatValid(username)) {
      setUsernameStatus('invalid');
      return;
    }
    setUsernameStatus('checking');
    try {
      const res = await fetch(`/api/auth/check/username?username=${encodeURIComponent(username)}`);
      const data = await res.json();
      setUsernameStatus(data.success ? 'available' : 'taken');
    } catch {
      setUsernameStatus(null);
    }
  };

  const handleConfirm = async () => {
    if (!username) { setError('아이디를 입력해주세요.'); return; }
    if (!isUsernameFormatValid(username)) { setError('아이디는 영문/숫자/_만 사용 가능하고 4~20자여야 해요.'); return; }
    if (usernameStatus !== 'available') { setError('아이디 중복 확인을 해주세요.'); return; }

    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/auth/google/confirm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pendingToken, username }),
      });
      const data = await res.json();
      if (!data.success) {
        setError(data.message || '가입 처리 중 오류가 발생했습니다.');
        return;
      }
      const accessToken = data.data.accessToken;
      localStorage.setItem('accessToken', accessToken);

      fetch('/api/auth/me', { headers: { Authorization: `Bearer ${accessToken}` } })
        .then(r => r.json())
        .then(me => {
          if (me.success) localStorage.setItem('user', JSON.stringify(me.data));
          navigate('/signup-complete?social=true', { replace: true });
        })
        .catch(() => navigate('/signup-complete?social=true', { replace: true }));
    } catch {
      setError('네트워크 오류가 발생했습니다. 다시 시도해주세요.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F9F7F2] flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
        {/* 구글 로고 */}
        <div className="flex flex-col items-center mb-6">
          <div className="w-14 h-14 rounded-full bg-white border border-gray-200 flex items-center justify-center mb-3 shadow-sm">
            <GoogleLogo />
          </div>
          <h1 className="text-xl font-bold text-[#334155]">Google 계정으로 가입</h1>
          <p className="text-sm text-[#64748B] mt-1">사용할 아이디를 설정하고 가입을 완료해주세요</p>
        </div>

        {/* 구글에서 가져온 정보 */}
        <div className="bg-[#ECFDF5] rounded-xl p-4 mb-5 space-y-2">
          <InfoRow label="연동 서비스" value="Google" />
          <InfoRow
            label="이름"
            value={nickname || 'Google 계정 이름'}
            hint="닉네임으로 사용됩니다. 마이페이지에서 변경 가능해요"
          />
          {email && (
            <InfoRow label="이메일" value={email} hint="Google 계정 이메일이 저장됩니다" />
          )}
        </div>

        {/* 아이디 직접 입력 */}
        <div className="mb-5">
          <label className="block text-sm font-bold text-[#334155] mb-1.5">
            아이디 <span className="text-red-400">*</span>
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={username}
              onChange={handleUsernameChange}
              placeholder="영문/숫자/_ 4~20자"
              autoComplete="username"
              className="flex-1 h-12 px-4 rounded-xl border border-gray-200 bg-gray-50 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none text-sm"
            />
            <button
              type="button"
              onClick={checkUsername}
              disabled={!username || loading}
              className="shrink-0 h-12 px-4 rounded-xl border border-primary text-primary text-sm font-bold hover:bg-primary/5 disabled:opacity-40 transition-colors"
            >
              중복 확인
            </button>
          </div>
          {usernameStatus === 'available' && (
            <p className="text-xs text-[#10b981] mt-1.5">사용 가능한 아이디예요.</p>
          )}
          {usernameStatus === 'taken' && (
            <p className="text-xs text-red-500 mt-1.5">이미 사용 중인 아이디예요.</p>
          )}
          {usernameStatus === 'invalid' && (
            <p className="text-xs text-red-500 mt-1.5">영문/숫자/_만 사용 가능하고 4~20자여야 해요.</p>
          )}
          {usernameStatus === 'checking' && (
            <p className="text-xs text-[#64748B] mt-1.5">확인 중...</p>
          )}
          <p className="text-xs text-[#94a3b8] mt-1.5">로그인 시 사용할 아이디예요. 가입 후 변경할 수 없어요.</p>
        </div>

        {/* 동의 안내 */}
        <p className="text-xs text-[#64748B] mb-5 leading-relaxed">
          "가입 완료"를 누르면 쉼표(,)의{' '}
          <span className="text-[#10b981] font-medium">이용약관</span> 및{' '}
          <span className="text-[#10b981] font-medium">개인정보처리방침</span>에 동의합니다.
        </p>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 mb-4 text-sm text-red-600">
            {error}
          </div>
        )}

        <div className="space-y-3">
          <button
            onClick={handleConfirm}
            disabled={loading || usernameStatus !== 'available'}
            className="w-full h-12 bg-primary text-white rounded-xl font-bold hover:bg-primary/90 transition-colors disabled:opacity-50"
          >
            {loading ? '처리 중...' : '가입 완료'}
          </button>
          <button
            onClick={() => navigate('/login', { replace: true })}
            disabled={loading}
            className="w-full h-12 bg-gray-100 text-[#64748B] rounded-xl font-medium hover:bg-gray-200 transition-colors"
          >
            취소
          </button>
        </div>
      </div>
    </div>
  );
}

function InfoRow({ label, value, hint }) {
  return (
    <div>
      <div className="flex items-start justify-between gap-3">
        <span className="text-sm text-[#64748B] shrink-0 w-24">{label}</span>
        <span className="text-sm font-medium text-[#334155] text-right">{value}</span>
      </div>
      {hint && <p className="text-xs text-[#10b981] mt-0.5 text-right">{hint}</p>}
    </div>
  );
}

export default GoogleConfirm;
