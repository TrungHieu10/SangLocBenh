/**
 * ToastContainer — Renders floating toast notifications from NotificationContext
 */
import { useContext, useEffect, useState } from 'react';
import { NotificationContext } from '../../store/NotificationContext';
import { CheckCircle2, AlertCircle, AlertTriangle, Info, X } from 'lucide-react';

const typeConfig = {
  success: {
    icon: CheckCircle2,
    bg: 'bg-teal-500/15',
    border: 'border-teal-500/25',
    text: 'text-teal-400',
    bar: 'bg-teal-500',
  },
  error: {
    icon: AlertCircle,
    bg: 'bg-red-500/15',
    border: 'border-red-500/25',
    text: 'text-red-400',
    bar: 'bg-red-500',
  },
  warning: {
    icon: AlertTriangle,
    bg: 'bg-amber-500/15',
    border: 'border-amber-500/25',
    text: 'text-amber-400',
    bar: 'bg-amber-500',
  },
  info: {
    icon: Info,
    bg: 'bg-cyan-500/15',
    border: 'border-cyan-500/25',
    text: 'text-cyan-400',
    bar: 'bg-cyan-500',
  },
};

const Toast = ({ notification, onRemove }) => {
  const [isExiting, setIsExiting] = useState(false);
  const config = typeConfig[notification.type] || typeConfig.info;
  const Icon = config.icon;

  const handleClose = () => {
    setIsExiting(true);
    setTimeout(() => onRemove(notification.id), 300);
  };

  return (
    <div
      className={`
        flex items-start gap-3 px-4 py-3.5 rounded-xl border backdrop-blur-md shadow-lg
        ${config.bg} ${config.border}
        ${isExiting ? 'animate-slide-out-right' : 'animate-slide-in-right'}
        transition-all duration-300
      `}
      role="alert"
      aria-live="assertive"
    >
      <Icon className={`w-5 h-5 ${config.text} shrink-0 mt-0.5`} />
      <p className={`text-sm font-medium flex-1 ${config.text}`}>{notification.message}</p>
      <button
        onClick={handleClose}
        className="p-0.5 rounded-md text-glass-500 hover:text-glass-200 transition-colors shrink-0"
        aria-label="Đóng thông báo"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
};

export const ToastContainer = () => {
  const { notifications, removeNotification } = useContext(NotificationContext);

  if (notifications.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-[70] flex flex-col gap-2 max-w-sm w-full pointer-events-none">
      {notifications.map((notif) => (
        <div key={notif.id} className="pointer-events-auto">
          <Toast notification={notif} onRemove={removeNotification} />
        </div>
      ))}
    </div>
  );
};

export default ToastContainer;
