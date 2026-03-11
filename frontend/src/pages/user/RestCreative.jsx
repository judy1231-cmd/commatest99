import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import UserNavbar from '../../components/user/UserNavbar';
import { useRestActivities } from '../../api/useRestActivities';

const TYPE = {
  key: 'creative',
  name: '창조적 몰입',
  engName: 'Creative Rest',
  icon: 'brush',
  desc: '만들고 표현하는 행위 자체로 에너지를 회복하는 시간',
  color: '#FFB830',
  chipBg: '#FFFBEB',
  heroImg: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBUTpqDR5c82O_ETRkCkEZnONo1I_8NlxQImaVwRW2vGQn9a_zDeC1M0BvqsWxrOtC2m7Qa6X9pAV7jJAgOSRBHfB0d2phiYrkIXtydr_DiRzcgX5EIKKrInQQ67PaROHqdrYBFjQAi0JXz4wgYcsMIwQ8nxhzJYeiLwRzsl_Dn9s1WVS_ciP-uIst_PjZ753WCXL7LQ_paTHfhki2ZPeS3bt9VBEc1ks2nutTjkqCwpYOiA9-eO_KCaUMCvuxnFQEebn8PX73rONE',
};

const FIELD_OPTIONS = [
  { key: 'art',   label: '미술·드로잉', icon: 'palette' },
  { key: 'music', label: '음악',        icon: 'music_note' },
  { key: 'write', label: '글쓰기',      icon: 'edit_note' },
  { key: 'cook',  label: '요리·베이킹', icon: 'restaurant' },
  { key: 'craft', label: '공예·DIY',    icon: 'texture' },
];

const TIME_OPTIONS = [
  { key: 'short',  label: '30분',   icon: 'bolt' },
  { key: 'medium', label: '1시간',  icon: 'schedule' },
  { key: 'long',   label: '반나절', icon: 'wb_sunny' },
];

const CREATIVE_PLACES = [
  { name: '드로잉 유튜브 따라하기', location: '집에서', desc: '준비물: 스케치북과 연필 하나. 30분이면 한 장 완성', field: ['art'], time: ['short','medium'], tags: ['드로잉', '무료', '집에서'], icon: 'brush', gradient: 'from-orange-400 to-amber-500' },
  { name: '수채화 원데이클래스', location: '홍대·성수동', desc: '강사와 함께 2시간. 완성작을 집에 가져갈 수 있어', field: ['art'], time: ['long'], tags: ['수채화', '원데이', '초보가능'], icon: 'palette', gradient: 'from-pink-400 to-rose-500' },
  { name: '피아노 연습 (유튜브)', location: '집에서', desc: '악보 없이 코드만으로 팝송 배우기. 30분도 충분', field: ['music'], time: ['short','medium'], tags: ['피아노', '유튜브', '혼자'], icon: 'piano', gradient: 'from-indigo-400 to-violet-500' },
  { name: '재즈바 라이브 감상', location: '이태원·홍대', desc: '연주를 들으며 영감 충전. 악기 없이도 음악적 충전 가능', field: ['music'], time: ['medium','long'], tags: ['재즈', '라이브', '분위기'], icon: 'music_note', gradient: 'from-violet-400 to-purple-600' },
  { name: '에세이 쓰기 (메모앱)', location: '카페·집 어디서든', desc: '오늘 하루 인상적인 장면 하나 200자로 써보기', field: ['write'], time: ['short'], tags: ['에세이', '200자', '즉시가능'], icon: 'edit', gradient: 'from-cyan-400 to-sky-500' },
  { name: '북카페에서 독서+글쓰기', location: '동네 북카페', desc: '책 읽고 느낀 점 노트에 쓰기. 생각이 정리되는 느낌', field: ['write'], time: ['long'], tags: ['북카페', '독서', '글쓰기'], icon: 'menu_book', gradient: 'from-teal-400 to-cyan-500' },
  { name: '간단한 집밥 요리', location: '집에서', desc: '레시피 보며 파스타·볶음밥 도전. 만들고 먹으면 행복', field: ['cook'], time: ['medium'], tags: ['집밥', '파스타', '성취감'], icon: 'restaurant', gradient: 'from-emerald-400 to-green-500' },
  { name: '베이킹 클래스', location: '동네 베이킹 스튜디오', desc: '마카롱·쿠키·케이크 만들기. 달콤한 결과물이 기다려', field: ['cook'], time: ['long'], tags: ['베이킹', '마카롱', '선물용'], icon: 'cake', gradient: 'from-rose-400 to-pink-500' },
  { name: '도자기 공방 체험', location: '성수동·이태원', desc: '흙을 손으로 빚는 촉각적 집중. 완성된 작품은 소유 가능', field: ['craft'], time: ['long'], tags: ['도자기', '공방', '촉각'], icon: 'water_drop', gradient: 'from-amber-600 to-orange-600' },
  { name: '뜨개질·자수 입문', location: '집에서·공방', desc: '바늘 잡는 법부터 유튜브로. 반복 동작이 명상처럼 작용', field: ['craft'], time: ['medium','long'], tags: ['뜨개질', '자수', '집중'], icon: 'texture', gradient: 'from-purple-400 to-violet-500' },
];

const CHECKLIST = [
  '새로운 아이디어가 전혀 떠오르지 않는다.',
  '반복되는 일상이 견디기 힘들 만큼 지루하다.',
  '아름다운 것을 봐도 무감각하고 건조하다.',
  '작업에 대한 성취감보다 의무감이 더 크다.',
];

function RestCreative() {
  const navigate = useNavigate();
  const [field, setField] = useState('art');
  const [timeOpt, setTimeOpt] = useState('short');
  const { activities, loading: activitiesLoading } = useRestActivities('creative');

  const filteredPlaces = CREATIVE_PLACES.filter(
    p => p.field.includes(field) && p.time.includes(timeOpt)
  );

  return (
    <div className="min-h-screen bg-[#F7F7F8]">
      <UserNavbar />

      {/* 히어로 */}
      <div className="relative">
        <div className="relative h-60 overflow-hidden">
          <img src={TYPE.heroImg} alt={TYPE.name} className="w-full h-full object-cover" />
          {/* 골드/앰버 계열 브랜드 오버레이 */}
          <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(120,53,15,0.78) 0%, rgba(251,191,36,0.28) 60%, rgba(0,0,0,0.05) 100%)' }} />
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
              <p className="text-[11px] text-slate-400">창의력 회복 · 몰입 경험 · 표현을 통한 치유</p>
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
                      className="group bg-white rounded-2xl border border-slate-100 shadow-sm p-5 cursor-pointer hover:shadow-md hover:border-amber-200 transition-all">
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
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">창작 분야</p>
                  <div className="flex gap-2 flex-wrap">
                    {FIELD_OPTIONS.map(opt => (
                      <button key={opt.key} onClick={() => setField(opt.key)}
                        className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full border-2 text-xs font-bold transition-all"
                        style={field === opt.key
                          ? { backgroundColor: TYPE.color, borderColor: TYPE.color, color: '#fff' }
                          : { backgroundColor: '#f8fafc', borderColor: '#e2e8f0', color: '#64748b' }}>
                        <span className="material-icons text-xs">{opt.icon}</span>{opt.label}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="w-px bg-slate-100 self-stretch" />
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">가능한 시간</p>
                  <div className="flex gap-2">
                    {TIME_OPTIONS.map(opt => (
                      <button key={opt.key} onClick={() => setTimeOpt(opt.key)}
                        className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full border-2 text-xs font-bold transition-all"
                        style={timeOpt === opt.key
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
                      className="group bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden flex cursor-pointer hover:shadow-md hover:border-amber-200 transition-all">
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

              <Link to="/map?restType=creative"
                className="flex items-center justify-center gap-2 w-full mt-4 py-3.5 rounded-2xl border border-slate-200 bg-white text-sm font-bold text-slate-500 hover:border-amber-300 hover:text-amber-600 transition-all">
                <span className="material-icons text-base">map</span>
                지도에서 내 주변 창작 공간 찾기
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
                    <h3 className="font-extrabold text-slate-800 text-sm">창조적 고갈 신호 체크</h3>
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
                  <p className="text-xs text-slate-400">※ 2개 이상 해당된다면 오늘은 창조적 몰입이 필요합니다.</p>
                </div>
              </div>
            </section>

          </main>
        </div>
      </div>
    </div>
  );
}

export default RestCreative;
