import { useState, useEffect, useCallback } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import UserNavbar from '../../components/user/UserNavbar';
import fetchWithAuth from '../../api/fetchWithAuth';

// Leaflet 기본 마커 아이콘 경로 수정 (React 빌드 환경 이슈)
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

const DOMESTIC_CITIES = [
  '서울', '경기', '부산', '인천', '대구', '광주', '대전', '울산', '세종', '강원', '제주',
  '경상남도', '경남', '경상북도', '경북',
  '전라남도', '전남', '전라북도', '전북',
  '충청남도', '충남', '충청북도', '충북',
];

const REST_TYPES = [
  { key: '',          label: '전체',        icon: 'apps',           color: '#10B981', bg: '#F0FDF4', badge: 'rgba(16,185,129,0.85)',   path: null              },
  { key: 'physical',  label: '신체의 이완', icon: 'fitness_center', color: '#4CAF82', bg: '#F0FAF5', badge: 'rgba(76,175,130,0.85)',   path: '/rest/physical'  },
  { key: 'mental',    label: '정신적 고요', icon: 'spa',            color: '#5B8DEF', bg: '#F0F5FF', badge: 'rgba(91,141,239,0.85)',   path: '/rest/mental'    },
  { key: 'sensory',   label: '감각의 정화', icon: 'visibility_off', color: '#9B6DFF', bg: '#F5F0FF', badge: 'rgba(155,109,255,0.85)', path: '/rest/sensory'   },
  { key: 'emotional', label: '정서적 지지', icon: 'favorite',       color: '#FF7BAC', bg: '#FFF0F5', badge: 'rgba(255,123,172,0.85)', path: '/rest/emotional' },
  { key: 'social',    label: '사회적 휴식', icon: 'groups',         color: '#FF9A3C', bg: '#FFF5EC', badge: 'rgba(255,154,60,0.85)',   path: '/rest/social'    },
  { key: 'creative',  label: '창조적 몰입', icon: 'brush',          color: '#FFB830', bg: '#FFFBF0', badge: 'rgba(255,184,48,0.85)',   path: '/rest/creative'  },
  { key: 'nature',    label: '자연의 연결', icon: 'forest',         color: '#2ECC9A', bg: '#F0FBF7', badge: 'rgba(46,204,154,0.85)',   path: '/rest/nature'    },
];

const DIFFICULTY_MAP = {
  easy:   { label: '쉬움',   color: '#10b981', icon: 'directions_walk' },
  medium: { label: '보통',   color: '#F59E0B', icon: 'directions_run'  },
  hard:   { label: '어려움', color: '#EF4444', icon: 'fitness_center'  },
};

const REST_TYPE_PHOTOS = {
  physical:  'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?ixlib=rb-1.2.1&auto=format&fit=crop&w=400&q=80',
  mental:    'https://images.pexels.com/photos/167699/pexels-photo-167699.jpeg?auto=compress&cs=tinysrgb&w=400',
  sensory:   'https://images.pexels.com/photos/6724539/pexels-photo-6724539.jpeg?auto=compress&cs=tinysrgb&w=400',
  emotional: 'https://images.unsplash.com/photo-1474552226712-ac0f0961a954?ixlib=rb-1.2.1&auto=format&fit=crop&w=400&q=80',
  social:    'https://images.pexels.com/photos/1370295/pexels-photo-1370295.jpeg?auto=compress&cs=tinysrgb&w=400',
  creative:  'https://images.unsplash.com/photo-1513364776144-60967b0f800f?ixlib=rb-1.2.1&auto=format&fit=crop&w=400&q=80',
  nature:    'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?ixlib=rb-1.2.1&auto=format&fit=crop&w=400&q=80',
};

// 유형별 색상 마커 생성
function createColorMarker(color) {
  return L.divIcon({
    className: '',
    html: `<div style="
      width: 14px; height: 14px; border-radius: 50%;
      background: ${color}; border: 2.5px solid white;
      box-shadow: 0 2px 6px rgba(0,0,0,0.35);
    "></div>`,
    iconSize: [14, 14],
    iconAnchor: [7, 7],
  });
}

// 선택된 장소로 지도 이동
function FlyToPlace({ center }) {
  const map = useMap();
  useEffect(() => {
    if (center) map.flyTo(center, 14, { duration: 1.2 });
  }, [center, map]);
  return null;
}

// 지역 필터 선택 시 해당 지역 전체가 보이도록 지도 자동 이동
function FitBoundsOnRegion({ places, regionL1, regionL2, isDomestic }) {
  const map = useMap();
  useEffect(() => {
    if (!regionL1) return;

    // 1차 유효성: null·0·범위 밖 좌표 제거
    let valid = places.filter(p => {
      if (!p.latitude || !p.longitude) return false;
      if (isDomestic(p.address)) {
        return p.latitude >= 33 && p.latitude <= 38.6 &&
               p.longitude >= 124.5 && p.longitude <= 130.9;
      }
      return Math.abs(p.latitude) > 0.1 && Math.abs(p.longitude) > 0.1 &&
             Math.abs(p.latitude) <= 90 && Math.abs(p.longitude) <= 180;
    });

    // 2차: 중앙값 기준 이상치 제거 (잘못된 좌표가 bounds를 바다로 끌어당기는 문제 방지)
    let medLat = valid[0]?.latitude ?? 0;
    let medLng = valid[0]?.longitude ?? 0;
    if (valid.length >= 3) {
      const sortedLats = [...valid].map(p => p.latitude).sort((a, b) => a - b);
      const sortedLngs = [...valid].map(p => p.longitude).sort((a, b) => a - b);
      medLat = sortedLats[Math.floor(sortedLats.length / 2)];
      medLng = sortedLngs[Math.floor(sortedLngs.length / 2)];
      const cleaned = valid.filter(p =>
        Math.abs(p.latitude - medLat) <= 15 && Math.abs(p.longitude - medLng) <= 20
      );
      if (cleaned.length > 0) {
        valid = cleaned;
        // 이상치 제거 후 중앙값 재계산
        const lats2 = [...valid].map(p => p.latitude).sort((a, b) => a - b);
        const lngs2 = [...valid].map(p => p.longitude).sort((a, b) => a - b);
        medLat = lats2[Math.floor(lats2.length / 2)];
        medLng = lngs2[Math.floor(lngs2.length / 2)];
      }
    }

    if (valid.length === 0) return;
    if (valid.length === 1) {
      map.flyTo([valid[0].latitude, valid[0].longitude], 13, { duration: 1.2 });
      return;
    }
    const bounds = L.latLngBounds(valid.map(p => [p.latitude, p.longitude]));
    const zoom = map.getBoundsZoom(bounds, false, [60, 60]);
    if (zoom < 8) {
      // bbox 중심(바다 가능) 대신 장소들의 중앙값 좌표 사용
      map.flyTo([medLat, medLng], 9, { duration: 1.2 });
    } else {
      map.flyToBounds(bounds, { padding: [60, 60], maxZoom: 13, duration: 1.2 });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [regionL1, regionL2]);
  return null;
}

// 핀 위에 뜨는 장소 카드
function PlaceCard({ place, currentType, onClose }) {
  const map = useMap();
  const calcPos = () => {
    const point = map.latLngToContainerPoint([place.latitude, place.longitude]);
    return { x: point.x, y: point.y };
  };
  const [pos, setPos] = useState(calcPos);

  useEffect(() => {
    setPos(calcPos());
    const update = () => setPos(calcPos());
    map.on('moveend zoomend', update);
    return () => map.off('moveend zoomend', update);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [place, map]);

  const cardWidth = 280;
  const cardEstHeight = place.photoUrl ? 300 : 180;
  const pinOffset = 14; // 마커 반지름

  return (
    <div
      style={{
        position: 'absolute',
        left: pos.x - cardWidth / 2,
        top: pos.y - cardEstHeight - pinOffset,
        width: cardWidth,
        zIndex: 1100,
        pointerEvents: 'auto',
      }}
      className="bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden"
    >
      {place.photoUrl && (
        <div className="relative h-32">
          <img src={place.photoUrl} alt={place.name} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
          {/* 사진 좌상단 — 휴식유형 뱃지 (중복 표시) */}
          {place.restTypes?.length > 0 && (
            <div className="absolute top-2 left-2 flex flex-wrap gap-1">
              {place.restTypes.map(rt => {
                const t = REST_TYPES.find(r => r.key === rt);
                if (!t) return null;
                return (
                  <span
                    key={rt}
                    className="flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-[9px] font-bold text-white"
                    style={{ backgroundColor: t.badge }}
                  >
                    <span className="material-icons" style={{ fontSize: '9px' }}>{t.icon}</span>
                    {t.label}
                  </span>
                );
              })}
            </div>
          )}
          {/* 우상단 — AI 별점 */}
          {place.aiScore && (
            <div className="absolute top-2 right-2 bg-black/50 backdrop-blur-sm px-2 py-0.5 rounded-lg flex items-center gap-0.5">
              <span className="material-icons text-amber-400 text-[11px]">star</span>
              <span className="text-[10px] font-bold text-white">{Number(place.aiScore).toFixed(1)}</span>
            </div>
          )}
          {/* 우하단 — 난이도 */}
          {place.difficulty && DIFFICULTY_MAP[place.difficulty] && (() => {
            const d = DIFFICULTY_MAP[place.difficulty];
            return (
              <div className="absolute bottom-2 right-2 flex items-center gap-0.5 px-1.5 py-0.5 rounded-full"
                style={{ backgroundColor: 'rgba(0,0,0,0.45)' }}>
                <span className="material-icons text-[9px]" style={{ color: d.color }}>{d.icon}</span>
                <span className="text-[9px] font-bold" style={{ color: d.color }}>{d.label}</span>
              </div>
            );
          })()}
        </div>
      )}
      <div className="p-3">
        <div className="flex items-start justify-between gap-2 mb-1">
          <h3 className="font-bold text-slate-800 text-sm leading-snug flex-1 truncate">{place.name}</h3>
          <button onClick={onClose} className="shrink-0 text-slate-400 hover:text-slate-600">
            <span className="material-icons text-base">close</span>
          </button>
        </div>
        <p className="text-xs text-slate-400 mb-2 truncate">{place.address}</p>
        {place.operatingHours && (
          <p className="text-xs text-slate-400 flex items-center gap-1 mb-2 truncate">
            <span className="material-icons" style={{ fontSize: '12px' }}>schedule</span>
            {place.operatingHours}
          </p>
        )}
        <Link
          to={`/places/${place.id}`}
          className="block w-full text-center py-1.5 rounded-xl text-xs font-bold text-white transition-opacity hover:opacity-90"
          style={{ backgroundColor: currentType.color }}
        >
          상세보기
        </Link>
      </div>
      {/* 말풍선 꼬리 */}
      <div
        style={{
          position: 'absolute',
          bottom: -8,
          left: '50%',
          transform: 'translateX(-50%)',
          width: 0,
          height: 0,
          borderLeft: '8px solid transparent',
          borderRight: '8px solid transparent',
          borderTop: '8px solid white',
          filter: 'drop-shadow(0 2px 2px rgba(0,0,0,0.08))',
        }}
      />
    </div>
  );
}

// 클릭 선택된 마커 (빨간 점)
function createSelectedMarker() {
  return L.divIcon({
    className: '',
    html: `<div style="
      width: 18px; height: 18px; border-radius: 50%;
      background: #EF4444; border: 3px solid white;
      box-shadow: 0 0 0 3px rgba(239,68,68,0.35), 0 3px 10px rgba(0,0,0,0.4);
    "></div>`,
    iconSize: [18, 18],
    iconAnchor: [9, 9],
  });
}


function MapPage() {
  const location = useLocation();
  const navigate = useNavigate();
  // 자연 연결 등 다른 페이지에서 클릭해 넘어온 장소
  const highlightPlace = location.state?.highlightPlace || null;
  const flyToMyLocation = location.state?.flyToMyLocation || false;
  const incomingRestType = location.state?.restType || '';
  const incomingLocationTab = location.state?.locationTab || 'all';

  // 새로고침 시 state가 남지 않도록 히스토리에서 즉시 제거
  useEffect(() => {
    if (location.state) {
      navigate(location.pathname, { replace: true, state: null });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const [selectedType, setSelectedType] = useState(incomingRestType);
  const [places, setPlaces] = useState([]);
  const [loading, setLoading] = useState(false);
  const [keyword, setKeyword] = useState('');
  const [locationTab, setLocationTab] = useState(incomingLocationTab);
  const [regionL1, setRegionL1] = useState(''); // 국내: 시/도, 해외: 나라
  const [regionL2, setRegionL2] = useState(''); // 국내: 구/군, 해외: 도시
  const [myLocation, setMyLocation] = useState(null);
  const [resolvedHighlight, setResolvedHighlight] = useState(highlightPlace || null);
  const [selectedPlaceId, setSelectedPlaceId] = useState(null);
  const [flyTarget, setFlyTarget] = useState(
    highlightPlace?.lat ? [highlightPlace.lat, highlightPlace.lng] : null
  );
  const [bookmarkedIds, setBookmarkedIds] = useState(new Set());
  const [bookmarkLoading, setBookmarkLoading] = useState(null); // 처리 중인 placeId

  // locationTab 변경 시 지역 선택 초기화
  useEffect(() => { setRegionL1(''); setRegionL2(''); }, [locationTab]);
  useEffect(() => { setRegionL2(''); }, [regionL1]);

  // 새 장소 선택 시 외부 넘어온 하이라이트 배너 닫기
  useEffect(() => {
    if (selectedPlaceId) setResolvedHighlight(null);
  }, [selectedPlaceId]);

  const isDomestic = (address) =>
    DOMESTIC_CITIES.some(k => address?.includes(k));

  const getL1 = (address) => {
    if (!address) return null;
    if (isDomestic(address)) return DOMESTIC_CITIES.find(c => address.includes(c)) || null;
    return address.trim().split(/\s+/)[0] || null;
  };

  const getL2 = (address) => {
    if (!address) return null;
    if (isDomestic(address)) {
      // 구/군 우선 매칭
      const mGu = address.match(/([가-힣]+(?:구|군))/);
      if (mGu) return mGu[1];
      // 특별시/광역시/자치시 제외한 일반 시 매칭
      const allSi = [...address.matchAll(/([가-힣]+시)/g)].map(m => m[1]);
      const normalSi = allSi.filter(s => !/특별시$|광역시$|자치시$/.test(s));
      return normalSi[0] || null;
    }
    const parts = address.trim().split(/\s+/);
    return parts[1] || null;
  };

  // 현재 locationTab 기준 1차 지역 목록 (장소 수 포함)
  const tabPlaces = places.filter(p =>
    locationTab === 'all' ? true : locationTab === 'domestic' ? isDomestic(p.address) : !isDomestic(p.address)
  );
  const l1CountMap = tabPlaces.reduce((acc, p) => {
    const l1 = getL1(p.address);
    if (l1) acc[l1] = (acc[l1] || 0) + 1;
    return acc;
  }, {});
  const l1Options = Object.keys(l1CountMap).sort((a, b) => l1CountMap[b] - l1CountMap[a]);

  // 1차 선택 후 2차 목록 (장소 수 포함)
  const l2CountMap = regionL1 ? places
    .filter(p => getL1(p.address) === regionL1)
    .reduce((acc, p) => {
      const l2 = getL2(p.address);
      if (l2) acc[l2] = (acc[l2] || 0) + 1;
      return acc;
    }, {}) : {};
  const l2Options = Object.keys(l2CountMap).sort((a, b) => l2CountMap[b] - l2CountMap[a]);


  const filteredPlaces = places.filter(p => {
    const tabOk = locationTab === 'all' ? true : locationTab === 'domestic' ? isDomestic(p.address) : !isDomestic(p.address);
    if (!tabOk) return false;
    if (regionL1 && getL1(p.address) !== regionL1) return false;
    if (regionL2 && getL2(p.address) !== regionL2) return false;
    return true;
  });

  const loadPlaces = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: 1, size: 1000 });
      if (selectedType) params.append('restType', selectedType);
      if (keyword.trim()) params.append('keyword', keyword.trim());

      const res = await fetch(`/api/places?${params}`);
      const data = await res.json();
      if (data.success && data.data) {
        setPlaces(data.data.places || []);
      }
    } catch {
      // 서버 미연결 시 조용히 빈 목록
    } finally {
      setLoading(false);
    }
  }, [selectedType, keyword]);

  useEffect(() => {
    loadPlaces();
  }, [loadPlaces]);

  // 로그인 사용자의 북마크 목록 로드
  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (!token) return;
    fetchWithAuth('/api/places/bookmarks')
      .then(data => {
        if (data.success && Array.isArray(data.data)) {
          setBookmarkedIds(new Set(data.data.map(p => p.id)));
        }
      })
      .catch(() => {});
  }, []);

  const handleBookmarkToggle = async (e, placeId) => {
    e.stopPropagation();
    const token = localStorage.getItem('accessToken');
    if (!token) return;
    if (bookmarkLoading === placeId) return;
    setBookmarkLoading(placeId);
    const isBookmarked = bookmarkedIds.has(placeId);
    try {
      // 백엔드는 POST 단일 토글 방식
      const data = await fetchWithAuth(`/api/places/${placeId}/bookmark`, { method: 'POST' });
      if (data.success) {
        const nowBookmarked = data.data?.bookmarked;
        setBookmarkedIds(prev => {
          const next = new Set(prev);
          nowBookmarked ? next.add(placeId) : next.delete(placeId);
          return next;
        });
      }
    } catch {
      // 실패 시 무시
    } finally {
      setBookmarkLoading(null);
    }
  };

  // 맞춤 추천에서 넘어온 경우 placeId로 좌표 fetch
  useEffect(() => {
    if (!highlightPlace?.placeId || highlightPlace?.lat) return;
    fetch(`/api/places/${highlightPlace.placeId}`)
      .then(r => r.json())
      .then(data => {
        const place = data.data?.place;
        if (data.success && place?.latitude) {
          const updated = {
            ...highlightPlace,
            lat: place.latitude,
            lng: place.longitude,
          };
          setResolvedHighlight(updated);
          setFlyTarget([place.latitude, place.longitude]);
        }
      })
      .catch(() => {});
  }, [highlightPlace]);

  // 내 주변 명소 찾기: 현재 위치로 flyTo
  useEffect(() => {
    if (!flyToMyLocation) return;
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const coords = [pos.coords.latitude, pos.coords.longitude];
        setMyLocation(coords);
        setFlyTarget(coords);
      },
      () => {
        // 위치 권한 거부 시 무시
      }
    );
  }, [flyToMyLocation]);

  const handleSearch = (e) => {
    e.preventDefault();
    loadPlaces();
  };

  const handleMarkerClick = (place) => {
    if (selectedPlaceId === place.id) return;
    setSelectedPlaceId(place.id);
  };

  const currentType = REST_TYPES.find(t => t.key === selectedType) || REST_TYPES[0];
  const selectedPlace = selectedPlaceId ? places.find(p => p.id === selectedPlaceId) : null;

  return (
    <div className="min-h-screen bg-[#F9F7F2]">
      <UserNavbar />
      <div className="flex flex-col md:flex-row" style={{ height: 'calc(100vh - 4rem)' }}>

        {/* ===== 사이드바 ===== */}
        <aside className="w-full md:w-96 bg-white border-r border-slate-200 flex flex-col overflow-hidden">

          {/* 검색창 */}
          <form onSubmit={handleSearch} className="p-4 border-b border-slate-100">
            <div className="relative">
              <span className="material-icons absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xl">search</span>
              <input
                className="w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                placeholder="장소 또는 주소 검색"
                value={keyword}
                onChange={e => setKeyword(e.target.value)}
              />
              {keyword && (
                <button
                  type="button"
                  onClick={() => { setKeyword(''); loadPlaces(); }}
                  className="absolute right-3 top-1/2 -translate-y-1/2"
                >
                  <span className="material-icons text-slate-400 text-base">close</span>
                </button>
              )}
            </div>
          </form>

          {/* 국내/해외 필터 탭 */}
          <div className="px-4 py-2.5 border-b border-slate-100 flex gap-2">
            {[{ key: 'all', label: '전체' }, { key: 'domestic', label: '국내' }, { key: 'foreign', label: '해외' }].map(tab => (
              <button
                key={tab.key}
                onClick={() => setLocationTab(tab.key)}
                className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                  locationTab === tab.key
                    ? 'bg-primary text-white'
                    : 'bg-slate-100 text-slate-400 hover:bg-slate-200'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* 지역 필터 — 국내/해외 선택 시 표시 */}
          {locationTab !== 'all' && l1Options.length > 0 && (
            <div className="border-b border-slate-100">
              {/* L1: 시/도 또는 나라 */}
              <div className="px-3 pt-2.5 pb-1">
                <p className="text-[10px] font-bold text-slate-400 mb-1.5">
                  {locationTab === 'domestic' ? '시·도' : '나라'}
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {l1Options.map(opt => (
                    <button
                      key={opt}
                      onClick={() => setRegionL1(regionL1 === opt ? '' : opt)}
                      className={`flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full transition-all ${
                        regionL1 === opt
                          ? 'bg-primary text-white shadow-sm'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      {opt}
                      <span className={`text-[10px] font-normal ${regionL1 === opt ? 'text-white/80' : 'text-slate-400'}`}>
                        {l1CountMap[opt]}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* L2: 구/군 또는 도시 */}
              {regionL1 && l2Options.length > 0 && (
                <div className="px-3 pt-1 pb-1">
                  <p className="text-[10px] font-bold text-slate-400 mb-1.5">
                    {locationTab === 'domestic' ? '구·군' : '도시'}
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {l2Options.map(opt => (
                      <button
                        key={opt}
                        onClick={() => setRegionL2(regionL2 === opt ? '' : opt)}
                        className={`flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full transition-all ${
                          regionL2 === opt
                            ? 'bg-primary text-white shadow-sm'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                      >
                        {opt}
                        <span className={`text-[10px] font-normal ${regionL2 === opt ? 'text-white/80' : 'text-slate-400'}`}>
                          {l2CountMap[opt]}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

            </div>
          )}

          {/* 휴식유형 필터 */}
          <div className="p-3 border-b border-slate-100">
            <div className="grid grid-cols-4 gap-1.5">
              {REST_TYPES.map(type => {
                const isSelected = selectedType === type.key;
                return (
                  <button
                    key={type.key}
                    onClick={() => setSelectedType(type.key)}
                    className="flex flex-col items-center gap-0.5 px-1 py-2 rounded-xl text-[10px] font-bold transition-all leading-tight"
                    style={{
                      backgroundColor: isSelected ? type.color : type.bg,
                      color: isSelected ? '#fff' : type.color,
                      boxShadow: isSelected ? `0 2px 8px ${type.color}55` : 'none',
                    }}
                  >
                    <span className="material-icons" style={{ fontSize: '16px' }}>{type.icon}</span>
                    <span className="text-center whitespace-pre-line">{type.label.replace(' ', '\n')}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 선택된 유형 설명 보기 링크 */}
          {currentType.path && (
            <div className="px-4 py-2 border-b border-slate-100">
              <Link
                to={currentType.path}
                className="flex items-center gap-1.5 text-xs font-bold transition-colors hover:opacity-80"
                style={{ color: currentType.color }}
              >
                <span className="material-icons" style={{ fontSize: '13px' }}>{currentType.icon}</span>
                {currentType.label} 유형 자세히 알아보기
                <span className="material-icons" style={{ fontSize: '13px' }}>arrow_forward</span>
              </Link>
            </div>
          )}

          {/* 내 주변 명소 찾기 */}
          {flyToMyLocation && (
            <div className="mx-3 my-2 p-3 rounded-xl border-2 border-blue-400 bg-blue-50">
              <div className="flex items-center gap-2">
                <span className="material-icons text-blue-500 text-base">my_location</span>
                <p className="text-sm font-bold text-blue-700">
                  {myLocation ? '내 위치를 찾았어요!' : '내 위치를 찾는 중...'}
                </p>
              </div>
              {myLocation && (
                <p className="text-xs text-blue-500 mt-1">지도가 현재 위치로 이동했어요</p>
              )}
            </div>
          )}

          {/* 외부 페이지에서 넘어온 선택 장소 */}
          {resolvedHighlight && (
            <div className="mx-3 my-2 p-3 rounded-xl border-2 border-green-400 bg-green-50">
              <div className="flex items-center gap-2 mb-1">
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                <span className="text-[10px] font-bold text-green-600 uppercase tracking-wider">선택한 장소</span>
              </div>
              <p className="font-bold text-slate-800 text-sm">{resolvedHighlight.name}</p>
              <p className="text-xs text-slate-500">{resolvedHighlight.location}</p>
              {!resolvedHighlight.lat && (
                <p className="text-[10px] text-slate-400 mt-1">좌표를 불러오는 중...</p>
              )}
            </div>
          )}

          {/* 결과 수 */}
          <div className="px-4 py-2 border-b border-slate-50">
            <p className="text-xs text-slate-400">
              {loading ? '검색 중...' : `${filteredPlaces.length}개 장소`}
            </p>
          </div>

          {/* 장소 목록 */}
          <div className="flex-1 overflow-y-auto divide-y divide-slate-50">
            {loading ? (
              <div className="flex justify-center items-center h-32">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary" />
              </div>
            ) : filteredPlaces.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-40 text-slate-400 px-4 text-center">
                <span className="material-icons text-4xl mb-2">location_off</span>
                <p className="text-sm font-medium">해당하는 장소가 없어요</p>
              </div>
            ) : (
              filteredPlaces.map(place => (
                <div
                  key={place.id}
                  onClick={() => {
                    if (selectedPlaceId === place.id) return;
                    setSelectedPlaceId(place.id);
                    if (place.latitude && place.longitude) {
                      setFlyTarget([place.latitude, place.longitude]);
                    }
                  }}
                  className="relative p-3 cursor-pointer transition-colors hover:bg-slate-50"
                >
                  <div className="flex items-start gap-3">
                    {/* 북마크 하트 버튼 */}
                    {localStorage.getItem('accessToken') && (
                      <button
                        onClick={e => handleBookmarkToggle(e, place.id)}
                        className="absolute top-3 right-3 z-10 p-1"
                        disabled={bookmarkLoading === place.id}
                        title={bookmarkedIds.has(place.id) ? '찜 해제' : '찜하기'}
                      >
                        <span
                          className="material-icons text-lg"
                          style={{ color: bookmarkedIds.has(place.id) ? '#EF4444' : '#CBD5E1' }}
                        >
                          {bookmarkedIds.has(place.id) ? 'favorite' : 'favorite_border'}
                        </span>
                      </button>
                    )}
                    {/* 썸네일 사진 */}
                    <div className="relative w-16 h-16 rounded-xl overflow-hidden shrink-0 bg-slate-100">
                      {place.photoUrl ? (
                        <>
                          <img
                            src={place.photoUrl}
                            alt={place.name}
                            className="w-full h-full object-cover"
                          />
                          {/* 사진 위 휴식유형 아이콘 닷 */}
                          {place.restTypes?.length > 0 && (
                            <div className="absolute top-1 left-1 flex gap-0.5">
                              {place.restTypes.slice(0, 4).map(rt => {
                                const t = REST_TYPES.find(r => r.key === rt);
                                if (!t) return null;
                                return (
                                  <div
                                    key={rt}
                                    className="w-4 h-4 rounded-full flex items-center justify-center"
                                    style={{ background: 'rgba(0,0,0,0.55)' }}
                                    title={t.label}
                                  >
                                    <span className="material-icons" style={{ fontSize: '9px', color: t.color }}>{t.icon}</span>
                                  </div>
                                );
                              })}
                            </div>
                          )}
                        </>
                      ) : (
                        <div
                          className="w-full h-full flex items-center justify-center"
                          style={{ backgroundColor: `${currentType.color}20` }}
                        >
                          <span className="material-icons text-xl" style={{ color: currentType.color }}>{currentType.icon}</span>
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-slate-800 text-sm truncate">{place.name}</h3>
                      <p className="text-xs text-slate-400 mt-0.5 truncate">{place.address}</p>
                      {place.operatingHours && (
                        <p className="text-xs text-slate-400 mt-0.5 flex items-center gap-1">
                          <span className="material-icons" style={{ fontSize: '11px' }}>schedule</span>
                          {place.operatingHours}
                        </p>
                      )}
                      <div className="flex items-center gap-2 mt-1">
                        {place.aiScore && (
                          <div className="flex items-center gap-0.5">
                            <span className="material-icons text-amber-400 text-xs">star</span>
                            <span className="text-xs font-bold text-slate-600">{Number(place.aiScore).toFixed(1)}</span>
                          </div>
                        )}
                        {place.difficulty && DIFFICULTY_MAP[place.difficulty] && (() => {
                          const d = DIFFICULTY_MAP[place.difficulty];
                          return (
                            <div className="flex items-center gap-0.5 px-1.5 py-0.5 rounded-full"
                              style={{ backgroundColor: `${d.color}18` }}>
                              <span className="material-icons" style={{ fontSize: '9px', color: d.color }}>{d.icon}</span>
                              <span className="text-[9px] font-bold" style={{ color: d.color }}>{d.label}</span>
                            </div>
                          );
                        })()}
                      </div>
                      {place.restTypes?.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-1.5">
                          {place.restTypes.map(rt => {
                            const t = REST_TYPES.find(r => r.key === rt);
                            if (!t) return null;
                            return (
                              <span
                                key={rt}
                                className="text-[9px] font-bold rounded-full px-1.5 py-0.5 flex items-center gap-0.5"
                                style={{ backgroundColor: t.bg, color: t.color }}
                              >
                                <span className="material-icons" style={{ fontSize: '9px' }}>{t.icon}</span>
                                {t.label}
                              </span>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </aside>

        {/* ===== 지도 ===== */}
        <div className="flex-1 relative">
          <MapContainer
            center={[37.5665, 126.9780]}
            zoom={12}
            style={{ width: '100%', height: '100%' }}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              minZoom={6}
              maxZoom={19}
            />

            {flyTarget && <FlyToPlace center={flyTarget} />}
            <FitBoundsOnRegion places={filteredPlaces} regionL1={regionL1} regionL2={regionL2} isDomestic={isDomestic} />

            {/* 내 위치 마커 */}
            {myLocation && (
              <Marker
                position={myLocation}
                icon={L.divIcon({
                  className: '',
                  html: `<div style="
                    width: 16px; height: 16px; border-radius: 50%;
                    background: #3B82F6; border: 3px solid white;
                    box-shadow: 0 0 0 5px rgba(59,130,246,0.3), 0 2px 8px rgba(0,0,0,0.4);
                  "></div>`,
                  iconSize: [16, 16],
                  iconAnchor: [8, 8],
                })}
              >
                <Popup>
                  <p style={{ fontWeight: 'bold', fontSize: '13px' }}>📍 내 현재 위치</p>
                </Popup>
              </Marker>
            )}

            {/* 외부에서 선택된 장소 강조 마커 */}
            {resolvedHighlight?.lat && (
              <Marker
                position={[resolvedHighlight.lat, resolvedHighlight.lng]}
                icon={createSelectedMarker()}
              >
                <Popup>
                  <div style={{ minWidth: '160px' }}>
                    <p style={{ fontWeight: 'bold', marginBottom: '4px' }}>{resolvedHighlight.name}</p>
                    <p style={{ fontSize: '12px', color: '#64748B' }}>{resolvedHighlight.location}</p>
                    {resolvedHighlight.desc && (
                      <p style={{ fontSize: '11px', color: '#94A3B8', marginTop: '4px' }}>{resolvedHighlight.desc}</p>
                    )}
                  </div>
                </Popup>
              </Marker>
            )}

            {filteredPlaces.map(place =>
              place.latitude && place.longitude ? (
                <Marker
                  key={selectedPlaceId === place.id ? `sel-${place.id}` : `place-${place.id}`}
                  position={[place.latitude, place.longitude]}
                  icon={selectedPlaceId === place.id ? createSelectedMarker() : createColorMarker(currentType.color)}
                  eventHandlers={{ click: () => handleMarkerClick(place) }}
                />
              ) : null
            )}

            {/* 선택된 장소 카드 — 핀 위에 표시 */}
            {selectedPlace?.latitude && selectedPlace?.longitude && (
              <PlaceCard
                place={selectedPlace}
                currentType={currentType}
                onClose={() => setSelectedPlaceId(null)}
              />
            )}
          </MapContainer>

          {/* 유형 범례 */}
          {selectedType && (
            <div className="absolute bottom-6 right-4 bg-white rounded-xl shadow-md border border-slate-200 px-3 py-2 flex items-center gap-2 z-[1000]">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: currentType.color }} />
              <span className="text-xs font-bold text-slate-700">{currentType.label}</span>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}

export default MapPage;
