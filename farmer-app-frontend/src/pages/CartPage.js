import React, { useEffect, useState } from "react";
import {
  Container,
  Typography,
  Card,
  CardContent,
  Button,
  Grid,
  CardMedia,
  Box
} from "@mui/material";

const CartPage = () => {
  const [cartItems, setCartItems] = useState([]);

  useEffect(() => {
    const storedCart = JSON.parse(localStorage.getItem("cart")) || [];
    setCartItems(storedCart);
  }, []);

  const removeFromCart = (index) => {
    const updatedCart = [...cartItems];
    updatedCart.splice(index, 1);
    setCartItems(updatedCart);
    localStorage.setItem("cart", JSON.stringify(updatedCart));
  };

  const getTotal = () => {
    return cartItems.reduce((total, item) => total + item.price, 0);
  };

  return (
    <Container>
      <Box sx={{ mt: 4, textAlign: 'center' }}>
        <Typography variant="h4" fontWeight={600} gutterBottom>Your Cart 🛒</Typography>
        <Typography variant="body1" sx={{ mb: 3 }}>Review your selected items below.</Typography>
      </Box>
      {cartItems.length === 0 ? (
        <Typography>Your cart is empty.</Typography>
      ) : (
        <>
          <Grid container spacing={2}>
            {cartItems.map((item, index) => (
              <Grid item xs={12} key={index}>
                <Card sx={{ display: 'flex', alignItems: 'center' }}>
                  <CardMedia
                    component="img"
                    image={item.image || "https://images.unsplash.com/photo-1582515073490-dbe8ec86b6c1?auto=format&fit=crop&w=600&q=80"}
                    alt={item.name}
                    sx={{ width: 120, height: 100, objectFit: 'cover' }}
                  />
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Typography variant="h6">{item.name}</Typography>
                    <Typography>₹{item.price}</Typography>
                    <Button onClick={() => removeFromCart(index)} color="error">Remove</Button>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
          <Box sx={{ textAlign: 'center', mt: 4 }}>
            <Typography variant="h6">Total: ₹{getTotal()}</Typography>
            <Button variant="contained" color="primary" href="/checkout" sx={{ mt: 2 }}>
              Proceed to Checkout
            </Button>
          </Box>
        </>
      )}
    </Container>
  );
};

export default CartPage;