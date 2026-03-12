import { useState } from 'react';
import AdminSidebar from '../../components/admin/AdminSidebar';
import AdminHeader from '../../components/admin/AdminHeader';

const posts = [
  { id: '#48293', author: '김지한', title: '도심 속에서 찾은 완벽한 오후의 숲멍', category: '신체적 휴식', likes: 124, comments: 18, reports: 10, status: '정상',  time: '2시간 전' },
  { id: '#48294', author: '이지은', title: '비 오는 날, 따뜻한 차 한 잔과 독서',   category: '감각적 휴식', likes: 89,  comments: 12, reports: 0,  status: '정상',  time: '5시간 전' },
  { id: '#48295', author: '박준호', title: '도심 속에서 찾은 나만의 아지트',         category: '정신적 휴식', likes: 56,  comments: 7,  reports: 3,  status: '검토중', time: '1일 전'   },
];

const CATEGORIES = ['전체', '신체적 휴식', '감각적 휴식', '정신적 휴식', '정서적 휴식', '사회적 휴식'];
const STATUS_FILTERS = ['전체', '정상', '검토중', '숨김'];

const STATUS_BADGE = {
  '정상':  'bg-green-50 text-green-600 border border-green-200',
  '검토중': 'bg-amber-50 text-amber-600 border border-amber-200',
  '숨김':  'bg-gray-100 text-gray-500 border border-gray-200',
};

const REPORT_THRESHOLD = 5;

function CommunityManagement() {
  /* ── UI 전용 상태 ── */
  const [search,         setSearch]         = useState('');
  const [categoryFilter, setCategoryFilter] = useState('전체');
  const [statusFilter,   setStatusFilter]   = useState('전체');

  const filtered = posts.filter(p => {
    if (categoryFilter !== '전체' && p.category !== categoryFilter) return false;
    if (statusFilter   !== '전체' && p.status   !== statusFilter)   return false;
    if (search && !p.title.includes(search) && !p.author.includes(search)) return false;
    return true;
  });

  const reportedCount = posts.filter(p => p.reports > 0).length;

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      <AdminSidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <AdminHeader title="커뮤니티 관리" subtitle="게시글 및 댓글을 관리하세요." />
        <main className="flex-1 overflow-y-auto p-6 space-y-5">

          {/* ── 2차 MVP 준비중 배너 ── */}
          <div className="flex items-center gap-3 px-4 py-3 bg-amber-50 border border-amber-200 rounded-xl">
            <span className="material-icons text-amber-500 text-[20px] shrink-0">construction</span>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-amber-800">커뮤니티 기능 — 2차 MVP 예정</p>
              <p className="text-xs text-amber-600 mt-0.5">게시글 API 미연결 상태입니다. 현재 화면은 UI 미리보기입니다.</p>
            </div>
            <span className="shrink-0 text-xs font-bold text-amber-600 bg-amber-100 border border-amber-200 px-2.5 py-1 rounded-full">준비중</span>
          </div>

          {/* ── 요약 카드 ── */}
          <div className="grid grid-cols-4 gap-4">
            {[
              { icon: 'article',      label: '전체 게시글', value: '14,832', unit: '건', iconCls: 'bg-gray-100 text-gray-600'       },
              { icon: 'edit',         label: '오늘 작성',   value: '284',    unit: '건', iconCls: 'bg-blue-50 text-blue-600'        },
              { icon: 'flag',         label: '신고 접수',   value: `${reportedCount}`,   unit: '건', iconCls: 'bg-red-50 text-red-500'  },
              { icon: 'check_circle', label: '처리 완료',   value: '156',    unit: '건', iconCls: 'bg-emerald-50 text-emerald-600'  },
            ].map((card, i) => (
              <div key={i} className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 flex items-center gap-4">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${card.iconCls}`}>
                  <span className="material-icons text-[20px]">{card.icon}</span>
                </div>
                <div>
                  <div className="flex items-end gap-1">
                    <span className="text-2xl font-black text-gray-900 leading-none">{card.value}</span>
                    <span className="text-sm text-gray-400 mb-0.5">{card.unit}</span>
                  </div>
                  <p className="text-xs text-gray-400 mt-0.5">{card.label}</p>
                </div>
              </div>
            ))}
          </div>

          {/* ── 테이블 카드 ── */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">

            {/* 툴바 */}
            <div className="px-5 py-4 border-b border-gray-100 space-y-3">

              {/* 1행: 검색 */}
              <div className="flex items-center justify-between gap-3">
                <div className="relative">
                  <span className="material-icons absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-[16px]">search</span>
                  <input
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    placeholder="제목 · 작성자 검색"
                    className="h-9 pl-9 pr-4 w-64 border border-gray-200 rounded-lg text-sm text-gray-700 placeholder:text-gray-400 bg-gray-50 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                  />
                </div>
                <div className="text-xs text-gray-400">
                  총 <span className="font-semibold text-gray-600">{filtered.length}</span>건
                  {(search || categoryFilter !== '전체' || statusFilter !== '전체') && (
                    <button
                      onClick={() => { setSearch(''); setCategoryFilter('전체'); setStatusFilter('전체'); }}
                      className="ml-2 text-primary hover:underline"
                    >
                      필터 초기화
                    </button>
                  )}
                </div>
              </div>

              {/* 2행: 카테고리 칩 */}
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-xs text-gray-400 mr-1">카테고리</span>
                {CATEGORIES.map(cat => (
                  <button
                    key={cat}
                    onClick={() => setCategoryFilter(cat)}
                    className={`h-7 px-3 rounded-lg text-xs font-semibold border transition-all ${
                      categoryFilter === cat
                        ? 'bg-primary text-white border-primary'
                        : 'bg-white text-gray-500 border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
                <span className="text-xs text-gray-300 mx-1">|</span>
                <span className="text-xs text-gray-400 mr-1">상태</span>
                {STATUS_FILTERS.map(s => (
                  <button
                    key={s}
                    onClick={() => setStatusFilter(s)}
                    className={`h-7 px-3 rounded-lg text-xs font-semibold border transition-all ${
                      statusFilter === s
                        ? 'bg-primary text-white border-primary'
                        : 'bg-white text-gray-500 border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            {/* 테이블 */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200">
                    <th className="px-5 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider w-16">#</th>
                    <th className="px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">제목</th>
                    <th className="px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider w-24">작성자</th>
                    <th className="px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider w-24">작성일</th>
                    <th className="px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider w-20 text-center">신고 수</th>
                    <th className="px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider w-20 text-center">상태</th>
                    <th className="px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right w-28">관리</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-16 text-center">
                        <div className="flex flex-col items-center gap-2 text-gray-300">
                          <span className="material-icons text-4xl">article</span>
                          <p className="text-sm text-gray-400">
                            {search ? `"${search}"에 해당하는 게시글이 없습니다` : '게시글이 없습니다'}
                          </p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    filtered.map((post, idx) => {
                      const isHighReport = post.reports >= REPORT_THRESHOLD;
                      const statusCls = STATUS_BADGE[post.status] || 'bg-gray-100 text-gray-500 border border-gray-200';

                      return (
                        <tr
                          key={post.id}
                          className={`border-b border-gray-100 hover:bg-primary/5 transition-colors ${
                            isHighReport ? 'bg-red-50/40' : idx % 2 === 1 ? 'bg-gray-50/50' : 'bg-white'
                          }`}
                        >
                          {/* ID */}
                          <td className="px-5 py-3.5 text-xs font-mono text-gray-400">{post.id}</td>

                          {/* 제목 + 카테고리 배지 */}
                          <td className="px-5 py-3.5 max-w-xs">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-teal-50 text-teal-600 border border-teal-200 shrink-0">
                                {post.category}
                              </span>
                            </div>
                            <p className="text-sm font-semibold text-gray-900 truncate">{post.title}</p>
                            <div className="flex items-center gap-3 mt-1">
                              <span className="flex items-center gap-0.5 text-[11px] text-gray-400">
                                <span className="material-icons text-[12px] text-red-400">favorite</span>
                                {post.likes}
                              </span>
                              <span className="flex items-center gap-0.5 text-[11px] text-gray-400">
                                <span className="material-icons text-[12px]">chat_bubble</span>
                                {post.comments}
                              </span>
                            </div>
                          </td>

                          {/* 작성자 */}
                          <td className="px-5 py-3.5">
                            <span className="text-sm font-medium text-gray-700">{post.author}</span>
                          </td>

                          {/* 작성일 */}
                          <td className="px-5 py-3.5">
                            <span className="text-xs text-gray-500">{post.time}</span>
                          </td>

                          {/* 신고 수 */}
                          <td className="px-5 py-3.5 text-center">
                            {post.reports > 0 ? (
                              <span className={`inline-flex items-center gap-0.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${
                                isHighReport
                                  ? 'bg-red-50 text-red-600 border-red-200'
                                  : 'bg-amber-50 text-amber-600 border-amber-200'
                              }`}>
                                <span className="material-icons text-[11px]">flag</span>
                                {post.reports}건
                              </span>
                            ) : (
                              <span className="text-xs text-gray-300">—</span>
                            )}
                          </td>

                          {/* 상태 */}
                          <td className="px-5 py-3.5 text-center">
                            <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold ${statusCls}`}>
                              <span className={`w-1.5 h-1.5 rounded-full inline-block ${
                                post.status === '정상' ? 'bg-green-500' : post.status === '검토중' ? 'bg-amber-400' : 'bg-gray-400'
                              }`} />
                              {post.status}
                            </span>
                          </td>

                          {/* 관리 버튼 */}
                          <td className="px-5 py-3.5 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              {post.reports > 0 && (
                                <button
                                  disabled
                                  title="신고 처리 API 추후 지원 예정"
                                  className="px-2.5 py-1 text-[11px] font-bold text-amber-500 border border-amber-200 rounded-lg cursor-not-allowed opacity-70"
                                >
                                  처리
                                </button>
                              )}
                              <button
                                disabled
                                title="숨김 API 추후 지원 예정"
                                className="px-2.5 py-1 text-[11px] font-bold text-gray-500 border border-gray-200 rounded-lg cursor-not-allowed opacity-70"
                              >
                                숨김
                              </button>
                              <button
                                disabled
                                title="삭제 API 추후 지원 예정"
                                className="px-2.5 py-1 text-[11px] font-bold text-red-400 border border-red-200 rounded-lg cursor-not-allowed opacity-70"
                              >
                                삭제
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            <div className="px-5 py-3 border-t border-gray-100">
              <p className="text-xs text-gray-400">* 커뮤니티 기능은 2차 MVP 예정입니다. 숨김·삭제·신고 처리 API 연동 후 활성화됩니다.</p>
            </div>
          </div>

        </main>
      </div>
    </div>
  );
}

export default CommunityManagement;
