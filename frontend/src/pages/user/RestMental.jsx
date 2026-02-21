import { Link } from 'react-router-dom';
import UserNavbar from '../../components/user/UserNavbar';

const activities = [
  {
    icon: 'self_improvement',
    title: '마음챙김 명상',
    desc: '5분간 호흡에만 집중하며 떠오르는 생각을 흘려보냅니다.',
    img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuD9YA02Qrhlax2MQpT-TtboYEbRVzpBreEWwUv_olaFb18WQsTQPjT7kTAkLv7wvJGHeXlEPeNeFygpmARx53NctmzGrdgiF8S8CR5e0_5TcQliztEbyZThYnZnykqbdL_Y6upUpqPX1W6BaNYpkKnMSkNirIHeoh_Ccma3VE6a7RW5jI7dYyNvuqlr1RnWJSBolH8DnTAzsHHPeKQsmTMO3tND0d4ZB0kCshXfouqe-5fwc3f9EoBqRPU3waNU5_H6yS4emYQcdVo',
  },
  {
    icon: 'edit_note',
    title: '저널링',
    desc: '머릿속 생각들을 종이에 꺼내놓고 마음의 공간을 만듭니다.',
    img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBlkWXkQeEdsN3rMbEq-HJoAWXbm_heXj0lDotkOIIjTSe-pZt2eul98AjGvgtnd732G4g2aBUabGuHOpsjpJT10IoeI8RGLYbWM0geVdd4naFyqxM9kVql1oNkrql7qKYSSH_KCqP8-icc4I9yK6T0U8Io5aUiPGh4sNJvozK_JK4x2_jfHanVCm0G2WBY5GyFeIPwEzhRIvTsY9ikPHrD72ariDFiVnLPaJW_EfoD8EmXI6v-SUMNPfGTBj0P48ISouBCD68cVcQ',
  },
  {
    icon: 'cloud_off',
    title: '브레인덤프',
    desc: '10분 동안 아무 생각이나 적어내려가며 뇌의 과부하를 해소합니다.',
    img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuARMyoXsjBEwG0HbxvhkxbVjDRYsvhwT_ordMU7mGaVXtenucoUMrf1CjTHLT95a90PPiIHaPHcJHe-0iq_xCPRcqwB-txk8jI5nP43Pqh9dHVu-PemHJDE3t23dh6ZaxgAr9OvjraI8N88n6YQcIKORrjKvhEBkauLifUt-vjaTlbmCOBtssc0a3_1EkNhXV5_zXp1Nf7rxDatO2V5D_6vFKhz72bsk6l7h5gepOwlHjjVIB67SDGYpcWkDSWgXpNh1t3HbrFRDa4',
  },
];

const places = [
  { name: '종로 도서관', location: '서울 종로구', tag: '도서관', rating: '4.8', img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBlkWXkQeEdsN3rMbEq-HJoAWXbm_heXj0lDotkOIIjTSe-pZt2eul98AjGvgtnd732G4g2aBUabGuHOpsjpJT10IoeI8RGLYbWM0geVdd4naFyqxM9kVql1oNkrql7qKYSSH_KCqP8-icc4I9yK6T0U8Io5aUiPGh4sNJvozK_JK4x2_jfHanVCm0G2WBY5GyFeIPwEzhRIvTsY9ikPHrD72ariDFiVnLPaJW_EfoD8EmXI6v-SUMNPfGTBj0P48ISouBCD68cVcQ' },
  { name: '명상 스테이 고요', location: '강원 평창군', tag: '명상/숙박', rating: '4.9', img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuD9YA02Qrhlax2MQpT-TtboYEbRVzpBreEWwUv_olaFb18WQsTQPjT7kTAkLv7wvJGHeXlEPeNeFygpmARx53NctmzGrdgiF8S8CR5e0_5TcQliztEbyZThYnZnykqbdL_Y6upUpqPX1W6BaNYpkKnMSkNirIHeoh_Ccma3VE6a7RW5jI7dYyNvuqlr1RnWJSBolH8DnTAzsHHPeKQsmTMO3tND0d4ZB0kCshXfouqe-5fwc3f9EoBqRPU3waNU5_H6yS4emYQcdVo' },
  { name: '서울 식물원', location: '서울 강서구', tag: '공원/식물원', rating: '4.7', img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuARMyoXsjBEwG0HbxvhkxbVjDRYsvhwT_ordMU7mGaVXtenucoUMrf1CjTHLT95a90PPiIHaPHcJHe-0iq_xCPRcqwB-txk8jI5nP43Pqh9dHVu-PemHJDE3t23dh6ZaxgAr9OvjraI8N88n6YQcIKORrjKvhEBkauLifUt-vjaTlbmCOBtssc0a3_1EkNhXV5_zXp1Nf7rxDatO2V5D_6vFKhz72bsk6l7h5gepOwlHjjVIB67SDGYpcWkDSWgXpNh1t3HbrFRDa4' },
];

const checklist = [
  '생각이 너무 많아 멈출 수가 없다.',
  '한 가지 일에 집중하기 어렵다.',
  '아무것도 아닌 일에 결정을 내리기 힘들다.',
  '머릿속이 항상 시끄럽고 지쳐있다.',
];

function RestMental() {
  return (
    <div className="min-h-screen bg-[#F9F7F2]">
      <UserNavbar />
      <main className="max-w-7xl mx-auto px-6 py-10 space-y-20 pb-24 md:pb-10">

        {/* Back */}
        <Link to="/" className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-emerald-600 transition-colors">
          <span className="material-symbols-outlined text-base">arrow_back</span>
          홈으로
        </Link>

        {/* Hero */}
        <section className="relative h-[480px] rounded-3xl overflow-hidden">
          <img
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuD9YA02Qrhlax2MQpT-TtboYEbRVzpBreEWwUv_olaFb18WQsTQPjT7kTAkLv7wvJGHeXlEPeNeFygpmARx53NctmzGrdgiF8S8CR5e0_5TcQliztEbyZThYnZnykqbdL_Y6upUpqPX1W6BaNYpkKnMSkNirIHeoh_Ccma3VE6a7RW5jI7dYyNvuqlr1RnWJSBolH8DnTAzsHHPeKQsmTMO3tND0d4ZB0kCshXfouqe-5fwc3f9EoBqRPU3waNU5_H6yS4emYQcdVo"
            alt="정신적 고요"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-teal-900/80 via-teal-800/40 to-teal-600/10 flex flex-col justify-center px-12">
            <span className="inline-block px-4 py-1.5 bg-teal-400/90 text-white rounded-full text-sm font-bold mb-6 w-fit uppercase tracking-wider">Mental Calm</span>
            <h2 className="text-5xl font-bold text-white leading-tight mb-4">정신적 고요</h2>
            <p className="text-white/80 text-lg max-w-md leading-relaxed">생각을 멈추고, 내면의 소음을 잠재우며<br />깊은 평정심을 되찾는 시간입니다.</p>
            <div className="flex gap-4 mt-8">
              <button className="px-8 py-3 bg-teal-500 text-white rounded-xl font-bold hover:bg-teal-600 transition-colors shadow-lg">휴식 시작하기</button>
              <button className="px-8 py-3 bg-white/20 backdrop-blur text-white border border-white/30 rounded-xl font-bold hover:bg-white/30 transition-colors">자세히 알아보기</button>
            </div>
          </div>
        </section>

        {/* Why section */}
        <section className="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <div className="inline-flex items-center gap-2 text-teal-700 bg-teal-50 px-4 py-2 rounded-lg font-semibold mb-4">
              <span className="material-symbols-outlined">health_and_safety</span>
              <span>정신적 피로의 원인</span>
            </div>
            <h3 className="text-3xl font-bold leading-tight mb-4">정신적 피로란 무엇인가요?</h3>
            <p className="text-gray-600 leading-relaxed text-lg">
              지속적인 의사결정, 정보 과부하, 과도한 멀티태스킹으로 인해 뇌가 지치는 상태입니다. 몸은 멀쩡해 보여도 생각의 질이 떨어지고 감정 조절이 어려워집니다.
            </p>
          </div>
          <div className="bg-teal-50 rounded-3xl p-8">
            <h4 className="text-xl font-bold mb-6 text-teal-800">정신적 이완의 효과</h4>
            <ul className="space-y-4">
              {[
                { title: '집중력 향상', desc: '생각의 정리로 업무 효율이 최대 40% 향상됩니다.' },
                { title: '감정 안정', desc: '과활성화된 편도체가 안정되어 감정 기복이 줄어듭니다.' },
                { title: '창의성 회복', desc: '비워진 뇌에 새로운 아이디어가 자연스럽게 채워집니다.' },
              ].map((item, i) => (
                <li key={i} className="flex items-start gap-3">
                  <span className="material-symbols-outlined text-teal-500">check_circle</span>
                  <div>
                    <p className="font-semibold">{item.title}</p>
                    <p className="text-sm text-gray-600">{item.desc}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* Recommended Activities */}
        <section>
          <div className="mb-8">
            <h3 className="text-2xl font-bold text-slate-900">추천 휴식 활동</h3>
            <p className="text-slate-500 mt-2">지금 당신에게 가장 필요한 활동들을 골라보았습니다.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {activities.map((act, i) => (
              <div key={i} className="group cursor-pointer">
                <div className="relative aspect-video rounded-2xl overflow-hidden mb-4">
                  <img className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" src={act.img} alt={act.title} />
                  <div className="absolute top-4 right-4 p-2 bg-white/90 backdrop-blur rounded-full shadow">
                    <span className="material-symbols-outlined text-teal-600">{act.icon}</span>
                  </div>
                </div>
                <h4 className="text-lg font-bold text-slate-900 group-hover:text-teal-600 transition-colors">{act.title}</h4>
                <p className="text-slate-500 text-sm mt-1">{act.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Checklist + Places */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <div className="bg-teal-50 rounded-2xl p-8 border border-teal-100">
            <div className="flex items-center gap-3 mb-6">
              <span className="material-symbols-outlined text-teal-600 text-3xl">psychology</span>
              <h3 className="text-xl font-bold text-slate-900">정신적 고요가 필요한 신호</h3>
            </div>
            <div className="space-y-3">
              {checklist.map((item, i) => (
                <label key={i} className="flex items-center p-3 bg-white rounded-xl cursor-pointer border border-transparent hover:border-teal-200 transition-all shadow-sm">
                  <input type="checkbox" className="w-5 h-5 rounded text-teal-600 focus:ring-teal-500 border-gray-300" />
                  <span className="ml-3 text-slate-700 text-sm font-medium">{item}</span>
                </label>
              ))}
            </div>
            <div className="mt-6 p-4 bg-teal-100 rounded-xl">
              <p className="text-sm text-teal-800 font-medium">※ 2개 이상 해당된다면, 오늘은 정신적 고요에 집중하세요.</p>
            </div>
          </div>

          <div>
            <h3 className="text-xl font-bold text-slate-900 mb-6">추천 장소</h3>
            <div className="space-y-4">
              {places.map((place, i) => (
                <div key={i} className="flex gap-4 bg-white rounded-2xl p-4 border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                  <div className="w-20 h-20 rounded-xl overflow-hidden flex-shrink-0">
                    <img src={place.img} alt={place.name} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1">
                    <span className="text-[10px] font-bold text-teal-600 uppercase tracking-wider">{place.tag}</span>
                    <h4 className="font-bold text-slate-900">{place.name}</h4>
                    <p className="text-xs text-slate-400 mt-1 flex items-center gap-1">
                      <span className="material-symbols-outlined text-sm">location_on</span>
                      {place.location}
                    </p>
                    <div className="flex items-center gap-1 mt-1 text-xs text-amber-500">
                      <span className="material-symbols-outlined text-sm">star</span>
                      <span className="font-bold">{place.rating}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* AI Pick */}
        <section className="bg-slate-900 rounded-3xl p-10 text-white">
          <div className="flex flex-col lg:flex-row gap-10">
            <div className="flex-1">
              <div className="flex items-center gap-2 text-teal-400 font-bold mb-4 text-sm uppercase tracking-widest">
                <span className="material-symbols-outlined">auto_awesome</span> AI Rest Pick
              </div>
              <h3 className="text-3xl font-bold mb-4">오늘 당신을 위한 AI 큐레이션</h3>
              <div className="bg-white/10 rounded-2xl p-6 mb-6">
                <p className="text-lg italic leading-relaxed">"생각이 없는 고요함이 아니라, 생각에 끌려다니지 않는 자유로움을 찾으세요."</p>
              </div>
            </div>
            <div className="flex-1 space-y-4">
              {[
                { icon: 'library_music', title: '바이노럴 비트 명상 음악', desc: '집중력 향상 주파수 • 30분' },
                { icon: 'video_library', title: '10분 마음챙김 명상 가이드', desc: '초보자를 위한 명상 입문' },
                { icon: 'menu_book', title: '생각을 비우는 저널링 방법', desc: '에디터의 추천 아티클 • 5분' },
              ].map((item, i) => (
                <div key={i} className="flex items-center p-4 bg-white/10 rounded-2xl group cursor-pointer hover:bg-white/20 transition-colors">
                  <div className="w-12 h-12 bg-teal-500/20 rounded-xl flex items-center justify-center text-teal-400 mr-4">
                    <span className="material-symbols-outlined">{item.icon}</span>
                  </div>
                  <div className="flex-1">
                    <h5 className="font-bold">{item.title}</h5>
                    <p className="text-xs text-white/60">{item.desc}</p>
                  </div>
                  <span className="material-symbols-outlined text-white/40 group-hover:text-teal-400">play_circle</span>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

export default RestMental;
