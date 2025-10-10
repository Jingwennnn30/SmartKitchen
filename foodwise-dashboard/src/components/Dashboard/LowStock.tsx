import React, { useState, useEffect } from 'react';
import { 
    Card, 
    Typography, 
    Box, 
    Grid, 
    Button, 
    Dialog, 
    DialogTitle, 
    DialogContent, 
    DialogActions,
    TextField,
    CircularProgress,
    Chip,
    Alert
} from '@mui/material';
import { styled } from '@mui/material/styles';

interface LowStockItem {
    item: string;
    currentStock: number;
    safetyLevel: number;
    alertThreshold: number;
    unit: string;
    location: string;
    deficit: number;
    urgency: 'Critical' | 'High' | 'Medium';
    supplier: string;
    category: string;
    reason: string;
    hasExpiredItems: boolean;
}

// Styled components for urgency levels
const UrgencyChip = styled(Chip, {
    shouldForwardProp: (prop) => prop !== 'urgency'
})<{ urgency: 'Critical' | 'High' | 'Medium' }>(({ urgency, theme }) => ({
    backgroundColor:
        urgency === 'Critical' ? '#FFEBEE' :
        urgency === 'High' ? '#FFF3E0' :
        '#E3F2FD',
    color:
        urgency === 'Critical' ? '#C62828' :
        urgency === 'High' ? '#EF6C00' :
        '#1565C0',
    fontWeight: 'bold'
}));

const LowStock: React.FC = () => {
    const [data, setData] = useState<LowStockItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [openDialog, setOpenDialog] = useState(false);
    const [selectedItem, setSelectedItem] = useState<LowStockItem | null>(null);
    const [orderAmount, setOrderAmount] = useState<string>('1');
    const [orderLoading, setOrderLoading] = useState(false);

    const API_URL = "https://k5j3bc2p73.execute-api.us-east-1.amazonaws.com/dev/order";

    useEffect(() => {
        const fetchLowStockData = async () => {
            try {
                setLoading(true);
                const backendUrl = process.env.REACT_APP_BACKEND_URL || 'http://localhost:4000';
                const response = await fetch(`${backendUrl}/api/low-stock`);
                
                if (!response.ok) {
                    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
                }
                
                const result = await response.json();
                
                if (result.success) {
                    setData(result.data);
                    setError(null);
                } else {
                    throw new Error(result.error || 'Failed to fetch low stock data');
                }
            } catch (err) {
                console.error('Error fetching low stock data:', err);
                setError(err instanceof Error ? err.message : 'Unknown error occurred');
                setData([]);
            } finally {
                setLoading(false);
            }
        };

        fetchLowStockData();
        
        // Auto-refresh every 2 minutes for real-time updates
        const interval = setInterval(fetchLowStockData, 120000); // 2 minutes = 120,000ms
        
        return () => clearInterval(interval);
    }, []);

    const handleOrder = (item: LowStockItem) => {
        console.log(`Opening order dialog for ${item.item}`);
        setSelectedItem(item);
        setOrderAmount(String(item.deficit)); // Default to deficit amount
        setOpenDialog(true);
    };

    const handleCloseDialog = () => {
        setOpenDialog(false);
        setSelectedItem(null);
        setOrderAmount('1');
        setOrderLoading(false);
    };

    const submitOrder = async () => {
        if (!selectedItem) return;

        setOrderLoading(true);
        const orderData = {
            item: selectedItem.item,
            quantity: orderAmount,
            supplier: selectedItem.supplier,
            urgent: selectedItem.urgency === 'Critical' || selectedItem.urgency === 'High'
        };

        try {
            const response = await fetch(API_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(orderData),
            });

            if (response.ok) {
                console.log(`Order submitted successfully for ${selectedItem.item}`);
                handleCloseDialog();
            } else {
                console.error('Failed to submit order');
            }
        } catch (error) {
            console.error('Error submitting order:', error);
        } finally {
            setOrderLoading(false);
        }
    };

    if (loading) {
        return (
            <Box sx={{ height: '360px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <CircularProgress />
            </Box>
        );
    }

    if (error) {
        return (
            <Box sx={{ height: '360px', p: 1 }}>
                <Alert severity="error" sx={{ mt: 2 }}>
                    Error loading low stock data: {error}
                </Alert>
            </Box>
        );
    }

    return (
        <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            {data.length === 0 ? (
                <Box sx={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center', 
                    height: '100%',
                    flexDirection: 'column',
                    gap: 1
                }}>
                    <Typography variant="h6" color="success.main" sx={{ fontWeight: 'bold' }}>
                        All Items Well Stocked!
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        No items below safety stock levels
                    </Typography>
                </Box>
            ) : (
                <Box sx={{ 
                    flex: 1,
                    overflowY: 'auto',
                    overflowX: 'hidden',
                    pr: 1,
                    '&::-webkit-scrollbar': {
                        width: '6px',
                    },
                    '&::-webkit-scrollbar-track': {
                        background: '#f1f1f1',
                        borderRadius: '3px',
                    },
                    '&::-webkit-scrollbar-thumb': {
                        background: '#c1c1c1',
                        borderRadius: '3px',
                    },
                    '&::-webkit-scrollbar-thumb:hover': {
                        background: '#a1a1a1',
                    },
                }}>
                    <Grid container spacing={1.5} sx={{ m: 0, width: '100%' }}>
                        {data.map((item, index) => (
                            <Grid item xs={12} sm={6} md={4} key={index} sx={{ pl: '12px !important', pt: '12px !important' }}>
                                <Box 
                                    sx={{ 
                                        p: 1.5, 
                                        borderRadius: 2, 
                                        bgcolor: 'grey.50',
                                        border: '2px solid',
                                        borderColor: 
                                            item.urgency === 'Critical' ? 'error.light' :
                                            item.urgency === 'High' ? 'warning.light' :
                                            'info.light',
                                        height: '120px',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        justifyContent: 'space-between',
                                        position: 'relative',
                                        minWidth: 0,
                                        boxSizing: 'border-box'
                                    }}
                                >
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1, minHeight: '50px' }}>
                                        <Box sx={{ flex: 1, pr: 1, minWidth: 0 }}>
                                            <Typography variant="subtitle2" sx={{ 
                                                fontWeight: 'bold', 
                                                mb: 0.5, 
                                                fontSize: '0.85rem', 
                                                lineHeight: 1.2,
                                                overflow: 'hidden',
                                                textOverflow: 'ellipsis',
                                                whiteSpace: 'nowrap'
                                            }}>
                                                {item.item}
                                            </Typography>
                                            <UrgencyChip 
                                                urgency={item.urgency}
                                                label={item.urgency}
                                                size="small"
                                                sx={{ fontSize: '0.7rem', height: '20px' }}
                                            />
                                        </Box>
                                        <Button
                                            size="small"
                                            variant="contained"
                                            color={item.urgency === 'Critical' ? 'error' : 'primary'}
                                            onClick={() => handleOrder(item)}
                                            sx={{ 
                                                fontSize: '0.65rem', 
                                                py: 0.3, 
                                                px: 0.8, 
                                                minWidth: '55px', 
                                                height: '24px',
                                                flexShrink: 0 
                                            }}
                                        >
                                            ORDER
                                        </Button>
                                    </Box>
                                    
                                    <Box sx={{ textAlign: 'center', position: 'absolute', bottom: '12px', left: '12px', right: '12px' }}>
                                        {item.currentStock === 0 && item.hasExpiredItems ? (
                                            <Typography variant="body2" color="error.main" sx={{ fontWeight: 'bold', fontSize: '0.8rem' }}>
                                                Expired
                                            </Typography>
                                        ) : (
                                            <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.8rem' }}>
                                                Current: <strong>{item.currentStock} {item.unit}</strong>
                                            </Typography>
                                        )}
                                        <Typography variant="caption" color="text.secondary" sx={{ 
                                            display: 'block', 
                                            mt: 0.5, 
                                            fontSize: '0.7rem',
                                            overflow: 'hidden',
                                            textOverflow: 'ellipsis',
                                            whiteSpace: 'nowrap'
                                        }}>
                                            {item.location}
                                        </Typography>
                                    </Box>
                                </Box>
                            </Grid>
                        ))}
                    </Grid>
                </Box>
            )}

            {/* Order Dialog */}
            <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
                <DialogTitle>
                    Order {selectedItem?.item}
                    {selectedItem && (
                        <UrgencyChip 
                            urgency={selectedItem.urgency}
                            label={selectedItem.urgency}
                            size="small"
                            sx={{ ml: 1 }}
                        />
                    )}
                </DialogTitle>
                <DialogContent>
                    <Box sx={{ mt: 1 }}>
                        <Typography variant="body2" color="text.secondary" gutterBottom>
                            Current Stock: {selectedItem?.currentStock} {selectedItem?.unit}
                        </Typography>
                        <TextField
                            fullWidth
                            label={`Order Amount (${selectedItem?.unit || 'units'})`}
                            type="number"
                            value={orderAmount}
                            onChange={(e) => setOrderAmount(e.target.value)}
                            margin="normal"
                            InputProps={{
                                inputProps: { min: 1 }
                            }}
                            helperText="Enter the amount you want to order"
                        />
                        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                            Supplier: {selectedItem?.supplier}
                        </Typography>
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseDialog} disabled={orderLoading}>
                        Cancel
                    </Button>
                    <Button 
                        onClick={submitOrder} 
                        variant="contained" 
                        disabled={orderLoading}
                        color={selectedItem?.urgency === 'Critical' ? 'error' : 'primary'}
                    >
                        {orderLoading ? <CircularProgress size={24} /> : 'Submit Order'}
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default LowStock;