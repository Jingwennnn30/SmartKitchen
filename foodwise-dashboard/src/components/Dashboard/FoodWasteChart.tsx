import React from 'react';
import { Card, Typography } from '@mui/material';
import { Chart } from './FoodWasteChart/Chart';

const data = [
    { name: 'Expired', value: 30, color: '#ef5350' },
    { name: 'Overcooked', value: 30, color: '#42a5f5' },
    { name: 'Leftover', value: 40, color: '#66bb6a' },
];

const FoodWasteChart: React.FC = () => {
    return (
        <Card sx={{ 
            height: '400px', 
            p: 2,
            boxShadow: '0px 2px 6px rgba(0, 0, 0, 0.1)',
            borderRadius: '10px'
        }}>
            <Typography variant="h6" gutterBottom>
                Food Waste Analysis
            </Typography>
            <Chart data={data} />
        </Card>
    );
};

export default FoodWasteChart;