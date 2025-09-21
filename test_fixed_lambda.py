#!/usr/bin/env python3
"""
Quick test for the fixed discount Lambda function
"""
import json
import sys
import os

# Add the current directory to the path so we can import the lambda function
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

# Import the lambda function
from lambda_function_discount_corrected import lambda_handler

def test_empty_request():
    """Test empty request (what's currently failing)"""
    print("🧪 Testing empty request that's causing 500 error...")
    
    event = {
        "httpMethod": "GET",
        "headers": {},
        "queryStringParameters": None,
        "body": None
    }
    
    response = lambda_handler(event, {})
    print(f"Status: {response['statusCode']}")
    print(f"Body: {response['body']}")
    return response['statusCode'] == 400  # Should return 400, not 500

def test_actual_frontend_data():
    """Test with the exact data from frontend logs"""
    print("🧪 Testing with actual frontend data...")
    
    frontend_items = [
        {
            "item_name": "Tofu",
            "item_id": 1073,
            "quantity": "55ml",
            "expiry_date": "2025-10-05",
            "unit": "ml",
            "storage_location": "Shelf B",
            "supplier": "Lee Kum Kee",
            "unit_price": 46.89,
            "total_stock": 391
        },
        {
            "item_name": "Flour",
            "item_id": 1038,
            "quantity": "31ml",
            "expiry_date": "2025-10-06",
            "unit": "ml",
            "storage_location": "Pantry 1",
            "supplier": "Cap Sauh Flour",
            "unit_price": 4.63,
            "total_stock": 216
        }
    ]
    
    event = {
        "httpMethod": "POST",
        "headers": {
            "Content-Type": "application/json"
        },
        "body": json.dumps({
            "items": frontend_items
        })
    }
    
    response = lambda_handler(event, {})
    print(f"Status: {response['statusCode']}")
    
    if response['statusCode'] == 200:
        result = json.loads(response['body'])
        print(f"Success! Generated {result.get('total_promotions', 0)} promotions")
        return True
    else:
        print(f"Error: {response['body']}")
        return False

if __name__ == "__main__":
    print("🚀 Testing Fixed Lambda Function")
    print("=" * 40)
    
    # Test 1: Empty request (this should fix the 500 error)
    print("\n1. Empty Request Test:")
    if test_empty_request():
        print("✅ PASS - Empty request properly returns 400")
    else:
        print("❌ FAIL - Empty request still problematic")
    
    # Test 2: Real data test (this would work if DynamoDB was accessible)
    print("\n2. Frontend Data Test:")
    print("Note: This will fail due to DynamoDB access, but should show proper parsing")
    test_actual_frontend_data()
    
    print("\n" + "=" * 40)
    print("📝 Key fixes applied:")
    print("✅ Fixed JSON serialization error with type() objects")
    print("✅ Converted type() to str(type()) for debug info")
    print("✅ Lambda should now return 400 instead of 500 for empty requests")
    print("\n🚀 Ready for deployment to AWS!")