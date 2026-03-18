import { useState, useMemo } from 'react';
import AdminSidebar from '../../../components/admin/AdminSidebar';
import AdminHeader from '../../../components/admin/AdminHeader';

const REST_TYPES = [
  { key: 'physical',  label: '신체의 이완', icon: 'fitness_center', color: '#EF4444' },
  { key: 'mental',    label: '정신적 고요', icon: 'spa',            color: '#10B981' },
  { key: 'sensory',   label: '감각의 정화', icon: 'visibility_off', color: '#F59E0B' },
  { key: 'emotional', label: '정서적 지지', icon: 'favorite',       color: '#EC4899' },
  { key: 'social',    label: '사회적 휴식', icon: 'groups',         color: '#8B5CF6' },
  { key: 'nature',    label: '자연의 연결', icon: 'forest',         color: '#059669' },
  { key: 'creative',  label: '창조적 몰입', icon: 'brush',          color: '#F97316' },
];

/* UI 전용 — 태그 목 데이터 (장소 Seed 실행 후 실제 데이터로 교체) */
const MOCK_TAGS = [
  { id: 1,  name: '조용한',      restType: 'mental',    usageCount: 48 },
  { id: 2,  name: '자연',        restType: 'nature',    usageCount: 41 },
  { id: 3,  name: '산책',        restType: 'physical',  usageCount: 37 },
  { id: 4,  name: '공원',        restType: 'nature',    usageCount: 35 },
  { id: 5,  name: '명상',        restType: 'mental',    usageCount: 30 },
  { id: 6,  name: '독서',        restType: 'sensory',   usageCount: 27 },
  { id: 7,  name: '카페',        restType: 'social',    usageCount: 25 },
  { id: 8,  name: '스트레칭',    restType: 'physical',  usageCount: 22 },
  { id: 9,  name: '그림',        restType: 'creative',  usageCount: 19 },
  { id: 10, name: '음악',        restType: 'creative',  usageCount: 17 },
  { id: 11, name: '친구',        restType: 'social',    usageCount: 15 },
  { id: 12, name: '감사일기',    restType: 'emotional', usageCount: 13 },
  { id: 13, name: '호흡',        restType: 'mental',    usageCount: 11 },
  { id: 14, name: '디지털 디톡스', restType: 'sensory', usageCount: 9  },
  { id: 15, name: '글쓰기',      restType: 'creative',  usageCount: 7  },
];

const TYPE_CHIP_COLORS = {
  physical:  { bg: 'bg-red-50',     text: 'text-red-600',     border: 'border-red-200'     },
  mental:    { bg: 'bg-emerald-50', text: 'text-emerald-600', border: 'border-emerald-200' },
  sensory:   { bg: 'bg-amber-50',   text: 'text-amber-600',   border: 'border-amber-200'   },
  emotional: { bg: 'bg-pink-50',    text: 'text-pink-600',    border: 'border-pink-200'    },
  social:    { bg: 'bg-purple-50',  text: 'text-purple-600',  border: 'border-purple-200'  },
  nature:    { bg: 'bg-teal-50',    text: 'text-teal-600',    border: 'border-teal-200'    },
  creative:  { bg: 'bg-orange-50',  text: 'text-orange-600',  border: 'border-orange-200'  },
};

const TYPE_LABEL = Object.fromEntries(REST_TYPES.map(t => [t.key, t.label]));

function AdminTagList() {
  /* ── UI 전용 상태 ── */
  const [newTag, setNewTag]     = useState('');
  const [search, setSearch]     = useState('');
  const [sortBy, setSortBy]     = useState('usage'); // 'usage' | 'name'
  const [typeFilter, setTypeFilter] = useState('');

  const maxUsage = Math.max(...MOCK_TAGS.map(t => t.usageCount));
  const totalUsage = MOCK_TAGS.reduce((s, t) => s + t.usageCount, 0);

  const filtered = useMemo(() => {
    let list = MOCK_TAGS.filter(t => {
      if (typeFilter && t.restType !== typeFilter) return false;
      if (search && !t.name.includes(search)) return false;
      return true;
    });
    if (sortBy === 'usage') list = [...list].sort((a, b) => b.usageCount - a.usageCount);
    if (sortBy === 'name')  list = [...list].sort((a, b) => a.name.localeCompare(b.name, 'ko'));
    return list;
  }, [search, sortBy, typeFilter]);

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      <AdminSidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <AdminHeader title="태그 관리" subtitle="장소 태그 및 휴식 유형 분류입니다." />
        <main className="flex-1 overflow-y-auto p-6 space-y-5">

          {/* ── 안내 배너 ── */}
          <div className="flex items-start gap-2 px-4 py-3 bg-amber-50 border border-amber-200 rounded-xl">
            <span className="material-icons text-amber-500 text-[16px] mt-0.5 shrink-0">info</span>
            <p className="text-sm text-amber-700">
              태그는 장소 Seed 실행 시 자동 생성됩니다. 관리자 → 장소 Seed (
              <code className="bg-amber-100 px-1 rounded text-xs font-mono">POST /api/admin/places/seed</code>
              )를 먼저 실행하세요. 현재는 UI 미리보기 상태입니다.
            </p>
          </div>

          {/* ── 요약 카드 ── */}
          <div className="grid grid-cols-4 gap-4">
            {[
              { icon: 'label',      label: '총 태그 수',   value: `${MOCK_TAGS.length}개`,         iconCls: 'bg-blue-50 text-blue-600'    },
              { icon: 'category',   label: '유형 분류',    value: `${REST_TYPES.length}가지`,      iconCls: 'bg-violet-50 text-violet-600' },
              { icon: 'place',      label: '장소 태그',    value: '—',                             iconCls: 'bg-emerald-50 text-emerald-600' },
              { icon: 'touch_app',  label: '총 사용 횟수', value: `${totalUsage}회`,               iconCls: 'bg-amber-50 text-amber-600'  },
            ].map((card, i) => (
              <div key={i} className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 flex items-center gap-4">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${card.iconCls}`}>
                  <span className="material-icons text-[20px]">{card.icon}</span>
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900 leading-tight">{card.value}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{card.label}</p>
                </div>
              </div>
            ))}
          </div>

          {/* ── 태그 테이블 카드 ── */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">

            {/* 툴바 */}
            <div className="px-5 py-4 border-b border-gray-100 space-y-3">

              {/* 1행: 태그 추가 인풋 + 정렬·검색 */}
              <div className="flex items-center gap-3">
                {/* 태그 추가 */}
                <div className="flex items-center gap-2 flex-1">
                  <div className="relative flex-1 max-w-xs">
                    <span className="material-icons absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-[18px]">add_circle_outline</span>
                    <input
                      value={newTag}
                      onChange={e => setNewTag(e.target.value)}
                      placeholder="새 태그 이름 입력"
                      className="w-full h-9 pl-9 pr-4 border border-gray-200 rounded-lg text-sm text-gray-700 placeholder:text-gray-400 bg-gray-50 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                    />
                  </div>
                  <button
                    type="button"
                    disabled
                    title="태그 추가 API 추후 지원 예정"
                    className="h-9 px-4 bg-primary/40 text-white text-sm font-bold rounded-lg cursor-not-allowed flex items-center gap-1.5 shrink-0"
                  >
                    <span className="material-icons text-[16px]">add</span>
                    추가
                  </button>
                </div>

                {/* 검색 */}
                <div className="relative">
                  <span className="material-icons absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-[16px]">search</span>
                  <input
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    placeholder="태그 검색"
                    className="h-9 pl-9 pr-4 w-44 border border-gray-200 rounded-lg text-sm text-gray-700 placeholder:text-gray-400 bg-gray-50 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                  />
                </div>

                {/* 정렬 */}
                <div className="flex items-center gap-1 shrink-0">
                  <span className="text-xs text-gray-400 mr-1">정렬</span>
                  {[
                    { key: 'usage', label: '사용 많은 순' },
                    { key: 'name',  label: '이름 순' },
                  ].map(s => (
                    <button
                      key={s.key}
                      onClick={() => setSortBy(s.key)}
                      className={`h-7 px-3 rounded-lg text-xs font-semibold border transition-all ${
                        sortBy === s.key
                          ? 'bg-primary text-white border-primary'
                          : 'bg-white text-gray-500 border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* 2행: 유형 필터 칩 */}
              <div className="flex items-center gap-1.5 flex-wrap">
                <button
                  onClick={() => setTypeFilter('')}
                  className={`h-7 px-3 rounded-lg text-xs font-semibold border transition-all ${
                    typeFilter === ''
                      ? 'bg-primary text-white border-primary'
                      : 'bg-white text-gray-500 border-gray-200 hover:border-gray-300'
                  }`}
                >
                  전체
                </button>
                {REST_TYPES.map(t => {
                  const c = TYPE_CHIP_COLORS[t.key];
                  const count = MOCK_TAGS.filter(tag => tag.restType === t.key).length;
                  return (
                    <button
                      key={t.key}
                      onClick={() => setTypeFilter(t.key)}
                      className={`h-7 px-3 rounded-lg text-xs font-semibold border transition-all flex items-center gap-1 ${
                        typeFilter === t.key
                          ? 'bg-primary text-white border-primary'
                          : 'bg-white text-gray-500 border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      {t.label}
                      <span className={`text-[10px] font-bold px-1 rounded-full ${
                        typeFilter === t.key ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-500'
                      }`}>{count}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 건수 */}
            <div className="px-5 py-2 border-b border-gray-100 bg-gray-50/60">
              <p className="text-xs text-gray-400">
                총 <span className="font-semibold text-gray-600">{filtered.length}</span>개 태그
                {(search || typeFilter) && (
                  <button
                    onClick={() => { setSearch(''); setTypeFilter(''); }}
                    className="ml-2 text-primary hover:underline"
                  >
                    필터 초기화
                  </button>
                )}
              </p>
            </div>

            {/* 테이블 */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200">
                    <th className="px-5 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider w-12">#</th>
                    <th className="px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">태그</th>
                    <th className="px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider w-32">유형</th>
                    <th className="px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">사용 횟수</th>
                    <th className="px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right w-28">관리</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-16 text-center">
                        <div className="flex flex-col items-center gap-2 text-gray-300">
                          <span className="material-icons text-4xl">label_off</span>
                          <p className="text-sm text-gray-400">
                            {search ? `"${search}"에 해당하는 태그가 없습니다` : '태그가 없습니다'}
                          </p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    filtered.map((tag, idx) => {
                      const typeInfo = REST_TYPES.find(t => t.key === tag.restType);
                      const chipCls  = TYPE_CHIP_COLORS[tag.restType] || { bg: 'bg-gray-100', text: 'text-gray-600', border: 'border-gray-200' };
                      const barPct   = Math.round((tag.usageCount / maxUsage) * 100);

                      return (
                        <tr
                          key={tag.id}
                          className={`border-b border-gray-100 hover:bg-primary/5 transition-colors ${idx % 2 === 1 ? 'bg-gray-50/50' : 'bg-white'}`}
                        >
                          {/* 번호 */}
                          <td className="px-5 py-3.5 text-xs text-gray-400 tabular-nums">{idx + 1}</td>

                          {/* 태그 pill */}
                          <td className="px-5 py-3.5">
                            <span
                              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-semibold border ${chipCls.bg} ${chipCls.text} ${chipCls.border}`}
                            >
                              <span className="material-icons text-[13px]">label</span>
                              {tag.name}
                            </span>
                          </td>

                          {/* 유형 배지 */}
                          <td className="px-5 py-3.5">
                            {typeInfo ? (
                              <div className="flex items-center gap-1.5">
                                <div
                                  className="w-5 h-5 rounded flex items-center justify-center shrink-0"
                                  style={{ backgroundColor: `${typeInfo.color}18` }}
                                >
                                  <span className="material-icons text-[11px]" style={{ color: typeInfo.color }}>{typeInfo.icon}</span>
                                </div>
                                <span className="text-xs font-semibold text-gray-700">{typeInfo.label}</span>
                              </div>
                            ) : (
                              <span className="text-xs text-gray-300">—</span>
                            )}
                          </td>

                          {/* 사용 횟수 + bar */}
                          <td className="px-5 py-3.5">
                            <div className="flex items-center gap-3">
                              <span className="text-sm font-bold text-gray-800 tabular-nums w-8 shrink-0">{tag.usageCount}</span>
                              <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden max-w-[120px]">
                                <div
                                  className="h-full rounded-full transition-all"
                                  style={{
                                    width: `${barPct}%`,
                                    backgroundColor: typeInfo?.color || '#10B981',
                                  }}
                                />
                              </div>
                            </div>
                          </td>

                          {/* 관리 버튼 */}
                          <td className="px-5 py-3.5 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                disabled
                                title="태그 수정 API 추후 지원 예정"
                                className="px-2.5 py-1 text-[11px] font-bold text-blue-400 border border-blue-200 rounded-lg cursor-not-allowed opacity-60"
                              >
                                수정
                              </button>
                              <button
                                disabled
                                title="태그 삭제 API 추후 지원 예정"
                                className="px-2.5 py-1 text-[11px] font-bold text-red-400 border border-red-200 rounded-lg cursor-not-allowed opacity-60"
                              >
                                삭제
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            <div className="px-5 py-3 border-t border-gray-100">
              <p className="text-xs text-gray-400">* 태그 추가·수정·삭제는 장소 Seed 실행 및 API 연동 후 지원됩니다.</p>
            </div>
          </div>

          {/* ── 유형 태그 현황 ── */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
            <div className="flex items-center gap-2 mb-4">
              <span className="material-icons text-primary text-[18px]">category</span>
              <h3 className="text-sm font-bold text-gray-900">휴식 유형 태그 현황</h3>
            </div>
            <div className="grid grid-cols-4 gap-3">
              {REST_TYPES.map(type => {
                const count = MOCK_TAGS.filter(t => t.restType === type.key).length;
                const usage = MOCK_TAGS.filter(t => t.restType === type.key).reduce((s, t) => s + t.usageCount, 0);
                return (
                  <div
                    key={type.key}
                    className="flex items-center gap-3 p-3 rounded-xl border border-gray-100 hover:border-gray-200 transition-colors"
                  >
                    <div
                      className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
                      style={{ backgroundColor: `${type.color}18` }}
                    >
                      <span className="material-icons text-[18px]" style={{ color: type.color }}>{type.icon}</span>
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-gray-800 truncate">{type.label}</p>
                      <p className="text-[11px] text-gray-400 mt-0.5">
                        태그 <span className="font-semibold text-gray-600">{count}</span>개 ·
                        사용 <span className="font-semibold text-gray-600">{usage}</span>회
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

        </main>
      </div>
    </div>
  );
}

export default AdminTagList;
