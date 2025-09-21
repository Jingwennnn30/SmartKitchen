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

export class DynamicMenuService {
    private static readonly BASE_URL = 'https://ib7kg5hiy3.execute-api.us-east-1.amazonaws.com/dev'; // Your actual API Gateway URL
    
    static async generateDynamicMenu(selectedItems: string[]): Promise<DynamicMenuResponse> {
        try {
            console.log('Generating dynamic menu for items:', selectedItems);
            
            // First try API Gateway
            // Use GET with query parameters to avoid preflight
            const queryParams = new URLSearchParams({
                selectedItems: JSON.stringify(selectedItems)
            });
            
            const response = await fetch(`${this.BASE_URL}/sendback?${queryParams}`, {
                method: 'GET'
            });

            console.log('API Response Status:', response.status);
            console.log('API Response Headers:', response.headers);

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            console.log('Dynamic menu generated successfully:', data);
            return data;
            
        } catch (error) {
            console.error('Error generating dynamic menu:', error);
            
            // Return mock data that matches your Lambda output for testing
            return {
                menu: [
                    {
                        name: "Crispy Tofu Fritters",
                        price: "MYR 18",
                        description: "Crunchy and flavorful fritters made with tofu and flour",
                        ingredients: "Tofu (200g), Flour (100g), Egg (2)"
                    },
                    {
                        name: "Tofu Omelette", 
                        price: "MYR 12",
                        description: "A fluffy and savory omelette filled with tofu and egg",
                        ingredients: "Tofu (100g), Egg (2), Flour (10g)"
                    },
                    {
                        name: "Tofu and Egg Crepes",
                        price: "MYR 20", 
                        description: "Thin and delicate crepes filled with scrambled tofu and egg",
                        ingredients: "Tofu (150g), Egg (2), Flour (150g)"
                    }
                ],
                selectedItems: selectedItems,
                generatedAt: new Date().toISOString(),
                totalDishes: 3
            };
        }
    }
}