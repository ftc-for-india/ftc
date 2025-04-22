import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import {
  TextField, Button, Container, Typography, Box, IconButton,
  InputAdornment, Snackbar, Alert, Paper, Divider, CircularProgress,
  FormControlLabel, Radio, RadioGroup, FormControl, FormLabel,
  Stepper, Step, StepLabel, StepContent, Fade
} from "@mui/material";
import {
  Visibility, VisibilityOff, Google, Facebook,
  Email, Lock, Person, Phone, LocationOn, ArrowBack, ArrowForward
} from "@mui/icons-material";
import AnimatedLogo from "../components/AnimatedLogo";
import "../styles/login.css";

const RegisterPage = () => {
  const navigate = useNavigate();
  const [activeStep, setActiveStep] = useState(0);
  const [userData, setUserData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    pincode: "",
    userType: "consumer"
  });
  
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [formErrors, setFormErrors] = useState({});
  
  const steps = [
    {
      label: 'Account Type',
      description: 'Select your account type',
      fields: ['userType']
    },
    {
      label: 'Personal Information',
      description: 'Enter your personal details',
      fields: ['firstName', 'lastName', 'email', 'phone']
    },
    {
      label: 'Security',
      description: 'Create a secure password',
      fields: ['password', 'confirmPassword']
    },
    {
      label: 'Address',
      description: 'Enter your address details',
      fields: ['address', 'city', 'state', 'pincode']
    }
  ];
  
  const validateStep = (step) => {
    const errors = {};
    const currentFields = steps[step].fields;
    
    if (currentFields.includes('firstName') && !userData.firstName) {
      errors.firstName = "First name is required";
    }
    
    if (currentFields.includes('lastName') && !userData.lastName) {
      errors.lastName = "Last name is required";
    }
    
    if (currentFields.includes('email')) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!userData.email) {
        errors.email = "Email is required";
      } else if (!emailRegex.test(userData.email)) {
        errors.email = "Invalid email format";
      }
    }
    
    if (currentFields.includes('phone')) {
      const phoneRegex = /^\d{10}$/;
      if (userData.phone && !phoneRegex.test(userData.phone)) {
        errors.phone = "Phone number must be 10 digits";
      }
    }
    
    if (currentFields.includes('password')) {
      if (!userData.password) {
        errors.password = "Password is required";
      } else if (userData.password.length < 6) {
        errors.password = "Password must be at least 6 characters";
      }
      
      if (!userData.confirmPassword) {
        errors.confirmPassword = "Please confirm your password";
      } else if (userData.password !== userData.confirmPassword) {
        errors.confirmPassword = "Passwords do not match";
      }
    }
    
    if (currentFields.includes('pincode') && userData.pincode) {
      const pincodeRegex = /^\d{6}$/;
      if (!pincodeRegex.test(userData.pincode)) {
        errors.pincode = "Pincode must be 6 digits";
      }
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };
  
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUserData(prev => ({ ...prev, [name]: value }));
    setFormErrors(prev => ({ ...prev, [name]: '' }));
  };
  
  const handleNext = () => {
    if (validateStep(activeStep)) {
      setActiveStep((prevActiveStep) => prevActiveStep + 1);
    }
  };
  
  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };
  
  const handleRegister = async () => {
    if (!validateStep(activeStep)) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000';
      const res = await axios.post(`${apiUrl}/api/auth/register`, userData);
      
      if (res.data) {
        setOpenSnackbar(true);
        setTimeout(() => navigate("/loginpage"), 2000);
      }
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };
  
  const handleSocialLogin = (provider) => {
    window.location.href = `${process.env.REACT_APP_API_URL}/auth/${provider}`;
  };
  
  const renderStepContent = (step) => {
    switch (step) {
      case 0:
        return (
          <Box sx={{ mt: 2 }}>
            <FormControl component="fieldset">
              <FormLabel component="legend">Select Account Type</FormLabel>
              <RadioGroup
                name="userType"
                value={userData.userType}
                onChange={handleInputChange}
                sx={{ mt: 2 }}
              >
                <FormControlLabel 
                  value="consumer" 
                  control={<Radio />} 
                  label="Consumer (Buy farm products)" 
                />
                <FormControlLabel 
                  value="farmer" 
                  control={<Radio />} 
                  label="Farmer (Sell your products)" 
                />
              </RadioGroup>
            </FormControl>
          </Box>
        );
      
      case 1:
        return (
          <Box sx={{ mt: 2 }}>
            <TextField
              fullWidth
              label="First Name"
              name="firstName"
              value={userData.firstName}
              onChange={handleInputChange}
              error={!!formErrors.firstName}
              helperText={formErrors.firstName}
              margin="normal"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Person color="primary" />
                  </InputAdornment>
                ),
              }}
            />
            
            <TextField
              fullWidth
              label="Last Name"
              name="lastName"
              value={userData.lastName}
              onChange={handleInputChange}
              error={!!formErrors.lastName}
              helperText={formErrors.lastName}
              margin="normal"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Person color="primary" />
                  </InputAdornment>
                ),
              }}
            />
            
            <TextField
              fullWidth
              label="Email"
              name="email"
              type="email"
              value={userData.email}
              onChange={handleInputChange}
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
              label="Phone Number (optional)"
              name="phone"
              value={userData.phone}
              onChange={handleInputChange}
              error={!!formErrors.phone}
              helperText={formErrors.phone}
              margin="normal"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Phone color="primary" />
                  </InputAdornment>
                ),
              }}
            />
          </Box>
        );
      
      case 2:
        return (
          <Box sx={{ mt: 2 }}>
            <TextField
              fullWidth
              label="Password"
              name="password"
              type={showPassword ? "text" : "password"}
              value={userData.password}
              onChange={handleInputChange}
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
            
            <TextField
              fullWidth
              label="Confirm Password"
              name="confirmPassword"
              type={showConfirmPassword ? "text" : "password"}
              value={userData.confirmPassword}
              onChange={handleInputChange}
              error={!!formErrors.confirmPassword}
              helperText={formErrors.confirmPassword}
              margin="normal"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Lock color="primary" />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
                      {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
          </Box>
        );
      
      case 3:
        return (
          <Box sx={{ mt: 2 }}>
            <TextField
              fullWidth
              label="Address"
              name="address"
              value={userData.address}
              onChange={handleInputChange}
              error={!!formErrors.address}
              helperText={formErrors.address}
              margin="normal"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <LocationOn color="primary" />
                  </InputAdornment>
                ),
              }}
            />
            
            <TextField
              fullWidth
              label="City"
              name="city"
              value={userData.city}
              onChange={handleInputChange}
              error={!!formErrors.city}
              helperText={formErrors.city}
              margin="normal"
            />
            
            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField
                fullWidth
                label="State"
                name="state"
                value={userData.state}
                onChange={handleInputChange}
                error={!!formErrors.state}
                helperText={formErrors.state}
                margin="normal"
              />
              
              <TextField
                fullWidth
                label="Pincode"
                name="pincode"
                value={userData.pincode}
                onChange={handleInputChange}
                error={!!formErrors.pincode}
                helperText={formErrors.pincode}
                margin="normal"
              />
            </Box>
          </Box>
        );
      
      default:
        return null;
    }
  };
  
  return (
    <div className="register-background">
      <Container maxWidth="lg">
        <Fade in={true} timeout={1000}>
          <Box display="flex" justifyContent="center" mt={4}>
            <AnimatedLogo />
          </Box>
        </Fade>
        
        <Box display="flex" className="register-box">
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
              Join Our Farming Community
            </Typography>
          </Box>
          
          <Box flex={2}>
            <Paper elevation={3} sx={{ p: 4, borderRadius: 2 }}>
              <Typography variant="h4" className="register-title" gutterBottom>
                Create an Account
              </Typography>
              
              {error && (
                <Alert severity="error" sx={{ mb: 2 }}>
                  {error}
                </Alert>
              )}
              
              <Stepper activeStep={activeStep} orientation="vertical">
                {steps.map((step, index) => (
                  <Step key={step.label}>
                    <StepLabel>{step.label}</StepLabel>
                    <StepContent>
                      <Typography>{step.description}</Typography>
                      {renderStepContent(index)}
                      <Box sx={{ mb: 2, mt: 2 }}>
                        <div>
                          <Button
                                                        variant="contained"
                                                        disabled={loading}
                                                        onClick={index === steps.length - 1 ? handleRegister : handleNext}
                                                        sx={{ mt: 1, mr: 1 }}
                                                        endIcon={index === steps.length - 1 ? null : <ArrowForward />}
                                                      >
                                                        {index === steps.length - 1 ? 'Register' : 'Continue'}
                                                      </Button>
                                                      {index > 0 && (
                                                        <Button
                                                          onClick={handleBack}
                                                          sx={{ mt: 1, mr: 1 }}
                                                          startIcon={<ArrowBack />}
                                                        >
                                                          Back
                                                        </Button>
                                                      )}
                                                    </div>
                                                  </Box>
                                                </StepContent>
                                              </Step>
                                            ))}
                                          </Stepper>
                                          
                                          {activeStep === steps.length && (
                                            <Box sx={{ p: 3, textAlign: 'center' }}>
                                              <Typography variant="h6" gutterBottom>
                                                Registration Complete!
                                              </Typography>
                                              <Typography variant="body1" paragraph>
                                                Your account has been created successfully. You will be redirected to the login page shortly.
                                              </Typography>
                                              <CircularProgress sx={{ mt: 2 }} />
                                            </Box>
                                          )}
                                          
                                          <Divider sx={{ my: 3 }}>OR</Divider>
                                          
                                          <Box sx={{ display: 'flex', gap: 2 }}>
                                            <Button
                                              variant="outlined"
                                              color="error"
                                              fullWidth
                                              startIcon={<Google />}
                                              onClick={() => handleSocialLogin('google')}
                                            >
                                              Sign up with Google
                                            </Button>
                                            <Button
                                              variant="outlined"
                                              color="primary"
                                              fullWidth
                                              startIcon={<Facebook />}
                                              onClick={() => handleSocialLogin('facebook')}
                                            >
                                              Sign up with Facebook
                                            </Button>
                                          </Box>
                                          
                                          <Box sx={{ mt: 3, textAlign: 'center' }}>
                                            <Typography variant="body2">
                                              Already have an account?{" "}
                                              <Button
                                                onClick={() => navigate("/loginpage")}
                                                sx={{ textTransform: "none" }}
                                              >
                                                Login
                                              </Button>
                                            </Typography>
                                          </Box>
                                        </Paper>
                                      </Box>
                                    </Box>
                                    
                                    <Snackbar
                                      open={openSnackbar}
                                      autoHideDuration={2000}
                                      onClose={() => setOpenSnackbar(false)}
                                      anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
                                    >
                                      <Alert severity="success" variant="filled">
                                        Registration successful! Redirecting to login...
                                      </Alert>
                                    </Snackbar>
                                  </Container>
                                </div>
                              );
                            };
                            
                            export default RegisterPage;