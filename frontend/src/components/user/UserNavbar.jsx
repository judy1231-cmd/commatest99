import { Link, useLocation } from 'react-router-dom';

function UserNavbar() {
  const location = useLocation();
  const isActive = (path) => location.pathname === path;

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
          </nav>
          <div className="flex items-center gap-4">
            <button className="p-2.5 rounded-full hover:bg-slate-100 transition-colors text-text-muted">
              <span className="material-icons text-xl">notifications</span>
            </button>
            <div className="w-9 h-9 rounded-full bg-pale-blue flex items-center justify-center overflow-hidden border border-slate-100 shadow-sm">
              <span className="material-icons text-text-muted">person</span>
            </div>
          </div>
        </div>
      </nav>
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
