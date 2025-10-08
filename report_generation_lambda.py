import json
import boto3
import uuid
from datetime import datetime, timedelta
from decimal import Decimal
import base64
from reportlab.lib.pagesizes import letter, A4
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER, TA_LEFT, TA_RIGHT
import io

# AWS clients
bedrock = boto3.client('bedrock-runtime', region_name='us-east-1')
s3 = boto3.client('s3')
dynamodb = boto3.resource('dynamodb', region_name='us-east-1')

# Configuration
BUCKET_NAME = 'smartkitchen-reports'  # Replace with your S3 bucket
TABLE_NAME = 'sales_2025_sep_oct'  # Replace with your DynamoDB table name

def lambda_handler(event, context):
    try:
        # Parse request
        body = json.loads(event.get('body', '{}'))
        report_type = body.get('type', 'daily')
        start_date = body.get('startDate')
        end_date = body.get('endDate')
        
        print(f"Generating {report_type} report from {start_date} to {end_date}")
        
        # Get performance data
        performance_data = get_performance_data(start_date, end_date)
        
        # Generate AI analysis
        ai_analysis = generate_ai_analysis(performance_data, report_type)
        
        # Generate PDF report
        pdf_buffer = generate_pdf_report(performance_data, ai_analysis, report_type, start_date, end_date)
        
        # Upload to S3 and generate presigned URL
        filename = f"reports/{report_type}_report_{datetime.now().strftime('%Y%m%d_%H%M%S')}_{uuid.uuid4().hex[:8]}.pdf"
        
        s3.put_object(
            Bucket=BUCKET_NAME,
            Key=filename,
            Body=pdf_buffer.getvalue(),
            ContentType='application/pdf'
        )
        
        # Generate presigned URL (valid for 1 hour)
        download_url = s3.generate_presigned_url(
            'get_object',
            Params={'Bucket': BUCKET_NAME, 'Key': filename},
            ExpiresIn=3600
        )
        
        return {
            'statusCode': 200,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type'
            },
            'body': json.dumps({
                'success': True,
                'url': download_url,
                'filename': filename.split('/')[-1],
                'type': report_type
            })
        }
        
    except Exception as e:
        print(f"Error: {str(e)}")
        return {
            'statusCode': 500,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type'
            },
            'body': json.dumps({
                'success': False,
                'error': str(e)
            })
        }

def get_performance_data(start_date, end_date):
    """Fetch performance data from DynamoDB"""
    try:
        table = dynamodb.Table(TABLE_NAME)
        
        # If no dates provided, get recent data
        if not start_date or not end_date:
            end_date = datetime.now().strftime('%d/%m/%Y')
            start_date = (datetime.now() - timedelta(days=7)).strftime('%d/%m/%Y')
        
        # Query DynamoDB
        response = table.scan()
        items = response.get('Items', [])
        
        # Filter by date range if specified
        filtered_items = []
        daily_breakdown = {}
        total_orders = 0
        total_revenue = 0
        
        for item in items:
            item_date = item.get('date', '')
            if start_date and end_date:
                # Simple date filtering (you may need to adjust based on your date format)
                if item_date >= start_date and item_date <= end_date:
                    filtered_items.append(item)
            else:
                filtered_items.append(item)
        
        # Calculate daily breakdown
        for item in filtered_items:
            date = item.get('date', '')
            orders = int(item.get('orders', 0))
            revenue = float(item.get('revenue', 0))
            
            if date not in daily_breakdown:
                daily_breakdown[date] = {'orders': 0, 'revenue': 0}
            
            daily_breakdown[date]['orders'] += orders
            daily_breakdown[date]['revenue'] += revenue
            
            total_orders += orders
            total_revenue += revenue
        
        # Calculate average table size
        avg_table_size = 2.8 if filtered_items else 0  # Default or calculate from data
        
        return {
            'summary': {
                'total_orders': total_orders,
                'total_revenue': total_revenue,
                'avg_table_size': avg_table_size
            },
            'daily_breakdown': daily_breakdown,
            'items': filtered_items,
            'date_range': {
                'start': start_date,
                'end': end_date
            }
        }
        
    except Exception as e:
        print(f"Error fetching data: {str(e)}")
        return {
            'summary': {'total_orders': 0, 'total_revenue': 0, 'avg_table_size': 0},
            'daily_breakdown': {},
            'items': [],
            'date_range': {'start': start_date, 'end': end_date}
        }

def generate_ai_analysis(performance_data, report_type):
    """Generate AI analysis using AWS Bedrock DeepSeek-R1 model"""
    try:
        # Prepare data for analysis
        summary = performance_data['summary']
        daily_breakdown = performance_data['daily_breakdown']
        date_range = performance_data['date_range']
        
        # Mock data for other charts (as mentioned in requirements)
        mock_staff_efficiency = {
            'score': 87,
            'trend': '+2.5%',
            'ai_suggestions': '+42% faster order processing',
            'smart_queue': '38% wait time reduction'
        }
        
        mock_waste_analysis = {
            'current_rate': 4.5,
            'target': 5.0,
            'monthly_cost': 17755,
            'trend': 'improving'
        }
        
        mock_inventory_trends = {
            'stock_levels': 'optimal',
            'usage_efficiency': 'good',
            'restock_predictions': 'accurate'
        }
        
        # Create analysis prompt
        prompt = f"""
        As a professional restaurant analytics expert, analyze the following SmartKitchen performance data and provide comprehensive insights:

        REAL DATA - Historical Order Patterns:
        - Report Type: {report_type.title()}
        - Date Range: {date_range['start']} to {date_range['end']}
        - Total Orders: {summary['total_orders']}
        - Total Revenue: RM {summary['total_revenue']:,.2f}
        - Average Table Size: {summary['avg_table_size']:.1f} people
        - Daily Breakdown: {json.dumps(daily_breakdown, indent=2)}

        MOCK DATA FOR ANALYSIS (treat as current operational data):
        - AI-Enhanced Staff Efficiency: {mock_staff_efficiency['score']}% efficiency score, {mock_staff_efficiency['trend']} improvement, {mock_staff_efficiency['ai_suggestions']}, {mock_staff_efficiency['smart_queue']}
        - Cost & Waste Analysis: {mock_waste_analysis['current_rate']}% waste rate (Target: <{mock_waste_analysis['target']}%), Monthly cost: RM {mock_waste_analysis['monthly_cost']:,}, Status: {mock_waste_analysis['trend']}
        - Inventory Management: Stock levels {mock_inventory_trends['stock_levels']}, Usage efficiency {mock_inventory_trends['usage_efficiency']}, Predictions {mock_inventory_trends['restock_predictions']}

        Please provide a comprehensive analysis covering:

        1. **Executive Summary** (2-3 sentences highlighting key performance indicators)

        2. **Performance Highlights**
           - Revenue and order trends analysis
           - Table utilization insights
           - Peak performance periods

        3. **Operational Excellence**
           - Staff efficiency analysis and AI-driven improvements
           - Wait time optimization achievements
           - Order processing enhancements

        4. **Cost Management & Sustainability**
           - Waste reduction performance vs targets
           - Cost efficiency analysis
           - Environmental impact insights

        5. **Inventory & Supply Chain**
           - Stock level optimization
           - Usage pattern analysis
           - Predictive restocking effectiveness

        6. **Strategic Recommendations**
           - 3-4 actionable recommendations for improvement
           - Priority areas for management attention
           - Potential growth opportunities

        7. **Predictive Insights**
           - Expected trends for next period
           - Risk factors to monitor
           - Optimization opportunities

        Make the analysis professional, data-driven, and actionable. Use specific numbers and percentages where relevant.
        """
        
        # Call Bedrock DeepSeek-R1 model
        response = bedrock.invoke_model(
            modelId='deepseek.r1-v1:0',
            body=json.dumps({
                'messages': [
                    {
                        'role': 'user',
                        'content': prompt
                    }
                ],
                'max_tokens': 4000,
                'temperature': 0.3,
                'top_p': 0.9
            }),
            contentType='application/json'
        )
        
        response_body = json.loads(response['body'].read())
        analysis = response_body['choices'][0]['message']['content']
        
        return analysis
        
    except Exception as e:
        print(f"Error generating AI analysis: {str(e)}")
        # Fallback analysis
        return f"""
        **AI Analysis for {report_type.title()} Report**
        
        **Executive Summary**
        Performance analysis shows {performance_data['summary']['total_orders']} orders generating RM {performance_data['summary']['total_revenue']:,.2f} in revenue with an average table size of {performance_data['summary']['avg_table_size']:.1f} people.
        
        **Key Insights**
        - Order volume demonstrates steady operational capacity
        - Revenue performance indicates healthy business activity
        - Table utilization suggests efficient seating management
        
        **Recommendations**
        - Continue monitoring daily performance trends
        - Optimize peak hour operations for maximum efficiency
        - Focus on maintaining current service quality standards
        
        Note: Detailed AI analysis temporarily unavailable. Full analysis capabilities will be restored shortly.
        """

def generate_pdf_report(performance_data, ai_analysis, report_type, start_date, end_date):
    """Generate PDF report with performance data and AI analysis"""
    buffer = io.BytesIO()
    doc = SimpleDocTemplate(buffer, pagesize=A4, rightMargin=72, leftMargin=72, topMargin=72, bottomMargin=18)
    
    # Get styles
    styles = getSampleStyleSheet()
    
    # Custom styles
    title_style = ParagraphStyle(
        'CustomTitle',
        parent=styles['Heading1'],
        fontSize=24,
        spaceAfter=30,
        alignment=TA_CENTER,
        textColor=colors.HexColor('#1f2937')
    )
    
    heading_style = ParagraphStyle(
        'CustomHeading',
        parent=styles['Heading2'],
        fontSize=16,
        spaceAfter=12,
        spaceBefore=20,
        textColor=colors.HexColor('#3b82f6')
    )
    
    body_style = ParagraphStyle(
        'CustomBody',
        parent=styles['Normal'],
        fontSize=11,
        spaceAfter=6,
        leading=14
    )
    
    # Build story
    story = []
    
    # Title
    story.append(Paragraph(f"SmartKitchen {report_type.title()} Performance Report", title_style))
    story.append(Spacer(1, 12))
    
    # Report info
    report_info = f"""
    <b>Report Generated:</b> {datetime.now().strftime('%B %d, %Y at %I:%M %p')}<br/>
    <b>Report Type:</b> {report_type.title()}<br/>
    <b>Date Range:</b> {start_date or 'N/A'} to {end_date or 'N/A'}<br/>
    <b>Analysis Engine:</b> AWS Bedrock DeepSeek-R1
    """
    story.append(Paragraph(report_info, body_style))
    story.append(Spacer(1, 20))
    
    # Performance Summary
    story.append(Paragraph("Performance Summary", heading_style))
    
    summary_data = [
        ['Metric', 'Value'],
        ['Total Orders', f"{performance_data['summary']['total_orders']:,}"],
        ['Total Revenue', f"RM {performance_data['summary']['total_revenue']:,.2f}"],
        ['Average Table Size', f"{performance_data['summary']['avg_table_size']:.1f} people"],
        ['Analysis Period', f"{len(performance_data['daily_breakdown'])} days"]
    ]
    
    summary_table = Table(summary_data, colWidths=[3*inch, 2*inch])
    summary_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#3b82f6')),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
        ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, 0), 12),
        ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
        ('BACKGROUND', (0, 1), (-1, -1), colors.beige),
        ('GRID', (0, 0), (-1, -1), 1, colors.black),
        ('FONTNAME', (0, 1), (-1, -1), 'Helvetica'),
        ('FONTSIZE', (0, 1), (-1, -1), 10),
    ]))
    
    story.append(summary_table)
    story.append(Spacer(1, 20))
    
    # Daily Breakdown (if available)
    if performance_data['daily_breakdown']:
        story.append(Paragraph("Daily Performance Breakdown", heading_style))
        
        daily_data = [['Date', 'Orders', 'Revenue (RM)']]
        for date, data in performance_data['daily_breakdown'].items():
            daily_data.append([
                date,
                f"{data['orders']:,}",
                f"RM {data['revenue']:,.2f}"
            ])
        
        daily_table = Table(daily_data, colWidths=[2*inch, 1.5*inch, 1.5*inch])
        daily_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#10b981')),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
            ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, 0), 11),
            ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
            ('BACKGROUND', (0, 1), (-1, -1), colors.HexColor('#f0fdf4')),
            ('GRID', (0, 0), (-1, -1), 1, colors.black),
            ('FONTNAME', (0, 1), (-1, -1), 'Helvetica'),
            ('FONTSIZE', (0, 1), (-1, -1), 9),
        ]))
        
        story.append(daily_table)
        story.append(PageBreak())
    
    # AI Analysis
    story.append(Paragraph("AI-Powered Business Intelligence Analysis", title_style))
    story.append(Spacer(1, 20))
    
    # Split analysis into paragraphs and format
    analysis_paragraphs = ai_analysis.split('\n')
    for para in analysis_paragraphs:
        para = para.strip()
        if para:
            if para.startswith('**') and para.endswith('**'):
                # This is a heading
                heading_text = para.replace('**', '')
                story.append(Paragraph(heading_text, heading_style))
            elif para.startswith('*') or para.startswith('-'):
                # This is a bullet point
                bullet_text = para.lstrip('*- ')
                story.append(Paragraph(f"• {bullet_text}", body_style))
            else:
                # Regular paragraph
                story.append(Paragraph(para, body_style))
            story.append(Spacer(1, 6))
    
    # Footer
    story.append(Spacer(1, 30))
    footer_style = ParagraphStyle(
        'Footer',
        parent=styles['Normal'],
        fontSize=9,
        alignment=TA_CENTER,
        textColor=colors.grey
    )
    
    footer_text = f"""
    <br/><br/>
    ---<br/>
    This report was automatically generated by SmartKitchen AI Analytics System<br/>
    Powered by AWS Bedrock DeepSeek-R1 • Generated on {datetime.now().strftime('%B %d, %Y')}<br/>
    For questions or support, contact your system administrator
    """
    story.append(Paragraph(footer_text, footer_style))
    
    # Build PDF
    doc.build(story)
    
    return buffer

# For testing
if __name__ == "__main__":
    # Test event
    test_event = {
        'body': json.dumps({
            'type': 'daily',
            'startDate': '26/9/2025',
            'endDate': '30/9/2025'
        })
    }
    
    result = lambda_handler(test_event, None)
    print(json.dumps(result, indent=2))