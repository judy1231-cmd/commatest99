import { useState } from 'react';
import AdminSidebar from '../../../components/admin/AdminSidebar';
import AdminHeader from '../../../components/admin/AdminHeader';

const SUMMARY_CARDS = [
  { icon: 'psychology',  label: '추천 알고리즘',  value: '자동',    iconCls: 'bg-violet-50 text-violet-600' },
  { icon: 'category',    label: '활성 규칙 수',   value: '—',       iconCls: 'bg-emerald-50 text-emerald-600' },
  { icon: 'place',       label: '최대 추천 수',   value: '9개',     iconCls: 'bg-blue-50 text-blue-600' },
  { icon: 'touch_app',   label: '클릭/저장 추적', value: 'ON',      iconCls: 'bg-amber-50 text-amber-600' },
];

const REST_TYPE_COLORS = {
  physical:  'bg-red-50 text-red-600 border border-red-200',
  mental:    'bg-emerald-50 text-emerald-600 border border-emerald-200',
  sensory:   'bg-amber-50 text-amber-600 border border-amber-200',
  emotional: 'bg-pink-50 text-pink-600 border border-pink-200',
  social:    'bg-purple-50 text-purple-600 border border-purple-200',
  nature:    'bg-teal-50 text-teal-600 border border-teal-200',
  creative:  'bg-orange-50 text-orange-600 border border-orange-200',
  all:       'bg-gray-100 text-gray-600 border border-gray-200',
};

const REST_TYPE_LABELS = {
  physical: '신체적 이완', mental: '정신적 고요', sensory: '감각의 정화',
  emotional: '정서적 지지', social: '사회적 휴식', nature: '자연의 연결',
  creative: '창조적 몰입', all: '전체 유형',
};

/* UI 전용 — 기본 규칙 목 데이터 */
const DEFAULT_RULES = [
  { id: 1, priority: 1, condition: '스트레스 지수 80 이상', restType: 'mental',   active: true  },
  { id: 2, priority: 2, condition: '신체 점수 1위',          restType: 'physical', active: true  },
  { id: 3, priority: 3, condition: '감각 점수 1위',          restType: 'sensory',  active: true  },
  { id: 4, priority: 4, condition: '정서 점수 1위',          restType: 'emotional',active: true  },
  { id: 5, priority: 5, condition: '사회 점수 1위',          restType: 'social',   active: false },
  { id: 6, priority: 6, condition: '자연 점수 상위 3개',     restType: 'nature',   active: true  },
  { id: 7, priority: 7, condition: '창조 점수 상위 3개',     restType: 'creative', active: false },
  { id: 8, priority: 8, condition: '기본 추천 (진단 후 항상)', restType: 'all',    active: true  },
];

function AdminRecommend() {
  /* ── UI 전용 상태 ── */
  const [rules, setRules] = useState(DEFAULT_RULES);
  const [editingId, setEditingId] = useState(null);

  const toggleActive = (id) => {
    setRules(prev => prev.map(r => r.id === id ? { ...r, active: !r.active } : r));
  };

  const updatePriority = (id, value) => {
    setRules(prev => prev.map(r => r.id === id ? { ...r, priority: Number(value) } : r));
  };

  const activeCount = rules.filter(r => r.active).length;

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      <AdminSidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <AdminHeader title="추천 관리" subtitle="사용자 맞춤 추천 규칙을 관리합니다." />
        <main className="flex-1 overflow-y-auto p-6 space-y-5">

          {/* ── 요약 카드 ── */}
          <div className="grid grid-cols-4 gap-4">
            {SUMMARY_CARDS.map((card, i) => (
              <div key={i} className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 flex items-center gap-4">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${card.iconCls}`}>
                  <span className="material-icons text-[20px]">{card.icon}</span>
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900 leading-tight">
                    {card.label === '활성 규칙 수' ? `${activeCount}개` : card.value}
                  </p>
                  <p className="text-xs text-gray-400 mt-0.5">{card.label}</p>
                </div>
              </div>
            ))}
          </div>

          {/* ── 추천 규칙 테이블 ── */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">

            {/* 툴바 */}
            <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-gray-900">추천 규칙 목록</h3>
                <p className="text-xs text-gray-400 mt-0.5">
                  총 <span className="font-semibold text-gray-600">{rules.length}</span>개 규칙 ·
                  활성 <span className="font-semibold text-emerald-600">{activeCount}</span>개
                </p>
              </div>
              <button
                type="button"
                disabled
                title="추천 규칙 API 추후 지원 예정"
                className="h-9 px-4 bg-primary/40 text-white text-sm font-bold rounded-lg cursor-not-allowed flex items-center gap-1.5"
              >
                <span className="material-icons text-[16px]">add</span>
                규칙 추가
              </button>
            </div>

            {/* 안내 배너 */}
            <div className="px-5 py-2.5 border-b border-gray-100 bg-amber-50 flex items-center gap-2">
              <span className="material-icons text-amber-500 text-[16px]">construction</span>
              <p className="text-xs text-amber-700">
                추천 규칙 추가·수정·삭제 API는 추후 지원 예정입니다. 현재는 UI 미리보기 상태입니다.
              </p>
            </div>

            {/* 테이블 */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200">
                    <th className="px-4 py-3 w-8" />
                    <th className="px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider w-20">우선순위</th>
                    <th className="px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">조건</th>
                    <th className="px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider w-36">추천 유형</th>
                    <th className="px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider w-24 text-center">활성 여부</th>
                    <th className="px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right w-28">관리</th>
                  </tr>
                </thead>
                <tbody>
                  {rules
                    .slice()
                    .sort((a, b) => a.priority - b.priority)
                    .map((rule, idx) => (
                    <tr
                      key={rule.id}
                      className={`border-b border-gray-100 hover:bg-primary/5 transition-colors group ${idx % 2 === 1 ? 'bg-gray-50/50' : 'bg-white'}`}
                    >
                      {/* 드래그 핸들 */}
                      <td className="px-4 py-3.5 w-8">
                        <span className="material-icons text-gray-300 text-[20px] cursor-grab group-hover:text-gray-400 transition-colors select-none">
                          drag_indicator
                        </span>
                      </td>

                      {/* 우선순위 인풋 */}
                      <td className="px-4 py-3.5">
                        <input
                          type="number"
                          min="1"
                          value={rule.priority}
                          onChange={e => updatePriority(rule.id, e.target.value)}
                          className="w-14 h-7 px-2 text-center text-xs font-bold text-gray-700 border border-gray-200 rounded-lg bg-gray-50 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                        />
                      </td>

                      {/* 조건 */}
                      <td className="px-5 py-3.5">
                        {editingId === rule.id ? (
                          <input
                            autoFocus
                            defaultValue={rule.condition}
                            onBlur={() => setEditingId(null)}
                            className="w-full h-7 px-2 text-sm text-gray-800 border border-primary/40 rounded-lg outline-none focus:ring-2 focus:ring-primary/20"
                          />
                        ) : (
                          <p className="text-sm font-medium text-gray-800">{rule.condition}</p>
                        )}
                      </td>

                      {/* 추천 유형 배지 */}
                      <td className="px-5 py-3.5">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold ${REST_TYPE_COLORS[rule.restType] || REST_TYPE_COLORS.all}`}>
                          {REST_TYPE_LABELS[rule.restType] || rule.restType}
                        </span>
                      </td>

                      {/* 활성 토글 */}
                      <td className="px-5 py-3.5 text-center">
                        <button
                          type="button"
                          onClick={() => toggleActive(rule.id)}
                          className={`relative w-11 h-6 rounded-full transition-colors shrink-0 ${rule.active ? 'bg-primary' : 'bg-gray-200'}`}
                        >
                          <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-transform ${rule.active ? 'translate-x-5' : 'translate-x-0'}`} />
                        </button>
                      </td>

                      {/* 관리 버튼 */}
                      <td className="px-5 py-3.5 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => setEditingId(rule.id)}
                            className="px-2.5 py-1 text-[11px] font-bold text-blue-600 border border-blue-200 rounded-lg hover:bg-blue-50 transition-colors"
                          >
                            수정
                          </button>
                          <button
                            className="px-2.5 py-1 text-[11px] font-bold text-red-500 border border-red-200 rounded-lg hover:bg-red-50 transition-colors"
                          >
                            삭제
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* 하단 안내 */}
            <div className="px-5 py-3 border-t border-gray-100">
              <p className="text-xs text-gray-400">* 우선순위 숫자를 직접 입력하거나 드래그하여 순서를 변경할 수 있습니다. (저장은 API 연동 후 지원)</p>
            </div>
          </div>

          {/* ── 추천 데이터 현황 ── */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
            <div className="flex items-center gap-2 mb-4">
              <span className="material-icons text-primary text-[18px]">info</span>
              <h3 className="text-sm font-bold text-gray-900">추천 데이터 현황</h3>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">추천 생성 방식</p>
                <div className="flex items-center gap-2 flex-wrap text-xs text-gray-600">
                  {['설문 진단 완료', '유형별 점수 산출', '상위 3개 유형 선정', '유형별 장소 최대 3개', '추천 카드 생성'].map((step, i, arr) => (
                    <span key={step} className="flex items-center gap-2">
                      <span className="px-2 py-1 bg-white border border-gray-200 rounded-lg font-medium text-gray-700 shadow-sm">{step}</span>
                      {i < arr.length - 1 && <span className="material-icons text-gray-300 text-base">arrow_forward</span>}
                    </span>
                  ))}
                </div>
              </div>
              <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">추적 이벤트</p>
                <div className="space-y-1.5">
                  {[
                    { label: '추천 카드 클릭',  field: 'is_clicked',  color: 'text-blue-600' },
                    { label: '저장(북마크)',     field: 'is_saved',    color: 'text-emerald-600' },
                    { label: '추천 일시',        field: 'recommended_at', color: 'text-gray-500' },
                  ].map(item => (
                    <div key={item.field} className="flex items-center justify-between">
                      <span className="text-xs text-gray-500">{item.label}</span>
                      <code className={`text-[11px] font-mono bg-white border border-gray-200 px-1.5 py-0.5 rounded ${item.color}`}>{item.field}</code>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="bg-gray-50 rounded-lg px-4 py-3 border border-gray-100 space-y-1.5">
              <p className="text-[11px] font-mono text-gray-500">
                <span className="text-blue-500 font-semibold">GET</span>
                <span className="ml-2 text-gray-700">/api/recommendations</span>
                <span className="ml-2 text-gray-400">— 개인 추천 목록 (로그인 필요)</span>
              </p>
              <p className="text-[11px] font-mono text-gray-500">
                <span className="text-blue-500 font-semibold">GET</span>
                <span className="ml-2 text-gray-700">/api/admin/recommendations</span>
                <span className="ml-2 text-gray-400">— 전체 추천 현황 (관리자, 추후 지원)</span>
              </p>
            </div>
          </div>

        </main>
      </div>
    </div>
  );
}

export default AdminRecommend;
