// Quick test to help identify the correct QuickSight user
const AWS = require('aws-sdk');
require('dotenv').config();

AWS.config.update({
    region: 'us-east-1',
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
});

const quicksight = new AWS.QuickSight({ region: 'us-east-1' });

async function listQuickSightUsers() {
    try {
        console.log('🔍 Listing QuickSight users in your account...');
        
        const params = {
            AwsAccountId: '761386521687',
            Namespace: 'default'
        };
        
        const result = await quicksight.listUsers(params).promise();
        
        console.log('✅ Found QuickSight users:');
        result.UserList.forEach(user => {
            console.log(`👤 Username: ${user.UserName}`);
            console.log(`📧 Email: ${user.Email || 'N/A'}`);
            console.log(`🔗 ARN: ${user.Arn}`);
            console.log('---');
        });
        
        console.log('\n💡 Copy the correct ARN from above and update your .env file:');
        console.log('QUICKSIGHT_USER_ARN=<paste_the_correct_arn_here>');
        
    } catch (error) {
        console.error('❌ Error listing users:', error.code, '-', error.message);
        
        if (error.code === 'AccessDeniedException') {
            console.log('\n🔧 SOLUTION: Your AWS user needs QuickSight permissions:');
            console.log('1. Go to IAM Console');
            console.log('2. Add policy: AWSQuickSightDescribeUser');
            console.log('3. Or add custom policy with quicksight:ListUsers permission');
        }
    }
}

listQuickSightUsers();