import React, { useState } from "react";
import axios from "axios";
import { API_URL } from "../config/api";
import { Container, TextField, Button, Typography, Box } from "@mui/material";

const CheckoutPage = () => {
  const [address, setAddress] = useState("");
  const cart = JSON.parse(localStorage.getItem("cart")) || [];

  const handleCheckout = async () => {
    try {
      await axios.post(`${API_URL}/orders`, { cart, address });
      alert("Order placed successfully!");
      localStorage.removeItem("cart");
      window.location.href = "/dashboard";
    } catch (error) {
      alert("Checkout failed!");
    }
  };

  return (
    <Container>
      <Typography variant="h4">Checkout</Typography>
      <Box>
        <TextField fullWidth label="Shipping Address" value={address} onChange={(e) => setAddress(e.target.value)} margin="normal" />
        <Button variant="contained" color="primary" fullWidth onClick={handleCheckout}>Place Order</Button>
      </Box>
    </Container>
  );
};

export default CheckoutPage;
