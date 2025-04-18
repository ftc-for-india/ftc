import React, { useState } from "react";
import axios from "axios";
import { API_URL } from "../config/api";
import { useNavigate } from "react-router-dom";
import {
  Container,
  TextField,
  Typography,
  Box,
  Button,
  Alert,
  Snackbar
} from "@mui/material";

const RegisterPage = () => {
  const [formData, setFormData] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState(null);
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRegister = async () => {
    try {
      await axios.post(`${API_URL}/auth/register`, formData);
      setOpenSnackbar(true);
      setTimeout(() => navigate("/"), 2000);
    } catch (err) {
      setError("Registration failed. Please try again.");
    }
  };

  return (
    <Container maxWidth="sm">
      <Box sx={{ padding: 4, boxShadow: 3, borderRadius: 2, mt: 5, bgcolor: "white" }}>
        <Typography variant="h4" gutterBottom textAlign="center">Register</Typography>
        {error && <Alert severity="error">{error}</Alert>}
        <TextField name="name" label="Name" fullWidth margin="normal" value={formData.name} onChange={handleChange} />
        <TextField name="email" label="Email" fullWidth margin="normal" value={formData.email} onChange={handleChange} />
        <TextField name="password" type="password" label="Password" fullWidth margin="normal" value={formData.password} onChange={handleChange} />
        <Button fullWidth variant="contained" color="primary" onClick={handleRegister} sx={{ mt: 2 }}>
          Register
        </Button>
      </Box>
      <Snackbar open={openSnackbar} autoHideDuration={3000} onClose={() => setOpenSnackbar(false)}>
        <Alert severity="success">Registration successful! Redirecting to login...</Alert>
      </Snackbar>
    </Container>
  );
};

export default RegisterPage;
