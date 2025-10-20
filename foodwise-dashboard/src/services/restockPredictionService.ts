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
  // try {
  //   console.log("Fetching restock prediction data from", API_URL);
  //   const response = await fetch(API_URL);

  //   if (!response.ok) {
  //     throw new Error(`HTTP error! status: ${response.status}`);
  //   }

  //   const data: RestockItem[] = await response.json();
  //   console.log("Restock data received:", data);
  //   return data;
  // } catch (error) {
  //   console.error("Failed to fetch restock prediction:", error);
  //   throw error;
  // }
  // simulate network latency
  await new Promise((r) => setTimeout(r, 150));

  const base = [
    { ingredient: "Tomatoes", unit: "kg", current_stock: 12, predicted_usage: 8, safety_stock_level: 5 },
    { ingredient: "Lettuce", unit: "heads", current_stock: 20, predicted_usage: 5, safety_stock_level: 3 },
    { ingredient: "Milk", unit: "L", current_stock: 5, predicted_usage: 6, safety_stock_level: 2 },
    { ingredient: "Olive Oil", unit: "L", current_stock: 3, predicted_usage: 1, safety_stock_level: 1 },
    { ingredient: "Eggs", unit: "dozen", current_stock: 2, predicted_usage: 4, safety_stock_level: 1 },
  ];

  const mockData: RestockItem[] = base.map((it) => {
    const remaining_stock = it.current_stock - it.predicted_usage;
    return { ...it, remaining_stock, need_restock: remaining_stock <= it.safety_stock_level };
  });

  return mockData;
}

