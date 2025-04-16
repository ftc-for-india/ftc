import React, { useState } from "react";
import axios from "axios";
import { API_URL } from "../config/api";
import { useNavigate } from "react-router-dom";
import { TextField, Button, Container, Typography, Box, IconButton, InputAdornment, Snackbar, Alert } from "@mui/material";
import { Visibility, VisibilityOff, Google } from "@mui/icons-material";

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState(null);
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async () => {
    try {
      const response = await axios.post(`${API_URL}/auth/login`, { email, password });
      localStorage.setItem("token", response.data.token);
      setOpenSnackbar(true);
      setTimeout(() => navigate("/dashboard"), 2000);
    } catch (error) {
      setError("Login Failed: Invalid credentials");
    }
  };

  const handleGoogleLogin = () => {
    window.location.href = `${API_URL}/auth/google`; // Redirect to backend OAuth
  };

  return (
    <Container maxWidth="sm">
      <Box sx={{ padding: "20px", textAlign: "center", boxShadow: 3, borderRadius: 2, mt: 5, bgcolor: "white" }}>
        <Typography variant="h4" gutterBottom>Login</Typography>
        {error && <Alert severity="error">{error}</Alert>}
        <TextField fullWidth label="Email" margin="normal" value={email} onChange={(e) => setEmail(e.target.value)} />
        <TextField 
          fullWidth 
          type={showPassword ? "text" : "password"} 
          label="Password" 
          margin="normal" 
          value={password} 
          onChange={(e) => setPassword(e.target.value)}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton onClick={() => setShowPassword(!showPassword)}>
                  {showPassword ? <VisibilityOff /> : <Visibility />}
                </IconButton>
              </InputAdornment>
            ),
          }}
        />
        <Button variant="contained" color="primary" fullWidth onClick={handleLogin} sx={{ mt: 2 }}>Login</Button>
        <Button variant="outlined" color="secondary" fullWidth startIcon={<Google />} onClick={handleGoogleLogin} sx={{ mt: 2 }}>Login with Google</Button>
        <Typography variant="body2" sx={{ mt: 2 }}>Don't have an account? <Button onClick={() => navigate("/register")} sx={{ textTransform: "none" }}>Register</Button></Typography>
        <Typography variant="body2" sx={{ mt: 1 }}><Button onClick={() => navigate("/forgot-password")} sx={{ textTransform: "none" }}>Forgot Password?</Button></Typography>
      </Box>
      <Snackbar open={openSnackbar} autoHideDuration={3000} onClose={() => setOpenSnackbar(false)}>
        <Alert severity="success">Login Successful! Redirecting...</Alert>
      </Snackbar>
    </Container>
  );
};

export default LoginPage;
