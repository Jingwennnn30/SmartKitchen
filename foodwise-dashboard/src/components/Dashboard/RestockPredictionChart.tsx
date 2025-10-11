import React, { useEffect, useState } from "react";
import {
  Typography,
  List,
  ListItem,
  ListItemText,
  Box,
  Card,
  Skeleton,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import { fetchRestockPrediction } from "../../services/restockPredictionService";

const StyledListItem = styled(ListItem)({
  borderBottom: "1px solid rgba(0, 0, 0, 0.12)",
  "&:last-child": {
    borderBottom: "none",
  },
});

interface PredictionItem {
  item: string;
  date: string;
  quantity: string;
}

const RestockPredictionChart: React.FC = () => {
  const [predictions, setPredictions] = useState<PredictionItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadPredictions() {
      setLoading(true);
      try {
        const data = await fetchRestockPrediction();

        // Transform your data into displayable predictions
        const mapped = data
          .filter(
            (r: any) => Number(r.predicted_usage) - Number(r.current_stock) > 0
          )
          .map((r: any) => {
            const suggested = Math.max(
              Number(r.predicted_usage) - Number(r.current_stock),
              0
            );

            return {
              item: `${r.ingredient} (${r.unit})`,
              date: new Date().toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
              }),
              quantity: `${suggested.toFixed(2)} ${r.unit}`,
            };
          });

        setPredictions(mapped);
      } catch (err) {
        console.error("Error fetching restock predictions:", err);
      } finally {
        setLoading(false);
      }
    }

    loadPredictions();
  }, []);

  return (
    <Card
      sx={{
        height: "400px",
        p: 2,
        boxShadow: "0px 2px 6px rgba(0, 0, 0, 0.1)",
        borderRadius: "10px",
      }}
    >
      <Box
        sx={{
          height: "100%",
          backgroundColor: "#ffffff",
          borderRadius: "8px",
          boxShadow: "inset 0px 1px 3px rgba(0, 0, 0, 0.1)",
          border: "1px solid rgba(0, 0, 0, 0.08)",
          p: 2,
          display: "flex",
          flexDirection: "column",
        }}
      >
        <Typography variant="h6" gutterBottom>
          Predicted Restock Summary
        </Typography>

        <Box sx={{ flex: 1, overflow: "auto" }}>
          <List sx={{ py: 0 }}>
            {loading ? (
              // Skeleton placeholders while loading
              Array.from({ length: 3 }).map((_, i) => (
                <StyledListItem key={i}>
                  <ListItemText
                    primary={<Skeleton width={160} />}
                    secondary={
                      <Box
                        component="span"
                        sx={{
                          display: "flex",
                          justifyContent: "space-between",
                        }}
                      >
                        <Skeleton width={100} />
                        <Skeleton width={60} />
                      </Box>
                    }
                  />
                </StyledListItem>
              ))
            ) : predictions.length > 0 ? (
              predictions.map((prediction, index) => (
                <StyledListItem key={index}>
                  <ListItemText
                    primary={prediction.item}
                    secondary={
                      <Box
                        component="span"
                        sx={{
                          display: "flex",
                          justifyContent: "space-between",
                          fontSize: "0.9rem",
                        }}
                      >
                        <span>{prediction.date}</span>
                        <span>{prediction.quantity}</span>
                      </Box>
                    }
                  />
                </StyledListItem>
              ))
            ) : (
              <Box textAlign="center" py={4}>
                <Typography color="text.secondary" variant="body2">
                  No restock predictions available 🎉
                </Typography>
              </Box>
            )}
          </List>
        </Box>
      </Box>
    </Card>
  );
};

export default RestockPredictionChart;
