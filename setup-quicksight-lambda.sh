aws iam create-policy \
  --policy-name SmartKitchen-QuickSight-Policy \
  --policy-document file://quicksight-policy.json \
  --description "Custom policy for QuickSight embed access"

aws iam create-role \
  --role-name SmartKitchen-QuickSight-Lambda-Role \
  --assume-role-policy-document file://lambda-trust-policy.json \
  --description "Lambda execution role for QuickSight access"

aws iam attach-role-policy \
  --role-name SmartKitchen-QuickSight-Lambda-Role \
  --policy-arn arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole

aws iam attach-role-policy \
  --role-name SmartKitchen-QuickSight-Lambda-Role \
  --policy-arn arn:aws:iam::761386521687:policy/SmartKitchen-QuickSight-Policy

aws lambda create-function \
  --function-name smartkitchen-quicksight \
  --runtime python3.9 \
  --role arn:aws:iam::761386521687:role/SmartKitchen-QuickSight-Lambda-Role \
  --handler quicksight_embed_lambda.lambda_handler \
  --zip-file fileb://quicksight-lambda.zip \
  --timeout 30 \
  --environment Variables='{AWS_ACCOUNT_ID=761386521687,QUICKSIGHT_DASHBOARD_ID=e098949c-c065-42b6-a884-ac41d4167ad5}'

aws apigatewayv2 create-api \
  --name smartkitchen-quicksight-api \
  --protocol-type HTTP \
  --cors-configuration AllowOrigins="*",AllowMethods="GET,OPTIONS",AllowHeaders="*"

echo "✅ All policies and Lambda function created!"