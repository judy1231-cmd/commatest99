import { Link } from 'react-router-dom';
import UserNavbar from '../../components/user/UserNavbar';

const activities = [
  {
    title: '숲캉스 (Forest Bathing)',
    desc: '피톤치드 가득한 숲에서 오감을 열고 걷기',
    badge: '인기',
    img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAoyd2BqutepbQSm-ZvCXv80NyR-OI5EbeIVMoND5sl4d_kUc4AaE3HBHCHSGKHMj1Ye6LeCX1eZ4Z7zTljklHlrH7c6RVrEu1ynQcud7tViQ6uLyB036rzY1K_KDhmKX3e4mJW1B7LAvFXJrMxQ0oYQZdtjwk_aORVYfRxkvrwLnsdnKM2GGV0L3iiyHWcQaO_qji21UeMVvhjv4xRxXVCziCYCxolI0220pyywIqad9K5TSmJDywi_stIxSDNuKau_LjTzRXKWOQ',
  },
  {
    title: '맨발 걷기 (Earthing)',
    desc: '대지의 감촉을 느끼며 땅과 직접 연결되기',
    img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBNPsmlUwtdOQQb3Edv4p44oYGvADOd7oYDE9TZ5LcZbHRk68f1o-RJ4Mu5GEEvoZihpQc7GfQTczkF9Z-6-vpIAEAU3PsXtRP33ucWGyIZ5rzsPx1nPKLonxbK-QFVpMHrWaXqc-OFkfJ1XiO96y9p7C_OEfChdNlSnGZwKVfs5FaUg6XPNwCwi-CWgBRBdT_fdvWwWAgSQncSqRx3rjR5sJAI57B5xDeRG4c_CCJFneKC3DqfNH_PbsbB_peZ4v_1c9WRNScLOYI',
  },
  {
    title: '별 헤는 밤 (Stargazing)',
    desc: '우주의 경이로움을 느끼며 잡념 비워내기',
    img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCN_Eo6CdOKvVoYL2J59RmertCKufAZNVP9xSdpGKE8bEtxmLRaLDkUH__aZngnnpcHGAByCtENAUSHBz6s7o5y_rHKD1cHHa_WqcbFK908zevSp_5wEVz3DeGFy1O-g17lUZ1Cw74mtZw_oo3iY1yOwOk1DM7zOWro6JgT9yHi1OoXRb4QiOgXXKlPOJN83Gpntexz62ihSP6e_ZPbN611bBq89d8xrw1hG8Th1LyNUeazOrC06KfS92bynQ58DMWi_xNAZtg6XjA',
  },
];

const places = [
  { type: 'Arboretum', name: '고요한 수목원', location: '경기도 가평군', rating: '4.8', img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDXzxs2h0HKB3GCbgt1N7mJrlSCMVAzFcJVSMzZwA9bnYLLKN86Fw3KNB-n2XgcaC0FsYG0muTIsjvYpbDXG0Aqam7JO22V46BuLcOjlcIkbmzoEddBAGRKnHB_yc6e5VdO8rsnxm_7SzMAKRTjDAgYF02_hxnjEBqYVDXGEPk11e5x7XVzdZNMx4FBO1b3kSKXk-umF8cZN1_PKsxI97OPEC8PS5hOeeoW8_JcB2XyqR1MjQUC6Gt_5ydjIfwuGXY5fpqoccV8F1c' },
  { type: 'Trail', name: '산들바람 숲길', location: '서울 관악구', rating: '4.6', img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAfyj0KTtXer_EUNY_TWyPl4QHhQZXWz1pJGaJK1HPkPH5uN3wlujZOZDgaSarb6HXQX-jCLGKdURhsXdza3_dfew1YXC-U09zxmsRF-BmarHXfxpu_qXwJKK3ABcFXdk0OOY35YHrRW-fsw7ehYNU2OtH7ar6wvsZYTPRx6nI38tXYPdDsC88jcJyAwY2O3bGy_zJ8_auLf7g5WTU5xi5gXLs9JGxiyJkoWpRRce9XSLyAwIdSwqHqAJ6V79a0s1ed4CbsdtRBIe8' },
  { type: 'Beach', name: '달빛 해변', location: '강원도 양양군', rating: '4.9', img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuC8wwu6cJsXj07JmoHANvYHus3UIuhJ9-lEK7SlZIRPo78Juqk9ox3WUr3KOMBBO6_WcIJLA9QA3g_p65Y4gal_0CUCpSvd8TdPA08txF1nH0C4bsTWjxnflc_re6Wzh66tK7xXvuH9slLHOHesH7iQiY7911vUCKF_RVRgNGwnNFQ74-_UVyz1TjjQzdZT3_h7E-6em9-wssFeqVdCj-nS78-qkJOPWU4j-sxHV37IaAmv8fkJFKCfjzNNG2tkAnKOLyr2IHlZLGw' },
  { type: 'Nature Park', name: '비밀의 정원', location: '제주 서귀포시', rating: '4.7', img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAwK_x6GismrvUQt0ZUWnogmUiKmmO4R6FrqA-qSy9t1qpndd1J4WtvszjAgquU-RTtFkgVJhqLYt3f8uz1f5OVMBzkRyNbKKG_ArS-4f8d0F5FilvTK5iZkJRZrLBkikBITpvTZDXE9dofqxUjD8o9yNxSV0ClVpUixgBYH7lNC0sl7zJ-hSbV2waNIphW0EPLI3ePHGKrThdTNSVzqQJVcYarG6rPGprL86eiwvImYmS80pWC87Fsk_lnk9XhN3SxSE4clyfuH0A' },
];

const checklist = [
  '창문 없는 방에 갇힌 기분이 든다.',
  '디지털 기기 없이는 불안하다.',
  '이유 없는 만성 피로가 계속된다.',
  '계절의 변화를 감각하지 못한다.',
];

function RestNature() {
  return (
    <div className="min-h-screen bg-[#F9F7F2]">
      <UserNavbar />
      <main className="max-w-6xl mx-auto px-6 py-10 space-y-20 pb-24 md:pb-10">

        {/* Back */}
        <Link to="/" className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-green-600 transition-colors">
          <span className="material-symbols-outlined text-base">arrow_back</span>
          홈으로
        </Link>

        {/* Hero */}
        <section className="relative h-[500px] rounded-3xl overflow-hidden group">
          <div
            className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105"
            style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuARiHDaxqOu1ze_Oz4cq5MI7ac8Zjh50rum7acFRR7JvVAmmNvD5K-itK_aI3uxaR6t-KTH48wO89hU6MitL8UMrtAdYQ8Po5tYhZVZcZvxrOEcZaY0FsmkVdCWJSdLPwv5DHK6EZtBlpAkj9O_TKhBWZoNbQjnLw0IbsiAAPbJgDUIAJLNCONt85IyY9fx7_ZI1EK4bTwXKXEi5qOtSwdV3cNlpQw7arL3HZH_V0u2ls5vzj1g0zgJoWtoPFgM0t9ZyeCwbgCecdM')" }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent flex flex-col justify-end p-10 lg:p-16">
            <span className="text-green-400 font-semibold mb-4 bg-white/20 backdrop-blur-sm w-fit px-4 py-1 rounded-full text-sm uppercase tracking-widest">Connection with Nature</span>
            <h2 className="text-4xl lg:text-6xl font-bold text-white mb-6">자연의 연결</h2>
            <p className="text-lg lg:text-xl text-white/90 max-w-2xl leading-relaxed">
              도시의 소음을 뒤로하고 자연의 리듬에 몸을 맡기며<br className="hidden md:block" />
              생명력을 회복하는 시간입니다.
            </p>
          </div>
        </section>

        {/* Why + Effects */}
        <section className="grid md:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 text-green-800 bg-green-50 px-4 py-2 rounded-lg font-semibold">
              <span className="material-symbols-outlined">health_and_safety</span>
              <span>자연 결핍과 회복의 원리</span>
            </div>
            <h3 className="text-3xl font-bold leading-tight">자연 결핍 증후군이란?</h3>
            <p className="text-gray-600 leading-relaxed text-lg">
              현대인이 자연과 멀어지며 겪는 정서적 불안과 스트레스 상태를 의미합니다. 시멘트 숲에서 벗어나 초록색을 바라보는 것만으로도 우리 뇌는 휴식 모드로 전환됩니다.
            </p>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-white rounded-xl shadow-sm border border-green-100">
                <span className="material-symbols-outlined text-green-500 mb-2 block">park</span>
                <h4 className="font-bold text-sm">정서적 고립감 해소</h4>
                <p className="text-xs text-gray-500">우울감 28% 감소 효과</p>
              </div>
              <div className="p-4 bg-white rounded-xl shadow-sm border border-green-100">
                <span className="material-symbols-outlined text-green-500 mb-2 block">psychology</span>
                <h4 className="font-bold text-sm">집중력 향상</h4>
                <p className="text-xs text-gray-500">인지 능력의 자연스러운 회복</p>
              </div>
            </div>
          </div>
          <div className="bg-green-500/10 rounded-3xl p-8 lg:p-12 relative overflow-hidden">
            <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-40 h-40 bg-white/30 rounded-full blur-3xl" />
            <h4 className="text-xl font-bold mb-6 text-green-900">자연이 주는 치유 효과</h4>
            <ul className="space-y-4">
              {[
                { title: '스트레스 호르몬(코르티솔) 감소', desc: '숲에서 20분만 걸어도 유의미한 수치 하락' },
                { title: '신체적 그라운딩 효과', desc: '지구의 에너지를 받아 면역력 강화' },
                { title: '심신 안정 및 수면 개선', desc: '자연의 백색소음으로 깊은 숙면 유도' },
              ].map((item, i) => (
                <li key={i} className="flex items-start gap-3">
                  <span className="material-symbols-outlined text-green-500">check_circle</span>
                  <div>
                    <p className="font-semibold">{item.title}</p>
                    <p className="text-sm text-gray-600">{item.desc}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* Activities */}
        <section>
          <div className="flex justify-between items-end mb-8">
            <div>
              <h3 className="text-2xl font-bold text-gray-800">추천 활동</h3>
              <p className="text-gray-500 mt-2">지금 바로 시작할 수 있는 작은 자연과의 교감</p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {activities.map((act, i) => (
              <div key={i} className="group cursor-pointer">
                <div className="relative aspect-[4/5] rounded-2xl overflow-hidden mb-4 shadow-md">
                  <div
                    className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-110"
                    style={{ backgroundImage: `url('${act.img}')` }}
                  />
                  {act.badge && (
                    <div className="absolute top-4 right-4 bg-white/80 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold">{act.badge}</div>
                  )}
                </div>
                <h4 className="text-lg font-bold group-hover:text-green-500 transition-colors">{act.title}</h4>
                <p className="text-gray-500 text-sm mt-1">{act.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Checklist + Places */}
        <section className="grid lg:grid-cols-3 gap-10">
          <div className="lg:col-span-1 bg-white p-8 rounded-3xl border border-green-100 shadow-sm h-fit">
            <h3 className="text-xl font-bold mb-2">자연이 필요한 신호</h3>
            <p className="text-gray-400 text-sm mb-6">최근 당신의 상태를 체크해보세요.</p>
            <div className="space-y-4">
              {checklist.map((item, i) => (
                <label key={i} className="flex items-center gap-3 cursor-pointer group">
                  <input type="checkbox" className="w-5 h-5 rounded text-green-500 focus:ring-green-400 border-gray-300" />
                  <span className="text-sm text-gray-700">{item}</span>
                </label>
              ))}
            </div>
            <div className="mt-8 pt-6 border-t border-gray-100 text-center">
              <p className="text-xs text-gray-400 mb-3">2개 이상 체크 시 자연 처방이 필요합니다.</p>
              <Link to="/map" className="block w-full bg-green-500 text-white py-3 rounded-xl font-bold hover:bg-green-700 transition-colors text-center">
                내 주변 명소 찾기
              </Link>
            </div>
          </div>

          <div className="lg:col-span-2 space-y-6">
            <h3 className="text-2xl font-bold">함께 가보면 좋은 곳</h3>
            <div className="grid sm:grid-cols-2 gap-6">
              {places.map((place, i) => (
                <div key={i} className="flex gap-4 p-4 rounded-2xl bg-white hover:shadow-md transition-shadow">
                  <div
                    className="w-24 h-24 rounded-xl bg-cover bg-center flex-shrink-0"
                    style={{ backgroundImage: `url('${place.img}')` }}
                  />
                  <div className="flex flex-col justify-between py-1">
                    <div>
                      <span className="text-[10px] font-bold text-green-500 uppercase tracking-wider">{place.type}</span>
                      <h4 className="font-bold text-gray-800">{place.name}</h4>
                      <p className="text-xs text-gray-500 mt-1">{place.location}</p>
                    </div>
                    <div className="flex items-center gap-1 text-xs text-yellow-500">
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
        <section className="bg-gradient-to-br from-green-800 to-green-950 text-white rounded-[2rem] p-10 lg:p-20 overflow-hidden relative">
          <div className="relative z-10 max-w-4xl mx-auto text-center space-y-12">
            <div className="space-y-4">
              <span className="inline-block px-4 py-1 bg-green-400/20 border border-green-400/30 rounded-full text-green-400 font-bold text-sm tracking-widest">AI THERAPY PICK</span>
              <h3 className="text-3xl lg:text-5xl font-bold leading-tight italic">"자연은 서두르지 않지만,<br />모든 것을 이룹니다."</h3>
              <p className="text-white/60">— 노자 (Lao Tzu)</p>
            </div>
            <div className="grid md:grid-cols-2 gap-8 text-left">
              <div className="bg-white/10 backdrop-blur-xl p-6 rounded-2xl border border-white/10">
                <div className="flex items-center gap-4 mb-4">
                  <span className="material-symbols-outlined text-green-400 text-4xl">graphic_eq</span>
                  <div>
                    <h4 className="font-bold">오늘의 힐링 사운드</h4>
                    <p className="text-sm text-white/70">ASMR | 빗소리와 숲의 대화</p>
                  </div>
                </div>
                <div className="h-2 w-full bg-white/10 rounded-full mb-4 overflow-hidden">
                  <div className="h-full bg-green-400 w-2/3" />
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span>02:14</span>
                  <div className="flex gap-4">
                    <span className="material-symbols-outlined cursor-pointer">skip_previous</span>
                    <span className="material-symbols-outlined cursor-pointer text-green-400">pause</span>
                    <span className="material-symbols-outlined cursor-pointer">skip_next</span>
                  </div>
                  <span>05:30</span>
                </div>
              </div>
              <div className="bg-white/10 backdrop-blur-xl p-6 rounded-2xl border border-white/10 flex gap-4 items-center group cursor-pointer">
                <div
                  className="w-20 h-20 rounded-xl bg-cover bg-center flex-shrink-0 relative overflow-hidden"
                  style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuAGW65Z8APr9FtOKYw6MvaDuoBvUyaKAj-B_QuCltms7V1DcrOWGoAg9Y8Ws3PTUFuaBLISzJMHvYDJqe777sRUYU0O-SYC95rrWkugX7wJtXOP-pZw4p7KO7EH8cTjNusaRo3oYor1DrrqBT2Du4iGILAdN-i4zcstFwZ_D10sAvsLpwskYP06C7mbWEyNbPtyAh_U3hQKnPHsh1enc7PAIjZ9gys7D3oywhWEBqis7ywSRb8pLxZRxbjzeTWADKpLcV2aSDFulic')" }}
                >
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                    <span className="material-symbols-outlined text-white">play_arrow</span>
                  </div>
                </div>
                <div>
                  <h4 className="font-bold">추천 치유 영상</h4>
                  <p className="text-sm text-white/70">4K 스위스 알프스 치유 영상</p>
                  <button className="mt-2 text-xs font-bold text-green-400 group-hover:underline">지금 시청하기</button>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

export default RestNature;
