import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminSidebar from '../../../components/admin/AdminSidebar';
import AdminHeader from '../../../components/admin/AdminHeader';

const REST_TYPES = [
  { key: 'physical',  label: '신체적 이완', icon: 'fitness_center', color: '#EF4444' },
  { key: 'mental',    label: '정신적 고요', icon: 'spa',            color: '#10B981' },
  { key: 'sensory',   label: '감각의 정화', icon: 'visibility_off', color: '#F59E0B' },
  { key: 'emotional', label: '정서적 지지', icon: 'favorite',       color: '#EC4899' },
  { key: 'social',    label: '사회적 휴식', icon: 'groups',         color: '#8B5CF6' },
  { key: 'nature',    label: '자연의 연결', icon: 'forest',         color: '#059669' },
  { key: 'creative',  label: '창조적 몰입', icon: 'brush',          color: '#F97316' },
];

function AdminDiagnosisNew() {
  const navigate = useNavigate();
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);

  /* ── UI 전용 폼 상태 (API 미연결) ── */
  const [form, setForm] = useState({ content: '', category: '', orderNum: '', isReverse: false, active: true });
  const [refOpen, setRefOpen] = useState(false);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const res = await fetch('/api/survey/questions');
        const data = await res.json();
        if (data.success && data.data) setQuestions(data.data);
      } catch { } finally { setLoading(false); }
    })();
  }, []);

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      <AdminSidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <AdminHeader title="설문 문항 추가" subtitle="새 진단 문항을 작성합니다." />
        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-5xl mx-auto space-y-5">

            {/* ── 상단 툴바 ── */}
            <div className="flex items-center justify-between">
              <button
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
                  type="button"
                  disabled
                  title="문항 등록 API 추후 지원 예정"
                  className="h-9 px-5 bg-primary/40 text-white text-sm font-bold rounded-lg cursor-not-allowed flex items-center gap-1.5"
                >
                  <span className="material-icons text-[16px]">save</span>
                  저장
                </button>
              </div>
            </div>

            {/* ── 안내 배너 ── */}
            <div className="flex items-center gap-2 px-4 py-3 bg-amber-50 border border-amber-200 rounded-xl text-sm text-amber-700">
              <span className="material-icons text-amber-500 text-[18px]">construction</span>
              문항 등록 API는 추후 지원 예정입니다. 현재는 UI 미리보기 상태입니다.
            </div>

            {/* ── 2컬럼 폼 ── */}
            <div className="grid grid-cols-3 gap-5 items-start">

              {/* 좌측 — 문항 내용 (2/3) */}
              <div className="col-span-2 space-y-4">

                {/* 문항 내용 카드 */}
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
                  <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
                    문항 내용 <span className="text-red-400">*</span>
                  </label>
                  <textarea
                    value={form.content}
                    onChange={e => setForm(f => ({ ...f, content: e.target.value }))}
                    rows={6}
                    placeholder="예: 나는 몸을 움직이고 싶다는 생각이 든다."
                    className="w-full text-base text-gray-900 placeholder:text-gray-300 bg-transparent border-none outline-none resize-none leading-relaxed"
                  />
                  <div className="mt-3 pt-3 border-t border-gray-100 flex items-center justify-between">
                    <p className="text-xs text-gray-400">
                      {form.content.length > 0
                        ? <><span className="font-semibold text-gray-600">{form.content.length}</span>자</>
                        : '문항 내용을 입력하세요'
                      }
                    </p>
                  </div>
                </div>

                {/* 선택지 미리보기 카드 */}
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
                  <div className="flex items-center justify-between mb-4">
                    <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                      선택지 (기본 4개 · 점수 고정)
                    </label>
                    <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded">자동 생성</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { label: '전혀 그렇지 않다', score: 20 },
                      { label: '그렇지 않다',       score: 40 },
                      { label: '그렇다',             score: 70 },
                      { label: '매우 그렇다',        score: 100 },
                    ].map((c, i) => (
                      <div key={i} className="flex items-center justify-between px-3 py-2.5 bg-gray-50 border border-gray-100 rounded-lg">
                        <span className="text-xs text-gray-600">{c.label}</span>
                        <span className="text-xs font-bold text-primary">{c.score}점</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* 우측 — 설정 패널 (1/3) */}
              <div className="col-span-1 space-y-4">

                {/* 유형 카드 선택 */}
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
                  <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
                    휴식 유형 <span className="text-red-400">*</span>
                  </h4>
                  <div className="space-y-2">
                    {REST_TYPES.map(t => (
                      <label
                        key={t.key}
                        className={`flex items-center gap-3 px-3 py-2.5 rounded-lg border cursor-pointer transition-all ${
                          form.category === t.key
                            ? 'border-2 shadow-sm'
                            : 'border-gray-100 hover:border-gray-200 hover:bg-gray-50'
                        }`}
                        style={form.category === t.key
                          ? { borderColor: t.color, backgroundColor: `${t.color}0d` }
                          : {}
                        }
                      >
                        <input
                          type="radio"
                          name="category"
                          value={t.key}
                          checked={form.category === t.key}
                          onChange={() => setForm(f => ({ ...f, category: t.key }))}
                          className="sr-only"
                        />
                        <div
                          className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
                          style={{ backgroundColor: `${t.color}18` }}
                        >
                          <span className="material-icons text-[15px]" style={{ color: t.color }}>{t.icon}</span>
                        </div>
                        <span className={`text-xs font-semibold ${form.category === t.key ? 'text-gray-900' : 'text-gray-600'}`}>
                          {t.label}
                        </span>
                        {form.category === t.key && (
                          <span className="material-icons text-sm ml-auto" style={{ color: t.color }}>check_circle</span>
                        )}
                      </label>
                    ))}
                  </div>
                </div>

                {/* 역문항 토글 */}
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
                  <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">역문항 여부</h4>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-semibold text-gray-800">
                        {form.isReverse ? '역문항' : '정문항'}
                      </p>
                      <p className="text-xs text-gray-400 mt-0.5">
                        {form.isReverse ? '점수를 역산하여 계산합니다' : '점수를 그대로 계산합니다'}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setForm(f => ({ ...f, isReverse: !f.isReverse }))}
                      className={`relative w-11 h-6 rounded-full transition-colors shrink-0 ${form.isReverse ? 'bg-orange-400' : 'bg-gray-200'}`}
                    >
                      <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-transform ${form.isReverse ? 'translate-x-5' : 'translate-x-0'}`} />
                    </button>
                  </div>
                </div>

                {/* 활성 여부 토글 */}
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
                  <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">활성 여부</h4>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-semibold text-gray-800">
                        {form.active ? '활성' : '비활성'}
                      </p>
                      <p className="text-xs text-gray-400 mt-0.5">
                        {form.active ? '진단에 포함됩니다' : '진단에서 제외됩니다'}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setForm(f => ({ ...f, active: !f.active }))}
                      className={`relative w-11 h-6 rounded-full transition-colors shrink-0 ${form.active ? 'bg-primary' : 'bg-gray-200'}`}
                    >
                      <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-transform ${form.active ? 'translate-x-5' : 'translate-x-0'}`} />
                    </button>
                  </div>
                </div>

                {/* 문항 순서 */}
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
                  <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">문항 순서</h4>
                  <div className="relative">
                    <input
                      type="number"
                      min="1"
                      value={form.orderNum}
                      onChange={e => setForm(f => ({ ...f, orderNum: e.target.value }))}
                      placeholder={`${questions.length + 1}`}
                      className="w-full h-10 pl-3 pr-10 border border-gray-200 rounded-lg text-sm text-gray-700 bg-gray-50 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400">번</span>
                  </div>
                  <p className="text-xs text-gray-400 mt-2">현재 총 {questions.length}개 문항</p>
                </div>
              </div>
            </div>

            {/* ── 기존 문항 참고 섹션 (접기/펼치기) ── */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
              <button
                type="button"
                onClick={() => setRefOpen(v => !v)}
                className="w-full px-5 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <span className="material-icons text-gray-400 text-[18px]">list_alt</span>
                  <span className="text-sm font-semibold text-gray-700">기존 문항 참고</span>
                  {!loading && (
                    <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">{questions.length}개</span>
                  )}
                </div>
                <span className={`material-icons text-gray-400 transition-transform ${refOpen ? 'rotate-180' : ''}`}>expand_more</span>
              </button>

              {refOpen && (
                <div className="border-t border-gray-100 divide-y divide-gray-100">
                  {loading ? (
                    <div className="p-6 space-y-3">
                      {[...Array(4)].map((_, i) => (
                        <div key={i} className="flex gap-3 animate-pulse">
                          <div className="w-6 h-6 rounded-full bg-gray-200 shrink-0" />
                          <div className="flex-1 space-y-1.5">
                            <div className="h-3 bg-gray-200 rounded w-4/5" />
                            <div className="h-2.5 bg-gray-100 rounded w-24" />
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : questions.map((q, i) => (
                    <div key={q.id} className="px-5 py-3 flex items-start gap-3 hover:bg-gray-50">
                      <span className="w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                        {i + 1}
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-gray-800 truncate">{q.content || q.questionContent}</p>
                        <p className="text-xs text-gray-400 mt-0.5">{q.category} · {q.active !== false ? '활성' : '비활성'}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>
        </main>
      </div>
    </div>
  );
}

export default AdminDiagnosisNew;
