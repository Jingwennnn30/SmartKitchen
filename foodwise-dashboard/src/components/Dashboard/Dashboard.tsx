import React from 'react';
import { Box, Typography, Paper } from '@mui/material';
import Grid from '@mui/material/Grid';
import { styled } from '@mui/material/styles';
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
    backgroundColor: '#ffffff'
}));

const Dashboard = () => {
    return (
        <DashboardContainer>
            <Grid container spacing={3}>
                {/* KPI Cards */}
                <Grid item xs={12} sm={6} md={3}>
                    <KPICard 
                        title="Total Stock Value" 
                        value="RM 12,948"
                    />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <KPICard 
                        title="Expiring Soon" 
                        value="15 items"
                        subtitle="within 3 days"
                        valueColor="#FF0000"
                    />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <KPICard 
                        title="Average Waiting Time" 
                        value="25 mins"
                        valueColor="#FFD700"
                        trend="up"
                    />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <KPICard 
                        title="Waste This Week" 
                        value="2.3 kg"
                        valueColor="#4CAF50"
                        trend="down"
                    />
                </Grid>

                {/* Low Stock Alerts and Freezer Monitoring */}
                <Grid item xs={12} md={6}>
                    <StyledPaper sx={{ height: '400px', overflow: 'auto' }}>
                        <Typography variant="h6" gutterBottom>
                            Low Stock Alerts
                        </Typography>
                        <LowStock />
                    </StyledPaper>
                </Grid>

                <Grid item xs={12} md={6}>
                    <FreezerMonitoring />
                </Grid>

                {/* Inventory Table */}
                <Grid item xs={12}>
                    <StyledPaper>
                        <InventoryTable />
                    </StyledPaper>
                </Grid>

                {/* Charts */}
                <Grid item xs={12} md={6}>
                    <StyledPaper>
                        <StockUsageChart />
                    </StyledPaper>
                </Grid>
                <Grid item xs={12} md={6}>
                    <StyledPaper>
                        <RestockPredictionChart />
                    </StyledPaper>
                </Grid>
                <Grid item xs={12} md={6}>
                    <StyledPaper>
                        <FoodWasteChart />
                    </StyledPaper>
                </Grid>
                <Grid item xs={12} md={6}>
                    <StyledPaper>
                        <BusinessHourChart />
                    </StyledPaper>
                </Grid>
            </Grid>
        </DashboardContainer>
    );
};

export default Dashboard;