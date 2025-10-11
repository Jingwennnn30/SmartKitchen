const api = "https://3lgobffvjb.execute-api.us-east-1.amazonaws.com/default/retrieve-order-queue";

export interface OrderDish {
    dish_name: string;
    order_completed_time: string | null;
    order_placed_time: string;
    quantity: number;
}

export interface OrderQueueItem {
    order_id: string;
    customer_id: string;
    dishes: OrderDish[];
}

export async function completeOrderDish(order_id: string, dish_name: string): Promise<void> {
  const api =
    "https://ywaunex139.execute-api.us-east-1.amazonaws.com/default/update-order-completed-time";

  console.log("🟡 Sending PATCH request:", { order_id, dish_name });

  try {
    const response = await fetch(api, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ order_id, dish_name }),
    });

    console.log("🟢 PATCH response status:", response.status);

    // Optional: Log response text for debugging
    const text = await response.text();
    console.log("🧩 PATCH response body:", text);

    if (!response.ok) {
      throw new Error(`Request failed with status ${response.status}: ${text}`);
    }

  } catch (error) {
    console.error("🔴 Error completing order dish:", error);
  }
}


/**
 * Fetch ongoing (uncompleted) orders for today.
 * Data comes from Lambda (customer_waiting_time table).
 */
export async function fetchOrderQueue(): Promise<OrderQueueItem[]> {
    try {
        console.log("Fetching order queue data from", api);

        const response = await fetch(api, { method: "GET" });
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

        const data: OrderQueueItem[] = await response.json();

        // (Optional) Sort by order_placed_time ascending (oldest first)
        const getEarliestTime = (order: OrderQueueItem) => {
            const times = order.dishes.map(d => new Date(d.order_placed_time).getTime());
            return Math.min(...times);
        };

        const sorted = data.slice().sort((a, b) => getEarliestTime(a) - getEarliestTime(b));

        console.log("Fetched (sorted) order queue data:", sorted);
        return sorted;
    } catch (error) {
        console.error("Failed to fetch order queue data:", error);
        throw error;
    }
}
