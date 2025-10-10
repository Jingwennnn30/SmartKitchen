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
    TextField,
    Select,
    MenuItem,
    FormControl,
    InputLabel,
    Chip,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Stepper,
    Step,
    StepLabel,
    IconButton,
    Tooltip,
    Card,
    CardContent,
    Fab,
    LinearProgress,
    Divider,
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
import PhoneIcon from '@mui/icons-material/Phone';
import EmailIcon from '@mui/icons-material/Email';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import PendingIcon from '@mui/icons-material/Pending';
import LocalShippingOutlinedIcon from '@mui/icons-material/LocalShippingOutlined';

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
    status: 'pending' | 'confirmed' | 'in-transit' | 'delivered' | 'cancelled';
    orderDate: string;
    expectedDelivery: string;
    orderedBy: string;
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
        pending: { bg: '#fff3e0', color: '#ef6c00' },
        confirmed: { bg: '#e3f2fd', color: '#1976d2' },
        'in-transit': { bg: '#f3e5f5', color: '#7b1fa2' },
        delivered: { bg: '#e8f5e9', color: '#2e7d32' },
        cancelled: { bg: '#ffebee', color: '#d32f2f' }
    };
    
    return {
        backgroundColor: colors[status as keyof typeof colors]?.bg || '#f5f5f5',
        color: colors[status as keyof typeof colors]?.color || '#757575',
        fontWeight: 'bold'
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
        notes: 'Regular weekly order'
    }
];

const categories = [
    { name: 'Meat', icon: <RestaurantIcon />, color: '#d32f2f' },
    { name: 'Vegetables', icon: <AgricultureIcon />, color: '#388e3c' },
    { name: 'Dairy', icon: <LocalCafeIcon />, color: '#1976d2' },
    { name: 'Dry Goods', icon: <GrainIcon />, color: '#f57c00' },
    { name: 'Beverages', icon: <LocalShippingIcon />, color: '#7b1fa2' }
];

const orderSteps = ['Order Placed', 'Confirmed', 'In Transit', 'Delivered'];

const SupplierOrder: React.FC = () => {
    const [orders, setOrders] = useState<SupplierOrderType[]>(mockOrders);
    const [suppliers, setSuppliers] = useState<Supplier[]>(mockSuppliers);
    const [openOrderDialog, setOpenOrderDialog] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState('');
    const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null);
    const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
    const [currentUser] = useState('Chef Manager'); // In real app, get from auth context
    const [viewMode, setViewMode] = useState<'overview' | 'create' | 'history'>('overview');

    const getStatusStep = (status: string) => {
        switch (status) {
            case 'pending': return 0;
            case 'confirmed': return 1;
            case 'in-transit': return 2;
            case 'delivered': return 3;
            default: return 0;
        }
    };

    const getCategoryIcon = (category: string) => {
        const cat = categories.find(c => c.name === category);
        return cat ? cat.icon : <RestaurantIcon />;
    };

    const getCategoryColor = (category: string) => {
        const cat = categories.find(c => c.name === category);
        return cat ? cat.color : '#757575';
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
    };

    const getOrderStatusCounts = () => {
        const counts = {
            pending: orders.filter(o => o.status === 'pending').length,
            confirmed: orders.filter(o => o.status === 'confirmed').length,
            'in-transit': orders.filter(o => o.status === 'in-transit').length,
            delivered: orders.filter(o => o.status === 'delivered').length,
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
                                    <PendingIcon sx={{ color: '#ef6c00', fontSize: 40 }} />
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
                                    <CheckCircleIcon sx={{ color: '#1976d2', fontSize: 40 }} />
                                    <Box>
                                        <Typography variant="h4" sx={{ color: '#1976d2' }}>
                                            {statusCounts.confirmed}
                                        </Typography>
                                        <Typography variant="subtitle2" color="textSecondary">
                                            Confirmed
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
                                <Grid item xs={12} sm={6} md={2.4} key={category.name}>
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
                                        <TableCell>Amount</TableCell>
                                        <TableCell>Status</TableCell>
                                        <TableCell>Ordered By</TableCell>
                                        <TableCell>Expected Delivery</TableCell>
                                        <TableCell>Progress</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {orders.slice(0, 5).map((order) => (
                                        <TableRow key={order.id}>
                                            <TableCell>{order.orderNumber}</TableCell>
                                            <TableCell>{order.supplier.name}</TableCell>
                                            <TableCell>
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                    {getCategoryIcon(order.supplier.category)}
                                                    {order.supplier.category}
                                                </Box>
                                            </TableCell>
                                            <TableCell>RM {order.totalAmount.toFixed(2)}</TableCell>
                                            <TableCell>
                                                <StatusChip
                                                    label={order.status.replace('-', ' ').toUpperCase()}
                                                    status={order.status}
                                                    size="small"
                                                />
                                            </TableCell>
                                            <TableCell>{order.orderedBy}</TableCell>
                                            <TableCell>{order.expectedDelivery}</TableCell>
                                            <TableCell>
                                                <Box sx={{ width: 100 }}>
                                                    <LinearProgress
                                                        variant="determinate"
                                                        value={(getStatusStep(order.status) + 1) * 25}
                                                        sx={{ height: 8, borderRadius: 4 }}
                                                    />
                                                </Box>
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
                                    <TableCell>Amount</TableCell>
                                    <TableCell>Status</TableCell>
                                    <TableCell>Order Date</TableCell>
                                    <TableCell>Ordered By</TableCell>
                                    <TableCell>Actions</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {orders.map((order) => (
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
                                        <TableCell>RM {order.totalAmount.toFixed(2)}</TableCell>
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
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </StyledPaper>
            )}

            {/* Order Creation Dialog */}
            <Dialog
                open={openOrderDialog}
                onClose={handleCloseDialog}
                maxWidth="md"
                fullWidth
            >
                <DialogTitle>
                    Create New Order - {selectedCategory}
                </DialogTitle>
                <DialogContent>
                    <Box sx={{ pt: 2 }}>
                        <FormControl fullWidth sx={{ mb: 3 }}>
                            <InputLabel>Select Supplier</InputLabel>
                            <Select
                                value={selectedSupplier?.id || ''}
                                onChange={(e) => {
                                    const supplier = suppliers.find(s => s.id === e.target.value);
                                    setSelectedSupplier(supplier || null);
                                }}
                            >
                                {suppliers
                                    .filter(s => s.category === selectedCategory)
                                    .map((supplier) => (
                                        <MenuItem key={supplier.id} value={supplier.id}>
                                            <Box>
                                                <Typography variant="body1">{supplier.name}</Typography>
                                                <Typography variant="caption" color="textSecondary">
                                                    Rating: {supplier.rating}/5 | Delivery: {supplier.deliveryTime}
                                                </Typography>
                                            </Box>
                                        </MenuItem>
                                    ))}
                            </Select>
                        </FormControl>

                        {selectedSupplier && (
                            <Paper sx={{ p: 2, mb: 3, bgcolor: '#f8f9fa' }}>
                                <Typography variant="h6" gutterBottom>
                                    Supplier Details
                                </Typography>
                                <Grid container spacing={2}>
                                    <Grid item xs={12} sm={6}>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                                            <PhoneIcon fontSize="small" />
                                            <Typography variant="body2">{selectedSupplier.contact.phone}</Typography>
                                        </Box>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                                            <EmailIcon fontSize="small" />
                                            <Typography variant="body2">{selectedSupplier.contact.email}</Typography>
                                        </Box>
                                        <Rating value={selectedSupplier.rating} readOnly size="small" />
                                    </Grid>
                                    <Grid item xs={12} sm={6}>
                                        <Typography variant="body2">
                                            <strong>Delivery Time:</strong> {selectedSupplier.deliveryTime}
                                        </Typography>
                                        <Typography variant="body2">
                                            <strong>Min Order:</strong> RM {selectedSupplier.minOrder}
                                        </Typography>
                                        <Typography variant="body2">
                                            <strong>Payment Terms:</strong> {selectedSupplier.paymentTerms}
                                        </Typography>
                                    </Grid>
                                </Grid>
                            </Paper>
                        )}

                        <Typography variant="h6" gutterBottom>
                            Order Items
                        </Typography>
                        {/* Add order items interface here */}
                        <Typography variant="body2" color="textSecondary">
                            Order items interface will be implemented here...
                        </Typography>
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseDialog}>
                        Cancel
                    </Button>
                    <Button
                        onClick={handleCreateOrder}
                        variant="contained"
                        disabled={!selectedSupplier}
                    >
                        Create Order
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