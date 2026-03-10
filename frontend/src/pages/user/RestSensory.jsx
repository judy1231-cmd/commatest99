import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import UserNavbar from '../../components/user/UserNavbar';
import { useRestActivities } from '../../api/useRestActivities';

const TYPE_COLOR = '#9B6DFF';

const SENSE_OPTIONS = [
  { key: 'sound',   label: '청각',  emoji: '👂', desc: '소리로 감각을 쉬게 하기' },
  { key: 'visual',  label: '시각',  emoji: '👁️', desc: '눈의 피로를 풀어주기' },
  { key: 'touch',   label: '촉각',  emoji: '🤲', desc: '몸의 긴장 녹이기' },
  { key: 'smell',   label: '후각',  emoji: '👃', desc: '향으로 마음 안정시키기' },
];

const TIME_OPTIONS = [
  { key: 'day',     label: '낮',    emoji: '☀️' },
  { key: 'evening', label: '저녁',  emoji: '🌆' },
  { key: 'night',   label: '밤',    emoji: '🌙' },
];

const SENSORY_PLACES = [
  { name: 'ASMR 유튜브 (빗소리·숲소리)', location: '집에서', desc: '귀를 편안하게 감싸는 자연음. 백색소음으로 집중력도 회복', sense: ['sound'], time: ['day','evening','night'], tags: ['ASMR', '무료', '즉시가능'], icon: 'headphones', color: '#F59E0B' },
  { name: '클래식 음악 카페', location: '인사동·홍대', desc: '라이브 또는 고음질 클래식이 흐르는 공간. 말 없이 앉아있어도 OK', sense: ['sound'], time: ['day','evening'], tags: ['클래식', '조용한카페', '힐링'], icon: 'music_note', color: '#f59e0b' },
  { name: '국립현대미술관', location: '서울 종로구·과천', desc: '눈이 쉬는 예술 감상. 형태와 색채에 집중하며 잡념 내려놓기', sense: ['visual'], time: ['day'], tags: ['미술관', '무료입장일', '조용함'], icon: 'palette', color: '#8b5cf6' },
  { name: '플라네타리움 (별자리관)', location: '서울 어린이대공원·노원', desc: '어두운 돔 안에서 별을 바라보며 시각 이완', sense: ['visual'], time: ['evening','night'], tags: ['별자리', '힐링', '어두운공간'], icon: 'stars', color: '#6366f1' },
  { name: '아로마 테라피샵', location: '가로수길·이태원', desc: '라벤더·유칼립투스·베르가못 직접 맡아보고 나에게 맞는 향 찾기', sense: ['smell'], time: ['day','evening'], tags: ['아로마', '향수', '체험'], icon: 'spa', color: '#ec4899' },
  { name: '향초 DIY 클래스', location: '성수동·합정', desc: '나만의 향 블렌딩 후 캔들 제작. 만드는 과정 자체가 힐링', sense: ['smell'], time: ['day','evening'], tags: ['향초', '원데이클래스', '선물용'], icon: 'local_fire_department', color: '#f97316' },
  { name: '스파·찜질방', location: '전국 스파시설', desc: '온탕·냉탕 교대로 피부 감각 자극. 가성비 최고 촉각 힐링', sense: ['touch'], time: ['day','evening','night'], tags: ['찜질방', '저렴', '촉각'], icon: 'hot_tub', color: '#0ea5e9' },
  { name: '마사지샵 (발마사지)', location: '동네 마사지샵', desc: '발바닥 반사구 자극 30분. 피로 집중 해소', sense: ['touch'], time: ['evening','night'], tags: ['마사지', '발관리', '피로회복'], icon: 'airline_seat_flat', color: '#14b8a6' },
];


const checklist = [
  '스마트폰 화면을 보면 눈이 쉽게 피로해진다.',
  '시끄러운 공간에서 극도로 예민해진다.',
  '냄새나 밝은 빛에 과도하게 반응한다.',
  '온몸의 감각이 무뎌지고 둔해진 느낌이다.',
  '감각적인 자극에 쉽게 지치거나 압도당한다.',
  '자연의 소리나 조용한 공간이 몹시 그립다.',
];

function RestSensory() {
  const navigate = useNavigate();
  const [sense, setSense] = useState('sound');
  const [timeOfDay, setTimeOfDay] = useState('day');
  const [liked, setLiked] = useState({});
  const { activities, loading: activitiesLoading } = useRestActivities('sensory');
  const filteredPlaces = SENSORY_PLACES.filter(
    p => p.sense.includes(sense) && p.time.includes(timeOfDay)
  );

  return (
    <div className="min-h-screen bg-[#F9F7F2]">
      <UserNavbar />
      <main className="max-w-7xl mx-auto px-6 py-10 space-y-20 pb-24 md:pb-10">

        {/* Back */}
        <Link to="/" className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-amber-600 transition-colors">
          <span className="material-symbols-outlined text-base">arrow_back</span>
          홈으로
        </Link>

        {/* Hero */}
        <section className="relative h-[480px] rounded-3xl overflow-hidden bg-amber-950">
          <div
            className="absolute inset-0 bg-cover bg-center opacity-60"
            style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuARMyoXsjBEwG0HbxvhkxbVjDRYsvhwT_ordMU7mGaVXtenucoUMrf1CjTHLT95a90PPiIHaPHcJHe-0iq_xCPRcqwB-txk8jI5nP43Pqh9dHVu-PemHJDE3t23dh6ZaxgAr9OvjraI8N88n6YQcIKORrjKvhEBkauLifUt-vjaTlbmCOBtssc0a3_1EkNhXV5_zXp1Nf7rxDatO2V5D_6vFKhz72bsk6l7h5gepOwlHjjVIB67SDGYpcWkDSWgXpNh1t3HbrFRDa4')" }}
          />
          <div className="absolute inset-0 bg-gradient-to-r from-amber-950/90 via-amber-900/50 to-transparent flex flex-col justify-center px-12">
            <span className="inline-block px-4 py-1.5 bg-amber-400/90 text-amber-900 rounded-full text-sm font-bold mb-6 w-fit uppercase tracking-wider">Sensory Rest</span>
            <h2 className="text-5xl font-bold text-white leading-tight mb-4">감각의 정화</h2>
            <p className="text-white/80 text-lg max-w-md leading-relaxed">과부하된 오감을 내려놓고,<br />감각의 고요함 속에서 회복하는 시간입니다.</p>
            <div className="flex gap-4 mt-8">
              <button className="px-8 py-3 bg-amber-500 text-white rounded-xl font-bold hover:bg-amber-600 transition-colors shadow-lg">휴식 시작하기</button>
              <button className="px-8 py-3 bg-white/20 backdrop-blur text-white border border-white/30 rounded-xl font-bold hover:bg-white/30 transition-colors">자세히 알아보기</button>
            </div>
          </div>
        </section>

        {/* ===== 지금 어떤 감각을 쉬게 하고 싶어요? ===== */}
        <section>
          <div className="mb-8">
            <h3 className="text-2xl font-bold text-gray-800">지금 어떤 감각을 쉬게 하고 싶어요?</h3>
            <p className="text-gray-500 mt-2">감각 유형과 시간대를 선택하면 딱 맞는 공간을 추천해줄게요</p>
          </div>

          <div className="mb-6">
            <p className="text-sm font-bold text-slate-600 mb-3">감각 유형</p>
            <div className="grid grid-cols-4 gap-3">
              {SENSE_OPTIONS.map(opt => (
                <button key={opt.key} onClick={() => setSense(opt.key)}
                  className={`p-4 rounded-2xl border-2 text-left transition-all ${sense === opt.key ? 'bg-amber-500 border-amber-500 text-white' : 'bg-amber-50 border-amber-200 text-amber-700'}`}>
                  <div className="text-2xl mb-2">{opt.emoji}</div>
                  <p className="font-bold text-sm">{opt.label}</p>
                  <p className={`text-xs mt-1 ${sense === opt.key ? 'text-white/80' : 'opacity-70'}`}>{opt.desc}</p>
                </button>
              ))}
            </div>
          </div>

          <div className="mb-8">
            <p className="text-sm font-bold text-slate-600 mb-3">지금 시간대</p>
            <div className="flex gap-3">
              {TIME_OPTIONS.map(opt => (
                <button key={opt.key} onClick={() => setTimeOfDay(opt.key)}
                  className={`flex items-center gap-2 px-5 py-2.5 rounded-full border-2 font-bold text-sm transition-all ${timeOfDay === opt.key ? 'bg-amber-500 border-amber-500 text-white' : 'bg-white border-slate-200 text-slate-600 hover:border-amber-300'}`}>
                  <span>{opt.emoji}</span>{opt.label}
                </button>
              ))}
            </div>
          </div>

          {filteredPlaces.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-2xl border border-slate-100">
              <span className="text-4xl mb-3 block">✨</span>
              <p className="text-slate-500 font-medium">이 조건에 맞는 공간을 준비 중이에요</p>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredPlaces.map((place, i) => (
                <div key={i} onClick={() => navigate('/map')} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 hover:shadow-md transition-shadow cursor-pointer">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: `${place.color}20` }}>
                      <span className="material-icons text-base" style={{ color: place.color }}>{place.icon}</span>
                    </div>
                    <div className="flex-1">
                      <h4 className="font-bold text-slate-800 text-sm">{place.name}</h4>
                      <p className="text-xs text-slate-400">{place.location}</p>
                    </div>
                    <button
                      onClick={(e) => { e.stopPropagation(); setLiked(prev => ({ ...prev, [i]: !prev[i] })); }}
                      className="p-1"
                    >
                      <span className={`material-icons text-lg transition-colors ${liked[i] ? 'text-red-500' : 'text-slate-200 hover:text-red-300'}`}>favorite</span>
                    </button>
                  </div>
                  <p className="text-xs text-slate-500 leading-relaxed mb-3">{place.desc}</p>
                  <div className="flex flex-wrap gap-1.5">
                    {place.tags.map((tag, j) => (
                      <span key={j} className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ backgroundColor: `${place.color}15`, color: place.color }}>#{tag}</span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="mt-6 text-center">
            <a href="/map?restType=sensory" className="inline-flex items-center gap-2 bg-amber-500 text-white font-bold px-6 py-3 rounded-xl hover:bg-amber-600 transition-colors">
              <span className="material-icons text-base">map</span>
              지도에서 감각 힐링 공간 찾기
            </a>
          </div>
        </section>

        {/* Main content: left + right */}
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-12">

          {/* Left column (2/3) */}
          <div className="lg:col-span-2 space-y-16">
            {/* Why */}
            <div>
              <div className="inline-flex items-center gap-2 text-amber-700 bg-amber-50 px-4 py-2 rounded-lg font-semibold mb-4">
                <span className="material-symbols-outlined">sensors</span>
                <span>감각 과부하의 원인</span>
              </div>
              <h3 className="text-2xl font-bold mb-4">왜 감각적 휴식이 필요한가요?</h3>
              <p className="text-gray-600 leading-relaxed">
                현대인은 하루 평균 74GB의 디지털 정보를 처리합니다. 끊임없는 알림, 소음, 화면 빛은 우리의 감각 신경을 지속적으로 자극하여 신경계를 과활성화 상태로 만듭니다. 감각적 휴식은 이 과부하를 해소하는 가장 효과적인 방법입니다.
              </p>
            </div>

            {/* Activities */}
            <div>
              <h3 className="text-2xl font-bold mb-6">추천 휴식 활동</h3>
              {activitiesLoading ? (
                <div className="flex justify-center py-10">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2" style={{ borderColor: TYPE_COLOR }} />
                </div>
              ) : activities.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-2xl border border-slate-100">
                  <span className="material-icons text-4xl text-slate-300 block mb-2">pending</span>
                  <p className="text-slate-400 text-sm">활동 정보를 불러올 수 없어요</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {activities.map((act) => (
                    <div key={act.id} className="group bg-white rounded-2xl border border-slate-100 shadow-sm p-6 hover:shadow-md transition-all cursor-pointer" onClick={() => navigate('/rest-record')}>
                      <div className="flex items-center justify-between mb-4">
                        <div className="w-11 h-11 rounded-xl flex items-center justify-center" style={{ backgroundColor: TYPE_COLOR + '20' }}>
                          <span className="material-icons" style={{ color: TYPE_COLOR }}>visibility_off</span>
                        </div>
                        <button onClick={(e) => { e.stopPropagation(); setLiked(prev => ({ ...prev, [act.id]: !prev[act.id] })); }} className="p-1">
                          <span className={`material-icons text-xl transition-colors ${liked[act.id] ? 'text-red-500' : 'text-slate-300 hover:text-red-300'}`}>favorite</span>
                        </button>
                      </div>
                      <h4 className="font-bold text-slate-900 mb-1">{act.activityName}</h4>
                      {act.durationMinutes && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full inline-block mb-2" style={{ backgroundColor: TYPE_COLOR + '15', color: TYPE_COLOR }}>{act.durationMinutes}분</span>
                      )}
                      <p className="text-slate-500 text-sm leading-relaxed">{act.guideContent}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Checklist */}
            <div className="bg-amber-50 rounded-2xl p-8 border border-amber-100">
              <div className="flex items-center gap-3 mb-6">
                <span className="material-symbols-outlined text-amber-600 text-3xl">checklist</span>
                <h3 className="text-xl font-bold text-slate-900">감각 과부하 신호 체크</h3>
              </div>
              <div className="space-y-3">
                {checklist.map((item, i) => (
                  <label key={i} className="flex items-center p-3 bg-white rounded-xl cursor-pointer border border-transparent hover:border-amber-200 transition-all shadow-sm">
                    <input type="checkbox" className="w-5 h-5 rounded text-amber-600 focus:ring-amber-500 border-gray-300" />
                    <span className="ml-3 text-slate-700 text-sm font-medium">{item}</span>
                  </label>
                ))}
              </div>
              <div className="mt-6 p-4 bg-amber-100 rounded-xl">
                <p className="text-sm text-amber-800 font-medium">※ 3개 이상 해당된다면, 오늘은 감각의 정화가 필요합니다.</p>
              </div>
            </div>
          </div>

          {/* Right column (1/3) */}
          <aside className="space-y-8">
            {/* AI Pick */}
            <div className="bg-slate-900 rounded-2xl p-6 text-white">
              <div className="flex items-center gap-2 text-amber-400 font-bold mb-4 text-sm uppercase tracking-widest">
                <span className="material-symbols-outlined">auto_awesome</span> AI Pick
              </div>
              <p className="text-lg italic leading-relaxed mb-6">
                "소음을 줄이는 것이 아니라, 고요함을 늘리는 것. 그것이 감각적 휴식의 시작입니다."
              </p>
              <div className="space-y-3">
                {[
                  { icon: 'library_music', title: '백색소음 플레이리스트', desc: '빗소리 & 자연 소리 • 60분' },
                  { icon: 'spa', title: '아로마 입문 가이드', desc: '오늘의 추천 향: 라벤더' },
                ].map((item, i) => (
                  <div key={i} className="flex items-center p-3 bg-white/10 rounded-xl group cursor-pointer hover:bg-white/20 transition-colors">
                    <div className="w-10 h-10 bg-amber-500/20 rounded-lg flex items-center justify-center text-amber-400 mr-3">
                      <span className="material-symbols-outlined text-sm">{item.icon}</span>
                    </div>
                    <div className="flex-1">
                      <h5 className="font-bold text-sm">{item.title}</h5>
                      <p className="text-xs text-white/60">{item.desc}</p>
                    </div>
                    <span className="material-symbols-outlined text-white/40 group-hover:text-amber-400 text-sm">play_circle</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Community */}
            <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h4 className="font-bold text-slate-900">커뮤니티 소식</h4>
                <Link to="/community" className="text-xs text-amber-600 font-bold hover:underline">더보기</Link>
              </div>
              <div className="space-y-4">
                {[
                  { user: '조용한 밤', time: '1시간 전', content: '어둠 테라피 처음 해봤는데 정말 신기하게 눈의 피로가 풀렸어요!' },
                  { user: '민들레홀씨', time: '3시간 전', content: '라벤더 오일 추천합니다. 잠들기 전에 바르면 숙면에 정말 도움이 돼요.' },
                ].map((post, i) => (
                  <div key={i} className="flex gap-3 p-3 hover:bg-amber-50 rounded-xl transition-colors">
                    <div className="w-8 h-8 rounded-full bg-amber-100 flex-shrink-0 flex items-center justify-center">
                      <span className="material-symbols-outlined text-amber-600 text-sm">person</span>
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-bold text-sm text-slate-900">{post.user}</span>
                        <span className="text-xs text-slate-400">{post.time}</span>
                      </div>
                      <p className="text-slate-600 text-xs line-clamp-2">{post.content}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </aside>
        </section>
      </main>
    </div>
  );
}

export default RestSensory;
