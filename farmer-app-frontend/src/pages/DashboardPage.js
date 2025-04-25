import React, { useState, useEffect } from 'react';
import { 
  Container, Grid, Paper, Typography, Box, Button, 
  Card, CardContent, CardMedia, CardActionArea, Divider,
  CircularProgress, Chip, useTheme
} from '@mui/material';
import { 
  TrendingUp, LocalShipping, ShoppingCart, 
  LocationOn, CalendarToday 
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';  // Fixed path from '../context/AuthContext'
import { useNotification } from '../contexts/NotificationContext';  // Fixed path from '../context/NotificationContext'
import Chart from 'react-apexcharts';

const DashboardPage = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const { showSnackbar } = useNotification();
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState({
    recentProducts: [],
    recentOrders: [],
    stats: {
      totalOrders: 0,
      pendingOrders: 0,
      totalRevenue: 0,
      totalProducts: 0
    },
    chartData: {
      salesByDay: [],
      categories: []
    }
  });

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const token = localStorage.getItem('token');
        const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000';
        
        const response = await axios.get(
          `${apiUrl}/dashboard`,
          {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        );
        
        setDashboardData(response.data);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        showSnackbar('Failed to load dashboard data', 'error');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [showSnackbar]);

  const chartOptions = {
    chart: {
      type: 'area',
      toolbar: {
        show: false
      }
    },
    dataLabels: {
      enabled: false
    },
    stroke: {
      curve: 'smooth',
      width: 2
    },
    xaxis: {
      categories: dashboardData.chartData.categories || ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
    },
    colors: [theme.palette.primary.main],
    fill: {
      type: 'gradient',
      gradient: {
        shadeIntensity: 1,
        opacityFrom: 0.7,
        opacityTo: 0.2,
        stops: [0, 90, 100]
      }
    },
    tooltip: {
      theme: 'dark'
    }
  };

  const chartSeries = [
    {
      name: 'Sales',
      data: dashboardData.chartData.salesByDay || [30, 40, 35, 50, 49, 60, 70]
    }
  ];

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" gutterBottom>
        Welcome back, {currentUser?.name || 'User'}!
      </Typography>
      
      <Grid container spacing={3}>
        {/* Stats Cards */}
        <Grid item xs={12} sm={6} md={3}>
          <Paper
            sx={{
              p: 2,
              display: 'flex',
              flexDirection: 'column',
              height: 140,
              bgcolor: 'primary.light',
              color: 'white'
            }}
          >
            <Box display="flex" justifyContent="space-between">
              <Typography component="h2" variant="h6" gutterBottom>
                Total Orders
              </Typography>
              <ShoppingCart />
            </Box>
            <Typography component="p" variant="h4">
              {dashboardData.stats.totalOrders}
            </Typography>
            <Typography variant="body2" sx={{ mt: 1 }}>
              as of {new Date().toLocaleDateString()}
            </Typography>
          </Paper>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Paper
            sx={{
              p: 2,
              display: 'flex',
              flexDirection: 'column',
              height: 140,
              bgcolor: 'secondary.light',
              color: 'white'
            }}
          >
            <Box display="flex" justifyContent="space-between">
              <Typography component="h2" variant="h6" gutterBottom>
                Pending Orders
              </Typography>
              <LocalShipping />
            </Box>
            <Typography component="p" variant="h4">
              {dashboardData.stats.pendingOrders}
            </Typography>
            <Typography variant="body2" sx={{ mt: 1 }}>
              need attention
            </Typography>
          </Paper>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Paper
            sx={{
              p: 2,
              display: 'flex',
              flexDirection: 'column',
              height: 140,
              bgcolor: '#ff9800',
              color: 'white'
            }}
          >
            <Box display="flex" justifyContent="space-between">
              <Typography component="h2" variant="h6" gutterBottom>
                Revenue
              </Typography>
              <TrendingUp />
            </Box>
            <Typography component="p" variant="h4">
              ₹{dashboardData.stats.totalRevenue.toLocaleString()}
            </Typography>
            <Typography variant="body2" sx={{ mt: 1 }}>
              total earnings
            </Typography>
          </Paper>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Paper
            sx={{
              p: 2,
              display: 'flex',
              flexDirection: 'column',
              height: 140,
              bgcolor: '#4caf50',
              color: 'white'
            }}
          >
            <Box display="flex" justifyContent="space-between">
              <Typography component="h2" variant="h6" gutterBottom>
                Products
              </Typography>
              <ShoppingCart />
            </Box>
            <Typography component="p" variant="h4">
              {dashboardData.stats.totalProducts}
            </Typography>
            <Typography variant="body2" sx={{ mt: 1 }}>
              in inventory
            </Typography>
          </Paper>
        </Grid>

        {/* Chart */}
        <Grid item xs={12} md={8}>
          <Paper
            sx={{
              p: 2,
              display: 'flex',
              flexDirection: 'column',
              height: 350
            }}
          >
            <Typography component="h2" variant="h6" color="primary" gutterBottom>
              Sales Overview
            </Typography>
            <Chart
              options={chartOptions}
              series={chartSeries}
              type="area"
              height={280}
            />
          </Paper>
        </Grid>
        
        {/* Recent Activity */}
        <Grid item xs={12} md={4}>
          <Paper
            sx={{
              p: 2,
              display: 'flex',
              flexDirection: 'column',
              height: 350,
              overflow: 'auto'
            }}
          >
            <Typography component="h2" variant="h6" color="primary" gutterBottom>
              Recent Activity
            </Typography>
            
            {dashboardData.recentOrders.length > 0 ? (
              dashboardData.recentOrders.map((order, index) => (
                <Box key={order._id || index} mb={2}>
                  <Box display="flex" alignItems="center">
                    <CalendarToday fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
                    <Typography variant="body2" color="text.secondary">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </Typography>
                  </Box>
                  <Typography variant="body1">
                    New order #{order.orderNumber} - ₹{order.totalAmount.toLocaleString()}
                  </Typography>
                  <Chip 
                    size="small" 
                    label={order.status} 
                    color={
                      order.status === 'Delivered' ? 'success' : 
                      order.status === 'Processing' ? 'primary' : 
                      order.status === 'Shipped' ? 'info' : 'warning'
                    }
                    sx={{ mt: 0.5 }}
                  />
                  {index < dashboardData.recentOrders.length - 1 && (
                    <Divider sx={{ my: 1.5 }} />
                  )}
                </Box>
              ))
            ) : (
              <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                No recent orders
              </Typography>
            )}
          </Paper>
        </Grid>
        
        {/* Recent Products */}
        <Grid item xs={12}>
          <Typography variant="h6" color="primary" gutterBottom sx={{ mt: 2 }}>
            Recent Products
          </Typography>
          <Grid container spacing={3}>
            {dashboardData.recentProducts.length > 0 ? (
              dashboardData.recentProducts.map((product) => (
                <Grid item key={product._id} xs={12} sm={6} md={3}>
                  <Card sx={{ height: '100%' }}>
                    <CardActionArea onClick={() => navigate(`/products/${product._id}`)}>
                      <CardMedia
                        component="img"
                        height="140"
                        image={product.imageUrl || 'https://via.placeholder.com/300x200?text=No+Image'}
                        alt={product.name}
                      />
                      <CardContent>
                        <Typography gutterBottom variant="h6" component="div" noWrap>
                          {product.name}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" noWrap>
                          {product.description}
                        </Typography>
                        <Box display="flex" justifyContent="space-between" alignItems="center" mt={1}>
                          <Typography variant="h6" color="primary">
                            ₹{product.price.toLocaleString()}
                          </Typography>
                          <Chip 
                            size="small" 
                            label={product.category} 
                            color="secondary"
                          />
                        </Box>
                      </CardContent>
                    </CardActionArea>
                  </Card>
                </Grid>
              ))
            ) : (
              <Grid item xs={12}>
                <Typography variant="body2" color="text.secondary">
                  No products available
                </Typography>
              </Grid>
            )}
          </Grid>
        </Grid>
        
        {/* Action Buttons */}
        <Grid item xs={12} sx={{ mt: 2, display: 'flex', justifyContent: 'center', gap: 2 }}>
          <Button 
            variant="contained" 
            color="primary" 
            startIcon={<ShoppingCart />}
            onClick={() => navigate('/products')}
          >
            Browse Products
          </Button>
          <Button 
            variant="outlined" 
            color="primary" 
            startIcon={<LocalShipping />}
            onClick={() => navigate('/orders')}
          >
            View Orders
          </Button>
          <Button 
            variant="outlined" 
            color="secondary" 
            startIcon={<LocationOn />}
            onClick={() => navigate('/weather')}
          >
            Weather Forecast
          </Button>
        </Grid>
      </Grid>
    </Container>
  );
};

export default DashboardPage;