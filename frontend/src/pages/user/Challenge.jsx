import { useState } from 'react';
import UserNavbar from '../../components/user/UserNavbar';

const TAG_META = {
  '신체적 휴식': { color: '#4CAF82', bg: '#F0FDF4' },
  '정신적 휴식': { color: '#5B8DEF', bg: '#EFF6FF' },
  '감각적 휴식': { color: '#9B6DFF', bg: '#F5F3FF' },
  '정서적 휴식': { color: '#FF7BAC', bg: '#FFF0F6' },
  '사회적 휴식': { color: '#FF9A3C', bg: '#FFF7ED' },
  '자연적 휴식': { color: '#2ECC9A', bg: '#ECFDF5' },
  '창조적 휴식': { color: '#FFB830', bg: '#FFFBEB' },
};

const MY_CHALLENGE = {
  title: '7일 자연 산책 챌린지',
  icon: 'park',
  doneDay: 5,
  totalDay: 7,
  progress: 72,
  daysLeft: 2,
  badgeIcon: 'emoji_events',
  color1: '#2ECC9A',
  color2: '#10b981',
};

const CHALLENGES = [
  {
    id: 1,
    title: '7일 자연 산책 챌린지',
    desc: '일주일 동안 매일 30분 이상 자연 속에서 산책하기',
    progress: 72,
    participants: '1,284',
    icon: 'park',
    tag: '자연적 휴식',
    badge: '인기',
    daysLeft: 2,
  },
  {
    id: 2,
    title: '디지털 디톡스 3일 챌린지',
    desc: '하루 2시간 스마트폰 없이 온전한 나만의 시간 갖기',
    progress: 45,
    participants: '892',
    icon: 'phone_disabled',
    tag: '정신적 휴식',
    badge: '추천',
    daysLeft: 1,
  },
  {
    id: 3,
    title: '명상 21일 챌린지',
    desc: '매일 아침 10분 마음챙김 명상으로 하루 시작하기',
    progress: 30,
    participants: '2,150',
    icon: 'self_improvement',
    tag: '정신적 휴식',
    badge: '',
    daysLeft: 14,
  },
  {
    id: 4,
    title: '감사 일기 30일 챌린지',
    desc: '매일 감사한 일 3가지를 기록하며 긍정 에너지 채우기',
    progress: 60,
    participants: '3,421',
    icon: 'edit_note',
    tag: '정서적 휴식',
    badge: '인기',
    daysLeft: 12,
  },
];

function ChallengeCard({ challenge }) {
  const meta = TAG_META[challenge.tag] || { color: '#10b981', bg: '#ECFDF5' };

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden hover:shadow-md transition-all">
      {/* 컬러 썸네일 */}
      <div
        className="h-24 flex items-center justify-center relative"
        style={{ background: `linear-gradient(135deg, ${meta.color}22 0%, ${meta.color}0d 100%)` }}
      >
        <span
          className="material-icons opacity-25 absolute right-4 bottom-2"
          style={{ fontSize: '64px', color: meta.color }}
        >
          {challenge.icon}
        </span>
        <span
          className="material-icons relative z-10"
          style={{ fontSize: '36px', color: meta.color }}
        >
          {challenge.icon}
        </span>

        {/* 배지 */}
        {challenge.badge && (
          <span
            className="absolute top-3 left-3 text-[10px] font-bold px-2 py-0.5 rounded-full"
            style={{ backgroundColor: meta.color, color: '#fff' }}
          >
            {challenge.badge}
          </span>
        )}

        {/* D-day */}
        <span className="absolute top-3 right-3 text-[10px] font-bold bg-white/80 px-2 py-0.5 rounded-full text-slate-600">
          D-{challenge.daysLeft}
        </span>
      </div>

      {/* 본문 */}
      <div className="px-4 py-4">
        {/* 태그 */}
        <span
          className="inline-block text-[10px] font-bold px-2 py-0.5 rounded-full mb-2"
          style={{ backgroundColor: meta.bg, color: meta.color }}
        >
          {challenge.tag}
        </span>

        <h3 className="text-sm font-extrabold text-slate-800 leading-snug mb-1">
          {challenge.title}
        </h3>
        <p className="text-xs text-slate-400 leading-relaxed line-clamp-2 mb-3">
          {challenge.desc}
        </p>

        {/* 진행률 */}
        <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1.5">
          <span className="flex items-center gap-1">
            <span className="material-icons text-xs">people</span>
            {challenge.participants}명 참여 중
          </span>
          <span style={{ color: meta.color }} className="font-bold">{challenge.progress}%</span>
        </div>
        <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden mb-4">
          <div
            className="h-full rounded-full transition-all"
            style={{ width: `${challenge.progress}%`, backgroundColor: meta.color }}
          />
        </div>

        <button
          className="w-full py-2.5 rounded-xl text-xs font-bold text-white transition-all hover:opacity-90 active:scale-95"
          style={{ backgroundColor: meta.color }}
        >
          참여하기
        </button>
      </div>
    </div>
  );
}

function Challenge() {
  const [showOverlay, setShowOverlay] = useState(true);
  const my = MY_CHALLENGE;

  return (
    <div className="min-h-screen bg-[#F7F7F8]">
      <UserNavbar />

      <main className="max-w-2xl mx-auto px-4 pt-5 pb-24">

        {/* 헤더 */}
        <div className="mb-5">
          <h1 className="text-[22px] font-extrabold tracking-tight text-slate-800">챌린지</h1>
          <p className="text-xs text-slate-400 mt-0.5">함께하면 더 쉬운 휴식 습관 만들기</p>
        </div>

        {/* 내 진행 중 챌린지 */}
        <div
          className="rounded-2xl p-5 mb-6 text-white relative overflow-hidden"
          style={{ background: `linear-gradient(135deg, ${my.color1} 0%, ${my.color2} 100%)` }}
        >
          {/* 배경 아이콘 */}
          <span
            className="material-icons absolute right-4 top-1/2 -translate-y-1/2 opacity-10 pointer-events-none select-none"
            style={{ fontSize: '100px' }}
          >
            {my.icon}
          </span>

          <div className="relative z-10">
            <div className="flex items-start justify-between mb-4">
              <div>
                <p className="text-white/70 text-[11px] font-bold uppercase tracking-widest mb-1">
                  참여 중인 챌린지
                </p>
                <h2 className="text-[17px] font-extrabold leading-snug">{my.title}</h2>
              </div>
              {/* D-day 배지 */}
              <span className="shrink-0 bg-white/20 text-white text-xs font-bold px-3 py-1 rounded-full ml-3">
                D-{my.daysLeft}
              </span>
            </div>

            {/* 진행률 */}
            <div className="flex items-center justify-between text-xs mb-2">
              <span className="text-white/80">{my.doneDay}/{my.totalDay}일 완료</span>
              <span className="font-bold">{my.progress}%</span>
            </div>
            <div className="w-full h-2.5 bg-white/20 rounded-full overflow-hidden mb-3">
              <div
                className="h-full bg-white rounded-full transition-all duration-500"
                style={{ width: `${my.progress}%` }}
              />
            </div>

            {/* 배지 획득 안내 */}
            <div className="flex items-center gap-2 bg-white/15 rounded-xl px-3 py-2">
              <span className="material-icons text-base text-yellow-200">{my.badgeIcon}</span>
              <p className="text-xs text-white/90">
                <span className="font-bold">{my.daysLeft}일</span>만 더 완료하면 배지를 획득해요!
              </p>
            </div>
          </div>
        </div>

        {/* 챌린지 목록 */}
        <div className="flex items-center justify-between mb-3 px-0.5">
          <p className="text-sm font-extrabold text-slate-700">진행 중인 챌린지</p>
          <span className="text-xs text-slate-400">{CHALLENGES.length}개</span>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {CHALLENGES.map(challenge => (
            <ChallengeCard key={challenge.id} challenge={challenge} />
          ))}
        </div>

      </main>

      {/* 준비중 오버레이 */}
      {showOverlay && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center px-6">
          <div className="bg-white rounded-3xl p-8 max-w-sm w-full text-center shadow-2xl">
            <div className="w-16 h-16 bg-amber-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="material-icons text-3xl text-amber-400">construction</span>
            </div>
            <h2 className="text-lg font-extrabold text-slate-800 mb-2">챌린지 준비 중</h2>
            <p className="text-sm text-slate-500 leading-relaxed mb-1">
              챌린지 기능은 현재 <span className="font-bold text-amber-500">2차 MVP</span>로<br />
              개발 중이에요.
            </p>
            <p className="text-xs text-slate-400 mb-6">미리보기로 화면을 확인할 수 있어요.</p>
            <div className="space-y-2">
              <button
                onClick={() => setShowOverlay(false)}
                className="w-full py-3.5 bg-primary text-white font-bold rounded-2xl hover:bg-primary/90 transition-all"
              >
                미리보기
              </button>
              <button
                onClick={() => window.history.back()}
                className="w-full py-2.5 text-slate-400 font-semibold text-sm hover:text-slate-600 transition-colors"
              >
                돌아가기
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Challenge;
