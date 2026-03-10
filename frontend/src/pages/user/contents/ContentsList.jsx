import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import UserNavbar from '../../../components/user/UserNavbar';

const CATEGORIES = [
  { key: 'all',      label: '전체',      icon: 'grid_view' },
  { key: 'physical', label: '신체적 이완', icon: 'fitness_center', color: '#EF4444' },
  { key: 'mental',   label: '정신적 고요', icon: 'spa',            color: '#10B981' },
  { key: 'sensory',  label: '감각의 정화', icon: 'visibility_off', color: '#F59E0B' },
  { key: 'emotional',label: '정서적 지지', icon: 'favorite',       color: '#EC4899' },
  { key: 'social',   label: '사회적 휴식', icon: 'groups',         color: '#8B5CF6' },
  { key: 'nature',   label: '자연과의 연결',icon: 'forest',        color: '#059669' },
  { key: 'creative', label: '창조적 몰입', icon: 'brush',          color: '#F97316' },
];

const DIFFICULTY_LABEL = { easy: '쉬움', medium: '보통', hard: '어려움' };
const DIFFICULTY_COLOR = { easy: 'text-emerald-500 bg-emerald-50', medium: 'text-amber-500 bg-amber-50', hard: 'text-red-500 bg-red-50' };

function ContentCard({ content, onBookmark, isLoggedIn }) {
  const navigate = useNavigate();
  const catInfo = CATEGORIES.find((c) => c.key === content.category) || CATEGORIES[0];

  const handleBookmark = (e) => {
    e.preventDefault();
    if (!isLoggedIn) { navigate('/login'); return; }
    onBookmark(content.id);
  };

  return (
    <Link
      to={`/contents/${content.id}`}
      className="bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 overflow-hidden group flex flex-col"
    >
      {/* 썸네일 */}
      <div
        className="h-40 flex items-center justify-center relative"
        style={{ backgroundColor: `${catInfo.color}15` }}
      >
        <span className="material-icons text-6xl" style={{ color: catInfo.color }}>
          {catInfo.icon}
        </span>
        <button
          onClick={handleBookmark}
          className="absolute top-3 right-3 w-8 h-8 bg-white/80 rounded-full flex items-center justify-center hover:bg-white transition-all"
        >
          <span className="material-icons text-base text-slate-400 hover:text-primary">
            {content.bookmarked ? 'bookmark' : 'bookmark_border'}
          </span>
        </button>
      </div>

      {/* 내용 */}
      <div className="p-4 flex flex-col flex-1">
        <div className="flex items-center gap-2 mb-2">
          <span
            className="text-xs font-bold px-2 py-0.5 rounded-full"
            style={{ backgroundColor: `${catInfo.color}15`, color: catInfo.color }}
          >
            {catInfo.label}
          </span>
          {content.difficulty && (
            <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${DIFFICULTY_COLOR[content.difficulty] || ''}`}>
              {DIFFICULTY_LABEL[content.difficulty] || content.difficulty}
            </span>
          )}
        </div>
        <h3 className="text-sm font-bold text-slate-800 mb-1 line-clamp-2 group-hover:text-primary transition-colors">
          {content.title}
        </h3>
        {content.summary && (
          <p className="text-xs text-slate-400 line-clamp-2 flex-1">{content.summary}</p>
        )}
        <div className="flex items-center gap-3 mt-3 text-xs text-slate-400">
          {content.duration && (
            <span className="flex items-center gap-0.5">
              <span className="material-icons text-xs">schedule</span>
              {content.duration}분
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}

function ContentsList() {
  const navigate = useNavigate();
  const isLoggedIn = !!localStorage.getItem('accessToken');

  const [activeCategory, setActiveCategory] = useState('all');
  const [contents, setContents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (activeCategory === 'recommend') {
      loadRecommend();
    } else {
      loadContents();
    }
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
        setError(data.message || '맞춤 추천을 불러오지 못했어요.');
      }
    } catch {
      setError('서버에 연결할 수 없습니다.');
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
      setContents((prev) =>
        prev.map((c) => c.id === id ? { ...c, bookmarked: !c.bookmarked } : c)
      );
    } catch { /* 무시 */ }
  };

  return (
    <div className="min-h-screen bg-[#F9F7F2]">
      <UserNavbar />

      <main className="max-w-6xl mx-auto px-6 pt-8 pb-24">

        {/* 헤더 */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-slate-800">휴식 콘텐츠</h1>
          <p className="text-sm text-slate-400 mt-1">나에게 맞는 휴식 방법을 찾아보세요</p>
        </div>

        {/* 카테고리 필터 */}
        <div className="flex gap-2 mb-8 flex-wrap">
          {/* 맞춤 탭 — 로그인 사용자만 */}
          {isLoggedIn && (
            <button
              onClick={() => setActiveCategory('recommend')}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-bold transition-all ${
                activeCategory === 'recommend'
                  ? 'bg-primary text-white shadow-sm'
                  : 'bg-white border border-primary text-primary hover:bg-primary/5'
              }`}
            >
              <span className="material-icons text-sm">auto_awesome</span>
              맞춤 추천
            </button>
          )}
          {CATEGORIES.map((cat) => (
            <button
              key={cat.key}
              onClick={() => setActiveCategory(cat.key)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-bold transition-all ${
                activeCategory === cat.key
                  ? 'bg-primary text-white shadow-sm'
                  : 'bg-white border border-slate-200 text-slate-500 hover:border-primary hover:text-primary'
              }`}
            >
              <span className="material-icons text-sm">{cat.icon}</span>
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
            <span className="material-icons text-5xl text-slate-200 mb-3 block">article</span>
            <p className="font-semibold text-slate-500 mb-1">콘텐츠가 없어요</p>
            <p className="text-sm text-slate-400">다른 카테고리를 선택해보세요.</p>
          </div>
        )}

        {/* 콘텐츠 그리드 */}
        {!loading && !error && contents.length > 0 && (
          <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {contents.map((content) => (
              <ContentCard
                key={content.id}
                content={content}
                onBookmark={handleBookmark}
                isLoggedIn={isLoggedIn}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

export default ContentsList;
