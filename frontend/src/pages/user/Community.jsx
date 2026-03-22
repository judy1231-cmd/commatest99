import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import UserNavbar from '../../components/user/UserNavbar';

// 메인페이지와 동일한 칩 스타일 데이터
const CATEGORIES = [
  { key: 'all',      label: '전체',       icon: 'apps',           iconHex: '#10b981', bgHex: '#ECFDF5' },
  { key: '신체적 휴식', label: '신체의 이완', icon: 'fitness_center', iconHex: '#4CAF82', bgHex: '#F0FAF5' },
  { key: '정신적 휴식', label: '정신적 고요', icon: 'spa',            iconHex: '#5B8DEF', bgHex: '#F0F5FF' },
  { key: '감각적 휴식', label: '감각의 정화', icon: 'visibility_off', iconHex: '#9B6DFF', bgHex: '#F5F0FF' },
  { key: '정서적 휴식', label: '정서적 지지', icon: 'favorite',       iconHex: '#FF7BAC', bgHex: '#FFF0F5' },
  { key: '사회적 휴식', label: '사회적 휴식', icon: 'groups',         iconHex: '#FF9A3C', bgHex: '#FFF5EC' },
  { key: '창조적 휴식', label: '창조적 몰입', icon: 'brush',          iconHex: '#FFB830', bgHex: '#FFFBF0' },
  { key: '자연적 휴식', label: '자연의 연결', icon: 'forest',         iconHex: '#2ECC9A', bgHex: '#F0FBF7' },
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

function Avatar({ nickname, isAnonymous, size = 'md' }) {
  const letter = (nickname || '?')[0];
  const sz = size === 'sm' ? 'w-8 h-8 text-sm' : 'w-10 h-10 text-base';
  if (isAnonymous) {
    return (
      <div className={`${sz} rounded-full bg-slate-200 flex items-center justify-center shrink-0`}>
        <span className="material-icons text-slate-400" style={{ fontSize: size === 'sm' ? '14px' : '18px' }}>
          person_off
        </span>
      </div>
    );
  }
  const colors = ['#10b981', '#5B8DEF', '#9B6DFF', '#FF7BAC', '#FF9A3C', '#FFB830', '#2ECC9A'];
  const bg = colors[(letter.charCodeAt(0) || 0) % colors.length];
  return (
    <div
      className={`${sz} rounded-full flex items-center justify-center text-white font-bold shrink-0`}
      style={{ background: `linear-gradient(135deg, ${bg} 0%, ${bg}cc 100%)` }}
    >
      {letter}
    </div>
  );
}

function PostCard({ post, onLike, onClick }) {
  const catColor = CATEGORY_COLOR[post.category] || '#10b981';
  const likeCount = post.likeCount ?? 0;
  const commentCount = post.commentCount ?? 0;

  return (
    <article
      className="bg-white cursor-pointer hover:bg-slate-50/60 transition-colors"
      onClick={onClick}
    >
      <div className="px-4 pt-4 pb-0">
        {/* 작성자 행 */}
        <div className="flex items-start gap-3">
          <Avatar nickname={post.nickname} isAnonymous={post.isAnonymous} />
          <div className="flex-1 min-w-0 pb-4 border-b border-slate-100">
            {/* 닉네임 + 시간 */}
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-2 min-w-0">
                <span className="text-[14px] font-bold text-slate-900 truncate">
                  {post.isAnonymous ? '익명' : (post.nickname || '알 수 없음')}
                </span>
                {post.category && (
                  <span
                    className="text-[10px] font-bold px-1.5 py-0.5 rounded-full shrink-0"
                    style={{ backgroundColor: `${catColor}18`, color: catColor }}
                  >
                    {post.category}
                  </span>
                )}
              </div>
              <span className="text-[12px] text-slate-400 shrink-0 ml-2">{timeAgo(post.createdAt)}</span>
            </div>

            {/* 제목 */}
            <h2 className="text-[15px] font-semibold text-slate-800 leading-snug mb-1">
              {post.title}
            </h2>

            {/* 본문 미리보기 */}
            {post.content && (
              <p className="text-[13px] text-slate-500 leading-relaxed line-clamp-3 mb-3">
                {post.content}
              </p>
            )}

            {/* 반응 바 */}
            <div className="flex items-center gap-4 mt-2">
              <button
                onClick={(e) => { e.stopPropagation(); onLike(post.id); }}
                className={`flex items-center gap-1.5 text-[13px] font-medium transition-colors ${
                  post.likedByMe
                    ? 'text-rose-500'
                    : 'text-slate-400 hover:text-rose-400'
                }`}
              >
                <span className="material-icons text-[18px]">
                  {post.likedByMe ? 'favorite' : 'favorite_border'}
                </span>
                {likeCount > 0 && <span>{likeCount}</span>}
              </button>

              <button
                className="flex items-center gap-1.5 text-[13px] font-medium text-slate-400 hover:text-primary transition-colors"
                onClick={(e) => e.stopPropagation()}
              >
                <span className="material-icons text-[18px]">chat_bubble_outline</span>
                {commentCount > 0 && <span>{commentCount}</span>}
              </button>

              <div className="flex-1" />

              <button
                className="text-slate-300 hover:text-primary transition-colors"
                onClick={(e) => e.stopPropagation()}
              >
                <span className="material-icons text-[18px]">bookmark_border</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}

function SkeletonPost() {
  return (
    <div className="bg-white px-4 pt-4 pb-0 animate-pulse">
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 bg-slate-100 rounded-full shrink-0" />
        <div className="flex-1 pb-4 border-b border-slate-100">
          <div className="h-3 bg-slate-100 rounded w-24 mb-2" />
          <div className="h-4 bg-slate-100 rounded w-3/4 mb-1.5" />
          <div className="h-3 bg-slate-100 rounded w-full mb-1" />
          <div className="h-3 bg-slate-100 rounded w-2/3 mb-3" />
          <div className="flex gap-4">
            <div className="h-3 bg-slate-100 rounded w-12" />
            <div className="h-3 bg-slate-100 rounded w-12" />
          </div>
        </div>
      </div>
    </div>
  );
}

function Community() {
  const navigate = useNavigate();
  const [sort, setSort] = useState('popular');
  const [activeCategory, setActiveCategory] = useState('all');
  const [hoveredCat, setHoveredCat] = useState(null);
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
      const res = await fetch(`/api/posts?sort=${sort}&page=${page}&size=20${cat}`, { headers });
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

      {/* 헤더 + 탭 — sticky */}
      <div className="sticky top-0 z-30 bg-white border-b border-slate-100 shadow-sm">
        {/* 상단 타이틀 + 정렬 */}
        <div className="max-w-2xl mx-auto px-6 pt-5 pb-2 flex items-center justify-between">
          <div>
            <h1 className="text-[22px] font-extrabold tracking-tight text-slate-900">커뮤니티</h1>
            <p className="text-[12px] text-slate-400 mt-0.5">휴식 경험을 나누고 서로 응원해요</p>
          </div>
          {/* 정렬 토글 */}
          <div className="flex items-center gap-1 bg-slate-100 rounded-xl p-1">
            {[
              { value: 'popular', icon: 'trending_up', label: '인기' },
              { value: 'latest',  icon: 'schedule',    label: '최신' },
            ].map(s => (
              <button
                key={s.value}
                onClick={() => setSort(s.value)}
                className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[12px] font-bold transition-all ${
                  sort === s.value
                    ? 'bg-white text-slate-800 shadow-sm'
                    : 'text-slate-400 hover:text-slate-600'
                }`}
              >
                <span className="material-icons text-[14px]">{s.icon}</span>
                {s.label}
              </button>
            ))}
          </div>
        </div>

        {/* 카테고리 칩 — 4×2 그리드 전체 표시 */}
        <div className="max-w-2xl mx-auto px-4 pb-3">
          <div className="grid grid-cols-4 gap-2">
            {CATEGORIES.map((cat, i) => {
              const isActive = activeCategory === cat.key;
              return (
                <button
                  key={cat.key}
                  onClick={() => setActiveCategory(cat.key)}
                  onMouseEnter={() => setHoveredCat(i)}
                  onMouseLeave={() => setHoveredCat(null)}
                  className="flex items-center justify-center gap-1 px-2 py-2 rounded-full border-2 transition-all duration-200 shadow-sm w-full"
                  style={{
                    borderColor: (isActive || hoveredCat === i) ? cat.iconHex : cat.iconHex + '50',
                    backgroundColor: (isActive || hoveredCat === i) ? cat.bgHex : '#ffffff',
                  }}
                >
                  <span className="material-icons text-[14px]" style={{ color: cat.iconHex }}>{cat.icon}</span>
                  <span
                    className="text-[11px] font-bold whitespace-nowrap transition-colors"
                    style={{ color: (isActive || hoveredCat === i) ? cat.iconHex : '#475569' }}
                  >
                    {cat.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <main className="max-w-2xl mx-auto pb-28 bg-[#F7F7F8]">

        {/* 게시글 수 */}
        {!loading && posts.length > 0 && (
          <div className="px-4 py-2.5 bg-white border-b border-slate-50">
            <p className="text-[12px] text-slate-400 font-medium">게시글 {posts.length}개</p>
          </div>
        )}

        {/* 로딩 */}
        {loading && (
          <div className="bg-white divide-y divide-slate-50">
            {Array.from({ length: 6 }).map((_, i) => <SkeletonPost key={i} />)}
          </div>
        )}

        {/* 에러 */}
        {!loading && error && (
          <div className="m-4 bg-red-50 border border-red-100 rounded-2xl p-4 flex items-center gap-3">
            <span className="material-icons text-red-400 text-base">error_outline</span>
            <p className="text-sm text-red-500 font-medium">{error}</p>
          </div>
        )}

        {/* 빈 상태 */}
        {!loading && !error && posts.length === 0 && (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mb-4">
              <span className="material-icons text-slate-300 text-3xl">forum</span>
            </div>
            <p className="font-bold text-slate-500 mb-1">아직 게시글이 없어요</p>
            <p className="text-sm text-slate-400">첫 번째 글을 작성해보세요!</p>
            {isLoggedIn && (
              <button
                onClick={() => navigate('/community/write')}
                className="mt-5 flex items-center gap-2 px-5 py-2.5 bg-primary text-white text-sm font-bold rounded-xl shadow-sm"
              >
                <span className="material-icons text-base">edit</span>
                글 작성하기
              </button>
            )}
          </div>
        )}

        {/* 게시글 목록 — Twitter/Threads 스타일 */}
        {!loading && !error && posts.length > 0 && (
          <div className="bg-white divide-y divide-slate-50">
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
          <div className="flex items-center justify-center gap-2 py-6 bg-white border-t border-slate-50">
            <button
              onClick={() => { setPage(p => Math.max(1, p - 1)); window.scrollTo(0, 0); }}
              disabled={page === 1}
              className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center text-slate-500 hover:bg-slate-200 transition-colors disabled:opacity-30"
            >
              <span className="material-icons text-base">chevron_left</span>
            </button>
            {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
              const p = i + Math.max(1, page - 3);
              if (p > totalPages) return null;
              return (
                <button
                  key={p}
                  onClick={() => { setPage(p); window.scrollTo(0, 0); }}
                  className={`w-9 h-9 rounded-xl text-sm font-bold transition-all ${
                    p === page
                      ? 'bg-primary text-white shadow-sm'
                      : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                  }`}
                >
                  {p}
                </button>
              );
            })}
            <button
              onClick={() => { setPage(p => Math.min(totalPages, p + 1)); window.scrollTo(0, 0); }}
              disabled={page === totalPages}
              className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center text-slate-500 hover:bg-slate-200 transition-colors disabled:opacity-30"
            >
              <span className="material-icons text-base">chevron_right</span>
            </button>
          </div>
        )}

      </main>

      {/* FAB — 글쓰기 */}
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
