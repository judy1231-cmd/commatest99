import { useState, useEffect } from 'react';
import { fetchWithAuth } from '../../../api/fetchWithAuth';
import UserNavbar from '../../../components/user/UserNavbar';

const REST_TYPE_INFO = {
  physical:  { name: '신체적 이완', icon: 'fitness_center', color: '#EF4444' },
  mental:    { name: '정신적 고요', icon: 'spa',            color: '#10B981' },
  sensory:   { name: '감각의 정화', icon: 'visibility_off', color: '#F59E0B' },
  emotional: { name: '정서적 지지', icon: 'favorite',       color: '#EC4899' },
  social:    { name: '사회적 휴식', icon: 'groups',         color: '#8B5CF6' },
  nature:    { name: '자연의 연결', icon: 'forest',       color: '#059669' },
  creative:  { name: '창조적 몰입', icon: 'brush',          color: '#F97316' },
};

function getStressLabel(score) {
  if (score >= 70) return { label: '높음', color: '#EF4444' };
  if (score >= 40) return { label: '보통', color: '#F59E0B' };
  return { label: '낮음', color: '#10B981' };
}

function formatDateTime(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  return d.toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric', weekday: 'short' })
    + ' ' + d.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' });
}

// 상세 모달
function DetailModal({ record, onClose }) {
  const info = REST_TYPE_INFO[record.primaryRestType] || REST_TYPE_INFO.mental;
  const scores = JSON.parse(record.scoresJson || '{}');
  const sortedScores = Object.entries(scores)
    .map(([type, score]) => ({ type, score }))
    .sort((a, b) => b.score - a.score);
  const maxScore = sortedScores[0]?.score || 100;
  const stress = getStressLabel(record.stressIndex);

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        {/* 모달 헤더 */}
        <div className="flex items-center justify-between p-5 border-b border-slate-100">
          <h2 className="font-bold text-slate-800">진단 상세 결과</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <span className="material-icons">close</span>
          </button>
        </div>

        <div className="p-5 space-y-4">
          {/* 날짜 */}
          <p className="text-xs text-slate-400">{formatDateTime(record.createdAt)}</p>

          {/* 주요 유형 */}
          <div className="flex items-center gap-4 p-4 rounded-2xl" style={{ backgroundColor: `${info.color}10` }}>
            <div
              className="w-14 h-14 rounded-xl flex items-center justify-center shrink-0"
              style={{ backgroundColor: `${info.color}20` }}
            >
              <span className="material-icons text-3xl" style={{ color: info.color }}>{info.icon}</span>
            </div>
            <div>
              <p className="text-xs font-semibold mb-0.5" style={{ color: info.color }}>주요 휴식 유형</p>
              <p className="text-lg font-bold text-slate-800">{info.name}</p>
            </div>
          </div>

          {/* 스트레스 지수 */}
          <div className="bg-slate-50 rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-semibold text-slate-600">스트레스 지수</span>
              <div className="flex items-center gap-2">
                <span className="text-lg font-bold text-slate-800">{record.stressIndex}점</span>
                <span
                  className="text-xs font-bold px-2 py-0.5 rounded-full"
                  style={{ backgroundColor: `${stress.color}15`, color: stress.color }}
                >
                  {stress.label}
                </span>
              </div>
            </div>
            <div className="w-full h-2.5 bg-slate-200 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-700"
                style={{ width: `${record.stressIndex}%`, backgroundColor: stress.color }}
              />
            </div>
          </div>

          {/* 유형별 점수 */}
          {sortedScores.length > 0 && (
            <div>
              <p className="text-sm font-bold text-slate-700 mb-3">유형별 점수</p>
              <div className="space-y-2.5">
                {sortedScores.map((item, i) => {
                  const t = REST_TYPE_INFO[item.type] || {};
                  return (
                    <div key={item.type}>
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-slate-400 w-4">{i + 1}</span>
                          <span className="material-icons text-sm" style={{ color: t.color }}>{t.icon}</span>
                          <span className="text-xs text-slate-700">{t.name}</span>
                          {i === 0 && (
                            <span className="text-xs bg-primary/10 text-primary px-1.5 py-0.5 rounded-full font-bold">1위</span>
                          )}
                        </div>
                        <span className="text-xs font-bold text-slate-600">{item.score}점</span>
                      </div>
                      <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden ml-6">
                        <div
                          className="h-full rounded-full"
                          style={{
                            width: `${maxScore > 0 ? (item.score / maxScore) * 100 : 0}%`,
                            backgroundColor: t.color,
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

function RecordsDiagnosis() {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selected, setSelected] = useState(null);

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

  return (
    <div className="min-h-screen bg-[#F9F7F2]">
      <UserNavbar />

      <main className="max-w-lg mx-auto px-4 pt-6 pb-24">

        {/* 헤더 */}
        <div className="mb-6">
          <h1 className="text-xl font-bold text-slate-800">진단 기록</h1>
          <p className="text-sm text-slate-400 mt-0.5">과거 심리 진단 결과를 확인해요</p>
        </div>

        {/* 에러 */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-4 mb-4 text-sm text-red-600 flex items-center gap-2">
            <span className="material-icons text-base">error_outline</span>
            {error}
          </div>
        )}

        {/* 로딩 */}
        {loading && (
          <div className="flex justify-center items-center h-40">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
          </div>
        )}

        {/* 기록 없음 */}
        {!loading && !error && records.length === 0 && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center">
            <span className="material-icons text-5xl text-slate-200 mb-3 block">psychology</span>
            <p className="font-semibold text-slate-600 mb-1">아직 진단 기록이 없어요</p>
            <p className="text-sm text-slate-400 mb-6">진단을 받으면 여기에 결과가 저장돼요.</p>
            <a
              href="/diagnosis"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary text-white font-bold rounded-xl hover:bg-primary/90 transition-all text-sm"
            >
              <span className="material-icons text-base">psychology</span>
              심리 진단 받기
            </a>
          </div>
        )}

        {/* 진단 기록 목록 */}
        {!loading && records.length > 0 && (
          <div className="space-y-3">
            {records.map((record) => {
              const info = REST_TYPE_INFO[record.primaryRestType] || REST_TYPE_INFO.mental;
              const stress = getStressLabel(record.stressIndex);
              return (
                <button
                  key={record.id}
                  onClick={() => setSelected(record)}
                  className="w-full bg-white rounded-2xl shadow-sm border border-gray-100 p-4 hover:border-primary/30 hover:shadow-md transition-all text-left"
                >
                  <div className="flex items-center gap-4">
                    {/* 유형 아이콘 */}
                    <div
                      className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
                      style={{ backgroundColor: `${info.color}15` }}
                    >
                      <span className="material-icons text-2xl" style={{ color: info.color }}>
                        {info.icon}
                      </span>
                    </div>

                    {/* 내용 */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-bold text-slate-800 text-sm">{info.name}</span>
                        <span
                          className="text-xs font-bold px-2 py-0.5 rounded-full"
                          style={{ backgroundColor: `${stress.color}15`, color: stress.color }}
                        >
                          스트레스 {stress.label}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-slate-400">
                        <span className="flex items-center gap-0.5">
                          <span className="material-icons text-xs">show_chart</span>
                          스트레스 {record.stressIndex}점
                        </span>
                        {record.createdAt && (
                          <span>{new Date(record.createdAt).toLocaleDateString('ko-KR', { month: 'long', day: 'numeric' })}</span>
                        )}
                      </div>
                    </div>

                    <span className="material-icons text-slate-300 shrink-0">chevron_right</span>
                  </div>

                  {/* 스트레스 바 */}
                  <div className="mt-3 w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full"
                      style={{ width: `${record.stressIndex}%`, backgroundColor: stress.color }}
                    />
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </main>

      {/* 상세 모달 */}
      {selected && (
        <DetailModal record={selected} onClose={() => setSelected(null)} />
      )}
    </div>
  );
}

export default RecordsDiagnosis;
