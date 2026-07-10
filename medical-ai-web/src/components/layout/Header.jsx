/**
 * Header — Dark glassmorphism top bar
 */
import { Bell, Sun, Moon, Menu } from 'lucide-react';
import useAuth from '../../hooks/useAuth';
import { useTheme } from '../../store/ThemeContext';

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import notificationApi from '../../api/notificationApi';

import { HubConnectionBuilder, LogLevel } from '@microsoft/signalr';

const getInitials = (name) => {
  if (!name) return 'U';
  const p = name.trim().split(/\s+/);
  return p.length === 1 ? p[0][0].toUpperCase() : (p[0][0] + p[p.length - 1][0]).toUpperCase();
};

const roleLabels = { Admin: 'Quản trị viên', Doctor: 'Bác sĩ', Patient: 'Bệnh nhân' };

export const Header = ({ onMenuClick }) => {
  const { user } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const displayName = user?.fullName || user?.email || 'Người dùng';

  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotifications, setShowNotifications] = useState(false);

  useEffect(() => {
    if (!user) return;

    let connection = null;

    const fetchNotifications = async () => {
      try {
        const notifs = await notificationApi.getNotifications(10);
        setNotifications(notifs);
        const countRes = await notificationApi.getUnreadCount();
        setUnreadCount(countRes.count);
      } catch (err) {
        console.error("Lỗi lấy thông báo:", err.response?.data?.message || err.message);
      }
    };

    const setupSignalR = async () => {
      const token = localStorage.getItem('accessToken');
      if (!token) return;

      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5182/api';
      const hubUrl = apiUrl.replace(/\/api\/?$/, '') + '/api/notificationHub';

      connection = new HubConnectionBuilder()
        .withUrl(hubUrl, { accessTokenFactory: () => token })
        .configureLogging(LogLevel.Warning)
        .withAutomaticReconnect()
        .build();

      connection.on("ReceiveNotification", (notif) => {
        setNotifications(prev => [notif, ...prev].slice(0, 10));
        setUnreadCount(prev => prev + 1);
      });

      try {
        await connection.start();
      } catch (err) {
        console.error("SignalR connection error: ", err);
      }
    };

    fetchNotifications();
    setupSignalR();

    return () => {
      if (connection) {
        connection.stop();
      }
    };
  }, [user]);

  const handleMarkAllAsRead = async () => {
    try {
      await notificationApi.markAllAsRead();
      setNotifications(notifications.map(n => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (err) {
      console.error(err);
    }
  };

  const handleNotificationClick = async (notif) => {
    if (!notif.isRead) {
      try {
        await notificationApi.markAsRead(notif.id);
        setNotifications(notifications.map(n => n.id === notif.id ? { ...n, isRead: true } : n));
        setUnreadCount(prev => Math.max(0, prev - 1));
      } catch (err) {
        console.error(err);
      }
    }
    setShowNotifications(false);
    
    // Điều hướng dựa vào Role
    if (notif.relatedCheckupId) {
      if (user.role === 'Doctor' || user.role === 'Admin') {
        // Đối với bác sĩ, có thể điều hướng tới trang admin (hoặc dashboard nếu đã có route)
        // Hiện tại tạm đưa về /admin/checkups
        navigate('/admin/checkups');
      } else {
        // Đối với bệnh nhân, tới màn hình kết quả
        navigate(`/result/${notif.relatedCheckupId}`);
      }
    }
  };

  return (
    <header className="h-14 bg-midnight-50/60 backdrop-blur-xl border-b border-cyan-500/6 flex-shrink-0 z-10">
      <div className="h-full px-6 lg:px-8 flex items-center justify-between">
        <div className="flex items-center gap-3">
          {/* Hamburger button — mobile only */}
          {onMenuClick && (
            <button
              onClick={onMenuClick}
              className="lg:hidden p-2 -ml-2 rounded-lg text-glass-500 hover:text-glass-300 hover:bg-midnight-200/40 transition-all duration-200"
              aria-label="Mở menu"
            >
              <Menu className="w-5 h-5" strokeWidth={1.8} />
            </button>
          )}
          <h2 className="text-sm font-semibold text-glass-300 tracking-tight">MedicalAI</h2>
          <span className="hidden sm:inline-flex items-center text-[10px] font-bold text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded-md border border-cyan-500/15 tracking-wider uppercase">
            AI-Powered
          </span>
        </div>

        <div className="flex items-center gap-3">
          <button 
            onClick={toggleTheme}
            className="p-2 rounded-lg text-glass-500 hover:text-glass-300 hover:bg-midnight-200/40 transition-all duration-200"
            title="Đổi giao diện"
          >
            {theme === 'dark' ? <Sun className="w-4 h-4" strokeWidth={1.8} /> : <Moon className="w-4 h-4" strokeWidth={1.8} />}
          </button>
          
          <div className="relative">
            <button 
              onClick={() => setShowNotifications(!showNotifications)}
              className="p-2 rounded-lg text-glass-500 hover:text-glass-300 hover:bg-midnight-200/40 transition-all duration-200 relative"
            >
              <Bell className="w-4 h-4" strokeWidth={1.8} />
              {unreadCount > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full ring-2 ring-midnight border border-rose-400" />
              )}
            </button>

            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 bg-midnight-200/95 backdrop-blur-xl border border-cyan-500/10 rounded-2xl shadow-glass-lg overflow-hidden z-50">
                <div className="p-3 border-b border-cyan-500/10 flex items-center justify-between bg-midnight-300/50">
                  <h3 className="text-sm font-semibold text-glass-100">Thông báo</h3>
                  {unreadCount > 0 && (
                    <button 
                      onClick={handleMarkAllAsRead}
                      className="text-[10px] text-cyan-400 hover:text-cyan-300 transition-colors"
                    >
                      Đánh dấu đã đọc tất cả
                    </button>
                  )}
                </div>
                <div className="max-h-80 overflow-y-auto">
                  {notifications.length === 0 ? (
                    <div className="p-4 text-center text-sm text-glass-500">
                      Không có thông báo nào
                    </div>
                  ) : (
                    notifications.map(notif => (
                      <div 
                        key={notif.id} 
                        onClick={() => handleNotificationClick(notif)}
                        className={`p-3 border-b border-cyan-500/5 cursor-pointer transition-colors hover:bg-cyan-500/5 ${!notif.isRead ? 'bg-cyan-500/10' : ''}`}
                      >
                        <div className="flex justify-between items-start mb-1">
                          <h4 className={`text-xs font-medium ${!notif.isRead ? 'text-cyan-300' : 'text-glass-300'}`}>
                            {notif.title}
                          </h4>
                          {!notif.isRead && <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 flex-shrink-0 mt-1" />}
                        </div>
                        <p className="text-[11px] text-glass-400 line-clamp-2 leading-relaxed">
                          {notif.message}
                        </p>
                        <p className="text-[9px] text-glass-500 mt-1">
                          {new Date(notif.createdAt).toLocaleString('vi-VN')}
                        </p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          <div className="h-6 w-px bg-cyan-500/8" />

          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg gradient-cyan-teal text-midnight flex items-center justify-center font-bold text-[10px] overflow-hidden p-[1px] shadow-sm">
              <div className="w-full h-full bg-midnight rounded-[6px] overflow-hidden flex items-center justify-center">
                {user?.avatarUrl ? (
                  <img 
                    src={user.avatarUrl.startsWith('http') ? user.avatarUrl : `${(import.meta.env.VITE_API_URL || '').replace(/\/api\/?$/, '')}${user.avatarUrl}`} 
                    alt="Avatar" 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-cyan-500/20 to-teal-500/20 flex items-center justify-center text-cyan-400 font-bold">
                    {getInitials(displayName)}
                  </div>
                )}
              </div>
            </div>
            <div className="hidden sm:block">
              <p className="text-xs font-semibold text-glass-200 leading-none mb-0.5">{displayName}</p>
              <p className="text-[10px] text-glass-500 leading-none">{roleLabels[user?.role] || 'Người dùng'}</p>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
export default Header;
