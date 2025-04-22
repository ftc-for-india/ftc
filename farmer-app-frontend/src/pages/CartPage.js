import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container, Grid, Typography, Box, Button, Paper, Divider,
  IconButton, Card, CardContent, CardMedia, TextField,
  CircularProgress, List, ListItem, ListItemText, ListItemSecondaryAction,
  Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions
} from '@mui/material';
import {
  Delete, Add, Remove, ShoppingCart, ArrowBack,
  LocalShipping, Payment, CheckCircle
} from '@mui/icons-material';
import { useCart } from '../contexts/CartContext';  // Fixed import path
import { useNotification } from '../contexts/NotificationContext';  // Fixed import path
import { useAuth } from '../contexts/AuthContext';  // Fixed import path


const CartPage = () => {
  const navigate = useNavigate();
  const { cart, loading, error, updateQuantity, removeFromCart, clearCart } = useCart();
  const { showSnackbar } = useNotification();
  const { currentUser, isAuthenticated } = useAuth();
  
  const [confirmDialog, setConfirmDialog] = useState({
    open: false,
    title: '',
    message: '',
    onConfirm: null
  });
  
  const [checkoutStep, setCheckoutStep] = useState(0);
  const [deliveryAddress, setDeliveryAddress] = useState({
    fullName: currentUser?.name || '',
    phone: currentUser?.phone || '',
    address: currentUser?.address || '',
    city: currentUser?.city || '',
    state: currentUser?.state || '',
    pincode: currentUser?.pincode || ''
  });
  
  const [paymentMethod, setPaymentMethod] = useState('cod');
  const [processingOrder, setProcessingOrder] = useState(false);
  
  useEffect(() => {
    // Update delivery address if user data changes
    if (currentUser) {
      setDeliveryAddress(prev => ({
        ...prev,
        fullName: currentUser.name || prev.fullName,
        phone: currentUser.phone || prev.phone,
        address: currentUser.address || prev.address,
        city: currentUser.city || prev.city,
        state: currentUser.state || prev.state,
        pincode: currentUser.pincode || prev.pincode
      }));
    }
  }, [currentUser]);
  
  const handleQuantityChange = (productId, newQuantity) => {
    updateQuantity(productId, newQuantity);
  };
  
  const handleRemoveItem = (productId) => {
    setConfirmDialog({
      open: true,
      title: 'Remove Item',
      message: 'Are you sure you want to remove this item from your cart?',
      onConfirm: () => {
        removeFromCart(productId);
        showSnackbar('Item removed from cart', 'success');
        setConfirmDialog({ ...confirmDialog, open: false });
      }
    });
  };
  
  const handleClearCart = () => {
    if (cart.items.length === 0) return;
    
    setConfirmDialog({
      open: true,
      title: 'Clear Cart',
      message: 'Are you sure you want to clear your entire cart?',
      onConfirm: () => {
        clearCart();
        showSnackbar('Cart cleared', 'success');
        setConfirmDialog({ ...confirmDialog, open: false });
      }
    });
  };
  
  const handleCloseDialog = () => {
    setConfirmDialog({ ...confirmDialog, open: false });
  };
  
  const handleAddressChange = (e) => {
    const { name, value } = e.target;
    setDeliveryAddress(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handlePaymentMethodChange = (method) => {
    setPaymentMethod(method);
  };
  
  const handleNextStep = () => {
    if (checkoutStep === 0) {
      // Validate cart has items
      if (cart.items.length === 0) {
        showSnackbar('Your cart is empty', 'error');
        return;
      }
    } else if (checkoutStep === 1) {
      // Validate delivery address
      const requiredFields = ['fullName', 'phone', 'address', 'city', 'state', 'pincode'];
      const missingFields = requiredFields.filter(field => !deliveryAddress[field]);
      
      if (missingFields.length > 0) {
        showSnackbar('Please fill all required address fields', 'error');
        return;
      }
      
      if (deliveryAddress.phone.length < 10) {
        showSnackbar('Please enter a valid phone number', 'error');
        return;
      }
    }
    
    setCheckoutStep(prev => prev + 1);
    window.scrollTo(0, 0);
  };
  
  const handlePreviousStep = () => {
    setCheckoutStep(prev => prev - 1);
    window.scrollTo(0, 0);
  };
  
  const handlePlaceOrder = async () => {
    if (!isAuthenticated) {
      showSnackbar('Please login to place an order', 'error');
      navigate('/login');
      return;
    }
    
    setProcessingOrder(true);
    
    try {
      // Here you would make an API call to place the order
      // For now, we'll simulate a successful order
      
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      clearCart();
      setCheckoutStep(3); // Success step
      showSnackbar('Order placed successfully!', 'success');
    } catch (err) {
      console.error('Error placing order:', err);
      showSnackbar('Failed to place order. Please try again.', 'error');
    } finally {
      setProcessingOrder(false);
    }
  };
  
  const calculateSubtotal = () => {
    return cart.items.reduce((total, item) => total + (item.price * item.quantity), 0);
  };
  
  const calculateTax = () => {
    return calculateSubtotal() * 0.05; // 5% tax
  };
  
  const calculateShipping = () => {
    const subtotal = calculateSubtotal();
    return subtotal > 500 ? 0 : 50; // Free shipping for orders above ₹500
  };
  
  const calculateTotal = () => {
    return calculateSubtotal() + calculateTax() + calculateShipping();
  };
  
  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <CircularProgress />
      </Box>
    );
  }
  
  // Cart Step
  if (checkoutStep === 0) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Typography variant="h4" gutterBottom>
          Your Cart
        </Typography>
        
        {error && (
          <Box sx={{ mb: 3 }}>
            <Typography color="error">{error}</Typography>
          </Box>
        )}
        
        {cart.items.length === 0 ? (
          <Paper sx={{ p: 3, textAlign: 'center' }}>
            <ShoppingCart sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
            <Typography variant="h6" gutterBottom>
              Your cart is empty
            </Typography>
            <Typography variant="body1" color="text.secondary" paragraph>
              Looks like you haven't added any products to your cart yet.
            </Typography>
            <Button
              variant="contained"
              color="primary"
              onClick={() => navigate('/products')}
              startIcon={<ArrowBack />}
            >
              Continue Shopping
            </Button>
          </Paper>
        ) : (
          <Grid container spacing={3}>
            <Grid item xs={12} md={8}>
              <Paper sx={{ p: 2, mb: { xs: 3, md: 0 } }}>
                <Box display="flex" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
                  <Typography variant="h6">
                    Cart Items ({cart.items.length})
                  </Typography>
                  <Button
                    variant="outlined"
                    color="secondary"
                    size="small"
                    startIcon={<Delete />}
                    onClick={handleClearCart}
                  >
                    Clear Cart
                  </Button>
                </Box>
                
                <Divider sx={{ mb: 2 }} />
                
                {cart.items.map((item) => (
                  <Card key={item._id} sx={{ mb: 2, display: 'flex' }}>
                    <CardMedia
                      component="img"
                      sx={{ width: 100, height: 100, objectFit: 'cover' }}
                      image={item.imageUrl || 'https://via.placeholder.com/100?text=No+Image'}
                      alt={item.name}
                      onClick={() => navigate(`/products/${item._id}`)}
                    />
                    <CardContent sx={{ flex: '1 0 auto', display: 'flex', flexDirection: 'column' }}>
                      <Box display="flex" justifyContent="space-between" alignItems="flex-start">
                        <Box>
                          <Typography variant="h6" sx={{ cursor: 'pointer' }} onClick={() => navigate(`/products/${item._id}`)}>
                            {item.name}
                          </Typography>
                          <Typography variant="body2" color="text.secondary" gutterBottom>
                            {item.category}
                          </Typography>
                        </Box>
                        <IconButton
                          edge="end"
                          aria-label="delete"
                          onClick={() => handleRemoveItem(item._id)}
                        >
                          <Delete />
                        </IconButton>
                      </Box>
                      
                      <Box display="flex" justifyContent="space-between" alignItems="center" mt="auto">
                        <Box display="flex" alignItems="center">
                          <IconButton
                            size="small"
                            onClick={() => handleQuantityChange(item._id, Math.max(1, item.quantity - 1))}
                            disabled={item.quantity <= 1}
                          >
                            <Remove />
                          </IconButton>
                          <Typography sx={{ mx: 1 }}>
                            {item.quantity}
                          </Typography>
                          <IconButton
                            size="small"
                            onClick={() => handleQuantityChange(item._id, Math.min(item.stock, item.quantity + 1))}
                            disabled={item.quantity >= item.stock}
                          >
                            <Add />
                          </IconButton>
                        </Box>
                        <Typography variant="h6" color="primary">
                          ₹{(item.price * item.quantity).toLocaleString()}
                        </Typography>
                      </Box>
                    </CardContent>
                  </Card>
                ))}
              </Paper>
            </Grid>
            
            <Grid item xs={12} md={4}>
              <Paper sx={{ p: 2 }}>
                <Typography variant="h6" gutterBottom>
                  Order Summary
                </Typography>
                
                <List disablePadding>
                  <ListItem sx={{ py: 1, px: 0 }}>
                    <ListItemText primary="Subtotal" />
                    <Typography variant="body1">₹{calculateSubtotal().toLocaleString()}</Typography>
                  </ListItem>
                  
                  <ListItem sx={{ py: 1, px: 0 }}>
                    <ListItemText primary="Tax (5%)" />
                    <Typography variant="body1">₹{calculateTax().toLocaleString()}</Typography>
                  </ListItem>
                  
                  <ListItem sx={{ py: 1, px: 0 }}>
                    <ListItemText primary="Shipping" />
                    <Typography variant="body1">
                      {calculateShipping() === 0 ? 'Free' : `₹${calculateShipping().toLocaleString()}`}
                    </Typography>
                  </ListItem>
                  
                  <Divider sx={{ my: 1 }} />
                  
                  <ListItem sx={{ py: 1, px: 0 }}>
                    <ListItemText primary={<Typography variant="h6">Total</Typography>} />
                    <Typography variant="h6" color="primary">
                      ₹{calculateTotal().toLocaleString()}
                    </Typography>
                  </ListItem>
                </List>
                
                <Button
                  fullWidth
                  variant="contained"
                  color="primary"
                  size="large"
                  onClick={handleNextStep}
                  sx={{ mt: 2 }}
                >
                  Proceed to Checkout
                </Button>
                
                <Button
                  fullWidth
                  variant="outlined"
                  onClick={() => navigate('/products')}
                  sx={{ mt: 2 }}
                  startIcon={<ArrowBack />}
                >
                  Continue Shopping
                </Button>
              </Paper>
            </Grid>
          </Grid>
        )}
        
        {/* Confirmation Dialog */}
        <Dialog
          open={confirmDialog.open}
          onClose={handleCloseDialog}
        >
          <DialogTitle>{confirmDialog.title}</DialogTitle>
          <DialogContent>
            <DialogContentText>
              {confirmDialog.message}
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog} color="primary">
              Cancel
            </Button>
            <Button onClick={confirmDialog.onConfirm} color="secondary" autoFocus>
              Confirm
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    );
  }
  
  // Delivery Address Step
  if (checkoutStep === 1) {
    return (
      <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" gutterBottom>
            Delivery Address
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Please enter your delivery details
          </Typography>
        </Box>
        
        <Paper sx={{ p: 3, mb: 3 }}>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <TextField
                required
                fullWidth
                label="Full Name"
                name="fullName"
                value={deliveryAddress.fullName}
                onChange={handleAddressChange}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                required
                fullWidth
                label="Phone Number"
                name="phone"
                value={deliveryAddress.phone}
                onChange={handleAddressChange}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                required
                fullWidth
                label="Address"
                name="address"
                value={deliveryAddress.address}
                onChange={handleAddressChange}
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
                value={deliveryAddress.city}
                onChange={handleAddressChange}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                required
                fullWidth
                label="State"
                name="state"
                value={deliveryAddress.state}
                onChange={handleAddressChange}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                required
                fullWidth
                label="Pincode"
                name="pincode"
                value={deliveryAddress.pincode}
                onChange={handleAddressChange}
              />
            </Grid>
          </Grid>
        </Paper>
        
        <Box display="flex" justifyContent="space-between">
          <Button
            variant="outlined"
            onClick={handlePreviousStep}
            startIcon={<ArrowBack />}
          >
            Back to Cart
          </Button>
          <Button
            variant="contained"
            color="primary"
            onClick={handleNextStep}
            endIcon={<LocalShipping />}
          >
            Continue to Payment
          </Button>
        </Box>
      </Container>
    );
  }
  
  // Payment Step
  if (checkoutStep === 2) {
    return (
      <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" gutterBottom>
            Payment Method
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Choose your preferred payment method
          </Typography>
        </Box>
        
        <Grid container spacing={3}>
          <Grid item xs={12} md={8}>
            <Paper sx={{ p: 3, mb: { xs: 3, md: 0 } }}>
              <Typography variant="h6" gutterBottom>
                Select Payment Method
              </Typography>
              
              <List>
                <ListItem
                  button
                  selected={paymentMethod === 'cod'}
                  onClick={() => handlePaymentMethodChange('cod')}
                  sx={{
                    border: '1px solid',
                    borderColor: paymentMethod === 'cod' ? 'primary.main' : 'divider',
                    borderRadius: 1,
                    mb: 2
                  }}
                >
                  <ListItemText
                    primary="Cash on Delivery"
                    secondary="Pay when you receive your order"
                  />
                  {paymentMethod === 'cod' && (
                    <ListItemSecondaryAction>
                      <CheckCircle color="primary" />
                    </ListItemSecondaryAction>
                  )}
                </ListItem>
                
                <ListItem
                  button
                  selected={paymentMethod === 'online'}
                  onClick={() => handlePaymentMethodChange('online')}
                  sx={{
                    border: '1px solid',
                    borderColor: paymentMethod === 'online' ? 'primary.main' : 'divider',
                    borderRadius: 1
                  }}
                >
                  <ListItemText
                    primary="Online Payment"
                    secondary="Pay now using UPI, Credit/Debit Card, Net Banking"
                  />
                  {paymentMethod === 'online' && (
                    <ListItemSecondaryAction>
                      <CheckCircle color="primary" />
                    </ListItemSecondaryAction>
                  )}
                </ListItem>
              </List>
            </Paper>
          </Grid>
          
          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>
                Order Summary
              </Typography>
              
              <List disablePadding>
                <ListItem sx={{ py: 1, px: 0 }}>
                  <ListItemText primary={`Items (${cart.items.length})`} />
                  <Typography variant="body1">₹{calculateSubtotal().toLocaleString()}</Typography>
                </ListItem>
                
                <ListItem sx={{ py: 1, px: 0 }}>
                  <ListItemText primary="Tax" />
                  <Typography variant="body1">₹{calculateTax().toLocaleString()}</Typography>
                </ListItem>
                
                <ListItem sx={{ py: 1, px: 0 }}>
                  <ListItemText primary="Shipping" />
                  <Typography variant="body1">
                    {calculateShipping() === 0 ? 'Free' : `₹${calculateShipping().toLocaleString()}`}
                  </Typography>
                </ListItem>
                
                <Divider sx={{ my: 1 }} />
                
                <ListItem sx={{ py: 1, px: 0 }}>
                  <ListItemText primary={<Typography variant="h6">Total</Typography>} />
                  <Typography variant="h6" color="primary">
                    ₹{calculateTotal().toLocaleString()}
                  </Typography>
                </ListItem>
              </List>
              
              <Button
                fullWidth
                variant="contained"
                color="primary"
                size="large"
                onClick={handlePlaceOrder}
                disabled={processingOrder}
                startIcon={processingOrder ? <CircularProgress size={20} /> : <Payment />}
                sx={{ mt: 2 }}
              >
                {processingOrder ? 'Processing...' : 'Place Order'}
              </Button>
              
              <Button
                fullWidth
                variant="outlined"
                onClick={handlePreviousStep}
                sx={{ mt: 2 }}
                startIcon={<ArrowBack />}
              >
                Back to Delivery
              </Button>
            </Paper>
          </Grid>
        </Grid>
      </Container>
    );
  }
  
  // Order Success Step
  if (checkoutStep === 3) {
    return (
      <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <CheckCircle sx={{ fontSize: 80, color: 'success.main', mb: 2 }} />
          <Typography variant="h4" gutterBottom>
            Order Placed Successfully!
          </Typography>
          <Typography variant="body1" paragraph>
            Thank you for your order. We've received your order and will begin processing it soon.
          </Typography>
          <Typography variant="body1" paragraph>
            You will receive an email confirmation shortly.
          </Typography>
          
          <Box sx={{ mt: 4 }}>
            <Button
              variant="contained"
              color="primary"
              onClick={() => navigate('/orders')}
              sx={{ mx: 1 }}
            >
              View Orders
            </Button>
            <Button
              variant="outlined"
              onClick={() => navigate('/products')}
              sx={{ mx: 1 }}
            >
              Continue Shopping
            </Button>
          </Box>
        </Paper>
      </Container>
    );
  }
  
  return null;
};

export default CartPage;