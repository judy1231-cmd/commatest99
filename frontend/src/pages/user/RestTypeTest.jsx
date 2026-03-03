import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { fetchWithAuth } from '../../api/fetchWithAuth';
import UserNavbar from '../../components/user/UserNavbar';
import Toast from '../../components/common/Toast';

// 휴식유형 한글 매핑 + 아이콘 + 색상 + 설명
const REST_TYPE_INFO = {
  physical: {
    name: '신체적 이완',
    icon: 'fitness_center',
    color: '#EF4444',
    bg: 'bg-red-50',
    desc: '몸의 긴장을 풀고 신체를 편안하게 하는 휴식이 필요해요. 스트레칭, 산책, 가벼운 운동으로 몸을 이완해보세요.',
    activities: ['스트레칭', '가벼운 산책', '요가'],
  },
  mental: {
    name: '정신적 고요',
    icon: 'spa',
    color: '#10B981',
    bg: 'bg-emerald-50',
    desc: '복잡한 생각을 내려놓고 마음의 고요함을 찾는 휴식이 필요해요. 명상, 호흡법, 차 한 잔의 여유를 가져보세요.',
    activities: ['명상', '심호흡', '차 마시기'],
  },
  sensory: {
    name: '감각의 정화',
    icon: 'visibility_off',
    color: '#F59E0B',
    bg: 'bg-amber-50',
    desc: '과도한 자극에서 벗어나 감각을 쉬게 해주는 시간이 필요해요. 디지털 디톡스나 조용한 공간에서 쉬어보세요.',
    activities: ['디지털 디톡스', '눈 감고 쉬기', '아로마테라피'],
  },
  emotional: {
    name: '정서적 지지',
    icon: 'favorite',
    color: '#EC4899',
    bg: 'bg-pink-50',
    desc: '감정적 위안과 지지가 필요한 시기예요. 좋아하는 음악을 듣거나 소중한 사람과 대화를 나눠보세요.',
    activities: ['음악 감상', '일기 쓰기', '대화 나누기'],
  },
  social: {
    name: '사회적 휴식',
    icon: 'groups',
    color: '#8B5CF6',
    bg: 'bg-purple-50',
    desc: '사람들과의 관계에서 에너지를 재충전할 시간이에요. 가까운 사람과 편하게 만나거나 혼자만의 시간을 가져보세요.',
    activities: ['친구와 수다', '혼자 카페 가기', '소모임'],
  },
  nature: {
    name: '자연과의 연결',
    icon: 'forest',
    color: '#059669',
    bg: 'bg-green-50',
    desc: '자연 속에서 에너지를 충전하는 시간이 필요해요. 공원 산책, 등산, 바다 구경 등으로 자연과 가까워져 보세요.',
    activities: ['공원 산책', '등산', '숲 속 힐링'],
  },
  creative: {
    name: '창조적 몰입',
    icon: 'brush',
    color: '#F97316',
    bg: 'bg-orange-50',
    desc: '창작 활동에 몰입하면서 스트레스를 해소해보세요. 그림 그리기, 글쓰기, 요리 등 나만의 창작을 즐겨보세요.',
    activities: ['그림 그리기', '글쓰기', '요리'],
  },
};

function RestTypeTest() {
  const [step, setStep] = useState('intro'); // intro → survey → loading → result
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState({}); // { questionId: { choiceId, score } }
  const [otherTexts, setOtherTexts] = useState({}); // { questionId: string }
  const [result, setResult] = useState(null); // DiagnosisResult
  const [typeScores, setTypeScores] = useState([]); // 정렬된 유형별 점수
  const [toast, setToast] = useState({ message: '', type: 'success' });

  const isLoggedIn = !!localStorage.getItem('accessToken');

  // 설문 질문 로드
  useEffect(() => {
    loadQuestions();
  }, []);

  const loadQuestions = async () => {
    try {
      const res = await fetch('/api/survey/questions');
      const data = await res.json();
      if (data.success && data.data) {
        setQuestions(data.data);
      }
    } catch {
      setToast({ message: '질문을 불러오지 못했어요.', type: 'error' });
    }
  };

  // 선택지 클릭 처리 — score까지 함께 저장 (find 없이 오프라인 계산 가능)
  const handleSelect = (questionId, choiceId, score) => {
    const newAnswers = { ...answers, [questionId]: { choiceId, score } };
    setAnswers(newAnswers);

    // 자동으로 다음 질문으로 이동 (0.3초 딜레이)
    setTimeout(() => {
      if (currentIndex < questions.length - 1) {
        setCurrentIndex(currentIndex + 1);
      }
    }, 300);
  };

  // 설문 제출 + 진단 계산
  const handleSubmit = async () => {
    if (!isLoggedIn) {
      // 비로그인 사용자는 간이 결과 표시
      showOfflineResult();
      return;
    }

    setStep('loading');

    try {
      // Step 1: 설문 응답 제출
      const responseList = Object.entries(answers).map(([questionId, { choiceId }]) => ({
        questionId: Number(questionId),
        choiceId: Number(choiceId),
      }));

      await fetchWithAuth('/api/survey/responses', {
        method: 'POST',
        body: JSON.stringify(responseList),
      });

      // Step 2: 진단 계산 (기타 텍스트 포함)
      const otherTextList = Object.values(otherTexts).filter((t) => t.trim() !== '');
      const diagRes = await fetchWithAuth('/api/diagnosis/calculate', {
        method: 'POST',
        body: JSON.stringify({ sessionId: null, otherTexts: otherTextList }),
      });

      if (diagRes.success && diagRes.data) {
        setResult(diagRes.data);

        // Step 3: 점수 JSON 파싱하여 정렬
        const scores = JSON.parse(diagRes.data.scoresJson || '{}');
        const sorted = Object.entries(scores)
          .map(([type, score]) => ({ type, score }))
          .sort((a, b) => b.score - a.score);
        setTypeScores(sorted);
        setStep('result');
      } else {
        // API 실패 시 오프라인 간이 결과로 폴백 (백엔드 미완성 환경 대응)
        setToast({ message: '서버 오류 — 로컬 결과를 보여드려요.', type: 'error' });
        showOfflineResult();
      }
    } catch {
      // 네트워크 오류 시에도 오프라인 결과로 폴백
      setToast({ message: '서버 연결 실패 — 로컬 결과를 보여드려요.', type: 'error' });
      showOfflineResult();
    }
  };

  // 비로그인 간이 결과 — answers에 저장된 score를 직접 사용 (find 불필요)
  // 빈도 기반: 가장 많이 선택된 유형이 100점, 나머지는 비례 환산
  const showOfflineResult = () => {
    setStep('loading');

    const SCORE_TO_TYPE = { 1: 'physical', 2: 'mental', 3: 'sensory', 4: 'emotional', 5: 'social', 6: 'nature', 7: 'creative' };
    const types = ['physical', 'mental', 'sensory', 'emotional', 'social', 'nature', 'creative'];

    // 각 유형이 선택된 횟수 집계 — answers에서 score를 직접 읽음
    const frequency = {};
    types.forEach((t) => { frequency[t] = 0; });

    for (const answer of Object.values(answers)) {
      const { score } = answer;
      const mappedType = SCORE_TO_TYPE[score];
      if (mappedType) frequency[mappedType]++;
    }

    // 최다 선택 유형 = 100점 기준, 나머지 비례 환산
    const maxFreq = Math.max(...Object.values(frequency), 1);
    const typeScoreMap = {};
    for (const t of types) {
      typeScoreMap[t] = maxFreq > 0 ? Math.round((frequency[t] / maxFreq) * 100) : 0;
    }

    const sorted = Object.entries(typeScoreMap)
      .map(([type, score]) => ({ type, score }))
      .sort((a, b) => b.score - a.score);

    const primary = sorted[0].type;
    const maxScore = sorted[0].score;
    const avgScore = Math.round(sorted.reduce((sum, s) => sum + s.score, 0) / 7);
    const stressIndex = Math.min(100, maxScore - avgScore + 40);

    setResult({
      primaryRestType: primary,
      stressIndex,
      scoresJson: JSON.stringify(typeScoreMap),
    });
    setTypeScores(sorted);

    setTimeout(() => setStep('result'), 1500);
  };

  // ==================== 인트로 화면 ====================
  if (step === 'intro') {
    return (
      <div className="min-h-screen bg-[#F9F7F2]">
        <UserNavbar />
        <main className="max-w-lg mx-auto px-4 pt-12 pb-24 text-center">
          <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <span className="material-icons text-primary text-4xl">psychology</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-800 mb-3">나의 휴식 유형 진단</h1>
          <p className="text-slate-500 leading-relaxed mb-2">
            7가지 질문에 답하면 지금 당신에게
          </p>
          <p className="text-slate-500 leading-relaxed mb-8">
            가장 필요한 휴식 유형을 알려드려요.
          </p>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 mb-8 text-left">
            <div className="flex items-center gap-3 mb-3">
              <span className="material-icons text-primary">timer</span>
              <span className="text-sm font-semibold text-slate-700">약 2분 소요</span>
            </div>
            <div className="flex items-center gap-3 mb-3">
              <span className="material-icons text-primary">quiz</span>
              <span className="text-sm font-semibold text-slate-700">{questions.length}개 질문</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="material-icons text-primary">auto_awesome</span>
              <span className="text-sm font-semibold text-slate-700">7가지 휴식유형 분석</span>
            </div>
          </div>

          <button
            onClick={() => setStep('survey')}
            disabled={questions.length === 0}
            className="w-full bg-primary text-white font-bold py-3.5 rounded-xl hover:bg-primary/90 transition-all active:scale-[0.98] disabled:opacity-50"
          >
            진단 시작하기
          </button>

          {!isLoggedIn && (
            <p className="text-xs text-slate-400 mt-4">
              로그인하면 결과가 저장되고 맞춤 추천을 받을 수 있어요
            </p>
          )}
        </main>
      </div>
    );
  }

  // ==================== 설문 화면 ====================
  if (step === 'survey' && questions.length > 0) {
    const current = questions[currentIndex];
    const progress = ((currentIndex + 1) / questions.length) * 100;
    const allAnswered = Object.keys(answers).length === questions.length;

    return (
      <div className="min-h-screen bg-[#F9F7F2]">
        <UserNavbar />
        <main className="max-w-lg mx-auto px-4 pt-6 pb-24">
          {/* 프로그레스 바 */}
          <div className="mb-6">
            <div className="flex justify-between text-sm text-slate-400 mb-2">
              <span>질문 {currentIndex + 1} / {questions.length}</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-primary rounded-full transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          {/* 질문 카드 */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-4">
            <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center mb-4">
              <span className="material-icons text-primary">
                {REST_TYPE_INFO[current.question.category]?.icon || 'help_outline'}
              </span>
            </div>
            <h2 className="text-lg font-bold text-slate-800 mb-6 leading-relaxed">
              {current.question.questionContent}
            </h2>

            <div className="space-y-3">
              {current.choices.map((choice) => {
                const isSelected = answers[current.question.id]?.choiceId === choice.id;
                return (
                  <button
                    key={choice.id}
                    onClick={() => handleSelect(current.question.id, choice.id, choice.score)}
                    className={`w-full text-left p-4 rounded-xl border-2 transition-all font-medium flex items-center gap-3 ${
                      isSelected
                        ? 'border-primary bg-soft-mint text-primary'
                        : 'border-slate-200 text-slate-700 hover:border-primary/40 hover:bg-primary/5'
                    }`}
                  >
                    <span className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shrink-0 ${
                      isSelected ? 'bg-primary text-white' : 'bg-slate-100 text-slate-500'
                    }`}>
                      {choice.displayOrder}
                    </span>
                    {choice.choiceContent}
                  </button>
                );
              })}

              {/* 기타 입력란 */}
              <div className="flex items-center gap-3 pt-1">
                <span className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shrink-0 bg-slate-100 text-slate-400">
                  기타
                </span>
                <input
                  type="text"
                  placeholder="보기에 없으면 직접 입력해보세요 (선택)"
                  value={otherTexts[current.question.id] || ''}
                  onChange={(e) =>
                    setOtherTexts({ ...otherTexts, [current.question.id]: e.target.value })
                  }
                  className="flex-1 h-11 px-4 rounded-xl border border-gray-200 bg-gray-50 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none text-sm text-slate-700 placeholder:text-slate-400"
                />
              </div>
            </div>
          </div>

          {/* 네비게이션 버튼 */}
          <div className="flex gap-3">
            {currentIndex > 0 && (
              <button
                onClick={() => setCurrentIndex(currentIndex - 1)}
                className="flex-1 py-3 border-2 border-slate-200 text-slate-600 font-bold rounded-xl hover:bg-slate-50 transition-all"
              >
                이전
              </button>
            )}

            {currentIndex < questions.length - 1 ? (
              <button
                onClick={() => setCurrentIndex(currentIndex + 1)}
                disabled={!answers[current.question.id]?.choiceId}
                className="flex-1 py-3 bg-primary text-white font-bold rounded-xl hover:bg-primary/90 transition-all disabled:opacity-40"
              >
                다음
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={!allAnswered}
                className="flex-1 py-3 bg-primary text-white font-bold rounded-xl hover:bg-primary/90 transition-all disabled:opacity-40"
              >
                결과 보기
              </button>
            )}
          </div>
        </main>
      </div>
    );
  }

  // ==================== 로딩 화면 ====================
  if (step === 'loading') {
    return (
      <div className="min-h-screen bg-[#F9F7F2] flex items-center justify-center">
        <div className="text-center">
          <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse">
            <span className="material-icons text-primary text-4xl">psychology</span>
          </div>
          <h2 className="text-xl font-bold text-slate-800 mb-2">분석 중이에요</h2>
          <p className="text-slate-500">당신에게 꼭 맞는 휴식을 찾고 있어요...</p>
          <div className="mt-6 flex justify-center gap-1">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="w-2.5 h-2.5 bg-primary rounded-full animate-bounce"
                style={{ animationDelay: `${i * 0.15}s` }}
              />
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

    return (
      <div className="min-h-screen bg-[#F9F7F2]">
        <UserNavbar />
        <main className="max-w-lg mx-auto px-4 pt-8 pb-24">
          {/* 메인 결과 카드 */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 text-center mb-6">
            <p className="text-sm font-semibold text-primary mb-3">당신에게 가장 필요한 휴식은</p>
            <div
              className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4"
              style={{ backgroundColor: `${primary.color}15` }}
            >
              <span className="material-icons text-4xl" style={{ color: primary.color }}>
                {primary.icon}
              </span>
            </div>
            <h1 className="text-2xl font-bold text-slate-800 mb-3">{primary.name}</h1>
            <p className="text-slate-500 text-sm leading-relaxed mb-4">{primary.desc}</p>

            {/* 스트레스 지수 */}
            <div className="bg-slate-50 rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-semibold text-slate-600">스트레스 지수</span>
                <span className="text-lg font-bold text-primary">{result.stressIndex}점</span>
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

          {/* Top 3 유형별 점수 */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
            <h3 className="font-bold text-slate-800 mb-4">유형별 분석</h3>
            <div className="space-y-4">
              {top3.map((item, i) => {
                const info = REST_TYPE_INFO[item.type] || {};
                return (
                  <div key={item.type}>
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-2">
                        <span className="material-icons text-sm" style={{ color: info.color }}>
                          {info.icon}
                        </span>
                        <span className="text-sm font-semibold text-slate-700">{info.name}</span>
                        {i === 0 && (
                          <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full font-bold">
                            1위
                          </span>
                        )}
                      </div>
                      <span className="text-sm font-bold text-slate-600">{item.score}점</span>
                    </div>
                    <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-700"
                        style={{
                          width: `${(item.score / maxScore) * 100}%`,
                          backgroundColor: info.color,
                          transitionDelay: `${i * 0.2}s`,
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 추천 활동 */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
            <h3 className="font-bold text-slate-800 mb-4">추천 활동</h3>
            <div className="grid grid-cols-3 gap-3">
              {primary.activities.map((activity, i) => (
                <div
                  key={i}
                  className="rounded-xl p-3 text-center"
                  style={{ backgroundColor: `${primary.color}10` }}
                >
                  <span className="material-icons text-2xl mb-1" style={{ color: primary.color }}>
                    {['self_improvement', 'directions_walk', 'palette'][i]}
                  </span>
                  <p className="text-xs font-semibold text-slate-700">{activity}</p>
                </div>
              ))}
            </div>
          </div>

          {/* 전체 유형 점수 (접힘 가능) */}
          <details className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
            <summary className="font-bold text-slate-800 cursor-pointer">
              전체 7가지 유형 점수 보기
            </summary>
            <div className="mt-4 space-y-3">
              {typeScores.map((item, i) => {
                const info = REST_TYPE_INFO[item.type] || {};
                return (
                  <div key={item.type} className="flex items-center gap-3">
                    <span className="text-xs font-bold text-slate-400 w-5">{i + 1}</span>
                    <span className="material-icons text-sm" style={{ color: info.color }}>
                      {info.icon}
                    </span>
                    <span className="text-sm text-slate-600 flex-1">{info.name}</span>
                    <span className="text-sm font-bold text-slate-700">{item.score}</span>
                  </div>
                );
              })}
            </div>
          </details>

          {/* 심화 진단 배너 */}
          <Link
            to="/stress-test"
            className="block bg-amber-50 rounded-2xl border border-amber-200 p-5 mb-6 hover:bg-amber-100 transition-all"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-amber-500/10 rounded-xl flex items-center justify-center">
                <span className="material-icons text-amber-500">psychology_alt</span>
              </div>
              <div className="flex-1">
                <p className="font-bold text-sm text-slate-800">더 정확한 스트레스 측정</p>
                <p className="text-xs text-slate-500">PSS 국제 표준 진단 (3분)</p>
              </div>
              <span className="material-icons text-slate-400">chevron_right</span>
            </div>
          </Link>

          {/* 액션 버튼 */}
          <div className="flex gap-3">
            <button
              onClick={() => {
                setStep('intro');
                setCurrentIndex(0);
                setAnswers({});
                setOtherTexts({});
                setResult(null);
                setTypeScores([]);
              }}
              className="flex-1 py-3 border-2 border-primary text-primary font-bold rounded-xl hover:bg-primary/5 transition-all"
            >
              다시 진단
            </button>
            <Link
              to={isLoggedIn ? '/rest-record' : '/login'}
              className="flex-1 py-3 bg-primary text-white font-bold rounded-xl hover:bg-primary/90 transition-all text-center"
            >
              {isLoggedIn ? '휴식 기록하기' : '로그인하기'}
            </Link>
          </div>

          {!isLoggedIn && (
            <p className="text-xs text-slate-400 text-center mt-4">
              로그인하면 진단 결과가 저장되고 맞춤 추천을 받을 수 있어요
            </p>
          )}
        </main>

        <Toast message={toast.message} type={toast.type} onClose={() => setToast({ message: '', type: 'success' })} />
      </div>
    );
  }

  // 기본 로딩
  return (
    <div className="min-h-screen bg-[#F9F7F2]">
      <UserNavbar />
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
      <Toast message={toast.message} type={toast.type} onClose={() => setToast({ message: '', type: 'success' })} />
    </div>
  );
}

export default RestTypeTest;
