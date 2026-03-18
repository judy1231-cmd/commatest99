import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import UserNavbar from '../../../components/user/UserNavbar';

const REST_TYPE_INFO = {
  physical: {
    name: '신체의 이완',
    icon: 'fitness_center',
    color: '#EF4444',
    bgColor: '#FFF5F5',
    desc: '몸의 긴장을 풀고 신체를 편안하게 하는 휴식이 필요해요. 스트레칭, 산책, 가벼운 운동으로 몸을 이완해보세요.',
    contents: [
      { title: '5분 전신 스트레칭', category: '신체', icon: 'self_improvement', duration: '5분' },
      { title: '점심 후 가벼운 산책', category: '신체', icon: 'directions_walk', duration: '15분' },
      { title: '폼롤러 근막이완', category: '신체', icon: 'sports_gymnastics', duration: '10분' },
    ],
  },
  mental: {
    name: '정신적 고요',
    icon: 'spa',
    color: '#10B981',
    bgColor: '#F0FDF9',
    desc: '복잡한 생각을 내려놓고 마음의 고요함을 찾는 휴식이 필요해요. 명상, 호흡법, 차 한 잔의 여유를 가져보세요.',
    contents: [
      { title: '5분 마음챙김 명상', category: '멘탈', icon: 'self_improvement', duration: '5분' },
      { title: '복식호흡 가이드', category: '멘탈', icon: 'air', duration: '3분' },
      { title: '따뜻한 차 한 잔', category: '멘탈', icon: 'local_cafe', duration: '10분' },
    ],
  },
  sensory: {
    name: '감각의 정화',
    icon: 'visibility_off',
    color: '#F59E0B',
    bgColor: '#FFFBEB',
    desc: '과도한 자극에서 벗어나 감각을 쉬게 해주는 시간이 필요해요. 디지털 디톡스나 조용한 공간에서 쉬어보세요.',
    contents: [
      { title: '디지털 디톡스 30분', category: '감각', icon: 'phonelink_off', duration: '30분' },
      { title: '눈 감고 쉬기', category: '감각', icon: 'bedtime', duration: '10분' },
      { title: '아로마테라피', category: '감각', icon: 'spa', duration: '20분' },
    ],
  },
  emotional: {
    name: '정서적 지지',
    icon: 'favorite',
    color: '#EC4899',
    bgColor: '#FFF0F8',
    desc: '감정적 위안과 지지가 필요한 시기예요. 좋아하는 음악을 듣거나 소중한 사람과 대화를 나눠보세요.',
    contents: [
      { title: '감정 일기 쓰기', category: '정서', icon: 'edit_note', duration: '10분' },
      { title: '좋아하는 음악 감상', category: '정서', icon: 'headphones', duration: '15분' },
      { title: '소중한 사람에게 연락', category: '정서', icon: 'chat_bubble', duration: '자유' },
    ],
  },
  social: {
    name: '사회적 휴식',
    icon: 'groups',
    color: '#8B5CF6',
    bgColor: '#F5F3FF',
    desc: '사람들과의 관계에서 에너지를 재충전할 시간이에요. 가까운 사람과 편하게 만나거나 혼자만의 시간을 가져보세요.',
    contents: [
      { title: '친구와 가벼운 수다', category: '사회', icon: 'forum', duration: '자유' },
      { title: '혼자 카페에서 쉬기', category: '사회', icon: 'local_cafe', duration: '1시간' },
      { title: '소모임 참여', category: '사회', icon: 'group_add', duration: '자유' },
    ],
  },
  nature: {
    name: '자연의 연결',
    icon: 'forest',
    color: '#059669',
    bgColor: '#F0FDF4',
    desc: '자연 속에서 에너지를 충전하는 시간이 필요해요. 공원 산책, 등산, 바다 구경 등으로 자연과 가까워져 보세요.',
    contents: [
      { title: '공원 산책', category: '자연', icon: 'park', duration: '20분' },
      { title: '베란다 햇볕 쬐기', category: '자연', icon: 'wb_sunny', duration: '10분' },
      { title: '식물 돌보기', category: '자연', icon: 'eco', duration: '10분' },
    ],
  },
  creative: {
    name: '창조적 몰입',
    icon: 'brush',
    color: '#F97316',
    bgColor: '#FFF7ED',
    desc: '창작 활동에 몰입하면서 스트레스를 해소해보세요. 그림 그리기, 글쓰기, 요리 등 나만의 창작을 즐겨보세요.',
    contents: [
      { title: '낙서하며 생각 비우기', category: '창작', icon: 'draw', duration: '자유' },
      { title: '짧은 글쓰기', category: '창작', icon: 'edit', duration: '15분' },
      { title: '간단한 요리 도전', category: '창작', icon: 'restaurant', duration: '30분' },
    ],
  },
};

function DiagnosisResult() {
  const navigate = useNavigate();
  const [result, setResult] = useState(null);
  const [typeScores, setTypeScores] = useState([]);

  useEffect(() => {
    const stored = sessionStorage.getItem('diagnosisResult');
    if (!stored) {
      navigate('/diagnosis/quiz');
      return;
    }
    const parsed = JSON.parse(stored);
    setResult(parsed);

    const scores = JSON.parse(parsed.scoresJson || '{}');
    const sorted = Object.entries(scores)
      .map(([type, score]) => ({ type, score }))
      .sort((a, b) => b.score - a.score);
    setTypeScores(sorted);

    // 진단 결과가 서버에 저장된 경우(id 존재) recommendations 자동 생성
    const token = localStorage.getItem('accessToken');
    if (parsed.id && token) {
      fetch('/api/recommendations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ diagnosisResultId: parsed.id }),
      }).catch(() => { /* 추천 저장 실패 시 무시 */ });
    }
  }, [navigate]);

  const handleRetry = () => {
    sessionStorage.removeItem('diagnosisResult');
    navigate('/diagnosis/quiz');
  };

  if (!result) return null;

  const info = REST_TYPE_INFO[result.primaryRestType] || REST_TYPE_INFO.mental;
  const maxScore = typeScores[0]?.score || 100;

  const stressLevel =
    result.stressIndex > 70 ? { label: '높음', color: '#EF4444', bg: '#FFF5F5' } :
    result.stressIndex > 40 ? { label: '보통', color: '#F59E0B', bg: '#FFFBEB' } :
                              { label: '낮음', color: '#10B981', bg: '#F0FDF9' };

  return (
    <div className="min-h-screen bg-[#F7F7F8]">
      <UserNavbar />

      <main className="max-w-[560px] mx-auto px-6 pt-10 pb-24 space-y-5">

        {/* ── 결과 헤더 ────────────────────────────────────────────────────── */}
        <div
          className="rounded-3xl overflow-hidden shadow-sm"
          style={{ backgroundColor: info.bgColor }}
        >
          {/* 상단 컬러 배너 */}
          <div
            className="px-8 pt-8 pb-6 text-center"
            style={{ background: `linear-gradient(135deg, ${info.color}22 0%, ${info.color}08 100%)` }}
          >
            <p className="text-[12px] font-bold tracking-widest uppercase mb-5" style={{ color: info.color }}>
              당신에게 지금 필요한 휴식
            </p>

            {/* 아이콘 */}
            <div
              className="relative w-28 h-28 mx-auto mb-6"
            >
              <div
                className="absolute inset-0 rounded-3xl rotate-6 opacity-30"
                style={{ backgroundColor: info.color }}
              />
              <div
                className="relative w-28 h-28 rounded-3xl flex items-center justify-center shadow-xl"
                style={{ backgroundColor: info.color }}
              >
                <span className="material-icons text-white text-[52px]">{info.icon}</span>
              </div>
            </div>

            <h1 className="text-[32px] font-extrabold text-slate-900 tracking-tight mb-4">
              {info.name}
            </h1>
            <p className="text-[15px] text-slate-600 leading-[1.8] font-medium">
              {info.desc}
            </p>
          </div>

          {/* 스트레스 지수 */}
          <div className="px-8 py-5 border-t" style={{ borderColor: info.color + '20' }}>
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="text-[12px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">스트레스 지수</p>
                <p className="text-[13px] text-slate-500 leading-relaxed">
                  {result.stressIndex > 70
                    ? '충분한 휴식이 필요해요'
                    : result.stressIndex > 40
                      ? '규칙적인 휴식을 추천해요'
                      : '좋은 상태예요! 지금을 유지하세요'}
                </p>
              </div>
              <div
                className="text-right px-4 py-2 rounded-xl"
                style={{ backgroundColor: stressLevel.bg }}
              >
                <p className="text-[28px] font-extrabold leading-none" style={{ color: stressLevel.color }}>
                  {result.stressIndex}
                </p>
                <p className="text-[11px] font-bold" style={{ color: stressLevel.color }}>점 · {stressLevel.label}</p>
              </div>
            </div>
            <div className="h-2 bg-white/60 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-1000"
                style={{ width: `${result.stressIndex}%`, backgroundColor: stressLevel.color }}
              />
            </div>
          </div>
        </div>

        {/* ── 지금 바로 해볼 수 있어요 ─────────────────────────────────────── */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="px-6 py-5 border-b border-slate-100">
            <h2 className="text-[16px] font-extrabold text-slate-900">지금 바로 해볼 수 있어요</h2>
            <p className="text-[12px] text-slate-400 mt-0.5">당신의 유형에 맞는 추천 활동이에요</p>
          </div>
          <div className="divide-y divide-slate-50">
            {info.contents.map((item, idx) => (
              <div
                key={idx}
                className="flex items-center gap-4 px-6 py-4 hover:bg-slate-50 transition-colors cursor-pointer group"
              >
                <div
                  className="w-11 h-11 rounded-2xl flex items-center justify-center flex-shrink-0"
                  style={{ backgroundColor: info.color + '15' }}
                >
                  <span className="material-icons text-[22px]" style={{ color: info.color }}>{item.icon}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[14px] font-bold text-slate-900">{item.title}</p>
                  <p className="text-[12px] text-slate-400 mt-0.5">{item.category} · {item.duration}</p>
                </div>
                <span className="material-icons text-slate-300 group-hover:text-slate-500 transition-colors">chevron_right</span>
              </div>
            ))}
          </div>
        </div>

        {/* ── 7가지 유형 점수 바 차트 ──────────────────────────────────────── */}
        {typeScores.length > 0 && (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
            <h2 className="text-[16px] font-extrabold text-slate-900 mb-1">유형별 점수</h2>
            <p className="text-[12px] text-slate-400 mb-5">7가지 휴식 유형 중 나에게 얼마나 필요한지 보여요</p>
            <div className="space-y-4">
              {typeScores.map((item, i) => {
                const t = REST_TYPE_INFO[item.type] || {};
                const barWidth = maxScore > 0 ? Math.round((item.score / maxScore) * 100) : 0;
                return (
                  <div key={item.type}>
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-2">
                        {i === 0 && (
                          <span
                            className="text-[10px] font-extrabold px-2 py-0.5 rounded-full text-white"
                            style={{ backgroundColor: t.color }}
                          >
                            1위
                          </span>
                        )}
                        <span className="material-icons text-[16px]" style={{ color: t.color }}>{t.icon}</span>
                        <span className="text-[13px] font-semibold text-slate-700">{t.name}</span>
                      </div>
                      <span className="text-[13px] font-bold text-slate-500">{item.score}점</span>
                    </div>
                    <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-700"
                        style={{
                          width: `${barWidth}%`,
                          backgroundColor: t.color,
                          transitionDelay: `${i * 80}ms`,
                          opacity: i === 0 ? 1 : 0.55 + (0.45 * (1 - i / typeScores.length)),
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ── 액션 버튼 ────────────────────────────────────────────────────── */}
        <div className="space-y-3 pt-2">
          <Link
            to="/map"
            className="flex items-center justify-center gap-2 w-full py-4 bg-primary hover:bg-emerald-500 active:scale-[0.98] text-white text-[16px] font-bold rounded-2xl shadow-lg shadow-emerald-100 transition-all"
          >
            <span className="material-icons text-[20px]">place</span>
            주변 쉼터 추천 받기
          </Link>
          <button
            onClick={handleRetry}
            className="w-full py-4 border-2 border-slate-200 hover:border-slate-300 text-slate-500 text-[15px] font-bold rounded-2xl hover:bg-slate-50 transition-all flex items-center justify-center gap-2"
          >
            <span className="material-icons text-[18px]">refresh</span>
            다시 진단하기
          </button>
        </div>

      </main>
    </div>
  );
}

export default DiagnosisResult;
