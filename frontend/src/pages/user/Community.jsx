import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import UserNavbar from '../../components/user/UserNavbar';

const CATEGORIES = [
  { key: 'all',      label: '전체',       icon: 'apps',           color: '#10B981', bg: '#F0FDF4' },
  { key: '신체적 휴식', label: '신체의 이완', icon: 'fitness_center', color: '#4CAF82', bg: '#F0FAF5' },
  { key: '정신적 휴식', label: '정신적 고요', icon: 'spa',            color: '#5B8DEF', bg: '#EFF6FF' },
  { key: '감각적 휴식', label: '감각의 정화', icon: 'visibility_off', color: '#9B6DFF', bg: '#F5F3FF' },
  { key: '정서적 휴식', label: '정서적 지지', icon: 'favorite',       color: '#FF7BAC', bg: '#FFF0F6' },
  { key: '사회적 휴식', label: '사회적 휴식', icon: 'groups',         color: '#FF9A3C', bg: '#FFF7ED' },
  { key: '자연적 휴식', label: '자연의 연결', icon: 'forest',         color: '#2ECC9A', bg: '#F0FBF7' },
  { key: '창조적 휴식', label: '창조적 몰입', icon: 'brush',          color: '#FFB830', bg: '#FFFBEB' },
];

const CATEGORY_COLOR = {
  '신체적 휴식': '#4CAF82',
  '정신적 휴식': '#5B8DEF',
  '감각적 휴식': '#9B6DFF',
  '정서적 휴식': '#FF7BAC',
  '사회적 휴식': '#FF9A3C',
  '자연적 휴식': '#2ECC9A',
  '창조적 휴식': '#FFB830',
};

function timeAgo(dateStr) {
  if (!dateStr) return '';
  const diff = Math.floor((Date.now() - new Date(dateStr)) / 1000);
  if (diff < 60)         return '방금 전';
  if (diff < 3600)       return `${Math.floor(diff / 60)}분 전`;
  if (diff < 86400)      return `${Math.floor(diff / 3600)}시간 전`;
  if (diff < 86400 * 30) return `${Math.floor(diff / 86400)}일 전`;
  return new Date(dateStr).toLocaleDateString('ko-KR');
}

function PostCard({ post, onLike, onClick }) {
  const catColor = CATEGORY_COLOR[post.category] || '#10b981';
  const avatarLetter = (post.nickname || '?')[0];

  return (
    <div
      className="bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all cursor-pointer"
      onClick={onClick}
    >
      {/* 상단: 작성자 정보 */}
      <div className="flex items-center gap-3 px-4 pt-4 pb-3">
        <div
          className="w-9 h-9 rounded-full flex items-center justify-center text-white text-sm font-bold shrink-0"
          style={{ background: 'linear-gradient(135deg, #10b981 0%, #0d9488 100%)' }}
        >
          {post.isAnonymous ? (
            <span className="material-icons text-base">person_off</span>
          ) : avatarLetter}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <span className="text-sm font-bold text-slate-800 truncate">
              {post.isAnonymous ? '익명' : post.nickname}
            </span>
            {post.category && (
              <span
                className="text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0"
                style={{ backgroundColor: `${catColor}18`, color: catColor }}
              >
                {post.category}
              </span>
            )}
          </div>
          <span className="text-[11px] text-slate-400">{timeAgo(post.createdAt)}</span>
        </div>
        <button className="text-slate-300 hover:text-slate-500 transition-colors p-1">
          <span className="material-icons text-base">more_horiz</span>
        </button>
      </div>

      {/* 본문 */}
      <div className="px-4 pb-3">
        <h2 className="text-[15px] font-bold text-slate-800 leading-snug mb-1.5 line-clamp-2">
          {post.title}
        </h2>
        {post.content && (
          <p className="text-xs text-slate-500 leading-relaxed line-clamp-2">
            {post.content}
          </p>
        )}
      </div>

      {/* 하단: 반응 */}
      <div className="flex items-center gap-4 px-4 py-3 border-t border-slate-50">
        <button
          onClick={(e) => { e.stopPropagation(); onLike(post.id); }}
          className={`flex items-center gap-1 text-xs font-semibold transition-colors ${
            post.likedByMe ? 'text-rose-500' : 'text-slate-400 hover:text-rose-500'
          }`}
        >
          <span className="material-icons text-base">
            {post.likedByMe ? 'favorite' : 'favorite_border'}
          </span>
          {post.likeCount ?? 0}
        </button>
        <button className="flex items-center gap-1 text-xs font-semibold text-slate-400 hover:text-primary transition-colors">
          <span className="material-icons text-base">chat_bubble_outline</span>
          {post.commentCount ?? 0}
        </button>
        <div className="flex-1" />
        <button className="text-slate-300 hover:text-primary transition-colors">
          <span className="material-icons text-base">bookmark_border</span>
        </button>
      </div>
    </div>
  );
}

function Community() {
  const navigate = useNavigate();
  const [sort, setSort] = useState('popular');
  const [activeCategory, setActiveCategory] = useState('all');
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const token = localStorage.getItem('accessToken');
  const isLoggedIn = !!token;

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

  useEffect(() => {
    setPage(1);
  }, [activeCategory, sort]);

  const handleLike = async (postId) => {
    if (!token) { navigate('/login'); return; }
    try {
      await fetch(`/api/posts/${postId}/like`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchPosts();
    } catch {
      // 무시
    }
  };

  return (
    <div className="min-h-screen bg-[#F7F7F8]">
      <UserNavbar />

      <main className="max-w-2xl mx-auto px-4 pt-5 pb-28">

        {/* 헤더 */}
        <div className="mb-5">
          <h1 className="text-[22px] font-extrabold tracking-tight text-slate-800">커뮤니티</h1>
          <p className="text-xs text-slate-400 mt-0.5">휴식 경험을 나누고 서로 응원해요</p>
        </div>

        {/* 카테고리 칩 — 전체 표시 */}
        <div className="flex flex-wrap gap-2 mb-4">
          {CATEGORIES.map(cat => {
            const isActive = activeCategory === cat.key;
            return (
              <button
                key={cat.key}
                onClick={() => setActiveCategory(cat.key)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap shrink-0 transition-all"
                style={isActive
                  ? { backgroundColor: cat.color, color: '#fff', boxShadow: `0 2px 8px ${cat.color}55` }
                  : { backgroundColor: cat.bg, color: cat.color, border: `1.5px solid ${cat.color}30` }
                }
              >
                <span className="material-icons" style={{ fontSize: '13px' }}>{cat.icon}</span>
                {cat.label}
              </button>
            );
          })}
        </div>

        {/* 정렬 + 게시글 수 */}
        <div className="flex items-center justify-between mb-4">
          <p className="text-xs text-slate-400">
            {!loading && `${posts.length}개 게시글`}
          </p>
          <div className="flex bg-white border border-slate-200 rounded-xl p-0.5 gap-0.5">
            {[
              { value: 'latest',  label: '최신순' },
              { value: 'popular', label: '인기순' },
            ].map(s => (
              <button
                key={s.value}
                onClick={() => setSort(s.value)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  sort === s.value
                    ? 'bg-primary text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-600'
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>

        {/* 로딩 */}
        {loading && (
          <div className="flex justify-center items-center h-48">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
          </div>
        )}

        {/* 에러 */}
        {!loading && error && (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-4 text-sm text-red-600 flex items-center gap-2">
            <span className="material-icons text-base">error_outline</span>
            {error}
          </div>
        )}

        {/* 빈 상태 */}
        {!loading && !error && posts.length === 0 && (
          <div className="bg-white rounded-2xl border border-slate-100 p-16 text-center">
            <span className="material-icons text-5xl text-slate-200 mb-3 block">forum</span>
            <p className="font-semibold text-slate-500 mb-1">아직 게시글이 없어요</p>
            <p className="text-sm text-slate-400">첫 번째 글을 작성해보세요.</p>
          </div>
        )}

        {/* 게시글 목록 */}
        {!loading && !error && posts.length > 0 && (
          <div className="space-y-3">
            {posts.map(post => (
              <PostCard
                key={post.id}
                post={post}
                onLike={handleLike}
                onClick={() => navigate(`/community/${post.id}`)}
              />
            ))}
          </div>
        )}

        {/* 페이지네이션 */}
        {!loading && totalPages > 1 && (
          <div className="flex items-center justify-center gap-3 mt-8">
            <button
              onClick={() => { setPage(p => Math.max(1, p - 1)); window.scrollTo(0, 0); }}
              disabled={page === 1}
              className="w-9 h-9 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-500 hover:border-primary hover:text-primary transition-colors disabled:opacity-30"
            >
              <span className="material-icons text-base">chevron_left</span>
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
              <button
                key={p}
                onClick={() => { setPage(p); window.scrollTo(0, 0); }}
                className={`w-9 h-9 rounded-xl text-sm font-bold transition-all ${
                  p === page
                    ? 'bg-primary text-white shadow-sm'
                    : 'bg-white border border-slate-200 text-slate-500 hover:border-primary hover:text-primary'
                }`}
              >
                {p}
              </button>
            ))}
            <button
              onClick={() => { setPage(p => Math.min(totalPages, p + 1)); window.scrollTo(0, 0); }}
              disabled={page === totalPages}
              className="w-9 h-9 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-500 hover:border-primary hover:text-primary transition-colors disabled:opacity-30"
            >
              <span className="material-icons text-base">chevron_right</span>
            </button>
          </div>
        )}

      </main>

      {/* FAB — 글쓰기 버튼 */}
      {isLoggedIn && (
        <button
          onClick={() => navigate('/community/write')}
          className="fixed bottom-24 right-5 w-14 h-14 bg-primary text-white rounded-full shadow-lg shadow-emerald-200 flex items-center justify-center hover:bg-primary/90 hover:scale-105 active:scale-95 transition-all z-40"
        >
          <span className="material-icons text-xl">edit</span>
        </button>
      )}
    </div>
  );
}

export default Community;
