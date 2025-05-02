"use client";
import { useEffect, useRef, useState } from "react";
import {
  Wallet as WalletIcon,
  Ticket,
  Image as NftIcon,
  Users,
  Link2
} from "lucide-react";
import { TonConnectUI } from "@tonconnect/ui";

// Telegram WebApp typings
declare global {
  interface TelegramWebAppUser {
    id: number;
    first_name?: string;
    photo_url?: string;
  }

  interface TelegramWebApp {
    ready: () => void;
    expand: () => void;
    close?: () => void;
    initData: string;
    initDataUnsafe?: {
      user?: TelegramWebAppUser;
    };
  }

  interface TelegramWindow extends Window {
    Telegram?: {
      WebApp?: TelegramWebApp;
    };
  }
}

export {};

export default function App() {
  const [screen, setScreen] = useState("main");
  const [isConnecting, setIsConnecting] = useState(false);
  const [userId, setUserId] = useState(null);
  const [userName, setUserName] = useState(null);
  const [userPhoto, setUserPhoto] = useState(null);
  const [walletData, setWalletData] = useState(null);
  const [refs, setRefs] = useState([]);
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [loadingTokens, setLoadingTokens] = useState(false);
  const connectorRef = useRef<TonConnectUI | null>(null);

  useEffect(() => {
    const validateTelegramInitData = async () => {
      const tg = window.Telegram?.WebApp;
      const initData = tg?.initData ?? "";

      try {
        const res = await fetch("/api/validate-initdata", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ initData })
        });
        const data = await res.json();
        if (!data.ok) {
          alert("Telegram validation failed");
        }
      } catch (err) {
        console.error("Telegram initData validation failed:", err);
      }
    };

    if (typeof window !== "undefined") {
      const tg = window.Telegram?.WebApp;
      tg?.ready();
      tg?.expand();
      const tgUser = tg?.initDataUnsafe?.user;
      const tgUserId = tgUser?.id || 404231632;
      setUserId(tgUserId);
      setUserName(tgUser?.first_name || "User");
      setUserPhoto(tgUser?.photo_url || "/default-avatar.png");

      validateTelegramInitData();

      if (!connectorRef.current) {
        const c = new TonConnectUI({
          manifestUrl: "https://manetka-miniapp-rufp.vercel.app/tonconnect-manifest.json",
          buttonRootId: "tonconnect-root"
        });
        c.onStatusChange(wallet => {
          setWalletAddress(wallet?.account?.address ?? null);
        });
        connectorRef.current = c;
      }
    }
  }, []);

  useEffect(() => {
    if (walletAddress && screen === "main") {
      setScreen("wallet");
    }
  }, [walletAddress, screen]);

  useEffect(() => {
    if (userId && screen === "wallet") {
      setLoadingTokens(true);
      setTimeout(() => {
        setWalletData({
          balance: "123.45 TON",
          tokens: [
            {
              id: 1,
              name: "$MNTK",
              logo: "/mntk-logo.png",
              balance: "1,000 $MNTK",
              usdValue: "$250",
              rewards: "5.25 TON",
              buyUrl: "https://buy.manetka.io",
              sellUrl: "https://sell.manetka.io"
            },
            {
              id: 2,
              name: "$REWARD",
              logo: "/reward-logo.png",
              balance: "500 $REWARD",
              usdValue: "$100",
              rewards: "2.10 TON",
              buyUrl: "https://buy.reward.io",
              sellUrl: "https://sell.reward.io"
            }
          ]
        });
        setLoadingTokens(false);
      }, 1000);
    }
    if (userId && screen === "refs") {
      setRefs([
        { id: 1, username: "@ref_user1" },
        { id: 2, username: "@ref_user2" }
      ]);
    }
  }, [userId, screen]);

  const Wrapper = ({ children }: { children: React.ReactNode }) => (
    <div className="max-w-[390px] w-full mx-auto min-h-screen bg-[#f9f9f9] flex flex-col">
      {children}
    </div>
  );

  const NavButton = ({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) => (
    <button
      onClick={() => setScreen(value)}
      className={`flex flex-col items-center flex-1 ${screen === value ? "text-blue-600" : "text-gray-400"}`}
    >
      <div className="w-6 h-6 mb-1">{icon}</div>
      <span className="text-[10px] font-medium leading-none">{label}</span>
    </button>
  );

  const renderScreen = () => {
if (screen === "main") {
  return (
    <Wrapper>
      <div className="p-6 bg-white min-h-screen text-center flex flex-col justify-center items-center gap-6">
        <img src="/logo.png" alt="Logo" className="w-24 h-24" />
        <div>
          <h1 className="text-2xl font-aboreto text-gray-900 mb-2">MANETKA WALLET</h1>
          <p className="text-sm text-gray-600 font-abeezee">All reward tokens in one place with MANETKA WALLET</p>
        </div>
        <button
          className="bg-[#EBB923] hover:bg-yellow-400 text-gray-900 font-semibold text-sm px-6 py-2 rounded-full shadow"
          onClick={async () => {
            try {
              if (connectorRef.current) {
                await connectorRef.current.connectWallet();
              }
            } catch (err) {
              console.error("Wallet connect failed", err);
            }
          }}
        >
          Connect your TON wallet
        </button>
      </div>
    </Wrapper>
  );
}

    
    if (screen === "wallet") {
      return (
        <Wrapper>
          <div className="p-6 bg-white min-h-screen">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-[18px] font-aboreto text-gray-900">TOKEN ASSETS</h2>
              <div className="flex items-center gap-3">
              {walletData ? (
  <span className="text-xs font-abeezee text-gray-500">Balance: {walletData.balance}</span>
) : (
  <div className="w-20 h-4 bg-gray-100 rounded animate-pulse" />
)}

                <img
                  src={userPhoto || "/default-avatar.png"}
                  alt="User Avatar"
                  className="w-8 h-8 rounded-full border border-gray-300 cursor-pointer"
                  onClick={() => setScreen("account")}
                />
              </div>
            </div>
            {loadingTokens ? (
              <div className="flex flex-col gap-4 animate-pulse">
                {[1, 2].map(i => (
                  <div key={i} className="bg-gray-100 rounded-2xl h-24" />
                ))}
              </div>
            ) : (
              <div className="grid gap-4">
                {walletData && walletData.tokens.map(token => (
                  <div
                    key={token.id}
                    className="bg-white rounded-2xl p-4 shadow-md border border-gray-200 flex items-center justify-between transition-all hover:shadow-lg"
                  >
                    <div className="flex items-center gap-3">
                      <img src={token.logo} alt={token.name} className="w-10 h-10 rounded-full" />
                      <div className="flex flex-col">
                        <span className="text-sm font-semibold text-gray-900 font-aboreto">{token.name}</span>
                        <span className="text-xs text-gray-500 font-abeezee">Amount: {token.balance}</span>
                        <span className="text-xs text-gray-400 font-abeezee">USD: {token.usdValue}</span>
                        <span className="text-xs text-blue-500 font-abeezee">Rewards: {token.rewards}</span>
                      </div>
                    </div>
                    <div className="flex flex-col gap-2">
                      <button
                        className="bg-[#EBB923] hover:bg-yellow-400 text-gray-900 font-semibold text-xs px-4 py-1 rounded-full"
                        onClick={() => window.open(token.buyUrl, "_blank")}
                      >
                        Buy
                      </button>
                      <button
                        className="bg-gray-100 hover:bg-gray-200 text-gray-800 font-semibold text-xs px-4 py-1 rounded-full"
                        onClick={() => window.open(token.sellUrl, "_blank")}
                      >
                        Sell
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </Wrapper>
      );
    }

    if (screen === "account") {
      return (
        <Wrapper>
          <div className="p-6 bg-white min-h-screen space-y-4">
            <h2 className="text-xl font-bold text-gray-800">Account Info</h2>
            <p className="text-gray-600">User ID: {userId}</p>
            {walletAddress && <p className="text-gray-600 break-all">Wallet: {walletAddress}</p>}
            <button onClick={() => setScreen("wallet")} className="text-sm text-blue-600 underline">Back</button>
          </div>
        </Wrapper>
      );
    }

    if (screen === "refs") {
      return (
        <Wrapper>
          <div className="p-6 bg-white min-h-screen space-y-4">
            <h2 className="text-xl font-bold text-gray-800">Your Referrals</h2>
            <p className="text-sm text-gray-600">Share your referral link:</p>
            <input
              readOnly
              value={`https://t.me/yourbot?start=${userId}`}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
            />
            <ul className="space-y-2">
              {refs.map(ref => (
                <li key={ref.id} className="bg-gray-100 p-2 rounded-md text-sm">{ref.username}</li>
              ))}
            </ul>
          </div>
        </Wrapper>
      );
    }

    if (screen === "social") {
      return (
        <Wrapper>
          <div className="p-6 bg-white min-h-screen space-y-4">
            <h2 className="text-xl font-bold text-gray-800">Follow us</h2>
            <div className="space-y-3">
              <a href="https://t.me/manetka" target="_blank" className="block text-blue-600 underline">Telegram</a>
              <a href="https://twitter.com/manetka" target="_blank" className="block text-blue-600 underline">Twitter</a>
            </div>
          </div>
        </Wrapper>
      );
    }

    if (screen === "lottery") {
      return (
        <Wrapper>
          <div className="p-6 bg-white min-h-screen text-center">
            <h2 className="text-xl font-bold text-gray-800 mb-2">Lottery</h2>
            <p className="text-gray-600">Coming soon...</p>
          </div>
        </Wrapper>
      );
    }

    if (screen === "nfts") {
      return (
        <Wrapper>
          <div className="p-6 bg-white min-h-screen text-center">
            <h2 className="text-xl font-bold text-gray-800 mb-2">NFTs</h2>
            <p className="text-gray-600">Coming soon...</p>
          </div>
        </Wrapper>
      );
    }

    return <Wrapper><p className="p-4">Page not found</p></Wrapper>;
  };

  return (
    <div className="bg-[#f9f9f9] min-h-screen flex justify-center">
      <div className="w-full max-w-[390px] flex flex-col pb-16">
        {renderScreen()}
        {screen !== "main" && (
          <div className="w-full border-t bg-white shadow-inner flex justify-around py-3 text-sm fixed bottom-0 max-w-[390px] mx-auto">
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
} // конец компонента App
