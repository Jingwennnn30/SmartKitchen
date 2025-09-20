import React from 'react';
import { Box, Typography, Paper } from '@mui/material';
import Grid from '@mui/material/Grid';
import { styled } from '@mui/material/styles';
import { useNavigate } from 'react-router-dom';
import KPICard from './KPICard';
import InventoryTable from './InventoryTable';
import StockUsageChart from './StockUsageChart';
import FoodWasteChart from './FoodWasteChart';
import BusinessHourChart from './BusinessHourChart';
import RestockPredictionChart from './RestockPredictionChart';
import LowStock from './LowStock';
import FreezerMonitoring from './FreezerMonitoring';

// Styled components
const DashboardContainer = styled(Box)({
    width: '100%'
});

const StyledPaper = styled(Paper)(({ theme }) => ({
    padding: theme.spacing(2),
    height: '100%',
    borderRadius: '10px',
    boxShadow: '0px 2px 6px rgba(0, 0, 0, 0.1)',
    backgroundColor: '#ffffff',
    transition: 'transform 0.2s, box-shadow 0.2s',
    '&:hover': {
        transform: 'translateY(-2px)',
        boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.15)'
    }
}));

const Dashboard = () => {
    const navigate = useNavigate();

    const handleGridClick = (path: string) => {
        navigate(path);
    };
    return (
        <DashboardContainer>
            <Box sx={{ mb: 4 }}>
                <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
                    Dashboard
                </Typography>
            </Box>
            <Grid container spacing={3}>
                {/* KPI Cards */}
                {[
                    {
                        title: "Total Stock Value",
                        value: "RM 12,948",
                        icon: "💰",
                        valueColor: "#1976d2",
                        bg: "#e3f2fd",
                        path: "/inventory"
                    },
                    {
                        title: "Expiring Soon",
                        value: "15 items",
                        subtitle: "within 3 days",
                        icon: "⏰",
                        valueColor: "#d32f2f",
                        bg: "#ffebee",
                        path: "/inventory"
                    },
                    {
                        title: "Average Waiting Time",
                        value: "25 mins",
                        icon: "⏳",
                        valueColor: "#fbc02d",
                        bg: "#fffde7",
                        trend: "up",
                        path: "/order-management"
                    },
                    {
                        title: "Waste This Week",
                        value: "2.3 kg",
                        icon: "♻️",
                        valueColor: "#388e3c",
                        bg: "#e8f5e9",
                        trend: "down",
                        path: "/performance"
                    }
                ].map((kpi, idx) => (
                    <Grid item xs={12} sm={6} md={3} key={kpi.title} 
                        onClick={() => handleGridClick(kpi.path || '/')} 
                        style={{ cursor: 'pointer' }}
                    >
                        <Paper
                            elevation={3}
                            sx={{
                                p: 2,
                                borderRadius: 3,
                                background: kpi.bg,
                                display: 'flex',
                                flexDirection: 'row',
                                alignItems: 'center',
                                minHeight: 120,
                                boxShadow: '0 2px 8px rgba(0,0,0,0.07)'
                            }}
                        >
                            <Box
                                sx={{
                                    fontSize: 40,
                                    color: kpi.valueColor,
                                    mr: 2,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    minWidth: 48
                                }}
                            >
                                {kpi.icon}
                            </Box>
                            <Box sx={{ flex: 1 }}>
                                <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 0.5 }}>
                                    {kpi.title}
                                </Typography>
                                <Typography
                                    variant="h5"
                                    sx={{
                                        fontWeight: 700,
                                        color: kpi.valueColor,
                                        mb: kpi.subtitle ? 0.5 : 0
                                    }}
                                >
                                    {kpi.value}
                                    {kpi.trend === "up" && (
                                        <Box component="span" sx={{ color: "#fbc02d", ml: 1, fontSize: 20 }}>▲</Box>
                                    )}
                                    {kpi.trend === "down" && (
                                        <Box component="span" sx={{ color: "#388e3c", ml: 1, fontSize: 20 }}>▼</Box>
                                    )}
                                </Typography>
                                {kpi.subtitle && (
                                    <Typography variant="caption" color="text.secondary">
                                        {kpi.subtitle}
                                    </Typography>
                                )}
                            </Box>
                        </Paper>
                    </Grid>
                ))}

                {/* Low Stock Alerts and Freezer Monitoring */}
                <Grid item xs={12} md={6} onClick={() => handleGridClick('/inventory')} style={{ cursor: 'pointer' }}>
                    <StyledPaper sx={{ height: '320px', overflow: 'auto' }}>
                        <Typography variant="h6" gutterBottom>
                            Low Stock Alerts
                        </Typography>
                        <LowStock />
                    </StyledPaper>
                </Grid>

                <Grid item xs={12} md={6}>
                    <StyledPaper sx={{ height: '320px', overflow: 'auto' }}>
                        <FreezerMonitoring />
                    </StyledPaper>
                </Grid>

                {/* Charts */}
                <Grid item xs={12} md={6} onClick={() => handleGridClick('/inventory')} style={{ cursor: 'pointer' }}>
                    <StyledPaper>
                        <StockUsageChart />
                    </StyledPaper>
                </Grid>
                <Grid item xs={12} md={6} onClick={() => handleGridClick('/inventory')} style={{ cursor: 'pointer' }}>
                    <StyledPaper>
                        <RestockPredictionChart />
                    </StyledPaper>
                </Grid>
                <Grid item xs={12} md={6} onClick={() => handleGridClick('/performance')} style={{ cursor: 'pointer' }}>
                    <StyledPaper>
                        <FoodWasteChart />
                    </StyledPaper>
                </Grid>
                <Grid item xs={12} md={6} onClick={() => handleGridClick('/performance')} style={{ cursor: 'pointer' }}>
                    <StyledPaper>
                        <BusinessHourChart />
                    </StyledPaper>
                </Grid>

                {/* Inventory Table */}
                <Grid item xs={12} onClick={() => handleGridClick('/inventory')} style={{ cursor: 'pointer' }}>
                    <StyledPaper>
                        <InventoryTable />
                    </StyledPaper>
                </Grid>

            </Grid>
        </DashboardContainer>
    );
};

export default Dashboard;