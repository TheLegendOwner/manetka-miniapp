'use client';

import React, { createContext, useContext, useEffect, useRef, ReactNode } from 'react';
import { io, Socket } from 'socket.io-client';
import { useTelegram } from './TelegramContext';

// Убедитесь, что NEXT_PUBLIC_WS_URL указывает на действующий WebSocket-сервер
// Vercel-фронтенд не может хостить Socket.IO, развёрните отдельный backend с Socket.IO
const WS_URL = process.env.NEXT_PUBLIC_WS_URL as string;

const SocketContext = createContext<Socket | null>(null);

export function SocketProvider({ children }: { children: ReactNode }) {
  const { ready } = useTelegram();
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    console.log('WebSocketContext: ready=', ready, 'WS_URL=', WS_URL);
    if (!ready) return;

    // Подключаемся к внешнему Socket.IO-серверу
    const socket = io(WS_URL, { transports: ['websocket'] });
    socketRef.current = socket;

    socket.io.on('reconnect_attempt', () => {
      console.log('WebSocket attempting to reconnect...');
    });

    socket.on('connect', () => {
      console.log('WebSocket connected, id=', socket.id);
      const tg = (window as any).Telegram?.WebApp;
      const initData = tg?.initData;
      console.log('Telegram initData=', initData);
      if (initData) {
        socket.emit('auth', { type: 'auth', initData });
        console.log('Sent auth event');
      }
    });

    socket.on('reconnect', attempt => {
      console.log('WebSocket reconnected, attempt=', attempt);
      const tg = (window as any).Telegram?.WebApp;
      const initData = tg?.initData;
      console.log('Telegram initData after reconnect=', initData);
      if (initData) {
        socket.emit('auth', { type: 'auth', initData });
        console.log('Sent auth event after reconnect');
      }
    });

    socket.on('disconnect', reason => {
      console.log('WebSocket disconnected:', reason);
    });

    socket.on('connect_error', err => {
      console.error('WebSocket connect_error:', err);
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [ready]);

  return (
    <SocketContext.Provider value={socketRef.current}>
      {children}
    </SocketContext.Provider>
  );
}

export function useSocket(): Socket {
  const socket = useContext(SocketContext);
  if (!socket) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return socket;
}