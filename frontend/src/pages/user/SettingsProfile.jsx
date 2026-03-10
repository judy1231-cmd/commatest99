import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchWithAuth } from '../../api/fetchWithAuth';
import UserNavbar from '../../components/user/UserNavbar';
import Toast from '../../components/common/Toast';

function SettingsProfile() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [settings, setSettings] = useState({ smartwatchType: '' });
  const [nickname, setNickname] = useState('');
  const [nicknameError, setNicknameError] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState({ message: '', type: 'success' });

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const [profileData, settingsData] = await Promise.allSettled([
          fetchWithAuth('/api/user/profile'),
          fetchWithAuth('/api/user/settings'),
        ]);
        if (profileData.status === 'fulfilled' && profileData.value.success) {
          setProfile(profileData.value.data?.user);
          setNickname(profileData.value.data?.user?.nickname || '');
        }
        if (settingsData.status === 'fulfilled' && settingsData.value.success) {
          setSettings(settingsData.value.data || {});
        }
      } finally { setLoading(false); }
    })();
  }, []);

  const handleNicknameSave = async () => {
    setNicknameError('');
    if (!nickname.trim()) { setNicknameError('닉네임을 입력해주세요.'); return; }
    if (nickname.length < 2 || nickname.length > 20) { setNicknameError('2~20자로 입력해주세요.'); return; }

    setSaving(true);
    try {
      const data = await fetchWithAuth('/api/user/nickname', {
        method: 'PATCH',
        body: JSON.stringify({ nickname: nickname.trim() }),
      });
      if (data.success) {
        const stored = JSON.parse(localStorage.getItem('user') || '{}');
        localStorage.setItem('user', JSON.stringify({ ...stored, nickname: nickname.trim() }));
        setToast({ message: '닉네임이 변경되었습니다.', type: 'success' });
      } else {
        setNicknameError(data.message || '변경에 실패했습니다.');
      }
    } catch {
      setNicknameError('저장에 실패했습니다. 다시 시도해주세요.');
    } finally { setSaving(false); }
  };

  const handleSmartwatch = async (value) => {
    const updated = { ...settings, smartwatchType: value };
    setSettings(updated);
    try {
      await fetchWithAuth('/api/user/settings', { method: 'PUT', body: JSON.stringify(updated) });
      setToast({ message: '스마트워치 설정이 저장되었습니다.', type: 'success' });
    } catch {
      setToast({ message: '저장에 실패했어요.', type: 'error' });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F9F7F2]">
        <UserNavbar />
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F9F7F2] pb-24">
      <UserNavbar />
      <div className="max-w-lg mx-auto px-4 pt-6 space-y-4">
        <div className="flex items-center gap-3 mb-2">
          <button onClick={() => navigate('/my')} className="p-1.5 rounded-lg text-slate-400 hover:text-primary hover:bg-green-50">
            <span className="material-icons text-xl">arrow_back</span>
          </button>
          <h1 className="text-xl font-bold text-slate-800">개인정보 관리</h1>
        </div>

        {/* 닉네임 (= 쉼표번호) */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
          <h2 className="font-bold text-slate-700 mb-1 flex items-center gap-2">
            <span className="material-icons text-primary text-base">badge</span>닉네임 변경
          </h2>
          <p className="text-xs text-slate-400 mb-4">
            닉네임은 가입 시 쉼표번호(<span className="font-mono">{profile?.쉼표번호 || '-'}</span>)로 자동 설정됩니다. 원하는 이름으로 변경할 수 있어요.
          </p>
          <label className="block text-xs font-semibold text-slate-500 mb-1.5">현재 닉네임</label>
          <input
            value={nickname}
            onChange={e => { setNickname(e.target.value); setNicknameError(''); }}
            maxLength={20}
            placeholder="닉네임 입력"
            className="w-full h-12 px-4 rounded-xl border border-gray-200 bg-gray-50 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
          />
          {nicknameError && <p className="text-xs text-red-500 mt-1.5">{nicknameError}</p>}
          <button
            onClick={handleNicknameSave}
            disabled={saving}
            className="mt-3 w-full h-11 bg-primary text-white font-bold rounded-xl text-sm hover:bg-primary/90 disabled:opacity-50"
          >
            {saving ? '저장 중...' : '닉네임 변경'}
          </button>
        </div>

        {/* 계정 정보 (읽기 전용) */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
          <h2 className="font-bold text-slate-700 mb-4 flex items-center gap-2">
            <span className="material-icons text-primary text-base">person_outline</span>계정 정보
          </h2>
          <div className="space-y-3">
            <div>
              <p className="text-xs font-semibold text-slate-400 mb-1">이메일</p>
              <p className="text-sm text-slate-700 bg-gray-50 px-4 py-3 rounded-xl border border-gray-100">{profile?.email || '-'}</p>
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-400 mb-1">쉼표번호 (계정 고유 ID · 변경 불가)</p>
              <p className="text-sm text-slate-700 font-mono bg-gray-50 px-4 py-3 rounded-xl border border-gray-100">{profile?.쉼표번호 || profile?.id || '-'}</p>
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-400 mb-1">가입일</p>
              <p className="text-sm text-slate-700 bg-gray-50 px-4 py-3 rounded-xl border border-gray-100">
                {profile?.createdAt ? new Date(profile.createdAt).toLocaleDateString('ko-KR') : '-'}
              </p>
            </div>
          </div>
        </div>

        {/* 스마트워치 설정 */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
          <h2 className="font-bold text-slate-700 mb-4 flex items-center gap-2">
            <span className="material-icons text-primary text-base">watch</span>스마트워치 연결
          </h2>
          <select
            value={settings.smartwatchType || ''}
            onChange={e => handleSmartwatch(e.target.value)}
            className="w-full h-12 px-4 rounded-xl border border-gray-200 bg-gray-50 text-sm outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
          >
            <option value="">선택 안 함</option>
            <option value="apple">Apple Watch</option>
            <option value="galaxy">Galaxy Watch</option>
            <option value="fitbit">Fitbit</option>
            <option value="garmin">Garmin</option>
          </select>
          <p className="text-xs text-slate-400 mt-2">심박 측정 시 사용할 기기를 선택하세요.</p>
        </div>
      </div>

      <Toast message={toast.message} type={toast.type} onClose={() => setToast({ message: '', type: 'success' })} />
    </div>
  );
}

export default SettingsProfile;
