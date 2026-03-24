import { useState, useEffect, useCallback } from 'react';
import AdminSidebar from '../../components/admin/AdminSidebar';
import AdminHeader from '../../components/admin/AdminHeader';
import Toast from '../../components/common/Toast';
import { fetchWithAuth } from '../../api/fetchWithAuth';

const SECTIONS = [
  {
    key: 'service',
    title: '서비스 설정',
    desc: '서비스 전반의 기본 동작 방식을 제어합니다.',
    icon: 'settings',
    iconCls: 'bg-gray-100 text-gray-600',
    items: [
      { key: 'maintenance',  label: '서비스 유지보수 모드', desc: '유지보수 중 사용자 접근을 차단합니다. 활성화 시 모든 사용자가 503 페이지를 보게 됩니다.', defaultOn: false, warn: true },
      { key: 'allowSignup',  label: '신규 회원가입 허용',   desc: '새 회원 가입을 허용합니다. 비활성화 시 신규 가입이 차단됩니다.',                          defaultOn: true  },
      { key: 'emailNotify',  label: '이메일 알림 발송',     desc: '시스템 이메일 알림을 활성화합니다. 비활성화 시 모든 이메일 발송이 중단됩니다.',           defaultOn: true  },
    ],
  },
  {
    key: 'content',
    title: '콘텐츠 정책',
    desc: '게시글 및 업로드 콘텐츠의 자동 검열 정책입니다.',
    icon: 'policy',
    iconCls: 'bg-blue-50 text-blue-600',
    items: [
      { key: 'autoCensor',   label: '게시글 자동 검열',  desc: 'AI 기반 부적절 콘텐츠를 자동으로 필터링합니다.',          defaultOn: true  },
      { key: 'imageAnalysis',label: '이미지 자동 분석',  desc: '업로드된 이미지에 대한 안전 검사를 수행합니다.',           defaultOn: true  },
      { key: 'spamDetect',   label: '스팸 감지 시스템',  desc: '중복 및 스팸 게시글을 자동으로 감지하고 숨깁니다.',       defaultOn: false },
    ],
  },
  {
    key: 'notification',
    title: '알림 설정',
    desc: '관리자에게 전송되는 실시간 알림 항목입니다.',
    icon: 'notifications',
    iconCls: 'bg-amber-50 text-amber-600',
    items: [
      { key: 'notifyPlace',  label: '신규 장소 승인 알림', desc: '새 장소가 등록될 때 관리자에게 즉시 알림을 발송합니다.',  defaultOn: true },
      { key: 'notifyReport', label: '신고 접수 알림',      desc: '게시글 신고 발생 시 즉시 관리자 알림을 발송합니다.',      defaultOn: true },
      { key: 'notifySystem', label: '시스템 이상 알림',    desc: '서버 이상 징후 감지 시 긴급 알림을 발송합니다.',          defaultOn: true },
    ],
  },
];

// 기본값 (API 로딩 전 초기값)
function defaultSettings() {
  const result = {};
  SECTIONS.forEach((sec) => sec.items.forEach((item) => { result[item.key] = item.defaultOn; }));
  return result;
}

function Toggle({ on, onChange }) {
  return (
    <button
      onClick={onChange}
      className={`relative w-11 h-6 rounded-full transition-colors shrink-0 ${on ? 'bg-primary' : 'bg-gray-200'}`}
    >
      <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-transform ${on ? 'translate-x-5' : 'translate-x-0'}`} />
    </button>
  );
}

function ConfirmModal({ open, title, desc, confirmLabel, confirmCls, onConfirm, onCancel }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-2xl shadow-2xl w-80 overflow-hidden">
        <div className="px-6 py-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-9 h-9 rounded-full bg-red-100 flex items-center justify-center">
              <span className="material-icons text-red-500 text-[18px]">warning</span>
            </div>
            <p className="text-sm font-bold text-gray-900">{title}</p>
          </div>
          <p className="text-xs text-gray-500 leading-relaxed">{desc}</p>
        </div>
        <div className="flex border-t border-gray-100">
          <button onClick={onCancel} className="flex-1 py-3 text-sm text-gray-500 hover:bg-gray-50 transition-colors font-medium">
            취소
          </button>
          <button onClick={onConfirm} className={`flex-1 py-3 text-sm font-bold transition-colors ${confirmCls}`}>
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

function SystemSettings() {
  const [settings, setSettings] = useState(defaultSettings);
  const [savedSettings, setSavedSettings] = useState(defaultSettings);
  const [toast, setToast] = useState({ message: '', type: 'success' });
  const [modal, setModal] = useState(null);
  const [sysStatus, setSysStatus] = useState(null);

  const showToast = (message, type = 'success') => setToast({ message, type });

  // 설정 + 대시보드 현황 동시 로드
  useEffect(() => {
    fetchWithAuth('/api/admin/settings')
      .then((data) => {
        if (data.success && data.data) {
          // API 값(string "true"/"false") → boolean 변환
          const parsed = {};
          Object.entries(data.data).forEach(([k, v]) => { parsed[k] = v === 'true'; });
          setSettings(parsed);
          setSavedSettings(parsed);
        }
      })
      .catch(() => {});

    fetchWithAuth('/api/admin/dashboard')
      .then((data) => { if (data.success) setSysStatus(data.data); })
      .catch(() => {});
  }, []);

  const isDirty = useCallback((sectionKey) => {
    const section = SECTIONS.find((s) => s.key === sectionKey);
    return section.items.some((item) => settings[item.key] !== savedSettings[item.key]);
  }, [settings, savedSettings]);

  const handleToggle = (key) => {
    setSettings((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSave = (sectionKey) => {
    // boolean → string 변환 후 API 저장
    const payload = {};
    Object.entries(settings).forEach(([k, v]) => { payload[k] = String(v); });

    fetchWithAuth('/api/admin/settings', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
      .then((data) => {
        if (data.success) {
          setSavedSettings({ ...settings });
          showToast('설정이 저장되었습니다.', 'success');
        } else {
          showToast('저장에 실패했습니다.', 'error');
        }
      })
      .catch(() => showToast('저장 중 오류가 발생했습니다.', 'error'));
  };

  const handleCacheReset = () => {
    setModal({
      title: '캐시 초기화',
      desc: '서버 캐시를 전체 삭제합니다. 일시적으로 응답 속도가 저하될 수 있습니다. 계속하시겠습니까?',
      confirmLabel: '초기화',
      confirmCls: 'text-amber-600 hover:bg-amber-50',
      onConfirm: () => {
        sessionStorage.clear();
        setModal(null);
        showToast('캐시가 초기화되었습니다.', 'info');
      },
    });
  };

  const handleSettingsReset = () => {
    setModal({
      title: '설정 초기화',
      desc: '모든 시스템 설정을 기본값으로 되돌립니다. 이 작업은 되돌릴 수 없습니다.',
      confirmLabel: '초기화',
      confirmCls: 'text-red-600 hover:bg-red-50',
      onConfirm: () => {
        const defaults = defaultSettings();
        const payload = {};
        Object.entries(defaults).forEach(([k, v]) => { payload[k] = String(v); });

        fetchWithAuth('/api/admin/settings', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        })
          .then(() => {
            setSettings(defaults);
            setSavedSettings(defaults);
            showToast('설정이 초기화되었습니다.', 'info');
          })
          .catch(() => showToast('초기화 중 오류가 발생했습니다.', 'error'));

        setModal(null);
      },
    });
  };

  // 시스템 상태 카드 데이터 (대시보드 API 연동)
  const statusCards = [
    {
      label: '서버 상태',
      value: '정상',
      unit: '',
      color: 'text-emerald-600',
      dot: 'bg-emerald-500',
      bg: 'bg-emerald-50',
    },
    {
      label: '총 사용자',
      value: sysStatus?.totalUsers ?? '—',
      unit: '명',
      color: 'text-blue-600',
      dot: 'bg-blue-500',
      bg: 'bg-blue-50',
    },
    {
      label: '오늘 신규가입',
      value: sysStatus?.newUsersToday ?? '—',
      unit: '명',
      color: 'text-primary',
      dot: 'bg-primary',
      bg: 'bg-emerald-50',
    },
    {
      label: '대기 장소',
      value: sysStatus?.pendingPlaces ?? '—',
      unit: '건',
      color: 'text-amber-600',
      dot: 'bg-amber-400',
      bg: 'bg-amber-50',
    },
  ];

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      <AdminSidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <AdminHeader title="시스템 설정" subtitle="서비스 전반의 설정을 관리하세요." />
        <main className="flex-1 overflow-y-auto p-6 space-y-5">

          {/* 설정 섹션 카드 */}
          {SECTIONS.map((section) => (
            <div key={section.key} className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-3">
                <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${section.iconCls}`}>
                  <span className="material-icons text-[18px]">{section.icon}</span>
                </div>
                <div>
                  <h3 className="text-sm font-bold text-gray-900">{section.title}</h3>
                  <p className="text-xs text-gray-400 mt-0.5">{section.desc}</p>
                </div>
              </div>

              <div className="divide-y divide-gray-50">
                {section.items.map((item) => (
                  <div
                    key={item.key}
                    className="px-6 py-4 flex items-center justify-between gap-6 hover:bg-gray-50/60 transition-colors"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-semibold text-gray-800">{item.label}</p>
                        {item.warn && (
                          <span className="inline-flex items-center gap-0.5 text-[10px] font-bold text-amber-600 bg-amber-50 border border-amber-200 px-1.5 py-0.5 rounded">
                            <span className="material-icons text-[10px]">warning</span>
                            주의
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-gray-400 mt-0.5 leading-relaxed">{item.desc}</p>
                    </div>
                    <Toggle on={settings[item.key]} onChange={() => handleToggle(item.key)} />
                  </div>
                ))}
              </div>

              <div className="px-6 py-3 border-t border-gray-100 bg-gray-50/60 flex items-center justify-between">
                <p className="text-xs">
                  {isDirty(section.key)
                    ? <span className="flex items-center gap-1 text-amber-600"><span className="material-icons text-[13px]">edit</span>저장되지 않은 변경사항이 있습니다.</span>
                    : <span className="text-gray-400">변경사항 없음</span>
                  }
                </p>
                <button
                  type="button"
                  disabled={!isDirty(section.key)}
                  onClick={() => handleSave(section.key)}
                  className={`h-8 px-4 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 ${
                    isDirty(section.key)
                      ? 'bg-primary text-white hover:bg-primary/90'
                      : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  }`}
                >
                  <span className="material-icons text-[14px]">save</span>
                  변경사항 저장
                </button>
              </div>
            </div>
          ))}

          {/* 시스템 상태 카드 */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
            <div className="flex items-center gap-2 mb-4">
              <span className="material-icons text-primary text-[18px]">monitor_heart</span>
              <h3 className="text-sm font-bold text-gray-900">시스템 현황</h3>
            </div>
            <div className="grid grid-cols-4 gap-3">
              {statusCards.map((info, i) => (
                <div key={i} className={`rounded-xl p-4 text-center ${info.bg}`}>
                  <div className="flex items-center justify-center gap-1.5 mb-1.5">
                    <span className={`w-2 h-2 rounded-full inline-block ${info.dot}`} />
                    <p className="text-xs text-gray-500 font-medium">{info.label}</p>
                  </div>
                  <div className="flex items-end justify-center gap-0.5">
                    <span className={`text-2xl font-black leading-none ${info.color}`}>{info.value}</span>
                    {info.unit && <span className="text-xs text-gray-400 mb-0.5">{info.unit}</span>}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 위험 구역 */}
          <div className="bg-white rounded-xl border-2 border-red-200 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-red-100 bg-red-50 flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-red-100 flex items-center justify-center shrink-0">
                <span className="material-icons text-red-500 text-[18px]">dangerous</span>
              </div>
              <div>
                <h3 className="text-sm font-bold text-red-700">위험 구역</h3>
                <p className="text-xs text-red-500 mt-0.5">아래 작업은 되돌릴 수 없습니다. 신중하게 실행하세요.</p>
              </div>
            </div>

            <div className="divide-y divide-red-50">
              {[
                {
                  label: '캐시 초기화',
                  desc: '서버 캐시를 전체 삭제합니다. 일시적으로 응답 속도가 저하될 수 있습니다.',
                  btnLabel: '캐시 초기화',
                  btnCls: 'text-amber-600 border-amber-200 hover:bg-amber-50 hover:opacity-100 opacity-100',
                  onClick: handleCacheReset,
                  disabled: false,
                },
                {
                  label: '설정 초기화',
                  desc: '모든 시스템 설정을 기본값으로 되돌립니다. 이 작업은 되돌릴 수 없습니다.',
                  btnLabel: '설정 초기화',
                  btnCls: 'text-red-500 border-red-200 hover:bg-red-50 hover:opacity-100 opacity-100',
                  onClick: handleSettingsReset,
                  disabled: false,
                },
                {
                  label: '테스트 데이터 삭제',
                  desc: '테스트 계정 및 더미 데이터를 일괄 삭제합니다. 운영 환경에서는 절대 실행하지 마세요.',
                  btnLabel: '데이터 삭제',
                  btnCls: 'text-red-600 border-red-300 cursor-not-allowed opacity-50',
                  onClick: null,
                  disabled: true,
                  critical: true,
                },
              ].map((action, i) => (
                <div key={i} className="px-6 py-4 flex items-center justify-between gap-6">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-semibold text-gray-800">{action.label}</p>
                      {action.critical && (
                        <span className="text-[10px] font-bold text-red-600 bg-red-50 border border-red-200 px-1.5 py-0.5 rounded">위험</span>
                      )}
                    </div>
                    <p className="text-xs text-gray-400 mt-0.5">{action.desc}</p>
                  </div>
                  <button
                    type="button"
                    disabled={action.disabled}
                    onClick={action.disabled ? undefined : action.onClick}
                    className={`h-8 px-4 text-xs font-bold border rounded-lg shrink-0 transition-colors ${action.btnCls}`}
                  >
                    {action.btnLabel}
                  </button>
                </div>
              ))}
            </div>
          </div>

        </main>
      </div>

      {/* 확인 모달 */}
      {modal && (
        <ConfirmModal
          open={true}
          title={modal.title}
          desc={modal.desc}
          confirmLabel={modal.confirmLabel}
          confirmCls={modal.confirmCls}
          onConfirm={modal.onConfirm}
          onCancel={() => setModal(null)}
        />
      )}

      {/* 토스트 */}
      <Toast message={toast.message} type={toast.type} onClose={() => setToast({ message: '' })} />
    </div>
  );
}

export default SystemSettings;
