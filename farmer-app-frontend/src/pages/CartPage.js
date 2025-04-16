import React, { useState } from "react";
import { Button, Card, CardContent, Typography, Container } from "@mui/material";

const CartPage = () => {
  const [cart, setCart] = useState(JSON.parse(localStorage.getItem("cart")) || []);

  const removeFromCart = (id) => {
    const updatedCart = cart.filter(item => item._id !== id);
    setCart(updatedCart);
    localStorage.setItem("cart", JSON.stringify(updatedCart));
  };

  return (
    <Container>
      <Typography variant="h4">Your Cart</Typography>
      {cart.length === 0 ? (
        <Typography variant="body1">Your cart is empty.</Typography>
      ) : (
        cart.map((item) => (
          <Card key={item._id} style={{ marginBottom: "10px" }}>
            <CardContent>
              <Typography variant="h6">{item.name}</Typography>
              <Typography variant="body1">${item.price}</Typography>
              <Button variant="contained" color="secondary" onClick={() => removeFromCart(item._id)}>Remove</Button>
            </CardContent>
          </Card>
        ))
      )}
      <Button variant="contained" color="primary" fullWidth href="/checkout">Proceed to Checkout</Button>
    </Container>
  );
};

export default CartPage;
