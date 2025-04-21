import React, { useEffect, useState } from "react";
import axios from "axios";
import { API_URL } from "../config/api";
import {
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Button,
  CircularProgress,
  Box
} from "@mui/material";

const ProductListingPage = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get(`${API_URL}/products`)
      .then((res) => {
        setProducts(res.data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const addToCart = (product) => {
    let cart = JSON.parse(localStorage.getItem("cart")) || [];
    cart.push(product);
    localStorage.setItem("cart", JSON.stringify(cart));
    alert("✅ Added to cart");
  };

  return (
    <Container>
      <Box sx={{ textAlign: 'center', mt: 4 }}>
        <Typography variant="h4" fontWeight={600} gutterBottom>
          🥦 Available Farm Fresh Products 🥕
        </Typography>
        <Typography variant="body1" sx={{ mb: 4 }}>
          Browse and shop directly from trusted local farmers.
        </Typography>
      </Box>
      {loading ? (
        <Box sx={{ textAlign: 'center' }}>
          <CircularProgress />
        </Box>
      ) : (
        <Grid container spacing={3}>
          {products.map((product) => (
            <Grid item xs={12} sm={6} md={4} key={product._id}>
              <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                <CardMedia
                  component="img"
                  height="180"
                  image={product.image || "https://images.unsplash.com/photo-1582515073490-dbe8ec86b6c1?auto=format&fit=crop&w=600&q=80"}
                  alt={product.name}
                />
                <CardContent sx={{ flexGrow: 1 }}>
                  <Typography variant="h6">{product.name}</Typography>
                  <Typography variant="body2" sx={{ mb: 1 }}>Price: ₹{product.price}</Typography>
                  <Button variant="contained" size="small" onClick={() => addToCart(product)}>Add to Cart</Button>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Container>
  );
};

export default ProductListingPage;
