import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchWithAuth } from '../../api/fetchWithAuth';
import UserNavbar from '../../components/user/UserNavbar';

const CATEGORIES = [
  { key: '신체적 휴식', label: '신체의 이완', icon: 'fitness_center', color: '#4CAF82', bg: '#F0FAF5' },
  { key: '정신적 휴식', label: '정신적 고요', icon: 'spa',            color: '#5B8DEF', bg: '#EFF6FF' },
  { key: '감각적 휴식', label: '감각의 정화', icon: 'visibility_off', color: '#9B6DFF', bg: '#F5F3FF' },
  { key: '정서적 휴식', label: '정서적 지지', icon: 'favorite',       color: '#FF7BAC', bg: '#FFF0F6' },
  { key: '사회적 휴식', label: '사회적 휴식', icon: 'groups',         color: '#FF9A3C', bg: '#FFF7ED' },
  { key: '창조적 휴식', label: '창조적 몰입', icon: 'brush',          color: '#FFB830', bg: '#FFFBEB' },
  { key: '자연적 휴식', label: '자연의 연결', icon: 'forest',         color: '#2ECC9A', bg: '#F0FBF7' },
];

// 카테고리별 키워드 (많을수록 정확도 높아짐)
const CATEGORY_KEYWORDS = {
  '신체적 휴식': ['운동', '스트레칭', '요가', '달리기', '걷기', '수영', '헬스', '피트니스', '몸', '근육', '스포츠', '조깅', '자전거', '등산', '땀', '체력', '필라테스', '마사지', '몸풀기'],
  '정신적 휴식': ['명상', '독서', '책', '집중', '고요', '조용', '마음', '생각', '뇌', '공부', '사색', '힐링', '마인드', '심리', '정신', '집중력', '뇌피셜', '묵상', '호흡'],
  '감각적 휴식': ['음악', '향기', '아로마', '목욕', '온천', '사우나', '감각', '촉감', '소리', '맛', '향', '냄새', '따뜻', '포근', '욕조', '족욕', '노래', '플레이리스트'],
  '정서적 휴식': ['감정', '울음', '치유', '위로', '슬픔', '기쁨', '행복', '감사', '눈물', '혼자', '일기', '감정', '마음챙김', '정서', '공감', '감동', '따뜻함'],
  '사회적 휴식': ['친구', '가족', '대화', '모임', '파티', '함께', '소통', '만남', '수다', '술자리', '카페', '밥', '동료', '연인', '데이트', '놀이', '같이', '우리'],
  '창조적 휴식': ['그림', '글쓰기', '음악', '악기', '공방', '만들기', '창작', '예술', '디자인', '사진', '영상', '코딩', '작업', '드로잉', '스케치', '핸드메이드', '레고', '뜨개질'],
  '자연적 휴식': ['자연', '산', '바다', '공원', '숲', '하늘', '꽃', '나무', '캠핑', '등산', '강', '호수', '바람', '해변', '들판', '식물', '정원', '산책', '일출', '일몰'],
};

function detectCategory(text) {
  if (!text || text.trim().length < 5) return null;
  const scores = {};
  for (const [cat, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
    scores[cat] = keywords.filter(kw => text.includes(kw)).length;
  }
  const best = Object.entries(scores).sort((a, b) => b[1] - a[1])[0];
  return best[1] >= 1 ? best[0] : null;
}

const MAX_IMAGES = 5;
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];

function CommunityWrite() {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('');
  const [anonymous, setAnonymous] = useState(false);
  const [images, setImages] = useState([]); // { file, preview }
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [suggestedCategory, setSuggestedCategory] = useState(null);

  // 제목+내용 변경 시 카테고리 자동 감지 (1초 디바운스)
  useEffect(() => {
    const timer = setTimeout(() => {
      if (category) return; // 이미 수동 선택된 경우 추천 안 함
      const detected = detectCategory(title + ' ' + content);
      setSuggestedCategory(detected);
    }, 1000);
    return () => clearTimeout(timer);
  }, [title, content, category]);

  const handleImageSelect = (e) => {
    const files = Array.from(e.target.files || []);
    addImages(files);
    e.target.value = '';
  };

  const addImages = (files) => {
    const remaining = MAX_IMAGES - images.length;
    if (remaining <= 0) {
      setError(`사진은 최대 ${MAX_IMAGES}개까지 첨부할 수 있어요.`);
      return;
    }

    const toAdd = [];
    for (const file of files.slice(0, remaining)) {
      if (!ALLOWED_TYPES.includes(file.type)) {
        setError('JPG, PNG, GIF, WEBP 형식만 첨부할 수 있어요.');
        return;
      }
      if (file.size > MAX_FILE_SIZE) {
        setError('사진 한 개당 최대 5MB까지 첨부할 수 있어요.');
        return;
      }
      toAdd.push({ file, preview: URL.createObjectURL(file) });
    }

    setImages(prev => [...prev, ...toAdd]);
    setError('');
  };

  const removeImage = (idx) => {
    setImages(prev => {
      URL.revokeObjectURL(prev[idx].preview);
      return prev.filter((_, i) => i !== idx);
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) { setError('제목을 입력해주세요.'); return; }
    if (!content.trim()) { setError('내용을 입력해주세요.'); return; }

    setError('');
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('data', JSON.stringify({ title: title.trim(), content: content.trim(), category, anonymous }));
      images.forEach(({ file }) => formData.append('images', file));

      const token = localStorage.getItem('accessToken');
      const res = await fetch('/api/posts', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      const data = await res.json();

      if (!data.success) { setError(data.message || '게시글 작성에 실패했어요.'); return; }
      navigate('/community');
    } catch {
      setError('서버에 연결할 수 없어요. 잠시 후 다시 시도해주세요.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F7F7F8]">
      <UserNavbar />

      <main className="max-w-2xl mx-auto px-4 pt-5 pb-24">
        {/* 헤더 */}
        <div className="flex items-center gap-3 mb-6">
          <button
            onClick={() => navigate('/community')}
            className="w-9 h-9 rounded-full bg-white border border-slate-200 flex items-center justify-center hover:bg-slate-50 transition-colors"
          >
            <span className="material-icons text-slate-500 text-base">arrow_back</span>
          </button>
          <h1 className="text-[20px] font-extrabold text-slate-800">글쓰기</h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* 에러 */}
          {error && (
            <div className="flex items-center gap-2 px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600">
              <span className="material-icons text-base">error_outline</span>
              {error}
            </div>
          )}

          {/* 카테고리 + 제목 */}
          <div className="bg-white rounded-2xl border border-slate-100 p-4 space-y-4">
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">카테고리</p>

              {/* AI 추천 배너 */}
              {suggestedCategory && !category && (() => {
                const cat = CATEGORIES.find(c => c.key === suggestedCategory);
                if (!cat) return null;
                return (
                  <div
                    className="flex items-center gap-2 px-3 py-2 rounded-xl mb-3 cursor-pointer hover:opacity-90 transition-opacity"
                    style={{ backgroundColor: cat.bg, border: `1.5px solid ${cat.color}40` }}
                    onClick={() => { setCategory(cat.key); setSuggestedCategory(null); }}
                  >
                    <span className="material-icons text-sm" style={{ color: cat.color }}>auto_awesome</span>
                    <span className="text-xs font-bold" style={{ color: cat.color }}>
                      '{cat.label}' 카테고리는 어때요?
                    </span>
                    <span className="ml-auto text-[10px] font-bold" style={{ color: cat.color }}>탭해서 선택</span>
                  </div>
                );
              })()}

              <div className="flex flex-wrap gap-2">
                {CATEGORIES.map(cat => {
                  const isActive = category === cat.key;
                  return (
                    <button
                      key={cat.key}
                      type="button"
                      onClick={() => { setCategory(prev => prev === cat.key ? '' : cat.key); setSuggestedCategory(null); }}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all"
                      style={isActive
                        ? { backgroundColor: cat.color, color: '#fff', boxShadow: `0 2px 8px ${cat.color}55` }
                        : { backgroundColor: cat.bg, color: cat.color, border: `1.5px solid ${cat.color}30` }
                      }
                    >
                      <span className="material-icons" style={{ fontSize: '13px' }}>{cat.icon}</span>
                      {cat.label}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="border-t border-slate-50 pt-4">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">제목</p>
              <input
                type="text"
                value={title}
                onChange={e => setTitle(e.target.value)}
                maxLength={100}
                placeholder="제목을 입력해주세요"
                className="w-full text-[15px] font-semibold text-slate-800 placeholder:text-slate-300 outline-none"
              />
              <p className="text-right text-[11px] text-slate-300 mt-1">{title.length}/100</p>
            </div>
          </div>

          {/* 내용 */}
          <div className="bg-white rounded-2xl border border-slate-100 p-4">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">내용</p>
            <textarea
              value={content}
              onChange={e => setContent(e.target.value)}
              maxLength={2000}
              rows={8}
              placeholder="휴식 경험을 자유롭게 공유해주세요"
              className="w-full text-sm text-slate-700 placeholder:text-slate-300 outline-none resize-none leading-relaxed"
            />
            <p className="text-right text-[11px] text-slate-300">{content.length}/2000</p>
          </div>

          {/* 사진 첨부 */}
          <div className="bg-white rounded-2xl border border-slate-100 p-4">
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                사진 첨부 <span className="text-primary">{images.length}/{MAX_IMAGES}</span>
              </p>
              {images.length < MAX_IMAGES && (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="flex items-center gap-1 text-xs font-bold text-primary hover:text-primary/80 transition-colors"
                >
                  <span className="material-icons text-base">add_photo_alternate</span>
                  사진 추가
                </button>
              )}
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/gif,image/webp"
              multiple
              onChange={handleImageSelect}
              className="hidden"
            />

            {images.length === 0 ? (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="w-full h-28 border-2 border-dashed border-slate-200 rounded-xl flex flex-col items-center justify-center gap-2 text-slate-300 hover:border-primary hover:text-primary transition-colors"
              >
                <span className="material-icons text-3xl">add_photo_alternate</span>
                <span className="text-xs font-semibold">사진을 추가해주세요 (최대 {MAX_IMAGES}개, 각 5MB 이하)</span>
              </button>
            ) : (
              <div className="flex gap-2 flex-wrap">
                {images.map((img, idx) => (
                  <div key={idx} className="relative w-20 h-20 rounded-xl overflow-hidden border border-slate-200 shrink-0">
                    <img
                      src={img.preview}
                      alt={`첨부 이미지 ${idx + 1}`}
                      className="w-full h-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(idx)}
                      className="absolute top-0.5 right-0.5 w-5 h-5 bg-black/60 text-white rounded-full flex items-center justify-center hover:bg-black/80 transition-colors"
                    >
                      <span className="material-icons text-[12px]">close</span>
                    </button>
                    {idx === 0 && (
                      <span className="absolute bottom-0 left-0 right-0 bg-primary/80 text-white text-[9px] font-bold text-center py-0.5">
                        대표
                      </span>
                    )}
                  </div>
                ))}
                {images.length < MAX_IMAGES && (
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="w-20 h-20 border-2 border-dashed border-slate-200 rounded-xl flex flex-col items-center justify-center text-slate-300 hover:border-primary hover:text-primary transition-colors shrink-0"
                  >
                    <span className="material-icons text-xl">add</span>
                  </button>
                )}
              </div>
            )}
          </div>

          {/* 익명 토글 */}
          <div className="bg-white rounded-2xl border border-slate-100 px-4 py-3.5 flex items-center justify-between">
            <div>
              <p className="text-sm font-bold text-slate-700">익명으로 작성</p>
              <p className="text-xs text-slate-400 mt-0.5">닉네임 대신 '익명'으로 표시돼요</p>
            </div>
            <button
              type="button"
              onClick={() => setAnonymous(prev => !prev)}
              className={`w-11 h-6 rounded-full transition-all relative ${anonymous ? 'bg-primary' : 'bg-slate-200'}`}
            >
              <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-all ${anonymous ? 'left-5' : 'left-0.5'}`} />
            </button>
          </div>

          {/* 제출 버튼 */}
          <button
            type="submit"
            disabled={loading || !title.trim() || !content.trim()}
            className="w-full py-4 bg-primary text-white font-bold rounded-2xl shadow-lg shadow-emerald-100 hover:bg-primary/90 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed text-sm"
          >
            {loading ? '게시 중...' : '게시하기'}
          </button>
        </form>
      </main>
    </div>
  );
}

export default CommunityWrite;
