import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchWithAuth } from '../../api/fetchWithAuth';
import UserNavbar from '../../components/user/UserNavbar';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';

const REST_TYPE_NAMES = {
  physical:  { label: '신체의 이완', icon: 'fitness_center', color: '#4CAF82' },
  mental:    { label: '정신적 고요', icon: 'spa',            color: '#5B8DEF' },
  sensory:   { label: '감각의 정화', icon: 'visibility_off', color: '#9B6DFF' },
  emotional: { label: '정서적 지지', icon: 'favorite',       color: '#FF7BAC' },
  social:    { label: '사회적 휴식', icon: 'groups',         color: '#FF9A3C' },
  nature:    { label: '자연의 연결', icon: 'forest',         color: '#2ECC9A' },
  creative:  { label: '창조적 몰입', icon: 'brush',          color: '#FFB830' },
};

const PERIOD_TABS = [
  { key: 'this',  label: '이번 달' },
  { key: 'last',  label: '지난 달' },
  { key: 'week',  label: '이번 주' },
];

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

function getPeriodYearMonth(period) {
  const now = new Date();
  if (period === 'last') {
    const y = now.getMonth() === 0 ? now.getFullYear() - 1 : now.getFullYear();
    const m = now.getMonth() === 0 ? 12 : now.getMonth();
    return `${y}-${String(m).padStart(2, '0')}`;
  }
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
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

function StatsSummary({ recordCount, totalRestMinutes, avgEmotionScore }) {
  return (
    <div className="flex items-center gap-3 mb-5 px-1">
      <div className="flex-1 text-center">
        <p className="text-[20px] font-black text-slate-800">{recordCount || 0}</p>
        <p className="text-[11px] text-slate-400 mt-0.5">기록</p>
      </div>
      <div className="w-px h-8 bg-slate-100" />
      <div className="flex-1 text-center">
        <p className="text-[20px] font-black text-slate-800">{formatMinutes(totalRestMinutes)}</p>
        <p className="text-[11px] text-slate-400 mt-0.5">휴식 시간</p>
      </div>
      <div className="w-px h-8 bg-slate-100" />
      <div className="flex-1 text-center">
        <p className="text-[20px] font-black text-slate-800">
          {avgEmotionScore ? avgEmotionScore.toFixed(1) : '-'}
        </p>
        <p className="text-[11px] text-slate-400 mt-0.5">평균 기분</p>
      </div>
    </div>
  );
}

function DonutChart({ typeRatios }) {
  const topType = typeRatios[0];
  return (
    <div className="mb-5">
      <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-3">휴식 유형 분포</p>
      <div className="flex items-center gap-5">
        {/* 도넛 차트 */}
        <div className="relative flex-shrink-0 w-[130px] h-[130px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={typeRatios}
                cx="50%"
                cy="50%"
                innerRadius={38}
                outerRadius={60}
                paddingAngle={2}
                dataKey="pct"
                startAngle={90}
                endAngle={-270}
              >
                {typeRatios.map((entry) => (
                  <Cell key={entry.type} fill={entry.color} stroke="none" />
                ))}
              </Pie>
              <Tooltip
                formatter={(value, _name, props) => [`${value}%`, props.payload.label || props.payload.type]}
                contentStyle={{ fontSize: 11, borderRadius: 8, border: 'none', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}
              />
            </PieChart>
          </ResponsiveContainer>
          {topType && (
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="material-icons text-[16px]" style={{ color: topType.color }}>{topType.icon}</span>
              <span className="text-[9px] font-bold text-slate-500 mt-0.5 text-center leading-tight px-1">
                {topType.label}
              </span>
            </div>
          )}
        </div>

        {/* 범례 */}
        <div className="flex-1 space-y-1.5">
          {typeRatios.map((item) => (
            <div key={item.type} className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: item.color }} />
              <span className="text-[12px] text-slate-600 flex-1 truncate">{item.label}</span>
              <span className="text-[12px] font-bold tabular-nums" style={{ color: item.color }}>{item.pct}%</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// 활동 달력 — 현재 월 기준으로 rest_logs 날짜를 점으로 표시
function ActivityCalendar({ recentLogs, selectedPeriod }) {
  const now = new Date();
  let year = now.getFullYear();
  let month = now.getMonth(); // 0-indexed

  if (selectedPeriod === 'last') {
    month = month === 0 ? 11 : month - 1;
    year = month === 11 ? year - 1 : year;
  }

  const firstDay = new Date(year, month, 1).getDay(); // 0=일
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  // recentLogs에서 날짜 추출 (YYYY-MM-DD 형태)
  const activeDays = new Set(
    recentLogs
      .filter(log => {
        const d = new Date(log.startTime);
        return d.getFullYear() === year && d.getMonth() === month;
      })
      .map(log => new Date(log.startTime).getDate())
  );

  const cells = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  const today = now.getDate();
  const isCurrentMonth = now.getFullYear() === year && now.getMonth() === month;

  return (
    <div>
      <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-2">
        활동 달력 — {year}년 {month + 1}월
      </p>
      {/* 요일 헤더 */}
      <div className="grid grid-cols-7 mb-1">
        {['일','월','화','수','목','금','토'].map(d => (
          <div key={d} className="text-center text-[10px] font-bold text-slate-400 py-1">{d}</div>
        ))}
      </div>
      {/* 날짜 그리드 */}
      <div className="grid grid-cols-7 gap-y-1">
        {cells.map((day, i) => {
          if (!day) return <div key={`empty-${i}`} />;
          const isActive = activeDays.has(day);
          const isToday = isCurrentMonth && day === today;
          return (
            <div key={day} className="flex items-center justify-center py-0.5">
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-semibold transition-all ${
                  isActive
                    ? 'bg-primary text-white'
                    : isToday
                    ? 'border-2 border-primary text-primary'
                    : 'text-slate-400'
                }`}
              >
                {day}
              </div>
            </div>
          );
        })}
      </div>
      {activeDays.size > 0 && (
        <p className="text-[11px] text-slate-400 mt-2 text-center">
          이 달 <span className="font-bold text-primary">{activeDays.size}일</span> 휴식 기록
        </p>
      )}
    </div>
  );
}

function MyPage() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [latestDiagnosis, setLatestDiagnosis] = useState(null);
  const [recentLogs, setRecentLogs] = useState([]);
  const [calendarLogs, setCalendarLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  const [selectedPeriod, setSelectedPeriod] = useState('this');
  const [periodStats, setPeriodStats] = useState(null);
  const [statsLoading, setStatsLoading] = useState(false);

  const [nicknameEditing, setNicknameEditing] = useState(false);
  const [nicknameInput, setNicknameInput] = useState('');
  const [nicknameSaving, setNicknameSaving] = useState(false);
  const [nicknameError, setNicknameError] = useState(null);

  useEffect(() => {
    loadAll();
  }, []);

  useEffect(() => {
    loadPeriodStats(selectedPeriod);
  }, [selectedPeriod]);

  const loadAll = async () => {
    setLoading(true);
    try {
      const [profileRes, diagRes, logsRes, calRes] = await Promise.allSettled([
        fetchWithAuth('/api/user/profile'),
        fetchWithAuth('/api/diagnosis/latest'),
        fetchWithAuth('/api/rest-logs?page=1&size=5'),
        fetchWithAuth('/api/rest-logs?page=1&size=50'),
      ]);

      if (profileRes.status === 'fulfilled' && profileRes.value.success) {
        setProfile(profileRes.value.data);
      }
      if (diagRes.status === 'fulfilled' && diagRes.value.success) {
        setLatestDiagnosis(diagRes.value.data);
      }
      if (logsRes.status === 'fulfilled' && logsRes.value.success) {
        setRecentLogs(logsRes.value.data?.logs || []);
      }
      if (calRes.status === 'fulfilled' && calRes.value.success) {
        setCalendarLogs(calRes.value.data?.logs || []);
      }
    } finally {
      setLoading(false);
    }
  };

  const loadPeriodStats = async (period) => {
    setStatsLoading(true);
    try {
      let url = '/api/stats/monthly';
      if (period === 'last') {
        url = `/api/stats/monthly?yearMonth=${getPeriodYearMonth('last')}`;
      } else if (period === 'week') {
        url = '/api/stats/weekly';
      }
      const data = await fetchWithAuth(url);
      if (data.success) {
        setPeriodStats(data.data);
      } else {
        setPeriodStats(null);
      }
    } catch {
      setPeriodStats(null);
    } finally {
      setStatsLoading(false);
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
  if (periodStats?.typeRatioJson) {
    try {
      const parsed = JSON.parse(periodStats.typeRatioJson);
      typeRatios = Object.entries(parsed)
        .map(([type, pct]) => ({ type, pct, ...REST_TYPE_NAMES[type] }))
        .filter(item => item.pct > 0)
        .sort((a, b) => b.pct - a.pct)
        .slice(0, 5);
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

          {/* 누적 통계 스트립 */}
          <div className="grid grid-cols-2 mt-6 pt-5 border-t border-slate-100">
            <div className="text-center">
              <p className="text-lg font-black text-slate-800">{formatMinutes(stats.totalRestMinutes)}</p>
              <p className="text-[11px] text-slate-400 mt-0.5">누적 휴식 시간</p>
            </div>
            <div className="text-center border-l border-slate-100">
              <p className="text-lg font-black text-slate-800">{stats.totalLogs || 0}</p>
              <p className="text-[11px] text-slate-400 mt-0.5">총 기록 횟수</p>
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

        {/* ── 기간별 휴식 통계 ── */}
        <div className="px-4">
          <div className="bg-white rounded-2xl overflow-hidden">
            {/* 헤더 + 기간 탭 */}
            <div className="px-5 pt-5 pb-3">
              <div className="flex items-center justify-between mb-3">
                <p className="text-sm font-bold text-slate-700">휴식 통계</p>
                <button onClick={() => navigate('/rest-record')} className="text-xs text-primary font-bold">
                  기록 보기
                </button>
              </div>

              {/* 기간 탭 버튼 */}
              <div className="flex gap-2">
                {PERIOD_TABS.map(tab => (
                  <button
                    key={tab.key}
                    onClick={() => setSelectedPeriod(tab.key)}
                    className={`flex-1 py-2 rounded-xl text-[12px] font-bold transition-all ${
                      selectedPeriod === tab.key
                        ? 'bg-primary text-white shadow-sm'
                        : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            {/* 통계 콘텐츠 */}
            <div className="px-5 pb-5">
              {statsLoading ? (
                <div className="space-y-3 animate-pulse">
                  <div className="flex gap-3 mb-4">
                    {[1,2,3].map(i => <div key={i} className="flex-1 h-14 bg-slate-100 rounded-xl" />)}
                  </div>
                  <div className="flex gap-4">
                    <div className="w-[130px] h-[130px] bg-slate-100 rounded-full" />
                    <div className="flex-1 space-y-2 pt-2">
                      {[100,80,60,45].map(w => (
                        <div key={w} className="h-3 bg-slate-100 rounded-full" style={{ width: `${w}%` }} />
                      ))}
                    </div>
                  </div>
                </div>
              ) : typeRatios.length > 0 ? (
                <>
                  <StatsSummary
                    recordCount={periodStats?.recordCount}
                    totalRestMinutes={periodStats?.totalRestMinutes}
                    avgEmotionScore={periodStats?.avgEmotionScore}
                  />
                  <DonutChart typeRatios={typeRatios} />
                  <div className="mt-5 pt-5 border-t border-slate-100">
                    <ActivityCalendar recentLogs={calendarLogs} selectedPeriod={selectedPeriod} />
                  </div>
                </>
              ) : (
                <div className="text-center py-8">
                  <span className="material-icons text-3xl text-slate-200 block mb-2">insert_chart</span>
                  <p className="text-sm font-semibold text-slate-400">이 기간의 기록이 없어요</p>
                  <p className="text-xs text-slate-300 mt-1">휴식을 기록하면 통계가 나타나요</p>
                  <button
                    onClick={() => navigate('/rest-record')}
                    className="mt-4 px-4 py-2 bg-primary text-white text-xs font-bold rounded-xl"
                  >
                    기록 남기기
                  </button>
                </div>
              )}
            </div>
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
