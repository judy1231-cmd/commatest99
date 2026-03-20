import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import UserNavbar from '../../components/user/UserNavbar';
import { useRestActivities } from '../../api/useRestActivities';
import ActivityModal from '../../components/user/ActivityModal';

const TYPE = {
  key: 'sensory',
  name: '감각의 정화',
  engName: 'Sensory Rest',
  icon: 'visibility_off',
  desc: '과부하된 오감을 내려놓고, 감각의 고요함 속에서 회복하는 시간',
  color: '#9B6DFF',
  chipBg: '#F5F0FF',
  heroImg: 'https://images.pexels.com/photos/6724539/pexels-photo-6724539.jpeg?auto=compress&cs=tinysrgb&w=800',
};

const SENSE_OPTIONS = [
  { key: 'sound',  label: '청각', icon: 'headphones',    desc: '소리로 감각을 쉬게 하기' },
  { key: 'visual', label: '시각', icon: 'remove_red_eye', desc: '눈의 피로를 풀어주기' },
  { key: 'touch',  label: '촉각', icon: 'pan_tool',       desc: '몸의 긴장 녹이기' },
  { key: 'smell',  label: '후각', icon: 'spa',            desc: '향으로 마음 안정시키기' },
];

const TIME_OPTIONS = [
  { key: 'day',     label: '낮',  icon: 'wb_sunny' },
  { key: 'evening', label: '저녁', icon: 'wb_twilight' },
  { key: 'night',   label: '밤',  icon: 'nightlight' },
];

const SENSORY_PLACES = [
  { name: 'ASMR 유튜브 (빗소리·숲소리)', location: '집에서', desc: '귀를 편안하게 감싸는 자연음. 백색소음으로 집중력도 회복', sense: ['sound'], time: ['day','evening','night'], tags: ['ASMR', '무료', '즉시가능'], icon: 'headphones', gradient: 'from-amber-400 to-yellow-500' },
  { name: '클래식 음악 카페', location: '인사동·홍대', desc: '라이브 또는 고음질 클래식이 흐르는 공간. 말 없이 앉아있어도 OK', sense: ['sound'], time: ['day','evening'], tags: ['클래식', '조용한카페', '힐링'], icon: 'music_note', gradient: 'from-orange-400 to-amber-500' },
  { name: '국립현대미술관', location: '서울 종로구·과천', desc: '눈이 쉬는 예술 감상. 형태와 색채에 집중하며 잡념 내려놓기', sense: ['visual'], time: ['day'], tags: ['미술관', '무료입장일', '조용함'], icon: 'palette', gradient: 'from-violet-400 to-purple-500' },
  { name: '플라네타리움 (별자리관)', location: '서울 어린이대공원·노원', desc: '어두운 돔 안에서 별을 바라보며 시각 이완', sense: ['visual'], time: ['evening','night'], tags: ['별자리', '힐링', '어두운공간'], icon: 'stars', gradient: 'from-indigo-400 to-violet-600' },
  { name: '아로마 테라피샵', location: '가로수길·이태원', desc: '라벤더·유칼립투스·베르가못 직접 맡아보고 나에게 맞는 향 찾기', sense: ['smell'], time: ['day','evening'], tags: ['아로마', '향수', '체험'], icon: 'local_florist', gradient: 'from-pink-400 to-rose-500' },
  { name: '향초 DIY 클래스', location: '성수동·합정', desc: '나만의 향 블렌딩 후 캔들 제작. 만드는 과정 자체가 힐링', sense: ['smell'], time: ['day','evening'], tags: ['향초', '원데이클래스', '선물용'], icon: 'local_fire_department', gradient: 'from-rose-400 to-orange-400' },
  { name: '스파·찜질방', location: '전국 스파시설', desc: '온탕·냉탕 교대로 피부 감각 자극. 가성비 최고 촉각 힐링', sense: ['touch'], time: ['day','evening','night'], tags: ['찜질방', '저렴', '촉각'], icon: 'hot_tub', gradient: 'from-cyan-400 to-sky-500' },
  { name: '마사지샵 (발마사지)', location: '동네 마사지샵', desc: '발바닥 반사구 자극 30분. 피로 집중 해소', sense: ['touch'], time: ['evening','night'], tags: ['마사지', '발관리', '피로회복'], icon: 'self_improvement', gradient: 'from-teal-400 to-cyan-500' },
];

const CHECKLIST = [
  '스마트폰 화면을 보면 눈이 쉽게 피로해진다.',
  '시끄러운 공간에서 극도로 예민해진다.',
  '냄새나 밝은 빛에 과도하게 반응한다.',
  '온몸의 감각이 무뎌지고 둔해진 느낌이다.',
  '자연의 소리나 조용한 공간이 몹시 그립다.',
];

const EFFECTS = [
  { icon: 'devices_off', stat: '디지털 ↓', label: '스크린 피로 해소' },
  { icon: 'sensors', stat: '신경계 ↑', label: '자율신경 균형 회복' },
  { icon: 'hearing', stat: '감각 회복', label: '감각 민감도 정상화' },
];

const ROUTINE = {
  totalTime: '약 30분',
  steps: [
    { title: '감각 차단 시작', time: '3분', desc: '눈을 감거나 귀마개 착용. 한 가지 감각을 일시적으로 차단해 나머지 감각 회복' },
    { title: '자연 소리 집중 듣기', time: '15분', desc: '빗소리, 파도, 숲 소리 재생. 자연음은 뇌파를 알파파 상태로 전환시켜줘' },
    { title: '감각 천천히 열기', time: '10분', desc: '주변 소리에 하나씩 집중하기. 일부러 찾지 않고 자연스럽게 들어오는 소리만' },
  ],
};

const TIP = {
  quote: '디지털 자극이 많을수록 실제 감각은 무뎌집니다',
  body: '현대인은 하루 평균 7시간 스크린을 봅니다. 이는 시각 피로뿐 아니라 감각 전반의 과부하를 일으켜요. 하루 30분만 스크린 없이 보내도 신경계 회복에 큰 도움이 됩니다.',
  source: '디지털 웰빙 연구소 (2024)',
};

function RestSensory() {
  const navigate = useNavigate();
  const [sense, setSense] = useState('sound');
  const [timeOfDay, setTimeOfDay] = useState('day');
  const [selectedActivity, setSelectedActivity] = useState(null);
  const { activities, loading: activitiesLoading } = useRestActivities('sensory');

  const filteredPlaces = SENSORY_PLACES.filter(
    p => p.sense.includes(sense) && p.time.includes(timeOfDay)
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
              <p className="text-[11px] text-slate-400">신경계 안정 · 오감 회복 · 디지털 디톡스</p>
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
                      className="group bg-white rounded-2xl border border-slate-100 shadow-sm p-5 cursor-pointer hover:shadow-md hover:border-violet-200 transition-all">
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
              <h2 className="text-[17px] font-extrabold text-slate-800 mb-4">지금 어떤 감각을 쉬게 하고 싶어요?</h2>

              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 mb-5 flex flex-wrap gap-6">
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">감각 유형</p>
                  <div className="flex gap-2 flex-wrap">
                    {SENSE_OPTIONS.map(opt => (
                      <button key={opt.key} onClick={() => setSense(opt.key)}
                        className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full border-2 text-xs font-bold transition-all"
                        style={sense === opt.key
                          ? { backgroundColor: TYPE.color, borderColor: TYPE.color, color: '#fff' }
                          : { backgroundColor: '#f8fafc', borderColor: '#e2e8f0', color: '#64748b' }}>
                        <span className="material-icons text-xs">{opt.icon}</span>{opt.label}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="w-px bg-slate-100 self-stretch" />
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">지금 시간대</p>
                  <div className="flex gap-2">
                    {TIME_OPTIONS.map(opt => (
                      <button key={opt.key} onClick={() => setTimeOfDay(opt.key)}
                        className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full border-2 text-xs font-bold transition-all"
                        style={timeOfDay === opt.key
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
                      className="group bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden flex cursor-pointer hover:shadow-md hover:border-violet-200 transition-all">
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

              <Link to="/map?restType=sensory"
                className="flex items-center justify-center gap-2 w-full mt-4 py-3.5 rounded-2xl border border-slate-200 bg-white text-sm font-bold text-slate-500 hover:border-violet-300 hover:text-violet-600 transition-all">
                <span className="material-icons text-base">map</span>
                지도에서 내 주변 감각 힐링 공간 찾기
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
                    <h3 className="font-extrabold text-slate-800 text-sm">감각 과부하 신호 체크</h3>
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
                  <p className="text-xs text-slate-400">※ 3개 이상 해당된다면 오늘은 감각의 정화가 필요합니다.</p>
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

export default RestSensory;
