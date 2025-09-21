import React from 'react';
import type { FC } from 'react';
import { Box, Link, Typography } from '@mui/material';
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

interface StockData {
    name: string;
    current: number;
    minimum: number;
}

interface StockLevelChartProps {
    category: string;
}

// Mock data - you would typically get this from your backend
const data: StockData[] = [
    { name: 'Milk', current: 15, minimum: 10 },
    { name: 'Chicken Breast', current: 50, minimum: 30 },
    { name: 'Potato', current: 80, minimum: 40 },
    { name: 'Broccoli', current: 30, minimum: 20 },
    { name: 'Olive Oil', current: 50, minimum: 25 },
];

const StockLevelChart: React.FC<StockLevelChartProps> = ({ category }) => {
    // In a real application, you would filter data based on category
    const filteredData = category === 'All' ? data : data.filter(item => item.name === category);

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
            
            {/* Show All Link */}
            <Box sx={{ 
                position: 'absolute', 
                bottom: 0, 
                right: 0, 
                padding: 1 
            }}>
                <Link 
                    href="#" 
                    underline="always" 
                    color="primary" 
                    sx={{ 
                        fontSize: '0.875rem',
                        fontWeight: 500,
                        cursor: 'pointer',
                        '&:hover': {
                            color: 'primary.dark'
                        }
                    }}
                    onClick={(e) => {
                        e.preventDefault();
                        // Handle Show All functionality here
                        console.log('Show All clicked');
                    }}
                >
                    Show All
                </Link>
            </Box>
        </Box>
    );
};

export default StockLevelChart;