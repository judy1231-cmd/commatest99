import { useState, useEffect } from 'react';
import { fetchWithAuth } from '../../api/fetchWithAuth';
import AdminSidebar from '../../components/admin/AdminSidebar';
import AdminHeader from '../../components/admin/AdminHeader';

const AUTH_TYPE_LABELS = {
  photo:  '사진 인증',
  check:  '체크 인증',
  text:   '텍스트 인증',
};

const AUTH_TYPE_STYLES = {
  photo:  'bg-blue-50 text-blue-600 border border-blue-200',
  check:  'bg-emerald-50 text-emerald-600 border border-emerald-200',
  text:   'bg-amber-50 text-amber-600 border border-amber-200',
};

function ChallengeManagement() {
  const [challenges, setChallenges] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadChallenges();
  }, []);

  const loadChallenges = async () => {
    setLoading(true);
    try {
      const data = await fetchWithAuth('/api/challenges/admin');
      if (data.success && data.data) {
        setChallenges(data.data);
      }
    } catch {
      // 무시
    } finally {
      setLoading(false);
    }
  };

  const handleToggleActive = async (id, currentActive) => {
    const action = currentActive ? '비활성화' : '활성화';
    if (!window.confirm(`챌린지를 ${action}할까요?`)) return;
    try {
      await fetchWithAuth(`/api/challenges/admin/${id}/active`, {
        method: 'PUT',
        body: JSON.stringify({ isActive: !currentActive }),
      });
      setChallenges(prev => prev.map(c => c.id === id ? { ...c, isActive: !currentActive } : c));
    } catch {
      // 무시
    }
  };

  const activeCount  = challenges.filter(c => c.isActive).length;
  const totalParticipants = challenges.reduce((s, c) => s + (c.participantCount || 0), 0);

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      <AdminSidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <AdminHeader title="챌린지 관리" subtitle="진행 중인 챌린지를 관리하세요." />
        <main className="flex-1 overflow-y-auto p-6 space-y-5">

          {/* 요약 카드 */}
          <div className="grid grid-cols-4 gap-4">
            {[
              { icon: 'emoji_events', label: '전체 챌린지',  value: challenges.length,  unit: '개', iconCls: 'bg-amber-50 text-amber-600'    },
              { icon: 'play_circle',  label: '활성 챌린지',  value: activeCount,         unit: '개', iconCls: 'bg-emerald-50 text-emerald-600' },
              { icon: 'pause_circle', label: '비활성',       value: challenges.length - activeCount, unit: '개', iconCls: 'bg-gray-100 text-gray-500' },
              { icon: 'group',        label: '총 참여자',    value: totalParticipants,   unit: '명', iconCls: 'bg-blue-50 text-blue-600'      },
            ].map((card, i) => (
              <div key={i} className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 flex items-center gap-4">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${card.iconCls}`}>
                  <span className="material-icons text-[20px]">{card.icon}</span>
                </div>
                <div>
                  <div className="flex items-end gap-1">
                    <span className="text-2xl font-black text-gray-900 leading-none">{card.value.toLocaleString()}</span>
                    <span className="text-sm text-gray-400 mb-0.5">{card.unit}</span>
                  </div>
                  <p className="text-xs text-gray-400 mt-0.5">{card.label}</p>
                </div>
              </div>
            ))}
          </div>

          {/* 챌린지 테이블 */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
              <h2 className="text-sm font-bold text-gray-700">챌린지 목록</h2>
              <span className="text-xs text-gray-400">총 {challenges.length}개</span>
            </div>

            {loading ? (
              <div className="flex justify-center items-center py-16">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary" />
              </div>
            ) : challenges.length === 0 ? (
              <div className="py-16 text-center">
                <span className="material-icons text-4xl text-gray-200 block mb-2">emoji_events</span>
                <p className="text-sm text-gray-400">챌린지가 없습니다</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-200">
                      <th className="px-5 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider w-14">ID</th>
                      <th className="px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">챌린지명</th>
                      <th className="px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider w-24 text-center">인증 방식</th>
                      <th className="px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider w-20 text-center">기간</th>
                      <th className="px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider w-24 text-center">참여자</th>
                      <th className="px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider w-20 text-center">상태</th>
                      <th className="px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right w-24">관리</th>
                    </tr>
                  </thead>
                  <tbody>
                    {challenges.map((challenge, idx) => (
                      <tr
                        key={challenge.id}
                        className={`border-b border-gray-100 hover:bg-primary/5 transition-colors ${
                          idx % 2 === 1 ? 'bg-gray-50/50' : 'bg-white'
                        } ${!challenge.isActive ? 'opacity-60' : ''}`}
                      >
                        <td className="px-5 py-3.5 text-xs font-mono text-gray-400">{challenge.id}</td>
                        <td className="px-5 py-3.5">
                          <p className="text-sm font-semibold text-gray-900">{challenge.title}</p>
                          <p className="text-xs text-gray-400 mt-0.5 line-clamp-1">{challenge.description}</p>
                        </td>
                        <td className="px-5 py-3.5 text-center">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold ${AUTH_TYPE_STYLES[challenge.verificationType] || 'bg-gray-100 text-gray-500'}`}>
                            {AUTH_TYPE_LABELS[challenge.verificationType] || challenge.verificationType}
                          </span>
                        </td>
                        <td className="px-5 py-3.5 text-center text-sm text-gray-600">
                          {challenge.durationDays}일
                        </td>
                        <td className="px-5 py-3.5 text-center">
                          <span className="text-sm font-semibold text-gray-700">
                            {(challenge.participantCount || 0).toLocaleString()}명
                          </span>
                        </td>
                        <td className="px-5 py-3.5 text-center">
                          <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                            challenge.isActive
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : 'bg-gray-100 text-gray-400 border border-gray-200'
                          }`}>
                            <span className={`w-1.5 h-1.5 rounded-full inline-block ${challenge.isActive ? 'bg-emerald-500' : 'bg-gray-400'}`} />
                            {challenge.isActive ? '활성' : '비활성'}
                          </span>
                        </td>
                        <td className="px-5 py-3.5 text-right">
                          <button
                            onClick={() => handleToggleActive(challenge.id, challenge.isActive)}
                            className={`px-3 py-1.5 text-[11px] font-bold rounded-lg border transition-colors ${
                              challenge.isActive
                                ? 'text-gray-500 border-gray-200 hover:bg-gray-50'
                                : 'text-emerald-600 border-emerald-200 hover:bg-emerald-50'
                            }`}
                          >
                            {challenge.isActive ? '비활성화' : '활성화'}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

        </main>
      </div>
    </div>
  );
}

export default ChallengeManagement;
