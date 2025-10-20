// const apiUrl = "https://jj5e1340dk.execute-api.us-east-1.amazonaws.com/default/aggregate-order";

// export interface AggregatedOrder {
//   dish_name: string;
//   total_quantity: number;
//   order_ids: string[];
// }

// /**
//  * Fetch aggregated orders from API Gateway (Lambda backend)
//  */
// export async function fetchAggregatedOrders(): Promise<AggregatedOrder[]> {
//   // try {
//   //   const response = await fetch(apiUrl, {
//   //     method: "GET",
//   //     headers: {
//   //       "Content-Type": "application/json",
//   //     },
//   //   });

//   //   if (!response.ok) {
//   //     throw new Error(`Failed to fetch orders: ${response.statusText}`);
//   //   }

//   //   const data = await response.json();

//   //   // Defensive check: ensure structure is correct
//   //   if (!data.aggregated_orders || !Array.isArray(data.aggregated_orders)) {
//   //     console.error("Unexpected API response:", data);
//   //     return [];
//   //   }

//   //   // Map API data to typed AggregatedOrder list
//   //   return data.aggregated_orders.map((item: any) => ({
//   //     dish_name: item.dish_name,
//   //     total_quantity: Number(item.total_quantity),
//   //     order_ids: item.order_ids || [],
//   //   }));
//   // } catch (error) {
//   //   console.error("Error fetching aggregated orders:", error);
//   //   return [];
//   // }
  
// }

import { fetchOrderQueue, OrderQueueItem } from "./orderQueueService";

export interface AggregatedOrder {
  dish_name: string;
  total_quantity: number;
  order_ids: string[];
}

/**
 * Aggregate dishes from orderQueueService:
 * - Groups by dish_name
 * - Sums up total quantity
 * - Collects all order_ids that contain that dish
 */
export async function fetchAggregatedOrders(): Promise<AggregatedOrder[]> {
  try {
    // ✅ Fetch raw mock data
    const orders: OrderQueueItem[] = await fetchOrderQueue();

    // ✅ Use a Map for efficient aggregation
    const aggregatedMap = new Map<string, AggregatedOrder>();

    for (const order of orders) {
      for (const dish of order.dishes) {
        const existing = aggregatedMap.get(dish.dish_name);

        if (existing) {
          existing.total_quantity += dish.quantity;
          if (!existing.order_ids.includes(order.order_id)) {
            existing.order_ids.push(order.order_id);
          }
        } else {
          aggregatedMap.set(dish.dish_name, {
            dish_name: dish.dish_name,
            total_quantity: dish.quantity,
            order_ids: [order.order_id],
          });
        }
      }
    }

    // ✅ Convert to array and sort by total quantity (descending)
    const aggregatedArray = Array.from(aggregatedMap.values()).sort(
      (a, b) => b.total_quantity - a.total_quantity
    );

    console.log("✅ Aggregated Orders:", aggregatedArray);
    return aggregatedArray;
  } catch (error) {
    console.error("🔴 Error aggregating orders:", error);
    return [];
  }
}
