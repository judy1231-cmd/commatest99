import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import UserNavbar from '../../components/user/UserNavbar';
import { useRestActivities } from '../../api/useRestActivities';
import ActivityModal from '../../components/user/ActivityModal';

const TYPE = {
  key: 'social',
  name: '사회적 휴식',
  engName: 'Social Rest',
  icon: 'groups',
  desc: '관계의 피로를 내려놓고 나에게 맞는 연결 방식으로 충전하는 시간',
  color: '#FF9A3C',
  chipBg: '#FFF4EB',
  heroImg: 'https://images.pexels.com/photos/1370295/pexels-photo-1370295.jpeg?auto=compress&cs=tinysrgb&w=800',
};

const SCALE_OPTIONS = [
  { key: 'solo',  label: '나홀로',  icon: 'person' },
  { key: 'duo',   label: '둘이서',  icon: 'people' },
  { key: 'group', label: '소그룹',  icon: 'groups' },
];

const VIBE_OPTIONS = [
  { key: 'quiet',  label: '조용히',    icon: 'volume_off' },
  { key: 'active', label: '활기차게',  icon: 'celebration' },
];

const SOCIAL_PLACES = [
  { name: '조용한 브런치 카페', location: '연남동·성수동', desc: '혼자 가도 어색하지 않은 분위기. 창가 자리에서 사람 구경', scale: ['solo'], vibe: ['quiet'], tags: ['브런치', '혼카페', '창가자리'], icon: 'local_cafe', gradient: 'from-violet-400 to-purple-500' },
  { name: '독립서점', location: '전국 동네 서점', desc: '취향 맞는 책 구경하다 점원과 짧게 대화. 가벼운 연결감', scale: ['solo'], vibe: ['quiet'], tags: ['서점', '취향', '혼자'], icon: 'menu_book', gradient: 'from-indigo-400 to-violet-500' },
  { name: '소규모 북클럽', location: '도서관·서점 프로그램', desc: '같은 책을 읽은 3~5명이 이야기 나누기. 깊은 연결', scale: ['group'], vibe: ['quiet'], tags: ['독서모임', '소그룹', '공감'], icon: 'groups', gradient: 'from-blue-400 to-indigo-500' },
  { name: '조용한 찻집 둘이서', location: '인사동·북촌', desc: '친한 한 명과 차 마시며 천천히 이야기', scale: ['duo'], vibe: ['quiet'], tags: ['찻집', '둘이서', '대화'], icon: 'emoji_food_beverage', gradient: 'from-amber-500 to-orange-500' },
  { name: '보드게임 카페', location: '홍대·강남·건대', desc: '2~6명이 신나게 게임. 웃음이 넘치는 사회적 휴식', scale: ['duo','group'], vibe: ['active'], tags: ['보드게임', '웃음', '경쟁'], icon: 'casino', gradient: 'from-sky-400 to-blue-500' },
  { name: '방탈출 카페', location: '전국 방탈출', desc: '2~4명 팀으로 협력. 몰입하다 보면 일상 스트레스 잊혀', scale: ['duo','group'], vibe: ['active'], tags: ['방탈출', '협력', '몰입'], icon: 'lock', gradient: 'from-red-400 to-rose-600' },
  { name: '취미 원데이클래스', location: '플리마켓·문화센터', desc: '낯선 사람들과 같은 것 만들기. 자연스러운 대화와 연결', scale: ['solo','group'], vibe: ['active'], tags: ['원데이클래스', '취미', '새로운 인연'], icon: 'brush', gradient: 'from-emerald-400 to-teal-500' },
  { name: '혼자 가기 좋은 재즈바', location: '이태원·홍대', desc: '바 카운터에 앉아 라이브 재즈 감상. 혼자지만 외롭지 않은 밤', scale: ['solo'], vibe: ['active'], tags: ['재즈바', '라이브', '분위기'], icon: 'music_note', gradient: 'from-orange-400 to-amber-500' },
];

const CHECKLIST = [
  '낯선 사람과의 짧은 대화가 유난히 버겁다.',
  '친한 친구의 연락에도 답장하기가 귀찮다.',
  '사람들이 많은 곳에 가면 숨이 막히는 기분이 든다.',
  '혼자 있고 싶으면서도 고립되는 것 같은 불안감이 든다.',
];

const EFFECTS = [
  { icon: 'battery_charging_full', stat: '에너지 ↑', label: '관계 에너지 회복' },
  { icon: 'handshake', stat: '연결감 ↑', label: '사회적 연결감 회복' },
  { icon: 'spa', stat: '경계 설정', label: '자기 보호 능력 향상' },
];

const ROUTINE = {
  totalTime: '약 30분',
  steps: [
    { title: '관계 에너지 점검', time: '5분', desc: '"지금 혼자 있고 싶다" vs "연결되고 싶다" 솔직하게 파악. 억지로 만날 필요 없어' },
    { title: '나에게 맞는 연결 선택', time: '20분', desc: '혼자라면: 카페에서 조용히. 함께라면: 편한 사람 1명과 짧게. 강요하지 않기' },
    { title: '오늘의 연결 돌아보기', time: '5분', desc: '오늘 대화 중 에너지가 올라간 순간, 내려간 순간 기억하기. 나에게 맞는 방식 파악' },
  ],
};

const TIP = {
  quote: '모든 인간관계가 에너지를 채워주는 건 아닙니다',
  body: '사회적 휴식은 혼자 있는 것이 아니라, 나에게 맞는 방식으로 연결하는 것입니다. 내향인은 혼자 있을 때, 외향인은 함께할 때 에너지가 채워져요. 자신의 유형을 이해하면 관계 피로가 줄어듭니다.',
  source: '사회심리학자 Adam Grant, 《Give and Take》',
};

function RestSocial() {
  const navigate = useNavigate();
  const [scale, setScale] = useState('solo');
  const [vibe, setVibe] = useState('quiet');
  const [selectedActivity, setSelectedActivity] = useState(null);
  const { activities, loading: activitiesLoading } = useRestActivities('social');

  const filteredPlaces = SOCIAL_PLACES.filter(
    p => p.scale.includes(scale) && p.vibe.includes(vibe)
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
              <p className="text-[11px] text-slate-400">관계 에너지 회복 · 연결감 충전 · 사회적 경계 설정</p>
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
                      className="group bg-white rounded-2xl border border-slate-100 shadow-sm p-5 cursor-pointer hover:shadow-md hover:border-orange-200 transition-all">
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
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">인원 규모</p>
                  <div className="flex gap-2">
                    {SCALE_OPTIONS.map(opt => (
                      <button key={opt.key} onClick={() => setScale(opt.key)}
                        className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full border-2 text-xs font-bold transition-all"
                        style={scale === opt.key
                          ? { backgroundColor: TYPE.color, borderColor: TYPE.color, color: '#fff' }
                          : { backgroundColor: '#f8fafc', borderColor: '#e2e8f0', color: '#64748b' }}>
                        <span className="material-icons text-xs">{opt.icon}</span>{opt.label}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="w-px bg-slate-100 self-stretch" />
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">분위기</p>
                  <div className="flex gap-2">
                    {VIBE_OPTIONS.map(opt => (
                      <button key={opt.key} onClick={() => setVibe(opt.key)}
                        className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full border-2 text-xs font-bold transition-all"
                        style={vibe === opt.key
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
                      className="group bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden flex cursor-pointer hover:shadow-md hover:border-orange-200 transition-all">
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

              <Link to="/map?restType=social"
                className="flex items-center justify-center gap-2 w-full mt-4 py-3.5 rounded-2xl border border-slate-200 bg-white text-sm font-bold text-slate-500 hover:border-orange-300 hover:text-orange-500 transition-all">
                <span className="material-icons text-base">map</span>
                지도에서 내 주변 사회적 휴식 공간 찾기
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
                    <h3 className="font-extrabold text-slate-800 text-sm">사회적 휴식이 필요한 신호</h3>
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
                  <p className="text-xs text-slate-400">※ 2개 이상 해당된다면 오늘은 사회적 휴식이 필요합니다.</p>
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

export default RestSocial;
