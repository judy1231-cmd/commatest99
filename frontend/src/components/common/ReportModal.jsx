import { useState } from 'react';
import { fetchWithAuth } from '../../api/fetchWithAuth';

const REASONS = [
  '욕설 / 혐오 표현',
  '스팸 / 광고',
  '개인정보 노출',
  '음란물 / 불건전 내용',
  '기타',
];

function ReportModal({ targetType, targetId, onClose, onSuccess }) {
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async () => {
    if (!reason) { setError('신고 사유를 선택해주세요.'); return; }
    setLoading(true);
    setError(null);
    try {
      const data = await fetchWithAuth('/api/reports', {
        method: 'POST',
        body: JSON.stringify({ targetType, targetId, reason }),
      });
      if (data.success) {
        onSuccess?.();
        onClose();
      } else {
        setError(data.message || '신고 접수에 실패했어요.');
      }
    } catch {
      setError('네트워크 오류가 발생했어요.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4" onClick={onClose}>
      <div className="w-full max-w-sm bg-white rounded-3xl p-6" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <span className="material-icons text-red-400">flag</span>
            <h3 className="text-base font-extrabold text-slate-800">신고하기</h3>
          </div>
          <button onClick={onClose} className="text-slate-300 hover:text-slate-500 transition-colors">
            <span className="material-icons">close</span>
          </button>
        </div>

        <p className="text-xs text-slate-400 mb-4">신고 사유를 선택해주세요. 검토 후 조치가 이루어져요.</p>

        <div className="space-y-2 mb-5">
          {REASONS.map(r => (
            <button
              key={r}
              onClick={() => setReason(r)}
              className={`w-full text-left px-4 py-3 rounded-xl text-sm font-medium border transition-all ${
                reason === r
                  ? 'bg-red-50 border-red-300 text-red-600 font-bold'
                  : 'bg-slate-50 border-slate-200 text-slate-600 hover:border-slate-300'
              }`}
            >
              {r}
            </button>
          ))}
        </div>

        {error && (
          <p className="text-xs text-red-500 mb-3 flex items-center gap-1">
            <span className="material-icons text-sm">error_outline</span>{error}
          </p>
        )}

        <div className="flex gap-2">
          <button
            onClick={onClose}
            className="flex-1 py-3 rounded-xl border border-slate-200 text-sm font-bold text-slate-500 hover:bg-slate-50 transition-colors"
          >
            취소
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading || !reason}
            className="flex-1 py-3 rounded-xl bg-red-500 hover:bg-red-600 text-sm font-bold text-white transition-colors disabled:opacity-50"
          >
            {loading ? '접수 중...' : '신고 접수'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default ReportModal;
