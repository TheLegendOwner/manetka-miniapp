import { useState } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Input } from './ui/input';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Badge } from './ui/badge';
import { ChevronDown, TrendingUp, BarChart3, Search, Share2, Wallet2, Star, Trash2 } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

export function Wallet() {
  const { t } = useLanguage();
  const [selectedWallet, setSelectedWallet] = useState('all');

  // Mock данные для кошельков
  const wallets = [
    { id: 'all', name: t.allWallets },
    { id: 'ton-wallet', name: 'TON Wallet' },
    { id: 'tonkeeper', name: 'Tonkeeper' },
    { id: 'ton-space', name: 'TON Space' },
  ];

  // Mock данные для токенов
  const tokens = [
    {
      symbol: 'Lis',
      name: 'Lis Token',
      balance: '251800.0000',
      usdBalance: '$168.15',
      tonBalance: '52.2182 TON',
      rewards: '5.0930 TON',
      logo: '🦊', // Можно заменить на реальное изображение
      color: 'from-orange-400 to-red-500'
    },
    {
      symbol: 'SC',
      name: 'SC Token', 
      balance: '170003.2600',
      usdBalance: '$591.18',
      tonBalance: '183.3857 TON',
      rewards: '27.4630 TON',
      logo: '🔗',
      color: 'from-blue-400 to-cyan-500'
    },
    {
      symbol: 'VNUK',
      name: 'VNUK Token',
      balance: '2300000.0000',
      usdBalance: '$526.63',
      tonBalance: '163.5402 TON', 
      rewards: '12.3749 TON',
      logo: '👑',
      color: 'from-purple-400 to-pink-500'
    },
    {
      symbol: 'IGOR',
      name: 'IGOR Token',
      balance: '1171295.5958',
      usdBalance: '$60.36',
      tonBalance: '18.7430 TON',
      rewards: '1.3653 TON',
      logo: '🤖',
      color: 'from-gray-400 to-gray-600'
    },
    {
      symbol: 'BMNR',
      name: 'BMNR Token',
      balance: '45670.2300',
      usdBalance: '$123.45',
      tonBalance: '38.2150 TON',
      rewards: '4.5678 TON',
      logo: '⛏️',
      color: 'from-yellow-400 to-orange-500'
    }
  ];

  return (
    <div className="min-h-screen bg-background pb-32">
      <div className="p-6 space-y-6">
        <h1 className="text-2xl font-semibold mb-6">{t.wallet}</h1>

        {/* Wallet Selector */}
        <Select value={selectedWallet} onValueChange={setSelectedWallet}>
          <SelectTrigger className="w-full bg-muted border-border">
            <SelectValue placeholder="Выберите кошелек" />
          </SelectTrigger>
          <SelectContent>
            {wallets.map((wallet) => (
              <SelectItem key={wallet.id} value={wallet.id}>
                {wallet.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Wallet Info */}
        <Card className="bg-primary/5 border-primary/20">
          <CardHeader>
            <CardTitle className="text-primary flex items-center gap-2">
              <BarChart3 size={20} />
              {t.walletInfo}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-foreground">
              {t.walletInfoDescription}
            </p>
            <p className="text-xs text-muted-foreground">
              {t.walletInfoNote}
            </p>
          </CardContent>
        </Card>

        {/* Tabs */}
        <Tabs defaultValue="balances" className="w-full">
          <TabsList className="grid w-full grid-cols-2 bg-muted">
            <TabsTrigger value="balances" className="data-[state=active]:bg-amber-100 data-[state=active]:text-amber-800 dark:data-[state=active]:bg-amber-900/30 dark:data-[state=active]:text-amber-200">
              {t.balances}
            </TabsTrigger>
            <TabsTrigger value="stats" className="data-[state=active]:bg-amber-100 data-[state=active]:text-amber-800 dark:data-[state=active]:bg-amber-900/30 dark:data-[state=active]:text-amber-200">
              {t.statistics}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="balances" className="space-y-4 mt-6">
            {tokens.map((token) => (
              <Card key={token.symbol} className="overflow-hidden">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg mb-1">{token.symbol}</h3>
                      <div className="space-y-1 text-sm">
                        <div className="text-muted-foreground">
                          <span className="font-medium">{t.balance}:</span> {token.balance}
                        </div>
                        <div className="text-muted-foreground">
                          <span className="font-medium">{t.balanceInUSD}:</span> {token.usdBalance}
                        </div>
                        <div className="text-muted-foreground">
                          <span className="font-medium">{t.balanceInTON}:</span> {token.tonBalance}
                        </div>
                        <div className="text-amber-700 dark:text-amber-300">
                          <span className="font-medium">{t.rewards}:</span> {token.rewards}
                        </div>
                      </div>
                    </div>
                    <div className="ml-4">
                      <div className={`w-12 h-12 rounded-full bg-gradient-to-r ${token.color} flex items-center justify-center text-xl shadow-md`}>
                        {token.logo}
                      </div>
                    </div>
                  </div>
                  
                  <Button 
                    className="w-full py-3 bg-amber-500 hover:bg-amber-600 text-white font-medium"
                    size="lg"
                  >
                    {t.tradeToken}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          <TabsContent value="stats" className="space-y-4 mt-6">
           

            {/* Date Range Selection */}
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-muted-foreground mb-2 block">{t.from}</label>
                  <Input 
                    type="date" 
                    defaultValue="2000-01-01"
                    className="bg-input-background"
                  />
                </div>
                <div>
                  <label className="text-sm text-muted-foreground mb-2 block">{t.to}</label>
                  <Input 
                    type="date" 
                    defaultValue="2025-08-25"
                    className="bg-input-background"
                  />
                </div>
              </div>
              
              <div className="text-xs text-muted-foreground">
                {t.from} 2000-01-01 | {t.to} 2025-08-25
              </div>
              
              <Button className="w-full bg-amber-500 hover:bg-amber-600 text-white flex items-center gap-2">
                <Search size={16} />
                {t.apply}
              </Button>
            </div>

            {/* Rewards Table */}
            <Card>
              <CardContent className="p-0">
                <div className="grid grid-cols-2 gap-0 border-b border-border p-4 bg-muted/50">
                  <div className="font-medium text-sm">{t.token}</div>
                  <div className="font-medium text-sm text-right">{t.income}</div>
                </div>
                
                <div>
                  {[
                    { symbol: 'JST', reward: '2.1660 TON' },
                    { symbol: 'DF', reward: '0.1755 TON' },
                    { symbol: 'TCR', reward: '1.4888 TON' },
                    { symbol: 'IGOR', reward: '1.3653 TON' },
                    { symbol: 'VNUK', reward: '12.3749 TON' },
                    { symbol: 'SINOK', reward: '2.1838 TON' },
                    { symbol: 'MPAK', reward: '1.8849 TON' },
                    { symbol: 'tmmv', reward: '0.0003 TON' },
                    { symbol: 'TECHTRD', reward: '18.9942 TON' },
                    { symbol: 'K-LEAF', reward: '0.1260 TON' },
                    { symbol: 'BMNR', reward: '5.5174 TON' },
                    { symbol: 'SC', reward: '27.4630 TON' },
                    { symbol: 'BRC', reward: '2.3748 TON' },
                    { symbol: 'ARNI', reward: '5.3827 TON' },
                    { symbol: 'MOMMY', reward: '1.6392 TON' },
                    { symbol: 'Lis', reward: '5.0930 TON' },
                    { symbol: 'NG', reward: '1.0243 TON' },
                    { symbol: 'NKVT', reward: '3.0528 TON' },
                  ].map((token, index) => (
                    <div key={token.symbol} className={`grid grid-cols-2 gap-0 p-4 border-b border-border last:border-b-0 ${index % 2 === 0 ? 'bg-background' : 'bg-muted/20'}`}>
                      <div className="text-sm font-medium text-foreground">{token.symbol}</div>
                      <div className="text-sm text-right text-foreground">{token.reward}</div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Share Button */}
            <Button 
              variant="outline" 
              className="w-full border-amber-500 text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-950 flex items-center gap-2"
            >
              <Share2 size={16} />
              {t.shareStatistics}
            </Button>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}