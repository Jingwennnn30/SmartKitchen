import React, { useState } from 'react';
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
    CircularProgress
} from '@mui/material';

interface StockItem {
    name: string;
    quantity: string;
    note: string;
    suggestedAmount?: number; // Add suggested amount for ordering
}

const data: StockItem[] = [
    { name: 'Beef', quantity: '3 kg left', note: 'half-day use', suggestedAmount: 10 },
    { name: 'Chicken', quantity: '5 kg left', note: '1-day use', suggestedAmount: 15 },
    { name: 'Fresh Tomatoes', quantity: '2 kg left', note: 'Order soon', suggestedAmount: 8 },
];

const LowStock: React.FC = () => {
    const [openDialog, setOpenDialog] = useState(false);
    const [selectedItem, setSelectedItem] = useState<StockItem | null>(null);
    const [orderAmount, setOrderAmount] = useState<string>('1');
    const [loading, setLoading] = useState(false);

    const API_URL = "https://k5j3bc2p73.execute-api.us-east-1.amazonaws.com/dev/order";

    const handleOrder = (item: StockItem) => {
        // Prevent any default navigation behavior
        console.log(`Opening order dialog for ${item.name}`);
        setSelectedItem(item);
        setOrderAmount(String(item.suggestedAmount || 1));
        setOpenDialog(true);
    };

    const handleCloseDialog = () => {
        setOpenDialog(false);
        setSelectedItem(null);
        setOrderAmount('1');
        setLoading(false);
    };

    const placeOrder = async () => {
        if (!selectedItem) return;
        
        setLoading(true);
        try {
            const res = await fetch(API_URL, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ 
                    item: selectedItem.name, 
                    amount: Number(orderAmount)
                })
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Request failed");
            
            alert(data.message || `Order placed: ${orderAmount} kg of ${selectedItem.name}`);
            handleCloseDialog();
        } catch (err) {
            console.error(err);
            alert("Error: " + (err as Error).message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <Grid container spacing={2}>
                {data.map((item, index) => (
                    <Grid item xs={12} sm={4} key={index}>
                        <Card sx={{
                            p: 2,
                            backgroundColor: '#ffebee',
                            boxShadow: '0px 2px 6px rgba(0, 0, 0, 0.1)',
                            borderRadius: '10px'
                        }}>
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                                <Typography variant="h6" color="error">
                                    {item.name}
                                </Typography>
                                <Typography variant="body1" sx={{ fontWeight: 'medium' }}>
                                    {item.quantity}
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                    {item.note}
                                </Typography>
                                <Button 
                                    variant="contained" 
                                    color="error" 
                                    size="small"
                                    onClick={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        handleOrder(item);
                                    }}
                                    sx={{ 
                                        mt: 1,
                                        fontSize: '0.75rem',
                                        width: 'fit-content'
                                    }}
                                >
                                    Order Now
                                </Button>
                            </Box>
                        </Card>
                    </Grid>
                ))}
            </Grid>

            {/* Order Confirmation Dialog */}
            <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
                <DialogTitle>
                    Place Order for {selectedItem?.name}
                </DialogTitle>
                <DialogContent>
                    <Box sx={{ mt: 2 }}>
                        <Typography variant="body1" sx={{ mb: 2 }}>
                            Current Stock: {selectedItem?.quantity}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                            {selectedItem?.note}
                        </Typography>
                        <TextField
                            label="Amount (kg)"
                            type="number"
                            value={orderAmount}
                            onChange={(e) => {
                                const value = e.target.value;
                                // Allow empty string and valid numbers
                                if (value === '' || /^\d+$/.test(value)) {
                                    setOrderAmount(value);
                                }
                            }}
                            onFocus={(e) => {
                                // Select all text when focused for easy replacement
                                e.target.select();
                            }}
                            inputProps={{ 
                                min: 1,
                                step: 1
                            }}
                            fullWidth
                            required
                            helperText="Suggested amount based on usage patterns"
                        />
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseDialog} disabled={loading}>
                        Cancel
                    </Button>
                    <Button 
                        onClick={placeOrder} 
                        variant="contained" 
                        color="primary"
                        disabled={loading || orderAmount === '' || Number(orderAmount) < 1}
                        startIcon={loading ? <CircularProgress size={20} /> : null}
                    >
                        {loading ? "Placing Order..." : "Confirm Order"}
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    );
};

export default LowStock;