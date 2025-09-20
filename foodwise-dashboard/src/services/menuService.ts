// API service for fetching dynamic menu data from AWS Lambda
const API_BASE_URL = 'https://ib7kg5hiy3.execute-api.us-east-1.amazonaws.com/dev';

export interface MenuItem {
    name: string;
    price: string;
    description: string;
    ingredients: string;
}

export interface MenuResponse {
    menu: MenuItem[];
}

export class MenuService {
    static async getDynamicMenu(): Promise<MenuItem[]> {
        try {
            console.log('Fetching dynamic menu from:', `${API_BASE_URL}/menu_test`);
            
            // Simplified fetch to match the working test button
            const response = await fetch(`${API_BASE_URL}/menu_test`);

            console.log('Response status:', response.status);

            if (!response.ok) {
                const errorText = await response.text();
                console.error('Response error text:', errorText);
                throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
            }

            const data: MenuResponse = await response.json();
            console.log('Received data:', data);
            return data.menu;
        } catch (error) {
            console.error('Error fetching dynamic menu:', error);
            
            // Check if it's a network/CORS error
            if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
                console.error('This looks like a CORS error. Check your API Gateway CORS settings.');
                throw new Error('CORS error: Unable to fetch data from API. Please check API Gateway CORS configuration.');
            }
            
            throw error;
        }
    }

    // Helper function to parse ingredients string into array and remove quantities
    static parseIngredients(ingredientsString: string): string[] {
        // Check if ingredientsString is null, undefined, or not a string
        if (!ingredientsString || typeof ingredientsString !== 'string') {
            return [];
        }
        
        return ingredientsString
            .split(',')
            .map(ingredient => {
                // Remove quantities in parentheses like (100g), (2 slices), etc.
                const cleaned = ingredient.trim().replace(/\s*\([^)]*\)/g, '');
                return cleaned.trim();
            })
            .filter(ingredient => ingredient.length > 0);
    }

    // Helper function to extract price number from price string
    static extractPrice(priceString: string): number {
        const match = priceString.match(/[\d.]+/);
        return match ? parseFloat(match[0]) : 0;
    }
}