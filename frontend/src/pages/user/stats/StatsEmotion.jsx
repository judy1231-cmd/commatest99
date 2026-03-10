import { useState, useEffect } from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, ReferenceLine,
} from 'recharts';
import { fetchWithAuth } from '../../../api/fetchWithAuth';
import UserNavbar from '../../../components/user/UserNavbar';

const PERIODS = [
  { label: '1주', days: 7 },
  { label: '1개월', days: 30 },
  { label: '3개월', days: 90 },
];

const EMOTION_LABELS = {
  1: '매우 힘듦', 2: '힘듦', 3: '조금 힘듦',
  4: '보통', 5: '보통', 6: '괜찮음',
  7: '좋음', 8: '좋음', 9: '매우 좋음', 10: '최고!',
};

function getEmotionColor(score) {
  if (score <= 3) return '#EF4444';
  if (score <= 5) return '#94A3B8';
  if (score <= 7) return '#10B981';
  return '#059669';
}

// 날짜 포맷 (기간에 따라 다르게)
function formatXAxis(dateStr, days) {
  const d = new Date(dateStr);
  if (days <= 7) return `${d.getMonth() + 1}/${d.getDate()}`;
  if (days <= 30) return `${d.getDate()}일`;
  return `${d.getMonth() + 1}월`;
}

// 커스텀 툴팁
function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  const score = payload[0]?.value;
  return (
    <div className="bg-white border border-slate-100 rounded-xl shadow-lg px-4 py-3 text-sm">
      <p className="text-slate-400 text-xs mb-1">{label}</p>
      <p className="font-bold text-slate-800">{score}점</p>
      <p className="text-xs" style={{ color: getEmotionColor(score) }}>{EMOTION_LABELS[score]}</p>
    </div>
  );
}

// 기간 내 날짜별 평균 계산
function aggregateByDate(logs, days) {
  const now = new Date();
  const from = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);

  const filtered = logs.filter((l) => new Date(l.recordedAt) >= from);

  const dateMap = {};
  for (const log of filtered) {
    const key = new Date(log.recordedAt).toLocaleDateString('ko-KR');
    if (!dateMap[key]) dateMap[key] = { sum: 0, count: 0, date: log.recordedAt };
    dateMap[key].sum += log.score;
    dateMap[key].count += 1;
  }

  return Object.entries(dateMap)
    .map(([date, { sum, count, date: raw }]) => ({
      date,
      raw,
      score: Math.round((sum / count) * 10) / 10,
    }))
    .sort((a, b) => new Date(a.raw) - new Date(b.raw));
}

function StatsEmotion() {
  const [logs, setLogs] = useState([]);
  const [period, setPeriod] = useState(PERIODS[0]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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

  const chartData = aggregateByDate(logs, period.days);

  // 통계 요약
  const scores = chartData.map((d) => d.score);
  const avgScore = scores.length ? Math.round((scores.reduce((a, b) => a + b, 0) / scores.length) * 10) / 10 : null;
  const maxScore = scores.length ? Math.max(...scores) : null;
  const minScore = scores.length ? Math.min(...scores) : null;
  const latestScore = scores.length ? scores[scores.length - 1] : null;

  return (
    <div className="min-h-screen bg-[#F9F7F2]">
      <UserNavbar />

      <main className="max-w-lg mx-auto px-4 pt-6 pb-24">

        {/* 헤더 */}
        <div className="mb-6">
          <h1 className="text-xl font-bold text-slate-800">나의 감정 변화</h1>
          <p className="text-sm text-slate-400 mt-0.5">감정 점수의 흐름을 확인해요</p>
        </div>

        {/* 기간 필터 */}
        <div className="flex gap-2 mb-6">
          {PERIODS.map((p) => (
            <button
              key={p.label}
              onClick={() => setPeriod(p)}
              className={`flex-1 py-2 rounded-xl text-sm font-bold transition-all ${
                period.label === p.label
                  ? 'bg-primary text-white shadow-sm'
                  : 'bg-white border border-slate-200 text-slate-500 hover:border-primary hover:text-primary'
              }`}
            >
              {p.label}
            </button>
          ))}
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
            {/* 요약 카드 */}
            <div className="grid grid-cols-4 gap-3 mb-5">
              {[
                { label: '평균', value: avgScore ?? '-', unit: '점' },
                { label: '최고', value: maxScore ?? '-', unit: '점' },
                { label: '최저', value: minScore ?? '-', unit: '점' },
                { label: '최근', value: latestScore ?? '-', unit: '점' },
              ].map((stat) => (
                <div key={stat.label} className="bg-white rounded-2xl p-3 border border-slate-100 shadow-sm text-center">
                  <p className="text-xs text-slate-400 mb-1">{stat.label}</p>
                  <p className="text-lg font-bold text-slate-800">{stat.value}</p>
                  {stat.value !== '-' && <p className="text-xs text-slate-400">{stat.unit}</p>}
                </div>
              ))}
            </div>

            {/* 라인 차트 */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 mb-5">
              <h2 className="text-sm font-bold text-slate-700 mb-4">
                {period.label} 감정 변화
              </h2>

              {chartData.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-40 text-slate-300">
                  <span className="material-icons text-4xl mb-2">show_chart</span>
                  <p className="text-sm">이 기간에 감정 기록이 없어요</p>
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={220}>
                  <LineChart data={chartData} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis
                      dataKey="date"
                      tickFormatter={(v) => formatXAxis(v, period.days)}
                      tick={{ fontSize: 11, fill: '#94a3b8' }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis
                      domain={[1, 10]}
                      ticks={[1, 3, 5, 7, 10]}
                      tick={{ fontSize: 11, fill: '#94a3b8' }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    {/* 기준선: 5점 (보통) */}
                    <ReferenceLine y={5} stroke="#e2e8f0" strokeDasharray="4 4" />
                    <Line
                      type="monotone"
                      dataKey="score"
                      stroke="#10b981"
                      strokeWidth={2.5}
                      dot={{ r: 4, fill: '#10b981', strokeWidth: 2, stroke: '#fff' }}
                      activeDot={{ r: 6, fill: '#10b981', stroke: '#fff', strokeWidth: 2 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              )}

              {/* 범례 */}
              <div className="flex items-center gap-4 mt-3 text-xs text-slate-400 justify-center">
                <span className="flex items-center gap-1">
                  <span className="w-6 h-0.5 bg-primary inline-block rounded" />
                  감정 점수 (1~10)
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-6 h-0.5 border-t border-dashed border-slate-300 inline-block" />
                  기준선 (5점)
                </span>
              </div>
            </div>

            {/* 감정 분포 */}
            {chartData.length > 0 && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
                <h2 className="text-sm font-bold text-slate-700 mb-4">감정 분포</h2>
                <div className="space-y-2.5">
                  {[
                    { label: '좋음 (7~10점)', range: [7, 10], color: '#10B981' },
                    { label: '보통 (4~6점)', range: [4, 6],  color: '#94A3B8' },
                    { label: '힘듦 (1~3점)', range: [1, 3],  color: '#EF4444' },
                  ].map(({ label, range, color }) => {
                    const count = scores.filter((s) => s >= range[0] && s <= range[1]).length;
                    const pct = scores.length ? Math.round((count / scores.length) * 100) : 0;
                    return (
                      <div key={label}>
                        <div className="flex justify-between text-xs mb-1">
                          <span className="text-slate-600 font-medium">{label}</span>
                          <span className="font-bold" style={{ color }}>{pct}%</span>
                        </div>
                        <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
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
