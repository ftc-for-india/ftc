import React, { useState, useEffect } from 'react';
import {
  Container, Typography, Box, Paper, Stepper, Step, StepLabel,
  StepContent, Button, Divider, Grid, Card, CardContent, CardMedia,
  List, ListItem, ListItemText, CircularProgress, Alert, TextField,
  InputAdornment, IconButton, Chip, useTheme
} from '@mui/material';
import {
  LocalShipping, Inventory, Payment, CheckCircle, Search,
  AccessTime, LocationOn, Phone, ArrowBack, Refresh
} from '@mui/icons-material';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';  // Fixed import path
import { useNotification } from '../contexts/NotificationContext';  // Fixed import path
import axios from 'axios';


const OrderTrackingPage = () => {
  const theme = useTheme();
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { showNotification } = useNotification();
  
  const [loading, setLoading] = useState(true);
  const [order, setOrder] = useState(null);
  const [error, setError] = useState('');
  const [trackingId, setTrackingId] = useState(id || '');
  
  useEffect(() => {
    if (isAuthenticated && id) {
      fetchOrderDetails(id);
    } else if (!isAuthenticated) {
      setLoading(false);
    }
  }, [isAuthenticated, id]);
  
  const fetchOrderDetails = async (orderId) => {
    setLoading(true);
    setError('');
    
    try {
      const token = localStorage.getItem('token');
      const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000';
      
      const response = await axios.get(
        `${apiUrl}/api/orders/${orderId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      
      setOrder(response.data);
    } catch (err) {
      console.error('Error fetching order details:', err);
      setError('Failed to fetch order details. Please check the order ID and try again.');
    } finally {
      setLoading(false);
    }
  };
  
  const handleTrackOrder = () => {
    if (!trackingId.trim()) {
      showNotification('Please enter an order ID', 'error');
      return;
    }
    
    navigate(`/order-tracking/${trackingId}`);
  };
  
  const getStepNumber = (status) => {
    const statusMap = {
      'pending': 0,
      'processing': 1,
      'shipped': 2,
      'delivered': 3,
      'cancelled': -1
    };
    
    return statusMap[status] || 0;
  };
  
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleDateString('en-US', options);
  };
  
  if (!isAuthenticated) {
    return (
      <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h5" gutterBottom>
            Please log in to track your order
          </Typography>
          <Button
            variant="contained"
            color="primary"
            onClick={() => navigate('/loginpage')}
            sx={{ mt: 2 }}
          >
            Log In
          </Button>
        </Paper>
      </Container>
    );
  }
  
  if (loading && !order) {
    return (
      <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
          <CircularProgress />
        </Box>
      </Container>
    );
  }
  
  if (!id) {
    return (
      <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
        <Paper sx={{ p: 4 }}>
          <Typography variant="h4" gutterBottom>
            Track Your Order
          </Typography>
          <Typography variant="body1" color="text.secondary" paragraph>
            Enter your order ID to track the status of your order
          </Typography>
          
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
            <TextField
              fullWidth
              label="Order ID"
              variant="outlined"
              value={trackingId}
              onChange={(e) => setTrackingId(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search />
                  </InputAdornment>
                ),
              }}
            />
            <Button
              variant="contained"
              color="primary"
              onClick={handleTrackOrder}
              sx={{ ml: 2, height: 56 }}
            >
              Track
            </Button>
          </Box>
          
          <Divider sx={{ my: 3 }} />
          
          <Typography variant="body1" align="center" color="text.secondary">
            You can also view all your orders in the <Button variant="text" onClick={() => navigate('/orders')}>Order History</Button> page
          </Typography>
        </Paper>
      </Container>
    );
  }
  
  if (error) {
    return (
      <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
        <Button
          variant="outlined"
          startIcon={<ArrowBack />}
          onClick={() => navigate('/order-tracking')}
        >
          Back to Order Tracking
        </Button>
      </Container>
    );
  }
  
  if (!order) {
    return (
      <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
        <Alert severity="warning" sx={{ mb: 3 }}>
          Order not found. Please check the order ID and try again.
        </Alert>
        <Button
          variant="outlined"
          startIcon={<ArrowBack />}
          onClick={() => navigate('/order-tracking')}
        >
          Back to Order Tracking
        </Button>
      </Container>
    );
  }
  
  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      <Paper sx={{ p: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h4">
            Order Tracking
          </Typography>
          <Button
            variant="outlined"
            startIcon={<Refresh />}
            onClick={() => fetchOrderDetails(id)}
          >
            Refresh
          </Button>
        </Box>
        
        <Box sx={{ mb: 4 }}>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <Typography variant="body2" color="text.secondary">
                Order ID
              </Typography>
              <Typography variant="body1" fontWeight="bold">
                #{order._id}
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography variant="body2" color="text.secondary">
                Order Date
              </Typography>
              <Typography variant="body1">
                {formatDate(order.createdAt)}
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography variant="body2" color="text.secondary">
                Total Amount
              </Typography>
              <Typography variant="body1" fontWeight="bold" color="primary">
                ₹{order.totalAmount.toLocaleString()}
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography variant="body2" color="text.secondary">
                Payment Method
              </Typography>
              <Typography variant="body1">
                {order.paymentMethod === 'cod' ? 'Cash on Delivery' : 'Online Payment'}
              </Typography>
            </Grid>
          </Grid>
        </Box>
        
        <Divider sx={{ my: 3 }} />
        
        <Typography variant="h6" gutterBottom>
          Order Status
        </Typography>
        
        <Box sx={{ mb: 4 }}>
          <Stepper activeStep={getStepNumber(order.status)} orientation="vertical">
            <Step>
              <StepLabel StepIconProps={{ icon: <Payment /> }}>
                <Typography variant="subtitle1">Order Placed</Typography>
              </StepLabel>
              <StepContent>
                <Typography variant="body2">
                  Your order has been received and is being processed.
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                  <AccessTime fontSize="small" sx={{ mr: 1 }} />
                  {formatDate(order.createdAt)}
                </Typography>
              </StepContent>
            </Step>
            
            <Step>
              <StepLabel StepIconProps={{ icon: <Inventory /> }}>
                <Typography variant="subtitle1">Processing</Typography>
              </StepLabel>
              <StepContent>
                <Typography variant="body2">
                  Your order is being prepared for shipping.
                </Typography>
                {order.status === 'processing' && (
                  <Typography variant="body2" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                    <AccessTime fontSize="small" sx={{ mr: 1 }} />
                    Estimated shipping: {new Date(Date.now() + 2*24*60*60*1000).toLocaleDateString()}
                  </Typography>
                )}
              </StepContent>
            </Step>
            
            <Step>
              <StepLabel StepIconProps={{ icon: <LocalShipping /> }}>
                <Typography variant="subtitle1">Shipped</Typography>
              </StepLabel>
              <StepContent>
                <Typography variant="body2">
                  Your order has been shipped and is on its way to you.
                </Typography>
                {order.status === 'shipped' && order.shippingDetails && (
                  <>
                    <Typography variant="body2" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                      <AccessTime fontSize="small" sx={{ mr: 1 }} />
                      Shipped on: {formatDate(order.shippingDetails.date)}
                    </Typography>
                    {order.shippingDetails.trackingNumber && (
                      <Typography variant="body2" sx={{ mt: 1 }}>
                        Tracking Number: {order.shippingDetails.trackingNumber}
                      </Typography>
                    )}
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                      Estimated delivery: {new Date(Date.now() + 3*24*60*60*1000).toLocaleDateString()}
                    </Typography>
                  </>
                )}
              </StepContent>
            </Step>
            
            <Step>
              <StepLabel StepIconProps={{ icon: <CheckCircle /> }}>
                <Typography variant="subtitle1">Delivered</Typography>
              </StepLabel>
              <StepContent>
                <Typography variant="body2">
                  Your order has been delivered successfully.
                </Typography>
                {order.status === 'delivered' && order.deliveryDetails && (
                  <Typography variant="body2" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                    <AccessTime fontSize="small" sx={{ mr: 1 }} />
                    Delivered on: {formatDate(order.deliveryDetails.date)}
                  </Typography>
                )}
              </StepContent>
            </Step>
          </Stepper>
          
          {order.status === 'cancelled' && (
            <Alert severity="error" sx={{ mt: 2 }}>
              <Typography variant="subtitle1">Order Cancelled</Typography>
              <Typography variant="body2">
                This order has been cancelled.
                {order.cancellationReason && ` Reason: ${order.cancellationReason}`}
              </Typography>
            </Alert>
          )}
        </Box>
        
        <Divider sx={{ my: 3 }} />
        
        <Grid container spacing={4}>
          <Grid item xs={12} md={6}>
            <Typography variant="h6" gutterBottom>
              Shipping Address
            </Typography>
            <Paper variant="outlined" sx={{ p: 2 }}>
              <Typography variant="body1" fontWeight="bold">
                {order.shippingAddress.fullName}
              </Typography>
              <Typography variant="body2">
                {order.shippingAddress.address}
              </Typography>
              <Typography variant="body2">
                {order.shippingAddress.city}, {order.shippingAddress.state} - {order.shippingAddress.pincode}
              </Typography>
              <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                <Phone fontSize="small" sx={{ mr: 1 }} />
                {order.shippingAddress.phone}
              </Typography>
            </Paper>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Typography variant="h6" gutterBottom>
              Order Summary
            </Typography>
            <Paper variant="outlined" sx={{ p: 2 }}>
              <List disablePadding>
                <ListItem sx={{ py: 1, px: 0 }}>
                  <ListItemText primary="Subtotal" />
                  <Typography variant="body2">₹{order.subtotal.toLocaleString()}</Typography>
                </ListItem>
                <ListItem sx={{ py: 1, px: 0 }}>
                  <ListItemText primary="Tax" />
                  <Typography variant="body2">₹{order.tax.toLocaleString()}</Typography>
                </ListItem>
                <ListItem sx={{ py: 1, px: 0 }}>
                  <ListItemText primary="Shipping" />
                  <Typography variant="body2">
                    {order.shippingCost === 0 ? 'Free' : `₹${order.shippingCost.toLocaleString()}`}
                  </Typography>
                </ListItem>
                <Divider />
                <ListItem sx={{ py: 1, px: 0 }}>
                  <ListItemText primary={<Typography variant="subtitle1">Total</Typography>} />
                  <Typography variant="subtitle1" fontWeight="bold">
                    ₹{order.totalAmount.toLocaleString()}
                  </Typography>
                </ListItem>
              </List>
            </Paper>
          </Grid>
        </Grid>
        
        <Divider sx={{ my: 3 }} />
        
        <Typography variant="h6" gutterBottom>
          Order Items
        </Typography>
        
        <Grid container spacing={2}>
          {order.items.map((item) => (
            <Grid item xs={12} key={item._id}>
              <Card variant="outlined" sx={{ display: 'flex', height: '100%' }}>
                <CardMedia
                  component="img"
                  sx={{ width: 100, objectFit: 'cover' }}
                  image={item.product.imageUrl || 'https://via.placeholder.com/100x100?text=No+Image'}
                  alt={item.product.name}
                />
                <CardContent sx={{ flex: '1 0 auto', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                  <Box>
                    <Typography variant="subtitle1" component="div">
                      {item.product.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Quantity: {item.quantity}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mt: 1 }}>
                    <Typography variant="body2">
                      ₹{item.price.toLocaleString()} per unit
                    </Typography>
                    <Typography variant="subtitle1" fontWeight="bold">
                      ₹{(item.price * item.quantity).toLocaleString()}
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
        
        <Box sx={{ mt: 4, display: 'flex', justifyContent: 'space-between' }}>
          <Button
            variant="outlined"
            startIcon={<ArrowBack />}
            onClick={() => navigate('/orders')}
          >
            Back to Orders
          </Button>
          
          {order.status === 'delivered' && (
            <Button
              variant="contained"
              color="primary"
              onClick={() => navigate(`/products/${order.items[0].product._id}`)}
            >
              Buy Again
            </Button>
          )}
        </Box>
      </Paper>
    </Container>
  );
};

export default OrderTrackingPage;