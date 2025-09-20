import React from 'react';
import { Card, Typography } from '@mui/material';
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
} from 'recharts';

interface DataPoint {
    name: string;
    stock: number;
    usage: number;
}

const data: DataPoint[] = [
    { name: 'Mon', stock: 400, usage: 240 },
    { name: 'Tue', stock: 300, usage: 139 },
    { name: 'Wed', stock: 200, usage: 980 },
    { name: 'Thu', stock: 278, usage: 390 },
    { name: 'Fri', stock: 189, usage: 480 },
    { name: 'Sat', stock: 239, usage: 380 },
    { name: 'Sun', stock: 349, usage: 430 },
];

// Using React.memo to optimize performance and help with type inference
const StockUsageChart = React.memo(() => {
    return (
        <Card sx={{ height: '400px', p: 2 }}>
            <Typography variant="h6" gutterBottom>
                Stock vs Usage
            </Typography>
            <div style={{ width: '100%', height: '90%' }}>
                {/* @ts-ignore */}
                <ResponsiveContainer width="100%" height="100%">
                    {/* @ts-ignore */}
                    <LineChart data={data}>
                        {/* @ts-ignore */}
                        <CartesianGrid strokeDasharray="3 3" />
                        {/* @ts-ignore */}
                        <XAxis dataKey="name" />
                        {/* @ts-ignore */}
                        <YAxis />
                        {/* @ts-ignore */}
                        <Tooltip />
                        {/* @ts-ignore */}
                        <Legend />
                        {/* @ts-ignore */}
                        <Line 
                            type="monotone" 
                            dataKey="stock" 
                            stroke="#8884d8" 
                            dot={{ stroke: '#8884d8', strokeWidth: 1 }}
                        />
                        {/* @ts-ignore */}
                        <Line 
                            type="monotone" 
                            dataKey="usage" 
                            stroke="#82ca9d"
                            dot={{ stroke: '#82ca9d', strokeWidth: 1 }}
                        />
                    </LineChart>
                </ResponsiveContainer>
            </div>
        </Card>
    );
});

export default StockUsageChart;