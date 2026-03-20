import { useState, useEffect } from 'react';
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
  const [selectedActivity, setSelectedActivity] = useState(null);
  const { activities, loading: activitiesLoading } = useRestActivities('emotional');

  const [nearbyPlaces, setNearbyPlaces] = useState([]);
  const [nearbyLoading, setNearbyLoading] = useState(false);

  useEffect(() => {
    setNearbyLoading(true);
    fetch(`/api/places?restType=${TYPE.key}&size=6`)
      .then(r => r.json())
      .then(data => {
        if (data.success && data.data?.places) setNearbyPlaces(data.data.places);
      })
      .catch(() => {})
      .finally(() => setNearbyLoading(false));
  }, []);

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

            {/* 추천 활동 */}
            <section className="mb-10">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-[17px] font-extrabold text-slate-800">지금 바로 해봐요</h2>
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

            {/* 더 찾아보기 */}
            <section className="mb-10">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-[17px] font-extrabold text-slate-800">더 찾아보기</h2>
                <span className="text-xs text-slate-400">조건에 맞게 직접 골라봐요</span>
              </div>

              {nearbyLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[1,2].map(i => <div key={i} className="bg-white rounded-2xl border border-slate-100 p-5 animate-pulse h-24" />)}
                </div>
              ) : nearbyPlaces.length === 0 ? (
                <div className="bg-white rounded-2xl border border-slate-100 p-10 text-center">
                  <span className="material-icons text-4xl text-slate-200 block mb-2">location_off</span>
                  <p className="text-slate-400 text-sm font-medium">장소 데이터를 준비 중이에요</p>
                  <p className="text-slate-300 text-xs mt-1">지도에서 직접 탐색해보세요</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {nearbyPlaces.map((place) => (
                    <div key={place.id}
                      onClick={() => navigate('/map', { state: { restType: TYPE.key, highlightPlace: { placeId: place.id, name: place.name, location: place.address } } })}
                      className="group bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden flex cursor-pointer hover:shadow-md hover:border-pink-200 transition-all">
                      <div className="w-16 shrink-0 flex items-center justify-center" style={{ background: `linear-gradient(135deg, ${TYPE.color}CC, ${TYPE.color}88)` }}>
                        <span className="material-icons text-2xl text-white/90">{TYPE.icon}</span>
                      </div>
                      <div className="flex-1 min-w-0 p-4">
                        <h4 className="font-bold text-slate-800 text-sm">{place.name}</h4>
                        <div className="flex items-center gap-1 mt-0.5 mb-2">
                          <span className="material-icons text-[11px] text-slate-300">location_on</span>
                          <p className="text-[11px] text-slate-400 truncate">{place.address}</p>
                        </div>
                        {place.operatingHours && (
                          <p className="text-xs text-slate-400 flex items-center gap-1">
                            <span className="material-icons text-[11px]">schedule</span>
                            {place.operatingHours}
                          </p>
                        )}
                        {place.aiScore && (
                          <div className="flex items-center gap-0.5 mt-1">
                            <span className="material-icons text-amber-400 text-xs">star</span>
                            <span className="text-xs font-bold text-slate-600">{Number(place.aiScore).toFixed(1)}</span>
                          </div>
                        )}
                      </div>
                      <div className="flex items-center pr-3 opacity-0 group-hover:opacity-100 transition-opacity">
                        <span className="material-icons text-slate-300">chevron_right</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <Link to="/map"
                state={{ restType: TYPE.key }}
                className="flex items-center justify-center gap-2 w-full mt-4 py-3.5 rounded-2xl border border-slate-200 bg-white text-sm font-bold text-slate-500 hover:border-pink-300 hover:text-pink-500 transition-all">
                <span className="material-icons text-base">map</span>
                지도에서 더 보기
              </Link>
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
