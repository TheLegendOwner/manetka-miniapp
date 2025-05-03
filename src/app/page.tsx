// src/app/page.tsx or src/pages/index.tsx
'use client';

import { useEffect, useState } from "react";
import {
  Wallet as WalletIcon,
  Ticket,
  Image as NftIcon,
  Users,
  Link2
} from "lucide-react";
import { TonConnect, isWalletInfoCurrentlyInjected, isWalletInfoRemote } from "@tonconnect/sdk";
import type { WalletInfo, WalletConnectionSource } from "@tonconnect/sdk";

// Initialize TonConnect once at module level to avoid recreations
const connector = new TonConnect({
  manifestUrl: "https://manetka-miniapp-rufp.vercel.app/tonconnect-manifest.json"
});

export default function Page() {
  const [screen, setScreen] = useState<
    "main" | "selectWallet" | "wallet" | "account" | "refs" | "social" | "lottery" | "nfts"
  >("main");
  const [isConnecting, setIsConnecting] = useState(false);
  const [userId, setUserId] = useState<number | null>(null);
  const [userName, setUserName] = useState<string | null>(null);
  const [userPhoto, setUserPhoto] = useState<string>("/default-avatar.png");
  const [walletData, setWalletData] = useState<{ balance: string; tokens: any[] } | null>(null);
  const [refsList, setRefsList] = useState<string[]>([]);
  const [walletAddresses, setWalletAddresses] = useState<string[]>([]);
  const [activeWallet, setActiveWallet] = useState<string | null>(null);
  const [walletList, setWalletList] = useState<WalletInfo[]>([]);

  useEffect(() => {
    if (typeof window === "undefined") return;

    // Telegram WebApp init
    const tg = window.Telegram?.WebApp;
    tg?.ready();
    tg?.expand();
    const tgUser = tg?.initDataUnsafe?.user;
    setUserId(tgUser?.id ?? null);
    setUserName(tgUser?.first_name ?? null);
    setUserPhoto(tgUser?.photo_url ?? "/default-avatar.png");

    // Validate initData on server
    fetch("/api/validate-initdata", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ initData: tg?.initData })
    }).catch(console.error);

    // TonConnect setup
    connector.restoreConnection();
    connector.onStatusChange((wallet) => {
      const addr = wallet?.account?.address;
      if (addr) {
        setActiveWallet(addr);
        setWalletAddresses((prev) => (prev.includes(addr) ? prev : [...prev, addr]));
        if (screen === "selectWallet") setScreen("wallet");
      }
    });
    connector.getWallets().then((list) => setWalletList(list));
  }, []);

  // Fetch mock balance
  useEffect(() => {
    if (activeWallet && !walletData) {
      setTimeout(() => {
        setWalletData({ balance: "123.45 TON", tokens: [] });
      }, 1000);
    }
  }, [activeWallet]);

  // Fetch mock referrals
  useEffect(() => {
    if (userId && refsList.length === 0) {
      // Example: fetch `/api/referral/stats?telegramId=${userId}`
      setRefsList(["REF123", "REF456"]);
    }
  }, [userId]);

  const connectWith = async (w: WalletInfo) => {
    setIsConnecting(true);
    try {
      let source: WalletConnectionSource;
      if (isWalletInfoCurrentlyInjected(w)) {
        source = { jsBridgeKey: w.jsBridgeKey };
      } else if (isWalletInfoRemote(w)) {
        source = { universalLink: w.universalLink!, bridgeUrl: w.bridgeUrl! };
      } else {
        console.warn("Unsupported wallet type", w);
        setIsConnecting(false);
        return;
      }
      if (connector.connected) await connector.disconnect();
      await connector.connect(source);
    } catch (e) {
      console.error(e);
    } finally {
      setIsConnecting(false);
    }
  };

  const formatTonAddress = (addr: string) =>
    addr.startsWith("EQ") || addr.startsWith("UQ")
      ? `${addr.slice(0, 5)}...${addr.slice(-4)}`
      : addr;

  const Wrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <div className="max-w-[390px] w-full mx-auto min-h-screen bg-[#f9f9f9] flex flex-col">
      {children}
    </div>
  );

  const NavButton: React.FC<{ icon: React.ReactNode; label: string; value: string }> = ({ icon, label, value }) => (
    <button
      onClick={() => setScreen(value as any)}
      className={`flex flex-col items-center flex-1 ${screen === value ? "text-blue-600" : "text-gray-400"}`}>
      <div className="w-6 h-6 mb-1">{icon}</div>
      <span className="text-[10px] font-medium leading-none">{label}</span>
    </button>
  );

  const renderScreen = () => {
    switch (screen) {
      case "main":
        return (
          <Wrapper>
            <div className="p-6 bg-white min-h-screen flex flex-col items-center justify-center text-center gap-6">
              <img src="/logo.png" alt="Logo" className="w-24 h-24" />
              <div>
                <h1 className="text-2xl font-aboreto text-gray-900 mb-2">MANETKA WALLET</h1>
                <p className="text-sm text-gray-600 font-abeezee">
                  All reward tokens in one place with MANETKA WALLET
                </p>
              </div>
              <button
                disabled={isConnecting}
                onClick={() => setScreen("selectWallet")}
                className="bg-[#EBB923] hover:bg-yellow-400 disabled:opacity-50 text-gray-900 font-semibold text-sm px-6 py-2 rounded-full shadow">
                {isConnecting ? "Connecting…" : "Connect your TON wallet"}
              </button>
            </div>
          </Wrapper>
        );
      case "selectWallet":
        return (
          <Wrapper>
            <div className="p-6 bg-white min-h-screen">
              <h2 className="text-xl font-aboreto text-gray-900 mb-4">Select TON Wallet</h2>
              <ul className="space-y-2">
                {walletList.map((w) => (
                  <li key={w.name}>
                    <button
                      onClick={() => connectWith(w)}
                      className="flex items-center px-4 py-2 border rounded-2xl shadow hover:bg-gray-100 w-full">
                      <img src={w.imageUrl} alt={w.name} className="w-6 h-6 mr-2" />
                      {w.name}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </Wrapper>
        );
      case "wallet":
        return (
          <Wrapper>
            <div className="p-6 bg-white min-h-screen">
              <h2 className="text-xl font-aboreto text-gray-900 mb-4">Wallet</h2>
              <p>Address: {activeWallet ? formatTonAddress(activeWallet) : "-"}</p>
              <p>Balance: {walletData?.balance ?? "-"}</p>
            </div>
          </Wrapper>
        );
      case "account":
        return (
          <Wrapper>
            <div className="p-6 bg-white min-h-screen">
              <h2 className="text-xl font-aboreto text-gray-900 mb-4">Account</h2>
              <img src={userPhoto} alt="Photo" className="w-16 h-16 rounded-full mb-2" />
              <p>Name: {userName ?? "-"}</p>
              <p>ID: {userId ?? "-"}</p>
            </div>
          </Wrapper>
        );
      case "refs":
        return (
          <Wrapper>
            <div className="p-6 bg-white min-h-screen">
              <h2 className="text-xl font-aboreto text-gray-900 mb-4">Referrals</h2>
              <ul className="list-disc list-inside">
                {refsList.map((ref, i) => (
                  <li key={i}>{ref}</li>
                ))}
              </ul>
            </div>
          </Wrapper>
        );
      case "social":
        return (
          <Wrapper>
            <div className="p-6 bg-white min-h-screen">
              <h2 className="text-xl font-aboreto text-gray-900 mb-4">Social Feed</h2>
              <p>Here will be posts from community.</p>
            </div>
          </Wrapper>
        );
      case "lottery":
        return (
          <Wrapper>
            <div className="p-6 bg-white min-h-screen">
              <h2 className="text-xl font-aboreto text-gray-900 mb-4">Lottery</h2>
              <p>Lottery tickets and results go here.</p>
            </div>
          </Wrapper>
        );
      case "nfts":
        return (
          <Wrapper>
            <div className="p-6 bg-white min-h-screen">
              <h2 className="text-xl font-aboreto text-gray-900 mb-4">NFTs</h2>
              <p>Your NFT collection will be displayed here.</p>
            </div>
          </Wrapper>
        );
      default:
        return (
          <Wrapper>
            <p className="p-4 text-center">Page not found</p>
          </Wrapper>
        );
    }
  };

  return (
    <div className="bg-[#f9f9f9] min-h-screen flex justify-center">
      <div className="w-full max-w-[390px] flex flex-col pb-16">
        {renderScreen()}
        {screen !== "main" && (
          <div className="w-full border-t bg-white shadow-inner flex justify-around py-3 fixed bottom-0 max-w-[390px] mx-auto">
            <NavButton icon={<WalletIcon size={20} />} label="Wallet" value="wallet" />
            <NavButton icon={<Ticket size={20} />} label="Lottery" value="lottery" />
            <NavButton icon={<NftIcon size={20} />} label="NFTs" value="nfts" />
            <NavButton icon={<Users size={20} />} label="Social" value="social" />
            <NavButton icon={<Link2 size={20} />} label="Refs" value="refs" />
          </div>
        )}
      </div>
    </div>
  );
}
