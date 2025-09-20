// API service for fetching discount data from AWS Lambda
const DISCOUNT_API_BASE_URL = 'https://wwgwbhhhf5.execute-api.us-east-1.amazonaws.com/dev';

export interface DiscountItem {
    dish: string;
    promotion_title: string;
    promotion_price: string;
    promotion_description: string;
    time: string;
}

export interface DiscountResponse {
    discounts: DiscountItem[];
}

export class DiscountService {
    static async getDiscounts(): Promise<DiscountItem[]> {
        try {
            console.log('Fetching discounts from:', `${DISCOUNT_API_BASE_URL}/discounts`);
            
            // Simplified fetch to avoid CORS issues
            const response = await fetch(`${DISCOUNT_API_BASE_URL}/discounts`);

            console.log('Discount API Response status:', response.status);

            if (!response.ok) {
                const errorText = await response.text();
                console.error('Discount API error text:', errorText);
                throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
            }

            const data: DiscountResponse = await response.json();
            console.log('Received discount data:', data);
            return data.discounts;
        } catch (error) {
            console.error('Error fetching discounts:', error);
            
            // Check if it's a network/CORS error
            if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
                console.error('This looks like a CORS error. Check your discount API Gateway CORS settings.');
                throw new Error('CORS error: Unable to fetch discount data from API. Please check API Gateway CORS configuration.');
            }
            
            throw error;
        }
    }

    // Helper function to extract percentage discount from description
    static extractDiscountPercentage(description: string): string | null {
        const match = description.match(/(\d+)%\s*off/i);
        return match ? `${match[1]}% OFF` : null;
    }

    // Helper function to format price
    static formatPrice(price: string): string {
        const numPrice = parseFloat(price);
        return isNaN(numPrice) ? price : `RM ${numPrice.toFixed(2)}`;
    }
}