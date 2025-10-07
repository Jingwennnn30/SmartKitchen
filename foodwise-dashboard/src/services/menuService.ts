// API service for fetching and saving dynamic menu data from AWS Lambda

const API_BASE_URL = 'https://2wmnd2im5g.execute-api.us-east-1.amazonaws.com/dev';
const SAVE_MENU_API_URL = 'https://xt7bcfvreg.execute-api.us-east-1.amazonaws.com/dev/savemenu';

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
    // ✅ Fetch dynamic menu items from the Lambda function
    static async getDynamicMenu(): Promise<MenuItem[]> {
        try {
            console.log('Fetching dynamic menu from:', `${API_BASE_URL}/menu_test`);

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

            // Handle CORS-related fetch errors gracefully
            if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
                console.error('This looks like a CORS error. Check your API Gateway CORS settings.');
                throw new Error('CORS error: Unable to fetch data from API. Please check API Gateway CORS configuration.');
            }

            throw error;
        }
    }

    // ✅ Save a dynamic dish into DynamoDB via Lambda
    static async saveDynamicDish(item: MenuItem): Promise<void> {
        try {
            const numericPrice = MenuService.extractPrice(item.price);

            // ✅ Formula: cost = 50% of price
            const cost = numericPrice * 0.5;

            const response = await fetch(SAVE_MENU_API_URL, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    name: item.name,
                    cost: cost.toFixed(2),             // store with 2 decimals
                    price: numericPrice,               // numeric for backend
                    price_display: item.price,         // e.g. "MYR 18"
                    prep_time_min: 15,
                    subcategory: "AI Suggestions"
                })
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Failed to save dish: ${errorText}`);
            }

            const result = await response.json();
            console.log("✅ Dish saved successfully:", result);
        } catch (error) {
            console.error("❌ Error saving dynamic dish:", error);
            throw error;
        }
    }


    // ✅ Helper: Parse ingredients string into array and remove quantities
    static parseIngredients(ingredientsString: string): string[] {
        if (!ingredientsString || typeof ingredientsString !== 'string') {
            return [];
        }

        return ingredientsString
            .split(',')
            .map(ingredient => {
                const cleaned = ingredient.trim().replace(/\s*\([^)]*\)/g, '');
                return cleaned.trim();
            })
            .filter(ingredient => ingredient.length > 0);
    }

    // ✅ Helper: Extract numeric value from price string (e.g., "MYR 18" → 18)
    static extractPrice(priceString: string): number {
        const match = priceString.match(/[\d.]+/);
        return match ? parseFloat(match[0]) : 0;
    }
}
