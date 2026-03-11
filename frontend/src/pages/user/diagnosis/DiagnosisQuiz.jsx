import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import UserNavbar from '../../../components/user/UserNavbar';
import { fetchWithAuth } from '../../../api/fetchWithAuth';

const CATEGORY_ICON = {
  physical:  'fitness_center',
  mental:    'spa',
  sensory:   'visibility_off',
  emotional: 'favorite',
  social:    'groups',
  nature:    'forest',
  creative:  'brush',
};

const CATEGORY_COLOR = {
  physical:  '#4CAF82',
  mental:    '#5B8DEF',
  sensory:   '#9B6DFF',
  emotional: '#FF7BAC',
  social:    '#FF9A3C',
  nature:    '#2ECC9A',
  creative:  '#FFB830',
};

const CHOICE_LABELS = ['A', 'B', 'C', 'D'];

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

  // ── 로딩 중 ──────────────────────────────────────────────────────────────────
  if (loadingQuestions) {
    return (
      <div className="min-h-screen bg-white">
        <UserNavbar />
        <div className="flex flex-col items-center justify-center h-64 gap-4">
          <div className="w-10 h-10 border-4 border-slate-100 border-t-primary rounded-full animate-spin" />
          <p className="text-[13px] text-slate-400 font-medium">문항을 불러오는 중...</p>
        </div>
      </div>
    );
  }

  // ── 에러 ─────────────────────────────────────────────────────────────────────
  if (error) {
    return (
      <div className="min-h-screen bg-white">
        <UserNavbar />
        <main className="max-w-[520px] mx-auto px-6 pt-16 text-center">
          <span className="material-icons text-[48px] text-slate-300 mb-4 block">error_outline</span>
          <p className="text-[15px] font-semibold text-slate-600 mb-2">문항을 불러오지 못했어요</p>
          <p className="text-[13px] text-slate-400 mb-8">{error}</p>
          <button
            onClick={loadQuestions}
            className="px-8 py-3 bg-primary text-white font-bold rounded-2xl hover:bg-emerald-500 transition-all shadow-lg shadow-emerald-100"
          >
            다시 시도
          </button>
        </main>
      </div>
    );
  }

  const current = questions[currentIndex];
  const category = current.question?.category;
  const accentColor = CATEGORY_COLOR[category] || '#10b981';
  const progress = ((currentIndex + 1) / questions.length) * 100;
  const allAnswered = Object.keys(answers).length === questions.length;
  const isLastQuestion = currentIndex === questions.length - 1;
  const selectedChoiceId = answers[current.question?.id]?.choiceId;

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <UserNavbar />

      {/* ── 상단 진행바 ─────────────────────────────────────────────────────── */}
      <div className="sticky top-16 z-40 bg-white border-b border-slate-100">
        {/* 문항 번호 */}
        <div className="max-w-[520px] mx-auto px-6 pt-4 pb-3 flex items-center justify-between">
          <span className="text-[13px] font-bold text-slate-400">
            질문 <span className="text-slate-900">{currentIndex + 1}</span>
            <span className="text-slate-300"> / {questions.length}</span>
          </span>
          <span className="text-[13px] font-bold" style={{ color: accentColor }}>
            {Math.round(progress)}%
          </span>
        </div>
        {/* 진행바 — 카테고리 색상 */}
        <div className="h-1 bg-slate-100">
          <div
            className="h-full rounded-full transition-all duration-500 ease-out"
            style={{ width: `${progress}%`, backgroundColor: accentColor }}
          />
        </div>
      </div>

      <main className="flex-1 max-w-[520px] mx-auto w-full px-6 pt-10 pb-36">

        {/* 카테고리 아이콘 */}
        <div
          className="w-12 h-12 rounded-2xl flex items-center justify-center mb-6"
          style={{ backgroundColor: accentColor + '18' }}
        >
          <span className="material-icons text-[24px]" style={{ color: accentColor }}>
            {CATEGORY_ICON[category] || 'help_outline'}
          </span>
        </div>

        {/* 질문 텍스트 */}
        <h2 className="text-[22px] font-extrabold text-slate-900 leading-relaxed mb-10 tracking-tight">
          {current.question?.questionContent}
        </h2>

        {/* 선택지 카드 */}
        <div className="space-y-3">
          {current.choices?.map((choice, idx) => {
            const isSelected = selectedChoiceId === choice.id;
            return (
              <button
                key={choice.id}
                onClick={() => handleSelect(
                  current.question.id,
                  choice.id,
                  choice.score,
                  current.question.category
                )}
                className="w-full text-left p-4 rounded-2xl border-2 transition-all duration-150 flex items-center gap-4 group"
                style={{
                  borderColor: isSelected ? accentColor : '#E2E8F0',
                  backgroundColor: isSelected ? accentColor + '10' : '#ffffff',
                }}
              >
                {/* 레이블 원 */}
                <span
                  className="w-9 h-9 rounded-full flex items-center justify-center text-[13px] font-extrabold flex-shrink-0 transition-all"
                  style={{
                    backgroundColor: isSelected ? accentColor : '#F1F5F9',
                    color: isSelected ? '#ffffff' : '#94A3B8',
                  }}
                >
                  {CHOICE_LABELS[idx] ?? idx + 1}
                </span>
                <span
                  className="text-[15px] font-semibold leading-relaxed transition-colors"
                  style={{ color: isSelected ? accentColor : '#334155' }}
                >
                  {choice.choiceContent}
                </span>
                {isSelected && (
                  <span className="material-icons ml-auto flex-shrink-0 text-[20px]" style={{ color: accentColor }}>
                    check_circle
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* 미답변 / 비로그인 안내 */}
        {isLastQuestion && !allAnswered && (
          <p className="text-[12px] text-slate-400 text-center mt-6">
            모든 질문에 답해야 결과를 볼 수 있어요
          </p>
        )}
        {!isLoggedIn && (
          <p className="text-[12px] text-slate-400 text-center mt-4">
            로그인하면 진단 결과가 저장되고 맞춤 추천을 받을 수 있어요
          </p>
        )}
      </main>

      {/* ── 하단 고정 버튼 ─────────────────────────────────────────────────── */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-100 px-6 py-4">
        <div className="max-w-[520px] mx-auto flex gap-3">
          {/* 이전 */}
          {currentIndex > 0 && (
            <button
              onClick={() => setCurrentIndex((i) => i - 1)}
              disabled={submitting}
              className="flex-1 py-4 border-2 border-slate-200 text-slate-600 text-[15px] font-bold rounded-2xl hover:bg-slate-50 transition-all flex items-center justify-center gap-1"
            >
              <span className="material-icons text-[18px]">arrow_back</span>
              이전
            </button>
          )}

          {/* 다음 or 결과 보기 */}
          {!isLastQuestion ? (
            <button
              onClick={() => setCurrentIndex((i) => i + 1)}
              disabled={!selectedChoiceId}
              className="flex-1 py-4 text-white text-[15px] font-bold rounded-2xl transition-all disabled:opacity-40 flex items-center justify-center gap-1 shadow-lg"
              style={{ backgroundColor: selectedChoiceId ? accentColor : '#94A3B8', boxShadow: selectedChoiceId ? `0 8px 24px ${accentColor}30` : 'none' }}
            >
              다음
              <span className="material-icons text-[18px]">arrow_forward</span>
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={!allAnswered || submitting}
              className="flex-1 py-4 bg-primary hover:bg-emerald-500 text-white text-[15px] font-bold rounded-2xl transition-all disabled:opacity-40 flex items-center justify-center gap-2 shadow-lg shadow-emerald-100"
            >
              {submitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                  분석 중...
                </>
              ) : (
                <>
                  <span className="material-icons text-[18px]">auto_awesome</span>
                  결과 보기
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default DiagnosisQuiz;
