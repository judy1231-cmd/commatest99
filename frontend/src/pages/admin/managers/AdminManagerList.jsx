import { useState, useEffect } from 'react';
import { fetchWithAuth } from '../../../api/fetchWithAuth';
import AdminSidebar from '../../../components/admin/AdminSidebar';
import AdminHeader from '../../../components/admin/AdminHeader';

const STATUS_BADGE = {
  active:  { label: '활성', cls: 'bg-green-50 text-green-600 border border-green-200' },
  dormant: { label: '휴면', cls: 'bg-gray-100 text-gray-500 border border-gray-200'  },
  banned:  { label: '제한', cls: 'bg-red-50 text-red-500 border border-red-200'      },
};

const ROLE_BADGE = {
  SUPER_ADMIN: { label: '슈퍼관리자', cls: 'bg-violet-50 text-violet-700 border border-violet-200', icon: 'verified_user' },
  ADMIN:       { label: '일반관리자', cls: 'bg-blue-50 text-blue-600 border border-blue-200',       icon: 'manage_accounts' },
};

function AdminManagerList() {
  const [managers, setManagers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const data = await fetchWithAuth('/api/admin/users?size=100');
        if (data.success && data.data) {
          setManagers((data.data.users || []).filter(u => u.role === 'ADMIN'));
        }
      } catch { } finally { setLoading(false); }
    })();
  }, []);

  /* ── UI 전용 상태 ── */
  const [search, setSearch] = useState('');

  const filtered = managers.filter(u => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      (u.email || '').toLowerCase().includes(q) ||
      (u.username || '').toLowerCase().includes(q) ||
      (u.쉼표번호 || '').toLowerCase().includes(q)
    );
  });

  const activeCount = managers.filter(u => u.status === 'active').length;
  const superCount  = managers.filter(u => u.role === 'SUPER_ADMIN').length;
  const adminCount  = managers.filter(u => u.role === 'ADMIN').length;

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      <AdminSidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <AdminHeader title="관리자 계정 관리" subtitle="ADMIN 권한 계정 목록입니다." />
        <main className="flex-1 overflow-y-auto p-6 space-y-5">

          {/* ── 요약 카드 ── */}
          <div className="grid grid-cols-4 gap-4">
            {[
              { icon: 'admin_panel_settings', label: '총 관리자',   value: loading ? '—' : `${managers.length}명`, iconCls: 'bg-gray-100 text-gray-600'      },
              { icon: 'check_circle',         label: '활성 계정',   value: loading ? '—' : `${activeCount}명`,    iconCls: 'bg-emerald-50 text-emerald-600' },
              { icon: 'verified_user',        label: '슈퍼관리자',  value: loading ? '—' : `${superCount}명`,     iconCls: 'bg-violet-50 text-violet-600'   },
              { icon: 'manage_accounts',      label: '일반관리자',  value: loading ? '—' : `${adminCount}명`,     iconCls: 'bg-blue-50 text-blue-600'       },
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

          {/* ── 테이블 카드 ── */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">

            {/* 툴바 */}
            <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between gap-3">
              <div className="relative">
                <span className="material-icons absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-[16px]">search</span>
                <input
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="이름 · 이메일 · 쉼표번호 검색"
                  className="h-9 pl-9 pr-4 w-64 border border-gray-200 rounded-lg text-sm text-gray-700 placeholder:text-gray-400 bg-gray-50 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                />
              </div>
              <button
                type="button"
                disabled
                title="관리자 추가 API 추후 지원 예정"
                className="h-9 px-4 bg-primary/40 text-white text-sm font-bold rounded-lg cursor-not-allowed flex items-center gap-1.5 shrink-0"
              >
                <span className="material-icons text-[16px]">person_add</span>
                관리자 추가
              </button>
            </div>

            {/* 건수 */}
            <div className="px-5 py-2 border-b border-gray-100 bg-gray-50/60">
              <p className="text-xs text-gray-400">
                총 <span className="font-semibold text-gray-600">{filtered.length}</span>명
                {search && <span className="ml-1 text-primary font-medium">· "{search}" 검색 결과</span>}
              </p>
            </div>

            {/* 테이블 */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200">
                    <th className="px-5 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider w-12">#</th>
                    <th className="px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">관리자</th>
                    <th className="px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider w-52">이메일</th>
                    <th className="px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider w-32">권한 레벨</th>
                    <th className="px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider w-36">마지막 로그인</th>
                    <th className="px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider w-20 text-center">상태</th>
                    <th className="px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right w-28">관리</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    [...Array(5)].map((_, i) => (
                      <tr key={i} className={`border-b border-gray-100 ${i % 2 === 1 ? 'bg-gray-50/60' : ''}`}>
                        <td className="px-5 py-4"><div className="w-5 h-3 bg-gray-200 rounded animate-pulse" /></td>
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-gray-200 animate-pulse shrink-0" />
                            <div className="space-y-1.5">
                              <div className="w-20 h-3 bg-gray-200 rounded animate-pulse" />
                              <div className="w-28 h-2.5 bg-gray-100 rounded animate-pulse" />
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-4"><div className="w-36 h-3 bg-gray-200 rounded animate-pulse" /></td>
                        <td className="px-5 py-4"><div className="w-20 h-5 bg-gray-200 rounded-full animate-pulse" /></td>
                        <td className="px-5 py-4"><div className="w-24 h-3 bg-gray-100 rounded animate-pulse" /></td>
                        <td className="px-5 py-4 text-center"><div className="w-12 h-5 bg-gray-200 rounded-full animate-pulse mx-auto" /></td>
                        <td className="px-5 py-4 text-right">
                          <div className="flex justify-end gap-2">
                            <div className="w-10 h-6 bg-gray-200 rounded-lg animate-pulse" />
                            <div className="w-10 h-6 bg-gray-200 rounded-lg animate-pulse" />
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : filtered.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-16 text-center">
                        <div className="flex flex-col items-center gap-2 text-gray-300">
                          <span className="material-icons text-4xl">admin_panel_settings</span>
                          <p className="text-sm text-gray-400">
                            {search ? `"${search}"에 해당하는 관리자가 없습니다` : '관리자 계정이 없습니다'}
                          </p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    filtered.map((u, idx) => {
                      const badge  = STATUS_BADGE[u.status] || { label: u.status || '—', cls: 'bg-gray-100 text-gray-500 border border-gray-200' };
                      const role   = ROLE_BADGE[u.role] || ROLE_BADGE.ADMIN;
                      const initials = (u.username || u.email || '?')[0].toUpperCase();
                      const joinDate = u.createdAt ? new Date(u.createdAt).toLocaleDateString('ko-KR') : '—';

                      return (
                        <tr
                          key={u.쉼표번호}
                          className={`border-b border-gray-100 hover:bg-primary/5 transition-colors cursor-default ${idx % 2 === 1 ? 'bg-gray-50/50' : 'bg-white'}`}
                        >
                          {/* 번호 */}
                          <td className="px-5 py-3.5 text-xs text-gray-400 tabular-nums">{idx + 1}</td>

                          {/* 관리자 (아바타 + 이름 + 쉼표번호) */}
                          <td className="px-5 py-3.5">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-violet-100 text-violet-700 text-xs font-bold flex items-center justify-center shrink-0">
                                {initials}
                              </div>
                              <div className="min-w-0">
                                <p className="text-sm font-semibold text-gray-900 truncate">{u.username || '—'}</p>
                                <p className="text-[11px] text-gray-400 font-mono mt-0.5">{u.쉼표번호}</p>
                              </div>
                            </div>
                          </td>

                          {/* 이메일 */}
                          <td className="px-5 py-3.5">
                            <span className="text-sm text-gray-700">{u.email}</span>
                          </td>

                          {/* 권한 배지 */}
                          <td className="px-5 py-3.5">
                            <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold ${role.cls}`}>
                              <span className="material-icons text-[12px]">{role.icon}</span>
                              {role.label}
                            </span>
                          </td>

                          {/* 마지막 로그인 */}
                          <td className="px-5 py-3.5">
                            <div>
                              <p className="text-xs text-gray-400 italic">마지막 로그인 미지원</p>
                              <p className="text-[11px] text-gray-300 mt-0.5">가입일 {joinDate}</p>
                            </div>
                          </td>

                          {/* 상태 */}
                          <td className="px-5 py-3.5 text-center">
                            <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold ${badge.cls}`}>
                              <span className={`w-1.5 h-1.5 rounded-full inline-block ${
                                u.status === 'active' ? 'bg-green-500' : u.status === 'banned' ? 'bg-red-400' : 'bg-gray-300'
                              }`} />
                              {badge.label}
                            </span>
                          </td>

                          {/* 관리 버튼 */}
                          <td className="px-5 py-3.5 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                disabled
                                title="관리자 수정 API 추후 지원 예정"
                                className="px-2.5 py-1 text-[11px] font-bold text-blue-400 border border-blue-200 rounded-lg cursor-not-allowed opacity-60"
                              >
                                수정
                              </button>
                              <button
                                disabled
                                title="관리자 삭제 API 추후 지원 예정"
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

            {!loading && (
              <div className="px-5 py-3 border-t border-gray-100">
                <p className="text-xs text-gray-400">* 마지막 로그인·관리자 추가·수정·삭제는 API 연동 후 지원됩니다.</p>
              </div>
            )}
          </div>

        </main>
      </div>
    </div>
  );
}

export default AdminManagerList;
