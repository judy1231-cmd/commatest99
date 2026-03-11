import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import UserNavbar from '../../../components/user/UserNavbar';
import { fetchWithAuth } from '../../../api/fetchWithAuth';

const TYPE_INFO = {
  physical:  { name: '신체적 이완', icon: 'fitness_center', color: '#EF4444' },
  mental:    { name: '정신적 고요', icon: 'spa',            color: '#10B981' },
  sensory:   { name: '감각의 정화', icon: 'visibility_off', color: '#F59E0B' },
  emotional: { name: '정서적 지지', icon: 'favorite',       color: '#EC4899' },
  social:    { name: '사회적 휴식', icon: 'groups',         color: '#8B5CF6' },
  nature:    { name: '자연과의 연결', icon: 'forest',       color: '#059669' },
  creative:  { name: '창조적 몰입', icon: 'brush',          color: '#F97316' },
};

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
      <main className="min-h-screen bg-[#F9F7F2]">
        <div className="max-w-2xl mx-auto px-4 pt-8 pb-24">

          {/* 헤더 */}
          <div className="mb-6">
            <h1 className="text-xl font-bold text-slate-800">맞춤 추천</h1>
            <p className="text-sm text-slate-400 mt-1">진단 결과 기반으로 추천된 장소예요.</p>
          </div>

          {loading ? (
            <div className="flex justify-center items-center h-40">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
            </div>
          ) : recommendations.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-12 text-center">
              <span className="material-icons text-5xl text-slate-200 mb-3 block">auto_awesome</span>
              <p className="font-semibold text-slate-600 mb-1">아직 추천이 없어요</p>
              <p className="text-sm text-slate-400 mb-6">진단을 받으면 맞춤 장소를 추천해드려요.</p>
              <Link to="/rest-test"
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary text-white font-bold rounded-xl hover:bg-primary/90 transition-all text-sm">
                <span className="material-icons text-base">psychology</span>
                진단 받기
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {recommendations.map((rec) => {
                const criteriaType = rec.criteria?.split(' ')[0]?.toLowerCase();
                const typeInfo = TYPE_INFO[criteriaType] || TYPE_INFO.mental;
                return (
                  <div key={rec.id}
                    className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 hover:border-primary/30 transition-all cursor-pointer"
                    onClick={() => navigate('/map')}>
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0"
                        style={{ backgroundColor: `${typeInfo.color}15` }}>
                        <span className="material-icons text-xl" style={{ color: typeInfo.color }}>{typeInfo.icon}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-slate-800 truncate">{rec.placeName}</p>
                        <p className="text-xs text-slate-400 truncate mt-0.5">{rec.placeAddress || '주소 없음'}</p>
                      </div>
                      <span className="material-icons text-slate-300">chevron_right</span>
                    </div>
                    {rec.criteria && (
                      <p className="text-xs text-slate-400 mt-2 ml-14">{rec.criteria}</p>
                    )}
                  </div>
                );
              })}
              <div className="pt-2 text-center">
                <Link to="/recommend/history" className="text-sm text-primary font-medium hover:underline">
                  전체 추천 기록 보기 →
                </Link>
              </div>
            </div>
          )}
        </div>
      </main>
    </>
  );
}

export default RecommendHome;
