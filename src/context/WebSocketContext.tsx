'use client';

import React, { createContext, useContext, useEffect, useRef, ReactNode } from 'react';
import { Client, Message } from '@stomp/stompjs';
import { useTelegram } from './TelegramContext';

// URL Spring WebSocket endpoint (STOMP) e.g. wss://your-domain/ws
const WS_URL = process.env.NEXT_PUBLIC_WS_URL as string;

// Контекст для STOMP-клиента
const SocketContext = createContext<Client | null>(null);

export function SocketProvider({ children }: { children: ReactNode }) {
  const { ready } = useTelegram();
  const clientRef = useRef<Client | null>(null);

  useEffect(() => {
    console.log('STOMP WebSocketContext: initializing, WS_URL=', WS_URL);

    const client = new Client({
      brokerURL: WS_URL,
      connectHeaders: {},
      debug: str => console.log('STOMP:', str),
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
    });

    client.onConnect = frame => {
      console.log('STOMP connected:', frame);
      // Авто-авторизация после коннекта
      const tg = (window as any).Telegram?.WebApp;
      const initData = tg?.initData;
      if (initData) {
        client.publish({
          destination: '/app/auth',
          body: JSON.stringify({ type: 'auth', initData }),
        });
        console.log('Sent auth via STOMP');
      }
    };

    client.onStompError = frame => {
      console.error('STOMP error:', frame.headers['message'], frame.body);
    };

    client.activate();
    clientRef.current = client;

    return () => {
      client.deactivate();
      clientRef.current = null;
    };
  }, [ready]);

  return <SocketContext.Provider value={clientRef.current}>{children}</SocketContext.Provider>;
}

export function useSocket(): Client {
  const client = useContext(SocketContext);
  if (!client) {
    throw new Error('useSocket must be used within SocketProvider');
  }
  return client;
}
