import { Link } from 'react-router-dom';
import UserNavbar from '../../components/user/UserNavbar';

const categories = [
  { icon: 'fitness_center', label: '신체적 이완', bg: 'bg-pale-blue', iconColor: 'text-primary', path: '/rest/physical' },
  { icon: 'spa', label: '정신적 고요', bg: 'bg-soft-mint', iconColor: 'text-emerald-500', path: '/rest/mental' },
  { icon: 'visibility_off', label: '감각의 정화', bg: 'bg-warm-beige', iconColor: 'text-amber-500', path: '/rest/sensory' },
  { icon: 'favorite_border', label: '정서적 지지', bg: 'bg-red-50', iconColor: 'text-rose-400', path: '/rest/emotional' },
  { icon: 'groups', label: '사회적 휴식', bg: 'bg-purple-50', iconColor: 'text-purple-400', path: '/rest/social' },
  { icon: 'brush', label: '창조적 몰입', bg: 'bg-orange-50', iconColor: 'text-orange-400', path: '/rest/creative' },
  { icon: 'forest', label: '자연의 연결', bg: 'bg-slate-50', iconColor: 'text-slate-500', path: '/rest/nature' },
];

const places = [
  {
    title: '포레스트 스파 강남',
    desc: '도심 속 작은 숲에서 즐기는 최고급 스파와 아로마 테라피.',
    tag: '신체적 이완',
    tagColor: 'text-emerald-600 border-emerald-50',
    rating: '4.9',
    dist: '800m 이내',
    img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuD7cmp2dGYQEh4h426fS-hLnArR4UM_6rPcPD37h0TCr2ljFjz9_XAdX3VOowgICppGjaTTOC83RE3XrtNiFNzbYzOHu9wSGWxad5th7WB_-jo2OEEfDjIN_MU3lse2bj_JZX3iT1vWo_Kk0ykUYwRC8359wii-MBmtB4XSBpa8wlbvp_2EXRUn1fCOQDH5sr4_x-NECnidmEWjJPZI_x5O-HeCO_KWQ374qIURhL_hSydkaatF71EW-PEil_MlnOOBXPrSVItphaY',
  },
  {
    title: '침묵의 서재',
    desc: '대화가 금지된 온전한 몰입의 공간, 프리미엄 북카페.',
    tag: '정신적 고요',
    tagColor: 'text-primary border-blue-50',
    rating: '4.7',
    dist: '1.2km 이내',
    img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAMC01Tg43QsKF3OG3KET1fgilW4ZFx-rJBMfppT3rwLRro6GRE7k6RyD7k2eo3qxb9DgENFVe0HHMW_rlOr_tMI4SQCCQmYwU127klCsRhyfsPe5lru-4o4f2dYgNByLyfv4Bbt2-8biGKgOXn3blrabOm4jG4Zrw4f9ykxNypHo3XyCJvOPqbTUhjaXyfdvce3JijcMFTDGYTAU8qyU-DeLTNzARI9nrUtu3u7hFuo-xpE8VPvK-8grQCog6Aa6w9jw04c4CRrKQ',
  },
  {
    title: '카페 블랭크',
    desc: '화이트 노이즈와 미니멀한 인테리어로 감각의 과부하를 비우는 곳.',
    tag: '감각의 정화',
    tagColor: 'text-amber-600 border-amber-50',
    rating: '4.8',
    dist: '500m 이내',
    img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCehrd6W2_-shs55hJEvL_w9pM1Kug1SrKYWST0pHyqUKTEztE1oOXP2467-XnOKsKsbaL1OPibogWlaZR5Pxt9quclFBzmnb09Nu700rxSsKcM59srZMbrYhhGgIJ4CfKf8D87j9pKCO7hTK2h-t51iaAaH8g5lYU5vQ0pwSzBrL8DFCjQz9h16NVN3oMb00uFWfCB4P6JwUF2xBPilWnCEL5cTx73gE5Vh01TKiWVxLle1IGRNIDSbXDoxjbumUtCncHjvYvEgr8',
  },
];

const stats = [
  { color: 'bg-emerald-400', label: '자연의 연결 (숲/공원)', pct: 35, bar: 'w-[35%] bg-emerald-400' },
  { color: 'bg-blue-400', label: '신체적 이완 (스파)', pct: 30, bar: 'w-[30%] bg-blue-400' },
  { color: 'bg-amber-400', label: '정신적 고요 (명상)', pct: 20, bar: 'w-[20%] bg-amber-400' },
  { color: 'bg-rose-400', label: '감각의 정화 (전시)', pct: 15, bar: 'w-[15%] bg-rose-400' },
];

function MainDashboard() {
  const isLoggedIn = !!localStorage.getItem('accessToken');

  return (
    <div className="min-h-screen bg-[#F9F7F2]">
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
                <span className="w-2 h-2 rounded-full bg-primary"></span>
                <span className="text-xs font-bold text-primary tracking-wider">SELF TEST</span>
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
            <button className="text-primary text-sm font-bold flex items-center hover:underline">
              전체보기 <span className="material-icons text-sm ml-1">arrow_forward</span>
            </button>
          </div>
          <div className="flex gap-5 overflow-x-auto pb-6 hide-scrollbar">
            {categories.map((cat, i) => (
              <Link
                key={i}
                to={cat.path}
                className={`flex-shrink-0 flex flex-col items-center gap-3 p-5 min-w-[120px] rounded-2xl bg-white border-2 shadow-soft transition-all ${i === 0 ? 'border-primary ring-4 ring-primary/5' : 'border-slate-50 hover:border-primary/20'}`}
              >
                <div className={`w-12 h-12 rounded-full ${cat.bg} flex items-center justify-center`}>
                  <span className={`material-icons ${cat.iconColor}`}>{cat.icon}</span>
                </div>
                <span className={`text-xs font-bold ${i === 0 ? 'text-slate-700' : 'text-slate-500'}`}>{cat.label}</span>
              </Link>
            ))}
          </div>
        </section>

        {/* Recommended Places */}
        <section>
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-6 bg-primary rounded-full"></div>
              <h3 className="text-xl font-bold text-slate-800">실시간 추천 장소</h3>
              <div className="ml-3 px-3 py-1 bg-white border border-slate-100 rounded-full flex items-center gap-1 shadow-sm">
                <span className="material-icons text-xs text-primary">location_on</span>
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-tight">서울 강남구 주변</span>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {places.map((place, i) => (
              <div key={i} className="group rounded-2xl overflow-hidden bg-white border border-slate-100 shadow-soft hover:shadow-hover transition-all duration-300">
                <div className="relative h-52 overflow-hidden">
                  <img alt={place.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" src={place.img} />
                  <div className={`absolute top-4 left-4 bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-lg text-[10px] font-bold shadow-sm border ${place.tagColor}`}>
                    {place.tag}
                  </div>
                  <button className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/50 backdrop-blur-md flex items-center justify-center hover:bg-white transition-colors">
                    <span className="material-icons text-lg text-rose-400">favorite_border</span>
                  </button>
                </div>
                <div className="p-6">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-bold text-lg text-slate-800">{place.title}</h4>
                    <div className="flex items-center text-amber-400">
                      <span className="material-icons text-base">star</span>
                      <span className="text-sm ml-1 font-bold text-slate-700">{place.rating}</span>
                    </div>
                  </div>
                  <p className="text-slate-500 text-sm leading-relaxed line-clamp-2 mb-6">{place.desc}</p>
                  <div className="flex items-center justify-between pt-4 border-t border-slate-50">
                    <span className="text-xs font-medium text-slate-400 flex items-center gap-1">
                      <span className="material-icons text-xs">near_me</span> {place.dist}
                    </span>
                    <button className="text-primary text-sm font-bold flex items-center gap-1 group/btn">
                      상세보기 <span className="material-icons text-sm group-hover/btn:translate-x-1 transition-transform">chevron_right</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Stats - 로그인 시에만 표시 */}
        {isLoggedIn && <section className="grid grid-cols-1 lg:grid-cols-3 gap-8 pb-12">
          {/* Monthly Stats Chart */}
          <div className="lg:col-span-2 bg-white border border-slate-100 rounded-2xl p-8 shadow-soft">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h3 className="text-xl font-bold text-slate-800">월간 휴식 통계</h3>
                <p className="text-xs text-slate-400 mt-1">지난 한 달간 당신의 휴식 패턴 분석입니다</p>
              </div>
              <select className="bg-slate-50 border-transparent text-xs rounded-lg text-slate-600 font-bold focus:ring-primary focus:border-primary px-4 py-2">
                <option>이번 달</option>
                <option>지난 달</option>
                <option>전체 기간</option>
              </select>
            </div>
            <div className="flex flex-col md:flex-row gap-10 items-center justify-center">
              <div className="relative w-56 h-56 flex-shrink-0">
                <div
                  className="absolute inset-0 rounded-full"
                  style={{ background: 'conic-gradient(#34D399 0% 35%, #60A5FA 35% 65%, #FBBF24 65% 85%, #F87171 85% 100%)' }}
                ></div>
                <div className="absolute inset-4 bg-white rounded-full flex flex-col items-center justify-center shadow-inner">
                  <span className="text-slate-400 text-xs font-semibold">총 휴식</span>
                  <span className="text-3xl font-bold text-slate-800">42<span className="text-sm text-slate-500 font-medium">시간</span></span>
                </div>
              </div>
              <div className="flex-1 w-full space-y-5">
                {stats.map((s, i) => (
                  <div key={i} className="space-y-2">
                    <div className="flex justify-between items-center text-sm">
                      <span className="font-bold text-slate-700 flex items-center gap-2">
                        <span className={`w-3 h-3 rounded-full ${s.color}`}></span> {s.label}
                      </span>
                      <span className="text-slate-500 font-medium">{s.pct}%</span>
                    </div>
                    <div className="w-full bg-slate-50 h-2 rounded-full overflow-hidden">
                      <div className={`h-full rounded-full ${s.bar}`}></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* My Stats */}
          <div className="bg-primary text-white rounded-2xl p-8 flex flex-col justify-between overflow-hidden relative shadow-lg shadow-blue-100">
            <div className="z-10">
              <h3 className="text-2xl font-bold mb-3">나의 휴식 지표</h3>
              <div className="inline-flex items-center gap-2 bg-white/20 px-3 py-1.5 rounded-full backdrop-blur-sm mb-4">
                <span className="material-icons text-xs">trending_up</span>
                <p className="text-xs font-bold">휴식 효율 상위 15%</p>
              </div>
              <p className="text-white/80 text-sm leading-relaxed">이번 주 당신은 매우 건강한 휴식 패턴을 유지하고 있습니다.</p>
            </div>
            <div className="z-10 flex flex-col gap-4 mt-10">
              <div className="bg-white/10 backdrop-blur-md p-5 rounded-2xl flex items-center justify-between border border-white/10 hover:bg-white/15 transition-colors">
                <div>
                  <p className="text-[10px] font-bold text-white/60 uppercase tracking-widest mb-1">총 휴식 시간</p>
                  <p className="text-xl font-bold">12h 40m</p>
                </div>
                <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                  <span className="material-icons">schedule</span>
                </div>
              </div>
              <div className="bg-white/10 backdrop-blur-md p-5 rounded-2xl flex items-center justify-between border border-white/10 hover:bg-white/15 transition-colors">
                <div>
                  <p className="text-[10px] font-bold text-white/60 uppercase tracking-widest mb-1">평균 스트레스</p>
                  <p className="text-xl font-bold">낮음 (24 bpm)</p>
                </div>
                <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                  <span className="material-icons">analytics</span>
                </div>
              </div>
            </div>
            <div className="absolute -bottom-12 -right-12 text-[180px] font-black text-white/5 select-none pointer-events-none">쉼</div>
          </div>
        </section>}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-100 py-16 bg-white">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-10">
          <div className="flex flex-col items-center md:items-start gap-4">
            <div className="flex items-center gap-3">
              <div className="w-7 h-7 bg-primary rounded-lg flex items-center justify-center shadow-sm">
                <span className="text-white font-bold text-sm">,</span>
              </div>
              <h1 className="text-xl font-bold tracking-tight text-slate-800">쉼표</h1>
            </div>
            <p className="text-slate-400 text-xs">© 2024 Comma Inc. All rights reserved. 완벽한 휴식을 선사합니다.</p>
          </div>
          <div className="flex gap-10 text-sm font-semibold text-slate-500">
            <button className="hover:text-primary transition-colors">이용약관</button>
            <button className="hover:text-primary transition-colors">개인정보처리방침</button>
            <button className="hover:text-primary transition-colors">고객센터</button>
          </div>
          <div className="flex gap-4">
            <button className="w-12 h-12 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 hover:bg-primary/10 hover:text-primary transition-all">
              <span className="material-icons text-xl">share</span>
            </button>
            <button className="w-12 h-12 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 hover:bg-primary/10 hover:text-primary transition-all">
              <span className="material-icons text-xl">mail</span>
            </button>
          </div>
        </div>
      </footer>

      {/* Floating Timer Button */}
      <button className="fixed bottom-10 right-10 w-16 h-16 bg-white text-primary rounded-full shadow-2xl flex items-center justify-center group hover:scale-110 transition-transform ring-4 ring-primary/5 border border-primary/10 z-40">
        <span className="material-icons text-3xl">timer</span>
        <span className="absolute right-20 bg-slate-800 text-white px-5 py-2.5 rounded-xl text-xs font-bold opacity-0 group-hover:opacity-100 transition-opacity shadow-xl whitespace-nowrap pointer-events-none">
          3분 명상 시작하기
        </span>
        <span className="absolute -top-1 -right-1 flex h-5 w-5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
          <span className="relative inline-flex rounded-full h-5 w-5 bg-primary border-2 border-white"></span>
        </span>
      </button>
    </div>
  );
}

export default MainDashboard;
