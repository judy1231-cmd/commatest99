import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { fetchWithAuth } from '../../api/fetchWithAuth';
import Toast from '../../components/common/Toast';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

const REST_TYPE_INFO = {
  physical:  { label: '신체적 이완', icon: 'fitness_center', color: '#4CAF82', path: '/rest/physical',
               heroImg: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&w=900&q=80',
               difficulty: '보통', conditions: ['운동복 착용 권장', '준비운동 필수', '신체 활동 포함'] },
  mental:    { label: '정신적 고요', icon: 'spa',            color: '#5B8DEF', path: '/rest/mental',
               heroImg: 'https://images.pexels.com/photos/1578750/pexels-photo-1578750.jpeg?auto=compress&cs=tinysrgb&w=900',
               difficulty: '쉬움', conditions: ['조용한 환경', '혼자 방문 추천', '명상/호흡 가능'] },
  sensory:   { label: '감각의 정화', icon: 'visibility_off', color: '#9B6DFF', path: '/rest/sensory',
               heroImg: 'https://images.pexels.com/photos/3997943/pexels-photo-3997943.jpeg?auto=compress&cs=tinysrgb&w=900',
               difficulty: '쉬움', conditions: ['감각 자극 최소화', '편안한 복장', '소음 차단 가능'] },
  emotional: { label: '정서적 지지', icon: 'favorite',       color: '#FF7BAC', path: '/rest/emotional',
               heroImg: 'https://images.unsplash.com/photo-1474552226712-ac0f0961a954?auto=format&fit=crop&w=900&q=80',
               difficulty: '쉬움', conditions: ['감정 회복 중점', '편안한 분위기', '동반자 가능'] },
  social:    { label: '사회적 휴식', icon: 'groups',         color: '#FF9A3C', path: '/rest/social',
               heroImg: 'https://images.pexels.com/photos/1370295/pexels-photo-1370295.jpeg?auto=compress&cs=tinysrgb&w=900',
               difficulty: '쉬움', conditions: ['동반자 권장', '대화 친화적', '가벼운 복장'] },
  nature:    { label: '자연의 연결', icon: 'forest',         color: '#2ECC9A', path: '/rest/nature',
               heroImg: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&w=900&q=80',
               difficulty: '보통', conditions: ['야외 활동', '편한 신발 필수', '날씨 확인 권장'] },
  creative:  { label: '창조적 몰입', icon: 'brush',          color: '#FFB830', path: '/rest/creative',
               heroImg: 'https://images.unsplash.com/photo-1513364776144-60967b0f800f?auto=format&fit=crop&w=900&q=80',
               difficulty: '보통', conditions: ['창작 도구 필요', '집중 시간 확보', '자유로운 표현'] },
};

const DIFFICULTY_STYLE = {
  '쉬움':  { bg: 'bg-emerald-50', text: 'text-emerald-600', icon: 'sentiment_very_satisfied' },
  '보통':  { bg: 'bg-amber-50',   text: 'text-amber-600',   icon: 'sentiment_neutral' },
  '어려움':{ bg: 'bg-rose-50',    text: 'text-rose-600',    icon: 'sentiment_dissatisfied' },
};

function StarRating({ rating, onRate }) {
  const [hover, setHover] = useState(0);
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map(star => (
        <button
          key={star}
          onClick={() => onRate(star)}
          onMouseEnter={() => setHover(star)}
          onMouseLeave={() => setHover(0)}
        >
          <span className={`material-icons text-xl ${(hover || rating) >= star ? 'text-amber-400' : 'text-slate-200'}`}>
            star
          </span>
        </button>
      ))}
    </div>
  );
}

function PlaceDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isLoggedIn = !!localStorage.getItem('accessToken');
  const my쉼표번호 = (() => {
    try { return JSON.parse(localStorage.getItem('user') || '{}').쉼표번호; }
    catch { return null; }
  })();

  const [place, setPlace]           = useState(null);
  const [tags, setTags]             = useState([]);
  const [reviews, setReviews]       = useState([]);
  const [bookmarked, setBookmarked] = useState(false);
  const [loading, setLoading]       = useState(true);
  const [toast, setToast]           = useState({ message: '', type: 'success' });

  const [reviewRating, setReviewRating]   = useState(0);
  const [reviewContent, setReviewContent] = useState('');
  const [submitting, setSubmitting]       = useState(false);

  // 수정 상태
  const [editingId, setEditingId]           = useState(null);
  const [editRating, setEditRating]         = useState(0);
  const [editContent, setEditContent]       = useState('');
  const [editSubmitting, setEditSubmitting] = useState(false);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { loadDetail(); }, [id]);

  const loadDetail = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/places/${id}`);
      const data = await res.json();
      if (data.success && data.data) {
        setPlace(data.data.place);
        setTags(data.data.tags || []);
        setReviews(data.data.reviews || []);
      } else {
        navigate('/map');
      }
    } catch {
      navigate('/map');
    } finally {
      setLoading(false);
    }
  };

  const handleBookmark = async () => {
    if (!isLoggedIn) {
      setToast({ message: '로그인이 필요해요', type: 'error' });
      return;
    }
    try {
      const data = await fetchWithAuth(`/api/places/${id}/bookmark`, { method: 'POST' });
      if (data.success) {
        setBookmarked(data.data.bookmarked);
        setToast({ message: data.data.bookmarked ? '북마크에 추가됐어요' : '북마크를 해제했어요', type: 'success' });
      }
    } catch {
      setToast({ message: '북마크 처리에 실패했어요', type: 'error' });
    }
  };

  const handleReviewSubmit = async () => {
    if (!isLoggedIn) { setToast({ message: '로그인이 필요해요', type: 'error' }); return; }
    if (reviewRating === 0) { setToast({ message: '별점을 선택해주세요', type: 'error' }); return; }
    if (!reviewContent.trim()) { setToast({ message: '리뷰 내용을 입력해주세요', type: 'error' }); return; }
    setSubmitting(true);
    try {
      const data = await fetchWithAuth(`/api/places/${id}/reviews`, {
        method: 'POST',
        body: JSON.stringify({ rating: reviewRating, content: reviewContent.trim() }),
      });
      if (data.success) {
        setReviews(prev => [data.data, ...prev]);
        setReviewRating(0);
        setReviewContent('');
        setToast({ message: '리뷰가 등록됐어요!', type: 'success' });
      } else {
        setToast({ message: data.message || '리뷰 등록에 실패했어요', type: 'error' });
      }
    } catch {
      setToast({ message: '리뷰 등록에 실패했어요', type: 'error' });
    } finally {
      setSubmitting(false);
    }
  };

  const startEdit = (review) => {
    setEditingId(review.id);
    setEditRating(review.rating);
    setEditContent(review.content);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditRating(0);
    setEditContent('');
  };

  const handleEditSubmit = async (reviewId) => {
    if (editRating === 0) { setToast({ message: '별점을 선택해주세요', type: 'error' }); return; }
    if (!editContent.trim()) { setToast({ message: '내용을 입력해주세요', type: 'error' }); return; }
    setEditSubmitting(true);
    try {
      const data = await fetchWithAuth(`/api/places/${id}/reviews/${reviewId}`, {
        method: 'PUT',
        body: JSON.stringify({ rating: editRating, content: editContent.trim() }),
      });
      if (data.success) {
        setReviews(prev => prev.map(r => r.id === reviewId ? { ...r, rating: editRating, content: editContent.trim() } : r));
        cancelEdit();
        setToast({ message: '리뷰가 수정됐어요', type: 'success' });
      } else {
        setToast({ message: data.message || '수정에 실패했어요', type: 'error' });
      }
    } catch {
      setToast({ message: '수정에 실패했어요', type: 'error' });
    } finally {
      setEditSubmitting(false);
    }
  };

  const handleDeleteReview = async (reviewId) => {
    if (!window.confirm('리뷰를 삭제할까요?')) return;
    try {
      const data = await fetchWithAuth(`/api/places/${id}/reviews/${reviewId}`, { method: 'DELETE' });
      if (data.success) {
        setReviews(prev => prev.filter(r => r.id !== reviewId));
        setToast({ message: '리뷰가 삭제됐어요', type: 'success' });
      } else {
        setToast({ message: data.message || '삭제에 실패했어요', type: 'error' });
      }
    } catch {
      setToast({ message: '삭제에 실패했어요', type: 'error' });
    }
  };

  /* ── 로딩 ── */
  if (loading) {
    return (
      <div className="min-h-screen bg-[#F7F7F8] flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  if (!place) return null;

  const avgRating = reviews.length
    ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1)
    : null;

  const restTypeTags = [...new Set(tags.map(t => t.restType).filter(Boolean))];
  const heroTypeInfo = restTypeTags.length > 0 ? REST_TYPE_INFO[restTypeTags[0]] : null;
  const heroColor    = heroTypeInfo?.color || '#10B981';
  const heroImg      = heroTypeInfo?.heroImg || null;
  const difficulty   = heroTypeInfo?.difficulty || null;
  const diffStyle    = difficulty ? DIFFICULTY_STYLE[difficulty] : null;
  const conditions   = heroTypeInfo?.conditions || [];

  return (
    <div className="min-h-screen bg-[#F7F7F8] pb-28">

      {/* ===== 히어로 영역 ===== */}
      <div
        className="relative w-full"
        style={{ height: '260px' }}
      >
        {/* 배경 이미지 or 그라디언트 */}
        {heroImg ? (
          <img
            src={heroImg}
            alt={heroTypeInfo?.label}
            className="absolute inset-0 w-full h-full object-cover"
          />
        ) : null}
        {/* 오버레이 — 이미지 있으면 다크 그라디언트만, 없으면 색상 그라디언트 */}
        <div
          className="absolute inset-0"
          style={{
            background: heroImg
              ? 'linear-gradient(to bottom, rgba(0,0,0,0.15) 0%, rgba(0,0,0,0.55) 100%)'
              : `linear-gradient(145deg, ${heroColor}ee 0%, ${heroColor}99 60%, ${heroColor}55 100%)`,
          }}
        />

        {/* 뒤로가기 */}
        <button
          onClick={() => navigate(-1)}
          className="absolute top-5 left-4 w-9 h-9 bg-black/30 backdrop-blur-sm rounded-full flex items-center justify-center transition-all hover:bg-black/40 z-10"
        >
          <span className="material-icons text-white text-xl">arrow_back</span>
        </button>

        {/* 북마크 */}
        <button
          onClick={handleBookmark}
          className="absolute top-5 right-4 w-9 h-9 bg-black/30 backdrop-blur-sm rounded-full flex items-center justify-center transition-all hover:bg-black/40 z-10"
        >
          <span className={`material-icons text-xl ${bookmarked ? 'text-amber-300' : 'text-white'}`}>
            {bookmarked ? 'bookmark' : 'bookmark_border'}
          </span>
        </button>

        {/* 장소명 + 카테고리 칩 */}
        <div className="absolute bottom-0 left-0 right-0 px-5 pb-5 pt-10 bg-gradient-to-t from-black/50 to-transparent z-10">
          <div className="flex flex-wrap gap-1.5 mb-2">
            {restTypeTags.slice(0, 3).map(type => {
              const info = REST_TYPE_INFO[type];
              if (!info) return null;
              return (
                <span
                  key={type}
                  className="flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full bg-white/25 text-white backdrop-blur-sm"
                >
                  <span className="material-icons" style={{ fontSize: '11px' }}>{info.icon}</span>
                  {info.label}
                </span>
              );
            })}
          </div>
          <h1 className="text-[24px] font-extrabold text-white leading-tight drop-shadow-sm">
            {place.name}
          </h1>
        </div>
      </div>

      {/* ===== 기본 정보 카드 ===== */}
      <div className="bg-white rounded-b-3xl px-5 pt-5 pb-6 mb-2 shadow-sm">

        {/* 점수 배지 행 */}
        <div className="flex items-center gap-3 flex-wrap mb-5">
          {place.aiScore && (
            <div className="flex items-center gap-1.5 bg-amber-50 px-3 py-1.5 rounded-full">
              <span className="material-icons text-amber-400 text-sm">auto_awesome</span>
              <span className="text-xs font-extrabold text-amber-600">AI {Number(place.aiScore).toFixed(1)}</span>
            </div>
          )}
          {avgRating ? (
            <div className="flex items-center gap-1.5 bg-slate-50 px-3 py-1.5 rounded-full">
              <div className="flex gap-0.5">
                {[1, 2, 3, 4, 5].map(s => (
                  <span key={s} className={`material-icons text-xs ${parseFloat(avgRating) >= s ? 'text-amber-400' : 'text-slate-200'}`}>
                    star
                  </span>
                ))}
              </div>
              <span className="text-xs font-extrabold text-slate-600">{avgRating}</span>
              <span className="text-xs text-slate-400">({reviews.length})</span>
            </div>
          ) : (
            <span className="text-xs text-slate-400">아직 리뷰가 없어요</span>
          )}
          {/* 난이도 배지 (#9) */}
          {difficulty && diffStyle && (
            <div className={`flex items-center gap-1.5 ${diffStyle.bg} px-3 py-1.5 rounded-full`}>
              <span className={`material-icons text-sm ${diffStyle.text}`}>{diffStyle.icon}</span>
              <span className={`text-xs font-extrabold ${diffStyle.text}`}>난이도 {difficulty}</span>
            </div>
          )}
        </div>

        {/* 정보 리스트 */}
        <div className="space-y-3.5">
          <div className="flex items-start gap-3.5">
            <div className="w-8 h-8 rounded-xl bg-slate-50 flex items-center justify-center shrink-0">
              <span className="material-icons text-slate-400 text-base">location_on</span>
            </div>
            <div className="flex-1 pt-1">
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">주소</p>
              <p className="text-sm text-slate-700 leading-relaxed">{place.address}</p>
            </div>
          </div>

          {place.operatingHours && (
            <div className="flex items-start gap-3.5">
              <div className="w-8 h-8 rounded-xl bg-slate-50 flex items-center justify-center shrink-0">
                <span className="material-icons text-slate-400 text-base">schedule</span>
              </div>
              <div className="flex-1 pt-1">
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">운영시간</p>
                <p className="text-sm text-slate-700">{place.operatingHours}</p>
              </div>
            </div>
          )}

          {/* 이용 조건 (#9) */}
          {conditions.length > 0 && (
            <div className="flex items-start gap-3.5">
              <div className="w-8 h-8 rounded-xl bg-slate-50 flex items-center justify-center shrink-0">
                <span className="material-icons text-slate-400 text-base">checklist</span>
              </div>
              <div className="flex-1 pt-1">
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">이용 조건</p>
                <div className="flex flex-wrap gap-1.5">
                  {conditions.map((c, i) => (
                    <span key={i} className="text-xs bg-slate-50 text-slate-600 px-2.5 py-1 rounded-full border border-slate-100">
                      {c}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ===== 추천 휴식 유형 ===== */}
      {restTypeTags.length > 0 && (
        <div className="bg-white px-5 py-5 mb-2 shadow-sm">
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-3">추천 휴식 유형</p>
          <div className="flex flex-wrap gap-2">
            {restTypeTags.map(type => {
              const info = REST_TYPE_INFO[type];
              if (!info) return null;
              return (
                <Link
                  key={type}
                  to={info.path}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all hover:opacity-80"
                  style={{ backgroundColor: `${info.color}15`, color: info.color }}
                >
                  <span className="material-icons" style={{ fontSize: '13px' }}>{info.icon}</span>
                  {info.label}
                  <span className="material-icons" style={{ fontSize: '11px' }}>arrow_forward</span>
                </Link>
              );
            })}
          </div>
        </div>
      )}

      {/* ===== 미니 지도 (#5 — 크기 키움) ===== */}
      {place.latitude && place.longitude && (
        <div className="mb-2 overflow-hidden shadow-sm" style={{ height: '300px' }}>
          <MapContainer
            center={[place.latitude, place.longitude]}
            zoom={15}
            style={{ width: '100%', height: '100%' }}
            zoomControl={true}
          >
            <TileLayer
              attribution='&copy; OpenStreetMap'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <Marker position={[place.latitude, place.longitude]}>
              <Popup>{place.name}</Popup>
            </Marker>
          </MapContainer>
        </div>
      )}

      {/* ===== 리뷰 작성 ===== */}
      <div className="bg-white px-5 py-5 mb-2 shadow-sm">
        <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-4">리뷰 작성</p>

        {isLoggedIn ? (
          <div>
            <div className="flex items-center gap-3 mb-3">
              <StarRating rating={reviewRating} onRate={setReviewRating} />
              {reviewRating > 0 && (
                <span className="text-xs font-bold text-amber-500">{reviewRating}점</span>
              )}
            </div>
            <textarea
              value={reviewContent}
              onChange={e => setReviewContent(e.target.value)}
              placeholder="이 장소에서의 휴식 경험을 나눠주세요"
              rows={3}
              className="w-full px-4 py-3 rounded-2xl border border-slate-100 bg-slate-50 text-sm text-slate-700 placeholder:text-slate-300 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none resize-none transition-all"
            />
            <button
              onClick={handleReviewSubmit}
              disabled={submitting}
              className="mt-3 w-full bg-primary text-white font-bold py-3.5 rounded-2xl shadow-lg shadow-emerald-100 hover:bg-primary/90 transition-all disabled:opacity-50"
            >
              {submitting ? '등록 중...' : '리뷰 등록'}
            </button>
          </div>
        ) : (
          <div className="flex items-center justify-between px-4 py-3.5 bg-slate-50 rounded-2xl">
            <p className="text-sm text-slate-500">로그인하면 리뷰를 남길 수 있어요</p>
            <Link to="/login" className="text-sm font-bold text-primary">로그인</Link>
          </div>
        )}
      </div>

      {/* ===== 리뷰 목록 ===== */}
      <div className="bg-white px-5 py-5 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">
            리뷰 {reviews.length}개
          </p>
          {avgRating && (
            <div className="flex items-center gap-1">
              <span className="material-icons text-amber-400 text-base">star</span>
              <span className="text-sm font-extrabold text-slate-700">{avgRating}</span>
            </div>
          )}
        </div>

        {reviews.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 text-slate-300">
            <span className="material-icons text-4xl mb-2">rate_review</span>
            <p className="text-sm font-medium text-slate-400">아직 리뷰가 없어요</p>
            <p className="text-xs mt-1">첫 번째 리뷰를 남겨보세요!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {reviews.map((review, i) => {
              const isOwner = my쉼표번호 && review.쉼표번호 === my쉼표번호;
              const isEditing = editingId === review.id;

              return (
                <div key={review.id || i} className="p-4 bg-slate-50 rounded-2xl">
                  {isEditing ? (
                    /* 수정 폼 */
                    <div>
                      <div className="flex items-center gap-3 mb-3">
                        <StarRating rating={editRating} onRate={setEditRating} />
                        {editRating > 0 && (
                          <span className="text-xs font-bold text-amber-500">{editRating}점</span>
                        )}
                      </div>
                      <textarea
                        value={editContent}
                        onChange={e => setEditContent(e.target.value)}
                        rows={3}
                        className="w-full px-4 py-3 rounded-2xl border border-slate-200 bg-white text-sm text-slate-700 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none resize-none transition-all"
                      />
                      <div className="flex gap-2 mt-2">
                        <button
                          onClick={() => handleEditSubmit(review.id)}
                          disabled={editSubmitting}
                          className="flex-1 bg-primary text-white font-bold py-2.5 rounded-xl text-sm hover:bg-primary/90 disabled:opacity-50"
                        >
                          {editSubmitting ? '저장 중...' : '저장'}
                        </button>
                        <button
                          onClick={cancelEdit}
                          className="flex-1 bg-slate-100 text-slate-600 font-bold py-2.5 rounded-xl text-sm hover:bg-slate-200"
                        >
                          취소
                        </button>
                      </div>
                    </div>
                  ) : (
                    /* 리뷰 카드 */
                    <>
                      <div className="flex items-center gap-2 mb-2">
                        <div className="flex gap-0.5">
                          {[1, 2, 3, 4, 5].map(s => (
                            <span key={s} className={`material-icons text-sm ${review.rating >= s ? 'text-amber-400' : 'text-slate-200'}`}>
                              star
                            </span>
                          ))}
                        </div>
                        {review.verified && (
                          <span className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded-full font-bold">인증</span>
                        )}
                        <span className="text-[12px] font-semibold text-slate-500 ml-1">
                          {review.nickname || '익명'}
                        </span>
                        {review.createdAt && (
                          <span className="text-[11px] text-slate-400 ml-auto">
                            {new Date(review.createdAt).toLocaleDateString('ko-KR')}
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-slate-700 leading-relaxed">{review.content}</p>

                      {/* 본인 리뷰 수정/삭제 버튼 */}
                      {isOwner && (
                        <div className="flex gap-2 mt-3">
                          <button
                            onClick={() => startEdit(review)}
                            className="flex items-center gap-1 text-xs text-slate-500 hover:text-primary transition-colors px-2 py-1 rounded-lg hover:bg-primary/5"
                          >
                            <span className="material-icons text-sm">edit</span>
                            수정
                          </button>
                          <button
                            onClick={() => handleDeleteReview(review.id)}
                            className="flex items-center gap-1 text-xs text-slate-500 hover:text-rose-500 transition-colors px-2 py-1 rounded-lg hover:bg-rose-50"
                          >
                            <span className="material-icons text-sm">delete</span>
                            삭제
                          </button>
                        </div>
                      )}
                    </>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ===== 하단 고정 버튼 ===== */}
      <div className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-sm border-t border-slate-100 px-5 py-4 z-50">
        <div className="flex gap-3 max-w-2xl mx-auto">
          {place.latitude && place.longitude && (
            <a
              href={`https://www.google.com/maps/dir/?api=1&destination=${place.latitude},${place.longitude}`}
              target="_blank"
              rel="noreferrer"
              className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-2xl border-2 border-primary text-primary font-bold text-sm hover:bg-primary/5 transition-colors"
            >
              <span className="material-icons text-base">directions</span>
              길찾기
            </a>
          )}
          <button
            onClick={handleBookmark}
            className={`flex-1 flex items-center justify-center gap-2 py-3.5 rounded-2xl font-bold text-sm transition-all ${
              bookmarked
                ? 'bg-amber-400 text-white shadow-lg shadow-amber-100'
                : 'bg-primary text-white shadow-lg shadow-emerald-100 hover:bg-primary/90'
            }`}
          >
            <span className="material-icons text-base">{bookmarked ? 'bookmark' : 'bookmark_border'}</span>
            {bookmarked ? '저장됨' : '저장하기'}
          </button>
        </div>
      </div>

      <Toast message={toast.message} type={toast.type} onClose={() => setToast({ message: '', type: 'success' })} />
    </div>
  );
}

export default PlaceDetail;
