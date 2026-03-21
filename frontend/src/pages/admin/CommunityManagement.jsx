import { useState, useEffect, useCallback } from 'react';
import { fetchWithAuth } from '../../api/fetchWithAuth';
import AdminSidebar from '../../components/admin/AdminSidebar';
import AdminHeader from '../../components/admin/AdminHeader';

const CATEGORIES = ['전체', '신체적 휴식', '감각적 휴식', '정신적 휴식', '정서적 휴식', '사회적 휴식', '자연적 휴식', '창조적 휴식'];

const STATUS_MAP = {
  visible: { label: '정상',  cls: 'bg-green-50 text-green-600 border border-green-200',  dot: 'bg-green-500' },
  hidden:  { label: '숨김',  cls: 'bg-gray-100 text-gray-500 border border-gray-200',   dot: 'bg-gray-400'  },
  deleted: { label: '삭제됨', cls: 'bg-red-50 text-red-500 border border-red-200',       dot: 'bg-red-400'   },
};

const STATUS_FILTERS = [
  { value: '',        label: '전체' },
  { value: 'visible', label: '정상' },
  { value: 'hidden',  label: '숨김' },
  { value: 'deleted', label: '삭제됨' },
];

function formatDate(dateStr) {
  if (!dateStr) return '-';
  const diff = Math.floor((Date.now() - new Date(dateStr)) / 1000);
  if (diff < 60)         return '방금 전';
  if (diff < 3600)       return `${Math.floor(diff / 60)}분 전`;
  if (diff < 86400)      return `${Math.floor(diff / 3600)}시간 전`;
  if (diff < 86400 * 7)  return `${Math.floor(diff / 86400)}일 전`;
  return new Date(dateStr).toLocaleDateString('ko-KR');
}

function CommunityManagement() {
  const [posts, setPosts] = useState([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState('');
  const [inputSearch, setInputSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('전체');
  const [statusFilter, setStatusFilter] = useState('');

  const loadPosts = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page, size: 20 });
      const data = await fetchWithAuth(`/api/admin/posts?${params}`);
      if (data.success && data.data) {
        setPosts(data.data.posts || []);
        setTotal(data.data.total || 0);
        setTotalPages(data.data.totalPages || 1);
      }
    } catch {
      // 무시
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => { loadPosts(); }, [loadPosts]);

  const handleStatusChange = async (postId, newStatus) => {
    const label = STATUS_MAP[newStatus]?.label || newStatus;
    if (!window.confirm(`게시글을 '${label}' 상태로 변경할까요?`)) return;
    try {
      await fetchWithAuth(`/api/admin/posts/${postId}/status`, {
        method: 'PUT',
        body: JSON.stringify({ status: newStatus }),
      });
      setPosts(prev => prev.map(p => p.id === postId ? { ...p, status: newStatus } : p));
    } catch {
      // 무시
    }
  };

  // 클라이언트 필터 (검색·카테고리·상태)
  const filtered = posts.filter(p => {
    if (categoryFilter !== '전체' && p.category !== categoryFilter) return false;
    if (statusFilter && p.status !== statusFilter) return false;
    if (search) {
      const q = search.toLowerCase();
      if (!p.title?.toLowerCase().includes(q) && !p.nickname?.toLowerCase().includes(q)) return false;
    }
    return true;
  });

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      <AdminSidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <AdminHeader title="커뮤니티 관리" subtitle="게시글 현황 및 상태를 관리하세요." />
        <main className="flex-1 overflow-y-auto p-6 space-y-5">

          {/* 요약 카드 */}
          <div className="grid grid-cols-4 gap-4">
            {[
              { icon: 'article',      label: '전체 게시글', value: total,                                                    iconCls: 'bg-gray-100 text-gray-600'      },
              { icon: 'check_circle', label: '정상',        value: posts.filter(p => p.status === 'visible').length,        iconCls: 'bg-green-50 text-green-600'     },
              { icon: 'visibility_off', label: '숨김',      value: posts.filter(p => p.status === 'hidden').length,         iconCls: 'bg-amber-50 text-amber-600'     },
              { icon: 'delete',       label: '삭제됨',      value: posts.filter(p => p.status === 'deleted').length,        iconCls: 'bg-red-50 text-red-500'         },
            ].map((card, i) => (
              <div key={i} className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 flex items-center gap-4">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${card.iconCls}`}>
                  <span className="material-icons text-[20px]">{card.icon}</span>
                </div>
                <div>
                  <div className="flex items-end gap-1">
                    <span className="text-2xl font-black text-gray-900 leading-none">{card.value}</span>
                    <span className="text-sm text-gray-400 mb-0.5">건</span>
                  </div>
                  <p className="text-xs text-gray-400 mt-0.5">{card.label}</p>
                </div>
              </div>
            ))}
          </div>

          {/* 테이블 카드 */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">

            {/* 툴바 */}
            <div className="px-5 py-4 border-b border-gray-100 space-y-3">
              <div className="flex items-center justify-between gap-3">
                <form onSubmit={e => { e.preventDefault(); setSearch(inputSearch); setPage(1); }} className="relative">
                  <span className="material-icons absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-[16px]">search</span>
                  <input
                    value={inputSearch}
                    onChange={e => setInputSearch(e.target.value)}
                    placeholder="제목 · 작성자 검색"
                    className="h-9 pl-9 pr-4 w-64 border border-gray-200 rounded-lg text-sm text-gray-700 placeholder:text-gray-400 bg-gray-50 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                  />
                </form>
                <div className="text-xs text-gray-400">
                  총 <span className="font-semibold text-gray-600">{filtered.length}</span>건 표시
                  {(search || categoryFilter !== '전체' || statusFilter) && (
                    <button
                      onClick={() => { setSearch(''); setInputSearch(''); setCategoryFilter('전체'); setStatusFilter(''); }}
                      className="ml-2 text-primary hover:underline"
                    >
                      필터 초기화
                    </button>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-xs text-gray-400 mr-1">카테고리</span>
                {CATEGORIES.map(cat => (
                  <button
                    key={cat}
                    onClick={() => { setCategoryFilter(cat); setPage(1); }}
                    className={`h-7 px-3 rounded-lg text-xs font-semibold border transition-all ${
                      categoryFilter === cat
                        ? 'bg-primary text-white border-primary'
                        : 'bg-white text-gray-500 border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
                <span className="text-xs text-gray-300 mx-1">|</span>
                <span className="text-xs text-gray-400 mr-1">상태</span>
                {STATUS_FILTERS.map(s => (
                  <button
                    key={s.value}
                    onClick={() => { setStatusFilter(s.value); setPage(1); }}
                    className={`h-7 px-3 rounded-lg text-xs font-semibold border transition-all ${
                      statusFilter === s.value
                        ? 'bg-primary text-white border-primary'
                        : 'bg-white text-gray-500 border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>

            {/* 테이블 */}
            <div className="overflow-x-auto">
              {loading ? (
                <div className="flex justify-center items-center py-16">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary" />
                </div>
              ) : (
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-200">
                      <th className="px-5 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider w-14">ID</th>
                      <th className="px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">제목</th>
                      <th className="px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider w-24">작성자</th>
                      <th className="px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider w-24">작성일</th>
                      <th className="px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider w-20 text-center">상태</th>
                      <th className="px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right w-36">관리</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="py-16 text-center">
                          <div className="flex flex-col items-center gap-2 text-gray-300">
                            <span className="material-icons text-4xl">article</span>
                            <p className="text-sm text-gray-400">
                              {search ? `"${search}"에 해당하는 게시글이 없습니다` : '게시글이 없습니다'}
                            </p>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      filtered.map((post, idx) => {
                        const statusInfo = STATUS_MAP[post.status] || STATUS_MAP.visible;
                        return (
                          <tr
                            key={post.id}
                            className={`border-b border-gray-100 hover:bg-primary/5 transition-colors ${
                              idx % 2 === 1 ? 'bg-gray-50/50' : 'bg-white'
                            }`}
                          >
                            <td className="px-5 py-3.5 text-xs font-mono text-gray-400">{post.id}</td>
                            <td className="px-5 py-3.5 max-w-xs">
                              {post.category && (
                                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-teal-50 text-teal-600 border border-teal-200 mb-1">
                                  {post.category}
                                </span>
                              )}
                              <p className="text-sm font-semibold text-gray-900 truncate">{post.title}</p>
                              <div className="flex items-center gap-3 mt-1">
                                <span className="flex items-center gap-0.5 text-[11px] text-gray-400">
                                  <span className="material-icons text-[12px] text-red-400">favorite</span>
                                  {post.likeCount || 0}
                                </span>
                                <span className="flex items-center gap-0.5 text-[11px] text-gray-400">
                                  <span className="material-icons text-[12px]">chat_bubble</span>
                                  {post.commentCount || 0}
                                </span>
                              </div>
                            </td>
                            <td className="px-5 py-3.5 text-sm font-medium text-gray-700">
                              {post.anonymous ? '익명' : post.nickname || '-'}
                            </td>
                            <td className="px-5 py-3.5 text-xs text-gray-500">{formatDate(post.createdAt)}</td>
                            <td className="px-5 py-3.5 text-center">
                              <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold ${statusInfo.cls}`}>
                                <span className={`w-1.5 h-1.5 rounded-full inline-block ${statusInfo.dot}`} />
                                {statusInfo.label}
                              </span>
                            </td>
                            <td className="px-5 py-3.5 text-right">
                              <div className="flex items-center justify-end gap-1.5">
                                {post.status !== 'visible' && (
                                  <button
                                    onClick={() => handleStatusChange(post.id, 'visible')}
                                    className="px-2.5 py-1 text-[11px] font-bold text-green-600 border border-green-200 rounded-lg hover:bg-green-50 transition-colors"
                                  >
                                    복원
                                  </button>
                                )}
                                {post.status === 'visible' && (
                                  <button
                                    onClick={() => handleStatusChange(post.id, 'hidden')}
                                    className="px-2.5 py-1 text-[11px] font-bold text-gray-500 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                                  >
                                    숨김
                                  </button>
                                )}
                                {post.status !== 'deleted' && (
                                  <button
                                    onClick={() => handleStatusChange(post.id, 'deleted')}
                                    className="px-2.5 py-1 text-[11px] font-bold text-red-400 border border-red-200 rounded-lg hover:bg-red-50 transition-colors"
                                  >
                                    삭제
                                  </button>
                                )}
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              )}
            </div>

            {/* 페이지네이션 */}
            {totalPages > 1 && (
              <div className="px-5 py-3 border-t border-gray-100 flex items-center justify-between">
                <p className="text-xs text-gray-400">총 {total}건</p>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 text-gray-400 hover:bg-gray-50 disabled:opacity-40"
                  >
                    <span className="material-icons text-[16px]">chevron_left</span>
                  </button>
                  {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => i + 1).map(p => (
                    <button
                      key={p}
                      onClick={() => setPage(p)}
                      className={`w-8 h-8 text-xs font-bold rounded-lg border transition-all ${
                        page === p ? 'bg-primary text-white border-primary' : 'border-gray-200 text-gray-500 hover:bg-gray-50'
                      }`}
                    >
                      {p}
                    </button>
                  ))}
                  <button
                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                    className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 text-gray-400 hover:bg-gray-50 disabled:opacity-40"
                  >
                    <span className="material-icons text-[16px]">chevron_right</span>
                  </button>
                </div>
              </div>
            )}
          </div>

        </main>
      </div>
    </div>
  );
}

export default CommunityManagement;
