import { useState, useEffect } from 'react';
import { fetchWithAuth } from '../../api/fetchWithAuth';
import UserNavbar from '../../components/user/UserNavbar';

const TYPE_META = {
  badge:     { icon: 'emoji_events', bg: '#FFFBEB', color: '#F59E0B' },
  challenge: { icon: 'flag',         bg: '#ECFDF5', color: '#10B981' },
  system:    { icon: 'info',         bg: '#F1F5F9', color: '#64748B' },
  rest:      { icon: 'self_improvement', bg: '#F0FDF4', color: '#2ECC9A' },
  diagnosis: { icon: 'psychology',   bg: '#EEF2FF', color: '#6366F1' },
};

function getTypeMeta(type) {
  return TYPE_META[type] || { icon: 'notifications', bg: '#F1F5F9', color: '#64748B' };
}

function relativeTime(dateStr) {
  if (!dateStr) return '';
  const diff = Date.now() - new Date(dateStr).getTime();
  const min = Math.floor(diff / 60000);
  if (min < 1)  return '방금';
  if (min < 60) return `${min}분 전`;
  const hr = Math.floor(min / 60);
  if (hr < 24)  return `${hr}시간 전`;
  const day = Math.floor(hr / 24);
  if (day < 7)  return `${day}일 전`;
  const d = new Date(dateStr);
  return `${d.getMonth() + 1}월 ${d.getDate()}일`;
}

function getDayKey(dateStr) {
  if (!dateStr) return 'older';
  const d = new Date(dateStr);
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const target = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  const diffDays = Math.round((today - target) / 86400000);
  if (diffDays === 0) return 'today';
  if (diffDays === 1) return 'yesterday';
  return 'older';
}

const DAY_LABEL = { today: '오늘', yesterday: '어제', older: '이전 알림' };
const DAY_ORDER = ['today', 'yesterday', 'older'];

function groupByDay(notifications) {
  const groups = { today: [], yesterday: [], older: [] };
  notifications.forEach(n => {
    const key = getDayKey(n.createdAt);
    groups[key].push(n);
  });
  return groups;
}

function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadNotifications();
  }, []);

  const loadNotifications = async () => {
    try {
      const data = await fetchWithAuth('/api/notifications?page=1&size=50');
      if (data.success && data.data) {
        setNotifications(data.data.notifications || []);
      }
    } catch {
      // 에러 무시
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (id) => {
    await fetchWithAuth(`/api/notifications/${id}/read`, { method: 'PUT' });
    setNotifications(prev =>
      prev.map(n => n.id === id ? { ...n, isRead: true } : n)
    );
  };

  const markAllAsRead = async () => {
    await fetchWithAuth('/api/notifications/read-all', { method: 'PUT' });
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;
  const groups = groupByDay(notifications);

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

  return (
    <div className="min-h-screen bg-[#F7F7F8]">
      <UserNavbar />

      <main className="max-w-lg mx-auto px-4 pt-6 pb-24">

        {/* 헤더 */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <h1 className="text-[22px] font-extrabold tracking-tight text-slate-800">알림</h1>
            {unreadCount > 0 && (
              <span className="min-w-[20px] h-5 px-1.5 bg-blue-500 text-white text-[11px] font-bold rounded-full flex items-center justify-center">
                {unreadCount}
              </span>
            )}
          </div>
          {unreadCount > 0 && (
            <button
              onClick={markAllAsRead}
              className="flex items-center gap-1 text-xs font-bold text-slate-400 hover:text-primary transition-colors"
            >
              <span className="material-icons text-sm">done_all</span>
              모두 읽음
            </button>
          )}
        </div>

        {/* 빈 상태 */}
        {notifications.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-100 p-16 text-center">
            <span className="material-icons text-5xl text-slate-200 mb-3 block">notifications_none</span>
            <p className="font-semibold text-slate-500 mb-1">알림이 없어요</p>
            <p className="text-sm text-slate-400">새로운 알림이 오면 여기에 표시돼요.</p>
          </div>
        ) : (
          <div className="space-y-5">
            {DAY_ORDER.map(dayKey => {
              const items = groups[dayKey];
              if (!items || items.length === 0) return null;
              return (
                <div key={dayKey}>
                  {/* 날짜 섹션 헤더 */}
                  <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest px-1 mb-2">
                    {DAY_LABEL[dayKey]}
                  </p>

                  {/* 알림 카드 묶음 */}
                  <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden divide-y divide-slate-50">
                    {items.map(notif => {
                      const meta = getTypeMeta(notif.type);
                      return (
                        <div
                          key={notif.id}
                          onClick={() => !notif.isRead && markAsRead(notif.id)}
                          className={`relative flex items-start gap-3 px-4 py-3.5 transition-colors cursor-pointer ${
                            notif.isRead
                              ? 'bg-white hover:bg-slate-50/60'
                              : 'bg-blue-50/60 hover:bg-blue-50'
                          }`}
                        >
                          {/* 안읽음 dot */}
                          {!notif.isRead && (
                            <span className="absolute left-0 top-0 bottom-0 w-[3px] rounded-r-full bg-blue-400" />
                          )}

                          {/* 아이콘 박스 */}
                          <div
                            className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 mt-0.5"
                            style={{ backgroundColor: notif.isRead ? '#F1F5F9' : meta.bg }}
                          >
                            <span
                              className="material-icons text-[18px]"
                              style={{ color: notif.isRead ? '#94A3B8' : meta.color }}
                            >
                              {meta.icon}
                            </span>
                          </div>

                          {/* 텍스트 */}
                          <div className="flex-1 min-w-0">
                            <p className={`text-sm font-semibold leading-snug ${
                              notif.isRead ? 'text-slate-400' : 'text-slate-800'
                            }`}>
                              {notif.title}
                            </p>
                            {notif.content && (
                              <p className={`text-xs mt-0.5 leading-relaxed ${
                                notif.isRead ? 'text-slate-300' : 'text-slate-500'
                              }`}>
                                {notif.content}
                              </p>
                            )}
                          </div>

                          {/* 시간 */}
                          <span className="text-[11px] text-slate-300 shrink-0 mt-0.5">
                            {relativeTime(notif.createdAt)}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        )}

      </main>
    </div>
  );
}

export default Notifications;
