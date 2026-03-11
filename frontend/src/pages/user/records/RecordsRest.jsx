import { useState, useEffect } from 'react';
import { fetchWithAuth } from '../../../api/fetchWithAuth';
import UserNavbar from '../../../components/user/UserNavbar';
import Toast from '../../../components/common/Toast';

const TYPE_INFO = {
  physical:  { label: '신체적 이완', icon: 'fitness_center', color: '#EF4444', bg: 'bg-red-50 text-red-600' },
  mental:    { label: '정신적 고요', icon: 'spa',            color: '#10B981', bg: 'bg-emerald-50 text-emerald-600' },
  sensory:   { label: '감각의 정화', icon: 'visibility_off', color: '#F59E0B', bg: 'bg-amber-50 text-amber-600' },
  emotional: { label: '정서적 지지', icon: 'favorite',       color: '#EC4899', bg: 'bg-pink-50 text-pink-600' },
  social:    { label: '사회적 휴식', icon: 'groups',         color: '#8B5CF6', bg: 'bg-purple-50 text-purple-600' },
  nature:    { label: '자연의 연결', icon: 'forest',       color: '#059669', bg: 'bg-green-50 text-green-600' },
  creative:  { label: '창조적 몰입', icon: 'brush',          color: '#F97316', bg: 'bg-orange-50 text-orange-600' },
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
  return `${Math.floor(minutes / 60)}시간 ${minutes % 60}분`;
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

function RecordsRest() {
  const [restTypes, setRestTypes] = useState([]);
  const [logs, setLogs] = useState([]);
  const [selectedTypeId, setSelectedTypeId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(INITIAL_FORM);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState({ message: '', type: 'success' });

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
      ? (TYPE_INFO[type.typeName] || { label: type.typeName, icon: 'spa', color: '#10B981', bg: 'bg-gray-50 text-gray-600' })
      : { label: '기타', icon: 'spa', color: '#10B981', bg: 'bg-gray-50 text-gray-600' };
  };

  const grouped = groupByDate(logs);
  const dateKeys = Object.keys(grouped);

  return (
    <div className="min-h-screen bg-[#F9F7F2]">
      <UserNavbar />

      <main className="max-w-lg mx-auto px-4 pt-6 pb-24">

        {/* 헤더 */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-xl font-bold text-slate-800">휴식 기록</h1>
            <p className="text-sm text-slate-400 mt-0.5">나의 휴식 패턴을 기록해요</p>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-1.5 bg-primary text-white px-4 py-2.5 rounded-xl font-bold text-sm hover:bg-primary/90 transition-all"
          >
            <span className="material-icons text-base">add</span>
            기록 추가
          </button>
        </div>

        {/* 유형 필터 */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-1">
          <button
            onClick={() => setSelectedTypeId(null)}
            className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-bold transition-all ${
              !selectedTypeId ? 'bg-primary text-white' : 'bg-white border border-slate-200 text-slate-600 hover:border-primary hover:text-primary'
            }`}
          >
            전체
          </button>
          {restTypes.map((type) => (
            <button
              key={type.id}
              onClick={() => setSelectedTypeId(selectedTypeId === type.id ? null : type.id)}
              className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-bold transition-all ${
                selectedTypeId === type.id ? 'bg-primary text-white' : 'bg-white border border-slate-200 text-slate-600 hover:border-primary hover:text-primary'
              }`}
            >
              {TYPE_INFO[type.typeName]?.label || type.typeName}
            </button>
          ))}
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
            <span className="material-icons text-5xl text-slate-200 mb-3 block">event_note</span>
            <p className="font-semibold text-slate-600 mb-1">아직 기록이 없어요</p>
            <p className="text-sm text-slate-400 mb-6">첫 번째 휴식을 기록해보세요!</p>
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
              {/* 날짜 구분선 */}
              <div className="flex items-center gap-3 mb-3">
                <span className="text-sm font-bold text-slate-500">{group.label}</span>
                <div className="flex-1 h-px bg-slate-200" />
                <span className="text-xs text-slate-400">{group.items.length}건</span>
              </div>

              <div className="space-y-3">
                {group.items.map((log) => {
                  const typeInfo = getTypeInfo(log.restTypeId);
                  return (
                    <div
                      key={log.id}
                      className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm hover:shadow-md transition-all"
                    >
                      <div className="flex items-center gap-3">
                        {/* 유형 아이콘 */}
                        <div className={`w-11 h-11 rounded-xl ${typeInfo.bg} flex items-center justify-center shrink-0`}>
                          <span className="material-icons text-xl">{typeInfo.icon}</span>
                        </div>

                        {/* 내용 */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-0.5">
                            <span className="text-xs font-bold text-primary bg-soft-mint px-2 py-0.5 rounded-full">
                              {typeInfo.label}
                            </span>
                          </div>
                          <p className="font-semibold text-slate-800 text-sm truncate">
                            {log.memo || '휴식 기록'}
                          </p>
                          <div className="flex items-center gap-3 mt-1 text-xs text-slate-400">
                            <span className="flex items-center gap-0.5">
                              <span className="material-icons text-xs">schedule</span>
                              {formatDuration(log.startTime, log.endTime)}
                            </span>
                            {log.startTime && (
                              <span className="flex items-center gap-0.5">
                                <span className="material-icons text-xs">access_time</span>
                                {new Date(log.startTime).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })}
                              </span>
                            )}
                            {log.emotionAfter != null && (
                              <span className="flex items-center gap-0.5">
                                <span className="material-icons text-xs text-red-400">favorite</span>
                                기분 {log.emotionAfter}/10
                              </span>
                            )}
                          </div>
                        </div>

                        <span className="material-icons text-slate-300 shrink-0">chevron_right</span>
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
              <h2 className="text-lg font-bold text-slate-800">휴식 기록 추가</h2>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600">
                <span className="material-icons">close</span>
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">휴식 유형</label>
                <select
                  required
                  value={form.restTypeId}
                  onChange={(e) => setForm({ ...form, restTypeId: e.target.value })}
                  className="w-full h-12 px-4 rounded-xl border border-gray-200 bg-gray-50 outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                >
                  <option value="">유형을 선택하세요</option>
                  {restTypes.map((t) => (
                    <option key={t.id} value={t.id}>{TYPE_INFO[t.typeName]?.label || t.typeName}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">시작 시간</label>
                  <input
                    required type="datetime-local"
                    value={form.startTime}
                    onChange={(e) => setForm({ ...form, startTime: e.target.value })}
                    className="w-full h-12 px-4 rounded-xl border border-gray-200 bg-gray-50 outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">종료 시간</label>
                  <input
                    required type="datetime-local"
                    value={form.endTime}
                    onChange={(e) => setForm({ ...form, endTime: e.target.value })}
                    className="w-full h-12 px-4 rounded-xl border border-gray-200 bg-gray-50 outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">메모 (선택)</label>
                <input
                  type="text" placeholder="어떤 휴식이었나요?"
                  value={form.memo}
                  onChange={(e) => setForm({ ...form, memo: e.target.value })}
                  className="w-full h-12 px-4 rounded-xl border border-gray-200 bg-gray-50 outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    휴식 전 기분 <span className="text-primary font-bold">({form.emotionBefore}점)</span>
                  </label>
                  <input
                    type="range" min="1" max="10"
                    value={form.emotionBefore}
                    onChange={(e) => setForm({ ...form, emotionBefore: e.target.value })}
                    className="w-full accent-primary"
                  />
                  <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                    <span>힘듦</span><span>좋음</span>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    휴식 후 기분 <span className="text-primary font-bold">({form.emotionAfter}점)</span>
                  </label>
                  <input
                    type="range" min="1" max="10"
                    value={form.emotionAfter}
                    onChange={(e) => setForm({ ...form, emotionAfter: e.target.value })}
                    className="w-full accent-primary"
                  />
                  <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                    <span>힘듦</span><span>좋음</span>
                  </div>
                </div>
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

export default RecordsRest;
