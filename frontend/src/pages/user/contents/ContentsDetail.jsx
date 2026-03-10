import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import UserNavbar from '../../../components/user/UserNavbar';

const CATEGORY_INFO = {
  physical:  { name: '신체적 이완', icon: 'fitness_center', color: '#EF4444' },
  mental:    { name: '정신적 고요', icon: 'spa',            color: '#10B981' },
  sensory:   { name: '감각의 정화', icon: 'visibility_off', color: '#F59E0B' },
  emotional: { name: '정서적 지지', icon: 'favorite',       color: '#EC4899' },
  social:    { name: '사회적 휴식', icon: 'groups',         color: '#8B5CF6' },
  nature:    { name: '자연과의 연결', icon: 'forest',       color: '#059669' },
  creative:  { name: '창조적 몰입', icon: 'brush',          color: '#F97316' },
};

// 추천 관련 콘텐츠 — 같은 카테고리 기반 예시
const RELATED_CONTENTS = {
  physical:  [
    { id: 'p1', title: '5분 전신 스트레칭', duration: '5분', icon: 'self_improvement' },
    { id: 'p2', title: '점심 산책 루틴', duration: '15분', icon: 'directions_walk' },
    { id: 'p3', title: '폼롤러 근막이완', duration: '10분', icon: 'sports_gymnastics' },
  ],
  mental:    [
    { id: 'm1', title: '마음챙김 명상 입문', duration: '5분', icon: 'self_improvement' },
    { id: 'm2', title: '복식호흡 가이드', duration: '3분', icon: 'air' },
    { id: 'm3', title: '저널링으로 생각 비우기', duration: '10분', icon: 'edit_note' },
  ],
  sensory:   [
    { id: 's1', title: '디지털 디톡스 방법', duration: '30분', icon: 'phonelink_off' },
    { id: 's2', title: '눈 피로 회복 루틴', duration: '5분', icon: 'visibility' },
    { id: 's3', title: '아로마테라피 입문', duration: '20분', icon: 'spa' },
  ],
  emotional: [
    { id: 'e1', title: '감정 일기 쓰는 법', duration: '10분', icon: 'edit_note' },
    { id: 'e2', title: '플레이리스트로 감정 회복', duration: '15분', icon: 'headphones' },
    { id: 'e3', title: '자기 위로 루틴', duration: '자유', icon: 'favorite' },
  ],
  social:    [
    { id: 'so1', title: '혼자 카페에서 쉬기', duration: '1시간', icon: 'local_cafe' },
    { id: 'so2', title: '친구에게 연락하는 법', duration: '자유', icon: 'forum' },
    { id: 'so3', title: '소모임 찾는 법', duration: '자유', icon: 'group_add' },
  ],
  nature:    [
    { id: 'n1', title: '도심 속 공원 산책', duration: '20분', icon: 'park' },
    { id: 'n2', title: '베란다 햇볕 쬐기', duration: '10분', icon: 'wb_sunny' },
    { id: 'n3', title: '식물 돌보기 입문', duration: '10분', icon: 'eco' },
  ],
  creative:  [
    { id: 'c1', title: '낙서로 스트레스 해소', duration: '자유', icon: 'draw' },
    { id: 'c2', title: '5분 짧은 글쓰기', duration: '5분', icon: 'edit' },
    { id: 'c3', title: '간단한 요리 도전', duration: '30분', icon: 'restaurant' },
  ],
};

function ContentsDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isLoggedIn = !!localStorage.getItem('accessToken');
  const [content, setContent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const handleRecordClick = () => {
    if (!isLoggedIn) { navigate('/login'); return; }
    navigate('/records/rest');
  };

  useEffect(() => {
    loadContent();
  }, [id]);

  const loadContent = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/contents/${id}`);
      const data = await res.json();
      if (data.success && data.data) {
        setContent(data.data);
      } else {
        setError('콘텐츠를 찾을 수 없어요.');
      }
    } catch {
      setError('콘텐츠를 불러오지 못했어요.');
    } finally {
      setLoading(false);
    }
  };

  // ── 로딩 ──
  if (loading) {
    return (
      <div className="min-h-screen bg-[#F9F7F2]">
        <UserNavbar />
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
        </div>
      </div>
    );
  }

  // ── 에러 ──
  if (error || !content) {
    return (
      <div className="min-h-screen bg-[#F9F7F2]">
        <UserNavbar />
        <main className="max-w-2xl mx-auto px-4 pt-12 text-center">
          <span className="material-icons text-5xl text-slate-300 mb-4 block">article</span>
          <p className="text-slate-500 mb-6">{error || '콘텐츠를 찾을 수 없어요.'}</p>
          <button
            onClick={() => navigate('/contents')}
            className="px-6 py-3 bg-primary text-white font-bold rounded-xl hover:bg-primary/90 transition-all"
          >
            콘텐츠 목록으로
          </button>
        </main>
      </div>
    );
  }

  const category = CATEGORY_INFO[content.category] || CATEGORY_INFO.mental;
  const related = RELATED_CONTENTS[content.category] || RELATED_CONTENTS.mental;
  const tags = content.tags || [];

  return (
    <div className="min-h-screen bg-[#F9F7F2]">
      <UserNavbar />

      <main className="max-w-2xl mx-auto px-4 pt-6 pb-24">

        {/* 뒤로가기 */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-1 text-sm text-slate-500 hover:text-primary transition-colors mb-6"
        >
          <span className="material-icons text-base">arrow_back</span>
          콘텐츠 목록으로
        </button>

        {/* 헤더 카드 */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-4">
          {/* 카테고리 뱃지 */}
          <div
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold mb-4"
            style={{ backgroundColor: `${category.color}15`, color: category.color }}
          >
            <span className="material-icons" style={{ fontSize: '14px' }}>{category.icon}</span>
            {category.name}
          </div>

          <h1 className="text-xl font-bold text-slate-800 mb-2">{content.title}</h1>

          {/* 메타 정보 */}
          <div className="flex items-center gap-4 text-xs text-slate-400 mb-4">
            {content.duration && (
              <span className="flex items-center gap-1">
                <span className="material-icons text-base">timer</span>
                {content.duration}
              </span>
            )}
            {content.difficulty && (
              <span className="flex items-center gap-1">
                <span className="material-icons text-base">bar_chart</span>
                {content.difficulty}
              </span>
            )}
            {content.createdAt && (
              <span>{new Date(content.createdAt).toLocaleDateString('ko-KR')}</span>
            )}
          </div>

          {/* 태그 */}
          {tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {tags.map((tag, i) => (
                <span
                  key={i}
                  className="px-2.5 py-1 bg-slate-100 text-slate-600 text-xs rounded-full font-medium"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* 본문 내용 */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-4">
          {content.summary && (
            <div
              className="rounded-xl p-4 mb-5 text-sm font-medium leading-relaxed"
              style={{ backgroundColor: `${category.color}10`, color: category.color }}
            >
              {content.summary}
            </div>
          )}

          <div className="prose prose-slate max-w-none text-sm text-slate-700 leading-relaxed whitespace-pre-line">
            {content.body || content.guideContent || '본문 내용이 없습니다.'}
          </div>
        </div>

        {/* 추천 관련 콘텐츠 */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
          <h2 className="font-bold text-slate-800 mb-4">관련 콘텐츠</h2>
          <div className="space-y-3">
            {related.map((item) => (
              <Link
                key={item.id}
                to={`/contents/${item.id}`}
                className="flex items-center gap-4 p-4 rounded-xl border border-slate-100 hover:border-primary/30 hover:bg-primary/5 transition-all"
              >
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                  style={{ backgroundColor: `${category.color}15` }}
                >
                  <span className="material-icons text-xl" style={{ color: category.color }}>
                    {item.icon}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-slate-800 text-sm">{item.title}</p>
                  <p className="text-xs text-slate-400 mt-0.5">{category.name} · {item.duration}</p>
                </div>
                <span className="material-icons text-slate-300 shrink-0">chevron_right</span>
              </Link>
            ))}
          </div>
        </div>

        {/* 하단 버튼 */}
        <div className="flex gap-3">
          <button
            onClick={() => navigate(-1)}
            className="py-3.5 px-6 border-2 border-slate-200 text-slate-600 font-bold rounded-xl hover:bg-slate-50 transition-all"
          >
            뒤로가기
          </button>
          <button
            onClick={handleRecordClick}
            className="flex-1 py-3.5 bg-primary text-white font-bold rounded-xl hover:bg-primary/90 transition-all flex items-center justify-center gap-2"
          >
            <span className="material-icons text-base">edit_note</span>
            휴식 기록하기
            {!isLoggedIn && <span className="material-icons text-sm opacity-70">lock</span>}
          </button>
        </div>
      </main>
    </div>
  );
}

export default ContentsDetail;
