import { useState, useRef, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';

function LoginModal({ onClose, onLoginSuccess }) {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    try {
      setLoading(true);
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      if (!data.success) { setError(data.message); return; }
      localStorage.setItem('accessToken', data.data.accessToken);
      localStorage.setItem('refreshToken', data.data.refreshToken);
      localStorage.setItem('user', JSON.stringify(data.data.user));
      onLoginSuccess();
      onClose();
      navigate('/');
    } catch (e) {
      setError('서버에 연결할 수 없습니다.');
    } finally {
      setLoading(false);
    }
  };
  const modalRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(e) {
      if (modalRef.current && !modalRef.current.contains(e.target)) {
        onClose();
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-end pt-16 pr-4">
      <div
        ref={modalRef}
        className="bg-white rounded-2xl shadow-2xl border border-slate-100 w-80 p-6 animate-fade-in"
        style={{ animation: 'fadeInDown 0.2s ease' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-primary rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">,</span>
            </div>
            <span className="font-bold text-slate-800">쉼표 로그인</span>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
            <span className="material-icons text-xl">close</span>
          </button>
        </div>

        {/* Form */}
        {error && (
          <div className="mb-3 p-2 bg-red-50 border border-red-200 rounded-lg text-xs text-red-600">{error}</div>
        )}
        <form className="space-y-3" onSubmit={handleSubmit}>
          <div className="relative">
            <span className="material-icons absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xl">mail</span>
            <input
              className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all placeholder:text-slate-400"
              placeholder="이메일"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
            />
          </div>
          <div className="relative">
            <span className="material-icons absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xl">lock</span>
            <input
              className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all placeholder:text-slate-400"
              placeholder="비밀번호"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary hover:bg-primary/90 text-white font-bold py-3 rounded-xl transition-all active:scale-[0.98] text-sm disabled:opacity-50"
          >
            {loading ? '로그인 중...' : '로그인'}
          </button>
        </form>

        {/* Divider */}
        <div className="relative my-4">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-slate-100"></div>
          </div>
          <div className="relative flex justify-center text-xs">
            <span className="bg-white px-3 text-slate-400">SNS로 시작하기</span>
          </div>
        </div>

        {/* SNS Login */}
        <div className="grid grid-cols-2 gap-2 mb-4">
          <button className="flex items-center justify-center gap-1.5 py-2.5 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-all text-sm">
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05" />
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
            </svg>
            <span className="font-semibold text-slate-700">구글</span>
          </button>
          <button className="flex items-center justify-center gap-1.5 py-2.5 bg-[#FEE500] rounded-xl hover:brightness-95 transition-all text-sm">
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="#3c1e1e">
              <path d="M12 3C6.477 3 2 6.477 2 10.5c0 2.548 1.504 4.788 3.785 6.178l-.964 3.584a.25.25 0 0 0 .373.277L9.77 18.1A11.6 11.6 0 0 0 12 18c5.523 0 10-3.477 10-7.5S17.523 3 12 3z"/>
            </svg>
            <span className="font-semibold text-[#3c1e1e]">카카오</span>
          </button>
        </div>

        {/* Footer links */}
        <div className="flex justify-center gap-3 text-xs text-slate-400">
          <Link to="/signup" onClick={onClose} className="hover:text-primary transition-colors">회원가입</Link>
          <span className="text-slate-200">|</span>
          <Link to="/password-reset" onClick={onClose} className="hover:text-primary transition-colors">비밀번호 찾기</Link>
        </div>
      </div>
    </div>
  );
}

function UserNavbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const isActive = (path) => location.pathname === path;
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem('accessToken'));

  const handleLogout = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      if (token) {
        await fetch('/api/auth/logout', {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${token}` }
        });
      }
    } catch (e) {
      // 로그아웃 API 실패해도 로컬은 정리
    }
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    setIsLoggedIn(false);
    navigate('/');
  };

  return (
    <>
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-primary rounded-xl flex items-center justify-center shadow-sm">
              <span className="text-white font-bold text-xl">,</span>
            </div>
            <Link to="/" className="text-2xl font-bold tracking-tight text-slate-900">쉼표</Link>
          </div>
          <nav className="hidden md:flex items-center gap-8">
            <Link to="/" className={`text-sm font-semibold transition-colors ${isActive('/') ? 'text-primary' : 'text-text-muted hover:text-primary'}`}>홈</Link>
            <Link to="/community" className={`text-sm font-medium transition-colors ${isActive('/community') ? 'text-primary' : 'text-text-muted hover:text-primary'}`}>커뮤니티</Link>
            <Link to="/challenge" className={`text-sm font-medium transition-colors ${isActive('/challenge') ? 'text-primary' : 'text-text-muted hover:text-primary'}`}>챌린지</Link>
            <Link to="/map" className={`text-sm font-medium transition-colors ${isActive('/map') ? 'text-primary' : 'text-text-muted hover:text-primary'}`}>휴식 지도</Link>
            <Link to="/my" className={`text-sm font-medium transition-colors ${isActive('/my') ? 'text-primary' : 'text-text-muted hover:text-primary'}`}>마이페이지</Link>
            {isLoggedIn ? (
              <button onClick={handleLogout} className="text-sm font-medium text-text-muted hover:text-red-500 transition-colors">로그아웃</button>
            ) : (
              <>
                <Link to="/login" className={`text-sm font-medium transition-colors ${isActive('/login') ? 'text-primary' : 'text-text-muted hover:text-primary'}`}>로그인</Link>
                <Link to="/signup" className="text-sm font-medium px-4 py-1.5 bg-primary text-white rounded-full hover:bg-primary/90 transition-colors">회원가입</Link>
              </>
            )}
          </nav>
          <div className="flex items-center gap-4">
            <button className="p-2.5 rounded-full hover:bg-slate-100 transition-colors text-text-muted">
              <span className="material-icons text-xl">notifications</span>
            </button>
            <button
              onClick={() => !isLoggedIn && setShowLoginModal(true)}
              className="w-9 h-9 rounded-full bg-pale-blue flex items-center justify-center overflow-hidden border border-slate-100 shadow-sm hover:bg-slate-200 transition-colors"
            >
              <span className="material-icons text-text-muted">person</span>
            </button>
          </div>
        </div>
      </nav>

      {/* Login Modal */}
      {showLoginModal && (
        <LoginModal
          onClose={() => setShowLoginModal(false)}
          onLoginSuccess={() => setIsLoggedIn(true)}
        />
      )}

      {/* Mobile Bottom Nav */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-100 px-8 py-3 flex justify-between items-center z-50">
        <Link to="/" className={isActive('/') ? 'text-primary' : 'text-slate-400'}><span className="material-icons">home</span></Link>
        <Link to="/community" className={isActive('/community') ? 'text-primary' : 'text-slate-400'}><span className="material-icons">forum</span></Link>
        <Link to="/challenge" className="bg-slate-900 text-white w-12 h-12 rounded-2xl -mt-10 shadow-lg flex items-center justify-center"><span className="material-icons">emoji_events</span></Link>
        <Link to="/map" className={isActive('/map') ? 'text-primary' : 'text-slate-400'}><span className="material-icons">map</span></Link>
        <Link to="/my" className={isActive('/my') ? 'text-primary' : 'text-slate-400'}><span className="material-icons">person</span></Link>
      </div>
    </>
  );
}

export default UserNavbar;
