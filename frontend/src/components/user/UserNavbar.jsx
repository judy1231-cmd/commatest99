import { useState, useRef, useEffect, useCallback } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';

// 알림 타입별 아이콘/색상
const NOTIF_TYPE = {
  badge:       { icon: 'emoji_events',       color: '#FFB830' },
  challenge:   { icon: 'flag',               color: '#10b981' },
  stress:      { icon: 'favorite',           color: '#FF7BAC' },
  reengagement:{ icon: 'notifications',      color: '#5B8DEF' },
  system:      { icon: 'campaign',           color: '#9B6DFF' },
};

function timeAgo(dateStr) {
  if (!dateStr) return '';
  const diff = Math.floor((Date.now() - new Date(dateStr)) / 1000);
  if (diff < 60)         return '방금 전';
  if (diff < 3600)       return `${Math.floor(diff / 60)}분 전`;
  if (diff < 86400)      return `${Math.floor(diff / 3600)}시간 전`;
  if (diff < 86400 * 30) return `${Math.floor(diff / 86400)}일 전`;
  return new Date(dateStr).toLocaleDateString('ko-KR');
}

function NotificationDropdown({ onClose, onUnreadChange }) {
  const token = localStorage.getItem('accessToken');
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const panelRef = useRef(null);

  const load = useCallback(async () => {
    if (!token) { setLoading(false); return; }
    try {
      const res = await fetch('/api/notifications?page=1&size=20', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) setItems(data.data.notifications || []);
    } catch { /* ignore */ }
    finally { setLoading(false); }
  }, [token]);

  useEffect(() => { load(); }, [load]);

  // 외부 클릭 닫기
  useEffect(() => {
    function handler(e) {
      if (panelRef.current && !panelRef.current.contains(e.target)) onClose();
    }
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [onClose]);

  const markOne = async (id) => {
    const item = items.find(i => i.id === id);
    if (!item || item.isRead) return;
    await fetch(`/api/notifications/${id}/read`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${token}` }
    });
    setItems(prev => prev.map(i => i.id === id ? { ...i, isRead: true } : i));
    onUnreadChange();
  };

  const markAll = async () => {
    await fetch('/api/notifications/read-all', {
      method: 'PUT',
      headers: { Authorization: `Bearer ${token}` }
    });
    setItems(prev => prev.map(i => ({ ...i, isRead: true })));
    onUnreadChange();
  };

  const unreadCount = items.filter(i => !i.isRead).length;

  return (
    <div
      ref={panelRef}
      className="absolute right-0 top-full mt-2 w-80 bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden z-[200]"
      style={{ animation: 'fadeInDown 0.18s ease' }}
    >
      {/* 헤더 */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <span className="font-bold text-slate-800 text-[15px]">알림</span>
          {unreadCount > 0 && (
            <span className="text-[11px] font-bold bg-primary text-white px-1.5 py-0.5 rounded-full">
              {unreadCount}
            </span>
          )}
        </div>
        {unreadCount > 0 && (
          <button
            onClick={markAll}
            className="text-[11px] text-primary font-semibold hover:text-primary/80 transition-colors"
          >
            모두 읽음
          </button>
        )}
      </div>

      {/* 목록 */}
      <div className="max-h-[360px] overflow-y-auto">
        {loading && (
          <div className="flex items-center justify-center py-10">
            <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        )}
        {!loading && !token && (
          <div className="flex flex-col items-center justify-center py-10 text-center px-4">
            <span className="material-icons text-slate-300 text-4xl mb-2">lock</span>
            <p className="text-sm text-slate-400 font-medium">로그인 후 알림을 확인할 수 있어요</p>
          </div>
        )}
        {!loading && token && items.length === 0 && (
          <div className="flex flex-col items-center justify-center py-10 text-center">
            <span className="material-icons text-slate-300 text-4xl mb-2">notifications_none</span>
            <p className="text-sm text-slate-400 font-medium">새 알림이 없어요</p>
          </div>
        )}
        {!loading && items.map(item => {
          const t = NOTIF_TYPE[item.type] || NOTIF_TYPE.system;
          return (
            <button
              key={item.id}
              onClick={() => markOne(item.id)}
              className={`w-full text-left flex items-start gap-3 px-4 py-3.5 border-b border-slate-50 transition-colors hover:bg-slate-50 ${
                item.isRead ? 'opacity-60' : ''
              }`}
            >
              {/* 아이콘 */}
              <div
                className="w-9 h-9 rounded-full flex items-center justify-center shrink-0 mt-0.5"
                style={{ backgroundColor: `${t.color}18` }}
              >
                <span className="material-icons text-[18px]" style={{ color: t.color }}>{t.icon}</span>
              </div>
              {/* 내용 */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-1">
                  <p className={`text-[13px] leading-snug ${item.isRead ? 'font-medium text-slate-500' : 'font-bold text-slate-800'}`}>
                    {item.title}
                  </p>
                  {!item.isRead && (
                    <div className="w-2 h-2 rounded-full bg-primary shrink-0 mt-1" />
                  )}
                </div>
                <p className="text-[12px] text-slate-400 mt-0.5 line-clamp-2">{item.content}</p>
                <p className="text-[11px] text-slate-300 mt-1">{timeAgo(item.createdAt)}</p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function LoginModal({ onClose, onLoginSuccess }) {
  const navigate = useNavigate();
  const [identifier, setIdentifier] = useState('');
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
        body: JSON.stringify({ identifier, password })
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
            <div className="w-7 h-7 bg-primary rounded-full flex items-center justify-center overflow-hidden">
              <img src="/logo_comma.png" alt="쉼표" className="w-3.5 h-3.5 object-contain" />
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
            <span className="material-icons absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xl">person</span>
            <input
              className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all placeholder:text-slate-400"
              placeholder="아이디 또는 이메일"
              type="text"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
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
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const [showNotif, setShowNotif] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const notifBtnRef = useRef(null);
  const profileRef = useRef(null);

  const fetchUnread = useCallback(async () => {
    const token = localStorage.getItem('accessToken');
    if (!token) return;
    try {
      const res = await fetch('/api/notifications/unread-count', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) setUnreadCount(data.data.count || 0);
    } catch { /* ignore */ }
  }, []);

  useEffect(() => {
    if (isLoggedIn) fetchUnread();
  }, [isLoggedIn, fetchUnread]);

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
          <Link to="/" className="flex items-center gap-3 hover:opacity-90 transition-opacity">
            <div className="w-9 h-9 bg-primary rounded-full flex items-center justify-center shadow-sm overflow-hidden">
              <img src="/logo_comma.png" alt="쉼표" className="w-4 h-4 object-contain" />
            </div>
            <span className="text-2xl font-bold tracking-tight text-slate-900">쉼표</span>
          </Link>
          <nav className="hidden md:flex items-center gap-8">
            <Link to="/" className={`text-sm font-semibold transition-colors ${isActive('/') ? 'text-primary' : 'text-text-muted hover:text-primary'}`}>홈</Link>
            <Link to="/rest-test" className={`text-sm font-medium transition-colors ${isActive('/rest-test') ? 'text-primary' : 'text-text-muted hover:text-primary'}`}>심리 진단</Link>
<Link to="/map" className={`text-sm font-medium transition-colors ${isActive('/map') ? 'text-primary' : 'text-text-muted hover:text-primary'}`}>휴식 지도</Link>
            <Link to="/community" className={`text-sm font-medium transition-colors ${isActive('/community') ? 'text-primary' : 'text-text-muted hover:text-primary'}`}>커뮤니티</Link>
            <Link to="/challenge" className={`text-sm font-medium transition-colors ${isActive('/challenge') ? 'text-primary' : 'text-text-muted hover:text-primary'}`}>챌린지</Link>
            <Link to="/my" className={`text-sm font-medium transition-colors ${isActive('/my') ? 'text-primary' : 'text-text-muted hover:text-primary'}`}>마이페이지</Link>
            {isLoggedIn && JSON.parse(localStorage.getItem('user') || '{}').role === 'ADMIN' && (
              <Link to="/admin" className="text-sm font-medium px-3 py-1 bg-slate-800 text-white rounded-lg hover:bg-slate-700 transition-colors">관리자</Link>
            )}
            {!isLoggedIn && (
              <>
                <Link to="/login" className={`text-sm font-medium transition-colors ${isActive('/login') ? 'text-primary' : 'text-text-muted hover:text-primary'}`}>로그인</Link>
                <Link to="/signup" className="text-sm font-medium px-4 py-1.5 bg-primary text-white rounded-full hover:bg-primary/90 transition-colors">회원가입</Link>
              </>
            )}
          </nav>
          <div className="flex items-center gap-4">
            <div className="relative">
              <button
                ref={notifBtnRef}
                onClick={() => setShowNotif(v => !v)}
                className="p-2.5 rounded-full hover:bg-slate-100 transition-colors text-text-muted relative"
              >
                <span className="material-icons text-xl">notifications</span>
                {unreadCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center leading-none">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </button>
              {showNotif && (
                <NotificationDropdown
                  onClose={() => setShowNotif(false)}
                  onUnreadChange={fetchUnread}
                />
              )}
            </div>
            <div className="relative" ref={profileRef}>
              <button
                onClick={() => {
                  if (!isLoggedIn) { setShowLoginModal(true); return; }
                  setShowProfile(v => !v);
                  setShowNotif(false);
                }}
                className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center overflow-hidden border border-slate-200 shadow-sm hover:bg-slate-200 transition-colors"
              >
                {isLoggedIn && user.nickname
                  ? <span className="text-[13px] font-extrabold text-primary">{user.nickname[0]}</span>
                  : <span className="material-icons text-text-muted text-[20px]">person</span>
                }
              </button>

              {/* 프로필 드롭다운 */}
              {showProfile && isLoggedIn && (() => {
                const closeProfile = () => setShowProfile(false);
                // 외부 클릭 시 닫기
                const handler = (e) => {
                  if (profileRef.current && !profileRef.current.contains(e.target)) closeProfile();
                };
                document.addEventListener('mousedown', handler, { once: true });
                return (
                  <div
                    className="absolute right-0 top-full mt-2 w-52 bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden z-[200]"
                    style={{ animation: 'fadeInDown 0.18s ease' }}
                  >
                    {/* 닉네임 헤더 */}
                    <div className="px-4 py-3.5 border-b border-slate-100">
                      <p className="text-[13px] font-extrabold text-slate-800 truncate">{user.nickname}</p>
                      <p className="text-[11px] text-slate-400 truncate mt-0.5">{user.email || user.username}</p>
                    </div>
                    {/* 메뉴 */}
                    <div className="py-1">
                      <Link
                        to="/my"
                        onClick={closeProfile}
                        className="flex items-center gap-2.5 px-4 py-2.5 text-[13px] text-slate-700 hover:bg-slate-50 transition-colors"
                      >
                        <span className="material-icons text-[17px] text-slate-400">person</span>
                        마이페이지
                      </Link>
                      <Link
                        to="/rest-record"
                        onClick={closeProfile}
                        className="flex items-center gap-2.5 px-4 py-2.5 text-[13px] text-slate-700 hover:bg-slate-50 transition-colors"
                      >
                        <span className="material-icons text-[17px] text-slate-400">edit_note</span>
                        휴식 기록
                      </Link>
                    </div>
                    <div className="border-t border-slate-100 py-1">
                      <button
                        onClick={() => { closeProfile(); handleLogout(); }}
                        className="w-full flex items-center gap-2.5 px-4 py-2.5 text-[13px] text-red-500 hover:bg-red-50 transition-colors"
                      >
                        <span className="material-icons text-[17px]">logout</span>
                        로그아웃
                      </button>
                    </div>
                  </div>
                );
              })()}
            </div>
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

    </>
  );
}

export default UserNavbar;
