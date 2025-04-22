import React, { useState, useEffect } from 'react';
import {
  Container, Grid, Paper, Typography, Box, Button, Divider,
  List, ListItem, ListItemIcon, ListItemText, Card, CardContent,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Tabs, Tab, CircularProgress, Alert, Dialog, DialogTitle,
  DialogContent, DialogContentText, DialogActions, TextField,
  InputAdornment, IconButton, Chip, Avatar, useTheme
} from '@mui/material';
import {
  Dashboard, Inventory, ShoppingCart, AttachMoney,
  TrendingUp, Edit, Add, Search, Refresh, Delete,
  CheckCircle, Cancel, Visibility, LocalShipping,
  Store, BarChart, Notifications
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useNotification } from '../contexts/NotificationContext';
import axios from 'axios';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, PointElement, LineElement, Title, BarElement } from 'chart.js';
import { Pie, Line, Bar } from 'react-chartjs-2';

// Register ChartJS components
ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, PointElement, LineElement, Title, BarElement);

const FarmerDashboard = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { showNotification } = useNotification();
  
  const [activeTab, setActiveTab] = useState(0);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalOrders: 0,
    totalRevenue: 0,
    recentOrders: [],
    topProducts: [],
    monthlySales: []
  });
  
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [confirmDialog, setConfirmDialog] = useState({
    open: false,
    title: '',
    message: '',
    onConfirm: null
  });
  
  useEffect(() => {
    fetchDashboardData();
  }, []);
  
  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000';
      
      // Fetch dashboard stats
      const statsResponse = await axios.get(
        `${apiUrl}/api/farmers/dashboard`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      
      setStats(statsResponse.data);
      
      // Fetch products based on active tab
      if (activeTab === 1) {
        fetchProducts();
      }
      
      // Fetch orders based on active tab
      if (activeTab === 2) {
        fetchOrders();
      }
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      showNotification('Failed to load dashboard data', 'error');
    } finally {
      setLoading(false);
    }
  };
  
  const fetchProducts = async () => {
    try {
      const token = localStorage.getItem('token');
      const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000';
      
      const response = await axios.get(
        `${apiUrl}/api/farmers/products`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      
      setProducts(response.data);
    } catch (err) {
      console.error('Error fetching products:', err);
      showNotification('Failed to load products', 'error');
    }
  };
  
  const fetchOrders = async () => {
    try {
      const token = localStorage.getItem('token');
      const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000';
      
      const response = await axios.get(
        `${apiUrl}/api/farmers/orders`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      
      setOrders(response.data);
    } catch (err) {
      console.error('Error fetching orders:', err);
      showNotification('Failed to load orders', 'error');
    }
  };
  
  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
    
    // Fetch data based on the selected tab
    if (newValue === 1 && products.length === 0) {
      fetchProducts();
    } else if (newValue === 2 && orders.length === 0) {
      fetchOrders();
    }
  };
  
  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };
  
  const handleDeleteProduct = (productId) => {
    setConfirmDialog({
      open: true,
      title: 'Delete Product',
      message: 'Are you sure you want to delete this product? This action cannot be undone.',
      onConfirm: async () => {
        try {
          const token = localStorage.getItem('token');
          const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000';
          
          await axios.delete(
            `${apiUrl}/api/farmers/products/${productId}`,
            {
              headers: {
                Authorization: `Bearer ${token}`
              }
            }
          );
          
          // Update products list
          setProducts(products.filter(product => product._id !== productId));
          showNotification('Product deleted successfully', 'success');
        } catch (err) {
          console.error('Error deleting product:', err);
          showNotification('Failed to delete product', 'error');
        } finally {
          setConfirmDialog({ ...confirmDialog, open: false });
        }
      }
    });
  };
  
  const handleUpdateOrderStatus = (orderId, status) => {
    setConfirmDialog({
      open: true,
      title: 'Update Order Status',
      message: `Are you sure you want to mark this order as ${status}?`,
      onConfirm: async () => {
        try {
          const token = localStorage.getItem('token');
          const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000';
          
          await axios.put(
            `${apiUrl}/api/farmers/orders/${orderId}`,
            { status },
            {
              headers: {
                Authorization: `Bearer ${token}`
              }
            }
          );
          
          // Update orders list
          setOrders(orders.map(order => 
            order._id === orderId ? { ...order, status } : order
          ));
          showNotification('Order status updated successfully', 'success');
        } catch (err) {
          console.error('Error updating order status:', err);
          showNotification('Failed to update order status', 'error');
        } finally {
          setConfirmDialog({ ...confirmDialog, open: false });
        }
      }
    });
  };
  
  const handleCloseDialog = () => {
    setConfirmDialog({ ...confirmDialog, open: false });
  };
  
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-US', options);
  };
  
  const filteredProducts = products.filter(product => 
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.category.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  const filteredOrders = orders.filter(order => 
    order._id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.status.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  // Chart data
  const productCategoryData = {
    labels: [...new Set(products.map(product => product.category))],
    datasets: [
      {
        data: [...new Set(products.map(product => product.category))].map(
          category => products.filter(product => product.category === category).length
        ),
        backgroundColor: [
          theme.palette.primary.main,
          theme.palette.secondary.main,
          theme.palette.success.main,
          theme.palette.warning.main,
          theme.palette.error.main,
          theme.palette.info.main,
        ],
        borderWidth: 1,
      },
    ],
  };
  
  const salesData = {
    labels: stats.monthlySales.map(item => item.month),
    datasets: [
      {
        label: 'Sales',
        data: stats.monthlySales.map(item => item.sales),
        borderColor: theme.palette.primary.main,
        backgroundColor: theme.palette.primary.light + '80',
        fill: true,
        tension: 0.4,
      },
    ],
  };
  
  const revenueData = {
    labels: stats.monthlySales.map(item => item.month),
    datasets: [
      {
        label: 'Revenue',
        data: stats.monthlySales.map(item => item.revenue),
        backgroundColor: theme.palette.secondary.main,
      },
    ],
  };
  
  const renderDashboardTab = () => (
    <Grid container spacing={3}>
      {/* Stats Cards */}
      <Grid item xs={12} sm={6} md={4}>
        <Card>
          <CardContent>
            <Typography color="textSecondary" gutterBottom>
              Total Products
            </Typography>
            <Box display="flex" alignItems="center">
              <Inventory color="primary" sx={{ fontSize: 40, mr: 2 }} />
              <Typography variant="h4" component="div">
                {stats.totalProducts}
              </Typography>
            </Box>
            <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
                {products.filter(product => product.isActive).length} active
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={4}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Total Orders
              </Typography>
              <Box display="flex" alignItems="center">
                <ShoppingCart color="primary" sx={{ fontSize: 40, mr: 2 }} />
                <Typography variant="h4" component="div">
                  {stats.totalOrders}
                </Typography>
              </Box>
              <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
                {orders.filter(order => order.status === 'pending').length} pending
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={4}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Total Revenue
              </Typography>
              <Box display="flex" alignItems="center">
                <AttachMoney color="primary" sx={{ fontSize: 40, mr: 2 }} />
                <Typography variant="h4" component="div">
                  ₹{stats.totalRevenue.toLocaleString()}
                </Typography>
              </Box>
              <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
                This month: ₹{stats.monthlySales[stats.monthlySales.length - 1]?.revenue.toLocaleString() || 0}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      
        {/* Charts */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Product Categories
              </Typography>
              <Box height={300} display="flex" justifyContent="center" alignItems="center">
                <Pie data={productCategoryData} options={{ maintainAspectRatio: false }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Monthly Sales
              </Typography>
              <Box height={300}>
                <Line 
                  data={salesData} 
                  options={{ 
                    maintainAspectRatio: false,
                    scales: {
                      y: {
                        beginAtZero: true,
                        title: {
                          display: true,
                          text: 'Number of Orders'
                        }
                      }
                    }
                  }} 
                />
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Monthly Revenue
              </Typography>
              <Box height={300}>
                <Bar 
                  data={revenueData} 
                  options={{ 
                    maintainAspectRatio: false,
                    scales: {
                      y: {
                        beginAtZero: true,
                        title: {
                          display: true,
                          text: 'Revenue (₹)'
                        }
                      }
                    }
                  }} 
                />
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Top Products
              </Typography>
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Product</TableCell>
                      <TableCell>Category</TableCell>
                      <TableCell align="right">Sales</TableCell>
                      <TableCell align="right">Revenue</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {stats.topProducts.map((product) => (
                      <TableRow key={product._id}>
                        <TableCell>{product.name}</TableCell>
                        <TableCell>{product.category}</TableCell>
                        <TableCell align="right">{product.sales}</TableCell>
                        <TableCell align="right">₹{product.revenue.toLocaleString()}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Grid>
        
        {/* Recent Orders */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Recent Orders
              </Typography>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Order ID</TableCell>
                      <TableCell>Customer</TableCell>
                      <TableCell>Date</TableCell>
                      <TableCell>Amount</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell align="right">Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {stats.recentOrders.map((order) => (
                      <TableRow key={order._id}>
                        <TableCell>#{order._id.substring(0, 8)}</TableCell>
                        <TableCell>{order.user.firstName} {order.user.lastName}</TableCell>
                        <TableCell>{formatDate(order.createdAt)}</TableCell>
                        <TableCell>₹{order.totalAmount.toLocaleString()}</TableCell>
                        <TableCell>
                          <Chip
                            label={order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                            color={
                              order.status === 'delivered' ? 'success' :
                              order.status === 'shipped' ? 'info' :
                              order.status === 'processing' ? 'warning' :
                              order.status === 'cancelled' ? 'error' : 'default'
                            }
                            size="small"
                          />
                        </TableCell>
                        <TableCell align="right">
                          <IconButton
                            size="small"
                            onClick={() => navigate(`/farmer/orders/${order._id}`)}
                          >
                            <Visibility fontSize="small" />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
              <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
                <Button
                  variant="text"
                  onClick={() => setActiveTab(2)}
                  endIcon={<TrendingUp />}
                >
                  View All Orders
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    );
  
  const renderProductsTab = () => (
    <Box>
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between' }}>
        <TextField
          label="Search Products"
          variant="outlined"
          size="small"
          value={searchTerm}
          onChange={handleSearch}
          sx={{ width: 300 }}
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
          startIcon={<Add />}
          onClick={() => navigate('/farmer/products/new')}
        >
          Add Product
        </Button>
      </Box>
      
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Product</TableCell>
              <TableCell>Category</TableCell>
              <TableCell>Price</TableCell>
              <TableCell>Stock</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Created</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredProducts.map((product) => (
              <TableRow key={product._id}>
                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Avatar
                      variant="rounded"
                      src={product.imageUrl}
                      sx={{ mr: 2, width: 40, height: 40 }}
                    />
                    <Typography variant="body2">
                      {product.name}
                    </Typography>
                  </Box>
                </TableCell>
                <TableCell>{product.category}</TableCell>
                <TableCell>₹{product.price.toLocaleString()}</TableCell>
                <TableCell>{product.stock}</TableCell>
                <TableCell>
                  <Chip
                    label={product.isActive ? 'Active' : 'Inactive'}
                    color={product.isActive ? 'success' : 'error'}
                    size="small"
                  />
                </TableCell>
                <TableCell>{formatDate(product.createdAt)}</TableCell>
                <TableCell align="right">
                  <IconButton
                    size="small"
                    onClick={() => navigate(`/products/${product._id}`)}
                  >
                    <Visibility fontSize="small" />
                  </IconButton>
                  <IconButton
                    size="small"
                    onClick={() => navigate(`/farmer/products/${product._id}/edit`)}
                  >
                    <Edit fontSize="small" />
                  </IconButton>
                  <IconButton
                    size="small"
                    color="error"
                    onClick={() => handleDeleteProduct(product._id)}
                  >
                    <Delete fontSize="small" />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
  
  const renderOrdersTab = () => (
    <Box>
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between' }}>
        <TextField
          label="Search Orders"
          variant="outlined"
          size="small"
          value={searchTerm}
          onChange={handleSearch}
          sx={{ width: 300 }}
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
          startIcon={<Refresh />}
          onClick={fetchOrders}
        >
          Refresh
        </Button>
      </Box>
      
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Order ID</TableCell>
              <TableCell>Customer</TableCell>
              <TableCell>Date</TableCell>
              <TableCell>Products</TableCell>
              <TableCell>Amount</TableCell>
              <TableCell>Status</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredOrders.map((order) => (
              <TableRow key={order._id}>
                <TableCell>#{order._id.substring(0, 8)}</TableCell>
                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Avatar sx={{ mr: 1, width: 24, height: 24 }}>
                      {order.user.firstName.charAt(0)}
                    </Avatar>
                    <Typography variant="body2">
                      {order.user.firstName} {order.user.lastName}
                    </Typography>
                  </Box>
                </TableCell>
                <TableCell>{formatDate(order.createdAt)}</TableCell>
                <TableCell>{order.items.length}</TableCell>
                <TableCell>₹{order.totalAmount.toLocaleString()}</TableCell>
                <TableCell>
                  <Chip
                    label={order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                    color={
                      order.status === 'delivered' ? 'success' :
                      order.status === 'shipped' ? 'info' :
                      order.status === 'processing' ? 'warning' :
                      order.status === 'cancelled' ? 'error' : 'default'
                    }
                    size="small"
                  />
                </TableCell>
                <TableCell align="right">
                  <IconButton
                    size="small"
                    onClick={() => navigate(`/farmer/orders/${order._id}`)}
                  >
                    <Visibility fontSize="small" />
                  </IconButton>
                  
                  {order.status !== 'delivered' && order.status !== 'cancelled' && (
                    <>
                      {order.status === 'pending' && (
                        <IconButton
                          size="small"
                          color="warning"
                          onClick={() => handleUpdateOrderStatus(order._id, 'processing')}
                        >
                          <TrendingUp fontSize="small" />
                        </IconButton>
                      )}
                      
                      {order.status === 'processing' && (
                        <IconButton
                          size="small"
                          color="info"
                          onClick={() => handleUpdateOrderStatus(order._id, 'shipped')}
                        >
                          <LocalShipping fontSize="small" />
                        </IconButton>
                      )}
                      
                      {order.status === 'shipped' && (
                        <IconButton
                          size="small"
                          color="success"
                          onClick={() => handleUpdateOrderStatus(order._id, 'delivered')}
                        >
                          <CheckCircle fontSize="small" />
                        </IconButton>
                      )}
                      
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => handleUpdateOrderStatus(order._id, 'cancelled')}
                      >
                        <Cancel fontSize="small" />
                      </IconButton>
                    </>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
  
  // Check if user is farmer
  if (!user || user.userType !== 'farmer') {
    return (
      <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
        <Alert severity="error" sx={{ mb: 3 }}>
          You do not have permission to access this page.
        </Alert>
        <Button
          variant="contained"
          onClick={() => navigate('/')}
        >
          Go to Home
        </Button>
      </Container>
    );
  }
  
  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Farmer Dashboard
        </Typography>
        <Box>
          <Button
            variant="outlined"
            color="primary"
            startIcon={<Store />}
            onClick={() => navigate('/farmer/store')}
            sx={{ mr: 2 }}
          >
            My Store
          </Button>
          <Button
            variant="contained"
            color="primary"
            startIcon={<Refresh />}
            onClick={fetchDashboardData}
          >
            Refresh Data
          </Button>
        </Box>
      </Box>
      
      <Tabs
        value={activeTab}
        onChange={handleTabChange}
        indicatorColor="primary"
        textColor="primary"
        variant="fullWidth"
        sx={{ mb: 3 }}
      >
        <Tab icon={<Dashboard />} label="Dashboard" />
        <Tab icon={<Inventory />} label="Products" />
        <Tab icon={<ShoppingCart />} label="Orders" />
      </Tabs>
      
      {loading && activeTab === 0 ? (
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
          <CircularProgress />
        </Box>
      ) : (
        <>
          {activeTab === 0 && renderDashboardTab()}
          {activeTab === 1 && renderProductsTab()}
          {activeTab === 2 && renderOrdersTab()}
        </>
      )}
      
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
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={confirmDialog.onConfirm} color="error" autoFocus>
            Confirm
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default FarmerDashboard;