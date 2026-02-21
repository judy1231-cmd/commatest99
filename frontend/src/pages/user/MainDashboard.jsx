import { Link } from 'react-router-dom';
import UserNavbar from '../../components/user/UserNavbar';

const categories = [
  { icon: 'fitness_center', label: '신체적 이완', color: 'bg-pale-blue text-primary-blue', path: '/rest/physical' },
  { icon: 'spa', label: '정신적 고요', color: 'bg-soft-mint text-emerald-500', path: '/rest/mental' },
  { icon: 'visibility_off', label: '감각적 휴식', color: 'bg-warm-beige text-amber-500', path: '/rest/sensory' },
  { icon: 'favorite', label: '감정적 휴식', color: 'bg-accent-pink text-red-500', path: '/rest/emotional' },
  { icon: 'forum', label: '사회적 휴식', color: 'bg-purple-50 text-purple-500', path: '/rest/social' },
  { icon: 'menu_book', label: '창의적 휴식', color: 'bg-orange-50 text-orange-500', path: '/rest/creative' },
  { icon: 'forest', label: '자연의 연결', color: 'bg-green-50 text-green-600', path: '/rest/nature' },
];

const places = [
  { title: '서울 숲 거울연못', location: '서울특별시 성동구', tag: '숲/공원', img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuD9YA02Qrhlax2MQpT-TtboYEbRVzpBreEWwUv_olaFb18WQsTQPjT7kTAkLv7wvJGHeXlEPeNeFygpmARx53NctmzGrdgiF8S8CR5e0_5TcQliztEbyZThYnZnykqbdL_Y6upUpqPX1W6BaNYpkKnMSkNirIHeoh_Ccma3VE6a7RW5jI7dYyNvuqlr1RnWJSBolH8DnTAzsHHPeKQsmTMO3tND0d4ZB0kCshXfouqe-5fwc3f9EoBqRPU3waNU5_H6yS4emYQcdVo' },
  { title: '다도 공간 \'휴\'', location: '종로구 북촌로', tag: '카페/서점', img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBlkWXkQeEdsN3rMbEq-HJoAWXbm_heXj0lDotkOIIjTSe-pZt2eul98AjGvgtnd732G4g2aBUabGuHOpsjpJT10IoeI8RGLYbWM0geVdd4naFyqxM9kVql1oNkrql7qKYSSH_KCqP8-icc4I9yK6T0U8Io5aUiPGh4sNJvozK_JK4x2_jfHanVCm0G2WBY5GyFeIPwEzhRIvTsY9ikPHrD72ariDFiVnLPaJW_EfoD8EmXI6v-SUMNPfGTBj0P48ISouBCD68cVcQ' },
  { title: '난지 한강공원 캠핑장', location: '마포구 한강난지로', tag: '워터사이드', img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuARMyoXsjBEwG0HbxvhkxbVjDRYsvhwT_ordMU7mGaVXtenucoUMrf1CjTHLT95a90PPiIHaPHcJHe-0iq_xCPRcqwB-txk8jI5nP43Pqh9dHVu-PemHJDE3t23dh6ZaxgAr9OvjraI8N88n6YQcIKORrjKvhEBkauLifUt-vjaTlbmCOBtssc0a3_1EkNhXV5_zXp1Nf7rxDatO2V5D_6vFKhz72bsk6l7h5gepOwlHjjVIB67SDGYpcWkDSWgXpNh1t3HbrFRDa4' },
];

function MainDashboard() {
  return (
    <div className="min-h-screen bg-[#F9FAFB]">
      <UserNavbar />
      <main className="max-w-7xl mx-auto px-6 py-10 space-y-16 pb-24 md:pb-10">

        {/* Hero Cards */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <Link to="/heartrate" className="relative overflow-hidden group p-8 rounded-xl bg-gradient-to-br from-soft-mint to-white border border-mint/40 flex flex-col justify-between h-64 shadow-soft transition-all hover:shadow-hover">
            <div className="z-10">
              <div className="flex items-center gap-2 mb-3">
                <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                <span className="text-xs font-bold text-emerald-600 tracking-wider">HEALTH CHECK</span>
              </div>
              <h2 className="text-2xl font-bold text-slate-800 mb-2">심박수 체크</h2>
              <p className="text-slate-500 text-sm leading-relaxed max-w-[240px]">현재 당신의 스트레스 지수를 실시간으로 측정해보세요.</p>
            </div>
            <div className="flex items-end justify-between z-10">
              <button className="bg-emerald-500 text-white font-bold py-3.5 px-8 rounded-xl flex items-center gap-2 hover:bg-emerald-600 shadow-lg shadow-emerald-100 transition-all active:scale-95">
                <span className="material-icons text-lg">favorite</span>
                측정 시작
              </button>
              <div className="w-24 h-12 flex items-center">
                <svg className="w-full h-full stroke-emerald-400 fill-none stroke-2 opacity-40" viewBox="0 0 100 40">
                  <path d="M0 20 L20 20 L25 10 L30 30 L35 20 L100 20" />
                </svg>
              </div>
            </div>
            <div className="absolute -right-6 -top-6 w-40 h-40 bg-emerald-100/30 rounded-full blur-3xl"></div>
          </Link>

          <Link to="/rest-test" className="relative overflow-hidden group p-8 rounded-xl bg-gradient-to-br from-pale-blue to-white border border-blue-100/40 flex flex-col justify-between h-64 shadow-soft transition-all hover:shadow-hover">
            <div className="z-10">
              <div className="flex items-center gap-2 mb-3">
                <span className="w-2 h-2 rounded-full bg-primary-blue"></span>
                <span className="text-xs font-bold text-primary-blue tracking-wider">SELF TEST</span>
              </div>
              <h2 className="text-2xl font-bold text-slate-800 mb-2">휴식 유형 테스트</h2>
              <p className="text-slate-500 text-sm leading-relaxed max-w-[240px]">나에게 가장 필요한 휴식 방법은 무엇일까요?</p>
            </div>
            <div className="flex items-end justify-between z-10">
              <button className="bg-primary-blue text-white font-bold py-3.5 px-8 rounded-xl flex items-center gap-2 hover:bg-blue-600 shadow-lg shadow-blue-100 transition-all active:scale-95">
                <span className="material-icons text-lg">psychology</span>
                테스트하기
              </button>
              <span className="material-icons text-7xl text-blue-200/40">self_improvement</span>
            </div>
            <div className="absolute -right-6 -top-6 w-40 h-40 bg-blue-100/20 rounded-full blur-3xl"></div>
          </Link>
        </section>

        {/* Categories */}
        <section>
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="text-xl font-bold text-slate-800">휴식 카테고리</h3>
              <p className="text-xs text-slate-400 mt-1">오늘 당신의 기분에 맞는 휴식을 선택해보세요</p>
            </div>
            <button className="text-primary-blue text-sm font-bold flex items-center hover:underline">
              전체보기 <span className="material-icons text-sm ml-1">arrow_forward</span>
            </button>
          </div>
          <div className="flex gap-5 overflow-x-auto pb-6 hide-scrollbar">
            {categories.map((cat, i) => (
              <Link
                key={i}
                to={cat.path}
                className="flex-shrink-0 flex flex-col items-center gap-3 p-5 min-w-[120px] rounded-2xl bg-white border-2 border-slate-50 shadow-soft transition-all hover:border-primary/20 hover:shadow-hover"
              >
                <div className={`w-12 h-12 rounded-full ${cat.color} flex items-center justify-center`}>
                  <span className="material-icons">{cat.icon}</span>
                </div>
                <span className="text-xs font-bold text-slate-500">{cat.label}</span>
              </Link>
            ))}
          </div>
        </section>

        {/* Recommended Places */}
        <section>
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="text-xl font-bold text-slate-800">추천 쉼터</h3>
              <p className="text-xs text-slate-400 mt-1">당신의 유형에 맞는 최적의 장소</p>
            </div>
            <Link to="/map" className="text-primary-blue text-sm font-bold flex items-center hover:underline">
              지도에서 보기 <span className="material-icons text-sm ml-1">map</span>
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {places.map((place, i) => (
              <div key={i} className="group cursor-pointer bg-white p-3 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                <div className="relative overflow-hidden rounded-xl aspect-[4/3] mb-4">
                  <img alt={place.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" src={place.img} />
                  <div className="absolute top-3 right-3 p-2 bg-white/90 backdrop-blur-sm rounded-full text-slate-300 hover:text-red-500 transition-colors shadow-sm">
                    <span className="material-icons text-lg">favorite</span>
                  </div>
                  <div className="absolute bottom-3 left-3 px-2.5 py-1 bg-white/90 backdrop-blur-sm rounded-lg text-[10px] font-extrabold text-slate-800 uppercase tracking-wider shadow-sm">
                    {place.tag}
                  </div>
                </div>
                <div className="px-1">
                  <h4 className="font-bold text-slate-900 group-hover:text-primary transition-colors">{place.title}</h4>
                  <p className="text-xs text-slate-400 font-medium flex items-center gap-1 mt-1.5">
                    <span className="material-icons text-[14px]">location_on</span>
                    {place.location}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Community Preview */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-slate-800">커뮤니티 인기글</h3>
            <Link to="/community" className="text-primary-blue text-sm font-bold hover:underline">전체보기</Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {['도심 속에서 찾은 완벽한 오후의 숲멍', '비 오는 날, 따뜻한 차 한 잔과 독서'].map((title, i) => (
              <div key={i} className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm hover:shadow-md transition-shadow cursor-pointer">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-8 h-8 rounded-full bg-slate-100"></div>
                  <span className="text-sm font-semibold text-slate-700">{i === 0 ? '김지한' : '이지은'}</span>
                  <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${i === 0 ? 'bg-soft-mint text-emerald-700' : 'bg-pale-blue text-blue-700'}`}>
                    {i === 0 ? '신체적 휴식' : '감각적 휴식'}
                  </span>
                </div>
                <h4 className="font-bold text-slate-800 mb-2">{title}</h4>
                <div className="flex items-center gap-4 text-slate-400 text-sm">
                  <span className="flex items-center gap-1"><span className="material-symbols-outlined text-base">favorite</span>{i === 0 ? 124 : 89}</span>
                  <span className="flex items-center gap-1"><span className="material-symbols-outlined text-base">chat_bubble</span>{i === 0 ? 18 : 12}</span>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}

export default MainDashboard;
