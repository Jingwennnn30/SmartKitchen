import React, { useState, useEffect } from 'react';
import {
    Box,
    Typography,
    Paper,
    Grid,
    Button,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Select,
    MenuItem,
    FormControl,
    InputLabel,
    TextField,
    Chip,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    IconButton,
    Tooltip,
    Card,
    CardContent,
    Fab,
    LinearProgress,
    Avatar,
    Rating
} from '@mui/material';
import { styled } from '@mui/material/styles';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import RestaurantIcon from '@mui/icons-material/Restaurant';
import AgricultureIcon from '@mui/icons-material/Agriculture';
import LocalCafeIcon from '@mui/icons-material/LocalCafe';
import GrainIcon from '@mui/icons-material/Grain';
import LocalFloristIcon from '@mui/icons-material/LocalFlorist';
import PhoneIcon from '@mui/icons-material/Phone';
import EmailIcon from '@mui/icons-material/Email';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import LocalShippingOutlinedIcon from '@mui/icons-material/LocalShippingOutlined';
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty';
import ThumbUpIcon from '@mui/icons-material/ThumbUp';
import { supplierOrderService } from '../../services/supplierOrderService';
import { orderCreationService } from '../../services/orderCreationService';

// Types
interface Supplier {
    id: string;
    name: string;
    category: string;
    contact: {
        phone: string;
        email: string;
        address: string;
    };
    rating: number;
    deliveryTime: string;
    minOrder: number;
    paymentTerms: string;
}

interface OrderItem {
    id: string;
    name: string;
    quantity: number;
    unit: string;
    pricePerUnit: number;
    totalPrice: number;
}

interface SupplierOrderType {
    id: string;
    orderNumber: string;
    supplier: Supplier;
    items: OrderItem[];
    totalAmount: number;
    status: 'pending' | 'approved' | 'rejected' | 'confirmed' | 'in-transit' | 'delivered' | 'cancelled';
    orderDate: string;
    expectedDelivery: string;
    orderedBy: string;
    orderMethod: 'voice-assistant' | 'manual';
    approvedBy?: string;
    approvalDate?: string;
    notes?: string;
}

// Styled Components
const StyledPaper = styled(Paper)(({ theme }) => ({
    padding: theme.spacing(3),
    borderRadius: '10px',
    boxShadow: '0px 2px 6px rgba(0, 0, 0, 0.1)',
    height: '100%'
}));

const CategoryCard = styled(Card)(({ theme }) => ({
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    height: '100%',
    '&:hover': {
        transform: 'translateY(-4px)',
        boxShadow: '0px 8px 20px rgba(0, 0, 0, 0.15)',
    }
}));

const StatusChip = styled(Chip)<{ status: string }>(({ status, theme }) => {
    const colors = {
        'pending': { bg: '#fff3e0', color: '#ef6c00', opacity: 0.7 },
        'approved': { bg: '#e8f5e9', color: '#2e7d32', opacity: 1 },
        'rejected': { bg: '#ffebee', color: '#d32f2f', opacity: 1 },
        'confirmed': { bg: '#e3f2fd', color: '#1976d2', opacity: 1 },
        'in-transit': { bg: '#f3e5f5', color: '#7b1fa2', opacity: 1 },
        'delivered': { bg: '#e8f5e9', color: '#2e7d32', opacity: 1 },
        'cancelled': { bg: '#ffebee', color: '#d32f2f', opacity: 1 }
    };
    
    const colorConfig = colors[status as keyof typeof colors] || { bg: '#f5f5f5', color: '#757575', opacity: 1 };
    
    return {
        backgroundColor: colorConfig.bg,
        color: colorConfig.color,
        fontWeight: 'bold',
        opacity: colorConfig.opacity,
        ...(status === 'pending' && {
            animation: 'pulse 2s infinite',
            '@keyframes pulse': {
                '0%': { opacity: 0.7 },
                '50%': { opacity: 1 },
                '100%': { opacity: 0.7 }
            }
        })
    };
});

// Mock Data
const mockSuppliers: Supplier[] = [
    {
        id: '1',
        name: 'Fresh Meat Co.',
        category: 'Meat',
        contact: {
            phone: '+1-555-0101',
            email: 'orders@freshmeat.com',
            address: '123 Butcher St, Food District'
        },
        rating: 4.8,
        deliveryTime: '24 hours',
        minOrder: 100,
        paymentTerms: 'Net 30'
    },
    {
        id: '2',
        name: 'Green Valley Produce',
        category: 'Vegetables',
        contact: {
            phone: '+1-555-0102',
            email: 'sales@greenvalley.com',
            address: '456 Farm Rd, Agriculture Zone'
        },
        rating: 4.6,
        deliveryTime: '12 hours',
        minOrder: 50,
        paymentTerms: 'Net 15'
    },
    {
        id: '6',
        name: 'Tropical Fruits Ltd',
        category: 'Fruits',
        contact: {
            phone: '+1-555-0106',
            email: 'orders@tropicalfruits.com',
            address: '789 Orchard Lane, Fruit Valley'
        },
        rating: 4.7,
        deliveryTime: '18 hours',
        minOrder: 40,
        paymentTerms: 'Net 10'
    },
    {
        id: '3',
        name: 'Dairy Best',
        category: 'Dairy',
        contact: {
            phone: '+1-555-0103',
            email: 'orders@dairybest.com',
            address: '789 Milk Ave, Dairy District'
        },
        rating: 4.9,
        deliveryTime: '6 hours',
        minOrder: 75,
        paymentTerms: 'Net 7'
    },
    {
        id: '4',
        name: 'Grain & More',
        category: 'Dry Goods',
        contact: {
            phone: '+1-555-0104',
            email: 'info@grainmore.com',
            address: '321 Storage St, Warehouse Area'
        },
        rating: 4.5,
        deliveryTime: '48 hours',
        minOrder: 200,
        paymentTerms: 'Net 30'
    },
    {
        id: '5',
        name: 'Beverage World',
        category: 'Beverages',
        contact: {
            phone: '+1-555-0105',
            email: 'orders@beverageworld.com',
            address: '654 Drink Blvd, Beverage Zone'
        },
        rating: 4.4,
        deliveryTime: '24 hours',
        minOrder: 150,
        paymentTerms: 'Net 21'
    }
];

const mockOrders: SupplierOrderType[] = [
    {
        id: '1',
        orderNumber: 'PO-2024-001',
        supplier: mockSuppliers[0],
        items: [
            { id: '1', name: 'Beef Ribeye', quantity: 20, unit: 'kg', pricePerUnit: 45, totalPrice: 900 },
            { id: '2', name: 'Chicken Breast', quantity: 15, unit: 'kg', pricePerUnit: 25, totalPrice: 375 }
        ],
        totalAmount: 1275,
        status: 'in-transit',
        orderDate: '2024-10-02',
        expectedDelivery: '2024-10-04',
        orderedBy: 'Chef Manager',
        orderMethod: 'manual',
        approvedBy: 'Restaurant Manager',
        approvalDate: '2024-10-02',
        notes: 'Urgent order for weekend special menu'
    },
    {
        id: '2',
        orderNumber: 'PO-2024-002',
        supplier: mockSuppliers[1],
        items: [
            { id: '3', name: 'Fresh Tomatoes', quantity: 10, unit: 'kg', pricePerUnit: 8, totalPrice: 80 },
            { id: '4', name: 'Lettuce', quantity: 5, unit: 'kg', pricePerUnit: 6, totalPrice: 30 },
            { id: '5', name: 'Onions', quantity: 8, unit: 'kg', pricePerUnit: 4, totalPrice: 32 }
        ],
        totalAmount: 142,
        status: 'delivered',
        orderDate: '2024-10-01',
        expectedDelivery: '2024-10-02',
        orderedBy: 'Kitchen Staff',
        orderMethod: 'manual',
        approvedBy: 'Restaurant Manager',
        approvalDate: '2024-10-01',
        notes: 'Regular weekly order'
    },
    {
        id: '3',
        orderNumber: 'VA-2024-003',
        supplier: mockSuppliers[2],
        items: [
            { id: '6', name: 'Fresh Milk', quantity: 12, unit: 'liters', pricePerUnit: 5, totalPrice: 60 },
            { id: '7', name: 'Cheese', quantity: 3, unit: 'kg', pricePerUnit: 35, totalPrice: 105 }
        ],
        totalAmount: 165,
        status: 'pending',
        orderDate: '2024-10-03',
        expectedDelivery: '2024-10-04',
        orderedBy: 'Voice Assistant',
        orderMethod: 'voice-assistant',
        notes: 'Voice order: "We need milk and cheese for tomorrow\'s breakfast menu"'
    },
    {
        id: '4',
        orderNumber: 'VA-2024-004',
        supplier: mockSuppliers[3],
        items: [
            { id: '8', name: 'Rice', quantity: 25, unit: 'kg', pricePerUnit: 4, totalPrice: 100 },
            { id: '9', name: 'Flour', quantity: 10, unit: 'kg', pricePerUnit: 3, totalPrice: 30 }
        ],
        totalAmount: 130,
        status: 'approved',
        orderDate: '2024-10-03',
        expectedDelivery: '2024-10-05',
        orderedBy: 'Voice Assistant',
        orderMethod: 'voice-assistant',
        approvedBy: 'Chef Manager',
        approvalDate: '2024-10-03',
        notes: 'Voice order: "Low stock alert - need rice and flour urgently"'
    }
];

const categories = [
    { name: 'Meat', icon: <RestaurantIcon />, color: '#d32f2f' },
    { name: 'Vegetables', icon: <AgricultureIcon />, color: '#388e3c' },
    { name: 'Fruits', icon: <LocalFloristIcon />, color: '#ff6f00' },
    { name: 'Dairy', icon: <LocalCafeIcon />, color: '#1976d2' },
    { name: 'Dry Goods', icon: <GrainIcon />, color: '#f57c00' },
    { name: 'Beverages', icon: <LocalShippingIcon />, color: '#7b1fa2' }
];

const SupplierOrder: React.FC = () => {
    const [orders, setOrders] = useState<SupplierOrderType[]>(mockOrders);
    const [suppliers] = useState<Supplier[]>(mockSuppliers);
    const [openOrderDialog, setOpenOrderDialog] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState('');
    const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null);
    const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
    const [currentUser] = useState('Chef Manager'); // In real app, get from auth context
    const [viewMode, setViewMode] = useState<'overview' | 'create' | 'history'>('overview');
    const [isLoadingOrders, setIsLoadingOrders] = useState(false);
    
    // Order form state
    const [orderFormData, setOrderFormData] = useState({
        itemName: '',
        quantity: '',
        unit: 'kg'
    });
    const [isSubmittingOrder, setIsSubmittingOrder] = useState(false);

    // Load AWS DynamoDB orders on component mount and set up auto-refresh
    useEffect(() => {
        const loadOrderStockData = async () => {
            setIsLoadingOrders(true);
            try {
                console.log("🔄 Loading order stock data from DynamoDB...");
                const orderStockData = await supplierOrderService.fetchOrderStockData();
                
                if (orderStockData && orderStockData.length > 0) {
                    console.log("✅ Successfully loaded order stock data:", orderStockData);
                    
                    // Combine AWS data with mock data
                    const combinedOrders = [...orderStockData, ...mockOrders];
                    setOrders(combinedOrders);
                } else {
                    console.log("⚠️ No order stock data found, using mock data only");
                    setOrders(mockOrders);
                }
            } catch (error) {
                console.error("❌ Error loading order stock data:", error);
                setOrders(mockOrders); // Fallback to mock data
            } finally {
                setIsLoadingOrders(false);
            }
        };

        // Initial load
        loadOrderStockData();

        // Set up auto-refresh every 30 seconds for new AWS orders
        const refreshInterval = setInterval(() => {
            console.log("🔄 Auto-refreshing AWS orders...");
            loadOrderStockData();
        }, 30000); // 30 seconds

        // Cleanup interval on component unmount
        return () => {
            clearInterval(refreshInterval);
        };
    }, []); // Empty dependency array - runs once on mount

    const handleApproveOrder = async (orderId: string) => {
        try {
            console.log(`🔄 Approving order with ID: ${orderId}...`);
            console.log(`🔍 Order details:`, orders.find(o => o.id === orderId));
            
            // Call the API to update status in DynamoDB
            const success = await supplierOrderService.updateOrderStatus(orderId, 'APPROVED', currentUser);
            
            if (success) {
                console.log(`✅ Order ${orderId} approved successfully`);
                
                // Update local state immediately for better UX
                setOrders(prevOrders => 
                    prevOrders.map(order => 
                        order.id === orderId 
                            ? { 
                                ...order, 
                                status: 'approved' as const,
                                approvedBy: currentUser,
                                approvalDate: new Date().toISOString().split('T')[0]
                            }
                            : order
                    )
                );
                
                // Force refresh from database to ensure sync
                setTimeout(async () => {
                    try {
                        const orderStockData = await supplierOrderService.fetchOrderStockData();
                        if (orderStockData && orderStockData.length > 0) {
                            const combinedOrders = [...orderStockData, ...mockOrders];
                            setOrders(combinedOrders);
                        }
                    } catch (error) {
                        console.error("Error refreshing after approval:", error);
                    }
                }, 1000); // Wait 1 second for database to update
                
            } else {
                console.error(`❌ Failed to approve order ${orderId}`);
                alert('Failed to approve order. Please try again.');
            }
        } catch (error) {
            console.error(`❌ Error approving order ${orderId}:`, error);
            alert('Error approving order. Please try again.');
        }
    };

    const handleRejectOrder = async (orderId: string) => {
        try {
            console.log(`🔄 Rejecting order ${orderId}...`);
            
            // Call the API to update status in DynamoDB
            const success = await supplierOrderService.updateOrderStatus(orderId, 'REJECTED', currentUser);
            
            if (success) {
                console.log(`✅ Order ${orderId} rejected successfully`);
                
                // Update local state immediately for better UX
                setOrders(prevOrders => 
                    prevOrders.map(order => 
                        order.id === orderId 
                            ? { 
                                ...order, 
                                status: 'rejected' as const,
                                approvedBy: currentUser,
                                approvalDate: new Date().toISOString().split('T')[0]
                            }
                            : order
                    )
                );
                
                // Force refresh from database to ensure sync
                setTimeout(async () => {
                    try {
                        const orderStockData = await supplierOrderService.fetchOrderStockData();
                        if (orderStockData && orderStockData.length > 0) {
                            const combinedOrders = [...orderStockData, ...mockOrders];
                            setOrders(combinedOrders);
                        }
                    } catch (error) {
                        console.error("Error refreshing after rejection:", error);
                    }
                }, 1000); // Wait 1 second for database to update
                
            } else {
                console.error(`❌ Failed to reject order ${orderId}`);
                alert('Failed to reject order. Please try again.');
            }
        } catch (error) {
            console.error(`❌ Error rejecting order ${orderId}:`, error);
            alert('Error rejecting order. Please try again.');
        }
    };

    // Handle manual order submission via API Gateway
    const handleSubmitOrder = async () => {
        if (!orderFormData.itemName.trim() || !orderFormData.quantity.trim()) {
            alert('Please fill in all required fields.');
            return;
        }

        const quantity = parseInt(orderFormData.quantity);
        if (isNaN(quantity) || quantity <= 0) {
            alert('Please enter a valid quantity.');
            return;
        }

        setIsSubmittingOrder(true);
        
        try {
            console.log(`📋 Manager creating order: ${quantity} ${orderFormData.unit} of ${orderFormData.itemName}`);
            
            // Call AWS Lambda via HTTP API Gateway - Manager orders are pre-approved
            const result = await orderCreationService.createManagerOrder(
                orderFormData.itemName,
                quantity,
                orderFormData.unit
            );
            
            if (result) {
                console.log('✅ Order created successfully:', result);
                alert(`Order created successfully! Order ID: ${result.order_id}\n\nAn email notification has been sent.`);
                
                // Reset form
                setOrderFormData({
                    itemName: '',
                    quantity: '',
                    unit: 'kg'
                });
                
                // Close dialog
                handleCloseDialog();
                
                // Refresh orders after a short delay to show the new order
                setTimeout(async () => {
                    try {
                        const orderStockData = await supplierOrderService.fetchOrderStockData();
                        if (orderStockData && orderStockData.length > 0) {
                            const combinedOrders = [...orderStockData, ...mockOrders];
                            setOrders(combinedOrders);
                        }
                    } catch (error) {
                        console.error("Error refreshing orders after creation:", error);
                    }
                }, 2000); // Wait 2 seconds for AWS to process
                
            } else {
                alert('Failed to create order. Please try again.');
            }
            
        } catch (error) {
            console.error('❌ Error creating order:', error);
            alert('Error creating order. Please try again.');
        } finally {
            setIsSubmittingOrder(false);
        }
    };

    const getCategoryIcon = (category: string) => {
        const cat = categories.find(c => c.name === category);
        return cat ? cat.icon : <RestaurantIcon />;
    };
    const handleCategorySelect = (category: string) => {
        setSelectedCategory(category);
        setViewMode('create');
        setOpenOrderDialog(true);
    };

    const handleCreateOrder = () => {
        // Implementation for creating new order
        console.log('Creating order for supplier:', selectedSupplier);
        console.log('Order items:', orderItems);
        setOpenOrderDialog(false);
        setViewMode('overview');
        setSelectedCategory('');
        setSelectedSupplier(null);
        setOrderItems([]);
    };

    const handleCloseDialog = () => {
        setOpenOrderDialog(false);
        setViewMode('overview');
        setSelectedCategory('');
        setSelectedSupplier(null);
        setOrderItems([]);
        // Reset order form
        setOrderFormData({
            itemName: '',
            quantity: '',
            unit: 'kg'
        });
    };

    const getOrderStatusCounts = () => {
        const counts = {
            'pending': orders.filter(o => o.status === 'pending').length,
            'approved': orders.filter(o => o.status === 'approved').length,
            'in-transit': orders.filter(o => o.status === 'in-transit').length,
            'delivered': orders.filter(o => o.status === 'delivered').length,
        };
        return counts;
    };

    const statusCounts = getOrderStatusCounts();

    return (
        <Box sx={{ padding: 3 }}>
            {/* Header */}
            <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
                    Supplier Orders
                </Typography>
                <Box sx={{ display: 'flex', gap: 2 }}>
                    <Button
                        variant={viewMode === 'overview' ? 'contained' : 'outlined'}
                        onClick={() => setViewMode('overview')}
                    >
                        Overview
                    </Button>
                    <Button
                        variant={viewMode === 'history' ? 'contained' : 'outlined'}
                        onClick={() => setViewMode('history')}
                    >
                        Order History
                    </Button>
                </Box>
            </Box>

            {viewMode === 'overview' && (
                <>
                    {/* KPI Cards */}
                    <Grid container spacing={3} sx={{ mb: 4 }}>
                        <Grid item xs={12} sm={3}>
                            <StyledPaper>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                    <HourglassEmptyIcon sx={{ color: '#ef6c00', fontSize: 40 }} />
                                    <Box>
                                        <Typography variant="h4" sx={{ color: '#ef6c00' }}>
                                            {statusCounts.pending}
                                        </Typography>
                                        <Typography variant="subtitle2" color="textSecondary">
                                            Pending Orders
                                        </Typography>
                                    </Box>
                                </Box>
                            </StyledPaper>
                        </Grid>
                        <Grid item xs={12} sm={3}>
                            <StyledPaper>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                    <ThumbUpIcon sx={{ color: '#2e7d32', fontSize: 40 }} />
                                    <Box>
                                        <Typography variant="h4" sx={{ color: '#2e7d32' }}>
                                            {statusCounts.approved}
                                        </Typography>
                                        <Typography variant="subtitle2" color="textSecondary">
                                            Approved
                                        </Typography>
                                    </Box>
                                </Box>
                            </StyledPaper>
                        </Grid>
                        <Grid item xs={12} sm={3}>
                            <StyledPaper>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                    <LocalShippingOutlinedIcon sx={{ color: '#7b1fa2', fontSize: 40 }} />
                                    <Box>
                                        <Typography variant="h4" sx={{ color: '#7b1fa2' }}>
                                            {statusCounts['in-transit']}
                                        </Typography>
                                        <Typography variant="subtitle2" color="textSecondary">
                                            In Transit
                                        </Typography>
                                    </Box>
                                </Box>
                            </StyledPaper>
                        </Grid>
                        <Grid item xs={12} sm={3}>
                            <StyledPaper>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                    <CheckCircleIcon sx={{ color: '#2e7d32', fontSize: 40 }} />
                                    <Box>
                                        <Typography variant="h4" sx={{ color: '#2e7d32' }}>
                                            {statusCounts.delivered}
                                        </Typography>
                                        <Typography variant="subtitle2" color="textSecondary">
                                            Delivered
                                        </Typography>
                                    </Box>
                                </Box>
                            </StyledPaper>
                        </Grid>
                    </Grid>

                    {/* Categories */}
                    <StyledPaper sx={{ mb: 4 }}>
                        <Typography variant="h6" gutterBottom>
                            Order by Category
                        </Typography>
                        <Grid container spacing={3}>
                            {categories.map((category) => (
                                <Grid item xs={6} sm={4} md={2} key={category.name}>
                                    <CategoryCard onClick={() => handleCategorySelect(category.name)}>
                                        <CardContent sx={{ textAlign: 'center', py: 3 }}>
                                            <Avatar
                                                sx={{
                                                    bgcolor: category.color,
                                                    width: 60,
                                                    height: 60,
                                                    mx: 'auto',
                                                    mb: 2
                                                }}
                                            >
                                                {category.icon}
                                            </Avatar>
                                            <Typography variant="h6" sx={{ color: category.color }}>
                                                {category.name}
                                            </Typography>
                                            <Typography variant="body2" color="textSecondary">
                                                {suppliers.filter(s => s.category === category.name).length} suppliers
                                            </Typography>
                                        </CardContent>
                                    </CategoryCard>
                                </Grid>
                            ))}
                        </Grid>
                    </StyledPaper>

                    {/* Recent Orders */}
                    <StyledPaper>
                        <Typography variant="h6" gutterBottom>
                            Recent Orders
                        </Typography>
                        <TableContainer>
                            <Table>
                                <TableHead>
                                    <TableRow>
                                        <TableCell>Order #</TableCell>
                                        <TableCell>Supplier</TableCell>
                                        <TableCell>Category</TableCell>
                                        <TableCell>Item Details</TableCell>
                                        <TableCell>Status</TableCell>
                                        <TableCell>Ordered By</TableCell>
                                        <TableCell>Expected Delivery</TableCell>
                                        <TableCell>Actions</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {/* Sort orders: pending first, then by order date */}
                                    {orders
                                        .sort((a, b) => {
                                            // First, sort by status (pending first)
                                            if (a.status === 'pending' && b.status !== 'pending') return -1;
                                            if (b.status === 'pending' && a.status !== 'pending') return 1;
                                            // Then sort by date (newest first)
                                            return new Date(b.orderDate).getTime() - new Date(a.orderDate).getTime();
                                        })
                                        .slice(0, 8)
                                        .map((order) => (
                                        <TableRow key={order.id}>
                                            <TableCell>
                                                {order.orderNumber}
                                            </TableCell>
                                            <TableCell>{order.supplier.name}</TableCell>
                                            <TableCell>
                                                {order.supplier.category}
                                            </TableCell>
                                            <TableCell>
                                                <Box>
                                                    <Typography variant="body2" fontWeight="medium">
                                                        {order.items[0]?.name || 'N/A'}
                                                    </Typography>
                                                    <Typography variant="caption" color="textSecondary">
                                                        Qty: {order.items[0]?.quantity || 0} {order.items[0]?.unit || 'units'}
                                                    </Typography>
                                                </Box>
                                            </TableCell>
                                            <TableCell>
                                                <StatusChip
                                                    label={order.status.replace('-', ' ').toUpperCase()}
                                                    status={order.status}
                                                    size="small"
                                                />
                                            </TableCell>
                                            <TableCell>
                                                <Box>
                                                    <Typography variant="body2">{order.orderedBy}</Typography>
                                                    {order.approvedBy && (
                                                        <Typography variant="caption" color="textSecondary">
                                                            Approved by: {order.approvedBy}
                                                        </Typography>
                                                    )}
                                                </Box>
                                            </TableCell>
                                            <TableCell>
                                                <Typography variant="body2">
                                                    {order.status === 'pending' ? (
                                                        <span style={{ opacity: 0.5 }}>Pending approval</span>
                                                    ) : (
                                                        order.expectedDelivery
                                                    )}
                                                </Typography>
                                            </TableCell>
                                            <TableCell>
                                                {order.status === 'pending' ? (
                                                    <Box sx={{ display: 'flex', gap: 1 }}>
                                                        <Button 
                                                            size="small" 
                                                            variant="contained"
                                                            color="success"
                                                            onClick={() => handleApproveOrder(order.id)}
                                                            sx={{ minWidth: '80px' }}
                                                        >
                                                            Approve
                                                        </Button>
                                                        <Button 
                                                            size="small" 
                                                            variant="outlined"
                                                            color="error"
                                                            onClick={() => handleRejectOrder(order.id)}
                                                            sx={{ minWidth: '70px' }}
                                                        >
                                                            Reject
                                                        </Button>
                                                    </Box>
                                                ) : (
                                                    <Tooltip title="View Details">
                                                        <IconButton size="small">
                                                            <EditIcon />
                                                        </IconButton>
                                                    </Tooltip>
                                                )}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </StyledPaper>
                </>
            )}

            {viewMode === 'history' && (
                <StyledPaper>
                    <Typography variant="h6" gutterBottom>
                        Order History
                    </Typography>
                    <TableContainer>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell>Order #</TableCell>
                                    <TableCell>Supplier</TableCell>
                                    <TableCell>Items</TableCell>
                                    <TableCell>Item Details</TableCell>
                                    <TableCell>Status</TableCell>
                                    <TableCell>Order Date</TableCell>
                                    <TableCell>Ordered By</TableCell>
                                    <TableCell>Actions</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {isLoadingOrders ? (
                                    <TableRow>
                                        <TableCell colSpan={7} align="center">
                                            <Box sx={{ py: 3 }}>
                                                <LinearProgress sx={{ mb: 2 }} />
                                                <Typography variant="body2" color="textSecondary">
                                                    Loading orders from AWS DynamoDB...
                                                </Typography>
                                            </Box>
                                        </TableCell>
                                    </TableRow>
                                ) : orders.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={7} align="center">
                                            <Typography variant="body2" color="textSecondary" sx={{ py: 3 }}>
                                                No orders found
                                            </Typography>
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    orders.map((order) => (
                                    <TableRow key={order.id}>
                                        <TableCell>{order.orderNumber}</TableCell>
                                        <TableCell>
                                            <Box>
                                                <Typography variant="body2" fontWeight="medium">
                                                    {order.supplier.name}
                                                </Typography>
                                                <Typography variant="caption" color="textSecondary">
                                                    {order.supplier.category}
                                                </Typography>
                                            </Box>
                                        </TableCell>
                                        <TableCell>
                                            <Typography variant="body2">
                                                {order.items.length} items
                                            </Typography>
                                            <Typography variant="caption" color="textSecondary">
                                                {order.items.map(item => item.name).join(', ')}
                                            </Typography>
                                        </TableCell>
                                        <TableCell>
                                            <Box>
                                                <Typography variant="body2" fontWeight="medium">
                                                    {order.items[0]?.name || 'N/A'}
                                                </Typography>
                                                <Typography variant="caption" color="textSecondary">
                                                    Qty: {order.items[0]?.quantity || 0} {order.items[0]?.unit || 'units'}
                                                </Typography>
                                            </Box>
                                        </TableCell>
                                        <TableCell>
                                            <StatusChip
                                                label={order.status.replace('-', ' ').toUpperCase()}
                                                status={order.status}
                                                size="small"
                                            />
                                        </TableCell>
                                        <TableCell>{order.orderDate}</TableCell>
                                        <TableCell>{order.orderedBy}</TableCell>
                                        <TableCell>
                                            <Tooltip title="View Details">
                                                <IconButton size="small">
                                                    <EditIcon />
                                                </IconButton>
                                            </Tooltip>
                                        </TableCell>
                                    </TableRow>
                                ))
                                )}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </StyledPaper>
            )}

            {/* Order Creation Dialog */}
            <Dialog
                open={openOrderDialog}
                onClose={handleCloseDialog}
                maxWidth="sm"
                fullWidth
            >
                <DialogTitle>
                    Create New Order - {selectedCategory}
                </DialogTitle>
                <DialogContent>
                    <Box sx={{ pt: 2 }}>
                        <Typography variant="body2" color="textSecondary" sx={{ mb: 3 }}>
                            Fill in the details below to create a new order. The system will automatically find the appropriate supplier and send notifications.
                        </Typography>
                        
                        <TextField
                            fullWidth
                            label="Item Name"
                            value={orderFormData.itemName}
                            onChange={(e) => setOrderFormData(prev => ({ ...prev, itemName: e.target.value }))}
                            placeholder="e.g., Papaya, Chicken Breast, Milk"
                            sx={{ mb: 3 }}
                            required
                        />
                        
                        <Grid container spacing={2} sx={{ mb: 3 }}>
                            <Grid item xs={8}>
                                <TextField
                                    fullWidth
                                    label="Quantity"
                                    type="number"
                                    value={orderFormData.quantity}
                                    onChange={(e) => setOrderFormData(prev => ({ ...prev, quantity: e.target.value }))}
                                    placeholder="e.g., 10"
                                    required
                                    inputProps={{ min: 1 }}
                                />
                            </Grid>
                            <Grid item xs={4}>
                                <FormControl fullWidth>
                                    <InputLabel>Unit</InputLabel>
                                    <Select
                                        value={orderFormData.unit}
                                        onChange={(e) => setOrderFormData(prev => ({ ...prev, unit: e.target.value }))}
                                        label="Unit"
                                    >
                                        <MenuItem value="kg">kg</MenuItem>
                                        <MenuItem value="liters">liters</MenuItem>
                                        <MenuItem value="pieces">pieces</MenuItem>
                                        <MenuItem value="boxes">boxes</MenuItem>
                                        <MenuItem value="packs">packs</MenuItem>
                                    </Select>
                                </FormControl>
                            </Grid>
                        </Grid>
                        
                        <Paper sx={{ p: 2, bgcolor: '#f8f9fa' }}>
                            <Typography variant="h6" gutterBottom>
                                📋 Order Summary
                            </Typography>
                            <Typography variant="body2">
                                <strong>Category:</strong> {selectedCategory}
                            </Typography>
                            <Typography variant="body2">
                                <strong>Item:</strong> {orderFormData.itemName || 'Not specified'}
                            </Typography>
                            <Typography variant="body2">
                                <strong>Quantity:</strong> {orderFormData.quantity || '0'} {orderFormData.unit}
                            </Typography>
                            <Typography variant="body2">
                                <strong>Ordered by:</strong> {currentUser}
                            </Typography>
                            <Typography variant="body2" sx={{ color: 'green' }}>
                                <strong>Status:</strong> Approved (Manager Authority)
                            </Typography>
                        </Paper>
                        
                        <Typography variant="caption" color="textSecondary" sx={{ mt: 2, display: 'block' }}>
                            💡 After submission, the order will be created in the system and an email notification will be sent to relevant staff.
                        </Typography>
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseDialog} disabled={isSubmittingOrder}>
                        Cancel
                    </Button>
                    <Button
                        onClick={handleSubmitOrder}
                        variant="contained"
                        disabled={isSubmittingOrder || !orderFormData.itemName.trim() || !orderFormData.quantity.trim()}
                    >
                        {isSubmittingOrder ? 'Creating Order...' : 'Create Order'}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Floating Action Button */}
            <Fab
                color="primary"
                sx={{ position: 'fixed', bottom: 32, right: 32 }}
                onClick={() => setViewMode('create')}
            >
                <AddIcon />
            </Fab>
        </Box>
    );
};

export default SupplierOrder;