import { useState, useEffect, useCallback } from 'react';
import { getGemsAPI, GetGemsNFTItem, GetGemsCollection, NFTUtils, MANETKA_COLLECTION_ADDRESS } from '../utils/getgems-api';

export interface ProcessedNFT {
  id: string;
  name: string;
  rarity: string;
  boost: number;
  price: string;
  priceValue: number;
  image: string;
  color: string;
  owned: boolean;
  forSale: boolean;
  address: string;
  rawData: GetGemsNFTItem;
}

type SortType = 'price-asc' | 'price-desc' | 'rarity-asc' | 'rarity-desc';
type RarityFilter = 'all' | 'RARE' | 'EPIC' | 'LEGENDARY';

interface UseNFTCollectionReturn {
  // Data
  collection: GetGemsCollection | null;
  allNFTs: ProcessedNFT[];
  myNFTs: ProcessedNFT[];
  marketNFTs: ProcessedNFT[];
  
  // Loading states
  isLoading: boolean;
  isLoadingMore: boolean;
  error: string | null;
  
  // Filters and sorting
  rarityFilter: RarityFilter;
  sortType: SortType;
  setRarityFilter: (filter: RarityFilter) => void;
  setSortType: (sort: SortType) => void;
  
  // Actions
  loadMore: () => void;
  refresh: () => void;
  
  // Stats
  totalBoost: number;
  maxPossibleBoost: number;
  hasMore: boolean;
  
  // API status
  isUsingMockData: boolean;
}

export function useNFTCollection(collectionAddress?: string): UseNFTCollectionReturn {
  // Use the real collection address if not provided
  const actualCollectionAddress = collectionAddress || MANETKA_COLLECTION_ADDRESS;

  // State
  const [collection, setCollection] = useState<GetGemsCollection | null>(null);
  const [rawNFTs, setRawNFTs] = useState<GetGemsNFTItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [offset, setOffset] = useState(0);
  
  // Filters and sorting
  const [rarityFilter, setRarityFilter] = useState<RarityFilter>('all');
  const [sortType, setSortType] = useState<SortType>('price-asc');

  // API status
  const isUsingMockData = getGemsAPI.isUsingMockData();

  // Process raw NFT data
  const processNFTs = useCallback((nfts: GetGemsNFTItem[]): ProcessedNFT[] => {
    return nfts.map(nft => {
      const rarity = getGemsAPI.getRarity(nft);
      const boost = getGemsAPI.getBoost(nft);
      const priceValue = getGemsAPI.getPriceInTON(nft);
      
      return {
        id: nft.address,
        name: nft.content.name || `NFT #${nft.index}`,
        rarity,
        boost,
        price: priceValue > 0 ? NFTUtils.formatTONPrice(priceValue) : 'Not for sale',
        priceValue,
        image: getGemsAPI.getImageUrl(nft),
        color: NFTUtils.getGradientColor(rarity),
        owned: getGemsAPI.isUserOwner(nft),
        forSale: getGemsAPI.isForSale(nft),
        address: nft.address,
        rawData: nft
      };
    });
  }, []);

  // Filter and sort NFTs
  const filterAndSort = useCallback((nfts: ProcessedNFT[]) => {
    let filtered = [...nfts];

    // Apply rarity filter
    if (rarityFilter !== 'all') {
      filtered = filtered.filter(nft => nft.rarity === rarityFilter);
    }

    // Apply sorting
    filtered.sort((a, b) => {
      switch (sortType) {
        case 'price-asc':
          // Показываем NFT без продажи в конце
          if (a.priceValue === 0 && b.priceValue === 0) return 0;
          if (a.priceValue === 0) return 1;
          if (b.priceValue === 0) return -1;
          return a.priceValue - b.priceValue;
        case 'price-desc':
          if (a.priceValue === 0 && b.priceValue === 0) return 0;
          if (a.priceValue === 0) return 1;
          if (b.priceValue === 0) return -1;
          return b.priceValue - a.priceValue;
        case 'rarity-asc':
          return NFTUtils.getRarityWeight(a.rarity) - NFTUtils.getRarityWeight(b.rarity);
        case 'rarity-desc':
          return NFTUtils.getRarityWeight(b.rarity) - NFTUtils.getRarityWeight(a.rarity);
        default:
          return 0;
      }
    });

    return filtered;
  }, [rarityFilter, sortType]);

  // Process and filter all NFTs
  const allNFTs = processNFTs(rawNFTs);
  const filteredNFTs = filterAndSort(allNFTs);
  const myNFTs = filterAndSort(allNFTs.filter(nft => nft.owned));
  const marketNFTs = filterAndSort(allNFTs.filter(nft => !nft.owned));

  // Calculate boost stats
  const totalBoost = allNFTs.reduce((sum, nft) => {
    return sum + (nft.owned ? nft.boost : 0);
  }, 0);

  const maxPossibleBoost = allNFTs.reduce((sum, nft) => sum + nft.boost, 0);

  // Load initial data
  const loadData = useCallback(async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setIsLoading(true);
        setError(null);
        setOffset(0);
        setRawNFTs([]);
      }

      // Load collection info - no error logging, silent fallback
      const collectionData = await getGemsAPI.getCollection(actualCollectionAddress);
      setCollection(collectionData);

      // Load NFT items - no error logging, silent fallback
      const response = await getGemsAPI.getCollectionItems(
        actualCollectionAddress, 
        50, 
        isRefresh ? 0 : offset
      );

      if (isRefresh) {
        setRawNFTs(response.data);
      } else {
        setRawNFTs(prev => [...prev, ...response.data]);
      }

      setOffset(prev => isRefresh ? response.data.length : prev + response.data.length);
      setHasMore(response.data.length > 0 && response.total ? offset + response.data.length < response.total : false);
      
    } catch (err) {
      // Only set error for non-API availability issues
      const errorMessage = err instanceof Error ? err.message : 'Failed to load NFT collection';
      
      // Don't show error for expected mock data usage
      if (!errorMessage.includes('mock data') && !errorMessage.includes('API not available')) {
        setError(errorMessage);
      }
    } finally {
      setIsLoading(false);
      setIsLoadingMore(false);
    }
  }, [actualCollectionAddress, offset]);

  // Load more items
  const loadMore = useCallback(async () => {
    if (isLoadingMore || !hasMore) return;
    
    setIsLoadingMore(true);
    await loadData(false);
  }, [isLoadingMore, hasMore, loadData]);

  // Refresh data
  const refresh = useCallback(async () => {
    await loadData(true);
  }, [loadData]);

  // Initial load
  useEffect(() => {
    loadData(true);
  }, [actualCollectionAddress]);

  return {
    // Data
    collection,
    allNFTs: filteredNFTs,
    myNFTs,
    marketNFTs,
    
    // Loading states
    isLoading,
    isLoadingMore,
    error,
    
    // Filters and sorting
    rarityFilter,
    sortType,
    setRarityFilter,
    setSortType,
    
    // Actions
    loadMore,
    refresh,
    
    // Stats
    totalBoost,
    maxPossibleBoost,
    hasMore,
    
    // API status
    isUsingMockData
  };
}