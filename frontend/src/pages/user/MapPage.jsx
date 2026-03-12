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
  const highlightPlace = location.state?.highlightPlace || null;
  const flyToMyLocation = location.state?.flyToMyLocation || false;

  const [selectedType, setSelectedType] = useState('nature');
  const [places, setPlaces] = useState([]);
  const [loading, setLoading] = useState(false);
  const [keyword, setKeyword] = useState('');
  const [myLocation, setMyLocation] = useState(null);
  const [flyTarget, setFlyTarget] = useState(
    highlightPlace?.lat ? [highlightPlace.lat, highlightPlace.lng] : null
  );
  const [sheetExpanded, setSheetExpanded] = useState(false);

  useEffect(() => {
    loadPlaces();
  }, [selectedType]);

  useEffect(() => {
    if (!flyToMyLocation) return;
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const coords = [pos.coords.latitude, pos.coords.longitude];
        setMyLocation(coords);
        setFlyTarget(coords);
      },
      () => {}
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

  // 바텀시트 높이: 접힘(240px) / 펼침(60vh)
  const sheetHeight = sheetExpanded ? '60vh' : '240px';

  return (
    <div className="flex flex-col bg-[#F9F7F2]" style={{ height: '100vh' }}>
      <UserNavbar />

      {/* ===== 전체 레이아웃: 지도 위 + 바텀시트 아래 ===== */}
      <div className="relative flex-1 overflow-hidden">

        {/* ===== 지도 영역 (전체 배경) ===== */}
        <div
          className="absolute inset-0 transition-all duration-300"
          style={{ bottom: sheetHeight }}
        >
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

            {highlightPlace?.lat && (
              <Marker
                position={[highlightPlace.lat, highlightPlace.lng]}
                icon={createHighlightMarker(highlightPlace.color || '#10B981')}
              >
                <Popup>
                  <div style={{ minWidth: '160px' }}>
                    <p style={{ fontWeight: 'bold', marginBottom: '4px' }}>{highlightPlace.name}</p>
                    <p style={{ fontSize: '12px', color: '#64748B' }}>{highlightPlace.location}</p>
                    {highlightPlace.desc && (
                      <p style={{ fontSize: '11px', color: '#94A3B8', marginTop: '4px' }}>{highlightPlace.desc}</p>
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
        </div>

        {/* ===== 지도 위 오버레이: 검색바 ===== */}
        <div className="absolute top-3 left-0 right-0 px-4 z-[1000]">
          <form onSubmit={handleSearch}>
            <div className="relative max-w-lg mx-auto">
              <span className="material-icons absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-xl">search</span>
              <input
                className="w-full pl-11 pr-10 py-3 bg-white rounded-2xl text-sm text-slate-800 shadow-lg shadow-black/10 border border-white/80 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all placeholder:text-slate-400"
                placeholder="장소 또는 주소 검색"
                value={keyword}
                onChange={e => setKeyword(e.target.value)}
              />
              {keyword && (
                <button
                  type="button"
                  onClick={() => { setKeyword(''); loadPlaces(); }}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2"
                >
                  <span className="material-icons text-slate-400 text-base">close</span>
                </button>
              )}
            </div>
          </form>
        </div>

        {/* ===== 지도 위 오버레이: 필터 칩 ===== */}
        <div className="absolute top-16 left-0 right-0 z-[1000] px-4">
          <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
            {REST_TYPES.map(type => {
              const isSelected = selectedType === type.key;
              return (
                <button
                  key={type.key}
                  onClick={() => setSelectedType(type.key)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap shadow-sm transition-all shrink-0"
                  style={{
                    backgroundColor: isSelected ? type.color : 'white',
                    color: isSelected ? '#fff' : type.color,
                    border: `1.5px solid ${isSelected ? type.color : '#e2e8f0'}`,
                    boxShadow: isSelected ? `0 2px 8px ${type.color}44` : '0 1px 4px rgba(0,0,0,0.08)',
                  }}
                >
                  <span className="material-icons" style={{ fontSize: '13px' }}>{type.icon}</span>
                  {type.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* ===== 내 위치 버튼 ===== */}
        {flyToMyLocation && myLocation && (
          <div className="absolute left-4 z-[1000]" style={{ bottom: `calc(${sheetHeight} + 12px)` }}>
            <div className="flex items-center gap-1.5 bg-blue-500 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg">
              <span className="material-icons text-white" style={{ fontSize: '13px' }}>my_location</span>
              내 위치
            </div>
          </div>
        )}

        {/* ===== 범례 ===== */}
        {selectedType && (
          <div
            className="absolute right-4 z-[1000]"
            style={{ bottom: `calc(${sheetHeight} + 12px)` }}
          >
            <div className="flex items-center gap-1.5 bg-white rounded-xl shadow-md border border-slate-100 px-3 py-1.5">
              <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: currentType.color }} />
              <span className="text-xs font-bold text-slate-600">{currentType.label}</span>
            </div>
          </div>
        )}

        {/* ===== 바텀시트 ===== */}
        <div
          className="absolute bottom-0 left-0 right-0 bg-white rounded-t-3xl shadow-2xl z-[1000] flex flex-col transition-all duration-300"
          style={{ height: sheetHeight }}
        >
          {/* 핸들바 + 헤더 */}
          <button
            className="w-full flex flex-col items-center pt-3 pb-2 shrink-0"
            onClick={() => setSheetExpanded(v => !v)}
          >
            <div className="w-10 h-1 bg-slate-200 rounded-full mb-3" />
            <div className="w-full px-5 flex items-center justify-between">
              <div>
                <p className="text-[13px] font-extrabold text-slate-800 text-left">
                  {loading ? '검색 중...' : `장소 ${places.length}곳`}
                </p>
                {currentType.path && (
                  <Link
                    to={currentType.path}
                    onClick={e => e.stopPropagation()}
                    className="flex items-center gap-0.5 text-[11px] font-semibold mt-0.5"
                    style={{ color: currentType.color }}
                  >
                    <span className="material-icons" style={{ fontSize: '11px' }}>{currentType.icon}</span>
                    {currentType.label} 유형 알아보기
                    <span className="material-icons" style={{ fontSize: '11px' }}>arrow_forward</span>
                  </Link>
                )}
              </div>
              <span className="material-icons text-slate-400 text-lg">
                {sheetExpanded ? 'keyboard_arrow_down' : 'keyboard_arrow_up'}
              </span>
            </div>
          </button>

          {/* 선택된 외부 장소 배너 */}
          {highlightPlace && (
            <div className="mx-4 mb-2 px-3 py-2 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center gap-2 shrink-0">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-emerald-700 truncate">{highlightPlace.name}</p>
                <p className="text-[11px] text-emerald-500 truncate">{highlightPlace.location}</p>
              </div>
            </div>
          )}

          {/* 장소 목록 */}
          <div className="flex-1 overflow-y-auto px-4 pb-4">
            {loading ? (
              <div className="flex justify-center items-center h-24">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary" />
              </div>
            ) : places.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-28 text-slate-400 text-center">
                <span className="material-icons text-3xl mb-1.5">location_off</span>
                <p className="text-sm font-semibold">등록된 장소가 없어요</p>
                <p className="text-xs mt-1 text-slate-300 leading-relaxed">
                  공공데이터 크롤링 후 장소가 표시돼요
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {places.map(place => (
                  <button
                    key={place.id}
                    onClick={() => navigate(`/places/${place.id}`)}
                    className="w-full flex items-center gap-3 p-3 rounded-2xl bg-slate-50 hover:bg-slate-100 transition-colors text-left"
                  >
                    {/* 아이콘 */}
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                      style={{ backgroundColor: `${currentType.color}18` }}
                    >
                      <span className="material-icons text-base" style={{ color: currentType.color }}>
                        {currentType.icon}
                      </span>
                    </div>

                    {/* 정보 */}
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-slate-800 text-sm truncate">{place.name}</p>
                      <p className="text-xs text-slate-400 truncate mt-0.5">{place.address}</p>
                    </div>

                    {/* 우측: AI 점수 + 화살표 */}
                    <div className="flex flex-col items-end gap-0.5 shrink-0">
                      {place.aiScore && (
                        <div className="flex items-center gap-0.5">
                          <span className="material-icons text-amber-400 text-xs">star</span>
                          <span className="text-xs font-bold text-slate-600">{Number(place.aiScore).toFixed(1)}</span>
                        </div>
                      )}
                      <span
                        className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                        style={{ backgroundColor: `${currentType.color}18`, color: currentType.color }}
                      >
                        {currentType.label}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default MapPage;
