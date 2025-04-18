import React, { useEffect, useState } from "react";
import { Container, Typography, CircularProgress, Box } from "@mui/material";
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
      <Box sx={{ mt: 5, textAlign: "center" }}>
        <Typography variant="h4" gutterBottom>Order Tracking</Typography>
        {loading ? (
          <CircularProgress />
        ) : (
          <Typography variant="h6">Current Order Status: {orderStatus}</Typography>
        )}
      </Box>
    </Container>
  );
};

export default OrderTrackingPage;
