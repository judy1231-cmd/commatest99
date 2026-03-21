import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { fetchWithAuth } from '../../api/fetchWithAuth';
import UserNavbar from '../../components/user/UserNavbar';

const CATEGORY_COLOR = {
  '신체적 휴식': '#4CAF82',
  '정신적 휴식': '#5B8DEF',
  '감각적 휴식': '#9B6DFF',
  '정서적 휴식': '#FF7BAC',
  '사회적 휴식': '#FF9A3C',
  '자연적 휴식': '#2ECC9A',
  '창조적 휴식': '#FFB830',
};

function timeAgo(dateStr) {
  if (!dateStr) return '';
  const diff = Math.floor((Date.now() - new Date(dateStr)) / 1000);
  if (diff < 60)         return '방금 전';
  if (diff < 3600)       return `${Math.floor(diff / 60)}분 전`;
  if (diff < 86400)      return `${Math.floor(diff / 3600)}시간 전`;
  if (diff < 86400 * 30) return `${Math.floor(diff / 86400)}일 전`;
  return new Date(dateStr).toLocaleDateString('ko-KR');
}

function CommunityDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isLoggedIn = !!localStorage.getItem('accessToken');
  const myCommaNo = JSON.parse(localStorage.getItem('user') || '{}').commaNo;

  const [post, setPost] = useState(null);
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [activePhotoIdx, setActivePhotoIdx] = useState(0);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    loadPost();
  }, [id]);

  const loadPost = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('accessToken');
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      const [postRes, photoRes] = await Promise.all([
        fetch(`/api/posts/${id}`, { headers }).then(r => r.json()),
        fetch(`/api/posts/${id}/photos`, { headers }).then(r => r.json()),
      ]);
      if (postRes.success) {
        setPost(postRes.data);
        setLiked(postRes.data.likedByMe);
        setLikeCount(postRes.data.likeCount ?? 0);
      }
      if (photoRes.success) {
        setPhotos(photoRes.data || []);
      }
    } catch {
      // 무시
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async () => {
    if (!isLoggedIn) { navigate('/login'); return; }
    try {
      const token = localStorage.getItem('accessToken');
      const res = await fetch(`/api/posts/${id}/like`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        setLiked(data.data.liked);
        setLikeCount(prev => data.data.liked ? prev + 1 : prev - 1);
      }
    } catch {
      // 무시
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('게시글을 삭제할까요?')) return;
    setDeleting(true);
    try {
      const data = await fetchWithAuth(`/api/posts/${id}`, { method: 'DELETE' });
      if (data.success) navigate('/community');
    } catch {
      // 무시
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F7F7F8]">
        <UserNavbar />
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
        </div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen bg-[#F7F7F8]">
        <UserNavbar />
        <div className="max-w-2xl mx-auto px-4 pt-16 text-center">
          <span className="material-icons text-5xl text-slate-200 block mb-3">forum</span>
          <p className="font-semibold text-slate-500">게시글을 찾을 수 없어요</p>
          <button onClick={() => navigate('/community')} className="mt-4 text-sm text-primary hover:underline">
            목록으로 돌아가기
          </button>
        </div>
      </div>
    );
  }

  const catColor = CATEGORY_COLOR[post.category] || '#10b981';
  const avatarLetter = (post.nickname || '?')[0];
  const isOwner = myCommaNo && post.쉼표번호 === myCommaNo;

  return (
    <div className="min-h-screen bg-[#F7F7F8]">
      <UserNavbar />

      <main className="max-w-2xl mx-auto px-4 pt-5 pb-24">
        {/* 뒤로가기 */}
        <button
          onClick={() => navigate('/community')}
          className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700 mb-5 transition-colors"
        >
          <span className="material-icons text-base">arrow_back</span>
          목록으로
        </button>

        {/* 본문 카드 */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden mb-4">

          {/* 사진 슬라이더 */}
          {photos.length > 0 && (
            <div className="relative bg-slate-50">
              <img
                src={photos[activePhotoIdx]?.photoUrl}
                alt={`게시글 이미지 ${activePhotoIdx + 1}`}
                className="w-full max-h-80 object-cover"
              />
              {photos.length > 1 && (
                <>
                  <button
                    onClick={() => setActivePhotoIdx(i => Math.max(0, i - 1))}
                    disabled={activePhotoIdx === 0}
                    className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-black/40 text-white rounded-full flex items-center justify-center hover:bg-black/60 disabled:opacity-20 transition-colors"
                  >
                    <span className="material-icons text-base">chevron_left</span>
                  </button>
                  <button
                    onClick={() => setActivePhotoIdx(i => Math.min(photos.length - 1, i + 1))}
                    disabled={activePhotoIdx === photos.length - 1}
                    className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-black/40 text-white rounded-full flex items-center justify-center hover:bg-black/60 disabled:opacity-20 transition-colors"
                  >
                    <span className="material-icons text-base">chevron_right</span>
                  </button>
                  <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
                    {photos.map((_, i) => (
                      <button
                        key={i}
                        onClick={() => setActivePhotoIdx(i)}
                        className={`w-1.5 h-1.5 rounded-full transition-all ${i === activePhotoIdx ? 'bg-white w-3' : 'bg-white/50'}`}
                      />
                    ))}
                  </div>
                </>
              )}
            </div>
          )}

          <div className="p-5">
            {/* 작성자 정보 */}
            <div className="flex items-center gap-3 mb-4">
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold shrink-0"
                style={{ background: 'linear-gradient(135deg, #10b981 0%, #0d9488 100%)' }}
              >
                {post.anonymous ? (
                  <span className="material-icons text-base">person_off</span>
                ) : avatarLetter}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-slate-800">
                    {post.anonymous ? '익명' : post.nickname}
                  </span>
                  {post.category && (
                    <span
                      className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                      style={{ backgroundColor: `${catColor}18`, color: catColor }}
                    >
                      {post.category}
                    </span>
                  )}
                </div>
                <span className="text-[11px] text-slate-400">{timeAgo(post.createdAt)}</span>
              </div>
              {isOwner && (
                <button
                  onClick={handleDelete}
                  disabled={deleting}
                  className="text-xs font-semibold text-red-400 hover:text-red-600 transition-colors disabled:opacity-50"
                >
                  삭제
                </button>
              )}
            </div>

            {/* 제목 + 내용 */}
            <h1 className="text-lg font-extrabold text-slate-800 mb-3 leading-snug">{post.title}</h1>
            <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-wrap">{post.content}</p>

            {/* 반응 */}
            <div className="flex items-center gap-5 mt-5 pt-4 border-t border-slate-50">
              <button
                onClick={handleLike}
                className={`flex items-center gap-1.5 text-sm font-semibold transition-colors ${
                  liked ? 'text-rose-500' : 'text-slate-400 hover:text-rose-500'
                }`}
              >
                <span className="material-icons text-lg">{liked ? 'favorite' : 'favorite_border'}</span>
                {likeCount}
              </button>
              <div className="flex items-center gap-1.5 text-sm text-slate-400">
                <span className="material-icons text-lg">chat_bubble_outline</span>
                {post.commentCount ?? 0}
              </div>
            </div>
          </div>
        </div>

        {/* 댓글 안내 (2차 MVP) */}
        <div className="bg-white rounded-2xl border border-dashed border-slate-200 p-6 text-center">
          <span className="material-icons text-3xl text-slate-200 block mb-2">chat_bubble_outline</span>
          <p className="text-sm font-semibold text-slate-400">댓글 기능은 준비 중이에요</p>
          <p className="text-xs text-slate-300 mt-1">곧 업데이트될 예정이에요</p>
        </div>
      </main>
    </div>
  );
}

export default CommunityDetail;
