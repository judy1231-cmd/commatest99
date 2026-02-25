import { useState } from 'react';
import UserNavbar from '../../components/user/UserNavbar';
import { Link } from 'react-router-dom';

const questions = [
  {
    q: '주말 아침, 가장 하고 싶은 것은?',
    options: ['조용한 공원에서 산책하기', '침대에서 책 읽기', '친구들과 브런치 즐기기', '새로운 취미 배우기'],
  },
  {
    q: '스트레스를 받을 때 당신은?',
    options: ['자연 속을 걷거나 운동한다', '음악을 듣거나 명상한다', '친구에게 연락해 대화한다', '글을 쓰거나 그림을 그린다'],
  },
  {
    q: '이상적인 휴가는?',
    options: ['산이나 바다에서 하이킹', '고요한 온천 또는 스파', '활기찬 도시 여행', '예술 갤러리나 문화 체험'],
  },
];

function RestTypeTest() {
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState([]);

  const handleAnswer = (idx) => {
    const newAnswers = [...answers, idx];
    if (current < questions.length - 1) {
      setAnswers(newAnswers);
      setCurrent(current + 1);
    } else {
      // Show result
      setAnswers(newAnswers);
      setCurrent(questions.length);
    }
  };

  return (
    <div className="min-h-screen bg-[#F9F7F2]">
      <UserNavbar />
      <main className="max-w-2xl mx-auto px-6 py-16 pb-24 md:pb-16">
        {current < questions.length ? (
          <>
            {/* Progress */}
            <div className="mb-8">
              <div className="flex justify-between text-sm text-slate-400 mb-2">
                <span>질문 {current + 1}/{questions.length}</span>
                <span>{Math.round(((current) / questions.length) * 100)}%</span>
              </div>
              <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${(current / questions.length) * 100}%` }}></div>
              </div>
            </div>

            {/* Question */}
            <div className="bg-white rounded-2xl p-8 shadow-soft border border-slate-100 mb-6">
              <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-6">
                <span className="material-icons text-primary">psychology</span>
              </div>
              <h2 className="text-2xl font-bold text-slate-800 mb-8">{questions[current].q}</h2>
              <div className="space-y-3">
                {questions[current].options.map((opt, i) => (
                  <button
                    key={i}
                    onClick={() => handleAnswer(i)}
                    className="w-full text-left p-4 rounded-xl border-2 border-slate-200 hover:border-primary hover:bg-soft-mint transition-all font-medium text-slate-700 flex items-center gap-3"
                  >
                    <span className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-sm font-bold text-slate-500 shrink-0">
                      {String.fromCharCode(65 + i)}
                    </span>
                    {opt}
                  </button>
                ))}
              </div>
            </div>
          </>
        ) : (
          /* Result */
          <div className="text-center">
            <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <span className="material-icons text-primary text-4xl">self_improvement</span>
            </div>
            <p className="text-primary font-semibold mb-2">당신의 휴식 유형은</p>
            <h1 className="text-4xl font-black text-slate-800 mb-4">조용한 산책자</h1>
            <p className="text-slate-500 leading-relaxed mb-8 max-w-md mx-auto">
              당신은 복잡한 도심보다는 고요한 숲이나 강가에서 에너지를 얻는 타입입니다. 혼자만의 시간을 가질 때 가장 효과적으로 회복됩니다.
            </p>
            <div className="grid grid-cols-3 gap-4 mb-8">
              {[{ icon: 'park', label: '자연 산책', pct: 90 }, { icon: 'self_improvement', label: '명상', pct: 75 }, { icon: 'menu_book', label: '독서', pct: 65 }].map((item, i) => (
                <div key={i} className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm">
                  <span className="material-icons text-primary text-2xl">{item.icon}</span>
                  <p className="text-xs font-bold text-slate-600 mt-1">{item.label}</p>
                  <p className="text-lg font-black text-primary">{item.pct}%</p>
                </div>
              ))}
            </div>
            <div className="flex gap-4">
              <button onClick={() => { setCurrent(0); setAnswers([]); }} className="flex-1 py-3 border-2 border-primary text-primary font-bold rounded-xl hover:bg-primary/5 transition-all">
                다시 테스트
              </button>
              <Link to="/rest-map" className="flex-1 py-3 bg-primary text-white font-bold rounded-xl hover:bg-primary/90 transition-all text-center">
                추천 장소 보기
              </Link>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default RestTypeTest;
