import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import {
  TextField, Button, Container, Typography, Box, IconButton,
  InputAdornment, Snackbar, Alert, Paper, Divider, CircularProgress,
  FormControlLabel, Checkbox, Fade
} from "@mui/material";
import {
  Visibility, VisibilityOff, Google, Facebook,
  Email, Lock, AccountCircle
} from "@mui/icons-material";
import AnimatedLogo from "../components/AnimatedLogo";
import "../styles/login.css";

const LoginPage = () => {
  const [credentials, setCredentials] = useState({
    email: "",
    password: "",
    rememberMe: false
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [formErrors, setFormErrors] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    // Check for saved credentials
    const savedEmail = localStorage.getItem("rememberedEmail");
    if (savedEmail) {
      setCredentials(prev => ({ ...prev, email: savedEmail, rememberMe: true }));
    }
  }, []);

  const validateForm = () => {
    const errors = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!credentials.email) {
      errors.email = "Email is required";
    } else if (!emailRegex.test(credentials.email)) {
      errors.email = "Invalid email format";
    }

    if (!credentials.password) {
      errors.password = "Password is required";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleInputChange = (e) => {
    const { name, value, checked } = e.target;
    setCredentials(prev => ({
      ...prev,
      [name]: name === 'rememberMe' ? checked : value
    }));
    setFormErrors(prev => ({ ...prev, [name]: '' }));
  };

  // ... existing code ...

const handleLogin = async () => {
   navigate('/dashboard');
    if (!validateForm()) return;

    setLoading(true);
    setError(null);

    try {
      const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000';
      const res = await axios.post(`${apiUrl}/api/auth/login`, {
        email: credentials.email,
        password: credentials.password,
      });

      if (res.data.token) {
        if (credentials.rememberMe) {
          localStorage.setItem("rememberedEmail", credentials.email);
        } else {
          localStorage.removeItem("rememberedEmail");
        }

        localStorage.setItem("token", res.data.token);
        localStorage.setItem("user", JSON.stringify(res.data.user));
        
        setOpenSnackbar(true);
        setTimeout(() => navigate("/dashboard"), 1500);
      }
    } catch (err) {
      setError(err.response?.data?.message || "Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
};

// ... existing code ...

  const handleSocialLogin = (provider) => {
    window.location.href = `${process.env.REACT_APP_API_URL}/auth/${provider}`;
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleLogin();
    }
  };

  return (
    <div className="login-background">
      <Container maxWidth="lg">
        <Fade in={true} timeout={1000}>
          <Box display="flex" justifyContent="center" mt={4}>
            <AnimatedLogo />
          </Box>
        </Fade>

        <Box display="flex" className="login-box">
          <Box flex={1} className="side-image-box">
            <img 
              src="/tim-mossholder-xDwEa2kaeJA-unsplash.jpg" 
              alt="Farming" 
              className="side-image"
            />
            <Typography
              variant="h5"
              sx={{
                position: 'absolute',
                bottom: 20,
                left: 20,
                color: 'white',
                textShadow: '2px 2px 4px rgba(0,0,0,0.5)'
              }}
            >
              Welcome to Farmer's Market
            </Typography>
          </Box>

          <Box flex={2}>
            <Paper elevation={3} sx={{ p: 4, borderRadius: 2 }}>
              <Typography variant="h4" className="login-title" gutterBottom>
                Farmer Login
              </Typography>
              
              {error && (
                <Alert severity="error" sx={{ mb: 2 }}>
                  {error}
                </Alert>
              )}

              <TextField
                fullWidth
                label="Email"
                name="email"
                value={credentials.email}
                onChange={handleInputChange}
                onKeyPress={handleKeyPress}
                error={!!formErrors.email}
                helperText={formErrors.email}
                margin="normal"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Email color="primary" />
                    </InputAdornment>
                  ),
                }}
              />

              <TextField
                fullWidth
                label="Password"
                name="password"
                type={showPassword ? "text" : "password"}
                value={credentials.password}
                onChange={handleInputChange}
                onKeyPress={handleKeyPress}
                error={!!formErrors.password}
                helperText={formErrors.password}
                margin="normal"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Lock color="primary" />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton onClick={() => setShowPassword(!showPassword)}>
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />

              <Box sx={{ mt: 1, mb: 2 }}>
                <FormControlLabel
                  control={
                    <Checkbox
                      name="rememberMe"
                      checked={credentials.rememberMe}
                      onChange={handleInputChange}
                      color="primary"
                    />
                  }
                  label="Remember me"
                />
              </Box>

              <Button
                variant="contained"
                color="primary"
                fullWidth
                onClick={handleLogin}
                disabled={loading}
                sx={{ 
                  mt: 2,
                  py: 1.5,
                  backgroundColor: '#2e7d32',
                  '&:hover': {
                    backgroundColor: '#1b5e20'
                  }
                }}
              >
                {loading ? <CircularProgress size={24} color="inherit" /> : 'Login'}
              </Button>

              <Divider sx={{ my: 3 }}>OR</Divider>

              <Box sx={{ display: 'flex', gap: 2 }}>
                <Button
                  variant="outlined"
                  color="error"
                  fullWidth
                  startIcon={<Google />}
                  onClick={() => handleSocialLogin('google')}
                >
                  Google
                </Button>
                <Button
                  variant="outlined"
                  color="primary"
                  fullWidth
                  startIcon={<Facebook />}
                  onClick={() => handleSocialLogin('facebook')}
                >
                  Facebook
                </Button>
              </Box>

              <Box sx={{ mt: 3, textAlign: 'center' }}>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  Don't have an account?{" "}
                  <Button
                    onClick={() => navigate("/register")}
                    sx={{ textTransform: "none" }}
                    startIcon={<AccountCircle />}
                  >
                    Register
                  </Button>
                </Typography>
                <Button
                  onClick={() => navigate("/forgot-password")}
                  sx={{ textTransform: "none" }}
                >
                  Forgot Password?
                </Button>
              </Box>
            </Paper>
          </Box>

          <Box flex={1} className="side-image-box">
            <img 
              src="/zoe-richardson-c3rmcDjVDbc-unsplash.jpg" 
              alt="Harvest" 
              className="side-image"
            />
          </Box>
        </Box>

        <Snackbar
          open={openSnackbar}
          autoHideDuration={2000}
          onClose={() => setOpenSnackbar(false)}
          anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        >
          <Alert severity="success" variant="filled">
            Login successful! Redirecting...
          </Alert>
        </Snackbar>
      </Container>
    </div>
  );
};

export default LoginPage;