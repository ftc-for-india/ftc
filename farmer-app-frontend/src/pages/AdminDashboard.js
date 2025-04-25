import React, { useState, useEffect,useCallback } from 'react';
import {
  Container, Grid, Paper, Typography, Box, Button,
  Card, CardContent,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Tabs, Tab, CircularProgress, Alert, Dialog, DialogTitle,
  DialogContent, DialogContentText, DialogActions, TextField,
  InputAdornment, IconButton, Chip, Avatar, useTheme
} from '@mui/material';
import {
  Dashboard, People, Inventory, ShoppingCart, AttachMoney,
  TrendingUp, Delete, Edit, Add, Search, Refresh,
  CheckCircle, Cancel, Visibility, Block, LocalShipping
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useNotification } from '../contexts/NotificationContext';
import axios from 'axios';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, PointElement, LineElement, Title, BarElement } from 'chart.js';
import { Pie, Line, Bar } from 'react-chartjs-2';

// Register ChartJS components
ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, PointElement, LineElement, Title, BarElement);

const AdminDashboard = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { showNotification } = useNotification();
  
  const [activeTab, setActiveTab] = useState(0);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalFarmers: 0,
    totalProducts: 0,
    totalOrders: 0,
    totalRevenue: 0,
    recentOrders: [],
    topProducts: [],
    userGrowth: []
  });
  
  const [users, setUsers] = useState([]);
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
  
  const fetchUsers = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000';
      
      const response = await axios.get(
        `${apiUrl}/api/admin/users`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      
      setUsers(response.data);
    } catch (err) {
      console.error('Error fetching users:', err);
      showNotification('Failed to load users', 'error');
    }
  }, [showNotification]);

  const fetchProducts = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000';
      
      const response = await axios.get(
        `${apiUrl}/api/admin/products`,
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
  }, [showNotification]);

  const fetchOrders = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000';
      
      const response = await axios.get(
        `${apiUrl}/api/admin/orders`,
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
  }, [showNotification]);

  const fetchDashboardData = useCallback(async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000';
      
      // Fetch dashboard stats
      const statsResponse = await axios.get(
        `${apiUrl}/api/admin/dashboard`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      
      setStats(statsResponse.data);
      
      // Fetch users based on active tab
      if (activeTab === 1) {
        await fetchUsers();
      }
      
      // Fetch products based on active tab
      if (activeTab === 2) {
        await fetchProducts();
      }
      
      // Fetch orders based on active tab
      if (activeTab === 3) {
        await fetchOrders();
      }
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      showNotification('Failed to load dashboard data', 'error');
    } finally {
      setLoading(false);
    }
  }, [activeTab, showNotification, fetchUsers, fetchProducts, fetchOrders]);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  
  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
    
    // Fetch data based on the selected tab
    if (newValue === 1 && users.length === 0) {
      fetchUsers();
    } else if (newValue === 2 && products.length === 0) {
      fetchProducts();
    } else if (newValue === 3 && orders.length === 0) {
      fetchOrders();
    }
  };
  
  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };
  
  const handleDeleteUser = (userId) => {
    setConfirmDialog({
      open: true,
      title: 'Delete User',
      message: 'Are you sure you want to delete this user? This action cannot be undone.',
      onConfirm: async () => {
        try {
          const token = localStorage.getItem('token');
          const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000';
          
          await axios.delete(
            `${apiUrl}/api/admin/users/${userId}`,
            {
              headers: {
                Authorization: `Bearer ${token}`
              }
            }
          );
          
          // Update users list
          setUsers(users.filter(user => user._id !== userId));
          showNotification('User deleted successfully', 'success');
        } catch (err) {
          console.error('Error deleting user:', err);
          showNotification('Failed to delete user', 'error');
        } finally {
          setConfirmDialog({ ...confirmDialog, open: false });
        }
      }
    });
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
            `${apiUrl}/api/admin/products/${productId}`,
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
            `${apiUrl}/api/admin/orders/${orderId}`,
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
  
  const filteredUsers = users.filter(user => 
    user.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.userType.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  const filteredProducts = products.filter(product => 
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (product.farmer && product.farmer.name && product.farmer.name.toLowerCase().includes(searchTerm.toLowerCase()))
  );
  
  const filteredOrders = orders.filter(order => 
    order._id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.status.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  // Chart data
  const userTypeData = {
    labels: ['Consumers', 'Farmers'],
    datasets: [
      {
        data: [stats.totalUsers - stats.totalFarmers, stats.totalFarmers],
        backgroundColor: [theme.palette.primary.main, theme.palette.secondary.main],
        borderColor: [theme.palette.primary.dark, theme.palette.secondary.dark],
        borderWidth: 1,
      },
    ],
  };
  
  const revenueData = {
    labels: stats.userGrowth.map(item => item.month),
    datasets: [
      {
        label: 'Revenue',
        data: stats.userGrowth.map(item => item.revenue),
        borderColor: theme.palette.primary.main,
        backgroundColor: theme.palette.primary.light + '80',
        fill: true,
        tension: 0.4,
      },
    ],
  };
  
  const userGrowthData = {
    labels: stats.userGrowth.map(item => item.month),
    datasets: [
      {
        label: 'New Users',
        data: stats.userGrowth.map(item => item.users),
        backgroundColor: theme.palette.secondary.main,
      },
    ],
  };
  
  const renderDashboardTab = () => (
    <Grid container spacing={3}>
      {/* Stats Cards */}
      <Grid item xs={12} sm={6} md={3}>
        <Card>
          <CardContent>
            <Typography color="textSecondary" gutterBottom>
              Total Users
            </Typography>
            <Box display="flex" alignItems="center">
              <People color="primary" sx={{ fontSize: 40, mr: 2 }} />
              <Typography variant="h4" component="div">
                {stats.totalUsers}
              </Typography>
            </Box>
            <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
              {stats.totalFarmers} farmers, {stats.totalUsers - stats.totalFarmers} consumers
            </Typography>
          </CardContent>
        </Card>
      </Grid>
      
      <Grid item xs={12} sm={6} md={3}>
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
              From {stats.totalFarmers} farmers
            </Typography>
          </CardContent>
        </Card>
      </Grid>
      
      <Grid item xs={12} sm={6} md={3}>
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
        
        <Grid item xs={12} sm={6} md={3}>
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
                From {stats.totalOrders} orders
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      
        {/* Charts */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                User Distribution
              </Typography>
              <Box height={300} display="flex" justifyContent="center" alignItems="center">
                <Pie data={userTypeData} options={{ maintainAspectRatio: false }} />
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
                <Line 
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
                User Growth
              </Typography>
              <Box height={300}>
                <Bar 
                  data={userGrowthData} 
                  options={{ 
                    maintainAspectRatio: false,
                    scales: {
                      y: {
                        beginAtZero: true,
                        title: {
                          display: true,
                          text: 'New Users'
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
                            onClick={() => navigate(`/admin/orders/${order._id}`)}
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
                  onClick={() => setActiveTab(3)}
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
  
  const renderUsersTab = () => (
    <Box>
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between' }}>
        <TextField
          label="Search Users"
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
          onClick={() => navigate('/admin/users/new')}
        >
          Add User
        </Button>
      </Box>
      
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>User</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Phone</TableCell>
              <TableCell>Role</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Joined</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredUsers.map((user) => (
              <TableRow key={user._id}>
                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Avatar sx={{ mr: 2 }}>
                      {user.firstName.charAt(0)}
                    </Avatar>
                    <Box>
                      <Typography variant="body2">
                        {user.firstName} {user.lastName}
                      </Typography>
                    </Box>
                  </Box>
                </TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>{user.phone || 'N/A'}</TableCell>
                <TableCell>
                  <Chip
                    label={user.userType.charAt(0).toUpperCase() + user.userType.slice(1)}
                    color={user.userType === 'admin' ? 'secondary' : user.userType === 'farmer' ? 'primary' : 'default'}
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  <Chip
                    label={user.isActive ? 'Active' : 'Inactive'}
                    color={user.isActive ? 'success' : 'error'}
                    size="small"
                  />
                </TableCell>
                <TableCell>{formatDate(user.createdAt)}</TableCell>
                <TableCell align="right">
                  <IconButton
                    size="small"
                    onClick={() => navigate(`/admin/users/${user._id}`)}
                  >
                    <Visibility fontSize="small" />
                  </IconButton>
                  <IconButton
                    size="small"
                    onClick={() => navigate(`/admin/users/${user._id}/edit`)}
                  >
                    <Edit fontSize="small" />
                  </IconButton>
                  <IconButton
                    size="small"
                    color="error"
                    onClick={() => handleDeleteUser(user._id)}
                  >
                    <Delete fontSize="small" />
                  </IconButton>
                  <IconButton
                    size="small"
                    color={user.isActive ? 'error' : 'success'}
                    onClick={() => {
                      // Toggle user active status
                    }}
                  >
                    {user.isActive ? <Block fontSize="small" /> : <CheckCircle fontSize="small" />}
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
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
          onClick={() => navigate('/admin/products/new')}
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
              <TableCell>Farmer</TableCell>
              <TableCell>Status</TableCell>
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
                <TableCell>{product.farmer?.name || 'N/A'}</TableCell>
                <TableCell>
                  <Chip
                    label={product.isActive ? 'Active' : 'Inactive'}
                    color={product.isActive ? 'success' : 'error'}
                    size="small"
                  />
                </TableCell>
                <TableCell align="right">
                  <IconButton
                    size="small"
                    onClick={() => navigate(`/admin/products/${product._id}`)}
                  >
                    <Visibility fontSize="small" />
                  </IconButton>
                  <IconButton
                    size="small"
                    onClick={() => navigate(`/admin/products/${product._id}/edit`)}
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
              <TableCell>Amount</TableCell>
              <TableCell>Payment</TableCell>
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
                <TableCell>₹{order.totalAmount.toLocaleString()}</TableCell>
                <TableCell>
                  {order.paymentMethod === 'cod' ? 'Cash on Delivery' : 'Online Payment'}
                </TableCell>
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
                    onClick={() => navigate(`/admin/orders/${order._id}`)}
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
  
  // Check if user is admin
  if (!user || user.userType !== 'admin') {
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
          Admin Dashboard
        </Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<Refresh />}
          onClick={fetchDashboardData}
        >
          Refresh Data
        </Button>
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
        <Tab icon={<People />} label="Users" />
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
          {activeTab === 1 && renderUsersTab()}
          {activeTab === 2 && renderProductsTab()}
          {activeTab === 3 && renderOrdersTab()}
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

export default AdminDashboard;
            