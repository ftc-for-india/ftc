import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import {
  TextField, Button, Container, Typography, Box, IconButton,
  InputAdornment, Snackbar, Alert
} from "@mui/material";
import { Visibility, VisibilityOff, Google } from "@mui/icons-material";
import AnimatedLogo from "../components/AnimatedLogo";
import "../styles/login.css";

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState(null);
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async () => {
    try {
      const res = await axios.post(`${process.env.MONGO_URI}/auth/login`, {
        email,
        password,
      });

      if (res.data.token) {
        localStorage.setItem("token", res.data.token);
        setOpenSnackbar(true);
        setTimeout(() => navigate("/dashboard"), 2000);
      } else {
        setError("Login failed");
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    }
  };

  const handleGoogleLogin = () => {
    window.location.href = `${process.env.MONGO_URI}/auth/google`;
  };

  return (
    <div className="login-background">
      <Container maxWidth="lg">
        <Box display="flex" justifyContent="center" mt={4}>
          <AnimatedLogo />
        </Box>

        <Box display="flex" className="login-box">
          <Box flex={1} className="side-image-box">
            <img src="/tim-mossholder-xDwEa2kaeJA-unsplash.jpg" alt="Side1" className="side-image" />
          </Box>

          <Box flex={2} className="login-form-box">
            <Typography variant="h4" className="login-title">Farmer Login</Typography>
            {error && <Alert severity="error">{error}</Alert>}

            <TextField
              fullWidth label="Email" margin="normal"
              value={email} onChange={(e) => setEmail(e.target.value)}
            />
            <TextField
              fullWidth label="Password"
              type={showPassword ? "text" : "password"}
              margin="normal"
              value={password} onChange={(e) => setPassword(e.target.value)}
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
            <Button variant="contained" color="primary" fullWidth onClick={handleLogin} sx={{ mt: 2 }}>
              Login
            </Button>
            <Button variant="outlined" color="secondary" fullWidth startIcon={<Google />} onClick={handleGoogleLogin} sx={{ mt: 2 }}>
              Login with Google
            </Button>
            <Typography variant="body2" sx={{ mt: 2 }}>
              Don’t have an account?{" "}
              <Button onClick={() => navigate("/register")} sx={{ textTransform: "none" }}>
                Register
              </Button>
            </Typography>
            <Typography variant="body2">
              <Button onClick={() => navigate("/forgot-password")} sx={{ textTransform: "none" }}>
                Forgot Password?
              </Button>
            </Typography>
          </Box>

          <Box flex={1} className="side-image-box">
            <img src="/zoe-richardson-c3rmcDjVDbc-unsplash.jpg" alt="Side2" className="side-image" />
          </Box>
        </Box>

        <Snackbar open={openSnackbar} autoHideDuration={3000} onClose={() => setOpenSnackbar(false)}>
          <Alert severity="success">Login successful! Redirecting...</Alert>
        </Snackbar>
      </Container>
    </div>
  );
};

export default LoginPage;
