import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminSidebar from '../../../components/admin/AdminSidebar';
import AdminHeader from '../../../components/admin/AdminHeader';

const INFO_CARDS = [
  { icon: 'quiz',       label: '총 설문 문항',   value: '12문항',  iconCls: 'bg-blue-50 text-blue-600' },
  { icon: 'category',   label: '휴식 유형 분류', value: '7가지',   iconCls: 'bg-emerald-50 text-emerald-600' },
  { icon: 'psychology', label: '스트레스 지수',  value: '0~100점', iconCls: 'bg-amber-50 text-amber-600' },
];

const TYPE_COLORS = {
  physical:  'bg-blue-50 text-blue-600 border border-blue-200',
  mental:    'bg-violet-50 text-violet-600 border border-violet-200',
  sensory:   'bg-cyan-50 text-cyan-600 border border-cyan-200',
  emotional: 'bg-pink-50 text-pink-600 border border-pink-200',
  social:    'bg-orange-50 text-orange-600 border border-orange-200',
  nature:    'bg-emerald-50 text-emerald-600 border border-emerald-200',
  creative:  'bg-amber-50 text-amber-600 border border-amber-200',
};

const TYPE_LABELS = {
  physical: '신체의 이완', mental: '정신적 고요', sensory: '감각의 정화',
  emotional: '정서적 지지', social: '사회적 휴식', nature: '자연의 연결', creative: '창조적 몰입',
};

function AdminDiagnosisList() {
  const navigate = useNavigate();
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);

  /* ── UI 전용 상태 ── */
  const [typeFilter, setTypeFilter] = useState('');

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

  /* 클라이언트 필터 */
  const filtered = typeFilter
    ? questions.filter(q => (q.category || '').toLowerCase() === typeFilter)
    : questions;

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      <AdminSidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <AdminHeader title="진단 문항 관리" subtitle="사용자 설문 진단 문항 현황입니다." />
        <main className="flex-1 overflow-y-auto p-6 space-y-5">

          {/* ── 요약 카드 ── */}
          <div className="grid grid-cols-3 gap-4">
            {INFO_CARDS.map((card, i) => (
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

          {/* ── 테이블 카드 ── */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">

            {/* 툴바: 필터 칩(좌) + 새 문항 추가(우) */}
            <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between gap-3">
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
                {Object.entries(TYPE_LABELS).map(([key, label]) => (
                  <button
                    key={key}
                    onClick={() => setTypeFilter(key)}
                    className={`h-7 px-3 rounded-lg text-xs font-semibold border transition-all ${
                      typeFilter === key
                        ? 'bg-primary text-white border-primary'
                        : 'bg-white text-gray-500 border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
              <button
                onClick={() => navigate('/admin/diagnosis/new')}
                className="h-9 px-4 bg-primary hover:bg-primary/90 text-white text-sm font-bold rounded-lg transition-colors flex items-center gap-1.5 shrink-0"
              >
                <span className="material-icons text-[16px]">add</span>
                새 문항 추가
              </button>
            </div>

            {/* 건수 표시 */}
            <div className="px-5 py-2 border-b border-gray-100 bg-gray-50/60">
              <p className="text-xs text-gray-400">
                총 <span className="font-semibold text-gray-600">{filtered.length}</span>개 문항
                {typeFilter && <span className="ml-1 text-primary font-medium">· {TYPE_LABELS[typeFilter]} 필터 적용 중</span>}
              </p>
            </div>

            {/* ── 테이블 ── */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200">
                    <th className="px-5 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider w-12">#</th>
                    <th className="px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">문항 내용</th>
                    <th className="px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider w-32">유형</th>
                    <th className="px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider w-20 text-center">역문항</th>
                    <th className="px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider w-20 text-center">상태</th>
                    <th className="px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right w-28">관리</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    [...Array(8)].map((_, i) => (
                      <tr key={i} className={`border-b border-gray-100 ${i % 2 === 1 ? 'bg-gray-50/60' : ''}`}>
                        <td className="px-5 py-3.5"><div className="w-6 h-3 bg-gray-200 rounded animate-pulse" /></td>
                        <td className="px-5 py-3.5"><div className="w-72 h-3 bg-gray-200 rounded animate-pulse" /></td>
                        <td className="px-5 py-3.5"><div className="w-20 h-5 bg-gray-200 rounded-full animate-pulse" /></td>
                        <td className="px-5 py-3.5 text-center"><div className="w-8 h-5 bg-gray-200 rounded-full animate-pulse mx-auto" /></td>
                        <td className="px-5 py-3.5 text-center"><div className="w-12 h-5 bg-gray-200 rounded-full animate-pulse mx-auto" /></td>
                        <td className="px-5 py-3.5 text-right">
                          <div className="flex justify-end gap-2">
                            <div className="w-10 h-6 bg-gray-200 rounded-lg animate-pulse" />
                            <div className="w-10 h-6 bg-gray-200 rounded-lg animate-pulse" />
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : filtered.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-16 text-center">
                        <div className="flex flex-col items-center gap-2 text-gray-300">
                          <span className="material-icons text-4xl">quiz</span>
                          <p className="text-sm text-gray-400">
                            {typeFilter ? '해당 유형의 문항이 없습니다' : '설문 문항이 없습니다'}
                          </p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    filtered.map((q, idx) => {
                      const cat      = (q.category || '').toLowerCase();
                      const typeCls  = TYPE_COLORS[cat] || 'bg-gray-100 text-gray-500 border border-gray-200';
                      const typeLabel = TYPE_LABELS[cat] || q.category || '-';
                      const isActive  = q.active !== false;
                      const isReverse = q.isReverse || q.reverse || false;

                      return (
                        <tr
                          key={q.id}
                          onClick={() => navigate(`/admin/diagnosis/${q.id}/edit`)}
                          className={`border-b border-gray-100 hover:bg-primary/5 transition-colors cursor-pointer ${idx % 2 === 1 ? 'bg-gray-50/50' : 'bg-white'}`}
                        >
                          {/* 번호 */}
                          <td className="px-5 py-3.5 text-xs text-gray-400 tabular-nums">
                            {q.orderNum || q.sortOrder || idx + 1}
                          </td>

                          {/* 문항 내용 */}
                          <td className="px-5 py-3.5 max-w-xs">
                            <p className="text-sm font-medium text-gray-900 truncate">
                              {q.content || q.questionContent || '-'}
                            </p>
                          </td>

                          {/* 유형 배지 */}
                          <td className="px-5 py-3.5">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold ${typeCls}`}>
                              {typeLabel}
                            </span>
                          </td>

                          {/* 역문항 */}
                          <td className="px-5 py-3.5 text-center">
                            {isReverse ? (
                              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold bg-orange-50 text-orange-500 border border-orange-200">역</span>
                            ) : (
                              <span className="text-gray-300 text-xs">—</span>
                            )}
                          </td>

                          {/* 상태 */}
                          <td className="px-5 py-3.5 text-center">
                            <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                              isActive
                                ? 'bg-green-50 text-green-600 border border-green-200'
                                : 'bg-gray-100 text-gray-400 border border-gray-200'
                            }`}>
                              <span className={`w-1.5 h-1.5 rounded-full inline-block ${isActive ? 'bg-green-500' : 'bg-gray-300'}`} />
                              {isActive ? '활성' : '비활성'}
                            </span>
                          </td>

                          {/* 관리 버튼 */}
                          <td className="px-5 py-3.5 text-right" onClick={e => e.stopPropagation()}>
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                onClick={() => navigate(`/admin/diagnosis/${q.id}/edit`)}
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
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* 하단 안내 */}
            {!loading && (
              <div className="px-5 py-3 border-t border-gray-100">
                <p className="text-xs text-gray-400">* 행 클릭 시 수정 페이지로 이동합니다. 개별 진단 결과 조회 API는 추후 지원 예정입니다.</p>
              </div>
            )}
          </div>

        </main>
      </div>
    </div>
  );
}

export default AdminDiagnosisList;
