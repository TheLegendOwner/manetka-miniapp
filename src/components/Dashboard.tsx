import { useState } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Badge } from './ui/badge';
import { Skeleton } from './ui/skeleton';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { TrendingUp, DollarSign, Coins, Users, Share2, Zap, Wallet2, ChevronRight, HelpCircle, Trash2, Star, Plus } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { useNFTCollection } from '../hooks/useNFTCollection';
import { NFTUtils, MANETKA_COLLECTION_ADDRESS } from '../utils/getgems-api';

interface DashboardProps {
  onProfileClick: () => void;
  onSocialClick?: () => void;
  onRefsClick?: () => void;
}

export function Dashboard({ onProfileClick, onSocialClick, onRefsClick }: DashboardProps) {
  const { t, language } = useLanguage();
  const [mntBalance] = useState("1,250.50");
  const [tonBalance] = useState("15.75");
  const [dailyIncome] = useState("2.3");

  // Use NFT collection hook for real data
  const {
    allNFTs,
    myNFTs,
    totalBoost,
    maxPossibleBoost,
    isLoading: isLoadingNFTs
  } = useNFTCollection(MANETKA_COLLECTION_ADDRESS);

  // Mock data для подключенных кошельков
  const [connectedWallets, setConnectedWallets] = useState([
    { id: 1, name: "TON Wallet", address: "UQBx...3k2p", isPrimary: true },
    { id: 2, name: "Tonkeeper", address: "UQAx...7h4j", isPrimary: false },
    { id: 3, name: "TON Space", address: "UQCz...9m1k", isPrimary: false },
  ].sort((a, b) => (b.isPrimary ? 1 : 0) - (a.isPrimary ? 1 : 0))); // Основной кошелек наверх

  const [isHelpDialogOpen, setIsHelpDialogOpen] = useState(false);

  // Prepare boost data for display (only show owned NFTs with their stats)
  const ownedNFTBoosts = myNFTs.slice(0, 3).map(nft => ({
    name: nft.name,
    boost: `+${nft.boost}%`,
    rarity: nft.rarity.toLowerCase(),
    floorPrice: nft.price,
    boostValue: nft.boost,
    owned: true,
    image: nft.image,
    color: nft.color
  }));

  // Add some market NFTs for "buy boost" suggestions
  const marketNFTBoosts = allNFTs
    .filter(nft => !nft.owned && nft.forSale)
    .slice(0, 3 - ownedNFTBoosts.length)
    .map(nft => ({
      name: nft.name,
      boost: `+${nft.boost}%`,
      rarity: nft.rarity.toLowerCase(),
      floorPrice: nft.price,
      boostValue: nft.boost,
      owned: false,
      image: nft.image,
      color: nft.color
    }));

  const displayBoosts = [...ownedNFTBoosts, ...marketNFTBoosts];

  const handleDisconnectWallet = (walletId: number) => {
    setConnectedWallets(prev => prev.filter(wallet => wallet.id !== walletId));
  };

  const handleSetPrimaryWallet = (walletId: number) => {
    setConnectedWallets(prev => 
      prev.map(wallet => ({
        ...wallet,
        isPrimary: wallet.id === walletId
      })).sort((a, b) => (b.isPrimary ? 1 : 0) - (a.isPrimary ? 1 : 0)) // Сортировка после изменения
    );
  };

  const handleConnectNewWallet = () => {
    // Здесь будет логика подключения нового кошелька
    console.log("Connect new wallet");
  };

  const handleBuyBoost = (boostName: string) => {
    // Здесь будет логика покупки буста (переход на GetGems)
    console.log("Buy boost:", boostName);
    window.open(`https://getgems.io/collection/${MANETKA_COLLECTION_ADDRESS}`, '_blank');
  };

  return (
    <div className="min-h-screen bg-background pb-32">
      {/* Header */}
      <div className="flex justify-between items-center p-6">
        <div className="flex items-center gap-3">
          <div className="text-2xl">💎</div>
          <h1 className="text-xl font-semibold">MANETKA</h1>
        </div>
        <Avatar onClick={onProfileClick} className="cursor-pointer">
          <AvatarImage src="/placeholder-avatar.jpg" />
          <AvatarFallback className="bg-primary text-primary-foreground">МА</AvatarFallback>
        </Avatar>
      </div>

      <div className="px-6 space-y-6">
        {/* Balance Cards */}
        <div className="grid grid-cols-2 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-muted-foreground flex items-center gap-2">
                <DollarSign size={16} />
                {t.myBalance}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-semibold">{mntBalance}</div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-amber-50 to-yellow-50 border-amber-200 dark:from-amber-900/20 dark:to-yellow-900/20 dark:border-amber-800">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-amber-800 dark:text-amber-200 flex items-center gap-2">
                <Coins size={16} />
                {t.tonRewards}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-1">
              <div className="text-2xl font-semibold text-amber-900 dark:text-amber-100">{tonBalance}</div>
              <div className="text-xs text-amber-700 dark:text-amber-300">
                +{dailyIncome} {t.today}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-4">
          <Button className="py-6 bg-primary hover:bg-primary/90">
            {t.buy} $MNTK
          </Button>
          <Button variant="outline" className="py-6 border-primary text-primary hover:bg-primary/10">
            {t.sell} $MNTK
          </Button>
        </div>

        {/* Active Boosts */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Zap size={20} className="text-primary" />
                {t.activeBoosts}
              </div>
              {isLoadingNFTs ? (
                <Skeleton className="h-5 w-20" />
              ) : (
                <Badge className="h-5 px-2 text-xs bg-primary/10 text-primary border-primary/20">
                  +{totalBoost}% {t.nftBoost}
                </Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {isLoadingNFTs ? (
              // Loading skeleton
              Array.from({ length: 3 }).map((_, index) => (
                <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-muted">
                  <div className="flex items-center gap-3">
                    <Skeleton className="w-8 h-8 rounded-full" />
                    <div>
                      <Skeleton className="h-4 w-20 mb-1" />
                      <Skeleton className="h-3 w-16" />
                    </div>
                  </div>
                  <Skeleton className="h-5 w-12" />
                </div>
              ))
            ) : displayBoosts.length > 0 ? (
              displayBoosts.map((boost, index) => (
                <div key={index} className={`flex items-center justify-between p-3 rounded-lg ${
                  boost.owned ? 'bg-muted' : 'bg-muted/50 opacity-60'
                }`}>
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      boost.owned
                        ? boost.rarity === 'legendary' 
                          ? 'bg-gradient-to-r from-yellow-400 to-orange-500' 
                          : boost.rarity === 'epic'
                          ? 'bg-gradient-to-r from-purple-400 to-pink-500'
                          : 'bg-gradient-to-r from-blue-400 to-cyan-500'
                        : 'bg-muted-foreground/30'
                    }`}>
                      <Zap size={16} className={boost.owned ? "text-white" : "text-muted-foreground"} />
                    </div>
                    <div>
                      <div className={`font-medium text-sm ${boost.owned ? '' : 'text-muted-foreground'}`}>
                        {boost.name}
                      </div>
                      <div className="text-xs text-muted-foreground">{t.floor}: {boost.floorPrice}</div>
                    </div>
                  </div>
                  {boost.owned ? (
                    <Badge 
                      className={`h-5 px-2 text-xs border-0 ${
                        boost.rarity === 'legendary' 
                          ? 'bg-gradient-to-r from-yellow-500 to-orange-600 text-white' 
                          : boost.rarity === 'epic'
                          ? 'bg-gradient-to-r from-purple-500 to-pink-600 text-white'
                          : 'bg-gradient-to-r from-blue-500 to-cyan-600 text-white'
                      }`}
                    >
                      {boost.boost}
                    </Badge>
                  ) : (
                    <Button
                      size="sm"
                      onClick={() => handleBuyBoost(boost.name)}
                      className="h-6 px-3 text-xs bg-primary hover:bg-primary/90"
                    >
                      {t.buy}
                    </Button>
                  )}
                </div>
              ))
            ) : (
              <div className="text-center text-muted-foreground p-4">
                <Zap size={32} className="mx-auto mb-2 opacity-30" />
                <p className="text-sm">Нет активных бустов</p>
                <p className="text-xs mt-1">Купите NFT для получения пассивного дохода</p>
                <Button
                  size="sm"
                  onClick={() => handleBuyBoost("collection")}
                  className="mt-2 text-xs"
                  variant="outline"
                >
                  Открыть коллекцию
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Connected Wallets */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Wallet2 size={20} className="text-primary" />
                {t.connectedWallets}
              </div>
              <Dialog open={isHelpDialogOpen} onOpenChange={setIsHelpDialogOpen}>
                <DialogTrigger asChild>
                  <div className="h-6 w-6 flex items-center justify-center cursor-pointer hover:bg-muted rounded-sm transition-colors">
                    <HelpCircle size={16} className="text-muted-foreground" />
                  </div>
                </DialogTrigger>
                <DialogContent className="max-w-sm mx-auto">
                  <DialogHeader>
                    <DialogTitle>{t.walletInfo}</DialogTitle>
                    <DialogDescription className="text-left space-y-2">
                      <div>{t.walletInfoDescription}</div>
                      <div>{t.walletInfoNote}</div>
                    </DialogDescription>
                  </DialogHeader>
                </DialogContent>
              </Dialog>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {connectedWallets.map((wallet) => (
              <div key={wallet.id} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                    <Wallet2 size={16} className="text-primary-foreground" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{wallet.address}</span>
                      {wallet.isPrimary && (
                        <Badge className="h-5 px-2 text-xs bg-primary/10 text-primary border-primary/20">
                          <Star size={16} className="mr-1 fill-amber-500 text-amber-500" />
                          {t.primary}
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  {!wallet.isPrimary && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 hover:bg-primary/10"
                      onClick={() => handleSetPrimaryWallet(wallet.id)}
                      title="Сделать основным"
                    >
                      <Star size={16} className="text-amber-500 hover:fill-amber-500 transition-all" />
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 hover:bg-destructive/10"
                    onClick={() => handleDisconnectWallet(wallet.id)}
                    title="Отключить кошелек"
                  >
                    <Trash2 size={16} className="text-red-500 dark:text-red-400" />
                  </Button>
                </div>
              </div>
            ))}
            
            {/* Кнопка подключения нового кошелька */}
            <Button 
              variant="outline" 
              className="w-full flex items-center gap-2 border-dashed"
              onClick={handleConnectNewWallet}
            >
              <Plus size={16} className="text-primary" />
              {t.connectTONWallet}
            </Button>
          </CardContent>
        </Card>

        {/* Quick Links */}
        <div className="grid grid-cols-2 gap-4">
          <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={onSocialClick}>
            <CardContent className="p-4 text-center">
              <div className="flex flex-col items-center gap-2">
                <Share2 size={24} className="text-primary" />
                <span className="text-sm font-medium">{t.socialNetworks}</span>
              </div>
            </CardContent>
          </Card>
          
          <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={onRefsClick}>
            <CardContent className="p-4 text-center">
              <div className="flex flex-col items-center gap-2">
                <Users size={24} className="text-primary" />
                <span className="text-sm font-medium">{t.inviteFriend}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}