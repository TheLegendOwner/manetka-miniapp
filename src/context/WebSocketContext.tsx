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
  const authSentRef = useRef(false);

  // Функция для отправки { type: 'auth' }
  function sendAuth() {
    const socket = wsRef.current;
    if (!socket || socket.readyState !== WebSocket.OPEN) return;
    const tg = (window as any).Telegram?.WebApp;
    const initData = tg?.initData;
    const msg = { type: 'auth', initData };
    socket.send(JSON.stringify(msg));
    console.log('WS: auth sent', msg);
    authSentRef.current = true;
  }

  // 1) Подключаемся сразу при маунте, не ждём ready
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
      authSentRef.current = false;

      socket.onopen = () => {
        console.log('WS: connected');
        setConnected(true);
        // Если Telegram уже готов, отправляем auth сразу
        if (ready && !authSentRef.current) {
          sendAuth();
        }
      };

      socket.onmessage = (event) => {
        console.log('WS: message received', event.data);
      };

      socket.onclose = (e) => {
        console.warn('WS: closed', e.code, e.reason);
        setConnected(false);
        // Переподключаемся через 5 сек
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
    };
  }, []); // пустой массив зависимостей → только один раз

  // 2) Когда TelegramContext.ready становится true, проверяем:
  //    если сокет открыт и auth ещё не отправлен, то отправляем auth
  useEffect(() => {
    const socket = wsRef.current;
    if (ready && socket && socket.readyState === WebSocket.OPEN && !authSentRef.current) {
      sendAuth();
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
