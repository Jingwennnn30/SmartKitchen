import React from 'react';
import type { FC } from 'react';
import {
    Box,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    IconButton,
    Typography,
    LinearProgress
} from '@mui/material';
import CameraAltIcon from '@mui/icons-material/CameraAlt';

interface InventoryTableProps {
    searchQuery: string;
}

interface InventoryItem {
    id: number;
    name: string;
    category: string;
    quantity: number;
    unit: string;
    minRequired: number;
    expiryDate: string;
    stockLevel: number;
}

const mockData: InventoryItem[] = [
    {
        id: 1,
        name: 'Tomatoes',
        category: 'Vegetables',
        quantity: 25,
        unit: 'kg',
        minRequired: 20,
        expiryDate: '2024-02-10',
        stockLevel: 75
    },
    {
        id: 2,
        name: 'Chicken Breast',
        category: 'Meat',
        quantity: 15,
        unit: 'kg',
        minRequired: 30,
        expiryDate: '2024-02-05',
        stockLevel: 45
    },
];

const getStockLevelColor = (level: number) => {
    if (level >= 75) return '#4CAF50';
    if (level >= 50) return '#FFA500';
    return '#FF4B4B';
};

const InventoryTable: React.FC<InventoryTableProps> = ({ searchQuery }) => {
    const handleImageUpload = () => {
        // TODO: Implement image upload functionality
        console.log('Image upload clicked');
    };

    return (
        <Box>
            <Typography variant="h6" gutterBottom>
                Current Inventory
            </Typography>
            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Item</TableCell>
                            <TableCell>Category</TableCell>
                            <TableCell align="right">Quantity</TableCell>
                            <TableCell align="right">Min Required</TableCell>
                            <TableCell align="right">Expiry Date</TableCell>
                            <TableCell align="right">Stock Level</TableCell>
                            <TableCell align="right">Image</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {mockData
                            .filter(row => 
                                row.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                                row.category.toLowerCase().includes(searchQuery.toLowerCase())
                            )
                            .map((row) => (
                            <TableRow key={row.id}>
                                <TableCell component="th" scope="row">
                                    {row.name}
                                </TableCell>
                                <TableCell>{row.category}</TableCell>
                                <TableCell align="right">
                                    {row.quantity} {row.unit}
                                </TableCell>
                                <TableCell align="right">
                                    {row.minRequired} {row.unit}
                                </TableCell>
                                <TableCell align="right">{row.expiryDate}</TableCell>
                                <TableCell>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <LinearProgress
                                            variant="determinate"
                                            value={row.stockLevel}
                                            sx={{
                                                width: '100%',
                                                height: 10,
                                                borderRadius: 5,
                                                backgroundColor: '#e0e0e0',
                                                '& .MuiLinearProgress-bar': {
                                                    backgroundColor: getStockLevelColor(row.stockLevel),
                                                    borderRadius: 5,
                                                }
                                            }}
                                        />
                                        <Typography variant="body2">
                                            {row.stockLevel}%
                                        </Typography>
                                    </Box>
                                </TableCell>
                                <TableCell align="right">
                                    <IconButton 
                                        onClick={handleImageUpload}
                                        size="small"
                                    >
                                        <CameraAltIcon />
                                    </IconButton>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
        </Box>
    );
};

export default InventoryTable;