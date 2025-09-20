import React from 'react';
import { Card, Typography, Box, Grid, Button } from '@mui/material';

interface StockItem {
    name: string;
    quantity: string;
    note: string;
}

const data: StockItem[] = [
    { name: 'Beef', quantity: '3 kg left', note: 'half-day use' },
    { name: 'Chicken', quantity: '5 kg left', note: '1-day use' },
    { name: 'Fresh Tomatoes', quantity: '2 kg left', note: 'Order soon' },
];

const LowStock: React.FC = () => {
    const handleOrder = (itemName: string) => {
        // TODO: Implement order functionality
        console.log(`Ordering more ${itemName}`);
    };

    return (
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
                                onClick={() => handleOrder(item.name)}
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
    );
};

export default LowStock;