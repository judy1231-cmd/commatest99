import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import UserNavbar from '../../../components/user/UserNavbar';
import { fetchWithAuth } from '../../../api/fetchWithAuth';

const TYPE_INFO = {
  physical:  { name: '신체적 이완', icon: 'fitness_center', color: '#EF4444', bg: 'from-red-400 to-rose-500' },
  mental:    { name: '정신적 고요', icon: 'spa',            color: '#10B981', bg: 'from-emerald-400 to-teal-500' },
  sensory:   { name: '감각의 정화', icon: 'visibility_off', color: '#F59E0B', bg: 'from-amber-400 to-orange-500' },
  emotional: { name: '정서적 지지', icon: 'favorite',       color: '#EC4899', bg: 'from-pink-400 to-rose-500' },
  social:    { name: '사회적 휴식', icon: 'groups',         color: '#8B5CF6', bg: 'from-violet-400 to-purple-500' },
  nature:    { name: '자연과의 연결', icon: 'forest',       color: '#059669', bg: 'from-green-400 to-emerald-600' },
  creative:  { name: '창조적 몰입', icon: 'brush',          color: '#F97316', bg: 'from-orange-400 to-amber-500' },
};

const TODAY = new Date().toLocaleDateString('ko-KR', { month: 'long', day: 'numeric', weekday: 'long' });

function SkeletonCard() {
  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden flex animate-pulse">
      <div className="w-28 shrink-0 bg-slate-100" />
      <div className="flex-1 p-4 space-y-2.5">
        <div className="h-3 w-16 bg-slate-100 rounded-full" />
        <div className="h-4 w-40 bg-slate-200 rounded-full" />
        <div className="h-3 w-32 bg-slate-100 rounded-full" />
        <div className="h-3 w-24 bg-slate-100 rounded-full" />
      </div>
    </div>
  );
}

function RecommendHome() {
  const navigate = useNavigate();
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const data = await fetchWithAuth('/api/recommendations');
        if (data.success && Array.isArray(data.data)) {
          setRecommendations(data.data.filter(r => r.placeName));
        }
      } catch { /* 무시 */ } finally { setLoading(false); }
    })();
  }, []);

  return (
    <>
      <UserNavbar />
      <main className="min-h-screen bg-[#F7F7F8]">
        <div className="max-w-2xl mx-auto px-5 pt-8 pb-24">

          {/* 헤더 */}
          <div className="mb-7">
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-1">{TODAY}</p>
            <h1 className="text-[26px] font-extrabold text-slate-800 tracking-tight leading-snug">
              오늘 당신에게<br />추천하는 휴식
            </h1>
            <p className="text-sm text-slate-400 mt-2">진단 결과 기반으로 선별한 맞춤 장소예요.</p>
          </div>

          {/* 로딩 */}
          {loading && (
            <div className="space-y-4">
              {[1, 2, 3].map(i => <SkeletonCard key={i} />)}
            </div>
          )}

          {/* 빈 상태 */}
          {!loading && recommendations.length === 0 && (
            <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-10 text-center">
              <div className="relative inline-flex items-center justify-center w-24 h-24 mb-6">
                <div className="absolute inset-0 bg-emerald-50 rounded-3xl rotate-6" />
                <div className="absolute inset-0 bg-emerald-100 rounded-3xl -rotate-3" />
                <span className="material-icons text-5xl text-emerald-400 relative">auto_awesome</span>
              </div>

              <h3 className="text-lg font-extrabold text-slate-800 mb-1">아직 추천이 없어요</h3>
              <p className="text-sm text-slate-400 mb-8 leading-relaxed">
                진단을 먼저 받으면<br />나에게 꼭 맞는 장소를 추천해드려요.
              </p>

              {/* 단계 안내 */}
              <div className="space-y-3 mb-8 text-left">
                {[
                  { icon: 'favorite', label: '심박수 측정', sub: '현재 몸 상태를 확인해요', path: '/heartrate', color: 'text-red-400 bg-red-50' },
                  { icon: 'psychology', label: '휴식 유형 진단', sub: '설문으로 나에게 맞는 유형 도출', path: '/rest-test', color: 'text-violet-400 bg-violet-50' },
                  { icon: 'place', label: '맞춤 장소 추천', sub: '진단 결과 기반으로 자동 추천', path: null, color: 'text-emerald-400 bg-emerald-50' },
                ].map((step, i) => (
                  <div key={i} className="flex items-center gap-3 px-4 py-3 bg-slate-50 rounded-xl">
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${step.color}`}>
                      <span className="material-icons text-lg">{step.icon}</span>
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-bold text-slate-700">{step.label}</p>
                      <p className="text-xs text-slate-400">{step.sub}</p>
                    </div>
                    <span className={`text-lg font-black ${i < 2 ? 'text-slate-200' : 'text-emerald-300'}`}>
                      {i < 2 ? `0${i + 1}` : '✓'}
                    </span>
                  </div>
                ))}
              </div>

              <Link
                to="/rest-test"
                className="inline-flex items-center gap-2 px-7 py-3.5 bg-primary text-white font-bold rounded-2xl hover:bg-primary/90 transition-all shadow-lg shadow-emerald-100 text-sm"
              >
                <span className="material-icons text-base">psychology</span>
                진단 시작하기
              </Link>
            </div>
          )}

          {/* 추천 카드 목록 */}
          {!loading && recommendations.length > 0 && (
            <div className="space-y-4">
              {recommendations.map((rec) => {
                const criteriaType = rec.criteria?.split(' ')[0]?.toLowerCase();
                const typeInfo = TYPE_INFO[criteriaType] || TYPE_INFO.mental;
                return (
                  <div
                    key={rec.id}
                    className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden flex hover:shadow-md hover:border-slate-200 transition-all cursor-pointer"
                    onClick={() => navigate('/map')}
                  >
                    {/* 좌측 이미지 영역 */}
                    <div className={`w-28 shrink-0 bg-gradient-to-br ${typeInfo.bg} flex items-center justify-center`}>
                      <span className="material-icons text-4xl text-white/90">{typeInfo.icon}</span>
                    </div>

                    {/* 우측 정보 영역 */}
                    <div className="flex-1 min-w-0 p-4">
                      {/* 유형 태그 */}
                      <span
                        className="inline-block text-[10px] font-bold px-2 py-0.5 rounded-full mb-2"
                        style={{ backgroundColor: `${typeInfo.color}15`, color: typeInfo.color }}
                      >
                        {typeInfo.name}
                      </span>

                      {/* 장소명 */}
                      <p className="font-extrabold text-slate-800 text-base truncate leading-tight">{rec.placeName}</p>

                      {/* 주소 */}
                      <div className="flex items-center gap-1 mt-1.5">
                        <span className="material-icons text-[13px] text-slate-300">location_on</span>
                        <p className="text-xs text-slate-400 truncate">{rec.placeAddress || '주소 정보 없음'}</p>
                      </div>

                      {/* 추천 기준 */}
                      {rec.criteria && (
                        <div className="flex items-center gap-1 mt-1">
                          <span className="material-icons text-[13px] text-slate-300">info</span>
                          <p className="text-xs text-slate-400 truncate">{rec.criteria}</p>
                        </div>
                      )}
                    </div>

                    {/* 화살표 */}
                    <div className="flex items-center pr-4">
                      <span className="material-icons text-slate-200">chevron_right</span>
                    </div>
                  </div>
                );
              })}

              {/* 전체 기록 보기 */}
              <Link
                to="/recommend/history"
                className="flex items-center justify-center gap-2 w-full py-3.5 border border-slate-200 bg-white rounded-2xl text-sm font-bold text-slate-500 hover:border-primary/30 hover:text-primary transition-all"
              >
                <span className="material-icons text-base">history</span>
                전체 추천 기록 보기
              </Link>
            </div>
          )}
        </div>
      </main>
    </>
  );
}

export default RecommendHome;
