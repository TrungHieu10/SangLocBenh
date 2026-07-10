/**
 * NotificationContext - Quản lý toast notifications
 */
import { createContext, useCallback, useState } from 'react';

export const NotificationContext = createContext();

export const NotificationContextProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);

  const addNotification = useCallback(
    (message, type = 'info', duration = 3000) => {
      const id = Date.now();
      const notification = { id, message, type };

      setNotifications((prev) => [...prev, notification]);

      if (duration > 0) {
        setTimeout(() => {
          removeNotification(id);
        }, duration);
      }

      return id;
    },
    []
  );

  const removeNotification = useCallback((id) => {
    setNotifications((prev) => prev.filter((notif) => notif.id !== id));
  }, []);

  const success = useCallback(
    (message, duration = 3000) => {
      return addNotification(message, 'success', duration);
    },
    [addNotification]
  );

  const error = useCallback(
    (message, duration = 5000) => {
      return addNotification(message, 'error', duration);
    },
    [addNotification]
  );

  const warning = useCallback(
    (message, duration = 4000) => {
      return addNotification(message, 'warning', duration);
    },
    [addNotification]
  );

  const info = useCallback(
    (message, duration = 3000) => {
      return addNotification(message, 'info', duration);
    },
    [addNotification]
  );

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        addNotification,
        removeNotification,
        success,
        error,
        warning,
        info,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export default NotificationContext;
