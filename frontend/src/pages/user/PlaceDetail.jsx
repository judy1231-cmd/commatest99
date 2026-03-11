import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import UserNavbar from '../../components/user/UserNavbar';
import { fetchWithAuth } from '../../api/fetchWithAuth';
import Toast from '../../components/common/Toast';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

const REST_TYPE_INFO = {
  physical:  { label: '신체적 이완', icon: 'fitness_center', color: '#EF4444', path: '/rest/physical' },
  mental:    { label: '정신적 고요', icon: 'spa',            color: '#10B981', path: '/rest/mental'   },
  sensory:   { label: '감각의 정화', icon: 'visibility_off', color: '#F59E0B', path: '/rest/sensory'  },
  emotional: { label: '정서적 지지', icon: 'favorite',       color: '#EC4899', path: '/rest/emotional'},
  social:    { label: '사회적 휴식', icon: 'groups',         color: '#8B5CF6', path: '/rest/social'   },
  nature:    { label: '자연의 연결',icon: 'forest',        color: '#059669', path: '/rest/nature'   },
  creative:  { label: '창조적 몰입', icon: 'brush',          color: '#F97316', path: '/rest/creative' },
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

  const [place, setPlace]         = useState(null);
  const [tags, setTags]           = useState([]);
  const [reviews, setReviews]     = useState([]);
  const [bookmarked, setBookmarked] = useState(false);
  const [loading, setLoading]     = useState(true);
  const [toast, setToast]         = useState({ message: '', type: 'success' });

  // 리뷰 작성
  const [reviewRating, setReviewRating] = useState(0);
  const [reviewContent, setReviewContent] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadDetail();
  }, [id]);

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
    if (!isLoggedIn) {
      setToast({ message: '로그인이 필요해요', type: 'error' });
      return;
    }
    if (reviewRating === 0) {
      setToast({ message: '별점을 선택해주세요', type: 'error' });
      return;
    }
    if (!reviewContent.trim()) {
      setToast({ message: '리뷰 내용을 입력해주세요', type: 'error' });
      return;
    }
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
      }
    } catch {
      setToast({ message: '리뷰 등록에 실패했어요', type: 'error' });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F9F7F2]">
        <UserNavbar />
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
        </div>
      </div>
    );
  }

  if (!place) return null;

  const avgRating = reviews.length
    ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1)
    : null;

  // 이 장소에 연결된 유형 태그들
  const restTypeTags = [...new Set(tags.map(t => t.restType).filter(Boolean))];

  return (
    <div className="min-h-screen bg-[#F9F7F2]">
      <UserNavbar />
      <main className="max-w-2xl mx-auto px-4 pt-6 pb-24">

        {/* 뒤로가기 */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-1 text-sm text-slate-500 hover:text-primary transition-colors mb-6"
        >
          <span className="material-icons text-base">arrow_back</span>
          지도로 돌아가기
        </button>

        {/* 장소 기본 정보 카드 */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-4">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <h1 className="text-xl font-bold text-slate-800 mb-1">{place.name}</h1>
              <p className="text-sm text-slate-500 flex items-start gap-1">
                <span className="material-icons text-base shrink-0 mt-0.5">location_on</span>
                {place.address}
              </p>
              {place.operatingHours && (
                <p className="text-sm text-slate-500 flex items-center gap-1 mt-1">
                  <span className="material-icons text-base">schedule</span>
                  {place.operatingHours}
                </p>
              )}
            </div>
            <button
              onClick={handleBookmark}
              className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-all ${
                bookmarked ? 'bg-amber-50 text-amber-500' : 'bg-slate-100 text-slate-400 hover:bg-slate-200'
              }`}
            >
              <span className="material-icons text-xl">{bookmarked ? 'bookmark' : 'bookmark_border'}</span>
            </button>
          </div>

          {/* AI 점수 + 리뷰 수 */}
          <div className="flex items-center gap-4 mt-4 pt-4 border-t border-slate-100">
            {place.aiScore && (
              <div className="flex items-center gap-1">
                <span className="material-icons text-amber-400 text-base">auto_awesome</span>
                <span className="text-sm font-bold text-slate-700">AI 점수 {Number(place.aiScore).toFixed(1)}</span>
              </div>
            )}
            {avgRating && (
              <div className="flex items-center gap-1">
                <span className="material-icons text-amber-400 text-base">star</span>
                <span className="text-sm font-bold text-slate-700">{avgRating}</span>
                <span className="text-xs text-slate-400">({reviews.length}개 리뷰)</span>
              </div>
            )}
          </div>
        </div>

        {/* 휴식유형 태그 + 유형 페이지 링크 */}
        {restTypeTags.length > 0 && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 mb-4">
            <h3 className="text-sm font-bold text-slate-700 mb-3">추천 휴식 유형</h3>
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

        {/* 미니 지도 */}
        {place.latitude && place.longitude && (
          <div className="rounded-2xl overflow-hidden border border-gray-100 shadow-sm mb-4" style={{ height: '200px' }}>
            <MapContainer
              center={[place.latitude, place.longitude]}
              zoom={15}
              style={{ width: '100%', height: '100%' }}
              zoomControl={false}
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

        {/* 리뷰 작성 */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 mb-4">
          <h3 className="font-bold text-slate-800 mb-4">리뷰 작성</h3>
          {isLoggedIn ? (
            <>
              <div className="mb-3">
                <p className="text-xs text-slate-500 mb-2">별점</p>
                <StarRating rating={reviewRating} onRate={setReviewRating} />
              </div>
              <textarea
                value={reviewContent}
                onChange={e => setReviewContent(e.target.value)}
                placeholder="이 장소에서의 휴식 경험을 나눠주세요"
                rows={3}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-sm text-slate-700 placeholder:text-slate-400 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none resize-none"
              />
              <button
                onClick={handleReviewSubmit}
                disabled={submitting}
                className="mt-3 w-full bg-primary text-white font-bold py-2.5 rounded-xl hover:bg-primary/90 transition-all disabled:opacity-50"
              >
                {submitting ? '등록 중...' : '리뷰 등록'}
              </button>
            </>
          ) : (
            <div className="text-center py-4">
              <p className="text-sm text-slate-400 mb-3">로그인하면 리뷰를 남길 수 있어요</p>
              <Link to="/login" className="text-sm text-primary font-bold hover:underline">로그인하기</Link>
            </div>
          )}
        </div>

        {/* 리뷰 목록 */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
          <h3 className="font-bold text-slate-800 mb-4">리뷰 {reviews.length}개</h3>
          {reviews.length === 0 ? (
            <div className="text-center py-8 text-slate-400">
              <span className="material-icons text-3xl mb-2 block">rate_review</span>
              <p className="text-sm">아직 리뷰가 없어요. 첫 리뷰를 남겨보세요!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {reviews.map((review, i) => (
                <div key={review.id || i} className="pb-4 border-b border-slate-100 last:border-0 last:pb-0">
                  <div className="flex items-center gap-2 mb-1.5">
                    <div className="flex gap-0.5">
                      {[1, 2, 3, 4, 5].map(s => (
                        <span key={s} className={`material-icons text-sm ${review.rating >= s ? 'text-amber-400' : 'text-slate-200'}`}>
                          star
                        </span>
                      ))}
                    </div>
                    {review.verified && (
                      <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full font-bold">인증</span>
                    )}
                  </div>
                  <p className="text-sm text-slate-700">{review.content}</p>
                  {review.createdAt && (
                    <p className="text-xs text-slate-400 mt-1">
                      {new Date(review.createdAt).toLocaleDateString('ko-KR')}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      <Toast message={toast.message} type={toast.type} onClose={() => setToast({ message: '', type: 'success' })} />
    </div>
  );
}

export default PlaceDetail;
