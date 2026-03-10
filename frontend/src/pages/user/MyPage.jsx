import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchWithAuth } from '../../api/fetchWithAuth';
import UserNavbar from '../../components/user/UserNavbar';

const REST_TYPE_NAMES = {
  physical:  { label: '신체적 이완', icon: 'fitness_center', color: 'text-red-500' },
  mental:    { label: '정신적 고요', icon: 'spa', color: 'text-emerald-500' },
  sensory:   { label: '감각의 정화', icon: 'visibility_off', color: 'text-amber-500' },
  emotional: { label: '정서적 지지', icon: 'favorite', color: 'text-pink-500' },
  social:    { label: '사회적 휴식', icon: 'groups', color: 'text-purple-500' },
  nature:    { label: '자연과의 연결', icon: 'forest', color: 'text-green-600' },
  creative:  { label: '창조적 몰입', icon: 'brush', color: 'text-orange-500' },
};

const TYPE_RATIO_COLORS = ['bg-emerald-400', 'bg-blue-400', 'bg-amber-400', 'bg-rose-400', 'bg-purple-400', 'bg-orange-400', 'bg-teal-400'];

function formatMinutes(minutes) {
  if (!minutes) return '0분';
  if (minutes < 60) return `${minutes}분`;
  return `${Math.floor(minutes / 60)}시간 ${minutes % 60 > 0 ? `${minutes % 60}분` : ''}`.trim();
}

function formatDate(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  const now = new Date();
  const diffDays = Math.floor((now - d) / 86400000);
  if (diffDays === 0) return '오늘';
  if (diffDays === 1) return '어제';
  return `${d.getMonth() + 1}월 ${d.getDate()}일`;
}

function MyPage() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [monthlyStats, setMonthlyStats] = useState(null);
  const [latestDiagnosis, setLatestDiagnosis] = useState(null);
  const [recentLogs, setRecentLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  const [nicknameEditing, setNicknameEditing] = useState(false);
  const [nicknameInput, setNicknameInput] = useState('');
  const [nicknameSaving, setNicknameSaving] = useState(false);
  const [nicknameError, setNicknameError] = useState(null);

  useEffect(() => {
    loadAll();
  }, []);

  const loadAll = async () => {
    setLoading(true);
    try {
      const [profileRes, statsRes, diagRes, logsRes] = await Promise.allSettled([
        fetchWithAuth('/api/user/profile'),
        fetchWithAuth('/api/stats/monthly'),
        fetchWithAuth('/api/diagnosis/latest'),
        fetchWithAuth('/api/rest-logs?page=1&size=5'),
      ]);

      if (profileRes.status === 'fulfilled' && profileRes.value.success) {
        setProfile(profileRes.value.data);
      }
      if (statsRes.status === 'fulfilled' && statsRes.value.success) {
        setMonthlyStats(statsRes.value.data);
      }
      if (diagRes.status === 'fulfilled' && diagRes.value.success) {
        setLatestDiagnosis(diagRes.value.data);
      }
      if (logsRes.status === 'fulfilled' && logsRes.value.success) {
        setRecentLogs(logsRes.value.data?.logs || []);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  const handleNicknameEdit = () => {
    setNicknameInput(profile?.user?.nickname || '');
    setNicknameError(null);
    setNicknameEditing(true);
  };

  const handleNicknameSave = async () => {
    setNicknameError(null);
    if (!nicknameInput.trim()) { setNicknameError('닉네임을 입력해주세요.'); return; }
    if (nicknameInput.length < 2 || nicknameInput.length > 20) { setNicknameError('2~20자로 입력해주세요.'); return; }

    try {
      setNicknameSaving(true);
      const data = await fetchWithAuth('/api/user/nickname', {
        method: 'PATCH',
        body: JSON.stringify({ nickname: nicknameInput.trim() }),
      });
      if (!data.success) { setNicknameError(data.message); return; }

      // 로컬 상태 & localStorage 갱신
      const trimmed = nicknameInput.trim();
      setProfile(prev => ({ ...prev, user: { ...prev.user, nickname: trimmed } }));
      const stored = JSON.parse(localStorage.getItem('user') || '{}');
      localStorage.setItem('user', JSON.stringify({ ...stored, nickname: trimmed }));
      setNicknameEditing(false);
    } catch {
      setNicknameError('저장에 실패했습니다. 다시 시도해주세요.');
    } finally {
      setNicknameSaving(false);
    }
  };

  const primaryType = latestDiagnosis?.primaryRestType
    ? REST_TYPE_NAMES[latestDiagnosis.primaryRestType]
    : null;

  // typeRatioJson 파싱
  let typeRatios = [];
  if (monthlyStats?.typeRatioJson) {
    try {
      const parsed = JSON.parse(monthlyStats.typeRatioJson);
      typeRatios = Object.entries(parsed)
        .map(([type, pct]) => ({ type, pct, ...REST_TYPE_NAMES[type] }))
        .sort((a, b) => b.pct - a.pct)
        .slice(0, 4);
    } catch {
      // 파싱 실패 시 무시
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F9F7F2]">
        <UserNavbar />
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
        </div>
      </div>
    );
  }

  const user = profile?.user;
  const stats = profile?.stats || {};

  return (
    <div className="min-h-screen bg-[#F9F7F2]">
      <UserNavbar />
      <main className="max-w-7xl mx-auto px-6 py-10 pb-24 md:pb-10">
        <div className="grid grid-cols-12 gap-6">

          {/* Profile Section */}
          <section className="col-span-12 lg:col-span-8 p-8 rounded-2xl bg-white border border-slate-200 flex flex-col md:flex-row items-center gap-8 shadow-sm">
            <div className="relative group">
              <div className="w-32 h-32 rounded-full bg-slate-200 border-4 border-white ring-1 ring-slate-100 shadow-md overflow-hidden flex items-center justify-center">
                <span className="material-icons text-slate-400 text-5xl">person</span>
              </div>
            </div>
            <div className="flex-1 text-center md:text-left">
              <div className="flex flex-col md:flex-row md:items-center gap-3 mb-2">
                {nicknameEditing ? (
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2">
                      <input
                        className="text-2xl font-bold border-b-2 border-primary bg-transparent outline-none text-slate-900 w-48"
                        value={nicknameInput}
                        onChange={e => setNicknameInput(e.target.value)}
                        maxLength={20}
                        autoFocus
                        onKeyDown={e => { if (e.key === 'Enter') handleNicknameSave(); if (e.key === 'Escape') setNicknameEditing(false); }}
                      />
                      <button
                        onClick={handleNicknameSave}
                        disabled={nicknameSaving}
                        className="px-3 py-1 bg-primary text-white text-sm font-bold rounded-lg hover:bg-primary/90 disabled:opacity-50"
                      >
                        {nicknameSaving ? '저장 중' : '저장'}
                      </button>
                      <button
                        onClick={() => setNicknameEditing(false)}
                        className="px-3 py-1 bg-slate-100 text-slate-500 text-sm font-bold rounded-lg hover:bg-slate-200"
                      >
                        취소
                      </button>
                    </div>
                    {nicknameError && <p className="text-xs text-red-500">{nicknameError}</p>}
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <h1 className="text-3xl font-bold text-slate-900">
                      {user?.nickname || '사용자'} <span className="text-lg font-normal text-slate-400 ml-1">님</span>
                    </h1>
                    <button
                      onClick={handleNicknameEdit}
                      className="p-1 rounded-lg text-slate-400 hover:text-primary hover:bg-green-50 transition-colors"
                      title="닉네임 변경"
                    >
                      <span className="material-icons text-lg">edit</span>
                    </button>
                  </div>
                )}
                {profile?.badgeCount > 0 && (
                  <span className="inline-flex items-center px-3 py-1 rounded-full bg-amber-50 text-amber-600 text-xs font-bold">
                    <span className="material-icons text-sm mr-1">emoji_events</span>
                    배지 {profile.badgeCount}개 보유
                  </span>
                )}
              </div>
              <p className="text-slate-500 mb-6 font-medium">
                {user?.email}
              </p>
              <div className="flex flex-wrap gap-3 justify-center md:justify-start">
                <div className="bg-[#F9F7F2] px-5 py-3 rounded-xl border border-slate-100">
                  <span className="text-xs text-slate-400 block font-semibold mb-1">총 휴식 시간</span>
                  <span className="text-xl font-bold text-slate-800">{formatMinutes(stats.totalRestMinutes)}</span>
                </div>
                <div className="bg-[#F9F7F2] px-5 py-3 rounded-xl border border-slate-100">
                  <span className="text-xs text-slate-400 block font-semibold mb-1">총 기록 수</span>
                  <span className="text-xl font-bold text-slate-800">{stats.totalLogs || 0}개</span>
                </div>
              </div>
            </div>
          </section>

          {/* Rest Type Card */}
          <section className="col-span-12 lg:col-span-4 p-8 rounded-2xl bg-gradient-to-br from-primary to-[#10b981] text-white flex flex-col justify-between shadow-lg">
            <div>
              <h3 className="text-white/80 font-semibold mb-1">나의 휴식 성향</h3>
              {primaryType ? (
                <>
                  <h2 className="text-3xl font-extrabold mb-4 leading-tight">{primaryType.label}</h2>
                  <div className="flex items-center gap-2 mb-4">
                    <span className="material-icons text-white/80 text-2xl">{primaryType.icon}</span>
                    {latestDiagnosis?.stressIndex != null && (
                      <span className="text-sm font-semibold text-white/80">
                        스트레스 지수 {latestDiagnosis.stressIndex}점
                      </span>
                    )}
                  </div>
                </>
              ) : (
                <>
                  <h2 className="text-2xl font-extrabold mb-4">아직 진단 전이에요</h2>
                  <p className="text-sm text-white/80 mb-4">진단을 받으면 나의 휴식 유형을 알 수 있어요</p>
                </>
              )}
            </div>
            <button
              onClick={() => navigate('/rest-test')}
              className="w-full py-3.5 bg-white text-primary rounded-xl font-bold hover:bg-opacity-90 transition-all shadow-md flex items-center justify-center gap-2"
            >
              <span>{primaryType ? '테스트 다시하기' : '진단 시작하기'}</span>
              <span className="material-icons text-sm">chevron_right</span>
            </button>
          </section>

          {/* Monthly Stats */}
          <section className="col-span-12 lg:col-span-7 p-8 rounded-2xl bg-white border border-slate-200 shadow-sm">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h3 className="text-xl font-bold flex items-center gap-2 text-slate-900">
                  <span className="material-icons text-primary">bar_chart</span>
                  이번 달 휴식 통계
                </h3>
                <p className="text-sm text-slate-500 mt-1">
                  {monthlyStats?.yearMonth || new Date().toISOString().slice(0, 7)} 기준
                </p>
              </div>
              <button
                onClick={() => navigate('/rest-record')}
                className="text-sm text-primary font-bold hover:underline"
              >
                전체 기록 →
              </button>
            </div>

            {monthlyStats ? (
              <div className="space-y-2">
                <div className="grid grid-cols-3 gap-4 mb-6">
                  <div className="bg-[#F9F7F2] rounded-xl p-4 text-center">
                    <p className="text-2xl font-bold text-slate-800">{monthlyStats.recordCount || 0}</p>
                    <p className="text-xs text-slate-400 mt-1">기록 횟수</p>
                  </div>
                  <div className="bg-[#F9F7F2] rounded-xl p-4 text-center">
                    <p className="text-2xl font-bold text-slate-800">{formatMinutes(monthlyStats.totalRestMinutes)}</p>
                    <p className="text-xs text-slate-400 mt-1">총 휴식 시간</p>
                  </div>
                  <div className="bg-[#F9F7F2] rounded-xl p-4 text-center">
                    <p className="text-2xl font-bold text-slate-800">
                      {monthlyStats.avgEmotionScore ? `${monthlyStats.avgEmotionScore.toFixed(1)}` : '-'}
                    </p>
                    <p className="text-xs text-slate-400 mt-1">평균 기분</p>
                  </div>
                </div>
                {typeRatios.length > 0 && (
                  <div className="space-y-3">
                    {typeRatios.map((item, i) => (
                      <div key={item.type}>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="font-medium text-slate-700">{item.label}</span>
                          <span className="text-slate-400">{item.pct}%</span>
                        </div>
                        <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                          <div
                            className={`h-full ${TYPE_RATIO_COLORS[i]} rounded-full`}
                            style={{ width: `${item.pct}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-10">
                <span className="material-icons text-4xl text-slate-300 block mb-2">bar_chart</span>
                <p className="text-slate-400 text-sm">아직 이번 달 기록이 없어요</p>
                <button
                  onClick={() => navigate('/rest-record')}
                  className="mt-3 text-primary text-sm font-bold hover:underline"
                >
                  첫 번째 휴식 기록하기 →
                </button>
              </div>
            )}
          </section>

          {/* Recent Activity */}
          <section className="col-span-12 lg:col-span-5 p-8 rounded-2xl bg-white border border-slate-200 shadow-sm flex flex-col">
            <h3 className="text-xl font-bold mb-6 flex items-center gap-2 text-slate-900">
              <span className="material-icons text-primary">history</span>
              최근 활동 기록
            </h3>

            {recentLogs.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center text-center">
                <span className="material-icons text-4xl text-slate-300 block mb-2">event_note</span>
                <p className="text-slate-400 text-sm">최근 활동이 없어요</p>
              </div>
            ) : (
              <div className="space-y-2 flex-1">
                {recentLogs.map((log) => (
                  <div key={log.id} className="flex items-center gap-4 p-3 rounded-xl hover:bg-[#F9F7F2] transition-colors">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shadow-sm shrink-0">
                      <span className="material-icons text-primary text-lg">self_improvement</span>
                    </div>
                    <div className="flex-1 border-b border-slate-100 pb-2">
                      <div className="flex justify-between items-center mb-0.5">
                        <span className="font-bold text-slate-800 text-sm">{log.memo || '휴식 기록'}</span>
                        <span className="text-xs font-medium text-slate-400">{formatDate(log.startTime)}</span>
                      </div>
                      {log.emotionAfter != null && (
                        <p className="text-xs text-slate-500">기분 점수: {log.emotionAfter}/10</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
            <button
              onClick={() => navigate('/rest-record')}
              className="mt-6 py-2 text-sm font-bold text-slate-400 hover:text-primary transition-colors border-t border-slate-100 pt-4"
            >
              모든 기록 보기 →
            </button>
          </section>

          {/* Settings */}
          <section className="col-span-12 mt-2">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { icon: 'person_outline', label: '개인정보 관리', action: () => navigate('/settings/profile') },
                { icon: 'security', label: '보안 및 로그인', action: () => navigate('/settings/security') },
                { icon: 'tune', label: '맞춤 추천 설정', action: () => navigate('/settings/preferences') },
                { icon: 'logout', label: '로그아웃', action: handleLogout, red: true },
              ].map((item, i) => (
                <button
                  key={i}
                  onClick={item.action}
                  className={`flex items-center gap-4 p-5 rounded-2xl bg-white border border-slate-100 shadow-sm hover:shadow-md transition-all group w-full text-left ${item.red ? 'hover:border-red-100' : 'hover:border-primary/30'}`}
                >
                  <div className={`p-2 rounded-lg bg-[#F9F7F2] transition-colors ${item.red ? 'group-hover:bg-red-50 group-hover:text-red-400' : 'group-hover:bg-green-50 group-hover:text-primary'} text-slate-400`}>
                    <span className="material-icons">{item.icon}</span>
                  </div>
                  <span className={`text-sm font-bold ${item.red ? 'text-red-400' : 'text-slate-700'}`}>{item.label}</span>
                </button>
              ))}
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}

export default MyPage;
