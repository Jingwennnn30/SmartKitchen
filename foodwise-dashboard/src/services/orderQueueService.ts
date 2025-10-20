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
  // try {
  //     console.log("Fetching order queue data from", api);

  //     const response = await fetch(api, { method: "GET" });
  //     if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

  //     const data: OrderQueueItem[] = await response.json();

  //     // (Optional) Sort by order_placed_time ascending (oldest first)
  //     const getEarliestTime = (order: OrderQueueItem) => {
  //         const times = order.dishes.map(d => new Date(d.order_placed_time).getTime());
  //         return Math.min(...times);
  //     };

  //     const sorted = data.slice().sort((a, b) => getEarliestTime(a) - getEarliestTime(b));

  //     console.log("Fetched (sorted) order queue data:", sorted);
  //     return sorted;
  // } catch (error) {
  //     console.error("Failed to fetch order queue data:", error);
  //     throw error;
  // }
  
  // Mocked data for development/testing
  const secondsAgo = (s: number) => new Date(Date.now() - s * 1000).toISOString();
  const minutesAgo = (m: number) => new Date(Date.now() - m * 60_000).toISOString();

  // Use small second offsets for in-progress items so a live timer will clearly count forward.
  const mock: OrderQueueItem[] = [
    {
      order_id: "ORD-1001",
      customer_id: "CUST-501",
      dishes: [
        {
          dish_name: "Margherita Pizza",
          // just placed ~12 seconds ago so UI timer increments visibly from near zero
          order_placed_time: minutesAgo(5),
          order_completed_time: null,
          quantity: 1,
        },
        {
          dish_name: "Garlic Bread",
          // completed 5 minutes ago
          order_placed_time: minutesAgo(5),
          order_completed_time: minutesAgo(3),
          quantity: 2,
        },
      ],
    },
    {
      order_id: "ORD-1002",
      customer_id: "CUST-502",
      dishes: [
        {
          dish_name: "Spaghetti Bolognese",
          // in progress, placed ~45 seconds ago
          order_placed_time: secondsAgo(45),
          order_completed_time: null,
          quantity: 1,
        },
        {
          dish_name: "Tiramisu",
          // in progress, placed ~30 seconds ago
          order_placed_time: secondsAgo(30),
          order_completed_time: null,
          quantity: 1,
        },
      ],
    },
    {
      order_id: "ORD-1003",
      customer_id: "CUST-503",
      dishes: [
        {
          dish_name: "Caesar Salad",
          order_placed_time: secondsAgo(40),
          order_completed_time: minutesAgo(10),
          quantity: 1,
        },
      ],
    },
  ];

  // keep the small simulated network delay
  await new Promise((res) => setTimeout(res, 150));
  return mock;
}
