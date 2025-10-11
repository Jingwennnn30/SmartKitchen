// Order Creation Service
// This service handles creating new supplier orders via AWS HTTP API Gateway

export interface CreateOrderRequest {
    item_name: string;
    quantity: number;
    status?: 'PENDING' | 'APPROVED';
}

export interface CreateOrderResponse {
    message: string;
    order_id: string;
}

// HTTP API Gateway endpoint
const ORDER_API_URL = "https://0tw2pru7rd.execute-api.us-east-1.amazonaws.com/prod/orders";

class OrderCreationService {
    
    /**
     * Create a new supplier order via AWS Lambda
     * @param orderData - Order details (item_name, quantity, status)
     * @returns Promise with order creation result
     */
    async createOrder(orderData: CreateOrderRequest): Promise<CreateOrderResponse | null> {
        try {
            console.log("📦 Creating new order via AWS API:", orderData);
            console.log("🔗 API Endpoint:", ORDER_API_URL);
            
            const response = await fetch(ORDER_API_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                },
                body: JSON.stringify(orderData)
            });
            
            console.log("📡 API Response status:", response.status);
            console.log("📡 API Response headers:", response.headers);
            
            if (!response.ok) {
                const errorText = await response.text();
                console.error("❌ API Error Response:", errorText);
                console.error("❌ Full response:", response);
                throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
            }
            
            const responseText = await response.text();
            console.log("📄 Raw response text:", responseText);
            
            let result: CreateOrderResponse;
            try {
                result = JSON.parse(responseText);
            } catch (parseError) {
                console.error("❌ JSON Parse Error:", parseError);
                console.error("❌ Response was not valid JSON:", responseText);
                throw new Error(`Invalid JSON response: ${responseText}`);
            }
            
            console.log("✅ Order created successfully:", result);
            
            return result;
            
        } catch (error) {
            console.error("❌ Error creating order:", error);
            if (error instanceof TypeError && error.message.includes('fetch')) {
                console.error("❌ Network error - check if API Gateway is accessible");
                console.error("❌ API URL:", ORDER_API_URL);
            }
            return null;
        }
    }
    
    /**
     * Create order with voice assistant context
     * @param itemName - Name of the item to order
     * @param quantity - Quantity to order
     * @param unit - Unit of measurement (optional, for logging)
     * @returns Promise with order creation result
     */
    async createVoiceOrder(itemName: string, quantity: number, unit?: string): Promise<CreateOrderResponse | null> {
        const orderData: CreateOrderRequest = {
            item_name: itemName,
            quantity: quantity,
            status: 'PENDING' // Voice orders start as pending for approval
        };
        
        console.log(`🎤 Voice order request: ${quantity} ${unit || 'units'} of ${itemName}`);
        
        return await this.createOrder(orderData);
    }
    
    /**
     * Create order with manager approval (direct approval)
     * @param itemName - Name of the item to order
     * @param quantity - Quantity to order
     * @param unit - Unit of measurement (optional, for logging)
     * @returns Promise with order creation result
     */
    async createManagerOrder(itemName: string, quantity: number, unit?: string): Promise<CreateOrderResponse | null> {
        const orderData: CreateOrderRequest = {
            item_name: itemName,
            quantity: quantity,
            status: 'APPROVED' // Manager orders are pre-approved
        };
        
        console.log(`👨‍💼 Manager order request: ${quantity} ${unit || 'units'} of ${itemName} (Pre-approved)`);
        
        return await this.createOrder(orderData);
    }
    
    /**
     * Test the API connection
     */
    async testConnection(): Promise<boolean> {
        try {
            console.log("🧪 Testing API connection...");
            console.log("🔗 Testing URL:", ORDER_API_URL);
            
            const testOrder: CreateOrderRequest = {
                item_name: "Test Item",
                quantity: 1,
                status: 'PENDING'
            };
            
            const result = await this.createOrder(testOrder);
            const isConnected = result !== null;
            
            console.log(isConnected ? "✅ API connection test successful" : "❌ API connection test failed");
            return isConnected;
            
        } catch (error) {
            console.error("❌ Connection test failed:", error);
            return false;
        }
    }
    
    /**
     * Quick ping test to check if the API endpoint is reachable
     */
    async pingAPI(): Promise<boolean> {
        try {
            console.log("🏓 Pinging API endpoint...");
            const response = await fetch(ORDER_API_URL, {
                method: 'OPTIONS', // CORS preflight
                headers: {
                    'Content-Type': 'application/json',
                }
            });
            
            console.log("📡 Ping response status:", response.status);
            return response.status < 500; // Any status under 500 means API is reachable
            
        } catch (error) {
            console.error("❌ Ping failed:", error);
            return false;
        }
    }
}

export const orderCreationService = new OrderCreationService();
export default orderCreationService;