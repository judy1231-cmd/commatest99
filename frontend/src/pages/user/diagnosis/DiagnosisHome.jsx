import { Link } from 'react-router-dom';
import UserNavbar from '../../../components/user/UserNavbar';

const STEPS = [
  { icon: 'monitor_heart', label: '심박 측정', desc: '스마트워치로 현재 스트레스 수치를 측정해요', link: '/heartrate', color: '#EF4444' },
  { icon: 'psychology', label: '휴식 유형 테스트', desc: '12가지 질문으로 나에게 맞는 휴식 유형을 파악해요', link: '/rest-test', color: '#10B981' },
  { icon: 'place', label: '맞춤 장소 추천', desc: '진단 결과를 바탕으로 최적의 휴식 장소를 추천해요', link: '/map', color: '#3B82F6' },
];

function DiagnosisHome() {
  return (
    <>
      <UserNavbar />
      <main className="min-h-screen bg-white">
        <div className="max-w-[520px] mx-auto px-6 pt-14 pb-24">

          {/* 아이콘 + 타이틀 */}
          <div className="text-center mb-12">
            {/* 아이콘 */}
            <div className="relative w-28 h-28 mx-auto mb-8">
              <div className="absolute inset-0 bg-primary/10 rounded-3xl rotate-6" />
              <div className="absolute inset-0 bg-primary/5 rounded-3xl -rotate-3" />
              <div className="relative w-28 h-28 bg-primary rounded-3xl flex items-center justify-center shadow-2xl shadow-emerald-200">
                <span className="material-icons text-white text-[52px]">psychology</span>
              </div>
            </div>

            {/* 배지 */}
            <div className="flex items-center justify-center gap-2 mb-5">
              <span className="flex items-center gap-1.5 bg-slate-100 text-slate-500 text-[12px] font-bold px-3 py-1.5 rounded-full">
                <span className="material-icons text-[14px]">quiz</span>
                12문항
              </span>
              <span className="flex items-center gap-1.5 bg-slate-100 text-slate-500 text-[12px] font-bold px-3 py-1.5 rounded-full">
                <span className="material-icons text-[14px]">schedule</span>
                약 3분
              </span>
              <span className="flex items-center gap-1.5 bg-primary/10 text-primary text-[12px] font-bold px-3 py-1.5 rounded-full">
                <span className="material-icons text-[14px]">auto_awesome</span>
                AI 맞춤 분석
              </span>
            </div>

            <h1 className="text-[30px] font-extrabold text-slate-900 tracking-tight leading-tight mb-3">
              나의 휴식 유형<br />알아보기
            </h1>
            <p className="text-[15px] text-slate-400 font-medium leading-relaxed">
              지금 내 상태를 측정하고<br />
              가장 필요한 휴식을 찾아드려요
            </p>
          </div>

          {/* 진단 플로우 스텝 */}
          <div className="space-y-3 mb-10">
            {STEPS.map((step, i) => (
              <Link
                key={i}
                to={step.link}
                className="flex items-center gap-4 bg-white rounded-2xl border-2 border-slate-100 shadow-sm p-5 hover:border-primary/40 hover:shadow-md transition-all group"
              >
                {/* 번호 + 아이콘 */}
                <div className="relative flex-shrink-0">
                  <div
                    className="w-12 h-12 rounded-2xl flex items-center justify-center"
                    style={{ backgroundColor: `${step.color}15` }}
                  >
                    <span className="material-icons text-[24px]" style={{ color: step.color }}>{step.icon}</span>
                  </div>
                  <span
                    className="absolute -top-1.5 -left-1.5 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-extrabold text-white shadow-sm"
                    style={{ backgroundColor: step.color }}
                  >
                    {i + 1}
                  </span>
                </div>

                <div className="flex-1 min-w-0">
                  <p className="text-[15px] font-bold text-slate-900 group-hover:text-primary transition-colors mb-0.5">{step.label}</p>
                  <p className="text-[12px] text-slate-400 leading-relaxed">{step.desc}</p>
                </div>

                <span className="material-icons text-slate-300 group-hover:text-primary transition-colors flex-shrink-0">chevron_right</span>
              </Link>
            ))}
          </div>

          {/* 안내 카드 */}
          <div className="bg-slate-50 rounded-2xl px-5 py-4 mb-8 space-y-2.5">
            <div className="flex items-start gap-3">
              <span className="material-icons text-primary text-[16px] mt-0.5 flex-shrink-0">lock</span>
              <p className="text-[12px] text-slate-500 leading-relaxed">응답 결과는 나만 볼 수 있어요</p>
            </div>
            <div className="flex items-start gap-3">
              <span className="material-icons text-primary text-[16px] mt-0.5 flex-shrink-0">refresh</span>
              <p className="text-[12px] text-slate-500 leading-relaxed">언제든지 다시 진단할 수 있어요</p>
            </div>
            <div className="flex items-start gap-3">
              <span className="material-icons text-primary text-[16px] mt-0.5 flex-shrink-0">trending_up</span>
              <p className="text-[12px] text-slate-500 leading-relaxed">진단할수록 더 정확한 추천이 만들어져요</p>
            </div>
          </div>

          {/* CTA 버튼 */}
          <Link
            to="/rest-test"
            className="block w-full py-4 bg-primary hover:bg-emerald-500 active:scale-[0.98] text-white text-[17px] font-extrabold rounded-2xl text-center shadow-xl shadow-emerald-100 transition-all"
          >
            진단 시작하기
          </Link>

          <p className="text-center text-[12px] text-slate-400 font-medium mt-4">
            심박 측정 없이 설문만으로도 시작할 수 있어요
          </p>

        </div>
      </main>
    </>
  );
}

export default DiagnosisHome;
