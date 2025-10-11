const apiUrl = "https://jj5e1340dk.execute-api.us-east-1.amazonaws.com/default/aggregate-order";

export interface AggregatedOrder {
  dish_name: string;
  total_quantity: number;
  order_ids: string[];
}

/**
 * Fetch aggregated orders from API Gateway (Lambda backend)
 */
export async function fetchAggregatedOrders(): Promise<AggregatedOrder[]> {
  try {
    const response = await fetch(apiUrl, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch orders: ${response.statusText}`);
    }

    const data = await response.json();

    // Defensive check: ensure structure is correct
    if (!data.aggregated_orders || !Array.isArray(data.aggregated_orders)) {
      console.error("Unexpected API response:", data);
      return [];
    }

    // Map API data to typed AggregatedOrder list
    return data.aggregated_orders.map((item: any) => ({
      dish_name: item.dish_name,
      total_quantity: Number(item.total_quantity),
      order_ids: item.order_ids || [],
    }));
  } catch (error) {
    console.error("Error fetching aggregated orders:", error);
    return [];
  }
}
