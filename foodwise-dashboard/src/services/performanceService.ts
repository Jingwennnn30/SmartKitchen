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
        category_analysis?: Array<{
            category: string;
            waste_amount: number;
            percentage: number;
            cost_impact: string;
            trend: string;
            recommendation: string;
        }>;
        data_quality_score?: number;
        confidence_level?: string;
        last_updated?: string;
    };
    analysis_timestamp?: string;
    analysis_type?: string;
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
    // Mock AI insights for demo purposes
    console.log('🤖 Generating mock AI insights for demo...');
    
    // Create comprehensive mock AI insights
    const mockAIInsights: AIInsightsResponse = {
        ai_insights: {
            analysis_text: `## AI-Powered Waste & Cost Analysis

**Executive Summary:**
Based on comprehensive analysis of your waste management data, our AI has identified key patterns and opportunities for optimization. Your current waste rate of 5.6% is slightly above the industry target of 5%, presenting an opportunity for monthly savings of approximately RM 2,400.

**Performance Analysis:**
Your food waste management shows a **stable trend** with consistent monitoring. The current monthly average cost of RM 18,000 indicates good operational efficiency, though there's room for improvement through strategic interventions.

**Critical Findings:**
• Vegetables account for 28% of total waste (28kg) - highest category
• Meat waste represents 22% (22kg) - requires immediate attention due to high cost impact
• Fruits waste at 18% (18kg) shows opportunity for better inventory rotation
• Combined waste reduction could save RM 28,800 annually

**AI Recommendations:**
Our machine learning models suggest implementing dynamic pricing strategies, enhanced inventory forecasting, and staff training programs to achieve optimal waste reduction targets.`,
            
            key_metrics: {
                current_waste_rate: 5.6,
                target_waste_rate: 5.0,
                monthly_avg_cost: 18000,
                trend_direction: 'stable',
                trend_percentage: 0.2,
                performance_status: 'Good - Minor Optimization Needed'
            },
            
            quick_insights: [
                '🌿 Vegetables are the largest waste category at 28kg (28%) - implement first-in-first-out rotation',
                '🥩 Meat waste at 22kg (22%) has highest cost impact - consider portion control training',
                '🍎 Fruits waste shows seasonal pattern - optimize ordering based on demand forecasting',
                '📊 Overall waste rate 5.6% is near target - small improvements yield significant savings'
            ],
            
            recommendations: [
                '**Dynamic Pricing Strategy**: Implement AI-powered discount scheduling for items nearing expiration. Expected savings: RM 1,200/month',
                '**Inventory Optimization**: Use machine learning to predict demand patterns and adjust ordering quantities. Expected reduction: 15% waste decrease',
                '**Staff Training Program**: Conduct quarterly workshops on portion control and waste awareness. Expected impact: 10% improvement',
                '**Smart Donation Program**: Partner with local charities for surplus food donation. Expected waste reduction: 8-12kg/week',
                '**Menu Engineering**: Analyze dish popularity and adjust menu offerings to minimize ingredient waste. Expected savings: RM 800/month',
                '**Temperature Monitoring**: Install IoT sensors to ensure optimal storage conditions and reduce spoilage. Expected reduction: 5% waste decrease'
            ],
            
            risk_level: 'medium',
            
            savings_potential: {
                monthly_potential: 2400,
                annual_potential: 28800,
                percentage_reduction: 0.6
            },
            
            category_analysis: [
                {
                    category: 'Vegetables',
                    waste_amount: 28,
                    percentage: 28,
                    cost_impact: 'RM 5,040',
                    trend: 'stable',
                    recommendation: 'Implement FIFO rotation system and daily freshness checks'
                },
                {
                    category: 'Meat',
                    waste_amount: 22,
                    percentage: 22,
                    cost_impact: 'RM 6,600',
                    trend: 'increasing',
                    recommendation: 'Review portion sizes and consider pre-portioning during prep'
                },
                {
                    category: 'Fruits',
                    waste_amount: 18,
                    percentage: 18,
                    cost_impact: 'RM 3,240',
                    trend: 'stable',
                    recommendation: 'Optimize ordering frequency and monitor seasonal demand'
                },
                {
                    category: 'Dairy',
                    waste_amount: 15,
                    percentage: 15,
                    cost_impact: 'RM 2,250',
                    trend: 'decreasing',
                    recommendation: 'Continue current practices - showing improvement'
                },
                {
                    category: 'Bakery',
                    waste_amount: 12,
                    percentage: 12,
                    cost_impact: 'RM 1,440',
                    trend: 'stable',
                    recommendation: 'Consider day-old discounts or donation partnerships'
                },
                {
                    category: 'Other',
                    waste_amount: 5,
                    percentage: 5,
                    cost_impact: 'RM 750',
                    trend: 'stable',
                    recommendation: 'Maintain current waste management practices'
                }
            ],
            
            data_quality_score: 92,
            confidence_level: 'high',
            last_updated: new Date().toISOString()
        }
    };
    
    // Simulate API delay for realistic experience
    await new Promise(resolve => setTimeout(resolve, 800));
    
    return mockAIInsights;
    
    /* ORIGINAL API CODE - Uncomment when Lambda is accessible
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
    
    return data as AIInsightsResponse;
    */
}
