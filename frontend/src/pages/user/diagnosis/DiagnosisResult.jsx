import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import UserNavbar from '../../../components/user/UserNavbar';

const REST_TYPE_INFO = {
  physical: {
    name: '신체적 이완',
    icon: 'fitness_center',
    color: '#EF4444',
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
    desc: '사람들과의 관계에서 에너지를 재충전할 시간이에요. 가까운 사람과 편하게 만나거나 혼자만의 시간을 가져보세요.',
    contents: [
      { title: '친구와 가벼운 수다', category: '사회', icon: 'forum', duration: '자유' },
      { title: '혼자 카페에서 쉬기', category: '사회', icon: 'local_cafe', duration: '1시간' },
      { title: '소모임 참여', category: '사회', icon: 'group_add', duration: '자유' },
    ],
  },
  nature: {
    name: '자연과의 연결',
    icon: 'forest',
    color: '#059669',
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
  }, [navigate]);

  const handleRetry = () => {
    sessionStorage.removeItem('diagnosisResult');
    navigate('/diagnosis/quiz');
  };

  if (!result) return null;

  const info = REST_TYPE_INFO[result.primaryRestType] || REST_TYPE_INFO.mental;
  const maxScore = typeScores[0]?.score || 100;

  return (
    <div className="min-h-screen bg-[#F9F7F2]">
      <UserNavbar />

      <main className="max-w-lg mx-auto px-4 pt-8 pb-24">

        {/* 결과 헤더 카드 */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 text-center mb-5">
          <p className="text-sm font-semibold text-primary mb-4">당신에게 지금 필요한 휴식은</p>

          <div
            className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4"
            style={{ backgroundColor: `${info.color}18` }}
          >
            <span className="material-icons text-4xl" style={{ color: info.color }}>
              {info.icon}
            </span>
          </div>

          <h1 className="text-2xl font-bold text-slate-800 mb-2">{info.name}</h1>
          <p className="text-slate-500 text-sm leading-relaxed">{info.desc}</p>

          {/* 스트레스 지수 */}
          <div className="mt-5 bg-slate-50 rounded-xl p-4 text-left">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-semibold text-slate-600">스트레스 지수</span>
              <span className="text-lg font-bold" style={{
                color: result.stressIndex > 70 ? '#EF4444' : result.stressIndex > 40 ? '#F59E0B' : '#10B981'
              }}>
                {result.stressIndex}점
              </span>
            </div>
            <div className="w-full h-3 bg-slate-200 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-1000"
                style={{
                  width: `${result.stressIndex}%`,
                  backgroundColor: result.stressIndex > 70 ? '#EF4444' : result.stressIndex > 40 ? '#F59E0B' : '#10B981',
                }}
              />
            </div>
            <p className="text-xs text-slate-400 mt-2">
              {result.stressIndex > 70
                ? '스트레스가 높아요. 충분한 휴식이 필요해요!'
                : result.stressIndex > 40
                  ? '보통 수준이에요. 규칙적인 휴식을 추천해요.'
                  : '좋은 상태예요! 지금의 습관을 유지하세요.'}
            </p>
          </div>
        </div>

        {/* 추천 휴식 콘텐츠 3개 */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-5">
          <h2 className="font-bold text-slate-800 mb-4">지금 바로 해볼 수 있어요</h2>
          <div className="space-y-3">
            {info.contents.map((item, idx) => (
              <div
                key={idx}
                className="flex items-center gap-4 p-4 rounded-xl border border-slate-100 hover:border-primary/30 hover:bg-primary/5 transition-all cursor-pointer"
                style={{ borderLeftWidth: '3px', borderLeftColor: info.color }}
              >
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                  style={{ backgroundColor: `${info.color}15` }}
                >
                  <span className="material-icons text-xl" style={{ color: info.color }}>
                    {item.icon}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-slate-800 text-sm">{item.title}</p>
                  <p className="text-xs text-slate-400 mt-0.5">{item.category} · {item.duration}</p>
                </div>
                <span className="material-icons text-slate-300 shrink-0">chevron_right</span>
              </div>
            ))}
          </div>
        </div>

        {/* 유형별 점수 */}
        {typeScores.length > 0 && (
          <details className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
            <summary className="font-bold text-slate-800 cursor-pointer select-none">
              7가지 유형 전체 점수 보기
            </summary>
            <div className="mt-4 space-y-3">
              {typeScores.map((item, i) => {
                const t = REST_TYPE_INFO[item.type] || {};
                return (
                  <div key={item.type}>
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-400 w-4">{i + 1}</span>
                        <span className="material-icons text-sm" style={{ color: t.color }}>{t.icon}</span>
                        <span className="text-sm text-slate-700">{t.name}</span>
                        {i === 0 && (
                          <span className="text-xs bg-primary/10 text-primary px-1.5 py-0.5 rounded-full font-bold">1위</span>
                        )}
                      </div>
                      <span className="text-sm font-bold text-slate-600">{item.score}점</span>
                    </div>
                    <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden ml-6">
                      <div
                        className="h-full rounded-full transition-all duration-700"
                        style={{
                          width: `${maxScore > 0 ? (item.score / maxScore) * 100 : 0}%`,
                          backgroundColor: t.color,
                          transitionDelay: `${i * 0.1}s`,
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </details>
        )}

        {/* 액션 버튼 */}
        <div className="flex gap-3">
          <button
            onClick={handleRetry}
            className="flex-1 py-3.5 border-2 border-primary text-primary font-bold rounded-xl hover:bg-primary/5 transition-all"
          >
            다시 진단하기
          </button>
          <Link
            to="/contents"
            className="flex-1 py-3.5 bg-primary text-white font-bold rounded-xl hover:bg-primary/90 transition-all text-center"
          >
            추천 콘텐츠 보기
          </Link>
        </div>
      </main>
    </div>
  );
}

export default DiagnosisResult;
