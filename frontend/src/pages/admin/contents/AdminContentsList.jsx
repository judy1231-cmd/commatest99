import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminSidebar from '../../../components/admin/AdminSidebar';
import AdminHeader from '../../../components/admin/AdminHeader';
import { fetchWithAuth } from '../../../api/fetchWithAuth';

const REST_TYPE_LABELS = {
  physical: '신체적 이완', mental: '정신적 고요', sensory: '감각의 정화',
  emotional: '정서적 지지', social: '사회적 휴식', nature: '자연의 연결', creative: '창조적 몰입',
};

function AdminContentsList() {
  const navigate = useNavigate();
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const data = await fetchWithAuth('/api/admin/activities');
        if (data.success && data.data) setActivities(data.data);
      } catch { } finally { setLoading(false); }
    })();
  }, []);

  const filtered = filter === 'all' ? activities : activities.filter(a => a.restType === filter || a.restTypeName === filter);

  return (
    <div className="flex h-screen overflow-hidden bg-background-light">
      <AdminSidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <AdminHeader title="콘텐츠 관리" subtitle="휴식 활동 콘텐츠 목록입니다." />
        <main className="flex-1 overflow-y-auto p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex gap-2 flex-wrap">
              <button onClick={() => setFilter('all')} className={`px-3 py-1.5 rounded-lg text-xs font-medium ${filter === 'all' ? 'bg-primary text-white' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'}`}>전체</button>
              {Object.entries(REST_TYPE_LABELS).map(([key, label]) => (
                <button key={key} onClick={() => setFilter(key)} className={`px-3 py-1.5 rounded-lg text-xs font-medium ${filter === key ? 'bg-primary text-white' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'}`}>{label}</button>
              ))}
            </div>
            <button onClick={() => navigate('/admin/contents/new')} className="flex items-center gap-1 bg-primary text-white text-sm px-4 py-2 rounded-xl font-bold hover:bg-primary/90">
              <span className="material-icons text-base">add</span> 새 콘텐츠
            </button>
          </div>

          {loading ? (
            <div className="flex justify-center items-center h-40">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-12 text-center">
              <span className="material-icons text-4xl text-gray-300 mb-3 block">library_books</span>
              <p className="text-gray-400 text-sm">콘텐츠가 없습니다</p>
              <p className="text-gray-300 text-xs mt-1">rest_activities 테이블에 데이터를 추가해주세요</p>
            </div>
          ) : (
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100">
                    <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500">활동명</th>
                    <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500">유형</th>
                    <th className="text-right px-5 py-3 text-xs font-semibold text-gray-500">소요시간</th>
                    <th className="text-center px-5 py-3 text-xs font-semibold text-gray-500">관리</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((a, i) => (
                    <tr key={a.id || i} className="border-b border-gray-50 hover:bg-gray-50">
                      <td className="px-5 py-3">
                        <p className="font-medium text-gray-800">{a.activityName || a.name}</p>
                        <p className="text-xs text-gray-400 mt-0.5 line-clamp-1">{a.guideContent || a.description || ''}</p>
                      </td>
                      <td className="px-5 py-3">
                        <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full font-medium">
                          {REST_TYPE_LABELS[a.restType] || a.restTypeName || a.restType || '-'}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-right text-gray-600">{a.durationMinutes || a.duration || '-'}분</td>
                      <td className="px-5 py-3 text-center">
                        <button onClick={() => navigate(`/admin/contents/${a.id}/edit`)} className="text-xs text-blue-500 hover:text-blue-700 font-medium">수정</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="px-5 py-3 text-xs text-gray-400 border-t border-gray-50">총 {filtered.length}개 활동</div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

export default AdminContentsList;
