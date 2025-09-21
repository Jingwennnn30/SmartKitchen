import React, { useEffect, useState } from 'react';
import {
  Box, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Paper, Typography, Button, TextField, Chip
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

  useEffect(() => {
    async function loadData() {
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
      }
    }
    loadData();
  }, []);

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

      <TableContainer component={Paper} sx={{ borderRadius: 2 }}>
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
            {rows.map((row) => (
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
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default PredictedRestockTable;
