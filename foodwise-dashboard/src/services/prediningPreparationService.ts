// src/services/prediningPreparationService.ts (or performanceService.ts)
const TOP_DISHES_API_BASE_URL = "https://2dn3j6h8u2.execute-api.us-east-1.amazonaws.com/dev/top-5-dishes";

// Keep your original clean interface
export interface ForecastDish {
    dishName: string;  // Keep the camelCase version
    predicted_sales: number;
    explanation: string;
}

export interface ForecastResponse {
    date: string;
    top_4_main_course: ForecastDish[];
}

// Internal interface matching Lambda response
interface LambdaForecastDish {
    dish_name: string;
    predicted_sales: number;
    explanation: string;
}

interface LambdaForecastResponse {
    date: string;
    top_4_main_course: LambdaForecastDish[];
}

interface LambdaApiResponse {
    statusCode: number;
    body: string;
}

export const getForecastData = async (customDate?: string): Promise<ForecastResponse> => {
    try {
        // Default to tomorrow from current date (Oct 10, 2025 → Oct 11)  
        const today = new Date('2025-10-10');
        const forecastDate = customDate || new Date(today.getTime() + 24 * 60 * 60 * 1000).toISOString().split('T')[0];
        
        const url = new URL(TOP_DISHES_API_BASE_URL);
        url.searchParams.append('date', forecastDate);
        
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
        
        if (!response.ok) {
            const errorText = await response.text();
            console.error("❌ Response error text:", errorText);
            throw new Error(`Failed to fetch forecast data: ${response.status} ${response.statusText}`);
        }
        
        const responseData = await response.json();
        console.log("📦 Raw response:", responseData);
        
        // Handle different response formats
        let actualData: LambdaForecastResponse;
        
        if (responseData.statusCode && responseData.body) {
            // Lambda API Gateway format: {statusCode: 200, body: "stringified JSON"}
            console.log("📦 Parsing Lambda API Gateway response");
            actualData = JSON.parse(responseData.body);
        } else if (responseData.date && responseData.top_4_main_course) {
            // Direct response format
            console.log("📦 Using direct response format");
            actualData = responseData;
        } else {
            console.error("❌ Unexpected response format:", responseData);
            throw new Error("Unexpected response format from API");
        }
        
        console.log("📦 Parsed data:", actualData);
        
        // Transform the data to match your frontend interface
        const transformedData: ForecastResponse = {
            date: actualData.date,
            top_4_main_course: actualData.top_4_main_course.map(dish => ({
                dishName: dish.dish_name,  // Transform dish_name to dishName
                predicted_sales: dish.predicted_sales,
                explanation: dish.explanation
            }))
        };
        
        console.log("📦 Transformed data:", transformedData);
        return transformedData;
        
    } catch (error) {
        console.error("❌ Service error:", error);
        if (error instanceof Error) {
            console.error("❌ Error name:", error.name);
            console.error("❌ Error message:", error.message);
        }
        
        throw error;
    }
};