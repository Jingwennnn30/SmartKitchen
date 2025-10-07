import React, { useEffect, useState } from 'react';
import {
    Box, Table, TableBody, TableCell, TableContainer,
    TableHead, TableRow, Paper, Typography, Button, TextField, Chip, Skeleton,
    Dialog, DialogTitle, DialogContent, DialogActions, CircularProgress
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { fetchRestockPrediction, RestockItem } from '../../services/restockPredictionService';

interface Item {
    id: number;
    name: string;
    currentStock: number;
    suggestedOrder: number;
    orderDate: string;
    urgency: 'high' | 'medium' | 'low';
}

const getUrgency = (restockNeeded: number): Item['urgency'] => {
    if (restockNeeded > 500) return 'high';
    if (restockNeeded > 200) return 'medium';
    return 'low';
};

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
    const [rows, setRows] = useState<Item[]>([]);
    const [quantities, setQuantities] = useState<{ [key: number]: number }>({});
    const [openDialog, setOpenDialog] = useState(false);
    const [selectedItem, setSelectedItem] = useState<Item | null>(null);
    const [orderAmount, setOrderAmount] = useState<string>('');
    const [loading, setLoading] = useState(false);
    const [tableLoading, setTableLoading] = useState(true);

    const API_URL = "https://k5j3bc2p73.execute-api.us-east-1.amazonaws.com/dev/order";

    const handleSubmitOrder = (item: Item) => {
        console.log(`Opening order dialog for ${item.name}`);
        setSelectedItem(item);
        const currentQuantity = quantities[item.id] || item.suggestedOrder;
        setOrderAmount(String(currentQuantity));
        setOpenDialog(true);
    };

    const handleCloseDialog = () => {
        setOpenDialog(false);
        setSelectedItem(null);
        setOrderAmount('');
        setLoading(false);
    };

    const placeOrder = async () => {
        if (!selectedItem) return;

        setLoading(true);
        try {
            const res = await fetch(API_URL, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    item: selectedItem.name,
                    amount: Number(orderAmount)
                })
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Request failed");

            alert(data.message || `Order placed: ${orderAmount} units of ${selectedItem.name}`);

            // Clear the quantity after successful submission
            setQuantities(prev => ({
                ...prev,
                [selectedItem.id]: 0
            }));

            handleCloseDialog();
        } catch (err) {
            console.error(err);
            alert("Error: " + (err as Error).message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        async function loadData() {
            setTableLoading(true);
            try {
                const data = await fetchRestockPrediction();
                const mapped: Item[] = data.restock.map((r: RestockItem, index: number) => ({
                    id: index + 1,
                    name: `${r.ingredient} (${r.unit})`,
                    currentStock: r.stockquantity,
                    suggestedOrder: r.restock_needed,
                    orderDate: data.date,
                    urgency: getUrgency(r.restock_needed),
                }));
                setRows(mapped);
            } catch (err) {
                console.error(err);
            } finally {
                setTableLoading(false);
            }
        }
        loadData();
    }, []);

    return (
        <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h6">
                    Predicted Restock
                </Typography>
            </Box>

            <TableContainer component={Paper} sx={{ borderRadius: 2, '& .MuiTableCell-root': { py: 2, px: 3 } }}>
                <Table sx={{ minWidth: 1200, tableLayout: 'fixed', '& th, & td': { whiteSpace: 'nowrap' } }}>
                    <TableHead>
                        <TableRow>
                            <TableCell sx={{ width: '12%', fontWeight: 600 }}>Item</TableCell>
                            <TableCell sx={{ width: '10%', fontWeight: 600 }} align="center">Current Stock</TableCell>
                            <TableCell sx={{ width: '12%', fontWeight: 600 }} align="center">Suggested Quantity</TableCell>
                            <TableCell sx={{ width: '12%', fontWeight: 600 }} align="center">Order Date</TableCell>
                            <TableCell sx={{ width: '10%', fontWeight: 600 }} align="center">Urgency</TableCell>
                            <TableCell sx={{ width: '28%', fontWeight: 600 }} align="center">Order Quantity</TableCell>
                            <TableCell sx={{ width: '16%', fontWeight: 600 }} align="center">Action</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {tableLoading ? (
                            // Skeleton rows
                            Array.from({ length: 7 }).map((_, i) => (
                                <TableRow key={i}>
                                    <TableCell><Skeleton width={140} /></TableCell>
                                    <TableCell><Skeleton width={80} /></TableCell>
                                    <TableCell><Skeleton width={100} /></TableCell>
                                    <TableCell><Skeleton width={100} /></TableCell>
                                    <TableCell><Skeleton width={60} /></TableCell>
                                    <TableCell>
                                        <Skeleton width={180} height={35} />
                                    </TableCell>
                                    <TableCell>
                                        <Skeleton width={140} height={35} />
                                    </TableCell>
                                </TableRow>
                            ))
                        ) : rows.length > 0 ? (
                            rows.map((row) => (
                                <TableRow
                                    key={row.id}
                                    sx={{
                                        borderLeft: 3,
                                        borderLeftColor: getUrgencyColor(row.urgency),
                                        '&:hover': { backgroundColor: 'rgba(0, 0, 0, 0.04)' }
                                    }}
                                >
                                    <TableCell sx={{ fontWeight: 500 }}>{row.name}</TableCell>
                                    <TableCell align="center">{row.currentStock}</TableCell>
                                    <TableCell align="center">{row.suggestedOrder}</TableCell>
                                    <TableCell align="center">{row.orderDate}</TableCell>
                                    <TableCell align="center">
                                        <Chip
                                            label={row.urgency.toUpperCase()}
                                            size="small"
                                            sx={{
                                                bgcolor: `${getUrgencyColor(row.urgency)}15`,
                                                color: getUrgencyColor(row.urgency),
                                                fontWeight: 'medium',
                                                fontSize: '0.75rem',
                                                minWidth: '70px'
                                            }}
                                        />
                                    </TableCell>
                                    <TableCell align="center">
                                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
                                            <TextField
                                                size="small"
                                                type="number"
                                                value={quantities[row.id] || ''}
                                                onChange={(e) =>
                                                    setQuantities((prev) => ({
                                                        ...prev,
                                                        [row.id]: Number(e.target.value)
                                                    }))
                                                }
                                                sx={{ width: '80px' }}
                                                InputProps={{ inputProps: { min: 0 } }}
                                            />
                                            <Button
                                                size="small"
                                                variant="outlined"
                                                onClick={() =>
                                                    setQuantities((prev) => ({
                                                        ...prev,
                                                        [row.id]: row.suggestedOrder
                                                    }))
                                                }
                                                sx={{ whiteSpace: 'nowrap' }}
                                            >
                                                Use Suggested
                                            </Button>
                                        </Box>
                                    </TableCell>
                                    <TableCell align="center">
                                        <Button
                                            variant="contained"
                                            size="small"
                                            startIcon={<AddIcon />}
                                            onClick={() => handleSubmitOrder(row)}
                                            sx={{
                                                whiteSpace: 'nowrap',
                                                backgroundColor: '#1976d2',
                                                '&:hover': {
                                                    backgroundColor: '#1565c0'
                                                }
                                            }}
                                        >
                                            Submit Order
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={7} align="center">
                                    <Typography variant="body2" color="text.secondary" py={3}>
                                        No predicted restock items found.
                                    </Typography>
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </TableContainer>

            {/* Order Confirmation Dialog */}
            <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
                <DialogTitle>
                    Place Order for {selectedItem?.name}
                </DialogTitle>
                <DialogContent>
                    <Box sx={{ mt: 2 }}>
                        <Typography variant="body1" sx={{ mb: 2 }}>
                            Current Stock: {selectedItem?.currentStock} units
                        </Typography>
                        <Typography variant="body1" sx={{ mb: 2 }}>
                            Suggested Quantity: {selectedItem?.suggestedOrder} units
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                            Order Date: {selectedItem?.orderDate}
                        </Typography>
                        <TextField
                            label="Order Amount (units)"
                            type="number"
                            value={orderAmount}
                            onChange={(e) => {
                                const value = e.target.value;
                                if (value === '' || /^\d+$/.test(value)) {
                                    setOrderAmount(value);
                                }
                            }}
                            onFocus={(e) => e.target.select()}
                            inputProps={{ min: 1, step: 1 }}
                            fullWidth
                            required
                            helperText="Suggested amount based on usage patterns and current stock level"
                        />
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseDialog} disabled={loading}>
                        Cancel
                    </Button>
                    <Button
                        onClick={placeOrder}
                        variant="contained"
                        color="primary"
                        disabled={loading || orderAmount === '' || Number(orderAmount) < 1}
                        startIcon={loading ? <CircularProgress size={20} /> : null}
                    >
                        {loading ? "Placing Order..." : "Confirm Order"}
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default PredictedRestockTable;
