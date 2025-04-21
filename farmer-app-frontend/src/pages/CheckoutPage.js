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
  Alert,
  Card,
  CardMedia
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
    <Container maxWidth="md">
      <Box sx={{ mt: 5 }}>
        <Typography variant="h4" textAlign="center" gutterBottom>🧾 Checkout</Typography>
        <Typography variant="body1" textAlign="center" sx={{ mb: 3 }}>
          You're one step away from fresh, local produce!
        </Typography>
        <Card sx={{ mb: 3 }}>
          <CardMedia
            component="img"
            height="200"
            image="https://images.unsplash.com/photo-1524592924443-8c5ae80d40c3?auto=format&fit=crop&w=1200&q=80"
            alt="Checkout Banner"
          />
        </Card>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        <TextField
          label="Shipping Address"
          placeholder="e.g. 123 Green Street, City Name, State"
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