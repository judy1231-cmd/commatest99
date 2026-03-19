import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import UserNavbar from '../../../components/user/UserNavbar';
import { fetchWithAuth } from '../../../api/fetchWithAuth';

const CATEGORY_INFO = {
  physical:  { name: '신체의 이완', icon: 'fitness_center', color: '#4CAF82' },
  mental:    { name: '정신적 고요', icon: 'spa',            color: '#5B8DEF' },
  sensory:   { name: '감각의 정화', icon: 'visibility_off', color: '#9B6DFF' },
  emotional: { name: '정서적 지지', icon: 'favorite',       color: '#FF7BAC' },
  social:    { name: '사회적 휴식', icon: 'groups',         color: '#FF9A3C' },
  nature:    { name: '자연의 연결', icon: 'forest',         color: '#2ECC9A' },
  creative:  { name: '창조적 몰입', icon: 'brush',          color: '#FFB830' },
};

const DIFFICULTY_LABEL = { easy: '쉬움', medium: '보통', hard: '어려움' };
const DIFFICULTY_COLOR = {
  easy:   { bg: '#ECFDF5', text: '#10B981' },
  medium: { bg: '#FFFBEB', text: '#F59E0B' },
  hard:   { bg: '#FEF2F2', text: '#EF4444' },
};


function formatDate(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')}`;
}

function ContentsDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isLoggedIn = !!localStorage.getItem('accessToken');
  const [content, setContent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [relatedContents, setRelatedContents] = useState([]);
  const [relatedPlaces, setRelatedPlaces] = useState([]);
  const [placeTab, setPlaceTab] = useState('all');
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [reviews, setReviews] = useState([]);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewText, setReviewText] = useState('');
  const [reviewSubmitting, setReviewSubmitting] = useState(false);
  const placesScrollRef = useRef(null);
  const autoScrollPaused = useRef(false);

  const isDomestic = (address) =>
    ['서울', '경기', '부산', '인천', '대구', '광주', '대전', '울산', '세종',
     '강원', '충청', '전라', '경상', '제주', '대한민국', '충북', '충남',
     '전북', '전남', '경북', '경남']
    .some(k => address?.includes(k));

  const handleRecordClick = () => {
    if (!isLoggedIn) { navigate('/login'); return; }
    navigate('/rest-record', {
      state: {
        fromContents: true,
        contentCategory: content.category,
        contentTitle: content.title,
        contentDuration: content.duration,
      }
    });
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { loadContent(); }, [id]);

  useEffect(() => {
    const el = placesScrollRef.current;
    if (!el) return;
    const interval = setInterval(() => {
      if (autoScrollPaused.current) return;
      const cardWidth = 176 + 12; // w-44(176px) + gap-3(12px)
      if (el.scrollLeft + el.clientWidth >= el.scrollWidth - 1) {
        el.scrollTo({ left: 0, behavior: 'smooth' });
      } else {
        el.scrollBy({ left: cardWidth, behavior: 'smooth' });
      }
    }, 2500);
    return () => clearInterval(interval);
  }, [relatedPlaces]);

  const loadRelated = async (category, currentId) => {
    try {
      const res = await fetch(`/api/contents?category=${category}`);
      const data = await res.json();
      if (data.success && data.data) {
        setRelatedContents(data.data.filter(c => c.id !== currentId).slice(0, 6));
      }
    } catch {
      // 관련 콘텐츠 로드 실패는 무시
    }
  };

  // creative 보조 장소: mental 중 실내 앉아서 활동 가능한 곳만 (카페·도서관·북카페)
  const INDOOR_KEYWORDS = ['카페', '도서관', '북카페', '서점', '책방', '스터디'];

  const loadRelatedPlaces = async (category) => {
    try {
      const [primaryRes, secondaryRes] = await Promise.all([
        fetch(`/api/places?restType=${category}&size=8&status=approved`),
        category === 'creative'
          ? fetch(`/api/places?restType=mental&size=20&status=approved`)
          : Promise.resolve(null),
      ]);

      const primaryData = await primaryRes.json();
      const primaryPlaces = primaryData.success ? (primaryData.data?.places || []) : [];

      let secondaryPlaces = [];
      if (secondaryRes) {
        const secondaryData = await secondaryRes.json();
        const all = secondaryData.success ? (secondaryData.data?.places || []) : [];
        // 실내 앉아서 활동 가능한 장소만 필터
        secondaryPlaces = all.filter(p =>
          INDOOR_KEYWORDS.some(k => p.name?.includes(k))
        );
      }

      // 합치고 중복 제거 (id 기준), 최대 8개
      const seen = new Set();
      const merged = [...primaryPlaces, ...secondaryPlaces].filter(p => {
        if (seen.has(p.id)) return false;
        seen.add(p.id);
        return true;
      }).slice(0, 8);

      setRelatedPlaces(merged);
    } catch {
      // 장소 로드 실패는 무시
    }
  };

  const loadContent = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('accessToken');
      const res = await fetch(`/api/contents/${id}`, {
        headers: token ? { 'Authorization': `Bearer ${token}` } : {},
      });
      const data = await res.json();
      if (data.success && data.data) {
        setContent(data.data);
        setLiked(data.data.liked || false);
        setLikeCount(data.data.likeCount || 0);
        loadRelated(data.data.category, Number(id));
        loadRelatedPlaces(data.data.category);
        loadReviews();
      } else {
        setError('콘텐츠를 찾을 수 없어요.');
      }
    } catch {
      setError('콘텐츠를 불러오지 못했어요.');
    } finally {
      setLoading(false);
    }
  };

  const loadReviews = async () => {
    try {
      const res = await fetch(`/api/contents/${id}/reviews`);
      const data = await res.json();
      if (data.success) setReviews(data.data);
    } catch { /* 무시 */ }
  };

  const handleToggleLike = async () => {
    if (!isLoggedIn) { navigate('/login'); return; }
    try {
      const data = await fetchWithAuth(`/api/contents/${id}/like`, { method: 'POST' });
      if (data.success) {
        setLiked(data.data.liked);
        setLikeCount(data.data.likeCount);
      }
    } catch { /* 무시 */ }
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!isLoggedIn) { navigate('/login'); return; }
    setReviewSubmitting(true);
    try {
      const data = await fetchWithAuth(`/api/contents/${id}/reviews`, {
        method: 'POST',
        body: JSON.stringify({ rating: reviewRating, body: reviewText }),
      });
      if (data.success) {
        setReviewText('');
        setReviewRating(5);
        loadReviews();
      }
    } catch { /* 무시 */ } finally {
      setReviewSubmitting(false);
    }
  };

  const handleDeleteReview = async (reviewId) => {
    try {
      await fetchWithAuth(`/api/contents/${id}/reviews/${reviewId}`, { method: 'DELETE' });
      loadReviews();
    } catch { /* 무시 */ }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F7F7F8]">
        <UserNavbar />
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
        </div>
      </div>
    );
  }

  if (error || !content) {
    return (
      <div className="min-h-screen bg-[#F7F7F8]">
        <UserNavbar />
        <main className="max-w-2xl mx-auto px-4 pt-16 text-center">
          <span className="material-icons text-5xl text-slate-200 mb-4 block">article</span>
          <p className="font-semibold text-slate-500 mb-1">콘텐츠를 찾을 수 없어요</p>
          <p className="text-sm text-slate-400 mb-6">{error}</p>
          <button
            onClick={() => navigate('/contents')}
            className="px-6 py-3 bg-primary text-white font-bold rounded-xl hover:bg-primary/90 transition-all"
          >
            콘텐츠 목록으로
          </button>
        </main>
      </div>
    );
  }

  const cat = CATEGORY_INFO[content.category] || CATEGORY_INFO.mental;
  const tags = content.tags || [];
  const diff = content.difficulty ? DIFFICULTY_COLOR[content.difficulty] : null;

  return (
    <div className="min-h-screen bg-[#F7F7F8]">
      <UserNavbar />

      <main className="max-w-2xl mx-auto px-4 pt-5 pb-28">

        {/* 뒤로가기 */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-1 text-sm text-slate-400 hover:text-primary transition-colors mb-4"
        >
          <span className="material-icons text-base">arrow_back</span>
          콘텐츠 목록
        </button>

        {/* 히어로 영역 */}
        <div className="rounded-2xl overflow-hidden mb-4 relative"
          style={{ background: `linear-gradient(135deg, ${cat.color}22 0%, ${cat.color}0d 100%)` }}
        >
          {/* 실사진 */}
          {content.imageUrl && (
            <img
              src={content.imageUrl}
              alt={content.title}
              className="w-full h-72 object-cover"
              onError={(e) => { e.target.style.display = 'none'; }}
            />
          )}
          {/* 사진 없을 때 배경 아이콘 */}
          {!content.imageUrl && (
            <span
              className="material-icons absolute right-5 top-1/2 -translate-y-1/2 opacity-[0.12] pointer-events-none select-none"
              style={{ fontSize: '96px', color: cat.color }}
            >
              {cat.icon}
            </span>
          )}

          <div className="relative z-10 px-6 py-7">
            {/* 카테고리 배지 */}
            <span
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold mb-4"
              style={{ backgroundColor: `${cat.color}25`, color: cat.color }}
            >
              <span className="material-icons" style={{ fontSize: '13px' }}>{cat.icon}</span>
              {cat.name}
            </span>

            {/* 제목 */}
            <h1 className="text-[22px] font-extrabold tracking-tight text-slate-800 leading-snug mb-4 pr-16">
              {content.title}
            </h1>

            {/* 메타 정보 */}
            <div className="flex flex-wrap items-center gap-2">
              {diff && content.difficulty && (
                <span
                  className="text-[11px] font-bold px-2.5 py-0.5 rounded-full"
                  style={{ backgroundColor: diff.bg, color: diff.text }}
                >
                  {DIFFICULTY_LABEL[content.difficulty]}
                </span>
              )}
              {content.duration && (
                <span className="flex items-center gap-1 text-xs text-slate-500 font-medium">
                  <span className="material-icons text-xs text-slate-400">schedule</span>
                  {content.duration}분 소요
                </span>
              )}
              {content.createdAt && (
                <span className="text-xs text-slate-400">{formatDate(content.createdAt)}</span>
              )}
            </div>
          </div>
        </div>

        {/* 요약 인용 박스 */}
        {content.summary && (
          <div
            className="flex gap-3 rounded-2xl px-5 py-4 mb-4 border-l-4"
            style={{
              backgroundColor: `${cat.color}0d`,
              borderLeftColor: cat.color,
            }}
          >
            <span
              className="material-icons text-base shrink-0 mt-0.5"
              style={{ color: cat.color }}
            >
              format_quote
            </span>
            <p
              className="text-sm font-medium leading-relaxed"
              style={{ color: cat.color }}
            >
              {content.summary}
            </p>
          </div>
        )}

        {/* 본문 */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm px-6 py-6 mb-4">
          <p className="text-[15px] text-slate-700 leading-[1.95] whitespace-pre-line">
            {content.body || content.guideContent || '본문 내용이 없습니다.'}
          </p>
        </div>

        {/* 태그 */}
        {tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-5">
            {tags.map((tag, i) => (
              <span
                key={i}
                className="px-3 py-1 bg-white border border-slate-200 text-slate-500 text-xs font-semibold rounded-full"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}

        {/* 좋아요 */}
        <div className="flex items-center justify-center my-5">
          <button
            onClick={handleToggleLike}
            className={`flex items-center gap-2 px-6 py-3 rounded-2xl border-2 font-bold text-sm transition-all duration-200 ${
              liked
                ? 'bg-rose-50 border-rose-300 text-rose-500'
                : 'bg-white border-slate-200 text-slate-400 hover:border-rose-300 hover:text-rose-400'
            }`}
          >
            <span className="material-icons text-[20px]">{liked ? 'favorite' : 'favorite_border'}</span>
            도움이 됐어요 {likeCount > 0 && <span className="font-extrabold">{likeCount}</span>}
          </button>
        </div>

        {/* 후기 섹션 */}
        <div className="mb-5">
          <p className="text-sm font-extrabold text-slate-700 mb-3 px-0.5">후기</p>

          {/* 후기 작성 폼 */}
          {isLoggedIn ? (
            <form onSubmit={handleSubmitReview} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 mb-4">
              {/* 별점 */}
              <div className="flex items-center gap-1 mb-3">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setReviewRating(star)}
                    className="transition-transform hover:scale-110"
                  >
                    <span className="material-icons text-[22px]" style={{ color: star <= reviewRating ? '#F59E0B' : '#E2E8F0' }}>
                      star
                    </span>
                  </button>
                ))}
                <span className="text-xs text-slate-400 ml-1">{reviewRating}점</span>
              </div>
              <textarea
                value={reviewText}
                onChange={(e) => setReviewText(e.target.value)}
                placeholder="이 활동을 해보셨나요? 솔직한 후기를 남겨주세요."
                rows={3}
                className="w-full text-sm border border-slate-200 rounded-xl px-3 py-2.5 bg-slate-50 resize-none focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
              />
              <button
                type="submit"
                disabled={reviewSubmitting || !reviewText.trim()}
                className="mt-2 w-full py-2.5 bg-primary text-white font-bold text-sm rounded-xl hover:bg-primary/90 transition-all disabled:opacity-40"
              >
                {reviewSubmitting ? '등록 중...' : '후기 등록'}
              </button>
            </form>
          ) : (
            <div className="bg-slate-50 rounded-2xl border border-slate-100 p-4 mb-4 text-center">
              <p className="text-sm text-slate-400 mb-2">로그인하면 후기를 남길 수 있어요</p>
              <Link to="/login" className="text-sm font-bold text-primary hover:underline">로그인하기</Link>
            </div>
          )}

          {/* 후기 목록 */}
          {reviews.length === 0 ? (
            <p className="text-sm text-slate-400 text-center py-4">아직 후기가 없어요. 첫 번째 후기를 남겨보세요!</p>
          ) : (
            <div className="space-y-3">
              {reviews.map((review) => {
                const myNickname = JSON.parse(localStorage.getItem('user') || '{}').nickname;
                const isMine = myNickname && review.nickname === myNickname;
                return (
                  <div key={review.id} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-700">{review.nickname || '익명'}</span>
                        <div className="flex items-center gap-0.5">
                          {[1,2,3,4,5].map(s => (
                            <span key={s} className="material-icons text-[13px]"
                              style={{ color: s <= review.rating ? '#F59E0B' : '#E2E8F0' }}>star</span>
                          ))}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] text-slate-400">
                          {review.createdAt ? new Date(review.createdAt).toLocaleDateString('ko-KR') : ''}
                        </span>
                        {isMine && (
                          <button
                            onClick={() => handleDeleteReview(review.id)}
                            className="text-[11px] text-slate-300 hover:text-rose-400 transition-colors"
                          >
                            삭제
                          </button>
                        )}
                      </div>
                    </div>
                    {review.body && <p className="text-sm text-slate-600 leading-relaxed">{review.body}</p>}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* 이 활동을 할 수 있는 장소 */}
        {relatedPlaces.length > 0 && (
          <div className="mb-5">
            {/* 헤더: 제목 + 탭 + 지도 링크 */}
            <div className="flex items-center justify-between mb-3 px-0.5">
              <div className="flex items-center gap-2">
                <p className="text-sm font-extrabold text-slate-700">이 활동을 할 수 있는 장소</p>
                <div className="flex gap-1">
                  {[{ key: 'all', label: '전체' }, { key: 'domestic', label: '국내' }, { key: 'foreign', label: '해외' }].map(tab => (
                    <button
                      key={tab.key}
                      onClick={() => setPlaceTab(tab.key)}
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full transition-colors ${
                        placeTab === tab.key
                          ? 'bg-primary text-white'
                          : 'bg-slate-100 text-slate-400 hover:bg-slate-200'
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>
              </div>
              <Link
                to="/map"
                state={{ restType: content.category, locationTab: placeTab === 'all' ? 'all' : placeTab }}
                className="text-xs text-slate-400 hover:text-primary transition-colors"
              >
                지도에서 보기
              </Link>
            </div>
            <div
              ref={placesScrollRef}
              className="flex gap-3 overflow-x-auto pb-1"
              style={{ scrollbarWidth: 'none' }}
              onMouseEnter={() => { autoScrollPaused.current = true; }}
              onMouseLeave={() => { autoScrollPaused.current = false; }}
            >
              {relatedPlaces
                .filter(p =>
                  placeTab === 'all' ? true :
                  placeTab === 'domestic' ? isDomestic(p.address) :
                  !isDomestic(p.address)
                )
                .map((place) => (
                <Link
                  key={place.id}
                  to={`/places/${place.id}`}
                  className="group shrink-0 w-44 bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden hover:shadow-md hover:border-slate-200 transition-all"
                >
                  {/* 썸네일 */}
                  <div className="h-24 overflow-hidden bg-slate-100">
                    {place.photoUrl ? (
                      <img
                        src={place.photoUrl}
                        alt={place.name}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                        onError={(e) => { e.target.style.display = 'none'; }}
                      />
                    ) : (
                      <div
                        className="h-full flex items-center justify-center"
                        style={{ backgroundColor: `${cat.color}15` }}
                      >
                        <span className="material-icons text-3xl opacity-50" style={{ color: cat.color }}>
                          location_on
                        </span>
                      </div>
                    )}
                  </div>
                  {/* 정보 */}
                  <div className="px-3 py-2.5">
                    <p className="text-xs font-bold text-slate-800 truncate mb-0.5">{place.name}</p>
                    <p className="text-[11px] text-slate-400 truncate">{place.address}</p>
                    {place.aiScore != null && (
                      <div className="flex items-center gap-0.5 mt-1">
                        <span className="material-icons text-amber-400 text-[11px]">star</span>
                        <span className="text-[11px] font-bold text-slate-500">{place.aiScore.toFixed(1)}</span>
                      </div>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* 관련 콘텐츠 */}
        <div className="mb-2">
          <div className="flex items-center justify-between mb-3 px-0.5">
            <p className="text-sm font-extrabold text-slate-700">관련 콘텐츠</p>
            <Link to="/contents" className="text-xs text-slate-400 hover:text-primary transition-colors">
              더보기
            </Link>
          </div>

          {/* 가로 스크롤 카드 */}
          <div
            className="flex gap-3 overflow-x-auto pb-1"
            style={{ scrollbarWidth: 'none' }}
          >
            {relatedContents.length === 0 && (
              <p className="text-sm text-slate-400 py-2">관련 콘텐츠가 없어요.</p>
            )}
            {relatedContents.map((item) => (
              <Link
                key={item.id}
                to={`/contents/${item.id}`}
                className="shrink-0 w-40 bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden hover:shadow-md transition-all"
              >
                {/* 썸네일 */}
                {item.imageUrl ? (
                  <img
                    src={item.imageUrl}
                    alt={item.title}
                    className="w-full h-28 object-cover"
                    onError={(e) => { e.target.style.display = 'none'; }}
                  />
                ) : (
                  <div
                    className="h-28 flex items-center justify-center"
                    style={{ backgroundColor: `${cat.color}15` }}
                  >
                    <span
                      className="material-icons text-3xl opacity-70"
                      style={{ color: cat.color }}
                    >
                      {cat.icon}
                    </span>
                  </div>
                )}
                {/* 텍스트 */}
                <div className="px-3 py-2.5">
                  <p className="text-xs font-bold text-slate-800 line-clamp-2 leading-snug mb-1">
                    {item.title}
                  </p>
                  <p className="text-[11px] text-slate-400">
                    {cat.name}{item.duration ? ` · ${item.duration}분` : ''}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>

      </main>

      {/* 하단 고정 버튼 */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-100 px-4 py-4 max-w-2xl mx-auto">
        <button
          onClick={handleRecordClick}
          className="w-full bg-primary text-white font-bold py-4 rounded-2xl hover:bg-primary/90 transition-all shadow-lg shadow-emerald-100 flex items-center justify-center gap-2"
        >
          <span className="material-icons text-base">edit_note</span>
          이 콘텐츠로 휴식 기록하기
          {!isLoggedIn && <span className="material-icons text-sm opacity-70">lock</span>}
        </button>
      </div>
    </div>
  );
}

export default ContentsDetail;
