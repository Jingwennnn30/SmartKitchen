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
    Typography
} from '@mui/material';

interface Item {
    id: number;
    name: string;
    currentStock: number;
    suggestedOrder: number;
    orderDate: string;
    urgency: 'high' | 'medium' | 'low';
}

const mockData: Item[] = [
    {
        id: 1,
        name: 'Tomatoes',
        currentStock: 15,
        suggestedOrder: 30,
        orderDate: '2024-02-01',
        urgency: 'high'
    },
    {
        id: 2,
        name: 'Lettuce',
        currentStock: 25,
        suggestedOrder: 20,
        orderDate: '2024-02-03',
        urgency: 'medium'
    },
    {
        id: 3,
        name: 'Carrots',
        currentStock: 40,
        suggestedOrder: 15,
        orderDate: '2024-02-05',
        urgency: 'low'
    }
];

const getUrgencyColor = (urgency: Item['urgency']) => {
    switch (urgency) {
        case 'high':
            return '#FF4B4B';
        case 'medium':
            return '#FFA500';
        case 'low':
            return '#4CAF50';
        default:
            return '#000000';
    }
};

const PredictedRestockTable: React.FC = () => {
    return (
        <Box>
            <Typography variant="h6" gutterBottom>
                Predicted Restock Order
            </Typography>
            <TableContainer component={Paper}>
                <Table size="small">
                    <TableHead>
                        <TableRow>
                            <TableCell>Item</TableCell>
                            <TableCell align="right">Current Stock</TableCell>
                            <TableCell align="right">Suggested Order</TableCell>
                            <TableCell align="right">Order Date</TableCell>
                            <TableCell align="right">Urgency</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {mockData.map((row) => (
                            <TableRow key={row.id}>
                                <TableCell component="th" scope="row">
                                    {row.name}
                                </TableCell>
                                <TableCell align="right">{row.currentStock}</TableCell>
                                <TableCell align="right">{row.suggestedOrder}</TableCell>
                                <TableCell align="right">{row.orderDate}</TableCell>
                                <TableCell 
                                    align="right"
                                    sx={{ 
                                        color: getUrgencyColor(row.urgency),
                                        fontWeight: 'bold'
                                    }}
                                >
                                    {row.urgency.toUpperCase()}
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
        </Box>
    );
};

export default PredictedRestockTable;