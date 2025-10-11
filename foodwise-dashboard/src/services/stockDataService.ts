// Stock Data Service
// This service fetches real stock data from AWS Lambda via API Gateway

export interface StockItem {
  item_id: string;
  item_name: string;
  stockquantity: number;
  safety_stock_level: number;
  unit: string;
  supplier: string;
  storage_location: string;
  expiry_date: string;
  unit_price: number;
}

export interface StockDataResponse {
  success: boolean;
  data: StockItem[];
  total_items: number;
  error?: string;
}

class StockDataService {
  private static readonly API_URL = 'https://gw8fluz284.execute-api.us-east-1.amazonaws.com/stock-data';

  /**
   * Fetch all stock data from Lambda function
   * @returns Promise with stock data response
   */
  static async getStockData(): Promise<StockDataResponse> {
    try {
      console.log('🔄 Fetching stock data from Lambda API...');
      console.log('🔗 API Endpoint:', this.API_URL);
      
      const response = await fetch(this.API_URL, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
      });

      console.log('📡 API Response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ API Error Response:', errorText);
        throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
      }

      const data: StockDataResponse = await response.json();
      console.log('✅ Stock data fetched successfully:', data.total_items, 'items');
      
      return data;
    } catch (error) {
      console.error('❌ Error fetching stock data:', error);
      return {
        success: false,
        data: [],
        total_items: 0,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Get stock items that are below safety levels
   * @returns Promise with low stock items
   */
  static async getLowStockItems(): Promise<StockItem[]> {
    try {
      const response = await this.getStockData();
      if (response.success) {
        return response.data.filter(item => 
          item.stockquantity < (item.safety_stock_level * 1.1) // 10% buffer
        );
      }
      return [];
    } catch (error) {
      console.error('❌ Error fetching low stock items:', error);
      return [];
    }
  }

  /**
   * Get items that need restocking (current stock < safety level)
   * @returns Promise with items needing restock
   */
  static async getRestockItems(): Promise<StockItem[]> {
    try {
      const response = await this.getStockData();
      if (response.success) {
        return response.data.filter(item => 
          item.stockquantity < item.safety_stock_level
        );
      }
      return [];
    } catch (error) {
      console.error('❌ Error fetching restock items:', error);
      return [];
    }
  }

  /**
   * Get stock data formatted for InventoryTable component
   * Maps AWS Lambda response to format expected by InventoryTable
   */
  static async getInventoryTableData(): Promise<any[]> {
    try {
      const response = await this.getStockData();
      if (response.success && response.data) {
        // Map to InventoryTable format
        const mappedData = response.data.map(item => ({
          id: item.item_id,
          item: item.item_name,
          quantity: item.stockquantity.toString(),
          unit: item.unit,
          expiryDate: item.expiry_date,
          status: this.getStockStatus(item),
          location: item.storage_location
        }));
        return mappedData;
      }
      return [];
    } catch (error) {
      console.error('❌ Error mapping inventory table data:', error);
      return [];
    }
  }

  /**
   * Determine stock status based on stock level vs safety level
   */
  private static getStockStatus(item: StockItem): 'Good' | 'Running Soon' | 'Expired' {
    const daysToExpiry = this.getDaysToExpiry(item.expiry_date);
    
    // Check if expired
    if (daysToExpiry < 0) {
      return 'Expired';
    }
    
    // Check if running low or expiring soon
    if (item.stockquantity <= item.safety_stock_level || daysToExpiry <= 7) {
      return 'Running Soon';
    }
    
    return 'Good';
  }

  /**
   * Calculate days until expiry
   */
  private static getDaysToExpiry(expiryDate: string): number {
    const today = new Date();
    const expiry = new Date(expiryDate);
    const timeDiff = expiry.getTime() - today.getTime();
    return Math.ceil(timeDiff / (1000 * 3600 * 24));
  }

  /**
   * Test the API connection
   * @returns Promise indicating if API is reachable
   */
  static async testConnection(): Promise<boolean> {
    try {
      console.log("🧪 Testing Lambda API connection...");
      const response = await fetch(this.API_URL, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      const isConnected = response.status === 200;
      console.log(isConnected ? "✅ Lambda API connection test successful" : "❌ Lambda API connection test failed");
      return isConnected;
      
    } catch (error) {
      console.error("❌ Lambda API connection test failed:", error);
      return false;
    }
  }
}

export default StockDataService;