import React from 'react';
import { Box, Typography, Paper, Grid } from '@mui/material';
import { styled } from '@mui/material/styles';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

interface ActionAnalysisProps {
    data: {
        name: string;
        value: number;
        color: string;
    }[];
}

const StyledPaper = styled(Paper)(({ theme }) => ({
    padding: theme.spacing(3),
    borderRadius: '12px',
    boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.1)',
    marginTop: theme.spacing(3),
    background: 'linear-gradient(135deg, #fafafa 0%, #f5f5f5 100%)',
}));

const LegendItem = styled(Box)(({ theme }) => ({
    display: 'flex',
    alignItems: 'center',
    marginBottom: theme.spacing(1),
    padding: theme.spacing(1),
    borderRadius: '8px',
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    transition: 'all 0.2s ease',
    cursor: 'pointer',
    '&:hover': {
        backgroundColor: 'rgba(255, 255, 255, 1)',
        transform: 'translateX(4px)',
    }
}));

const ColorDot = styled(Box)<{ color: string }>(({ color }) => ({
    width: '16px',
    height: '16px',
    borderRadius: '50%',
    backgroundColor: color,
    marginRight: '12px',
    border: '2px solid white',
    boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.1)',
}));

const ActionAnalysis: React.FC<ActionAnalysisProps> = ({ data }) => {
    // Custom label function for better visibility
    const renderCustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }: any) => {
        const RADIAN = Math.PI / 180;
        const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
        const x = cx + radius * Math.cos(-midAngle * RADIAN);
        const y = cy + radius * Math.sin(-midAngle * RADIAN);

        return (
            <text 
                x={x} 
                y={y} 
                fill="white" 
                textAnchor={x > cx ? 'start' : 'end'} 
                dominantBaseline="central"
                fontSize="14"
                fontWeight="bold"
                stroke="rgba(0,0,0,0.3)"
                strokeWidth="0.5"
            >
                {`${(percent * 100).toFixed(0)}%`}
            </text>
        );
    };

    // Custom tooltip
    const CustomTooltip = ({ active, payload }: any) => {
        if (active && payload && payload.length) {
            return (
                <Box sx={{
                    backgroundColor: 'white',
                    padding: 2,
                    borderRadius: 2,
                    boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.15)',
                    border: '1px solid #e0e0e0'
                }}>
                    <Typography variant="subtitle2" fontWeight="bold">
                        {payload[0].name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        {payload[0].value}% of total actions
                    </Typography>
                </Box>
            );
        }
        return null;
    };

    return (
        <StyledPaper>
            <Typography variant="h6" gutterBottom fontWeight="bold" color="primary">
                Action Taken Analysis
            </Typography>
            
            <Grid container spacing={3}>
                {/* Chart */}
                <Grid item xs={12} md={8}>
                    <Box sx={{ height: 300 }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={data}
                                    cx="50%"
                                    cy="50%"
                                    labelLine={false}
                                    label={renderCustomLabel}
                                    outerRadius={90}
                                    innerRadius={40}
                                    fill="#8884d8"
                                    paddingAngle={3}
                                    dataKey="value"
                                >
                                    {data.map((entry, index) => (
                                        <Cell 
                                            key={`cell-${index}`} 
                                            fill={entry.color}
                                            stroke="white"
                                            strokeWidth={2}
                                        />
                                    ))}
                                </Pie>
                                <Tooltip content={<CustomTooltip />} />
                            </PieChart>
                        </ResponsiveContainer>
                    </Box>
                </Grid>

                {/* Custom Legend */}
                <Grid item xs={12} md={4}>
                    <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', height: '100%' }}>
                        <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                            Actions Breakdown
                        </Typography>
                        {data.map((entry, index) => (
                            <LegendItem key={index}>
                                <ColorDot color={entry.color} />
                                <Box sx={{ flex: 1 }}>
                                    <Typography variant="body2" fontWeight="medium">
                                        {entry.name}
                                    </Typography>
                                    <Typography variant="caption" color="text.secondary">
                                        {entry.value}%
                                    </Typography>
                                </Box>
                            </LegendItem>
                        ))}
                    </Box>
                </Grid>
            </Grid>
        </StyledPaper>
    );
};

export default ActionAnalysis;