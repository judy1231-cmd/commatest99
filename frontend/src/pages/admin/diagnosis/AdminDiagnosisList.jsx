import { useState, useEffect } from 'react';
import AdminSidebar from '../../../components/admin/AdminSidebar';
import AdminHeader from '../../../components/admin/AdminHeader';

const INFO_CARDS = [
  { icon: 'quiz', label: '총 설문 문항', value: '12문항', color: 'bg-blue-50 text-blue-600' },
  { icon: 'category', label: '휴식 유형 분류', value: '7가지', color: 'bg-emerald-50 text-emerald-600' },
  { icon: 'psychology', label: '스트레스 지수', value: '0~100점', color: 'bg-amber-50 text-amber-600' },
];

function AdminDiagnosisList() {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);

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

  return (
    <div className="flex h-screen overflow-hidden bg-background-light">
      <AdminSidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <AdminHeader title="진단 결과 관리" subtitle="사용자 설문 진단 결과 현황입니다." />
        <main className="flex-1 overflow-y-auto p-6 space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {INFO_CARDS.map((card, i) => (
              <div key={i} className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
                <div className={`w-10 h-10 rounded-lg ${card.color} flex items-center justify-center mb-3`}>
                  <span className="material-icons">{card.icon}</span>
                </div>
                <p className="text-sm text-gray-500">{card.label}</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{card.value}</p>
              </div>
            ))}
          </div>

          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
            <h3 className="font-bold text-gray-800 mb-4">설문 문항 목록</h3>
            {loading ? (
              <div className="flex justify-center items-center h-20">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary" />
              </div>
            ) : questions.length === 0 ? (
              <p className="text-gray-400 text-sm text-center py-8">설문 문항이 없습니다</p>
            ) : (
              <div className="space-y-2">
                {questions.map((q, i) => (
                  <div key={q.id} className="flex items-start gap-3 p-3 rounded-xl hover:bg-gray-50 border border-gray-50">
                    <span className="w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">{i + 1}</span>
                    <div className="flex-1">
                      <p className="text-sm text-gray-800">{q.content || q.questionContent}</p>
                      <p className="text-xs text-gray-400 mt-0.5">{q.category} · {q.active !== false ? '활성' : '비활성'}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
            <p className="text-xs text-gray-400 mt-4">* 개별 진단 결과 조회 API는 추후 지원 예정입니다.</p>
          </div>
        </main>
      </div>
    </div>
  );
}

export default AdminDiagnosisList;
