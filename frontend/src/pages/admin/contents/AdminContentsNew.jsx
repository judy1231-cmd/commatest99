import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminSidebar from '../../../components/admin/AdminSidebar';
import AdminHeader from '../../../components/admin/AdminHeader';

const REST_TYPES = [
  { key: 'physical', label: '신체적 이완' }, { key: 'mental', label: '정신적 고요' },
  { key: 'sensory', label: '감각의 정화' }, { key: 'emotional', label: '정서적 지지' },
  { key: 'social', label: '사회적 휴식' }, { key: 'nature', label: '자연과의 연결' },
  { key: 'creative', label: '창조적 몰입' },
];

function AdminContentsNew() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ activityName: '', restType: '', guideContent: '', durationMinutes: '' });
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setNotice(null);
    try {
      const token = localStorage.getItem('accessToken');
      const res = await fetch('/api/admin/activities', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ ...form, durationMinutes: Number(form.durationMinutes) }),
      });
      const data = await res.json();
      if (data.success) {
        navigate('/admin/contents');
      } else {
        setNotice({ type: 'error', message: data.message || '등록에 실패했습니다.' });
      }
    } catch {
      setNotice({ type: 'info', message: '콘텐츠 등록 API는 추후 지원 예정입니다.' });
    } finally { setSaving(false); }
  };

  return (
    <div className="flex h-screen overflow-hidden bg-background-light">
      <AdminSidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <AdminHeader title="콘텐츠 등록" subtitle="새 휴식 활동을 등록합니다." />
        <main className="flex-1 overflow-y-auto p-6 space-y-4">
          <button onClick={() => navigate(-1)} className="flex items-center gap-1 text-sm text-gray-500 hover:text-primary">
            <span className="material-icons text-base">arrow_back</span> 돌아가기
          </button>

          {notice && (
            <div className={`rounded-xl p-4 flex items-center gap-2 ${notice.type === 'error' ? 'bg-red-50 border border-red-200' : 'bg-amber-50 border border-amber-200'}`}>
              <span className={`material-icons text-base ${notice.type === 'error' ? 'text-red-500' : 'text-amber-500'}`}>
                {notice.type === 'error' ? 'error' : 'construction'}
              </span>
              <p className={`text-sm ${notice.type === 'error' ? 'text-red-700' : 'text-amber-700'}`}>{notice.message}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 space-y-5">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">활동명 <span className="text-red-400">*</span></label>
              <input value={form.activityName} onChange={e => setForm(f => ({ ...f, activityName: e.target.value }))}
                placeholder="예: 10분 명상" required
                className="w-full h-11 px-4 rounded-xl border border-gray-200 bg-gray-50 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none" />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">휴식 유형 <span className="text-red-400">*</span></label>
              <select value={form.restType} onChange={e => setForm(f => ({ ...f, restType: e.target.value }))} required
                className="w-full h-11 px-4 rounded-xl border border-gray-200 bg-gray-50 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none">
                <option value="">유형 선택</option>
                {REST_TYPES.map(t => <option key={t.key} value={t.key}>{t.label}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">소요 시간 (분)</label>
              <input type="number" min="1" max="300" value={form.durationMinutes}
                onChange={e => setForm(f => ({ ...f, durationMinutes: e.target.value }))}
                placeholder="예: 10"
                className="w-full h-11 px-4 rounded-xl border border-gray-200 bg-gray-50 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none" />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">가이드 내용</label>
              <textarea value={form.guideContent} onChange={e => setForm(f => ({ ...f, guideContent: e.target.value }))}
                rows={5} placeholder="활동 가이드를 입력하세요..."
                className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none resize-none" />
            </div>

            <div className="flex gap-3 pt-2">
              <button type="button" onClick={() => navigate(-1)}
                className="flex-1 h-11 rounded-xl border border-gray-200 text-gray-600 text-sm font-medium hover:bg-gray-50">취소</button>
              <button type="submit" disabled={saving}
                className="flex-1 h-11 rounded-xl bg-primary text-white text-sm font-bold hover:bg-primary/90 disabled:opacity-50">
                {saving ? '저장 중...' : '등록하기'}
              </button>
            </div>
          </form>
        </main>
      </div>
    </div>
  );
}

export default AdminContentsNew;
