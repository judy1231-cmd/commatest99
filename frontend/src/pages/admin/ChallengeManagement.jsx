import AdminSidebar from '../../components/admin/AdminSidebar';
import AdminHeader from '../../components/admin/AdminHeader';

const challenges = [
  { title: '7일 자연 산책', type: '신체적 휴식', participants: 1284, status: '진행중', startDate: '2023.11.01', endDate: '2023.11.30' },
  { title: '디지털 디톡스 3일', type: '정신적 휴식', participants: 892, status: '진행중', startDate: '2023.11.10', endDate: '2023.11.30' },
  { title: '명상 21일 챌린지', type: '정신적 휴식', participants: 2150, status: '진행중', startDate: '2023.10.01', endDate: '2023.10.31' },
  { title: '감사 일기 30일', type: '감정적 휴식', participants: 3421, status: '종료', startDate: '2023.09.01', endDate: '2023.09.30' },
];

function ChallengeManagement() {
  return (
    <div className="flex h-screen overflow-hidden bg-background-light">
      <AdminSidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <AdminHeader title="챌린지 관리" subtitle="진행 중인 챌린지를 관리하세요.">
          <button className="flex items-center gap-2 px-4 py-2 bg-primary text-white text-sm font-bold rounded-lg hover:bg-primary/90 transition-all">
            <span className="material-icons-round text-lg">add</span>
            챌린지 생성
          </button>
        </AdminHeader>
        <main className="flex-1 overflow-y-auto p-6">
          <div className="grid grid-cols-3 gap-4 mb-6">
            {[
              { label: '진행 중인 챌린지', value: '8개', color: 'text-primary' },
              { label: '총 참여자', value: '7,747명', color: 'text-blue-500' },
              { label: '완료 챌린지', value: '24개', color: 'text-slate-500' },
            ].map((s, i) => (
              <div key={i} className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm">
                <p className={`text-2xl font-black ${s.color}`}>{s.value}</p>
                <p className="text-sm text-gray-500">{s.label}</p>
              </div>
            ))}
          </div>

          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-gray-100">
              <h3 className="font-bold text-gray-800">챌린지 목록</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-gray-50 text-gray-500 text-xs font-semibold uppercase">
                  <tr>
                    <th className="px-6 py-3">챌린지명</th>
                    <th className="px-6 py-3">유형</th>
                    <th className="px-6 py-3">참여자</th>
                    <th className="px-6 py-3">기간</th>
                    <th className="px-6 py-3">상태</th>
                    <th className="px-6 py-3 text-right">관리</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-sm">
                  {challenges.map((c, i) => (
                    <tr key={i} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 font-semibold text-gray-900">{c.title}</td>
                      <td className="px-6 py-4">
                        <span className="px-2 py-1 bg-primary/10 text-primary text-[11px] font-bold rounded-full">{c.type}</span>
                      </td>
                      <td className="px-6 py-4 text-gray-600">{c.participants.toLocaleString()}명</td>
                      <td className="px-6 py-4 text-gray-400 text-xs">{c.startDate} ~ {c.endDate}</td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded-full text-[11px] font-bold ${c.status === '진행중' ? 'bg-green-50 text-green-600' : 'bg-gray-100 text-gray-400'}`}>{c.status}</span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-primary transition-colors">
                            <span className="material-icons-round text-base">edit</span>
                          </button>
                          <button className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-blue-500 transition-colors">
                            <span className="material-icons-round text-base">bar_chart</span>
                          </button>
                          <button className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors">
                            <span className="material-icons-round text-base">pause_circle</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

export default ChallengeManagement;
