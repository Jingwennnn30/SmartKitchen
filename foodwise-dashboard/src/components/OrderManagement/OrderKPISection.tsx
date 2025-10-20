// src/components/OrderManagement/OrderKPISection.tsx
import React, { useState, useEffect } from "react";
import { Box, Typography, Grid, Paper, styled } from "@mui/material";
import { fetchOrderQueue, OrderQueueItem } from "../../services/orderQueueService";

// Styled Paper for KPI cards
const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  borderRadius: "10px",
  boxShadow: "0px 2px 6px rgba(0, 0, 0, 0.1)",
  height: "100%",
}));

const OrderKPISection: React.FC = () => {
  const [orders, setOrders] = useState<OrderQueueItem[]>([]);
  const [now, setNow] = useState(Date.now());
  const [loading, setLoading] = useState(true);

  // Fetch orders
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
    // const refreshInterval = setInterval(loadOrders, 1000);
    // return () => clearInterval(refreshInterval);
  }, []);

  // Update timer every second
  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  // --- KPI Calculations ---
  const ordersInQueue = orders.length;

  const waitingTimes = orders.flatMap((order) =>
    order.dishes.map((dish) => {
      const placed = new Date(dish.order_placed_time).getTime();
      return (now - placed) / 60000; // minutes
    })
  );

  const averageWait =
    waitingTimes.length > 0
      ? Math.round(waitingTimes.reduce((a, b) => a + b, 0) / waitingTimes.length)
      : 0;

  const longestWait =
    waitingTimes.length > 0 ? Math.round(Math.max(...waitingTimes)) : 0;

  return (
    <Box sx={{ mb: 3 }}>
      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <StyledPaper>
            <Typography variant="subtitle2" color="textSecondary">
              Orders in Queue
            </Typography>
            <Typography variant="h4" sx={{ mt: 1, color: "#1976d2" }}>
              { ordersInQueue}
            </Typography>
          </StyledPaper>
        </Grid>

        <Grid item xs={12} md={4}>
          <StyledPaper>
            <Typography variant="subtitle2" color="textSecondary">
              Average Wait Time
            </Typography>
            <Typography variant="h4" sx={{ mt: 1, color: "#1976d2" }}>
              {`${averageWait}m`}
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
  );
};

export default OrderKPISection;
