import React from 'react';
import { Typography, List, ListItem, ListItemText, Box, Card } from '@mui/material';
import { styled } from '@mui/material/styles';

const StyledListItem = styled(ListItem)({
    borderBottom: '1px solid rgba(0, 0, 0, 0.12)',
    '&:last-child': {
        borderBottom: 'none',
    },
});

const predictions = [
    { item: 'Chicken Breast', date: 'Sep 25, 2025', quantity: '20kg' },
    { item: 'Beef', date: 'Sep 26, 2025', quantity: '15kg' },
    { item: 'Potatoes', date: 'Sep 27, 2025', quantity: '30kg' },
    { item: 'Milk', date: 'Sep 28, 2025', quantity: '25L' },
];

const RestockPredictionChart: React.FC = () => {
    return (
        <Card sx={{ 
            height: '400px', 
            p: 2,
            boxShadow: '0px 2px 6px rgba(0, 0, 0, 0.1)',
            borderRadius: '10px'
        }}>
            <Box sx={{ 
                height: '100%',
                backgroundColor: '#ffffff',
                borderRadius: '8px',
                boxShadow: 'inset 0px 1px 3px rgba(0, 0, 0, 0.1)',
                border: '1px solid rgba(0, 0, 0, 0.08)',
                p: 2,
                display: 'flex',
                flexDirection: 'column'
            }}>
                <Typography variant="h6" gutterBottom>
                    Predicted Restock Summary
                </Typography>
                <Box sx={{ flex: 1, overflow: 'auto' }}>
                    <List sx={{ py: 0 }}>
                        {predictions.map((prediction, index) => (
                            <StyledListItem key={index}>
                                <ListItemText
                                    primary={prediction.item}
                                    secondary={
                                        <Box component="span" sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                            <span>{prediction.date}</span>
                                            <span>{prediction.quantity}</span>
                                        </Box>
                                    }
                                />
                            </StyledListItem>
                        ))}
                    </List>
                </Box>
            </Box>
        </Card>
    );
};

export default RestockPredictionChart;