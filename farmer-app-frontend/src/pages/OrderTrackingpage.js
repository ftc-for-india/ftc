import React, { useEffect, useState } from "react";
import { Container, Typography, CircularProgress, Box, Card, CardContent } from "@mui/material";
import axios from "axios";
import { API_URL } from "../config/api";

const OrderTrackingPage = () => {
  const [orderStatus, setOrderStatus] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get(`${API_URL}/orders/latest`, {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
    })
      .then(res => {
        setOrderStatus(res.data.status);
        setLoading(false);
      })
      .catch(() => {
        setOrderStatus("Unable to fetch order status.");
        setLoading(false);
      });
  }, []);

  return (
    <Container maxWidth="sm">
      <Box sx={{ mt: 6, textAlign: "center" }}>
        <Typography variant="h4" fontWeight={600} gutterBottom>🚚 Order Tracking</Typography>
        <Typography variant="body1" sx={{ mb: 3 }}>Track your latest order in real time.</Typography>
        {loading ? (
          <CircularProgress />
        ) : (
          <Card>
            <CardContent>
              <Typography variant="h6">Current Order Status:</Typography>
              <Typography variant="body1" sx={{ mt: 1, fontWeight: 500 }}>{orderStatus}</Typography>
            </CardContent>
          </Card>
        )}
      </Box>
    </Container>
  );
};

export default OrderTrackingPage;
