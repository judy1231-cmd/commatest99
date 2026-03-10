import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import UserNavbar from '../../../components/user/UserNavbar';
import { fetchWithAuth } from '../../../api/fetchWithAuth';

const CATEGORY_INFO = {
  physical:  { name: '신체적 이완', icon: 'fitness_center', color: '#EF4444' },
  mental:    { name: '정신적 고요', icon: 'spa',            color: '#10B981' },
  sensory:   { name: '감각의 정화', icon: 'visibility_off', color: '#F59E0B' },
  emotional: { name: '정서적 지지', icon: 'favorite',       color: '#EC4899' },
  social:    { name: '사회적 휴식', icon: 'groups',         color: '#8B5CF6' },
  nature:    { name: '자연과의 연결', icon: 'forest',       color: '#059669' },
  creative:  { name: '창조적 몰입', icon: 'brush',          color: '#F97316' },
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

  // ── 로딩 ──
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

  const grouped = groupByDate(history);
  const dateKeys = Object.keys(grouped);

  return (
    <div className="min-h-screen bg-[#F9F7F2]">
      <UserNavbar />

      <main className="max-w-lg mx-auto px-4 pt-6 pb-24">

        {/* 헤더 */}
        <div className="mb-6">
          <h1 className="text-xl font-bold text-slate-800">추천 기록</h1>
          <p className="text-sm text-slate-400 mt-1">나에게 추천된 휴식 콘텐츠 목록이에요.</p>
        </div>

        {/* 에러 */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-4 mb-4 text-sm text-red-600 flex items-center gap-2">
            <span className="material-icons text-base">error_outline</span>
            {error}
          </div>
        )}

        {/* 기록 없음 */}
        {!error && dateKeys.length === 0 && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center">
            <span className="material-icons text-5xl text-slate-200 mb-3 block">history</span>
            <p className="font-semibold text-slate-600 mb-1">아직 추천 기록이 없어요</p>
            <p className="text-sm text-slate-400 mb-6">진단을 받으면 맞춤 추천이 시작돼요.</p>
            <Link
              to="/diagnosis"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary text-white font-bold rounded-xl hover:bg-primary/90 transition-all text-sm"
            >
              <span className="material-icons text-base">psychology</span>
              심리 진단 받기
            </Link>
          </div>
        )}

        {/* 날짜별 기록 목록 */}
        {dateKeys.map((dateKey) => {
          const group = grouped[dateKey];
          return (
            <div key={dateKey} className="mb-6">
              {/* 날짜 구분선 */}
              <div className="flex items-center gap-3 mb-3">
                <span className="text-sm font-bold text-slate-500">{group.label}</span>
                <div className="flex-1 h-px bg-slate-200" />
                <span className="text-xs text-slate-400">{group.items.length}건</span>
              </div>

              <div className="space-y-3">
                {group.items.map((item) => {
                  const cat = CATEGORY_INFO[item.restType] || CATEGORY_INFO.mental;
                  return (
                    <Link
                      key={item.id}
                      to={item.contentId ? `/contents/${item.contentId}` : '#'}
                      className="flex items-center gap-4 bg-white rounded-2xl shadow-sm border border-gray-100 p-4 hover:border-primary/30 hover:bg-primary/5 transition-all"
                    >
                      {/* 유형 아이콘 */}
                      <div
                        className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0"
                        style={{ backgroundColor: `${cat.color}15` }}
                      >
                        <span className="material-icons text-xl" style={{ color: cat.color }}>
                          {cat.icon}
                        </span>
                      </div>

                      {/* 콘텐츠 정보 */}
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-slate-800 text-sm truncate">
                          {item.contentTitle || '추천 콘텐츠'}
                        </p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span
                            className="text-xs font-medium px-2 py-0.5 rounded-full"
                            style={{ backgroundColor: `${cat.color}15`, color: cat.color }}
                          >
                            {cat.name}
                          </span>
                          {item.recommendedAt && (
                            <span className="text-xs text-slate-400">
                              {new Date(item.recommendedAt).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* 클릭/저장 여부 */}
                      <div className="flex items-center gap-2 shrink-0">
                        {item.saved && (
                          <span className="material-icons text-amber-400 text-lg">bookmark</span>
                        )}
                        <span className="material-icons text-slate-300">chevron_right</span>
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
