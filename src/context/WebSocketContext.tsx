'use client';

import React, { createContext, useContext, useEffect, useRef, ReactNode } from 'react';
import { io, Socket } from 'socket.io-client';
import { useTelegram } from './TelegramContext';

// Укажите ваш WS-сервер в .env (NEXT_PUBLIC_WS_URL)
const WS_URL = process.env.NEXT_PUBLIC_WS_URL!;

// Контекст для Socket.IO
const SocketContext = createContext<Socket | null>(null);

export function SocketProvider({ children }: { children: ReactNode }) {
  const { ready } = useTelegram();
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    // Ждём инициализации Telegram WebApp, но соединение создаём сразу
    // if (!ready) return; // ждём инициализации Telegram WebApp

    // Подключаемся к WS
    const socket = io(WS_URL, { transports: ['websocket'] });
    socketRef.current = socket;

    // При первичном подключении отправляем авторизацию
    socket.on('connect', () => {
      console.log('WebSocket connected, id=', socket.id);
      const tg = (window as any).Telegram?.WebApp;
      const initData = tg?.initData;
      if (initData) {
        socket.emit('auth', { type: 'auth', initData });
      }
    });

    // При восстановлении соединения (reconnect) повторяем авторизацию
    socket.on('reconnect', (attempt) => {
      console.log('WebSocket reconnected, attempt=', attempt);
      const tg = (window as any).Telegram?.WebApp;
      const initData = tg?.initData;
      if (initData) {
        socket.emit('auth', { type: 'auth', initData });
      }
    });

    // Логируем отключения и прочие события
    socket.on('disconnect', reason => {
      console.log('WebSocket disconnected:', reason);
    });
    socket.on('update', data => {
      console.log('Update from server:', data);
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

// Хук для получения Socket.IO из контекста
export function useSocket(): Socket {
  const socket = useContext(SocketContext);
  if (!socket) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return socket;
}
