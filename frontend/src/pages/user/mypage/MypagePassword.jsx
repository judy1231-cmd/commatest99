import { useState } from 'react';
import { fetchWithAuth } from '../../../api/fetchWithAuth';
import UserNavbar from '../../../components/user/UserNavbar';
import Toast from '../../../components/common/Toast';

function PasswordInput({ label, value, onChange, placeholder, showPassword, onToggle }) {
  return (
    <div>
      <label className="block text-sm font-semibold text-slate-700 mb-1.5">{label}</label>
      <div className="relative">
        <input
          type={showPassword ? 'text' : 'password'}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className="w-full h-12 px-4 pr-12 rounded-xl border border-gray-200 bg-gray-50 text-sm text-slate-700 placeholder:text-slate-400 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
        />
        <button
          type="button"
          onClick={onToggle}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
        >
          <span className="material-icons text-xl">{showPassword ? 'visibility' : 'visibility_off'}</span>
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

  if (score <= 1) return { level: 1, label: '약함', color: '#EF4444' };
  if (score === 2) return { level: 2, label: '보통', color: '#F59E0B' };
  if (score === 3) return { level: 3, label: '강함', color: '#10B981' };
  return { level: 4, label: '매우 강함', color: '#059669' };
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
    <div className="min-h-screen bg-[#F9F7F2]">
      <UserNavbar />

      <main className="max-w-lg mx-auto px-4 pt-6 pb-24">

        {/* 헤더 */}
        <div className="mb-6">
          <h1 className="text-xl font-bold text-slate-800">비밀번호 변경</h1>
          <p className="text-sm text-slate-400 mt-0.5">계정 보안을 위해 주기적으로 변경해요</p>
        </div>

        {/* 소셜 가입자 안내 */}
        {isSocialUser ? (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center">
            <span className="material-icons text-5xl text-slate-200 mb-3 block">lock</span>
            <p className="font-semibold text-slate-600 mb-1">비밀번호 변경 불가</p>
            <p className="text-sm text-slate-400">
              {user.provider === 'kakao' ? '카카오' : '구글'} 소셜 로그인으로 가입된 계정은
              <br />비밀번호를 별도로 설정할 수 없어요.
            </p>
            <p className="text-xs text-slate-300 mt-4">
              비밀번호 변경이 필요하다면 해당 소셜 서비스에서 설정해주세요.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">

            {/* 보안 안내 */}
            <div className="bg-amber-50 border border-amber-100 rounded-2xl p-4 flex items-start gap-3">
              <span className="material-icons text-amber-400 text-base mt-0.5">info</span>
              <p className="text-xs text-amber-700">
                비밀번호는 8자 이상, 영문 대문자·숫자·특수문자를 포함하면 더 안전해요.
              </p>
            </div>

            {/* 입력 폼 */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 space-y-4">
              <PasswordInput
                label="현재 비밀번호"
                value={form.current}
                onChange={(e) => setForm({ ...form, current: e.target.value })}
                placeholder="현재 비밀번호를 입력해주세요"
                showPassword={show.current}
                onToggle={() => setShow({ ...show, current: !show.current })}
              />

              <div className="border-t border-slate-100" />

              <PasswordInput
                label="새 비밀번호"
                value={form.next}
                onChange={(e) => setForm({ ...form, next: e.target.value })}
                placeholder="새 비밀번호를 입력해주세요 (8자 이상)"
                showPassword={show.next}
                onToggle={() => setShow({ ...show, next: !show.next })}
              />

              {/* 비밀번호 강도 */}
              {form.next && (
                <div>
                  <div className="flex gap-1 mb-1">
                    {[1, 2, 3, 4].map((i) => (
                      <div
                        key={i}
                        className="flex-1 h-1.5 rounded-full transition-all duration-300"
                        style={{
                          backgroundColor: i <= strength.level ? strength.color : '#e2e8f0',
                        }}
                      />
                    ))}
                  </div>
                  <p className="text-xs" style={{ color: strength.color }}>{strength.label}</p>
                </div>
              )}

              <PasswordInput
                label="새 비밀번호 확인"
                value={form.confirm}
                onChange={(e) => setForm({ ...form, confirm: e.target.value })}
                placeholder="새 비밀번호를 한 번 더 입력해주세요"
                showPassword={show.confirm}
                onToggle={() => setShow({ ...show, confirm: !show.confirm })}
              />

              {/* 불일치 안내 */}
              {form.confirm && form.next !== form.confirm && (
                <p className="text-xs text-red-500 flex items-center gap-1">
                  <span className="material-icons text-xs">error_outline</span>
                  새 비밀번호가 일치하지 않아요.
                </p>
              )}

              {/* 일치 안내 */}
              {form.confirm && form.next === form.confirm && form.next.length >= 8 && (
                <p className="text-xs text-primary flex items-center gap-1">
                  <span className="material-icons text-xs">check_circle</span>
                  비밀번호가 일치해요.
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={!isValid || saving}
              className="w-full bg-primary text-white font-bold py-3 rounded-xl hover:bg-primary/90 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {saving ? '변경 중...' : '비밀번호 변경'}
            </button>
          </form>
        )}
      </main>

      <Toast message={toast.message} type={toast.type} onClose={() => setToast({ message: '', type: 'success' })} />
    </div>
  );
}

export default MypagePassword;
