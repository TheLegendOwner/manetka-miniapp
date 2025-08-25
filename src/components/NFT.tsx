import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Skeleton } from './ui/skeleton';
import { Alert, AlertDescription } from './ui/alert';
import { Badge } from './ui/badge';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { ExternalLink, Star, Zap, Crown, Filter, ArrowUpDown, RefreshCw, TrendingUp, Database, Sparkles } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { useNFTCollection } from '../hooks/useNFTCollection';
import { NFTUtils, getGemsAPI, MANETKA_COLLECTION_ADDRESS } from '../utils/getgems-api';

export function NFT() {
  const { t } = useLanguage();
  
  const {
    collection,
    allNFTs,
    myNFTs,
    marketNFTs,
    isLoading,
    isLoadingMore,
    error,
    rarityFilter,
    sortType,
    setRarityFilter,
    setSortType,
    loadMore,
    refresh,
    totalBoost,
    maxPossibleBoost,
    hasMore,
    isUsingMockData
  } = useNFTCollection(MANETKA_COLLECTION_ADDRESS);

  const getRarityIcon = (rarity: string) => {
    switch (rarity.toUpperCase()) {
      case 'RARE': return Star;
      case 'EPIC': return Zap;
      case 'LEGENDARY': return Crown;
      default: return Star;
    }
  };

  const handleBuyNFT = (nftAddress: string) => {
    // Открываем GetGems маркетплейс для покупки NFT
    window.open(getGemsAPI.getMarketplaceUrl(nftAddress), '_blank');
  };

  const handleSellNFT = (nftAddress: string) => {
    // Открываем GetGems для продажи NFT
    window.open(getGemsAPI.getMarketplaceUrl(nftAddress), '_blank');
  };

  const handleViewCollection = () => {
    // Открываем страницу коллекции на GetGems
    window.open(getGemsAPI.getCollectionUrl(MANETKA_COLLECTION_ADDRESS), '_blank');
  };

  const renderNFTCard = (nft: typeof allNFTs[0]) => {
    const RarityIcon = getRarityIcon(nft.rarity);
    
    return (
      <Card key={nft.id} className={`relative overflow-hidden transition-all hover:shadow-lg ${
        nft.owned ? 'ring-2 ring-primary' : ''
      }`}>
        <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${nft.color}`}></div>
        <CardContent className="p-3">
          {/* NFT Image - Square format */}
          <div className="aspect-square mb-3 overflow-hidden rounded-lg bg-muted">
            <ImageWithFallback
              src={nft.image}
              alt={nft.name}
              className="w-full h-full object-cover transition-transform hover:scale-105"
            />
          </div>
          
          {/* NFT Info */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-sm truncate" title={nft.name}>
                {nft.name}
              </h3>
              {nft.forSale && (
                <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse" title="На продаже" />
              )}
            </div>
            
            <Button 
              size="16"
              className={`${NFTUtils.getRarityColor(nft.rarity)} text-xs h-5 px-1.5 py-0.5 hover:opacity-100 cursor-default pointer-events-none`}
            >
              <RarityIcon size={16} className="mr-1" />
              {nft.rarity}
            </Button>
            
            <div className="text-xs text-muted-foreground">
              <span className={`font-medium ${nft.owned ? 'text-primary' : 'text-muted-foreground'}`}>
                +{nft.boost}%
              </span> буст
            </div>
            
            <div className="flex items-center justify-between">
              <div className="font-semibold text-sm">{nft.price}</div>
              <Button 
                size="16" 
                variant={nft.owned ? "outline" : "default"}
                className="h-7 px-2 text-xs"
                onClick={() => nft.owned ? handleSellNFT(nft.address) : handleBuyNFT(nft.address)}
                disabled={!nft.forSale && !nft.owned}
              >
                {nft.owned ? t.sell : t.buy}
                <ExternalLink size={16} className="ml-1" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  const renderLoadingSkeleton = () => (
    <div className="grid grid-cols-2 gap-4">
      {Array.from({ length: 6 }).map((_, i) => (
        <Card key={i} className="overflow-hidden">
          <CardContent className="p-3">
            <Skeleton className="aspect-square mb-3 rounded-lg" />
            <Skeleton className="h-4 mb-2" />
            <Skeleton className="h-5 w-16 mb-2" />
            <Skeleton className="h-3 w-20 mb-2" />
            <div className="flex justify-between">
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-7 w-16" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );

  const renderDemoModeBanner = () => {
    if (!isUsingMockData) return null;
    
    return (
      <Alert className="mb-6 border-blue-300 bg-blue-50 dark:bg-blue-900/20">
        <Sparkles size={16} className="text-blue-600" />
        <AlertDescription className="text-blue-800 dark:text-blue-200">
          <div className="flex items-center justify-between">
            <span>
              🎯 Демо-коллекция MANETKA NFT с полным функционалом и примерами всех типов редкости
            </span>
            <Badge variant="outline" className="text-xs bg-blue-100 text-blue-700 border-blue-300">
              Demo
            </Badge>
          </div>
        </AlertDescription>
      </Alert>
    );
  };

  // Don't show error for mock data usage
  if (error && !isUsingMockData) {
    return (
      <div className="min-h-screen bg-background pb-32 p-6">
        <Alert className="border-destructive">
          <TrendingUp size={16} />
          <AlertDescription>
            {error}
          </AlertDescription>
        </Alert>
        <div className="mt-4 space-y-2">
          <Button onClick={refresh} variant="outline">
            <RefreshCw size={16} className="mr-2" />
            Повторить попытку
          </Button>
          <Button onClick={handleViewCollection} variant="outline" className="w-full">
            <ExternalLink size={16} className="mr-2" />
            Открыть коллекцию на GetGems
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-32">
      <div className="p-6">
        {/* Header with collection info */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-semibold">{t.nftCollection}</h1>
            {collection && (
              <div className="text-sm text-muted-foreground mt-1">
                {collection.items_count} NFT
                {collection.floor_price && (
                  <> • Floor: {collection.floor_price.value} {collection.floor_price.token_name}</>
                )}
              </div>
            )}
          </div>
          <div className="flex gap-2">
            <Button variant="ghost" size="icon" onClick={refresh} disabled={isLoading}>
              <RefreshCw size={16} className={isLoading ? 'animate-spin' : ''} />
            </Button>
            <Button variant="ghost" size="icon" onClick={handleViewCollection}>
              <ExternalLink size={16} />
            </Button>
          </div>
        </div>

        {/* Demo Mode Banner */}
        {renderDemoModeBanner()}

        {/* Collection Info Card */}
        {collection && (
          <Card className="mb-6">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-lg overflow-hidden bg-muted">
                  <ImageWithFallback
                    src={collection.image}
                    alt={collection.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold">{collection.name}</h3>
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {collection.description}
                  </p>
                  {collection.volume_24h && (
                    <div className="text-xs text-muted-foreground mt-1">
                      24h Volume: {collection.volume_24h.value} {collection.volume_24h.token_name}
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Boost Summary */}
        <Card className="mb-6 bg-gradient-to-r from-amber-50 to-yellow-50 border-amber-200 dark:from-amber-900/20 dark:to-yellow-900/20 dark:border-amber-800">
          <CardHeader>
            <CardTitle className="text-amber-800 dark:text-amber-200 flex items-center gap-2">
              <Zap size={20} />
              {t.yourBoosts}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center">
                <div className="text-2xl font-semibold text-amber-900 dark:text-amber-100">
                  {isLoading ? <Skeleton className="h-8 w-16 mx-auto" /> : `+${totalBoost}%`}
                </div>
                <div className="text-sm text-amber-700 dark:text-amber-300">{t.holdBoost}</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-semibold text-amber-900 dark:text-amber-100">
                  {isLoading ? <Skeleton className="h-8 w-16 mx-auto" /> : `+${totalBoost}%`}
                </div>
                <div className="text-sm text-amber-700 dark:text-amber-300">{t.refBoost}</div>
              </div>
            </div>
            {!isLoading && (
              <div className="mt-4 space-y-2">
                {totalBoost < maxPossibleBoost && (
                  <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg dark:bg-yellow-900/20 dark:border-yellow-800">
                    <p className="text-sm text-yellow-800 dark:text-yellow-300">
                      💡 {t.collectTip}
                    </p>
                  </div>
                )}
                {isUsingMockData && (
                  <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg dark:bg-blue-900/20 dark:border-blue-800">
                    <p className="text-sm text-blue-800 dark:text-blue-300">
                      🎯 Демо показывает полный функционал с различными типами NFT и уровнями редкости
                    </p>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Filters */}
        <div className="flex gap-3 mb-6">
          <Select value={rarityFilter} onValueChange={setRarityFilter} disabled={isLoading}>
            <SelectTrigger className="flex-1">
              <div className="flex items-center gap-2">
                <Filter size={16} />
                <SelectValue placeholder="Редкость" />
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Все</SelectItem>
              <SelectItem value="RARE">
                <div className="flex items-center gap-2">
                  <Star size={16} className="text-blue-500" />
                  Rare
                </div>
              </SelectItem>
              <SelectItem value="EPIC">
                <div className="flex items-center gap-2">
                  <Zap size={16} className="text-purple-500" />
                  Epic
                </div>
              </SelectItem>
              <SelectItem value="LEGENDARY">
                <div className="flex items-center gap-2">
                  <Crown size={16} className="text-amber-500" />
                  Legendary
                </div>
              </SelectItem>
            </SelectContent>
          </Select>

          <Select value={sortType} onValueChange={setSortType} disabled={isLoading}>
            <SelectTrigger className="flex-1">
              <div className="flex items-center gap-2">
                <ArrowUpDown size={16} />
                <SelectValue placeholder="Сортировка" />
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="price-asc">Цена ↑</SelectItem>
              <SelectItem value="price-desc">Цена ↓</SelectItem>
              <SelectItem value="rarity-asc">Редкость ↑</SelectItem>
              <SelectItem value="rarity-desc">Редкость ↓</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {isLoading ? (
          renderLoadingSkeleton()
        ) : (
          <>
            {/* NFT Tabs */}
            <Tabs defaultValue="my" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="my">
                  Мои ({myNFTs.length})
                </TabsTrigger>
                <TabsTrigger value="market">
                  На продаже ({marketNFTs.length})
                </TabsTrigger>
              </TabsList>

              <TabsContent value="my" className="mt-6">
                {myNFTs.length > 0 ? (
                  <div className="grid grid-cols-2 gap-4">
                    {myNFTs.map(renderNFTCard)}
                  </div>
                ) : (
                  <Card className="p-8">
                    <div className="text-center text-muted-foreground">
                      <Zap size={48} className="mx-auto mb-4 opacity-30" />
                      <p>Нет NFT с выбранными фильтрами</p>
                      <p className="text-sm mt-2">Попробуйте изменить фильтры или купить NFT на маркетплейсе</p>
                      <Button 
                        onClick={handleViewCollection} 
                        className="mt-4"
                        variant="outline"
                      >
                        <ExternalLink size={16} className="mr-2" />
                        Открыть на GetGems
                      </Button>
                    </div>
                  </Card>
                )}
              </TabsContent>

              <TabsContent value="market" className="mt-6">
                {marketNFTs.length > 0 ? (
                  <>
                    <div className="grid grid-cols-2 gap-4">
                      {marketNFTs.map(renderNFTCard)}
                    </div>
                    
                    {/* Load More Button */}
                    {hasMore && (
                      <div className="flex justify-center mt-6">
                        <Button 
                          onClick={loadMore} 
                          disabled={isLoadingMore}
                          variant="outline"
                        >
                          {isLoadingMore ? (
                            <>
                              <RefreshCw size={16} className="mr-2 animate-spin" />
                              Загрузка...
                            </>
                          ) : (
                            'Загрузить еще'
                          )}
                        </Button>
                      </div>
                    )}
                  </>
                ) : (
                  <Card className="p-8">
                    <div className="text-center text-muted-foreground">
                      <Star size={48} className="mx-auto mb-4 opacity-30" />
                      <p>Нет NFT с выбранными фильтрами</p>
                      <p className="text-sm mt-2">Попробуйте изменить фильтры</p>
                      <Button 
                        onClick={handleViewCollection} 
                        className="mt-4"
                        variant="outline"
                      >
                        <ExternalLink size={16} className="mr-2" />
                        Открыть на GetGems
                      </Button>
                    </div>
                  </Card>
                )}
              </TabsContent>
            </Tabs>

            {/* Collection Info */}
            <Card className="mt-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp size={20} />
                  {t.aboutCollection}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {collection && (
                  <>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">{t.totalNFTs}:</span>
                      <span className="font-semibold">{collection.items_count}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">{t.youHave}:</span>
                      <span className="font-semibold">{myNFTs.length}</span>
                    </div>
                    {collection.floor_price && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Floor Price:</span>
                        <span className="font-semibold">
                          {collection.floor_price.value} {collection.floor_price.token_name}
                        </span>
                      </div>
                    )}
                  </>
                )}
                <div className="mt-4 p-3 bg-primary/5 border border-primary/20 rounded-lg">
                  <p className="text-sm text-foreground">
                    🎯 {isUsingMockData 
                      ? "Демо-коллекция демонстрирует полный функционал MANETKA NFT системы" 
                      : t.marketplaceInfo
                    }
                  </p>
                </div>
                <Button 
                  onClick={handleViewCollection} 
                  className="w-full mt-3"
                  variant="outline"
                >
                  <ExternalLink size={16} className="mr-2" />
                  Открыть коллекцию на GetGems
                </Button>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </div>
  );
}