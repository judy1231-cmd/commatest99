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
  { id: 1,  text: '지난 한 달간, 예상치 못한 일이 생겨서 기분이 상한 적이 얼마나 있었나요?', reverse: false },
  { id: 2,  text: '지난 한 달간, 중요한 일을 조절할 수 없다고 느낀 적이 얼마나 있었나요?', reverse: false },
  { id: 3,  text: '지난 한 달간, 초조하거나 스트레스를 받는다고 느낀 적이 얼마나 있었나요?', reverse: false },
  { id: 4,  text: '지난 한 달간, 개인적인 문제를 잘 처리할 수 있다고 자신한 적이 얼마나 있었나요?', reverse: true },
  { id: 5,  text: '지난 한 달간, 일이 자기 뜻대로 진행되고 있다고 느낀 적이 얼마나 있었나요?', reverse: true },
  { id: 6,  text: '지난 한 달간, 해야 할 일이 너무 많아서 감당이 안 된다고 느낀 적이 얼마나 있었나요?', reverse: false },
  { id: 7,  text: '지난 한 달간, 짜증나는 일을 잘 다스릴 수 있었던 적이 얼마나 있었나요?', reverse: true },
  { id: 8,  text: '지난 한 달간, 자신이 상황을 잘 통제하고 있다고 느낀 적이 얼마나 있었나요?', reverse: true },
  { id: 9,  text: '지난 한 달간, 자신이 통제할 수 없는 일 때문에 화가 난 적이 얼마나 있었나요?', reverse: false },
  { id: 10, text: '지난 한 달간, 어려운 일이 너무 쌓여서 극복할 수 없다고 느낀 적이 얼마나 있었나요?', reverse: false },
];

const SCALE_OPTIONS = [
  { label: '전혀 없었다',     value: 0 },
  { label: '거의 없었다',     value: 1 },
  { label: '가끔 있었다',     value: 2 },
  { label: '자주 있었다',     value: 3 },
  { label: '매우 자주 있었다', value: 4 },
];

const ACCENT = '#F59E0B'; // amber

function getStressLevel(score) {
  if (score <= 13) return { level: '낮음', color: '#10B981', bg: '#F0FDF9', emoji: 'sentiment_satisfied',    message: '현재 스트레스 수준이 낮아요. 지금의 생활 패턴을 유지하세요!' };
  if (score <= 26) return { level: '보통', color: '#F59E0B', bg: '#FFFBEB', emoji: 'sentiment_neutral',      message: '보통 수준의 스트레스예요. 규칙적인 휴식으로 관리해보세요.' };
  return            { level: '높음', color: '#EF4444', bg: '#FFF5F5', emoji: 'sentiment_dissatisfied', message: '스트레스가 높은 상태예요. 충분한 휴식과 전문 상담을 고려해보세요.' };
}

function StressTest() {
  const [step, setStep] = useState('intro'); // intro → test → result
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState({}); // { questionId: value }
  const [result, setResult] = useState(null);

  const isLoggedIn = !!localStorage.getItem('accessToken');

  const handleSelect = (questionId, value) => {
    setAnswers({ ...answers, [questionId]: value });
    // 0.3초 후 자동 다음 문항
    setTimeout(() => {
      if (currentIndex < PSS_QUESTIONS.length - 1) {
        setCurrentIndex((i) => i + 1);
      }
    }, 300);
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
      <div className="min-h-screen bg-white flex flex-col">
        <UserNavbar />
        <main className="flex-1 max-w-[520px] mx-auto w-full px-6 pt-14 pb-24">

          {/* 아이콘 */}
          <div className="text-center mb-10">
            <div className="relative w-28 h-28 mx-auto mb-8">
              <div className="absolute inset-0 bg-amber-100 rounded-3xl rotate-6" />
              <div className="absolute inset-0 bg-amber-50 rounded-3xl -rotate-3" />
              <div className="relative w-28 h-28 bg-amber-500 rounded-3xl flex items-center justify-center shadow-2xl shadow-amber-200">
                <span className="material-icons text-white text-[52px]">psychology_alt</span>
              </div>
            </div>

            <div className="flex items-center justify-center gap-2 mb-5">
              <span className="flex items-center gap-1.5 bg-slate-100 text-slate-500 text-[12px] font-bold px-3 py-1.5 rounded-full">
                <span className="material-icons text-[14px]">quiz</span>10문항
              </span>
              <span className="flex items-center gap-1.5 bg-slate-100 text-slate-500 text-[12px] font-bold px-3 py-1.5 rounded-full">
                <span className="material-icons text-[14px]">schedule</span>약 3분
              </span>
              <span className="flex items-center gap-1.5 bg-amber-100 text-amber-700 text-[12px] font-bold px-3 py-1.5 rounded-full">
                <span className="material-icons text-[14px]">verified</span>국제 표준
              </span>
            </div>

            <h1 className="text-[30px] font-extrabold text-slate-900 tracking-tight leading-tight mb-3">
              스트레스 심화 진단
            </h1>
            <p className="text-[14px] text-slate-400 font-medium leading-relaxed">
              PSS(Perceived Stress Scale) 기반<br />
              Cohen(1983) 국제 표준으로 정확하게 측정해요
            </p>
          </div>

          {/* 안내 리스트 */}
          <div className="space-y-3 mb-8">
            {[
              { icon: 'format_list_numbered', title: '10문항, 5점 척도', desc: '지난 한 달간의 경험을 돌아봐요' },
              { icon: 'calculate',            title: '0~40점 점수화',   desc: '낮음 · 보통 · 높음 3단계로 분류해요' },
              { icon: 'spa',                  title: '맞춤 휴식 연결',  desc: '결과에 따라 맞는 휴식 유형을 안내해요' },
            ].map((item, i) => (
              <div key={i} className="flex items-start gap-4 p-4 bg-white border border-slate-100 rounded-2xl shadow-sm">
                <div className="w-10 h-10 bg-amber-50 rounded-xl flex items-center justify-center flex-shrink-0">
                  <span className="material-icons text-amber-500 text-[20px]">{item.icon}</span>
                </div>
                <div>
                  <p className="text-[14px] font-bold text-slate-900 mb-0.5">{item.title}</p>
                  <p className="text-[12px] text-slate-400 leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>

          {/* 주의사항 */}
          <div className="bg-amber-50 border border-amber-100 rounded-2xl px-5 py-4 mb-8">
            <div className="flex items-center gap-2 mb-2">
              <span className="material-icons text-amber-400 text-[16px]">info</span>
              <p className="text-[12px] font-bold text-amber-700">진단 전에 확인해주세요</p>
            </div>
            <p className="text-[12px] text-amber-700 leading-relaxed">
              지금 이 순간이 아닌, <span className="font-bold">지난 한 달간</span>의 경험을 기준으로 솔직하게 답해주세요.
              본 진단은 의학적 진단을 대체하지 않아요.
            </p>
          </div>

          <button
            onClick={() => setStep('test')}
            className="w-full py-4 bg-amber-500 hover:bg-amber-600 active:scale-[0.98] text-white text-[17px] font-extrabold rounded-2xl shadow-xl shadow-amber-100 transition-all"
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
    const isLastQuestion = currentIndex === PSS_QUESTIONS.length - 1;
    const selectedValue = answers[current.id];

    return (
      <div className="min-h-screen bg-white flex flex-col">
        <UserNavbar />

        {/* 상단 고정 진행바 */}
        <div className="sticky top-16 z-40 bg-white border-b border-slate-100">
          <div className="max-w-[520px] mx-auto px-6 pt-4 pb-3 flex items-center justify-between">
            <span className="text-[13px] font-bold text-slate-400">
              질문 <span className="text-slate-900">{currentIndex + 1}</span>
              <span className="text-slate-300"> / {PSS_QUESTIONS.length}</span>
            </span>
            <span className="text-[13px] font-bold" style={{ color: ACCENT }}>
              {Math.round(progress)}%
            </span>
          </div>
          <div className="h-1 bg-slate-100">
            <div
              className="h-full rounded-full transition-all duration-500 ease-out"
              style={{ width: `${progress}%`, backgroundColor: ACCENT }}
            />
          </div>
        </div>

        <main className="flex-1 max-w-[520px] mx-auto w-full px-6 pt-10 pb-36">

          {/* 카테고리 아이콘 */}
          <div className="w-12 h-12 rounded-2xl bg-amber-50 flex items-center justify-center mb-6">
            <span className="material-icons text-amber-500 text-[24px]">psychology_alt</span>
          </div>

          {/* 질문 텍스트 */}
          <h2 className="text-[22px] font-extrabold text-slate-900 leading-relaxed mb-10 tracking-tight">
            {current.text}
          </h2>

          {/* 5점 척도 선택지 */}
          <div className="space-y-3">
            {SCALE_OPTIONS.map((option) => {
              const isSelected = selectedValue === option.value;
              return (
                <button
                  key={option.value}
                  onClick={() => handleSelect(current.id, option.value)}
                  className="w-full text-left p-4 rounded-2xl border-2 transition-all duration-150 flex items-center gap-4 group"
                  style={{
                    borderColor: isSelected ? ACCENT : '#E2E8F0',
                    backgroundColor: isSelected ? '#FFFBEB' : '#ffffff',
                  }}
                >
                  {/* 숫자 레이블 */}
                  <span
                    className="w-9 h-9 rounded-full flex items-center justify-center text-[13px] font-extrabold flex-shrink-0 transition-all"
                    style={{
                      backgroundColor: isSelected ? ACCENT : '#F1F5F9',
                      color: isSelected ? '#ffffff' : '#94A3B8',
                    }}
                  >
                    {option.value}
                  </span>
                  {/* 설명 라벨 */}
                  <span
                    className="text-[15px] font-semibold leading-relaxed transition-colors"
                    style={{ color: isSelected ? '#92400E' : '#334155' }}
                  >
                    {option.label}
                  </span>
                  {isSelected && (
                    <span className="material-icons ml-auto flex-shrink-0 text-[20px]" style={{ color: ACCENT }}>
                      check_circle
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {isLastQuestion && !allAnswered && (
            <p className="text-[12px] text-slate-400 text-center mt-6">
              모든 질문에 답해야 결과를 볼 수 있어요
            </p>
          )}
          {!isLoggedIn && (
            <p className="text-[12px] text-slate-400 text-center mt-4">
              로그인하면 진단 결과가 저장돼요
            </p>
          )}
        </main>

        {/* 하단 고정 버튼 */}
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-100 px-6 py-4">
          <div className="max-w-[520px] mx-auto flex gap-3">
            {currentIndex > 0 && (
              <button
                onClick={() => setCurrentIndex(currentIndex - 1)}
                className="flex-1 py-4 border-2 border-slate-200 text-slate-600 text-[15px] font-bold rounded-2xl hover:bg-slate-50 transition-all flex items-center justify-center gap-1"
              >
                <span className="material-icons text-[18px]">arrow_back</span>
                이전
              </button>
            )}
            {!isLastQuestion ? (
              <button
                onClick={() => selectedValue !== undefined && setCurrentIndex(currentIndex + 1)}
                disabled={selectedValue === undefined}
                className="flex-1 py-4 text-white text-[15px] font-bold rounded-2xl transition-all disabled:opacity-40 flex items-center justify-center gap-1 shadow-lg"
                style={{
                  backgroundColor: selectedValue !== undefined ? ACCENT : '#94A3B8',
                  boxShadow: selectedValue !== undefined ? '0 8px 24px rgba(245,158,11,0.3)' : 'none',
                }}
              >
                다음
                <span className="material-icons text-[18px]">arrow_forward</span>
              </button>
            ) : (
              <button
                onClick={calculateResult}
                disabled={!allAnswered}
                className="flex-1 py-4 bg-amber-500 hover:bg-amber-600 text-white text-[15px] font-bold rounded-2xl transition-all disabled:opacity-40 flex items-center justify-center gap-2 shadow-lg shadow-amber-100"
              >
                <span className="material-icons text-[18px]">auto_awesome</span>
                결과 보기
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  // ==================== 결과 ====================
  if (step === 'result' && result) {
    return (
      <div className="min-h-screen bg-[#F7F7F8]">
        <UserNavbar />
        <main className="max-w-[520px] mx-auto px-6 pt-10 pb-24 space-y-5">

          {/* 점수 헤더 카드 */}
          <div
            className="rounded-3xl overflow-hidden shadow-sm"
            style={{ backgroundColor: result.bg }}
          >
            <div
              className="px-8 pt-8 pb-6 text-center"
              style={{ background: `linear-gradient(135deg, ${result.color}22 0%, ${result.color}08 100%)` }}
            >
              <p
                className="text-[12px] font-bold tracking-widest uppercase mb-6"
                style={{ color: result.color }}
              >
                PSS 스트레스 진단 결과
              </p>

              {/* 점수 원형 */}
              <div className="relative w-36 h-36 mx-auto mb-6">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
                  <circle cx="60" cy="60" r="50" fill="none" stroke="#e2e8f0" strokeWidth="8" />
                  <circle
                    cx="60" cy="60" r="50" fill="none"
                    stroke={result.color} strokeWidth="8"
                    strokeLinecap="round"
                    strokeDasharray={`${(result.score / 40) * 314} 314`}
                    style={{ transition: 'stroke-dasharray 1s ease-out' }}
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-[40px] font-extrabold leading-none" style={{ color: result.color }}>
                    {result.score}
                  </span>
                  <span className="text-[13px] font-semibold text-slate-400">/ 40점</span>
                </div>
              </div>

              {/* 수준 배지 */}
              <div
                className="inline-flex items-center gap-2 px-5 py-2 rounded-full text-white font-extrabold text-[15px] mb-4 shadow-md"
                style={{ backgroundColor: result.color }}
              >
                <span className="material-icons text-[18px]">{result.emoji}</span>
                스트레스 {result.level}
              </div>

              <p className="text-[15px] text-slate-600 leading-[1.8] font-medium">
                {result.message}
              </p>
            </div>
          </div>

          {/* 점수 해석 가이드 */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
            <h3 className="text-[16px] font-extrabold text-slate-900 mb-4">점수 해석</h3>
            <div className="space-y-3">
              {[
                { range: '0 – 13점', label: '낮음', color: '#10B981', bg: '#F0FDF9', desc: '스트레스를 잘 관리하고 있어요' },
                { range: '14 – 26점', label: '보통', color: '#F59E0B', bg: '#FFFBEB', desc: '일상적인 수준, 관리가 필요해요' },
                { range: '27 – 40점', label: '높음', color: '#EF4444', bg: '#FFF5F5', desc: '적극적인 스트레스 관리가 필요해요' },
              ].map((item) => {
                const isActive = item.label === result.level;
                return (
                  <div
                    key={item.label}
                    className="flex items-center gap-3 px-4 py-3 rounded-xl transition-all"
                    style={{ backgroundColor: isActive ? item.bg : 'transparent', border: isActive ? `1.5px solid ${item.color}30` : '1.5px solid transparent' }}
                  >
                    <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: item.color }} />
                    <span className="text-[13px] font-bold text-slate-700 w-20">{item.range}</span>
                    <span
                      className="text-[11px] font-bold px-2 py-0.5 rounded-full"
                      style={{ backgroundColor: item.color + '20', color: item.color }}
                    >
                      {item.label}
                    </span>
                    <span className="text-[12px] text-slate-500 flex-1">{item.desc}</span>
                    {isActive && <span className="material-icons text-[16px]" style={{ color: item.color }}>check_circle</span>}
                  </div>
                );
              })}
            </div>
          </div>

          {/* 출처 */}
          <p className="text-[11px] text-slate-400 text-center leading-relaxed px-2">
            본 진단은 Cohen(1983)의 PSS-10을 한국어로 번안한 것입니다.<br />
            의학적 진단을 대체하지 않으며, 정확한 상담은 전문가에게 문의하세요.
          </p>

          {/* 버튼 */}
          <div className="space-y-3">
            <Link
              to="/rest-test"
              className="flex items-center justify-center gap-2 w-full py-4 bg-primary hover:bg-emerald-500 active:scale-[0.98] text-white text-[16px] font-bold rounded-2xl shadow-lg shadow-emerald-100 transition-all"
            >
              <span className="material-icons text-[20px]">psychology</span>
              휴식 유형 진단받기
            </Link>
            <Link
              to="/"
              className="flex items-center justify-center gap-2 w-full py-4 border-2 border-slate-200 hover:bg-slate-50 text-slate-500 text-[15px] font-bold rounded-2xl transition-all"
            >
              홈으로 돌아가기
            </Link>
          </div>

        </main>
      </div>
    );
  }

  return null;
}

export default StressTest;
