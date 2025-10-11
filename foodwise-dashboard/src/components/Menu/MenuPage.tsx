import React, { useEffect, useState } from 'react';
import { MenuItem, CartItem} from '../../types/menu';
import { MenuService } from '../../services/menuOrderService';
import Card from '@mui/material/Card';
import { 
    Grid, Typography, Button, IconButton, Badge, Dialog, 
    DialogTitle, DialogContent, DialogActions, Box,
    TextField, InputAdornment, Alert
} from '@mui/material';
import AddShoppingCartIcon from '@mui/icons-material/AddShoppingCart';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import RemoveIcon from '@mui/icons-material/Remove';
import AddIcon from '@mui/icons-material/Add';
import PersonIcon from '@mui/icons-material/Person';
import TableRestaurantIcon from '@mui/icons-material/TableRestaurant';

const MenuPage: React.FC = () => {
    const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
    const [cart, setCart] = useState<CartItem[]>([]);
    const [isCartOpen, setIsCartOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [customerName, setCustomerName] = useState('');
    const [tableNumber, setTableNumber] = useState('');
    const [specialRequests, setSpecialRequests] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<string>('All');

    // State to store menu categories
    const [menuCategories, setMenuCategories] = useState<string[]>([]);
    
    // Fetch menu items on component mount using MenuService
    useEffect(() => {
        fetchMenu();
    }, []);

    const fetchMenu = async () => {
        try {
            setLoading(true);
            setError(null); // Clear previous errors
            
            // Fetch menu items from MenuService
            const fetchedItems = await MenuService.getAllMenuItems();
            // Transform to match your MenuItem interface
            const items: MenuItem[] = fetchedItems.map((item: any) => ({
               dishName: item.dishName,
                price: item.price,
                category: item.category || 'Other' // Provide default category
            }));
            
            // Extract unique categories
            const categories = Array.from(new Set(items.map(item => item.category || 'Other')));
            setMenuCategories(categories);
            setMenuItems(items);
        } catch (error) {
            console.error('Error fetching menu:', error);
            setError('Failed to load menu items. Please try again later.');
        } finally {
            setLoading(false);
        }
    };

    // Add item to cart
    const addToCart = (item: MenuItem) => {
        setCart(prevCart => {
            const existingItem = prevCart.find(cartItem => cartItem.dishName === item.dishName);
            if (existingItem) {
                return prevCart.map(cartItem =>
                    cartItem.dishName === item.dishName
                        ? { ...cartItem, quantity: cartItem.quantity + 1 }
                        : cartItem
                );
            }
            return [...prevCart, { ...item, quantity: 1 }];
        });
    };

    // Remove item from cart
    const removeFromCart = (dishName: string) => {
        setCart(prevCart => {
            const existingItem = prevCart.find(item => item.dishName ===dishName);
            if (existingItem && existingItem.quantity > 1) {
                return prevCart.map(item =>
                    item.dishName ===dishName
                        ? { ...item, quantity: item.quantity - 1 }
                        : item
                );
            }
            return prevCart.filter(item => item.dishName !==dishName);
        });
    };

    // Calculate total price
    const calculateTotal = () => {
        return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
    };

    // Place order
    const placeOrder = async () => {
        if (!customerName.trim() || !tableNumber.trim()) {
            alert('Please enter your name and table number');
            return;
        }

        if (cart.length === 0) {
            alert('Your cart is empty. Please add items before placing an order.');
            return;
        }

        try {
            setLoading(true);
            setError(null);
            
            // Format order data according to the API requirements
            const customerOrder = { 
                customerName: customerName.trim(),
                tableNumber: tableNumber.trim(),
                items: cart.map(item => ({
                    dishName: item.dishName || '',
                    quantity: item.quantity,
                    price: item.price
                })),
                totalAmount: calculateTotal(),
                specialRequests: specialRequests ? specialRequests.trim() : '',
                orderDate: new Date().toISOString(), // Add timestamp for the order
            };

            console.log('Submitting order to database:', customerOrder);
            
            // Save order to database via API
            const response = await MenuService.saveOrder(customerOrder);
            
            // Handle successful order
            console.log('Order saved successfully:', response);
            
            // Reset state after successful order
            setCart([]);
            setIsCartOpen(false);
            setCustomerName('');
            setTableNumber('');
            setSpecialRequests('');
            
            // Show success message
            alert(`Order placed successfully! Thank you for your order.`);
            
        } catch (error: any) {
            console.error('Error placing order:', error);
            setError(`Failed to place order: ${error.message || 'Unknown error'}`);
            alert(`Failed to place order: ${error.message || 'Please try again.'}`);
        } finally {
            setLoading(false);
        }
    };

    // Filter menu items based on search term and selected category
    const filteredMenuItems = menuItems.filter(item => {
        // Handle potential undefined values
        const dishName = item.dishName || '';
        const category = item.category || 'Other';
        
        const matchesSearch = dishName.toLowerCase().includes((searchTerm || '').toLowerCase());
        const matchesCategory = selectedCategory === 'All' || category === selectedCategory;
        return matchesSearch && matchesCategory;
    });

    // Sort categories to display Main Courses first
    const sortedCategories = [...menuCategories].sort((a, b) => {
        if (a === 'Main Courses') return -1;
        if (b === 'Main Courses') return 1;
        return a.localeCompare(b);
    });

    // Get categories for display in the filter - including 'All'
    const displayCategories = ['All', ...sortedCategories];

    return (
        <div style={{ padding: '20px' }}>
            <Box 
                display="flex" 
                justifyContent="space-between" 
                alignItems="center" 
                mb={4}
                sx={{
                    borderBottom: '3px solid #1976d2',
                    pb: 2,
                    background: 'linear-gradient(to right, #ffffff, #f5f5f5)',
                    px: 2,
                    borderRadius: '8px 8px 0 0',
                }}
            >
                <Typography 
                    variant="h4" 
                    sx={{
                        fontWeight: 600,
                        color: '#1976d2',
                        textShadow: '1px 1px 2px rgba(0,0,0,0.1)',
                    }}
                >
                    Our Menu
                </Typography>
                <IconButton 
                    color="primary" 
                    onClick={() => setIsCartOpen(true)}
                    sx={{ 
                        backgroundColor: '#1976d2',
                        color: 'white',
                        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                        '&:hover': {
                            backgroundColor: '#1565c0',
                        }
                    }}
                >
                    <Badge 
                        badgeContent={cart.reduce((total, item) => total + item.quantity, 0)} 
                        color="secondary"
                        showZero
                        sx={{
                            '& .MuiBadge-badge': {
                                fontSize: '0.8rem',
                                height: '20px',
                                minWidth: '20px',
                                padding: '0 6px'
                            }
                        }}
                    >
                        <ShoppingCartIcon />
                    </Badge>
                </IconButton>
            </Box>

            {/* Search and Filter Bar */}
            <Box 
                sx={{ 
                    mb: 4, 
                    display: 'flex', 
                    flexDirection: { xs: 'column', sm: 'row' }, 
                    gap: 2,
                    backgroundColor: 'white',
                    p: 3,
                    borderRadius: '12px',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
                }}
            >
                <TextField
                    fullWidth
                    variant="outlined"
                    size="small"
                    label="Search menu items"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    sx={{
                        '& .MuiOutlinedInput-root': {
                            borderRadius: '8px',
                            '&:hover fieldset': {
                                borderColor: '#1976d2',
                            },
                        },
                    }}
                    InputProps={{
                        startAdornment: (
                            <InputAdornment position="start">
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#1976d2" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <circle cx="11" cy="11" r="8"></circle>
                                    <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                                </svg>
                            </InputAdornment>
                        ),
                    }}
                />
                
                <Box sx={{ minWidth: 200 }}>
                    <TextField
                        select
                        fullWidth
                        size="small"
                        label="Category"
                        value={selectedCategory}
                        onChange={(e) => setSelectedCategory(e.target.value)}
                        sx={{
                            '& .MuiOutlinedInput-root': {
                                borderRadius: '8px',
                                '&:hover fieldset': {
                                    borderColor: '#1976d2',
                                },
                            },
                        }}
                    >
                        {displayCategories.map((category) => (
                            <option key={category} value={category}>
                                {category}
                            </option>
                        ))}
                    </TextField>
                </Box>
            </Box>

            {/* Show error if there's one */}
            {error && (
                <Alert severity="error" sx={{ mb: 2 }}>
                    {error}
                </Alert>
            )}

            {/* Show loading indicator */}
            {loading && (
                <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
                    <Typography variant="body1">Loading menu items...</Typography>
                </Box>
            )}

            {/* Menu Items Grouped by Category */}
            {!loading && !error && (
                <>
                    {/* Show message when no results found */}
                    {filteredMenuItems.length === 0 && (
                        <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
                            <Typography variant="body1">
                                No menu items found. Please try a different search or category.
                            </Typography>
                        </Box>
                    )}
                    
                    {selectedCategory !== 'All' ? (
                        // Show only the selected category
                        <Box>
                            <Typography 
                                variant="h5" 
                                sx={{ 
                                    mb: 2, 
                                    pb: 1, 
                                    borderBottom: '2px solid #1976d2',
                                    fontWeight: 'bold'
                                }}
                            >
                                {selectedCategory}
                            </Typography>
                            <Grid container spacing={3}>
                                {filteredMenuItems.map((item, index) => (
                                    <Grid item xs={12} sm={6} md={4} key={`${item.category}-${index}`}>
                                        <Card sx={{
                                            display: 'flex',
                                            flexDirection: 'column',
                                            height: '100%',
                                            transition: 'all 0.3s ease',
                                            borderRadius: '16px',
                                            overflow: 'hidden',
                                            border: '1px solid #e0e0e0',
                                            backgroundColor: '#ffffff',
                                            '&:hover': {
                                                transform: 'translateY(-4px)',
                                                boxShadow: '0 12px 24px rgba(0,0,0,0.1)',
                                                borderColor: '#1976d2'
                                            }
                                        }}>
                                            <Box 
                                                sx={{ 
                                                    p: 3, 
                                                    flexGrow: 1,
                                                    borderBottom: '1px solid #f0f0f0'
                                                }}
                                            >
                                                <Typography 
                                                    variant="h6" 
                                                    gutterBottom 
                                                    sx={{
                                                        fontWeight: 600,
                                                        color: '#2c3e50',
                                                        fontSize: '1.1rem',
                                                        lineHeight: 1.3
                                                    }}
                                                >
                                                    {item.dishName}
                                                </Typography>
                                                <Typography 
                                                    variant="h5" 
                                                    sx={{ 
                                                        mt: 2,
                                                        color: '#1976d2',
                                                        fontWeight: 700,
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        gap: 1
                                                    }}
                                                >
                                                    RM {item.price}
                                                </Typography>
                                            </Box>
                                            <Box sx={{ p: 2, bgcolor: '#f8f9fa' }}>
                                                <Button
                                                    startIcon={<AddShoppingCartIcon />}
                                                    variant="contained"
                                                    color="primary"
                                                    onClick={() => addToCart(item)}
                                                    fullWidth
                                                    sx={{
                                                        borderRadius: '8px',
                                                        textTransform: 'none',
                                                        py: 1,
                                                        fontWeight: 600,
                                                        boxShadow: 'none',
                                                        '&:hover': {
                                                            boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
                                                        }
                                                    }}
                                                >
                                                    Add to Cart
                                                </Button>
                                            </Box>
                                        </Card>
                                    </Grid>
                                ))}
                            </Grid>
                        </Box>
                    ) : (
                        // Group by categories when "All" is selected
                        <Box>
                            {sortedCategories.map(category => {
                                // Filter items by category and search term
                                const itemsInCategory = filteredMenuItems.filter(item => item.category === category);
                                
                                if (itemsInCategory.length === 0) return null;
                                
                                return (
                                    <Box key={category} mb={4}>
                                        <Box
                                            sx={{
                                                mb: 3,
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: 2,
                                                background: 'linear-gradient(to right, #1976d2, #1565c0)',
                                                p: 2,
                                                borderRadius: '12px',
                                                boxShadow: '0 2px 8px rgba(25, 118, 210, 0.2)',
                                            }}
                                        >
                                            <Typography 
                                                variant="h5" 
                                                sx={{ 
                                                    fontWeight: 'bold',
                                                    color: 'white',
                                                    textShadow: '1px 1px 2px rgba(0,0,0,0.2)',
                                                }}
                                            >
                                                {category}
                                            </Typography>
                                        </Box>
                                        <Grid container spacing={3}>
                                            {itemsInCategory.map((item, index) => (
                                                <Grid item xs={12} sm={6} md={4} key={`${category}-${index}`}>
                                                    <Card sx={{
                                                        display: 'flex',
                                                        flexDirection: 'column',
                                                        height: '100%',
                                                        transition: 'transform 0.2s, box-shadow 0.2s',
                                                        '&:hover': {
                                                            transform: 'translateY(-4px)',
                                                            boxShadow: '0 8px 16px rgba(0,0,0,0.1)'
                                                        }
                                                    }}>
                                                        <Box sx={{ p: 2, flexGrow: 1 }}>
                                                            <Typography variant="h6" gutterBottom>{item.dishName}</Typography>
                                                            <Typography variant="body1" color="primary" fontWeight="bold" sx={{ mt: 1 }}>
                                                                RM {item.price}
                                                            </Typography>
                                                        </Box>
                                                        <Box sx={{ p: 2, pt: 0 }}>
                                                            <Button
                                                                startIcon={<AddShoppingCartIcon />}
                                                                variant="contained"
                                                                color="primary"
                                                                onClick={() => addToCart(item)}
                                                                fullWidth
                                                            >
                                                                Add to Cart
                                                            </Button>
                                                        </Box>
                                                    </Card>
                                                </Grid>
                                            ))}
                                        </Grid>
                                    </Box>
                                );
                            })}
                        </Box>
                    )}
                </>
            )}

            {/* Cart Dialog */}
            <Dialog open={isCartOpen} onClose={() => setIsCartOpen(false)} maxWidth="sm" fullWidth>
                <DialogTitle>Your Cart</DialogTitle>
                <DialogContent>
                    {cart.length === 0 ? (
                        <Typography>Your cart is empty</Typography>
                    ) : (
                        <>
                            {/* Customer Info Fields */}
                            <Box mb={2}>
                                <TextField
                                    fullWidth
                                    label="Your Name"
                                    value={customerName}
                                    onChange={(e) => setCustomerName(e.target.value)}
                                    margin="normal"
                                    InputProps={{
                                        startAdornment: (
                                            <InputAdornment position="start">
                                                <PersonIcon />
                                            </InputAdornment>
                                        ),
                                    }}
                                />
                                <TextField
                                    fullWidth
                                    label="Table Number"
                                    value={tableNumber}
                                    onChange={(e) => setTableNumber(e.target.value)}
                                    margin="normal"
                                    InputProps={{
                                        startAdornment: (
                                            <InputAdornment position="start">
                                                <TableRestaurantIcon />
                                            </InputAdornment>
                                        ),
                                    }}
                                />
                                <TextField
                                    fullWidth
                                    label="Special Requests (optional)"
                                    value={specialRequests}
                                    onChange={(e) => setSpecialRequests(e.target.value)}
                                    margin="normal"
                                    multiline
                                    rows={2}
                                    placeholder="Any special dietary requirements or preferences?"
                                />
                            </Box>
                            
                            {/* Cart Items Header */}
                            <Box
                                display="flex"
                                justifyContent="space-between"
                                alignItems="center"
                                mb={1}
                                mt={2}
                                px={1}
                                sx={{ borderBottom: '1px solid #e0e0e0', pb: 1 }}
                            >
                                <Typography variant="subtitle2" fontWeight="bold" sx={{ flex: 2 }}>
                                    Dish
                                </Typography>
                                <Typography variant="subtitle2" fontWeight="bold" sx={{ flex: 1, textAlign: 'center' }}>
                                    Quantity
                                </Typography>
                                <Typography variant="subtitle2" fontWeight="bold" sx={{ flex: 1, textAlign: 'right' }}>
                                    Price
                                </Typography>
                            </Box>
                            
                            {/* Cart Items */}
                            {cart.map((item, index) => (
                                <Box
                                    key={index}
                                    display="flex"
                                    justifyContent="space-between"
                                    alignItems="center"
                                    mb={2}
                                    px={1}
                                    sx={{
                                        backgroundColor: index % 2 === 0 ? '#f5f5f5' : 'transparent',
                                        borderRadius: '4px',
                                        py: 1
                                    }}
                                >
                                    <Typography sx={{ flex: 2 }}>{item.dishName}</Typography>
                                    <Box display="flex" alignItems="center" justifyContent="center" sx={{ flex: 1 }}>
                                        <IconButton
                                            size="small"
                                            onClick={() => removeFromCart(item.dishName)}
                                            sx={{ 
                                                backgroundColor: '#e0e0e0',
                                                '&:hover': { backgroundColor: '#d5d5d5' },
                                                width: '28px',
                                                height: '28px'
                                            }}
                                        >
                                            <RemoveIcon fontSize="small" />
                                        </IconButton>
                                        <Typography mx={2}>{item.quantity}</Typography>
                                        <IconButton
                                            size="small"
                                            onClick={() => addToCart(item)}
                                            sx={{ 
                                                backgroundColor: '#e0e0e0',
                                                '&:hover': { backgroundColor: '#d5d5d5' },
                                                width: '28px',
                                                height: '28px'
                                            }}
                                        >
                                            <AddIcon fontSize="small" />
                                        </IconButton>
                                    </Box>
                                    <Typography sx={{ flex: 1, textAlign: 'right' }}>
                                        RM {(item.price * item.quantity)}
                                    </Typography>
                                </Box>
                            ))}
                            <Box 
                                mt={3} 
                                sx={{ 
                                    borderTop: '2px solid #1976d2',
                                    pt: 2,
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center'
                                }}
                            >
                                <Typography variant="h6" fontWeight="bold">
                                    Total Amount:
                                </Typography>
                                <Typography variant="h6" fontWeight="bold" color="primary">
                                    RM {calculateTotal()}
                                </Typography>
                            </Box>
                        </>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setIsCartOpen(false)}>
                        Continue Shopping
                    </Button>
                    <Button
                        onClick={placeOrder}
                        color="primary"
                        variant="contained"
                        disabled={cart.length === 0 || loading || !customerName.trim() || !tableNumber.trim()}
                    >
                        {loading ? 'Placing Order...' : 'Place Order'}
                    </Button>
                </DialogActions>
            </Dialog>
        </div>
    );
};

export default MenuPage;