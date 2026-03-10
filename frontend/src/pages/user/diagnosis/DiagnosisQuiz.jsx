import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import UserNavbar from '../../../components/user/UserNavbar';
import { fetchWithAuth } from '../../../api/fetchWithAuth';

const CATEGORY_ICON = {
  physical: 'fitness_center',
  mental: 'spa',
  sensory: 'visibility_off',
  emotional: 'favorite',
  social: 'groups',
  nature: 'forest',
  creative: 'brush',
};

function DiagnosisQuiz() {
  const navigate = useNavigate();
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState({}); // { questionId: { choiceId, score, category } }
  const [loadingQuestions, setLoadingQuestions] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const isLoggedIn = !!localStorage.getItem('accessToken');

  useEffect(() => {
    loadQuestions();
  }, []);

  const loadQuestions = async () => {
    try {
      setLoadingQuestions(true);
      const res = await fetch('/api/survey/questions');
      const data = await res.json();
      if (data.success && data.data?.length > 0) {
        setQuestions(data.data);
      } else {
        setError('질문을 불러오지 못했어요. 잠시 후 다시 시도해주세요.');
      }
    } catch {
      setError('서버에 연결할 수 없습니다.');
    } finally {
      setLoadingQuestions(false);
    }
  };

  const handleSelect = (questionId, choiceId, score, category) => {
    setAnswers((prev) => ({ ...prev, [questionId]: { choiceId, score, category } }));
    // 0.3초 후 자동으로 다음 문항으로
    setTimeout(() => {
      if (currentIndex < questions.length - 1) {
        setCurrentIndex((i) => i + 1);
      }
    }, 300);
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    setError(null);

    try {
      if (isLoggedIn) {
        // 응답 저장
        const responseList = Object.entries(answers).map(([questionId, { choiceId }]) => ({
          questionId: Number(questionId),
          choiceId: Number(choiceId),
        }));
        await fetchWithAuth('/api/survey/responses', {
          method: 'POST',
          body: JSON.stringify(responseList),
        });

        // 진단 계산
        const diagRes = await fetchWithAuth('/api/diagnosis/calculate', {
          method: 'POST',
          body: JSON.stringify({ sessionId: null, otherTexts: [] }),
        });

        if (diagRes.success && diagRes.data) {
          sessionStorage.setItem('diagnosisResult', JSON.stringify(diagRes.data));
          navigate('/diagnosis/result');
          return;
        }
      }

      // 비로그인 또는 API 실패 시 로컬 계산
      const localResult = calcLocalResult(answers);
      sessionStorage.setItem('diagnosisResult', JSON.stringify(localResult));
      navigate('/diagnosis/result');
    } catch {
      // 예외 발생 시도 로컬 계산으로 폴백
      const localResult = calcLocalResult(answers);
      sessionStorage.setItem('diagnosisResult', JSON.stringify(localResult));
      navigate('/diagnosis/result');
    } finally {
      setSubmitting(false);
    }
  };

  // 비로그인 로컬 진단 계산
  const calcLocalResult = (answersSnapshot) => {
    const types = ['physical', 'mental', 'sensory', 'emotional', 'social', 'nature', 'creative'];
    const typeScoreMap = Object.fromEntries(types.map((t) => [t, 0]));

    for (const { category, score } of Object.values(answersSnapshot)) {
      if (category && typeScoreMap[category] !== undefined) {
        typeScoreMap[category] = score;
      }
    }

    const sorted = Object.entries(typeScoreMap)
      .map(([type, score]) => ({ type, score }))
      .sort((a, b) => b.score - a.score);

    const avgScore = Math.round(sorted.reduce((sum, s) => sum + s.score, 0) / types.length);

    return {
      primaryRestType: sorted[0].type,
      stressIndex: Math.min(100, avgScore),
      scoresJson: JSON.stringify(typeScoreMap),
      isLocal: true,
    };
  };

  // ── 로딩 중 ──
  if (loadingQuestions) {
    return (
      <div className="min-h-screen bg-[#F9F7F2]">
        <UserNavbar />
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
        </div>
      </div>
    );
  }

  // ── 에러 ──
  if (error) {
    return (
      <div className="min-h-screen bg-[#F9F7F2]">
        <UserNavbar />
        <main className="max-w-lg mx-auto px-4 pt-12 text-center">
          <span className="material-icons text-5xl text-slate-300 mb-4 block">error_outline</span>
          <p className="text-slate-500 mb-6">{error}</p>
          <button
            onClick={loadQuestions}
            className="px-6 py-3 bg-primary text-white font-bold rounded-xl hover:bg-primary/90 transition-all"
          >
            다시 시도
          </button>
        </main>
      </div>
    );
  }

  const current = questions[currentIndex];
  const progress = ((currentIndex + 1) / questions.length) * 100;
  const allAnswered = Object.keys(answers).length === questions.length;
  const isLastQuestion = currentIndex === questions.length - 1;

  return (
    <div className="min-h-screen bg-[#F9F7F2]">
      <UserNavbar />

      <main className="max-w-lg mx-auto px-4 pt-6 pb-24">

        {/* 진행률 */}
        <div className="mb-6">
          <div className="flex justify-between items-center text-sm text-slate-400 mb-2">
            <span className="font-medium text-slate-600">
              질문 <span className="text-primary font-bold">{currentIndex + 1}</span> / {questions.length}
            </span>
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
              {CATEGORY_ICON[current.question?.category] || 'help_outline'}
            </span>
          </div>

          <h2 className="text-lg font-bold text-slate-800 mb-6 leading-relaxed">
            {current.question?.questionContent}
          </h2>

          {/* 선택지 카드 */}
          <div className="space-y-3">
            {current.choices?.map((choice) => {
              const isSelected = answers[current.question.id]?.choiceId === choice.id;
              return (
                <button
                  key={choice.id}
                  onClick={() => handleSelect(
                    current.question.id,
                    choice.id,
                    choice.score,
                    current.question.category
                  )}
                  className={`w-full text-left p-4 rounded-xl border-2 transition-all font-medium flex items-center gap-3 ${
                    isSelected
                      ? 'border-primary bg-soft-mint text-primary'
                      : 'border-slate-200 text-slate-700 hover:border-primary/40 hover:bg-primary/5'
                  }`}
                >
                  <span className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shrink-0 transition-all ${
                    isSelected ? 'bg-primary text-white' : 'bg-slate-100 text-slate-500'
                  }`}>
                    {choice.displayOrder}
                  </span>
                  {choice.choiceContent}
                </button>
              );
            })}
          </div>
        </div>

        {/* 이전 / 다음 버튼 */}
        <div className="flex gap-3">
          {currentIndex > 0 && (
            <button
              onClick={() => setCurrentIndex((i) => i - 1)}
              disabled={submitting}
              className="flex-1 py-3.5 border-2 border-slate-200 text-slate-600 font-bold rounded-xl hover:bg-slate-50 transition-all"
            >
              이전
            </button>
          )}

          {!isLastQuestion ? (
            <button
              onClick={() => setCurrentIndex((i) => i + 1)}
              disabled={!answers[current.question.id]?.choiceId}
              className="flex-1 py-3.5 bg-primary text-white font-bold rounded-xl hover:bg-primary/90 transition-all disabled:opacity-40"
            >
              다음
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={!allAnswered || submitting}
              className="flex-1 py-3.5 bg-primary text-white font-bold rounded-xl hover:bg-primary/90 transition-all disabled:opacity-40 flex items-center justify-center gap-2"
            >
              {submitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                  분석 중...
                </>
              ) : (
                '결과 보기'
              )}
            </button>
          )}
        </div>

        {/* 미답변 안내 */}
        {isLastQuestion && !allAnswered && (
          <p className="text-xs text-slate-400 text-center mt-3">
            아직 답하지 않은 질문이 있어요. 모든 질문에 답해주세요.
          </p>
        )}

        {!isLoggedIn && (
          <p className="text-xs text-slate-400 text-center mt-4">
            로그인하면 진단 결과가 저장되고 맞춤 추천을 받을 수 있어요
          </p>
        )}
      </main>
    </div>
  );
}

export default DiagnosisQuiz;
