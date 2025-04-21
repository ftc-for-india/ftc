import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import {
  TextField, Button, Container, Typography, Box,
  Alert, Snackbar
} from "@mui/material";
import "../styles/login.css";

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
      await axios.post(`${process.env.MONGO_URI}/auth/register`, formData);
      setOpenSnackbar(true);
      setTimeout(() => navigate("/loginpage"), 2000);
    } catch (err) {
      setError("Registration failed. Please try again.");
    }
  };

  return (
    <div className="login-background">
      <Container maxWidth="md">
        <Box className="login-box" mt={5}>
          <Box flex={1} className="side-image-box">
            <img src="/zoe-richardson-c3rmcDjVDbc-unsplash.jpg" alt="Side" className="side-image" />
          </Box>

          <Box flex={2} className="login-form-box">
            <Typography variant="h4" className="login-title">Create an Account</Typography>
            {error && <Alert severity="error">{error}</Alert>}

            <TextField name="name" label="Name" fullWidth margin="normal" value={formData.name} onChange={handleChange} />
            <TextField name="email" label="Email" fullWidth margin="normal" value={formData.email} onChange={handleChange} />
            <TextField name="password" type="password" label="Password" fullWidth margin="normal" value={formData.password} onChange={handleChange} />

            <Button fullWidth variant="contained" color="primary" onClick={handleRegister} sx={{ mt: 2 }}>
              Register
            </Button>
            <Typography variant="body2" sx={{ mt: 2 }}>
              Already have an account?{" "}
              <Button onClick={() => navigate("/loginpage")} sx={{ textTransform: "none" }}>
                Login
              </Button>
            </Typography>
          </Box>
        </Box>

        <Snackbar open={openSnackbar} autoHideDuration={3000} onClose={() => setOpenSnackbar(false)}>
          <Alert severity="success">Registration successful! Redirecting to login...</Alert>
        </Snackbar>
      </Container>
    </div>
  );
};

export default RegisterPage;
