import AdminSidebar from '../../../components/admin/AdminSidebar';
import AdminHeader from '../../../components/admin/AdminHeader';

const REST_TYPES = [
  { key: 'physical',  label: '신체적 이완',   icon: 'fitness_center', color: '#EF4444', desc: '스트레칭, 산책, 가벼운 운동 등 신체 활동을 통한 이완' },
  { key: 'mental',    label: '정신적 고요',   icon: 'spa',            color: '#10B981', desc: '명상, 호흡, 마음챙김 등 정신적 안정을 위한 활동' },
  { key: 'sensory',   label: '감각의 정화',   icon: 'visibility_off', color: '#F59E0B', desc: '디지털 디톡스, 조용한 환경 등 감각 자극 최소화' },
  { key: 'emotional', label: '정서적 지지',   icon: 'favorite',       color: '#EC4899', desc: '일기 쓰기, 감사 나누기 등 감정 표현과 돌봄' },
  { key: 'social',    label: '사회적 휴식',   icon: 'groups',         color: '#8B5CF6', desc: '친구/가족과 가벼운 대화, 혼자만의 시간' },
  { key: 'nature',    label: '자연과의 연결', icon: 'forest',         color: '#059669', desc: '공원, 산책로, 자연 공간에서 보내는 시간' },
  { key: 'creative',  label: '창조적 몰입',  icon: 'brush',          color: '#F97316', desc: '그림, 음악, 글쓰기 등 창작 활동에 집중' },
];

function AdminContentsCategory() {
  return (
    <div className="flex h-screen overflow-hidden bg-background-light">
      <AdminSidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <AdminHeader title="카테고리 관리" subtitle="휴식 유형 분류 체계입니다." />
        <main className="flex-1 overflow-y-auto p-6 space-y-6">
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-start gap-2">
            <span className="material-icons text-blue-500 text-base mt-0.5">info</span>
            <p className="text-sm text-blue-700">
              휴식 유형은 7가지로 고정되어 있으며, <code className="bg-blue-100 px-1 rounded">rest_types</code> 테이블에 Seed 데이터로 관리됩니다.
              카테고리 추가·삭제는 DB 직접 수정이 필요합니다.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {REST_TYPES.map((type, i) => (
              <div key={type.key} className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${type.color}18` }}>
                    <span className="material-icons text-xl" style={{ color: type.color }}>{type.icon}</span>
                  </div>
                  <span className="text-xs text-gray-400 font-mono">#{i + 1}</span>
                </div>
                <p className="font-bold text-gray-800 mb-1">{type.label}</p>
                <p className="text-xs text-gray-400 font-mono mb-2">{type.key}</p>
                <p className="text-xs text-gray-500 leading-relaxed">{type.desc}</p>
              </div>
            ))}
          </div>

          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
            <h3 className="font-bold text-gray-800 mb-3">유형별 점수 구조</h3>
            <div className="font-mono text-xs text-gray-500 bg-gray-50 rounded-xl p-4 space-y-1">
              <p>설문 응답 → 유형별 점수 합산 → 유형별 평균 → 상위 3개 유형 선정</p>
              <p className="mt-2 text-gray-400">예: physical 2문항 → (80+60)/2 = 70점 → 1위면 추천 생성</p>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

export default AdminContentsCategory;
