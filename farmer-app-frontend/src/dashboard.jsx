import React from "react";
import { Container, Typography, Box } from "@mui/material";

const DashboardPage = () => {
  const user = JSON.parse(localStorage.getItem("user")) || {};

  return (
    <Container>
      <Box sx={{ mt: 4 }}>
        <Typography variant="h4" gutterBottom>
          Welcome to Farmer Market, {user.name || "User"}!
        </Typography>
        <Typography variant="body1">
          Browse fresh produce from local farmers, manage your orders, or check your profile.
        </Typography>
      </Box>
    </Container>
  );
};

export default DashboardPage;
