// src/services/restockPredictionService.ts
const API_URL = "https://z5btynvtz7.execute-api.us-east-1.amazonaws.com/dev/restock-prediction-logic";

export interface RestockItem {
  ingredient: string;
  needed: number;
  stockquantity: number;
  restock_needed: number;
  unit: string;
}

export interface RestockPredictionResponse {
  date: string;
  restock: RestockItem[];
}

export async function fetchRestockPrediction(): Promise<RestockPredictionResponse> {
  try {
    console.log("Fetching restock prediction data from ", API_URL);
    const response = await fetch(API_URL, {
      method: "GET",
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data: RestockPredictionResponse = await response.json();
    return data;
  } catch (error) {
    console.error("Failed to fetch restock prediction:", error);
    throw error;
  }
}
