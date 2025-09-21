import React, { useEffect, useState } from 'react';
import {
  Box, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Paper, Typography, Button, TextField, Chip,
  Skeleton, CircularProgress,
  Dialog, DialogTitle, DialogContent, DialogActions
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
      try {
        setLoading(true);
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
        setLoading(false);
      }
    }
    loadData();
  }, []);

  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h6" sx={{ fontWeight: 600 }}>
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
            {loading ? (
              // Show 5 skeleton rows while loading
              Array.from(new Array(5)).map((_, i) => (
                <TableRow key={i}>
                  <TableCell><Skeleton variant="text" width={120} /></TableCell>
                  <TableCell><Skeleton variant="text" width={60} /></TableCell>
                  <TableCell><Skeleton variant="text" width={80} /></TableCell>
                  <TableCell><Skeleton variant="text" width={100} /></TableCell>
                  <TableCell><Skeleton variant="rounded" width={60} height={24} /></TableCell>
                  <TableCell><Skeleton variant="text" width={150} /></TableCell>
                </TableRow>
              ))
            ) : (
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
                  <TableCell>{row.currentStock}</TableCell>
                  <TableCell>{row.suggestedOrder}</TableCell>
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
                </TableRow>
              ))
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
                // Allow empty string and valid numbers
                if (value === '' || /^\d+$/.test(value)) {
                  setOrderAmount(value);
                }
              }}
              onFocus={(e) => {
                // Select all text when focused for easy replacement
                e.target.select();
              }}
              inputProps={{ 
                min: 1,
                step: 1
              }}
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

      {/* Optional centered spinner (good for first load) */}
      {loading && rows.length === 0 && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
          <CircularProgress />
        </Box>
      )}
    </Box>
  );
};

export default PredictedRestockTable;
