// src/context/WebSocketContext.tsx
'use client';

import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  ReactNode,
} from 'react';
import { useTelegram } from './TelegramContext';

const WS_URL = process.env.NEXT_PUBLIC_WS_URL as string;

interface SocketContextValue {
  socket: WebSocket | null;
  connected: boolean;
}

const SocketContext = createContext<SocketContextValue>({ socket: null, connected: false });

export function SocketProvider({ children }: { children: ReactNode }) {
  const { ready } = useTelegram();
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectRef = useRef<number | null>(null);
  const [connected, setConnected] = useState(false);
  // Флаг: «успешно отправили auth»
  const authSentRef = useRef(false);

  useEffect(() => {
    if (!WS_URL) {
      console.error('WebSocket URL not defined');
      return;
    }

    let socket: WebSocket;

    const connect = () => {
      console.log('WS: connecting to', WS_URL);
      socket = new WebSocket(WS_URL);
      wsRef.current = socket;
      authSentRef.current = false; // сбрасываем, чтобы повторно попытаться прислать auth

      socket.onopen = () => {
        console.log('WS: connected');
        setConnected(true);

        // Если сразу готовы, отправляем auth;
        // иначе — ждём, пока ready станет true (см. ниже дополнительный useEffect)
        if (ready) {
          sendAuth();
        }
      };

      socket.onmessage = (event) => {
        console.log('WS: message received', event.data);
        // Здесь можно парсить JSON в application code
      };

      socket.onclose = (e) => {
        console.warn('WS: closed', e.code, e.reason);
        setConnected(false);
        // Через 5 секунд переподключаемся
        reconnectRef.current = window.setTimeout(connect, 5000);
      };

      socket.onerror = (err) => {
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
      setConnected(false);
      authSentRef.current = false;
    };
  }, []); // запускаем только один раз при маунте

  // Если ready переходит в true и сокет уже открыт, но мы ещё не отправили auth — отправляем
  useEffect(() => {
    const socket = wsRef.current;
    if (ready && socket && socket.readyState === WebSocket.OPEN && !authSentRef.current) {
      sendAuth();
    }

    function sendAuth() {
      if (!socket) return;
      const tg = (window as any).Telegram?.WebApp;
      const initData = tg?.initData;
      const msg = { type: 'auth', initData };
      socket.send(JSON.stringify(msg));
      console.log('WS: auth sent', msg);
      authSentRef.current = true;
    }
  }, [ready]);

  return (
    <SocketContext.Provider value={{ socket: wsRef.current, connected }}>
      {children}
    </SocketContext.Provider>
  );
}

export function useSocket(): SocketContextValue {
  return useContext(SocketContext);
}
