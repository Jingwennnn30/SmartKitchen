import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Paper,
  Grid,
  styled,
  Chip,
  IconButton,
  Tooltip,
  CircularProgress,
  Button,
} from "@mui/material";
import MicIcon from "@mui/icons-material/Mic";
import MicOffIcon from "@mui/icons-material/MicOff";
import OrderVoiceAssistant from "./OrderVoiceAssistant";
import {
  fetchOrderQueue,
  OrderQueueItem,
  completeOrderDish,
} from "../../services/orderQueueService";
import OrderAggregationSection from "./OrderAggregationSection";
import OrderQueueSection from "./OrderQueueSection";
import OrderKPISection from "./OrderKPISection";

// ----- Styled Components -----
const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  borderRadius: "10px",
  boxShadow: "0px 2px 6px rgba(0, 0, 0, 0.1)",
  height: "100%",
}));

const KitchenSlot = styled(Box)<{ status: string }>(({ status }) => ({
  width: "100%",
  height: "80px",
  backgroundColor: status === "In Used" ? "#ffcdd2" : "#c8e6c9",
  border: "1px solid #e0e0e0",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  borderRadius: "4px",
  color: status === "In Used" ? "#d32f2f" : "#2e7d32",
  fontWeight: "bold",
  transition: "all 0.3s ease",
}));

// ----- Mock Kitchen Units -----
const kitchenUnits = [
  { id: "grill", name: "Grill", slots: [{ id: "g1", status: "In Used" }, { id: "g2", status: "Empty" }] },
  { id: "oven", name: "Oven", slots: [{ id: "o1", status: "In Used" }, { id: "o2", status: "Empty" }] },
  { id: "pan", name: "Pan", slots: [{ id: "p1", status: "In Used" }, { id: "p2", status: "Empty" }] },
  { id: "fryer", name: "Fryer", slots: [{ id: "f1", status: "Empty" }, { id: "f2", status: "In Used" }] },
];

// ----- Component -----
const OrderManagement: React.FC = () => {
  const [isListening, setIsListening] = useState(false);
  const [orders, setOrders] = useState<OrderQueueItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [now, setNow] = useState(Date.now());

  // ---- Live timer update ----
  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 5000);
    return () => clearInterval(timer);
  }, []);

  const handleVoiceAssistant = () => setIsListening(!isListening);


  return (
    <Box sx={{ padding: 3 }}>
      {/* Header */}
      <Box
        sx={{
          mb: 4,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Typography variant="h5" sx={{ fontWeight: "bold" }}>
          Order Management
        </Typography>
        <Tooltip
          title={isListening ? "Stop Voice Assistant" : "Start Voice Assistant"}
        >
          <IconButton
            onClick={handleVoiceAssistant}
            sx={{
              backgroundColor: isListening ? "#4caf50" : "primary.main",
              color: "white",
              "&:hover": {
                backgroundColor: isListening ? "#388e3c" : "primary.dark",
              },
              boxShadow: 3,
            }}
          >
            {isListening ? <MicIcon /> : <MicOffIcon />}
          </IconButton>
        </Tooltip>
      </Box>

      {/* KPI Section */}
      <OrderKPISection />

      {/* Order Queue Section */}
      <OrderQueueSection />

      {/* Order Aggregation Section */}
      <OrderAggregationSection loading={loading} now={Date.now()} />

      {/* Kitchen Load Section */}
      <Box sx={{ mb: 3 }}>
        <StyledPaper>
          <Typography variant="h6" gutterBottom>
            Kitchen Load
          </Typography>
          <Grid container spacing={3}>
            {kitchenUnits.map((unit) => (
              <Grid item xs={12} sm={6} md={3} key={unit.id}>
                <Box sx={{ textAlign: "center", mb: 1 }}>
                  <Typography variant="subtitle1" fontWeight="medium">
                    {unit.name}
                  </Typography>
                </Box>
                <Grid container spacing={1}>
                  {unit.slots.map((slot) => (
                    <Grid item xs={6} key={slot.id}>
                      <KitchenSlot status={slot.status}>
                        {slot.status}
                      </KitchenSlot>
                    </Grid>
                  ))}
                </Grid>
              </Grid>
            ))}
          </Grid>
        </StyledPaper>
      </Box>

      <OrderVoiceAssistant isActive={isListening} />
    </Box>
  );
};

export default OrderManagement;
