// src/components/OrderManagement/OrderQueueSection.tsx
import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Paper,
  Chip,
} from "@mui/material";
import {
  fetchOrderQueue,
  completeOrderDish,
  OrderQueueItem,
} from "../../services/orderQueueService";

const OrderQueueSection: React.FC = () => {
  const [orders, setOrders] = useState<OrderQueueItem[]>([]);
  const [now, setNow] = useState(Date.now());
  const [loading, setLoading] = useState(true);

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

  // ---- Handle complete dish ----
  const handleCompleteDish = async (orderId: string, dishName: string) => {
    try {
      await completeOrderDish(orderId, dishName);

      // ✅ Update UI instantly
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

  return (
    <Box sx={{ mb: 3 }}>
      <Paper
        sx={{
          p: 3,
          borderRadius: "10px",
          boxShadow: "0px 2px 6px rgba(0, 0, 0, 0.1)",
        }}
      >
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
              const placedTime = new Date(order.dishes[0].order_placed_time).getTime();
              const waitingMinutes = Math.floor((now - placedTime) / 60000);
              const waitingSeconds = Math.floor(((now - placedTime) % 60000) / 1000);

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
                              backgroundColor: isCompleted ? "#e8f5e9" : "#fff3e0",
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
      </Paper>
    </Box>
  );
};

export default OrderQueueSection;
