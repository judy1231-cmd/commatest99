import { useState, useEffect } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
  LineChart, Line, ReferenceLine,
} from 'recharts';
import { fetchWithAuth } from '../../../api/fetchWithAuth';
import UserNavbar from '../../../components/user/UserNavbar';

const REST_TYPE_INFO = {
  physical:  { name: '신체적 이완', shortName: '신체', icon: 'fitness_center', color: '#4CAF82' },
  mental:    { name: '정신적 고요', shortName: '정신', icon: 'spa',            color: '#5B8DEF' },
  sensory:   { name: '감각의 정화', shortName: '감각', icon: 'visibility_off', color: '#9B6DFF' },
  emotional: { name: '정서적 지지', shortName: '정서', icon: 'favorite',       color: '#FF7BAC' },
  social:    { name: '사회적 휴식', shortName: '사회', icon: 'groups',         color: '#FF9A3C' },
  nature:    { name: '자연의 연결', shortName: '자연', icon: 'forest',         color: '#2ECC9A' },
  creative:  { name: '창조적 몰입', shortName: '창조', icon: 'brush',          color: '#FFB830' },
};

const MONTH_NAMES = ['1월','2월','3월','4월','5월','6월','7월','8월','9월','10월','11월','12월'];

function getWeekOfMonth(date) {
  const firstDay = new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  return Math.ceil((date.getDate() + firstDay) / 7);
}

function weeksInMonth(year, month) {
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  return Math.ceil((daysInMonth + firstDay) / 7);
}

function BarTooltip({ active, payload }) {
  if (!active || !payload?.length) return null;
  const p = payload[0].payload;
  const info = REST_TYPE_INFO[p.type] || {};
  return (
    <div className="bg-white border border-slate-100 rounded-xl shadow-lg px-4 py-3 text-sm">
      <p className="font-bold text-slate-800">{info.name || p.name}</p>
      <p className="text-xs text-slate-500">{p.value}회</p>
      {p.isTop && <p className="text-xs text-primary font-bold mt-0.5">최다 유형 🏆</p>}
    </div>
  );
}

function StressTooltip({ active, payload }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-slate-100 rounded-xl shadow-lg px-3 py-2 text-sm">
      <p className="font-bold text-slate-800">{payload[0].value}점</p>
      <p className="text-xs text-slate-400">{payload[0].payload.date}</p>
    </div>
  );
}

function StatsDiagnosis() {
  const [records, setRecords] = useState([]);
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

  useEffect(() => { loadRecords(); }, []);

  const loadRecords = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchWithAuth('/api/diagnosis/history');
      if (data.success && data.data) {
        setRecords(data.data);
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

  // 기간 필터 (UI-only, no API)
  const filteredRecords = records.filter((r) => {
    const raw = r.diagnosedAt || r.createdAt || r.measuredAt || '';
    if (!raw) return false;
    const d = new Date(raw);
    if (activeTab === 'monthly') {
      return d.getFullYear() === currentMonth.year && d.getMonth() === currentMonth.month;
    }
    return (
      d.getFullYear() === currentWeek.year &&
      d.getMonth() === currentWeek.month &&
      getWeekOfMonth(d) === currentWeek.week
    );
  });

  // 유형별 횟수 집계
  const typeCountMap = {};
  for (const r of filteredRecords) {
    const key = r.primaryRestType;
    if (key) typeCountMap[key] = (typeCountMap[key] || 0) + 1;
  }

  const maxCount = Math.max(...Object.values(typeCountMap), 0);

  const barData = Object.keys(REST_TYPE_INFO).map((key) => {
    const count = typeCountMap[key] || 0;
    const info = REST_TYPE_INFO[key];
    return {
      type: key,
      name: info.shortName,
      value: count,
      color: info.color,
      isTop: count > 0 && count === maxCount,
    };
  });

  const topType = barData.find((d) => d.isTop);
  const topInfo = topType ? REST_TYPE_INFO[topType.type] : null;

  const avgStress = filteredRecords.length
    ? Math.round(filteredRecords.reduce((s, r) => s + (r.stressIndex || 0), 0) / filteredRecords.length)
    : null;

  // 스트레스 추이 라인 차트 데이터
  const stressLineData = filteredRecords
    .slice()
    .sort((a, b) => {
      const da = new Date(a.diagnosedAt || a.createdAt || 0);
      const db = new Date(b.diagnosedAt || b.createdAt || 0);
      return da - db;
    })
    .map((r, i) => {
      const raw = r.diagnosedAt || r.createdAt || '';
      const dateLabel = raw ? String(raw).slice(5, 10) : `#${i + 1}`;
      return { index: i + 1, stress: r.stressIndex || 0, date: dateLabel };
    });

  const periodLabel = activeTab === 'monthly'
    ? `${currentMonth.year}년 ${MONTH_NAMES[currentMonth.month]}`
    : `${currentWeek.year}년 ${MONTH_NAMES[currentWeek.month]} ${currentWeek.week}주차`;

  return (
    <div className="min-h-screen bg-[#F7F7F8]">
      <UserNavbar />

      <main className="max-w-lg mx-auto px-4 pt-6 pb-24">

        {/* 헤더 */}
        <div className="mb-5">
          <h1 className="text-[22px] font-extrabold tracking-tight text-slate-800">진단 유형 통계</h1>
          <p className="text-xs text-slate-400 mt-0.5">어떤 휴식 유형이 자주 나왔는지 확인해요</p>
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
              style={{ background: 'linear-gradient(135deg, #5B8DEF 0%, #4F46E5 100%)' }}
            >
              <div className="absolute -right-8 -top-8 w-40 h-40 rounded-full bg-white/10 pointer-events-none" />
              <div className="absolute right-4 -bottom-6 w-24 h-24 rounded-full bg-white/10 pointer-events-none" />

              <p className="text-white/70 text-[11px] font-semibold uppercase tracking-wider mb-1 relative z-10">
                {periodLabel} 진단 현황
              </p>
              <p className="text-white text-[38px] font-black tracking-tight leading-none relative z-10 mb-5">
                {filteredRecords.length}회
              </p>

              <div className="flex items-center gap-5 relative z-10">
                <div>
                  <p className="text-white text-lg font-bold leading-tight">
                    {avgStress != null ? `${avgStress}점` : '-'}
                  </p>
                  <p className="text-white/60 text-[11px] mt-0.5">평균 스트레스</p>
                </div>
                {topInfo && (
                  <>
                    <div className="w-px h-8 bg-white/20" />
                    <div>
                      <p className="text-white text-base font-bold leading-tight">{topInfo.name}</p>
                      <p className="text-white/60 text-[11px] mt-0.5">최다 유형</p>
                    </div>
                  </>
                )}
                <div className="w-px h-8 bg-white/20" />
                <div>
                  <p className="text-white text-lg font-bold leading-tight">{records.length}회</p>
                  <p className="text-white/60 text-[11px] mt-0.5">누적 진단</p>
                </div>
              </div>
            </div>

            {/* 최다 유형 배너 */}
            {topInfo && (
              <div
                className="rounded-2xl p-4 mb-5 flex items-center gap-4"
                style={{ backgroundColor: `${topInfo.color}12` }}
              >
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
                  style={{ backgroundColor: `${topInfo.color}25` }}
                >
                  <span className="material-icons text-2xl" style={{ color: topInfo.color }}>
                    {topInfo.icon}
                  </span>
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span
                      className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-white"
                      style={{ color: topInfo.color }}
                    >
                      최다 유형 🏆
                    </span>
                  </div>
                  <p className="font-bold text-slate-800 text-sm">{topInfo.name}</p>
                  <p className="text-xs text-slate-400 mt-0.5">이 기간 총 {topType.value}회 진단됐어요</p>
                </div>
              </div>
            )}

            {/* 스트레스 추이 라인 차트 */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 mb-5">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-sm font-bold text-slate-700">스트레스 점수 추이</h2>
                {avgStress != null && (
                  <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-amber-50 text-amber-500">
                    평균 {avgStress}점
                  </span>
                )}
              </div>

              {stressLineData.length < 2 ? (
                <div className="flex flex-col items-center justify-center h-36 text-slate-300">
                  <span className="material-icons text-4xl mb-2">show_chart</span>
                  <p className="text-sm">
                    {stressLineData.length === 0 ? '진단 기록이 없어요' : '2회 이상 진단하면 추이를 볼 수 있어요'}
                  </p>
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={180}>
                  <LineChart data={stressLineData} margin={{ top: 8, right: 8, left: -24, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                    <XAxis
                      dataKey="date"
                      tick={{ fontSize: 10, fill: '#94a3b8' }}
                      axisLine={false}
                      tickLine={false}
                      interval="preserveStartEnd"
                    />
                    <YAxis
                      domain={[0, 100]}
                      ticks={[0, 25, 50, 75, 100]}
                      tick={{ fontSize: 10, fill: '#94a3b8' }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <Tooltip content={<StressTooltip />} />
                    {avgStress != null && (
                      <ReferenceLine
                        y={avgStress}
                        stroke="#F59E0B"
                        strokeDasharray="4 3"
                        strokeWidth={1.5}
                      />
                    )}
                    <Line
                      type="monotone"
                      dataKey="stress"
                      stroke="#5B8DEF"
                      strokeWidth={2.5}
                      dot={{ fill: '#5B8DEF', r: 4, strokeWidth: 0 }}
                      activeDot={{ r: 6, fill: '#5B8DEF', stroke: '#fff', strokeWidth: 2 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </div>

            {/* 유형별 진단 횟수 바 차트 */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 mb-5">
              <h2 className="text-sm font-bold text-slate-700 mb-4">유형별 진단 횟수</h2>

              {filteredRecords.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-40 text-slate-300">
                  <span className="material-icons text-4xl mb-2">bar_chart</span>
                  <p className="text-sm">이 기간에 진단 기록이 없어요</p>
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={barData} margin={{ top: 8, right: 8, left: -24, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                    <XAxis
                      dataKey="name"
                      tick={{ fontSize: 11, fill: '#94a3b8' }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis
                      allowDecimals={false}
                      tick={{ fontSize: 11, fill: '#94a3b8' }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <Tooltip content={<BarTooltip />} cursor={{ fill: '#f8fafc' }} />
                    <Bar dataKey="value" radius={[6, 6, 0, 0]} maxBarSize={44}>
                      {barData.map((entry, i) => (
                        <Cell
                          key={i}
                          fill={entry.isTop ? entry.color : `${entry.color}55`}
                          stroke={entry.isTop ? entry.color : 'none'}
                          strokeWidth={entry.isTop ? 2 : 0}
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>

            {/* 유형별 상세 */}
            {filteredRecords.length > 0 && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
                <h2 className="text-sm font-bold text-slate-700 mb-4">유형별 상세</h2>
                <div className="space-y-4">
                  {barData
                    .filter((d) => d.value > 0)
                    .sort((a, b) => b.value - a.value)
                    .map((item, i) => {
                      const info = REST_TYPE_INFO[item.type];
                      const pct = maxCount > 0 ? Math.round((item.value / maxCount) * 100) : 0;
                      return (
                        <div key={item.type}>
                          <div className="flex items-center justify-between mb-1.5">
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-bold text-slate-400 w-4">{i + 1}</span>
                              <span
                                className="px-2 py-0.5 rounded-full text-[11px] font-bold text-white"
                                style={{ backgroundColor: info.color }}
                              >
                                {info.name}
                              </span>
                              {item.isTop && (
                                <span className="text-[10px] bg-primary/10 text-primary px-1.5 py-0.5 rounded-full font-bold">
                                  최다
                                </span>
                              )}
                            </div>
                            <span className="text-sm font-bold text-slate-600">{item.value}회</span>
                          </div>
                          <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden ml-6">
                            <div
                              className="h-full rounded-full transition-all duration-700"
                              style={{ width: `${pct}%`, backgroundColor: info.color }}
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

export default StatsDiagnosis;
