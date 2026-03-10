import { useState, useEffect } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
} from 'recharts';
import { fetchWithAuth } from '../../../api/fetchWithAuth';
import UserNavbar from '../../../components/user/UserNavbar';

const REST_TYPE_INFO = {
  physical:  { name: '신체적 이완', shortName: '신체', icon: 'fitness_center', color: '#EF4444' },
  mental:    { name: '정신적 고요', shortName: '정신', icon: 'spa',            color: '#10B981' },
  sensory:   { name: '감각의 정화', shortName: '감각', icon: 'visibility_off', color: '#F59E0B' },
  emotional: { name: '정서적 지지', shortName: '정서', icon: 'favorite',       color: '#EC4899' },
  social:    { name: '사회적 휴식', shortName: '사회', icon: 'groups',         color: '#8B5CF6' },
  nature:    { name: '자연 연결',   shortName: '자연', icon: 'forest',         color: '#059669' },
  creative:  { name: '창조적 몰입', shortName: '창조', icon: 'brush',          color: '#F97316' },
};

function CustomTooltip({ active, payload }) {
  if (!active || !payload?.length) return null;
  const { name, value, payload: p } = payload[0];
  const info = REST_TYPE_INFO[p.type] || {};
  return (
    <div className="bg-white border border-slate-100 rounded-xl shadow-lg px-4 py-3 text-sm">
      <p className="font-bold text-slate-800">{info.name || name}</p>
      <p className="text-xs text-slate-500">{value}회</p>
      {p.isTop && (
        <p className="text-xs text-primary font-bold mt-0.5">최다 유형 🏆</p>
      )}
    </div>
  );
}

function StatsDiagnosis() {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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

  // 유형별 횟수 집계
  const typeCountMap = {};
  for (const r of records) {
    const key = r.primaryRestType;
    if (key) typeCountMap[key] = (typeCountMap[key] || 0) + 1;
  }

  const maxCount = Math.max(...Object.values(typeCountMap), 0);

  // 전체 7가지 유형 고정 순서로 표시 (0회도 포함)
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

  // 최다 유형
  const topType = barData.find((d) => d.isTop);
  const topInfo = topType ? REST_TYPE_INFO[topType.type] : null;

  // 스트레스 평균
  const avgStress = records.length
    ? Math.round(records.reduce((s, r) => s + (r.stressIndex || 0), 0) / records.length)
    : null;

  return (
    <div className="min-h-screen bg-[#F9F7F2]">
      <UserNavbar />

      <main className="max-w-lg mx-auto px-4 pt-6 pb-24">

        {/* 헤더 */}
        <div className="mb-6">
          <h1 className="text-xl font-bold text-slate-800">진단 유형 통계</h1>
          <p className="text-sm text-slate-400 mt-0.5">어떤 휴식 유형이 자주 나왔는지 확인해요</p>
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
                { label: '총 진단 횟수', value: `${records.length}회`, icon: 'psychology', color: 'text-primary' },
                { label: '평균 스트레스', value: avgStress != null ? `${avgStress}점` : '-', icon: 'show_chart', color: 'text-amber-500' },
                { label: '최다 유형', value: topInfo?.shortName || '-', icon: topInfo?.icon || 'help', color: 'text-blue-500' },
              ].map((stat) => (
                <div key={stat.label} className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm text-center">
                  <span className={`material-icons ${stat.color} text-xl mb-1 block`}>{stat.icon}</span>
                  <p className="text-base font-bold text-slate-800 leading-tight">{stat.value}</p>
                  <p className="text-xs text-slate-400 mt-0.5">{stat.label}</p>
                </div>
              ))}
            </div>

            {/* 최다 유형 강조 배너 */}
            {topInfo && (
              <div
                className="rounded-2xl p-5 mb-5 flex items-center gap-4"
                style={{ backgroundColor: `${topInfo.color}12` }}
              >
                <div
                  className="w-14 h-14 rounded-xl flex items-center justify-center shrink-0"
                  style={{ backgroundColor: `${topInfo.color}20` }}
                >
                  <span className="material-icons text-3xl" style={{ color: topInfo.color }}>
                    {topInfo.icon}
                  </span>
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-white" style={{ color: topInfo.color }}>
                      최다 유형 🏆
                    </span>
                  </div>
                  <p className="font-bold text-slate-800">{topInfo.name}</p>
                  <p className="text-xs text-slate-500 mt-0.5">총 {topType.value}회 진단됐어요</p>
                </div>
              </div>
            )}

            {/* 바 차트 */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 mb-5">
              <h2 className="text-sm font-bold text-slate-700 mb-4">유형별 진단 횟수</h2>

              {records.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-40 text-slate-300">
                  <span className="material-icons text-4xl mb-2">bar_chart</span>
                  <p className="text-sm">진단 기록이 없어요</p>
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={220}>
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
                    <Tooltip content={<CustomTooltip />} cursor={{ fill: '#f8fafc' }} />
                    <Bar dataKey="value" radius={[6, 6, 0, 0]} maxBarSize={48}>
                      {barData.map((entry, i) => (
                        <Cell
                          key={i}
                          fill={entry.isTop ? entry.color : `${entry.color}60`}
                          stroke={entry.isTop ? entry.color : 'none'}
                          strokeWidth={entry.isTop ? 2 : 0}
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>

            {/* 유형별 상세 목록 */}
            {records.length > 0 && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
                <h2 className="text-sm font-bold text-slate-700 mb-4">유형별 상세</h2>
                <div className="space-y-3">
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
                              <span className="material-icons text-base" style={{ color: info.color }}>
                                {info.icon}
                              </span>
                              <span className="text-sm text-slate-700">{info.name}</span>
                              {item.isTop && (
                                <span className="text-xs bg-primary/10 text-primary px-1.5 py-0.5 rounded-full font-bold">
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
