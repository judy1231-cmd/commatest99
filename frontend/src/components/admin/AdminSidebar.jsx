import { Link, useLocation } from 'react-router-dom';

const navItems = [
  { path: '/admin', icon: 'dashboard', label: '대시보드' },
  { path: '/admin/users', icon: 'people', label: '사용자 관리' },
  { path: '/admin/places', icon: 'place', label: '장소 승인' },
  { path: '/admin/challenges', icon: 'emoji_events', label: '챌린지 관리' },
  { path: '/admin/community', icon: 'forum', label: '커뮤니티 관리' },
  { path: '/admin/analytics', icon: 'insights', label: '통계 및 분석' },
  { path: '/admin/settings', icon: 'settings', label: '시스템 설정' },
];

function AdminSidebar() {
  const location = useLocation();
  const isActive = (path) => path === '/admin' ? location.pathname === path : location.pathname.startsWith(path);

  return (
    <aside className="w-64 bg-white dark:bg-[#1a110c] border-r border-slate-200 dark:border-white/10 flex flex-col shrink-0">
      <div className="p-6 flex items-center gap-3">
        <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center overflow-hidden">
          <img src="/logo_comma.png" alt="쉼표" className="w-3.5 h-3.5 object-contain" />
        </div>
        <h1 className="text-xl font-bold tracking-tight text-primary">쉼표 어드민</h1>
      </div>
      <nav className="flex-1 px-4 space-y-1 overflow-y-auto">
        {navItems.map(({ path, icon, label }) => (
          <Link
            key={path}
            to={path}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-colors ${
              isActive(path)
                ? 'bg-primary/10 text-primary'
                : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5'
            }`}
          >
            <span className="material-icons-round">{icon}</span>
            <span className="text-sm">{label}</span>
          </Link>
        ))}
      </nav>
      <div className="p-4 border-t border-slate-200 dark:border-white/10">
        <div className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-white/5 rounded-xl">
          <div className="w-9 h-9 rounded-full bg-primary/20 flex items-center justify-center text-primary">
            <span className="material-icons-round">person</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold truncate">관리자님</p>
            <p className="text-xs text-slate-500 truncate">admin@comma.com</p>
          </div>
        </div>
      </div>
    </aside>
  );
}

export default AdminSidebar;
