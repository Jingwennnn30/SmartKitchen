import React from 'react';
import { Card, Typography } from '@mui/material';
import { Chart } from './Chart';

interface BusinessHourData {
    time: string;
    sales: number;
}

const data: BusinessHourData[] = [
    { time: '10AM', sales: 35 },
    { time: '11AM', sales: 50 },
    { time: '12PM', sales: 90 },
    { time: '1PM', sales: 85 },
    { time: '2PM', sales: 65 },
    { time: '3PM', sales: 45 },
    { time: '4PM', sales: 40 },
    { time: '5PM', sales: 55 },
    { time: '6PM', sales: 85 },
    { time: '7PM', sales: 95 },
    { time: '8PM', sales: 80 },
    { time: '9PM', sales: 60 },
    { time: '10PM', sales: 45 }
];

const BusinessHourChart: React.FC = () => {
    return (
        <Card sx={{ 
            height: '400px', 
            p: 2,
            boxShadow: '0px 2px 6px rgba(0, 0, 0, 0.1)',
            borderRadius: '10px'
        }}>
            <Typography variant="h6" gutterBottom>
                Business Hour Analysis
            </Typography>
            <Chart data={data} />
        </Card>
    );
};

export default BusinessHourChart;