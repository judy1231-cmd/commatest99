import { useState, useEffect } from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, ReferenceLine,
} from 'recharts';
import { fetchWithAuth } from '../../../api/fetchWithAuth';
import UserNavbar from '../../../components/user/UserNavbar';

const MONTH_NAMES = ['1월','2월','3월','4월','5월','6월','7월','8월','9월','10월','11월','12월'];

const EMOTION_LABELS = {
  1: '매우 힘듦', 2: '힘듦', 3: '조금 힘듦',
  4: '보통', 5: '보통', 6: '괜찮음',
  7: '좋음', 8: '좋음', 9: '매우 좋음', 10: '최고!',
};

const EMOTION_BANDS = [
  { label: '좋음', range: [7, 10], color: '#10B981', bg: '#ECFDF5', emoji: '😊' },
  { label: '보통', range: [4, 6],  color: '#94A3B8', bg: '#F1F5F9', emoji: '😐' },
  { label: '힘듦', range: [1, 3],  color: '#EF4444', bg: '#FEF2F2', emoji: '😔' },
];

function getEmotionColor(score) {
  if (score <= 3) return '#EF4444';
  if (score <= 5) return '#94A3B8';
  if (score <= 7) return '#10B981';
  return '#059669';
}

function getWeekOfMonth(date) {
  const firstDay = new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  return Math.ceil((date.getDate() + firstDay) / 7);
}

function weeksInMonth(year, month) {
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  return Math.ceil((daysInMonth + firstDay) / 7);
}

function aggregateByDate(logsToProcess) {
  const dateMap = {};
  for (const log of logsToProcess) {
    const key = new Date(log.recordedAt).toLocaleDateString('ko-KR');
    if (!dateMap[key]) dateMap[key] = { sum: 0, count: 0, raw: log.recordedAt };
    dateMap[key].sum += log.score;
    dateMap[key].count += 1;
  }
  return Object.entries(dateMap)
    .map(([, { sum, count, raw }]) => ({
      date: String(raw).slice(5, 10),
      raw,
      score: Math.round((sum / count) * 10) / 10,
    }))
    .sort((a, b) => new Date(a.raw) - new Date(b.raw));
}

function CustomTooltip({ active, payload }) {
  if (!active || !payload?.length) return null;
  const score = payload[0]?.value;
  const d = payload[0]?.payload?.date;
  return (
    <div className="bg-white border border-slate-100 rounded-xl shadow-lg px-4 py-3 text-sm">
      {d && <p className="text-slate-400 text-xs mb-1">{d}</p>}
      <p className="font-bold text-slate-800">{score}점</p>
      <p className="text-xs mt-0.5" style={{ color: getEmotionColor(Math.round(score)) }}>
        {EMOTION_LABELS[Math.round(score)] || ''}
      </p>
    </div>
  );
}

function StatsEmotion() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // UI-only navigation states (no API calls)
  const [activeTab, setActiveTab] = useState('monthly');
  const [currentMonth, setCurrentMonth] = useState(() => {
    const now = new Date();
    return { year: now.getFullYear(), month: now.getMonth() };
  });
  const [currentWeek, setCurrentWeek] = useState(() => {
    const now = new Date();
    return { year: now.getFullYear(), month: now.getMonth(), week: getWeekOfMonth(now) };
  });

  useEffect(() => { loadLogs(); }, []);

  const loadLogs = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchWithAuth('/api/emotion-logs?size=200');
      if (data.success && data.data) {
        setLogs(data.data);
      } else {
        setError(data.message || '데이터를 불러오지 못했어요.');
      }
    } catch {
      setError('서버에 연결할 수 없습니다.');
    } finally {
      setLoading(false);
    }
  };

  // Month navigation
  const prevMonth = () => setCurrentMonth((prev) => {
    const d = new Date(prev.year, prev.month - 1);
    return { year: d.getFullYear(), month: d.getMonth() };
  });
  const nextMonth = () => setCurrentMonth((prev) => {
    const d = new Date(prev.year, prev.month + 1);
    const now = new Date();
    if (d.getFullYear() > now.getFullYear() || (d.getFullYear() === now.getFullYear() && d.getMonth() > now.getMonth())) return prev;
    return { year: d.getFullYear(), month: d.getMonth() };
  });

  // Week navigation
  const prevWeek = () => setCurrentWeek((prev) => {
    if (prev.week > 1) return { ...prev, week: prev.week - 1 };
    const d = new Date(prev.year, prev.month - 1);
    const total = weeksInMonth(d.getFullYear(), d.getMonth());
    return { year: d.getFullYear(), month: d.getMonth(), week: total };
  });
  const nextWeek = () => setCurrentWeek((prev) => {
    const now = new Date();
    const nowWeek = { year: now.getFullYear(), month: now.getMonth(), week: getWeekOfMonth(now) };
    const isAtNow = prev.year === nowWeek.year && prev.month === nowWeek.month && prev.week === nowWeek.week;
    if (isAtNow) return prev;
    const total = weeksInMonth(prev.year, prev.month);
    if (prev.week < total) return { ...prev, week: prev.week + 1 };
    const d = new Date(prev.year, prev.month + 1);
    return { year: d.getFullYear(), month: d.getMonth(), week: 1 };
  });

  // 기간 필터 (UI-only)
  const filteredLogs = logs.filter((l) => {
    const d = new Date(l.recordedAt);
    if (activeTab === 'monthly') {
      return d.getFullYear() === currentMonth.year && d.getMonth() === currentMonth.month;
    }
    return (
      d.getFullYear() === currentWeek.year &&
      d.getMonth() === currentWeek.month &&
      getWeekOfMonth(d) === currentWeek.week
    );
  });

  const chartData = aggregateByDate(filteredLogs);

  // 통계 요약
  const scores = chartData.map((d) => d.score);
  const avgScore = scores.length
    ? Math.round((scores.reduce((a, b) => a + b, 0) / scores.length) * 10) / 10
    : null;
  const maxScore = scores.length ? Math.max(...scores) : null;
  const minScore = scores.length ? Math.min(...scores) : null;
  const latestScore = scores.length ? scores[scores.length - 1] : null;
  const latestColor = latestScore != null ? getEmotionColor(Math.round(latestScore)) : '#94A3B8';

  const periodLabel = activeTab === 'monthly'
    ? `${currentMonth.year}년 ${MONTH_NAMES[currentMonth.month]}`
    : `${currentWeek.year}년 ${MONTH_NAMES[currentWeek.month]} ${currentWeek.week}주차`;

  return (
    <div className="min-h-screen bg-[#F7F7F8]">
      <UserNavbar />

      <main className="max-w-lg mx-auto px-4 pt-6 pb-24">

        {/* 헤더 */}
        <div className="mb-5">
          <h1 className="text-[22px] font-extrabold tracking-tight text-slate-800">나의 감정 변화</h1>
          <p className="text-xs text-slate-400 mt-0.5">감정 점수의 흐름을 확인해요</p>
        </div>

        {/* 탭 */}
        <div className="flex bg-slate-100 rounded-2xl p-1 mb-4">
          {[['monthly', '월간'], ['weekly', '주간']].map(([tab, label]) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 py-2 rounded-xl text-sm font-bold transition-all ${
                activeTab === tab ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-400'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* 기간 네비게이터 */}
        <div className="flex items-center justify-between mb-5">
          <button
            onClick={activeTab === 'monthly' ? prevMonth : prevWeek}
            className="w-9 h-9 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-500 hover:border-primary hover:text-primary transition-colors"
          >
            <span className="material-icons text-base">chevron_left</span>
          </button>
          <span className="text-sm font-bold text-slate-700">{periodLabel}</span>
          <button
            onClick={activeTab === 'monthly' ? nextMonth : nextWeek}
            className="w-9 h-9 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-500 hover:border-primary hover:text-primary transition-colors"
          >
            <span className="material-icons text-base">chevron_right</span>
          </button>
        </div>

        {/* 로딩 */}
        {loading && (
          <div className="flex justify-center items-center h-40">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
          </div>
        )}

        {/* 에러 */}
        {!loading && error && (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-4 text-sm text-red-600 flex items-center gap-2">
            <span className="material-icons text-base">error_outline</span>
            {error}
          </div>
        )}

        {!loading && !error && (
          <>
            {/* 히어로 요약 카드 */}
            <div
              className="rounded-3xl p-6 mb-5 relative overflow-hidden"
              style={{ background: 'linear-gradient(135deg, #FF7BAC 0%, #f43f5e 100%)' }}
            >
              <div className="absolute -right-8 -top-8 w-40 h-40 rounded-full bg-white/10 pointer-events-none" />
              <div className="absolute right-4 -bottom-6 w-24 h-24 rounded-full bg-white/10 pointer-events-none" />

              <p className="text-white/70 text-[11px] font-semibold uppercase tracking-wider mb-1 relative z-10">
                {periodLabel} 감정 평균
              </p>
              <p className="text-white text-[38px] font-black tracking-tight leading-none relative z-10 mb-1">
                {avgScore != null ? `${avgScore}점` : '-'}
              </p>
              {avgScore != null && (
                <p className="text-white/80 text-sm font-semibold relative z-10 mb-4">
                  {EMOTION_LABELS[Math.round(avgScore)] || ''}
                </p>
              )}

              <div className="flex items-center gap-5 relative z-10">
                <div>
                  <p className="text-white text-lg font-bold leading-tight">
                    {maxScore != null ? `${maxScore}점` : '-'}
                  </p>
                  <p className="text-white/60 text-[11px] mt-0.5">최고 점수</p>
                </div>
                <div className="w-px h-8 bg-white/20" />
                <div>
                  <p className="text-white text-lg font-bold leading-tight">
                    {minScore != null ? `${minScore}점` : '-'}
                  </p>
                  <p className="text-white/60 text-[11px] mt-0.5">최저 점수</p>
                </div>
                <div className="w-px h-8 bg-white/20" />
                <div>
                  <p className="text-white text-lg font-bold leading-tight">
                    {chartData.length}회
                  </p>
                  <p className="text-white/60 text-[11px] mt-0.5">기록 수</p>
                </div>
              </div>
            </div>

            {/* 최근 감정 배너 */}
            {latestScore != null && (
              <div
                className="rounded-2xl p-4 mb-5 flex items-center gap-4"
                style={{ backgroundColor: `${latestColor}15` }}
              >
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0 text-2xl"
                  style={{ backgroundColor: `${latestColor}25` }}
                >
                  {EMOTION_BANDS.find((b) => latestScore >= b.range[0] && latestScore <= b.range[1])?.emoji || '😐'}
                </div>
                <div>
                  <p className="text-xs text-slate-400 mb-0.5">가장 최근 감정 점수</p>
                  <p className="font-bold text-slate-800">
                    {latestScore}점 — {EMOTION_LABELS[Math.round(latestScore)]}
                  </p>
                </div>
              </div>
            )}

            {/* 라인 차트 */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 mb-5">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-sm font-bold text-slate-700">감정 변화 추이</h2>
                <div className="flex items-center gap-3 text-[10px] text-slate-400">
                  <span className="flex items-center gap-1">
                    <span className="w-5 h-0.5 rounded bg-[#FF7BAC] inline-block" />
                    감정 점수
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="w-5 h-0 border-t border-dashed border-slate-300 inline-block" />
                    기준 (5점)
                  </span>
                </div>
              </div>

              {chartData.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-40 text-slate-300">
                  <span className="material-icons text-4xl mb-2">show_chart</span>
                  <p className="text-sm">이 기간에 감정 기록이 없어요</p>
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={220}>
                  <LineChart data={chartData} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                    <XAxis
                      dataKey="date"
                      tick={{ fontSize: 10, fill: '#94a3b8' }}
                      axisLine={false}
                      tickLine={false}
                      interval="preserveStartEnd"
                    />
                    <YAxis
                      domain={[1, 10]}
                      ticks={[1, 3, 5, 7, 10]}
                      tick={{ fontSize: 10, fill: '#94a3b8' }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <ReferenceLine y={5} stroke="#e2e8f0" strokeDasharray="4 3" strokeWidth={1.5} />
                    <Line
                      type="monotone"
                      dataKey="score"
                      stroke="#FF7BAC"
                      strokeWidth={2.5}
                      dot={{ r: 4, fill: '#FF7BAC', strokeWidth: 2, stroke: '#fff' }}
                      activeDot={{ r: 6, fill: '#FF7BAC', stroke: '#fff', strokeWidth: 2 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </div>

            {/* 감정 분포 */}
            {chartData.length > 0 && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
                <h2 className="text-sm font-bold text-slate-700 mb-4">감정 분포</h2>
                <div className="space-y-4">
                  {EMOTION_BANDS.map(({ label, range, color, emoji }) => {
                    const count = scores.filter((s) => s >= range[0] && s <= range[1]).length;
                    const pct = scores.length ? Math.round((count / scores.length) * 100) : 0;
                    return (
                      <div key={label}>
                        <div className="flex items-center justify-between mb-1.5">
                          <div className="flex items-center gap-2">
                            <span className="text-base">{emoji}</span>
                            <span
                              className="px-2 py-0.5 rounded-full text-[11px] font-bold text-white"
                              style={{ backgroundColor: color }}
                            >
                              {label} ({range[0]}~{range[1]}점)
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-xs">
                            <span className="text-slate-400">{count}회</span>
                            <span className="font-black w-9 text-right" style={{ color }}>{pct}%</span>
                          </div>
                        </div>
                        <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all duration-700"
                            style={{ width: `${pct}%`, backgroundColor: color }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}

export default StatsEmotion;
