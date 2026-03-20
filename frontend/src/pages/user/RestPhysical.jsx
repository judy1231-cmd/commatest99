import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import UserNavbar from '../../components/user/UserNavbar';
import { useRestActivities } from '../../api/useRestActivities';

const TYPE = {
  key: 'physical',
  name: '신체의 이완',
  engName: 'Body Rest',
  icon: 'fitness_center',
  desc: '쌓인 근육 긴장을 풀고 몸이 보내는 신호에 귀 기울이는 시간',
  color: '#4CAF82',
  heroImg: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
};

const INTENSITY_OPTIONS = [
  { key: 'light',  label: '가볍게', icon: 'self_improvement' },
  { key: 'medium', label: '보통',   icon: 'directions_bike' },
  { key: 'hard',   label: '강하게', icon: 'sports_mma' },
];

const PLACE_TYPE_OPTIONS = [
  { key: 'indoor',  label: '실내', icon: 'domain' },
  { key: 'outdoor', label: '실외', icon: 'park' },
  { key: 'home',    label: '홈트', icon: 'home' },
];

const EXERCISE_PLACES = [
  { name: '스트레칭 루틴 (유튜브)', location: '집에서', desc: '10~15분 전신 스트레칭. 코어힐링TV, 하루10분 채널 추천', intensity: ['light'], type: ['home'], tags: ['무료', '유튜브', '즉시가능'], icon: 'play_circle', gradient: 'from-orange-400 to-rose-400' },
  { name: '요가원 (동네)', location: '가까운 요가원', desc: '초보반 60분. 몸의 긴장을 천천히 풀어주는 회복 요가', intensity: ['light', 'medium'], type: ['indoor'], tags: ['요가', '60분', '예약'], icon: 'self_improvement', gradient: 'from-pink-400 to-purple-500' },
  { name: '실내 수영장', location: '구청·주민센터 수영장', desc: '저강도 자유형 30분. 관절 부담 없이 전신 운동', intensity: ['medium'], type: ['indoor'], tags: ['수영', '관절부담없음', '저렴'], icon: 'pool', gradient: 'from-sky-400 to-blue-500' },
  { name: '필라테스 스튜디오', location: '동네 필라테스', desc: '소도구 필라테스 50분. 코어와 자세 교정에 효과적', intensity: ['light', 'medium'], type: ['indoor'], tags: ['필라테스', '소그룹', '자세교정'], icon: 'accessibility_new', gradient: 'from-fuchsia-400 to-pink-500' },
  { name: '한강 자전거길', location: '서울 한강변', desc: '한강 자전거 대여 후 왕복 10~20km. 바람 맞으며 유산소', intensity: ['medium'], type: ['outdoor'], tags: ['자전거', '한강', '대여가능'], icon: 'directions_bike', gradient: 'from-emerald-400 to-teal-500' },
  { name: '클라이밍 짐', location: '홍대·신촌·강남', desc: '볼더링 입문 2시간. 문제 풀 듯 집중하며 전신 운동', intensity: ['hard'], type: ['indoor'], tags: ['클라이밍', '집중력', '초보가능'], icon: 'sports_gymnastics', gradient: 'from-violet-400 to-purple-600' },
  { name: '크로스핏 박스', location: '동네 크로스핏', desc: '고강도 기능성 운동 1시간. 땀 흠뻑 흘리고 싶을 때', intensity: ['hard'], type: ['indoor'], tags: ['고강도', '땀', '동기부여'], icon: 'fitness_center', gradient: 'from-red-400 to-rose-600' },
  { name: '공원 인터벌 러닝', location: '올림픽공원·한강공원', desc: '달리기 20분+걷기 10분 반복. 유산소 최대 효율', intensity: ['hard'], type: ['outdoor'], tags: ['러닝', '인터벌', '무료'], icon: 'directions_run', gradient: 'from-amber-400 to-orange-500' },
  { name: '홈 웨이트 (유튜브)', location: '집에서', desc: '맨몸 웨이트 30분. 덤벨 없어도 충분한 자극', intensity: ['medium', 'hard'], type: ['home'], tags: ['홈트', '맨몸운동', '무료'], icon: 'sports_mma', gradient: 'from-slate-500 to-slate-700' },
];

const CHECKLIST = [
  '어깨와 목이 항상 뭉쳐있다.',
  '잠을 자도 피로가 풀리지 않는다.',
  '만성적인 두통이나 눈의 피로가 있다.',
  '온몸에 힘이 없고 무거운 느낌이 든다.',
  '소화가 잘 안 되거나 속이 불편하다.',
  '집중하기 어렵고 몸이 늘 긴장되어 있다.',
];

const EFFECTS = [
  { icon: 'monitor_heart', stat: '28% ↓', label: '스트레스 호르몬 감소' },
  { icon: 'bedtime', stat: '수면 질 ↑', label: '깊은 수면 시간 증가' },
  { icon: 'shield', stat: '면역력 ↑', label: '자연살해세포 활성화' },
];

const ROUTINE = {
  totalTime: '약 45분',
  steps: [
    { title: '5분 전신 스트레칭', time: '5분', desc: '목→어깨→허리→다리 순서로 천천히. 숨을 내쉬며 근육 이완' },
    { title: '유산소 운동', time: '30분', desc: '걷기, 자전거, 수영 중 하나 선택. 대화할 수 있는 강도 유지' },
    { title: '쿨다운 + 수분 보충', time: '10분', desc: '천천히 걸으며 심박수 회복. 운동 직후 상온 물 500ml 섭취' },
  ],
};

const TIP = {
  quote: '몸을 움직이는 것만으로도 뇌에서 엔도르핀이 분비됩니다',
  body: '하버드 의과대학 연구에 따르면 주 3회 30분 이상의 유산소 운동은 우울증 치료제와 유사한 효과를 보입니다. 처음에는 10분 걷기로 시작해도 충분해요.',
  source: '하버드 의과대학 운동과 뇌 건강 연구 (2023)',
};

function RestPhysical() {
  const navigate = useNavigate();
  const [intensity, setIntensity] = useState('light');
  const [placeType, setPlaceType] = useState('indoor');
  const { activities, loading: activitiesLoading } = useRestActivities('physical');

  const filteredPlaces = EXERCISE_PLACES.filter(
    p => p.intensity.includes(intensity) && p.type.includes(placeType)
  );

  return (
    <div className="min-h-screen bg-[#F7F7F8]">
      <UserNavbar />

      <div className="relative">
        <div className="relative h-60 overflow-hidden">
          <img src={TYPE.heroImg} alt={TYPE.name} className="w-full h-full object-cover" onError={(e) => { e.target.style.display = 'none'; }} />
          <div className="absolute bottom-0 left-0 right-0 px-8 pb-6" style={{ textShadow: '0 1px 6px rgba(0,0,0,0.8)' }}>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full bg-white/20 backdrop-blur-sm text-white/90">
                {TYPE.engName}
              </span>
            </div>
            <h1 className="text-[28px] font-extrabold text-white tracking-tight">{TYPE.name}</h1>
            <p className="text-white/70 text-[13px] mt-0.5">{TYPE.desc}</p>
          </div>
        </div>

        <div className="relative -mt-5 bg-[#F7F7F8] rounded-t-3xl pt-6 px-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-9 h-9 rounded-full flex items-center justify-center" style={{ backgroundColor: '#F0FAF5' }}>
              <span className="material-icons text-[18px]" style={{ color: TYPE.color }}>{TYPE.icon}</span>
            </div>
            <div>
              <p className="text-[13px] font-extrabold" style={{ color: TYPE.color }}>{TYPE.name}</p>
              <p className="text-[11px] text-slate-400">신체 긴장 완화 · 순환 개선 · 면역 강화</p>
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
                    <div key={act.id} onClick={() => navigate('/rest-record')}
                      className="group bg-white rounded-2xl border border-slate-100 shadow-sm p-5 cursor-pointer hover:shadow-md hover:border-green-200 transition-all">
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
              <h2 className="text-[17px] font-extrabold text-slate-800 mb-4">오늘 어떤 운동을 할까요?</h2>

              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 mb-5 flex flex-wrap gap-6">
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">강도</p>
                  <div className="flex gap-2">
                    {INTENSITY_OPTIONS.map(opt => (
                      <button key={opt.key} onClick={() => setIntensity(opt.key)}
                        className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full border-2 text-xs font-bold transition-all"
                        style={intensity === opt.key
                          ? { backgroundColor: TYPE.color, borderColor: TYPE.color, color: '#fff' }
                          : { backgroundColor: '#f8fafc', borderColor: '#e2e8f0', color: '#64748b' }}>
                        <span className="material-icons text-xs">{opt.icon}</span>{opt.label}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="w-px bg-slate-100 self-stretch" />
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">장소</p>
                  <div className="flex gap-2">
                    {PLACE_TYPE_OPTIONS.map(opt => (
                      <button key={opt.key} onClick={() => setPlaceType(opt.key)}
                        className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full border-2 text-xs font-bold transition-all"
                        style={placeType === opt.key
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
                  <p className="text-slate-400 text-sm font-medium">이 조건에 맞는 활동을 준비 중이에요</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {filteredPlaces.map((place, i) => (
                    <div key={i} onClick={() => navigate('/rest-record')}
                      className="group bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden flex cursor-pointer hover:shadow-md hover:border-green-200 transition-all">
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

              <Link to="/map?restType=physical"
                className="flex items-center justify-center gap-2 w-full mt-4 py-3.5 rounded-2xl border border-slate-200 bg-white text-sm font-bold text-slate-500 hover:border-green-300 hover:text-green-600 transition-all">
                <span className="material-icons text-base">map</span>
                지도에서 내 주변 운동 시설 찾기
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
                    <h3 className="font-extrabold text-slate-800 text-sm">신체적 휴식이 필요한 신호</h3>
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
                  <p className="text-xs text-slate-400">※ 3개 이상 해당된다면 오늘은 신체의 이완에 집중하세요.</p>
                </div>
              </div>
            </section>

          </main>
        </div>
      </div>
    </div>
  );
}

export default RestPhysical;
