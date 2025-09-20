import React from 'react';
import {
    Box,
    Typography,
    Paper,
    Grid,
    Button,
    styled,
} from '@mui/material';
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
    BarChart,
    Bar,
    Rectangle,
} from 'recharts';
import { ResponsiveHeatMap } from '@nivo/heatmap';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import { teal, orange, blue, red } from '@mui/material/colors';

const StyledPaper = styled(Paper)(({ theme }) => ({
    padding: theme.spacing(3),
    borderRadius: '10px',
    boxShadow: '0px 2px 6px rgba(0, 0, 0, 0.1)',
    height: '100%'
}));

// Mock data for Historical Order Patterns (Heatmap data)
type HeatmapDataPoint = {
    hour: string;
    orders: number;
};

type HeatmapRow = {
    day: string;
    [key: string]: string | number; // For dynamic hour keys
};

const generateHeatmapData = (): HeatmapRow[] => {
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    return days.map(day => {
        const rowData: HeatmapRow = { day };
        // Add data for working hours (10:00 - 22:00)
        for (let hour = 10; hour < 23; hour++) {
            const hourKey = String(hour).padStart(2, '0') + 'h';
            // Generate higher numbers during peak hours (11:00 - 14:00)
            const isPeakHour = hour >= 11 && hour <= 14;
            const baseValue = isPeakHour ? 25 : 10;
            const variation = isPeakHour ? 25 : 15;
            rowData[hourKey] = Math.floor(Math.random() * variation) + baseValue;
        }
        return rowData;
    });
};

const heatmapData = generateHeatmapData();

// Mock data for Average Wait Time Trends
const waitTimeTrends = Array.from({ length: 14 }, (_, index) => ({
    date: (index + 1) + '/9',
    avgWaitTime: Math.floor(Math.random() * 15 + 10),
    targetTime: 15
}));

// Mock data for Inventory Usage Trends
const inventoryTrends = Array.from({ length: 14 }, (_, index) => ({
    date: (index + 1) + '/9',
    stock: Math.floor(Math.random() * 200 + 300),
    usage: Math.floor(Math.random() * 150 + 200)
}));

// Mock data for Cost & Waste Analysis
const wasteAnalysis = Array.from({ length: 6 }, (_, index) => ({
    month: ['Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep'][index],
    foodCost: Math.floor(Math.random() * 5000 + 15000),
    wastePercentage: Number((Math.random() * 8 + 2).toFixed(1))
}));

// Staff Efficiency Score calculation
const staffEfficiency = {
    score: 87,
    total: 100,
    trend: '+2.5%'
};

const PerformanceTrends: React.FC = () => {
    const handleExportPDF = () => {
        // PDF export logic would go here
        console.log('Exporting to PDF...');
    };

    return (
        <Box sx={{ padding: 3 }}>
            <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
                    Performance & Trends
                </Typography>
                <Button
                    variant="outlined"
                    startIcon={<FileDownloadIcon />}
                    onClick={handleExportPDF}
                >
                    Export to PDF
                </Button>
            </Box>

            <Grid container spacing={3}>
                {/* Staff Efficiency Score */}
                <Grid item xs={12} md={4}>
                    <StyledPaper>
                        <Typography variant="h6" gutterBottom>
                            Staff Efficiency Score
                        </Typography>
                        <Box sx={{ 
                            display: 'flex', 
                            flexDirection: 'column', 
                            alignItems: 'center',
                            mt: 2
                        }}>
                            <Typography variant="h2" sx={{ color: teal[500] }}>
                                {staffEfficiency.score}%
                            </Typography>
                            <Typography 
                                variant="subtitle1" 
                                sx={{ 
                                    color: staffEfficiency.trend.startsWith('+') ? 'success.main' : 'error.main',
                                    mt: 1
                                }}
                            >
                                {staffEfficiency.trend} vs last month
                            </Typography>
                        </Box>
                    </StyledPaper>
                </Grid>

                {/* Wait Time Trends */}
                <Grid item xs={12} md={8}>
                    <StyledPaper>
                        <Typography variant="h6" gutterBottom>
                            Average Wait Time Trends
                        </Typography>
                        <ResponsiveContainer width="100%" height={300}>
                            <LineChart data={waitTimeTrends}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="date" />
                                <YAxis />
                                <Tooltip />
                                <Legend />
                                <Line 
                                    type="monotone" 
                                    dataKey="avgWaitTime" 
                                    stroke={blue[500]} 
                                    name="Average Wait Time"
                                />
                                <Line 
                                    type="monotone" 
                                    dataKey="targetTime" 
                                    stroke={orange[500]} 
                                    strokeDasharray="5 5" 
                                    name="Target Time"
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </StyledPaper>
                </Grid>

                {/* Historical Order Patterns */}
                <Grid item xs={12}>
                    <StyledPaper>
                        <Typography variant="h6" gutterBottom>
                            Historical Order Patterns
                        </Typography>
                        <Box sx={{ height: 400, width: '100%', overflowX: 'auto' }}>
                            <Box sx={{ minWidth: 900 }}>
                                {/* Header row with hours */}
                                <Box sx={{ display: 'flex', borderBottom: '1px solid #e0e0e0', mb: 1 }}>
                                    <Box sx={{ width: 100 }} /> {/* Empty corner cell */}
                                    {Array.from({ length: 13 }, (_, i) => i + 10).map((hour) => (
                                        <Box
                                            key={hour}
                                            sx={{
                                                width: 60,
                                                p: 1,
                                                textAlign: 'center',
                                                fontWeight: 'medium',
                                                color: hour >= 11 && hour <= 14 ? 'primary.main' : 'inherit' // Highlight lunch hours
                                            }}
                                        >
                                            {String(hour).padStart(2, '0')}:00
                                        </Box>
                                    ))}
                                </Box>
                                
                                {/* Data rows */}
                                {heatmapData.map((row, rowIndex) => (
                                    <Box key={row.day} sx={{ display: 'flex', mb: 1 }}>
                                        <Box sx={{ 
                                            width: 100, 
                                            p: 1, 
                                            fontWeight: 'medium',
                                            display: 'flex',
                                            alignItems: 'center'
                                        }}>
                                            {row.day}
                                        </Box>
                                        {Array.from({ length: 13 }, (_, i) => i + 10).map((hour) => {
                                            const value = row[hour + 'h'] as number;
                                            const isPeakHour = hour >= 11 && hour <= 14;
                                            const intensity = (value - 10) / 40; // Normalize between 0 and 1
                                            return (
                                                <Box
                                                    key={hour}
                                                    sx={{
                                                        width: 60,
                                                        height: 40,
                                                        bgcolor: isPeakHour 
                                                            ? `rgba(25, 118, 210, ${intensity})`
                                                            : `rgba(144, 202, 249, ${intensity})`,
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        color: intensity > 0.5 ? 'white' : 'black',
                                                        border: '1px solid #fff',
                                                        position: 'relative'
                                                    }}
                                                >
                                                    {value}
                                                </Box>
                                            );
                                        })}
                                    </Box>
                                ))}

                                {/* Legend */}
                                <Box sx={{ mt: 2, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <Box sx={{ width: 20, height: 20, bgcolor: 'rgba(25, 118, 210, 0.1)' }} />
                                        <Typography variant="caption">Low Traffic</Typography>
                                    </Box>
                                    <Box sx={{ mx: 2 }}>→</Box>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <Box sx={{ width: 20, height: 20, bgcolor: 'rgba(25, 118, 210, 1)' }} />
                                        <Typography variant="caption">High Traffic</Typography>
                                    </Box>
                                </Box>
                            </Box>
                        </Box>
                    </StyledPaper>
                </Grid>

                {/* Inventory Usage Trends */}
                <Grid item xs={12} md={6}>
                    <StyledPaper>
                        <Typography variant="h6" gutterBottom>
                            Inventory Usage Trends
                        </Typography>
                        <ResponsiveContainer width="100%" height={300}>
                            <LineChart data={inventoryTrends}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="date" />
                                <YAxis />
                                <Tooltip />
                                <Legend />
                                <Line 
                                    type="monotone" 
                                    dataKey="stock" 
                                    stroke={blue[500]} 
                                    name="Stock Level"
                                />
                                <Line 
                                    type="monotone" 
                                    dataKey="usage" 
                                    stroke={orange[500]} 
                                    name="Usage"
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </StyledPaper>
                </Grid>

                {/* Cost & Waste Analysis */}
                <Grid item xs={12} md={6}>
                    <StyledPaper>
                        <Typography variant="h6" gutterBottom>
                            Cost & Waste Analysis
                        </Typography>
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={wasteAnalysis}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="month" />
                                <YAxis yAxisId="left" orientation="left" stroke={blue[500]} />
                                <YAxis yAxisId="right" orientation="right" stroke={red[500]} />
                                <Tooltip />
                                <Legend />
                                <Bar
                                    yAxisId="left"
                                    dataKey="foodCost"
                                    name="Food Cost (RM)"
                                    fill={blue[500]}
                                    activeBar={<Rectangle fill={blue[700]} stroke={blue[700]} />}
                                />
                                <Bar
                                    yAxisId="right"
                                    dataKey="wastePercentage"
                                    name="Waste %"
                                    fill={red[500]}
                                    activeBar={<Rectangle fill={red[700]} stroke={red[700]} />}
                                />
                            </BarChart>
                        </ResponsiveContainer>
                    </StyledPaper>
                </Grid>
            </Grid>
        </Box>
    );
};

export default PerformanceTrends;