import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import UserNavbar from '../../components/user/UserNavbar';
import { useRestActivities } from '../../api/useRestActivities';
import ActivityModal from '../../components/user/ActivityModal';

const TYPE = {
  key: 'emotional',
  name: '정서적 지지',
  engName: 'Emotional Rest',
  icon: 'favorite',
  desc: '감정을 억누르지 않고 있는 그대로 받아들이며 회복하는 시간',
  color: '#FF7BAC',
  chipBg: '#FFF0F5',
  heroImg: 'https://images.unsplash.com/photo-1474552226712-ac0f0961a954?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
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

const EFFECTS = [
  { icon: 'favorite', stat: '옥시토신 ↑', label: '유대감 호르몬 분비' },
  { icon: 'mood', stat: '감정 조절', label: '전두엽-편도체 균형' },
  { icon: 'volunteer_activism', stat: '공감 능력', label: '거울 뉴런 활성화' },
];

const ROUTINE = {
  totalTime: '약 20분',
  steps: [
    { title: '감정 이름 붙이기', time: '5분', desc: '지금 느끼는 감정을 정확한 단어로 표현하기. "우울하다" → "실망스럽고 외롭다"처럼 구체화' },
    { title: '감정 일기 쓰기', time: '10분', desc: '그 감정이 언제, 왜 생겼는지 판단 없이 서술. 잘 쓰려 하지 말고 그냥 쏟아내기' },
    { title: '자기 위로 한 마디', time: '5분', desc: '"지금 이 감정은 자연스러운 것이야"라고 자신에게 말하기. 친한 친구에게 하듯이' },
  ],
};

const TIP = {
  quote: '감정을 억누르면 몸이 대신 기억합니다',
  body: '표현되지 않은 감정은 근육 긴장, 소화 장애, 면역 저하로 나타납니다. 감정을 인식하고 이름 붙이는 것만으로도 뇌의 감정 반응이 40% 낮아진다는 연구가 있어요.',
  source: 'UCLA 신경과학 연구팀 감정 레이블링 연구',
};

function RestEmotional() {
  const navigate = useNavigate();
  const [companion, setCompanion] = useState('alone');
  const [method, setMethod] = useState('activity');
  const [selectedActivity, setSelectedActivity] = useState(null);
  const { activities, loading: activitiesLoading } = useRestActivities('emotional');

  const filteredPlaces = EMOTIONAL_PLACES.filter(
    p => p.companion.includes(companion) && p.method.includes(method)
  );

  return (
    <>
    <div className="min-h-screen bg-[#F7F7F8]">
      <UserNavbar />

      <div className="relative">
        <div className="relative h-60 overflow-hidden">
          <img src={TYPE.heroImg} alt={TYPE.name} className="w-full h-full object-cover" onError={(e) => { e.target.style.display = 'none'; }} />
          <div className="absolute bottom-0 left-0 right-0 px-8 pb-6" style={{ textShadow: '0 1px 6px rgba(0,0,0,0.8)' }}>
            <span className="inline-block text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full mb-2 bg-white/20 backdrop-blur-sm text-white/90">
              {TYPE.engName}
            </span>
            <h1 className="text-[28px] font-extrabold text-white tracking-tight">{TYPE.name}</h1>
            <p className="text-white/70 text-[13px] mt-0.5">{TYPE.desc}</p>
          </div>
        </div>

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

            {/* 효과 배지 */}
            <section className="mb-8">
              <div className="grid grid-cols-3 gap-3">
                {EFFECTS.map((e, i) => (
                  <div key={i} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 text-center">
                    <div className="w-10 h-10 rounded-full mx-auto mb-2 flex items-center justify-center" style={{ backgroundColor: TYPE.color + '15' }}>
                      <span className="material-icons text-lg" style={{ color: TYPE.color }}>{e.icon}</span>
                    </div>
                    <p className="text-[15px] font-extrabold text-slate-800">{e.stat}</p>
                    <p className="text-[10px] text-slate-400 mt-0.5 leading-tight">{e.label}</p>
                  </div>
                ))}
              </div>
            </section>

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
                    <div key={act.id} onClick={() => setSelectedActivity(act)}
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
                      <div className="mt-3 flex justify-end">
                        <button
                          onClick={(e) => { e.stopPropagation(); navigate('/rest-record', { state: { prefill: { restType: TYPE.key, activityName: act.activityName, duration: act.durationMinutes } } }); }}
                          className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-white text-[11px] font-bold hover:opacity-80 transition-opacity"
                          style={{ backgroundColor: TYPE.color }}
                        >
                          <span className="material-icons text-[13px]">edit_note</span>
                          기록
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>

            {/* 오늘의 루틴 */}
            <section className="mb-10">
              <h2 className="text-[17px] font-extrabold text-slate-800 mb-4">지금 바로 시작하는 루틴</h2>
              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                <div className="px-5 py-3 border-b border-slate-50 flex items-center gap-2" style={{ background: `linear-gradient(135deg, ${TYPE.color}12, ${TYPE.color}04)` }}>
                  <span className="material-icons text-base" style={{ color: TYPE.color }}>timer</span>
                  <span className="text-sm font-bold text-slate-600">총 소요시간 {ROUTINE.totalTime}</span>
                </div>
                <div className="p-5 space-y-1">
                  {ROUTINE.steps.map((step, i) => (
                    <div key={i} className="flex gap-4">
                      <div className="shrink-0 flex flex-col items-center">
                        <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-extrabold" style={{ backgroundColor: TYPE.color }}>
                          {i + 1}
                        </div>
                        {i < ROUTINE.steps.length - 1 && (
                          <div className="w-px h-full mt-1 mb-1 min-h-[24px]" style={{ backgroundColor: TYPE.color + '30' }} />
                        )}
                      </div>
                      <div className="pb-5 flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-bold text-slate-800 text-sm">{step.title}</h4>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0" style={{ backgroundColor: TYPE.color + '15', color: TYPE.color }}>{step.time}</span>
                        </div>
                        <p className="text-xs text-slate-500 leading-relaxed">{step.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
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
                    <a key={i}
                      href={`https://www.youtube.com/results?search_query=${encodeURIComponent(place.name + ' 힐링')}`}
                      target="_blank" rel="noopener noreferrer"
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
                        <span className="material-icons text-red-400 text-[20px]">play_circle</span>
                      </div>
                    </a>
                  ))}
                </div>
              )}

              <Link to="/map?restType=emotional"
                className="flex items-center justify-center gap-2 w-full mt-4 py-3.5 rounded-2xl border border-slate-200 bg-white text-sm font-bold text-slate-500 hover:border-pink-300 hover:text-pink-500 transition-all">
                <span className="material-icons text-base">map</span>
                지도에서 내 주변 정서 힐링 공간 찾기
              </Link>
            </section>

            {/* 전문가 팁 */}
            <section className="mb-10">
              <div className="rounded-2xl p-6 relative overflow-hidden" style={{ background: `linear-gradient(135deg, ${TYPE.color}14, ${TYPE.color}06)` }}>
                <span className="material-icons text-[64px] absolute top-2 right-3 opacity-[0.07]" style={{ color: TYPE.color }}>format_quote</span>
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-7 h-7 rounded-full flex items-center justify-center" style={{ backgroundColor: TYPE.color }}>
                    <span className="material-icons text-sm text-white">psychology</span>
                  </div>
                  <span className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">전문가 TIP</span>
                </div>
                <p className="text-[15px] font-bold text-slate-800 leading-relaxed mb-3">"{TIP.quote}"</p>
                <p className="text-xs text-slate-500 leading-relaxed">{TIP.body}</p>
                <p className="text-[11px] font-bold mt-3" style={{ color: TYPE.color }}>— {TIP.source}</p>
              </div>
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

    {selectedActivity && (
      <ActivityModal
        activity={selectedActivity}
        typeColor={TYPE.color}
        typeName={TYPE.key}
        onClose={() => setSelectedActivity(null)}
      />
    )}
    </>
  );
}

export default RestEmotional;
