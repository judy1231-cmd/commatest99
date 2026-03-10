import { useState, useEffect } from 'react';
import { fetchWithAuth } from '../../../api/fetchWithAuth';
import UserNavbar from '../../../components/user/UserNavbar';
import Toast from '../../../components/common/Toast';

const EMOTION_LEVELS = [
  { score: 1,  label: '매우 힘듦', icon: 'sentiment_very_dissatisfied', color: '#EF4444', bg: 'bg-red-50 text-red-500' },
  { score: 2,  label: '힘듦',      icon: 'sentiment_very_dissatisfied', color: '#F97316', bg: 'bg-orange-50 text-orange-500' },
  { score: 3,  label: '조금 힘듦', icon: 'sentiment_dissatisfied',      color: '#F59E0B', bg: 'bg-amber-50 text-amber-500' },
  { score: 4,  label: '보통',      icon: 'sentiment_neutral',           color: '#94A3B8', bg: 'bg-slate-50 text-slate-500' },
  { score: 5,  label: '보통',      icon: 'sentiment_neutral',           color: '#94A3B8', bg: 'bg-slate-50 text-slate-500' },
  { score: 6,  label: '괜찮음',    icon: 'sentiment_satisfied',         color: '#10B981', bg: 'bg-emerald-50 text-emerald-500' },
  { score: 7,  label: '좋음',      icon: 'sentiment_satisfied',         color: '#10B981', bg: 'bg-emerald-50 text-emerald-500' },
  { score: 8,  label: '좋음',      icon: 'sentiment_satisfied_alt',     color: '#10B981', bg: 'bg-emerald-50 text-emerald-600' },
  { score: 9,  label: '매우 좋음', icon: 'sentiment_very_satisfied',    color: '#059669', bg: 'bg-green-50 text-green-600' },
  { score: 10, label: '최고!',     icon: 'sentiment_very_satisfied',    color: '#059669', bg: 'bg-green-50 text-green-700' },
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
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(INITIAL_FORM);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState({ message: '', type: 'success' });

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
        body: JSON.stringify({
          score: form.score,
          tags: form.tags,
          memo: form.memo,
        }),
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

  const grouped = groupByDate(logs);
  const dateKeys = Object.keys(grouped);
  const selectedEmotion = getEmotionInfo(form.score);

  return (
    <div className="min-h-screen bg-[#F9F7F2]">
      <UserNavbar />

      <main className="max-w-lg mx-auto px-4 pt-6 pb-24">

        {/* 헤더 */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-xl font-bold text-slate-800">감정 기록</h1>
            <p className="text-sm text-slate-400 mt-0.5">나의 감정 변화를 기록해요</p>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-1.5 bg-primary text-white px-4 py-2.5 rounded-xl font-bold text-sm hover:bg-primary/90 transition-all"
          >
            <span className="material-icons text-base">add</span>
            기록 추가
          </button>
        </div>

        {/* 로딩 */}
        {loading && (
          <div className="flex justify-center items-center h-40">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
          </div>
        )}

        {/* 기록 없음 */}
        {!loading && logs.length === 0 && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center">
            <span className="material-icons text-5xl text-slate-200 mb-3 block">mood</span>
            <p className="font-semibold text-slate-600 mb-1">아직 감정 기록이 없어요</p>
            <p className="text-sm text-slate-400 mb-6">오늘의 감정을 기록해보세요!</p>
            <button
              onClick={() => setShowModal(true)}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary text-white font-bold rounded-xl hover:bg-primary/90 transition-all text-sm"
            >
              <span className="material-icons text-base">add</span>
              기록 추가
            </button>
          </div>
        )}

        {/* 날짜별 기록 목록 */}
        {!loading && dateKeys.map((dateKey) => {
          const group = grouped[dateKey];
          return (
            <div key={dateKey} className="mb-6">
              <div className="flex items-center gap-3 mb-3">
                <span className="text-sm font-bold text-slate-500">{group.label}</span>
                <div className="flex-1 h-px bg-slate-200" />
                <span className="text-xs text-slate-400">{group.items.length}건</span>
              </div>

              <div className="space-y-3">
                {group.items.map((log) => {
                  const emotion = getEmotionInfo(log.score);
                  const tags = log.tags || (log.moodTagsJson ? JSON.parse(log.moodTagsJson) : []);
                  return (
                    <div key={log.id} className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm">
                      <div className="flex items-center gap-3">
                        {/* 감정 아이콘 */}
                        <div className={`w-11 h-11 rounded-xl ${emotion.bg} flex items-center justify-center shrink-0`}>
                          <span className="material-icons text-2xl">{emotion.icon}</span>
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-0.5">
                            <span className="font-bold text-slate-800 text-sm">{emotion.label}</span>
                            <span
                              className="text-xs font-bold px-2 py-0.5 rounded-full"
                              style={{ backgroundColor: `${emotion.color}15`, color: emotion.color }}
                            >
                              {log.score}점
                            </span>
                          </div>

                          {/* 태그 */}
                          {tags.length > 0 && (
                            <div className="flex flex-wrap gap-1 mb-1">
                              {tags.map((tag, i) => (
                                <span key={i} className="text-xs bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full">
                                  #{tag}
                                </span>
                              ))}
                            </div>
                          )}

                          {/* 메모 */}
                          {log.memo && (
                            <p className="text-xs text-slate-500 truncate">{log.memo}</p>
                          )}

                          {/* 시간 */}
                          {log.recordedAt && (
                            <p className="text-xs text-slate-400 mt-0.5">
                              {new Date(log.recordedAt).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })}
                            </p>
                          )}
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

      {/* 기록 추가 모달 */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md max-h-[90vh] overflow-y-auto p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-bold text-slate-800">감정 기록 추가</h2>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600">
                <span className="material-icons">close</span>
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* 감정 점수 슬라이더 */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-3">
                  지금 기분이 어때요?
                </label>
                {/* 현재 감정 표시 */}
                <div className="flex flex-col items-center mb-4">
                  <span className={`material-icons text-5xl mb-1`} style={{ color: selectedEmotion.color }}>
                    {selectedEmotion.icon}
                  </span>
                  <span className="font-bold text-slate-700">{selectedEmotion.label}</span>
                  <span className="text-xs text-slate-400">{form.score}점</span>
                </div>
                <input
                  type="range" min="1" max="10" step="1"
                  value={form.score}
                  onChange={(e) => setForm({ ...form, score: Number(e.target.value) })}
                  className="w-full accent-primary"
                />
                <div className="flex justify-between text-xs text-slate-400 mt-1">
                  <span>매우 힘듦</span>
                  <span>최고!</span>
                </div>
              </div>

              {/* 감정 태그 */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">감정 태그 (복수 선택)</label>
                <div className="flex flex-wrap gap-2">
                  {EMOTION_TAGS.map((tag) => (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => toggleTag(tag)}
                      className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all border ${
                        form.tags.includes(tag)
                          ? 'bg-primary text-white border-primary'
                          : 'bg-white text-slate-500 border-slate-200 hover:border-primary hover:text-primary'
                      }`}
                    >
                      #{tag}
                    </button>
                  ))}
                </div>
              </div>

              {/* 메모 */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">메모 (선택)</label>
                <textarea
                  placeholder="오늘 기분에 대해 자유롭게 적어보세요"
                  value={form.memo}
                  onChange={(e) => setForm({ ...form, memo: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-sm text-slate-700 placeholder:text-slate-400 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none resize-none"
                />
              </div>

              <button
                type="submit" disabled={saving}
                className="w-full bg-primary text-white font-bold py-3 rounded-xl hover:bg-primary/90 transition-all disabled:opacity-50"
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
