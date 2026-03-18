import { useState, useEffect } from 'react';
import { fetchWithAuth } from '../../../api/fetchWithAuth';
import UserNavbar from '../../../components/user/UserNavbar';

const REST_TYPE_INFO = {
  physical:  { name: '신체의 이완', icon: 'fitness_center', color: '#4CAF82', bg: '#F0FAF5' },
  mental:    { name: '정신적 고요', icon: 'spa',            color: '#5B8DEF', bg: '#F0F5FF' },
  sensory:   { name: '감각의 정화', icon: 'visibility_off', color: '#9B6DFF', bg: '#F5F0FF' },
  emotional: { name: '정서적 지지', icon: 'favorite',       color: '#FF7BAC', bg: '#FFF0F5' },
  social:    { name: '사회적 휴식', icon: 'groups',         color: '#FF9A3C', bg: '#FFF5EC' },
  nature:    { name: '자연의 연결', icon: 'forest',         color: '#2ECC9A', bg: '#F0FBF7' },
  creative:  { name: '창조적 몰입', icon: 'brush',          color: '#FFB830', bg: '#FFFBF0' },
};

function getStressLabel(score) {
  if (score >= 70) return { label: '높음', color: '#EF4444', bg: '#FEF2F2' };
  if (score >= 40) return { label: '보통', color: '#F59E0B', bg: '#FFFBEB' };
  return { label: '낮음', color: '#10B981', bg: '#ECFDF5' };
}

function formatDateTime(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  return d.toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric', weekday: 'short' })
    + ' ' + d.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' });
}

/* ── 상세 모달 (바텀시트) ── */
function DetailModal({ record, onClose }) {
  const info   = REST_TYPE_INFO[record.primaryRestType] || REST_TYPE_INFO.mental;
  const scores = JSON.parse(record.scoresJson || '{}');
  const sortedScores = Object.entries(scores)
    .map(([type, score]) => ({ type, score }))
    .sort((a, b) => b.score - a.score);
  const maxScore = sortedScores[0]?.score || 100;
  const stress = getStressLabel(record.stressIndex);

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-end justify-center">
      <div className="bg-white rounded-t-3xl w-full max-w-lg max-h-[92vh] overflow-y-auto">

        {/* 모달 헤더 */}
        <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-slate-100">
          <div>
            <h2 className="text-[18px] font-extrabold text-slate-800">진단 상세 결과</h2>
            <p className="text-xs text-slate-400 mt-0.5">{formatDateTime(record.createdAt)}</p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-xl bg-slate-100 hover:bg-slate-200 transition-colors"
          >
            <span className="material-icons text-slate-500 text-lg">close</span>
          </button>
        </div>

        <div className="px-6 py-5 space-y-5">

          {/* 주요 유형 히어로 */}
          <div
            className="flex items-center gap-4 p-4 rounded-2xl"
            style={{ backgroundColor: info.bg }}
          >
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center shrink-0"
              style={{ backgroundColor: `${info.color}25` }}
            >
              <span className="material-icons text-3xl" style={{ color: info.color }}>{info.icon}</span>
            </div>
            <div>
              <p className="text-[11px] font-bold uppercase tracking-widest mb-0.5" style={{ color: info.color }}>
                주요 휴식 유형
              </p>
              <p className="text-xl font-extrabold text-slate-800">{info.name}</p>
            </div>
          </div>

          {/* 스트레스 지수 */}
          <div className="bg-slate-50 rounded-2xl p-4">
            <div className="flex items-center justify-between mb-3">
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">스트레스 지수</p>
              <div className="flex items-center gap-2">
                <span className="text-xl font-extrabold text-slate-800">{record.stressIndex}점</span>
                <span
                  className="text-xs font-bold px-2.5 py-1 rounded-full"
                  style={{ backgroundColor: stress.bg, color: stress.color }}
                >
                  {stress.label}
                </span>
              </div>
            </div>
            <div className="w-full h-2.5 bg-white rounded-full overflow-hidden shadow-inner">
              <div
                className="h-full rounded-full transition-all duration-700"
                style={{ width: `${record.stressIndex}%`, backgroundColor: stress.color }}
              />
            </div>
          </div>

          {/* 유형별 점수 바 차트 */}
          {sortedScores.length > 0 && (
            <div>
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-3">유형별 점수</p>
              <div className="space-y-3">
                {sortedScores.map((item, i) => {
                  const t = REST_TYPE_INFO[item.type] || {};
                  return (
                    <div key={item.type}>
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-2">
                          <span className="text-[11px] font-bold text-slate-400 w-4">{i + 1}</span>
                          <span className="material-icons text-sm" style={{ color: t.color }}>{t.icon}</span>
                          <span className="text-xs font-semibold text-slate-700">{t.name}</span>
                          {i === 0 && (
                            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-primary/10 text-primary">TOP</span>
                          )}
                        </div>
                        <span className="text-xs font-extrabold text-slate-600">{item.score}점</span>
                      </div>
                      <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-500"
                          style={{
                            width: `${maxScore > 0 ? (item.score / maxScore) * 100 : 0}%`,
                            backgroundColor: t.color || '#10B981',
                          }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ── 메인 컴포넌트 ── */
function RecordsDiagnosis() {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);
  const [selected, setSelected] = useState(null);

  // 월 네비게이션 (UI 전용)
  const [currentMonth, setCurrentMonth] = useState(() => {
    const now = new Date();
    return { year: now.getFullYear(), month: now.getMonth() };
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
        setError(data.message || '진단 기록을 불러오지 못했어요.');
      }
    } catch {
      setError('서버에 연결할 수 없습니다.');
    } finally {
      setLoading(false);
    }
  };

  // 월 이동
  const prevMonth = () => {
    setCurrentMonth(m =>
      m.month === 0 ? { year: m.year - 1, month: 11 } : { year: m.year, month: m.month - 1 }
    );
  };
  const nextMonth = () => {
    setCurrentMonth(m =>
      m.month === 11 ? { year: m.year + 1, month: 0 } : { year: m.year, month: m.month + 1 }
    );
  };
  const isCurrentMonthToday = () => {
    const now = new Date();
    return currentMonth.year === now.getFullYear() && currentMonth.month === now.getMonth();
  };

  // 현재 월 필터링
  const filteredRecords = records.filter(r => {
    const d = new Date(r.createdAt);
    return d.getFullYear() === currentMonth.year && d.getMonth() === currentMonth.month;
  });

  const monthLabel = `${currentMonth.year}년 ${currentMonth.month + 1}월`;

  return (
    <div className="min-h-screen bg-[#F7F7F8]">
      <UserNavbar />

      <main className="max-w-lg mx-auto pb-24">

        {/* ===== 헤더 ===== */}
        <div className="px-5 pt-6 pb-4 flex items-center justify-between">
          <div>
            <h1 className="text-[22px] font-extrabold tracking-tight text-slate-800">진단 기록</h1>
            <p className="text-xs text-slate-400 mt-0.5">과거 심리 진단 결과를 확인해요</p>
          </div>
          <a
            href="/diagnosis"
            className="flex items-center gap-1.5 bg-primary text-white px-4 py-2.5 rounded-2xl font-bold text-sm shadow-lg shadow-emerald-100 hover:bg-primary/90 transition-all"
          >
            <span className="material-icons text-base">psychology</span>
            진단받기
          </a>
        </div>

        {/* ===== 월 네비게이션 ===== */}
        <div className="px-5 mb-4">
          <div className="flex items-center justify-between bg-white rounded-2xl px-4 py-3 shadow-sm border border-slate-100">
            <button
              onClick={prevMonth}
              className="w-8 h-8 flex items-center justify-center rounded-xl hover:bg-slate-50 transition-colors"
            >
              <span className="material-icons text-slate-500 text-lg">chevron_left</span>
            </button>

            <div className="text-center">
              <p className="text-[15px] font-extrabold text-slate-800">{monthLabel}</p>
              <p className="text-[11px] text-slate-400 mt-0.5">
                {loading ? '...' : `${filteredRecords.length}회 진단`}
              </p>
            </div>

            <button
              onClick={nextMonth}
              disabled={isCurrentMonthToday()}
              className="w-8 h-8 flex items-center justify-center rounded-xl hover:bg-slate-50 transition-colors disabled:opacity-30"
            >
              <span className="material-icons text-slate-500 text-lg">chevron_right</span>
            </button>
          </div>
        </div>

        {/* ===== 에러 ===== */}
        {error && (
          <div className="mx-5 mb-4 flex items-center gap-2 bg-red-50 border border-red-100 rounded-2xl px-4 py-3 text-sm text-red-600">
            <span className="material-icons text-base">error_outline</span>
            {error}
          </div>
        )}

        {/* ===== 로딩 ===== */}
        {loading && (
          <div className="flex justify-center items-center h-40">
            <div className="animate-spin rounded-full h-7 w-7 border-b-2 border-primary" />
          </div>
        )}

        {/* ===== 빈 상태 ===== */}
        {!loading && !error && filteredRecords.length === 0 && (
          <div className="mx-5 bg-white rounded-3xl p-10 text-center shadow-sm border border-slate-100">
            <div className="w-20 h-20 bg-blue-50 rounded-3xl flex items-center justify-center mx-auto mb-5">
              <span className="material-icons text-4xl text-blue-400">psychology</span>
            </div>
            <p className="text-base font-extrabold text-slate-700 mb-1">
              {monthLabel}의 진단 기록이 없어요
            </p>
            <p className="text-sm text-slate-400 leading-relaxed mb-6">
              심박 측정 + 설문으로 내 상태를<br />정확하게 파악해보세요
            </p>
            <a
              href="/diagnosis"
              className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-white font-bold rounded-2xl shadow-lg shadow-emerald-100 hover:bg-primary/90 transition-all text-sm"
            >
              <span className="material-icons text-base">psychology</span>
              심리 진단 받기
            </a>
          </div>
        )}

        {/* ===== 진단 기록 목록 ===== */}
        {!loading && !error && filteredRecords.length > 0 && (
          <div className="px-5 space-y-3">
            {filteredRecords.map((record) => {
              const info   = REST_TYPE_INFO[record.primaryRestType] || REST_TYPE_INFO.mental;
              const stress = getStressLabel(record.stressIndex);

              // 상위 3개 유형 미니 바
              let topScores = [];
              try {
                const parsed = JSON.parse(record.scoresJson || '{}');
                topScores = Object.entries(parsed)
                  .map(([type, score]) => ({ type, score }))
                  .sort((a, b) => b.score - a.score)
                  .slice(0, 3);
              } catch { /* 무시 */ }
              const maxTop = topScores[0]?.score || 100;

              return (
                <button
                  key={record.id}
                  onClick={() => setSelected(record)}
                  className="w-full bg-white rounded-2xl shadow-sm hover:shadow-md transition-all text-left overflow-hidden flex"
                >
                  {/* 왼쪽 accent bar */}
                  <div
                    className="w-1 shrink-0 rounded-l-2xl"
                    style={{ backgroundColor: info.color }}
                  />

                  {/* 카드 본문 */}
                  <div className="flex-1 px-4 py-3.5">
                    <div className="flex items-start gap-3">

                      {/* 유형 아이콘 */}
                      <div
                        className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0 mt-0.5"
                        style={{ backgroundColor: info.bg }}
                      >
                        <span className="material-icons text-xl" style={{ color: info.color }}>
                          {info.icon}
                        </span>
                      </div>

                      {/* 내용 */}
                      <div className="flex-1 min-w-0">

                        {/* 유형명 + 스트레스 배지 */}
                        <div className="flex items-center gap-2 flex-wrap mb-0.5">
                          <span
                            className="text-[11px] font-bold px-2 py-0.5 rounded-full"
                            style={{ backgroundColor: info.bg, color: info.color }}
                          >
                            {info.name}
                          </span>
                          <span
                            className="text-[11px] font-bold px-2 py-0.5 rounded-full"
                            style={{ backgroundColor: stress.bg, color: stress.color }}
                          >
                            스트레스 {stress.label}
                          </span>
                        </div>

                        {/* 날짜 + 스트레스 수치 */}
                        <div className="flex items-center gap-3 text-xs text-slate-400 mb-2">
                          {record.createdAt && (
                            <span className="flex items-center gap-1">
                              <span className="material-icons text-xs">calendar_today</span>
                              {new Date(record.createdAt).toLocaleDateString('ko-KR', { month: 'long', day: 'numeric' })}
                              {' '}
                              {new Date(record.createdAt).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          )}
                          <span className="flex items-center gap-1">
                            <span className="material-icons text-xs">show_chart</span>
                            <span className="font-semibold text-slate-500">{record.stressIndex}점</span>
                          </span>
                        </div>

                        {/* 상위 3개 유형 미니 바 */}
                        {topScores.length > 0 && (
                          <div className="space-y-1">
                            {topScores.map((item) => {
                              const t = REST_TYPE_INFO[item.type] || {};
                              return (
                                <div key={item.type} className="flex items-center gap-2">
                                  <span className="text-[10px] text-slate-400 w-14 truncate">{t.name || item.type}</span>
                                  <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                    <div
                                      className="h-full rounded-full"
                                      style={{
                                        width: `${maxTop > 0 ? (item.score / maxTop) * 100 : 0}%`,
                                        backgroundColor: t.color || '#10B981',
                                      }}
                                    />
                                  </div>
                                  <span className="text-[10px] font-bold text-slate-500 w-6 text-right">{item.score}</span>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>

                      <span className="material-icons text-slate-200 shrink-0 mt-1">chevron_right</span>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </main>

      {/* ===== 상세 모달 ===== */}
      {selected && (
        <DetailModal record={selected} onClose={() => setSelected(null)} />
      )}
    </div>
  );
}

export default RecordsDiagnosis;
