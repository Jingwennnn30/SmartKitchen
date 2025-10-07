# Discount Promotion Lambda (Updated for Frontend Integration)
import os
import boto3
import json
from datetime import datetime, timedelta
import re

# ------------------------
# CONFIGURATION
# ------------------------
DYNAMODB_REGION = "ap-southeast-5"
MENU_TABLE = "menu"
RECIPE_TABLE = "recipe"
SALES_TABLE = "sales"  # Added sales table for additional context

BEDROCK_REGION = "us-east-1"
MODEL_ID = "meta.llama3-8b-instruct-v1:0"

os.environ["AWS_REGION"] = BEDROCK_REGION
os.environ["AWS_DEFAULT_REGION"] = BEDROCK_REGION

# ------------------------
# AWS CLIENTS
# ------------------------
dynamodb = boto3.resource("dynamodb", region_name=DYNAMODB_REGION)
bedrock_runtime = boto3.client(
    "bedrock-runtime",
    region_name=BEDROCK_REGION,
    endpoint_url="https://bedrock-runtime.us-east-1.amazonaws.com"
)

def lambda_handler(event, context):
    """
    Lambda handler that receives filtered near-expired items from frontend
    and generates AI-powered discount promotions for dishes using those ingredients
    """
    
    # Enhanced CORS headers - most comprehensive possible
    headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': '*',
        'Access-Control-Allow-Methods': '*',
        'Access-Control-Expose-Headers': '*',
        'Access-Control-Max-Age': '86400',
        'Content-Type': 'application/json'
    }
    
    # Always return CORS headers first
    try:
        print(f"HTTP Method: {event.get('httpMethod', 'UNKNOWN')}")
        print(f"Headers: {event.get('headers', {})}")
        
        # Handle preflight OPTIONS request - ALWAYS respond with 200
        if event.get('httpMethod') == 'OPTIONS' or event.get('requestContext', {}).get('httpMethod') == 'OPTIONS':
            print("Handling OPTIONS preflight request")
            return {
                'statusCode': 200,
                'headers': headers,
                'body': json.dumps({'message': 'CORS preflight successful'})
            }
        
        # Handle test request
        query_params = event.get('queryStringParameters') or {}
        if query_params.get('test') == 'true':
            print("Handling test request")
            return {
                'statusCode': 200,
                'headers': headers,
                'body': json.dumps({
                    'message': 'Discount API is working',
                    'timestamp': datetime.now().isoformat(),
                    'test': True
                })
            }
        
        print(f"Received event: {json.dumps(event, default=str)}")
        
        # Parse input - handle both GET and POST requests
        near_expired_items = []
        
        # Check for query parameters first (this handles GET requests and API Gateway integration issues)
        query_params = event.get('queryStringParameters') or {}
        items_param = query_params.get('items')
        
        if items_param:
            # Handle GET request with query parameters
            print(f"Found items in query parameters, length: {len(items_param)}")
            try:
                # Handle URL-decoded parameters
                import urllib.parse
                decoded_items = urllib.parse.unquote(items_param)
                near_expired_items = json.loads(decoded_items)
                print(f"Successfully parsed {len(near_expired_items)} items from query parameters")
            except (json.JSONDecodeError, ValueError) as e:
                print(f"Error parsing GET parameters: {e}")
                print(f"Raw items_param: {items_param[:200]}...")
                near_expired_items = []
        else:
            # Handle POST request with body (fallback)
            print("No query parameters found, checking request body...")
            body = event.get('body', '{}')
            if isinstance(body, str):
                try:
                    body = json.loads(body)
                except json.JSONDecodeError:
                    print(f"Failed to parse body as JSON: {body}")
                    body = {}
            
            # Try multiple possible key names for the items
            near_expired_items = (
                body.get('items', []) or 
                body.get('nearExpiredItems', []) or 
                body.get('near_expired_items', []) or
                []
            )
            
            # If still empty, check if the body itself is an array
            if not near_expired_items and isinstance(body, list):
                near_expired_items = body
        
        print(f"Processing {len(near_expired_items)} near-expired items")
        print(f"Raw items data: {near_expired_items}")
        
        if not near_expired_items:
            return {
                'statusCode': 400,
                'headers': headers,
                'body': json.dumps({
                    'error': 'No near-expired items provided. Please provide items for discount generation.',
                    'debug_info': {
                        'event_method': event.get('httpMethod'),
                        'body_type': str(type(event.get('body', {}))),
                        'body_content': str(event.get('body', {}))[:200],
                        'query_params': event.get('queryStringParameters')
                    }
                })
            }
        
        # Extract item names from the frontend data
        expiring_item_names = []
        for item in near_expired_items:
            item_name = ""
            if isinstance(item, dict):
                # Try multiple possible field names - prioritize item_name since that's what frontend sends
                item_name = (
                    item.get('item_name', '') or
                    item.get('itemName', '') or
                    item.get('item', '') or
                    item.get('name', '') or 
                    str(item.get('item_id', ''))
                )
            else:
                item_name = str(item)
            
            if item_name:
                expiring_item_names.append(item_name.lower().strip())
        
        print(f"Expiring item names: {expiring_item_names}")
        
        if not expiring_item_names:
            return {
                'statusCode': 400,
                'headers': headers,
                'body': json.dumps({
                    'error': 'No valid item names found in the provided data.',
                    'debug_items': [{'item_fields': list(item.keys()) if isinstance(item, dict) else str(type(item))} for item in near_expired_items[:3]]
                })
            }
        
        # Get database tables
        menu_table = dynamodb.Table(MENU_TABLE)
        recipe_table = dynamodb.Table(RECIPE_TABLE)
        
        # Step 1: Build dish_id -> ingredients map from recipe table
        print("Scanning recipe table...")
        recipe_response = recipe_table.scan()
        recipe_items = recipe_response.get("Items", [])
        
        dish_ingredients = {}
        for recipe in recipe_items:
            dish_id = str(recipe.get("dish_id", ""))
            ingredient = recipe.get("ingredient", "").lower().strip()
            
            if dish_id and ingredient:
                if dish_id not in dish_ingredients:
                    dish_ingredients[dish_id] = []
                dish_ingredients[dish_id].append(ingredient)
        
        print(f"Found {len(dish_ingredients)} dishes in recipe table")
        
        # Step 2: Build dish_id -> menu info map
        print("Scanning menu table...")
        menu_response = menu_table.scan()
        menu_items = menu_response.get("Items", [])
        menu_dict = {str(item.get("dish_id", "")): item for item in menu_items if item.get("dish_id")}
        
        print(f"Found {len(menu_dict)} dishes in menu table")
        
        # Step 3: Find dishes that use 1 or 2 of the expiring ingredients
        candidate_dishes = []
        
        for dish_id, ingredients in dish_ingredients.items():
            # Count how many expiring ingredients this dish uses
            matching_ingredients = [ing for ing in ingredients if ing in expiring_item_names]
            
            # Include dishes that use at least 1 expiring ingredient
            if len(matching_ingredients) >= 1:
                menu_info = menu_dict.get(dish_id, {})
                if menu_info and menu_info.get("dishname"):
                    candidate_dishes.append({
                        'dish_id': dish_id,
                        'menu_info': menu_info,
                        'matching_ingredients': matching_ingredients,
                        'ingredient_count': len(matching_ingredients)
                    })
        
        # Sort by number of matching ingredients (descending) and take top 5
        candidate_dishes.sort(key=lambda x: x['ingredient_count'], reverse=True)
        candidate_dishes = candidate_dishes[:5]
        
        print(f"Found {len(candidate_dishes)} candidate dishes for promotion")
        
        if not candidate_dishes:
            return {
                'statusCode': 200,
                'headers': headers,
                'body': json.dumps({
                    'discounts': [],
                    'message': 'No dishes found that use the provided near-expired ingredients.'
                })
            }
        
        # Step 4: Generate AI-powered promotions for candidate dishes
        discounts = []
        
        for candidate in candidate_dishes:
            menu_info = candidate['menu_info']
            dishname = menu_info.get("dishname", "Unknown Dish")
            price = menu_info.get("price", "0")
            description = menu_info.get("description", "")
            category = menu_info.get("category", "")
            matching_ingredients = candidate['matching_ingredients']
            
            # Create AI prompt for promotion generation
            ingredients_text = ', '.join(matching_ingredients)
            
            # Use regular string concatenation instead of f-string for multi-line prompt
            prompt = (
                "You are a creative restaurant marketing expert specializing in food waste reduction promotions. "
                "Generate an attractive discount promotion for this dish that uses near-expired ingredients, "
                "ensuring the restaurant remains profitable.\n\n"
                "DISH DETAILS:\n"
                f"- Name: {dishname}\n"
                f"- Description: {description}\n"
                f"- Category: {category}\n"
                f"- Original Price: RM {price}\n"
                f"- Near-Expired Ingredients Used: {ingredients_text}\n\n"
                "PROMOTION GUIDELINES:\n"
                "- Be creative with promotion types: Buy 1 Free 1, percentage discounts (20%-70%), combo deals, free add-ons (soft serve, drinks), set meals\n"
                "- Consider the original price when suggesting discount amounts\n"
                "- Make it appealing to customers while helping reduce food waste\n"
                "- Keep promotion title catchy and under 8 words\n"
                "- Description should be 1 compelling sentence\n\n"
                "REQUIRED FORMAT:\n"
                "Title: [Catchy promotion name]\n"
                "PromotionPrice: [New price in RM, calculate if percentage discount]\n"
                "Description: [One compelling sentence about the offer]"
            )

            try:
                print(f"Generating promotion for {dishname}...")
                
                response = bedrock_runtime.invoke_model(
                    modelId=MODEL_ID,
                    body=json.dumps({
                        "prompt": f"<|begin_of_text|><|start_header_id|>user<|end_header_id|>\n{prompt}<|eot_id|><|start_header_id|>assistant<|end_header_id|>\n",
                        "max_gen_len": 300,
                        "temperature": 0.8,
                        "top_p": 0.9
                    }),
                    contentType="application/json",
                    accept="application/json"
                )
                
                result = json.loads(response["body"].read())
                ai_output = result.get("generation", "").strip()
                
                print(f"AI output for {dishname}: {ai_output}")
                
                # Parse AI output with improved regex
                title_match = re.search(r"Title:\s*(.+?)(?:\n|$)", ai_output, re.IGNORECASE)
                price_match = re.search(r"PromotionPrice:\s*(.+?)(?:\n|$)", ai_output, re.IGNORECASE)
                desc_match = re.search(r"Description:\s*(.+?)(?:\n|$)", ai_output, re.IGNORECASE)
                
                # Extract and clean values
                title = title_match.group(1).strip() if title_match else f"{dishname} Special Deal"
                promo_price_text = price_match.group(1).strip() if price_match else str(price)
                desc = desc_match.group(1).strip() if desc_match else f"Special promotion on {dishname} using fresh ingredients!"
                
                # Clean up promotion price (remove "RM" if present, keep numbers and decimals)
                promo_price_clean = re.sub(r'[^\d.]', '', promo_price_text)
                if not promo_price_clean or not promo_price_clean.replace('.', '').isdigit():
                    promo_price_clean = str(float(price) * 0.7)  # Default 30% off
                
                # Remove any quotes, asterisks, and extra formatting from AI output
                title = re.sub(r'^[\*\"\'\s]+|[\*\"\'\s]+$', '', title)  # Remove leading/trailing *, quotes, spaces
                desc = re.sub(r'^[\*\"\'\s]+|[\*\"\'\s]+$', '', desc)   # Remove leading/trailing *, quotes, spaces
                title = title.replace('**', '').replace('\\"', '"').strip()  # Clean up markdown and escaped quotes
                desc = desc.replace('**', '').replace('\\"', '"').strip()    # Clean up markdown and escaped quotes
                
            except Exception as e:
                print(f"AI generation failed for {dishname}: {str(e)}")
                # Fallback promotion
                title = f"{dishname} Waste-Free Special"
                promo_price_clean = str(round(float(price) * 0.7, 2))  # 30% off
                desc = f"Help us reduce food waste with this special discount on {dishname}!"
            
            # Add to discounts list
            discount_item = {
                "dish": dishname,
                "promotion_title": title,
                "promotion_price": promo_price_clean,
                "promotion_description": desc,
                "time": "Whole Day",
                "original_price": str(price),
                "ingredients_used": ingredients_text,
                "category": category
            }
            
            discounts.append(discount_item)
            print(f"Added discount for {dishname}: {title}")
        
        print(f"Generated {len(discounts)} discount promotions")
        
        return {
            'statusCode': 200,
            'headers': headers,
            'body': json.dumps({
                'discounts': discounts,
                'total_promotions': len(discounts),
                'processed_items': len(expiring_item_names)
            })
        }
        
    except Exception as e:
        print(f"Error in lambda_handler: {str(e)}")
        return {
            'statusCode': 500,
            'headers': headers,
            'body': json.dumps({
                'error': f'Internal server error: {str(e)}'
            })
        }