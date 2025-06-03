// src/pages/index.tsx
'use client';

import dynamic from 'next/dynamic';
import { useEffect, useState, useCallback } from 'react';
import { useTonConnectUI, useTonWallet } from '@tonconnect/ui-react';
import { useRouter } from 'next/router';
import { useSocket } from '../context/WebSocketContext';
import { useTelegram } from '../context/TelegramContext';

function MainPage() {
  const tonConnectUI = useTonConnectUI()[0];
  const wallet = useTonWallet();
  const router = useRouter();
  const { socket, connected } = useSocket();
  const { ready } = useTelegram();

  const [isRequestingProof, setIsRequestingProof] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [delayedCheck, setDelayedCheck] = useState(false);

  // 1) Редирект, если кошелёк подключён
  useEffect(() => {
    if ((wallet as any)?.account?.address) {
      router.replace('/wallet');
    } else if (!wallet) {
      const timer = setTimeout(() => setDelayedCheck(true), 500);
      return () => clearTimeout(timer);
    }
  }, [wallet, router]);

  // 2) Обработка входящих по WebSocket сообщений
  useEffect(() => {
    if (!socket) return;

    const onMessage = (event: MessageEvent) => {
      let data;
      try {
        data = JSON.parse(event.data);
      } catch {
        return;
      }

      // Сервер прислал ответ с кодом ошибки
      if (data.code === 1 && data.error?.includes('Unauthorized')) {
        // Сначала отправляем auth заново
        const tg = (window as any).Telegram?.WebApp;
        const initData = tg?.initData;
        socket.send(JSON.stringify({ type: 'auth', initData }));
        console.log('WS: re-sent auth');
        // Затем повторяем get_ton_proof
        socket.send(JSON.stringify({ type: 'get_ton_proof' }));
        console.log('WS: retried get_ton_proof');
        return;
      }

      // Сервер прислал готовый challenge
      if (data.type === 'ton_proof' && data.value) {
        tonConnectUI.setConnectRequestParameters({
          state: 'ready',
          value: { tonProof: data.value },
        });
        tonConnectUI.openModal();
        setIsRequestingProof(false);
      }

      // Сервер вернул ошибку при выдаче proof
      if (data.type === 'error_proof') {
        setError(data.message || 'Ошибка получения tonProof');
        tonConnectUI.setConnectRequestParameters(null);
        setIsRequestingProof(false);
      }
    };

    socket.addEventListener('message', onMessage);
    return () => {
      socket.removeEventListener('message', onMessage);
    };
  }, [socket, tonConnectUI]);

  // 3) Как только получен подписанный proof, отправляем verify
  useEffect(() => {
    if (!wallet || !socket) return;

    const tonProof = (wallet as any).tonProof;
    const account = {
      address: (wallet as any)?.account?.address || '',
      public_key: (wallet as any)?.account?.publicKey || '',
      chain: (wallet as any)?.account?.chain || 0,
      wallet_state_init: (wallet as any)?.account?.walletStateInit || '',
    };

    if (
      !tonProof ||
      !account.address ||
      !account.public_key ||
      !account.wallet_state_init
    ) {
      return;
    }

    const payloadToServer = {
      type: 'verify',
      proof: {
        timestamp: tonProof.timestamp,
        domain: {
          length_bytes: tonProof.domain.lengthBytes,
          value: tonProof.domain.value,
        },
        signature: tonProof.signature,
        payload: tonProof.payload,
      },
      account,
    };

    socket.send(JSON.stringify(payloadToServer));
  }, [wallet, socket]);

  // 4) По клику «Connect your TON Wallet» — отправляем get_ton_proof,
  //    но только если есть соединение и Telegram уже готов (auth отправлен)
  const handleConnectClick = useCallback(() => {
    if (!connected || !socket || !ready) {
      setError('Нет соединения с сервером или Telegram не готов');
      return;
    }
    setError(null);
    setIsRequestingProof(true);

    tonConnectUI.setConnectRequestParameters({ state: 'loading' });
    socket.send(JSON.stringify({ type: 'get_ton_proof' }));
  }, [connected, socket, tonConnectUI, ready]);

  return (
    <div className="flex flex-col justify-center items-center min-h-screen bg-white px-6 relative">
      <div className="flex flex-col items-center">
        <img src="/logo.png" alt="Manetka Logo" className="w-32 h-32 mb-6" />
        <h1 className="text-[22px] font-bold text-gray-900 mb-2 text-center">
          MANETKA WALLET
        </h1>
        <p className="text-sm text-gray-600 text-center max-w-[320px] leading-snug">
          All reward tokens in one place with MANETKA WALLET
        </p>
      </div>

      {!((wallet as any)?.account?.address) && delayedCheck && (
        <div className="absolute bottom-[clamp(50px,20%,120px)] w-full flex justify-center">
          <button
            onClick={handleConnectClick}
            disabled={isRequestingProof}
            className={`w-[350px] h-[52px] ${
              isRequestingProof ? 'bg-gray-300' : 'bg-[#EBB923] hover:bg-[#e2aa14]'
            } text-gray-900 font-semibold text-base rounded-full shadow-md transition-colors duration-200`}
          >
            {isRequestingProof ? 'Подготовка...' : 'Connect your TON Wallet'}
          </button>
        </div>
      )}

      {error && <p className="mt-4 text-red-500 text-sm">{error}</p>}
    </div>
  );
}

export default dynamic(() => Promise.resolve(MainPage), { ssr: false });
