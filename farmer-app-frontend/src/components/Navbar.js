import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { AppBar, Toolbar, Typography, Button, Box, Avatar } from "@mui/material";
import AgricultureIcon from '@mui/icons-material/Agriculture';

const Navbar = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const handleLogout = () => {
    localStorage.clear();
    navigate("/");
  };

  return (
    <AppBar position="sticky" sx={{ backgroundColor: "#388e3c" }}>
      <Toolbar>
        <Box sx={{ display: 'flex', alignItems: 'center', flexGrow: 1 }}>
          <AgricultureIcon sx={{ mr: 1 }} />
          <Typography variant="h6" component="div" sx={{ flexGrow: 1, fontWeight: 600 }}>
            Farmer Market
          </Typography>
        </Box>
        {token ? (
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button color="inherit" component={Link} to="/dashboard">Dashboard</Button>
            <Button color="inherit" component={Link} to="/products">Products</Button>
            <Button color="inherit" component={Link} to="/cart">Cart</Button>
            <Button color="inherit" component={Link} to="/order-tracking">Track</Button>
            <Button color="inherit" component={Link} to="/profile">Profile</Button>
            <Button color="inherit" onClick={handleLogout}>Logout</Button>
          </Box>
        ) : (
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button color="inherit" component={Link} to="/">Login</Button>
            <Button color="inherit" component={Link} to="/register">Register</Button>
          </Box>
        )}
      </Toolbar>
    </AppBar>
  );
};

export default Navbar