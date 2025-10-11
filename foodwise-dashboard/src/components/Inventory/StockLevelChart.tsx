import React, { useEffect, useState } from 'react';
import type { FC } from 'react';
import { Box, Typography, Skeleton } from '@mui/material';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer
} from 'recharts';
import StockDataService, { StockItem } from '../../services/stockDataService';

interface StockData {
    name: string;
    current: number;
    minimum: number;
}

// Mock data - you would typically get this from your backend
const data: StockData[] = [
    { name: 'Fish Fillet', current: 8.5, minimum: 7 },
    { name: 'Grilled Chicken', current: 30.0, minimum: 18 },
    { name: 'Cherry', current: 2.0, minimum: 1 },
    { name: 'Tomatoes', current: 5.0, minimum: 7 },
    { name: 'Cucumber', current: 4.0, minimum: 5 },
    { name: 'Green Beans', current: 3.5, minimum: 2 },
    { name: 'Shrimp', current: 17.0, minimum: 12 },
    { name: 'Carrot', current: 6.0, minimum: 5 },
    { name: 'Onion', current: 5.5, minimum: 2 },
    { name: 'Beef Patty', current: 12.0, minimum: 15 },
    { name: 'Duck', current: 17.0, minimum: 15 },
    { name: 'Eggplant', current: 3.0, minimum: 5 },
    { name: 'Corn', current: 4.0, minimum: 3 },
    { name: 'Egg', current: 100, minimum: 50 },
    { name: 'Milk', current: 10.0, minimum: 5 },
];

const StockLevelChart: React.FC = () => {
    // Show all data without category filtering
    const filteredData = data;

    return (
        <Box sx={{ position: 'relative', width: '100%', height: '100%' }}>
            <ResponsiveContainer width="100%" height={300}>
                <BarChart data={filteredData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar 
                        dataKey="current" 
                        name="Current Stock" 
                        fill="#82ca9d" 
                    />
                    <Bar 
                        dataKey="minimum" 
                        name="Safe Minimum" 
                        fill="#ffc658" 
                    />
                </BarChart>
            </ResponsiveContainer>
        </Box>
    );
};

export default StockLevelChart;