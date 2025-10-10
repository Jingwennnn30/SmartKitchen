# DynamoDB Update Permissions for Order Stock Management

Write-Host "REQUIRED DYNAMODB UPDATE PERMISSIONS FOR ORDER-STOCK TABLE" -ForegroundColor Yellow
Write-Host "==========================================================" -ForegroundColor Yellow

$orderStockUpdatePolicy = @"
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Effect": "Allow",
            "Action": [
                "dynamodb:Scan",
                "dynamodb:Query",
                "dynamodb:GetItem",
                "dynamodb:UpdateItem",
                "dynamodb:DescribeTable"
            ],
            "Resource": [
                "arn:aws:dynamodb:us-east-1:761386521687:table/order-stock",
                "arn:aws:dynamodb:us-east-1:761386521687:table/order-stock/index/*"
            ]
        }
    ]
}
"@

Write-Host ""
Write-Host "CRITICAL: The approve/reject functionality requires UpdateItem permission!" -ForegroundColor Red
Write-Host ""
Write-Host "STEPS TO ADD ORDER-STOCK UPDATE PERMISSIONS:" -ForegroundColor Green
Write-Host "1. Go to AWS IAM Console: https://console.aws.amazon.com/iam/"
Write-Host "2. Find your user: quicksight-embed-backend"
Write-Host "3. Add this policy or update your existing policy to include UpdateItem:"
Write-Host ""
Write-Host "================== ADD THIS TO YOUR IAM POLICY ==================" -ForegroundColor Cyan
Write-Host $orderStockUpdatePolicy -ForegroundColor White
Write-Host "==================================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "QUICK FIX - ADD THESE ACTIONS TO YOUR EXISTING POLICY:" -ForegroundColor Yellow
Write-Host 'In your existing DynamoDB policy, add:'
Write-Host '"dynamodb:UpdateItem"' -ForegroundColor Green
Write-Host ""
Write-Host "And ensure this resource is included:"
Write-Host '"arn:aws:dynamodb:us-east-1:761386521687:table/order-stock"' -ForegroundColor Green
Write-Host ""
Write-Host "After adding UpdateItem permission, the approve/reject buttons will work!" -ForegroundColor Green
Write-Host ""
Write-Host "Current Error: AccessDeniedException for dynamodb:UpdateItem" -ForegroundColor Red
Write-Host "User: arn:aws:iam::761386521687:user/quicksight-embed-backend" -ForegroundColor Red
Write-Host "Resource: arn:aws:dynamodb:us-east-1:761386521687:table/order-stock" -ForegroundColor Red