import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchWithAuth } from '../../api/fetchWithAuth';
import UserNavbar from '../../components/user/UserNavbar';

const AUTH_TYPE_LABELS = {
  photo: '사진 인증',
  check: '체크 인증',
  text:  '텍스트 인증',
};

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

// 진행률에 따른 격려 메시지
function getEncouragement(achievedDays, durationDays, todayCertified, completed) {
  if (completed) return { text: '챌린지 완료! 정말 대단해요 🎉', sub: '꾸준함이 만들어낸 멋진 결과예요.' };
  if (todayCertified) return { text: '오늘도 해냈어요! ✅', sub: '하루하루 쌓이는 게 가장 강한 힘이에요.' };
  const ratio = achievedDays / durationDays;
  if (achievedDays === 0)  return { text: '첫 발자국을 내딛어보세요 👣', sub: '작은 시작이 큰 변화를 만들어요.' };
  if (ratio < 0.3)         return { text: '잘 시작하고 있어요! 💪', sub: '좋은 습관은 지금 만들어지고 있어요.' };
  if (ratio < 0.6)         return { text: '절반을 향해 달려가는 중! 🌱', sub: '이미 많이 해냈어요. 계속 가봐요.' };
  if (ratio < 0.9)         return { text: '거의 다 왔어요! ✨', sub: '조금만 더, 할 수 있어요!' };
  return { text: '마지막 한 걸음만 남았어요 🏁', sub: '오늘 인증하면 완료예요!' };
}

// ─── 인증 모달 ────────────────────────────────────
function CertifyModal({ challenge, onClose, onSuccess }) {
  const theme = getTheme(challenge.id);
  const [memo, setMemo] = useState('');
  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const isPhoto = challenge.verificationType === 'photo';
  const needsMemo = challenge.verificationType === 'text' || isPhoto;

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setPhotoFile(file);
    setPhotoPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchWithAuth(`/api/challenges/${challenge.id}/certify`, {
        method: 'POST',
        body: JSON.stringify({ memo }),
      });
      if (data.success) {
        onSuccess(data);
      } else {
        setError(data.message || '인증에 실패했어요.');
      }
    } catch {
      setError('네트워크 오류가 발생했어요.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4" onClick={onClose}>
      <div
        className="w-full max-w-md bg-white rounded-3xl p-6"
        onClick={e => e.stopPropagation()}
      >
        {/* 헤더 */}
        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-2xl flex items-center justify-center" style={{ backgroundColor: theme.bg }}>
            <span className="material-icons text-lg" style={{ color: theme.color }}>{theme.icon}</span>
          </div>
          <div className="flex-1">
            <p className="text-[11px] text-slate-400 font-medium">오늘의 인증</p>
            <p className="text-sm font-extrabold text-slate-800">{challenge.title}</p>
          </div>
          <button onClick={onClose} className="text-slate-300 hover:text-slate-500 transition-colors">
            <span className="material-icons text-xl">close</span>
          </button>
        </div>

        {challenge.verificationType === 'check' ? (
          <div className="bg-slate-50 rounded-2xl p-4 text-center mb-5">
            <span className="material-icons text-4xl mb-2" style={{ color: theme.color }}>check_circle</span>
            <p className="text-sm font-bold text-slate-700">오늘 챌린지를 실천했나요?</p>
            <p className="text-xs text-slate-400 mt-1">버튼을 누르면 오늘 인증이 완료돼요.</p>
          </div>
        ) : isPhoto ? (
          <div className="mb-5 space-y-3">
            {/* 사진 업로드 */}
            <div>
              <label className="text-xs font-bold text-slate-600 mb-2 block">사진 첨부 📷</label>
              {photoPreview ? (
                <div className="relative w-full h-40 rounded-xl overflow-hidden border border-slate-200">
                  <img src={photoPreview} alt="preview" className="w-full h-full object-cover" />
                  <button
                    onClick={() => { setPhotoFile(null); setPhotoPreview(null); }}
                    className="absolute top-2 right-2 bg-black/50 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-black/70"
                  >
                    <span className="material-icons text-xs">close</span>
                  </button>
                </div>
              ) : (
                <label className="flex flex-col items-center justify-center w-full h-32 rounded-xl border-2 border-dashed border-slate-200 bg-slate-50 cursor-pointer hover:border-primary/40 hover:bg-primary/5 transition-colors">
                  <span className="material-icons text-3xl text-slate-300 mb-1">add_photo_alternate</span>
                  <span className="text-xs text-slate-400">사진을 선택해주세요</span>
                  <input type="file" accept="image/*" className="hidden" onChange={handlePhotoChange} />
                </label>
              )}
            </div>
            {/* 메모 */}
            <div>
              <label className="text-xs font-bold text-slate-600 mb-2 block">오늘 어떤 경험을 했는지 기록해요 📝</label>
              <textarea
                className="w-full h-20 px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-sm resize-none focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                placeholder="예) 손편지를 다 썼어요. 마음이 따뜻해졌어요."
                value={memo}
                onChange={e => setMemo(e.target.value)}
                maxLength={200}
              />
              <p className="text-right text-[10px] text-slate-300 mt-1">{memo.length}/200</p>
            </div>
          </div>
        ) : (
          <div className="mb-5">
            <label className="text-xs font-bold text-slate-600 mb-2 block">오늘 활동을 한 줄로 남겨요 ✍️</label>
            <textarea
              className="w-full h-24 px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-sm resize-none focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
              placeholder="예) 오늘 20분 산책했어요. 기분이 한결 나아졌어요."
              value={memo}
              onChange={e => setMemo(e.target.value)}
              maxLength={200}
            />
            <p className="text-right text-[10px] text-slate-300 mt-1">{memo.length}/200</p>
          </div>
        )}

        {error && (
          <div className="mb-4 px-4 py-3 bg-red-50 rounded-xl text-xs text-red-500 font-medium flex items-center gap-2">
            <span className="material-icons text-sm">error_outline</span>
            {error}
          </div>
        )}

        <div className="flex gap-2">
          <button
            onClick={onClose}
            className="flex-1 py-3 rounded-xl border border-slate-200 text-sm font-bold text-slate-500 hover:bg-slate-50 transition-colors"
          >
            취소
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading || (challenge.verificationType === 'text' && !memo.trim())}
            className="flex-1 py-3 rounded-xl text-sm font-bold text-white transition-all disabled:opacity-50"
            style={{ backgroundColor: theme.color }}
          >
            {loading ? '인증 중...' : '인증하기 ✓'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── 완료 축하 모달 ──────────────────────────────
function CompletedModal({ challenge, onClose }) {
  const theme = getTheme(challenge.id);
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4" onClick={onClose}>
      <div
        className="w-full max-w-sm bg-white rounded-3xl p-8 text-center"
        onClick={e => e.stopPropagation()}
      >
        <div
          className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4"
          style={{ backgroundColor: theme.bg }}
        >
          <span className="material-icons text-4xl" style={{ color: theme.color }}>emoji_events</span>
        </div>
        <h2 className="text-xl font-extrabold text-slate-800 mb-2">챌린지 완료! 🎉</h2>
        <p className="text-sm text-slate-500 leading-relaxed mb-1">
          <span className="font-bold" style={{ color: theme.color }}>{challenge.title}</span>을<br />
          끝까지 완주했어요!
        </p>
        <p className="text-xs text-slate-400 mb-6">
          {challenge.durationDays}일 동안 꾸준히 해낸 당신은 정말 대단해요.
        </p>
        {challenge.badgeName && (
          <div
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold mb-5"
            style={{ backgroundColor: theme.bg, color: theme.color }}
          >
            <span className="material-icons text-base">stars</span>
            {challenge.badgeName} 배지 획득!
          </div>
        )}
        <button
          onClick={onClose}
          className="w-full py-3 rounded-xl text-sm font-bold text-white"
          style={{ backgroundColor: theme.color }}
        >
          닫기
        </button>
      </div>
    </div>
  );
}

// ─── 진행 중 챌린지 카드 (상단 강조 영역) ─────────────
function ActiveChallengeCard({ challenge, onCertify }) {
  const theme = getTheme(challenge.id);
  const achieved = challenge.myAchievedDays || 0;
  const total = challenge.durationDays;
  const progress = total ? Math.round((achieved / total) * 100) : 0;
  const daysLeft = total - achieved;
  const completed = challenge.myStatus === 'completed';
  const enc = getEncouragement(achieved, total, challenge.todayCertified, completed);

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
        {/* 헤더 */}
        <div className="flex items-start justify-between mb-4">
          <div>
            <p className="text-white/70 text-[11px] font-bold uppercase tracking-widest mb-1">참여 중인 챌린지</p>
            <h2 className="text-[17px] font-extrabold leading-snug">{challenge.title}</h2>
          </div>
          {!completed && (
            <span className="shrink-0 bg-white/20 text-white text-xs font-bold px-3 py-1 rounded-full ml-3">
              {daysLeft}일 남음
            </span>
          )}
          {completed && (
            <span className="shrink-0 bg-yellow-400/90 text-white text-xs font-bold px-3 py-1 rounded-full ml-3 flex items-center gap-1">
              <span className="material-icons text-xs">emoji_events</span> 완료
            </span>
          )}
        </div>

        {/* 격려 메시지 */}
        <div className="bg-white/15 rounded-xl px-3 py-2.5 mb-4">
          <p className="text-sm font-bold text-white">{enc.text}</p>
          <p className="text-xs text-white/75 mt-0.5">{enc.sub}</p>
        </div>

        {/* 진행률 */}
        <div className="flex items-center justify-between text-xs mb-2">
          <span className="text-white/80">{achieved}/{total}일 완료</span>
          <span className="font-bold">{progress}%</span>
        </div>
        <div className="w-full h-2.5 bg-white/20 rounded-full overflow-hidden mb-4">
          <div
            className="h-full bg-white rounded-full transition-all duration-700"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* 날짜 점 (최근 7일 인증 현황) */}
        {challenge.certifiedDates && challenge.certifiedDates.length > 0 && (
          <div className="flex items-center gap-1.5 mb-4">
            {Array.from({ length: Math.min(total, 14) }).map((_, i) => {
              const dayNum = achieved - (Math.min(total, 14) - 1) + i;
              const certified = dayNum > 0 && dayNum <= achieved;
              return (
                <div
                  key={i}
                  className="flex-1 h-1.5 rounded-full"
                  style={{ backgroundColor: certified ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.2)' }}
                />
              );
            })}
          </div>
        )}

        {/* 인증 버튼 */}
        {!completed && (
          challenge.todayCertified ? (
            <div className="flex items-center justify-center gap-2 bg-white/20 rounded-xl py-3">
              <span className="material-icons text-base text-yellow-200">check_circle</span>
              <span className="text-sm font-bold text-white">오늘 인증 완료 ✓</span>
            </div>
          ) : (
            <button
              onClick={onCertify}
              className="w-full py-3 bg-white rounded-xl text-sm font-extrabold transition-all hover:bg-white/90 active:scale-95"
              style={{ color: theme.color }}
            >
              오늘 인증하기 →
            </button>
          )
        )}
      </div>
    </div>
  );
}

// ─── 챌린지 목록 카드 ───────────────────────────────
function ChallengeCard({ challenge, onToggleJoin, onCertify, isLoggedIn }) {
  const theme = getTheme(challenge.id);
  const achieved = challenge.myAchievedDays || 0;
  const progress = challenge.durationDays ? Math.round((achieved / challenge.durationDays) * 100) : 0;
  const completed = challenge.myStatus === 'completed';

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden hover:shadow-md transition-all">
      <div
        className="h-24 flex items-center justify-center relative"
        style={{ background: `linear-gradient(135deg, ${theme.color}22 0%, ${theme.color}0d 100%)` }}
      >
        <span className="material-icons opacity-20 absolute right-4 bottom-2" style={{ fontSize: '64px', color: theme.color }}>
          {theme.icon}
        </span>
        <span className="material-icons relative z-10" style={{ fontSize: '36px', color: theme.color }}>
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
        {completed && (
          <span className="absolute bottom-2 left-2 flex items-center gap-0.5 bg-yellow-400 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full">
            <span className="material-icons" style={{ fontSize: '9px' }}>emoji_events</span>완료
          </span>
        )}
      </div>

      <div className="px-4 py-4">
        <h3 className="text-sm font-extrabold text-slate-800 leading-snug mb-1">{challenge.title}</h3>
        <p className="text-xs text-slate-400 leading-relaxed line-clamp-2 mb-3">{challenge.description}</p>

        <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1.5">
          <span className="flex items-center gap-1">
            <span className="material-icons text-xs">people</span>
            {(challenge.participantCount || 0).toLocaleString()}명 참여
          </span>
          {challenge.joinedByMe && (
            <span style={{ color: theme.color }} className="font-bold">{progress}%</span>
          )}
        </div>

        {challenge.joinedByMe && (
          <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden mb-3">
            <div className="h-full rounded-full transition-all" style={{ width: `${progress}%`, backgroundColor: theme.color }} />
          </div>
        )}

        {/* 버튼 */}
        {challenge.joinedByMe && !completed ? (
          <div className="flex gap-1.5">
            {challenge.todayCertified ? (
              <div className="flex-1 py-2.5 rounded-xl bg-slate-50 text-center text-xs font-bold text-slate-400 flex items-center justify-center gap-1">
                <span className="material-icons text-xs" style={{ color: theme.color }}>check_circle</span>오늘 완료
              </div>
            ) : (
              <button
                onClick={() => onCertify(challenge)}
                className="flex-1 py-2.5 rounded-xl text-xs font-bold text-white transition-all hover:opacity-90 active:scale-95"
                style={{ backgroundColor: theme.color }}
              >
                인증하기
              </button>
            )}
            <button
              onClick={() => onToggleJoin(challenge.id)}
              className="px-3 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-400 hover:bg-slate-50 transition-colors"
            >
              취소
            </button>
          </div>
        ) : completed ? (
          <div
            className="w-full py-2.5 rounded-xl text-xs font-bold text-center flex items-center justify-center gap-1"
            style={{ backgroundColor: theme.bg, color: theme.color }}
          >
            <span className="material-icons text-sm">emoji_events</span>챌린지 완료!
          </div>
        ) : (
          <button
            onClick={() => isLoggedIn ? onToggleJoin(challenge.id) : null}
            className="w-full py-2.5 rounded-xl text-xs font-bold text-white transition-all hover:opacity-90 active:scale-95"
            style={{ backgroundColor: theme.color }}
          >
            참여하기
          </button>
        )}
      </div>
    </div>
  );
}

// ─── 메인 페이지 ──────────────────────────────────
function Challenge() {
  const navigate = useNavigate();
  const isLoggedIn = !!localStorage.getItem('accessToken');

  const [challenges, setChallenges] = useState([]);
  const [myChallenges, setMyChallenges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [certifyTarget, setCertifyTarget] = useState(null);   // 인증 모달 대상
  const [completedChallenge, setCompletedChallenge] = useState(null); // 완료 축하 모달

  const loadChallenges = useCallback(async () => {
    setLoading(true);
    try {
      const fetcher = isLoggedIn ? fetchWithAuth : (url) => fetch(url).then(r => r.json());
      const [allRes, myRes] = await Promise.allSettled([
        fetcher('/api/challenges'),
        isLoggedIn ? fetchWithAuth('/api/challenges/my') : Promise.resolve({ success: false }),
      ]);

      if (allRes.status === 'fulfilled' && allRes.value.success) {
        const allList = allRes.value.data || [];
        // 참여 중 챌린지의 오늘 인증 여부를 병합
        if (isLoggedIn && myRes.status === 'fulfilled' && myRes.value.success) {
          const myList = myRes.value.data || [];
          const myMap = Object.fromEntries(myList.map(c => [c.id, c]));
          // certifiedDates 로드 (병렬)
          const statusFetches = myList.map(c =>
            fetchWithAuth(`/api/challenges/${c.id}/certify/status`)
              .then(r => r.success ? { id: c.id, ...r.data } : { id: c.id })
              .catch(() => ({ id: c.id }))
          );
          const statuses = await Promise.all(statusFetches);
          const statusMap = Object.fromEntries(statuses.map(s => [s.id, s]));
          const merged = allList.map(c => myMap[c.id]
            ? { ...c, ...myMap[c.id], todayCertified: !!statusMap[c.id]?.todayCertified, certifiedDates: statusMap[c.id]?.certifiedDates || [] }
            : c
          );
          setChallenges(merged);
          setMyChallenges(myList.map(c => ({
            ...c,
            todayCertified: !!statusMap[c.id]?.todayCertified,
            certifiedDates: statusMap[c.id]?.certifiedDates || [],
          })));
        } else {
          setChallenges(allList);
          setMyChallenges([]);
        }
      }
    } catch {
      // 무시
    } finally {
      setLoading(false);
    }
  }, [isLoggedIn]);

  useEffect(() => { loadChallenges(); }, [loadChallenges]);

  const handleToggleJoin = async (challengeId) => {
    if (!isLoggedIn) { navigate('/login'); return; }
    try {
      const data = await fetchWithAuth(`/api/challenges/${challengeId}/join`, { method: 'POST' });
      if (data.success) {
        loadChallenges();
        // 참여하기 클릭 시 상단 배너가 보이도록 스크롤
        if (data.data?.joined) {
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }
      }
    } catch { /* 무시 */ }
  };

  const handleCertifySuccess = (data) => {
    setCertifyTarget(null);
    const completed = data.data?.completed;
    if (completed) setCompletedChallenge(certifyTarget);
    loadChallenges();
  };

  const activeChallenges = myChallenges.filter(c => c.myStatus === 'ongoing');

  // 그리드 정렬: 참여중 → 완료 → 미참여
  const sortedChallenges = [...challenges].sort((a, b) => {
    const rank = c => c.myStatus === 'ongoing' ? 0 : c.myStatus === 'completed' ? 1 : 2;
    return rank(a) - rank(b);
  });

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

        <div className="mb-5">
          <h1 className="text-[22px] font-extrabold tracking-tight text-slate-800">챌린지</h1>
          <p className="text-xs text-slate-400 mt-0.5">함께하면 더 쉬운 휴식 습관 만들기</p>
        </div>

        {/* 참여 중인 챌린지 목록 */}
        {isLoggedIn && (
          activeChallenges.length > 0 ? (
            <div className="mb-2">
              <div className="flex items-center justify-between mb-3 px-0.5">
                <p className="text-sm font-extrabold text-slate-700">참여 중인 챌린지</p>
                <span className="text-xs font-bold text-primary">{activeChallenges.length}개</span>
              </div>
              <div className="grid grid-cols-2 gap-3 mb-6">
                {activeChallenges.map(c => (
                  <ChallengeCard
                    key={c.id}
                    challenge={c}
                    onToggleJoin={handleToggleJoin}
                    onCertify={() => setCertifyTarget(c)}
                    isLoggedIn={isLoggedIn}
                  />
                ))}
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-dashed border-slate-200 p-6 mb-6 text-center">
              <span className="material-icons text-3xl text-slate-200 block mb-2">emoji_events</span>
              <p className="text-sm font-semibold text-slate-400">아직 참여 중인 챌린지가 없어요</p>
              <p className="text-xs text-slate-300 mt-1">아래에서 챌린지를 골라 참여해보세요</p>
            </div>
          )
        )}

        {/* 완료한 챌린지 요약 */}
        {myChallenges.filter(c => c.myStatus === 'completed').length > 0 && (
          <div className="mb-5 px-4 py-3 bg-yellow-50 rounded-2xl border border-yellow-100 flex items-center gap-3">
            <span className="material-icons text-yellow-400 text-2xl">emoji_events</span>
            <div>
              <p className="text-sm font-bold text-slate-700">
                {myChallenges.filter(c => c.myStatus === 'completed').length}개의 챌린지를 완주했어요!
              </p>
              <p className="text-xs text-slate-400">꾸준함이 당신의 가장 큰 자산이에요 🌟</p>
            </div>
          </div>
        )}

        {/* 전체 챌린지 목록 */}
        <div className="flex items-center justify-between mb-3 px-0.5">
          <p className="text-sm font-extrabold text-slate-700">전체 챌린지</p>
          <span className="text-xs text-slate-400">{challenges.length}개</span>
        </div>

        {sortedChallenges.length === 0 ? (
          <div className="text-center py-16">
            <span className="material-icons text-4xl text-slate-200 block mb-2">emoji_events</span>
            <p className="text-sm text-slate-400">진행 중인 챌린지가 없습니다</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {sortedChallenges.map(challenge => (
              <ChallengeCard
                key={challenge.id}
                challenge={challenge}
                onToggleJoin={handleToggleJoin}
                onCertify={c => setCertifyTarget(c)}
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

      {/* 인증 모달 */}
      {certifyTarget && (
        <CertifyModal
          challenge={certifyTarget}
          onClose={() => setCertifyTarget(null)}
          onSuccess={handleCertifySuccess}
        />
      )}

      {/* 완료 축하 모달 */}
      {completedChallenge && (
        <CompletedModal
          challenge={completedChallenge}
          onClose={() => setCompletedChallenge(null)}
        />
      )}
    </div>
  );
}

export default Challenge;
