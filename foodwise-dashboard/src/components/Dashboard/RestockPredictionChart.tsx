import React from 'react';
import { Card, Typography, List, ListItem, ListItemText, Box } from '@mui/material';
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
        <Card sx={{ height: '400px', p: 2 }}>
            <Typography variant="h6" gutterBottom>
                Predicted Restock Summary
            </Typography>
            <List>
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
        </Card>
    );
};

export default RestockPredictionChart;