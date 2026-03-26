import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchWithAuth } from '../../api/fetchWithAuth';
import UserNavbar from '../../components/user/UserNavbar';
import Toast from '../../components/common/Toast';

function ReadOnlyRow({ label, value }) {
  return (
    <div className="flex items-center justify-between py-3.5 border-b border-slate-50 last:border-0">
      <span className="text-sm text-slate-400">{label}</span>
      <span className="text-sm font-medium text-slate-700">{value || '-'}</span>
    </div>
  );
}

function SettingsProfile() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [settings, setSettings] = useState({ smartwatchType: '' });
  const [nickname, setNickname] = useState('');
  const [nicknameError, setNicknameError] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [photoUploading, setPhotoUploading] = useState(false);
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

  const handlePhotoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPhotoUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const token = localStorage.getItem('token');
      const res = await fetch('/api/user/upload-photo', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData,
      });
      const data = await res.json();
      if (data.success) {
        setProfile(prev => ({ ...prev, profileImage: data.data.profileImage }));
        setToast({ message: '프로필 사진이 변경되었습니다.', type: 'success' });
      } else {
        setToast({ message: data.message || '업로드에 실패했습니다.', type: 'error' });
      }
    } catch {
      setToast({ message: '업로드 중 오류가 발생했습니다.', type: 'error' });
    } finally {
      setPhotoUploading(false);
      e.target.value = '';
    }
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
      <div className="min-h-screen bg-[#F7F7F8]">
        <UserNavbar />
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
        </div>
      </div>
    );
  }

  const avatarLetter = (profile?.nickname || nickname || '?')[0];
  const profileImageUrl = profile?.profileImage;

  return (
    <div className="min-h-screen bg-[#F7F7F8]">
      <UserNavbar />

      <main className="max-w-lg mx-auto px-4 pt-6 pb-36">

        {/* 뒤로가기 */}
        <button
          onClick={() => navigate('/my')}
          className="flex items-center gap-1 text-sm text-slate-400 hover:text-primary mb-5 transition-colors"
        >
          <span className="material-icons text-base">arrow_back</span>
          마이페이지
        </button>

        {/* 헤더 */}
        <div className="mb-8">
          <h1 className="text-[22px] font-extrabold tracking-tight text-slate-800">개인정보 관리</h1>
          <p className="text-xs text-slate-400 mt-0.5">프로필 정보를 수정할 수 있어요</p>
        </div>

        {/* 아바타 */}
        <div className="flex flex-col items-center mb-8">
          <label className="relative cursor-pointer group">
            <input
              type="file"
              accept="image/jpeg,image/png,image/gif,image/webp"
              className="hidden"
              onChange={handlePhotoUpload}
              disabled={photoUploading}
            />
            <div
              className="w-24 h-24 rounded-full flex items-center justify-center text-white text-4xl font-black shadow-md overflow-hidden"
              style={!profileImageUrl ? { background: 'linear-gradient(135deg, #10b981 0%, #0d9488 100%)' } : {}}
            >
              {profileImageUrl
                ? <img src={profileImageUrl} alt="프로필" className="w-full h-full object-cover" />
                : avatarLetter
              }
            </div>
            <div className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-white border-2 border-slate-100 shadow-sm flex items-center justify-center group-hover:bg-primary/10 transition-colors">
              {photoUploading
                ? <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                : <span className="material-icons text-slate-400 text-sm">photo_camera</span>
              }
            </div>
          </label>
          <p className="text-xs text-slate-400 mt-3">
            {photoUploading ? '업로드 중...' : '클릭하여 사진 변경 (JPG · PNG · GIF · WEBP · 5MB 이하)'}
          </p>
        </div>

        {/* 닉네임 */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 px-5 py-5 mb-4">
          <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-2">
            닉네임
          </label>
          <div className={`flex items-center border-b-2 transition-colors ${
            nicknameError ? 'border-red-400' : 'border-slate-200 focus-within:border-primary'
          }`}>
            <input
              value={nickname}
              onChange={e => { setNickname(e.target.value); setNicknameError(''); }}
              maxLength={20}
              placeholder="닉네임 입력 (2~20자)"
              className="flex-1 h-11 bg-transparent text-sm text-slate-800 placeholder:text-slate-300 outline-none"
            />
            <span className="text-[11px] text-slate-300 shrink-0">{nickname.length}/20</span>
          </div>
          {nicknameError && (
            <p className="text-xs text-red-500 flex items-center gap-1 mt-2">
              <span className="material-icons text-sm">error_outline</span>
              {nicknameError}
            </p>
          )}
          <p className="text-xs text-slate-400 mt-2">
            가입 시 쉼표번호로 자동 설정되며, 원하는 이름으로 변경할 수 있어요.
          </p>
        </div>

        {/* 계정 정보 (읽기 전용) */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 px-5 py-2 mb-4">
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest pt-4 pb-1">계정 정보</p>
          <ReadOnlyRow label="이메일" value={profile?.email} />
          <ReadOnlyRow
            label="가입일"
            value={profile?.createdAt ? new Date(profile.createdAt).toLocaleDateString('ko-KR') : '-'}
          />
          {profile?.username && <ReadOnlyRow label="아이디" value={profile.username} />}
        </div>

        {/* 스마트워치 */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 px-5 py-5">
          <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-3">
            스마트워치 연결
          </label>
          <div className="flex items-center border-b-2 border-slate-200 focus-within:border-primary transition-colors">
            <span className="material-icons text-slate-300 text-lg mr-2">watch</span>
            <select
              value={settings.smartwatchType || ''}
              onChange={e => handleSmartwatch(e.target.value)}
              className="flex-1 h-11 bg-transparent text-sm text-slate-700 outline-none appearance-none cursor-pointer"
            >
              <option value="">선택 안 함</option>
              <option value="apple">Apple Watch</option>
              <option value="galaxy">Galaxy Watch</option>
              <option value="fitbit">Fitbit</option>
              <option value="garmin">Garmin</option>
            </select>
            <span className="material-icons text-slate-300 text-lg">expand_more</span>
          </div>
          <p className="text-xs text-slate-400 mt-2">심박 측정 시 사용할 기기를 선택하세요.</p>
        </div>

      </main>

      {/* 하단 고정 저장 버튼 */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-100 px-4 py-4 max-w-lg mx-auto">
        <button
          onClick={handleNicknameSave}
          disabled={saving || !nickname.trim()}
          className="w-full bg-primary text-white font-bold py-4 rounded-2xl hover:bg-primary/90 transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-lg shadow-emerald-100"
        >
          {saving ? '저장 중...' : '변경사항 저장'}
        </button>
      </div>

      <Toast message={toast.message} type={toast.type} onClose={() => setToast({ message: '', type: 'success' })} />
    </div>
  );
}

export default SettingsProfile;
