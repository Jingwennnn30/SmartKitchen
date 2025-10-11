// src/services/restockPredictionService.ts
const API_URL = "https://t8iln26e8g.execute-api.us-east-1.amazonaws.com/default/item-restock-prediction";

export interface RestockItem {
  ingredient: string;
  unit: string;
  current_stock: number;
  predicted_usage: number;
  remaining_stock: number;
  safety_stock_level: number;
  need_restock: boolean;
}

export type RestockPredictionResponse = RestockItem[];

export async function fetchRestockPrediction(): Promise<RestockItem[]> {
  try {
    console.log("Fetching restock prediction data from", API_URL);
    const response = await fetch(API_URL);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data: RestockItem[] = await response.json();
    console.log("Restock data received:", data);
    return data;
  } catch (error) {
    console.error("Failed to fetch restock prediction:", error);
    throw error;
  }
}

