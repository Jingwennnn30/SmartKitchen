# IAM Policy for QuickSight Dashboard Embedding with QUICKSIGHT Identity Type
# This policy grants the necessary permissions for dashboard embedding

# First, let's create the IAM policy document
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

# Save the policy to a temporary file
$policyFile = "quicksight-embed-policy.json"
$policyDocument | Out-File -FilePath $policyFile -Encoding utf8

Write-Host "✅ Created IAM policy file: $policyFile"
Write-Host ""
Write-Host "🔧 Next steps to fix the permissions issue:"
Write-Host "1. Open AWS IAM Console: https://console.aws.amazon.com/iam/"
Write-Host "2. Go to 'Users' -> Find your user: quicksight-embed-backend"
Write-Host "3. Click 'Add permissions' -> 'Create inline policy'"
Write-Host "4. Switch to 'JSON' tab and paste the following policy:"
Write-Host ""
Write-Host "==================== COPY THIS POLICY ===================="
Write-Host $policyDocument
Write-Host "========================================================="
Write-Host ""
Write-Host "5. Click 'Review policy' -> Name it: 'QuickSightEmbedPolicy'"
Write-Host "6. Click 'Create policy'"
Write-Host ""
Write-Host "🚀 After adding the policy, restart the backend server!"