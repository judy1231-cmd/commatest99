import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import AdminSidebar from '../../../components/admin/AdminSidebar';
import AdminHeader from '../../../components/admin/AdminHeader';
import { fetchWithAuth } from '../../../api/fetchWithAuth';

const REST_TYPES = [
  { key: 'physical', label: '신체적 이완' }, { key: 'mental', label: '정신적 고요' },
  { key: 'sensory', label: '감각의 정화' }, { key: 'emotional', label: '정서적 지지' },
  { key: 'social', label: '사회적 휴식' }, { key: 'nature', label: '자연의 연결' },
  { key: 'creative', label: '창조적 몰입' },
];

function AdminContentsEdit() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [form, setForm] = useState({ activityName: '', restType: '', guideContent: '', durationMinutes: '' });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState(null);
  /* UI 전용 — 공개 여부 토글 (API 미전송) */
  const [isPublic, setIsPublic] = useState(true);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const data = await fetchWithAuth(`/api/admin/activities/${id}`);
        if (data.success && data.data) {
          const a = data.data;
          setForm({
            activityName: a.activityName || a.name || '',
            restType: a.restType || '',
            guideContent: a.guideContent || a.description || '',
            durationMinutes: a.durationMinutes || a.duration || '',
          });
        }
      } catch { } finally { setLoading(false); }
    })();
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setNotice(null);
    try {
      const token = localStorage.getItem('accessToken');
      const res = await fetch(`/api/admin/activities/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ ...form, durationMinutes: Number(form.durationMinutes) }),
      });
      const data = await res.json();
      if (data.success) {
        navigate('/admin/contents');
      } else {
        setNotice({ type: 'error', message: data.message || '수정에 실패했습니다.' });
      }
    } catch {
      setNotice({ type: 'info', message: '콘텐츠 수정 API는 추후 지원 예정입니다.' });
    } finally { setSaving(false); }
  };

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      <AdminSidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <AdminHeader title="콘텐츠 수정" subtitle={`활동 ID: ${id}`} />
        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-5xl mx-auto space-y-5">

            {/* ── 상단 툴바 ── */}
            <div className="flex items-center justify-between">
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900 transition-colors group"
              >
                <span className="material-icons text-[18px] group-hover:-translate-x-0.5 transition-transform">arrow_back</span>
                돌아가기
              </button>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => navigate(-1)}
                  className="h-9 px-4 border border-gray-200 text-gray-600 text-sm font-semibold rounded-lg hover:bg-gray-100 transition-colors"
                >
                  취소
                </button>
                <button
                  type="submit"
                  form="edit-form"
                  disabled={saving || loading}
                  className="h-9 px-5 bg-primary hover:bg-primary/90 text-white text-sm font-bold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5"
                >
                  {saving ? (
                    <>
                      <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      저장 중...
                    </>
                  ) : (
                    <>
                      <span className="material-icons text-[16px]">save</span>
                      수정 저장
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* ── 알림 메시지 ── */}
            {notice && (
              <div className={`flex items-center gap-2 px-4 py-3 rounded-xl text-sm border ${
                notice.type === 'error'
                  ? 'bg-red-50 border-red-200 text-red-700'
                  : 'bg-amber-50 border-amber-200 text-amber-700'
              }`}>
                <span className="material-icons text-base">
                  {notice.type === 'error' ? 'error_outline' : 'construction'}
                </span>
                {notice.message}
              </div>
            )}

            {/* ── 로딩 skeleton ── */}
            {loading ? (
              <div className="grid grid-cols-3 gap-5 items-start animate-pulse">
                {/* 좌측 skeleton */}
                <div className="col-span-2 space-y-4">
                  <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 space-y-3">
                    <div className="w-16 h-2.5 bg-gray-200 rounded" />
                    <div className="w-56 h-6 bg-gray-200 rounded" />
                  </div>
                  <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 space-y-3">
                    <div className="w-16 h-2.5 bg-gray-200 rounded" />
                    <div className="space-y-2">
                      {[...Array(6)].map((_, i) => (
                        <div key={i} className={`h-3 bg-gray-${i === 2 ? '100' : '200'} rounded`} style={{ width: `${[90,75,85,60,80,50][i]}%` }} />
                      ))}
                    </div>
                  </div>
                </div>
                {/* 우측 skeleton */}
                <div className="col-span-1 space-y-4">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 space-y-3">
                      <div className="w-16 h-2.5 bg-gray-200 rounded" />
                      <div className="w-full h-8 bg-gray-200 rounded-lg" />
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              /* ── 2컬럼 폼 ── */
              <form id="edit-form" onSubmit={handleSubmit}>
                <div className="grid grid-cols-3 gap-5 items-start">

                  {/* 좌측 — 제목 + 본문 (2/3) */}
                  <div className="col-span-2 space-y-4">

                    {/* 제목 카드 */}
                    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
                      <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                        활동명 <span className="text-red-400">*</span>
                      </label>
                      <input
                        value={form.activityName}
                        onChange={e => setForm(f => ({ ...f, activityName: e.target.value }))}
                        placeholder="예: 10분 명상"
                        required
                        className="w-full text-xl font-semibold text-gray-900 placeholder:text-gray-300 bg-transparent border-none outline-none"
                      />
                    </div>

                    {/* 본문 카드 */}
                    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
                      <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
                        가이드 내용
                      </label>
                      <textarea
                        value={form.guideContent}
                        onChange={e => setForm(f => ({ ...f, guideContent: e.target.value }))}
                        rows={16}
                        placeholder="활동 가이드를 입력하세요..."
                        className="w-full text-sm text-gray-700 placeholder:text-gray-300 bg-transparent border-none outline-none resize-none leading-relaxed"
                      />
                      <div className="mt-3 pt-3 border-t border-gray-100">
                        <p className="text-xs text-gray-400">
                          {form.guideContent.length > 0
                            ? <span><span className="font-semibold text-gray-600">{form.guideContent.length}</span>자</span>
                            : '내용을 입력하면 글자 수가 표시됩니다'
                          }
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* 우측 — 설정 패널 (1/3) */}
                  <div className="col-span-1 space-y-4">

                    {/* 공개 여부 */}
                    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
                      <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">공개 여부</h4>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-semibold text-gray-800">
                            {isPublic ? '공개' : '비공개'}
                          </p>
                          <p className="text-xs text-gray-400 mt-0.5">
                            {isPublic ? '사용자에게 노출됩니다' : '저장만 되고 노출되지 않습니다'}
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => setIsPublic(v => !v)}
                          className={`relative w-11 h-6 rounded-full transition-colors shrink-0 ${isPublic ? 'bg-primary' : 'bg-gray-200'}`}
                        >
                          <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-transform ${isPublic ? 'translate-x-5' : 'translate-x-0'}`} />
                        </button>
                      </div>
                    </div>

                    {/* 휴식 유형 */}
                    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
                      <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
                        휴식 유형 <span className="text-red-400">*</span>
                      </h4>
                      <select
                        value={form.restType}
                        onChange={e => setForm(f => ({ ...f, restType: e.target.value }))}
                        required
                        className="w-full h-10 px-3 border border-gray-200 rounded-lg text-sm text-gray-700 bg-gray-50 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                      >
                        <option value="">유형 선택</option>
                        {REST_TYPES.map(t => (
                          <option key={t.key} value={t.key}>{t.label}</option>
                        ))}
                      </select>
                    </div>

                    {/* 소요 시간 */}
                    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
                      <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">소요 시간</h4>
                      <div className="relative">
                        <input
                          type="number"
                          min="1"
                          max="300"
                          value={form.durationMinutes}
                          onChange={e => setForm(f => ({ ...f, durationMinutes: e.target.value }))}
                          placeholder="0"
                          className="w-full h-10 pl-3 pr-10 border border-gray-200 rounded-lg text-sm text-gray-700 bg-gray-50 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                        />
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400 font-medium">분</span>
                      </div>
                      {form.durationMinutes && (
                        <p className="text-xs text-gray-400 mt-2">
                          약 <span className="font-semibold text-gray-600">
                            {Math.floor(form.durationMinutes / 60) > 0 ? `${Math.floor(form.durationMinutes / 60)}시간 ` : ''}
                            {form.durationMinutes % 60}분
                          </span> 소요
                        </p>
                      )}
                    </div>

                    {/* 취소 버튼 */}
                    <button
                      type="button"
                      onClick={() => navigate(-1)}
                      className="w-full h-10 border border-gray-200 text-gray-500 text-sm font-semibold rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      취소
                    </button>
                  </div>
                </div>
              </form>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}

export default AdminContentsEdit;
