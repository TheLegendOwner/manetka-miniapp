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

export default function App() {
  const [screen, setScreen] = useState("main");
  const [isConnecting, setIsConnecting] = useState(false);
  const [userId, setUserId] = useState(null);
  const [userName, setUserName] = useState(null);
  const [userPhoto, setUserPhoto] = useState(null);
  const [walletData, setWalletData] = useState(null);
  const [refs, setRefs] = useState([]);
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const connectorRef = useRef<TonConnectUI | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const tg = window.Telegram?.WebApp;
      tg?.ready();
      tg?.expand();
      const tgUser = tg?.initDataUnsafe?.user;
      const tgUserId = tgUser?.id || 404231632;
      setUserId(tgUserId);
      setUserName(tgUser?.first_name || "User");
      setUserPhoto(tgUser?.photo_url || null);

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
      setWalletData({
        balance: "123.45 TON",
        tokens: [
          {
            id: 1,
            name: "$MNTK",
            balance: "1000",
            buyUrl: "https://buy.manetka.io",
            sellUrl: "https://sell.manetka.io"
          },
          {
            id: 2,
            name: "$REWARD",
            balance: "500",
            buyUrl: "https://buy.reward.io",
            sellUrl: "https://sell.reward.io"
          }
        ]
      });
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
          <div className="p-8 flex flex-col items-center justify-center text-center h-full gap-6">
            <img src="/logo.png" alt="MANETKA Logo" className="w-181 h-185 mb-4" />
            <div>
              <h1 className="text-3xl text-gray-900 mb-2 leading-tight font-aboreto">MANETKA WALLET</h1>
              <p className="text-gray-500 text-base font-abeezee max-w-xs">
                All reward tokens in one place with MANETKA WALLET
              </p>
            </div>
            <button
              onClick={async () => {
                setIsConnecting(true);
                try {
                  if (connectorRef.current) {
                    await connectorRef.current.connectWallet();
                  }
                  setScreen("wallet");
                } catch (err) {
                  console.error("Wallet connection failed", err);
                } finally {
                  setIsConnecting(false);
                }
              }}
              className="bg-[#EBB923] hover:bg-yellow-400 text-gray-900 text-lg px-8 py-3 rounded-full shadow-lg flex items-center justify-center gap-2 w-full max-w-xs"
            >
              {isConnecting ? "Connecting..." : "Connect your TON wallet"}
              {isConnecting && (
                <svg className="animate-spin ml-2 h-5 w-5 text-white inline-block" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                </svg>
              )}
            </button>
            {walletAddress && (
              <p className="text-xs text-gray-400 mt-2">Connected: {walletAddress}</p>
            )}
            <div id="tonconnect-root" className="mt-4" />
          </div>
        </Wrapper>
      );
    }

    if (screen === "wallet") {
      return (
        <Wrapper>
          <div className="p-6 bg-white min-h-screen">
            <h2 className="text-[22px] font-aboreto text-gray-900 mb-5 text-center">Wallet</h2>
            <div className="mb-6 text-center">
              <p className="text-sm text-gray-500 font-abeezee mb-1">Your balance</p>
              <div className="text-[28px] font-bold text-gray-900 flex items-center justify-center gap-2">
                <img src="/ton-icon.svg" alt="TON" className="w-6 h-6" />
                {walletData?.balance ?? "..."}
              </div>
            </div>
            <button
              className="text-blue-600 text-sm underline mb-4 mx-auto block"
              onClick={() => setScreen("account")}
            >
              Account
            </button>
            <div className="grid gap-3">
              {walletData?.tokens?.map(token => (
                <div key={token.id} className="bg-white rounded-2xl px-4 py-3 shadow border border-gray-200 flex items-center justify-between">
                  <div>
                    <div className="text-lg font-semibold text-gray-800 font-aboreto">{token.name}</div>
                    <div className="text-sm text-gray-500 font-abeezee">{token.balance}</div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      className="bg-[#EBB923] hover:bg-yellow-400 text-gray-900 font-semibold text-sm px-4 py-1.5 rounded-full"
                      onClick={() => window.open(token.buyUrl, "_blank")}
                    >
                      Buy
                    </button>
                    <button
                      className="bg-gray-100 hover:bg-gray-200 text-gray-800 font-semibold text-sm px-4 py-1.5 rounded-full"
                      onClick={() => window.open(token.sellUrl, "_blank")}
                    >
                      Sell
                    </button>
                  </div>
                </div>
              ))}
            </div>
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