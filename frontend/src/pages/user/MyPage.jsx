import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchWithAuth } from '../../api/fetchWithAuth';
import UserNavbar from '../../components/user/UserNavbar';

const REST_TYPE_NAMES = {
  physical:  { label: '신체의 이완', icon: 'fitness_center', color: '#4CAF82' },
  mental:    { label: '정신적 고요', icon: 'spa',            color: '#5B8DEF' },
  sensory:   { label: '감각의 정화', icon: 'visibility_off', color: '#9B6DFF' },
  emotional: { label: '정서적 지지', icon: 'favorite',       color: '#FF7BAC' },
  social:    { label: '사회적 휴식', icon: 'groups',         color: '#FF9A3C' },
  nature:    { label: '자연의 연결', icon: 'forest',         color: '#2ECC9A' },
  creative:  { label: '창조적 몰입', icon: 'brush',          color: '#FFB830' },
};

const TYPE_RATIO_COLORS = ['#4CAF82', '#5B8DEF', '#9B6DFF', '#FF7BAC', '#FF9A3C', '#FFB830', '#2ECC9A'];

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

function MenuRow({ icon, iconBg, iconColor, label, sublabel, onClick, red }) {
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center gap-3 px-5 py-4 hover:bg-slate-50 transition-colors text-left"
    >
      <div
        className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
        style={{ backgroundColor: red ? '#FEF2F2' : iconBg }}
      >
        <span className="material-icons text-[18px]" style={{ color: red ? '#EF4444' : iconColor }}>
          {icon}
        </span>
      </div>
      <div className="flex-1">
        <p className={`text-sm font-semibold ${red ? 'text-red-500' : 'text-slate-700'}`}>{label}</p>
        {sublabel && <p className="text-xs text-slate-400 mt-0.5">{sublabel}</p>}
      </div>
      {!red && <span className="material-icons text-slate-300 text-xl">chevron_right</span>}
    </button>
  );
}

function MenuGroup({ title, children }) {
  return (
    <div className="px-4">
      {title && (
        <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest px-1 mb-2">
          {title}
        </p>
      )}
      <div className="bg-white rounded-2xl overflow-hidden divide-y divide-slate-50">
        {children}
      </div>
    </div>
  );
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
      <div className="min-h-screen bg-[#F7F7F8]">
        <UserNavbar />
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
        </div>
      </div>
    );
  }

  const user = profile?.user;
  const stats = profile?.stats || {};
  const avatarLetter = (user?.nickname || '?')[0];

  return (
    <div className="min-h-screen bg-[#F7F7F8]">
      <UserNavbar />

      <main className="max-w-lg mx-auto pb-28">

        {/* ── 프로필 헤더 ── */}
        <div className="bg-white px-6 pt-8 pb-6">
          <div className="flex items-center gap-4">
            {/* 아바타 */}
            <div
              className="w-16 h-16 rounded-full flex items-center justify-center text-white text-2xl font-black shrink-0 shadow-sm"
              style={{ background: 'linear-gradient(135deg, #10b981 0%, #0d9488 100%)' }}
            >
              {avatarLetter}
            </div>

            {/* 닉네임 + 이메일 */}
            <div className="flex-1 min-w-0">
              {nicknameEditing ? (
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <input
                      className="text-lg font-bold border-b-2 border-primary bg-transparent outline-none text-slate-900 w-36"
                      value={nicknameInput}
                      onChange={e => setNicknameInput(e.target.value)}
                      maxLength={20}
                      autoFocus
                      onKeyDown={e => {
                        if (e.key === 'Enter') handleNicknameSave();
                        if (e.key === 'Escape') setNicknameEditing(false);
                      }}
                    />
                    <button
                      onClick={handleNicknameSave}
                      disabled={nicknameSaving}
                      className="px-3 py-1 bg-primary text-white text-xs font-bold rounded-lg disabled:opacity-50"
                    >
                      {nicknameSaving ? '저장 중' : '저장'}
                    </button>
                    <button
                      onClick={() => setNicknameEditing(false)}
                      className="px-3 py-1 bg-slate-100 text-slate-500 text-xs font-bold rounded-lg"
                    >
                      취소
                    </button>
                  </div>
                  {nicknameError && (
                    <p className="text-xs text-red-500 flex items-center gap-1">
                      <span className="material-icons text-sm">error_outline</span>
                      {nicknameError}
                    </p>
                  )}
                </div>
              ) : (
                <div className="flex items-center gap-1.5 mb-0.5">
                  <h2 className="text-xl font-bold text-slate-900 truncate">{user?.nickname || '사용자'}</h2>
                  <button
                    onClick={handleNicknameEdit}
                    className="p-1 rounded-lg text-slate-300 hover:text-primary hover:bg-green-50 transition-colors shrink-0"
                  >
                    <span className="material-icons text-[16px]">edit</span>
                  </button>
                </div>
              )}
              <p className="text-sm text-slate-400 truncate">{user?.email}</p>
              {user?.commaNo && (
                <span className="inline-block mt-1.5 px-2 py-0.5 bg-primary/10 text-primary text-[11px] font-bold rounded-full">
                  {user.commaNo}
                </span>
              )}
            </div>

            {/* 배지 배너 */}
            {profile?.badgeCount > 0 && (
              <div className="shrink-0 text-center">
                <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center mx-auto">
                  <span className="material-icons text-amber-400 text-lg">emoji_events</span>
                </div>
                <p className="text-[10px] font-bold text-amber-400 mt-0.5">{profile.badgeCount}개</p>
              </div>
            )}
          </div>

          {/* 빠른 통계 스트립 */}
          <div className="grid grid-cols-3 mt-6 pt-5 border-t border-slate-100">
            <div className="text-center">
              <p className="text-lg font-black text-slate-800">{formatMinutes(stats.totalRestMinutes)}</p>
              <p className="text-[11px] text-slate-400 mt-0.5">총 휴식 시간</p>
            </div>
            <div className="text-center border-x border-slate-100">
              <p className="text-lg font-black text-slate-800">{stats.totalLogs || 0}</p>
              <p className="text-[11px] text-slate-400 mt-0.5">총 기록</p>
            </div>
            <div className="text-center">
              <p className="text-lg font-black text-slate-800">{profile?.badgeCount || 0}</p>
              <p className="text-[11px] text-slate-400 mt-0.5">배지</p>
            </div>
          </div>
        </div>

        <div className="h-3" />

        {/* ── 나의 휴식 유형 ── */}
        <div className="px-4">
          <div
            className="rounded-2xl p-5 flex items-center gap-4 relative overflow-hidden"
            style={{
              background: primaryType
                ? `linear-gradient(135deg, ${primaryType.color}ee 0%, ${primaryType.color}bb 100%)`
                : 'linear-gradient(135deg, #10b981 0%, #0d9488 100%)',
            }}
          >
            <div className="absolute -right-6 -top-6 w-28 h-28 rounded-full bg-white/10 pointer-events-none" />
            <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center shrink-0">
              <span className="material-icons text-white text-2xl">
                {primaryType?.icon || 'psychology'}
              </span>
            </div>
            <div className="flex-1">
              <p className="text-white/75 text-[11px] font-semibold">나의 휴식 유형</p>
              <p className="text-white text-lg font-black leading-tight">
                {primaryType?.label || '아직 진단 전이에요'}
              </p>
              {latestDiagnosis?.stressIndex != null && (
                <p className="text-white/70 text-xs mt-0.5">스트레스 지수 {latestDiagnosis.stressIndex}점</p>
              )}
            </div>
            <button
              onClick={() => navigate('/rest-test')}
              className="shrink-0 px-3 py-1.5 bg-white/20 text-white text-xs font-bold rounded-xl hover:bg-white/30 transition-colors"
            >
              {primaryType ? '재진단' : '진단하기'}
            </button>
          </div>
        </div>

        <div className="h-3" />

        {/* ── 이번 달 요약 ── */}
        <div className="px-4">
          <div className="bg-white rounded-2xl p-5">
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm font-bold text-slate-700">이번 달 휴식 요약</p>
              <button onClick={() => navigate('/rest-record')} className="text-xs text-primary font-bold">
                전체 보기
              </button>
            </div>

            {monthlyStats ? (
              <>
                <div className="grid grid-cols-3 gap-3 mb-4">
                  {[
                    { label: '기록', value: monthlyStats.recordCount || 0, unit: '회' },
                    { label: '휴식 시간', value: formatMinutes(monthlyStats.totalRestMinutes), unit: '' },
                    { label: '평균 기분', value: monthlyStats.avgEmotionScore ? monthlyStats.avgEmotionScore.toFixed(1) : '-', unit: monthlyStats.avgEmotionScore ? '점' : '' },
                  ].map((s) => (
                    <div key={s.label} className="bg-slate-50 rounded-xl p-3 text-center">
                      <p className="text-base font-black text-slate-800">{s.value}{s.unit}</p>
                      <p className="text-[10px] text-slate-400 mt-0.5">{s.label}</p>
                    </div>
                  ))}
                </div>

                {typeRatios.length > 0 ? (
                  <div className="space-y-2.5">
                    <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-3">휴식 유형 비율</p>
                    {typeRatios.map((item, i) => (
                      <div key={item.type}>
                        <div className="flex justify-between text-xs mb-1">
                          <div className="flex items-center gap-1.5">
                            <span className="material-icons text-[13px]" style={{ color: item.color }}>{item.icon}</span>
                            <span className="font-medium text-slate-600">{item.label}</span>
                          </div>
                          <span className="font-bold" style={{ color: item.color }}>{item.pct}%</span>
                        </div>
                        <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all duration-700"
                            style={{ width: `${item.pct}%`, backgroundColor: item.color }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-4">
                    <span className="material-icons text-2xl text-slate-200 block mb-1">pie_chart</span>
                    <p className="text-xs text-slate-400">유형별 비율 데이터가 없어요</p>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-8">
                <span className="material-icons text-3xl text-slate-200 block mb-2">insert_chart</span>
                <p className="text-sm font-semibold text-slate-400">아직 이번 달 기록이 없어요</p>
                <p className="text-xs text-slate-300 mt-1">휴식을 기록하면 통계가 나타나요</p>
                <button
                  onClick={() => navigate('/rest-record')}
                  className="mt-4 px-4 py-2 bg-primary text-white text-xs font-bold rounded-xl"
                >
                  첫 기록 남기기
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="h-3" />

        {/* ── 최근 활동 ── */}
        <div className="px-4">
          <div className="bg-white rounded-2xl overflow-hidden">
            <div className="px-5 pt-4 pb-2 flex items-center justify-between">
              <p className="text-sm font-bold text-slate-700">최근 휴식 기록</p>
              <button onClick={() => navigate('/rest-record')} className="text-xs text-primary font-bold">
                전체 보기
              </button>
            </div>
            {recentLogs.length > 0 ? (
              <div className="divide-y divide-slate-50">
                {recentLogs.map((log) => {
                  const typeInfo = log.restType ? REST_TYPE_NAMES[log.restType] : null;
                  return (
                    <div key={log.id} className="flex items-center gap-3 px-5 py-3.5">
                      <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0"
                        style={{ backgroundColor: typeInfo ? typeInfo.color + '18' : '#ECFDF5' }}>
                        <span className="material-icons text-sm"
                          style={{ color: typeInfo ? typeInfo.color : '#10b981' }}>
                          {typeInfo ? typeInfo.icon : 'self_improvement'}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-slate-700 truncate">{log.memo || (typeInfo?.label || '휴식 기록')}</p>
                        <div className="flex items-center gap-2 mt-0.5">
                          {typeInfo && <span className="text-[10px] font-bold" style={{ color: typeInfo.color }}>{typeInfo.label}</span>}
                          {log.emotionAfter != null && (
                            <p className="text-xs text-slate-400">기분 {log.emotionAfter}/10</p>
                          )}
                        </div>
                      </div>
                      <span className="text-xs text-slate-400 shrink-0">{formatDate(log.startTime)}</span>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8 px-5">
                <span className="material-icons text-3xl text-slate-200 block mb-2">history</span>
                <p className="text-sm font-semibold text-slate-400">아직 기록이 없어요</p>
                <p className="text-xs text-slate-300 mt-1">오늘 휴식을 기록해보세요</p>
              </div>
            )}
          </div>
        </div>

        <div className="h-3" />

        {/* ── 메뉴 그룹: 기록 ── */}
        <MenuGroup title="기록">
          <MenuRow icon="event_note"     iconBg="#ECFDF5" iconColor="#10b981" label="휴식 기록"   onClick={() => navigate('/rest-record')} />
          <MenuRow icon="psychology"     iconBg="#EFF6FF" iconColor="#5B8DEF" label="진단 기록"   sublabel="진단 유형 히스토리" onClick={() => navigate('/records/diagnosis')} />
          <MenuRow icon="favorite"       iconBg="#FFF0F7" iconColor="#FF7BAC" label="감정 기록"   sublabel="감정 변화 히스토리" onClick={() => navigate('/records/emotion')} />
        </MenuGroup>

        <div className="h-3" />

        {/* ── 메뉴 그룹: 통계 ── */}
        <MenuGroup title="통계">
          <MenuRow icon="bar_chart"   iconBg="#ECFDF5" iconColor="#10b981" label="휴식 활동 통계" onClick={() => navigate('/stats/rest')} />
          <MenuRow icon="analytics"  iconBg="#EFF6FF" iconColor="#5B8DEF" label="진단 유형 통계" onClick={() => navigate('/stats/diagnosis')} />
          <MenuRow icon="show_chart" iconBg="#FFF0F7" iconColor="#FF7BAC" label="감정 변화 통계" onClick={() => navigate('/stats/emotion')} />
        </MenuGroup>

        <div className="h-3" />

        {/* ── 메뉴 그룹: 설정 ── */}
        <MenuGroup title="설정">
          <MenuRow icon="person_outline"  iconBg="#F8FAFC" iconColor="#64748B" label="개인정보 관리"   onClick={() => navigate('/settings/profile')} />
          <MenuRow icon="security"        iconBg="#F8FAFC" iconColor="#64748B" label="보안 및 로그인"  onClick={() => navigate('/settings/security')} />
          <MenuRow icon="tune"            iconBg="#F8FAFC" iconColor="#64748B" label="맞춤 추천 설정"  onClick={() => navigate('/settings/preferences')} />
          <MenuRow icon="notifications"   iconBg="#F8FAFC" iconColor="#64748B" label="알림 설정"      onClick={() => navigate('/notifications')} />
        </MenuGroup>

        <div className="h-3" />

        {/* ── 메뉴 그룹: 계정 ── */}
        <MenuGroup title="계정">
          <MenuRow icon="logout" label="로그아웃" onClick={handleLogout} red />
        </MenuGroup>

        {/* ── 버전 정보 ── */}
        <p className="text-center text-xs text-slate-300 py-8 tracking-wide">
          쉼표(,) v1.0.0
        </p>

      </main>
    </div>
  );
}

export default MyPage;
