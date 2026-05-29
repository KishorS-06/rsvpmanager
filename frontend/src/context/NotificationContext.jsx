import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { io } from 'socket.io-client';
import api from '../utils/api';
import useAuthStore from '../store/authStore';

const NotificationContext = createContext();

export { NotificationContext };
export const useNotifications = () => useContext(NotificationContext);

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [socket, setSocket] = useState(null);
  const { user, isAuthenticated } = useAuthStore();

  const fetchNotifications = useCallback(async () => {
    if (!isAuthenticated) return;
    try {
      const { data } = await api.get('/api/notifications?limit=20');
      setNotifications(data.notifications);
      setUnreadCount(data.unreadCount);
    } catch (error) {
      // silent fail
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (!isAuthenticated || !user) return;

    fetchNotifications();

    const newSocket = io(import.meta.env.VITE_API_URL || 'https://rsvpmanager.onrender.com', {
      auth: { token: localStorage.getItem('token') },
      reconnectionAttempts: 5,
      reconnectionDelay: 1000
    });

    newSocket.on('connect', () => {
      newSocket.emit('join-user-room', user._id);
    });

    newSocket.on('notification', (notification) => {
      setNotifications((prev) => [notification, ...prev]);
      setUnreadCount((prev) => prev + 1);

      // Browser notification
      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification(notification.title, {
          body: notification.message,
          icon: '/favicon.ico'
        });
      }
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, [isAuthenticated, user?._id]);

  const markAsRead = async (notificationId) => {
    try {
      await api.put(`/api/notifications/${notificationId}/read`);
      setNotifications((prev) =>
        prev.map((n) => (n._id === notificationId ? { ...n, isRead: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (error) {
      // silent
    }
  };

  const markAllAsRead = async () => {
    try {
      await api.put('/api/notifications/mark-all-read');
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (error) {
      // silent
    }
  };

  const requestPermission = async () => {
    if ('Notification' in window && Notification.permission === 'default') {
      await Notification.requestPermission();
    }
  };

  useEffect(() => {
    requestPermission();
  }, []);

  return (
    <NotificationContext.Provider
      value={{ notifications, unreadCount, markAsRead, markAllAsRead, fetchNotifications, socket }}
    >
      {children}
    </NotificationContext.Provider>
  );
};
