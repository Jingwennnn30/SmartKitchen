import React, { useState } from 'react';
import {
    Box,
    Typography,
    Paper,
    Grid,
    TextField,
    IconButton,
    Select,
    MenuItem,
    FormControl,
    InputLabel,
    Button,
    SelectChangeEvent,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import CameraAltIcon from '@mui/icons-material/CameraAlt';
import SearchIcon from '@mui/icons-material/Search';
import EditIcon from '@mui/icons-material/Edit';
import InputAdornment from '@mui/material/InputAdornment';
import InventoryTable from './InventoryTable';
import StockLevelChart from './StockLevelChart';
import SeasonalityChart from './SeasonalityChart';
import PredictedRestockTable from './PredictedRestockTable';

const StyledPaper = styled(Paper)(({ theme }) => ({
    padding: theme.spacing(3),
    borderRadius: '10px',
    boxShadow: '0px 2px 6px rgba(0, 0, 0, 0.1)',
    height: '100%'
}));

const PageTitle = styled(Typography)(({ theme }) => ({
    fontWeight: 'bold',
    marginBottom: theme.spacing(3)
}));

const categories = ['All', 'Meat', 'Vegetables', 'Dairy', 'Condiments'];

const InventoryPage = () => {
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [searchQuery, setSearchQuery] = useState('');

    const handleCategoryChange = (event: SelectChangeEvent) => {
        setSelectedCategory(event.target.value);
    };

    const handleImageUpload = () => {
        // Implement image upload functionality
        console.log('Upload image clicked');
    };

    return (
        <Box sx={{ padding: 3 }}>
            <PageTitle variant="h5">Inventory</PageTitle>
            
            {/* Seasonality Awareness */}
            <StyledPaper sx={{ mb: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Typography variant="h6">Seasonality Awareness</Typography>
                </Box>
                <Grid container spacing={3}>
                    <Grid item xs={12} md={4}>
                        <SeasonalityChart type="dayOfWeek" />
                    </Grid>
                    <Grid item xs={12} md={4}>
                        <SeasonalityChart type="weather" />
                    </Grid>
                    <Grid item xs={12} md={4}>
                        <SeasonalityChart type="holiday" />
                    </Grid>
                </Grid>
            </StyledPaper>

            {/* Stock Level Chart */}
            <StyledPaper sx={{ mb: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Typography variant="h6">Stock Levels</Typography>
                    <FormControl size="small" sx={{ width: 150 }}>
                        <InputLabel>Category</InputLabel>
                        <Select
                            value={selectedCategory}
                            label="Category"
                            onChange={handleCategoryChange}
                        >
                            {categories.map((category) => (
                                <MenuItem key={category} value={category}>{category}</MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                </Box>
                <Box sx={{ height: 300 }}>
                    <StockLevelChart category={selectedCategory} />
                </Box>
                <Typography variant="caption" color="text.secondary">
                    (Current stock vs safe minimum)
                </Typography>
            </StyledPaper>

            {/* Predicted Restock Order */}
            <StyledPaper sx={{ mb: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Typography variant="h6">Predicted Restock Order</Typography>
                    <Box>
                        <Button variant="outlined" sx={{ mr: 1 }}>Edit</Button>
                        <Button variant="contained">Order</Button>
                    </Box>
                </Box>
                <PredictedRestockTable />
            </StyledPaper>

            {/* Inventory Overview */}
            <StyledPaper>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Typography variant="h6">Inventory Overview</Typography>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                        <TextField
                            size="small"
                            placeholder="Search inventory..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <SearchIcon />
                                    </InputAdornment>
                                ),
                                endAdornment: (
                                    <InputAdornment position="end">
                                        <IconButton onClick={handleImageUpload}>
                                            <CameraAltIcon />
                                        </IconButton>
                                    </InputAdornment>
                                )
                            }}
                        />
                    </Box>
                </Box>
                <InventoryTable searchQuery={searchQuery} />
            </StyledPaper>
        </Box>
    );
};

export default InventoryPage;