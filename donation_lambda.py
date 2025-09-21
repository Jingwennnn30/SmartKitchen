# Donation Lambda Function
import boto3
import json
from datetime import datetime, timedelta
from decimal import Decimal
from collections import Counter

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
        
        # Get current date
        today = datetime.today().date()
        
        # Scan the stock table
        stock_response = stock_table.scan()
        stock_items = stock_response.get("Items", [])
        
        # Get donation partners (unique values from donation_partner field)
        donation_partners = set()
        donation_items = []
        partner_stats = {}
        
        for item in stock_items:
            # Collect unique donation partners
            partner = item.get("donation_partner", "")
            if partner and partner != "0" and partner != "Not Applicable":
                donation_partners.add(partner)
                
                # Add to partner stats
                status = item.get("donation_status", "Unknown")
                if partner not in partner_stats:
                    partner_stats[partner] = {"total": 0, "successful": 0, "pending": 0, "failed": 0}
                
                partner_stats[partner]["total"] += 1
                if status == "Completed" or status == "Successful":
                    partner_stats[partner]["successful"] += 1
                elif status == "Pending Approval" or status == "Pending":
                    partner_stats[partner]["pending"] += 1
                else:
                    partner_stats[partner]["failed"] += 1
            
            # Collect items with donation history
            if item.get("donation_quantity") and int(float(item.get("donation_quantity", 0))) > 0:
                donation_item = {
                    "item_id": item.get("item_id"),
                    "item_name": item.get("item_name", "Unknown"),
                    "donation_partner": item.get("donation_partner", ""),
                    "donation_date": item.get("donation_date", ""),
                    "donation_quantity": int(float(item.get("donation_quantity", 0))),
                    "donation_status": item.get("donation_status", "Unknown"),
                    "expiry_date": item.get("expiry_date", ""),
                    "unit": item.get("unit", ""),
                    "storage_location": item.get("storage_location", ""),
                    "supplier": item.get("supplier", ""),
                    "unit_price": float(item.get("unit_price", 0)) if item.get("unit_price") else 0,
                    "stockquantity": int(float(item.get("stockquantity", 0))),
                    "past_wasted": int(float(item.get("past_wasted", 0))),
                    "waste_reason": item.get("waste_reason", "")
                }
                donation_items.append(donation_item)
        
        # Calculate overall statistics
        total_donated_items = len([item for item in donation_items if item["donation_status"] in ["Completed", "Successful"]])
        total_wasted_kg = sum([item["past_wasted"] for item in stock_items if item.get("past_wasted")])
        
        # Calculate partner success rates
        partner_analytics = []
        for partner, stats in partner_stats.items():
            success_rate = (stats["successful"] / stats["total"] * 100) if stats["total"] > 0 else 0
            partner_analytics.append({
                "partner": partner,
                "total_donations": stats["total"],
                "successful_donations": stats["successful"],
                "pending_donations": stats["pending"],
                "failed_donations": stats["failed"],
                "success_rate": round(success_rate, 2)
            })
        
        # Sort partners by success rate
        partner_analytics.sort(key=lambda x: x["success_rate"], reverse=True)
        
        # Sort donation items by date (most recent first)
        donation_items.sort(key=lambda x: x["donation_date"], reverse=True)
        
        return {
            "statusCode": 200,
            "headers": {
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Headers": "Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token",
                "Access-Control-Allow-Methods": "GET,OPTIONS,POST,PUT",
                "Content-Type": "application/json"
            },
            "body": json.dumps({
                "donation_partners": list(donation_partners),
                "donation_items": donation_items,
                "partner_analytics": partner_analytics,
                "summary_stats": {
                    "total_partners": len(donation_partners),
                    "total_donated_items": total_donated_items,
                    "total_wasted_kg": total_wasted_kg,
                    "total_donation_records": len(donation_items)
                },
                "scan_date": today.isoformat()
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
                "error": "Failed to fetch donation data",
                "details": str(e)
            }, cls=DecimalEncoder)
        }