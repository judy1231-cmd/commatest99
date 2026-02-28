import { useState } from 'react';
import { Link } from 'react-router-dom';
import { fetchWithAuth } from '../../api/fetchWithAuth';
import UserNavbar from '../../components/user/UserNavbar';

/**
 * PSS-10 (Perceived Stress Scale) 기반 스트레스 심화 진단
 * — Cohen(1983) 개발, 국제 표준 스트레스 측정 도구
 * — 결과 화면의 "더 정확한 스트레스 측정" 버튼에서 진입
 */

const PSS_QUESTIONS = [
  { id: 1, text: '지난 한 달간, 예상치 못한 일이 생겨서 기분이 상한 적이 얼마나 있었나요?', reverse: false },
  { id: 2, text: '지난 한 달간, 중요한 일을 조절할 수 없다고 느낀 적이 얼마나 있었나요?', reverse: false },
  { id: 3, text: '지난 한 달간, 초조하거나 스트레스를 받는다고 느낀 적이 얼마나 있었나요?', reverse: false },
  { id: 4, text: '지난 한 달간, 개인적인 문제를 잘 처리할 수 있다고 자신한 적이 얼마나 있었나요?', reverse: true },
  { id: 5, text: '지난 한 달간, 일이 자기 뜻대로 진행되고 있다고 느낀 적이 얼마나 있었나요?', reverse: true },
  { id: 6, text: '지난 한 달간, 해야 할 일이 너무 많아서 감당이 안 된다고 느낀 적이 얼마나 있었나요?', reverse: false },
  { id: 7, text: '지난 한 달간, 짜증나는 일을 잘 다스릴 수 있었던 적이 얼마나 있었나요?', reverse: true },
  { id: 8, text: '지난 한 달간, 자신이 상황을 잘 통제하고 있다고 느낀 적이 얼마나 있었나요?', reverse: true },
  { id: 9, text: '지난 한 달간, 자신이 통제할 수 없는 일 때문에 화가 난 적이 얼마나 있었나요?', reverse: false },
  { id: 10, text: '지난 한 달간, 어려운 일이 너무 쌓여서 극복할 수 없다고 느낀 적이 얼마나 있었나요?', reverse: false },
];

const SCALE_OPTIONS = [
  { label: '전혀 없었다', value: 0 },
  { label: '거의 없었다', value: 1 },
  { label: '가끔 있었다', value: 2 },
  { label: '자주 있었다', value: 3 },
  { label: '매우 자주 있었다', value: 4 },
];

function getStressLevel(score) {
  if (score <= 13) return { level: '낮음', color: '#10B981', emoji: 'sentiment_satisfied', message: '현재 스트레스 수준이 낮아요. 지금의 생활 패턴을 유지하세요!' };
  if (score <= 26) return { level: '보통', color: '#F59E0B', emoji: 'sentiment_neutral', message: '보통 수준의 스트레스예요. 규칙적인 휴식으로 관리해보세요.' };
  return { level: '높음', color: '#EF4444', emoji: 'sentiment_dissatisfied', message: '스트레스가 높은 상태예요. 충분한 휴식과 전문 상담을 고려해보세요.' };
}

function StressTest() {
  const [step, setStep] = useState('intro'); // intro → test → result
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState({}); // { questionId: value }
  const [result, setResult] = useState(null);

  const isLoggedIn = !!localStorage.getItem('accessToken');

  const handleSelect = (questionId, value) => {
    setAnswers({ ...answers, [questionId]: value });
  };

  const calculateResult = async () => {
    // PSS 점수 계산: reverse 문항은 (4 - 응답값)으로 역산
    let totalScore = 0;
    for (const q of PSS_QUESTIONS) {
      const rawValue = answers[q.id] ?? 0;
      totalScore += q.reverse ? (4 - rawValue) : rawValue;
    }

    const stressInfo = getStressLevel(totalScore);
    setResult({ score: totalScore, ...stressInfo });
    setStep('result');

    // 로그인 사용자는 서버에 저장
    if (isLoggedIn) {
      try {
        await fetchWithAuth('/api/diagnosis/sessions/start', {
          method: 'POST',
          body: JSON.stringify({ deviceType: 'pss-survey' }),
        });
      } catch {
        // 저장 실패해도 결과는 보여줌
      }
    }
  };

  // ==================== 인트로 ====================
  if (step === 'intro') {
    return (
      <div className="min-h-screen bg-[#F9F7F2]">
        <UserNavbar />
        <main className="max-w-lg mx-auto px-4 pt-12 pb-24 text-center">
          <div className="w-20 h-20 bg-amber-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <span className="material-icons text-amber-500 text-4xl">psychology_alt</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-800 mb-3">스트레스 심화 진단</h1>
          <p className="text-slate-500 leading-relaxed mb-2">PSS(Perceived Stress Scale) 기반</p>
          <p className="text-slate-400 text-sm mb-8">국제 표준 스트레스 측정 도구로 정확한 수치를 확인해보세요</p>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 mb-8 text-left">
            <div className="flex items-center gap-3 mb-3">
              <span className="material-icons text-amber-500">timer</span>
              <span className="text-sm font-semibold text-slate-700">약 3분 소요</span>
            </div>
            <div className="flex items-center gap-3 mb-3">
              <span className="material-icons text-amber-500">quiz</span>
              <span className="text-sm font-semibold text-slate-700">10개 질문 (5점 척도)</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="material-icons text-amber-500">verified</span>
              <span className="text-sm font-semibold text-slate-700">Cohen(1983) 국제 표준</span>
            </div>
          </div>

          <button
            onClick={() => setStep('test')}
            className="w-full bg-amber-500 text-white font-bold py-3.5 rounded-xl hover:bg-amber-600 transition-all active:scale-[0.98]"
          >
            진단 시작하기
          </button>
        </main>
      </div>
    );
  }

  // ==================== 테스트 ====================
  if (step === 'test') {
    const current = PSS_QUESTIONS[currentIndex];
    const progress = ((currentIndex + 1) / PSS_QUESTIONS.length) * 100;
    const allAnswered = Object.keys(answers).length === PSS_QUESTIONS.length;

    return (
      <div className="min-h-screen bg-[#F9F7F2]">
        <UserNavbar />
        <main className="max-w-lg mx-auto px-4 pt-6 pb-24">
          {/* 프로그레스 */}
          <div className="mb-6">
            <div className="flex justify-between text-sm text-slate-400 mb-2">
              <span>질문 {currentIndex + 1} / {PSS_QUESTIONS.length}</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
              <div className="h-full bg-amber-500 rounded-full transition-all duration-500" style={{ width: `${progress}%` }} />
            </div>
          </div>

          {/* 질문 */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-4">
            <p className="text-lg font-bold text-slate-800 leading-relaxed mb-6">
              {current.text}
            </p>
            <div className="space-y-2.5">
              {SCALE_OPTIONS.map((option) => {
                const isSelected = answers[current.id] === option.value;
                return (
                  <button
                    key={option.value}
                    onClick={() => handleSelect(current.id, option.value)}
                    className={`w-full text-left p-3.5 rounded-xl border-2 transition-all font-medium text-sm ${
                      isSelected
                        ? 'border-amber-500 bg-amber-50 text-amber-700'
                        : 'border-slate-200 text-slate-600 hover:border-amber-300'
                    }`}
                  >
                    {option.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* 네비게이션 */}
          <div className="flex gap-3">
            {currentIndex > 0 && (
              <button
                onClick={() => setCurrentIndex(currentIndex - 1)}
                className="flex-1 py-3 border-2 border-slate-200 text-slate-600 font-bold rounded-xl hover:bg-slate-50 transition-all"
              >
                이전
              </button>
            )}
            {currentIndex < PSS_QUESTIONS.length - 1 ? (
              <button
                onClick={() => answers[current.id] !== undefined && setCurrentIndex(currentIndex + 1)}
                disabled={answers[current.id] === undefined}
                className="flex-1 py-3 bg-amber-500 text-white font-bold rounded-xl hover:bg-amber-600 transition-all disabled:opacity-40"
              >
                다음
              </button>
            ) : (
              <button
                onClick={calculateResult}
                disabled={!allAnswered}
                className="flex-1 py-3 bg-amber-500 text-white font-bold rounded-xl hover:bg-amber-600 transition-all disabled:opacity-40"
              >
                결과 보기
              </button>
            )}
          </div>
        </main>
      </div>
    );
  }

  // ==================== 결과 ====================
  if (step === 'result' && result) {
    return (
      <div className="min-h-screen bg-[#F9F7F2]">
        <UserNavbar />
        <main className="max-w-lg mx-auto px-4 pt-8 pb-24">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 text-center mb-6">
            <p className="text-sm font-semibold text-slate-500 mb-3">PSS 스트레스 진단 결과</p>

            {/* 점수 원형 */}
            <div
              className="w-28 h-28 rounded-full flex flex-col items-center justify-center mx-auto mb-4 border-4"
              style={{ borderColor: result.color }}
            >
              <span className="text-3xl font-black" style={{ color: result.color }}>{result.score}</span>
              <span className="text-xs text-slate-400">/ 40점</span>
            </div>

            <div
              className="inline-flex items-center gap-1 px-4 py-1.5 rounded-full text-white font-bold text-sm mb-4"
              style={{ backgroundColor: result.color }}
            >
              <span className="material-icons text-sm">{result.emoji}</span>
              스트레스 {result.level}
            </div>

            <p className="text-slate-500 text-sm leading-relaxed">{result.message}</p>
          </div>

          {/* 점수 해석 가이드 */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
            <h3 className="font-bold text-slate-800 mb-4">점수 해석</h3>
            {[
              { range: '0~13점', label: '낮음', color: '#10B981', desc: '스트레스를 잘 관리하고 있어요' },
              { range: '14~26점', label: '보통', color: '#F59E0B', desc: '일상적인 수준, 관리가 필요해요' },
              { range: '27~40점', label: '높음', color: '#EF4444', desc: '적극적인 스트레스 관리가 필요해요' },
            ].map((item) => (
              <div key={item.label} className="flex items-center gap-3 py-2">
                <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: item.color }} />
                <span className="text-sm font-bold text-slate-700 w-16">{item.range}</span>
                <span className="text-sm text-slate-500">{item.desc}</span>
              </div>
            ))}
          </div>

          <p className="text-xs text-slate-400 text-center mb-6">
            본 진단은 Cohen(1983)의 PSS-10을 한국어로 번안한 것입니다.
            의학적 진단을 대체하지 않으며, 정확한 상담은 전문가에게 문의하세요.
          </p>

          <div className="flex gap-3">
            <Link
              to="/rest-test"
              className="flex-1 py-3 border-2 border-primary text-primary font-bold rounded-xl hover:bg-primary/5 transition-all text-center"
            >
              휴식유형 진단
            </Link>
            <Link
              to="/"
              className="flex-1 py-3 bg-primary text-white font-bold rounded-xl hover:bg-primary/90 transition-all text-center"
            >
              홈으로
            </Link>
          </div>
        </main>
      </div>
    );
  }

  return null;
}

export default StressTest;
