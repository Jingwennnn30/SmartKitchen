// src/services/reportService.ts

export interface ReportDataPayload {
  type: 'daily' | 'weekly' | 'monthly';
  startDate?: string;
  endDate?: string;
}

const API_BASE = process.env.REACT_APP_API_BASE || '/api';

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

  static async generateDailyReport(data: { selectedStartDate?: string; selectedEndDate?: string }): Promise<void> {
    return this.generateReport('daily', data.selectedStartDate, data.selectedEndDate);
  }

  static async generateWeeklyReport(data: { selectedStartDate?: string; selectedEndDate?: string }): Promise<void> {
    return this.generateReport('weekly', data.selectedStartDate, data.selectedEndDate);
  }

  static async generateMonthlyReport(data: { selectedStartDate?: string; selectedEndDate?: string }): Promise<void> {
    return this.generateReport('monthly', data.selectedStartDate, data.selectedEndDate);
  }

  /**
   * Generic report generator that supports download from either PDF blob or presigned URL.
   */
  private static async generateReport(
    type: 'daily' | 'weekly' | 'monthly',
    startDate?: string,
    endDate?: string
  ): Promise<void> {
    const payload: ReportDataPayload = { type };
    if (startDate) payload.startDate = startDate;
    if (endDate) payload.endDate = endDate;

    const response = await fetch(`${API_BASE}/report/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err?.error || 'Failed to generate report');
    }

    const contentType = response.headers.get('Content-Type');

    // Handle direct PDF response
    if (contentType === 'application/pdf') {
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;

      const filename = `report_${type}_${startDate || 'start'}_${endDate || 'end'}.pdf`;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    }

    // Handle JSON with presigned download URL
    else if (contentType?.includes('application/json')) {
      const result = await response.json();
      const downloadUrl = result?.url;

      if (!downloadUrl) {
        throw new Error('No download URL received.');
      }

      window.open(downloadUrl, '_blank');
    }

    else {
      throw new Error('Unsupported response type from server.');
    }
  }
}
