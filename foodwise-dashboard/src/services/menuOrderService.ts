const MENU_API_URL = 'https://k53br9824i.execute-api.us-east-1.amazonaws.com/dev/customer_waiting_time_retrieve';
const SAVE_ORDER_API_URL = 'https://2buh9e5j4d.execute-api.us-east-1.amazonaws.com/dev/order_insert';

export interface MenuItem {
    dish_name: string;
    price: number;
    category: string;
}

export interface MenuResponse {
    success: boolean;
    menu: MenuItem[];
    count: number;
    error?: string;
}

export interface OrderItem {
    dish_name: string;
    quantity: number;
    price: number;
}

export interface CustomerOrder {
    customerName: string;
    tableNumber: string;
    items: OrderItem[];
    totalAmount: number;
    specialRequests?: string;
    orderDate?: string;
    status?: 'pending' | 'processing' | 'completed' | 'cancelled';
}

export interface OrderResponse {
    success: boolean;
    orderId?: string;
    error?: string;
}

export class MenuService {
    /**
     * Fetch all menu items from DynamoDB via API Gateway
     */
    static async getAllMenuItems(): Promise<MenuItem[]> {
        try {
            console.log('Fetching menu items from API Gateway...');
            
            const response = await fetch(MENU_API_URL, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                }
            });

            console.log('Menu API Response Status:', response.status);
            
            if (!response.ok) {
                const errorText = await response.text().catch(() => '');
                console.error('Response error text:', errorText);
                throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
            }

            const data: MenuResponse = await response.json();
            
            if (!data.success) {
                throw new Error(data.error || 'Failed to fetch menu items');
            }

            console.log('Menu items fetched successfully:', data.menu);
            return data.menu;
            
        } catch (error) {
            console.error('Error fetching menu items:', error);
            
            // Handle CORS-related fetch errors gracefully
            if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
                console.error('This looks like a CORS error. Check your API Gateway CORS settings.');
                throw new Error('CORS error: Unable to fetch data from API. Please check API Gateway CORS configuration.');
            }
            
            throw error;
        }
    }

    /**
     * Save order to DynamoDB via API Gateway
     * 
     * @param order CustomerOrder object with order details
     * @returns OrderResponse with success status and orderId if successful
     * @throws Error if the order cannot be saved
     */
    static async saveOrder(order: CustomerOrder): Promise<OrderResponse> {
        try {
            console.log('Saving order via API Gateway...', order);
            
            // Validate order data before sending to API
            if (!order.customerName || !order.tableNumber) {
                throw new Error('Customer name and table number are required');
            }
            
            if (!order.items || order.items.length === 0) {
                throw new Error('Order must contain at least one item');
            }
            
            // Send order to API Gateway endpoint
            const response = await fetch(SAVE_ORDER_API_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify(order)
            });

            console.log('Order API Response Status:', response.status);
            
            // Handle API errors
            if (!response.ok) {
                const errorText = await response.text().catch(() => '');
                console.error('Response error text:', errorText);
                throw new Error(`Server error: ${response.status} - ${errorText || response.statusText}`);
            }

            // Parse response data
            const data: OrderResponse = await response.json();
            
            // Check for success flag in response
            if (!data.success) {
                throw new Error(data.error || 'Order was not saved successfully');
            }

            console.log('Order saved successfully:', data);
            return data;
            
        } catch (error) {
            console.error('Error saving order:', error);
            
            // Handle different types of errors
            if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
                console.error('This looks like a CORS error or network issue.');
                throw new Error('Network error: Unable to save order. Please check your internet connection.');
            } else if (error instanceof SyntaxError) {
                throw new Error('Invalid response from server. Please try again.');
            }
            
            // Re-throw the original error if not handled above
            throw error;
        }
    }
}