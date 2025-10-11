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
    selectedStartDate?: string;
    selectedEndDate?: string;
}

// New interfaces for waste analysis
export interface WasteAnalysisData {
    month: string;
    foodCost: number;
    wastePercentage: number;
    wasteAmount: number;
    expiredItems: number;
    itemsProcessed: number;
    // New rolling average fields
    rollingAvgCost?: number;
    rollingAvgSavings?: number;
    rollingAvgWastePct?: number;
    normalizedCost?: number;
    dataQuality?: string;
    costVolatilityFlag?: boolean;
    // Savings information
    monthlySavings?: number;
    baselineWasteAmount?: number;
    activeFeatures?: string[];
    savingsPercentage?: number;
}

export interface WasteAnalysisResponse {
    waste_analysis: WasteAnalysisData[];
    summary: {
        avg_monthly_cost: number;
        avg_waste_percentage: number;
        current_waste_rate?: number;  // Current month's waste rate for consistency
        total_waste_amount: number;
        performance_status: string;
        performance_trend: string;
        total_items_analyzed: number;
        // New rolling average and savings metrics
        rolling_avg_monthly_cost?: number;
        rolling_avg_savings?: number;
        total_monthly_savings?: number;
        current_month_savings?: number;
        annual_projected_savings?: number;
        avg_savings_percentage?: number;
        data_quality_score?: number;
        date_range: {
            start: string;
            end: string;
        };
    };
    insights: string[];
}

export interface AIInsightsResponse {
    ai_insights: {
        analysis_text: string;
        key_metrics: {
            current_waste_rate: number;
            target_waste_rate: number;
            monthly_avg_cost: number;
            trend_direction: string;
            trend_percentage: number;
            performance_status: string;
        };
        quick_insights: string[];
        recommendations: string[];
        risk_level: string;
        savings_potential?: {
            monthly_potential: number;
            annual_potential: number;
            percentage_reduction: number;
        };
        data_quality_score?: number;
    };
    analysis_timestamp: string;
    analysis_type: string;
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

// New function to fetch waste analysis data
export async function fetchWasteAnalysisData(
    startDate?: string,
    endDate?: string
): Promise<WasteAnalysisResponse> {
    // Use your actual API Gateway URL - update this once you create the waste-analysis route
    const baseUrl = "https://e8ufzjv4rd.execute-api.us-east-1.amazonaws.com/dev/waste-analysis";

    const url =
        startDate && endDate
            ? `${baseUrl}?start_date=${startDate}&end_date=${endDate}`
            : baseUrl;

    const res = await fetch(url);
    if (!res.ok) {
        throw new Error(`Error fetching waste analysis data: ${res.statusText}`);
    }

    const data = await res.json();
    return data as WasteAnalysisResponse;
}

// New function to get AI insights
export async function fetchAIInsights(wasteData: WasteAnalysisResponse): Promise<AIInsightsResponse> {
    // Replace with your actual API Gateway URL for the AI analysis Lambda
    const baseUrl = "https://c8pjgaljaa.execute-api.us-east-1.amazonaws.com/dev/ai-analysis";

    const res = await fetch(baseUrl, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            waste_data: wasteData,
            analysis_type: 'comprehensive'
        })
    });

    if (!res.ok) {
        throw new Error(`Error fetching AI insights: ${res.statusText}`);
    }

    const data = await res.json();
    console.log('Raw AI insights response:', data);
    
    // The Lambda returns the structure directly, not wrapped in another object
    return data as AIInsightsResponse;
}
