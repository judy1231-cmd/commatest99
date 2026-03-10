import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminSidebar from '../../../components/admin/AdminSidebar';
import AdminHeader from '../../../components/admin/AdminHeader';

function AdminDiagnosisNew() {
  const navigate = useNavigate();
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
        <AdminHeader title="설문 문항 관리" subtitle="설문 질문 및 선택지를 관리합니다." />
        <main className="flex-1 overflow-y-auto p-6 space-y-4">
          <button onClick={() => navigate(-1)} className="flex items-center gap-1 text-sm text-gray-500 hover:text-primary">
            <span className="material-icons text-base">arrow_back</span> 돌아가기
          </button>

          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-center gap-2">
            <span className="material-icons text-amber-500 text-base">construction</span>
            <p className="text-sm text-amber-700">문항 수정 기능은 추후 지원 예정입니다. 현재는 조회만 가능합니다.</p>
          </div>

          {loading ? (
            <div className="flex justify-center items-center h-40">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
            </div>
          ) : (
            <div className="space-y-4">
              {questions.map((q, i) => (
                <div key={q.id} className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="w-7 h-7 rounded-full bg-primary/10 text-primary text-sm font-bold flex items-center justify-center">{i + 1}</span>
                    <span className="text-xs font-medium text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">{q.category}</span>
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${q.active !== false ? 'bg-green-50 text-green-600' : 'bg-gray-100 text-gray-400'}`}>
                      {q.active !== false ? '활성' : '비활성'}
                    </span>
                  </div>
                  <p className="text-sm text-gray-800 font-medium mb-3">{q.content || q.questionContent}</p>
                  {q.choices && (
                    <div className="grid grid-cols-2 gap-2">
                      {q.choices.map((c, ci) => (
                        <div key={ci} className="text-xs text-gray-500 bg-gray-50 rounded-lg px-3 py-2 flex justify-between">
                          <span>{c.content || c.choiceContent}</span>
                          <span className="font-bold text-primary">{c.score}점</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

export default AdminDiagnosisNew;
