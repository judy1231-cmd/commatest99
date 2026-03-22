import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchWithAuth } from '../../api/fetchWithAuth';

function AdminHeader({ title, subtitle, children }) {
  const navigate = useNavigate();
  const [bellOpen, setBellOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [pendingCount, setPendingCount] = useState(0);
  const bellRef = useRef(null);

  // 대기 중 승인 건수 조회
  useEffect(() => {
    fetchWithAuth('/api/admin/places?status=pending&limit=5')
      .then((data) => {
        if (data.success && Array.isArray(data.data)) {
          const pending = data.data;
          setPendingCount(pending.length);
          setNotifications(
            pending.slice(0, 4).map((p) => ({
              id: p.id,
              icon: 'place',
              color: 'text-emerald-500 bg-emerald-50',
              title: '장소 승인 대기',
              body: p.name,
              time: '승인 필요',
              link: '/admin/places',
            }))
          );
        }
      })
      .catch(() => {});
  }, []);

  // 외부 클릭 시 닫기
  useEffect(() => {
    const handleClick = (e) => {
      if (bellRef.current && !bellRef.current.contains(e.target)) {
        setBellOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const user = (() => {
    try { return JSON.parse(localStorage.getItem('user')) || {}; } catch { return {}; }
  })();
  const displayName = user.nickname || user.username || '관리자';

  return (
    <header className="sticky top-0 z-50 w-full bg-white/80 dark:bg-[#221610]/80 backdrop-blur-md border-b border-gray-200 dark:border-white/10">
      <div className="px-6 h-16 flex items-center justify-between">
        <div>
          {title && <h2 className="text-lg font-bold text-gray-900 dark:text-white">{title}</h2>}
          {subtitle && <p className="text-xs text-gray-500 dark:text-gray-400">{subtitle}</p>}
        </div>
        <div className="flex items-center gap-3">
          {children}

          {/* 알림 벨 */}
          <div className="relative" ref={bellRef}>
            <button
              onClick={() => setBellOpen((v) => !v)}
              className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-white/5 text-gray-500 relative transition-colors"
            >
              <span className="material-icons-round">notifications</span>
              {pendingCount > 0 && (
                <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center text-white text-[9px] font-bold leading-none">
                  {pendingCount > 9 ? '9+' : pendingCount}
                </span>
              )}
            </button>

            {bellOpen && (
              <div className="absolute right-0 top-12 w-80 bg-white dark:bg-[#1a1a1a] rounded-2xl shadow-xl border border-slate-100 dark:border-white/10 overflow-hidden z-50">
                <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 dark:border-white/10">
                  <p className="text-sm font-bold text-slate-800 dark:text-white">알림</p>
                  {pendingCount > 0 && (
                    <span className="text-[11px] bg-red-100 text-red-600 font-semibold px-2 py-0.5 rounded-full">
                      {pendingCount}건 처리 필요
                    </span>
                  )}
                </div>

                {notifications.length === 0 ? (
                  <div className="py-10 flex flex-col items-center text-slate-400 gap-2">
                    <span className="material-icons-round text-3xl">notifications_none</span>
                    <p className="text-sm">새 알림이 없어요</p>
                  </div>
                ) : (
                  <ul>
                    {notifications.map((n) => (
                      <li key={n.id}>
                        <button
                          onClick={() => { setBellOpen(false); navigate(n.link); }}
                          className="w-full flex items-start gap-3 px-4 py-3 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors text-left"
                        >
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${n.color}`}>
                            <span className="material-icons-round text-[16px]">{n.icon}</span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-[12px] font-semibold text-slate-700 dark:text-slate-200">{n.title}</p>
                            <p className="text-[12px] text-slate-500 truncate">{n.body}</p>
                          </div>
                          <span className="text-[10px] text-slate-400 shrink-0 mt-0.5">{n.time}</span>
                        </button>
                      </li>
                    ))}
                  </ul>
                )}

                <div className="border-t border-slate-100 dark:border-white/10 px-4 py-2.5">
                  <button
                    onClick={() => { setBellOpen(false); navigate('/admin/places'); }}
                    className="w-full text-center text-[12px] text-primary font-semibold hover:opacity-70 transition-opacity"
                  >
                    장소 승인 관리 바로가기 →
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="h-8 w-px bg-gray-200 dark:bg-white/10"></div>

          {/* 프로필 */}
          <div className="flex items-center gap-2">
            <div className="text-right hidden sm:block">
              <p className="text-xs font-semibold text-gray-800 dark:text-white">{displayName}</p>
              <p className="text-[10px] text-gray-500">Super Admin</p>
            </div>
            <div className="w-9 h-9 rounded-full bg-primary/20 flex items-center justify-center text-primary">
              <span className="material-icons-round text-[18px]">admin_panel_settings</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}

export default AdminHeader;
