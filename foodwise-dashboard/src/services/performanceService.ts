// src/services/performanceService.ts
export interface DailyStats {
  orders: number;
  revenue: number;
}

export interface PerformanceResponse {
  summary: {
    total_orders: number;
    total_revenue: number;
    avg_table_size: number;
  };
  daily_breakdown: Record<string, DailyStats>;
  items: any[];
}

export async function fetchPerformanceData(
  startDate?: string,
  endDate?: string
): Promise<PerformanceResponse> {
  const baseUrl = "https://qo9xvx5tv2.execute-api.us-east-1.amazonaws.com/dev/performance";

  const url =
    startDate && endDate
      ? `${baseUrl}?start_date=${startDate}&end_date=${endDate}`
      : baseUrl;

  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Error fetching data: ${res.statusText}`);
  }

  const data = await res.json();
  return data as PerformanceResponse;
}
