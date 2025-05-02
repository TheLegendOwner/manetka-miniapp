"use client";
import { useEffect, useRef, useState } from "react";
import {
  Wallet as WalletIcon,
  Ticket,
  Image as NftIcon,
  Users,
  Link2,
  ChevronLeft
} from "lucide-react";
import { TonConnect } from "@tonconnect/sdk";

export default function App() {
  const [screen, setScreen] = useState("main");
  const [isConnecting, setIsConnecting] = useState(false);
  const [userId, setUserId] = useState(null);
  const [userName, setUserName] = useState(null);
  const [userPhoto, setUserPhoto] = useState(null);
  const [walletData, setWalletData] = useState(null);
  const [refs, setRefs] = useState([]);
  const [walletAddresses, setWalletAddresses] = useState<string[]>([]);
  const [activeWallet, setActiveWallet] = useState<string | null>(null);
  const [loadingTokens, setLoadingTokens] = useState(false);
  const connectorRef = useRef<TonConnect | null>(null);

  useEffect(() => {
    const validateTelegramInitData = async () => {
      const tg = window.Telegram?.WebApp;
      const initData = tg?.initDataUnsafe?.user ? "valid" : "";

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
        const connector = new TonConnect({
          manifestUrl: "https://manetka-miniapp-rufp.vercel.app/tonconnect-manifest.json"
        });
        connector.restoreConnection();
        connector.onStatusChange(wallet => {
          const address = wallet?.account?.address;
          if (address && !walletAddresses.includes(address)) {
            setWalletAddresses(prev => [...prev, address]);
            setActiveWallet(address);
          }
        });
        connectorRef.current = connector;
      }
    }
  }, []);

  useEffect(() => {
    if (walletAddresses.length > 0 && screen === "main") {
      setScreen("wallet");
    }

    if (walletAddresses.length > 0 && !walletData) {
      setLoadingTokens(true);
      setTimeout(() => {
        setWalletData({
          balance: "123.45 TON",
          tokens: [
            {
              id: 1,
              name: "$MNTK",
              balance: "1000",
              usdValue: "$150.00",
              rewards: "12.3 TON",
              logo: "/mntk-logo.png",
              buyUrl: "https://buy.manetka.io",
              sellUrl: "https://sell.manetka.io"
            },
            {
              id: 2,
              name: "$REWARD",
              balance: "500",
              usdValue: "$50.00",
              rewards: "5 TON",
              logo: "/reward-logo.png",
              buyUrl: "https://buy.reward.io",
              sellUrl: "https://sell.reward.io"
            }
          ]
        });
        setLoadingTokens(false);
      }, 1000);
    }
  }, [walletAddresses, screen, walletData]);

  const connectWallet = async () => {
    try {
      await connectorRef.current?.connect({
        universalLink: "https://app.tonkeeper.com/ton-connect",
        bridgeUrl: "https://bridge.tonapi.io/bridge"
      });
    } catch (err) {
      console.error("Connect another wallet failed:", err);
    }
  };

  const formatTonAddress = (addr: string) => {
    if (!addr) return "";
    return addr.startsWith("EQ") || addr.startsWith("UQ") ? `${addr.slice(0, 5)}...${addr.slice(-4)}` : addr;
  };

  const handleWalletSwitch = (addr: string) => {
    setActiveWallet(addr);
  };

  const renderWalletList = () => (
    <div className="flex flex-col gap-2 mt-4">
      {walletAddresses.map(addr => (
        <button
          key={addr}
          onClick={() => handleWalletSwitch(addr)}
          className={`px-4 py-2 rounded-xl text-sm font-mono border text-left transition-all duration-200 ${
            activeWallet === addr
              ? "bg-black text-white border-black"
              : "bg-white text-gray-800 border-gray-300 hover:bg-gray-50"
          }`}
        >
          {formatTonAddress(addr)} {activeWallet === addr && <span className="ml-2 text-xs">(active)</span>}
        </button>
      ))}
    </div>
  );

  const Wrapper = ({ children }: { children: React.ReactNode }) => (
    <div className="max-w-[390px] w-full mx-auto min-h-screen bg-[#f9f9f9] flex flex-col">
      {children}
      <div id="tonconnect-root" className="hidden" />
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
                    await connectorRef.current.connect({
  universalLink: "https://app.tonkeeper.com/ton-connect",
  bridgeUrl: "https://bridge.tonapi.io/bridge"
});

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
          <div className="p-6 bg-white min-h-screen">
            <div className="flex items-center justify-between mb-6">
              <button onClick={connectWallet} className="text-gray-700">
                <ChevronLeft className="w-5 h-5" />
              </button>
              <h2 className="text-base font-aboreto text-gray-900">ACCOUNT</h2>
              <div className="flex items-center gap-2">
                <span className="text-xs font-abeezee">EN</span>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" value="" className="sr-only peer" checked readOnly />
                  <div className="w-9 h-5 bg-gray-200 rounded-full peer peer-checked:after:translate-x-4 after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:border after:rounded-full after:h-4 after:w-4 after:transition-all"></div>
                </label>
                <span className="text-xs font-abeezee text-gray-400">RU</span>
              </div>
            </div>

            <div className="flex items-center gap-4 mb-6">
              <img src={userPhoto || "/default-avatar.png"} alt="User Avatar" className="w-16 h-16 rounded-full border border-gray-300" />
              <div>
                <h2 className="text-xl font-bold text-gray-800">{userName}</h2>
                <p className="text-sm text-gray-500 font-mono">ID: {userId}</p>
              </div>
            </div>

            <div className="mt-6">
              <div className="text-sm font-semibold text-gray-600 mb-2">Connected TON wallets:</div>
              {walletAddresses.map((addr, i) => (
                <div key={i} className="mt-2 flex items-center justify-between border border-gray-200 rounded-xl px-4 py-3 shadow-sm transition hover:shadow-md">
                  <span className="text-sm font-mono text-gray-800 break-all">{formatTonAddress(addr)}</span>
                  <button
                    onClick={async () => {
                      const confirmed = window.confirm("Disconnect this wallet?");
                      if (confirmed && connectorRef.current) {
                        await connectorRef.current.disconnect();
                        setWalletAddresses(walletAddresses.filter(a => a !== addr));
                      }
                    }}
                    className="text-white text-xs bg-black px-4 py-1.5 rounded-full hover:bg-gray-800 transition"
                  >
                    Disconnect
                  </button>
                </div>
              ))}
              <button
                onClick={async () => {
                  try {
                    await connectorRef.current?.connect({
  universalLink: "https://app.tonkeeper.com/ton-connect",
  bridgeUrl: "https://bridge.tonapi.io/bridge"
});
                  } catch (err) {
                    console.error("Connect another wallet failed:", err);
                  }
                }}
                className="mt-6 w-full bg-[#EBB923] hover:bg-yellow-400 text-gray-900 text-sm font-medium px-4 py-2 rounded-full shadow text-center transition"
              >
                Connect one more TON wallet
              </button>
            </div>
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
