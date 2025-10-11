# IAM Policy for QuickSight Dashboard Embedding
Write-Host "REQUIRED IAM POLICY FOR QUICKSIGHT EMBEDDING" -ForegroundColor Yellow
Write-Host "=============================================" -ForegroundColor Yellow

$policyDocument = @"
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Effect": "Allow",
            "Action": [
                "quicksight:GetDashboardEmbedUrl",
                "quicksight:GetAuthCode",
                "quicksight:DescribeUser",
                "quicksight:DescribeDashboard",
                "quicksight:ListUserGroups"
            ],
            "Resource": [
                "arn:aws:quicksight:us-east-1:761386521687:user/default/*",
                "arn:aws:quicksight:us-east-1:761386521687:dashboard/*"
            ]
        }
    ]
}
"@

Write-Host ""
Write-Host "STEPS TO FIX THE PERMISSION ERROR:" -ForegroundColor Green
Write-Host "1. Open AWS IAM Console: https://console.aws.amazon.com/iam/"
Write-Host "2. Go to Users -> Find your user: quicksight-embed-backend"
Write-Host "3. Click Add permissions -> Create inline policy"
Write-Host "4. Switch to JSON tab and paste this policy:"
Write-Host ""
Write-Host "================== COPY THIS POLICY ==================" -ForegroundColor Cyan
Write-Host $policyDocument -ForegroundColor White
Write-Host "=======================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "5. Click Review policy -> Name it: QuickSightEmbedPolicy"
Write-Host "6. Click Create policy"
Write-Host ""
Write-Host "After adding the policy, restart the backend server!" -ForegroundColor Green