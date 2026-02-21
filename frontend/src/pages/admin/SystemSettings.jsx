import AdminSidebar from '../../components/admin/AdminSidebar';
import AdminHeader from '../../components/admin/AdminHeader';
import { useState } from 'react';

function Toggle({ defaultOn }) {
  const [on, setOn] = useState(defaultOn);
  return (
    <button onClick={() => setOn(!on)} className={`relative w-12 h-6 rounded-full transition-colors ${on ? 'bg-primary' : 'bg-gray-200'}`}>
      <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-all ${on ? 'left-7' : 'left-1'}`}></div>
    </button>
  );
}

function SystemSettings() {
  return (
    <div className="flex h-screen overflow-hidden bg-background-light">
      <AdminSidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <AdminHeader title="시스템 설정" subtitle="서비스 전반의 설정을 관리하세요." />
        <main className="flex-1 overflow-y-auto p-6 space-y-6">

          {[
            {
              title: '서비스 설정',
              icon: 'settings',
              items: [
                { label: '서비스 유지보수 모드', desc: '유지보수 중 사용자 접근 차단', defaultOn: false },
                { label: '신규 회원가입 허용', desc: '새 회원 가입 활성화 여부', defaultOn: true },
                { label: '이메일 알림 발송', desc: '시스템 이메일 알림 활성화', defaultOn: true },
              ],
            },
            {
              title: '콘텐츠 정책',
              icon: 'policy',
              items: [
                { label: '게시글 자동 검열', desc: 'AI 기반 부적절 콘텐츠 자동 필터링', defaultOn: true },
                { label: '이미지 자동 분석', desc: '업로드 이미지 안전 검사', defaultOn: true },
                { label: '스팸 감지 시스템', desc: '중복/스팸 게시글 자동 감지', defaultOn: false },
              ],
            },
            {
              title: '알림 설정',
              icon: 'notifications',
              items: [
                { label: '신규 장소 승인 알림', desc: '새 장소 등록 시 관리자 알림', defaultOn: true },
                { label: '신고 접수 알림', desc: '게시글 신고 시 즉시 알림', defaultOn: true },
                { label: '시스템 이상 알림', desc: '서버 이상 징후 감지 알림', defaultOn: true },
              ],
            },
          ].map((section, si) => (
            <div key={si} className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="p-6 border-b border-gray-100 flex items-center gap-3">
                <div className="w-9 h-9 bg-primary/10 rounded-lg flex items-center justify-center">
                  <span className="material-icons-round text-primary">{section.icon}</span>
                </div>
                <h3 className="font-bold text-gray-800">{section.title}</h3>
              </div>
              <div className="divide-y divide-gray-50">
                {section.items.map((item, ii) => (
                  <div key={ii} className="px-6 py-4 flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-gray-800 text-sm">{item.label}</p>
                      <p className="text-xs text-gray-400 mt-0.5">{item.desc}</p>
                    </div>
                    <Toggle defaultOn={item.defaultOn} />
                  </div>
                ))}
              </div>
            </div>
          ))}

          {/* System Info */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
            <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
              <span className="material-icons-round text-primary">info</span>
              시스템 정보
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: '서버 상태', value: '정상', color: 'text-green-500' },
                { label: 'DB 사용량', value: '68%', color: 'text-amber-500' },
                { label: 'API 응답속도', value: '124ms', color: 'text-blue-500' },
                { label: '가동 시간', value: '99.9%', color: 'text-primary' },
              ].map((info, i) => (
                <div key={i} className="bg-gray-50 rounded-xl p-4 text-center">
                  <p className={`text-xl font-black ${info.color}`}>{info.value}</p>
                  <p className="text-xs text-gray-400 mt-1">{info.label}</p>
                </div>
              ))}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

export default SystemSettings;
