#!/usr/bin/env python3
"""
Test script for the discount Lambda function with real frontend data
"""
import json
import sys
import os

# Add the current directory to the path so we can import the lambda function
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from lambda_function_discount_corrected import lambda_handler

def test_options_request():
    """Test OPTIONS preflight request"""
    print("🔄 Testing OPTIONS preflight request...")
    
    event = {
        'httpMethod': 'OPTIONS',
        'headers': {
            'Origin': 'http://localhost:3000',
            'Access-Control-Request-Method': 'POST',
            'Access-Control-Request-Headers': 'Content-Type'
        }
    }
    
    response = lambda_handler(event, {})
    
    print(f"Status Code: {response['statusCode']}")
    print(f"Headers: {response['headers']}")
    print(f"Body: {response['body']}")
    
    return response['statusCode'] == 200

def test_test_request():
    """Test the test endpoint"""
    print("\n🔄 Testing test endpoint...")
    
    event = {
        'httpMethod': 'GET',
        'queryStringParameters': {
            'test': 'true'
        }
    }
    
    response = lambda_handler(event, {})
    
    print(f"Status Code: {response['statusCode']}")
    print(f"Headers: {response['headers']}")
    print(f"Body: {response['body']}")
    
    return response['statusCode'] == 200

def test_with_real_data():
    """Test with the actual frontend payload structure"""
    print("\n🔄 Testing with real frontend data...")
    
    # Real data structure from the frontend console log
    real_frontend_data = {
        "items": [
            {
                "item_name": "Tofu",
                "item_id": 1073,
                "quantity": "140ml",
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
                "quantity": "64ml",
                "expiry_date": "2025-10-06",
                "unit": "ml",
                "storage_location": "Pantry 1",
                "supplier": "Cap Sauh Flour",
                "unit_price": 4.63,
                "total_stock": 216
            },
            {
                "item_name": "Egg",
                "item_id": 1039,
                "quantity": "83kg",
                "expiry_date": "2025-10-06",
                "unit": "kg",
                "storage_location": "Freezer A",
                "supplier": "Ayam Brand",
                "unit_price": 28.81,
                "total_stock": 181
            }
        ]
    }
    
    event = {
        'httpMethod': 'POST',
        'headers': {
            'Content-Type': 'application/json'
        },
        'body': json.dumps(real_frontend_data)
    }
    
    try:
        response = lambda_handler(event, {})
        
        print(f"Status Code: {response['statusCode']}")
        print(f"Headers: {response['headers']}")
        
        body = json.loads(response['body'])
        print(f"Response Body: {json.dumps(body, indent=2)}")
        
        if response['statusCode'] == 200:
            print(f"✅ Successfully processed {body.get('processed_items', 0)} items")
            print(f"✅ Generated {body.get('total_promotions', 0)} promotions")
            return True
        else:
            print(f"❌ Error: {body.get('error', 'Unknown error')}")
            return False
            
    except Exception as e:
        print(f"❌ Exception during test: {str(e)}")
        return False

def main():
    print("🚀 Testing Discount Lambda Function")
    print("=" * 50)
    
    # Test OPTIONS request
    options_ok = test_options_request()
    print(f"OPTIONS Test: {'✅ PASS' if options_ok else '❌ FAIL'}")
    
    # Test test endpoint
    test_ok = test_test_request()
    print(f"Test Endpoint: {'✅ PASS' if test_ok else '❌ FAIL'}")
    
    # Test with real data
    data_ok = test_with_real_data()
    print(f"Real Data Test: {'✅ PASS' if data_ok else '❌ FAIL'}")
    
    print("\n" + "=" * 50)
    if options_ok and test_ok and data_ok:
        print("🎉 ALL TESTS PASSED! Lambda function is ready for deployment.")
    else:
        print("❌ Some tests failed. Please check the issues above.")
    
    return 0 if (options_ok and test_ok and data_ok) else 1

if __name__ == "__main__":
    exit(main())