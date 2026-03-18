import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import UserNavbar from '../../components/user/UserNavbar';
import { useRestActivities } from '../../api/useRestActivities';

const TYPE = {
  key: 'mental',
  name: '정신적 고요',
  engName: 'Mental Calm',
  icon: 'spa',
  desc: '생각의 소음을 잠재우고 내면의 평정심을 되찾는 시간',
  color: '#5B8DEF',
  chipBg: '#F0F5FF',
  heroImg: 'https://images.pexels.com/photos/3560044/pexels-photo-3560044.jpeg?auto=compress&cs=tinysrgb&w=800',
};

const TIME_OPTIONS = [
  { key: 'short',  label: '10분',   icon: 'bolt' },
  { key: 'medium', label: '30분',   icon: 'nightlight' },
  { key: 'long',   label: '1시간+', icon: 'star' },
];

const WITH_OPTIONS = [
  { key: 'alone',  label: '혼자',       icon: 'person' },
  { key: 'space',  label: '조용한 공간', icon: 'domain' },
  { key: 'guided', label: '안내 받기',   icon: 'headphones' },
];

const MENTAL_PLACES = [
  { name: '마음챙김 호흡 (5분)', location: '어디서든', desc: '4-7-8 호흡법. 들숨 4초, 멈춤 7초, 날숨 8초 × 4회', time: ['short'], with: ['alone'], tags: ['즉시가능', '호흡', '무료'], icon: 'air', gradient: 'from-teal-400 to-cyan-500' },
  { name: '저널링 (10분)', location: '집·카페 어디서든', desc: '지금 머릿속에 있는 것 모두 종이에 쓰기. 판단 없이', time: ['short', 'medium'], with: ['alone'], tags: ['글쓰기', '감정정리', '무료'], icon: 'edit_note', gradient: 'from-emerald-400 to-teal-500' },
  { name: '국립중앙도서관', location: '서울 서초구', desc: '완벽한 고요함. 책을 읽지 않아도 앉아있는 것만으로도 회복', time: ['medium', 'long'], with: ['space'], tags: ['도서관', '무료', '고요함'], icon: 'local_library', gradient: 'from-sky-400 to-blue-500' },
  { name: '교보문고 광화문', location: '서울 종로구', desc: '책향기 가득한 공간에서 어슬렁거리기. 사야 한다는 부담 없이', time: ['medium'], with: ['space', 'alone'], tags: ['서점', '책', '자유로움'], icon: 'menu_book', gradient: 'from-violet-400 to-purple-500' },
  { name: '명상 앱 (코끼리·마보)', location: '집·어디서든', desc: '가이드 명상 10~20분. 초보도 바로 시작 가능', time: ['short', 'medium'], with: ['guided'], tags: ['앱', '가이드명상', '무료체험'], icon: 'self_improvement', gradient: 'from-indigo-400 to-blue-500' },
  { name: '사찰 템플스테이', location: '전국 사찰', desc: '1박 2일 또는 당일형. 예불·참선·공양 체험', time: ['long'], with: ['guided', 'space'], tags: ['템플스테이', '사찰', '1박2일'], icon: 'temple_buddhist', gradient: 'from-amber-500 to-orange-600' },
  { name: '조용한 전통찻집', location: '인사동·북촌', desc: '차 한 잔 마시며 아무것도 안 하는 시간. 스마트폰은 내려두기', time: ['medium'], with: ['alone', 'space'], tags: ['전통차', '고요함', '인사동'], icon: 'local_cafe', gradient: 'from-stone-400 to-amber-500' },
  { name: '명상 스튜디오', location: '강남·마포·홍대', desc: '전문 명상 지도사가 이끄는 50분 집중 프로그램', time: ['long'], with: ['guided'], tags: ['전문명상', '예약', '프리미엄'], icon: 'spa', gradient: 'from-blue-400 to-indigo-600' },
];

const CHECKLIST = [
  '생각이 너무 많아 멈출 수가 없다.',
  '한 가지 일에 집중하기 어렵다.',
  '아무것도 아닌 일에 결정을 내리기 힘들다.',
  '머릿속이 항상 시끄럽고 지쳐있다.',
];

function RestMental() {
  const navigate = useNavigate();
  const [timeOpt, setTimeOpt] = useState('short');
  const [withOpt, setWithOpt] = useState('alone');
  const { activities, loading: activitiesLoading } = useRestActivities('mental');

  const filteredPlaces = MENTAL_PLACES.filter(
    p => p.time.includes(timeOpt) && p.with.includes(withOpt)
  );

  return (
    <div className="min-h-screen bg-[#F7F7F8]">
      <UserNavbar />

      {/* 히어로 */}
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

        {/* 브릿지 */}
        <div className="relative -mt-5 bg-[#F7F7F8] rounded-t-3xl pt-6 px-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-9 h-9 rounded-full flex items-center justify-center" style={{ backgroundColor: TYPE.chipBg }}>
              <span className="material-icons text-[18px]" style={{ color: TYPE.color }}>{TYPE.icon}</span>
            </div>
            <div>
              <p className="text-[13px] font-extrabold" style={{ color: TYPE.color }}>{TYPE.name}</p>
              <p className="text-[11px] text-slate-400">집중력 향상 · 감정 안정 · 창의성 회복</p>
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
                      className="group bg-white rounded-2xl border border-slate-100 shadow-sm p-5 cursor-pointer hover:shadow-md hover:border-blue-200 transition-all">
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
                <div className="w-px bg-slate-100 self-stretch" />
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">휴식 방식</p>
                  <div className="flex gap-2">
                    {WITH_OPTIONS.map(opt => (
                      <button key={opt.key} onClick={() => setWithOpt(opt.key)}
                        className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full border-2 text-xs font-bold transition-all"
                        style={withOpt === opt.key
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
                      className="group bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden flex cursor-pointer hover:shadow-md hover:border-blue-200 transition-all">
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

              <Link to="/map?restType=mental"
                className="flex items-center justify-center gap-2 w-full mt-4 py-3.5 rounded-2xl border border-slate-200 bg-white text-sm font-bold text-slate-500 hover:border-blue-300 hover:text-blue-600 transition-all">
                <span className="material-icons text-base">map</span>
                지도에서 내 주변 명상 공간 찾기
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
                    <h3 className="font-extrabold text-slate-800 text-sm">정신적 고요가 필요한 신호</h3>
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
                  <p className="text-xs text-slate-400">※ 2개 이상 해당된다면 오늘은 정신적 고요에 집중하세요.</p>
                </div>
              </div>
            </section>

          </main>
        </div>
      </div>
    </div>
  );
}

export default RestMental;
