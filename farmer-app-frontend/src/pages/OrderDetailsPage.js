import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container, Grid, Typography, Box, Button, Paper, Divider,
  Stepper, Step, StepLabel, CircularProgress, Chip, List,
  ListItem, ListItemText, Card, CardContent, CardMedia
} from '@mui/material';
import {
  ArrowBack, LocalShipping, Payment, CheckCircle,
  Inventory, Receipt, LocationOn, AccessTime
} from '@mui/icons-material';
import { useAuth } from './contexts/AuthContext';
import { useNotification } from './contexts/NotificationContext';
import axios from 'axios';

const OrderDetailsPage = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { showSnackbar } = useNotification();
  
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    if (!isAuthenticated) {
      showSnackbar('Please login to view order details', 'error');
      navigate('/login');
      return;
    }
    
    fetchOrderDetails();
  }, [orderId, isAuthenticated]);
  
  const fetchOrderDetails = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const token = localStorage.getItem('token');
      const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000';
      
      const response = await axios.get(
        `${apiUrl}/orders/${orderId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      
      setOrder(response.data);
    } catch (err) {
      console.error('Error fetching order details:', err);
      setError(err.response?.data?.message || 'Failed to fetch order details');
      showSnackbar('Failed to fetch order details', 'error');
    } finally {
      setLoading(false);
    }
  };
  
  const getStepIndex = (status) => {
    const statusMap = {
      'Pending': 0,
      'Processing': 1,
      'Shipped': 2,
      'Delivered': 3,
      'Cancelled': -1
    };
    
    return statusMap[status] || 0;
  };
  
  const getStatusColor = (status) => {
    const colorMap = {
      'Pending': 'warning',
      'Processing': 'info',
      'Shipped': 'primary',
      'Delivered': 'success',
      'Cancelled': 'error'
    };
    
    return colorMap[status] || 'default';
  };
  
  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <CircularProgress />
      </Box>
    );
  }
  
  if (error) {
    return (
      <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
        <Paper sx={{ p: 3, textAlign: 'center' }}>
          <Typography variant="h6" color="error" gutterBottom>
            {error}
          </Typography>
          <Button
            variant="contained"
            color="primary"
            onClick={() => navigate('/orders')}
            startIcon={<ArrowBack />}
            sx={{ mt: 2 }}
          >
            Back to Orders
          </Button>
        </Paper>
      </Container>
    );
  }
  
  if (!order) {
    return (
      <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
        <Paper sx={{ p: 3, textAlign: 'center' }}>
          <Typography variant="h6" gutterBottom>
            Order not found
          </Typography>
          <Button
            variant="contained"
            color="primary"
            onClick={() => navigate('/orders')}
            startIcon={<ArrowBack />}
            sx={{ mt: 2 }}
          >
            Back to Orders
          </Button>
        </Paper>
      </Container>
    );
  }
  
  const activeStep = getStepIndex(order.status);
  
  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box display="flex" alignItems="center" sx={{ mb: 3 }}>
        <Button
          variant="outlined"
          startIcon={<ArrowBack />}
          onClick={() => navigate('/profile')}
          sx={{ mr: 2 }}
        >
          Back to Orders
        </Button>
        <Typography variant="h4">
          Order Details
        </Typography>
      </Box>
      
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Paper sx={{ p: 3, mb: 3 }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
              <Box>
                <Typography variant="h5" gutterBottom>
                  Order #{order._id.substring(order._id.length - 8)}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Placed on {new Date(order.createdAt).toLocaleString()}
                </Typography>
              </Box>
              <Chip
                label={order.status}
                color={getStatusColor(order.status)}
                sx={{ fontWeight: 'bold' }}
              />
            </Box>
            
            {order.status !== 'Cancelled' && (
              <Box sx={{ width: '100%', mt: 4 }}>
                <Stepper activeStep={activeStep} alternativeLabel>
                  <Step>
                    <StepLabel StepIconProps={{ icon: <Receipt /> }}>Order Placed</StepLabel>
                  </Step>
                  <Step>
                    <StepLabel StepIconProps={{ icon: <Inventory /> }}>Processing</StepLabel>
                  </Step>
                  <Step>
                    <StepLabel StepIconProps={{ icon: <LocalShipping /> }}>Shipped</StepLabel>
                  </Step>
                  <Step>
                    <StepLabel StepIconProps={{ icon: <CheckCircle /> }}>Delivered</StepLabel>
                  </Step>
                </Stepper>
              </Box>
            )}
          </Paper>
        </Grid>
        
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3, mb: { xs: 3, md: 0 } }}>
            <Typography variant="h6" gutterBottom>
              Order Items
            </Typography>
            <Divider sx={{ mb: 2 }} />
            
            <List disablePadding>
              {order.items.map((item) => (
                <Card key={item._id} sx={{ mb: 2, display: 'flex' }}>
                  <CardMedia
                    component="img"
                    sx={{ width: 100, height: 100, objectFit: 'cover' }}
                    image={item.product.imageUrl || 'https://via.placeholder.com/100?text=No+Image'}
                    alt={item.product.name}
                    onClick={() => navigate(`/products/${item.product._id}`)}
                  />
                  <CardContent sx={{ flex: '1 0 auto', display: 'flex', flexDirection: 'column' }}>
                    <Box display="flex" justifyContent="space-between" alignItems="flex-start">
                      <Box>
                        <Typography variant="h6" sx={{ cursor: 'pointer' }} onClick={() => navigate(`/products/${item.product._id}`)}>
                          {item.product.name}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" gutterBottom>
                          {item.product.category}
                        </Typography>
                      </Box>
                    </Box>
                    
                    <Box display="flex" justifyContent="space-between" alignItems="center" mt="auto">
                      <Typography variant="body1">
                        Quantity: {item.quantity}
                      </Typography>
                      <Typography variant="h6" color="primary">
                        ₹{(item.price * item.quantity).toLocaleString()}
                      </Typography>
                    </Box>
                  </CardContent>
                </Card>
              ))}
            </List>
            
            {order.status === 'Delivered' && (
              <Box sx={{ mt: 3 }}>
                <Button
                  variant="outlined"
                  color="primary"
                  fullWidth
                  onClick={() => navigate(`/review-order/${order._id}`)}
                >
                  Write a Review
                </Button>
              </Box>
            )}
          </Paper>
        </Grid>
        
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Order Summary
            </Typography>
            <Divider sx={{ mb: 2 }} />
            
            <List disablePadding>
              <ListItem sx={{ py: 1, px: 0 }}>
                <ListItemText primary="Subtotal" />
                <Typography variant="body1">₹{order.subtotal.toLocaleString()}</Typography>
              </ListItem>
              
              <ListItem sx={{ py: 1, px: 0 }}>
                <ListItemText primary="Tax" />
                <Typography variant="body1">₹{order.tax.toLocaleString()}</Typography>
              </ListItem>
              
              <ListItem sx={{ py: 1, px: 0 }}>
                <ListItemText primary="Shipping" />
                <Typography variant="body1">
                  {order.shippingCost === 0 ? 'Free' : `₹${order.shippingCost.toLocaleString()}`}
                </Typography>
              </ListItem>
              
              <Divider sx={{ my: 1 }} />
              
              <ListItem sx={{ py: 1, px: 0 }}>
                <ListItemText primary={<Typography variant="h6">Total</Typography>} />
                <Typography variant="h6" color="primary">
                  ₹{order.totalAmount.toLocaleString()}
                </Typography>
              </ListItem>
            </List>
          </Paper>
          
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Shipping Details
            </Typography>
            <Divider sx={{ mb: 2 }} />
            
            <Box display="flex" alignItems="flex-start" sx={{ mb: 2 }}>
              <LocationOn color="action" sx={{ mr: 1, mt: 0.5 }} />
              <Box>
                <Typography variant="body1" gutterBottom>
                  {order.shippingAddress.fullName}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {order.shippingAddress.address}, {order.shippingAddress.city}, {order.shippingAddress.state} - {order.shippingAddress.pincode}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Phone: {order.shippingAddress.phone}
                </Typography>
              </Box>
            </Box>
          </Paper>
          
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Payment Information
            </Typography>
            <Divider sx={{ mb: 2 }} />
            
            <Box display="flex" alignItems="center" sx={{ mb: 2 }}>
              <Payment color="action" sx={{ mr: 1 }} />
              <Typography variant="body1">
                {order.paymentMethod === 'cod' ? 'Cash on Delivery' : 'Online Payment'}
              </Typography>
            </Box>
            
            <Box display="flex" alignItems="center">
              <AccessTime color="action" sx={{ mr: 1 }} />
              <Typography variant="body2" color="text.secondary">
                {order.paymentStatus === 'Paid' ? 'Paid on ' + new Date(order.paidAt).toLocaleDateString() : 'Payment Pending'}
              </Typography>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default OrderDetailsPage;