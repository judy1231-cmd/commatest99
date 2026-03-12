import { useState, useEffect } from 'react';
import { fetchWithAuth } from '../../../api/fetchWithAuth';
import UserNavbar from '../../../components/user/UserNavbar';
import Toast from '../../../components/common/Toast';

const EMOTION_LEVELS = [
  { score: 1,  label: '매우 힘듦', icon: 'sentiment_very_dissatisfied', color: '#EF4444', bg: '#FEF2F2' },
  { score: 2,  label: '힘듦',      icon: 'sentiment_very_dissatisfied', color: '#F97316', bg: '#FFF7ED' },
  { score: 3,  label: '조금 힘듦', icon: 'sentiment_dissatisfied',      color: '#F59E0B', bg: '#FFFBEB' },
  { score: 4,  label: '보통',      icon: 'sentiment_neutral',           color: '#94A3B8', bg: '#F8FAFC' },
  { score: 5,  label: '보통',      icon: 'sentiment_neutral',           color: '#94A3B8', bg: '#F8FAFC' },
  { score: 6,  label: '괜찮음',    icon: 'sentiment_satisfied',         color: '#10B981', bg: '#ECFDF5' },
  { score: 7,  label: '좋음',      icon: 'sentiment_satisfied',         color: '#10B981', bg: '#ECFDF5' },
  { score: 8,  label: '좋음',      icon: 'sentiment_satisfied_alt',     color: '#10B981', bg: '#ECFDF5' },
  { score: 9,  label: '매우 좋음', icon: 'sentiment_very_satisfied',    color: '#059669', bg: '#F0FDF4' },
  { score: 10, label: '최고!',     icon: 'sentiment_very_satisfied',    color: '#059669', bg: '#F0FDF4' },
];

const EMOTION_TAGS = ['평온', '기쁨', '설렘', '안도', '피곤', '불안', '슬픔', '화남', '무기력', '집중'];

function getEmotionInfo(score) {
  return EMOTION_LEVELS.find((e) => e.score === score) || EMOTION_LEVELS[4];
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
    const key = new Date(log.recordedAt).toDateString();
    if (!acc[key]) acc[key] = { label: getDateLabel(log.recordedAt), items: [] };
    acc[key].items.push(log);
    return acc;
  }, {});
}

const INITIAL_FORM = { score: 7, tags: [], memo: '' };

function RecordsEmotion() {
  const [logs, setLogs]         = useState([]);
  const [loading, setLoading]   = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm]         = useState(INITIAL_FORM);
  const [saving, setSaving]     = useState(false);
  const [toast, setToast]       = useState({ message: '', type: 'success' });

  // 월 네비게이션 (UI 전용)
  const [currentMonth, setCurrentMonth] = useState(() => {
    const now = new Date();
    return { year: now.getFullYear(), month: now.getMonth() };
  });

  useEffect(() => { loadLogs(); }, []);

  const loadLogs = async () => {
    setLoading(true);
    try {
      const data = await fetchWithAuth('/api/emotion-logs');
      if (data.success && data.data) {
        setLogs(data.data);
      }
    } catch {
      setToast({ message: '기록을 불러오지 못했어요.', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const toggleTag = (tag) => {
    setForm((prev) => ({
      ...prev,
      tags: prev.tags.includes(tag) ? prev.tags.filter((t) => t !== tag) : [...prev.tags, tag],
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetchWithAuth('/api/emotion-logs', {
        method: 'POST',
        body: JSON.stringify({ score: form.score, tags: form.tags, memo: form.memo }),
      });
      if (res.success) {
        setToast({ message: '감정 기록이 저장됐어요!', type: 'success' });
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

  // 월 이동
  const prevMonth = () => {
    setCurrentMonth(m =>
      m.month === 0 ? { year: m.year - 1, month: 11 } : { year: m.year, month: m.month - 1 }
    );
  };
  const nextMonth = () => {
    setCurrentMonth(m =>
      m.month === 11 ? { year: m.year + 1, month: 0 } : { year: m.year, month: m.month + 1 }
    );
  };
  const isCurrentMonthToday = () => {
    const now = new Date();
    return currentMonth.year === now.getFullYear() && currentMonth.month === now.getMonth();
  };

  // 현재 월 필터링
  const filteredLogs = logs.filter(log => {
    const d = new Date(log.recordedAt);
    return d.getFullYear() === currentMonth.year && d.getMonth() === currentMonth.month;
  });

  const grouped  = groupByDate(filteredLogs);
  const dateKeys = Object.keys(grouped).sort((a, b) => new Date(b) - new Date(a));

  const monthLabel      = `${currentMonth.year}년 ${currentMonth.month + 1}월`;
  const selectedEmotion = getEmotionInfo(form.score);

  return (
    <div className="min-h-screen bg-[#F7F7F8]">
      <UserNavbar />

      <main className="max-w-lg mx-auto pb-24">

        {/* ===== 헤더 ===== */}
        <div className="px-5 pt-6 pb-4 flex items-center justify-between">
          <div>
            <h1 className="text-[22px] font-extrabold tracking-tight text-slate-800">감정 기록</h1>
            <p className="text-xs text-slate-400 mt-0.5">나의 감정 변화를 기록해요</p>
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

        {/* ===== 로딩 ===== */}
        {loading && (
          <div className="flex justify-center items-center h-40">
            <div className="animate-spin rounded-full h-7 w-7 border-b-2 border-primary" />
          </div>
        )}

        {/* ===== 빈 상태 ===== */}
        {!loading && filteredLogs.length === 0 && (
          <div className="mx-5 bg-white rounded-3xl p-10 text-center shadow-sm border border-slate-100">
            <div className="w-20 h-20 bg-amber-50 rounded-3xl flex items-center justify-center mx-auto mb-5">
              <span className="material-icons text-4xl text-amber-400">mood</span>
            </div>
            <p className="text-base font-extrabold text-slate-700 mb-1">
              {monthLabel}의 감정 기록이 없어요
            </p>
            <p className="text-sm text-slate-400 leading-relaxed mb-6">
              오늘의 기분을 기록하면<br />감정 변화 패턴을 파악할 수 있어요
            </p>
            <button
              onClick={() => setShowModal(true)}
              className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-white font-bold rounded-2xl shadow-lg shadow-emerald-100 hover:bg-primary/90 transition-all text-sm"
            >
              <span className="material-icons text-base">add</span>
              첫 감정 기록하기
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
                  const emotion = getEmotionInfo(log.score);
                  const tags = log.tags || (log.moodTagsJson ? JSON.parse(log.moodTagsJson) : []);
                  const timeStr = log.recordedAt
                    ? new Date(log.recordedAt).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })
                    : null;

                  return (
                    <div
                      key={log.id}
                      className="bg-white rounded-2xl shadow-sm overflow-hidden flex"
                    >
                      {/* 왼쪽 accent bar */}
                      <div
                        className="w-1 shrink-0 rounded-l-2xl"
                        style={{ backgroundColor: emotion.color }}
                      />

                      {/* 카드 본문 */}
                      <div className="flex-1 px-4 py-3.5">
                        <div className="flex items-start gap-3">
                          {/* 감정 아이콘 */}
                          <div
                            className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 mt-0.5"
                            style={{ backgroundColor: emotion.bg }}
                          >
                            <span className="material-icons text-xl" style={{ color: emotion.color }}>
                              {emotion.icon}
                            </span>
                          </div>

                          {/* 내용 */}
                          <div className="flex-1 min-w-0">
                            {/* 감정 라벨 + 점수 배지 */}
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-bold text-slate-800 text-sm">{emotion.label}</span>
                              <span
                                className="text-[11px] font-bold px-2 py-0.5 rounded-full"
                                style={{ backgroundColor: emotion.bg, color: emotion.color }}
                              >
                                {log.score}점
                              </span>
                              {timeStr && (
                                <span className="text-xs text-slate-400 ml-auto">{timeStr}</span>
                              )}
                            </div>

                            {/* 태그 */}
                            {tags.length > 0 && (
                              <div className="flex flex-wrap gap-1 mb-1">
                                {tags.map((tag, i) => (
                                  <span
                                    key={i}
                                    className="text-[11px] font-semibold bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full"
                                  >
                                    #{tag}
                                  </span>
                                ))}
                              </div>
                            )}

                            {/* 메모 */}
                            {log.memo && (
                              <p className="text-xs text-slate-500 truncate">{log.memo}</p>
                            )}
                          </div>
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

      {/* ===== 기록 추가 모달 (바텀시트) ===== */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end justify-center">
          <div className="bg-white rounded-t-3xl w-full max-w-lg max-h-[92vh] overflow-y-auto">

            {/* 모달 헤더 */}
            <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-slate-100">
              <div>
                <h2 className="text-[18px] font-extrabold text-slate-800">감정 기록 추가</h2>
                <p className="text-xs text-slate-400 mt-0.5">지금 기분이 어때요?</p>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="w-8 h-8 flex items-center justify-center rounded-xl bg-slate-100 hover:bg-slate-200 transition-colors"
              >
                <span className="material-icons text-slate-500 text-lg">close</span>
              </button>
            </div>

            <form onSubmit={handleSubmit} className="px-6 py-5 space-y-5">

              {/* 감정 점수 슬라이더 */}
              <div>
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-4">감정 점수</p>
                {/* 현재 감정 큰 표시 */}
                <div
                  className="flex flex-col items-center py-5 rounded-2xl mb-4"
                  style={{ backgroundColor: selectedEmotion.bg }}
                >
                  <span
                    className="material-icons mb-1"
                    style={{ fontSize: '52px', color: selectedEmotion.color }}
                  >
                    {selectedEmotion.icon}
                  </span>
                  <span className="font-extrabold text-slate-800 text-lg">{selectedEmotion.label}</span>
                  <span
                    className="text-sm font-bold mt-1 px-3 py-0.5 rounded-full"
                    style={{ backgroundColor: `${selectedEmotion.color}20`, color: selectedEmotion.color }}
                  >
                    {form.score}점
                  </span>
                </div>
                <input
                  type="range" min="1" max="10" step="1"
                  value={form.score}
                  onChange={(e) => setForm({ ...form, score: Number(e.target.value) })}
                  className="w-full accent-primary"
                />
                <div className="flex justify-between text-[11px] text-slate-400 mt-1">
                  <span>😢 매우 힘듦</span>
                  <span>😄 최고!</span>
                </div>
              </div>

              {/* 감정 태그 */}
              <div>
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-3">감정 태그</p>
                <div className="flex flex-wrap gap-2">
                  {EMOTION_TAGS.map((tag) => (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => toggleTag(tag)}
                      className="px-3 py-1.5 rounded-full text-xs font-bold transition-all"
                      style={{
                        backgroundColor: form.tags.includes(tag) ? selectedEmotion.color : '#F8FAFC',
                        color: form.tags.includes(tag) ? 'white' : '#64748B',
                        border: `1.5px solid ${form.tags.includes(tag) ? selectedEmotion.color : '#e2e8f0'}`,
                      }}
                    >
                      #{tag}
                    </button>
                  ))}
                </div>
              </div>

              {/* 메모 */}
              <div>
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-2">메모 (선택)</p>
                <textarea
                  placeholder="오늘 기분에 대해 자유롭게 적어보세요"
                  value={form.memo}
                  onChange={(e) => setForm({ ...form, memo: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-3 rounded-2xl border border-slate-100 bg-slate-50 text-sm text-slate-700 placeholder:text-slate-300 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none resize-none transition-all"
                />
              </div>

              <button
                type="submit" disabled={saving}
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

export default RecordsEmotion;
