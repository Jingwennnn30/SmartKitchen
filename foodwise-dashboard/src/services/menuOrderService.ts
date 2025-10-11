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
}

export interface OrderResponse {
    success: boolean;
    orderId?: string;
    error?: string;
}

// Re-export interfaces from your existing DynamicMenuService for consistency
export interface DynamicMenuItem {
    name: string;
    price: string;
    description: string;
    ingredients: string;
}

export interface DynamicMenuResponse {
    menu: DynamicMenuItem[];
    selectedItems: string[];
    generatedAt: string;
    totalDishes: number;
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
     * Get menu items formatted for your DynamicMenuService interface
     */
    static async getFormattedMenuItems(): Promise<MenuItem[]> {
        try {
            const menuItems = await this.getAllMenuItems();
            
            // Convert to the format expected by your DynamicMenuService
            return menuItems.map(item => ({
                dish_name: item.dish_name,
                price: item.price,
                category: item.category
            }));
        } catch (error) {
            console.error('Error formatting menu items:', error);
            throw error;
        }
    }

    /**
     * Save order to DynamoDB via API Gateway
     */
    static async saveOrder(order: CustomerOrder): Promise<OrderResponse> {
        try {
            console.log('Saving order via API Gateway...', order);
            
            const response = await fetch(SAVE_ORDER_API_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(order)
            });

            console.log('Order API Response Status:', response.status);
            
            if (!response.ok) {
                const errorText = await response.text().catch(() => '');
                console.error('Response error text:', errorText);
                throw new Error(`Failed to save order: ${errorText}`);
            }

            const data: OrderResponse = await response.json();
            
            if (!data.success) {
                throw new Error(data.error || 'Failed to save order');
            }

            console.log('Order saved successfully:', data);
            return data;
            
        } catch (error) {
            console.error('Error saving order:', error);
            
            // Handle CORS-related fetch errors gracefully
            if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
                console.error('This looks like a CORS error. Check your API Gateway CORS settings.');
                throw new Error('CORS error: Unable to save order. Please check API Gateway CORS configuration.');
            }
            
            throw error;
        }
    }
}