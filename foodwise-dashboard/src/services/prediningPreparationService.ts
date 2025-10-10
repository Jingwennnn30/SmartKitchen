// src/services/prediningPreparationService.ts (or performanceService.ts)
const TOP_DISHES_API_BASE_URL = "https://2dn3j6h8u2.execute-api.us-east-1.amazonaws.com/dev/top-5-dishes";

export interface ForecastDish {
    dishName: string;
    predicted_sales: number;
    explanation: string;
}

export interface ForecastResponse {
    date: string;
    top_4_main_course: ForecastDish[];
}

export const getForecastData = async (customDate?: string): Promise<ForecastResponse> => {
    try {
        // Default to tomorrow from current date (Oct 10, 2025 → Oct 11)
        const today = new Date('2025-10-10');
        const forecastDate = customDate || new Date(today.getTime() + 24 * 60 * 60 * 1000).toISOString().split('T')[0];
        
        const url = new URL(TOP_DISHES_API_BASE_URL);
        url.searchParams.append('date', forecastDate);  // e.g., ?date=2025-10-11
        
        console.log("🔗 Calling API:", url.toString());
        
        const response = await fetch(url.toString(), {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
            },
            mode: 'cors',
        });
        
        console.log("📡 Response status:", response.status);
        console.log("📡 Response ok:", response.ok);
        console.log("📡 Response headers:", Object.fromEntries(response.headers.entries()));
        
        if (!response.ok) {
            const errorText = await response.text();
            console.error("❌ Response error text:", errorText);
            throw new Error(`Failed to fetch forecast data: ${response.status} ${response.statusText} - ${errorText}`);
        }
        
        const data: ForecastResponse = await response.json();
        console.log("📦 Service received data:", data);
        return data;
    } catch (error) {
        console.error("❌ Service error:", error);
        if (error instanceof Error) {
            console.error("❌ Error name:", error.name);
            console.error("❌ Error message:", error.message);
        }
        
        throw error;
    }
};