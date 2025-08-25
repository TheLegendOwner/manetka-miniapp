// GetGems API integration for TON NFT collections
export interface GetGemsNFTItem {
  address: string;
  index: number;
  collection_address: string;
  owner_address: string;
  content: {
    name: string;
    description: string;
    image: string;
    attributes?: Array<{
      trait_type: string;
      value: string | number;
    }>;
  };
  sale?: {
    address: string;
    price: {
      token_name: string;
      value: string;
    };
    is_auction: boolean;
  };
  previews?: Array<{
    resolution: string;
    url: string;
  }>;
}

export interface GetGemsCollection {
  address: string;
  name: string;
  description: string;
  image: string;
  cover_image?: string;
  items_count: number;
  floor_price?: {
    token_name: string;
    value: string;
  };
  volume_24h?: {
    token_name: string;
    value: string;
  };
}

export interface GetGemsResponse<T> {
  data: T;
  total?: number;
  limit?: number;
  offset?: number;
}

// GetGems API configuration
const GETGEMS_API_KEY = "1756153701179-mainnet-10274134-r-eY11DKHnMng45JUs0EF4MheNLAKubWzapB3CvwkvyzRSDds0";

// Real collection address
export const MANETKA_COLLECTION_ADDRESS = "EQDFiSDU87TEvY67yqx0dTLQ-xHKbrR84dYfrYXWa5FWtMiu";

// Симуляция пользователя (в реальном приложении это будет из TON Connect)
const USER_ADDRESS = "UQBx...user1"; // Заглушка для демонстрации

// Enhanced mock data for demonstration
const MOCK_COLLECTION_DATA: GetGemsCollection = {
  address: MANETKA_COLLECTION_ADDRESS,
  name: "MANETKA Collection",
  description: "Premium NFT collection with passive income features for MANETKA ecosystem",
  image: "https://images.unsplash.com/photo-1636081671112-04a4113ba1fc?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjcnlwdG8lMjBORlQlMjBkaWdpdGFsJTIwYXJ0fGVufDF8fHx8MTc1NjE0Mjk1M3ww&ixlib=rb-4.1.0&q=80&w=1080",
  items_count: 1000,
  floor_price: {
    token_name: "TON",
    value: "0.5"
  },
  volume_24h: {
    token_name: "TON",
    value: "125.7"
  }
};

const MOCK_NFT_ITEMS: GetGemsNFTItem[] = [
  {
    address: "EQBx...3k2p",
    index: 1,
    collection_address: MANETKA_COLLECTION_ADDRESS,
    owner_address: USER_ADDRESS,
    content: {
      name: "MANETKA Rare #001",
      description: "Rare MANETKA NFT with 2% passive income boost",
      image: "https://images.unsplash.com/photo-1620046311691-5d93d65f69e9?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxyYXJlJTIwZGlnaXRhbCUyMGNvbGxlY3RpYmxlfGVufDF8fHx8MTc1NjE0Mjk1NXww&ixlib=rb-4.1.0&q=80&w=1080",
      attributes: [
        { trait_type: "Rarity", value: "RARE" },
        { trait_type: "Boost", value: 2 },
        { trait_type: "Background", value: "Blue Gradient" },
        { trait_type: "Type", value: "Income Booster" }
      ]
    },
    previews: [
      {
        resolution: "500x500",
        url: "https://images.unsplash.com/photo-1620046311691-5d93d65f69e9?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxyYXJlJTIwZGlnaXRhbCUyMGNvbGxlY3RpYmxlfGVufDF8fHx8MTc1NjE0Mjk1NXww&ixlib=rb-4.1.0&q=80&w=1080"
      }
    ]
  },
  {
    address: "EQCy...4m1k",
    index: 2,
    collection_address: MANETKA_COLLECTION_ADDRESS,
    owner_address: "UQCy...other",
    content: {
      name: "MANETKA Rare #002",
      description: "Rare MANETKA NFT with 2% passive income boost",
      image: "https://images.unsplash.com/photo-1699568542323-ff98aca8ea6a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhYnN0cmFjdCUyMGNvbG9yZnVsJTIwYXJ0fGVufDF8fHx8MTc1NjA5Mjg0M3ww&ixlib=rb-4.1.0&q=80&w=1080",
      attributes: [
        { trait_type: "Rarity", value: "RARE" },
        { trait_type: "Boost", value: 2 },
        { trait_type: "Background", value: "Purple Gradient" },
        { trait_type: "Type", value: "Income Booster" }
      ]
    },
    sale: {
      address: "EQSale...123",
      price: {
        token_name: "TON",
        value: "0.6"
      },
      is_auction: false
    }
  },
  {
    address: "EQDz...7h4j",
    index: 3,
    collection_address: MANETKA_COLLECTION_ADDRESS,
    owner_address: USER_ADDRESS,
    content: {
      name: "MANETKA Epic #003",
      description: "Epic MANETKA NFT with 5% passive income boost",
      image: "https://images.unsplash.com/photo-1649575441193-cd63ee5c72a9?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxlcGljJTIwZ2FtaW5nJTIwYXJ0fGVufDF8fHx8MTc1NjE0Mjk1OXww&ixlib=rb-4.1.0&q=80&w=1080",
      attributes: [
        { trait_type: "Rarity", value: "EPIC" },
        { trait_type: "Boost", value: 5 },
        { trait_type: "Background", value: "Epic Purple" },
        { trait_type: "Type", value: "Premium Booster" }
      ]
    }
  },
  {
    address: "EQAx...9k5m",
    index: 4,
    collection_address: MANETKA_COLLECTION_ADDRESS,
    owner_address: "UQAx...other2",
    content: {
      name: "MANETKA Epic #004",
      description: "Epic MANETKA NFT with 5% passive income boost",
      image: "https://images.unsplash.com/photo-1651290984981-56cf9f7e105c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxuZW9uJTIwZGlnaXRhbCUyMGZ1dHVyZXxlbnwxfHx8fDE3NTYxNDI5NzJ8MA&ixlib=rb-4.1.0&q=80&w=1080",
      attributes: [
        { trait_type: "Rarity", value: "EPIC" },
        { trait_type: "Boost", value: 5 },
        { trait_type: "Background", value: "Neon Future" },
        { trait_type: "Type", value: "Premium Booster" }
      ]
    },
    sale: {
      address: "EQSale...456",
      price: {
        token_name: "TON",
        value: "1.4"
      },
      is_auction: false
    }
  },
  {
    address: "EQBz...2l8n",
    index: 5,
    collection_address: MANETKA_COLLECTION_ADDRESS,
    owner_address: "UQBz...other3",
    content: {
      name: "MANETKA Legendary #005",
      description: "Legendary MANETKA NFT with 13% passive income boost",
      image: "https://images.unsplash.com/photo-1593346769568-d3db3722395f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsZWdlbmRhcnklMjBnb2xkZW4lMjBjcm93bnxlbnwxfHx8fDE3NTYxNDI5NjJ8MA&ixlib=rb-4.1.0&q=80&w=1080",
      attributes: [
        { trait_type: "Rarity", value: "LEGENDARY" },
        { trait_type: "Boost", value: 13 },
        { trait_type: "Background", value: "Golden Crown" },
        { trait_type: "Type", value: "Elite Booster" }
      ]
    },
    sale: {
      address: "EQSale...789",
      price: {
        token_name: "TON",
        value: "5.0"
      },
      is_auction: false
    }
  },
  {
    address: "EQCx...6p9q",
    index: 6,
    collection_address: MANETKA_COLLECTION_ADDRESS,
    owner_address: "UQCx...other4",
    content: {
      name: "MANETKA Legendary #006",
      description: "Legendary MANETKA NFT with 13% passive income boost",
      image: "https://images.unsplash.com/photo-1636081671112-04a4113ba1fc?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjcnlwdG8lMjBORlQlMjBkaWdpdGFsJTIwYXJ0fGVufDF8fHx8MTc1NjE0Mjk1M3ww&ixlib=rb-4.1.0&q=80&w=1080",
      attributes: [
        { trait_type: "Rarity", value: "LEGENDARY" },
        { trait_type: "Boost", value: 13 },
        { trait_type: "Background", value: "Crypto Art" },
        { trait_type: "Type", value: "Elite Booster" }
      ]
    },
    sale: {
      address: "EQSale...abc",
      price: {
        token_name: "TON",
        value: "6.5"
      },
      is_auction: false
    }
  },
  {
    address: "EQDx...8r2s",
    index: 7,
    collection_address: MANETKA_COLLECTION_ADDRESS,
    owner_address: "UQDx...other5",
    content: {
      name: "MANETKA Rare #007",
      description: "Rare MANETKA NFT with 2% passive income boost",
      image: "https://images.unsplash.com/photo-1620046311691-5d93d65f69e9?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxyYXJlJTIwZGlnaXRhbCUyMGNvbGxlY3RpYmxlfGVufDF8fHx8MTc1NjE0Mjk1NXww&ixlib=rb-4.1.0&q=80&w=1080",
      attributes: [
        { trait_type: "Rarity", value: "RARE" },
        { trait_type: "Boost", value: 2 },
        { trait_type: "Background", value: "Classic Blue" },
        { trait_type: "Type", value: "Income Booster" }
      ]
    },
    sale: {
      address: "EQSale...def",
      price: {
        token_name: "TON",
        value: "0.4"
      },
      is_auction: false
    }
  },
  {
    address: "EQEx...4t5u",
    index: 8,
    collection_address: MANETKA_COLLECTION_ADDRESS,
    owner_address: "UQEx...other6",
    content: {
      name: "MANETKA Epic #008",
      description: "Epic MANETKA NFT with 5% passive income boost",
      image: "https://images.unsplash.com/photo-1649575441193-cd63ee5c72a9?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxlcGljJTIwZ2FtaW5nJTIwYXJ0fGVufDF8fHx8MTc1NjE0Mjk1OXww&ixlib=rb-4.1.0&q=80&w=1080",
      attributes: [
        { trait_type: "Rarity", value: "EPIC" },
        { trait_type: "Boost", value: 5 },
        { trait_type: "Background", value: "Gaming Art" },
        { trait_type: "Type", value: "Premium Booster" }
      ]
    },
    sale: {
      address: "EQSale...ghi",
      price: {
        token_name: "TON",
        value: "1.8"
      },
      is_auction: false
    }
  },
  {
    address: "EQFx...5v6w",
    index: 9,
    collection_address: MANETKA_COLLECTION_ADDRESS,
    owner_address: "UQFx...other7",
    content: {
      name: "MANETKA Rare #009",
      description: "Rare MANETKA NFT with 2% passive income boost",
      image: "https://images.unsplash.com/photo-1620046311691-5d93d65f69e9?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxyYXJlJTIwZGlnaXRhbCUyMGNvbGxlY3RpYmxlfGVufDF8fHx8MTc1NjE0Mjk1NXww&ixlib=rb-4.1.0&q=80&w=1080",
      attributes: [
        { trait_type: "Rarity", value: "RARE" },
        { trait_type: "Boost", value: 2 },
        { trait_type: "Background", value: "Ocean Blue" },
        { trait_type: "Type", value: "Income Booster" }
      ]
    },
    sale: {
      address: "EQSale...jkl",
      price: {
        token_name: "TON",
        value: "0.7"
      },
      is_auction: false
    }
  },
  {
    address: "EQGx...7y8z",
    index: 10,
    collection_address: MANETKA_COLLECTION_ADDRESS,
    owner_address: "UQGx...other8",
    content: {
      name: "MANETKA Epic #010",
      description: "Epic MANETKA NFT with 5% passive income boost",
      image: "https://images.unsplash.com/photo-1651290984981-56cf9f7e105c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxuZW9uJTIwZGlnaXRhbCUyMGZ1dHVyZXxlbnwxfHx8fDE3NTYxNDI5NzJ8MA&ixlib=rb-4.1.0&q=80&w=1080",
      attributes: [
        { trait_type: "Rarity", value: "EPIC" },
        { trait_type: "Boost", value: 5 },
        { trait_type: "Background", value: "Cyber Punk" },
        { trait_type: "Type", value: "Premium Booster" }
      ]
    },
    sale: {
      address: "EQSale...mno",
      price: {
        token_name: "TON",
        value: "1.6"
      },
      is_auction: false
    }
  }
];

// Environment check for development mode
const isDevelopment = process.env.NODE_ENV === 'development';

class GetGemsAPI {
  private apiKey = GETGEMS_API_KEY;
  private isApiAvailable: boolean | null = null;
  private useMockData = false;
  
  constructor() {
    // In browser environment, GetGems API is not available due to CORS
    // Automatically use mock data for demonstration
    this.useMockData = true;
    this.isApiAvailable = false;
    
    // Only log in development mode
    if (isDevelopment) {
      console.log('🎯 MANETKA NFT Collection initialized with demo data');
    }
  }
  
  // Test API availability (disabled in browser environment)
  private async testApiConnection(): Promise<boolean> {
    if (this.useMockData) {
      return false;
    }

    if (this.isApiAvailable !== null) {
      return this.isApiAvailable;
    }

    try {
      // Simple connectivity test
      const response = await fetch('https://api.getgems.io/graphql', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          query: `query { __typename }`,
        }),
        signal: AbortSignal.timeout(3000) // 3 second timeout
      });
      
      this.isApiAvailable = response.ok;
      return this.isApiAvailable;
    } catch (error) {
      // Silent fallback to mock data
      this.isApiAvailable = false;
      this.useMockData = true;
      return false;
    }
  }
  
  private async makeRequest<T>(query: string, variables?: Record<string, any>): Promise<T> {
    // Skip API check and use mock data directly
    if (this.useMockData) {
      throw new Error('Using mock data mode');
    }

    const isAvailable = await this.testApiConnection();
    
    if (!isAvailable) {
      this.useMockData = true;
      throw new Error('API not available');
    }

    try {
      const response = await fetch('https://api.getgems.io/graphql', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          query,
          variables: variables || {}
        }),
        signal: AbortSignal.timeout(10000) // 10 second timeout
      });

      if (!response.ok) {
        throw new Error(`GetGems API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      
      if (data.errors) {
        throw new Error(`GraphQL errors: ${data.errors.map((e: any) => e.message).join(', ')}`);
      }
      
      return data;
    } catch (error) {
      this.useMockData = true;
      throw error;
    }
  }

  async getCollection(collectionAddress: string): Promise<GetGemsCollection> {
    try {
      if (isDevelopment && !this.useMockData) {
        console.log('🔍 Attempting to fetch collection from GetGems API...');
      }
      
      const query = `
        query GetCollection($address: String!) {
          nftCollection(address: $address) {
            address
            name
            description
            image
            cover_image
            items_count
            floor_price {
              token_name
              value
            }
            volume_24h {
              token_name
              value
            }
          }
        }
      `;

      const data = await this.makeRequest<any>(query, { address: collectionAddress });
      
      if (data.data?.nftCollection) {
        if (isDevelopment) {
          console.log('✅ Successfully fetched collection from GetGems API');
        }
        return data.data.nftCollection;
      }
      
      throw new Error('No collection data returned from API');
    } catch (error) {
      // Silent fallback to mock data without console warnings
      if (isDevelopment) {
        console.log('📋 Using demo collection data for MANETKA NFT showcase');
      }
      
      // Return enhanced mock data
      return {
        ...MOCK_COLLECTION_DATA,
        address: collectionAddress
      };
    }
  }

  async getCollectionItems(
    collectionAddress: string, 
    limit = 50, 
    offset = 0
  ): Promise<GetGemsResponse<GetGemsNFTItem[]>> {
    try {
      if (isDevelopment && !this.useMockData) {
        console.log(`🔍 Attempting to fetch ${limit} NFT items from GetGems API (offset: ${offset})...`);
      }
      
      const query = `
        query GetCollectionItems($address: String!, $limit: Int!, $offset: Int!) {
          nftItemsByCollection(
            address: $address
            limit: $limit
            offset: $offset
          ) {
            total
            items {
              address
              index
              collection_address
              owner_address
              content {
                name
                description
                image
                attributes {
                  trait_type
                  value
                }
              }
              sale {
                address
                price {
                  token_name
                  value
                }
                is_auction
              }
              previews {
                resolution
                url
              }
            }
          }
        }
      `;

      const data = await this.makeRequest<any>(query, { 
        address: collectionAddress, 
        limit, 
        offset 
      });

      if (data.data?.nftItemsByCollection) {
        if (isDevelopment) {
          console.log('✅ Successfully fetched NFT items from GetGems API');
        }
        return {
          data: data.data.nftItemsByCollection.items || [],
          total: data.data.nftItemsByCollection.total || 0,
          limit,
          offset
        };
      }
      
      throw new Error('No NFT items data returned from API');
    } catch (error) {
      // Silent fallback to mock data without console warnings
      if (isDevelopment && offset === 0) {
        console.log('📋 Loading demo NFT collection for MANETKA showcase');
      }
      
      // Return mock data with pagination
      return this.getFallbackItems(limit, offset);
    }
  }

  private getFallbackItems(limit: number, offset: number): GetGemsResponse<GetGemsNFTItem[]> {
    const startIndex = offset;
    const endIndex = startIndex + limit;
    const items = MOCK_NFT_ITEMS.slice(startIndex, endIndex);
    
    return {
      data: items,
      total: MOCK_NFT_ITEMS.length,
      limit,
      offset
    };
  }

  async getNFTItem(address: string): Promise<GetGemsNFTItem | null> {
    try {
      if (isDevelopment && !this.useMockData) {
        console.log(`🔍 Attempting to fetch NFT item ${address} from GetGems API...`);
      }
      
      const query = `
        query GetNFTItem($address: String!) {
          nftItem(address: $address) {
            address
            index
            collection_address
            owner_address
            content {
              name
              description
              image
              attributes {
                trait_type
                value
              }
            }
            sale {
              address
              price {
                token_name
                value
              }
              is_auction
            }
            previews {
              resolution
              url
            }
          }
        }
      `;

      const data = await this.makeRequest<any>(query, { address });
      
      if (data.data?.nftItem) {
        if (isDevelopment) {
          console.log('✅ Successfully fetched NFT item from GetGems API');
        }
        return data.data.nftItem;
      }
      
      return null;
    } catch (error) {
      // Silent fallback to mock data
      const mockItem = MOCK_NFT_ITEMS.find(nft => nft.address === address);
      return mockItem || null;
    }
  }

  // Утилитарные методы
  isUserOwner(nftItem: GetGemsNFTItem): boolean {
    return nftItem.owner_address === USER_ADDRESS;
  }

  isForSale(nftItem: GetGemsNFTItem): boolean {
    return !!nftItem.sale;
  }

  getRarity(nftItem: GetGemsNFTItem): string {
    const rarityAttr = nftItem.content.attributes?.find(
      attr => attr.trait_type === "Rarity"
    );
    return rarityAttr?.value as string || "COMMON";
  }

  getBoost(nftItem: GetGemsNFTItem): number {
    const boostAttr = nftItem.content.attributes?.find(
      attr => attr.trait_type === "Boost"
    );
    return Number(boostAttr?.value) || 0;
  }

  getPriceInTON(nftItem: GetGemsNFTItem): number {
    if (!nftItem.sale) return 0;
    return parseFloat(nftItem.sale.price.value);
  }

  getImageUrl(nftItem: GetGemsNFTItem): string {
    // Предпочитаем preview, если есть, иначе основное изображение
    if (nftItem.previews && nftItem.previews.length > 0) {
      return nftItem.previews[0].url;
    }
    return nftItem.content.image;
  }

  // Метод для получения URL маркетплейса
  getMarketplaceUrl(nftAddress: string): string {
    return `https://getgems.io/nft/${nftAddress}`;
  }

  getCollectionUrl(collectionAddress: string): string {
    return `https://getgems.io/collection/${collectionAddress}`;
  }

  // Проверка доступности API
  async isApiReady(): Promise<boolean> {
    return !this.useMockData && await this.testApiConnection();
  }

  // Получить статус API
  getApiStatus(): 'available' | 'demo' {
    return this.useMockData ? 'demo' : 'available';
  }

  // Check if using mock data
  isUsingMockData(): boolean {
    return this.useMockData;
  }
}

// Экспортируем singleton instance
export const getGemsAPI = new GetGemsAPI();

// Утилитарные функции для работы с NFT данными
export const NFTUtils = {
  formatTONPrice: (price: number): string => {
    if (price === 0) return 'Not for sale';
    return `${price.toFixed(1)} TON`;
  },

  getRarityColor: (rarity: string): string => {
    switch (rarity.toUpperCase()) {
      case 'RARE': 
        return 'bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-700';
      case 'EPIC': 
        return 'bg-purple-100 text-purple-700 border-purple-200 dark:bg-purple-900/30 dark:text-purple-300 dark:border-purple-700';
      case 'LEGENDARY': 
        return 'bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-300 dark:border-amber-700';
      default: 
        return 'bg-muted text-muted-foreground border-border';
    }
  },

  getRarityWeight: (rarity: string): number => {
    switch (rarity.toUpperCase()) {
      case 'RARE': return 1;
      case 'EPIC': return 2;
      case 'LEGENDARY': return 3;
      default: return 0;
    }
  },

  getGradientColor: (rarity: string): string => {
    switch (rarity.toUpperCase()) {
      case 'RARE': return 'from-blue-400 to-cyan-500';
      case 'EPIC': return 'from-purple-400 to-pink-500';
      case 'LEGENDARY': return 'from-yellow-400 to-orange-500';
      default: return 'from-gray-400 to-gray-500';
    }
  },

  // Функция для парсинга атрибутов из строк (если GetGems возвращает строки)
  parseAttributeValue: (value: string | number): any => {
    if (typeof value === 'number') return value;
    if (typeof value === 'string') {
      // Попытка парсить число
      const parsed = parseFloat(value);
      if (!isNaN(parsed)) return parsed;
      return value;
    }
    return value;
  }
};