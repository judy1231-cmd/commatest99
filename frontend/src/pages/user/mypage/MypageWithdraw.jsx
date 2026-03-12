import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchWithAuth } from '../../../api/fetchWithAuth';
import UserNavbar from '../../../components/user/UserNavbar';
import Toast from '../../../components/common/Toast';

const WITHDRAW_WARNINGS = [
  { icon: 'psychology', text: '진단 기록과 스트레스 분석 데이터가 모두 삭제돼요.' },
  { icon: 'event_note', text: '휴식 기록, 감정 기록이 복구 불가능하게 삭제돼요.' },
  { icon: 'bar_chart', text: '통계 및 활동 이력이 전부 사라져요.' },
  { icon: 'person_off', text: '탈퇴 후 동일 이메일로 재가입하더라도 데이터는 복원되지 않아요.' },
];

function ConfirmModal({ onConfirm, onCancel, loading }) {
  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-end justify-center p-0">
      <div className="bg-white rounded-t-3xl w-full max-w-lg p-6 pb-10">
        <div className="w-10 h-1 bg-slate-200 rounded-full mx-auto mb-6" />
        <div className="text-center mb-6">
          <div className="w-14 h-14 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-3">
            <span className="material-icons text-3xl text-red-500">warning</span>
          </div>
          <h2 className="text-lg font-bold text-slate-800 mb-1">정말 탈퇴할까요?</h2>
          <p className="text-sm text-slate-500">
            탈퇴 후에는 모든 데이터가 삭제되며<br />
            <span className="font-bold text-red-500">복구가 불가능</span>해요.
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={onCancel}
            disabled={loading}
            className="flex-1 py-3.5 rounded-2xl border border-slate-200 text-slate-600 font-bold text-sm hover:bg-slate-50 transition-all disabled:opacity-50"
          >
            취소
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className="flex-1 py-3.5 rounded-2xl bg-red-500 text-white font-bold text-sm hover:bg-red-600 transition-all disabled:opacity-50"
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

  const canSubmit = isSocialUser || password.length >= 1;

  return (
    <div className="min-h-screen bg-[#F7F7F8]">
      <UserNavbar />

      <main className="max-w-lg mx-auto px-4 pt-6 pb-24">

        {/* 뒤로가기 */}
        <button
          onClick={() => navigate('/my')}
          className="flex items-center gap-1 text-sm text-slate-400 hover:text-primary mb-5 transition-colors"
        >
          <span className="material-icons text-base">arrow_back</span>
          마이페이지
        </button>

        {/* 헤더 */}
        <div className="mb-6">
          <h1 className="text-[22px] font-extrabold tracking-tight text-slate-800">회원 탈퇴</h1>
          <p className="text-xs text-slate-400 mt-0.5">탈퇴 전에 아래 내용을 꼭 확인해주세요</p>
        </div>

        {/* 탈퇴 경고 안내 */}
        <div className="bg-red-50 border border-red-100 rounded-2xl p-5 mb-4">
          <div className="flex items-center gap-2 mb-4">
            <span className="material-icons text-red-500 text-lg">error_outline</span>
            <p className="font-bold text-red-600 text-sm">탈퇴하면 다음 항목이 삭제돼요</p>
          </div>
          <div className="space-y-3">
            {WITHDRAW_WARNINGS.map((w) => (
              <div key={w.icon} className="flex items-start gap-3">
                <span className="material-icons text-red-400 text-base mt-0.5 shrink-0">{w.icon}</span>
                <p className="text-sm text-red-700 leading-relaxed">{w.text}</p>
              </div>
            ))}
          </div>
        </div>

        {/* 비밀번호 확인 (일반 가입자만) */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 mb-5">
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
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">
                본인 확인
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="현재 비밀번호를 입력해주세요"
                  className="w-full h-12 px-4 pr-12 rounded-xl border border-gray-200 bg-gray-50 text-sm text-slate-700 placeholder:text-slate-300 focus:ring-2 focus:ring-red-100 focus:border-red-400 outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  <span className="material-icons text-xl">
                    {showPassword ? 'visibility' : 'visibility_off'}
                  </span>
                </button>
              </div>
              <p className="text-xs text-slate-400 mt-2">
                본인 확인을 위해 현재 비밀번호를 입력해주세요.
              </p>
            </div>
          )}
        </div>

        {/* 탈퇴 버튼 */}
        <button
          onClick={() => setShowModal(true)}
          disabled={!canSubmit}
          className="w-full py-4 rounded-2xl border-2 border-red-300 text-red-500 font-bold text-sm hover:bg-red-50 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
        >
          회원 탈퇴 신청
        </button>

        <p className="text-xs text-slate-400 text-center mt-3">
          탈퇴 후 데이터는 즉시 삭제되며 복구할 수 없어요.
        </p>
      </main>

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
