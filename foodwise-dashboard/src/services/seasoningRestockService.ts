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
    try {
        console.log("Fetching seasoning restock prediction data from", api);

        const response = await fetch(api, { method: "GET" });
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

        const data: SeasoningRestockItem[] = await response.json();

        // Sort by next_restock_date (earliest first). Null/invalid dates are pushed to the end.
        const toTime = (d: string | null) => {
            if (!d) return Infinity;
            const t = new Date(d).getTime();
            return isNaN(t) ? Infinity : t;
        };

        const sorted = data.slice().sort((a, b) => toTime(a.next_restock_date) - toTime(b.next_restock_date));

        console.log("Fetched (sorted) seasoning restock data:", sorted);
        return sorted;
    } catch (error) {
        console.error("Failed to fetch seasoning restock prediction:", error);
        throw error;
    }
}