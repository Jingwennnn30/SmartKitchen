import React, { useState } from 'react';
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
} from '@mui/material';
import { styled } from '@mui/material/styles';
import SearchIcon from '@mui/icons-material/Search';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import PendingIcon from '@mui/icons-material/Pending';
import AccessTimeIcon from '@mui/icons-material/AccessTime';

interface PreparationItem {
    menu: string;
    ingredients: string[];
    prepTime: string;
    status: 'completed' | 'pending' | 'urgent';
    quantity: number;
}

const mockData: PreparationItem[] = [
    {
        menu: "Beef Burger",
        ingredients: ["Beef Patty", "Lettuce", "Tomato", "Onions", "Cheese"],
        prepTime: "Before 11:30 AM",
        status: 'completed',
        quantity: 25
    },
    {
        menu: "Grilled Chicken Salad",
        ingredients: ["Chicken Breast", "Mixed Greens", "Cherry Tomatoes", "Balsamic"],
        prepTime: "Before 11:45 AM",
        status: 'pending',
        quantity: 15
    },
    {
        menu: "Fish & Chips",
        ingredients: ["Cod Fillet", "Potatoes", "Tartar Sauce"],
        prepTime: "Before 12:00 PM",
        status: 'urgent',
        quantity: 20
    },
    {
        menu: "Pasta Carbonara",
        ingredients: ["Spaghetti", "Bacon", "Eggs", "Parmesan"],
        prepTime: "Before 12:15 PM",
        status: 'pending',
        quantity: 18
    },
];

const StyledPaper = styled(Paper)(({ theme }) => ({
    padding: theme.spacing(3),
    borderRadius: '10px',
    boxShadow: '0px 2px 6px rgba(0, 0, 0, 0.1)'
}));

const getStatusColor = (status: PreparationItem['status']) => {
    switch (status) {
        case 'completed':
            return '#4CAF50';
        case 'urgent':
            return '#f44336';
        default:
            return '#FFA726';
    }
};

const getStatusIcon = (status: PreparationItem['status']) => {
    switch (status) {
        case 'completed':
            return <CheckCircleIcon sx={{ color: '#4CAF50' }} />;
        case 'urgent':
            return <AccessTimeIcon sx={{ color: '#f44336' }} />;
        default:
            return <PendingIcon sx={{ color: '#FFA726' }} />;
    }
};

const PreDiningPreparation: React.FC = () => {
    const [searchQuery, setSearchQuery] = useState('');

    const filteredData = mockData.filter(item =>
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
                                        <IconButton size="small">
                                            {getStatusIcon(item.status)}
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