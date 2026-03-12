import React, { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';

const SocketContext = createContext();

export const useSocket = () => useContext(SocketContext);

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const { token, user } = useAuth();

  useEffect(() => {
    if (token) {
      const newSocket = io(process.env.REACT_APP_SOCKET_URL || 'http://localhost:5000', {
        auth: { token }
      });

      newSocket.on('connect', () => console.log('Socket connected'));

      newSocket.on('new_notification', (notification) => {
        setNotifications(prev => [notification, ...prev]);
        setUnreadCount(prev => prev + 1);
      });

      newSocket.on('system_announcement', (data) => {
        setNotifications(prev => [{ ...data, type: 'announcement' }, ...prev]);
        setUnreadCount(prev => prev + 1);
      });

      setSocket(newSocket);
      return () => newSocket.disconnect();
    }
  }, [token]);

  const markRead = () => setUnreadCount(0);

  const joinEvent = (eventId) => socket?.emit('join_event', eventId);
  const leaveEvent = (eventId) => socket?.emit('leave_event', eventId);

  return (
    <SocketContext.Provider value={{ socket, notifications, unreadCount, markRead, joinEvent, leaveEvent }}>
      {children}
    </SocketContext.Provider>
  );
};
