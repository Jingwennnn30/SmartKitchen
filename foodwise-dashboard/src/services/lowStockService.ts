const api = "https://abzg8rzgu7.execute-api.us-east-1.amazonaws.com/default/detect-low-stock";

export interface LowStockItem {
  item_name: string;
  unit: string;
  current_stock: number;
  safety_stock_level: number;
  is_low_stock: boolean;
}

export const fetchLowStockData = async (): Promise<LowStockItem[]> => {
  // try {
  //   const response = await fetch(api, {
  //     method: "GET",
  //     headers: {
  //       "Content-Type": "application/json",
  //     },
  //   });

  //   if (!response.ok) {
  //     throw new Error(`HTTP error! Status: ${response.status}`);
  //   }

  //   const data = await response.json();

  //   let result: any;
  //   if (Array.isArray(data)) {
  //     result = data;
  //   } else if (typeof data.body === "string") {
  //     result = JSON.parse(data.body);
  //   } else if (Array.isArray(data.body)) {
  //     result = data.body;
  //   } else {
  //     console.warn("Unexpected API response format:", data);
  //     result = [];
  //   }

  //   return result.map((item: any) => ({
  //     item_name: item.item_name,
  //     unit: item.unit,
  //     current_stock: item.current_stock,
  //     safety_stock_level: item.safety_stock_level,
  //     is_low_stock: item.is_low_stock,
  //   }));
  // } catch (error) {
  //   console.error("Failed to fetch low stock data:", error);
  //   return [];
  // }
  const mockBase = [
    { item_name: "Whole Milk", unit: "L", current_stock: 2, safety_stock_level: 5 },
    { item_name: "Eggs", unit: "pcs", current_stock: 12, safety_stock_level: 30 },
    { item_name: "All-purpose Flour", unit: "kg", current_stock: 10, safety_stock_level: 5 },
    { item_name: "Granulated Sugar", unit: "kg", current_stock: 1, safety_stock_level: 2 },
    { item_name: "Olive Oil", unit: "L", current_stock: 3, safety_stock_level: 2 },
    { item_name: "Rice (Jasmine)", unit: "kg", current_stock: 0, safety_stock_level: 1 },
    { item_name: "Butter", unit: "g", current_stock: 300, safety_stock_level: 200 },
  ];

  const result: LowStockItem[] = mockBase.map((item) => ({
    ...item,
    is_low_stock: item.current_stock < item.safety_stock_level,
  }));

  // simulate small network delay
  await new Promise((resolve) => setTimeout(resolve, 150));

  return result;
};

