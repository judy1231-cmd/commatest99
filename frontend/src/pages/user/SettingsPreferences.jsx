import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchWithAuth } from '../../api/fetchWithAuth';
import UserNavbar from '../../components/user/UserNavbar';
import Toast from '../../components/common/Toast';

const REST_TYPES = [
  { key: 'physical', label: '신체적 이완', icon: 'fitness_center', color: 'text-red-500' },
  { key: 'mental', label: '정신적 고요', icon: 'spa', color: 'text-emerald-500' },
  { key: 'sensory', label: '감각의 정화', icon: 'visibility_off', color: 'text-amber-500' },
  { key: 'emotional', label: '정서적 지지', icon: 'favorite', color: 'text-pink-500' },
  { key: 'social', label: '사회적 휴식', icon: 'groups', color: 'text-purple-500' },
  { key: 'nature', label: '자연과의 연결', icon: 'forest', color: 'text-green-600' },
  { key: 'creative', label: '창조적 몰입', icon: 'brush', color: 'text-orange-500' },
];

function SettingsPreferences() {
  const navigate = useNavigate();
  const [settings, setSettings] = useState({
    theme: 'light',
    notificationSettingsJson: '{"push":true,"email":true}',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState({ message: '', type: 'success' });

  useEffect(() => {
    fetchWithAuth('/api/user/settings')
      .then(data => { if (data.success && data.data) setSettings(data.data); })
      .finally(() => setLoading(false));
  }, []);

  // 다크모드 실제 적용
  useEffect(() => {
    const root = document.documentElement;
    if (settings.theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [settings.theme]);

  const notifSettings = (() => {
    try { return JSON.parse(settings.notificationSettingsJson || '{}'); }
    catch { return { push: true, email: true }; }
  })();

  const updateNotif = (key, value) => {
    const updated = { ...notifSettings, [key]: value };
    setSettings(s => ({ ...s, notificationSettingsJson: JSON.stringify(updated) }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetchWithAuth('/api/user/settings', {
        method: 'PUT',
        body: JSON.stringify(settings),
      });
      if (res.success) {
        setToast({ message: '설정이 저장되었습니다.', type: 'success' });
      } else {
        setToast({ message: res.message || '저장에 실패했어요.', type: 'error' });
      }
    } catch {
      setToast({ message: '저장에 실패했어요.', type: 'error' });
    } finally { setSaving(false); }
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
          <h1 className="text-xl font-bold text-slate-800">맞춤 추천 설정</h1>
        </div>

        {/* 테마 설정 */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
          <h2 className="font-bold text-slate-700 mb-4 flex items-center gap-2">
            <span className="material-icons text-primary text-base">palette</span>테마
          </h2>
          <div className="flex gap-3">
            {[
              { value: 'light', label: '라이트', icon: 'light_mode' },
              { value: 'dark', label: '다크', icon: 'dark_mode' },
            ].map(t => (
              <button
                key={t.value}
                onClick={() => setSettings(s => ({ ...s, theme: t.value }))}
                className={`flex-1 flex flex-col items-center gap-2 py-4 rounded-xl text-sm font-semibold border-2 transition-all ${
                  settings.theme === t.value
                    ? 'bg-primary/10 border-primary text-primary'
                    : 'bg-gray-50 border-transparent text-slate-500 hover:bg-gray-100'
                }`}
              >
                <span className="material-icons text-2xl">{t.icon}</span>
                {t.label}
              </button>
            ))}
          </div>
          <p className="text-xs text-slate-400 mt-3">다크 모드를 선택하면 즉시 화면에 적용됩니다.</p>
        </div>

        {/* 알림 설정 */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
          <h2 className="font-bold text-slate-700 mb-4 flex items-center gap-2">
            <span className="material-icons text-primary text-base">notifications</span>알림
          </h2>
          <div className="space-y-1">
            {[
              { key: 'push', label: '푸시 알림', desc: '앱 알림을 받습니다.' },
              { key: 'email', label: '이메일 알림', desc: '중요 소식을 이메일로 받습니다.' },
            ].map(({ key, label, desc }) => (
              <div key={key} className="flex items-center justify-between py-3 border-b border-gray-50 last:border-0">
                <div>
                  <p className="text-sm font-medium text-slate-700">{label}</p>
                  <p className="text-xs text-slate-400">{desc}</p>
                </div>
                <button
                  onClick={() => updateNotif(key, !notifSettings[key])}
                  className={`w-12 h-6 rounded-full transition-all relative flex-shrink-0 ${notifSettings[key] ? 'bg-primary' : 'bg-gray-300'}`}
                >
                  <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${notifSettings[key] ? 'translate-x-6' : 'translate-x-0.5'}`} />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* 선호 휴식 유형 */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
          <h2 className="font-bold text-slate-700 mb-1 flex items-center gap-2">
            <span className="material-icons text-primary text-base">tune</span>선호 휴식 유형
          </h2>
          <p className="text-xs text-slate-400 mb-4">선호하는 유형을 선택하면 추천에 반영됩니다. (복수 선택 가능)</p>
          <div className="grid grid-cols-2 gap-2">
            {REST_TYPES.map(type => {
              const preferred = (() => {
                try {
                  const prefs = JSON.parse(settings.preferredTypesJson || '[]');
                  return prefs.includes(type.key);
                } catch { return false; }
              })();
              return (
                <button
                  key={type.key}
                  onClick={() => {
                    const prefs = (() => { try { return JSON.parse(settings.preferredTypesJson || '[]'); } catch { return []; } })();
                    const updated = preferred ? prefs.filter(k => k !== type.key) : [...prefs, type.key];
                    setSettings(s => ({ ...s, preferredTypesJson: JSON.stringify(updated) }));
                  }}
                  className={`flex items-center gap-2 p-3 rounded-xl border-2 text-left transition-all ${
                    preferred ? 'border-primary bg-primary/5' : 'border-gray-100 bg-gray-50 hover:bg-gray-100'
                  }`}
                >
                  <span className={`material-icons text-lg ${preferred ? 'text-primary' : type.color}`}>{type.icon}</span>
                  <span className={`text-xs font-semibold ${preferred ? 'text-primary' : 'text-slate-600'}`}>{type.label}</span>
                  {preferred && <span className="material-icons text-xs text-primary ml-auto">check_circle</span>}
                </button>
              );
            })}
          </div>
        </div>

        <button
          onClick={handleSave}
          disabled={saving}
          className="w-full bg-primary text-white font-bold py-3.5 rounded-xl hover:bg-primary/90 transition-all disabled:opacity-50"
        >
          {saving ? '저장 중...' : '설정 저장'}
        </button>
      </div>

      <Toast message={toast.message} type={toast.type} onClose={() => setToast({ message: '', type: 'success' })} />
    </div>
  );
}

export default SettingsPreferences;
