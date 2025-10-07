import json
import boto3
from decimal import Decimal
from datetime import datetime

dynamodb = boto3.resource('dynamodb')
table = dynamodb.Table('sales_2025_sep_oct')

def lambda_handler(event, context):
    print("Incoming event:", json.dumps(event))
    
    try:
        params = event.get('queryStringParameters') or {}
        start_date = params.get('start_date')
        end_date = params.get('end_date')

        # Scan all data (you can later replace with query if using date as key)
        response = table.scan()
        items = response.get('Items', [])

        # Filter by date range if provided
        if start_date and end_date:
            def parse_date(date_str):
                return datetime.strptime(date_str, "%d/%m/%Y")

            start = parse_date(start_date)
            end = parse_date(end_date)

            items = [
                item for item in items
                if start <= parse_date(item['date']) <= end
            ]

        # Convert Decimal to float
        for item in items:
            for k, v in item.items():
                if isinstance(v, Decimal):
                    item[k] = float(v)

        # --- FIXED: Aggregate Summary using quantity_sold ---
        total_quantity_sold = sum(int(item.get('quantity_sold', 0)) for item in items)
        total_revenue = sum(float(item.get('revenue', 0)) for item in items)
        
        # Calculate average table size only for items that were actually sold
        sold_items = [item for item in items if int(item.get('quantity_sold', 0)) > 0]
        avg_table_size = (
            sum(float(item.get('avg_table_size', 0)) for item in sold_items) / len(sold_items)
            if len(sold_items) > 0 else 0
        )

        # Group by date for charting
        daily_summary = {}
        for item in items:
            date = item['date']
            daily_summary.setdefault(date, {"orders": 0, "revenue": 0})
            daily_summary[date]['orders'] += int(item.get('quantity_sold', 0))
            daily_summary[date]['revenue'] += float(item.get('revenue', 0))

        response_data = {
            "summary": {
                "total_orders": total_quantity_sold,  # ← FIXED: Now uses sum of quantity_sold
                "total_revenue": total_revenue,
                "avg_table_size": avg_table_size,
            },
            "daily_breakdown": daily_summary,
            "items": items,
            "debug_info": {
                "total_records": len(items),
                "total_quantity_sold": total_quantity_sold,
                "sold_items_count": len(sold_items)
            }
        }

        return {
            "statusCode": 200,
            "headers": {
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Headers": "*",
                "Access-Control-Allow-Methods": "OPTIONS,GET"
            },
            "body": json.dumps(response_data)
        }

    except Exception as e:
        print("Error:", str(e))
        return {
            "statusCode": 500,
            "headers": {
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Headers": "*",
                "Access-Control-Allow-Methods": "OPTIONS,GET"
            },
            "body": json.dumps({"error": str(e)})
        }