'use client';

import React, { createContext, useContext, useEffect, useRef, ReactNode } from 'react';
import { useTelegram } from './TelegramContext';

// URL вашего Spring WebSocketHandler endpoint (например, wss://api.your-domain.com/ws)
const WS_URL = process.env.NEXT_PUBLIC_WS_URL as string;

// Контекст для WebSocket
const SocketContext = createContext<WebSocket | null>(null);

export function SocketProvider({ children }: { children: ReactNode }) {
  const { ready } = useTelegram();
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectRef = useRef<number | null>(null);

  useEffect(() => {
    if (!WS_URL) {
      console.error('WebSocket URL not defined');
      return;
    }

    let socket: WebSocket;
    let connect = () => {
      console.log('WS: connecting to', WS_URL);
      socket = new WebSocket(WS_URL);
      wsRef.current = socket;

      socket.onopen = () => {
        console.log('WS: connected');
        // Отправляем auth, когда Telegram готов
        if (ready) {
          const tg = (window as any).Telegram?.WebApp;
          const initData = tg?.initData;
          const msg = { type: 'auth', initData };
          socket.send(JSON.stringify(msg));
          console.log('WS: auth sent', msg);
        }
      };

      socket.onmessage = event => {
        console.log('WS: message received', event.data);
        // Здесь можно парсить JSON и диспатчить события
      };

      socket.onclose = e => {
        console.warn('WS: closed', e.code, e.reason);
        // Попытка переподключения через 5 секунд
        reconnectRef.current = window.setTimeout(connect, 5000);
      };

      socket.onerror = err => {
        console.error('WS: error', err);
        socket.close();
      };
    };

    connect();

    return () => {
      if (reconnectRef.current) {
        clearTimeout(reconnectRef.current);
      }
      if (wsRef.current) {
        wsRef.current.close();
      }
      wsRef.current = null;
    };
  }, [ready]);

  return (
    <SocketContext.Provider value={wsRef.current}>
      {children}
    </SocketContext.Provider>
  );
}

export function useSocket(): WebSocket {
  const socket = useContext(SocketContext);
  if (!socket) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return socket;
}
