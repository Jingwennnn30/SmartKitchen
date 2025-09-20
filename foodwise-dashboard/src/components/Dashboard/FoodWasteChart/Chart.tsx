import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

interface FoodWasteData {
    name: string;
    value: number;
    color: string;
}

interface ChartProps {
    data: FoodWasteData[];
}

export const Chart: React.FC<ChartProps> = ({ data }) => (
    // @ts-ignore
    <ResponsiveContainer width="100%" height="90%">
        {/* @ts-ignore */}
        <PieChart>
            {/* @ts-ignore */}
            <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                fill="#8884d8"
                paddingAngle={5}
                dataKey="value"
            >
                {data.map((entry, index) => (
                    // @ts-ignore
                    <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
            </Pie>
            {/* @ts-ignore */}
            <Tooltip />
            {/* @ts-ignore */}
            <Legend />
        </PieChart>
    </ResponsiveContainer>
);