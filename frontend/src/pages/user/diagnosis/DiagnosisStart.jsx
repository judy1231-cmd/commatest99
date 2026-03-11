import { useNavigate } from 'react-router-dom';
import UserNavbar from '../../../components/user/UserNavbar';

function DiagnosisStart() {
  const navigate = useNavigate();

  return (
    <>
      <UserNavbar />
      <main className="min-h-screen bg-[#F9F7F2] flex items-center justify-center px-4">
        <div className="max-w-md w-full text-center">
          <div className="w-20 h-20 bg-primary/10 rounded-3xl flex items-center justify-center mx-auto mb-6">
            <span className="material-icons text-primary text-4xl">spa</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-800 mb-3">휴식 유형 진단</h1>
          <p className="text-slate-500 text-sm leading-relaxed mb-8">
            12가지 질문으로 지금 나에게 가장 필요한<br />
            휴식 유형을 찾아드릴게요.<br />
            <span className="text-slate-400 text-xs mt-1 block">약 3~5분 소요됩니다.</span>
          </p>

          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 mb-6 text-left space-y-3">
            {[
              { icon: 'format_list_numbered', text: '총 12문항, 4개 선택지' },
              { icon: 'timer', text: '소요시간 약 3~5분' },
              { icon: 'auto_awesome', text: '완료 시 맞춤 장소 자동 추천' },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-3">
                <span className="material-icons text-primary text-base">{item.icon}</span>
                <span className="text-sm text-slate-600">{item.text}</span>
              </div>
            ))}
          </div>

          <button
            onClick={() => navigate('/rest-test')}
            className="w-full py-4 bg-primary text-white font-bold rounded-2xl hover:bg-primary/90 transition-all shadow-md mb-3"
          >
            진단 시작하기
          </button>
          <button
            onClick={() => navigate(-1)}
            className="w-full py-3 text-slate-500 text-sm hover:text-slate-700 transition-colors"
          >
            돌아가기
          </button>
        </div>
      </main>
    </>
  );
}

export default DiagnosisStart;
