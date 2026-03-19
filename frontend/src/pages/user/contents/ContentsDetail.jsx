import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import UserNavbar from '../../../components/user/UserNavbar';

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

  // 콘텐츠 카테고리별 함께 보여줄 보조 장소 유형
  // creative → 혼자 조용히 하는 창작활동은 카페·도서관(mental)과 잘 맞음
  const SECONDARY_PLACE_TYPES = {
    creative: 'mental',
  };

  const loadRelatedPlaces = async (category) => {
    try {
      const secondary = SECONDARY_PLACE_TYPES[category];

      const [primaryRes, secondaryRes] = await Promise.all([
        fetch(`/api/places?restType=${category}&size=6&status=approved`),
        secondary ? fetch(`/api/places?restType=${secondary}&size=6&status=approved`) : Promise.resolve(null),
      ]);

      const primaryData = await primaryRes.json();
      const primaryPlaces = primaryData.success ? (primaryData.data?.places || []) : [];

      let secondaryPlaces = [];
      if (secondaryRes) {
        const secondaryData = await secondaryRes.json();
        secondaryPlaces = secondaryData.success ? (secondaryData.data?.places || []) : [];
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
      const res = await fetch(`/api/contents/${id}`);
      const data = await res.json();
      if (data.success && data.data) {
        setContent(data.data);
        loadRelated(data.data.category, Number(id));
        loadRelatedPlaces(data.data.category);
      } else {
        setError('콘텐츠를 찾을 수 없어요.');
      }
    } catch {
      setError('콘텐츠를 불러오지 못했어요.');
    } finally {
      setLoading(false);
    }
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
              className="w-full h-48 object-cover"
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
            <div className="flex gap-3 overflow-x-auto pb-1" style={{ scrollbarWidth: 'none' }}>
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
                    className="w-full h-20 object-cover"
                    onError={(e) => { e.target.style.display = 'none'; }}
                  />
                ) : (
                  <div
                    className="h-20 flex items-center justify-center"
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
