import AdminSidebar from '../../../components/admin/AdminSidebar';
import AdminHeader from '../../../components/admin/AdminHeader';

const STATUS_STYLES = {
  active:  { label: '활성',  style: 'bg-green-50 text-green-600 border border-green-200' },
  dormant: { label: '휴면',  style: 'bg-gray-100 text-gray-500 border border-gray-200' },
  banned:  { label: '제한',  style: 'bg-red-50 text-red-500 border border-red-200' },
};

function AdminUserList() {
  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      <AdminSidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <AdminHeader title="사용자 목록" subtitle="전체 회원 현황 및 관리" />
        <main className="flex-1 overflow-y-auto p-6">

          {/* 요약 카드 */}
          <div className="grid grid-cols-4 gap-4 mb-6">
            {[
              { label: '전체 회원',    value: '—', icon: 'people',   color: 'bg-primary/10 text-primary' },
              { label: '활성 사용자', value: '—', icon: 'verified', color: 'bg-green-50 text-green-600' },
              { label: '휴면',         value: '—', icon: 'hotel',    color: 'bg-gray-100 text-gray-500' },
              { label: '제한',         value: '—', icon: 'block',    color: 'bg-red-50 text-red-500' },
            ].map((s, i) => (
              <div key={i} className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm flex items-center gap-4">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${s.color}`}>
                  <span className="material-icons-round text-[20px]">{s.icon}</span>
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">{s.value}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{s.label}</p>
                </div>
              </div>
            ))}
          </div>

          {/* 검색 + 테이블 */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">

            {/* 검색 바 */}
            <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-3">
              <div className="relative flex-1">
                <span className="material-icons absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xl">search</span>
                <input
                  className="w-full pl-10 pr-4 h-10 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-700 placeholder:text-gray-400 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                  placeholder="이름, 이메일, 쉼표번호로 검색"
                  disabled
                />
              </div>
              <button
                disabled
                className="h-10 px-4 bg-primary text-white text-sm font-bold rounded-lg opacity-50 cursor-not-allowed"
              >
                검색
              </button>
              <select
                disabled
                className="h-10 px-3 border border-gray-200 bg-gray-50 rounded-lg text-sm text-gray-500 outline-none cursor-not-allowed"
              >
                <option>전체 상태</option>
              </select>
            </div>

            {/* 준비 중 안내 */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200">
                    <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">사용자</th>
                    <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">쉼표번호</th>
                    <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">상태</th>
                    <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">가입일</th>
                    <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">관리</th>
                  </tr>
                </thead>
                <tbody>
                  {/* 샘플 행 — 디자인 미리보기용 */}
                  {[
                    { nickname: '홍길동', email: 'test@comma.com',  id: '쉼표0001', status: 'active',  date: '2025-01-15' },
                    { nickname: '김쉼표', email: 'test2@comma.com', id: '쉼표0002', status: 'dormant', date: '2025-02-03' },
                    { nickname: '이민준', email: 'test3@comma.com', id: '쉼표0003', status: 'banned',  date: '2025-03-10' },
                  ].map((user, idx) => {
                    const s = STATUS_STYLES[user.status];
                    return (
                      <tr
                        key={user.id}
                        className={`border-b border-gray-100 hover:bg-primary/5 transition-colors ${idx % 2 === 1 ? 'bg-gray-50/60' : 'bg-white'}`}
                      >
                        <td className="px-6 py-3.5">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                              <span className="material-icons-round text-primary text-lg">person</span>
                            </div>
                            <div>
                              <p className="font-semibold text-gray-900">{user.nickname}</p>
                              <p className="text-xs text-gray-400">{user.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-3.5 font-mono text-xs text-gray-500">{user.id}</td>
                        <td className="px-6 py-3.5">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold ${s.style}`}>
                            {s.label}
                          </span>
                        </td>
                        <td className="px-6 py-3.5 text-gray-500 text-xs">{user.date}</td>
                        <td className="px-6 py-3.5 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {user.status !== 'active' && (
                              <button disabled className="px-2.5 py-1 text-[11px] font-bold text-green-600 border border-green-200 rounded-lg bg-green-50 opacity-50 cursor-not-allowed">활성화</button>
                            )}
                            {user.status !== 'banned' && (
                              <button disabled className="px-2.5 py-1 text-[11px] font-bold text-red-500 border border-red-200 rounded-lg hover:bg-red-50 opacity-50 cursor-not-allowed">제한</button>
                            )}
                            {user.status !== 'dormant' && (
                              <button disabled className="px-2.5 py-1 text-[11px] font-bold text-gray-500 border border-gray-200 rounded-lg hover:bg-gray-50 opacity-50 cursor-not-allowed">휴면</button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                  {/* 준비 중 오버레이 행 */}
                  <tr>
                    <td colSpan={5} className="px-6 py-10 text-center">
                      <div className="inline-flex flex-col items-center gap-2 text-gray-400">
                        <span className="material-icons text-4xl text-gray-300">construction</span>
                        <p className="text-sm font-medium text-gray-500">API 연결 준비 중입니다</p>
                        <p className="text-xs text-gray-400">위 행은 디자인 미리보기용 샘플입니다</p>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* 페이지네이션 */}
            <div className="px-5 py-3.5 border-t border-gray-100 flex items-center justify-between">
              <p className="text-xs text-gray-400">전체 — 명</p>
              <div className="flex items-center gap-1">
                <button disabled className="w-8 h-8 rounded-lg text-sm font-medium text-gray-400 hover:bg-gray-100 disabled:opacity-30">‹</button>
                <button className="w-8 h-8 rounded-lg text-sm font-medium bg-primary text-white">1</button>
                <button disabled className="w-8 h-8 rounded-lg text-sm font-medium text-gray-400 hover:bg-gray-100 disabled:opacity-30">›</button>
              </div>
            </div>
          </div>

        </main>
      </div>
    </div>
  );
}

export default AdminUserList;
