const api = "https://0urkw75ank.execute-api.us-east-1.amazonaws.com/dev/retrieve-seasoning-restock-prediction";

export interface SeasoningRestockItem {
    item_id: string;
    item_name: string;
    last_purchase_date: string | null;
    last_purchase_quantity: number | string | null;
    next_restock_date: string | null;
    predicted_quantity: number;
}

export async function fetchSeasoningRestockPrediction(): Promise<SeasoningRestockItem[]> {
    // try {
    //     console.log("Fetching seasoning restock prediction data from", api);

    //     const response = await fetch(api, { method: "GET" });
    //     if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

    //     const data: SeasoningRestockItem[] = await response.json();

    //     // Sort by next_restock_date (earliest first). Null/invalid dates are pushed to the end.
    //     const toTime = (d: string | null) => {
    //         if (!d) return Infinity;
    //         const t = new Date(d).getTime();
    //         return isNaN(t) ? Infinity : t;
    //     };

    //     const sorted = data.slice().sort((a, b) => toTime(a.next_restock_date) - toTime(b.next_restock_date));

    //     console.log("Fetched (sorted) seasoning restock data:", sorted);
    //     return sorted;
    // } catch (error) {
    //     console.error("Failed to fetch seasoning restock prediction:", error);
    //     throw error;
    // }
    // Mocked data for development/testing
    await new Promise<void>(r => setTimeout(r, 150)); // simulate network latency

    const data: SeasoningRestockItem[] = [
        {
            item_id: "s1",
            item_name: "Black Pepper",
            last_purchase_date: "2025-09-01",
            last_purchase_quantity: 1,
            next_restock_date: "2025-10-01",
            predicted_quantity: 2,
        },
        {
            item_id: "s2",
            item_name: "Sea Salt",
            last_purchase_date: "2025-08-15",
            last_purchase_quantity: "2",
            next_restock_date: "2025-09-15",
            predicted_quantity: 2,
        },
        {
            item_id: "s3",
            item_name: "Paprika",
            last_purchase_date: "2025-06-10",
            last_purchase_quantity: 1,
            next_restock_date: "2025-09-20",
            predicted_quantity: 1,
        },
        {
            item_id: "s4",
            item_name: "Cumin",
            last_purchase_date: "2025-05-01",
            last_purchase_quantity: 1,
            next_restock_date: "2025-08-01",
            predicted_quantity: 3,
        },
        {
            item_id: "s5",
            item_name: "Oregano",
            last_purchase_date: "2025-07-30",
            last_purchase_quantity: 1,
            next_restock_date: "2025-09-10",
            predicted_quantity: 1,
        },
    ];

    const toTime = (d: string | null) => {
        if (!d) return Infinity;
        const t = new Date(d).getTime();
        return isNaN(t) ? Infinity : t;
    };

    return data.slice().sort((a, b) => toTime(a.next_restock_date) - toTime(b.next_restock_date));
}