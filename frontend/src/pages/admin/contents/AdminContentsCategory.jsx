import { useState } from 'react';
import AdminSidebar from '../../../components/admin/AdminSidebar';
import AdminHeader from '../../../components/admin/AdminHeader';

const REST_TYPES = [
  { key: 'physical',  label: '신체적 이완',   icon: 'fitness_center', color: '#EF4444', desc: '스트레칭, 산책, 가벼운 운동 등 신체 활동을 통한 이완' },
  { key: 'mental',    label: '정신적 고요',   icon: 'spa',            color: '#10B981', desc: '명상, 호흡, 마음챙김 등 정신적 안정을 위한 활동' },
  { key: 'sensory',   label: '감각의 정화',   icon: 'visibility_off', color: '#F59E0B', desc: '디지털 디톡스, 조용한 환경 등 감각 자극 최소화' },
  { key: 'emotional', label: '정서적 지지',   icon: 'favorite',       color: '#EC4899', desc: '일기 쓰기, 감사 나누기 등 감정 표현과 돌봄' },
  { key: 'social',    label: '사회적 휴식',   icon: 'groups',         color: '#8B5CF6', desc: '친구/가족과 가벼운 대화, 혼자만의 시간' },
  { key: 'nature',    label: '자연의 연결', icon: 'forest',         color: '#059669', desc: '공원, 산책로, 자연 공간에서 보내는 시간' },
  { key: 'creative',  label: '창조적 몰입',  icon: 'brush',          color: '#F97316', desc: '그림, 음악, 글쓰기 등 창작 활동에 집중' },
];

function AdminContentsCategory() {
  /* UI 전용 — 카테고리 추가 인풋 (API 미연결) */
  const [newLabel, setNewLabel] = useState('');

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      <AdminSidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <AdminHeader title="카테고리 관리" subtitle="휴식 유형 분류 체계입니다." />
        <main className="flex-1 overflow-y-auto p-6 space-y-5">

          {/* ── 안내 배너 ── */}
          <div className="flex items-start gap-3 px-4 py-3 bg-blue-50 border border-blue-200 rounded-xl">
            <span className="material-icons text-blue-400 text-[18px] mt-0.5 shrink-0">info</span>
            <p className="text-sm text-blue-700">
              휴식 유형은 7가지로 고정되어 있으며{' '}
              <code className="bg-blue-100 px-1.5 py-0.5 rounded text-xs font-mono">rest_types</code>{' '}
              테이블 Seed 데이터로 관리됩니다. 추가·삭제는 DB 직접 수정이 필요합니다.
            </p>
          </div>

          {/* ── 카테고리 추가 + 테이블 ── */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">

            {/* 상단 툴바: 추가 인풋 */}
            <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between gap-4">
              <div>
                <h3 className="text-sm font-bold text-gray-900">휴식 유형 목록</h3>
                <p className="text-xs text-gray-400 mt-0.5">총 {REST_TYPES.length}개 유형</p>
              </div>
              <div className="flex items-center gap-2">
                <div className="relative">
                  <span className="material-icons absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-[18px]">add_circle_outline</span>
                  <input
                    value={newLabel}
                    onChange={e => setNewLabel(e.target.value)}
                    placeholder="새 카테고리 이름"
                    className="h-9 pl-9 pr-4 w-52 border border-gray-200 rounded-lg text-sm text-gray-700 placeholder:text-gray-400 bg-gray-50 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                  />
                </div>
                <button
                  type="button"
                  disabled
                  title="DB 직접 수정 필요"
                  className="h-9 px-4 bg-primary/40 text-white text-sm font-bold rounded-lg cursor-not-allowed flex items-center gap-1.5"
                >
                  <span className="material-icons text-[16px]">add</span>
                  추가
                </button>
              </div>
            </div>

            {/* 테이블 */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200">
                    <th className="px-4 py-3 w-8" />
                    <th className="px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider w-8">#</th>
                    <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">유형</th>
                    <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider w-28">키</th>
                    <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">설명</th>
                    <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider w-20 text-center">콘텐츠</th>
                    <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right w-28">관리</th>
                  </tr>
                </thead>
                <tbody>
                  {REST_TYPES.map((type, i) => (
                    <tr
                      key={type.key}
                      className={`border-b border-gray-100 hover:bg-primary/5 transition-colors group ${i % 2 === 1 ? 'bg-gray-50/50' : 'bg-white'}`}
                    >
                      {/* 드래그 핸들 */}
                      <td className="px-4 py-3.5 w-8">
                        <span className="material-icons text-gray-300 text-[20px] cursor-grab group-hover:text-gray-400 transition-colors select-none">
                          drag_indicator
                        </span>
                      </td>

                      {/* 순서 */}
                      <td className="px-4 py-3.5 text-xs text-gray-400 tabular-nums">{i + 1}</td>

                      {/* 아이콘 + 이름 */}
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-3">
                          <div
                            className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
                            style={{ backgroundColor: `${type.color}18` }}
                          >
                            <span className="material-icons text-[18px]" style={{ color: type.color }}>
                              {type.icon}
                            </span>
                          </div>
                          <span className="font-semibold text-gray-900">{type.label}</span>
                        </div>
                      </td>

                      {/* 키 */}
                      <td className="px-4 py-3.5">
                        <code className="text-xs font-mono bg-gray-100 text-gray-600 px-2 py-0.5 rounded">
                          {type.key}
                        </code>
                      </td>

                      {/* 설명 */}
                      <td className="px-4 py-3.5 text-xs text-gray-500 max-w-xs truncate">
                        {type.desc}
                      </td>

                      {/* 콘텐츠 수 */}
                      <td className="px-4 py-3.5 text-center">
                        <span className="text-xs font-semibold text-gray-400">—</span>
                      </td>

                      {/* 관리 버튼 */}
                      <td className="px-4 py-3.5 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            disabled
                            title="DB 직접 수정 필요"
                            className="px-2.5 py-1 text-[11px] font-bold text-blue-400 border border-blue-200 rounded-lg cursor-not-allowed opacity-50"
                          >
                            수정
                          </button>
                          <button
                            disabled
                            title="DB 직접 수정 필요"
                            className="px-2.5 py-1 text-[11px] font-bold text-red-400 border border-red-200 rounded-lg cursor-not-allowed opacity-50"
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
          </div>

          {/* ── 점수 구조 카드 ── */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
            <div className="flex items-center gap-2 mb-4">
              <span className="material-icons text-primary text-[18px]">calculate</span>
              <h3 className="text-sm font-bold text-gray-900">유형별 점수 계산 구조</h3>
            </div>
            <div className="flex items-center gap-2 flex-wrap text-xs text-gray-600 mb-4">
              {['설문 응답', '유형별 점수 합산', '유형별 평균', '상위 3개 유형 선정', '추천 생성'].map((step, i, arr) => (
                <span key={step} className="flex items-center gap-2">
                  <span className="px-2.5 py-1 bg-gray-100 rounded-lg font-medium text-gray-700">{step}</span>
                  {i < arr.length - 1 && <span className="material-icons text-gray-300 text-base">arrow_forward</span>}
                </span>
              ))}
            </div>
            <div className="bg-gray-50 rounded-lg px-4 py-3 border border-gray-100">
              <p className="text-xs font-mono text-gray-500">
                예시: <span className="text-gray-700 font-semibold">physical</span> 2문항 →{' '}
                (80 + 60) ÷ 2 = <span className="text-primary font-bold">70점</span> →{' '}
                1위면 추천 생성
              </p>
            </div>
          </div>

        </main>
      </div>
    </div>
  );
}

export default AdminContentsCategory;
