const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const AWS = require('aws-sdk');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 4000;

// AWS Configuration
AWS.config.update({
    region: process.env.AWS_REGION || 'us-east-1',
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
});

const quicksight = new AWS.QuickSight({
    region: 'us-east-1'
});

// DynamoDB Client
const dynamodb = new AWS.DynamoDB.DocumentClient({
    region: 'us-east-1'
});

// Middleware
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            frameSrc: ["'self'", "https://*.quicksight.aws.amazon.com"],
            imgSrc: ["'self'", "data:", "https:"],
            styleSrc: ["'self'", "'unsafe-inline'"],
            scriptSrc: ["'self'"]
        }
    }
}));

app.use(compression());

// CORS configuration
const corsOptions = {
    origin: process.env.NODE_ENV === 'production' 
        ? process.env.FRONTEND_URL || 'https://your-production-domain.com'
        : ['http://localhost:3000', 'http://127.0.0.1:3000'],
    methods: ['GET', 'POST', 'PUT', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
};

app.use(cors(corsOptions));
app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => {
    res.status(200).json({ 
        status: 'healthy', 
        timestamp: new Date().toISOString(),
        service: 'foodwise-quicksight-backend'
    });
});

// Stock data endpoint
app.get('/api/stock', async (req, res) => {
    try {
        console.log('Received request for stock data');
        
        const params = {
            TableName: 'stock-updated-v2',
            Limit: 50 // Limit to reasonable number for dashboard
        };
        
        const result = await dynamodb.scan(params).promise();
        
        // Transform DynamoDB data to match frontend expectations
        const stockData = result.Items.map(item => {
            // Calculate status based on expiry date
            const expiryDate = new Date(item.expiry_date);
            const today = new Date();
            const daysUntilExpiry = Math.ceil((expiryDate - today) / (1000 * 60 * 60 * 24));
            
            let status;
            if (daysUntilExpiry < 0) {
                status = 'Expired';
            } else if (daysUntilExpiry <= 7) {
                status = 'Running Soon';
            } else {
                status = 'Good';
            }
            
            return {
                item: item.item_name || 'Unknown Item',
                quantity: `${item.stockquantity || 0}${item.unit ? ' ' + item.unit : ''}`,
                expiryDate: item.expiry_date || 'N/A',
                status: status,
                location: item.storage_location || 'Unknown Location'
            };
        });
        
        // Sort alphabetically by item name (A-Z) and return all items
        const sortedData = stockData
            .sort((a, b) => a.item.localeCompare(b.item));
        
        // Get unique locations for filtering
        const locations = [...new Set(stockData.map(item => item.location))].sort();
        
        console.log(`Successfully retrieved ${sortedData.length} stock items`);
        
        res.status(200).json({
            success: true,
            data: sortedData,
            locations: locations,
            timestamp: new Date().toISOString(),
            totalItems: result.Items.length
        });
        
    } catch (error) {
        console.error('Error fetching stock data:', error);
        
        res.status(500).json({
            success: false,
            error: 'Failed to fetch stock data',
            code: error.code || 'UnknownError',
            message: error.message,
            timestamp: new Date().toISOString()
        });
    }
});

// Low Stock Alerts endpoint
app.get('/api/low-stock', async (req, res) => {
    try {
        console.log('Received request for low stock alerts');
        
        const params = {
            TableName: 'stock-updated-v2',
            Limit: 50
        };
        
        const result = await dynamodb.scan(params).promise();
        
        // Helper function to determine item category and threshold - MUCH STRICTER
        const getItemCategory = (itemName, unit) => {
            const name = itemName.toLowerCase();
            const unitLower = unit.toLowerCase();
            
            // Only alert when very close to safety level (within 3 units max)
            return { category: 'strict', threshold: 1.0, buffer: 3 }; // Only 3 units buffer above safety level
        };
        
        // Group items by name to check for expired vs fresh stock
        const itemGroups = {};
        result.Items.forEach(item => {
            const itemName = item.item_name || 'Unknown Item';
            if (!itemGroups[itemName]) {
                itemGroups[itemName] = [];
            }
            itemGroups[itemName].push(item);
        });
        
        const lowStockItems = [];
        
        // Check each item group
        Object.keys(itemGroups).forEach(itemName => {
            const items = itemGroups[itemName];
            
            // Calculate total current stock (only non-expired items)
            const currentDate = new Date();
            let totalCurrentStock = 0;
            let safetyLevel = 0;
            let unit = '';
            let location = '';
            let supplier = '';
            let hasExpiredItems = false;
            let hasNonExpiredItems = false;
            
            items.forEach(item => {
                const expiryDate = new Date(item.expiry_date);
                const stockQty = parseInt(item.stockquantity) || 0;
                const safety = parseInt(item.safety_stock_level) || 0;
                
                if (expiryDate < currentDate) {
                    hasExpiredItems = true;
                } else {
                    hasNonExpiredItems = true;
                    totalCurrentStock += stockQty;
                }
                
                // Use the highest safety level and get other info from any item
                if (safety > safetyLevel) {
                    safetyLevel = safety;
                    unit = item.unit || '';
                    location = item.storage_location || 'Unknown Location';
                    supplier = item.supplier || 'Unknown Supplier';
                }
            });
            
            // Skip items with no safety level defined
            if (safetyLevel === 0) return;
            
            const { category, threshold, buffer } = getItemCategory(itemName, unit);
            const alertThreshold = safetyLevel + buffer; // Only add small buffer (3 units)
            
            // Determine if this item needs an alert - MUCH STRICTER CRITERIA
            let shouldAlert = false;
            let urgency = 'Medium';
            let reason = '';
            
            // Critical: No stock at all or only expired items exist
            if (totalCurrentStock === 0) {
                if (hasExpiredItems && !hasNonExpiredItems) {
                    shouldAlert = true;
                    urgency = 'Critical';
                    reason = 'All stock expired, no fresh items available';
                } else if (totalCurrentStock === 0) {
                    shouldAlert = true;
                    urgency = 'Critical';
                    reason = 'Out of stock';
                }
            }
            // High: Stock is at or below safety level
            else if (totalCurrentStock <= safetyLevel) {
                shouldAlert = true;
                urgency = 'High';
                reason = 'At or below safety stock level';
            }
            // Medium: Stock is VERY close to safety level (within 3 units only)
            else if (totalCurrentStock <= alertThreshold && (totalCurrentStock - safetyLevel) <= 3) {
                shouldAlert = true;
                urgency = 'Medium';
                reason = `Stock getting low (${category} item threshold)`;
            }
            
            if (shouldAlert) {
                const deficit = Math.max(0, safetyLevel - totalCurrentStock);
                
                lowStockItems.push({
                    item: itemName,
                    currentStock: totalCurrentStock,
                    safetyLevel: safetyLevel,
                    alertThreshold: alertThreshold,
                    unit: unit,
                    location: location,
                    deficit: deficit,
                    urgency: urgency,
                    supplier: supplier,
                    category: category,
                    reason: reason,
                    hasExpiredItems: hasExpiredItems
                });
            }
        });
        
        // Sort by urgency and deficit
        lowStockItems.sort((a, b) => {
            const urgencyOrder = { 'Critical': 3, 'High': 2, 'Medium': 1 };
            if (urgencyOrder[a.urgency] !== urgencyOrder[b.urgency]) {
                return urgencyOrder[b.urgency] - urgencyOrder[a.urgency];
            }
            return b.deficit - a.deficit;
        });
        
        console.log(`Found ${lowStockItems.length} low stock items using smart thresholds`);
        
        res.status(200).json({
            success: true,
            data: lowStockItems,
            timestamp: new Date().toISOString(),
            totalLowStockItems: lowStockItems.length,
            algorithm: 'Smart threshold detection with category-based alerts'
        });
        
    } catch (error) {
        console.error('Error fetching low stock data:', error);
        
        res.status(500).json({
            success: false,
            error: 'Failed to fetch low stock data',
            code: error.code || 'UnknownError',
            message: error.message,
            timestamp: new Date().toISOString()
        });
    }
});

// QuickSight embed URL endpoint
app.get('/get-embed-url', async (req, res) => {
    try {
        console.log('Received request for QuickSight embed URL');
        
        // QuickSight configuration - Using QUICKSIGHT identity type (for Standard pricing plan)
        const params = {
            AwsAccountId: process.env.AWS_ACCOUNT_ID || '761386521687',
            DashboardId: process.env.QUICKSIGHT_DASHBOARD_ID || 'e098949c-c065-42b6-a884-ac41d4167ad5',
            IdentityType: 'QUICKSIGHT',
            UserArn: process.env.QUICKSIGHT_USER_ARN || `arn:aws:quicksight:us-east-1:761386521687:user/default/AWSReservedSSO_awsisb_IsbUsersPS_2adaac1b09fb84e1/22004840@siswa.um.edu.my`,
            SessionLifetimeInMinutes: 600, // 10 hours
            UndoRedoDisabled: false,
            ResetDisabled: false,
            StatePersistenceEnabled: true // Can be true with QUICKSIGHT identity
        };

        console.log('QuickSight parameters:', {
            ...params,
            // Don't log sensitive info in production
            AwsAccountId: process.env.NODE_ENV === 'development' ? params.AwsAccountId : '***masked***'
        });

        // Get the embed URL from QuickSight
        const result = await quicksight.getDashboardEmbedUrl(params).promise();
        
        console.log('Successfully retrieved embed URL');
        
        res.status(200).json({
            success: true,
            embedUrl: result.EmbedUrl,
            requestId: result.RequestId,
            status: result.Status,
            timestamp: new Date().toISOString()
        });

    } catch (error) {
        console.error('Error getting QuickSight embed URL:', error);
        
        // Handle specific AWS errors
        let statusCode = 500;
        let errorMessage = 'Internal server error';
        
        if (error.code === 'ResourceNotFoundException') {
            statusCode = 404;
            errorMessage = 'Dashboard not found';
        } else if (error.code === 'AccessDeniedException') {
            statusCode = 403;
            errorMessage = 'Access denied to QuickSight resource';
        } else if (error.code === 'ThrottlingException') {
            statusCode = 429;
            errorMessage = 'Request rate limit exceeded';
        } else if (error.code === 'InvalidParameterValueException') {
            statusCode = 400;
            errorMessage = 'Invalid parameters provided';
        }
        
        res.status(statusCode).json({
            success: false,
            error: errorMessage,
            code: error.code,
            timestamp: new Date().toISOString(),
            // Only include detailed error in development
            details: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});

// Order Stock endpoint - Fetch supplier orders from DynamoDB
app.get('/api/order-stock', async (req, res) => {
    try {
        console.log('Received request for order stock data');
        
        const params = {
            TableName: 'order-stock',
            Limit: 50
        };
        
        const result = await dynamodb.scan(params).promise();
        
        // Transform your DynamoDB data to match supplier order format
        const orderData = result.Items.map(item => {
            console.log('Raw DynamoDB item:', item); // Debug log
            
            return {
                id: item.order_id || `order-${Date.now()}-${Math.random()}`,
                orderNumber: item.order_id ? `AWS-${item.order_id.slice(-6)}` : `AWS-${Date.now()}`, // Shorter order number
                supplier: {
                    id: '1',
                    name: 'Fresh Produce', // Removed "AWS" prefix
                    category: 'Fresh Produce', // Updated category
                    contact: {
                        phone: '+1-555-0101',
                        email: 'orders@freshproduce.com',
                        address: '123 Fresh Street'
                    },
                    rating: 4.5,
                    deliveryTime: '24 hours',
                    minOrder: 50,
                    paymentTerms: 'Net 15'
                },
                items: [{
                    id: item.item_id || '1',
                    name: item.item_name || 'Papaya', // Default to Papaya since that's what your table has
                    quantity: parseInt(item.order_quantity || 0),
                    unit: item.unit || 'kg',
                    pricePerUnit: 10, // Mock price
                    totalPrice: parseInt(item.order_quantity || 0) * 10
                }],
                totalAmount: parseInt(item.order_quantity || 0) * 10,
                status: item.order_status ? 
                    (item.order_status.toUpperCase() === 'APPROVED' ? 'approved' : 
                     item.order_status.toUpperCase() === 'PENDING' ? 'pending' : 
                     item.order_status.toLowerCase()) : 'pending',
                orderDate: item.order_timestamp ? item.order_timestamp.split('T')[0] : new Date().toISOString().split('T')[0],
                expectedDelivery: new Date(Date.now() + 86400000).toISOString().split('T')[0], // Tomorrow
                orderedBy: 'Voice Assistant', // Assuming these are voice orders
                orderMethod: 'voice-assistant',
                notes: `Voice order for ${item.item_name} - Quantity: ${item.order_quantity} ${item.unit}`
            };
        });
        
        // Sort by order timestamp (newest first)
        const sortedData = orderData.sort((a, b) => new Date(b.orderDate).getTime() - new Date(a.orderDate).getTime());
        
        console.log(`Successfully retrieved ${sortedData.length} order stock items`);
        
        res.status(200).json(sortedData);
        
    } catch (error) {
        console.error('Error fetching order stock data:', error);
        
        res.status(500).json({
            success: false,
            error: 'Failed to fetch order stock data',
            code: error.code || 'UnknownError',
            message: error.message,
            timestamp: new Date().toISOString()
        });
    }
});

// Update Order Status endpoint - Update order status in DynamoDB
app.put('/api/order-stock/:orderId/status', async (req, res) => {
    try {
        const { orderId } = req.params;
        const { status, approvedBy } = req.body;
        
        console.log(`🔄 Updating order ${orderId} status to ${status} by ${approvedBy}`);
        
        // Validate status
        const validStatuses = ['PENDING', 'APPROVED', 'REJECTED'];
        if (!validStatuses.includes(status.toUpperCase())) {
            return res.status(400).json({
                success: false,
                error: 'Invalid status. Must be PENDING, APPROVED, or REJECTED'
            });
        }
        
        const params = {
            TableName: 'order-stock',
            Key: {
                'order_id': orderId
            },
            UpdateExpression: 'SET order_status = :status, approved_by = :approvedBy, approval_date = :approvalDate',
            ExpressionAttributeValues: {
                ':status': status.toUpperCase(),
                ':approvedBy': approvedBy || 'System',
                ':approvalDate': new Date().toISOString()
            },
            ReturnValues: 'UPDATED_NEW'
        };
        
        const result = await dynamodb.update(params).promise();
        
        console.log(`✅ Successfully updated order ${orderId} status to ${status}`);
        
        res.status(200).json({
            success: true,
            message: `Order ${orderId} status updated to ${status}`,
            updatedAttributes: result.Attributes
        });
        
    } catch (error) {
        console.error('❌ Error updating order status:', error);
        
        res.status(500).json({
            success: false,
            error: 'Failed to update order status',
            code: error.code || 'UnknownError',
            details: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Unhandled error:', err);
    res.status(500).json({
        success: false,
        error: 'Internal server error',
        timestamp: new Date().toISOString()
    });
});

// 404 handler
app.use('*', (req, res) => {
    res.status(404).json({
        success: false,
        error: 'Endpoint not found',
        timestamp: new Date().toISOString()
    });
});

// Start server
app.listen(PORT, () => {
    console.log(`🚀 FoodWise QuickSight Backend running on port ${PORT}`);
    console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`🔗 Health check: http://localhost:${PORT}/health`);
    console.log(`📈 QuickSight endpoint: http://localhost:${PORT}/get-embed-url`);
    
    // Log configuration (mask sensitive data in production)
    if (process.env.NODE_ENV === 'development') {
        console.log(`🏢 AWS Account ID: ${process.env.AWS_ACCOUNT_ID || '761386521687'}`);
        console.log(`📊 Dashboard ID: ${process.env.QUICKSIGHT_DASHBOARD_ID || 'e098949c-c065-42b6-a884-ac41d4167ad5'}`);
        console.log(`🌍 AWS Region: ${process.env.AWS_REGION || 'us-east-1'}`);
    }
});

// Graceful shutdown
process.on('SIGTERM', () => {
    console.log('🔄 SIGTERM received. Shutting down gracefully...');
    server.close(() => {
        console.log('✅ Process terminated');
    });
});

process.on('SIGINT', () => {
    console.log('🔄 SIGINT received. Shutting down gracefully...');
    process.exit(0);
});