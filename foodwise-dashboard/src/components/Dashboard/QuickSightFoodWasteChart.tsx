import React from 'react';
import { 
    Card, 
    Typography, 
    Box,
    Chip
} from '@mui/material';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';

// Mock data for food waste by category
const wasteData = [
    { name: 'Vegetables', value: 28, color: '#10b981' },
    { name: 'Fruits', value: 18, color: '#f59e0b' },
    { name: 'Dairy', value: 15, color: '#3b82f6' },
    { name: 'Meat & Seafood', value: 22, color: '#ef4444' },
    { name: 'Bakery', value: 12, color: '#8b5cf6' },
    { name: 'Other', value: 5, color: '#6b7280' }
];

const totalWaste = wasteData.reduce((sum, item) => sum + item.value, 0);

const QuickSightFoodWasteChart: React.FC = () => {
    const renderCustomLabel = (entry: any) => {
        const percent = ((entry.value / totalWaste) * 100).toFixed(1);
        return `${percent}%`;
    };

    return (
        <Card sx={{ 
            height: '400px', 
            p: 2.5,
            boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.08)',
            borderRadius: '12px',
            display: 'flex',
            flexDirection: 'column',
            background: 'linear-gradient(to bottom, #ffffff 0%, #fafafa 100%)',
            border: '1px solid #e5e7eb'
        }}>
            <Box sx={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                mb: 2
            }}>
                <Box>
                    <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#1f2937' }}>
                        Food Waste Analysis
                    </Typography>
                    <Typography variant="caption" sx={{ color: '#6b7280' }}>
                        Waste breakdown by category
                    </Typography>
                </Box>
                <Box sx={{ display: 'flex', gap: 1 }}>
                    <Chip 
                        icon={<TrendingDownIcon sx={{ fontSize: 16 }} />}
                        label="-12% vs last month" 
                        size="small" 
                        sx={{ 
                            bgcolor: '#ecfdf5', 
                            color: '#059669',
                            fontWeight: 'bold',
                            fontSize: '0.75rem'
                        }} 
                    />
                </Box>
            </Box>
            
            <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', minHeight: 0 }}>
                <ResponsiveContainer width="100%" height={250}>
                    <PieChart>
                        <Pie
                            data={wasteData}
                            cx="50%"
                            cy="45%"
                            labelLine={false}
                            label={renderCustomLabel}
                            outerRadius={80}
                            innerRadius={50}
                            fill="#8884d8"
                            dataKey="value"
                            animationBegin={0}
                            animationDuration={800}
                        >
                            {wasteData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                        </Pie>
                        <Tooltip 
                            contentStyle={{
                                backgroundColor: '#ffffff',
                                border: '1px solid #e5e7eb',
                                borderRadius: '8px',
                                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                                padding: '12px'
                            }}
                            formatter={(value: number) => [`${value} kg`, 'Waste']}
                        />
                        <Legend 
                            verticalAlign="bottom" 
                            height={30}
                            iconType="circle"
                            wrapperStyle={{
                                fontSize: '11px',
                                paddingTop: '5px'
                            }}
                        />
                    </PieChart>
                </ResponsiveContainer>
            </Box>
            
            <Box sx={{ 
                mt: 2, 
                pt: 2, 
                borderTop: '1px solid #e5e7eb',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
            }}>
                <Box>
                    <Typography variant="caption" sx={{ color: '#6b7280' }}>
                        Total Waste (This Month)
                    </Typography>
                    <Typography variant="h6" sx={{ color: '#1f2937', fontWeight: 'bold' }}>
                        {totalWaste} kg
                    </Typography>
                </Box>
                <Typography variant="caption" color="textSecondary">
                    Last updated: {new Date().toLocaleTimeString()}
                </Typography>
            </Box>
        </Card>
    );
};

export default QuickSightFoodWasteChart;