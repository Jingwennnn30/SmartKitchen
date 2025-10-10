# DynamoDB Permissions for Stock Data Integration

Write-Host "REQUIRED DYNAMODB PERMISSIONS" -ForegroundColor Yellow
Write-Host "=============================" -ForegroundColor Yellow

$dynamodbPolicy = @"
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Effect": "Allow",
            "Action": [
                "dynamodb:Scan",
                "dynamodb:Query",
                "dynamodb:GetItem",
                "dynamodb:DescribeTable"
            ],
            "Resource": [
                "arn:aws:dynamodb:us-east-1:761386521687:table/stock-updated-v2",
                "arn:aws:dynamodb:us-east-1:761386521687:table/stock-updated-v2/index/*"
            ]
        }
    ]
}
"@

Write-Host ""
Write-Host "STEPS TO ADD DYNAMODB PERMISSIONS:" -ForegroundColor Green
Write-Host "1. Go to AWS IAM Console: https://console.aws.amazon.com/iam/"
Write-Host "2. Find your user: quicksight-embed-backend"
Write-Host "3. Add this policy (can be added to your existing QuickSight policy):"
Write-Host ""
Write-Host "================== ADD THIS TO YOUR IAM POLICY ==================" -ForegroundColor Cyan
Write-Host $dynamodbPolicy -ForegroundColor White
Write-Host "==================================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "OR UPDATE YOUR EXISTING POLICY TO INCLUDE DYNAMODB ACTIONS:" -ForegroundColor Yellow
Write-Host 'Add these actions to your existing policy Actions array:'
Write-Host '"dynamodb:Scan",'
Write-Host '"dynamodb:Query",'
Write-Host '"dynamodb:GetItem",'
Write-Host '"dynamodb:DescribeTable"'
Write-Host ""
Write-Host "And add this resource:"
Write-Host '"arn:aws:dynamodb:us-east-1:761386521687:table/stock-updated-v2"'
Write-Host ""
Write-Host "After adding permissions, refresh http://localhost:3000" -ForegroundColor Green