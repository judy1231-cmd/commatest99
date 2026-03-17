import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import UserNavbar from '../../../components/user/UserNavbar';

const CATEGORIES = [
  { key: 'all',       label: '전체',       icon: 'grid_view',      color: '#10b981' },
  { key: 'physical',  label: '신체적 이완', icon: 'fitness_center', color: '#4CAF82' },
  { key: 'mental',    label: '정신적 고요', icon: 'spa',            color: '#5B8DEF' },
  { key: 'sensory',   label: '감각의 정화', icon: 'visibility_off', color: '#9B6DFF' },
  { key: 'emotional', label: '정서적 지지', icon: 'favorite',       color: '#FF7BAC' },
  { key: 'social',    label: '사회적 휴식', icon: 'groups',         color: '#FF9A3C' },
  { key: 'creative',  label: '창조적 몰입', icon: 'brush',          color: '#FFB830' },
  { key: 'nature',    label: '자연의 연결', icon: 'forest',         color: '#2ECC9A' },
];

const CATEGORY_IMAGES = {
  physical:  'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&q=80',
  mental:    'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&q=80',
  sensory:   'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&q=80',
  emotional: 'https://images.unsplash.com/photo-1474552226712-ac0f0961a954?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&q=80',
  social:    'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&q=80',
  nature:    'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&q=80',
  creative:  'https://images.unsplash.com/photo-1513364776144-60967b0f800f?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&q=80',
};

const DIFFICULTY_LABEL = { easy: '쉬움', medium: '보통', hard: '어려움' };
const DIFFICULTY_COLOR = {
  easy:   { bg: '#ECFDF5', text: '#10B981' },
  medium: { bg: '#FFFBEB', text: '#F59E0B' },
  hard:   { bg: '#FEF2F2', text: '#EF4444' },
};

const ITEMS_PER_PAGE = 8;

function formatDate(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')}`;
}

// 피처드 카드 (목록 첫 번째)
function FeaturedCard({ content, onBookmark, isLoggedIn }) {
  const navigate = useNavigate();
  const catInfo = CATEGORIES.find(c => c.key === content.category) || CATEGORIES[0];
  const diff = content.difficulty ? DIFFICULTY_COLOR[content.difficulty] : null;

  const handleBookmark = (e) => {
    e.preventDefault();
    if (!isLoggedIn) { navigate('/login'); return; }
    onBookmark(content.id);
  };

  return (
    <Link
      to={`/contents/${content.id}`}
      className="block bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden group"
    >
      {/* 썸네일 */}
      <div className="h-52 relative overflow-hidden"
        style={{ background: `linear-gradient(135deg, ${catInfo.color}22 0%, ${catInfo.color}10 100%)` }}
      >
        <img
          src={content.imageUrl || CATEGORY_IMAGES[content.category]}
          alt={content.title}
          className="w-full h-full object-cover"
          onError={(e) => { e.target.style.display = 'none'; }}
        />
        {/* 하단 그라디언트 */}
        <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.35) 0%, transparent 50%)' }} />
        {/* 카테고리 배지 */}
        <span
          className="absolute top-4 left-4 px-3 py-1 rounded-full text-xs font-bold backdrop-blur-sm"
          style={{ backgroundColor: `${catInfo.color}cc`, color: '#fff' }}
        >
          {catInfo.label}
        </span>
        {/* 읽기 시간 배지 */}
        {content.duration && (
          <span className="absolute bottom-4 left-4 px-2.5 py-1 bg-white/80 rounded-full text-xs font-semibold text-slate-600 flex items-center gap-1">
            <span className="material-icons text-xs text-slate-400">schedule</span>
            {content.duration}분 소요
          </span>
        )}
        {/* 북마크 */}
        <button
          onClick={handleBookmark}
          className="absolute top-4 right-4 w-8 h-8 bg-white/80 rounded-full flex items-center justify-center hover:bg-white transition-all"
        >
          <span className="material-icons text-base text-slate-400 hover:text-primary">
            {content.bookmarked ? 'bookmark' : 'bookmark_border'}
          </span>
        </button>
      </div>

      {/* 본문 */}
      <div className="p-5">
        <h2 className="text-lg font-bold text-slate-800 line-clamp-2 group-hover:text-primary transition-colors mb-2">
          {content.title}
        </h2>
        {content.summary && (
          <p className="text-sm text-slate-500 line-clamp-2 leading-relaxed">
            {content.summary}
          </p>
        )}
        <div className="flex items-center gap-2 mt-4">
          {diff && content.difficulty && (
            <span
              className="text-[11px] font-bold px-2 py-0.5 rounded-full"
              style={{ backgroundColor: diff.bg, color: diff.text }}
            >
              {DIFFICULTY_LABEL[content.difficulty]}
            </span>
          )}
          {content.createdAt && (
            <span className="text-xs text-slate-400">{formatDate(content.createdAt)}</span>
          )}
        </div>
      </div>
    </Link>
  );
}

// 리스트 카드 (이후 항목들)
function ListCard({ content, onBookmark, isLoggedIn }) {
  const navigate = useNavigate();
  const catInfo = CATEGORIES.find(c => c.key === content.category) || CATEGORIES[0];
  const diff = content.difficulty ? DIFFICULTY_COLOR[content.difficulty] : null;

  const handleBookmark = (e) => {
    e.preventDefault();
    if (!isLoggedIn) { navigate('/login'); return; }
    onBookmark(content.id);
  };

  return (
    <Link
      to={`/contents/${content.id}`}
      className="flex gap-4 bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all duration-200 p-4 group"
    >
      {/* 텍스트 영역 */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5 mb-2">
          <span
            className="text-[11px] font-bold px-2 py-0.5 rounded-full"
            style={{ backgroundColor: `${catInfo.color}15`, color: catInfo.color }}
          >
            {catInfo.label}
          </span>
          {diff && content.difficulty && (
            <span
              className="text-[11px] font-bold px-2 py-0.5 rounded-full"
              style={{ backgroundColor: diff.bg, color: diff.text }}
            >
              {DIFFICULTY_LABEL[content.difficulty]}
            </span>
          )}
        </div>
        <h3 className="text-sm font-bold text-slate-800 line-clamp-2 group-hover:text-primary transition-colors mb-1.5">
          {content.title}
        </h3>
        {content.summary && (
          <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">{content.summary}</p>
        )}
        <div className="flex items-center gap-3 mt-3 text-xs text-slate-400">
          {content.duration && (
            <span className="flex items-center gap-0.5 font-medium">
              <span className="material-icons text-xs">schedule</span>
              {content.duration}분 소요
            </span>
          )}
          {content.createdAt && <span>{formatDate(content.createdAt)}</span>}
        </div>
      </div>

      {/* 썸네일 */}
      <div className="flex flex-col items-end gap-2 shrink-0">
        <div
          className="w-20 h-20 rounded-xl overflow-hidden"
          style={{ backgroundColor: `${catInfo.color}15` }}
        >
          <img
            src={content.imageUrl || CATEGORY_IMAGES[content.category]}
            alt={content.title}
            className="w-full h-full object-cover"
            onError={(e) => { e.target.style.display = 'none'; }}
          />
          <span className="material-icons text-3xl hidden" style={{ color: `${catInfo.color}90` }}>
            {catInfo.icon}
          </span>
        </div>
        <button
          onClick={handleBookmark}
          className="p-1 text-slate-300 hover:text-primary transition-colors"
        >
          <span className="material-icons text-lg">
            {content.bookmarked ? 'bookmark' : 'bookmark_border'}
          </span>
        </button>
      </div>
    </Link>
  );
}

function ContentsList() {
  const isLoggedIn = !!localStorage.getItem('accessToken');

  const [activeCategory, setActiveCategory] = useState('all');
  const [contents, setContents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    setCurrentPage(1);
    if (activeCategory === 'recommend') loadRecommend();
    else loadContents();
  }, [activeCategory]);

  const loadContents = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = activeCategory !== 'all' ? `?category=${activeCategory}` : '';
      const res = await fetch(`/api/contents${params}`);
      const data = await res.json();
      if (data.success && data.data) {
        setContents(data.data.contents || data.data || []);
      } else {
        setError(data.message || '콘텐츠를 불러오지 못했어요.');
      }
    } catch {
      setError('서버에 연결할 수 없습니다.');
    } finally {
      setLoading(false);
    }
  };

  const loadRecommend = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/contents/recommend', {
        headers: { Authorization: `Bearer ${localStorage.getItem('accessToken')}` },
      });
      const data = await res.json();
      if (data.success && data.data) {
        setContents(data.data.contents || data.data || []);
      } else {
        setContents([]);
      }
    } catch {
      setContents([]);
    } finally {
      setLoading(false);
    }
  };

  const handleBookmark = async (id) => {
    try {
      await fetch(`/api/contents/${id}/bookmark`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${localStorage.getItem('accessToken')}` },
      });
      setContents(prev => prev.map(c => c.id === id ? { ...c, bookmarked: !c.bookmarked } : c));
    } catch { /* 무시 */ }
  };

  // 페이지네이션
  const totalPages = Math.ceil(contents.length / ITEMS_PER_PAGE);
  const paged = contents.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);
  const featured = paged[0];
  const listItems = paged.slice(1);

  return (
    <div className="min-h-screen bg-[#F7F7F8]">
      <UserNavbar />

      <main className="max-w-2xl mx-auto px-4 pt-6 pb-24">

        {/* 헤더 */}
        <div className="mb-5">
          <h1 className="text-[22px] font-extrabold tracking-tight text-slate-800">휴식 콘텐츠</h1>
          <p className="text-xs text-slate-400 mt-0.5">나에게 맞는 휴식 방법을 찾아보세요</p>
        </div>

        {/* 카테고리 칩 — 가로 스크롤 */}
        <div className="flex flex-wrap gap-2 mb-6">
          {/* 맞춤 추천 (로그인 시) */}
          {isLoggedIn && (
            <button
              onClick={() => setActiveCategory('recommend')}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap shrink-0 transition-all ${
                activeCategory === 'recommend'
                  ? 'bg-primary text-white shadow-sm'
                  : 'bg-white border border-primary/30 text-primary hover:bg-primary/5'
              }`}
            >
              <span className="material-icons text-xs">auto_awesome</span>
              맞춤 추천
            </button>
          )}
          {CATEGORIES.map((cat) => (
            <button
              key={cat.key}
              onClick={() => setActiveCategory(cat.key)}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap shrink-0 transition-all ${
                activeCategory === cat.key
                  ? 'bg-slate-800 text-white shadow-sm'
                  : 'bg-white border border-slate-200 text-slate-500 hover:border-slate-400 hover:text-slate-700'
              }`}
            >
              <span className="material-icons text-xs">{cat.icon}</span>
              {cat.label}
            </button>
          ))}
        </div>

        {/* 로딩 */}
        {loading && (
          <div className="flex justify-center items-center h-60">
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
        {!loading && !error && contents.length === 0 && (
          <div className="bg-white rounded-2xl border border-slate-100 p-16 text-center">
            <span className="material-icons text-5xl text-slate-200 mb-3 block">
              {activeCategory === 'recommend' ? 'auto_awesome' : 'article'}
            </span>
            {activeCategory === 'recommend' ? (
              <>
                <p className="font-semibold text-slate-500 mb-1">맞춤 추천 준비 중이에요</p>
                <p className="text-sm text-slate-400">진단을 받으면 나에게 맞는 콘텐츠를 추천해드릴게요.</p>
              </>
            ) : (
              <>
                <p className="font-semibold text-slate-500 mb-1">콘텐츠가 없어요</p>
                <p className="text-sm text-slate-400">다른 카테고리를 선택해보세요.</p>
              </>
            )}
          </div>
        )}

        {/* 콘텐츠 목록 */}
        {!loading && !error && contents.length > 0 && (
          <div className="space-y-3">
            {/* 피처드 카드 */}
            {featured && (
              <FeaturedCard
                content={featured}
                onBookmark={handleBookmark}
                isLoggedIn={isLoggedIn}
              />
            )}
            {/* 리스트 카드 */}
            {listItems.map(content => (
              <ListCard
                key={content.id}
                content={content}
                onBookmark={handleBookmark}
                isLoggedIn={isLoggedIn}
              />
            ))}
          </div>
        )}

        {/* 페이지네이션 */}
        {!loading && totalPages > 1 && (
          <div className="flex items-center justify-center gap-3 mt-8">
            <button
              onClick={() => { setCurrentPage(p => Math.max(1, p - 1)); window.scrollTo(0, 0); }}
              disabled={currentPage === 1}
              className="w-9 h-9 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-500 hover:border-primary hover:text-primary transition-colors disabled:opacity-30"
            >
              <span className="material-icons text-base">chevron_left</span>
            </button>

            {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
              <button
                key={page}
                onClick={() => { setCurrentPage(page); window.scrollTo(0, 0); }}
                className={`w-9 h-9 rounded-xl text-sm font-bold transition-all ${
                  page === currentPage
                    ? 'bg-primary text-white shadow-sm'
                    : 'bg-white border border-slate-200 text-slate-500 hover:border-primary hover:text-primary'
                }`}
              >
                {page}
              </button>
            ))}

            <button
              onClick={() => { setCurrentPage(p => Math.min(totalPages, p + 1)); window.scrollTo(0, 0); }}
              disabled={currentPage === totalPages}
              className="w-9 h-9 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-500 hover:border-primary hover:text-primary transition-colors disabled:opacity-30"
            >
              <span className="material-icons text-base">chevron_right</span>
            </button>
          </div>
        )}

        {/* 총 콘텐츠 수 */}
        {!loading && contents.length > 0 && (
          <p className="text-center text-xs text-slate-300 mt-4">
            총 {contents.length}개 콘텐츠 · {currentPage}/{totalPages} 페이지
          </p>
        )}

      </main>
    </div>
  );
}

export default ContentsList;
