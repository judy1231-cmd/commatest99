import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchWithAuth } from '../../api/fetchWithAuth';
import UserNavbar from '../../components/user/UserNavbar';

// 챌린지 인증 방식 한글
const AUTH_TYPE_LABELS = {
  photo: '사진 인증',
  check: '체크 인증',
  text: '텍스트 인증',
};

// 챌린지 색상 테마 (id % 길이 로 선택)
const CHALLENGE_THEMES = [
  { color: '#2ECC9A', bg: '#F0FBF7', icon: 'park' },
  { color: '#5B8DEF', bg: '#F0F5FF', icon: 'self_improvement' },
  { color: '#FFB830', bg: '#FFFBF0', icon: 'edit_note' },
  { color: '#FF7BAC', bg: '#FFF0F7', icon: 'favorite' },
  { color: '#9B6DFF', bg: '#F5F0FF', icon: 'phone_disabled' },
  { color: '#FF9A3C', bg: '#FFF5EC', icon: 'fitness_center' },
  { color: '#4CAF82', bg: '#F0FAF5', icon: 'spa' },
];

function getTheme(id) {
  return CHALLENGE_THEMES[(id - 1) % CHALLENGE_THEMES.length];
}

function ChallengeCard({ challenge, onToggleJoin, isLoggedIn }) {
  const theme = getTheme(challenge.id);
  const progress = challenge.myAchievedDays && challenge.durationDays
    ? Math.round((challenge.myAchievedDays / challenge.durationDays) * 100)
    : 0;
  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden hover:shadow-md transition-all">
      {/* 컬러 썸네일 */}
      <div
        className="h-24 flex items-center justify-center relative"
        style={{ background: `linear-gradient(135deg, ${theme.color}22 0%, ${theme.color}0d 100%)` }}
      >
        <span
          className="material-icons opacity-20 absolute right-4 bottom-2"
          style={{ fontSize: '64px', color: theme.color }}
        >
          {theme.icon}
        </span>
        <span
          className="material-icons relative z-10"
          style={{ fontSize: '36px', color: theme.color }}
        >
          {theme.icon}
        </span>
        <span className="absolute top-3 right-3 text-[10px] font-bold bg-white/80 px-2 py-0.5 rounded-full text-slate-600">
          {challenge.durationDays}일
        </span>
        <span
          className="absolute top-3 left-3 text-[10px] font-bold px-2 py-0.5 rounded-full"
          style={{ backgroundColor: theme.color, color: '#fff' }}
        >
          {AUTH_TYPE_LABELS[challenge.verificationType] || '인증'}
        </span>
      </div>

      {/* 본문 */}
      <div className="px-4 py-4">
        <h3 className="text-sm font-extrabold text-slate-800 leading-snug mb-1">
          {challenge.title}
        </h3>
        <p className="text-xs text-slate-400 leading-relaxed line-clamp-2 mb-3">
          {challenge.description}
        </p>

        <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1.5">
          <span className="flex items-center gap-1">
            <span className="material-icons text-xs">people</span>
            {(challenge.participantCount || 0).toLocaleString()}명 참여 중
          </span>
          {challenge.joinedByMe && (
            <span style={{ color: theme.color }} className="font-bold">{progress}%</span>
          )}
        </div>

        {challenge.joinedByMe && (
          <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden mb-3">
            <div
              className="h-full rounded-full transition-all"
              style={{ width: `${progress}%`, backgroundColor: theme.color }}
            />
          </div>
        )}

        <button
          onClick={() => isLoggedIn ? onToggleJoin(challenge.id) : null}
          className={`w-full py-2.5 rounded-xl text-xs font-bold transition-all hover:opacity-90 active:scale-95 ${
            challenge.joinedByMe
              ? 'bg-slate-100 text-slate-500'
              : 'text-white'
          }`}
          style={challenge.joinedByMe ? {} : { backgroundColor: theme.color }}
        >
          {challenge.joinedByMe ? '참여 취소' : '참여하기'}
        </button>
      </div>
    </div>
  );
}

function Challenge() {
  const navigate = useNavigate();
  const isLoggedIn = !!localStorage.getItem('accessToken');

  const [challenges, setChallenges] = useState([]);
  const [myChallenges, setMyChallenges] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadChallenges();
  }, []);

  const loadChallenges = async () => {
    setLoading(true);
    try {
      const fetcher = isLoggedIn ? fetchWithAuth : (url) => fetch(url).then(r => r.json());
      const [allRes, myRes] = await Promise.allSettled([
        fetcher('/api/challenges'),
        isLoggedIn ? fetchWithAuth('/api/challenges/my') : Promise.resolve({ success: false }),
      ]);

      if (allRes.status === 'fulfilled' && allRes.value.success) {
        setChallenges(allRes.value.data || []);
      }
      if (myRes.status === 'fulfilled' && myRes.value.success) {
        setMyChallenges(myRes.value.data || []);
      }
    } catch {
      // 무시
    } finally {
      setLoading(false);
    }
  };

  const handleToggleJoin = async (challengeId) => {
    if (!isLoggedIn) { navigate('/login'); return; }
    try {
      const data = await fetchWithAuth(`/api/challenges/${challengeId}/join`, { method: 'POST' });
      if (data.success) {
        // 목록 갱신
        loadChallenges();
      }
    } catch {
      // 무시
    }
  };

  const activeChallenge = myChallenges.find(c => c.myStatus === 'ongoing');

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F7F7F8]">
        <UserNavbar />
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
        </div>
      </div>
    );
  }

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
        {activeChallenge ? (
          (() => {
            const theme = getTheme(activeChallenge.id);
            const progress = activeChallenge.myAchievedDays && activeChallenge.durationDays
              ? Math.round((activeChallenge.myAchievedDays / activeChallenge.durationDays) * 100)
              : 0;
            const daysLeft = activeChallenge.durationDays - (activeChallenge.myAchievedDays || 0);
            return (
              <div
                className="rounded-2xl p-5 mb-6 text-white relative overflow-hidden"
                style={{ background: `linear-gradient(135deg, ${theme.color} 0%, ${theme.color}cc 100%)` }}
              >
                <span
                  className="material-icons absolute right-4 top-1/2 -translate-y-1/2 opacity-10 pointer-events-none select-none"
                  style={{ fontSize: '100px' }}
                >
                  {theme.icon}
                </span>
                <div className="relative z-10">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <p className="text-white/70 text-[11px] font-bold uppercase tracking-widest mb-1">참여 중인 챌린지</p>
                      <h2 className="text-[17px] font-extrabold leading-snug">{activeChallenge.title}</h2>
                    </div>
                    <span className="shrink-0 bg-white/20 text-white text-xs font-bold px-3 py-1 rounded-full ml-3">
                      {daysLeft}일 남음
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs mb-2">
                    <span className="text-white/80">{activeChallenge.myAchievedDays || 0}/{activeChallenge.durationDays}일 완료</span>
                    <span className="font-bold">{progress}%</span>
                  </div>
                  <div className="w-full h-2.5 bg-white/20 rounded-full overflow-hidden mb-3">
                    <div className="h-full bg-white rounded-full transition-all duration-500" style={{ width: `${progress}%` }} />
                  </div>
                  <div className="flex items-center gap-2 bg-white/15 rounded-xl px-3 py-2">
                    <span className="material-icons text-base text-yellow-200">emoji_events</span>
                    <p className="text-xs text-white/90">
                      <span className="font-bold">{daysLeft}일</span>만 더 완료하면 배지를 획득해요!
                    </p>
                  </div>
                </div>
              </div>
            );
          })()
        ) : isLoggedIn ? (
          <div className="bg-white rounded-2xl border border-dashed border-slate-200 p-6 mb-6 text-center">
            <span className="material-icons text-3xl text-slate-200 block mb-2">emoji_events</span>
            <p className="text-sm font-semibold text-slate-400">아직 참여 중인 챌린지가 없어요</p>
            <p className="text-xs text-slate-300 mt-1">아래에서 챌린지를 골라 참여해보세요</p>
          </div>
        ) : null}

        {/* 챌린지 목록 */}
        <div className="flex items-center justify-between mb-3 px-0.5">
          <p className="text-sm font-extrabold text-slate-700">진행 중인 챌린지</p>
          <span className="text-xs text-slate-400">{challenges.length}개</span>
        </div>

        {challenges.length === 0 ? (
          <div className="text-center py-16">
            <span className="material-icons text-4xl text-slate-200 block mb-2">emoji_events</span>
            <p className="text-sm text-slate-400">진행 중인 챌린지가 없습니다</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {challenges.map(challenge => (
              <ChallengeCard
                key={challenge.id}
                challenge={challenge}
                onToggleJoin={handleToggleJoin}
                isLoggedIn={isLoggedIn}
              />
            ))}
          </div>
        )}

        {!isLoggedIn && (
          <div className="mt-6 bg-white rounded-2xl border border-primary/20 p-5 text-center">
            <span className="material-icons text-2xl text-primary block mb-2">login</span>
            <p className="text-sm font-semibold text-slate-700 mb-1">로그인하면 챌린지에 참여할 수 있어요</p>
            <button
              onClick={() => navigate('/login')}
              className="mt-2 px-5 py-2 bg-primary text-white text-sm font-bold rounded-xl hover:bg-primary/90"
            >
              로그인하기
            </button>
          </div>
        )}

      </main>
    </div>
  );
}

export default Challenge;
