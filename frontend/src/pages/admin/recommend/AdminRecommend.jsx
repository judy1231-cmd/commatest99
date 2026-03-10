import AdminSidebar from '../../../components/admin/AdminSidebar';
import AdminHeader from '../../../components/admin/AdminHeader';

const INFO_CARDS = [
  { icon: 'psychology', title: '자동 생성', desc: '사용자가 설문 진단을 완료하면 즉시 자동 생성됩니다.' },
  { icon: 'bar_chart', title: '추천 기준', desc: '휴식유형 점수 상위 3개 유형에 매칭되는 장소를 추천합니다.' },
  { icon: 'place', title: '추천 수', desc: '상위 3개 유형 × 최대 3개 장소 = 최대 9개 추천이 생성됩니다.' },
  { icon: 'touch_app', title: '클릭/저장 추적', desc: '추천 카드 클릭 및 저장 여부가 recommendations 테이블에 기록됩니다.' },
];

function AdminRecommend() {
  return (
    <div className="flex h-screen overflow-hidden bg-background-light">
      <AdminSidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <AdminHeader title="추천 관리" subtitle="사용자 맞춤 추천 현황입니다." />
        <main className="flex-1 overflow-y-auto p-6 space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {INFO_CARDS.map((card, i) => (
              <div key={i} className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
                <div className="w-10 h-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center mb-3">
                  <span className="material-icons">{card.icon}</span>
                </div>
                <p className="font-bold text-gray-800 mb-1">{card.title}</p>
                <p className="text-sm text-gray-500">{card.desc}</p>
              </div>
            ))}
          </div>

          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
            <div className="flex items-center gap-2 mb-3">
              <span className="material-icons text-amber-500">info</span>
              <h3 className="font-bold text-gray-800">추천 데이터 현황</h3>
            </div>
            <p className="text-sm text-gray-400">
              추천 데이터는 진단 완료 시 자동으로 recommendations 테이블에 저장됩니다.<br />
              개별 추천 현황 조회 API는 추후 지원 예정입니다.
            </p>
            <div className="mt-4 p-3 bg-gray-50 rounded-xl font-mono text-xs text-gray-500">
              GET /api/recommendations  — 개인 추천 목록 (로그인 필요)
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

export default AdminRecommend;
