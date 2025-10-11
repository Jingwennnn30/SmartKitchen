import React, { useState } from 'react';
import {
    Box,
    Typography,
    Paper,
    Select,
    MenuItem,
    FormControl,
    InputLabel,
    SelectChangeEvent,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import InventoryTable from './InventoryTable';
import StockLevelChart from './StockLevelChart';
import SeasonalityIndicators from './SeasonalityIndicators';
import PredictedRestockTable from './PredictedRestockTable';
import SeasoningItemTable from './SeasoningItemTable';

const StyledPaper = styled(Paper)(({ theme }) => ({
    padding: theme.spacing(3),
    borderRadius: '10px',
    boxShadow: '0px 2px 6px rgba(0, 0, 0, 0.1)',
    height: '100%',
    width: '100%',
    maxWidth: '100%',
    boxSizing: 'border-box',
    overflow: 'hidden',
    minWidth: 0
}));

const PageTitle = styled(Typography)(({ theme }) => ({
    fontWeight: 'bold'
}));

const categories = ['All', 'Meat', 'Vegetables', 'Dairy', 'Condiments'];

const InventoryPage = () => {
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [searchQuery, setSearchQuery] = useState('');

    const handleCategoryChange = (event: SelectChangeEvent) => {
        setSelectedCategory(event.target.value);
    };

    return (
        <Box sx={{ 
            padding: { xs: 1, sm: 2, md: 3 }, 
            maxWidth: 'calc(100vw - 240px)', 
            width: '100%',
            overflowX: 'hidden',
            boxSizing: 'border-box',
            minWidth: 0
        }}>
            {/* Header with Seasonality Indicators */}
            <Box sx={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: { xs: 'flex-start', md: 'center' },
                flexDirection: { xs: 'column', md: 'row' },
                gap: { xs: 2, md: 0 },
                mb: 4,
                width: '100%',
                minWidth: 0
            }}>
                <Box sx={{ width: '100%', maxWidth: { xs: '100%', md: 'auto' }, minWidth: 0 }}>
                    <PageTitle variant="h5" gutterBottom>Inventory</PageTitle>
                    <Typography variant="body2" color="text.secondary">
                        Manage your stock levels and inventory overview
                    </Typography>
                </Box>
                <Box sx={{ flexShrink: 0 }}>
                    <SeasonalityIndicators />
                </Box>
            </Box>

            {/* Stock Level Chart */}
            <StyledPaper sx={{ mb: 3 }}>
                <Box sx={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: { xs: 'flex-start', sm: 'center' },
                    flexDirection: { xs: 'column', sm: 'row' },
                    gap: { xs: 2, sm: 0 },
                    mb: 2 
                }}>
                    <Typography variant="h6">Stock Levels</Typography>
                </Box>
                <Box sx={{ height: 300, width: '100%', maxWidth: '100%', overflow: 'hidden' }}>
                    <StockLevelChart />
                </Box>
                <Typography variant="caption" color="text.secondary">
                    (Current stock vs safe minimum)
                </Typography>
            </StyledPaper>

            {/* Predicted Restock Order */}
            <StyledPaper sx={{ mb: 3 }}>
                <PredictedRestockTable />
            </StyledPaper>

            {/* Seasoning Item Order */}
            <StyledPaper sx={{ mb: 3 }}>
                <SeasoningItemTable />
            </StyledPaper>

            {/* Current Stock */}
            <StyledPaper sx={{ overflow: 'visible' }}>
                <InventoryTable searchQuery={searchQuery} />
            </StyledPaper>
        </Box>
    );
};

export default InventoryPage;