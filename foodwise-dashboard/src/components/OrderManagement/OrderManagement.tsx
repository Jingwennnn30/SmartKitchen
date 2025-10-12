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

  // ---- Auto-refresh orders ----
  useEffect(() => {
    const loadOrders = async () => {
      try {
        setLoading(true);
        const data = await fetchOrderQueue();
        setOrders(data);
      } catch (err) {
        console.error("Failed to load orders:", err);
      } finally {
        setLoading(false);
      }
    };

    loadOrders();
    const refreshInterval = setInterval(loadOrders, 1000);
    return () => clearInterval(refreshInterval);
  }, []);

  // ---- Live timer update ----
  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  const handleVoiceAssistant = () => setIsListening(!isListening);

  const handleCompleteDish = async (orderId: string, dishName: string) => {
    try {
      await completeOrderDish(orderId, dishName);

      // ✅ Update UI instantly without full reload
      setOrders((prev) =>
        prev
          .map((order) => {
            if (order.order_id !== orderId) return order;
            const updatedDishes = order.dishes.map((dish) =>
              dish.dish_name === dishName
                ? { ...dish, order_completed_time: new Date().toISOString() }
                : dish
            );
            return { ...order, dishes: updatedDishes };
          })
          // Remove order if all dishes completed
          .filter((order) =>
            order.dishes.some((dish) => !dish.order_completed_time)
          )
      );
    } catch (err) {
      console.error("Failed to complete dish:", err);
    }
  };

  // ---- KPIs ----
  const ordersInQueue = orders.length;

  const waitingTimes = orders.flatMap((order) =>
    order.dishes.map((dish) => {
      const placed = new Date(dish.order_placed_time).getTime();
      return (now - placed) / 60000;
    })
  );

  const averageWait =
    waitingTimes.length > 0
      ? Math.round(waitingTimes.reduce((a, b) => a + b, 0) / waitingTimes.length)
      : 0;

  const longestWait =
    waitingTimes.length > 0 ? Math.round(Math.max(...waitingTimes)) : 0;

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
      <Box sx={{ mb: 3 }}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={4}>
            <StyledPaper>
              <Typography variant="subtitle2" color="textSecondary">
                Orders in Queue
              </Typography>
              <Typography variant="h4" sx={{ mt: 1, color: "#1976d2" }}>
                {ordersInQueue}
              </Typography>
            </StyledPaper>
          </Grid>
          <Grid item xs={12} md={4}>
            <StyledPaper>
              <Typography variant="subtitle2" color="textSecondary">
                Average Wait Time
              </Typography>
              <Typography variant="h4" sx={{ mt: 1, color: "#1976d2" }}>
                { `${averageWait}m`}
              </Typography>
            </StyledPaper>
          </Grid>
          <Grid item xs={12} md={4}>
            <StyledPaper>
              <Typography variant="subtitle2" color="textSecondary">
                Longest Waiting Time
              </Typography>
              <Typography variant="h4" sx={{ mt: 1, color: "#1976d2" }}>
                {`${longestWait}m`}
              </Typography>
            </StyledPaper>
          </Grid>
        </Grid>
      </Box>

      {/* Order Queue Section */}
      <Box sx={{ mb: 3 }}>
        <StyledPaper>
          <Typography variant="h6" gutterBottom>
            Order Queue
          </Typography>

          { orders.length === 0 ? (
            <Typography
              variant="body2"
              sx={{ p: 2, color: "text.secondary" }}
            >
              No active orders in queue.
            </Typography>
          ) : (
            <Box sx={{ display: "flex", gap: 2, overflowX: "auto", pb: 2 }}>
              {orders.map((order) => {
                const placedTime = new Date(
                  order.dishes[0].order_placed_time
                ).getTime();
                const waitingMinutes = Math.floor((now - placedTime) / 60000);
                const waitingSeconds = Math.floor(
                  ((now - placedTime) % 60000) / 1000
                );

                return (
                  <Paper
                    key={order.order_id}
                    sx={{
                      minWidth: 250,
                      p: 2,
                      backgroundColor: "#fff9f9",
                      border: "1px solid #ffe7e7",
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "space-between",
                    }}
                  >
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="subtitle1" fontWeight="bold">
                        Order #{order.order_id}
                      </Typography>

                      {order.dishes.map((item, i) => {
                        const isCompleted = !!item.order_completed_time;
                        const statusLabel = isCompleted ? "Served" : "Preparing";

                        return (
                          <Box
                            key={i}
                            sx={{
                              display: "flex",
                              justifyContent: "space-between",
                              alignItems: "center",
                              mb: 1,
                            }}
                          >
                            <Typography variant="body2">
                              {item.dish_name} × {item.quantity}
                            </Typography>
                            <Chip
                              label={statusLabel}
                              size="small"
                              clickable={!isCompleted}
                              onClick={() =>
                                !isCompleted &&
                                handleCompleteDish(order.order_id, item.dish_name)
                              }
                              sx={{
                                backgroundColor: isCompleted
                                  ? "#e8f5e9"
                                  : "#fff3e0",
                                color: isCompleted ? "#2e7d32" : "#ef6c00",
                                cursor: isCompleted ? "default" : "pointer",
                                "&:hover": !isCompleted
                                  ? { backgroundColor: "#ffe0b2" }
                                  : {},
                              }}
                            />
                          </Box>
                        );
                      })}
                    </Box>

                    {/* Live Timer */}
                    <Box
                      sx={{
                        mt: 1,
                        pt: 1,
                        borderTop: "1px solid #ffe7e7",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                      }}
                    >
                      <Typography variant="caption" color="textSecondary">
                        Customer waiting time
                      </Typography>
                      <Typography variant="subtitle2" color="error">
                        {waitingMinutes}m {waitingSeconds}s
                      </Typography>
                    </Box>
                  </Paper>
                );
              })}
            </Box>
          )}
        </StyledPaper>
      </Box>

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
