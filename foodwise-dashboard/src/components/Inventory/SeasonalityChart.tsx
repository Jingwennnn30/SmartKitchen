import React from 'react';
import type { FC } from 'react';
import { Box, Typography } from '@mui/material';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer
} from 'recharts';

interface SeasonalityChartProps {
    type: 'dayOfWeek' | 'weather' | 'holiday';
}

// Mock data
const dayOfWeekData = [
    { name: 'Mon', value: 80 },
    { name: 'Tue', value: 65 },
    { name: 'Wed', value: 70 },
    { name: 'Thu', value: 85 },
    { name: 'Fri', value: 90 },
    { name: 'Sat', value: 100 },
    { name: 'Sun', value: 95 },
];

const weatherData = [
    { name: 'Sunny', value: 85 },
    { name: 'Rainy', value: 60 },
    { name: 'Cloudy', value: 75 },
];

const holidayData = [
    { name: 'Regular', value: 70 },
    { name: 'Holiday', value: 95 },
    { name: 'Festival', value: 100 },
];

const getChartTitle = (type: SeasonalityChartProps['type']) => {
    switch (type) {
        case 'dayOfWeek':
            return 'Day of Week';
        case 'weather':
            return 'Weather';
        case 'holiday':
            return 'Holiday & Festival season';
    }
};

const getChartData = (type: SeasonalityChartProps['type']) => {
    switch (type) {
        case 'dayOfWeek':
            return dayOfWeekData;
        case 'weather':
            return weatherData;
        case 'holiday':
            return holidayData;
    }
};

const SeasonalityChart: React.FC<SeasonalityChartProps> = ({ type }) => {
    const data = getChartData(type);

    return (
        <Box>
            <Typography variant="subtitle2" gutterBottom textAlign="center">
                {getChartTitle(type)}
            </Typography>
            <ResponsiveContainer width="100%" height={150}>
                <BarChart data={data}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar 
                        dataKey="value" 
                        fill="#8884d8" 
                        radius={[4, 4, 0, 0]}
                    />
                </BarChart>
            </ResponsiveContainer>
        </Box>
    );
};

export default SeasonalityChart;