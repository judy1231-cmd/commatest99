import { useState, useEffect } from 'react';
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer,
} from 'recharts';
import { fetchWithAuth } from '../../../api/fetchWithAuth';
import UserNavbar from '../../../components/user/UserNavbar';

const PERIODS = [
  { label: '1주', days: 7 },
  { label: '1개월', days: 30 },
  { label: '3개월', days: 90 },
];

const TYPE_INFO = {
  physical:  { name: '신체적 이완', color: '#4CAF82' },
  mental:    { name: '정신적 고요', color: '#5B8DEF' },
  sensory:   { name: '감각의 정화', color: '#9B6DFF' },
  emotional: { name: '정서적 지지', color: '#FF7BAC' },
  social:    { name: '사회적 휴식', color: '#FF9A3C' },
  nature:    { name: '자연의 연결', color: '#2ECC9A' },
  creative:  { name: '창조적 몰입', color: '#FFB830' },
};

function formatMinutes(total) {
  if (total === 0) return '0분';
  if (total < 60) return `${total}분`;
  const h = Math.floor(total / 60);
  const m = total % 60;
  return m > 0 ? `${h}시간 ${m}분` : `${h}시간`;
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
  const [period, setPeriod] = useState(PERIODS[0]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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

  // 기간 필터 적용
  const filteredLogs = logs.filter((l) => {
    const from = new Date(Date.now() - period.days * 24 * 60 * 60 * 1000);
    return new Date(l.startTime) >= from;
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

  return (
    <div className="min-h-screen bg-[#F7F7F8]">
      <UserNavbar />

      <main className="max-w-lg mx-auto px-4 pt-6 pb-24">

        {/* 헤더 */}
        <div className="mb-6">
          <h1 className="text-[22px] font-extrabold tracking-tight text-slate-800">휴식 활동 통계</h1>
          <p className="text-xs text-slate-400 mt-0.5">어떤 휴식을 많이 했는지 확인해요</p>
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
            <div className="grid grid-cols-3 gap-3 mb-5">
              {[
                { label: '총 기록', value: `${filteredLogs.length}회`, icon: 'event_note', color: 'text-primary' },
                { label: '총 휴식 시간', value: formatMinutes(totalMinutes), icon: 'schedule', color: 'text-blue-500' },
                { label: '평균 소요', value: formatMinutes(avgMinutesPerSession), icon: 'timer', color: 'text-amber-500' },
              ].map((stat) => (
                <div key={stat.label} className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm text-center">
                  <span className={`material-icons ${stat.color} text-xl mb-1 block`}>{stat.icon}</span>
                  <p className="text-base font-bold text-slate-800 leading-tight">{stat.value}</p>
                  <p className="text-xs text-slate-400 mt-0.5">{stat.label}</p>
                </div>
              ))}
            </div>

            {/* 파이 차트 */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 mb-5">
              <h2 className="text-sm font-bold text-slate-700 mb-4">휴식 유형 비율</h2>

              {pieData.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-40 text-slate-300">
                  <span className="material-icons text-4xl mb-2">pie_chart</span>
                  <p className="text-sm">이 기간에 휴식 기록이 없어요</p>
                </div>
              ) : (
                <>
                  <ResponsiveContainer width="100%" height={240}>
                    <PieChart>
                      <Pie
                        data={pieData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
                        paddingAngle={3}
                        dataKey="value"
                      >
                        {pieData.map((entry, i) => (
                          <Cell key={i} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip content={<CustomTooltip />} />
                    </PieChart>
                  </ResponsiveContainer>

                  {/* 중앙 텍스트 (도넛 차트 스타일) */}
                  <p className="text-center text-xs text-slate-400 -mt-2">총 {filteredLogs.length}회</p>
                </>
              )}
            </div>

            {/* 유형별 상세 목록 */}
            {pieData.length > 0 && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
                <h2 className="text-sm font-bold text-slate-700 mb-4">유형별 상세</h2>
                <div className="space-y-3">
                  {pieData.map((item, i) => (
                    <div key={item.name}>
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-slate-400 w-4">{i + 1}</span>
                          <span
                            className="w-2.5 h-2.5 rounded-full shrink-0"
                            style={{ backgroundColor: item.color }}
                          />
                          <span className="text-sm text-slate-700">{item.name}</span>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-slate-500">
                          <span>{item.value}회</span>
                          <span className="font-bold" style={{ color: item.color }}>{item.pct}%</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 pl-6">
                        <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all duration-700"
                            style={{ width: `${item.pct}%`, backgroundColor: item.color }}
                          />
                        </div>
                        <span className="text-xs text-slate-400 w-16 text-right">
                          {formatMinutes(item.minutes)}
                        </span>
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
