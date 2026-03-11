import { useState, useEffect, useCallback } from 'react';
import UserNavbar from '../../components/user/UserNavbar';

// 카테고리별 태그 색상
const TAG_COLORS = {
  '신체적 휴식': 'bg-sky-100 text-sky-700',
  '정신적 휴식': 'bg-violet-100 text-violet-700',
  '감각적 휴식': 'bg-amber-100 text-amber-700',
  '정서적 휴식': 'bg-rose-100 text-rose-700',
  '사회적 휴식': 'bg-emerald-100 text-emerald-700',
  '창조적 휴식': 'bg-orange-100 text-orange-700',
  '자연적 휴식': 'bg-green-100 text-green-700',
};

const CATEGORIES = [
  { icon: 'grid_view',      label: '전체보기',   key: 'all' },
  { icon: 'fitness_center', label: '신체적 이완', key: '신체적 휴식' },
  { icon: 'spa',            label: '정신적 고요', key: '정신적 휴식' },
  { icon: 'visibility_off', label: '감각의 정화', key: '감각적 휴식' },
  { icon: 'favorite',       label: '정서적 지지', key: '정서적 휴식' },
  { icon: 'groups',         label: '사회적 휴식', key: '사회적 휴식' },
  { icon: 'brush',          label: '창조적 몰입', key: '창조적 휴식' },
  { icon: 'forest',         label: '자연의 연결', key: '자연적 휴식' },
];

function timeAgo(dateStr) {
  const diff = Math.floor((Date.now() - new Date(dateStr)) / 1000);
  if (diff < 60)         return '방금 전';
  if (diff < 3600)       return `${Math.floor(diff / 60)}분 전`;
  if (diff < 86400)      return `${Math.floor(diff / 3600)}시간 전`;
  if (diff < 86400 * 30) return `${Math.floor(diff / 86400)}일 전`;
  return new Date(dateStr).toLocaleDateString('ko-KR');
}

function Community() {
  const [sort, setSort] = useState('popular');
  const [activeCategory, setActiveCategory] = useState('all');
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const token = localStorage.getItem('token');

  const fetchPosts = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const cat = activeCategory === 'all' ? '' : `&category=${encodeURIComponent(activeCategory)}`;
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      const res = await fetch(`/api/posts?sort=${sort}&page=${page}&size=10${cat}`, { headers });
      const data = await res.json();
      if (data.success) {
        setPosts(data.data.posts || []);
        setTotalPages(data.data.totalPages || 1);
      }
    } catch {
      setError('게시글을 불러오지 못했어요.');
    } finally {
      setLoading(false);
    }
  }, [activeCategory, sort, page, token]);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  // 카테고리/정렬 바뀌면 1페이지로 리셋
  useEffect(() => {
    setPage(1);
  }, [activeCategory, sort]);

  const handleLike = async (postId) => {
    if (!token) {
      alert('로그인이 필요합니다.');
      return;
    }
    try {
      await fetch(`/api/posts/${postId}/like`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      // 좋아요 후 목록 갱신
      fetchPosts();
    } catch {
      // 무시
    }
  };

  return (
    <div className="min-h-screen bg-[#F9F7F2]">
      <UserNavbar />
      <main className="max-w-6xl mx-auto px-6 py-10 grid grid-cols-12 gap-10 pb-24 md:pb-10">
        {/* Sidebar */}
        <aside className="col-span-12 md:col-span-3 lg:col-span-2 space-y-8">
          <div className="flex flex-col gap-1.5">
            <p className="px-3 mb-3 text-[11px] font-bold uppercase tracking-widest text-slate-400">카테고리</p>
            {CATEGORIES.map((item) => (
              <button
                key={item.key}
                onClick={() => setActiveCategory(item.key)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl font-semibold transition-colors w-full ${activeCategory === item.key ? 'bg-[#4ADE80]/10 text-[#4ADE80]' : 'hover:bg-slate-100 text-slate-500 hover:text-slate-800'}`}
              >
                <span className="material-symbols-outlined text-xl">{item.icon}</span>
                <span className="text-sm">{item.label}</span>
              </button>
            ))}
          </div>
          {token && (
            <button className="w-full bg-slate-900 hover:bg-black text-white font-semibold py-3.5 px-4 rounded-2xl flex items-center justify-center gap-2 transition-all active:scale-95 shadow-sm">
              <span className="material-symbols-outlined text-xl">edit</span>
              <span className="text-sm">글쓰기</span>
            </button>
          )}
        </aside>

        {/* Feed */}
        <section className="col-span-12 md:col-span-9 lg:col-span-7 space-y-8">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <h1 className="text-xl font-bold text-slate-800">
              {activeCategory === 'all' ? '인기 휴식 피드' : activeCategory}
              {!loading && <span className="text-sm font-normal text-slate-400 ml-2">{posts.length}개</span>}
            </h1>
            <div className="flex bg-slate-100 p-1 rounded-lg">
              <button
                onClick={() => setSort('latest')}
                className={`text-xs px-4 py-1.5 rounded-md font-medium transition-all ${sort === 'latest' ? 'bg-white shadow-sm text-slate-800' : 'text-slate-500'}`}
              >최신순</button>
              <button
                onClick={() => setSort('popular')}
                className={`text-xs px-4 py-1.5 rounded-md font-medium transition-all ${sort === 'popular' ? 'bg-white shadow-sm text-slate-800' : 'text-slate-500'}`}
              >인기순</button>
            </div>
          </div>

          {loading && (
            <div className="flex justify-center py-20">
              <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
          )}

          {error && (
            <div className="text-center py-20 text-slate-400">
              <span className="material-symbols-outlined text-5xl mb-3 block">error</span>
              <p className="text-sm">{error}</p>
            </div>
          )}

          {!loading && !error && (
            <div className="space-y-8">
              {posts.length === 0 && (
                <div className="text-center py-20 text-slate-400">
                  <span className="material-symbols-outlined text-5xl mb-3 block">inbox</span>
                  <p className="text-sm">해당 유형의 게시글이 없어요.</p>
                </div>
              )}
              {posts.map((post) => (
                <article key={post.id} className="bg-white border border-[#F0F2F0] rounded-[24px] overflow-hidden shadow-[0_4px_20px_-4px_rgba(0,0,0,0.03)] hover:shadow-[0_8px_30px_-4px_rgba(0,0,0,0.06)] transition-all group">
                  <div className="p-6 flex items-center gap-3">
                    <div className="w-11 h-11 rounded-full bg-slate-100 overflow-hidden ring-2 ring-slate-50 flex items-center justify-center">
                      <span className="material-icons text-slate-400">person</span>
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-bold text-[15px] text-slate-800">{post.nickname}</p>
                        <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${TAG_COLORS[post.category] || 'bg-slate-100 text-slate-600'}`}>
                          {post.category}
                        </span>
                      </div>
                      <p className="text-[12px] text-slate-400">{timeAgo(post.createdAt)}</p>
                    </div>
                    <button className="ml-auto text-slate-300 hover:text-slate-600 transition-colors">
                      <span className="material-symbols-outlined">more_horiz</span>
                    </button>
                  </div>
                  <div className="px-6 pb-4">
                    <h2 className="text-lg font-bold mb-2.5 text-slate-800 group-hover:text-[#4ADE80] transition-colors leading-snug">{post.title}</h2>
                    <p className="text-[14px] text-slate-500 line-clamp-2 leading-relaxed">{post.content}</p>
                  </div>
                  <div className="px-6 py-4 flex items-center justify-between border-t border-slate-50 bg-slate-50/30">
                    <div className="flex gap-6">
                      <button
                        onClick={() => handleLike(post.id)}
                        className={`flex items-center gap-1.5 transition-colors ${post.likedByMe ? 'text-rose-500' : 'text-slate-400 hover:text-rose-500'}`}
                      >
                        <span className="material-symbols-outlined text-[22px]">{post.likedByMe ? 'favorite' : 'favorite'}</span>
                        <span className="text-[13px] font-medium">{post.likeCount}</span>
                      </button>
                      <button className="flex items-center gap-1.5 text-slate-400 hover:text-[#4ADE80] transition-colors">
                        <span className="material-symbols-outlined text-[22px]">chat_bubble</span>
                        <span className="text-[13px] font-medium">{post.commentCount}</span>
                      </button>
                    </div>
                    <button className="text-slate-400 hover:text-slate-800 transition-colors">
                      <span className="material-symbols-outlined text-[22px]">bookmark</span>
                    </button>
                  </div>
                </article>
              ))}

              {/* 페이지네이션 */}
              {totalPages > 1 && (
                <div className="flex justify-center gap-2 pt-4">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                    <button
                      key={p}
                      onClick={() => setPage(p)}
                      className={`w-9 h-9 rounded-xl text-sm font-medium transition-all ${p === page ? 'bg-slate-900 text-white' : 'bg-white text-slate-500 hover:bg-slate-100 border border-slate-200'}`}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </section>

        {/* Right Sidebar */}
        <aside className="hidden lg:block lg:col-span-3 space-y-8">
          <div className="bg-soft-mint/60 border border-green-100/50 rounded-3xl p-6 relative overflow-hidden">
            <h3 className="font-bold text-[13px] text-green-700 mb-3 flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[18px]">auto_awesome</span>
              오늘의 휴식 팁
            </h3>
            <p className="text-[13.5px] leading-[1.6] text-slate-600">
              "20-20-20 규칙: 20분마다 20피트 밖을 20초간 바라보세요. 디지털 기기로 지친 시각 신경을 위한 최고의 휴식입니다."
            </p>
          </div>
          <div className="bg-white border border-[#F0F2F0] rounded-3xl p-6 shadow-sm">
            <h3 className="font-bold text-slate-800 mb-4 text-sm flex items-center gap-2">
              <span className="material-symbols-outlined text-[#4ADE80] text-xl">trending_up</span>
              인기 카테고리
            </h3>
            <div className="space-y-3">
              {CATEGORIES.slice(1).map((cat) => (
                <button
                  key={cat.key}
                  onClick={() => setActiveCategory(cat.key)}
                  className="w-full flex items-center gap-2 text-left hover:text-[#4ADE80] transition-colors"
                >
                  <span className="material-symbols-outlined text-[16px] text-slate-400">{cat.icon}</span>
                  <span className="text-[13px] text-slate-600">{cat.label}</span>
                </button>
              ))}
            </div>
          </div>
        </aside>
      </main>
    </div>
  );
}

export default Community;
