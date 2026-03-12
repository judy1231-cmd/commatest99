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
        body: JSON.stringify({ identifier: email, password })
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
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#0F172A]">

      <div className="w-full max-w-[400px] px-4">
        {/* White Card */}
        <div className="bg-white rounded-2xl shadow-2xl shadow-black/40 overflow-hidden">

          {/* Card Header */}
          <div className="px-8 pt-10 pb-8 border-b border-gray-100">
            <div className="flex flex-col items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-slate-900 rounded-xl flex items-center justify-center">
                <span className="material-icons text-white text-xl">lock</span>
              </div>
              <div className="text-center">
                <h1 className="text-xl font-bold text-slate-900 tracking-tight">관리자 로그인</h1>
                <p className="text-xs text-slate-400 mt-1">쉼표(,) 관리자 전용 접근</p>
              </div>
            </div>

            {error && (
              <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg mb-1">
                <span className="material-icons text-red-500 text-base">error_outline</span>
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}
          </div>

          {/* Form */}
          <div className="px-8 py-8">
            <form className="space-y-5" onSubmit={handleSubmit}>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">이메일</label>
                <input
                  className="w-full h-11 px-3.5 border border-gray-200 rounded-lg text-sm text-slate-800 placeholder:text-slate-300 bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                  placeholder="admin@comma.com"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={loading}
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">비밀번호</label>
                <input
                  className="w-full h-11 px-3.5 border border-gray-200 rounded-lg text-sm text-slate-800 placeholder:text-slate-300 bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                  placeholder="••••••••"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={loading}
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full h-11 bg-primary hover:bg-primary/90 text-white text-sm font-bold rounded-lg transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed mt-2"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                    로그인 중...
                  </span>
                ) : '로그인'}
              </button>
            </form>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center mt-6 text-xs text-slate-500">
          쉼표(,) 관리자 시스템 v1.0
        </p>
      </div>
    </div>
  );
}

export default AdminLogin;
