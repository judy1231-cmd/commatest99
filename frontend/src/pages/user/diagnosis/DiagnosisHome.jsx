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
      <main className="min-h-screen bg-[#F9F7F2]">
        <div className="max-w-2xl mx-auto px-4 pt-12 pb-24">

          {/* 헤더 */}
          <div className="text-center mb-10">
            <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <span className="material-icons text-primary text-3xl">psychology</span>
            </div>
            <h1 className="text-2xl font-bold text-slate-800 mb-2">쉼표 진단</h1>
            <p className="text-slate-500 text-sm leading-relaxed">
              지금 내 상태를 측정하고, 가장 필요한 휴식을 찾아보세요.<br />
              심박 측정 + 설문으로 나만의 휴식 처방이 완성됩니다.
            </p>
          </div>

          {/* 진단 플로우 */}
          <div className="space-y-4 mb-8">
            {STEPS.map((step, i) => (
              <Link
                key={i}
                to={step.link}
                className="flex items-center gap-4 bg-white rounded-2xl border border-slate-100 shadow-sm p-5 hover:border-primary/30 hover:shadow-md transition-all group"
              >
                <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
                  style={{ backgroundColor: `${step.color}15` }}>
                  <span className="material-icons text-2xl" style={{ color: step.color }}>{step.icon}</span>
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-xs font-bold text-slate-400">STEP {i + 1}</span>
                  </div>
                  <p className="font-bold text-slate-800 group-hover:text-primary transition-colors">{step.label}</p>
                  <p className="text-xs text-slate-400 mt-0.5">{step.desc}</p>
                </div>
                <span className="material-icons text-slate-300 group-hover:text-primary transition-colors">chevron_right</span>
              </Link>
            ))}
          </div>

          {/* 바로 테스트 시작 */}
          <Link
            to="/rest-test"
            className="block w-full py-4 bg-primary text-white font-bold rounded-2xl text-center hover:bg-primary/90 transition-all shadow-md"
          >
            지금 바로 진단 시작하기
          </Link>
        </div>
      </main>
    </>
  );
}

export default DiagnosisHome;
