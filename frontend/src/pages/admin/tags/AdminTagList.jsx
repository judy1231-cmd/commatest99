import AdminSidebar from '../../../components/admin/AdminSidebar';
import AdminHeader from '../../../components/admin/AdminHeader';

const REST_TYPES = [
  { key: 'physical',  label: '신체적 이완',  icon: 'fitness_center', color: '#EF4444' },
  { key: 'mental',    label: '정신적 고요',  icon: 'spa',            color: '#10B981' },
  { key: 'sensory',   label: '감각의 정화',  icon: 'visibility_off', color: '#F59E0B' },
  { key: 'emotional', label: '정서적 지지',  icon: 'favorite',       color: '#EC4899' },
  { key: 'social',    label: '사회적 휴식',  icon: 'groups',         color: '#8B5CF6' },
  { key: 'nature',    label: '자연의 연결', icon: 'forest',         color: '#059669' },
  { key: 'creative',  label: '창조적 몰입',  icon: 'brush',          color: '#F97316' },
];

function AdminTagList() {
  return (
    <div className="flex h-screen overflow-hidden bg-background-light">
      <AdminSidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <AdminHeader title="태그 관리" subtitle="장소 태그 및 휴식 유형 분류입니다." />
        <main className="flex-1 overflow-y-auto p-6 space-y-6">
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-2">
            <span className="material-icons text-amber-500 text-base mt-0.5">info</span>
            <p className="text-sm text-amber-700">태그는 장소 Seed 실행 시 자동 생성됩니다. 관리자 → 장소 Seed (<code className="bg-amber-100 px-1 rounded">POST /api/admin/places/seed</code>)를 먼저 실행하세요.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {REST_TYPES.map(type => (
              <div key={type.key} className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-3" style={{ backgroundColor: `${type.color}15` }}>
                  <span className="material-icons text-2xl" style={{ color: type.color }}>{type.icon}</span>
                </div>
                <p className="font-bold text-gray-800">{type.label}</p>
                <p className="text-xs text-gray-400 mt-1 font-mono">{type.key}</p>
              </div>
            ))}
          </div>
        </main>
      </div>
    </div>
  );
}

export default AdminTagList;
