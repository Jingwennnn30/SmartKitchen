// src/services/ForecastService.ts
const TOP_DISHES_API_BASE_URL = "https://6cto7ih2jl.execute-api.us-east-1.amazonaws.com/default/pre-dining-preparation";

export interface ForecastDish {
    dishName: string;
    forecast_sales: number;
    ingredients: string[];
}

export interface ForecastResponse {
    date: string;
    top_dishes: ForecastDish[];
}

export const getForecastData = async (): Promise<ForecastResponse> => {
    try {
        const response = await fetch(TOP_DISHES_API_BASE_URL);
        if (!response.ok) throw new Error("Failed to fetch forecast data");
        return await response.json();
    } catch (error) {
        console.error("Error fetching forecast:", error);
        throw error;
    }
};