// src/lib/ton.ts
// Хук для работы с TonConnect SDK (несколько кошельков)
import { useState, useEffect, useRef } from 'react';
import { TonConnect, type WalletInfo, type WalletConnectionSource, type Wallet } from '@tonconnect/sdk';
import { isWalletInfoCurrentlyInjected, isWalletInfoRemote } from '@tonconnect/sdk';

export function useTon() {
  const [wallets, setWallets] = useState<WalletInfo[]>([]);
  const [walletInfo, setWalletInfo] = useState<Wallet | null>(null);
  const connectorRef = useRef<TonConnect | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    if (!connectorRef.current) {
      connectorRef.current = new TonConnect({
        manifestUrl: "https://manetka-miniapp-rufp.vercel.app/tonconnect-manifest.json"
      });
    }
    const connector = connectorRef.current;

    connector.restoreConnection();
    const unsub = connector.onStatusChange((w: Wallet | null) => {
      setWalletInfo(w);
    });
    connector.getWallets().then(setWallets);

    return () => {
      unsub();
    };
  }, []);

  const connect = async (w: WalletInfo) => {
    if (!connectorRef.current) return;
    let source: WalletConnectionSource;
    if (isWalletInfoCurrentlyInjected(w)) {
      source = { jsBridgeKey: w.jsBridgeKey! };
    } else if (isWalletInfoRemote(w)) {
      source = { universalLink: w.universalLink!, bridgeUrl: w.bridgeUrl! };
    } else {
      console.warn('Unsupported wallet type', w);
      return;
    }
    const connector = connectorRef.current;
    if (connector.connected) await connector.disconnect();
    await connector.connect(source);
  };

  const disconnect = () => {
    connectorRef.current?.disconnect();
  };

  return { wallets, walletInfo, connect, disconnect };
}
