import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

/**
 * 소셜 로그인 콜백 페이지 — /oauth/callback?token=xxx
 * 백엔드에서 리다이렉트된 후 token을 localStorage에 저장하고 메인으로 이동
 */
function OAuthCallback() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const token = searchParams.get('token');
    const error = searchParams.get('error');

    if (!token) {
      navigate('/login?error=' + (error || 'unknown'), { replace: true });
      return;
    }

    const isNew = searchParams.get('isNew') === 'true';

    // 토큰 저장
    localStorage.setItem('accessToken', token);

    // 사용자 정보 조회 후 이동
    fetch('/api/auth/me', {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          localStorage.setItem('user', JSON.stringify(data.data));
        }
        // 신규 가입이면 가입 완료 페이지, 기존 로그인이면 메인
        navigate(isNew ? '/signup-complete' : '/', { replace: true });
      })
      .catch(() => navigate('/', { replace: true }));
  }, []);

  return (
    <div className="min-h-screen bg-[#F9F7F2] flex items-center justify-center">
      <p className="text-text-muted">로그인 처리 중...</p>
    </div>
  );
}

export default OAuthCallback;
