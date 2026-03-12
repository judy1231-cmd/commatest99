import { useState, useEffect } from 'react';
import { fetchWithAuth } from '../../../api/fetchWithAuth';
import UserNavbar from '../../../components/user/UserNavbar';
import Toast from '../../../components/common/Toast';

const TYPE_INFO = {
  physical:  { label: '신체적 이완', icon: 'fitness_center', color: '#4CAF82', bg: '#F0FAF5' },
  mental:    { label: '정신적 고요', icon: 'spa',            color: '#5B8DEF', bg: '#F0F5FF' },
  sensory:   { label: '감각의 정화', icon: 'visibility_off', color: '#9B6DFF', bg: '#F5F0FF' },
  emotional: { label: '정서적 지지', icon: 'favorite',       color: '#FF7BAC', bg: '#FFF0F5' },
  social:    { label: '사회적 휴식', icon: 'groups',         color: '#FF9A3C', bg: '#FFF5EC' },
  nature:    { label: '자연의 연결', icon: 'forest',         color: '#2ECC9A', bg: '#F0FBF7' },
  creative:  { label: '창조적 몰입', icon: 'brush',          color: '#FFB830', bg: '#FFFBF0' },
};

const INITIAL_FORM = {
  restTypeId: '',
  startTime: '',
  endTime: '',
  memo: '',
  emotionBefore: 5,
  emotionAfter: 7,
};

function formatDuration(startTime, endTime) {
  if (!startTime || !endTime) return '-';
  const minutes = Math.round((new Date(endTime) - new Date(startTime)) / 60000);
  if (minutes < 60) return `${minutes}분`;
  return `${Math.floor(minutes / 60)}시간 ${minutes % 60 > 0 ? ` ${minutes % 60}분` : ''}`;
}

function getDateLabel(dateStr) {
  const date = new Date(dateStr);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);
  if (date.toDateString() === today.toDateString()) return '오늘';
  if (date.toDateString() === yesterday.toDateString()) return '어제';
  return date.toLocaleDateString('ko-KR', { month: 'long', day: 'numeric', weekday: 'short' });
}

function groupByDate(logs) {
  return logs.reduce((acc, log) => {
    const key = new Date(log.startTime).toDateString();
    if (!acc[key]) acc[key] = { label: getDateLabel(log.startTime), items: [] };
    acc[key].items.push(log);
    return acc;
  }, {});
}

// 감정 점수 → 이모지
function emotionEmoji(score) {
  if (score >= 9) return '😄';
  if (score >= 7) return '🙂';
  if (score >= 5) return '😐';
  if (score >= 3) return '😔';
  return '😢';
}

function RecordsRest() {
  const [restTypes, setRestTypes]         = useState([]);
  const [logs, setLogs]                   = useState([]);
  const [selectedTypeId, setSelectedTypeId] = useState(null);
  const [loading, setLoading]             = useState(true);
  const [showModal, setShowModal]         = useState(false);
  const [form, setForm]                   = useState(INITIAL_FORM);
  const [saving, setSaving]               = useState(false);
  const [toast, setToast]                 = useState({ message: '', type: 'success' });

  // 월 네비게이션 (UI 전용)
  const [currentMonth, setCurrentMonth] = useState(() => {
    const now = new Date();
    return { year: now.getFullYear(), month: now.getMonth() };
  });

  useEffect(() => { loadRestTypes(); }, []);
  useEffect(() => { loadLogs(); }, [selectedTypeId]);

  const loadRestTypes = async () => {
    try {
      const res = await fetch('/api/rest-types');
      const data = await res.json();
      if (data.success && data.data) setRestTypes(data.data);
    } catch { /* 무시 */ }
  };

  const loadLogs = async () => {
    setLoading(true);
    try {
      const data = await fetchWithAuth('/api/rest-logs?page=1&size=100');
      if (data.success && data.data) {
        const allLogs = data.data.logs || [];
        setLogs(selectedTypeId ? allLogs.filter((l) => l.restTypeId === selectedTypeId) : allLogs);
      }
    } catch {
      setToast({ message: '기록을 불러오지 못했어요.', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetchWithAuth('/api/rest-logs', {
        method: 'POST',
        body: JSON.stringify({
          ...form,
          restTypeId: Number(form.restTypeId),
          emotionBefore: Number(form.emotionBefore),
          emotionAfter: Number(form.emotionAfter),
        }),
      });
      if (res.success) {
        setToast({ message: '휴식 기록이 저장됐어요!', type: 'success' });
        setShowModal(false);
        setForm(INITIAL_FORM);
        loadLogs();
      } else {
        setToast({ message: res.message || '저장에 실패했어요.', type: 'error' });
      }
    } catch {
      setToast({ message: '저장 중 오류가 발생했어요.', type: 'error' });
    } finally {
      setSaving(false);
    }
  };

  const getTypeInfo = (typeId) => {
    const type = restTypes.find((t) => t.id === typeId);
    return type
      ? (TYPE_INFO[type.typeName] || { label: type.typeName, icon: 'spa', color: '#10B981', bg: '#F0FDF4' })
      : { label: '기타', icon: 'spa', color: '#10B981', bg: '#F0FDF4' };
  };

  // 월 이동
  const prevMonth = () => {
    setCurrentMonth(m => {
      if (m.month === 0) return { year: m.year - 1, month: 11 };
      return { year: m.year, month: m.month - 1 };
    });
  };
  const nextMonth = () => {
    setCurrentMonth(m => {
      if (m.month === 11) return { year: m.year + 1, month: 0 };
      return { year: m.year, month: m.month + 1 };
    });
  };
  const isCurrentMonthToday = () => {
    const now = new Date();
    return currentMonth.year === now.getFullYear() && currentMonth.month === now.getMonth();
  };

  // 현재 선택 월로 필터링
  const filteredLogs = logs.filter(log => {
    const d = new Date(log.startTime);
    return d.getFullYear() === currentMonth.year && d.getMonth() === currentMonth.month;
  });

  const grouped   = groupByDate(filteredLogs);
  const dateKeys  = Object.keys(grouped).sort((a, b) => new Date(b) - new Date(a));

  const monthLabel = `${currentMonth.year}년 ${currentMonth.month + 1}월`;

  return (
    <div className="min-h-screen bg-[#F7F7F8]">
      <UserNavbar />

      <main className="max-w-lg mx-auto pb-24">

        {/* ===== 헤더 ===== */}
        <div className="px-5 pt-6 pb-4 flex items-center justify-between">
          <div>
            <h1 className="text-[22px] font-extrabold tracking-tight text-slate-800">휴식 기록</h1>
            <p className="text-xs text-slate-400 mt-0.5">나의 휴식 패턴을 기록해요</p>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-1.5 bg-primary text-white px-4 py-2.5 rounded-2xl font-bold text-sm shadow-lg shadow-emerald-100 hover:bg-primary/90 transition-all"
          >
            <span className="material-icons text-base">add</span>
            기록 추가
          </button>
        </div>

        {/* ===== 월 네비게이션 ===== */}
        <div className="px-5 mb-3">
          <div className="flex items-center justify-between bg-white rounded-2xl px-4 py-3 shadow-sm border border-slate-100">
            <button
              onClick={prevMonth}
              className="w-8 h-8 flex items-center justify-center rounded-xl hover:bg-slate-50 transition-colors"
            >
              <span className="material-icons text-slate-500 text-lg">chevron_left</span>
            </button>

            <div className="text-center">
              <p className="text-[15px] font-extrabold text-slate-800">{monthLabel}</p>
              <p className="text-[11px] text-slate-400 mt-0.5">
                {loading ? '...' : `${filteredLogs.length}개 기록`}
              </p>
            </div>

            <button
              onClick={nextMonth}
              disabled={isCurrentMonthToday()}
              className="w-8 h-8 flex items-center justify-center rounded-xl hover:bg-slate-50 transition-colors disabled:opacity-30"
            >
              <span className="material-icons text-slate-500 text-lg">chevron_right</span>
            </button>
          </div>
        </div>

        {/* ===== 유형 필터 칩 ===== */}
        <div className="flex gap-2 px-5 mb-4 overflow-x-auto pb-1 scrollbar-hide">
          <button
            onClick={() => setSelectedTypeId(null)}
            className={`flex-shrink-0 px-3.5 py-1.5 rounded-full text-xs font-bold transition-all ${
              !selectedTypeId
                ? 'bg-primary text-white shadow-sm shadow-emerald-100'
                : 'bg-white border border-slate-200 text-slate-500 hover:border-primary hover:text-primary'
            }`}
          >
            전체
          </button>
          {restTypes.map((type) => {
            const info = TYPE_INFO[type.typeName];
            const isSelected = selectedTypeId === type.id;
            return (
              <button
                key={type.id}
                onClick={() => setSelectedTypeId(selectedTypeId === type.id ? null : type.id)}
                className="flex-shrink-0 flex items-center gap-1 px-3.5 py-1.5 rounded-full text-xs font-bold transition-all"
                style={{
                  backgroundColor: isSelected ? info?.color || '#10B981' : 'white',
                  color: isSelected ? 'white' : info?.color || '#10B981',
                  border: `1.5px solid ${isSelected ? (info?.color || '#10B981') : '#e2e8f0'}`,
                  boxShadow: isSelected ? `0 2px 6px ${info?.color || '#10B981'}44` : 'none',
                }}
              >
                <span className="material-icons" style={{ fontSize: '11px' }}>{info?.icon || 'spa'}</span>
                {info?.label || type.typeName}
              </button>
            );
          })}
        </div>

        {/* ===== 로딩 ===== */}
        {loading && (
          <div className="flex justify-center items-center h-40">
            <div className="animate-spin rounded-full h-7 w-7 border-b-2 border-primary" />
          </div>
        )}

        {/* ===== 빈 상태 ===== */}
        {!loading && filteredLogs.length === 0 && (
          <div className="mx-5 bg-white rounded-3xl p-10 text-center shadow-sm border border-slate-100">
            <div className="w-20 h-20 bg-emerald-50 rounded-3xl flex items-center justify-center mx-auto mb-5">
              <span className="material-icons text-4xl text-primary">self_improvement</span>
            </div>
            <p className="text-base font-extrabold text-slate-700 mb-1">
              {monthLabel}의 기록이 없어요
            </p>
            <p className="text-sm text-slate-400 leading-relaxed mb-6">
              오늘 한 휴식을 기록하면<br />나만의 패턴을 발견할 수 있어요
            </p>
            <button
              onClick={() => setShowModal(true)}
              className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-white font-bold rounded-2xl shadow-lg shadow-emerald-100 hover:bg-primary/90 transition-all text-sm"
            >
              <span className="material-icons text-base">add</span>
              첫 기록 남기기
            </button>
          </div>
        )}

        {/* ===== 날짜별 기록 목록 ===== */}
        {!loading && dateKeys.map((dateKey) => {
          const group = grouped[dateKey];
          return (
            <div key={dateKey} className="mb-1">
              {/* sticky 날짜 헤더 */}
              <div className="sticky top-0 z-10 px-5 py-2.5 flex items-center gap-2 bg-[#F7F7F8]">
                <span className="text-[13px] font-extrabold text-slate-700">{group.label}</span>
                <div className="flex-1 h-px bg-slate-200" />
                <span className="text-[11px] font-bold text-slate-400 bg-white px-2 py-0.5 rounded-full border border-slate-100">
                  {group.items.length}건
                </span>
              </div>

              <div className="px-5 space-y-2.5 pb-2">
                {group.items.map((log) => {
                  const typeInfo = getTypeInfo(log.restTypeId);
                  const startStr = log.startTime
                    ? new Date(log.startTime).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })
                    : null;
                  const endStr = log.endTime
                    ? new Date(log.endTime).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })
                    : null;
                  const duration = formatDuration(log.startTime, log.endTime);

                  return (
                    <div
                      key={log.id}
                      className="bg-white rounded-2xl shadow-sm hover:shadow-md transition-all overflow-hidden flex"
                    >
                      {/* 왼쪽 accent bar */}
                      <div
                        className="w-1 shrink-0 rounded-l-2xl"
                        style={{ backgroundColor: typeInfo.color }}
                      />

                      {/* 카드 본문 */}
                      <div className="flex-1 px-4 py-3.5">
                        <div className="flex items-start gap-3">
                          {/* 유형 아이콘 */}
                          <div
                            className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 mt-0.5"
                            style={{ backgroundColor: typeInfo.bg }}
                          >
                            <span className="material-icons text-lg" style={{ color: typeInfo.color }}>
                              {typeInfo.icon}
                            </span>
                          </div>

                          {/* 내용 */}
                          <div className="flex-1 min-w-0">
                            {/* 유형 칩 */}
                            <span
                              className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full mb-1"
                              style={{ backgroundColor: typeInfo.bg, color: typeInfo.color }}
                            >
                              {typeInfo.label}
                            </span>

                            {/* 메모 */}
                            <p className="font-bold text-slate-800 text-sm truncate leading-snug">
                              {log.memo || '휴식 기록'}
                            </p>

                            {/* 시간 + 감정 */}
                            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1.5">
                              {startStr && (
                                <span className="flex items-center gap-1 text-xs text-slate-400">
                                  <span className="material-icons text-xs">access_time</span>
                                  {startStr}{endStr ? ` ~ ${endStr}` : ''}
                                </span>
                              )}
                              {duration !== '-' && (
                                <span className="flex items-center gap-1 text-xs font-semibold text-slate-500">
                                  <span className="material-icons text-xs">timer</span>
                                  {duration}
                                </span>
                              )}
                              {log.emotionAfter != null && (
                                <span className="flex items-center gap-1 text-xs text-slate-400">
                                  {emotionEmoji(log.emotionAfter)}
                                  <span className="font-semibold text-slate-500">{log.emotionAfter}/10</span>
                                </span>
                              )}
                            </div>
                          </div>

                          <span className="material-icons text-slate-200 shrink-0 mt-1">chevron_right</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </main>

      {/* ===== 기록 추가 모달 ===== */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end justify-center">
          <div className="bg-white rounded-t-3xl w-full max-w-lg max-h-[92vh] overflow-y-auto">

            {/* 모달 헤더 */}
            <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-slate-100">
              <div>
                <h2 className="text-[18px] font-extrabold text-slate-800">휴식 기록 추가</h2>
                <p className="text-xs text-slate-400 mt-0.5">오늘 어떤 휴식을 했나요?</p>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="w-8 h-8 flex items-center justify-center rounded-xl bg-slate-100 hover:bg-slate-200 transition-colors"
              >
                <span className="material-icons text-slate-500 text-lg">close</span>
              </button>
            </div>

            <form onSubmit={handleSubmit} className="px-6 py-5 space-y-5">

              {/* 휴식 유형 */}
              <div>
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest block mb-2">
                  휴식 유형
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {restTypes.map((t) => {
                    const info = TYPE_INFO[t.typeName];
                    const isSelected = form.restTypeId === String(t.id);
                    return (
                      <button
                        key={t.id}
                        type="button"
                        onClick={() => setForm({ ...form, restTypeId: String(t.id) })}
                        className="flex flex-col items-center gap-1 py-2.5 px-1 rounded-2xl text-[10px] font-bold transition-all"
                        style={{
                          backgroundColor: isSelected ? (info?.color || '#10B981') : (info?.bg || '#F0FDF4'),
                          color: isSelected ? 'white' : (info?.color || '#10B981'),
                          boxShadow: isSelected ? `0 2px 8px ${info?.color || '#10B981'}44` : 'none',
                        }}
                      >
                        <span className="material-icons" style={{ fontSize: '18px' }}>{info?.icon || 'spa'}</span>
                        <span className="text-center leading-tight">{info?.label?.replace(' ', '\n') || t.typeName}</span>
                      </button>
                    );
                  })}
                </div>
                {/* hidden required select for form validation */}
                <input type="hidden" required value={form.restTypeId} />
              </div>

              {/* 시간 */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest block mb-2">
                    시작 시간
                  </label>
                  <input
                    required type="datetime-local"
                    value={form.startTime}
                    onChange={(e) => setForm({ ...form, startTime: e.target.value })}
                    className="w-full h-11 px-3 rounded-2xl border border-slate-100 bg-slate-50 text-sm outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest block mb-2">
                    종료 시간
                  </label>
                  <input
                    required type="datetime-local"
                    value={form.endTime}
                    onChange={(e) => setForm({ ...form, endTime: e.target.value })}
                    className="w-full h-11 px-3 rounded-2xl border border-slate-100 bg-slate-50 text-sm outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                  />
                </div>
              </div>

              {/* 메모 */}
              <div>
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest block mb-2">
                  메모 (선택)
                </label>
                <input
                  type="text" placeholder="어떤 휴식이었나요?"
                  value={form.memo}
                  onChange={(e) => setForm({ ...form, memo: e.target.value })}
                  className="w-full h-11 px-4 rounded-2xl border border-slate-100 bg-slate-50 text-sm placeholder:text-slate-300 outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                />
              </div>

              {/* 기분 슬라이더 */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest block mb-2">
                    휴식 전 기분
                  </label>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-lg">{emotionEmoji(Number(form.emotionBefore))}</span>
                    <span className="text-sm font-extrabold text-primary">{form.emotionBefore}점</span>
                  </div>
                  <input
                    type="range" min="1" max="10"
                    value={form.emotionBefore}
                    onChange={(e) => setForm({ ...form, emotionBefore: e.target.value })}
                    className="w-full accent-primary"
                  />
                  <div className="flex justify-between text-[10px] text-slate-300 mt-0.5">
                    <span>힘듦</span><span>좋음</span>
                  </div>
                </div>
                <div>
                  <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest block mb-2">
                    휴식 후 기분
                  </label>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-lg">{emotionEmoji(Number(form.emotionAfter))}</span>
                    <span className="text-sm font-extrabold text-primary">{form.emotionAfter}점</span>
                  </div>
                  <input
                    type="range" min="1" max="10"
                    value={form.emotionAfter}
                    onChange={(e) => setForm({ ...form, emotionAfter: e.target.value })}
                    className="w-full accent-primary"
                  />
                  <div className="flex justify-between text-[10px] text-slate-300 mt-0.5">
                    <span>힘듦</span><span>좋음</span>
                  </div>
                </div>
              </div>

              <button
                type="submit" disabled={saving || !form.restTypeId}
                className="w-full bg-primary text-white font-bold py-4 rounded-2xl shadow-lg shadow-emerald-100 hover:bg-primary/90 transition-all disabled:opacity-40 text-sm"
              >
                {saving ? '저장 중...' : '기록 저장'}
              </button>
            </form>
          </div>
        </div>
      )}

      <Toast message={toast.message} type={toast.type} onClose={() => setToast({ message: '', type: 'success' })} />
    </div>
  );
}

export default RecordsRest;
