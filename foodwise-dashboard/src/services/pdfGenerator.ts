// src/services/pdfGenerator.ts

import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export class PDFGenerator {
  private doc: jsPDF;
  private pageWidth: number;
  private pageHeight: number;
  private margin: number = 20;
  private currentY: number = 20;

  constructor() {
    this.doc = new jsPDF();
    this.pageWidth = this.doc.internal.pageSize.getWidth();
    this.pageHeight = this.doc.internal.pageSize.getHeight();
  }

  /**
   * Check if we need a new page
   */
  private checkPageBreak(heightNeeded: number = 20): void {
    if (this.currentY + heightNeeded > this.pageHeight - this.margin) {
      this.doc.addPage();
      this.currentY = this.margin;
    }
  }

  /**
   * Sanitize text for PDF (remove emojis/unsupported unicode, normalize punctuation)
   */
  private sanitizeText(text: string | undefined | null, opts: { bullet?: boolean } = {}): string {
    if (!text) return '';
    let t = String(text)
      // normalize fancy quotes/dashes
      .replace(/[\u2018\u2019\u201B\u2032]/g, "'")
      .replace(/[\u201C\u201D\u201F\u2033]/g, '"')
      .replace(/[\u2013\u2014\u2212]/g, '-')
      // remove misc symbols and most emoji ranges (BMP)
      .replace(/[\u2600-\u27BF]/g, '')
      .replace(/[\u2000-\u206F]/g, ' ');
    // Final safety: keep strictly ASCII printable to avoid PDF font encoding issues
    t = t.replace(/[^\x20-\x7E]/g, '');
    t = t.replace(/\s+/g, ' ').trim();
    if (opts.bullet && t) t = `- ${t}`;
    return t;
  }

  /**
   * Add header to the document
   */
  private addHeader(title: string, dateRange: string): void {
    // Background gradient effect (simulated with rectangles)
    this.doc.setFillColor(102, 126, 234);
    this.doc.rect(0, 0, this.pageWidth, 40, 'F');
    
    // Title
    this.doc.setTextColor(255, 255, 255);
    this.doc.setFontSize(22);
    this.doc.setFont('helvetica', 'bold');
    this.doc.text(title, this.margin, 18);
    
    // Date range
    this.doc.setFontSize(12);
    this.doc.setFont('helvetica', 'normal');
    this.doc.text(dateRange, this.margin, 28);
    
    // SmartKitchen logo text
    this.doc.setFontSize(10);
    this.doc.text('SmartKitchen Pro', this.pageWidth - this.margin - 40, 18);
    
    // Reset text color
    this.doc.setTextColor(0, 0, 0);
    this.currentY = 50;
  }

  /**
   * Add section title
   */
  private addSectionTitle(title: string): void {
    this.checkPageBreak(15);
    
    this.doc.setFillColor(248, 250, 252);
    this.doc.rect(this.margin, this.currentY - 5, this.pageWidth - 2 * this.margin, 12, 'F');
    
    this.doc.setFontSize(14);
    this.doc.setFont('helvetica', 'bold');
    this.doc.setTextColor(31, 41, 55);
    this.doc.text(this.sanitizeText(title), this.margin + 5, this.currentY + 3);
    
    this.currentY += 15;
  }

  /**
   * Add key metrics cards
   */
  private addKeyMetrics(data: any): void {
  this.addSectionTitle('Key Performance Metrics');
    // Normalize metrics with safe fallbacks
    const totalOrders = Number(
      data?.total_orders ?? data?.summary?.total_orders ?? 0
    );
    const totalRevenue = Number(
      data?.total_revenue ?? data?.summary?.total_revenue ?? 0
    );
    const avgTableSize = Number(
      data?.avg_table_size ?? data?.summary?.avg_table_size ?? 0
    );
    const avgOrderValue = Number(
      data?.avg_order_value ?? (totalOrders > 0 ? totalRevenue / totalOrders : 0)
    );

    const metrics = [
      { label: 'Total Orders', value: String(Number.isFinite(totalOrders) ? totalOrders : 0), color: [59, 130, 246] },
      { label: 'Total Revenue', value: `RM ${Number.isFinite(totalRevenue) ? totalRevenue.toLocaleString() : '0'}` , color: [16, 185, 129] },
      { label: 'Avg Table Size', value: Number.isFinite(avgTableSize) ? avgTableSize.toFixed(1) : '0.0', color: [245, 158, 11] },
      { label: 'Avg Order Value', value: `RM ${Number.isFinite(avgOrderValue) ? avgOrderValue.toFixed(2) : '0.00'}`, color: [139, 92, 246] }
    ];

    const cardWidth = (this.pageWidth - 2 * this.margin - 15) / 4;
    const cardHeight = 25;
    
    metrics.forEach((metric, index) => {
      const x = this.margin + index * (cardWidth + 5);
      
      // Card background
      this.doc.setFillColor(metric.color[0], metric.color[1], metric.color[2]);
      this.doc.setDrawColor(255, 255, 255);
      this.doc.roundedRect(x, this.currentY, cardWidth, cardHeight, 2, 2, 'FD');
      
      // Label
      this.doc.setTextColor(255, 255, 255);
      this.doc.setFontSize(8);
      this.doc.setFont('helvetica', 'normal');
      this.doc.text(metric.label, x + cardWidth / 2, this.currentY + 8, { align: 'center' });
      
      // Value
      this.doc.setFontSize(14);
      this.doc.setFont('helvetica', 'bold');
      this.doc.text(metric.value, x + cardWidth / 2, this.currentY + 18, { align: 'center' });
    });
    
    this.currentY += cardHeight + 15;
    this.doc.setTextColor(0, 0, 0);
  }

  /**
   * Executive summary derived from data
   */
  private addExecutiveSummary(data: any): void {
    this.checkPageBreak(30);
    this.addSectionTitle('Executive Summary');

    const totalOrders = Number(data?.total_orders ?? 0);
    const totalRevenue = Number(data?.total_revenue ?? 0);
    const aov = totalOrders > 0 ? totalRevenue / totalOrders : 0;

    // Find peak hour by orders
  let peak: { hour: string; orders: number } | null = null;
    if (data?.charts?.hourly_distribution?.length) {
      data.charts.hourly_distribution.forEach((h: any) => {
        const o = Number(h?.orders ?? 0);
        if (!peak || o > peak.orders) peak = { hour: String(h?.hour ?? ''), orders: o };
      });
    }

    // Find top item by orders
  let topItem: { item: string; orders: number } | null = null;
    if (data?.charts?.top_performers?.length) {
      data.charts.top_performers.forEach((t: any) => {
        const o = Number(t?.orders ?? 0);
        if (!topItem || o > topItem.orders) topItem = { item: String(t?.item ?? ''), orders: o };
      });
    }

    const bullets: string[] = [];
    bullets.push(`Daily volume: ${totalOrders} orders | Revenue: RM ${Number.isFinite(totalRevenue) ? totalRevenue.toLocaleString() : '0'}`);
    bullets.push(`Average order value: RM ${Number.isFinite(aov) ? aov.toFixed(2) : '0.00'}`);
  if (peak) bullets.push(`Peak service window: ${(peak as {hour: string; orders: number}).hour} (${(peak as {hour: string; orders: number}).orders} orders)`);
  if (topItem) bullets.push(`Top seller: ${(topItem as {item: string; orders: number}).item} (${(topItem as {item: string; orders: number}).orders} orders)`);

    this.doc.setFont('helvetica', 'normal');
    this.doc.setFontSize(9);
    bullets.forEach((b) => {
      this.checkPageBreak(8);
      const line = this.sanitizeText(b, { bullet: true });
      const lines = this.doc.splitTextToSize(line, this.pageWidth - 2 * this.margin - 10);
      this.doc.text(lines, this.margin + 5, this.currentY);
      this.currentY += lines.length * 4.6;
    });

    this.currentY += 6;
  }

  /**
   * Add AI performance analysis
   */
  private addAIAnalysis(aiInsights: any): void {
    if (!aiInsights) return;
    
    this.checkPageBreak(40);
    this.addSectionTitle('AI Performance Analysis');

    // Overall Rating
    if (aiInsights.performance_analysis) {
      const analysis = aiInsights.performance_analysis;
      
      // Rating box
      this.doc.setFillColor(236, 253, 245);
      this.doc.setDrawColor(187, 247, 208);
      this.doc.roundedRect(this.margin, this.currentY, this.pageWidth - 2 * this.margin, 15, 2, 2, 'FD');
      
      this.doc.setFontSize(11);
      this.doc.setFont('helvetica', 'bold');
      this.doc.setTextColor(5, 150, 105);
      this.doc.text(this.sanitizeText(`Overall Rating: ${analysis.overall_rating} (${analysis.efficiency_score}% Efficiency)`), 
        this.margin + 5, this.currentY + 8);
      
      this.currentY += 20;
      this.doc.setTextColor(0, 0, 0);

      // Key Findings
      if (analysis.key_findings && analysis.key_findings.length > 0) {
        this.doc.setFontSize(10);
        this.doc.setFont('helvetica', 'bold');
        this.doc.text('Key Findings:', this.margin, this.currentY);
        this.currentY += 6;

        this.doc.setFont('helvetica', 'normal');
        this.doc.setFontSize(9);
        
        analysis.key_findings.forEach((finding: string) => {
          this.checkPageBreak(10);
          const clean = this.sanitizeText(finding, { bullet: true });
          const lines = this.doc.splitTextToSize(clean, this.pageWidth - 2 * this.margin - 10);
          this.doc.text(lines, this.margin + 5, this.currentY);
          this.currentY += lines.length * 5;
        });
      }
    }
    
    this.currentY += 10;
  }

  /**
   * Add operational insights
   */
  private addOperationalInsights(aiInsights: any): void {
    if (!aiInsights?.operational_insights) return;
    
    this.checkPageBreak(30);
    this.addSectionTitle('Operational Insights');

    const insights = aiInsights.operational_insights;

    // Strengths
    if (insights.strengths && insights.strengths.length > 0) {
      this.doc.setFillColor(220, 252, 231);
      this.doc.roundedRect(this.margin, this.currentY, this.pageWidth - 2 * this.margin, 8, 1, 1, 'F');
      
      this.doc.setFontSize(10);
      this.doc.setFont('helvetica', 'bold');
      this.doc.setTextColor(5, 150, 105);
  this.doc.text('Strengths', this.margin + 5, this.currentY + 5);
      this.currentY += 12;
      
      this.doc.setFont('helvetica', 'normal');
      this.doc.setFontSize(8);
      this.doc.setTextColor(0, 0, 0);
      
      insights.strengths.forEach((strength: string) => {
        this.checkPageBreak(8);
        const lines = this.doc.splitTextToSize(this.sanitizeText(strength, { bullet: true }), this.pageWidth - 2 * this.margin - 10);
        this.doc.text(lines, this.margin + 5, this.currentY);
        this.currentY += lines.length * 4.5;
      });
      
      this.currentY += 5;
    }

    // Areas for Improvement
    if (insights.areas_for_improvement && insights.areas_for_improvement.length > 0) {
      this.checkPageBreak(20);
      
      this.doc.setFillColor(254, 242, 242);
      this.doc.roundedRect(this.margin, this.currentY, this.pageWidth - 2 * this.margin, 8, 1, 1, 'F');
      
      this.doc.setFontSize(10);
      this.doc.setFont('helvetica', 'bold');
      this.doc.setTextColor(220, 38, 38);
  this.doc.text('Areas for Improvement', this.margin + 5, this.currentY + 5);
      this.currentY += 12;
      
      this.doc.setFont('helvetica', 'normal');
      this.doc.setFontSize(8);
      this.doc.setTextColor(0, 0, 0);
      
      insights.areas_for_improvement.forEach((area: string) => {
        this.checkPageBreak(8);
        const lines = this.doc.splitTextToSize(this.sanitizeText(area, { bullet: true }), this.pageWidth - 2 * this.margin - 10);
        this.doc.text(lines, this.margin + 5, this.currentY);
        this.currentY += lines.length * 4.5;
      });
      
      this.currentY += 5;
    }

    this.currentY += 5;
  }

  /**
   * Add customer behavior insights
   */
  private addCustomerBehavior(aiInsights: any): void {
    if (!aiInsights?.customer_behavior) return;
    
    this.checkPageBreak(30);
    this.addSectionTitle('Customer Behavior Insights');

    const behavior = aiInsights.customer_behavior;

    if (behavior.patterns && behavior.patterns.length > 0) {
      this.doc.setFontSize(9);
      this.doc.setFont('helvetica', 'bold');
      this.doc.text('Behavioral Patterns:', this.margin, this.currentY);
      this.currentY += 6;

      this.doc.setFont('helvetica', 'normal');
      this.doc.setFontSize(8);
      
      behavior.patterns.forEach((pattern: string) => {
        this.checkPageBreak(8);
        const lines = this.doc.splitTextToSize(this.sanitizeText(pattern, { bullet: true }), this.pageWidth - 2 * this.margin - 10);
        this.doc.text(lines, this.margin + 5, this.currentY);
        this.currentY += lines.length * 4.5;
      });
      
      this.currentY += 8;
    }

    if (behavior.preferences && behavior.preferences.length > 0) {
      this.checkPageBreak(15);
      
      this.doc.setFontSize(9);
      this.doc.setFont('helvetica', 'bold');
      this.doc.text('Customer Preferences:', this.margin, this.currentY);
      this.currentY += 6;

      this.doc.setFont('helvetica', 'normal');
      this.doc.setFontSize(8);
      
      behavior.preferences.forEach((pref: string) => {
        this.checkPageBreak(8);
        const lines = this.doc.splitTextToSize(this.sanitizeText(pref, { bullet: true }), this.pageWidth - 2 * this.margin - 10);
        this.doc.text(lines, this.margin + 5, this.currentY);
        this.currentY += lines.length * 4.5;
      });
    }

    this.currentY += 10;
  }

  /**
   * Add future recommendations
   */
  private addRecommendations(aiInsights: any): void {
    if (!aiInsights?.future_recommendations) return;
    
    this.checkPageBreak(30);
    this.addSectionTitle('Future Recommendations & Action Plan');

    const recommendations = aiInsights.future_recommendations;

    // Immediate Actions
    if (recommendations.immediate_actions && recommendations.immediate_actions.length > 0) {
      this.doc.setFillColor(239, 246, 255);
      this.doc.roundedRect(this.margin, this.currentY, this.pageWidth - 2 * this.margin, 8, 1, 1, 'F');
      
      this.doc.setFontSize(10);
      this.doc.setFont('helvetica', 'bold');
      this.doc.setTextColor(37, 99, 235);
  this.doc.text('Immediate Actions (Next 7 Days)', this.margin + 5, this.currentY + 5);
      this.currentY += 12;
      
      this.doc.setFont('helvetica', 'normal');
      this.doc.setFontSize(8);
      this.doc.setTextColor(0, 0, 0);
      
      recommendations.immediate_actions.forEach((action: string, index: number) => {
        this.checkPageBreak(10);
        const clean = this.sanitizeText(action);
        const lines = this.doc.splitTextToSize(`${index + 1}. ${clean}`, this.pageWidth - 2 * this.margin - 10);
        this.doc.text(lines, this.margin + 5, this.currentY);
        this.currentY += lines.length * 4.5;
      });
      
      this.currentY += 8;
    }

    // Strategic Initiatives
    if (recommendations.strategic_initiatives && recommendations.strategic_initiatives.length > 0) {
      this.checkPageBreak(20);
      
      this.doc.setFillColor(243, 232, 255);
      this.doc.roundedRect(this.margin, this.currentY, this.pageWidth - 2 * this.margin, 8, 1, 1, 'F');
      
      this.doc.setFontSize(10);
      this.doc.setFont('helvetica', 'bold');
      this.doc.setTextColor(109, 40, 217);
  this.doc.text('Strategic Initiatives (30-90 Days)', this.margin + 5, this.currentY + 5);
      this.currentY += 12;
      
      this.doc.setFont('helvetica', 'normal');
      this.doc.setFontSize(8);
      this.doc.setTextColor(0, 0, 0);
      
      recommendations.strategic_initiatives.forEach((initiative: string, index: number) => {
        this.checkPageBreak(10);
        const clean = this.sanitizeText(initiative);
        const lines = this.doc.splitTextToSize(`${index + 1}. ${clean}`, this.pageWidth - 2 * this.margin - 10);
        this.doc.text(lines, this.margin + 5, this.currentY);
        this.currentY += lines.length * 4.5;
      });
      
      this.currentY += 8;
    }

    // Revenue Optimization
    if (recommendations.revenue_optimization && recommendations.revenue_optimization.length > 0) {
      this.checkPageBreak(20);
      
      this.doc.setFillColor(236, 253, 245);
      this.doc.roundedRect(this.margin, this.currentY, this.pageWidth - 2 * this.margin, 8, 1, 1, 'F');
      
      this.doc.setFontSize(10);
      this.doc.setFont('helvetica', 'bold');
      this.doc.setTextColor(5, 150, 105);
  this.doc.text('Revenue Optimization Opportunities', this.margin + 5, this.currentY + 5);
      this.currentY += 12;
      
      this.doc.setFont('helvetica', 'normal');
      this.doc.setFontSize(8);
      this.doc.setTextColor(0, 0, 0);
      
      recommendations.revenue_optimization.forEach((opportunity: string) => {
        this.checkPageBreak(10);
        const lines = this.doc.splitTextToSize(this.sanitizeText(opportunity, { bullet: true }), this.pageWidth - 2 * this.margin - 10);
        this.doc.text(lines, this.margin + 5, this.currentY);
        this.currentY += lines.length * 4.5;
      });
      
      this.currentY += 8;
    }

    // Waste Reduction
    if (recommendations.waste_reduction && recommendations.waste_reduction.length > 0) {
      this.checkPageBreak(20);
      
      this.doc.setFillColor(254, 249, 231);
      this.doc.roundedRect(this.margin, this.currentY, this.pageWidth - 2 * this.margin, 8, 1, 1, 'F');
      
      this.doc.setFontSize(10);
      this.doc.setFont('helvetica', 'bold');
      this.doc.setTextColor(217, 119, 6);
  this.doc.text('Waste Reduction Strategies', this.margin + 5, this.currentY + 5);
      this.currentY += 12;
      
      this.doc.setFont('helvetica', 'normal');
      this.doc.setFontSize(8);
      this.doc.setTextColor(0, 0, 0);
      
      recommendations.waste_reduction.forEach((strategy: string) => {
        this.checkPageBreak(10);
        const lines = this.doc.splitTextToSize(this.sanitizeText(strategy, { bullet: true }), this.pageWidth - 2 * this.margin - 10);
        this.doc.text(lines, this.margin + 5, this.currentY);
        this.currentY += lines.length * 4.5;
      });
    }

    this.currentY += 10;
  }

  /**
   * Add forecasting section
   */
  private addForecasting(aiInsights: any): void {
    if (!aiInsights?.forecasting) return;
    
    this.checkPageBreak(30);
    this.addSectionTitle('Forecasting & Predictions');

    const forecasting = aiInsights.forecasting;

    // Prediction cards
    const predictions = [
      { label: 'Next Day', value: forecasting.next_day_prediction },
      { label: 'Weekly Trend', value: forecasting.next_week_trend },
      { label: 'Seasonal Notes', value: forecasting.seasonal_notes }
    ];

    predictions.forEach(pred => {
      if (pred.value) {
        this.checkPageBreak(15);
        
        this.doc.setFillColor(249, 250, 251);
        this.doc.setDrawColor(229, 231, 235);
        this.doc.roundedRect(this.margin, this.currentY, this.pageWidth - 2 * this.margin, 12, 1, 1, 'FD');
        
        this.doc.setFontSize(9);
        this.doc.setFont('helvetica', 'bold');
  this.doc.text(`${pred.label}:`, this.margin + 5, this.currentY + 5);
        
        this.doc.setFont('helvetica', 'normal');
        this.doc.setFontSize(8);
  const lines = this.doc.splitTextToSize(this.sanitizeText(pred.value), this.pageWidth - 2 * this.margin - 50);
        this.doc.text(lines, this.margin + 35, this.currentY + 5);
        
        this.currentY += 15;
      }
    });

    // Risk Factors
    if (forecasting.risk_factors && forecasting.risk_factors.length > 0) {
      this.checkPageBreak(15);
      
      this.doc.setFontSize(9);
      this.doc.setFont('helvetica', 'bold');
      this.doc.setTextColor(220, 38, 38);
  this.doc.text('Risk Factors to Monitor:', this.margin, this.currentY);
      this.currentY += 6;
      
      this.doc.setFont('helvetica', 'normal');
      this.doc.setFontSize(8);
      this.doc.setTextColor(0, 0, 0);
      
      forecasting.risk_factors.forEach((risk: string) => {
        this.checkPageBreak(8);
        const lines = this.doc.splitTextToSize(this.sanitizeText(risk, { bullet: true }), this.pageWidth - 2 * this.margin - 10);
        this.doc.text(lines, this.margin + 5, this.currentY);
        this.currentY += lines.length * 4.5;
      });
    }

    this.currentY += 10;
  }

  /**
   * Add chart data table
   */
  private addChartDataTable(charts: any): void {
    if (!charts) return;

    // Hourly Distribution
    if (charts.hourly_distribution && charts.hourly_distribution.length > 0) {
      this.checkPageBreak(40);
      this.addSectionTitle('Hourly Performance Distribution');

      autoTable(this.doc, {
        startY: this.currentY,
        head: [['Time Slot', 'Orders', 'Revenue (RM)', 'Percentage']],
        body: charts.hourly_distribution.map((item: any) => {
          const hour = item?.hour ?? '';
          const orders = Number(item?.orders ?? 0);
          const revenue = Number(item?.revenue ?? 0);
          const pct = Number(item?.percentage ?? 0);
          return [
            hour,
            String(orders),
            `RM ${Number.isFinite(revenue) ? revenue.toFixed(2) : '0.00'}`,
            `${Number.isFinite(pct) ? pct.toFixed(1) : '0.0'}%`
          ];
        }),
        theme: 'grid',
        headStyles: { fillColor: [59, 130, 246], textColor: 255, fontStyle: 'bold' },
        alternateRowStyles: { fillColor: [249, 250, 251] },
        margin: { left: this.margin, right: this.margin },
        styles: { fontSize: 8, cellPadding: 3 }
      });

      this.currentY = (this.doc as any).lastAutoTable.finalY + 15;
    }

    // Top Performers
    if (charts.top_performers && charts.top_performers.length > 0) {
      this.checkPageBreak(40);
      this.addSectionTitle('Top Performing Items');

      autoTable(this.doc, {
        startY: this.currentY,
        head: [['Item', 'Orders', 'Revenue (RM)', 'Trend']],
        body: charts.top_performers.map((item: any) => {
          const name = item?.item ?? '';
          const orders = Number(item?.orders ?? 0);
          const revenue = Number(item?.revenue ?? 0);
          const trend = item?.trend ?? '';
          return [
            name,
            String(orders),
            `RM ${Number.isFinite(revenue) ? revenue.toFixed(2) : '0.00'}`,
            trend
          ];
        }),
        theme: 'grid',
        headStyles: { fillColor: [16, 185, 129], textColor: 255, fontStyle: 'bold' },
        alternateRowStyles: { fillColor: [236, 253, 245] },
        margin: { left: this.margin, right: this.margin },
        styles: { fontSize: 8, cellPadding: 3 }
      });

      this.currentY = (this.doc as any).lastAutoTable.finalY + 15;
    }

    // Category Performance
    if (charts.category_performance && charts.category_performance.length > 0) {
      this.checkPageBreak(40);
      this.addSectionTitle('Category Performance Breakdown');

      autoTable(this.doc, {
        startY: this.currentY,
        head: [['Category', 'Orders', 'Revenue (RM)', 'Percentage']],
        body: charts.category_performance.map((item: any) => {
          const category = item?.category ?? '';
          const orders = Number(item?.orders ?? 0);
          const revenue = Number(item?.revenue ?? 0);
          const pct = Number(item?.percentage ?? 0);
          return [
            category,
            String(orders),
            `RM ${Number.isFinite(revenue) ? revenue.toFixed(2) : '0.00'}`,
            `${Number.isFinite(pct) ? pct.toFixed(1) : '0.0'}%`
          ];
        }),
        theme: 'grid',
        headStyles: { fillColor: [139, 92, 246], textColor: 255, fontStyle: 'bold' },
        alternateRowStyles: { fillColor: [245, 243, 255] },
        margin: { left: this.margin, right: this.margin },
        styles: { fontSize: 8, cellPadding: 3 }
      });

      this.currentY = (this.doc as any).lastAutoTable.finalY + 15;
    }
  }

  /**
   * Add footer
   */
  private addFooter(): void {
    const pageCount = this.doc.getNumberOfPages();
    
    for (let i = 1; i <= pageCount; i++) {
      this.doc.setPage(i);
      
      // Footer line
      this.doc.setDrawColor(229, 231, 235);
      this.doc.line(this.margin, this.pageHeight - 15, this.pageWidth - this.margin, this.pageHeight - 15);
      
      // Footer text
      this.doc.setFontSize(8);
      this.doc.setTextColor(107, 114, 128);
      this.doc.setFont('helvetica', 'normal');
      
      const footerText = `SmartKitchen Pro - Performance Report | Generated on ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}`;
      this.doc.text(footerText, this.margin, this.pageHeight - 8);
      
      // Page number
      this.doc.text(`Page ${i} of ${pageCount}`, this.pageWidth - this.margin - 20, this.pageHeight - 8);
    }
  }

  /**
   * Generate Daily Report
   */
  generateDailyReport(data: any): void {
    const dateStr = data.date_range?.start || new Date().toLocaleDateString('en-GB');
    this.addHeader('Daily Performance Report', `Analysis for ${dateStr}`);
    
    this.addKeyMetrics(data);
    this.addExecutiveSummary(data);
    
    if (data.ai_insights) {
      this.addAIAnalysis(data.ai_insights);
      this.addOperationalInsights(data.ai_insights);
      this.addCustomerBehavior(data.ai_insights);
      this.addChartDataTable(data.charts);
      this.addRecommendations(data.ai_insights);
      this.addForecasting(data.ai_insights);
    }
    
    this.addFooter();
    
    const fileName = `SmartKitchen_Daily_Report_${dateStr.replace(/\//g, '-')}.pdf`;
    this.doc.save(fileName);
  }

  /**
   * Generate Weekly Report
   */
  generateWeeklyReport(data: any): void {
    const startDate = data.date_range?.start || '';
    const endDate = data.date_range?.end || '';
    this.addHeader('Weekly Performance Report', `Analysis for ${startDate} to ${endDate}`);
    
  this.addKeyMetrics(data);
  this.addExecutiveSummary(data);
    
    if (data.ai_insights) {
      this.addAIAnalysis(data.ai_insights);
      this.addOperationalInsights(data.ai_insights);
      this.addCustomerBehavior(data.ai_insights);
      this.addChartDataTable(data.charts);
      this.addRecommendations(data.ai_insights);
      this.addForecasting(data.ai_insights);
    }
    
    this.addFooter();
    
    const fileName = `SmartKitchen_Weekly_Report_${startDate.replace(/\//g, '-')}_to_${endDate.replace(/\//g, '-')}.pdf`;
    this.doc.save(fileName);
  }

  /**
   * Generate Monthly Report
   */
  generateMonthlyReport(data: any): void {
    const startDate = data.date_range?.start || '';
    const endDate = data.date_range?.end || '';
    this.addHeader('Monthly Performance Report', `Analysis for ${startDate} to ${endDate}`);
    
  this.addKeyMetrics(data);
  this.addExecutiveSummary(data);
    
    if (data.ai_insights) {
      this.addAIAnalysis(data.ai_insights);
      this.addOperationalInsights(data.ai_insights);
      this.addCustomerBehavior(data.ai_insights);
      this.addChartDataTable(data.charts);
      this.addRecommendations(data.ai_insights);
      this.addForecasting(data.ai_insights);
    }
    
    this.addFooter();
    
    const fileName = `SmartKitchen_Monthly_Report_${startDate.replace(/\//g, '-')}_to_${endDate.replace(/\//g, '-')}.pdf`;
    this.doc.save(fileName);
  }
}
