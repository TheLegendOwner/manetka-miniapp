// src/context/WebSocketContext.tsx
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
    console.log('WebSocketContext: ready=', ready, 'WS_URL=', WS_URL);
    if (!ready) return;

    // Подключаемся к WS после готовности Telegram
    const socket = io(WS_URL, { transports: ['websocket'] });
    socketRef.current = socket;

    // Логируем попытку соединения
    socket.io.on('reconnect_attempt', () => {
      console.log('WebSocket attempting to reconnect');
    });

    // При первичном подключении отправляем авторизацию
    socket.on('connect', () => {
      console.log('WebSocket connected, id=', socket.id);
      const tg = (window as any).Telegram?.WebApp;
      const initData = tg?.initData;
      console.log('WebApp initData=', initData);
      if (initData) {
        socket.emit('auth', { type: 'auth', initData });
        console.log('Auth event emitted');
      }
    });

    // При восстановлении соединения (reconnect) повторяем авторизацию
    socket.on('reconnect', (attempt) => {
      console.log('WebSocket reconnected, attempt=', attempt);
      const tg = (window as any).Telegram?.WebApp;
      const initData = tg?.initData;
      console.log('WebApp initData after reconnect=', initData);
      if (initData) {
        socket.emit('auth', { type: 'auth', initData });
        console.log('Auth event emitted after reconnect');
      }
    });

    // Логируем отключения и ошибки подключения
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

// Хук для получения Socket.IO из контекста
export function useSocket(): Socket {
  const socket = useContext(SocketContext);
  if (!socket) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return socket;
}
