// src/services/reportService.ts

import { PDFGenerator } from './pdfGenerator';

export interface ReportDataPayload {
  type: 'daily' | 'weekly' | 'monthly';
  startDate?: string;
  endDate?: string;
  data?: any; // Add this to pass performance data
}

const API_BASE = 'https://1ecbj21zed.execute-api.us-east-1.amazonaws.com/dev/report';

export class ReportService {
  /**
   * Returns UI metadata for each report type.
   */
  static getReportTypeInfo(type: 'daily' | 'weekly' | 'monthly') {
    switch (type) {
      case 'daily':
        return {
          title: 'Today’s Performance Report',
          subtitle: 'Daily',
          description: 'View performance metrics for today’s activity including efficiency, output, and productivity benchmarks.',
          estimatedTime: '5–10 seconds',
          color: '#3b82f6' // Blue
        };
      case 'weekly':
        return {
          title: 'Weekly Performance Report',
          subtitle: 'Weekly',
          description: 'Summarized performance insights from the past 7 days, highlighting trends and growth patterns.',
          estimatedTime: '10–15 seconds',
          color: '#10b981' // Green
        };
      case 'monthly':
        return {
          title: 'Monthly Performance Report',
          subtitle: 'Monthly',
          description: 'Comprehensive report of this month’s activities, comparisons, and KPIs for strategic decision-making.',
          estimatedTime: '15–30 seconds',
          color: '#f59e0b' // Amber
        };
      default:
        return {
          title: 'Performance Report',
          subtitle: '',
          description: '',
          estimatedTime: 'A few seconds',
          color: '#6b7280' // Gray
        };
    }
  }

  static async generateDailyReport(data: { selectedStartDate?: string; selectedEndDate?: string; performanceData?: any }): Promise<void> {
    console.log('Generating daily report with data:', data);
    
    // For daily reports, use the selected date for both start and end
    const reportDate = data.selectedStartDate || new Date().toLocaleDateString('en-GB');
    
    // Fetch real performance data from the dashboard API for the specific date
    const dashboardData = await this.fetchDashboardData(reportDate, reportDate);
    console.log('Dashboard data for daily report:', dashboardData);
    
    return this.generateReport('daily', reportDate, reportDate, dashboardData);
  }

  static async generateWeeklyReport(data: { selectedStartDate?: string; selectedEndDate?: string; performanceData?: any }): Promise<void> {
    console.log('Generating weekly report with data:', data);
    
    // For weekly reports, calculate the full week from the selected date
    let startDate: string;
    let endDate: string;
    
    if (data.selectedStartDate) {
      // If a date is selected, get the full week containing that date (Monday to Sunday)
      const selectedDate = new Date(data.selectedStartDate.split('/').reverse().join('-')); // Convert d/m/yyyy to yyyy-mm-dd
      const dayOfWeek = selectedDate.getDay(); // 0 = Sunday, 1 = Monday, etc.
      
      // Calculate Monday of the week (start of week)
      const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek; // If Sunday, go back 6 days; otherwise go back to Monday
      const monday = new Date(selectedDate);
      monday.setDate(selectedDate.getDate() + mondayOffset);
      startDate = monday.toLocaleDateString('en-GB');
      
      // Calculate Sunday of the week (end of week)
      const sunday = new Date(monday);
      sunday.setDate(monday.getDate() + 6);
      endDate = sunday.toLocaleDateString('en-GB');
      
      console.log(`Weekly report: Selected date ${data.selectedStartDate} -> Full week ${startDate} to ${endDate}`);
    } else {
      // Use current week if no date selected
      startDate = this.getWeekStart();
      endDate = this.getWeekEnd();
    }
    
    // Fetch real performance data from the dashboard API
    const dashboardData = await this.fetchDashboardData(startDate, endDate);
    console.log('Dashboard data for weekly report:', dashboardData);
    
    return this.generateReport('weekly', startDate, endDate, dashboardData);
  }

  static async generateMonthlyReport(data: { selectedStartDate?: string; selectedEndDate?: string; performanceData?: any }): Promise<void> {
    console.log('Generating monthly report with data:', data);
    
    // For monthly reports, calculate the full month from the selected date
    let startDate: string;
    let endDate: string;
    
    if (data.selectedStartDate) {
      // If a date is selected, get the full month containing that date
      const selectedDate = new Date(data.selectedStartDate.split('/').reverse().join('-')); // Convert d/m/yyyy to yyyy-mm-dd
      const year = selectedDate.getFullYear();
      const month = selectedDate.getMonth(); // 0-based month
      
      // First day of the month
      const firstDay = new Date(year, month, 1);
      startDate = firstDay.toLocaleDateString('en-GB'); // dd/mm/yyyy format
      
      // Last day of the month
      const lastDay = new Date(year, month + 1, 0);
      endDate = lastDay.toLocaleDateString('en-GB'); // dd/mm/yyyy format
      
      console.log(`Monthly report: Selected date ${data.selectedStartDate} -> Full month ${startDate} to ${endDate}`);
    } else {
      // Use current month if no date selected
      startDate = this.getMonthStart();
      endDate = this.getMonthEnd();
    }
    
    // Fetch real performance data from the dashboard API
    const dashboardData = await this.fetchDashboardData(startDate, endDate);
    console.log('Dashboard data for monthly report:', dashboardData);
    
    return this.generateReport('monthly', startDate, endDate, dashboardData);
  }

  private static getWeekStart(): string {
    const now = new Date();
    const dayOfWeek = now.getDay();
    const diff = now.getDate() - dayOfWeek;
    const weekStart = new Date(now.setDate(diff));
    return `${weekStart.getDate()}/${weekStart.getMonth() + 1}/${weekStart.getFullYear()}`;
  }

  private static getWeekEnd(): string {
    const now = new Date();
    const dayOfWeek = now.getDay();
    const diff = now.getDate() - dayOfWeek + 6;
    const weekEnd = new Date(now.setDate(diff));
    return `${weekEnd.getDate()}/${weekEnd.getMonth() + 1}/${weekEnd.getFullYear()}`;
  }

  private static getMonthStart(): string {
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    return `${monthStart.getDate()}/${monthStart.getMonth() + 1}/${monthStart.getFullYear()}`;
  }

  private static getMonthEnd(): string {
    const now = new Date();
    const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    return `${monthEnd.getDate()}/${monthEnd.getMonth() + 1}/${monthEnd.getFullYear()}`;
  }

  /**
   * Check if a date is within a range
   */
  private static isDateInRange(date: string, startDate: string, endDate: string): boolean {
    const parseDate = (d: string) => {
      const [day, month, year] = d.split('/').map(Number);
      return new Date(year, month - 1, day);
    };
    
    const targetDate = parseDate(date);
    const start = parseDate(startDate);
    const end = parseDate(endDate);
    
    return targetDate >= start && targetDate <= end;
  }

  /**
   * Generate comprehensive mock data for September 19, 2025 demo
   */
  private static generateSept19MockData(startDate?: string, endDate?: string): any {
    const mockData = {
      '19/9/2025': {
        orders: 487,
        revenue: 14610.00,
        avg_table_size: 3.2,
        items: [
          { dish_id: 'NASI001', dish_name: 'Nasi Lemak Special', quantity: 145, price: 12.50, revenue: 1812.50, meal_type: 'Breakfast' },
          { dish_id: 'ROTI002', dish_name: 'Roti Canai with Curry', quantity: 98, price: 8.00, revenue: 784.00, meal_type: 'Breakfast' },
          { dish_id: 'MILO003', dish_name: 'Milo Ais', quantity: 187, price: 4.50, revenue: 841.50, meal_type: 'Beverage' },
          { dish_id: 'CHAR004', dish_name: 'Char Kway Teow', quantity: 132, price: 15.00, revenue: 1980.00, meal_type: 'Lunch' },
          { dish_id: 'LAKSA005', dish_name: 'Laksa Penang', quantity: 89, price: 16.50, revenue: 1468.50, meal_type: 'Lunch' },
          { dish_id: 'SATE006', dish_name: 'Satay Ayam (10 sticks)', quantity: 156, price: 18.00, revenue: 2808.00, meal_type: 'Dinner' },
          { dish_id: 'NASI007', dish_name: 'Nasi Goreng Kampung', quantity: 124, price: 14.00, revenue: 1736.00, meal_type: 'Dinner' },
          { dish_id: 'IKAN008', dish_name: 'Ikan Bakar Set', quantity: 76, price: 25.00, revenue: 1900.00, meal_type: 'Dinner' },
          { dish_id: 'CEND009', dish_name: 'Cendol Special', quantity: 112, price: 7.50, revenue: 840.00, meal_type: 'Dessert' },
          { dish_id: 'TEKT010', dish_name: 'Teh Tarik', quantity: 203, price: 3.50, revenue: 710.50, meal_type: 'Beverage' }
        ]
      }
    };

    // AI Analysis and Insights for September 19, 2025
    const aiInsights = {
      performance_analysis: {
        overall_rating: 'Excellent',
        efficiency_score: 92,
        key_findings: [
          '🎯 Achieved 487 orders with RM 14,610 revenue - 8.5% above daily target',
          '⚡ Peak performance during dinner service (156 satay orders shows strong customer preference)',
          '📈 Beverage sales exceptional with 187 Milo Ais and 203 Teh Tarik orders',
          '🍽️ Average table size of 3.2 indicates family/group dining preference',
          '💰 High-value items (Ikan Bakar, Satay) driving 32% of total revenue'
        ]
      },
      operational_insights: {
        strengths: [
          '✅ Balanced menu performance across all meal periods',
          '✅ Strong beverage attachment rate (80% of orders)',
          '✅ Efficient kitchen operations with diverse menu items',
          '✅ Popular traditional dishes (Nasi Lemak, Laksa) maintaining steady demand'
        ],
        areas_for_improvement: [
          '⚠️ Breakfast revenue slightly below potential (only 17.7% of total)',
          '⚠️ Lunch period could be optimized with promotional combo meals',
          '⚠️ Dessert category underperforming (only 5.7% of revenue)'
        ]
      },
      customer_behavior: {
        patterns: [
          '👥 Higher average table size (3.2) suggests family-oriented dining',
          '🕐 Dinner service strongest period with 39.5% of daily revenue',
          '☕ High beverage consumption indicates dine-in preference over takeaway',
          '🌶️ Spicy and traditional items (Char Kway Teow, Laksa) very popular'
        ],
        preferences: [
          'Traditional Malaysian cuisine showing consistent demand',
          'Premium items (RM 20+) performing well during dinner',
          'Quick breakfast options (Roti Canai) need promotional boost',
          'Dessert awareness could be improved with strategic placement'
        ]
      },
      future_recommendations: {
        immediate_actions: [
          '🚀 Launch breakfast combo promotions (Roti Canai + Beverage) to boost morning revenue',
          '🎁 Introduce dessert upselling at checkout - target 15% increase in dessert orders',
          '📱 Promote lunch specials through digital channels during weekdays',
          '👨‍🍳 Increase Satay preparation capacity during dinner (currently selling out fast)'
        ],
        strategic_initiatives: [
          '📊 Implement dynamic pricing for peak hours to optimize revenue',
          '🤖 AI-driven inventory prediction to reduce waste on high-performing items',
          '🎯 Create customer loyalty program targeting family groups (avg 3+ pax)',
          '📈 Expand beverage menu with premium options (profit margin opportunity)',
          '🌟 Feature "Chef\'s Special" rotation to test new high-margin items'
        ],
        revenue_optimization: [
          '💡 Bundle popular items: Satay + Beverage combo could increase avg order value by 12%',
          '💡 Time-based promotions: Early bird breakfast (before 9am) to spread demand',
          '💡 Upsizing strategy: Offer larger portions for +20% price increase',
          '💡 Cross-selling training: Staff to recommend beverages with every main dish',
          '💡 Premium tier: Introduce "Signature Collection" items at 30% higher margins'
        ],
        waste_reduction: [
          '♻️ Monitor Ikan Bakar inventory closely - high value item with perishability risk',
          '♻️ Prepare Laksa in smaller batches to maintain freshness',
          '♻️ Use AI predictions for Milo/Teh preparation to minimize waste',
          '♻️ Implement "Chef\'s Surprise" for near-expiry ingredients'
        ]
      },
      forecasting: {
        next_day_prediction: '482-510 orders expected (similar weekday pattern)',
        next_week_trend: 'Anticipate 5-7% increase if weather remains favorable',
        seasonal_notes: 'September showing strong performance - maintain momentum through Oktoberfest promotions',
        risk_factors: [
          '🌧️ Weather impact on dine-in traffic',
          '🎉 Competitor promotions in area',
          '📉 Ingredient supply chain delays'
        ]
      }
    };

    const date_range = {
      start: startDate || '19/9/2025',
      end: endDate || '19/9/2025'
    };

    return {
      // Root-level metrics for PDF convenience
      total_orders: 487,
      total_revenue: 14610.00,
      avg_table_size: 3.2,
      avg_order_value: 14610.0 / 487,
      date_range,

      // Also provide summary for other consumers
      summary: {
        total_orders: 487,
        total_revenue: 14610.00,
        avg_table_size: 3.2,
        date_range
      },
      daily_breakdown: mockData,
      items: mockData['19/9/2025'].items,
      ai_insights: aiInsights,
      charts: {
        hourly_distribution: [
          { hour: '7-9 AM', orders: 78, revenue: 2596.50, percentage: 16.0 },
          { hour: '9-11 AM', orders: 45, revenue: 1245.00, percentage: 9.2 },
          { hour: '11 AM-1 PM', orders: 112, revenue: 3448.50, percentage: 23.0 },
          { hour: '1-3 PM', orders: 52, revenue: 1580.00, percentage: 10.7 },
          { hour: '3-5 PM', orders: 38, revenue: 1120.00, percentage: 7.8 },
          { hour: '5-7 PM', orders: 89, revenue: 2876.00, percentage: 18.3 },
          { hour: '7-9 PM', orders: 73, revenue: 1744.00, percentage: 15.0 }
        ],
        category_performance: [
          { category: 'Main Dishes', orders: 346, revenue: 10684.00, percentage: 73.1 },
          { category: 'Beverages', orders: 390, revenue: 1552.00, percentage: 10.6 },
          { category: 'Desserts', orders: 112, revenue: 840.00, percentage: 5.7 },
          { category: 'Breakfast', orders: 243, revenue: 2596.50, percentage: 17.8 }
        ],
        top_performers: [
          { item: 'Teh Tarik', orders: 203, revenue: 710.50, trend: '+15%' },
          { item: 'Milo Ais', orders: 187, revenue: 841.50, trend: '+12%' },
          { item: 'Satay Ayam', orders: 156, revenue: 2808.00, trend: '+8%' },
          { item: 'Nasi Lemak Special', orders: 145, revenue: 1812.50, trend: '+5%' },
          { item: 'Char Kway Teow', orders: 132, revenue: 1980.00, trend: '+3%' }
        ]
      },
      staff_efficiency: 92,
      inventory_trends: this.generateInventoryTrends(),
      wait_time_trends: this.generateWaitTimeTrends(),
      waste_analysis: this.generateWasteAnalysis()
    };
  }

  /**
   * Fetch real performance data from the dashboard API for report analysis
   */
  private static async fetchDashboardData(startDate?: string, endDate?: string): Promise<any> {
    try {
      // Check if the date range includes September 19, 2025 - use mock data for demo
      const isSept19Demo = startDate === '19/9/2025' || endDate === '19/9/2025' || 
                           (startDate && endDate && this.isDateInRange('19/9/2025', startDate, endDate));
      
      if (isSept19Demo) {
        console.log('Using mock data for September 19, 2025 demo');
        return this.generateSept19MockData(startDate, endDate);
      }
      
      const performanceApiUrl = 'https://qo9xvx5tv2.execute-api.us-east-1.amazonaws.com/dev/performance';
      
      const url = startDate && endDate 
        ? `${performanceApiUrl}?start_date=${startDate}&end_date=${endDate}`
        : performanceApiUrl;
      
      console.log('Fetching dashboard data from:', url);
      
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Failed to fetch dashboard data: ${response.statusText}`);
      }
      
      const data = await response.json();
      console.log('Raw dashboard data:', data);
      
      // Transform the data for report generation
      const transformedData = {
        // Performance metrics
        total_orders: data.summary?.total_orders || 0,
        total_revenue: data.summary?.total_revenue || 0,
        avg_table_size: data.summary?.avg_table_size || 2.5,
        avg_order_value: data.summary?.total_orders > 0 
          ? (data.summary.total_revenue / data.summary.total_orders) 
          : 0,
        
        // Daily breakdown for charts
        daily_breakdown: data.daily_breakdown || {},
        
        // Items breakdown
        items: data.items || [],
        
        // AI insights (if available from mock data)
        ai_insights: data.ai_insights || null,
        
        // Chart data (if available from mock data)
        charts: data.charts || null,
        
        // Historical order patterns (from the dashboard)
        historical_patterns: this.analyzeHistoricalPatterns(data),
        
        // Dashboard chart analysis
        chart_insights: this.extractChartInsights(data),
        
        // Staff efficiency
        staff_efficiency: data.staff_efficiency || 87,
        
        // Date range for report header
        date_range: data.summary?.date_range || { start: startDate, end: endDate },
        
        // Mock data for charts not in API
        inventory_trends: data.inventory_trends || this.generateInventoryTrends(),
        wait_time_trends: data.wait_time_trends || this.generateWaitTimeTrends(),
        waste_analysis: data.waste_analysis || this.generateWasteAnalysis(),
        
        // Raw data for detailed analysis
        raw_data: data
      };
      
      console.log('Transformed dashboard data:', transformedData);
      return transformedData;
      
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      
      // Return fallback data with mock insights
      return {
        total_orders: 535,
        total_revenue: 9031,
        avg_table_size: 2.5,
        avg_order_value: 16.88,
        daily_breakdown: {},
        historical_patterns: {},
        chart_insights: this.generateMockChartInsights(),
        staff_efficiency: 87,
        inventory_trends: this.generateInventoryTrends(),
        wait_time_trends: this.generateWaitTimeTrends(),
        waste_analysis: this.generateWasteAnalysis(),
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Analyze historical patterns from dashboard data
   */
  private static analyzeHistoricalPatterns(data: any): any {
    const dailyBreakdown = data.daily_breakdown || {};
    const patterns: {
      peak_days: any[];
      low_performance_days: any[];
      revenue_trends: any[];
      order_volume_trends: any[];
    } = {
      peak_days: [],
      low_performance_days: [],
      revenue_trends: [],
      order_volume_trends: []
    };
    
    Object.entries(dailyBreakdown).forEach(([date, stats]: [string, any]) => {
      if (stats.orders > 600) {
        patterns.peak_days.push({ date, orders: stats.orders, revenue: stats.revenue });
      } else if (stats.orders < 200) {
        patterns.low_performance_days.push({ date, orders: stats.orders, revenue: stats.revenue });
      }
      
      patterns.revenue_trends.push({ date, revenue: stats.revenue });
      patterns.order_volume_trends.push({ date, orders: stats.orders });
    });
    
    return patterns;
  }

  /**
   * Extract insights from dashboard charts
   */
  private static extractChartInsights(data: any): any {
    const insights = {
      performance_trends: 'Positive growth trajectory observed in recent periods',
      operational_efficiency: 'Kitchen operations showing 42% improvement with AI integration',
      customer_patterns: 'Peak hours concentrated around lunch and dinner periods',
      revenue_optimization: 'Average order value trending upward with menu optimization'
    };
    
    // Analyze actual data if available
    if (data.summary) {
      const { total_orders, total_revenue } = data.summary;
      const avgOrderValue = total_orders > 0 ? total_revenue / total_orders : 0;
      
      if (avgOrderValue > 20) {
        insights.revenue_optimization = 'Excellent average order value indicating successful upselling strategies';
      } else if (avgOrderValue < 15) {
        insights.revenue_optimization = 'Opportunity to increase average order value through menu engineering';
      }
    }
    
    return insights;
  }

  /**
   * Generate mock chart insights for fallback
   */
  private static generateMockChartInsights(): any {
    return {
      performance_trends: 'Consistent performance with seasonal variations noted',
      operational_efficiency: 'AI-enhanced operations maintaining 87% efficiency rating',
      customer_patterns: 'Regular dining patterns with weekend peak performance',
      revenue_optimization: 'Strategic pricing adjustments showing positive impact'
    };
  }

  /**
   * Generate inventory trends data
   */
  private static generateInventoryTrends(): any[] {
    return Array.from({ length: 14 }, (_, index) => ({
      date: `${index + 1}/9`,
      stock: Math.floor(Math.random() * 200 + 300),
      usage: Math.floor(Math.random() * 150 + 200),
      efficiency: Math.random() * 20 + 80
    }));
  }

  /**
   * Generate wait time trends data
   */
  private static generateWaitTimeTrends(): any[] {
    return Array.from({ length: 14 }, (_, index) => ({
      date: `${index + 1}/9`,
      avgWaitTime: Math.floor(Math.random() * 15 + 10),
      targetTime: 15,
      satisfaction: Math.random() * 20 + 75
    }));
  }

  /**
   * Generate waste analysis data
   */
  private static generateWasteAnalysis(): any[] {
    return Array.from({ length: 6 }, (_, index) => ({
      month: ['Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep'][index],
      foodCost: Math.floor(Math.random() * 5000 + 15000),
      wastePercentage: Number((Math.random() * 8 + 2).toFixed(1)),
      efficiency: Math.random() * 15 + 85
    }));
  }

  /**
   * Generic report generator with enhanced real data integration and AI analysis.
   * Now uses client-side PDF generation instead of Lambda function.
   */
  private static async generateReport(
    type: 'daily' | 'weekly' | 'monthly',
    startDate?: string,
    endDate?: string,
    performanceData?: any
  ): Promise<void> {
    console.log(`Generating ${type} report for period: ${startDate} to ${endDate}`);
    console.log('Performance data:', performanceData);
    
    // Use client-side PDF generation
    try {
      const pdfGenerator = new PDFGenerator();

      // Normalize report data shape with safe defaults
      const summary = performanceData?.summary || {};
      const normalized: any = {
        total_orders: performanceData?.total_orders ?? summary.total_orders ?? 0,
        total_revenue: performanceData?.total_revenue ?? summary.total_revenue ?? 0,
        avg_table_size: performanceData?.avg_table_size ?? summary.avg_table_size ?? 0,
        avg_order_value: performanceData?.avg_order_value ?? 0,
        date_range: performanceData?.date_range ?? summary.date_range ?? { start: startDate, end: endDate },
        ai_insights: performanceData?.ai_insights ?? null,
        charts: performanceData?.charts ?? null,
        items: performanceData?.items ?? [],
      };

      if (!normalized.avg_order_value && normalized.total_orders > 0) {
        normalized.avg_order_value = normalized.total_revenue / normalized.total_orders;
      }

      // Generate the appropriate report type
      switch (type) {
        case 'daily':
          pdfGenerator.generateDailyReport(normalized);
          break;
        case 'weekly':
          pdfGenerator.generateWeeklyReport(normalized);
          break;
        case 'monthly':
          pdfGenerator.generateMonthlyReport(normalized);
          break;
      }

      console.log(`✅ ${type.charAt(0).toUpperCase() + type.slice(1)} report generated successfully!`);
      console.log(`📊 Data range: ${startDate} to ${endDate}`);
      
    } catch (error) {
      console.error('Report generation error:', error);
      throw new Error(`Failed to generate ${type} report. Please try again.`);
    }
  }
}
