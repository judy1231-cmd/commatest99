import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function AdminLogin() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!email.trim()) { setError('이메일을 입력해주세요.'); return; }
    if (!password) { setError('비밀번호를 입력해주세요.'); return; }

    try {
      setLoading(true);
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();

      if (!data.success) {
        setError(data.message);
        return;
      }

      // 관리자 권한 체크
      if (data.data.user.role !== 'ADMIN') {
        setError('관리자 권한이 없는 계정입니다.');
        return;
      }

      localStorage.setItem('accessToken', data.data.accessToken);
      localStorage.setItem('refreshToken', data.data.refreshToken);
      localStorage.setItem('user', JSON.stringify(data.data.user));

      navigate('/admin');
    } catch (e) {
      setError('서버에 연결할 수 없습니다. 잠시 후 다시 시도해주세요.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900">
      {/* Background decoration */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute top-[20%] left-[10%] w-[300px] h-[300px] rounded-full blur-[150px] bg-primary/20"></div>
        <div className="absolute bottom-[10%] right-[15%] w-[250px] h-[250px] rounded-full blur-[150px] bg-primary/10"></div>
      </div>

      <div className="w-full max-w-md px-6">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-primary/30 overflow-hidden">
            <img src="/logo_comma.png" alt="쉼표" className="w-8 h-8 object-contain" />
          </div>
          <h1 className="text-2xl font-bold text-white">쉼표 관리자</h1>
          <p className="text-slate-400 text-sm mt-2">관리자 계정으로 로그인해주세요</p>
        </div>

        {/* Card */}
        <div className="bg-slate-800/50 backdrop-blur-md rounded-2xl border border-slate-700/50 p-8 shadow-2xl">
          {error && (
            <div className="mb-5 p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-sm text-red-400">
              {error}
            </div>
          )}

          <form className="space-y-5" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300">이메일</label>
              <div className="relative">
                <span className="material-icons absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 text-xl">mail</span>
                <input
                  className="w-full pl-12 pr-4 py-3.5 bg-slate-700/50 border border-slate-600/50 rounded-xl text-sm text-white placeholder:text-slate-500 focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none transition-all"
                  placeholder="admin@comma.com"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={loading}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300">비밀번호</label>
              <div className="relative">
                <span className="material-icons absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 text-xl">lock</span>
                <input
                  className="w-full pl-12 pr-4 py-3.5 bg-slate-700/50 border border-slate-600/50 rounded-xl text-sm text-white placeholder:text-slate-500 focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none transition-all"
                  placeholder="비밀번호를 입력하세요"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={loading}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary hover:bg-primary/90 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-primary/20 transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? '로그인 중...' : '관리자 로그인'}
            </button>
          </form>
        </div>

        <p className="text-center mt-6 text-xs text-slate-500">
          &copy; 2024 쉼표 Admin Console
        </p>
      </div>
    </div>
  );
}

export default AdminLogin;
