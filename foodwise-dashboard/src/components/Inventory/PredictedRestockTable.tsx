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
    Typography,
    Button,
    TextField,
    Chip
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';

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
    const [quantities, setQuantities] = React.useState<{ [key: number]: number }>({});


    return (
        <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>

                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    Predicted Restock
                </Typography>
                <Button
                    variant="contained"
                    color="primary" 
                    startIcon={<AddIcon />}
                    sx={{ ml: 'auto' }}
                >
                    Submit Order
                </Button>
            </Box>
            <TableContainer 
                component={Paper}
                sx={{
                    borderRadius: 2,
                    '& .MuiTableCell-root': {
                        py: 2,
                        px: 2
                    }
                }}
            >
                <Table sx={{ minWidth: 700, '& th, & td': { whiteSpace: 'nowrap' } }}>
                    <TableHead>
                        <TableRow>
                            <TableCell sx={{ width: 180 }}>Item</TableCell>
                            <TableCell sx={{ width: 130 }}>Current Stock</TableCell>
                            <TableCell sx={{ width: 150 }}>Suggested Quantity</TableCell>
                            <TableCell sx={{ width: 150 }}>Order Date</TableCell>
                            <TableCell sx={{ width: 110 }}>Urgency</TableCell>
                            <TableCell sx={{ width: 220 }}>Order Quantity</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {mockData.map((row) => (
                            <TableRow 
                                key={row.id}
                                sx={{ 
                                    borderLeft: 3,
                                    borderLeftColor: getUrgencyColor(row.urgency),
                                    '&:hover': {
                                        backgroundColor: 'rgba(0, 0, 0, 0.04)'
                                    }
                                }}
                            >
                                <TableCell sx={{ fontWeight: 500 }}>{row.name}</TableCell>
                                <TableCell>{row.currentStock}</TableCell>
                                <TableCell>
                                    <Typography>{row.suggestedOrder}</Typography>
                                </TableCell>
                                <TableCell>{row.orderDate}</TableCell>
                                <TableCell>
                                    <Chip
                                        label={row.urgency.toUpperCase()}
                                        size="small"
                                        sx={{
                                            bgcolor: `${getUrgencyColor(row.urgency)}15`,
                                            color: getUrgencyColor(row.urgency),
                                            fontWeight: 'medium',
                                            fontSize: '0.75rem'
                                        }}
                                    />
                                </TableCell>
                                <TableCell align="right">
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <TextField
                                            size="small"
                                            type="number"
                                            value={quantities[row.id] || ''}
                                            onChange={(e) => setQuantities(prev => ({
                                                ...prev,
                                                [row.id]: Number(e.target.value)
                                            }))}
                                            sx={{ width: '80px' }}
                                            InputProps={{
                                                inputProps: { min: 0 }
                                            }}
                                        />
                                        <Button
                                            size="small"
                                            variant="outlined"
                                            onClick={() => setQuantities(prev => ({
                                                ...prev,
                                                [row.id]: row.suggestedOrder
                                            }))}
                                            sx={{ whiteSpace: 'nowrap' }}
                                        >
                                            Use Suggested
                                        </Button>
                                    </Box>
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