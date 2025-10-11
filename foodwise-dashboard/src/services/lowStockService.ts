const api = "https://abzg8rzgu7.execute-api.us-east-1.amazonaws.com/default/detect-low-stock";

export interface LowStockItem {
  item_name: string;
  unit: string;
  current_stock: number;
  safety_stock_level: number;
  is_low_stock: boolean;
}

export const fetchLowStockData = async (): Promise<LowStockItem[]> => {
  try {
    const response = await fetch(api, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const data = await response.json();

    let result: any;
    if (Array.isArray(data)) {
      result = data;
    } else if (typeof data.body === "string") {
      result = JSON.parse(data.body);
    } else if (Array.isArray(data.body)) {
      result = data.body;
    } else {
      console.warn("Unexpected API response format:", data);
      result = [];
    }

    return result.map((item: any) => ({
      item_name: item.item_name,
      unit: item.unit,
      current_stock: item.current_stock,
      safety_stock_level: item.safety_stock_level,
      is_low_stock: item.is_low_stock,
    }));
  } catch (error) {
    console.error("Failed to fetch low stock data:", error);
    return [];
  }
};

