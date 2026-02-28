import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchWithAuth } from '../../api/fetchWithAuth';
import UserNavbar from '../../components/user/UserNavbar';
import Toast from '../../components/common/Toast';

function Settings() {
  const navigate = useNavigate();
  const [settings, setSettings] = useState({
    theme: 'light',
    smartwatchType: '',
    notificationSettingsJson: '{"push":true,"email":true}',
  });
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState({ message: '', type: 'success' });

  useEffect(() => {
    fetchWithAuth('/api/user/settings')
      .then((data) => {
        if (data.success && data.data) setSettings(data.data);
      })
      .catch(() => setToast({ message: '설정을 불러오지 못했어요.', type: 'error' }))
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    try {
      const res = await fetchWithAuth('/api/user/settings', {
        method: 'PUT',
        body: JSON.stringify(settings),
      });
      if (res.success) {
        setToast({ message: '설정이 저장되었습니다.', type: 'success' });
      }
    } catch {
      setToast({ message: '저장에 실패했어요.', type: 'error' });
    }
  };

  const notifSettings = (() => {
    try { return JSON.parse(settings.notificationSettingsJson || '{}'); }
    catch { return { push: true, email: true }; }
  })();

  const updateNotif = (key, value) => {
    const updated = { ...notifSettings, [key]: value };
    setSettings({ ...settings, notificationSettingsJson: JSON.stringify(updated) });
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
      <div className="max-w-lg mx-auto px-4 pt-6">
        <h1 className="text-xl font-bold text-slate-800 mb-6">설정</h1>

        {/* 테마 설정 */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 mb-4">
          <h2 className="font-bold text-slate-700 mb-3">테마</h2>
          <div className="flex gap-3">
            {['light', 'dark'].map((t) => (
              <button
                key={t}
                onClick={() => setSettings({ ...settings, theme: t })}
                className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                  settings.theme === t
                    ? 'bg-primary text-white'
                    : 'bg-gray-100 text-slate-500'
                }`}
              >
                {t === 'light' ? '라이트' : '다크'}
              </button>
            ))}
          </div>
        </div>

        {/* 알림 설정 */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 mb-4">
          <h2 className="font-bold text-slate-700 mb-3">알림</h2>
          {[
            { key: 'push', label: '푸시 알림' },
            { key: 'email', label: '이메일 알림' },
          ].map(({ key, label }) => (
            <div key={key} className="flex items-center justify-between py-2">
              <span className="text-sm text-slate-600">{label}</span>
              <button
                onClick={() => updateNotif(key, !notifSettings[key])}
                className={`w-12 h-6 rounded-full transition-all ${
                  notifSettings[key] ? 'bg-primary' : 'bg-gray-300'
                }`}
              >
                <div className={`w-5 h-5 bg-white rounded-full shadow transition-transform ${
                  notifSettings[key] ? 'translate-x-6' : 'translate-x-0.5'
                }`} />
              </button>
            </div>
          ))}
        </div>

        {/* 스마트워치 설정 */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 mb-6">
          <h2 className="font-bold text-slate-700 mb-3">스마트워치</h2>
          <select
            value={settings.smartwatchType || ''}
            onChange={(e) => setSettings({ ...settings, smartwatchType: e.target.value })}
            className="w-full h-12 px-4 rounded-xl border border-gray-200 bg-gray-50 outline-none"
          >
            <option value="">선택 안 함</option>
            <option value="apple">Apple Watch</option>
            <option value="galaxy">Galaxy Watch</option>
            <option value="fitbit">Fitbit</option>
            <option value="garmin">Garmin</option>
          </select>
        </div>

        <button
          onClick={handleSave}
          className="w-full bg-primary text-white font-bold py-3 rounded-xl hover:bg-primary/90 transition-all active:scale-[0.98]"
        >
          저장하기
        </button>

        {/* 회원 탈퇴 */}
        <button
          onClick={() => {
            if (window.confirm('정말 탈퇴하시겠어요? 이 작업은 되돌릴 수 없습니다.')) {
              fetchWithAuth('/api/user/account', { method: 'DELETE' }).then(() => {
                localStorage.clear();
                navigate('/');
              });
            }
          }}
          className="w-full text-red-400 text-sm mt-6 py-2 hover:text-red-500"
        >
          회원 탈퇴
        </button>
      </div>

      <Toast message={toast.message} type={toast.type} onClose={() => setToast({ message: '', type: 'success' })} />
    </div>
  );
}

export default Settings;
