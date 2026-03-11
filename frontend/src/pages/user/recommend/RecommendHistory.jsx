import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import UserNavbar from '../../../components/user/UserNavbar';
import { fetchWithAuth } from '../../../api/fetchWithAuth';

const CATEGORY_INFO = {
  physical:  { name: '신체적 이완', icon: 'fitness_center', color: '#EF4444', bg: 'from-red-400 to-rose-500' },
  mental:    { name: '정신적 고요', icon: 'spa',            color: '#10B981', bg: 'from-emerald-400 to-teal-500' },
  sensory:   { name: '감각의 정화', icon: 'visibility_off', color: '#F59E0B', bg: 'from-amber-400 to-orange-500' },
  emotional: { name: '정서적 지지', icon: 'favorite',       color: '#EC4899', bg: 'from-pink-400 to-rose-500' },
  social:    { name: '사회적 휴식', icon: 'groups',         color: '#8B5CF6', bg: 'from-violet-400 to-purple-500' },
  nature:    { name: '자연의 연결', icon: 'forest',       color: '#059669', bg: 'from-green-400 to-emerald-600' },
  creative:  { name: '창조적 몰입', icon: 'brush',          color: '#F97316', bg: 'from-orange-400 to-amber-500' },
};

function formatDate(dateStr) {
  const date = new Date(dateStr);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);

  if (date.toDateString() === today.toDateString()) return '오늘';
  if (date.toDateString() === yesterday.toDateString()) return '어제';
  return date.toLocaleDateString('ko-KR', { month: 'long', day: 'numeric', weekday: 'short' });
}

// 날짜 기준으로 기록 그룹핑
function groupByDate(list) {
  return list.reduce((acc, item) => {
    const dateKey = new Date(item.recommendedAt).toDateString();
    if (!acc[dateKey]) acc[dateKey] = { label: formatDate(item.recommendedAt), items: [] };
    acc[dateKey].items.push(item);
    return acc;
  }, {});
}

function SkeletonItem() {
  return (
    <div className="flex items-center gap-4 bg-white rounded-2xl border border-slate-100 p-4 animate-pulse">
      <div className="w-11 h-11 rounded-xl bg-slate-100 shrink-0" />
      <div className="flex-1 space-y-2">
        <div className="h-4 w-36 bg-slate-200 rounded-full" />
        <div className="h-3 w-20 bg-slate-100 rounded-full" />
      </div>
    </div>
  );
}

function RecommendHistory() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchWithAuth('/api/recommendations/history');
      if (data.success && data.data) {
        setHistory(data.data);
      } else {
        setError(data.message || '추천 기록을 불러오지 못했어요.');
      }
    } catch {
      setError('서버에 연결할 수 없습니다.');
    } finally {
      setLoading(false);
    }
  };

  const grouped = groupByDate(history);
  const dateKeys = Object.keys(grouped);

  return (
    <div className="min-h-screen bg-[#F7F7F8]">
      <UserNavbar />

      <main className="max-w-2xl mx-auto px-5 pt-8 pb-24">

        {/* 헤더 */}
        <div className="mb-7">
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-1">Recommendation</p>
          <div className="flex items-end justify-between">
            <h1 className="text-[26px] font-extrabold text-slate-800 tracking-tight">추천 기록</h1>
            {!loading && history.length > 0 && (
              <span className="text-sm font-bold text-slate-400 mb-1">
                총 <span className="text-primary">{history.length}</span>건
              </span>
            )}
          </div>
          <p className="text-sm text-slate-400 mt-1">나에게 추천된 휴식 콘텐츠 목록이에요.</p>
        </div>

        {/* 로딩 */}
        {loading && (
          <div className="space-y-3">
            <div className="h-6 w-16 bg-slate-200 rounded-full animate-pulse mb-4" />
            {[1, 2, 3, 4].map(i => <SkeletonItem key={i} />)}
          </div>
        )}

        {/* 에러 */}
        {!loading && error && (
          <div className="bg-red-50 border border-red-100 rounded-2xl p-5 flex items-start gap-3">
            <span className="material-icons text-red-400 text-xl mt-0.5">error_outline</span>
            <div>
              <p className="text-sm font-bold text-red-600 mb-0.5">불러오기 실패</p>
              <p className="text-xs text-red-400">{error}</p>
              <button
                onClick={loadHistory}
                className="mt-3 text-xs font-bold text-red-500 underline underline-offset-2"
              >
                다시 시도
              </button>
            </div>
          </div>
        )}

        {/* 빈 상태 */}
        {!loading && !error && dateKeys.length === 0 && (
          <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-10 text-center">
            <div className="relative inline-flex items-center justify-center w-24 h-24 mb-6">
              <div className="absolute inset-0 bg-slate-50 rounded-3xl rotate-6" />
              <div className="absolute inset-0 bg-slate-100 rounded-3xl -rotate-3" />
              <span className="material-icons text-5xl text-slate-300 relative">history</span>
            </div>
            <h3 className="text-lg font-extrabold text-slate-800 mb-1">아직 추천 기록이 없어요</h3>
            <p className="text-sm text-slate-400 mb-8 leading-relaxed">
              진단을 받으면 맞춤 추천이 시작되고<br />여기에 기록이 쌓여요.
            </p>
            <Link
              to="/diagnosis"
              className="inline-flex items-center gap-2 px-7 py-3.5 bg-primary text-white font-bold rounded-2xl hover:bg-primary/90 transition-all shadow-lg shadow-emerald-100 text-sm"
            >
              <span className="material-icons text-base">psychology</span>
              진단 받기
            </Link>
          </div>
        )}

        {/* 날짜별 그룹 목록 */}
        {!loading && !error && dateKeys.map((dateKey) => {
          const group = grouped[dateKey];
          return (
            <div key={dateKey} className="mb-6">
              {/* Sticky 날짜 헤더 */}
              <div className="sticky top-0 z-10 bg-[#F7F7F8] py-2 mb-2">
                <div className="flex items-center gap-2.5">
                  <span className="text-[13px] font-extrabold text-slate-700">{group.label}</span>
                  <span className="px-2 py-0.5 bg-slate-200 text-slate-500 text-[10px] font-bold rounded-full">
                    {group.items.length}건
                  </span>
                  <div className="flex-1 h-px bg-slate-200" />
                </div>
              </div>

              {/* 아이템 목록 */}
              <div className="space-y-2.5">
                {group.items.map((item) => {
                  const cat = CATEGORY_INFO[item.restType] || CATEGORY_INFO.mental;
                  return (
                    <Link
                      key={item.id}
                      to={item.contentId ? `/contents/${item.contentId}` : '#'}
                      className="flex items-center gap-4 bg-white rounded-2xl border border-slate-100 shadow-sm p-4 hover:border-primary/20 hover:shadow-md transition-all"
                    >
                      {/* 유형 아이콘 */}
                      <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${cat.bg} flex items-center justify-center shrink-0 shadow-sm`}>
                        <span className="material-icons text-xl text-white">{cat.icon}</span>
                      </div>

                      {/* 콘텐츠 정보 */}
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-slate-800 text-sm truncate">
                          {item.contentTitle || '추천 콘텐츠'}
                        </p>
                        <div className="flex items-center gap-2 mt-1 flex-wrap">
                          <span
                            className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                            style={{ backgroundColor: `${cat.color}15`, color: cat.color }}
                          >
                            {cat.name}
                          </span>
                          {item.recommendedAt && (
                            <span className="text-[11px] text-slate-400 flex items-center gap-0.5">
                              <span className="material-icons text-[12px]">schedule</span>
                              {new Date(item.recommendedAt).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* 저장 배지 + 화살표 */}
                      <div className="flex items-center gap-1.5 shrink-0">
                        {item.saved && (
                          <span className="material-icons text-amber-400 text-lg">bookmark</span>
                        )}
                        {item.clicked && (
                          <span className="material-icons text-emerald-400 text-lg">check_circle</span>
                        )}
                        <span className="material-icons text-slate-200 text-xl">chevron_right</span>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          );
        })}
      </main>
    </div>
  );
}

export default RecommendHistory;
