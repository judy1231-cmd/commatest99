import { Link } from 'react-router-dom';
import UserNavbar from '../../components/user/UserNavbar';

const activities = [
  { icon: 'dark_mode', title: '어둠 테라피', desc: '조명을 낮추거나 끄고 30분간 시각 자극 없이 지냅니다.' },
  { icon: 'hearing', title: 'ASMR 감각 이완', desc: '빗소리, 숲소리, 파도소리로 청각을 부드럽게 자극합니다.' },
  { icon: 'spa', title: '아로마 테라피', desc: '라벤더, 유칼립투스 등 향기로 후각을 통해 신경을 안정시킵니다.' },
];

const checklist = [
  '스마트폰 화면을 보면 눈이 쉽게 피로해진다.',
  '시끄러운 공간에서 극도로 예민해진다.',
  '냄새나 밝은 빛에 과도하게 반응한다.',
  '온몸의 감각이 무뎌지고 둔해진 느낌이다.',
  '감각적인 자극에 쉽게 지치거나 압도당한다.',
  '자연의 소리나 조용한 공간이 몹시 그립다.',
];

function RestSensory() {
  return (
    <div className="min-h-screen bg-[#F9F7F2]">
      <UserNavbar />
      <main className="max-w-7xl mx-auto px-6 py-10 space-y-20 pb-24 md:pb-10">

        {/* Back */}
        <Link to="/" className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-amber-600 transition-colors">
          <span className="material-symbols-outlined text-base">arrow_back</span>
          홈으로
        </Link>

        {/* Hero */}
        <section className="relative h-[480px] rounded-3xl overflow-hidden bg-amber-950">
          <div
            className="absolute inset-0 bg-cover bg-center opacity-60"
            style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuARMyoXsjBEwG0HbxvhkxbVjDRYsvhwT_ordMU7mGaVXtenucoUMrf1CjTHLT95a90PPiIHaPHcJHe-0iq_xCPRcqwB-txk8jI5nP43Pqh9dHVu-PemHJDE3t23dh6ZaxgAr9OvjraI8N88n6YQcIKORrjKvhEBkauLifUt-vjaTlbmCOBtssc0a3_1EkNhXV5_zXp1Nf7rxDatO2V5D_6vFKhz72bsk6l7h5gepOwlHjjVIB67SDGYpcWkDSWgXpNh1t3HbrFRDa4')" }}
          />
          <div className="absolute inset-0 bg-gradient-to-r from-amber-950/90 via-amber-900/50 to-transparent flex flex-col justify-center px-12">
            <span className="inline-block px-4 py-1.5 bg-amber-400/90 text-amber-900 rounded-full text-sm font-bold mb-6 w-fit uppercase tracking-wider">Sensory Rest</span>
            <h2 className="text-5xl font-bold text-white leading-tight mb-4">감각의 정화</h2>
            <p className="text-white/80 text-lg max-w-md leading-relaxed">과부하된 오감을 내려놓고,<br />감각의 고요함 속에서 회복하는 시간입니다.</p>
            <div className="flex gap-4 mt-8">
              <button className="px-8 py-3 bg-amber-500 text-white rounded-xl font-bold hover:bg-amber-600 transition-colors shadow-lg">휴식 시작하기</button>
              <button className="px-8 py-3 bg-white/20 backdrop-blur text-white border border-white/30 rounded-xl font-bold hover:bg-white/30 transition-colors">자세히 알아보기</button>
            </div>
          </div>
        </section>

        {/* Main content: left + right */}
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-12">

          {/* Left column (2/3) */}
          <div className="lg:col-span-2 space-y-16">
            {/* Why */}
            <div>
              <div className="inline-flex items-center gap-2 text-amber-700 bg-amber-50 px-4 py-2 rounded-lg font-semibold mb-4">
                <span className="material-symbols-outlined">sensors</span>
                <span>감각 과부하의 원인</span>
              </div>
              <h3 className="text-2xl font-bold mb-4">왜 감각적 휴식이 필요한가요?</h3>
              <p className="text-gray-600 leading-relaxed">
                현대인은 하루 평균 74GB의 디지털 정보를 처리합니다. 끊임없는 알림, 소음, 화면 빛은 우리의 감각 신경을 지속적으로 자극하여 신경계를 과활성화 상태로 만듭니다. 감각적 휴식은 이 과부하를 해소하는 가장 효과적인 방법입니다.
              </p>
            </div>

            {/* Activities */}
            <div>
              <h3 className="text-2xl font-bold mb-6">추천 휴식 활동</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {activities.map((act, i) => (
                  <div key={i} className="bg-white rounded-2xl p-6 border border-amber-100 shadow-sm hover:shadow-md transition-shadow">
                    <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center mb-4">
                      <span className="material-symbols-outlined">{act.icon}</span>
                    </div>
                    <h4 className="font-bold text-slate-900 mb-2">{act.title}</h4>
                    <p className="text-slate-500 text-sm leading-relaxed">{act.desc}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Checklist */}
            <div className="bg-amber-50 rounded-2xl p-8 border border-amber-100">
              <div className="flex items-center gap-3 mb-6">
                <span className="material-symbols-outlined text-amber-600 text-3xl">checklist</span>
                <h3 className="text-xl font-bold text-slate-900">감각 과부하 신호 체크</h3>
              </div>
              <div className="space-y-3">
                {checklist.map((item, i) => (
                  <label key={i} className="flex items-center p-3 bg-white rounded-xl cursor-pointer border border-transparent hover:border-amber-200 transition-all shadow-sm">
                    <input type="checkbox" className="w-5 h-5 rounded text-amber-600 focus:ring-amber-500 border-gray-300" />
                    <span className="ml-3 text-slate-700 text-sm font-medium">{item}</span>
                  </label>
                ))}
              </div>
              <div className="mt-6 p-4 bg-amber-100 rounded-xl">
                <p className="text-sm text-amber-800 font-medium">※ 3개 이상 해당된다면, 오늘은 감각의 정화가 필요합니다.</p>
              </div>
            </div>
          </div>

          {/* Right column (1/3) */}
          <aside className="space-y-8">
            {/* AI Pick */}
            <div className="bg-slate-900 rounded-2xl p-6 text-white">
              <div className="flex items-center gap-2 text-amber-400 font-bold mb-4 text-sm uppercase tracking-widest">
                <span className="material-symbols-outlined">auto_awesome</span> AI Pick
              </div>
              <p className="text-lg italic leading-relaxed mb-6">
                "소음을 줄이는 것이 아니라, 고요함을 늘리는 것. 그것이 감각적 휴식의 시작입니다."
              </p>
              <div className="space-y-3">
                {[
                  { icon: 'library_music', title: '백색소음 플레이리스트', desc: '빗소리 & 자연 소리 • 60분' },
                  { icon: 'spa', title: '아로마 입문 가이드', desc: '오늘의 추천 향: 라벤더' },
                ].map((item, i) => (
                  <div key={i} className="flex items-center p-3 bg-white/10 rounded-xl group cursor-pointer hover:bg-white/20 transition-colors">
                    <div className="w-10 h-10 bg-amber-500/20 rounded-lg flex items-center justify-center text-amber-400 mr-3">
                      <span className="material-symbols-outlined text-sm">{item.icon}</span>
                    </div>
                    <div className="flex-1">
                      <h5 className="font-bold text-sm">{item.title}</h5>
                      <p className="text-xs text-white/60">{item.desc}</p>
                    </div>
                    <span className="material-symbols-outlined text-white/40 group-hover:text-amber-400 text-sm">play_circle</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Community */}
            <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h4 className="font-bold text-slate-900">커뮤니티 소식</h4>
                <Link to="/community" className="text-xs text-amber-600 font-bold hover:underline">더보기</Link>
              </div>
              <div className="space-y-4">
                {[
                  { user: '조용한 밤', time: '1시간 전', content: '어둠 테라피 처음 해봤는데 정말 신기하게 눈의 피로가 풀렸어요!' },
                  { user: '민들레홀씨', time: '3시간 전', content: '라벤더 오일 추천합니다. 잠들기 전에 바르면 숙면에 정말 도움이 돼요.' },
                ].map((post, i) => (
                  <div key={i} className="flex gap-3 p-3 hover:bg-amber-50 rounded-xl transition-colors">
                    <div className="w-8 h-8 rounded-full bg-amber-100 flex-shrink-0 flex items-center justify-center">
                      <span className="material-symbols-outlined text-amber-600 text-sm">person</span>
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-bold text-sm text-slate-900">{post.user}</span>
                        <span className="text-xs text-slate-400">{post.time}</span>
                      </div>
                      <p className="text-slate-600 text-xs line-clamp-2">{post.content}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </aside>
        </section>
      </main>
    </div>
  );
}

export default RestSensory;
