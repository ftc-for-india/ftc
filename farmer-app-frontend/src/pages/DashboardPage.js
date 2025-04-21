import React from "react";
import {
  Container,
  Typography,
  Box,
  Grid,
  Button,
  Card,
  CardMedia,
} from "@mui/material";
import { useNavigate } from "react-router-dom";

const DashboardPage = () => {
  const user = JSON.parse(localStorage.getItem("user")) || {};
  const navigate = useNavigate();

  return (
    <Box
      sx={{
        backgroundImage: "url('/images/saikiran-kesari-zSn8VuwV7Kg-unsplash.jpg')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        minHeight: "100vh",
        py: 5,
        px: 2,
      }}
    >
      <Container
        sx={{
          backgroundColor: "rgba(255, 255, 255, 0.9)",
          borderRadius: 3,
          p: 4,
          boxShadow: 3,
          textAlign: "center",
        }}
      >
        <Typography variant="h4" fontWeight={700} gutterBottom>
          Good Afternoon, {user.name || "Farmer Market Visitor"} 🌾
        </Typography>
        <Typography variant="body1" sx={{ mb: 3 }}>
          Buy directly from farmers. Freshness guaranteed. Fair prices. 🚜
        </Typography>

        <Card sx={{ maxWidth: 700, mx: "auto", mb: 4, borderRadius: 3, boxShadow: 4 }}>
          <CardMedia
            component="img"
            height="320"
            image="/images/tim-mossholder-xDwEa2kaeJA-unsplash.jpg"
            alt="Farm to Table"
          />
        </Card>

        <Grid container spacing={2} justifyContent="center">
          <Grid item>
            <Button
              variant="contained"
              color="success"
              size="large"
              onClick={() => navigate("/products")}
            >
              Shop Now
            </Button>
          </Grid>
          <Grid item>
            <Button
              variant="outlined"
              size="large"
              onClick={() => navigate("/cart")}
            >
              View Cart
            </Button>
          </Grid>
          <Grid item>
            <Button
              variant="outlined"
              size="large"
              onClick={() => navigate("/profile")}
            >
              My Profile
            </Button>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

export default DashboardPage;
