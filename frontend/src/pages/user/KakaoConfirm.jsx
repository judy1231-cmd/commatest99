import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

/**
 * 카카오 신규 가입 확인 페이지 — /kakao/confirm?pendingToken=xxx
 * 가입에 사용될 정보를 보여주고 사용자가 "가입 완료"를 눌러야 계정이 생성됨
 */
function KakaoConfirm() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const pendingToken = searchParams.get('pendingToken');

  // pending 토큰에서 nickname 파싱 (JWT payload는 base64 — 서버 호출 없이 디코딩)
  const [nickname, setNickname] = useState('');
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
    } catch {
      // 파싱 실패해도 confirm API 호출 시 서버에서 검증
    }
  }, [pendingToken, navigate]);

  const handleConfirm = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/auth/kakao/confirm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pendingToken }),
      });
      const data = await res.json();
      if (!data.success) {
        setError(data.message || '가입 처리 중 오류가 발생했습니다.');
        return;
      }
      // 계정 생성 완료 — 토큰 저장 후 사용자 정보 조회
      const accessToken = data.data.accessToken;
      localStorage.setItem('accessToken', accessToken);

      fetch('/api/auth/me', {
        headers: { Authorization: `Bearer ${accessToken}` },
      })
        .then(r => r.json())
        .then(me => {
          if (me.success) {
            localStorage.setItem('user', JSON.stringify(me.data));
          }
          navigate('/signup-complete?social=true', { replace: true });
        })
        .catch(() => navigate('/signup-complete?social=true', { replace: true }));
    } catch {
      setError('네트워크 오류가 발생했습니다. 다시 시도해주세요.');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    navigate('/login', { replace: true });
  };

  return (
    <div className="min-h-screen bg-[#F9F7F2] flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
        {/* 카카오 로고 영역 */}
        <div className="flex flex-col items-center mb-6">
          <div className="w-14 h-14 rounded-full bg-[#FEE500] flex items-center justify-center mb-3">
            <span className="text-2xl font-bold text-[#3C1E1E]">K</span>
          </div>
          <h1 className="text-xl font-bold text-[#334155]">카카오 계정으로 가입</h1>
          <p className="text-sm text-[#64748B] mt-1">아래 정보로 쉼표(,) 계정이 생성됩니다</p>
        </div>

        {/* 수집 정보 안내 */}
        <div className="bg-[#ECFDF5] rounded-xl p-5 mb-6 space-y-3">
          <InfoRow label="연동 서비스" value="카카오" />
          <InfoRow
            label="닉네임"
            value={nickname || '카카오 계정 닉네임'}
            hint="가입 후 마이페이지에서 변경할 수 있어요"
          />
          <InfoRow
            label="이메일"
            value="카카오 연동 이메일 (자동 생성)"
            hint="카카오 소셜 계정으로 관리됩니다"
          />
        </div>

        {/* 동의 안내 */}
        <p className="text-xs text-[#64748B] mb-6 leading-relaxed">
          "가입 완료"를 누르면 쉼표(,)의{' '}
          <span className="text-[#10b981] font-medium">이용약관</span> 및{' '}
          <span className="text-[#10b981] font-medium">개인정보처리방침</span>에 동의하고
          위 정보로 계정이 생성됩니다.
        </p>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 mb-4 text-sm text-red-600">
            {error}
          </div>
        )}

        {/* 버튼 */}
        <div className="space-y-3">
          <button
            onClick={handleConfirm}
            disabled={loading}
            className="w-full h-12 bg-primary text-white rounded-xl font-bold hover:bg-primary/90 transition-colors disabled:opacity-50"
          >
            {loading ? '처리 중...' : '가입 완료'}
          </button>
          <button
            onClick={handleCancel}
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

export default KakaoConfirm;
