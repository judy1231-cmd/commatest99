import AdminSidebar from '../../components/admin/AdminSidebar';
import AdminHeader from '../../components/admin/AdminHeader';

const posts = [
  { id: '#48293', author: '김지한', title: '도심 속에서 찾은 완벽한 오후의 숲멍', category: '신체적 휴식', likes: 124, comments: 18, reports: 10, status: '정상', time: '2시간 전' },
  { id: '#48294', author: '이지은', title: '비 오는 날, 따뜻한 차 한 잔과 독서', category: '감각적 휴식', likes: 89, comments: 12, reports: 0, status: '정상', time: '5시간 전' },
  { id: '#48295', author: '박준호', title: '도심 속에서 찾은 나만의 아지트', category: '정신적 휴식', likes: 56, comments: 7, reports: 3, status: '검토중', time: '1일 전' },
];

function CommunityManagement() {
  return (
    <div className="flex h-screen overflow-hidden bg-background-light">
      <AdminSidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <AdminHeader title="커뮤니티 관리" subtitle="게시글 및 댓글을 관리하세요." />
        <main className="flex-1 overflow-y-auto p-6">
          <div className="grid grid-cols-4 gap-4 mb-6">
            {[
              { label: '전체 게시글', value: '14,832', color: 'text-slate-700' },
              { label: '오늘 작성', value: '284', color: 'text-primary' },
              { label: '신고 접수', value: '18', color: 'text-amber-500' },
              { label: '처리 완료', value: '156', color: 'text-blue-500' },
            ].map((s, i) => (
              <div key={i} className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm">
                <p className={`text-2xl font-black ${s.color}`}>{s.value}</p>
                <p className="text-sm text-gray-500">{s.label}</p>
              </div>
            ))}
          </div>

          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-gray-100 flex items-center justify-between">
              <h3 className="font-bold text-gray-800">게시글 관리</h3>
              <div className="flex gap-2">
                <select className="px-3 py-2 border border-gray-200 bg-gray-50 rounded-lg text-sm text-gray-600 outline-none">
                  <option>전체</option>
                  <option>신고된 글</option>
                  <option>검토중</option>
                </select>
              </div>
            </div>
            <div className="divide-y divide-gray-100">
              {posts.map((post, i) => (
                <div key={i} className="p-5 hover:bg-gray-50 transition-colors">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs text-gray-400">{post.id}</span>
                        <span className="px-2 py-0.5 bg-accent-mint text-teal-600 text-[11px] font-bold rounded-full">{post.category}</span>
                        {post.reports > 0 && (
                          <span className="px-2 py-0.5 bg-red-50 text-red-500 text-[11px] font-bold rounded-full">신고 {post.reports}건</span>
                        )}
                        <span className={`px-2 py-0.5 text-[11px] font-bold rounded-full ${post.status === '정상' ? 'bg-green-50 text-green-600' : 'bg-amber-50 text-amber-600'}`}>{post.status}</span>
                      </div>
                      <h4 className="font-bold text-gray-900 mb-1">{post.title}</h4>
                      <div className="flex items-center gap-4 text-xs text-gray-400">
                        <span>{post.author}</span>
                        <span>{post.time}</span>
                        <span className="flex items-center gap-1"><span className="material-icons-round text-[12px] text-red-400">favorite</span>{post.likes}</span>
                        <span className="flex items-center gap-1"><span className="material-icons-round text-[12px]">chat_bubble</span>{post.comments}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <button className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-primary transition-colors">
                        <span className="material-icons-round text-base">visibility</span>
                      </button>
                      {post.reports > 0 && (
                        <button className="px-3 py-1.5 bg-amber-50 text-amber-600 text-xs font-bold rounded-lg hover:bg-amber-100 transition-all">
                          처리하기
                        </button>
                      )}
                      <button className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors">
                        <span className="material-icons-round text-base">delete</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

export default CommunityManagement;
