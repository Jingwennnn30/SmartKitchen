import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  CircularProgress,
  Grid,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { fetchLowStockData, LowStockItem } from "../../services/lowStockService";
import orderCreationService from "../../services/orderCreationService";

const LowStockSection: React.FC = () => {
  const [lowStockItems, setLowStockItems] = useState<LowStockItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [orderingItemId, setOrderingItemId] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const data = await fetchLowStockData();

        // ✅ Only keep items with is_low_stock = true
        const lowItems = data.filter((item) => item.is_low_stock === true);
        setLowStockItems(lowItems);
      } catch (err) {
        console.error("Failed to load low stock data:", err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const handleOrderClick = async (item: LowStockItem) => {
    setOrderingItemId(item.item_name);
    try {
      // Calculate suggested order quantity (safety level + 20% buffer)
      const suggestedQuantity = Math.round(item.safety_stock_level * 1.2);
      
      console.log(`📦 Creating order for low stock item: ${item.item_name}`);
      
      // Call the same Lambda function used in supplier order page
      const result = await orderCreationService.createManagerOrder(
        item.item_name,
        suggestedQuantity,
        item.unit
      );
      
      if (result) {
        console.log('✅ Order created successfully:', result);
        alert(`Order created successfully!\n\nOrder ID: ${result.order_id}\nItem: ${item.item_name}\nQuantity: ${suggestedQuantity} ${item.unit}\n\nAn email notification has been sent.`);
      } else {
        alert('Failed to create order. Please try again.');
      }
    } catch (error) {
      console.error('❌ Error creating order:', error);
      alert('Error creating order. Please try again.');
    } finally {
      setOrderingItemId(null);
    }
  };

  return (
    <Card
      sx={{
        height: "400px",
        p: 2,
        boxShadow: "0px 2px 6px rgba(0, 0, 0, 0.1)",
        borderRadius: "10px",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <Typography variant="h6" gutterBottom>
        Low Stock Alerts ({lowStockItems.length} items)
      </Typography>

      <Box sx={{ flex: 1, overflowY: "auto", pr: 1 }}>
        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", mt: 2 }}>
            <CircularProgress size={24} />
          </Box>
        ) : lowStockItems.length === 0 ? (
          <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
            ✅ All items are sufficiently stocked.
          </Typography>
        ) : (
          <Grid container spacing={2}>
            {lowStockItems.map((item) => {
              const isCritical = item.current_stock < item.safety_stock_level / 2;
              const borderColor = isCritical ? "error.main" : "primary.main";

              return (
                <Grid item xs={12} sm={6} key={item.item_name}>
                  {/* ✅ xs=12 sm=6 gives 2 cards per row on normal screens */}
                  <Card
                    sx={{
                      border: "2px solid",
                      borderColor,
                      borderRadius: 2,
                      position: "relative",
                      p: 1.5,
                      height: "100%",
                      transition: "transform 0.2s ease, box-shadow 0.2s ease",
                      "&:hover": {
                        transform: "translateY(-3px)",
                        boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                      },
                    }}
                  >
                    {/* ORDER button top-right */}
                    <Button
                      variant="contained"
                      size="small"
                      color={isCritical ? "error" : "primary"}
                      onClick={() => handleOrderClick(item)}
                      disabled={orderingItemId === item.item_name}
                      sx={{
                        position: "absolute",
                        top: 8,
                        right: 8,
                        borderRadius: "16px",
                        textTransform: "uppercase",
                        fontSize: "0.7rem",
                        fontWeight: 600,
                        px: 1.5,
                        py: 0.2,
                      }}
                    >
                      {orderingItemId === item.item_name ? "Ordering..." : "Order"}
                    </Button>

                    <CardContent sx={{ p: 0, mt: 4 }}>
                      <Typography
                        variant="subtitle1"
                        sx={{
                          fontWeight: 700,
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          mb: 0.5,
                          color: isCritical ? "error.main" : "text.primary",
                        }}
                      >
                        {item.item_name}
                      </Typography>

                      <Typography variant="body2" color="text.secondary">
                        Current:{" "}
                        <Box component="span" sx={{ fontWeight: 500 }}>
                          {item.current_stock} {item.unit}
                        </Box>
                      </Typography>

                      <Typography variant="body2" color="text.secondary">
                        Safety: {item.safety_stock_level} {item.unit}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              );
            })}
          </Grid>
        )}
      </Box>
    </Card>
  );
};

export default LowStockSection;
