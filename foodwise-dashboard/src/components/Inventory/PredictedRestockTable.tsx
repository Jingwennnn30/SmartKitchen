import React, { useEffect, useState } from "react";
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
  Chip,
  Skeleton,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import { fetchRestockPrediction } from "../../services/restockPredictionService";
import orderCreationService from "../../services/orderCreationService";

interface Item {
  id: number;
  name: string;
  currentStock: number;
  suggestedOrder: number;
  orderDate: string;
  urgency: "high" | "medium" | "low";
}

const getUrgency = (restockNeeded: number): Item["urgency"] => {
  if (restockNeeded >= 10) return "high";
  if (restockNeeded >= 5) return "medium";
  return "low";
};

const getUrgencyColor = (urgency: Item["urgency"]) => {
  switch (urgency) {
    case "high":
      return "#FF4B4B";
    case "medium":
      return "#FFA500";
    case "low":
      return "#4CAF50";
    default:
      return "#000000";
  }
};

const PredictedRestockTable: React.FC = () => {
  const [rows, setRows] = useState<Item[]>([]);
  const [tableLoading, setTableLoading] = useState(true);
  const [submittingRowId, setSubmittingRowId] = useState<number | null>(null);

  const handleRestock = async (row: Item) => {
    setSubmittingRowId(row.id);
    try {
      // Use integer quantity to avoid decimal error
      const quantity = Math.round(row.suggestedOrder);
      const result = await orderCreationService.createManagerOrder(row.name, quantity, "unit");
      if (result) {
        alert(`Order created! Order ID: ${result.order_id}\nEmail notification sent.`);
      } else {
        alert("Failed to create order. Please try again.");
      }
    } catch (error) {
      console.error("Error creating order:", error);
      alert("Error creating order. Please try again.");
    } finally {
      setSubmittingRowId(null);
    }
  };
  useEffect(() => {
    async function loadData() {
      setTableLoading(true);
      try {
        const data = await fetchRestockPrediction();

        const mapped: Item[] = data
          .filter((r) => Number(r.predicted_usage) - Number(r.current_stock) > 0)
          .map((r, index) => {
            const suggested = Math.max(
              Number(r.predicted_usage) - Number(r.current_stock),
              0
            );

            return {
              id: index + 1,
              name: `${r.ingredient} (${r.unit})`,
              currentStock: parseFloat(Number(r.current_stock || 0).toFixed(2)),
              suggestedOrder: parseFloat(suggested.toFixed(2)),
              orderDate: new Date().toISOString().split("T")[0],
              urgency: getUrgency(suggested),
            };
          });

        setRows(mapped);
      } catch (err) {
        console.error("Error fetching restock prediction:", err);
      } finally {
        setTableLoading(false);
      }
    }

    loadData();
  }, []);

  return (
    <Box p={2}>
      <Typography variant="h6" gutterBottom>
        Predicted Restock Items
      </Typography>

      <TableContainer
        component={Paper}
        sx={{
          borderRadius: 2,
          "& .MuiTableCell-root": { py: 2, px: 3 },
        }}
      >
        <Table
          sx={{
            minWidth: 800,
            tableLayout: "fixed",
            "& th, & td": { whiteSpace: "nowrap" },
          }}
        >
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontWeight: 600,width: '60px' }}>#</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Ingredient</TableCell>
              <TableCell sx={{ fontWeight: 600 }} align="center">
                Current Stock
              </TableCell>
              <TableCell sx={{ fontWeight: 600 }} align="center">
                Suggested Order
              </TableCell>
              <TableCell sx={{ fontWeight: 600 }} align="center">
                Urgency
              </TableCell>
              <TableCell sx={{ fontWeight: 600 }} align="center">
                Action
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {tableLoading ? (
              // ✅ Skeleton loading rows (matches seasoning table)
              Array.from({ length: 6 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell>
                    <Skeleton width={30} />
                  </TableCell>
                  <TableCell>
                    <Skeleton width={150} />
                  </TableCell>
                  <TableCell align="center">
                    <Skeleton width={80} />
                  </TableCell>
                  <TableCell align="center">
                    <Skeleton width={80} />
                  </TableCell>
                  <TableCell align="center">
                    <Skeleton width={60} />
                  </TableCell>
                  <TableCell align="center">
                    <Skeleton width={100} height={35} />
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
                    "&:hover": { backgroundColor: "rgba(0,0,0,0.04)" },
                  }}
                >
                  <TableCell>{row.id}</TableCell>
                  <TableCell sx={{ fontWeight: 500 }}>{row.name}</TableCell>
                  <TableCell align="center">{row.currentStock}</TableCell>
                  <TableCell align="center">{row.suggestedOrder}</TableCell>
                  <TableCell align="center">
                    <Chip
                      label={row.urgency.toUpperCase()}
                      size="small"
                      sx={{
                        bgcolor: `${getUrgencyColor(row.urgency)}15`,
                        color: getUrgencyColor(row.urgency),
                        fontWeight: "medium",
                        fontSize: "0.75rem",
                        minWidth: "70px",
                      }}
                    />
                  </TableCell>
                  <TableCell align="center">
                    <Button
                      variant="contained"
                      color="primary"
                      size="small"
                      startIcon={<AddIcon />}
                      disabled={submittingRowId === row.id}
                      onClick={() => handleRestock(row)}
                    >
                      {submittingRowId === row.id ? "Processing..." : "Restock"}
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} align="center">
                  <Typography variant="body2" color="text.secondary" py={3}>
                    No restock needed 🎉
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

export default PredictedRestockTable;
