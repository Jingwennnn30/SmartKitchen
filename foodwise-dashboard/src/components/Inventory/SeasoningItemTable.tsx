import React, { useEffect, useState } from 'react';
import {
  Box, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Paper, Typography, Chip, Skeleton
} from '@mui/material';
import { fetchSeasoningRestockPrediction, SeasoningRestockItem } from '../../services/seasoningRestockService';

type Urgency = 'high' | 'medium' | 'low';

const getUrgency = (predictedQty: number): Urgency => {
  if (predictedQty > 500) return 'high';
  if (predictedQty > 200) return 'medium';
  return 'low';
};

const getUrgencyColor = (urgency: Urgency) => {
  switch (urgency) {
    case 'high': return '#FF4B4B';
    case 'medium': return '#FFA500';
    case 'low': return '#4CAF50';
    default: return '#000000';
  }
};

const SeasoningRestockTable: React.FC = () => {
  const [rows, setRows] = useState<SeasoningRestockItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const data = await fetchSeasoningRestockPrediction();
        setRows(data);
      } catch (err) {
        console.error('Failed to fetch restock prediction:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h6" >
          Seasoning Restock Prediction
        </Typography>
      </Box>

      <TableContainer component={Paper} sx={{ borderRadius: 2, '& .MuiTableCell-root': { py: 2, px: 3 } }}>
        <Table sx={{ minWidth: 1000, tableLayout: 'fixed', '& th, & td': { whiteSpace: 'nowrap' } }}>
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontWeight: 600 }}>Item Name</TableCell>
              <TableCell sx={{ fontWeight: 600 }} align="center">Last Purchase Date</TableCell>
              <TableCell sx={{ fontWeight: 600 }} align="center">Last Purchase Qty</TableCell>
              <TableCell sx={{ fontWeight: 600 }} align="center">Next Restock Date</TableCell>
              <TableCell sx={{ fontWeight: 600 }} align="center">Predicted Restock Quantity</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              Array.from({ length: 6 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell><Skeleton width={180} /></TableCell>
                  <TableCell align="center"><Skeleton width={120} /></TableCell>
                  <TableCell align="center"><Skeleton width={80} /></TableCell>
                  <TableCell align="center"><Skeleton width={120} /></TableCell>
                  <TableCell align="center"><Skeleton width={100} /></TableCell>
                </TableRow>
              ))
            ) : rows.length > 0 ? (
              rows.map((item, index) => {
                const urgency = getUrgency(Number(item.predicted_quantity) || 0);
                return (
                  <TableRow
                    key={index}
                    sx={{
                      borderLeft: 3,
                      borderLeftColor: getUrgencyColor(urgency),
                      '&:hover': { backgroundColor: 'rgba(0,0,0,0.04)' },
                    }}
                  >
                    <TableCell sx={{ fontWeight: 500 }}>{item.item_name}</TableCell>
                    <TableCell align="center">{item.last_purchase_date || '-'}</TableCell>
                    <TableCell align="center">{item.last_purchase_quantity || '-'}</TableCell>
                    <TableCell align="center">{item.next_restock_date || '-'}</TableCell>
                    <TableCell align="center">{Math.round(Number(item.predicted_quantity) || 0)}</TableCell>
                   
                  </TableRow>
                );
              })
            ) : (
              <TableRow>
                <TableCell colSpan={6} align="center">
                  <Typography variant="body2" color="text.secondary" py={3}>
                    No seasoning restock prediction available.
                  </Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default SeasoningRestockTable;
