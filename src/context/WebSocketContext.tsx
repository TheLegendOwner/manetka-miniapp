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
  authSent: boolean;
  sendAuth: () => void;
}

const SocketContext = createContext<SocketContextValue>({
  socket: null,
  connected: false,
  authSent: false,
  sendAuth: () => {},
});

export function SocketProvider({ children }: { children: ReactNode }) {
  const { ready } = useTelegram();
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectRef = useRef<number | null>(null);
  const [connected, setConnected] = useState(false);
  const [authSent, setAuthSent] = useState(false);

  const sendAuth = () => {
    const socket = wsRef.current;
    if (!socket || socket.readyState !== WebSocket.OPEN) return;
    const tg = (window as any).Telegram?.WebApp;
    const initData = tg?.initData;
    socket.send(JSON.stringify({ type: 'auth', initData }));
    console.log('WS: auth sent');
    setAuthSent(true);
  };

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
      setAuthSent(false);

      socket.onopen = () => {
        console.log('WS: connected');
        setConnected(true);
        if (ready) {
          sendAuth();
        }
      };

      socket.onmessage = (event) => {
        console.log('WS: message received', event.data);
      };

      socket.onclose = (e) => {
        console.warn('WS: closed', e.code, e.reason);
        setConnected(false);
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
      setAuthSent(false);
    };
  }, [ready]);

  useEffect(() => {
    const socket = wsRef.current;
    if (
      ready &&
      socket &&
      socket.readyState === WebSocket.OPEN &&
      !authSent
    ) {
      sendAuth();
    }
  }, [ready, authSent]);

  return (
    <SocketContext.Provider
      value={{ socket: wsRef.current, connected, authSent, sendAuth }}
    >
      {children}
    </SocketContext.Provider>
  );
}

export function useSocket(): SocketContextValue {
  return useContext(SocketContext);
}
