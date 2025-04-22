import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container, Grid, Typography, Box, Button, Paper, Divider,
  TextField, Stepper, Step, StepLabel, Radio, RadioGroup,
  FormControlLabel, FormControl, FormLabel, CircularProgress,
  List, ListItem, ListItemText, Card, Chip,
  Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions,
  IconButton, Checkbox
} from '@mui/material';
import {
  Payment, CheckCircle,
  ArrowBack, ArrowForward, Edit, Delete,
  Add, Remove
} from '@mui/icons-material';
// ... existing code ...

import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';
import { useNotification } from '../contexts/NotificationContext';

const steps = ['Cart Review', 'Shipping Details', 'Payment', 'Confirmation'];

const CheckoutPage = () => {
  const navigate = useNavigate();
  const { isAuthenticated, currentUser } = useAuth();
  const { cart, updateCartItemQuantity, removeFromCart, clearCart, cartTotal } = useCart();
  const { showSnackbar } = useNotification();
  
  const [activeStep, setActiveStep] = useState(0);
  const [shippingAddress, setShippingAddress] = useState({
    fullName: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    pincode: ''
  });
  const [paymentMethod, setPaymentMethod] = useState('cod');
  const [loading, setLoading] = useState(false);
  const [savedAddresses, setSavedAddresses] = useState([]);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [addressFormVisible, setAddressFormVisible] = useState(true);
  const [orderSummary, setOrderSummary] = useState(null);
  const [confirmDialog, setConfirmDialog] = useState({
    open: false,
    title: '',
    message: '',
    onConfirm: null
  });
  
  useEffect(() => {
    if (!isAuthenticated) {
      showSnackbar('Please login to proceed with checkout', 'warning');
      navigate('/login', { state: { from: '/checkout' } });
      return;
    }
    
    if (cart.length === 0) {
      showSnackbar('Your cart is empty', 'warning');
      navigate('/products');
      return;
    }
    
    // Fetch saved addresses
    fetchSavedAddresses();
  }, [isAuthenticated, cart.length, navigate, showSnackbar]);
  
  useEffect(() => {
    // Pre-fill shipping form with user data if available
    if (currentUser) {
      setShippingAddress(prev => ({
        ...prev,
        fullName: currentUser.name || prev.fullName,
        phone: currentUser.phone || prev.phone
      }));
    }
  }, [currentUser]);
  
  const fetchSavedAddresses = async () => {
    try {
      const token = localStorage.getItem('token');
      const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000';
      
      const response = await axios.get(
        `${apiUrl}/users/addresses`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      
      setSavedAddresses(response.data);
      
      // If there are saved addresses, select the default one
      if (response.data.length > 0) {
        const defaultAddress = response.data.find(addr => addr.isDefault) || response.data[0];
        setSelectedAddress(defaultAddress._id);
        setShippingAddress(defaultAddress);
        setAddressFormVisible(false);
      }
    } catch (err) {
      console.error('Error fetching saved addresses:', err);
    }
  };
  
  const handleNext = () => {
    if (activeStep === 0) {
      // Validate cart
      if (cart.length === 0) {
        showSnackbar('Your cart is empty', 'warning');
        return;
      }
    } else if (activeStep === 1) {
      // Validate shipping details
      if (!selectedAddress && !validateShippingForm()) {
        return;
      }
    } else if (activeStep === 2) {
      // Process payment and create order
      placeOrder();
      return;
    }
    
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };
  
  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };
  
  const validateShippingForm = () => {
    // Basic validation
    if (!shippingAddress.fullName.trim()) {
      showSnackbar('Please enter your full name', 'warning');
      return false;
    }
    if (!shippingAddress.phone.trim() || !/^\d{10}$/.test(shippingAddress.phone)) {
      showSnackbar('Please enter a valid 10-digit phone number', 'warning');
      return false;
    }
    if (!shippingAddress.address.trim()) {
      showSnackbar('Please enter your address', 'warning');
      return false;
    }
    if (!shippingAddress.city.trim()) {
      showSnackbar('Please enter your city', 'warning');
      return false;
    }
    if (!shippingAddress.state.trim()) {
      showSnackbar('Please enter your state', 'warning');
      return false;
    }
    if (!shippingAddress.pincode.trim() || !/^\d{6}$/.test(shippingAddress.pincode)) {
      showSnackbar('Please enter a valid 6-digit pincode', 'warning');
      return false;
    }
    
    return true;
  };
  
  const handleShippingInputChange = (e) => {
    const { name, value } = e.target;
    setShippingAddress(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handlePaymentMethodChange = (e) => {
    setPaymentMethod(e.target.value);
  };
  
  const handleAddressSelect = (addressId) => {
    const selected = savedAddresses.find(addr => addr._id === addressId);
    if (selected) {
      setSelectedAddress(addressId);
      setShippingAddress(selected);
      setAddressFormVisible(false);
    }
  };
  
  const handleAddNewAddress = () => {
    setSelectedAddress(null);
    setShippingAddress({
      fullName: currentUser?.name || '',
      phone: currentUser?.phone || '',
      address: '',
      city: '',
      state: '',
      pincode: ''
    });
    setAddressFormVisible(true);
  };
  
  const handleSaveAddress = async () => {
    if (!validateShippingForm()) {
      return;
    }
    
    try {
      const token = localStorage.getItem('token');
      const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000';
      
      await axios.post(
        `${apiUrl}/users/addresses`,
        shippingAddress,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      
      // Refresh addresses
      fetchSavedAddresses();
      showSnackbar('Address saved successfully', 'success');
    } catch (err) {
      console.error('Error saving address:', err);
      showSnackbar('Failed to save address', 'error');
    }
  };
  
  const handleDeleteAddress = (addressId) => {
    setConfirmDialog({
      open: true,
      title: 'Delete Address',
      message: 'Are you sure you want to delete this address?',
      onConfirm: async () => {
        try {
          const token = localStorage.getItem('token');
          const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000';
          
          await axios.delete(
            `${apiUrl}/users/addresses/${addressId}`,
            {
              headers: {
                Authorization: `Bearer ${token}`
              }
            }
          );
          
          // Refresh addresses
          fetchSavedAddresses();
          showSnackbar('Address deleted successfully', 'success');
        } catch (err) {
          console.error('Error deleting address:', err);
          showSnackbar('Failed to delete address', 'error');
        } finally {
          setConfirmDialog(prev => ({ ...prev, open: false }));
        }
      }
    });
  };
  
  const placeOrder = async () => {
    setLoading(true);
    
    try {
      const token = localStorage.getItem('token');
      const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000';
      
      const orderData = {
        items: cart.map(item => ({
          product: item._id,
          quantity: item.quantity,
          price: item.price
        })),
        shippingAddress: selectedAddress || shippingAddress,
        paymentMethod,
        totalAmount: cartTotal,
        shippingFee: cartTotal >= 500 ? 0 : 50
      };
      
      const response = await axios.post(
        `${apiUrl}/orders`,
        orderData,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      
      setOrderSummary(response.data);
      
      // Clear cart after successful order
      clearCart();
      
      // Move to confirmation step
      setActiveStep(3);
    } catch (err) {
      console.error('Error placing order:', err);
      showSnackbar('Failed to place order', 'error');
    } finally {
      setLoading(false);
    }
  };
  
  const getStepContent = (step) => {
    switch (step) {
      case 0:
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              Review Your Cart
            </Typography>
            
            {cart.length === 0 ? (
              <Typography variant="body1" color="text.secondary" sx={{ my: 4, textAlign: 'center' }}>
                Your cart is empty
              </Typography>
            ) : (
              <>
                <List>
                  {cart.map((item) => (
                    <Paper key={item._id} sx={{ mb: 2, p: 2 }}>
                      <Grid container spacing={2} alignItems="center">
                        <Grid item xs={12} sm={2}>
                          <Box
                            component="img"
                            sx={{
                              width: '100%',
                              height: 80,
                              objectFit: 'cover',
                              borderRadius: 1
                            }}
                            src={item.imageUrl || 'https://via.placeholder.com/100x100?text=No+Image'}
                            alt={item.name}
                          />
                        </Grid>
                        <Grid item xs={12} sm={4}>
                          <Typography variant="subtitle1">
                            {item.name}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {item.category}
                          </Typography>
                        </Grid>
                        <Grid item xs={6} sm={2}>
                          <Box display="flex" alignItems="center">
                            <IconButton 
                              size="small" 
                              onClick={() => updateCartItemQuantity(item._id, item.quantity - 1)}
                              disabled={item.quantity <= 1}
                            >
                              <Remove fontSize="small" />
                            </IconButton>
                            <Typography sx={{ mx: 1 }}>
                              {item.quantity}
                            </Typography>
                            <IconButton 
                              size="small" 
                              onClick={() => updateCartItemQuantity(item._id, item.quantity + 1)}
                              disabled={item.quantity >= item.stock}
                            >
                              <Add fontSize="small" />
                            </IconButton>
                          </Box>
                        </Grid>
                        <Grid item xs={4} sm={2} sx={{ textAlign: 'right' }}>
                          <Typography variant="subtitle1">
                            ₹{(item.price * item.quantity).toLocaleString()}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            ₹{item.price.toLocaleString()} each
                          </Typography>
                        </Grid>
                        <Grid item xs={2} sm={2} sx={{ textAlign: 'right' }}>
                          <IconButton 
                            color="error" 
                            onClick={() => removeFromCart(item._id)}
                            aria-label="Remove item"
                          >
                            <Delete />
                          </IconButton>
                        </Grid>
                      </Grid>
                    </Paper>
                  ))}
                </List>
                
                <Paper sx={{ p: 2, mt: 3 }}>
                  <Typography variant="h6" gutterBottom>
                    Order Summary
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={6}>
                      <Typography variant="body1">
                        Subtotal ({cart.reduce((acc, item) => acc + item.quantity, 0)} items)
                      </Typography>
                    </Grid>
                    <Grid item xs={6} sx={{ textAlign: 'right' }}>
                      <Typography variant="body1">
                        ₹{cartTotal.toLocaleString()}
                      </Typography>
                    </Grid>
                    
                    <Grid item xs={6}>
                      <Typography variant="body1">
                        Shipping Fee
                      </Typography>
                    </Grid>
                    <Grid item xs={6} sx={{ textAlign: 'right' }}>
                      <Typography variant="body1">
                        {cartTotal >= 500 ? (
                          <Box component="span" sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
                            <Typography component="span" sx={{ textDecoration: 'line-through', mr: 1, color: 'text.secondary' }}>
                              ₹50
                            </Typography>
                            Free
                          </Box>
                        ) : '₹50'}
                      </Typography>
                    </Grid>
                    
                    <Grid item xs={12}>
                      <Divider sx={{ my: 1 }} />
                    </Grid>
                    
                    <Grid item xs={6}>
                      <Typography variant="h6">
                        Total
                      </Typography>
                    </Grid>
                    <Grid item xs={6} sx={{ textAlign: 'right' }}>
                      <Typography variant="h6">
                        ₹{(cartTotal + (cartTotal >= 500 ? 0 : 50)).toLocaleString()}
                      </Typography>
                    </Grid>
                  </Grid>
                </Paper>
              </>
            )}
          </Box>
        );
      
      case 1:
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              Shipping Address
            </Typography>
            
            {savedAddresses.length > 0 && (
              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle1" gutterBottom>
                  Saved Addresses
                </Typography>
                <Grid container spacing={2}>
                  {savedAddresses.map((address) => (
                    <Grid item xs={12} sm={6} key={address._id}>
                      <Card 
                        variant="outlined" 
                        sx={{ 
                          p: 2, 
                          border: selectedAddress === address._id ? 2 : 1,
                          borderColor: selectedAddress === address._id ? 'primary.main' : 'divider'
                        }}
                      >
                        <Box display="flex" justifyContent="space-between" alignItems="flex-start">
                          <Typography variant="subtitle1">
                            {address.fullName}
                            {address.isDefault && (
                              <Chip 
                                label="Default" 
                                size="small" 
                                color="primary" 
                                sx={{ ml: 1 }}
                              />
                            )}
                          </Typography>
                          <Box>
                            <IconButton 
                              size="small" 
                              color="primary"
                              onClick={() => {
                                setShippingAddress(address);
                                setAddressFormVisible(true);
                              }}
                            >
                              <Edit fontSize="small" />
                            </IconButton>
                            <IconButton 
                              size="small" 
                              color="error"
                              onClick={() => handleDeleteAddress(address._id)}
                            >
                              <Delete fontSize="small" />
                            </IconButton>
                          </Box>
                        </Box>
                        <Typography variant="body2" sx={{ mt: 1 }}>
                          {address.phone}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {address.address}, {address.city}, {address.state} - {address.pincode}
                        </Typography>
                        <Button
                          variant={selectedAddress === address._id ? "contained" : "outlined"}
                          color="primary"
                          size="small"
                          sx={{ mt: 2 }}
                          onClick={() => handleAddressSelect(address._id)}
                        >
                          {selectedAddress === address._id ? 'Selected' : 'Deliver to this address'}
                        </Button>
                      </Card>
                    </Grid>
                  ))}
                  <Grid item xs={12} sm={6}>
                    <Card 
                      variant="outlined" 
                      sx={{ 
                        p: 2, 
                        height: '100%', 
                        display: 'flex', 
                        flexDirection: 'column',
                        justifyContent: 'center',
                        alignItems: 'center',
                        cursor: 'pointer',
                        borderStyle: 'dashed'
                      }}
                      onClick={handleAddNewAddress}
                    >
                      <Add fontSize="large" color="action" />
                      <Typography variant="subtitle1" sx={{ mt: 1 }}>
                        Add New Address
                      </Typography>
                    </Card>
                  </Grid>
                </Grid>
              </Box>
            )}
            
            {addressFormVisible && (
              <Paper variant="outlined" sx={{ p: 2, mt: savedAddresses.length > 0 ? 3 : 0 }}>
                <Typography variant="subtitle1" gutterBottom>
                  {selectedAddress ? 'Edit Address' : 'Add New Address'}
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      required
                      fullWidth
                      label="Full Name"
                      name="fullName"
                      value={shippingAddress.fullName}
                      onChange={handleShippingInputChange}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      required
                      fullWidth
                      label="Phone Number"
                      name="phone"
                      value={shippingAddress.phone}
                      onChange={handleShippingInputChange}
                      inputProps={{ maxLength: 10 }}
                      helperText="10-digit mobile number"
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      required
                      fullWidth
                      label="Address"
                      name="address"
                      value={shippingAddress.address}
                      onChange={handleShippingInputChange}
                      multiline
                      rows={2}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      required
                      fullWidth
                      label="City"
                      name="city"
                      value={shippingAddress.city}
                      onChange={handleShippingInputChange}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      required
                      fullWidth
                      label="State"
                      name="state"
                      value={shippingAddress.state}
                      onChange={handleShippingInputChange}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      required
                      fullWidth
                      label="Pincode"
                      name="pincode"
                      value={shippingAddress.pincode}
                      onChange={handleShippingInputChange}
                      inputProps={{ maxLength: 6 }}
                      helperText="6-digit pincode"
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={shippingAddress.isDefault || false}
                          onChange={(e) => setShippingAddress(prev => ({
                            ...prev,
                            isDefault: e.target.checked
                          }))}
                          color="primary"
                        />
                      }
                      label="Set as default address"
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <Button
                      variant="contained"
                      color="primary"
                      onClick={handleSaveAddress}
                    >
                      Save Address
                    </Button>
                    {savedAddresses.length > 0 && (
                      <Button
                        sx={{ ml: 2 }}
                        onClick={() => setAddressFormVisible(false)}
                      >
                        Cancel
                      </Button>
                    )}
                  </Grid>
                </Grid>
              </Paper>
            )}
          </Box>
        );
      
      case 2:
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              Payment Method
            </Typography>
            
            <Paper variant="outlined" sx={{ p: 2, mb: 3 }}>
              <FormControl component="fieldset">
                <FormLabel component="legend">Select Payment Method</FormLabel>
                <RadioGroup
                  name="paymentMethod"
                  value={paymentMethod}
                  onChange={handlePaymentMethodChange}
                >
                  <FormControlLabel 
                    value="cod" 
                    control={<Radio />} 
                    label="Cash on Delivery (COD)" 
                  />
                  <FormControlLabel 
                    value="online" 
                    control={<Radio />} 
                    label="Online Payment (Credit/Debit Card, UPI, Net Banking)" 
                    disabled
                  />
                </RadioGroup>
              </FormControl>
            </Paper>
            
            <Paper sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>
                Order Summary
              </Typography>
              <List>
                {cart.map((item) => (
                  <ListItem key={item._id} sx={{ py: 1, px: 0 }}>
                    <ListItemText
                      primary={item.name}
                      secondary={`Quantity: ${item.quantity}`}
                    />
                    <Typography variant="body2">
                      ₹{(item.price * item.quantity).toLocaleString()}
                    </Typography>
                  </ListItem>
                ))}
                <Divider sx={{ my: 1 }} />
                <ListItem sx={{ py: 1, px: 0 }}>
                  <ListItemText primary="Subtotal" />
                  <Typography variant="body2">
                    ₹{cartTotal.toLocaleString()}
                  </Typography>
                </ListItem>
                <ListItem sx={{ py: 1, px: 0 }}>
                  <ListItemText primary="Shipping" />
                  <Typography variant="body2">
                    {cartTotal >= 500 ? 'Free' : '₹50'}
                  </Typography>
                </ListItem>
                <ListItem sx={{ py: 1, px: 0 }}>
                  <ListItemText primary="Total" />
                  <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                    ₹{(cartTotal + (cartTotal >= 500 ? 0 : 50)).toLocaleString()}
                  </Typography>
                </ListItem>
              </List>
              
              <Divider sx={{ my: 2 }} />
              
              <Typography variant="h6" gutterBottom>
                Shipping Address
              </Typography>
              <Typography variant="body1">
                {shippingAddress.fullName}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {shippingAddress.address}, {shippingAddress.city}, {shippingAddress.state} - {shippingAddress.pincode}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Phone: {shippingAddress.phone}
              </Typography>
            </Paper>
          </Box>
        );
      
      case 3:
        return (
          <Box sx={{ textAlign: 'center', py: 3 }}>
            <CheckCircle color="success" sx={{ fontSize: 64, mb: 2 }} />
            <Typography variant="h5" gutterBottom>
              Thank you for your order!
            </Typography>
            <Typography variant="subtitle1" sx={{ mb: 4 }}>
              Your order has been placed successfully.
            </Typography>
            
            {orderSummary && (
              <Paper variant="outlined" sx={{ p: 3, maxWidth: 600, mx: 'auto', textAlign: 'left' }}>
                <Typography variant="h6" gutterBottom>
                  Order Details
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">
                      Order Number
                    </Typography>
                    <Typography variant="body1" gutterBottom>
                      {orderSummary.orderNumber}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">
                      Order Date
                    </Typography>
                    <Typography variant="body1" gutterBottom>
                      {new Date(orderSummary.createdAt).toLocaleDateString()}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">
                      Payment Method
                    </Typography>
                    <Typography variant="body1" gutterBottom>
                      {orderSummary.paymentMethod === 'cod' ? 'Cash on Delivery' : 'Online Payment'}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">
                      Total Amount
                    </Typography>
                    <Typography variant="body1" gutterBottom>
                      ₹{orderSummary.totalAmount.toLocaleString()}
                    </Typography>
                  </Grid>
                </Grid>
                
                <Divider sx={{ my: 2 }} />
                
                <Typography variant="subtitle1" gutterBottom>
                  Shipping Address
                </Typography>
                <Typography variant="body2">
                  {orderSummary.shippingAddress.fullName}
                  <br />
                  {orderSummary.shippingAddress.address}, {orderSummary.shippingAddress.city}
                  <br />
                  {orderSummary.shippingAddress.state} - {orderSummary.shippingAddress.pincode}
                  <br />
                  Phone: {orderSummary.shippingAddress.phone}
                </Typography>
              </Paper>
            )}
            
            <Box sx={{ mt: 4 }}>
              <Button
                variant="contained"
                color="primary"
                onClick={() => navigate('/orders')}
                sx={{ mr: 2 }}
              >
                View My Orders
              </Button>
              <Button
                variant="outlined"
                onClick={() => navigate('/products')}
              >
                Continue Shopping
              </Button>
            </Box>
          </Box>
        );
      
      default:
        return 'Unknown step';
    }
  };
  
  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" gutterBottom>
        Checkout
      </Typography>
      
      <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
        {steps.map((label) => (
          <Step key={label}>
            <StepLabel>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>
      
      <Paper sx={{ p: 3, mb: 3 }}>
        {getStepContent(activeStep)}
      </Paper>
      
      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
        {activeStep !== 3 && (
          <Button
            variant="outlined"
            onClick={activeStep === 0 ? () => navigate('/cart') : handleBack}
            startIcon={<ArrowBack />}
          >
            {activeStep === 0 ? 'Back to Cart' : 'Back'}
          </Button>
        )}
        
        {activeStep !== 3 && (
          <Button
            variant="contained"
            color="primary"
            onClick={handleNext}
            endIcon={activeStep === 2 ? <Payment /> : <ArrowForward />}
            disabled={loading || cart.length === 0}
          >
            {loading ? (
              <CircularProgress size={24} color="inherit" />
            ) : activeStep === 2 ? (
              'Place Order'
            ) : (
              'Next'
            )}
          </Button>
        )}
      </Box>
      
      {/* Confirmation Dialog */}
      <Dialog
        open={confirmDialog.open}
        onClose={() => setConfirmDialog(prev => ({ ...prev, open: false }))}
      >
        <DialogTitle>{confirmDialog.title}</DialogTitle>
        <DialogContent>
          <DialogContentText>
            {confirmDialog.message}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmDialog(prev => ({ ...prev, open: false }))}>
            Cancel
          </Button>
          <Button onClick={confirmDialog.onConfirm} color="error" autoFocus>
            Confirm
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default CheckoutPage;