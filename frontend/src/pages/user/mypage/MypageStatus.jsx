import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import UserNavbar from '../../../components/user/UserNavbar';
import { fetchWithAuth } from '../../../api/fetchWithAuth';

const STATUS_INFO = {
  active:  { label: '정상', icon: 'check_circle', color: '#10B981', bg: '#ECFDF5' },
  dormant: { label: '휴면', icon: 'bedtime',       color: '#F59E0B', bg: '#FFFBEB' },
  banned:  { label: '이용 제한', icon: 'block',    color: '#EF4444', bg: '#FEF2F2' },
};

function InfoRow({ label, value, highlight }) {
  return (
    <div className="flex items-center justify-between py-3.5 border-b border-slate-50 last:border-0">
      <span className="text-sm text-slate-400">{label}</span>
      <span className={`text-sm font-semibold ${highlight ? 'text-primary' : 'text-slate-700'}`}>
        {value}
      </span>
    </div>
  );
}

function MypageStatus() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const data = await fetchWithAuth('/api/user/profile');
        if (data.success) setProfile(data.data);
      } catch { /* 무시 */ } finally { setLoading(false); }
    })();
  }, []);

  const user = profile?.user;
  const statusInfo = STATUS_INFO[user?.status] || STATUS_INFO.active;

  return (
    <div className="min-h-screen bg-[#F7F7F8]">
      <UserNavbar />

      <main className="max-w-lg mx-auto px-4 pt-6 pb-24">

        {/* 뒤로가기 */}
        <button
          onClick={() => navigate('/my')}
          className="flex items-center gap-1 text-sm text-slate-400 hover:text-primary mb-5 transition-colors"
        >
          <span className="material-icons text-base">arrow_back</span>
          마이페이지
        </button>

        {/* 헤더 */}
        <div className="mb-6">
          <h1 className="text-[22px] font-extrabold tracking-tight text-slate-800">계정 상태</h1>
          <p className="text-xs text-slate-400 mt-0.5">내 계정의 현재 상태를 확인해요</p>
        </div>

        {/* 로딩 */}
        {loading && (
          <div className="flex justify-center items-center h-40">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
          </div>
        )}

        {!loading && !user && (
          <div className="bg-white rounded-2xl p-8 text-center border border-slate-100 shadow-sm">
            <span className="material-icons text-4xl text-slate-200 block mb-2">person_off</span>
            <p className="text-slate-400 text-sm">정보를 불러올 수 없어요.</p>
          </div>
        )}

        {!loading && user && (
          <div className="space-y-4">

            {/* 계정 상태 배너 */}
            <div
              className="rounded-2xl p-5 flex items-center gap-4"
              style={{ backgroundColor: statusInfo.bg }}
            >
              <div
                className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0"
                style={{ backgroundColor: `${statusInfo.color}25` }}
              >
                <span className="material-icons text-2xl" style={{ color: statusInfo.color }}>
                  {statusInfo.icon}
                </span>
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-wider mb-0.5" style={{ color: statusInfo.color }}>
                  계정 상태
                </p>
                <p className="text-lg font-black text-slate-800">{statusInfo.label}</p>
              </div>
            </div>

            {/* 계정 상세 정보 */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">계정 정보</p>
              <div>
                <InfoRow label="쉼표번호"    value={user.쉼표번호 || user.commaNo || '-'} highlight />
                <InfoRow label="이메일"      value={user.email || '-'} />
                <InfoRow label="이메일 인증" value={user.emailVerified ? '완료 ✓' : '미완료'} highlight={user.emailVerified} />
                <InfoRow label="권한"        value={user.role === 'ADMIN' ? '관리자' : '일반 회원'} />
                <InfoRow
                  label="가입일"
                  value={user.createdAt ? new Date(user.createdAt).toLocaleDateString('ko-KR') : '-'}
                />
              </div>
            </div>

            {/* 안내 메시지 (상태에 따라) */}
            {user.status === 'dormant' && (
              <div className="bg-amber-50 border border-amber-100 rounded-2xl p-4 flex items-start gap-3">
                <span className="material-icons text-amber-400 text-base mt-0.5 shrink-0">info</span>
                <p className="text-xs text-amber-700 leading-relaxed">
                  장기간 미접속으로 휴면 계정 전환됐어요. 로그인하면 즉시 정상 복구돼요.
                </p>
              </div>
            )}
            {user.status === 'banned' && (
              <div className="bg-red-50 border border-red-100 rounded-2xl p-4 flex items-start gap-3">
                <span className="material-icons text-red-400 text-base mt-0.5 shrink-0">error_outline</span>
                <p className="text-xs text-red-700 leading-relaxed">
                  계정 이용이 제한된 상태예요. 문의가 필요하면 고객센터에 연락해주세요.
                </p>
              </div>
            )}

          </div>
        )}
      </main>
    </div>
  );
}

export default MypageStatus;
