import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchWithAuth } from '../../api/fetchWithAuth';
import UserNavbar from '../../components/user/UserNavbar';
import Toast from '../../components/common/Toast';

const REST_TYPES = [
  { key: 'physical',  label: '신체적 이완', icon: 'fitness_center', color: '#4CAF82' },
  { key: 'mental',    label: '정신적 고요', icon: 'spa',            color: '#5B8DEF' },
  { key: 'sensory',   label: '감각의 정화', icon: 'visibility_off', color: '#9B6DFF' },
  { key: 'emotional', label: '정서적 지지', icon: 'favorite',       color: '#FF7BAC' },
  { key: 'social',    label: '사회적 휴식', icon: 'groups',         color: '#FF9A3C' },
  { key: 'creative',  label: '창조적 몰입', icon: 'brush',          color: '#FFB830' },
  { key: 'nature',    label: '자연의 연결', icon: 'forest',         color: '#2ECC9A' },
];

function Toggle({ checked, onChange }) {
  return (
    <button
      type="button"
      onClick={onChange}
      className={`relative w-11 h-6 rounded-full transition-colors duration-200 shrink-0 ${
        checked ? 'bg-primary' : 'bg-slate-200'
      }`}
    >
      <div
        className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-all duration-200 ${
          checked ? 'left-[22px]' : 'left-0.5'
        }`}
      />
    </button>
  );
}

function ToggleRow({ iconBg, iconColor, icon, label, desc, checked, onChange }) {
  return (
    <div className="flex items-center gap-3 px-5 py-4">
      <div
        className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
        style={{ backgroundColor: iconBg }}
      >
        <span className="material-icons text-[18px]" style={{ color: iconColor }}>{icon}</span>
      </div>
      <div className="flex-1">
        <p className="text-sm font-semibold text-slate-700">{label}</p>
        {desc && <p className="text-xs text-slate-400 mt-0.5">{desc}</p>}
      </div>
      <Toggle checked={checked} onChange={onChange} />
    </div>
  );
}

function SectionGroup({ title, children }) {
  return (
    <div className="px-4">
      {title && (
        <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest px-1 mb-2">
          {title}
        </p>
      )}
      <div className="bg-white rounded-2xl overflow-hidden divide-y divide-slate-50">
        {children}
      </div>
    </div>
  );
}

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

  // 다크모드 즉시 적용 (html + body 모두)
  useEffect(() => {
    if (settings.theme === 'dark') {
      document.documentElement.classList.add('dark');
      document.body.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
      document.body.classList.remove('dark');
    }
    localStorage.setItem('theme', settings.theme || 'light');
  }, [settings.theme]);

  const notifSettings = (() => {
    try { return JSON.parse(settings.notificationSettingsJson || '{}'); }
    catch { return { push: true, email: true }; }
  })();

  const updateNotif = (key, value) => {
    const updated = { ...notifSettings, [key]: value };
    setSettings(s => ({ ...s, notificationSettingsJson: JSON.stringify(updated) }));
  };

  const preferredTypes = (() => {
    try { return JSON.parse(settings.preferredTypesJson || '[]'); }
    catch { return []; }
  })();

  const toggleType = (key) => {
    const updated = preferredTypes.includes(key)
      ? preferredTypes.filter(k => k !== key)
      : [...preferredTypes, key];
    setSettings(s => ({ ...s, preferredTypesJson: JSON.stringify(updated) }));
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
      <div className="min-h-screen bg-[#F7F7F8]">
        <UserNavbar />
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F7F7F8]">
      <UserNavbar />

      <main className="max-w-lg mx-auto px-0 pt-6 pb-36">

        {/* 뒤로가기 + 헤더 */}
        <div className="px-4 mb-6">
          <button
            onClick={() => navigate('/my')}
            className="flex items-center gap-1 text-sm text-slate-400 hover:text-primary mb-5 transition-colors"
          >
            <span className="material-icons text-base">arrow_back</span>
            마이페이지
          </button>
          <h1 className="text-[22px] font-extrabold tracking-tight text-slate-800">맞춤 추천 설정</h1>
          <p className="text-xs text-slate-400 mt-0.5">알림과 앱 환경을 원하는 대로 조정해요</p>
        </div>

        <div className="space-y-3">

          {/* 알림 */}
          <SectionGroup title="알림">
            <ToggleRow
              icon="notifications_active"
              iconBg="#ECFDF5" iconColor="#10b981"
              label="푸시 알림"
              desc="휴식 추천, 챌린지 알림을 받아요"
              checked={!!notifSettings.push}
              onChange={() => updateNotif('push', !notifSettings.push)}
            />
            <ToggleRow
              icon="email"
              iconBg="#EFF6FF" iconColor="#5B8DEF"
              label="이메일 알림"
              desc="중요 소식을 이메일로 받아요"
              checked={!!notifSettings.email}
              onChange={() => updateNotif('email', !notifSettings.email)}
            />
          </SectionGroup>

          {/* 앱 설정 */}
          <SectionGroup title="앱 설정">
            {/* 테마 */}
            <div className="flex items-center gap-3 px-5 py-4 opacity-50">
              <div className="w-9 h-9 rounded-xl bg-amber-50 flex items-center justify-center shrink-0">
                <span className="material-icons text-[18px] text-amber-400">light_mode</span>
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-slate-700">테마</p>
                <p className="text-xs text-slate-400 mt-0.5">다크 모드는 준비 중이에요</p>
              </div>
              <span className="text-xs font-bold px-2.5 py-1 bg-slate-100 text-slate-400 rounded-full">준비 중</span>
            </div>
          </SectionGroup>

          {/* 선호 휴식 유형 */}
          <SectionGroup title="선호 휴식 유형">
            <div className="px-5 py-4">
              <p className="text-xs text-slate-400 mb-3">
                선호하는 유형을 선택하면 추천에 반영돼요 (복수 선택 가능)
              </p>
              <div className="grid grid-cols-2 gap-2">
                {REST_TYPES.map(type => {
                  const selected = preferredTypes.includes(type.key);
                  return (
                    <button
                      key={type.key}
                      onClick={() => toggleType(type.key)}
                      className={`flex items-center gap-2.5 p-3 rounded-xl border-2 text-left transition-all ${
                        selected
                          ? 'border-transparent'
                          : 'border-slate-100 bg-slate-50 hover:bg-slate-100'
                      }`}
                      style={selected ? {
                        backgroundColor: `${type.color}15`,
                        borderColor: `${type.color}50`,
                      } : {}}
                    >
                      <div
                        className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
                        style={{ backgroundColor: selected ? `${type.color}25` : '#f1f5f9' }}
                      >
                        <span
                          className="material-icons text-sm"
                          style={{ color: selected ? type.color : '#94a3b8' }}
                        >
                          {type.icon}
                        </span>
                      </div>
                      <span
                        className="text-xs font-semibold flex-1"
                        style={{ color: selected ? type.color : '#64748b' }}
                      >
                        {type.label}
                      </span>
                      {selected && (
                        <span className="material-icons text-sm shrink-0" style={{ color: type.color }}>
                          check_circle
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          </SectionGroup>

        </div>
      </main>

      {/* 하단 고정 저장 버튼 */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-100 px-4 py-4 max-w-lg mx-auto">
        <button
          onClick={handleSave}
          disabled={saving}
          className="w-full bg-primary text-white font-bold py-4 rounded-2xl hover:bg-primary/90 transition-all disabled:opacity-50 shadow-lg shadow-emerald-100"
        >
          {saving ? '저장 중...' : '설정 저장'}
        </button>
      </div>

      <Toast message={toast.message} type={toast.type} onClose={() => setToast({ message: '', type: 'success' })} />
    </div>
  );
}

export default SettingsPreferences;
