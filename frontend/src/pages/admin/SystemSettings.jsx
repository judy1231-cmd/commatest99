import AdminSidebar from '../../components/admin/AdminSidebar';
import AdminHeader from '../../components/admin/AdminHeader';
import { useState } from 'react';

function Toggle({ defaultOn }) {
  const [on, setOn] = useState(defaultOn);
  return (
    <button
      onClick={() => setOn(!on)}
      className={`relative w-11 h-6 rounded-full transition-colors shrink-0 ${on ? 'bg-primary' : 'bg-gray-200'}`}
    >
      <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-transform ${on ? 'translate-x-5' : 'translate-x-0'}`} />
    </button>
  );
}

const SECTIONS = [
  {
    title: '서비스 설정',
    desc: '서비스 전반의 기본 동작 방식을 제어합니다.',
    icon: 'settings',
    iconCls: 'bg-gray-100 text-gray-600',
    items: [
      { label: '서비스 유지보수 모드', desc: '유지보수 중 사용자 접근을 차단합니다. 활성화 시 모든 사용자가 503 페이지를 보게 됩니다.', defaultOn: false, warn: true },
      { label: '신규 회원가입 허용',   desc: '새 회원 가입을 허용합니다. 비활성화 시 신규 가입이 차단됩니다.',                          defaultOn: true  },
      { label: '이메일 알림 발송',     desc: '시스템 이메일 알림을 활성화합니다. 비활성화 시 모든 이메일 발송이 중단됩니다.',           defaultOn: true  },
    ],
  },
  {
    title: '콘텐츠 정책',
    desc: '게시글 및 업로드 콘텐츠의 자동 검열 정책입니다.',
    icon: 'policy',
    iconCls: 'bg-blue-50 text-blue-600',
    items: [
      { label: '게시글 자동 검열',  desc: 'AI 기반 부적절 콘텐츠를 자동으로 필터링합니다.',          defaultOn: true  },
      { label: '이미지 자동 분석',  desc: '업로드된 이미지에 대한 안전 검사를 수행합니다.',           defaultOn: true  },
      { label: '스팸 감지 시스템',  desc: '중복 및 스팸 게시글을 자동으로 감지하고 숨깁니다.',       defaultOn: false },
    ],
  },
  {
    title: '알림 설정',
    desc: '관리자에게 전송되는 실시간 알림 항목입니다.',
    icon: 'notifications',
    iconCls: 'bg-amber-50 text-amber-600',
    items: [
      { label: '신규 장소 승인 알림', desc: '새 장소가 등록될 때 관리자에게 즉시 알림을 발송합니다.',  defaultOn: true },
      { label: '신고 접수 알림',      desc: '게시글 신고 발생 시 즉시 관리자 알림을 발송합니다.',      defaultOn: true },
      { label: '시스템 이상 알림',    desc: '서버 이상 징후 감지 시 긴급 알림을 발송합니다.',          defaultOn: true },
    ],
  },
];

function SystemSettings() {
  /* ── UI 전용 상태 — 섹션별 변경 감지 ── */
  const [dirtyMap, setDirtyMap] = useState({});
  const markDirty  = (si) => setDirtyMap(prev => ({ ...prev, [si]: true  }));
  const clearDirty = (si) => setDirtyMap(prev => ({ ...prev, [si]: false }));

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      <AdminSidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <AdminHeader title="시스템 설정" subtitle="서비스 전반의 설정을 관리하세요." />
        <main className="flex-1 overflow-y-auto p-6 space-y-5">

          {/* ── 설정 섹션 카드 ── */}
          {SECTIONS.map((section, si) => (
            <div key={si} className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">

              {/* 섹션 헤더 */}
              <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-3">
                <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${section.iconCls}`}>
                  <span className="material-icons text-[18px]">{section.icon}</span>
                </div>
                <div>
                  <h3 className="text-sm font-bold text-gray-900">{section.title}</h3>
                  <p className="text-xs text-gray-400 mt-0.5">{section.desc}</p>
                </div>
              </div>

              {/* 설정 행 */}
              <div className="divide-y divide-gray-50">
                {section.items.map((item, ii) => (
                  <div
                    key={ii}
                    className="px-6 py-4 flex items-center justify-between gap-6 hover:bg-gray-50/60 transition-colors"
                    onClick={() => markDirty(si)}
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
                    <Toggle defaultOn={item.defaultOn} />
                  </div>
                ))}
              </div>

              {/* 섹션 푸터 — 저장 버튼 */}
              <div className="px-6 py-3 border-t border-gray-100 bg-gray-50/60 flex items-center justify-between">
                <p className="text-xs text-gray-400">
                  {dirtyMap[si]
                    ? <span className="flex items-center gap-1 text-amber-600"><span className="material-icons text-[13px]">edit</span>저장되지 않은 변경사항이 있습니다.</span>
                    : '변경사항 없음'
                  }
                </p>
                <button
                  type="button"
                  disabled={!dirtyMap[si]}
                  onClick={() => clearDirty(si)}
                  className={`h-8 px-4 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 ${
                    dirtyMap[si]
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

          {/* ── 시스템 정보 카드 ── */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
            <div className="flex items-center gap-2 mb-4">
              <span className="material-icons text-primary text-[18px]">monitor_heart</span>
              <h3 className="text-sm font-bold text-gray-900">시스템 상태</h3>
            </div>
            <div className="grid grid-cols-4 gap-3">
              {[
                { label: '서버 상태',    value: '정상',   unit: '',     color: 'text-emerald-600', dot: 'bg-emerald-500', bg: 'bg-emerald-50'  },
                { label: 'DB 사용량',   value: '68',     unit: '%',    color: 'text-amber-600',   dot: 'bg-amber-400',   bg: 'bg-amber-50'    },
                { label: 'API 응답속도', value: '124',    unit: 'ms',   color: 'text-blue-600',    dot: 'bg-blue-500',    bg: 'bg-blue-50'     },
                { label: '가동 시간',    value: '99.9',   unit: '%',    color: 'text-primary',     dot: 'bg-primary',     bg: 'bg-emerald-50'  },
              ].map((info, i) => (
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

          {/* ── 위험 구역 카드 ── */}
          <div className="bg-white rounded-xl border-2 border-red-200 shadow-sm overflow-hidden">

            {/* 헤더 */}
            <div className="px-6 py-4 border-b border-red-100 bg-red-50 flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-red-100 flex items-center justify-center shrink-0">
                <span className="material-icons text-red-500 text-[18px]">dangerous</span>
              </div>
              <div>
                <h3 className="text-sm font-bold text-red-700">위험 구역</h3>
                <p className="text-xs text-red-500 mt-0.5">아래 작업은 되돌릴 수 없습니다. 신중하게 실행하세요.</p>
              </div>
            </div>

            {/* 위험 작업 행 */}
            <div className="divide-y divide-red-50">
              {[
                {
                  label: '캐시 초기화',
                  desc: '서버 캐시를 전체 삭제합니다. 일시적으로 응답 속도가 저하될 수 있습니다.',
                  btnLabel: '캐시 초기화',
                  btnCls: 'text-amber-600 border-amber-200 hover:bg-amber-50',
                },
                {
                  label: '공지 초기화',
                  desc: '시스템 공지사항을 모두 삭제합니다. 이 작업은 되돌릴 수 없습니다.',
                  btnLabel: '공지 초기화',
                  btnCls: 'text-red-500 border-red-200 hover:bg-red-50',
                },
                {
                  label: '테스트 데이터 삭제',
                  desc: '테스트 계정 및 더미 데이터를 일괄 삭제합니다. 운영 환경에서는 절대 실행하지 마세요.',
                  btnLabel: '데이터 삭제',
                  btnCls: 'text-red-600 border-red-300 hover:bg-red-50',
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
                    disabled
                    title="API 연동 후 활성화됩니다"
                    className={`h-8 px-4 text-xs font-bold border rounded-lg cursor-not-allowed opacity-60 shrink-0 ${action.btnCls}`}
                  >
                    {action.btnLabel}
                  </button>
                </div>
              ))}
            </div>

            <div className="px-6 py-3 border-t border-red-100 bg-red-50/60">
              <p className="text-xs text-red-400">* 위험 구역 작업은 API 연동 및 2차 인증 추가 후 활성화됩니다.</p>
            </div>
          </div>

        </main>
      </div>
    </div>
  );
}

export default SystemSettings;
