import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import UserNavbar from '../../components/user/UserNavbar';
import { useRestActivities } from '../../api/useRestActivities';

const TYPE = {
  key: 'emotional',
  name: '정서적 지지',
  engName: 'Emotional Rest',
  icon: 'favorite',
  desc: '감정을 억누르지 않고 있는 그대로 받아들이며 회복하는 시간',
  color: '#FF7BAC',
  chipBg: '#FFF0F5',
  heroImg: 'https://lh3.googleusercontent.com/aida-public/AB6AXuD9YA02Qrhlax2MQpT-TtboYEbRVzpBreEWwUv_olaFb18WQsTQPjT7kTAkLv7wvJGHeXlEPeNeFygpmARx53NctmzGrdgiF8S8CR5e0_5TcQliztEbyZThYnZnykqbdL_Y6upUpqPX1W6BaNYpkKnMSkNirIHeoh_Ccma3VE6a7RW5jI7dYyNvuqlr1RnWJSBolH8DnTAzsHHPeKQsmTMO3tND0d4ZB0kCshXfouqe-5fwc3f9EoBqRPU3waNU5_H6yS4emYQcdVo',
};

const COMPANION_OPTIONS = [
  { key: 'alone',    label: '혼자',    icon: 'person' },
  { key: 'together', label: '누군가와', icon: 'group' },
  { key: 'pet',      label: '반려동물', icon: 'pets' },
];

const METHOD_OPTIONS = [
  { key: 'activity', label: '활동', icon: 'directions_run' },
  { key: 'viewing',  label: '감상', icon: 'movie' },
  { key: 'writing',  label: '기록', icon: 'edit_note' },
];

const EMOTIONAL_PLACES = [
  { name: '동물카페', location: '홍대·합정·신촌', desc: '강아지·고양이와 교감. 무조건적인 애정으로 정서 충전', companion: ['pet'], method: ['activity'], tags: ['동물카페', '힐링', '귀여움'], icon: 'pets', gradient: 'from-pink-400 to-rose-500' },
  { name: '반려동물 돌봄 봉사', location: '유기동물 보호센터', desc: '유기동물 돌보기 봉사. 나보다 더 필요한 존재에게 온기 나누기', companion: ['pet'], method: ['activity'], tags: ['봉사', '유기동물', '보람'], icon: 'favorite', gradient: 'from-rose-400 to-pink-600' },
  { name: '힐링 영화관 (독립영화)', location: '씨네큐브·아트하우스', desc: '감동적인 독립영화 관람. 울어도 되는 공간', companion: ['alone'], method: ['viewing'], tags: ['영화', '독립영화', '감동'], icon: 'movie', gradient: 'from-violet-400 to-purple-500' },
  { name: 'OTT 감성 영화 마라톤', location: '집에서', desc: '넷플릭스·웨이브에서 감동 영화 연속 감상. 울고 싶을 때 마음껏', companion: ['alone'], method: ['viewing'], tags: ['넷플릭스', '영화마라톤', '집관'], icon: 'tv', gradient: 'from-indigo-400 to-violet-500' },
  { name: '편지 쓰기 카페', location: '연남동·망원동', desc: '종이에 손으로 편지 쓰기. 보내지 않아도 괜찮아, 쓰는 것만으로 치유', companion: ['alone'], method: ['writing'], tags: ['편지', '아날로그', '감정해소'], icon: 'mail', gradient: 'from-amber-400 to-orange-500' },
  { name: '감정 일기 쓰기', location: '집·카페 어디서든', desc: '오늘 느낀 감정 단어 5개 적기. 작은 것부터 시작', companion: ['alone'], method: ['writing'], tags: ['일기', '감정정리', '무료'], icon: 'book', gradient: 'from-emerald-400 to-teal-500' },
  { name: '친한 친구와 야식 먹기', location: '편한 식당·집', desc: '맛있는 것 앞에서 하는 수다는 최고의 정서 치유', companion: ['together'], method: ['activity'], tags: ['친구', '야식', '수다'], icon: 'restaurant', gradient: 'from-orange-400 to-amber-500' },
  { name: '보드게임 카페 (소수)', location: '홍대·건대', desc: '2~4명이서 보드게임. 웃다 보면 어느새 기분이 풀려', companion: ['together'], method: ['activity'], tags: ['보드게임', '소규모', '웃음'], icon: 'casino', gradient: 'from-sky-400 to-blue-500' },
];

const CHECKLIST = [
  '이유 없이 눈물이 나거나 감정이 격해진다.',
  '누군가에게 위로받고 싶지만 말을 꺼내기 어렵다.',
  '감정을 억누르느라 에너지가 다 소진된 느낌이다.',
  '작은 일에도 상처받거나 예민하게 반응한다.',
  '혼자 있으면 공허하고 연결이 끊긴 느낌이다.',
];

function RestEmotional() {
  const navigate = useNavigate();
  const [companion, setCompanion] = useState('alone');
  const [method, setMethod] = useState('activity');
  const { activities, loading: activitiesLoading } = useRestActivities('emotional');

  const filteredPlaces = EMOTIONAL_PLACES.filter(
    p => p.companion.includes(companion) && p.method.includes(method)
  );

  return (
    <div className="min-h-screen bg-[#F7F7F8]">
      <UserNavbar />

      {/* 히어로 */}
      <div className="relative">
        <div className="relative h-60 overflow-hidden">
          <img src={TYPE.heroImg} alt={TYPE.name} className="w-full h-full object-cover" />
          {/* 핑크 계열 브랜드 오버레이 */}
          <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(157,23,77,0.75) 0%, rgba(244,114,182,0.28) 60%, rgba(0,0,0,0.05) 100%)' }} />
          <div className="absolute bottom-0 left-0 right-0 px-8 pb-6">
            <span className="inline-block text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full mb-2 bg-white/20 backdrop-blur-sm text-white/90">
              {TYPE.engName}
            </span>
            <h1 className="text-[28px] font-extrabold text-white tracking-tight">{TYPE.name}</h1>
            <p className="text-white/70 text-[13px] mt-0.5">{TYPE.desc}</p>
          </div>
        </div>

        {/* 브릿지 */}
        <div className="relative -mt-5 bg-[#F7F7F8] rounded-t-3xl pt-6 px-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-9 h-9 rounded-full flex items-center justify-center" style={{ backgroundColor: TYPE.chipBg }}>
              <span className="material-icons text-[18px]" style={{ color: TYPE.color }}>{TYPE.icon}</span>
            </div>
            <div>
              <p className="text-[13px] font-extrabold" style={{ color: TYPE.color }}>{TYPE.name}</p>
              <p className="text-[11px] text-slate-400">감정 해소 · 정서 연결 · 공감과 위로</p>
            </div>
          </div>

          <main className="max-w-4xl mx-auto">

            {/* 추천 활동 */}
            <section className="mb-10">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-[17px] font-extrabold text-slate-800">추천 활동</h2>
                <span className="text-xs text-slate-400">탭하면 기록할 수 있어요</span>
              </div>
              {activitiesLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {[1,2,3].map(i => <div key={i} className="bg-white rounded-2xl border border-slate-100 p-5 animate-pulse h-28" />)}
                </div>
              ) : activities.length === 0 ? (
                <div className="bg-white rounded-2xl border border-slate-100 p-8 text-center">
                  <span className="material-icons text-3xl text-slate-200 block mb-2">pending</span>
                  <p className="text-slate-400 text-sm">활동 정보를 불러올 수 없어요</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {activities.map((act) => (
                    <div key={act.id} onClick={() => navigate('/rest-record')}
                      className="group bg-white rounded-2xl border border-slate-100 shadow-sm p-5 cursor-pointer hover:shadow-md hover:border-pink-200 transition-all">
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-3" style={{ backgroundColor: TYPE.color + '18' }}>
                        <span className="material-icons text-lg" style={{ color: TYPE.color }}>{TYPE.icon}</span>
                      </div>
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <h4 className="font-bold text-slate-800 text-sm">{act.activityName}</h4>
                        {act.durationMinutes && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ backgroundColor: TYPE.color + '15', color: TYPE.color }}>{act.durationMinutes}분</span>
                        )}
                      </div>
                      <p className="text-xs text-slate-500 leading-relaxed">{act.guideContent}</p>
                      <div className="mt-3 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity" style={{ color: TYPE.color }}>
                        <span className="material-icons text-sm">edit_note</span>
                        <span className="text-xs font-bold">기록하기</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>

            {/* 필터 + 장소 */}
            <section className="mb-10">
              <h2 className="text-[17px] font-extrabold text-slate-800 mb-4">지금 어떻게 쉬고 싶어요?</h2>

              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 mb-5 flex flex-wrap gap-6">
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">함께하는 사람</p>
                  <div className="flex gap-2">
                    {COMPANION_OPTIONS.map(opt => (
                      <button key={opt.key} onClick={() => setCompanion(opt.key)}
                        className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full border-2 text-xs font-bold transition-all"
                        style={companion === opt.key
                          ? { backgroundColor: TYPE.color, borderColor: TYPE.color, color: '#fff' }
                          : { backgroundColor: '#f8fafc', borderColor: '#e2e8f0', color: '#64748b' }}>
                        <span className="material-icons text-xs">{opt.icon}</span>{opt.label}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="w-px bg-slate-100 self-stretch" />
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">휴식 방식</p>
                  <div className="flex gap-2">
                    {METHOD_OPTIONS.map(opt => (
                      <button key={opt.key} onClick={() => setMethod(opt.key)}
                        className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full border-2 text-xs font-bold transition-all"
                        style={method === opt.key
                          ? { backgroundColor: TYPE.color, borderColor: TYPE.color, color: '#fff' }
                          : { backgroundColor: '#f8fafc', borderColor: '#e2e8f0', color: '#64748b' }}>
                        <span className="material-icons text-xs">{opt.icon}</span>{opt.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {filteredPlaces.length === 0 ? (
                <div className="bg-white rounded-2xl border border-slate-100 p-12 text-center">
                  <span className="material-icons text-4xl text-slate-200 block mb-2">search_off</span>
                  <p className="text-slate-400 text-sm font-medium">이 조건에 맞는 공간을 준비 중이에요</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {filteredPlaces.map((place, i) => (
                    <div key={i} onClick={() => navigate('/rest-record')}
                      className="group bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden flex cursor-pointer hover:shadow-md hover:border-pink-200 transition-all">
                      <div className={`w-16 shrink-0 bg-gradient-to-b ${place.gradient} flex items-center justify-center`}>
                        <span className="material-icons text-2xl text-white/90">{place.icon}</span>
                      </div>
                      <div className="flex-1 min-w-0 p-4">
                        <h4 className="font-bold text-slate-800 text-sm">{place.name}</h4>
                        <div className="flex items-center gap-1 mt-0.5 mb-2">
                          <span className="material-icons text-[11px] text-slate-300">location_on</span>
                          <p className="text-[11px] text-slate-400">{place.location}</p>
                        </div>
                        <p className="text-xs text-slate-500 leading-relaxed mb-2">{place.desc}</p>
                        <div className="flex flex-wrap gap-1">
                          {place.tags.map((tag, j) => (
                            <span key={j} className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-50 text-slate-500">#{tag}</span>
                          ))}
                        </div>
                      </div>
                      <div className="flex items-center pr-3 opacity-0 group-hover:opacity-100 transition-opacity">
                        <span className="material-icons text-slate-300">chevron_right</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <Link to="/map?restType=emotional"
                className="flex items-center justify-center gap-2 w-full mt-4 py-3.5 rounded-2xl border border-slate-200 bg-white text-sm font-bold text-slate-500 hover:border-pink-300 hover:text-pink-500 transition-all">
                <span className="material-icons text-base">map</span>
                지도에서 내 주변 정서 힐링 공간 찾기
              </Link>
            </section>

            {/* 체크리스트 */}
            <section className="mb-10">
              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
                <div className="flex items-center gap-2 mb-5">
                  <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ backgroundColor: TYPE.color + '15' }}>
                    <span className="material-icons text-sm" style={{ color: TYPE.color }}>checklist</span>
                  </div>
                  <div>
                    <h3 className="font-extrabold text-slate-800 text-sm">정서적 지지가 필요한 신호</h3>
                    <p className="text-xs text-slate-400">해당하는 항목을 체크해보세요</p>
                  </div>
                </div>
                <div className="space-y-2">
                  {CHECKLIST.map((item, i) => (
                    <label key={i} className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 cursor-pointer transition-all">
                      <input type="checkbox" className="w-4 h-4 rounded shrink-0" style={{ accentColor: TYPE.color }} />
                      <span className="text-sm text-slate-600 font-medium">{item}</span>
                    </label>
                  ))}
                </div>
                <div className="mt-4 pt-4 border-t border-slate-100">
                  <p className="text-xs text-slate-400">※ 3개 이상 해당된다면 오늘은 정서적 지지에 집중하세요.</p>
                </div>
              </div>
            </section>

          </main>
        </div>
      </div>
    </div>
  );
}

export default RestEmotional;
