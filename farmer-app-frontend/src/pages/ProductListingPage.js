import React, { useEffect, useState } from "react";
import axios from "axios";
import { API_URL } from "../config/api";
import { Card, CardContent, Typography, Grid, Button } from "@mui/material";

const ProductListingPage = () => {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    axios.get(`${API_URL}/products`).then((response) => setProducts(response.data));
  }, []);

  return (
    <Grid container spacing={2} sx={{ padding: "20px" }}>
      {products.map((product) => (
        <Grid item xs={12} md={4} key={product._id}>
          <Card>
            <CardContent>
              <Typography variant="h6">{product.name}</Typography>
              <Typography variant="body1">${product.price}</Typography>
              <Button component={Link} to={`/farmer/${product.farmerId}`}>View Farmer                   Profile</Button>
              <Button variant="contained" color="primary" size="large">Add to Cart</Button>
            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>
  );
};

export default ProductListingPage;
