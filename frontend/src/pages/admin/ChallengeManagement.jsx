import { useState } from 'react';
import AdminSidebar from '../../components/admin/AdminSidebar';
import AdminHeader from '../../components/admin/AdminHeader';

const challenges = [
  { title: '7일 자연 산책',      type: '신체적 휴식', participants: 1284, status: '진행중', startDate: '2023.11.01', endDate: '2023.11.30' },
  { title: '디지털 디톡스 3일',  type: '정신적 휴식', participants: 892,  status: '진행중', startDate: '2023.11.10', endDate: '2023.11.30' },
  { title: '명상 21일 챌린지',   type: '정신적 휴식', participants: 2150, status: '진행중', startDate: '2023.10.01', endDate: '2023.10.31' },
  { title: '감사 일기 30일',     type: '감정적 휴식', participants: 3421, status: '종료',   startDate: '2023.09.01', endDate: '2023.09.30' },
];

const CHALLENGE_STATUS = {
  '진행중': { cls: 'bg-emerald-50 text-emerald-700 border border-emerald-200', dot: 'bg-emerald-500', accent: 'bg-emerald-500', bar: '#10B981' },
  '종료':   { cls: 'bg-gray-100 text-gray-500 border border-gray-200',         dot: 'bg-gray-400',    accent: 'bg-gray-300',    bar: '#9CA3AF' },
  '예정':   { cls: 'bg-blue-50 text-blue-600 border border-blue-200',           dot: 'bg-blue-500',    accent: 'bg-blue-500',    bar: '#3B82F6' },
};

const STATUS_FILTERS = ['전체', '진행중', '종료', '예정'];

const MAX_PARTICIPANTS = Math.max(...challenges.map(c => c.participants));

function ChallengeManagement() {
  /* ── UI 전용 상태 ── */
  const [statusFilter, setStatusFilter] = useState('전체');

  const filtered = statusFilter === '전체'
    ? challenges
    : challenges.filter(c => c.status === statusFilter);

  const activeCount  = challenges.filter(c => c.status === '진행중').length;
  const endedCount   = challenges.filter(c => c.status === '종료').length;
  const totalParticipants = challenges.reduce((s, c) => s + c.participants, 0);

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      <AdminSidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <AdminHeader title="챌린지 관리" subtitle="진행 중인 챌린지를 관리하세요." />
        <main className="flex-1 overflow-y-auto p-6 space-y-5">

          {/* ── 2차 MVP 준비중 배너 ── */}
          <div className="flex items-center gap-3 px-4 py-3 bg-amber-50 border border-amber-200 rounded-xl">
            <span className="material-icons text-amber-500 text-[20px] shrink-0">construction</span>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-amber-800">챌린지 기능 — 2차 MVP 예정</p>
              <p className="text-xs text-amber-600 mt-0.5">챌린지 생성·수정·삭제 API 미연결 상태입니다. 현재 화면은 UI 미리보기입니다.</p>
            </div>
            <span className="shrink-0 text-xs font-bold text-amber-600 bg-amber-100 border border-amber-200 px-2.5 py-1 rounded-full">준비중</span>
          </div>

          {/* ── 요약 카드 ── */}
          <div className="grid grid-cols-4 gap-4">
            {[
              { icon: 'emoji_events',  label: '전체 챌린지',    value: `${challenges.length}`,         unit: '개', iconCls: 'bg-amber-50 text-amber-600'   },
              { icon: 'play_circle',   label: '진행 중',        value: `${activeCount}`,               unit: '개', iconCls: 'bg-emerald-50 text-emerald-600' },
              { icon: 'check_circle',  label: '완료 챌린지',    value: `${endedCount}`,                unit: '개', iconCls: 'bg-gray-100 text-gray-500'    },
              { icon: 'group',         label: '총 참여자',      value: totalParticipants.toLocaleString(), unit: '명', iconCls: 'bg-blue-50 text-blue-600' },
            ].map((card, i) => (
              <div key={i} className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 flex items-center gap-4">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${card.iconCls}`}>
                  <span className="material-icons text-[20px]">{card.icon}</span>
                </div>
                <div>
                  <div className="flex items-end gap-1">
                    <span className="text-2xl font-black text-gray-900 leading-none">{card.value}</span>
                    <span className="text-sm text-gray-400 mb-0.5">{card.unit}</span>
                  </div>
                  <p className="text-xs text-gray-400 mt-0.5">{card.label}</p>
                </div>
              </div>
            ))}
          </div>

          {/* ── 툴바 ── */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              {STATUS_FILTERS.map(s => (
                <button
                  key={s}
                  onClick={() => setStatusFilter(s)}
                  className={`h-8 px-4 rounded-lg text-xs font-semibold border transition-all ${
                    statusFilter === s
                      ? 'bg-primary text-white border-primary'
                      : 'bg-white text-gray-500 border-gray-200 hover:border-gray-300'
                  }`}
                >
                  {s}
                  {s !== '전체' && (
                    <span className={`ml-1.5 text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                      statusFilter === s ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-500'
                    }`}>
                      {challenges.filter(c => c.status === s).length}
                    </span>
                  )}
                </button>
              ))}
            </div>
            <button
              type="button"
              disabled
              title="챌린지 추가 API 추후 지원 예정"
              className="h-9 px-4 bg-primary/40 text-white text-sm font-bold rounded-lg cursor-not-allowed flex items-center gap-1.5"
            >
              <span className="material-icons text-[16px]">add</span>
              챌린지 추가
            </button>
          </div>

          {/* ── 챌린지 카드 목록 ── */}
          {filtered.length === 0 ? (
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm py-16 text-center">
              <div className="flex flex-col items-center gap-2 text-gray-300">
                <span className="material-icons text-5xl">emoji_events</span>
                <p className="text-sm text-gray-400">해당 상태의 챌린지가 없습니다</p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4">
              {filtered.map((c, idx) => {
                const st       = CHALLENGE_STATUS[c.status] || CHALLENGE_STATUS['종료'];
                const barPct   = Math.round((c.participants / MAX_PARTICIPANTS) * 100);

                return (
                  <div
                    key={idx}
                    className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden hover:shadow-md transition-shadow"
                  >
                    {/* 상단 컬러 accent */}
                    <div className={`h-1 w-full ${st.accent}`} />

                    <div className="p-5">
                      {/* 헤더: 상태 배지 + 유형 */}
                      <div className="flex items-center justify-between mb-3">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold ${st.cls}`}>
                          <span className={`w-1.5 h-1.5 rounded-full inline-block ${st.dot}`} />
                          {c.status}
                        </span>
                        <span className="text-[11px] font-bold bg-teal-50 text-teal-600 border border-teal-200 px-2.5 py-0.5 rounded-full">
                          {c.type}
                        </span>
                      </div>

                      {/* 제목 */}
                      <h4 className="text-base font-bold text-gray-900 mb-1 truncate">{c.title}</h4>

                      {/* 기간 */}
                      <div className="flex items-center gap-1.5 text-xs text-gray-400 mb-4">
                        <span className="material-icons text-[14px]">calendar_today</span>
                        <span className="tabular-nums">{c.startDate}</span>
                        <span>~</span>
                        <span className="tabular-nums">{c.endDate}</span>
                      </div>

                      {/* 참여자 수 + bar */}
                      <div className="mb-4">
                        <div className="flex items-end justify-between mb-1.5">
                          <span className="text-xs text-gray-400">참여자</span>
                          <div className="flex items-end gap-1">
                            <span className="text-xl font-black text-gray-900 leading-none">{c.participants.toLocaleString()}</span>
                            <span className="text-xs text-gray-400 mb-0.5">명</span>
                          </div>
                        </div>
                        <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all"
                            style={{ width: `${barPct}%`, backgroundColor: st.bar }}
                          />
                        </div>
                      </div>

                      {/* 관리 버튼 */}
                      <div className="flex items-center gap-2 pt-3 border-t border-gray-100">
                        <button
                          disabled
                          title="수정 API 추후 지원 예정"
                          className="flex-1 h-8 text-xs font-bold text-blue-400 border border-blue-200 rounded-lg cursor-not-allowed opacity-70 flex items-center justify-center gap-1"
                        >
                          <span className="material-icons text-[14px]">edit</span>
                          수정
                        </button>
                        <button
                          disabled
                          title="통계 API 추후 지원 예정"
                          className="flex-1 h-8 text-xs font-bold text-gray-500 border border-gray-200 rounded-lg cursor-not-allowed opacity-70 flex items-center justify-center gap-1"
                        >
                          <span className="material-icons text-[14px]">bar_chart</span>
                          통계
                        </button>
                        <button
                          disabled
                          title="일시정지 API 추후 지원 예정"
                          className="flex-1 h-8 text-xs font-bold text-red-400 border border-red-200 rounded-lg cursor-not-allowed opacity-70 flex items-center justify-center gap-1"
                        >
                          <span className="material-icons text-[14px]">pause_circle</span>
                          중단
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          <p className="text-xs text-gray-400 text-center pb-2">* 챌린지 기능은 2차 MVP 예정입니다. 생성·수정·삭제·통계 API 연동 후 활성화됩니다.</p>

        </main>
      </div>
    </div>
  );
}

export default ChallengeManagement;
