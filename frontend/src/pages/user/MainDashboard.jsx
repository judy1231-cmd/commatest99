import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { fetchWithAuth } from '../../api/fetchWithAuth';
import UserNavbar from '../../components/user/UserNavbar';

const categories = [
  { icon: 'fitness_center', label: '신체적 이완', bg: 'bg-pale-blue', iconColor: 'text-primary', path: '/rest/physical' },
  { icon: 'spa', label: '정신적 고요', bg: 'bg-soft-mint', iconColor: 'text-emerald-500', path: '/rest/mental' },
  { icon: 'visibility_off', label: '감각의 정화', bg: 'bg-warm-beige', iconColor: 'text-amber-500', path: '/rest/sensory' },
  { icon: 'favorite_border', label: '정서적 지지', bg: 'bg-red-50', iconColor: 'text-rose-400', path: '/rest/emotional' },
  { icon: 'groups', label: '사회적 휴식', bg: 'bg-purple-50', iconColor: 'text-purple-400', path: '/rest/social' },
  { icon: 'brush', label: '창조적 몰입', bg: 'bg-orange-50', iconColor: 'text-orange-400', path: '/rest/creative' },
  { icon: 'forest', label: '자연의 연결', bg: 'bg-slate-50', iconColor: 'text-slate-500', path: '/rest/nature' },
];

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

function formatMinutes(minutes) {
  if (!minutes) return '0시간';
  if (minutes < 60) return `${minutes}분`;
  return `${Math.floor(minutes / 60)}시간`;
}

function MainDashboard() {
  const navigate = useNavigate();
  const isLoggedIn = !!localStorage.getItem('accessToken');
  const [places, setPlaces] = useState([]);
  const [monthlyStats, setMonthlyStats] = useState(null);
  const [placesLoading, setPlacesLoading] = useState(true);

  useEffect(() => {
    loadPlaces();
    if (isLoggedIn) loadMonthlyStats();
  }, [isLoggedIn]);

  const loadPlaces = async () => {
    try {
      const res = await fetch('/api/places?page=1&size=3&status=approved');
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
    <div className="min-h-screen bg-[#F9F7F2]">
      <UserNavbar />

      <main className="max-w-7xl mx-auto px-6 py-10 space-y-16 pb-24 md:pb-10">

        {/* 진단 소개 섹션 */}
        <section>
          <div className="text-center mb-10">
            <h2 className="text-2xl font-bold text-slate-800 mb-2">나에게 맞는 진단을 선택하세요</h2>
            <p className="text-slate-500 text-sm">몸의 신호를 읽는 방법부터 마음을 돌보는 방법까지, 3가지 방식으로 지금 상태를 확인해보세요</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* 심박수 체크 */}
            <Link to="/heartrate" className="relative overflow-hidden group rounded-2xl bg-white border border-gray-100 shadow-soft hover:shadow-hover transition-all">
              <div className="bg-gradient-to-br from-soft-mint to-emerald-50/30 p-7 pb-5">
                <div className="flex items-center gap-2 mb-3">
                  <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                  <span className="text-xs font-bold text-emerald-600 tracking-wider">HEALTH CHECK</span>
                  <span className="ml-auto text-[10px] font-bold text-emerald-600 bg-emerald-100 px-2 py-0.5 rounded-full">객관적 측정</span>
                </div>
                <h2 className="text-xl font-bold text-slate-800 mb-1">심박수 체크</h2>
                <p className="text-primary font-semibold text-sm">스마트워치로 실시간 스트레스 측정</p>
              </div>
              <div className="p-7 pt-5">
                <p className="text-slate-500 text-sm leading-relaxed mb-4">
                  심장 박동 데이터를 분석해서 지금 내 몸이 얼마나 긴장하고 있는지 객관적으로 확인해요.
                </p>
                <div className="space-y-2.5 mb-5">
                  <div className="flex items-start gap-2.5">
                    <span className="material-icons text-emerald-500 text-base mt-0.5">monitor_heart</span>
                    <div>
                      <p className="text-xs font-bold text-slate-700">BPM (분당 심박수)</p>
                      <p className="text-xs text-slate-400">1분에 심장이 뛰는 횟수예요. 안정 시 60~80이 정상이고, 높을수록 긴장 상태</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <span className="material-icons text-emerald-500 text-base mt-0.5">timeline</span>
                    <div>
                      <p className="text-xs font-bold text-slate-700">HRV (심박변이도)</p>
                      <p className="text-xs text-slate-400">심장 박동 간격의 미세한 변화예요. HRV가 높을수록 몸이 편안한 상태</p>
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-400">Apple Watch / Galaxy Watch 연동</span>
                  <span className="bg-emerald-500 text-white font-bold py-2 px-5 rounded-xl flex items-center gap-1.5 text-sm group-hover:bg-emerald-600 transition-colors">
                    <span className="material-icons text-base">favorite</span>
                    측정
                  </span>
                </div>
              </div>
            </Link>

            {/* 휴식유형 테스트 */}
            <Link to="/rest-test" className="relative overflow-hidden group rounded-2xl bg-white border border-gray-100 shadow-soft hover:shadow-hover transition-all">
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50/30 p-7 pb-5">
                <div className="flex items-center gap-2 mb-3">
                  <span className="w-2 h-2 rounded-full bg-primary"></span>
                  <span className="text-xs font-bold text-primary tracking-wider">REST TYPE</span>
                  <span className="ml-auto text-[10px] font-bold text-primary bg-blue-100 px-2 py-0.5 rounded-full">가장 인기</span>
                </div>
                <h2 className="text-xl font-bold text-slate-800 mb-1">휴식 유형 진단</h2>
                <p className="text-primary font-semibold text-sm">14가지 시나리오로 나를 알아가기</p>
              </div>
              <div className="p-7 pt-5">
                <p className="text-slate-500 text-sm leading-relaxed mb-4">
                  일상 속 상황을 골라보면 지금 나에게 가장 필요한 휴식이 7가지 유형 중 어디인지 알 수 있어요.
                </p>
                <div className="space-y-2.5 mb-5">
                  <div className="flex items-start gap-2.5">
                    <span className="material-icons text-primary text-base mt-0.5">category</span>
                    <div>
                      <p className="text-xs font-bold text-slate-700">7가지 휴식 유형 분류</p>
                      <p className="text-xs text-slate-400">신체, 정신, 감각, 정서, 사회, 자연, 창조 중 나에게 맞는 유형을 찾아요</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <span className="material-icons text-primary text-base mt-0.5">bolt</span>
                    <div>
                      <p className="text-xs font-bold text-slate-700">MBTI처럼 재미있는 시나리오</p>
                      <p className="text-xs text-slate-400">"이상적인 주말 오후는?" 같은 질문에 답하면 끝. 약 2분이면 완료</p>
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-400">14문항 / 약 2분 소요</span>
                  <span className="bg-primary text-white font-bold py-2 px-5 rounded-xl flex items-center gap-1.5 text-sm group-hover:bg-primary/90 transition-colors">
                    <span className="material-icons text-base">psychology</span>
                    시작
                  </span>
                </div>
              </div>
            </Link>

            {/* 스트레스 심화 진단 (PSS) */}
            <Link to="/stress-test" className="relative overflow-hidden group rounded-2xl bg-white border border-gray-100 shadow-soft hover:shadow-hover transition-all">
              <div className="bg-gradient-to-br from-amber-50 to-orange-50/30 p-7 pb-5">
                <div className="flex items-center gap-2 mb-3">
                  <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                  <span className="text-xs font-bold text-amber-600 tracking-wider">PSS STANDARD</span>
                  <span className="ml-auto text-[10px] font-bold text-amber-600 bg-amber-100 px-2 py-0.5 rounded-full">국제 표준</span>
                </div>
                <h2 className="text-xl font-bold text-slate-800 mb-1">스트레스 진단</h2>
                <p className="text-amber-600 font-semibold text-sm">전 세계가 사용하는 PSS 검사</p>
              </div>
              <div className="p-7 pt-5">
                <p className="text-slate-500 text-sm leading-relaxed mb-4">
                  내 스트레스가 정확히 얼마나 되는지 수치로 확인하고 싶다면 이 검사가 딱이에요.
                </p>
                <div className="space-y-2.5 mb-5">
                  <div className="flex items-start gap-2.5">
                    <span className="material-icons text-amber-500 text-base mt-0.5">verified</span>
                    <div>
                      <p className="text-xs font-bold text-slate-700">PSS (지각된 스트레스 척도)</p>
                      <p className="text-xs text-slate-400">1983년 개발, 전 세계 수만 건 연구에서 검증된 가장 신뢰도 높은 도구</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <span className="material-icons text-amber-500 text-base mt-0.5">score</span>
                    <div>
                      <p className="text-xs font-bold text-slate-700">0~40점 스트레스 지수</p>
                      <p className="text-xs text-slate-400">낮음(0~13) / 보통(14~26) / 높음(27~40)으로 명확하게 알려드려요</p>
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-400">10문항 / 약 3분 소요</span>
                  <span className="bg-amber-500 text-white font-bold py-2 px-5 rounded-xl flex items-center gap-1.5 text-sm group-hover:bg-amber-600 transition-colors">
                    <span className="material-icons text-base">psychology_alt</span>
                    진단
                  </span>
                </div>
              </div>
            </Link>
          </div>
        </section>

        {/* Categories */}
        <section>
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="text-xl font-bold text-slate-800">휴식 카테고리</h3>
              <p className="text-xs text-slate-400 mt-1">오늘 당신의 기분에 맞는 휴식을 선택해보세요</p>
            </div>
          </div>
          <div className="flex gap-5 overflow-x-auto pb-6 hide-scrollbar">
            {categories.map((cat, i) => (
              <Link
                key={i}
                to={cat.path}
                className={`flex-shrink-0 flex flex-col items-center gap-3 p-5 min-w-[120px] rounded-2xl bg-white border-2 shadow-soft transition-all ${i === 0 ? 'border-primary ring-4 ring-primary/5' : 'border-slate-50 hover:border-primary/20'}`}
              >
                <div className={`w-12 h-12 rounded-full ${cat.bg} flex items-center justify-center`}>
                  <span className={`material-icons ${cat.iconColor}`}>{cat.icon}</span>
                </div>
                <span className={`text-xs font-bold ${i === 0 ? 'text-slate-700' : 'text-slate-500'}`}>{cat.label}</span>
              </Link>
            ))}
          </div>
        </section>

        {/* Recommended Places */}
        <section>
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-6 bg-primary rounded-full"></div>
              <h3 className="text-xl font-bold text-slate-800">실시간 추천 장소</h3>
            </div>
            <Link to="/map" className="text-primary text-sm font-bold flex items-center hover:underline">
              지도에서 보기 <span className="material-icons text-sm ml-1">map</span>
            </Link>
          </div>

          {placesLoading ? (
            <div className="flex justify-center items-center h-40">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
            </div>
          ) : places.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-2xl border border-slate-100">
              <span className="material-icons text-5xl text-slate-300 block mb-3">location_off</span>
              <p className="text-slate-400 text-sm">아직 등록된 장소가 없어요</p>
              <Link to="/map" className="mt-3 inline-block text-primary text-sm font-bold hover:underline">
                지도에서 탐색하기 →
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {places.map((place) => {
                const firstPhoto = place.photos?.[0]?.photoUrl;
                const firstTag = place.tags?.[0];
                const tagColor = firstTag ? (REST_TYPE_TAG_COLORS[firstTag.restType] || 'text-primary border-blue-50') : 'text-primary border-blue-50';

                return (
                  <Link
                    key={place.id}
                    to={`/places/${place.id}`}
                    className="group rounded-2xl overflow-hidden bg-white border border-slate-100 shadow-soft hover:shadow-hover transition-all duration-300"
                  >
                    <div className="relative h-52 overflow-hidden bg-slate-100">
                      {firstPhoto ? (
                        <img
                          alt={place.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                          src={firstPhoto}
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <span className="material-icons text-slate-300 text-5xl">landscape</span>
                        </div>
                      )}
                      {firstTag && (
                        <div className={`absolute top-4 left-4 bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-lg text-[10px] font-bold shadow-sm border ${tagColor}`}>
                          {firstTag.tagName}
                        </div>
                      )}
                    </div>
                    <div className="p-6">
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-bold text-lg text-slate-800">{place.name}</h4>
                        {place.aiScore != null && (
                          <div className="flex items-center text-amber-400">
                            <span className="material-icons text-base">star</span>
                            <span className="text-sm ml-1 font-bold text-slate-700">{place.aiScore.toFixed(1)}</span>
                          </div>
                        )}
                      </div>
                      <p className="text-slate-500 text-sm leading-relaxed line-clamp-2 mb-4">{place.address}</p>
                      <div className="flex items-center justify-between pt-4 border-t border-slate-50">
                        <span className="text-xs font-medium text-slate-400 flex items-center gap-1">
                          <span className="material-icons text-xs">location_on</span> {place.address?.split(' ').slice(0, 2).join(' ')}
                        </span>
                        <span className="text-primary text-sm font-bold flex items-center gap-1">
                          상세보기 <span className="material-icons text-sm">chevron_right</span>
                        </span>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </section>

        {/* Stats - 로그인 시에만 표시 */}
        {isLoggedIn && (
          <section className="grid grid-cols-1 lg:grid-cols-3 gap-8 pb-12">
            {/* Monthly Stats Chart */}
            <div className="lg:col-span-2 bg-white border border-slate-100 rounded-2xl p-8 shadow-soft">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h3 className="text-xl font-bold text-slate-800">월간 휴식 통계</h3>
                  <p className="text-xs text-slate-400 mt-1">지난 한 달간 당신의 휴식 패턴 분석입니다</p>
                </div>
              </div>

              {monthlyStats ? (
                <div className="flex flex-col md:flex-row gap-10 items-center justify-center">
                  <div className="relative w-48 h-48 flex-shrink-0">
                    <div
                      className="absolute inset-0 rounded-full"
                      style={{ background: 'conic-gradient(#34D399 0% 35%, #60A5FA 35% 65%, #FBBF24 65% 85%, #F87171 85% 100%)' }}
                    />
                    <div className="absolute inset-4 bg-white rounded-full flex flex-col items-center justify-center shadow-inner">
                      <span className="text-slate-400 text-xs font-semibold">총 휴식</span>
                      <span className="text-2xl font-bold text-slate-800">{formatMinutes(monthlyStats.totalRestMinutes)}</span>
                    </div>
                  </div>
                  <div className="flex-1 w-full space-y-4">
                    {typeRatios.length > 0 ? typeRatios.map((s, i) => (
                      <div key={s.type} className="space-y-1.5">
                        <div className="flex justify-between items-center text-sm">
                          <span className="font-bold text-slate-700 flex items-center gap-2">
                            <span className={`w-3 h-3 rounded-full ${STAT_COLORS[i]}`}></span>
                            {s.type}
                          </span>
                          <span className="text-slate-500 font-medium">{s.pct}%</span>
                        </div>
                        <div className="w-full bg-slate-50 h-2 rounded-full overflow-hidden">
                          <div className={`h-full rounded-full ${STAT_COLORS[i]}`} style={{ width: `${s.pct}%` }} />
                        </div>
                      </div>
                    )) : (
                      <p className="text-slate-400 text-sm">이번 달 기록이 없어요</p>
                    )}
                  </div>
                </div>
              ) : (
                <div className="text-center py-10">
                  <p className="text-slate-400 text-sm">아직 이번 달 기록이 없어요</p>
                  <Link to="/rest-record" className="mt-2 inline-block text-primary text-sm font-bold hover:underline">
                    첫 번째 휴식 기록하기 →
                  </Link>
                </div>
              )}
            </div>

            {/* My Stats */}
            <div className="bg-primary text-white rounded-2xl p-8 flex flex-col justify-between overflow-hidden relative shadow-lg shadow-blue-100">
              <div className="z-10">
                <h3 className="text-2xl font-bold mb-3">나의 휴식 지표</h3>
                <p className="text-white/80 text-sm leading-relaxed">이번 달 휴식 현황이에요.</p>
              </div>
              <div className="z-10 flex flex-col gap-4 mt-10">
                <div className="bg-white/10 backdrop-blur-md p-5 rounded-2xl flex items-center justify-between border border-white/10">
                  <div>
                    <p className="text-[10px] font-bold text-white/60 uppercase tracking-widest mb-1">총 휴식 시간</p>
                    <p className="text-xl font-bold">{monthlyStats ? formatMinutes(monthlyStats.totalRestMinutes) : '0분'}</p>
                  </div>
                  <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                    <span className="material-icons">schedule</span>
                  </div>
                </div>
                <div className="bg-white/10 backdrop-blur-md p-5 rounded-2xl flex items-center justify-between border border-white/10">
                  <div>
                    <p className="text-[10px] font-bold text-white/60 uppercase tracking-widest mb-1">기록 횟수</p>
                    <p className="text-xl font-bold">{monthlyStats?.logCount || 0}회</p>
                  </div>
                  <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                    <span className="material-icons">event_note</span>
                  </div>
                </div>
              </div>
              <div className="absolute -bottom-12 -right-12 text-[180px] font-black text-white/5 select-none pointer-events-none">쉼</div>
            </div>
          </section>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-100 py-16 bg-white">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-10">
          <div className="flex flex-col items-center md:items-start gap-4">
            <div className="flex items-center gap-3">
              <div className="w-7 h-7 bg-primary rounded-full flex items-center justify-center shadow-sm overflow-hidden">
                <img src="/logo_comma.png" alt="쉼표" className="w-3.5 h-3.5 object-contain" />
              </div>
              <h1 className="text-xl font-bold tracking-tight text-slate-800">쉼표</h1>
            </div>
            <p className="text-slate-400 text-xs">© 2024 Comma Inc. All rights reserved. 완벽한 휴식을 선사합니다.</p>
          </div>
          <div className="flex gap-10 text-sm font-semibold text-slate-500">
            <button className="hover:text-primary transition-colors">이용약관</button>
            <button className="hover:text-primary transition-colors">개인정보처리방침</button>
            <button className="hover:text-primary transition-colors">고객센터</button>
          </div>
        </div>
      </footer>

      {/* Floating Timer Button */}
      <button
        onClick={() => navigate('/rest-test')}
        className="fixed bottom-10 right-10 w-16 h-16 bg-white text-primary rounded-full shadow-2xl flex items-center justify-center group hover:scale-110 transition-transform ring-4 ring-primary/5 border border-primary/10 z-40"
      >
        <span className="material-icons text-3xl">psychology</span>
        <span className="absolute right-20 bg-slate-800 text-white px-5 py-2.5 rounded-xl text-xs font-bold opacity-0 group-hover:opacity-100 transition-opacity shadow-xl whitespace-nowrap pointer-events-none">
          휴식 유형 진단하기
        </span>
      </button>
    </div>
  );
}

export default MainDashboard;
