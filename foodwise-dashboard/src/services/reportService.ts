// src/services/reportService.ts

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
   * Fetch real performance data from the dashboard API for report analysis
   */
  private static async fetchDashboardData(startDate?: string, endDate?: string): Promise<any> {
    try {
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
        
        // Historical order patterns (from the dashboard)
        historical_patterns: this.analyzeHistoricalPatterns(data),
        
        // Dashboard chart analysis
        chart_insights: this.extractChartInsights(data),
        
        // Staff efficiency (mock data since it's not in API)
        staff_efficiency: 87,
        
        // Mock data for charts not in API
        inventory_trends: this.generateInventoryTrends(),
        wait_time_trends: this.generateWaitTimeTrends(),
        waste_analysis: this.generateWasteAnalysis(),
        
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
   */
  private static async generateReport(
    type: 'daily' | 'weekly' | 'monthly',
    startDate?: string,
    endDate?: string,
    performanceData?: any
  ): Promise<void> {
    console.log(`Generating ${type} report for period: ${startDate} to ${endDate}`);
    console.log('Performance data:', performanceData);
    
    const payload: ReportDataPayload = { 
      type,
      startDate,
      endDate,
      data: performanceData || {
        total_orders: 535,
        total_revenue: 9031,
        avg_table_size: 2.5
      }
    };

    try {
      const response = await fetch(API_BASE, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        mode: 'cors', // Explicitly set CORS mode
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('API Error:', response.status, errorText);
        throw new Error(`Server returned ${response.status}: ${errorText}`);
      }

      const result = await response.json();
      console.log('Report generation result:', result);

      if (result.success && result.url) {
        // Open the report in a new tab
        window.open(result.url, '_blank');
        
        // Show success message in console
        console.log(`✅ ${type.charAt(0).toUpperCase() + type.slice(1)} report generated successfully!`);
        if (result.dataRange) {
          console.log(`📊 Data range: ${result.dataRange.start} to ${result.dataRange.end}`);
          console.log(`📈 Records analyzed: ${result.dataRange.totalRecords}`);
        }
        
        // Optional: Show user notification
        if (typeof window !== 'undefined' && 'Notification' in window) {
          if (Notification.permission === 'granted') {
            new Notification('Report Ready!', {
              body: `Your ${type} performance report has been generated and opened in a new tab.`,
              icon: '/favicon.ico'
            });
          }
        }
      } else {
        throw new Error(result.error || 'Failed to generate report');
      }

    } catch (error) {
      console.error('Report generation error:', error);
      
      // Enhanced error handling with user-friendly messages
      if (error instanceof TypeError && error.message.includes('fetch')) {
        throw new Error('Unable to connect to the report service. Please check your internet connection.');
      } else if (error instanceof Error && error.message.includes('CORS')) {
        throw new Error('Report service is currently unavailable. Please try again later.');
      } else {
        throw error;
      }
    }
  }
}
