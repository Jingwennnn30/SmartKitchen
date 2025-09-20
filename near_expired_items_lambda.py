# Near Expired Items Lambda Function
import boto3
import json
from datetime import datetime, timedelta
import random
from decimal import Decimal

# Configuration
DYNAMODB_REGION = "ap-southeast-5"
STOCK_TABLE = "stock"

# AWS Client
dynamodb = boto3.resource("dynamodb", region_name=DYNAMODB_REGION)

# Custom JSON encoder to handle Decimal objects
class DecimalEncoder(json.JSONEncoder):
    def default(self, o):
        if isinstance(o, Decimal):
            return float(o)
        return super(DecimalEncoder, self).default(o)

def lambda_handler(event, context):
    try:
        stock_table = dynamodb.Table(STOCK_TABLE)
        
        # Get current date and cutoff dates for donation window
        today = datetime.today().date()
        start_donation_window = today + timedelta(days=14)  # Start from 14 days later
        end_donation_window = today + timedelta(days=44)    # Up to 44 days (14+30 days donation window)
        
        # Scan the stock table
        stock_response = stock_table.scan()
        stock_items = stock_response.get("Items", [])
        
        near_expired_items = []
        
        for item in stock_items:
            if "expiry_date" in item and int(float(item.get("stockquantity", 0))) > 0:
                try:
                    expiry_date = datetime.strptime(item["expiry_date"], "%Y-%m-%d").date()
                    
                    # Check if item expires within donation window (14-44 days from now)
                    # This excludes items expiring too soon (0-13 days) for donation
                    if start_donation_window <= expiry_date <= end_donation_window:
                        # Mock quantity logic: use 10-50% of stock quantity
                        total_stock = int(float(item.get("stockquantity", 0)))
                        mock_percentage = random.uniform(0.1, 0.5)  # 10% to 50%
                        mock_quantity = max(1, int(total_stock * mock_percentage))
                        
                        near_expired_item = {
                            "item_id": item.get("item_id"),
                            "item_name": item.get("item_name", "Unknown"),
                            "quantity": f"{mock_quantity}{item.get('unit', '')}",
                            "expiry_date": item.get("expiry_date"),
                            "unit": item.get("unit", ""),
                            "storage_location": item.get("storage_location", ""),
                            "supplier": item.get("supplier", ""),
                            "unit_price": float(item.get("unit_price", 0)) if item.get("unit_price") else 0,
                            "total_stock": total_stock
                        }
                        
                        near_expired_items.append(near_expired_item)
                        
                except ValueError:
                    # Skip items with invalid date format
                    continue
        
        # Sort by expiry date (most urgent first)
        near_expired_items.sort(key=lambda x: x["expiry_date"])
        
        return {
            "statusCode": 200,
            "headers": {
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Headers": "Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token",
                "Access-Control-Allow-Methods": "GET,OPTIONS,POST,PUT",
                "Content-Type": "application/json"
            },
            "body": json.dumps({
                "near_expired_items": near_expired_items,
                "count": len(near_expired_items),
                "scan_date": today.isoformat(),
                "donation_window": {
                    "start_date": start_donation_window.isoformat(),
                    "end_date": end_donation_window.isoformat(),
                    "description": "Items expiring 14-44 days from scan date (suitable for donation)"
                }
            }, cls=DecimalEncoder)
        }
        
    except Exception as e:
        print(f"Error: {str(e)}")
        return {
            "statusCode": 500,
            "headers": {
                "Access-Control-Allow-Origin": "*",
                "Content-Type": "application/json"
            },
            "body": json.dumps({
                "error": "Failed to fetch near expired items",
                "details": str(e)
            }, cls=DecimalEncoder)
        }