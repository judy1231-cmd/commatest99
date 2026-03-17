import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { fetchWithAuth } from '../../api/fetchWithAuth';
import UserNavbar from '../../components/user/UserNavbar';
import Toast from '../../components/common/Toast';

const REST_TYPE_INFO = {
  physical: {
    name: '신체적 이완',
    icon: 'fitness_center',
    color: '#4CAF82',
    chipBg: '#F0FDF4',
    desc: '몸의 긴장을 풀고 신체를 편안하게 하는 휴식이 필요해요. 스트레칭, 산책, 가벼운 운동으로 몸을 이완해보세요.',
    activities: ['스트레칭', '가벼운 산책', '요가'],
  },
  mental: {
    name: '정신적 고요',
    icon: 'spa',
    color: '#5B8DEF',
    chipBg: '#F0F5FF',
    desc: '복잡한 생각을 내려놓고 마음의 고요함을 찾는 휴식이 필요해요. 명상, 호흡법, 차 한 잔의 여유를 가져보세요.',
    activities: ['명상', '심호흡', '차 마시기'],
  },
  sensory: {
    name: '감각의 정화',
    icon: 'visibility_off',
    color: '#9B6DFF',
    chipBg: '#F5F0FF',
    desc: '과도한 자극에서 벗어나 감각을 쉬게 해주는 시간이 필요해요. 디지털 디톡스나 조용한 공간에서 쉬어보세요.',
    activities: ['디지털 디톡스', '눈 감고 쉬기', '아로마테라피'],
  },
  emotional: {
    name: '정서적 지지',
    icon: 'favorite',
    color: '#FF7BAC',
    chipBg: '#FFF0F5',
    desc: '감정적 위안과 지지가 필요한 시기예요. 좋아하는 음악을 듣거나 소중한 사람과 대화를 나눠보세요.',
    activities: ['음악 감상', '일기 쓰기', '대화 나누기'],
  },
  social: {
    name: '사회적 휴식',
    icon: 'groups',
    color: '#FF9A3C',
    chipBg: '#FFF4EB',
    desc: '사람들과의 관계에서 에너지를 재충전할 시간이에요. 가까운 사람과 편하게 만나거나 혼자만의 시간을 가져보세요.',
    activities: ['친구와 수다', '혼자 카페 가기', '소모임'],
  },
  nature: {
    name: '자연의 연결',
    icon: 'forest',
    color: '#2ECC9A',
    chipBg: '#ECFDF5',
    desc: '자연 속에서 에너지를 충전하는 시간이 필요해요. 공원 산책, 등산, 바다 구경 등으로 자연과 가까워져 보세요.',
    activities: ['공원 산책', '등산', '숲 속 힐링'],
  },
  creative: {
    name: '창조적 몰입',
    icon: 'brush',
    color: '#FFB830',
    chipBg: '#FFFBEB',
    desc: '창작 활동에 몰입하면서 스트레스를 해소해보세요. 그림 그리기, 글쓰기, 요리 등 나만의 창작을 즐겨보세요.',
    activities: ['그림 그리기', '글쓰기', '요리'],
  },
};

function RestTypeTest() {
  const [step, setStep] = useState('intro'); // intro → survey → loading → result
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [otherTexts, setOtherTexts] = useState({});
  const [result, setResult] = useState(null);
  const [typeScores, setTypeScores] = useState([]);
  const [toast, setToast] = useState({ message: '', type: 'success' });

  const navigate = useNavigate();
  const isLoggedIn = !!localStorage.getItem('accessToken');

  useEffect(() => {
    loadQuestions();
  }, []);

  const loadQuestions = async () => {
    try {
      const res = await fetch('/api/survey/questions');
      const data = await res.json();
      if (data.success && data.data) setQuestions(data.data);
    } catch {
      setToast({ message: '질문을 불러오지 못했어요.', type: 'error' });
    }
  };

  const handleSelect = (questionId, choiceId, score, category) => {
    const newAnswers = { ...answers, [questionId]: { choiceId, score, category } };
    setAnswers(newAnswers);
    setTimeout(() => {
      if (currentIndex < questions.length - 1) setCurrentIndex(currentIndex + 1);
    }, 300);
  };

  const handleSubmit = async () => {
    const answersAtSubmit = { ...answers };
    if (!isLoggedIn) { showOfflineResult(answersAtSubmit); return; }
    setStep('loading');
    try {
      const responseList = Object.entries(answersAtSubmit).map(([questionId, { choiceId }]) => ({
        questionId: Number(questionId),
        choiceId: Number(choiceId),
      }));
      await fetchWithAuth('/api/survey/responses', { method: 'POST', body: JSON.stringify(responseList) });
      const otherTextList = Object.values(otherTexts).filter((t) => t.trim() !== '');
      const lastSessionId = localStorage.getItem('lastSessionId');
      const diagRes = await fetchWithAuth('/api/diagnosis/calculate', {
        method: 'POST',
        body: JSON.stringify({ sessionId: lastSessionId ? Number(lastSessionId) : null, otherTexts: otherTextList }),
      });
      localStorage.removeItem('lastSessionId');
      if (diagRes.success && diagRes.data) {
        setResult(diagRes.data);
        const scores = JSON.parse(diagRes.data.scoresJson || '{}');
        const sorted = Object.entries(scores).map(([type, score]) => ({ type, score })).sort((a, b) => b.score - a.score);
        setTypeScores(sorted);
        setStep('result');
        if (diagRes.data.id) {
          fetchWithAuth('/api/recommendations', { method: 'POST', body: JSON.stringify({ diagnosisResultId: diagRes.data.id }) }).catch(() => {});
        }
      } else {
        setToast({ message: '서버 오류 — 로컬 결과를 보여드려요.', type: 'error' });
        showOfflineResult(answersAtSubmit);
      }
    } catch {
      setToast({ message: '서버 연결 실패 — 로컬 결과를 보여드려요.', type: 'error' });
      showOfflineResult(answersAtSubmit);
    }
  };

  const showOfflineResult = (answersSnapshot) => {
    setStep('loading');
    const currentAnswers = answersSnapshot || answers;
    const types = ['physical', 'mental', 'sensory', 'emotional', 'social', 'nature', 'creative'];
    const typeScoreMap = {};
    types.forEach((t) => { typeScoreMap[t] = 0; });
    for (const answer of Object.values(currentAnswers)) {
      if (answer.category && typeScoreMap[answer.category] !== undefined) {
        typeScoreMap[answer.category] = answer.score;
      }
    }
    const sorted = Object.entries(typeScoreMap).map(([type, score]) => ({ type, score })).sort((a, b) => b.score - a.score);
    const primary = sorted[0].type;
    const avgScore = Math.round(sorted.reduce((sum, s) => sum + s.score, 0) / 7);
    setResult({ primaryRestType: primary, stressIndex: Math.min(100, avgScore), scoresJson: JSON.stringify(typeScoreMap) });
    setTypeScores(sorted);
    setTimeout(() => setStep('result'), 1500);
  };

  // ==================== 인트로 ====================
  if (step === 'intro') {
    return (
      <div className="min-h-screen bg-[#F7F7F8]">
        <UserNavbar />
        <main className="max-w-lg mx-auto px-5 pt-10 pb-32">

          {/* 아이콘 블록 */}
          <div className="flex justify-center mb-7">
            <div className="relative inline-flex items-center justify-center w-24 h-24">
              <div className="absolute inset-0 bg-emerald-50 rounded-3xl rotate-6" />
              <div className="absolute inset-0 bg-emerald-100 rounded-3xl -rotate-3" />
              <span className="material-icons text-5xl text-primary relative">psychology</span>
            </div>
          </div>

          <div className="text-center mb-8">
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-2">Rest Type Test</p>
            <h1 className="text-[26px] font-extrabold text-slate-800 tracking-tight mb-2">나의 휴식 유형 진단</h1>
            <p className="text-sm text-slate-400 leading-relaxed">
              {questions.length || 12}개 질문에 답하면 지금 당신에게<br />가장 필요한 휴식 유형을 알려드려요.
            </p>
          </div>

          {/* 7가지 유형 칩 */}
          <div className="flex flex-wrap justify-center gap-2 mb-8">
            {Object.entries(REST_TYPE_INFO).map(([key, info]) => (
              <div key={key} className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold"
                style={{ backgroundColor: info.chipBg, color: info.color }}>
                <span className="material-icons text-[14px]">{info.icon}</span>
                {info.name}
              </div>
            ))}
          </div>

          {/* 안내 카드 */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 mb-8 space-y-3">
            {[
              { icon: 'timer', text: '약 3분 소요' },
              { icon: 'quiz', text: `${questions.length || 12}개 질문` },
              { icon: 'auto_awesome', text: '7가지 휴식유형 AI 분석' },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                  <span className="material-icons text-primary text-[16px]">{item.icon}</span>
                </div>
                <span className="text-sm font-semibold text-slate-700">{item.text}</span>
              </div>
            ))}
          </div>

          {!isLoggedIn && (
            <p className="text-xs text-slate-400 text-center mb-4">
              로그인하면 결과가 저장되고 맞춤 추천을 받을 수 있어요
            </p>
          )}
        </main>

        {/* 하단 고정 버튼 */}
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-100 px-5 py-4 z-40">
          <button
            onClick={() => setStep('survey')}
            disabled={questions.length === 0}
            className="w-full py-4 bg-primary text-white font-bold text-[16px] rounded-2xl shadow-lg shadow-emerald-100 hover:bg-emerald-500 active:scale-[0.98] transition-all disabled:opacity-50"
          >
            {questions.length === 0 ? '질문 불러오는 중...' : '진단 시작하기'}
          </button>
        </div>

        <Toast message={toast.message} type={toast.type} onClose={() => setToast({ message: '', type: 'success' })} />
      </div>
    );
  }

  // ==================== 설문 화면 ====================
  if (step === 'survey' && questions.length > 0) {
    const current = questions[currentIndex];
    const catInfo = REST_TYPE_INFO[current.question.category] || REST_TYPE_INFO.mental;
    const progress = ((currentIndex + 1) / questions.length) * 100;
    const allAnswered = Object.keys(answers).length === questions.length;
    const isLastQuestion = currentIndex === questions.length - 1;

    return (
      <div className="min-h-screen bg-[#F7F7F8]">
        <UserNavbar />

        {/* 카테고리 컬러 진행바 */}
        <div className="h-1 bg-slate-100">
          <div
            className="h-full transition-all duration-500"
            style={{ width: `${progress}%`, backgroundColor: catInfo.color }}
          />
        </div>

        <main className="max-w-lg mx-auto px-5 pt-6 pb-36">

          {/* 진행 정보 */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-full flex items-center justify-center" style={{ backgroundColor: catInfo.chipBg }}>
                <span className="material-icons text-[14px]" style={{ color: catInfo.color }}>{catInfo.icon}</span>
              </div>
              <span className="text-[12px] font-extrabold" style={{ color: catInfo.color }}>{catInfo.name}</span>
            </div>
            <span className="text-[12px] font-bold text-slate-400">{currentIndex + 1} / {questions.length}</span>
          </div>

          {/* 질문 */}
          <div className="mb-6">
            <h2 className="text-[19px] font-extrabold text-slate-800 leading-snug tracking-tight">
              {current.question.questionContent}
            </h2>
          </div>

          {/* 선택지 카드 */}
          <div className="space-y-3">
            {current.choices.map((choice, idx) => {
              const isSelected = answers[current.question.id]?.choiceId === choice.id;
              const labels = ['전혀', '조금', '꽤', '매우'];
              return (
                <button
                  key={choice.id}
                  onClick={() => handleSelect(current.question.id, choice.id, choice.score, current.question.category)}
                  className="w-full text-left transition-all duration-150 active:scale-[0.98]"
                >
                  <div
                    className="flex items-center gap-4 p-4 rounded-2xl border-2 transition-all"
                    style={isSelected
                      ? { borderColor: catInfo.color, backgroundColor: catInfo.chipBg }
                      : { borderColor: '#E2E8F0', backgroundColor: '#fff' }}
                  >
                    {/* 번호 뱃지 */}
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 text-[13px] font-extrabold transition-all"
                      style={isSelected
                        ? { backgroundColor: catInfo.color, color: '#fff' }
                        : { backgroundColor: '#F1F5F9', color: '#94A3B8' }}>
                      {idx + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[14px] font-bold text-slate-800 leading-snug">{choice.choiceContent}</p>
                      {labels[idx] && (
                        <p className="text-[11px] font-semibold mt-0.5" style={{ color: isSelected ? catInfo.color : '#94A3B8' }}>
                          {labels[idx]}
                        </p>
                      )}
                    </div>
                    {isSelected && (
                      <span className="material-icons text-lg shrink-0" style={{ color: catInfo.color }}>check_circle</span>
                    )}
                  </div>
                </button>
              );
            })}

            {/* 기타 입력 */}
            <div className="flex items-center gap-3 pt-1">
              <div className="w-9 h-9 rounded-xl bg-slate-50 flex items-center justify-center shrink-0">
                <span className="material-icons text-[16px] text-slate-300">edit</span>
              </div>
              <input
                type="text"
                placeholder="직접 입력 (선택)"
                value={otherTexts[current.question.id] || ''}
                onChange={(e) => setOtherTexts({ ...otherTexts, [current.question.id]: e.target.value })}
                className="flex-1 h-11 px-4 rounded-xl border border-slate-200 bg-white text-sm text-slate-700 placeholder:text-slate-300 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all"
              />
            </div>
          </div>
        </main>

        {/* 하단 고정 네비 버튼 */}
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-100 px-5 py-4 z-40">
          <div className="max-w-lg mx-auto flex gap-3">
            {currentIndex > 0 && (
              <button
                onClick={() => setCurrentIndex(currentIndex - 1)}
                className="flex-1 py-4 border-2 border-slate-200 text-slate-600 font-bold text-[15px] rounded-2xl hover:bg-slate-50 transition-all"
              >
                이전
              </button>
            )}
            {!isLastQuestion ? (
              <button
                onClick={() => setCurrentIndex(currentIndex + 1)}
                disabled={!answers[current.question.id]?.choiceId}
                className="flex-1 py-4 font-bold text-[15px] rounded-2xl text-white shadow-lg transition-all active:scale-[0.98] disabled:opacity-40"
                style={{ backgroundColor: catInfo.color, boxShadow: `0 8px 20px ${catInfo.color}30` }}
              >
                다음
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={!allAnswered}
                className="flex-1 py-4 bg-primary font-bold text-[15px] rounded-2xl text-white shadow-lg shadow-emerald-100 hover:bg-emerald-500 transition-all active:scale-[0.98] disabled:opacity-40"
              >
                결과 보기
              </button>
            )}
          </div>
        </div>

        <Toast message={toast.message} type={toast.type} onClose={() => setToast({ message: '', type: 'success' })} />
      </div>
    );
  }

  // ==================== 로딩 화면 ====================
  if (step === 'loading') {
    return (
      <div className="min-h-screen bg-[#F7F7F8] flex items-center justify-center">
        <div className="text-center">
          <div className="relative inline-flex items-center justify-center w-24 h-24 mb-6">
            <div className="absolute inset-0 bg-emerald-50 rounded-3xl rotate-6 animate-pulse" />
            <div className="absolute inset-0 bg-emerald-100 rounded-3xl -rotate-3 animate-pulse" />
            <span className="material-icons text-5xl text-primary relative">psychology</span>
          </div>
          <h2 className="text-[20px] font-extrabold text-slate-800 mb-2">분석 중이에요</h2>
          <p className="text-sm text-slate-400">당신에게 꼭 맞는 휴식을 찾고 있어요...</p>
          <div className="mt-6 flex justify-center gap-1.5">
            {[0, 1, 2].map((i) => (
              <div key={i} className="w-2 h-2 bg-primary rounded-full animate-bounce"
                style={{ animationDelay: `${i * 0.15}s` }} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  // ==================== 결과 화면 ====================
  if (step === 'result' && result) {
    const primary = REST_TYPE_INFO[result.primaryRestType] || REST_TYPE_INFO.mental;
    const top3 = typeScores.slice(0, 3);
    const maxScore = top3[0]?.score || 100;
    const activityIcons = ['self_improvement', 'directions_walk', 'palette'];

    return (
      <div className="min-h-screen bg-[#F7F7F8]">
        <UserNavbar />

        <main className="max-w-lg mx-auto px-5 pt-8 pb-28">

          {/* 결과 헤더 카드 */}
          <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 text-center mb-5">
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-4">당신에게 가장 필요한 휴식</p>
            <div className="relative inline-flex items-center justify-center w-20 h-20 mb-4">
              <div className="absolute inset-0 rounded-2xl rotate-6" style={{ backgroundColor: primary.chipBg }} />
              <div className="absolute inset-0 rounded-2xl -rotate-3" style={{ backgroundColor: primary.color + '20' }} />
              <span className="material-icons text-4xl relative" style={{ color: primary.color }}>{primary.icon}</span>
            </div>
            <h1 className="text-[24px] font-extrabold text-slate-800 tracking-tight mb-2">{primary.name}</h1>
            <p className="text-sm text-slate-500 leading-relaxed">{primary.desc}</p>
          </div>

          {/* 스트레스 지수 */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 mb-5">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="material-icons text-sm text-slate-400">monitor_heart</span>
                <span className="text-sm font-extrabold text-slate-700">스트레스 지수</span>
              </div>
              <span className="text-[22px] font-extrabold" style={{
                color: result.stressIndex > 70 ? '#EF4444' : result.stressIndex > 40 ? '#F59E0B' : '#10B981'
              }}>{result.stressIndex}<span className="text-sm font-bold text-slate-400">점</span></span>
            </div>
            <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
              <div className="h-full rounded-full transition-all duration-1000"
                style={{
                  width: `${result.stressIndex}%`,
                  backgroundColor: result.stressIndex > 70 ? '#EF4444' : result.stressIndex > 40 ? '#F59E0B' : '#10B981',
                }} />
            </div>
            <p className="text-xs text-slate-400 mt-2">
              {result.stressIndex > 70 ? '스트레스가 높아요. 충분한 휴식이 필요해요!'
                : result.stressIndex > 40 ? '보통 수준이에요. 규칙적인 휴식을 추천해요.'
                : '좋은 상태예요! 지금의 습관을 유지하세요.'}
            </p>
          </div>

          {/* Top 3 유형 바 차트 */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 mb-5">
            <h3 className="text-[14px] font-extrabold text-slate-800 mb-4">유형별 분석</h3>
            <div className="space-y-4">
              {top3.map((item, i) => {
                const info = REST_TYPE_INFO[item.type] || {};
                return (
                  <div key={item.type}>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-lg flex items-center justify-center" style={{ backgroundColor: info.chipBg }}>
                          <span className="material-icons text-[12px]" style={{ color: info.color }}>{info.icon}</span>
                        </div>
                        <span className="text-[13px] font-bold text-slate-700">{info.name}</span>
                        {i === 0 && (
                          <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full" style={{ backgroundColor: info.chipBg, color: info.color }}>1위</span>
                        )}
                      </div>
                      <span className="text-[13px] font-extrabold text-slate-600">{item.score}점</span>
                    </div>
                    <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full rounded-full transition-all duration-700"
                        style={{ width: `${maxScore > 0 ? (item.score / maxScore) * 100 : 0}%`, backgroundColor: info.color, transitionDelay: `${i * 0.2}s` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 추천 활동 */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 mb-5">
            <h3 className="text-[14px] font-extrabold text-slate-800 mb-4">추천 활동</h3>
            <div className="grid grid-cols-3 gap-3">
              {primary.activities.map((activity, i) => (
                <div key={i} className="rounded-2xl p-4 text-center" style={{ backgroundColor: primary.chipBg }}>
                  <span className="material-icons text-2xl mb-1.5 block" style={{ color: primary.color }}>{activityIcons[i]}</span>
                  <p className="text-xs font-bold text-slate-700">{activity}</p>
                </div>
              ))}
            </div>
          </div>

          {/* 전체 유형 점수 */}
          <details className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 mb-5">
            <summary className="text-[14px] font-extrabold text-slate-800 cursor-pointer flex items-center justify-between">
              <span>전체 7가지 유형 점수</span>
              <span className="material-icons text-slate-300 text-base">expand_more</span>
            </summary>
            <div className="mt-4 space-y-3">
              {typeScores.map((item, i) => {
                const info = REST_TYPE_INFO[item.type] || {};
                return (
                  <div key={item.type} className="flex items-center gap-3">
                    <span className="text-[11px] font-extrabold text-slate-300 w-5 text-right">{i + 1}</span>
                    <div className="w-6 h-6 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: info.chipBg }}>
                      <span className="material-icons text-[12px]" style={{ color: info.color }}>{info.icon}</span>
                    </div>
                    <span className="text-sm text-slate-600 flex-1 font-medium">{info.name}</span>
                    <span className="text-sm font-extrabold" style={{ color: info.color }}>{item.score}</span>
                  </div>
                );
              })}
            </div>
          </details>

          {/* 심화 진단 배너 */}
          <Link to="/stress-test"
            className="flex items-center gap-4 bg-amber-50 rounded-2xl border border-amber-100 p-4 mb-6 hover:bg-amber-100 transition-all">
            <div className="w-10 h-10 bg-amber-500/15 rounded-xl flex items-center justify-center shrink-0">
              <span className="material-icons text-amber-500">psychology_alt</span>
            </div>
            <div className="flex-1">
              <p className="font-extrabold text-sm text-slate-800">더 정확한 스트레스 측정</p>
              <p className="text-xs text-slate-400">PSS 국제 표준 진단 (3분)</p>
            </div>
            <span className="material-icons text-slate-300">chevron_right</span>
          </Link>
        </main>

        {/* 하단 고정 버튼 */}
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-100 px-5 py-4 z-40">
          <div className="max-w-lg mx-auto space-y-2">
            {isLoggedIn && (
              <Link
                to="/records/diagnosis"
                className="flex items-center justify-center gap-2 w-full py-3 border-2 border-primary text-primary font-bold text-[14px] rounded-2xl hover:bg-primary/5 transition-all"
              >
                <span className="material-icons text-base">history</span>
                진단 기록 보기
              </Link>
            )}
            <div className="flex gap-3">
              <button
                onClick={() => { setStep('intro'); setCurrentIndex(0); setAnswers({}); setOtherTexts({}); setResult(null); setTypeScores([]); }}
                className="flex-1 py-4 border-2 border-slate-200 text-slate-600 font-bold text-[15px] rounded-2xl hover:bg-slate-50 transition-all"
              >
                다시 진단
              </button>
              {isLoggedIn ? (
                <button
                  onClick={() => navigate('/rest-record', { state: { fromDiagnosis: true, primaryRestType: result.primaryRestType } })}
                  className="flex-1 py-4 bg-primary text-white font-bold text-[15px] rounded-2xl text-center shadow-lg shadow-emerald-100 hover:bg-emerald-500 transition-all"
                >
                  이 유형으로 기록하기
                </button>
              ) : (
                <Link to="/login" className="flex-1 py-4 bg-primary text-white font-bold text-[15px] rounded-2xl text-center shadow-lg shadow-emerald-100 hover:bg-emerald-500 transition-all">
                  로그인하기
                </Link>
              )}
            </div>
          </div>
        </div>

        <Toast message={toast.message} type={toast.type} onClose={() => setToast({ message: '', type: 'success' })} />
      </div>
    );
  }

  // 기본 로딩
  return (
    <div className="min-h-screen bg-[#F7F7F8]">
      <UserNavbar />
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
      <Toast message={toast.message} type={toast.type} onClose={() => setToast({ message: '', type: 'success' })} />
    </div>
  );
}

export default RestTypeTest;
