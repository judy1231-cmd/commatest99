import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { fetchWithAuth } from '../../api/fetchWithAuth';
import UserNavbar from '../../components/user/UserNavbar';

const categories = [
  { icon: 'fitness_center', label: '신체적 이완', iconHex: '#4CAF82', bgHex: '#F0FAF5', path: '/rest/physical'  },
  { icon: 'spa',            label: '정신적 고요', iconHex: '#5B8DEF', bgHex: '#F0F5FF', path: '/rest/mental'    },
  { icon: 'visibility_off', label: '감각의 정화', iconHex: '#9B6DFF', bgHex: '#F5F0FF', path: '/rest/sensory'   },
  { icon: 'favorite',       label: '정서적 지지', iconHex: '#FF7BAC', bgHex: '#FFF0F5', path: '/rest/emotional' },
  { icon: 'groups',         label: '사회적 휴식', iconHex: '#FF9A3C', bgHex: '#FFF5EC', path: '/rest/social'    },
  { icon: 'brush',          label: '창조적 몰입', iconHex: '#FFB830', bgHex: '#FFFBF0', path: '/rest/creative'  },
  { icon: 'forest',         label: '자연의 연결', iconHex: '#2ECC9A', bgHex: '#F0FBF7', path: '/rest/nature'    },
];

// 휴식 유형별 대표 사진 — Rest 페이지에서 실제 사용 중인 확인된 URL
const REST_TYPE_PHOTOS = {
  physical:  'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?ixlib=rb-1.2.1&auto=format&fit=crop&w=400&q=80',
  mental:    'https://images.pexels.com/photos/1578750/pexels-photo-1578750.jpeg?auto=compress&cs=tinysrgb&w=400',
  sensory:   'https://images.pexels.com/photos/3997943/pexels-photo-3997943.jpeg?auto=compress&cs=tinysrgb&w=400',
  emotional: 'https://images.unsplash.com/photo-1474552226712-ac0f0961a954?ixlib=rb-1.2.1&auto=format&fit=crop&w=400&q=80',
  social:    'https://images.pexels.com/photos/1370295/pexels-photo-1370295.jpeg?auto=compress&cs=tinysrgb&w=400',
  creative:  'https://images.unsplash.com/photo-1513364776144-60967b0f800f?ixlib=rb-1.2.1&auto=format&fit=crop&w=400&q=80',
  nature:    'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?ixlib=rb-1.2.1&auto=format&fit=crop&w=400&q=80',
  default:   'https://images.pexels.com/photos/3997943/pexels-photo-3997943.jpeg?auto=compress&cs=tinysrgb&w=400',
};

const REST_TYPE_TAG_COLORS = {
  physical: 'text-emerald-600 border-emerald-50',
  mental: 'text-primary border-blue-50',
  sensory: 'text-amber-600 border-amber-50',
  emotional: 'text-rose-600 border-rose-50',
  social: 'text-purple-600 border-purple-50',
  nature: 'text-green-600 border-green-50',
  creative: 'text-orange-600 border-orange-50',
};

const STAT_COLORS = ['bg-emerald-400', 'bg-blue-400', 'bg-amber-400', 'bg-rose-400'];

const REST_TYPE_LABELS = {
  physical:  '신체적 이완',
  mental:    '정신적 고요',
  sensory:   '감각의 정화',
  emotional: '정서적 지지',
  social:    '사회적 휴식',
  creative:  '창조적 몰입',
  nature:    '자연의 연결',
};

function formatMinutes(minutes) {
  if (!minutes) return '0시간';
  if (minutes < 60) return `${minutes}분`;
  return `${Math.floor(minutes / 60)}시간`;
}

// ── 오늘 날짜 문자열 ──────────────────────────────────────────────────────────
function getTodayString() {
  const now = new Date();
  const days = ['일', '월', '화', '수', '목', '금', '토'];
  return `${now.getMonth() + 1}월 ${now.getDate()}일 ${days[now.getDay()]}요일`;
}

// ── 섹션 헤더 ────────────────────────────────────────────────────────────────
function SectionHeader({ title, action }) {
  return (
    <div className="flex items-center justify-between mb-5">
      <h2 className="text-[17px] font-extrabold text-slate-900">{title}</h2>
      {action && <div className="text-[13px] text-slate-400 font-semibold flex items-center gap-0.5">{action}</div>}
    </div>
  );
}

// ── 스켈레톤 카드 ─────────────────────────────────────────────────────────────
function SkeletonPlaceCard() {
  return (
    <div className="flex-shrink-0 w-[240px] bg-white rounded-2xl overflow-hidden shadow-sm animate-pulse">
      <div className="h-[140px] bg-slate-200" />
      <div className="p-4 space-y-2">
        <div className="h-4 bg-slate-200 rounded w-3/4" />
        <div className="h-3 bg-slate-100 rounded w-1/2" />
      </div>
    </div>
  );
}

function MainDashboard() {
  const navigate = useNavigate();
  const isLoggedIn = !!localStorage.getItem('accessToken');
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  const [places, setPlaces] = useState([]);
  const [monthlyStats, setMonthlyStats] = useState(null);
  const [recommendations, setRecommendations] = useState([]);
  const [placesLoading, setPlacesLoading] = useState(true);
  const [hoveredCat, setHoveredCat] = useState(null);
  const [bookmarkedIds, setBookmarkedIds] = useState(new Set());

  useEffect(() => {
    loadPlaces();
    if (isLoggedIn) {
      loadMonthlyStats();
      loadRecommendations();
      loadMyBookmarks();
    }
  }, [isLoggedIn]);

  const loadPlaces = async () => {
    try {
      const res = await fetch('/api/places?page=1&size=6&status=approved');
      const data = await res.json();
      if (data.success && data.data?.places) {
        setPlaces(data.data.places);
      }
    } catch {
      // 장소 API 실패 시 빈 배열 유지
    } finally {
      setPlacesLoading(false);
    }
  };

  const loadMonthlyStats = async () => {
    try {
      const data = await fetchWithAuth('/api/stats/monthly');
      if (data.success && data.data) setMonthlyStats(data.data);
    } catch {
      // 무시
    }
  };

  const loadRecommendations = async () => {
    try {
      const data = await fetchWithAuth('/api/recommendations');
      if (data.success && Array.isArray(data.data)) {
        setRecommendations(data.data.filter(r => r.placeName));
      }
    } catch {
      // 무시
    }
  };

  const loadMyBookmarks = async () => {
    try {
      const data = await fetchWithAuth('/api/places/bookmarks');
      if (data.success && Array.isArray(data.data)) {
        setBookmarkedIds(new Set(data.data.map(p => p.id)));
      }
    } catch {
      // 무시
    }
  };

  const handleToggleBookmark = async (e, placeId) => {
    e.stopPropagation();
    if (!isLoggedIn) { navigate('/login'); return; }
    try {
      const data = await fetchWithAuth(`/api/places/${placeId}/bookmark`, { method: 'POST' });
      if (data.success) {
        setBookmarkedIds(prev => {
          const next = new Set(prev);
          if (data.data?.bookmarked) {
            next.add(placeId);
            setPlaces(ps => ps.map(p => p.id === placeId ? { ...p, bookmarkCount: (p.bookmarkCount || 0) + 1 } : p));
            setRecommendations(rs => rs.map(r => r.placeId === placeId ? { ...r, placeBookmarkCount: (r.placeBookmarkCount || 0) + 1 } : r));
          } else {
            next.delete(placeId);
            setPlaces(ps => ps.map(p => p.id === placeId ? { ...p, bookmarkCount: Math.max((p.bookmarkCount || 1) - 1, 0) } : p));
            setRecommendations(rs => rs.map(r => r.placeId === placeId ? { ...r, placeBookmarkCount: Math.max((r.placeBookmarkCount || 1) - 1, 0) } : r));
          }
          return next;
        });
      }
    } catch {
      // 무시
    }
  };

  let typeRatios = [];
  if (monthlyStats?.typeRatioJson) {
    try {
      const parsed = JSON.parse(monthlyStats.typeRatioJson);
      typeRatios = Object.entries(parsed)
        .map(([type, pct]) => ({ type, pct }))
        .sort((a, b) => b.pct - a.pct)
        .slice(0, 4);
    } catch { /* 무시 */ }
  }

  return (
    <div className="min-h-screen bg-[#F7F7F8]">
      <UserNavbar />

      {/* ── 인사말 헤더 ──────────────────────────────────────────────────────── */}
      <div className="bg-white border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <p className="text-[13px] text-slate-400 font-medium mb-1">{getTodayString()}</p>
          <h1 className="text-[26px] font-extrabold text-slate-900 tracking-tight">
            {isLoggedIn && user.nickname
              ? `안녕하세요, ${user.nickname}님 👋`
              : '오늘도 잘 쉬고 계신가요? 👋'}
          </h1>
          {isLoggedIn && monthlyStats ? (
            <p className="text-[14px] text-slate-500 mt-1.5">
              이번 달{' '}
              <span className="font-bold text-primary">{monthlyStats.logCount || 0}회</span> 휴식했어요 ·{' '}
              총 <span className="font-bold text-primary">{formatMinutes(monthlyStats.totalRestMinutes)}</span>
            </p>
          ) : isLoggedIn ? (
            <p className="text-[14px] text-slate-400 mt-1.5">이번 달 첫 휴식을 기록해보세요</p>
          ) : (
            <p className="text-[14px] text-slate-400 mt-1.5">
              <Link to="/login" className="text-primary font-bold hover:underline">로그인</Link>하고 맞춤 휴식을 시작해요
            </p>
          )}
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-6 py-8 space-y-10 pb-28">

        {/* ── 휴식 유형 칩 ─────────────────────────────────────────────────── */}
        <section>
          <SectionHeader title="휴식 유형" />
          <div className="flex gap-2.5 overflow-x-auto pb-2 hide-scrollbar">
            {categories.map((cat, i) => (
              <Link
                key={i}
                to={cat.path}
                onMouseEnter={() => setHoveredCat(i)}
                onMouseLeave={() => setHoveredCat(null)}
                className="flex-shrink-0 flex items-center gap-2 px-4 py-2.5 rounded-full border-2 bg-white transition-all duration-200 hover:scale-[1.03] shadow-sm"
                style={{
                  borderColor: hoveredCat === i ? cat.iconHex : cat.iconHex + '50',
                  backgroundColor: hoveredCat === i ? cat.bgHex : '#ffffff',
                }}
              >
                <div
                  className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0"
                  style={{ backgroundColor: cat.bgHex }}
                >
                  <span className="material-icons text-[16px]" style={{ color: cat.iconHex }}>{cat.icon}</span>
                </div>
                <span
                  className="text-[13px] font-bold whitespace-nowrap transition-colors"
                  style={{ color: hoveredCat === i ? cat.iconHex : '#475569' }}
                >
                  {cat.label}
                </span>
              </Link>
            ))}
          </div>
        </section>

        {/* ── 월간 통계 (로그인 시) ────────────────────────────────────────── */}
        {isLoggedIn && (
          <section>
            <SectionHeader
              title="이번 달 휴식"
              action={<Link to="/rest-record" className="flex items-center gap-0.5 hover:text-primary transition-colors">더보기 <span className="material-icons text-[14px]">chevron_right</span></Link>}
            />

            {/* 핵심 지표 3개 */}
            <div className="grid grid-cols-3 gap-3 mb-4">
              <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100">
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">총 휴식</p>
                <p className="text-[24px] font-extrabold text-slate-900 leading-none">
                  {monthlyStats ? Math.floor((monthlyStats.totalRestMinutes || 0) / 60) : <span className="w-12 h-6 bg-slate-100 rounded animate-pulse inline-block" />}
                  <span className="text-[14px] font-semibold text-slate-400 ml-1">시간</span>
                </p>
                <p className="text-[11px] text-slate-400 mt-1">{monthlyStats ? `${(monthlyStats.totalRestMinutes || 0) % 60}분 포함` : ''}</p>
              </div>
              <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100">
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">기록 횟수</p>
                <p className="text-[24px] font-extrabold text-slate-900 leading-none">
                  {monthlyStats ? (monthlyStats.logCount || 0) : <span className="w-8 h-6 bg-slate-100 rounded animate-pulse inline-block" />}
                  <span className="text-[14px] font-semibold text-slate-400 ml-1">회</span>
                </p>
                <p className="text-[11px] text-slate-400 mt-1">이번 달 합계</p>
              </div>
              <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100">
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">평균 기분</p>
                <p className="text-[24px] font-extrabold text-slate-900 leading-none">
                  {monthlyStats ? (monthlyStats.avgEmotionScore ? monthlyStats.avgEmotionScore.toFixed(1) : '—') : <span className="w-8 h-6 bg-slate-100 rounded animate-pulse inline-block" />}
                  <span className="text-[14px] font-semibold text-slate-400 ml-1">{monthlyStats?.avgEmotionScore ? '점' : ''}</span>
                </p>
                <p className="text-[11px] text-slate-400 mt-1">감정 점수 평균</p>
              </div>
            </div>

            {/* 유형별 비율 바 */}
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
              <p className="text-[12px] font-bold text-slate-400 uppercase tracking-wider mb-4">유형별 분포</p>
              {typeRatios.length > 0 ? (
                <div className="space-y-3">
                  {typeRatios.map((s, i) => (
                    <div key={s.type} className="flex items-center gap-3">
                      <span className="text-[13px] font-semibold text-slate-600 w-20 flex-shrink-0">{REST_TYPE_LABELS[s.type] || s.type}</span>
                      <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div className={`h-full rounded-full ${STAT_COLORS[i]}`} style={{ width: `${s.pct}%` }} />
                      </div>
                      <span className="text-[13px] font-bold text-slate-500 w-9 text-right">{s.pct}%</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-4">
                  <p className="text-[13px] text-slate-400 mb-2">아직 기록이 없어요</p>
                  <Link to="/rest-record" className="text-[13px] text-primary font-bold hover:underline">첫 휴식 기록하기 →</Link>
                </div>
              )}
            </div>
          </section>
        )}

        {/* ── 진단 시작하기 ────────────────────────────────────────────────── */}
        <section>
          <SectionHeader title="지금 진단 시작하기" />
          <div className="grid grid-cols-3 gap-4">

            {/* 심박수 체크 */}
            <Link to="/heartrate" className="group bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 p-5 flex flex-col gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center">
                <span className="material-icons text-emerald-500 text-[20px]">favorite</span>
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <p className="text-[15px] font-extrabold text-slate-900">심박수 체크</p>
                  <span className="text-[10px] font-bold bg-emerald-100 text-emerald-600 px-2 py-0.5 rounded-full">객관적</span>
                </div>
                <p className="text-[12px] text-slate-400 leading-relaxed">스마트워치로 스트레스 수치 측정</p>
              </div>
              <div className="flex items-center justify-between mt-auto pt-2 border-t border-slate-50">
                <span className="text-[11px] text-slate-400">Apple / Galaxy Watch</span>
                <span className="material-icons text-slate-300 text-[18px] group-hover:text-emerald-400 transition-colors">arrow_forward</span>
              </div>
            </Link>

            {/* 휴식유형 테스트 — 강조 */}
            <Link to="/rest-test" className="group bg-primary rounded-2xl shadow-md shadow-emerald-100 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 p-5 flex flex-col gap-3 relative overflow-hidden">
              <div className="absolute top-3 right-3">
                <span className="text-[10px] font-extrabold bg-white/20 text-white px-2 py-0.5 rounded-full">추천</span>
              </div>
              <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
                <span className="material-icons text-white text-[20px]">psychology</span>
              </div>
              <div>
                <p className="text-[15px] font-extrabold text-white mb-1">휴식 유형 진단</p>
                <p className="text-[12px] text-white/70 leading-relaxed">나에게 맞는 휴식 유형 찾기</p>
              </div>
              <div className="flex items-center justify-between mt-auto pt-2 border-t border-white/10">
                <span className="text-[11px] text-white/60">12문항 · 약 3분</span>
                <span className="material-icons text-white/60 text-[18px] group-hover:text-white transition-colors">arrow_forward</span>
              </div>
            </Link>

            {/* 스트레스 진단 */}
            <Link to="/stress-test" className="group bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 p-5 flex flex-col gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center">
                <span className="material-icons text-amber-500 text-[20px]">psychology_alt</span>
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <p className="text-[15px] font-extrabold text-slate-900">스트레스 진단</p>
                  <span className="text-[10px] font-bold bg-amber-100 text-amber-600 px-2 py-0.5 rounded-full">국제표준</span>
                </div>
                <p className="text-[12px] text-slate-400 leading-relaxed">PSS 기반 스트레스 점수 확인</p>
              </div>
              <div className="flex items-center justify-between mt-auto pt-2 border-t border-slate-50">
                <span className="text-[11px] text-slate-400">10문항 · 약 3분</span>
                <span className="material-icons text-slate-300 text-[18px] group-hover:text-amber-400 transition-colors">arrow_forward</span>
              </div>
            </Link>

          </div>
        </section>

        {/* ── 맞춤 추천 (로그인 + 데이터 있을 때) ──────────────────────────── */}
        {isLoggedIn && recommendations.length > 0 && (
          <section>
            <SectionHeader
              title="나를 위한 맞춤 추천"
              action={
                <span className="flex items-center gap-1 text-[10px] font-bold bg-primary/10 text-primary px-2.5 py-1 rounded-full">
                  <span className="material-icons text-[12px]">auto_awesome</span>진단 기반
                </span>
              }
            />
            <div className="flex gap-4 overflow-x-auto pb-2 hide-scrollbar">
              {recommendations.slice(0, 5).map((rec, idx) => (
                <div
                  key={rec.id}
                  className="card-fade-up flex-shrink-0 w-[220px] bg-white rounded-2xl border border-primary/15 shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden flex flex-col"
                  style={{ animationDelay: `${idx * 0.08}s` }}
                >
                  {/* 사진 */}
                  <div className="relative h-[120px] overflow-hidden bg-slate-100 flex-shrink-0">
                    <img
                      src={rec.placePhotoUrl || REST_TYPE_PHOTOS[rec.placeFirstRestType] || REST_TYPE_PHOTOS.default}
                      alt={rec.placeName}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-2 left-2 bg-primary text-white text-[9px] font-extrabold px-2 py-0.5 rounded-full flex items-center gap-0.5">
                      <span className="material-icons text-[10px]">auto_awesome</span>맞춤
                    </div>
                  </div>
                  {/* 내용 */}
                  <div className="p-3 flex flex-col flex-1">
                    <p className="text-[13px] font-bold text-slate-900 truncate mb-0.5">{rec.placeName}</p>
                    <p className="text-[11px] text-slate-400 truncate mb-2">{rec.placeAddress}</p>
                    <p className="text-[10px] text-primary/80 bg-primary/5 rounded-lg px-2.5 py-1.5 leading-relaxed line-clamp-2 mb-3">{rec.criteria}</p>
                    {/* 통계 + 하트 토글 */}
                    <div className="flex items-center gap-3 text-[11px] text-slate-400 mb-3">
                      <button
                        onClick={(e) => handleToggleBookmark(e, rec.placeId)}
                        className="flex items-center gap-0.5 transition-colors"
                      >
                        <span className="material-icons text-[14px] transition-colors"
                          style={{ color: bookmarkedIds.has(rec.placeId) ? '#EF4444' : '#CBD5E1' }}>
                          {bookmarkedIds.has(rec.placeId) ? 'favorite' : 'favorite_border'}
                        </span>
                        <span style={{ color: bookmarkedIds.has(rec.placeId) ? '#EF4444' : '#94A3B8' }}>
                          {rec.placeBookmarkCount ?? 0}
                        </span>
                      </button>
                      <span className="flex items-center gap-0.5">
                        <span className="material-icons text-[13px] text-slate-300">chat_bubble</span>
                        {rec.placeReviewCount ?? 0}
                      </span>
                    </div>
                    {/* 액션 버튼 */}
                    <div className="flex gap-1.5 mt-auto">
                      <button
                        onClick={async () => {
                          try { await fetchWithAuth(`/api/recommendations/${rec.id}/click`, { method: 'PUT' }); } catch { /* 무시 */ }
                          navigate('/map', { state: { highlightPlace: { name: rec.placeName, location: rec.placeAddress, placeId: rec.placeId } } });
                        }}
                        className="flex-1 flex items-center justify-center gap-1 py-1.5 rounded-lg bg-slate-50 hover:bg-slate-100 text-[11px] font-bold text-slate-500 transition-colors"
                      >
                        <span className="material-icons text-[13px]">map</span>지도
                      </button>
                      <button
                        onClick={() => navigate(`/places/${rec.placeId}`)}
                        className="flex-1 flex items-center justify-center gap-1 py-1.5 rounded-lg bg-primary/10 hover:bg-primary/20 text-[11px] font-bold text-primary transition-colors"
                      >
                        <span className="material-icons text-[13px]">info</span>상세
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ── 추천 장소 가로 스크롤 ────────────────────────────────────────── */}
        <section>
          <SectionHeader
            title="추천 장소"
            action={
              <Link to="/map" className="flex items-center gap-0.5 hover:text-primary transition-colors">
                지도에서 보기 <span className="material-icons text-[14px]">chevron_right</span>
              </Link>
            }
          />

          {placesLoading ? (
            <div className="flex gap-4 overflow-x-auto pb-2 hide-scrollbar">
              {[1, 2, 3, 4].map((n) => <SkeletonPlaceCard key={n} />)}
            </div>
          ) : places.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm py-12 text-center">
              <span className="material-icons text-[48px] text-slate-200 block mb-3">location_off</span>
              <p className="text-[14px] font-semibold text-slate-400 mb-1">아직 등록된 장소가 없어요</p>
              <Link to="/map" className="text-[13px] text-primary font-bold hover:underline">지도에서 탐색하기 →</Link>
            </div>
          ) : (
            <div className="flex gap-4 overflow-x-auto pb-2 hide-scrollbar">
              {places.map((place, idx) => {
                const firstTag = place.tags?.[0];
                const tagColor = firstTag ? (REST_TYPE_TAG_COLORS[firstTag.restType] || 'text-primary border-blue-50') : 'text-primary border-blue-50';

                return (
                  <div
                    key={place.id}
                    className="card-fade-up flex-shrink-0 w-[220px] bg-white rounded-2xl overflow-hidden border border-slate-100 shadow-sm hover:shadow-md transition-all duration-200 flex flex-col"
                    style={{ animationDelay: `${idx * 0.08}s` }}
                  >
                    {/* 이미지 */}
                    <div className="relative h-[120px] overflow-hidden bg-slate-100 flex-shrink-0">
                      <img
                        alt={place.name}
                        className="w-full h-full object-cover"
                        src={place.photoUrl || REST_TYPE_PHOTOS[place.firstRestType] || REST_TYPE_PHOTOS.default}
                      />
                      {firstTag && (
                        <div className={`absolute top-2 left-2 bg-white/90 backdrop-blur-sm px-2 py-0.5 rounded-lg text-[10px] font-bold shadow-sm border ${tagColor}`}>
                          {firstTag.tagName}
                        </div>
                      )}
                      {place.aiScore != null && (
                        <div className="absolute top-2 right-2 bg-black/50 backdrop-blur-sm px-2 py-0.5 rounded-lg flex items-center gap-0.5">
                          <span className="material-icons text-amber-400 text-[11px]">star</span>
                          <span className="text-[10px] font-bold text-white">{place.aiScore.toFixed(1)}</span>
                        </div>
                      )}
                    </div>

                    {/* 텍스트 */}
                    <div className="p-3 flex flex-col flex-1">
                      <p className="text-[13px] font-bold text-slate-900 truncate mb-0.5">{place.name}</p>
                      <p className="text-[11px] text-slate-400 truncate flex items-center gap-0.5 mb-3">
                        <span className="material-icons text-[11px]">location_on</span>
                        {place.address?.split(' ').slice(0, 2).join(' ')}
                      </p>
                      {/* 통계 + 하트 토글 */}
                      <div className="flex items-center gap-3 text-[11px] text-slate-400 mb-3">
                        <button
                          onClick={(e) => handleToggleBookmark(e, place.id)}
                          className="flex items-center gap-0.5 transition-colors"
                        >
                          <span className="material-icons text-[14px] transition-colors"
                            style={{ color: bookmarkedIds.has(place.id) ? '#EF4444' : '#CBD5E1' }}>
                            {bookmarkedIds.has(place.id) ? 'favorite' : 'favorite_border'}
                          </span>
                          <span style={{ color: bookmarkedIds.has(place.id) ? '#EF4444' : '#94A3B8' }}>
                            {place.bookmarkCount ?? 0}
                          </span>
                        </button>
                        <span className="flex items-center gap-0.5">
                          <span className="material-icons text-[13px] text-slate-300">chat_bubble</span>
                          {place.reviewCount ?? 0}
                        </span>
                      </div>
                      {/* 액션 버튼 */}
                      <div className="flex gap-1.5 mt-auto">
                        <button
                          onClick={() => navigate('/map', { state: { highlightPlace: { name: place.name, location: place.address, lat: place.latitude || null, lng: place.longitude || null, placeId: place.id } } })}
                          className="flex-1 flex items-center justify-center gap-1 py-1.5 rounded-lg bg-slate-50 hover:bg-slate-100 text-[11px] font-bold text-slate-500 transition-colors"
                        >
                          <span className="material-icons text-[13px]">map</span>지도
                        </button>
                        <button
                          onClick={() => navigate(`/places/${place.id}`)}
                          className="flex-1 flex items-center justify-center gap-1 py-1.5 rounded-lg bg-primary/10 hover:bg-primary/20 text-[11px] font-bold text-primary transition-colors"
                        >
                          <span className="material-icons text-[13px]">info</span>상세
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}

              {/* 더보기 카드 */}
              <Link
                to="/map"
                className="flex-shrink-0 w-[160px] bg-white rounded-2xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center gap-2 hover:border-primary hover:bg-primary/5 transition-all duration-200 group"
              >
                <span className="material-icons text-slate-300 text-[32px] group-hover:text-primary transition-colors">add_location</span>
                <p className="text-[12px] font-bold text-slate-400 group-hover:text-primary transition-colors text-center leading-tight px-2">지도에서<br/>더 보기</p>
              </Link>
            </div>
          )}
        </section>

      </main>

      {/* ── Footer ──────────────────────────────────────────────────────────── */}
      <footer className="border-t border-slate-100 py-10 bg-white">
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 bg-primary rounded-lg flex items-center justify-center shadow-sm overflow-hidden">
              <img src="/logo_comma.png" alt="쉼표" className="w-3.5 h-3.5 object-contain" />
            </div>
            <p className="text-[12px] text-slate-400">© 2026 쉼표 · 완벽한 휴식을 선사합니다.</p>
          </div>
          <div className="flex gap-6 text-[12px] font-semibold text-slate-400">
            <button className="hover:text-primary transition-colors">이용약관</button>
            <button className="hover:text-primary transition-colors">개인정보처리방침</button>
          </div>
        </div>
      </footer>

      {/* ── Floating Button ──────────────────────────────────────────────────── */}
      <button
        onClick={() => navigate('/rest-test')}
        className="fixed bottom-10 right-10 w-14 h-14 bg-primary text-white rounded-full shadow-xl shadow-emerald-200 flex items-center justify-center group hover:scale-110 transition-transform z-40"
      >
        <span className="material-icons text-[24px]">psychology</span>
        <span className="absolute right-16 bg-slate-800 text-white px-4 py-2 rounded-xl text-[12px] font-bold opacity-0 group-hover:opacity-100 transition-opacity shadow-xl whitespace-nowrap pointer-events-none">
          휴식 유형 진단하기
        </span>
      </button>
    </div>
  );
}

export default MainDashboard;
