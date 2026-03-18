import { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import UserNavbar from '../../components/user/UserNavbar';

// Leaflet 기본 마커 아이콘 경로 수정 (React 빌드 환경 이슈)
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

const REST_TYPES = [
  { key: '',          label: '전체',        icon: 'apps',           color: '#10B981', bg: '#F0FDF4', path: null              },
  { key: 'physical',  label: '신체적 이완', icon: 'fitness_center', color: '#4CAF82', bg: '#F0FAF5', path: '/rest/physical'  },
  { key: 'mental',    label: '정신적 고요', icon: 'spa',            color: '#5B8DEF', bg: '#F0F5FF', path: '/rest/mental'    },
  { key: 'sensory',   label: '감각의 정화', icon: 'visibility_off', color: '#9B6DFF', bg: '#F5F0FF', path: '/rest/sensory'   },
  { key: 'emotional', label: '정서적 지지', icon: 'favorite',       color: '#FF7BAC', bg: '#FFF0F5', path: '/rest/emotional' },
  { key: 'social',    label: '사회적 휴식', icon: 'groups',         color: '#FF9A3C', bg: '#FFF5EC', path: '/rest/social'    },
  { key: 'creative',  label: '창조적 몰입', icon: 'brush',          color: '#FFB830', bg: '#FFFBF0', path: '/rest/creative'  },
  { key: 'nature',    label: '자연의 연결', icon: 'forest',         color: '#2ECC9A', bg: '#F0FBF7', path: '/rest/nature'    },
];

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

// 강조 마커 (자연 연결 페이지에서 넘어온 장소)
function createHighlightMarker(color = '#10B981') {
  return L.divIcon({
    className: '',
    html: `<div style="
      width: 22px; height: 22px; border-radius: 50%;
      background: ${color}; border: 3px solid white;
      box-shadow: 0 0 0 4px ${color}55, 0 3px 10px rgba(0,0,0,0.4);
    "></div>`,
    iconSize: [22, 22],
    iconAnchor: [11, 11],
  });
}

function MapPage() {
  const navigate = useNavigate();
  const location = useLocation();
  // 자연 연결 등 다른 페이지에서 클릭해 넘어온 장소
  const highlightPlace = location.state?.highlightPlace || null;
  const flyToMyLocation = location.state?.flyToMyLocation || false;

  const [selectedType, setSelectedType] = useState('');
  const [places, setPlaces] = useState([]);
  const [loading, setLoading] = useState(false);
  const [keyword, setKeyword] = useState('');
  const [myLocation, setMyLocation] = useState(null);
  const [resolvedHighlight, setResolvedHighlight] = useState(highlightPlace || null);
  const [flyTarget, setFlyTarget] = useState(
    highlightPlace?.lat ? [highlightPlace.lat, highlightPlace.lng] : null
  );

  useEffect(() => {
    loadPlaces();
  }, [selectedType]);

  // 맞춤 추천에서 넘어온 경우 placeId로 좌표 fetch
  useEffect(() => {
    if (!highlightPlace?.placeId || highlightPlace?.lat) return;
    fetch(`/api/places/${highlightPlace.placeId}`)
      .then(r => r.json())
      .then(data => {
        if (data.success && data.data?.latitude) {
          const updated = {
            ...highlightPlace,
            lat: data.data.latitude,
            lng: data.data.longitude,
          };
          setResolvedHighlight(updated);
          setFlyTarget([data.data.latitude, data.data.longitude]);
        }
      })
      .catch(() => {});
  }, []);

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

  const loadPlaces = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: 1, size: 50 });
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
  };

  const handleSearch = (e) => {
    e.preventDefault();
    loadPlaces();
  };

  const handleMarkerClick = (place) => {
    if (place.latitude && place.longitude) {
      setFlyTarget([place.latitude, place.longitude]);
    }
  };

  const currentType = REST_TYPES.find(t => t.key === selectedType) || REST_TYPES[0];

  return (
    <div className="min-h-screen bg-[#F9F7F2]">
      <UserNavbar />
      <div className="flex flex-col md:flex-row" style={{ height: 'calc(100vh - 4rem)' }}>

        {/* ===== 사이드바 ===== */}
        <aside className="w-full md:w-96 bg-white border-r border-slate-200 flex flex-col overflow-hidden">

          {/* 뒤로가기 (추천에서 넘어온 경우) */}
          {resolvedHighlight && (
            <div className="px-4 pt-3 pb-1">
              <button
                onClick={() => navigate(-1)}
                className="flex items-center gap-1.5 text-[13px] font-bold text-slate-500 hover:text-primary transition-colors"
              >
                <span className="material-icons text-[18px]">arrow_back</span>
                이전 페이지로
              </button>
            </div>
          )}

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
              {loading ? '검색 중...' : `${places.length}개 장소`}
            </p>
          </div>

          {/* 장소 목록 */}
          <div className="flex-1 overflow-y-auto divide-y divide-slate-50">
            {loading ? (
              <div className="flex justify-center items-center h-32">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary" />
              </div>
            ) : places.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-40 text-slate-400 px-4 text-center">
                <span className="material-icons text-4xl mb-2">location_off</span>
                <p className="text-sm font-medium">등록된 장소가 없어요</p>
                <p className="text-xs mt-1 leading-relaxed">
                  학원에서 공공데이터 크롤링 스크립트를<br />실행하면 장소가 표시돼요
                </p>
              </div>
            ) : (
              places.map(place => (
                <div
                  key={place.id}
                  onClick={() => {
                    if (place.latitude && place.longitude) {
                      setFlyTarget([place.latitude, place.longitude]);
                    }
                  }}
                  className="p-4 cursor-pointer transition-colors hover:bg-slate-50"
                >
                  <div className="flex items-start gap-3">
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                      style={{ backgroundColor: `${currentType.color}20` }}
                    >
                      <span className="material-icons text-base" style={{ color: currentType.color }}>
                        {currentType.icon}
                      </span>
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
                      {place.aiScore && (
                        <div className="flex items-center gap-0.5 mt-1">
                          <span className="material-icons text-amber-400 text-xs">star</span>
                          <span className="text-xs font-bold text-slate-600">{Number(place.aiScore).toFixed(1)}</span>
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
                icon={createHighlightMarker(resolvedHighlight.color || '#10B981')}
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

            {places.map(place =>
              place.latitude && place.longitude ? (
                <Marker
                  key={place.id}
                  position={[place.latitude, place.longitude]}
                  icon={createColorMarker(currentType.color)}
                  eventHandlers={{ click: () => handleMarkerClick(place) }}
                >
                  <Popup>
                    <div style={{ minWidth: '160px' }}>
                      <p style={{ fontWeight: 'bold', marginBottom: '4px' }}>{place.name}</p>
                      <p style={{ fontSize: '12px', color: '#64748B' }}>{place.address}</p>
                      {place.operatingHours && (
                        <p style={{ fontSize: '11px', color: '#94A3B8', marginTop: '4px' }}>
                          {place.operatingHours}
                        </p>
                      )}
                    </div>
                  </Popup>
                </Marker>
              ) : null
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
