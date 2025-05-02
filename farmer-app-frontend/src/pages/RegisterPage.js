import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import {
  TextField, Button, Container, Typography, Box, IconButton,
  InputAdornment, Snackbar, Alert, Paper, Divider, CircularProgress,
  FormControlLabel, Radio, RadioGroup, FormControl, FormLabel,
  Stepper, Step, StepLabel, StepContent, Fade, Chip,Grid
} from "@mui/material";
import {
  Visibility, VisibilityOff, Google, Facebook,
  Email, Lock, Person, Phone, LocationOn, ArrowBack, ArrowForward,
  Agriculture, Spa, Home
} from "@mui/icons-material";
import AnimatedLogo from "../components/AnimatedLogo";
import { API_URL } from "../config/api";
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
    address: {
      street: "",
      city: "",
      state: "",
      pincode: ""
    },
    userType: "consumer",
    farmDetails: {
      farmName: "",
      farmSize: "",
      products: []
    }
  });
  
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState("success");
  const [formErrors, setFormErrors] = useState({});
  const [productInput, setProductInput] = useState("");
  
  // Define steps based on user type
  const baseSteps = [
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
      fields: ['address.street', 'address.city', 'address.state', 'address.pincode']
    }
  ];
  
  const farmerSteps = [
    ...baseSteps,
    {
      label: 'Farm Details',
      description: 'Tell us about your farm',
      fields: ['farmDetails.farmName', 'farmDetails.farmSize', 'farmDetails.products']
    }
  ];
  
  const steps = userData.userType === 'farmer' ? farmerSteps : baseSteps;
  
  // Reset farm step when changing user type
  useEffect(() => {
    if (userData.userType !== 'farmer' && activeStep >= baseSteps.length) {
      setActiveStep(baseSteps.length - 1);
    }
  }, [userData.userType, activeStep, baseSteps.length]);
  
  const validateStep = (step) => {
    const errors = {};
    const currentFields = steps[step].fields;
    
    currentFields.forEach(field => {
      // Handle nested fields
      if (field.includes('.')) {
        const [parent, child] = field.split('.');
        if (!userData[parent][child] && field !== 'farmDetails.products') {
          errors[field] = `${child.charAt(0).toUpperCase() + child.slice(1)} is required`;
        }
      } else if (!userData[field] && field !== 'farmDetails.products') {
        errors[field] = `${field.charAt(0).toUpperCase() + field.slice(1)} is required`;
      }
    });
    
    if (currentFields.includes('email')) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (userData.email && !emailRegex.test(userData.email)) {
        errors.email = "Invalid email format";
      }
    }
    
    if (currentFields.includes('phone')) {
      const phoneRegex = /^\+?[\d\s-]{10,}$/;
      if (userData.phone && !phoneRegex.test(userData.phone)) {
        errors.phone = "Please enter a valid phone number";
      }
    }
    
    if (currentFields.includes('password')) {
      const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
      if (userData.password && !passwordRegex.test(userData.password)) {
        errors.password = "Password must contain at least one uppercase letter, one lowercase letter, one number and one special character";
      }
      
      if (userData.password !== userData.confirmPassword) {
        errors.confirmPassword = "Passwords do not match";
      }
    }
    
    if (currentFields.includes('address.pincode')) {
      const pincodeRegex = /^\d{6}$/;
      if (userData.address.pincode && !pincodeRegex.test(userData.address.pincode)) {
        errors['address.pincode'] = "Pincode must be 6 digits";
      }
    }
    
    if (currentFields.includes('farmDetails.farmSize')) {
      const farmSizeRegex = /^\d+(\.\d{1,2})?\s*(acres|hectares)$/i;
      if (userData.farmDetails.farmSize && !farmSizeRegex.test(userData.farmDetails.farmSize)) {
        errors['farmDetails.farmSize'] = "Farm size must be a number followed by acres or hectares";
      }
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };
  
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setUserData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setUserData(prev => ({ ...prev, [name]: value }));
    }
    
    setFormErrors(prev => ({ ...prev, [name]: '' }));
  };
  
  const handleAddProduct = () => {
    if (productInput.trim() && productInput.length <= 50) {
      setUserData(prev => ({
        ...prev,
        farmDetails: {
          ...prev.farmDetails,
          products: [...prev.farmDetails.products, productInput.trim()]
        }
      }));
      setProductInput("");
    }
  };
  
  const handleRemoveProduct = (index) => {
    setUserData(prev => ({
      ...prev,
      farmDetails: {
        ...prev.farmDetails,
        products: prev.farmDetails.products.filter((_, i) => i !== index)
      }
    }));
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
      // Format the data according to the API requirements
      const formattedData = {
        name: `${userData.firstName} ${userData.lastName}`,
        email: userData.email,
        password: userData.password,
        phone: userData.phone,
        address: userData.address.street,
        city: userData.address.city,
        state: userData.address.state,
        pincode: userData.address.pincode,
        userType: userData.userType
      };
      
      // Add farm details if user is a farmer
      if (userData.userType === 'farmer') {
        formattedData.farmDetails = {
          farmName: userData.farmDetails.farmName,
          farmSize: userData.farmDetails.farmSize,
          products: userData.farmDetails.products
        };
      }
      
      const apiUrl = API_URL || process.env.REACT_APP_API_URL || 'http://localhost:5000';
      const response = await axios.post(`${apiUrl}/api/auth/register`, formattedData);
      
      // Store token and user data
      if (response.data.token) {
        localStorage.setItem("token", response.data.token);
        localStorage.setItem("user", JSON.stringify(response.data.user));
        
        setSnackbarMessage("Registration successful! Redirecting to dashboard...");
        setSnackbarSeverity("success");
        setOpenSnackbar(true);
        
        // Redirect after a short delay
        setTimeout(() => {
          navigate("/dashboard");
        }, 2000);
      }
    } catch (err) {
      console.error("Registration error:", err);
      setError(
        err.response?.data?.message || 
        "Registration failed. Please check your information and try again."
      );
      
      setSnackbarMessage(
        err.response?.data?.message || 
        "Registration failed. Please check your information and try again."
      );
      setSnackbarSeverity("error");
      setOpenSnackbar(true);
    } finally {
      setLoading(false);
    }
  };
  
  const handleSocialRegister = (provider) => {
    const apiUrl = API_URL || process.env|| 'http://localhost:5000';
    window.location.href = `${apiUrl}/auth/${provider}`;
  };
  
  const handleCloseSnackbar = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setOpenSnackbar(false);
  };
  
  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      if (activeStep === steps.length - 1) {
        handleRegister();
      } else {
        handleNext();
      }
    }
  };
  
  const getStepContent = (step) => {
    switch (step) {
      case 0:
        return (
          <Box sx={{ mt: 2 }}>
            <FormControl component="fieldset">
              <FormLabel component="legend">I am a:</FormLabel>
              <RadioGroup
                name="userType"
                value={userData.userType}
                onChange={handleInputChange}
                row
              >
                <FormControlLabel
                  value="consumer"
                  control={<Radio color="primary" />}
                  label={
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Person sx={{ mr: 1 }} />
                      Consumer
                    </Box>
                  }
                />
                <FormControlLabel
                  value="farmer"
                  control={<Radio color="primary" />}
                  label={
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Agriculture sx={{ mr: 1 }} />
                      Farmer
                    </Box>
                  }
                />
              </RadioGroup>
            </FormControl>
            
            <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
              {userData.userType === 'consumer' 
                ? 'Register as a consumer to browse and purchase fresh produce directly from farmers.' 
                : 'Register as a farmer to list and sell your produce directly to consumers.'}
            </Typography>
          </Box>
        );
      
      case 1:
        return (
          <Box sx={{ mt: 2 }}>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="First Name"
                  name="firstName"
                  value={userData.firstName}
                  onChange={handleInputChange}
                  onKeyPress={handleKeyPress}
                  error={!!formErrors.firstName}
                  helperText={formErrors.firstName}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Person color="primary" />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Last Name"
                  name="lastName"
                  value={userData.lastName}
                  onChange={handleInputChange}
                  onKeyPress={handleKeyPress}
                  error={!!formErrors.lastName}
                  helperText={formErrors.lastName}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Person color="primary" />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Email"
                  name="email"
                  type="email"
                  value={userData.email}
                  onChange={handleInputChange}
                  onKeyPress={handleKeyPress}
                  error={!!formErrors.email}
                  helperText={formErrors.email}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Email color="primary" />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Phone Number"
                  name="phone"
                  value={userData.phone}
                  onChange={handleInputChange}
                  onKeyPress={handleKeyPress}
                  error={!!formErrors.phone}
                  helperText={formErrors.phone}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Phone color="primary" />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
            </Grid>
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
            <TextField
              fullWidth
              label="Confirm Password"
              name="confirmPassword"
              type={showConfirmPassword ? "text" : "password"}
              value={userData.confirmPassword}
              onChange={handleInputChange}
              onKeyPress={handleKeyPress}
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
            <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
              Password must contain at least 8 characters, including uppercase, lowercase, 
              number and special character.
            </Typography>
          </Box>
        );
      
      case 3:
        return (
          <Box sx={{ mt: 2 }}>
            <TextField
              fullWidth
              label="Street Address"
              name="address.street"
              value={userData.address.street}
              onChange={handleInputChange}
              onKeyPress={handleKeyPress}
              error={!!formErrors['address.street']}
              helperText={formErrors['address.street']}
              margin="normal"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Home color="primary" />
                  </InputAdornment>
                ),
              }}
            />
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="City"
                  name="address.city"
                  value={userData.address.city}
                  onChange={handleInputChange}
                  onKeyPress={handleKeyPress}
                  error={!!formErrors['address.city']}
                  helperText={formErrors['address.city']}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <LocationOn color="primary" />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="State"
                  name="address.state"
                  value={userData.address.state}
                  onChange={handleInputChange}
                  onKeyPress={handleKeyPress}
                  error={!!formErrors['address.state']}
                  helperText={formErrors['address.state']}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <LocationOn color="primary" />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Pincode"
                  name="address.pincode"
                  value={userData.address.pincode}
                  onChange={handleInputChange}
                  onKeyPress={handleKeyPress}
                  error={!!formErrors['address.pincode']}
                  helperText={formErrors['address.pincode']}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <LocationOn color="primary" />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
            </Grid>
          </Box>
        );
      
      case 4:
        return (
          <Box sx={{ mt: 2 }}>
            <TextField
              fullWidth
              label="Farm Name"
              name="farmDetails.farmName"
              value={userData.farmDetails.farmName}
              onChange={handleInputChange}
              onKeyPress={handleKeyPress}
              error={!!formErrors['farmDetails.farmName']}
              helperText={formErrors['farmDetails.farmName']}
              margin="normal"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Agriculture color="primary" />
                  </InputAdornment>
                ),
              }}
            />
            <TextField
              fullWidth
              label="Farm Size (e.g., 5 acres)"
              name="farmDetails.farmSize"
              value={userData.farmDetails.farmSize}
              onChange={handleInputChange}
              onKeyPress={handleKeyPress}
              error={!!formErrors['farmDetails.farmSize']}
              helperText={formErrors['farmDetails.farmSize']}
              margin="normal"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Spa color="primary" />
                  </InputAdornment>
                ),
              }}
            />
            
            <Box sx={{ mt: 2 }}>
              <Typography variant="subtitle1" gutterBottom>
                Products you grow:
              </Typography>
              <Box sx={{ display: 'flex', mb: 2 }}>
                <TextField
                  fullWidth
                  label="Add a product"
                  value={productInput}
                  onChange={(e) => setProductInput(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddProduct();
                    }
                  }}
                  sx={{ mr: 1 }}
                />
                <Button 
                  variant="contained" 
                  onClick={handleAddProduct}
                  disabled={!productInput.trim()}
                >
                  Add
                </Button>
              </Box>
              
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {userData.farmDetails.products.map((product, index) => (
                  <Chip
                    key={index}
                    label={product}
                    onDelete={() => handleRemoveProduct(index)}
                    color="primary"
                    variant="outlined"
                  />
                ))}
              </Box>
              
              {userData.farmDetails.products.length === 0 && (
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                  Add the products you grow on your farm.
                </Typography>
              )}
            </Box>
          </Box>
        );
      
      default:
        return "Unknown step";
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
              Join Farmer's Market
            </Typography>
          </Box>

          <Box flex={2}>
            <Paper elevation={3} sx={{ p: 4, borderRadius: 2 }}>
              <Typography variant="h4" className="login-title" gutterBottom>
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
                      <Typography variant="body2" color="text.secondary">
                        {step.description}
                      </Typography>
                      {getStepContent(index)}
                      <Box sx={{ mb: 2, mt: 3 }}>
                        <div>
                          <Button
                            variant="contained"
                            onClick={index === steps.length - 1 ? handleRegister : handleNext}
                            sx={{ mt: 1, mr: 1 }}
                            disabled={loading}
                            endIcon={index === steps.length - 1 ? null : <ArrowForward />}
                          >
                            {index === steps.length - 1 ? 'Register' : 'Continue'}
                            {loading && index === steps.length - 1 && (
                              <CircularProgress size={24} sx={{ ml: 1 }} />
                            )}
                          </Button>
                          <Button
                            disabled={index === 0 || loading}
                            onClick={handleBack}
                            sx={{ mt: 1, mr: 1 }}
                            startIcon={<ArrowBack />}
                          >
                            Back
                          </Button>
                        </div>
                      </Box>
                    </StepContent>
                  </Step>
                ))}
              </Stepper>
              
              {activeStep === steps.length && (
                <Paper square elevation={0} sx={{ p: 3 }}>
                  <Typography>All steps completed - you're finished</Typography>
                  <Button onClick={() => navigate('/dashboard')} sx={{ mt: 1, mr: 1 }}>
                    Go to Dashboard
                  </Button>
                </Paper>
              )}
              
              <Divider sx={{ my: 3 }}>
                <Typography variant="body2" color="text.secondary">
                  OR
                </Typography>
              </Divider>
              
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Button
                  fullWidth
                  variant="outlined"
                  color="primary"
                  startIcon={<Google />}
                  onClick={() => handleSocialRegister('google')}
                >
                  Register with Google
                </Button>
                <Button
                  fullWidth
                  variant="outlined"
                  color="primary"
                  startIcon={<Facebook />}
                  onClick={() => handleSocialRegister('facebook')}
                >
                  Register with Facebook
                </Button>
              </Box>
              
              <Box sx={{ mt: 3, textAlign: 'center' }}>
                <Typography variant="body2">
                  Already have an account?{' '}
                  <Link to="/loginpage" style={{ textDecoration: 'none' }}>
                    <Button color="primary">Login</Button>
                  </Link>
                </Typography>
              </Box>
            </Paper>
          </Box>
        </Box>
      </Container>
      
      <Snackbar
        open={openSnackbar}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbarSeverity} sx={{ width: '100%' }}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </div>
  );
};

export default RegisterPage;