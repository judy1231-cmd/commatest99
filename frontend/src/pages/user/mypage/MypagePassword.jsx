import { useState } from 'react';
import { fetchWithAuth } from '../../../api/fetchWithAuth';
import UserNavbar from '../../../components/user/UserNavbar';
import Toast from '../../../components/common/Toast';

function PasswordInput({ label, value, onChange, placeholder, showPassword, onToggle, status }) {
  const borderColor =
    status === 'error' ? 'border-red-400' :
    status === 'ok'    ? 'border-primary' :
                         'border-slate-200 focus-within:border-primary';

  return (
    <div>
      <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-2">
        {label}
      </label>
      <div className={`flex items-center border-b-2 transition-colors ${borderColor}`}>
        <input
          type={showPassword ? 'text' : 'password'}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className="flex-1 h-11 bg-transparent text-sm text-slate-800 placeholder:text-slate-300 outline-none"
        />
        <button
          type="button"
          onClick={onToggle}
          className="text-slate-300 hover:text-slate-500 transition-colors p-1"
        >
          <span className="material-icons text-lg">
            {showPassword ? 'visibility' : 'visibility_off'}
          </span>
        </button>
      </div>
    </div>
  );
}

function getPasswordStrength(password) {
  if (!password) return { level: 0, label: '', color: '' };
  let score = 0;
  if (password.length >= 8) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;

  if (score <= 1) return { level: 1, label: '약함',    color: '#EF4444' };
  if (score === 2) return { level: 2, label: '보통',    color: '#F59E0B' };
  if (score === 3) return { level: 3, label: '강함',    color: '#10B981' };
  return             { level: 4, label: '매우 강함', color: '#059669' };
}

function MypagePassword() {
  const userRaw = localStorage.getItem('user');
  const user = userRaw ? JSON.parse(userRaw) : null;
  const isSocialUser = user?.provider && user.provider !== 'local';

  const [form, setForm] = useState({ current: '', next: '', confirm: '' });
  const [show, setShow] = useState({ current: false, next: false, confirm: false });
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState({ message: '', type: 'success' });

  const strength = getPasswordStrength(form.next);

  const confirmStatus =
    !form.confirm         ? 'idle' :
    form.next === form.confirm && form.next.length >= 8 ? 'ok' : 'error';

  const isValid =
    form.current.trim() &&
    form.next.length >= 8 &&
    form.next === form.confirm;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isValid) return;

    setSaving(true);
    try {
      const res = await fetchWithAuth('/api/auth/password/change', {
        method: 'POST',
        body: JSON.stringify({
          currentPassword: form.current,
          newPassword: form.next,
        }),
      });
      if (res.success) {
        setToast({ message: '비밀번호가 변경됐어요!', type: 'success' });
        setForm({ current: '', next: '', confirm: '' });
      } else {
        setToast({ message: res.message || '비밀번호 변경에 실패했어요.', type: 'error' });
      }
    } catch {
      setToast({ message: '서버에 연결할 수 없습니다.', type: 'error' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F7F7F8]">
      <UserNavbar />

      <main className="max-w-lg mx-auto px-4 pt-6 pb-32">

        {/* 뒤로가기 */}
        <button
          onClick={() => window.history.back()}
          className="flex items-center gap-1 text-sm text-slate-400 hover:text-primary mb-5 transition-colors"
        >
          <span className="material-icons text-base">arrow_back</span>
          마이페이지
        </button>

        {/* 헤더 */}
        <div className="mb-8">
          <h1 className="text-[22px] font-extrabold tracking-tight text-slate-800">비밀번호 변경</h1>
          <p className="text-xs text-slate-400 mt-0.5">계정 보안을 위해 주기적으로 변경해요</p>
        </div>

        {/* 소셜 가입자 안내 */}
        {isSocialUser ? (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center">
            <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-4">
              <span className="material-icons text-3xl text-slate-300">lock</span>
            </div>
            <p className="font-bold text-slate-700 mb-1">비밀번호 변경 불가</p>
            <p className="text-sm text-slate-400 leading-relaxed">
              {user.provider === 'kakao' ? '카카오' : '구글'} 소셜 로그인으로 가입된 계정은<br />
              비밀번호를 별도로 설정할 수 없어요.
            </p>
            <p className="text-xs text-slate-300 mt-4">
              비밀번호 변경이 필요하다면 해당 소셜 서비스에서 설정해주세요.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>

            {/* 보안 안내 */}
            <div className="bg-amber-50 border border-amber-100 rounded-2xl p-4 flex items-start gap-3 mb-6">
              <span className="material-icons text-amber-400 text-base mt-0.5 shrink-0">info</span>
              <p className="text-xs text-amber-700 leading-relaxed">
                8자 이상, 영문 대문자·숫자·특수문자를 포함하면 더 안전해요.
              </p>
            </div>

            {/* 현재 비밀번호 */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 px-5 py-5 mb-3">
              <PasswordInput
                label="현재 비밀번호"
                value={form.current}
                onChange={(e) => setForm({ ...form, current: e.target.value })}
                placeholder="현재 비밀번호"
                showPassword={show.current}
                onToggle={() => setShow({ ...show, current: !show.current })}
              />
            </div>

            {/* 새 비밀번호 + 확인 */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 px-5 py-5 space-y-5">
              {/* 새 비밀번호 */}
              <PasswordInput
                label="새 비밀번호"
                value={form.next}
                onChange={(e) => setForm({ ...form, next: e.target.value })}
                placeholder="새 비밀번호 (8자 이상)"
                showPassword={show.next}
                onToggle={() => setShow({ ...show, next: !show.next })}
              />

              {/* 강도 바 */}
              {form.next && (
                <div>
                  <div className="flex items-center gap-1 mb-1.5">
                    {[1, 2, 3, 4].map((i) => (
                      <div
                        key={i}
                        className="flex-1 h-1.5 rounded-full transition-all duration-300"
                        style={{ backgroundColor: i <= strength.level ? strength.color : '#e2e8f0' }}
                      />
                    ))}
                  </div>
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-semibold" style={{ color: strength.color }}>
                      {strength.label}
                    </p>
                    <p className="text-[10px] text-slate-300">
                      {strength.level}/4 단계
                    </p>
                  </div>
                </div>
              )}

              <div className="border-t border-slate-100" />

              {/* 새 비밀번호 확인 */}
              <PasswordInput
                label="새 비밀번호 확인"
                value={form.confirm}
                onChange={(e) => setForm({ ...form, confirm: e.target.value })}
                placeholder="새 비밀번호 재입력"
                showPassword={show.confirm}
                onToggle={() => setShow({ ...show, confirm: !show.confirm })}
                status={confirmStatus === 'idle' ? undefined : confirmStatus}
              />

              {/* 확인 피드백 */}
              {confirmStatus === 'error' && (
                <p className="text-xs text-red-500 flex items-center gap-1 -mt-2">
                  <span className="material-icons text-sm">error_outline</span>
                  비밀번호가 일치하지 않아요.
                </p>
              )}
              {confirmStatus === 'ok' && (
                <p className="text-xs text-primary flex items-center gap-1 -mt-2">
                  <span className="material-icons text-sm">check_circle</span>
                  비밀번호가 일치해요.
                </p>
              )}
            </div>

          </form>
        )}
      </main>

      {/* 하단 고정 저장 버튼 */}
      {!isSocialUser && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-100 px-4 py-4 max-w-lg mx-auto">
          <button
            onClick={handleSubmit}
            disabled={!isValid || saving}
            className="w-full bg-primary text-white font-bold py-4 rounded-2xl hover:bg-primary/90 transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-lg shadow-emerald-100"
          >
            {saving ? '변경 중...' : '비밀번호 변경'}
          </button>
        </div>
      )}

      <Toast message={toast.message} type={toast.type} onClose={() => setToast({ message: '', type: 'success' })} />
    </div>
  );
}

export default MypagePassword;
