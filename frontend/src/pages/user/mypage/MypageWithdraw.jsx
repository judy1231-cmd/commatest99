import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchWithAuth } from '../../../api/fetchWithAuth';
import UserNavbar from '../../../components/user/UserNavbar';
import Toast from '../../../components/common/Toast';

const WITHDRAW_WARNINGS = [
  { icon: 'psychology', text: '진단 기록과 스트레스 분석 데이터가 모두 삭제돼요.' },
  { icon: 'event_note', text: '휴식 기록, 감정 기록이 복구 불가능하게 삭제돼요.' },
  { icon: 'bar_chart',  text: '통계 및 활동 이력이 전부 사라져요.' },
  { icon: 'person_off', text: '탈퇴 후 동일 이메일로 재가입해도 데이터는 복원되지 않아요.' },
];

function ConfirmModal({ onConfirm, onCancel, loading }) {
  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-end justify-center">
      <div className="bg-white rounded-t-3xl w-full max-w-lg p-6 pb-10">
        <div className="w-10 h-1 bg-slate-200 rounded-full mx-auto mb-6" />
        <div className="text-center mb-6">
          <div className="w-14 h-14 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-3">
            <span className="material-icons text-3xl text-red-500">warning</span>
          </div>
          <h2 className="text-lg font-bold text-slate-800 mb-1">마지막으로 확인해요</h2>
          <p className="text-sm text-slate-500 leading-relaxed">
            탈퇴 후에는 모든 데이터가 삭제되며<br />
            <span className="font-bold text-red-500">복구가 불가능</span>해요.
          </p>
        </div>
        <div className="space-y-2">
          <button
            onClick={onCancel}
            disabled={loading}
            className="w-full py-4 rounded-2xl bg-primary text-white font-bold text-sm hover:bg-primary/90 transition-all disabled:opacity-50"
          >
            돌아갈게요
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className="w-full py-3 rounded-2xl text-red-400 font-semibold text-sm hover:bg-red-50 transition-all disabled:opacity-50"
          >
            {loading ? '처리 중...' : '탈퇴 확인'}
          </button>
        </div>
      </div>
    </div>
  );
}

function MypageWithdraw() {
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [checked, setChecked] = useState(false);
  const [toast, setToast] = useState({ message: '', type: 'error' });

  const userRaw = localStorage.getItem('user');
  const user = userRaw ? JSON.parse(userRaw) : null;
  const isSocialUser = user?.provider && user.provider !== 'local';

  const handleWithdraw = async () => {
    setLoading(true);
    try {
      const res = await fetchWithAuth('/api/auth/withdraw', {
        method: 'POST',
        body: JSON.stringify({ password: isSocialUser ? null : password }),
      });
      if (res.success) {
        localStorage.clear();
        navigate('/auth/login', { replace: true });
      } else {
        setShowModal(false);
        setToast({ message: res.message || '탈퇴 처리에 실패했어요.', type: 'error' });
      }
    } catch {
      setShowModal(false);
      setToast({ message: '서버에 연결할 수 없습니다.', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const canSubmit = (isSocialUser || password.length >= 1) && checked;

  return (
    <div className="min-h-screen bg-[#F7F7F8]">
      <UserNavbar />

      <main className="max-w-lg mx-auto px-4 pt-6 pb-40">

        {/* 뒤로가기 */}
        <button
          onClick={() => navigate('/my')}
          className="flex items-center gap-1 text-sm text-slate-400 hover:text-primary mb-6 transition-colors"
        >
          <span className="material-icons text-base">arrow_back</span>
          마이페이지
        </button>

        {/* 경고 헤더 */}
        <div className="flex flex-col items-center text-center mb-7">
          <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center mb-4">
            <span className="material-icons text-4xl text-red-400">warning_amber</span>
          </div>
          <h1 className="text-[22px] font-extrabold tracking-tight text-slate-800">회원 탈퇴</h1>
          <p className="text-xs text-slate-400 mt-1">탈퇴하기 전에 아래 내용을 꼭 확인해주세요</p>
        </div>

        {/* 탈퇴 경고 카드 */}
        <div className="bg-red-50 border border-red-100 rounded-2xl p-5 mb-4">
          <p className="text-xs font-bold text-red-500 uppercase tracking-widest mb-4">삭제되는 항목</p>
          <div className="space-y-3.5">
            {WITHDRAW_WARNINGS.map((w) => (
              <div key={w.icon} className="flex items-start gap-3">
                <div className="w-7 h-7 rounded-lg bg-red-100 flex items-center justify-center shrink-0 mt-0.5">
                  <span className="material-icons text-red-400 text-sm">{w.icon}</span>
                </div>
                <p className="text-sm text-red-700 leading-relaxed">{w.text}</p>
              </div>
            ))}
          </div>
        </div>

        {/* 비밀번호 확인 */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 mb-4">
          {isSocialUser ? (
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center shrink-0">
                <span className="material-icons text-slate-400 text-lg">
                  {user?.provider === 'kakao' ? 'chat_bubble' : 'account_circle'}
                </span>
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-700">
                  {user?.provider === 'kakao' ? '카카오' : '구글'} 소셜 로그인 계정
                </p>
                <p className="text-xs text-slate-400 mt-0.5">비밀번호 없이 탈퇴가 진행돼요.</p>
              </div>
            </div>
          ) : (
            <div>
              <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-3">
                본인 확인
              </label>
              <div className="flex items-center border-b-2 border-slate-200 focus-within:border-red-400 transition-colors">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="현재 비밀번호를 입력해주세요"
                  className="flex-1 h-11 bg-transparent text-sm text-slate-800 placeholder:text-slate-300 outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-slate-300 hover:text-slate-500 transition-colors p-1"
                >
                  <span className="material-icons text-lg">
                    {showPassword ? 'visibility' : 'visibility_off'}
                  </span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* 확인 체크박스 */}
        <label className="flex items-start gap-3 bg-white rounded-2xl border border-gray-100 shadow-sm p-4 cursor-pointer select-none">
          <div className="mt-0.5 shrink-0">
            <div
              className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all ${
                checked ? 'bg-red-500 border-red-500' : 'border-slate-300 bg-white'
              }`}
              onClick={() => setChecked(!checked)}
            >
              {checked && <span className="material-icons text-white text-sm">check</span>}
            </div>
          </div>
          <p className="text-sm text-slate-600 leading-relaxed" onClick={() => setChecked(!checked)}>
            위 내용을 모두 확인했으며,{' '}
            <span className="font-bold text-red-500">탈퇴 후 데이터 복구가 불가능</span>함을 이해했습니다.
          </p>
        </label>

      </main>

      {/* 하단 고정 버튼 영역 */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-100 px-4 py-4 max-w-lg mx-auto">
        {/* 취소 — 크고 눈에 띄게 */}
        <button
          onClick={() => navigate('/my')}
          className="w-full py-4 rounded-2xl bg-primary text-white font-bold text-base hover:bg-primary/90 transition-all shadow-lg shadow-emerald-100 mb-2"
        >
          돌아갈게요
        </button>
        {/* 탈퇴 — 작고 조용하게 */}
        <button
          onClick={() => setShowModal(true)}
          disabled={!canSubmit}
          className="w-full py-2.5 rounded-xl text-red-400 font-semibold text-sm hover:bg-red-50 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
        >
          회원 탈퇴 신청
        </button>
      </div>

      {showModal && (
        <ConfirmModal
          onConfirm={handleWithdraw}
          onCancel={() => setShowModal(false)}
          loading={loading}
        />
      )}

      <Toast message={toast.message} type={toast.type} onClose={() => setToast({ message: '', type: 'error' })} />
    </div>
  );
}

export default MypageWithdraw;
