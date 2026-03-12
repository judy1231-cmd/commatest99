import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { fetchWithAuth } from '../../../api/fetchWithAuth';
import AdminSidebar from '../../../components/admin/AdminSidebar';
import AdminHeader from '../../../components/admin/AdminHeader';

const STATUS_OPTIONS = [
  {
    value: 'active',
    label: '활성',
    desc: '정상 이용 가능한 상태',
    icon: 'check_circle',
    badge: 'bg-green-50 text-green-600 border border-green-200',
    card: {
      base: 'border-gray-200 hover:border-emerald-300 hover:bg-emerald-50/30',
      selected: 'border-emerald-400 bg-emerald-50 shadow-sm',
      icon: 'text-emerald-500',
      radio: 'border-emerald-400',
    },
  },
  {
    value: 'dormant',
    label: '휴면',
    desc: '장기 미접속 또는 본인 요청으로 휴면 처리',
    icon: 'hotel',
    badge: 'bg-gray-100 text-gray-500 border border-gray-200',
    card: {
      base: 'border-gray-200 hover:border-gray-400 hover:bg-gray-50',
      selected: 'border-gray-400 bg-gray-50 shadow-sm',
      icon: 'text-gray-500',
      radio: 'border-gray-400',
    },
  },
  {
    value: 'banned',
    label: '제한',
    desc: '규정 위반 등으로 이용 제한',
    icon: 'block',
    badge: 'bg-red-50 text-red-500 border border-red-200',
    card: {
      base: 'border-gray-200 hover:border-red-300 hover:bg-red-50/30',
      selected: 'border-red-400 bg-red-50 shadow-sm',
      icon: 'text-red-500',
      radio: 'border-red-400',
    },
  },
];

function AdminUserStatus() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [selected, setSelected] = useState('active');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [reason, setReason] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setResult(null);
    try {
      const data = await fetchWithAuth(`/api/admin/users/${id}/status`, {
        method: 'PUT',
        body: JSON.stringify({ status: selected }),
      });
      if (data.success) {
        setResult({ ok: true, msg: '상태가 변경되었습니다.' });
        setTimeout(() => navigate(-1), 1500);
      } else {
        setResult({ ok: false, msg: data.message || '변경에 실패했습니다.' });
      }
    } catch {
      setResult({ ok: false, msg: '서버 오류가 발생했습니다.' });
    } finally { setLoading(false); }
  };

  const selectedOpt = STATUS_OPTIONS.find(o => o.value === selected);

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      <AdminSidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <AdminHeader title="사용자 상태 변경" subtitle={`대상: ${id}`} />
        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-lg mx-auto space-y-5">

            {/* ── 뒤로가기 ── */}
            <button
              onClick={() => navigate(-1)}
              className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900 transition-colors group"
            >
              <span className="material-icons text-[18px] group-hover:-translate-x-0.5 transition-transform">arrow_back</span>
              돌아가기
            </button>

            {/* ── 대상 사용자 정보 ── */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  <span className="material-icons-round text-primary text-lg">manage_accounts</span>
                </div>
                <div>
                  <p className="text-xs text-gray-400">대상 사용자</p>
                  <p className="text-sm font-bold text-gray-900 font-mono">{id}</p>
                </div>
              </div>
              {/* 현재 선택된 상태 미리보기 배지 */}
              {selectedOpt && (
                <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${selectedOpt.badge}`}>
                  <span className={`material-icons text-sm ${selectedOpt.card.icon}`}>{selectedOpt.icon}</span>
                  {selectedOpt.label}(으)로 변경 예정
                </span>
              )}
            </div>

            {/* ── 상태 선택 폼 ── */}
            <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">

              {/* 헤더 */}
              <div className="px-6 py-4 border-b border-gray-100">
                <h3 className="text-sm font-bold text-gray-900">변경할 상태 선택</h3>
                <p className="text-xs text-gray-400 mt-0.5">변경 후 즉시 반영됩니다</p>
              </div>

              {/* 상태 카드 선택 */}
              <div className="px-6 py-5 space-y-3">
                {STATUS_OPTIONS.map(opt => (
                  <label
                    key={opt.value}
                    className={`flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                      selected === opt.value ? opt.card.selected : opt.card.base
                    }`}
                  >
                    <input
                      type="radio"
                      name="status"
                      value={opt.value}
                      checked={selected === opt.value}
                      onChange={() => setSelected(opt.value)}
                      className="sr-only"
                    />
                    {/* 아이콘 */}
                    <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${
                      selected === opt.value ? 'bg-white/70' : 'bg-gray-100'
                    }`}>
                      <span className={`material-icons text-[20px] ${opt.card.icon}`}>{opt.icon}</span>
                    </div>
                    {/* 라벨 + 설명 */}
                    <div className="flex-1">
                      <p className="text-sm font-bold text-gray-900">{opt.label}</p>
                      <p className="text-xs text-gray-400 mt-0.5">{opt.desc}</p>
                    </div>
                    {/* 선택 인디케이터 */}
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-all ${
                      selected === opt.value
                        ? `${opt.card.radio} bg-white`
                        : 'border-gray-300'
                    }`}>
                      {selected === opt.value && (
                        <div className={`w-2.5 h-2.5 rounded-full ${
                          opt.value === 'active'  ? 'bg-emerald-500' :
                          opt.value === 'banned'  ? 'bg-red-500'     : 'bg-gray-400'
                        }`} />
                      )}
                    </div>
                  </label>
                ))}
              </div>

              {/* 사유 입력 */}
              <div className="px-6 pb-5">
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                  변경 사유 <span className="text-gray-400 font-normal normal-case">(선택)</span>
                </label>
                <textarea
                  rows={3}
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="상태 변경 사유를 입력하세요 (내부 기록용)"
                  className="w-full px-3.5 py-3 border border-gray-200 rounded-lg text-sm text-gray-700 placeholder:text-gray-300 bg-gray-50 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none resize-none transition-all"
                />
              </div>

              {/* 결과 메시지 */}
              {result && (
                <div className={`mx-6 mb-4 flex items-center gap-2 px-4 py-3 rounded-lg text-sm ${
                  result.ok
                    ? 'bg-green-50 border border-green-200 text-green-700'
                    : 'bg-red-50 border border-red-200 text-red-600'
                }`}>
                  <span className="material-icons text-base">
                    {result.ok ? 'check_circle' : 'error_outline'}
                  </span>
                  {result.msg}
                </div>
              )}

              {/* 버튼 행 */}
              <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => navigate(-1)}
                  className="h-10 px-5 border border-gray-200 text-gray-600 text-sm font-semibold rounded-lg hover:bg-gray-50 transition-colors"
                >
                  취소
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="h-10 px-6 bg-primary hover:bg-primary/90 text-white text-sm font-bold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {loading ? (
                    <>
                      <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      변경 중...
                    </>
                  ) : (
                    <>
                      <span className="material-icons text-sm">check</span>
                      상태 변경
                    </>
                  )}
                </button>
              </div>
            </form>

          </div>
        </main>
      </div>
    </div>
  );
}

export default AdminUserStatus;
