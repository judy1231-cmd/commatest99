import AdminSidebar from '../../components/admin/AdminSidebar';
import AdminHeader from '../../components/admin/AdminHeader';
import { Link } from 'react-router-dom';

const stats = [
  { label: '진단 테스트', value: '1,284', change: '+12%', icon: 'psychology', color: 'bg-primary/10 text-primary', changeColor: 'text-green-600 bg-green-50' },
  { label: '신규 회원', value: '342', change: '+5.2%', icon: 'person_add', color: 'bg-accent-blue text-blue-600', changeColor: 'text-green-600 bg-green-50' },
  { label: '일기 기록', value: '8,421', change: '-2.1%', icon: 'menu_book', color: 'bg-accent-mint text-teal-600', changeColor: 'text-red-600 bg-red-50' },
  { label: '대기 중인 장소', value: '45', change: '대기 12', icon: 'map', color: 'bg-amber-100 text-amber-600', changeColor: 'text-amber-600 bg-amber-50' },
  { label: '신고된 게시글', value: '18', change: '긴급 3', icon: 'report_problem', color: 'bg-red-100 text-red-600', changeColor: 'text-red-600 bg-red-50', urgent: true },
];

const months = ['1월', '2월', '3월', '4월', '5월', '6월'];
const chartHeights = [40, 55, 45, 70, 85, 100];

const pendingPlaces = [
  { name: '조용한 숲속 북카페', category: '카페/독서', catColor: 'bg-accent-blue text-blue-600', user: 'admin_seoul', date: '2023.10.24' },
  { name: '명상 스테이 \'고요\'', category: '숙박/명상', catColor: 'bg-accent-mint text-teal-600', user: 'peace_maker', date: '2023.10.23' },
  { name: '도심 속 작은 정원', category: '공원', catColor: 'bg-gray-100 text-gray-500', user: 'city_nature', date: '2023.10.22' },
];

const alerts = [
  { level: 'red', icon: 'warning', title: '부적절한 게시글 신고 누적', desc: '커뮤니티 ID #48293 게시글에 대해 10건 이상의 신고가 접수되었습니다.', time: '5분 전' },
  { level: 'amber', icon: 'dns', title: '서버 부하 감지', desc: '진단 테스트 트래픽 급증으로 인한 서버 CPU 점유율 85% 돌파.', time: '12분 전' },
  { level: 'blue', icon: 'security', title: '비정상 로그인 시도', desc: "관리자 계정 'admin_beta'에 대한 비정상적인 접근이 감지되었습니다.", time: '1시간 전' },
];

const alertColors = {
  red: { bg: 'bg-red-50', border: 'border-red-100', icon: 'text-red-500', title: 'text-red-900', desc: 'text-red-700', time: 'text-red-500' },
  amber: { bg: 'bg-amber-50', border: 'border-amber-100', icon: 'text-amber-600', title: 'text-amber-900', desc: 'text-amber-700', time: 'text-amber-600' },
  blue: { bg: 'bg-blue-50', border: 'border-blue-100', icon: 'text-blue-600', title: 'text-blue-900', desc: 'text-blue-700', time: 'text-blue-600' },
};

function AdminDashboard() {
  return (
    <div className="flex h-screen overflow-hidden bg-background-light">
      <AdminSidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <AdminHeader title="실시간 대시보드" subtitle="플랫폼의 현재 상태와 실시간 통계를 확인하세요." />
        <main className="flex-1 overflow-y-auto p-6 space-y-8">

          {/* Period Filter */}
          <div className="flex justify-end">
            <div className="flex items-center gap-2 bg-white p-1 rounded-lg border border-gray-200">
              {['실시간', '오늘', '이번 주'].map((t, i) => (
                <button key={i} className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${i === 0 ? 'bg-white shadow-sm' : 'text-gray-500 hover:bg-gray-50'}`}>{t}</button>
              ))}
            </div>
          </div>

          {/* Stats Cards */}
          <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {stats.map((stat, i) => (
              <div key={i} className={`bg-white p-5 rounded-xl border shadow-sm ${stat.urgent ? 'border-l-4 border-l-red-400 border-gray-200' : 'border-gray-200'}`}>
                <div className="flex items-center justify-between mb-3">
                  <div className={`w-10 h-10 rounded-lg ${stat.color} flex items-center justify-center`}>
                    <span className="material-icons-round">{stat.icon}</span>
                  </div>
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${stat.changeColor}`}>{stat.change}</span>
                </div>
                <p className="text-sm text-gray-500">{stat.label}</p>
                <h3 className="text-2xl font-bold mt-1 text-gray-900">{stat.value}</h3>
              </div>
            ))}
          </section>

          {/* Charts */}
          <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-bold text-lg">사용자 증가 추이</h3>
                <select className="text-sm border border-gray-200 bg-gray-50 rounded-lg px-3 py-1.5 focus:ring-primary outline-none">
                  <option>지난 6개월</option>
                  <option>지난 1년</option>
                </select>
              </div>
              <div className="relative h-48 w-full flex items-end gap-2 px-2">
                {chartHeights.map((h, i) => (
                  <div key={i} className={`flex-1 ${h > 80 ? 'bg-primary/40 hover:bg-primary/60' : 'bg-primary/20 hover:bg-primary/40'} transition-colors rounded-t-lg group relative`} style={{ height: `${h}%` }}>
                    <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-[10px] py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                      {[12, 15, 14, 22, 28, 32][i]}k
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex justify-between mt-4 px-2 text-[10px] text-gray-400 font-medium uppercase tracking-wider">
                {months.map(m => <span key={m}>{m}</span>)}
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex flex-col">
              <h3 className="font-bold text-lg mb-4">휴식 유형별 분포</h3>
              <div className="flex-1 flex items-center justify-center relative">
                <svg className="w-36 h-36 transform -rotate-90">
                  <circle className="text-gray-100" cx="72" cy="72" fill="transparent" r="56" stroke="currentColor" strokeWidth="20" />
                  <circle cx="72" cy="72" fill="transparent" r="56" stroke="#10b981" strokeDasharray="352" strokeDashoffset="88" strokeWidth="20" />
                  <circle cx="72" cy="72" fill="transparent" r="56" stroke="#3b82f6" strokeDasharray="352" strokeDashoffset="264" strokeWidth="20" />
                </svg>
                <div className="absolute flex flex-col items-center">
                  <span className="text-2xl font-bold">75%</span>
                  <span className="text-xs text-gray-400">능동적</span>
                </div>
              </div>
              <div className="space-y-2 mt-4">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-primary"></span>
                    <span className="text-gray-600">능동적 휴식</span>
                  </div>
                  <span className="font-semibold">75%</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-blue-500"></span>
                    <span className="text-gray-600">수동적 휴식</span>
                  </div>
                  <span className="font-semibold">25%</span>
                </div>
              </div>
            </div>
          </section>

          {/* Bottom Grid */}
          <section className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            {/* Pending Places Table */}
            <div className="xl:col-span-2 bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                <h3 className="font-bold text-lg">장소 승인 대기 목록</h3>
                <Link to="/admin/places" className="text-sm font-semibold text-primary hover:underline">전체보기</Link>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-gray-50 text-gray-500 text-xs font-semibold uppercase">
                    <tr>
                      <th className="px-6 py-3">장소명</th>
                      <th className="px-6 py-3">카테고리</th>
                      <th className="px-6 py-3">신청자</th>
                      <th className="px-6 py-3">신청일</th>
                      <th className="px-6 py-3 text-right">관리</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 text-sm">
                    {pendingPlaces.map((place, i) => (
                      <tr key={i} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 font-medium text-gray-900">{place.name}</td>
                        <td className="px-6 py-4">
                          <span className={`px-2 py-1 rounded-full text-[11px] font-bold ${place.catColor}`}>{place.category}</span>
                        </td>
                        <td className="px-6 py-4 text-gray-500">{place.user}</td>
                        <td className="px-6 py-4 text-gray-500">{place.date}</td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button className="px-3 py-1 bg-primary text-white text-xs font-bold rounded-lg hover:bg-primary/90 transition-all">승인</button>
                            <button className="px-3 py-1 border border-red-200 text-red-500 text-xs font-bold rounded-lg hover:bg-red-50 transition-all">반려</button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Alerts */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden flex flex-col">
              <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                <h3 className="font-bold text-lg flex items-center gap-2">
                  <span className="material-icons-round text-red-500">notification_important</span>
                  긴급 알림
                </h3>
                <span className="bg-red-100 text-red-600 text-[10px] px-2 py-1 rounded-full font-bold">3건</span>
              </div>
              <div className="p-4 space-y-3 flex-1">
                {alerts.map((alert, i) => {
                  const c = alertColors[alert.level];
                  return (
                    <div key={i} className={`p-4 rounded-lg ${c.bg} border ${c.border}`}>
                      <div className="flex items-start gap-3">
                        <span className={`material-icons-round ${c.icon} mt-0.5 text-lg`}>{alert.icon}</span>
                        <div>
                          <h4 className={`text-sm font-bold ${c.title}`}>{alert.title}</h4>
                          <p className={`text-xs ${c.desc} mt-1`}>{alert.desc}</p>
                          <p className={`text-[10px] ${c.time} mt-2 font-medium`}>{alert.time}</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className="p-4 bg-gray-50 border-t border-gray-100">
                <button className="w-full py-2 text-xs font-bold text-gray-500 hover:text-primary transition-colors uppercase tracking-widest">모든 알림 지우기</button>
              </div>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}

export default AdminDashboard;
