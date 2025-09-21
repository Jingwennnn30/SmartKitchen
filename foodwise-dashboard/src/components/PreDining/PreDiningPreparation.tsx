import React, { useState, useEffect } from 'react';
import {
    Box,
    Typography,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    IconButton,
    Chip,
    TextField,
    InputAdornment,
    Select,
    MenuItem,
    FormControl,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import SearchIcon from '@mui/icons-material/Search';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import PendingIcon from '@mui/icons-material/Pending';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import { ForecastResponse, getForecastData } from '../../services/prediningPreparationService';

interface PreparationItem {
  menu: string;
  ingredients: string[];
  prepTime: string;
  quantity: number;
  action?: 'completed' | 'preparing' | 'not-started' | null;
}

const StyledPaper = styled(Paper)(({ theme }) => ({
    padding: theme.spacing(3),
    borderRadius: '10px',
    boxShadow: '0px 2px 6px rgba(0, 0, 0, 0.1)'
}));

const ActionChip = styled(Chip)<{ actionType: string }>(({ actionType }) => ({
    fontSize: '11px',
    fontWeight: 'bold',
    height: '20px',
    textTransform: 'uppercase',
    backgroundColor: 
        actionType === 'completed' ? '#e8f5e9' : 
        actionType === 'preparing' ? '#ffebee' : 
        actionType === 'not-started' ? '#fff3e0' : 
        '#f5f5f5',
    color: 
        actionType === 'completed' ? '#2e7d32' : 
        actionType === 'preparing' ? '#d32f2f' : 
        actionType === 'not-started' ? '#f57c00' : 
        '#666',
    border: '1px solid',
    borderColor: 
        actionType === 'completed' ? '#c8e6c9' : 
        actionType === 'preparing' ? '#ffcdd2' : 
        actionType === 'not-started' ? '#ffcc02' : 
        '#e0e0e0',
}));

const StyledSelect = styled(Select)(() => ({
    '& .MuiOutlinedInput-root': {
        backgroundColor: '#ffffff',
        borderRadius: '6px',
        '&:hover': {
            backgroundColor: '#f9f9f9',
        }
    },
    '& .MuiSelect-select': {
        padding: '8px 12px',
        fontSize: '14px',
    }
}));

const getStatusIcon = (action: PreparationItem['action']) => {
    switch (action) {
        case 'completed':
            return <CheckCircleIcon sx={{ color: '#4CAF50' }} />;
        case 'preparing':
            return <AccessTimeIcon sx={{ color: '#f44336' }} />;
        case 'not-started':
        default:
            return <PendingIcon sx={{ color: '#FFA726' }} />;
    }
};

const getActionLabel = (action: PreparationItem['action']) => {
    switch (action) {
        case 'completed':
            return 'Completed';
        case 'preparing':
            return 'Preparing';
        case 'not-started':
        default:
            return 'Not Started';
    }
};

const PreDiningPreparation: React.FC = () => {
    const [searchQuery, setSearchQuery] = useState('');
    const [items, setItems] = useState<PreparationItem[]>([]);
    const [editingIndex, setEditingIndex] = useState<number | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const forecast: ForecastResponse = await getForecastData();
                console.log("Forecast data:", forecast);
                const mappedItems: PreparationItem[] = forecast.top_dishes.map((dish) => ({
                    menu: dish.dishName,
                    ingredients: dish.ingredients,
                    prepTime: "Before Lunch Peak",
                    quantity: dish.forecast_sales,
                    action: 'not-started'
                }));
                setItems(mappedItems);
            } catch (err) {
                console.error("Error fetching forecast:", err);
            }
        };
        fetchData();
    }, []);

    const handleActionChange = (filteredIndex: number, action: PreparationItem['action']) => {
        const filteredData = items.filter(item =>
            item.menu.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.ingredients.some(ing => ing.toLowerCase().includes(searchQuery.toLowerCase()))
        );
        
        const actualItem = filteredData[filteredIndex];
        const actualIndex = items.findIndex(item => item.menu === actualItem.menu);
        
        const updatedItems = [...items];
        updatedItems[actualIndex].action = action;
        setItems(updatedItems);
        setEditingIndex(null);
    };

    const filteredData = items.filter(item =>
        item.menu.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.ingredients.some(ing => ing.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    return (
        <Box sx={{ padding: 3 }}>
            <Box sx={{ mb: 4 }}>
                <Typography variant="h5" sx={{ fontWeight: 'bold' }} gutterBottom>
                    Pre-dining Preparation
                </Typography>
                <Typography variant="body2" color="text.secondary">
                    Track and manage preparation tasks for upcoming service
                </Typography>
            </Box>

            <StyledPaper>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                    <Box>
                        <Typography variant="h6" gutterBottom>
                            Preparation Tasks
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                            Ensure all items are prepared before their designated times
                        </Typography>
                    </Box>
                    <TextField
                        size="small"
                        placeholder="Search menu or ingredients..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <SearchIcon />
                                </InputAdornment>
                            ),
                        }}
                        sx={{ width: 250 }}
                    />
                </Box>

                <TableContainer>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell>Menu</TableCell>
                                <TableCell>Quantity</TableCell>
                                <TableCell>Ingredients</TableCell>
                                <TableCell>Preparation Time</TableCell>
                                <TableCell align="center">Action</TableCell>
                                <TableCell align="center">Status</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {filteredData.map((item, index) => (
                                <TableRow key={index}>
                                    <TableCell>{item.menu}</TableCell>
                                    <TableCell>{item.quantity}</TableCell>
                                    <TableCell>
                                        <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                                            {item.ingredients.map((ingredient, i) => (
                                                <Chip
                                                    key={i}
                                                    label={ingredient}
                                                    size="small"
                                                    variant="outlined"
                                                />
                                            ))}
                                        </Box>
                                    </TableCell>
                                    <TableCell>{item.prepTime}</TableCell>
                                    <TableCell align="center">
                                        {editingIndex === index ? (
                                            <FormControl size="small" sx={{ minWidth: 120 }}>
                                                <StyledSelect
                                                    value={item.action || 'not-started'}
                                                    onChange={(e) => handleActionChange(index, e.target.value as PreparationItem['action'])}
                                                    onBlur={() => setEditingIndex(null)}
                                                    displayEmpty
                                                    autoFocus
                                                >
                                                    <MenuItem value="not-started">Not Started</MenuItem>
                                                    <MenuItem value="preparing">Preparing</MenuItem>
                                                    <MenuItem value="completed">Completed</MenuItem>
                                                </StyledSelect>
                                            </FormControl>
                                        ) : (
                                            <Box onClick={() => setEditingIndex(index)} sx={{ cursor: 'pointer' }}>
                                                <ActionChip 
                                                    actionType={item.action || 'not-started'}
                                                    label={getActionLabel(item.action) || 'Not Started'}
                                                    size="small"
                                                />
                                            </Box>
                                        )}
                                    </TableCell>
                                    <TableCell align="center">
                                        <IconButton size="small">
                                            {getStatusIcon(item.action)}
                                        </IconButton>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            </StyledPaper>
        </Box>
    );
};

export default PreDiningPreparation;
