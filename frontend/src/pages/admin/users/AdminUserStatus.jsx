import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { fetchWithAuth } from '../../../api/fetchWithAuth';
import AdminSidebar from '../../../components/admin/AdminSidebar';
import AdminHeader from '../../../components/admin/AdminHeader';

const STATUS_OPTIONS = [
  { value: 'active',  label: '활성', desc: '정상 이용 가능한 상태' },
  { value: 'dormant', label: '휴면', desc: '장기 미접속 또는 본인 요청으로 휴면 처리' },
  { value: 'banned',  label: '제한', desc: '규정 위반 등으로 이용 제한' },
];

function AdminUserStatus() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [selected, setSelected] = useState('active');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

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

  return (
    <div className="flex h-screen overflow-hidden bg-background-light">
      <AdminSidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <AdminHeader title="사용자 상태 변경" subtitle={`대상: ${id}`} />
        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-md">
            <button onClick={() => navigate(-1)} className="flex items-center gap-1 text-sm text-gray-500 hover:text-primary mb-6">
              <span className="material-icons text-base">arrow_back</span> 돌아가기
            </button>
            <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 space-y-4">
              <h3 className="font-bold text-gray-800 mb-4">변경할 상태를 선택하세요</h3>
              {STATUS_OPTIONS.map(opt => (
                <label key={opt.value} className={`flex items-start gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${selected === opt.value ? 'border-primary bg-primary/5' : 'border-gray-100 hover:border-gray-200'}`}>
                  <input type="radio" name="status" value={opt.value} checked={selected === opt.value}
                    onChange={() => setSelected(opt.value)} className="mt-0.5 accent-primary" />
                  <div>
                    <p className="font-bold text-gray-800 text-sm">{opt.label}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{opt.desc}</p>
                  </div>
                </label>
              ))}
              {result && (
                <div className={`p-3 rounded-xl text-sm ${result.ok ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-600'}`}>{result.msg}</div>
              )}
              <button type="submit" disabled={loading}
                className="w-full py-3 bg-primary text-white font-bold rounded-xl hover:bg-primary/90 transition-all disabled:opacity-50">
                {loading ? '변경 중...' : '상태 변경'}
              </button>
            </form>
          </div>
        </main>
      </div>
    </div>
  );
}

export default AdminUserStatus;
