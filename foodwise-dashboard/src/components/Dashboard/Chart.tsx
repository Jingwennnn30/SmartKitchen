import React from 'react';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer
} from 'recharts';

interface BusinessHourData {
    time: string;
    sales: number;
}

interface ChartProps {
    data: BusinessHourData[];
}

export const Chart: React.FC<ChartProps> = ({ data }) => (
    // @ts-ignore
    <ResponsiveContainer width="100%" height="90%">
        {/* @ts-ignore */}
        <BarChart data={data}>
            {/* @ts-ignore */}
            <CartesianGrid strokeDasharray="3 3" />
            {/* @ts-ignore */}
            <XAxis 
                dataKey="time" 
                tick={{ fill: '#666' }}
            />
            {/* @ts-ignore */}
            <YAxis 
                tick={{ fill: '#666' }}
            />
            {/* @ts-ignore */}
            <Tooltip 
                contentStyle={{ 
                    backgroundColor: 'white',
                    border: '1px solid #ccc',
                    borderRadius: '4px'
                }}
            />
            {/* @ts-ignore */}
            <Bar 
                dataKey="sales" 
                fill="#1976d2" 
                radius={[4, 4, 0, 0]}
            />
        </BarChart>
    </ResponsiveContainer>
);