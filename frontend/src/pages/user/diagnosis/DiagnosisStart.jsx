import { useNavigate } from 'react-router-dom';
import UserNavbar from '../../../components/user/UserNavbar';

const HOW_LIST = [
  { icon: 'format_list_numbered', title: '12문항 응답', desc: '7가지 휴식 유형을 기반으로 한 문항이에요' },
  { icon: 'touch_app',           title: '4개 선택지',  desc: '직관적으로 지금 내 상태에 맞는 답을 골라요' },
  { icon: 'auto_awesome',        title: 'AI 맞춤 분석', desc: '응답이 끝나면 나만의 휴식 처방이 완성돼요' },
  { icon: 'place',               title: '장소 자동 추천', desc: '진단 결과에 맞는 주변 장소를 바로 보여드려요' },
];

const CAUTIONS = [
  '지금 이 순간 느끼는 감정에 솔직하게 답해주세요',
  '정답은 없어요 — 가장 자연스럽게 끌리는 답을 선택하세요',
  '중간에 나가면 처음부터 다시 시작해야 해요',
];

function DiagnosisStart() {
  const navigate = useNavigate();

  return (
    <>
      <UserNavbar />
      <main className="min-h-screen bg-white pb-32">
        <div className="max-w-[520px] mx-auto px-6 pt-12">

          {/* 아이콘 + 타이틀 */}
          <div className="text-center mb-10">
            <div className="w-20 h-20 bg-primary/10 rounded-3xl flex items-center justify-center mx-auto mb-6">
              <span className="material-icons text-primary text-[40px]">spa</span>
            </div>
            <h1 className="text-[26px] font-extrabold text-slate-900 tracking-tight mb-2">
              휴식 유형 진단
            </h1>
            <p className="text-[14px] text-slate-400 font-medium leading-relaxed">
              12가지 질문으로 지금 나에게 가장 필요한<br />
              휴식 유형을 찾아드릴게요
            </p>
            <div className="flex items-center justify-center gap-2 mt-4">
              <span className="text-[12px] font-bold text-slate-400 bg-slate-100 px-3 py-1.5 rounded-full">
                12문항
              </span>
              <span className="text-[12px] font-bold text-slate-400 bg-slate-100 px-3 py-1.5 rounded-full">
                약 3~5분
              </span>
            </div>
          </div>

          {/* 진단 방법 리스트 */}
          <div className="mb-6">
            <p className="text-[12px] font-bold text-slate-400 uppercase tracking-widest mb-4">진단 방법</p>
            <div className="space-y-3">
              {HOW_LIST.map((item, i) => (
                <div key={i} className="flex items-start gap-4 p-4 bg-white border border-slate-100 rounded-2xl shadow-sm">
                  <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center flex-shrink-0">
                    <span className="material-icons text-primary text-[20px]">{item.icon}</span>
                  </div>
                  <div>
                    <p className="text-[14px] font-bold text-slate-900 mb-0.5">{item.title}</p>
                    <p className="text-[12px] text-slate-400 leading-relaxed">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 주의사항 박스 */}
          <div className="bg-amber-50 border border-amber-100 rounded-2xl px-5 py-4 mb-2">
            <div className="flex items-center gap-2 mb-3">
              <span className="material-icons text-amber-400 text-[18px]">info</span>
              <p className="text-[13px] font-bold text-amber-700">진단 전에 확인해주세요</p>
            </div>
            <ul className="space-y-2">
              {CAUTIONS.map((c, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="text-amber-400 text-[12px] mt-0.5 flex-shrink-0">•</span>
                  <p className="text-[12px] text-amber-700 leading-relaxed">{c}</p>
                </li>
              ))}
            </ul>
          </div>

        </div>
      </main>

      {/* 하단 고정 버튼 */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-100 px-6 py-4">
        <div className="max-w-[520px] mx-auto space-y-2">
          <button
            onClick={() => navigate('/rest-test')}
            className="w-full py-4 bg-primary hover:bg-emerald-500 active:scale-[0.98] text-white text-[16px] font-bold rounded-2xl shadow-lg shadow-emerald-100 transition-all"
          >
            진단 시작하기
          </button>
          <button
            onClick={() => navigate(-1)}
            className="w-full py-2.5 text-[14px] text-slate-400 font-medium hover:text-slate-600 transition-colors"
          >
            돌아가기
          </button>
        </div>
      </div>
    </>
  );
}

export default DiagnosisStart;
