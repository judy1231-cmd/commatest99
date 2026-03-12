import { useState, useEffect } from 'react';
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer,
} from 'recharts';
import { fetchWithAuth } from '../../../api/fetchWithAuth';
import UserNavbar from '../../../components/user/UserNavbar';

const TYPE_INFO = {
  physical:  { name: '신체적 이완', color: '#4CAF82' },
  mental:    { name: '정신적 고요', color: '#5B8DEF' },
  sensory:   { name: '감각의 정화', color: '#9B6DFF' },
  emotional: { name: '정서적 지지', color: '#FF7BAC' },
  social:    { name: '사회적 휴식', color: '#FF9A3C' },
  nature:    { name: '자연의 연결', color: '#2ECC9A' },
  creative:  { name: '창조적 몰입', color: '#FFB830' },
};

const MONTH_NAMES = ['1월','2월','3월','4월','5월','6월','7월','8월','9월','10월','11월','12월'];

function formatMinutes(total) {
  if (total === 0) return '0분';
  if (total < 60) return `${total}분`;
  const h = Math.floor(total / 60);
  const m = total % 60;
  return m > 0 ? `${h}시간 ${m}분` : `${h}시간`;
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

function CustomTooltip({ active, payload }) {
  if (!active || !payload?.length) return null;
  const { name, value, payload: p } = payload[0];
  return (
    <div className="bg-white border border-slate-100 rounded-xl shadow-lg px-4 py-3 text-sm">
      <p className="font-bold text-slate-800">{name}</p>
      <p className="text-xs text-slate-500">{value}회 · {p.pct}%</p>
    </div>
  );
}

function StatsRest() {
  const [logs, setLogs] = useState([]);
  const [restTypes, setRestTypes] = useState([]);
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

  useEffect(() => {
    loadRestTypes();
    loadLogs();
  }, []);

  const loadRestTypes = async () => {
    try {
      const res = await fetch('/api/rest-types');
      const data = await res.json();
      if (data.success && data.data) setRestTypes(data.data);
    } catch { /* 무시 */ }
  };

  const loadLogs = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchWithAuth('/api/rest-logs?page=1&size=200');
      if (data.success && data.data) {
        setLogs(data.data.logs || []);
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
    const totalWeeks = weeksInMonth(d.getFullYear(), d.getMonth());
    return { year: d.getFullYear(), month: d.getMonth(), week: totalWeeks };
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

  // Filter logs by selected period (UI-only, no API)
  const filteredLogs = logs.filter((l) => {
    const d = new Date(l.startTime);
    if (activeTab === 'monthly') {
      return d.getFullYear() === currentMonth.year && d.getMonth() === currentMonth.month;
    }
    return (
      d.getFullYear() === currentWeek.year &&
      d.getMonth() === currentWeek.month &&
      getWeekOfMonth(d) === currentWeek.week
    );
  });

  // 유형별 집계
  const typeCountMap = {};
  const typeMinutesMap = {};
  for (const log of filteredLogs) {
    const type = restTypes.find((t) => t.id === log.restTypeId);
    const key = type?.typeName || 'unknown';
    typeCountMap[key] = (typeCountMap[key] || 0) + 1;
    if (log.startTime && log.endTime) {
      const mins = Math.round((new Date(log.endTime) - new Date(log.startTime)) / 60000);
      typeMinutesMap[key] = (typeMinutesMap[key] || 0) + mins;
    }
  }

  const total = filteredLogs.length;
  const pieData = Object.entries(typeCountMap)
    .map(([key, count]) => {
      const info = TYPE_INFO[key] || { name: key, color: '#94A3B8' };
      return {
        name: info.name,
        value: count,
        color: info.color,
        pct: total > 0 ? Math.round((count / total) * 100) : 0,
        minutes: typeMinutesMap[key] || 0,
      };
    })
    .sort((a, b) => b.value - a.value);

  const totalMinutes = Object.values(typeMinutesMap).reduce((a, b) => a + b, 0);
  const avgMinutesPerSession = filteredLogs.length
    ? Math.round(totalMinutes / filteredLogs.length)
    : 0;

  const periodLabel = activeTab === 'monthly'
    ? `${currentMonth.year}년 ${MONTH_NAMES[currentMonth.month]}`
    : `${currentWeek.year}년 ${MONTH_NAMES[currentWeek.month]} ${currentWeek.week}주차`;

  return (
    <div className="min-h-screen bg-[#F7F7F8]">
      <UserNavbar />

      <main className="max-w-lg mx-auto px-4 pt-6 pb-24">

        {/* 헤더 */}
        <div className="mb-5">
          <h1 className="text-[22px] font-extrabold tracking-tight text-slate-800">휴식 활동 통계</h1>
          <p className="text-xs text-slate-400 mt-0.5">어떤 휴식을 많이 했는지 확인해요</p>
        </div>

        {/* 주간 / 월간 탭 */}
        <div className="flex bg-slate-100 rounded-2xl p-1 mb-4">
          {[['monthly', '월간'], ['weekly', '주간']].map(([tab, label]) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 py-2 rounded-xl text-sm font-bold transition-all ${
                activeTab === tab
                  ? 'bg-white text-slate-800 shadow-sm'
                  : 'text-slate-400'
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
              style={{ background: 'linear-gradient(135deg, #10b981 0%, #0d9488 100%)' }}
            >
              {/* 배경 장식 원 */}
              <div className="absolute -right-8 -top-8 w-40 h-40 rounded-full bg-white/10 pointer-events-none" />
              <div className="absolute right-4 -bottom-6 w-24 h-24 rounded-full bg-white/10 pointer-events-none" />

              <p className="text-white/70 text-[11px] font-semibold uppercase tracking-wider mb-1 relative z-10">
                {periodLabel} 총 휴식 시간
              </p>
              <p className="text-white text-[38px] font-black tracking-tight leading-none relative z-10 mb-5">
                {formatMinutes(totalMinutes)}
              </p>

              <div className="flex items-center gap-5 relative z-10">
                <div>
                  <p className="text-white text-lg font-bold leading-tight">{filteredLogs.length}회</p>
                  <p className="text-white/60 text-[11px] mt-0.5">총 기록</p>
                </div>
                <div className="w-px h-8 bg-white/20" />
                <div>
                  <p className="text-white text-lg font-bold leading-tight">{formatMinutes(avgMinutesPerSession)}</p>
                  <p className="text-white/60 text-[11px] mt-0.5">평균 소요</p>
                </div>
                {pieData.length > 0 && (
                  <>
                    <div className="w-px h-8 bg-white/20" />
                    <div>
                      <p className="text-white text-base font-bold leading-tight">{pieData[0].name}</p>
                      <p className="text-white/60 text-[11px] mt-0.5">최다 유형</p>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* 도넛 차트 */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 mb-5">
              <h2 className="text-sm font-bold text-slate-700 mb-4">휴식 유형 비율</h2>

              {pieData.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-40 text-slate-300">
                  <span className="material-icons text-4xl mb-2">pie_chart</span>
                  <p className="text-sm">이 기간에 휴식 기록이 없어요</p>
                </div>
              ) : (
                <div className="relative">
                  <ResponsiveContainer width="100%" height={220}>
                    <PieChart>
                      <Pie
                        data={pieData}
                        cx="50%"
                        cy="50%"
                        innerRadius={66}
                        outerRadius={100}
                        paddingAngle={3}
                        dataKey="value"
                        startAngle={90}
                        endAngle={-270}
                      >
                        {pieData.map((entry, i) => (
                          <Cell key={i} fill={entry.color} stroke="none" />
                        ))}
                      </Pie>
                      <Tooltip content={<CustomTooltip />} />
                    </PieChart>
                  </ResponsiveContainer>
                  {/* 도넛 중앙 오버레이 */}
                  <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                    <p className="text-2xl font-black text-slate-800">{filteredLogs.length}</p>
                    <p className="text-xs text-slate-400 mt-0.5">총 기록</p>
                  </div>
                </div>
              )}
            </div>

            {/* 유형별 상세 */}
            {pieData.length > 0 && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
                <h2 className="text-sm font-bold text-slate-700 mb-4">유형별 상세</h2>
                <div className="space-y-4">
                  {pieData.map((item, i) => (
                    <div key={item.name}>
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-slate-400 w-4">{i + 1}</span>
                          <span
                            className="px-2 py-0.5 rounded-full text-[11px] font-bold text-white"
                            style={{ backgroundColor: item.color }}
                          >
                            {item.name}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-xs">
                          <span className="text-slate-400">{formatMinutes(item.minutes)}</span>
                          <span className="font-black w-9 text-right" style={{ color: item.color }}>
                            {item.pct}%
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 pl-6">
                        <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all duration-700"
                            style={{ width: `${item.pct}%`, backgroundColor: item.color }}
                          />
                        </div>
                        <span className="text-xs text-slate-400 w-6 text-right">{item.value}회</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}

export default StatsRest;
