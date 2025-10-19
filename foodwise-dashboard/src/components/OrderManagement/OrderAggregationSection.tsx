import React, { useEffect, useState } from "react";
import { Box, Paper, Typography, CircularProgress, Divider, Chip } from "@mui/material";
import { fetchAggregatedOrders, AggregatedOrder } from "../../services/aggregateOrderService";

interface OrderAggregationSectionProps {
    loading: boolean;
    now: number;
    orders?: any[]; // optional if you also pass orders from parent
}

const OrderAggregationSection: React.FC<OrderAggregationSectionProps> = ({ loading }) => {
    const [aggregatedOrders, setAggregatedOrders] = useState<AggregatedOrder[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [loadingData, setLoadingData] = useState(true);

    useEffect(() => {
        const loadAggregatedOrders = async () => {
            try {
                setLoadingData(true);
                const data = await fetchAggregatedOrders();
                setAggregatedOrders(data);
            } catch (err: any) {
                console.error(err);
                setError("Failed to load aggregated orders");
            } finally {
                setLoadingData(false);
            }
        };

        loadAggregatedOrders();
        // refresh every 10 seconds (optional)
        const interval = setInterval(loadAggregatedOrders, 1000);
        return () => clearInterval(interval);
    }, []);

    return (
        <Box sx={{ mb: 3 }}>
            <Paper sx={{ p: 3, borderRadius: "10px" }}>
                <Typography variant="h6" gutterBottom>
                    Order Aggregation
                </Typography>

                {error ? (
                    <Typography color="error" sx={{ p: 2 }}>
                        {error}
                    </Typography>
                ) : aggregatedOrders.length === 0 ? (
                    <Typography variant="body2" sx={{ p: 2, color: "text.secondary" }}>
                        No active orders found.
                    </Typography>
                ) : (
                    <Box
                        sx={{
                            display: "flex",
                            flexDirection: "row",
                            alignItems: "stretch", // 👈 ensures all cards match tallest height
                            gap: 2,
                            mt: 2,
                            overflowX: "auto",
                            pb: 1,
                        }}
                    >
                        {aggregatedOrders.map((item) => (
                            <Paper
                                key={item.dish_name}
                                sx={{
                                    width: 220, // fixed width
                                    flex: "0 0 auto",
                                    p: 2,
                                    backgroundColor: "#fff9f9",
                                    border: "1px solid #ffe7e7",
                                    display: "flex",
                                    flexDirection: "column",
                                    justifyContent: "space-between",
                                }}
                            >
                                <Typography variant="subtitle1" fontWeight="bold">
                                    {item.dish_name}
                                </Typography>

                                <Divider sx={{ my: 1 }} />

                                <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                                    <Typography variant="body2">Total Orders</Typography>
                                    <Chip
                                        label={item.total_quantity}
                                        size="small"
                                        sx={{
                                            backgroundColor: "#fff3e0",
                                            color: "#ef6c00",
                                            fontWeight: "bold",
                                        }}
                                    />
                                </Box>

                                <Typography
                                    variant="caption"
                                    sx={{ mt: 1, color: "text.secondary", wordBreak: "break-word" }}
                                >
                                    Included Orders: {item.order_ids.join(", ")}
                                </Typography>
                            </Paper>
                        ))}
                    </Box>
                )}
            </Paper>
        </Box>

    );
};

export default OrderAggregationSection;
