import { useState, useEffect } from 'react';
import { fetchWithAuth } from '../../api/fetchWithAuth';
import UserNavbar from '../../components/user/UserNavbar';

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
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
    );
  };

  const markAllAsRead = async () => {
    await fetchWithAuth('/api/notifications/read-all', { method: 'PUT' });
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
  };

  const iconMap = {
    badge: 'emoji_events',
    challenge: 'flag',
    system: 'info',
  };

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

  return (
    <div className="min-h-screen bg-[#F9F7F2] pb-24">
      <UserNavbar />
      <div className="max-w-lg mx-auto px-4 pt-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-xl font-bold text-slate-800">알림</h1>
          {notifications.some((n) => !n.isRead) && (
            <button
              onClick={markAllAsRead}
              className="text-sm text-primary font-semibold"
            >
              전체 읽음
            </button>
          )}
        </div>

        {notifications.length === 0 ? (
          <div className="text-center py-16">
            <span className="material-icons text-5xl text-slate-300 mb-3">notifications_off</span>
            <p className="text-slate-400">아직 알림이 없어요</p>
          </div>
        ) : (
          <div className="space-y-3">
            {notifications.map((notif) => (
              <div
                key={notif.id}
                onClick={() => !notif.isRead && markAsRead(notif.id)}
                className={`bg-white rounded-2xl shadow-sm border p-4 cursor-pointer transition-all ${
                  notif.isRead ? 'border-gray-100 opacity-60' : 'border-primary/20'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                    notif.isRead ? 'bg-gray-100' : 'bg-primary/10'
                  }`}>
                    <span className={`material-icons text-lg ${notif.isRead ? 'text-gray-400' : 'text-primary'}`}>
                      {iconMap[notif.type] || 'notifications'}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm text-slate-800">{notif.title}</p>
                    <p className="text-xs text-slate-500 mt-0.5">{notif.content}</p>
                    <p className="text-xs text-slate-400 mt-1">
                      {new Date(notif.createdAt).toLocaleDateString('ko-KR')}
                    </p>
                  </div>
                  {!notif.isRead && (
                    <div className="w-2.5 h-2.5 bg-primary rounded-full mt-1 flex-shrink-0" />
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Notifications;
