// DynamoDB Data Explorer Script
// This will help you understand your table structure and data

const AWS = require('aws-sdk');
require('dotenv').config();

// Configure AWS
AWS.config.update({
    region: process.env.AWS_REGION || 'us-east-1',
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
});

const dynamodb = new AWS.DynamoDB({ region: 'us-east-1' });
const docClient = new AWS.DynamoDB.DocumentClient({ region: 'us-east-1' });

async function exploreDynamoDB() {
    console.log('🔍 Exploring your DynamoDB tables...\n');
    
    try {
        // 1. List all tables
        console.log('📋 Available DynamoDB Tables:');
        console.log('===============================');
        const tables = await dynamodb.listTables().promise();
        
        if (tables.TableNames.length === 0) {
            console.log('❌ No tables found in this region');
            return;
        }
        
        tables.TableNames.forEach((tableName, index) => {
            console.log(`${index + 1}. ${tableName}`);
        });
        
        console.log('\n🔧 Please tell me which table contains your stock data!\n');
        
        // 2. For each table, show structure
        for (const tableName of tables.TableNames) {
            console.log(`\n📊 Table: ${tableName}`);
            console.log('='.repeat(50));
            
            try {
                // Get table description
                const tableInfo = await dynamodb.describeTable({ TableName: tableName }).promise();
                const table = tableInfo.Table;
                
                console.log(`📈 Item Count: ${table.ItemCount || 'Unknown'}`);
                console.log(`🔑 Primary Key: ${table.KeySchema[0].AttributeName} (${table.KeySchema[0].KeyType})`);
                
                if (table.KeySchema.length > 1) {
                    console.log(`🔑 Sort Key: ${table.KeySchema[1].AttributeName} (${table.KeySchema[1].KeyType})`);
                }
                
                console.log('📋 Attributes:');
                table.AttributeDefinitions.forEach(attr => {
                    console.log(`   - ${attr.AttributeName} (${attr.AttributeType})`);
                });
                
                // Get sample data (first 3 items)
                console.log('\n📄 Sample Data (first 3 items):');
                const scanParams = {
                    TableName: tableName,
                    Limit: 3
                };
                
                const data = await docClient.scan(scanParams).promise();
                
                if (data.Items && data.Items.length > 0) {
                    data.Items.forEach((item, index) => {
                        console.log(`\n   Item ${index + 1}:`);
                        console.log('   ' + JSON.stringify(item, null, 4));
                    });
                } else {
                    console.log('   ❌ No data found in this table');
                }
                
            } catch (error) {
                console.log(`   ❌ Error accessing table: ${error.message}`);
            }
        }
        
        console.log('\n' + '='.repeat(60));
        console.log('✅ Exploration complete!');
        console.log('\n💡 Next steps:');
        console.log('1. Tell me which table contains your stock data');
        console.log('2. Let me know what fields you want to display');
        console.log('3. Describe how you want the data to appear in the Current Stock card');
        
    } catch (error) {
        console.error('❌ Error exploring DynamoDB:', error.message);
        
        if (error.code === 'UnrecognizedClientException') {
            console.log('\n🔧 SOLUTION: Check your AWS credentials in .env file');
        } else if (error.code === 'AccessDeniedException') {
            console.log('\n🔧 SOLUTION: Your AWS user needs DynamoDB permissions');
            console.log('Add this policy to your IAM user:');
            console.log(JSON.stringify({
                "Version": "2012-10-17",
                "Statement": [
                    {
                        "Effect": "Allow",
                        "Action": [
                            "dynamodb:ListTables",
                            "dynamodb:DescribeTable",
                            "dynamodb:Scan",
                            "dynamodb:Query",
                            "dynamodb:GetItem"
                        ],
                        "Resource": "*"
                    }
                ]
            }, null, 2));
        }
    }
}

// Run the exploration
exploreDynamoDB();