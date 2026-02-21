import AdminSidebar from '../../components/admin/AdminSidebar';
import AdminHeader from '../../components/admin/AdminHeader';

const users = [
  { id: '#10234', name: '이지은', email: 'jieun@email.com', type: '조용한 산책자', status: '활성', joined: '2023.09.12', img: null },
  { id: '#10235', name: '박준호', email: 'junho@email.com', type: '능동적 탐험가', status: '활성', joined: '2023.10.03', img: null },
  { id: '#10236', name: '최수정', email: 'sujeong@email.com', type: '감각적 몽상가', status: '휴면', joined: '2023.07.21', img: null },
  { id: '#10237', name: '김민재', email: 'minjae@email.com', type: '분석적 사색가', status: '활성', joined: '2023.11.01', img: null },
  { id: '#10238', name: '정다은', email: 'daeun@email.com', type: '창의적 유희인', status: '제한', joined: '2023.08.15', img: null },
];

function UserManagement() {
  return (
    <div className="flex h-screen overflow-hidden bg-background-light">
      <AdminSidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <AdminHeader title="사용자 관리" subtitle="전체 회원 현황 및 관리">
          <button className="flex items-center gap-2 px-4 py-2 bg-primary text-white text-sm font-bold rounded-lg hover:bg-primary/90 transition-all">
            <span className="material-icons-round text-lg">person_add</span>
            사용자 초대
          </button>
        </AdminHeader>
        <main className="flex-1 overflow-y-auto p-6">
          {/* Summary */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            {[
              { label: '전체 회원', value: '24,832', icon: 'people', color: 'text-primary' },
              { label: '신규 (이번 달)', value: '1,284', icon: 'person_add', color: 'text-blue-500' },
              { label: '활성 사용자', value: '18,943', icon: 'verified', color: 'text-green-500' },
              { label: '제한/휴면', value: '342', icon: 'block', color: 'text-red-400' },
            ].map((s, i) => (
              <div key={i} className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm">
                <span className={`material-icons-round ${s.color} text-2xl`}>{s.icon}</span>
                <p className="text-2xl font-bold text-gray-900 mt-1">{s.value}</p>
                <p className="text-xs text-gray-500">{s.label}</p>
              </div>
            ))}
          </div>

          {/* Search & Filter */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-gray-100 flex flex-col md:flex-row items-start md:items-center gap-3">
              <div className="relative flex-1">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xl">search</span>
                <input
                  className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                  placeholder="이름, 이메일, 사용자 ID로 검색"
                  type="text"
                />
              </div>
              <div className="flex gap-2">
                <select className="px-3 py-2.5 border border-gray-200 bg-gray-50 rounded-lg text-sm text-gray-600 focus:ring-primary outline-none">
                  <option>전체 상태</option>
                  <option>활성</option>
                  <option>휴면</option>
                  <option>제한</option>
                </select>
                <select className="px-3 py-2.5 border border-gray-200 bg-gray-50 rounded-lg text-sm text-gray-600 focus:ring-primary outline-none">
                  <option>최근 가입순</option>
                  <option>이름순</option>
                  <option>활동순</option>
                </select>
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-gray-50 text-gray-500 text-xs font-semibold uppercase">
                  <tr>
                    <th className="px-6 py-3">사용자</th>
                    <th className="px-6 py-3">휴식 유형</th>
                    <th className="px-6 py-3">상태</th>
                    <th className="px-6 py-3">가입일</th>
                    <th className="px-6 py-3 text-right">관리</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-sm">
                  {users.map((user, i) => (
                    <tr key={i} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-primary/20 flex items-center justify-center text-primary shrink-0">
                            <span className="material-icons-round text-lg">person</span>
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900">{user.name}</p>
                            <p className="text-xs text-gray-400">{user.email} · {user.id}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="px-2 py-1 bg-accent-mint text-teal-600 text-[11px] font-bold rounded-full">{user.type}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded-full text-[11px] font-bold ${
                          user.status === '활성' ? 'bg-green-50 text-green-600' :
                          user.status === '휴면' ? 'bg-gray-100 text-gray-500' :
                          'bg-red-50 text-red-500'
                        }`}>{user.status}</span>
                      </td>
                      <td className="px-6 py-4 text-gray-500">{user.joined}</td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-primary transition-colors">
                            <span className="material-icons-round text-base">visibility</span>
                          </button>
                          <button className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-blue-500 transition-colors">
                            <span className="material-icons-round text-base">edit</span>
                          </button>
                          <button className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors">
                            <span className="material-icons-round text-base">block</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="p-4 border-t border-gray-100 flex items-center justify-between">
              <p className="text-sm text-gray-500">전체 24,832명 중 1-5 표시</p>
              <div className="flex gap-1">
                {[1, 2, 3, '...', 10].map((p, i) => (
                  <button key={i} className={`w-8 h-8 rounded-lg text-sm font-medium transition-all ${p === 1 ? 'bg-primary text-white' : 'hover:bg-gray-100 text-gray-500'}`}>
                    {p}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

export default UserManagement;
