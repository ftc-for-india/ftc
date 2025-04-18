import React, { useState } from "react";
import axios from "axios";
import { API_URL } from "../config/api";
import {
  Container,
  TextField,
  Typography,
  Box,
  Button,
  Snackbar,
  Alert
} from "@mui/material";
import { useNavigate } from "react-router-dom";

const CheckoutPage = () => {
  const [address, setAddress] = useState("");
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const cart = JSON.parse(localStorage.getItem("cart")) || [];

  const handleCheckout = async () => {
    if (!address) return setError("Please enter your address");
    try {
      await axios.post(`${API_URL}/orders`, {
        items: cart,
        address,
      });
      setOpenSnackbar(true);
      localStorage.removeItem("cart");
      setTimeout(() => navigate("/payment-success"), 2000);
    } catch (err) {
      setError("Checkout failed. Please try again.");
    }
  };

  return (
    <Container maxWidth="sm">
      <Box sx={{ padding: 4, boxShadow: 3, borderRadius: 2, mt: 5, bgcolor: "white" }}>
        <Typography variant="h4" gutterBottom>Checkout</Typography>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        <TextField
          label="Shipping Address"
          multiline
          rows={4}
          fullWidth
          value={address}
          onChange={(e) => setAddress(e.target.value)}
        />
        <Button
          variant="contained"
          color="primary"
          fullWidth
          sx={{ mt: 3 }}
          onClick={handleCheckout}
        >
          Place Order
        </Button>
      </Box>
      <Snackbar open={openSnackbar} autoHideDuration={3000} onClose={() => setOpenSnackbar(false)}>
        <Alert severity="success">Order placed successfully!</Alert>
      </Snackbar>
    </Container>
  );
};

export default CheckoutPage;
