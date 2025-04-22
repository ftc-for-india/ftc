import React, { useState, useEffect } from 'react';
import {
  Container, Grid, Typography, Box, Button, Paper, Avatar,
  TextField, Divider, Tabs, Tab, CircularProgress, IconButton,
  List, ListItem, ListItemText, ListItemAvatar, ListItemSecondaryAction,
  Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions,
  Card, CardContent, CardMedia, Chip, Rating
} from '@mui/material';
import {
  Edit, Save, Cancel, Person, LocationOn, Phone, Email,
  Lock, Visibility, VisibilityOff, Delete, ShoppingBag,
  Favorite, History, PhotoCamera, ArrowForward
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { useNotification } from '../contexts/NotificationContext';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const ProfilePage = () => {
  const { currentUser, updateUserProfile, logout } = useAuth();
  const { showSnackbar } = useNotification();
  const navigate = useNavigate();
  
  const [tabValue, setTabValue] = useState(0);
  const [editMode, setEditMode] = useState(false);
  const [loading, setLoading] = useState(false);
  const [profileData, setProfileData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
    bio: '',
    profilePicture: ''
  });
  
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  
  const [showPassword, setShowPassword] = useState({
    currentPassword: false,
    newPassword: false,
    confirmPassword: false
  });
  
  const [orders, setOrders] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [recentlyViewed, setRecentlyViewed] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [loadingFavorites, setLoadingFavorites] = useState(false);
  const [loadingHistory, setLoadingHistory] = useState(false);
  
  const [confirmDialog, setConfirmDialog] = useState({
    open: false,
    title: '',
    message: '',
    onConfirm: null
  });
  
  useEffect(() => {
    if (currentUser) {
      setProfileData({
        name: currentUser.name || '',
        email: currentUser.email || '',
        phone: currentUser.phone || '',
        address: currentUser.address || '',
        city: currentUser.city || '',
        state: currentUser.state || '',
        pincode: currentUser.pincode || '',
        bio: currentUser.bio || '',
        profilePicture: currentUser.profilePicture || ''
      });
    }
  }, [currentUser]);
  
  useEffect(() => {
    if (tabValue === 1) {
      fetchOrders();
    } else if (tabValue === 2) {
      fetchFavorites();
    } else if (tabValue === 3) {
      fetchRecentlyViewed();
    }
  }, [tabValue]);
  
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };
  
  const handleEditToggle = () => {
    if (editMode) {
      // Reset form if canceling edit
      setProfileData({
        name: currentUser.name || '',
        email: currentUser.email || '',
        phone: currentUser.phone || '',
        address: currentUser.address || '',
        city: currentUser.city || '',
        state: currentUser.state || '',
        pincode: currentUser.pincode || '',
        bio: currentUser.bio || '',
        profilePicture: currentUser.profilePicture || ''
      });
    }
    setEditMode(!editMode);
  };
  
  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfileData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const togglePasswordVisibility = (field) => {
    setShowPassword(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };
  
  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      await updateUserProfile(profileData);
      setEditMode(false);
      showSnackbar('Profile updated successfully', 'success');
    } catch (err) {
      console.error('Error updating profile:', err);
      showSnackbar(err.response?.data?.message || 'Failed to update profile', 'error');
    } finally {
      setLoading(false);
    }
  };
  
  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      showSnackbar('New passwords do not match', 'error');
      return;
    }
    
    if (passwordData.newPassword.length < 6) {
      showSnackbar('Password must be at least 6 characters long', 'error');
      return;
    }
    
    setLoading(true);
    
    try {
      const token = localStorage.getItem('token');
      const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000';
      
      await axios.put(
        `${apiUrl}/users/change-password`,
        {
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword
        },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
      
      showSnackbar('Password changed successfully', 'success');
    } catch (err) {
      console.error('Error changing password:', err);
      showSnackbar(err.response?.data?.message || 'Failed to change password', 'error');
    } finally {
      setLoading(false);
    }
  };
  
  const handleProfilePictureChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      showSnackbar('Image size should be less than 5MB', 'error');
      return;
    }
    
    // Check file type
    if (!file.type.match('image.*')) {
      showSnackbar('Please select an image file', 'error');
      return;
    }
    
    setLoading(true);
    
    try {
      const formData = new FormData();
      formData.append('profilePicture', file);
      
      const token = localStorage.getItem('token');
      const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000';
      
      const response = await axios.post(
        `${apiUrl}/users/profile-picture`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
            Authorization: `Bearer ${token}`
          }
        }
      );
      
      setProfileData(prev => ({
        ...prev,
        profilePicture: response.data.profilePicture
      }));
      
      // Update the user in auth context
      await updateUserProfile({ profilePicture: response.data.profilePicture });
      
      showSnackbar('Profile picture updated successfully', 'success');
    } catch (err) {
      console.error('Error uploading profile picture:', err);
      showSnackbar('Failed to upload profile picture', 'error');
    } finally {
      setLoading(false);
    }
  };
  
  const handleDeleteAccount = () => {
    setConfirmDialog({
      open: true,
      title: 'Delete Account',
      message: 'Are you sure you want to delete your account? This action cannot be undone.',
      onConfirm: deleteAccount
    });
  };
  
  const deleteAccount = async () => {
    setLoading(true);
    
    try {
      const token = localStorage.getItem('token');
      const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000';
      
      await axios.delete(
        `${apiUrl}/users/account`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      
      setConfirmDialog({ ...confirmDialog, open: false });
      showSnackbar('Your account has been deleted', 'info');
      logout();
      navigate('/');
    } catch (err) {
      console.error('Error deleting account:', err);
      showSnackbar('Failed to delete account', 'error');
      setLoading(false);
    }
  };
  
  const handleCloseDialog = () => {
    setConfirmDialog({ ...confirmDialog, open: false });
  };
  
  const fetchOrders = async () => {
    setLoadingOrders(true);
    
    try {
      const token = localStorage.getItem('token');
      const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000';
      
      const response = await axios.get(
        `${apiUrl}/orders`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      
      setOrders(response.data || []);
    } catch (err) {
      console.error('Error fetching orders:', err);
      showSnackbar('Failed to fetch orders', 'error');
    } finally {
      setLoadingOrders(false);
    }
  };
  
  const fetchFavorites = async () => {
    setLoadingFavorites(true);
    
    try {
      const token = localStorage.getItem('token');
      const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000';
      
      const response = await axios.get(
        `${apiUrl}/users/favorites`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      
      setFavorites(response.data || []);
    } catch (err) {
      console.error('Error fetching favorites:', err);
      showSnackbar('Failed to fetch favorites', 'error');
    } finally {
      setLoadingFavorites(false);
    }
  };
  
  const fetchRecentlyViewed = async () => {
    setLoadingHistory(true);
    
    try {
      const token = localStorage.getItem('token');
      const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000';
      
      const response = await axios.get(
        `${apiUrl}/users/recently-viewed`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      
      setRecentlyViewed(response.data || []);
    } catch (err) {
      console.error('Error fetching recently viewed products:', err);
      showSnackbar('Failed to fetch recently viewed products', 'error');
    } finally {
      setLoadingHistory(false);
    }
  };
  
  const handleRemoveFavorite = async (productId) => {
    try {
      const token = localStorage.getItem('token');
      const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000';
      
      await axios.delete(
        `${apiUrl}/users/favorites/${productId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      
      setFavorites(prev => prev.filter(item => item._id !== productId));
      showSnackbar('Removed from favorites', 'success');
    } catch (err) {
      console.error('Error removing favorite:', err);
      showSnackbar('Failed to remove from favorites', 'error');
    }
  };
  
  if (!currentUser) {
    return (
      <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
        <Paper sx={{ p: 3, textAlign: 'center' }}>
          <Typography variant="h5" gutterBottom>
            Please log in to view your profile
          </Typography>
          <Button
            variant="contained"
            color="primary"
            onClick={() => navigate('/login')}
            sx={{ mt: 2 }}
          >
            Log In
          </Button>
        </Paper>
      </Container>
    );
  }
  
  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Grid container spacing={4}>
        {/* Profile Header */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Box display="flex" flexDirection={{ xs: 'column', sm: 'row' }} alignItems="center">
              <Box position="relative" sx={{ mb: { xs: 2, sm: 0 }, mr: { sm: 3 } }}>
                <Avatar
                  src={profileData.profilePicture || '/default-avatar.png'}
                  alt={profileData.name}
                  sx={{ width: 120, height: 120 }}
                />
                <input
                  accept="image/*"
                  style={{ display: 'none' }}
                  id="profile-picture-upload"
                  type="file"
                  onChange={handleProfilePictureChange}
                />
                <label htmlFor="profile-picture-upload">
                  <IconButton
                    color="primary"
                    aria-label="upload picture"
                    component="span"
                    sx={{
                      position: 'absolute',
                      bottom: 0,
                      right: 0,
                      bgcolor: 'background.paper'
                    }}
                  >
                    <PhotoCamera />
                  </IconButton>
                </label>
              </Box>
              
              <Box flex={1}>
                <Typography variant="h4" gutterBottom>
                  {profileData.name}
                </Typography>
                <Box display="flex" alignItems="center" sx={{ mb: 1 }}>
                  <Email fontSize="small" color="action" sx={{ mr: 1 }} />
                  <Typography variant="body1">
                    {profileData.email}
                  </Typography>
                </Box>
                {profileData.phone && (
                  <Box display="flex" alignItems="center" sx={{ mb: 1 }}>
                    <Phone fontSize="small" color="action" sx={{ mr: 1 }} />
                    <Typography variant="body1">
                      {profileData.phone}
                    </Typography>
                  </Box>
                )}
                {profileData.city && profileData.state && (
                  <Box display="flex" alignItems="center">
                    <LocationOn fontSize="small" color="action" sx={{ mr: 1 }} />
                    <Typography variant="body1">
                      {profileData.city}, {profileData.state}
                    </Typography>
                  </Box>
                )}
              </Box>
              
              <Button
                variant={editMode ? "outlined" : "contained"}
                color={editMode ? "secondary" : "primary"}
                startIcon={editMode ? <Cancel /> : <Edit />}
                onClick={handleEditToggle}
                sx={{ alignSelf: { xs: 'stretch', sm: 'flex-start' }, mt: { xs: 2, sm: 0 } }}
              >
                {editMode ? 'Cancel' : 'Edit Profile'}
              </Button>
            </Box>
          </Paper>
        </Grid>
        
        {/* Tabs */}
        <Grid item xs={12}>
          <Paper sx={{ mb: 3 }}>
            <Tabs
              value={tabValue}
              onChange={handleTabChange}
              variant="scrollable"
              scrollButtons="auto"
              indicatorColor="primary"
              textColor="primary"
            >
              <Tab icon={<Person />} label="Profile" />
              <Tab icon={<ShoppingBag />} label="Orders" />
              <Tab icon={<Favorite />} label="Favorites" />
              <Tab icon={<History />} label="Recently Viewed" />
            </Tabs>
          </Paper>
          
          {/* Profile Tab */}
          {tabValue === 0 && (
            <Grid container spacing={3}>
              <Grid item xs={12} md={8}>
                <Paper sx={{ p: 3 }}>
                  <Typography variant="h6" gutterBottom>
                    Personal Information
                  </Typography>
                  <Divider sx={{ mb: 3 }} />
                  
                  <form onSubmit={handleProfileSubmit}>
                    <Grid container spacing={3}>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          fullWidth
                          label="Full Name"
                          name="name"
                          value={profileData.name}
                          onChange={handleProfileChange}
                          disabled={!editMode}
                          required
                        />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          fullWidth
                          label="Email"
                          name="email"
                          value={profileData.email}
                          onChange={handleProfileChange}
                          disabled={true} // Email cannot be changed
                          required
                        />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          fullWidth
                          label="Phone Number"
                          name="phone"
                          value={profileData.phone}
                          onChange={handleProfileChange}
                          disabled={!editMode}
                        />
                      </Grid>
                      <Grid item xs={12}>
                        <TextField
                          fullWidth
                          label="Address"
                          name="address"
                          value={profileData.address}
                          onChange={handleProfileChange}
                          disabled={!editMode}
                          multiline
                          rows={2}
                        />
                      </Grid>
                      <Grid item xs={12} sm={4}>
                        <TextField
                          fullWidth
                          label="City"
                          name="city"
                          value={profileData.city}
                          onChange={handleProfileChange}
                          disabled={!editMode}
                        />
                      </Grid>
                      <Grid item xs={12} sm={4}>
                        <TextField
                          fullWidth
                          label="State"
                          name="state"
                          value={profileData.state}
                          onChange={handleProfileChange}
                          disabled={!editMode}
                        />
                      </Grid>
                      <Grid item xs={12} sm={4}>
                        <TextField
                          fullWidth
                          label="Pincode"
                          name="pincode"
                          value={profileData.pincode}
                          onChange={handleProfileChange}
                          disabled={!editMode}
                        />
                      </Grid>
                      <Grid item xs={12}>
                        <TextField
                          fullWidth
                          label="Bio"
                          name="bio"
                          value={profileData.bio}
                          onChange={handleProfileChange}
                          disabled={!editMode}
                          multiline
                          rows={3}
                        />
                      </Grid>
                      
                      {editMode && (
                        <Grid item xs={12}>
                          <Box display="flex" justifyContent="flex-end">
                            <Button
                              type="submit"
                              variant="contained"
                              color="primary"
                              startIcon={<Save />}
                              disabled={loading}
                            >
                              {loading ? 'Saving...' : 'Save Changes'}
                            </Button>
                          </Box>
                        </Grid>
                      )}
                    </Grid>
                  </form>
                </Paper>
              </Grid>
              
              <Grid item xs={12} md={4}>
                <Paper sx={{ p: 3, mb: 3 }}>
                  <Typography variant="h6" gutterBottom>
                    Change Password
                  </Typography>
                  <Divider sx={{ mb: 3 }} />
                  
                  <form onSubmit={handlePasswordSubmit}>
                    <TextField
                      fullWidth
                      label="Current Password"
                      name="currentPassword"
                      type={showPassword.currentPassword ? 'text' : 'password'}
                      value={passwordData.currentPassword}
                      onChange={handlePasswordChange}
                      required
                      sx={{ mb: 2 }}
                      InputProps={{
                        endAdornment: (
                          <IconButton
                            onClick={() => togglePasswordVisibility('currentPassword')}
                            edge="end"
                          >
                            {showPassword.currentPassword ? <VisibilityOff /> : <Visibility />}
                          </IconButton>
                        )
                      }}
                    />
                    
                    <TextField
                      fullWidth
                      label="New Password"
                      name="newPassword"
                      type={showPassword.newPassword ? 'text' : 'password'}
                      value={passwordData.newPassword}
                      onChange={handlePasswordChange}
                      required
                      sx={{ mb: 2 }}
                      InputProps={{
                        endAdornment: (
                          <IconButton
                            onClick={() => togglePasswordVisibility('newPassword')}
                            edge="end"
                          >
                            {showPassword.newPassword ? <VisibilityOff /> : <Visibility />}
                          </IconButton>
                        )
                      }}
                    />
                    
                    <TextField
                      fullWidth
                      label="Confirm New Password"
                      name="confirmPassword"
                      type={showPassword.confirmPassword ? 'text' : 'password'}
                      value={passwordData.confirmPassword}
                      onChange={handlePasswordChange}
                      required
                      sx={{ mb: 3 }}
                      InputProps={{
                        endAdornment: (
                          <IconButton
                            onClick={() => togglePasswordVisibility('confirmPassword')}
                            edge="end"
                          >
                            {showPassword.confirmPassword ? <VisibilityOff /> : <Visibility />}
                          </IconButton>
                        )
                      }}
                    />
                    
                    <Button
                      type="submit"
                      fullWidth
                      variant="contained"
                      color="primary"
                      startIcon={<Lock />}
                      disabled={loading}
                    >
                      {loading ? 'Updating...' : 'Update Password'}
                    </Button>
                  </form>
                </Paper>
                
                <Paper sx={{ p: 3 }}>
                  <Typography variant="h6" gutterBottom color="error">
                    Danger Zone
                  </Typography>
                  <Divider sx={{ mb: 3 }} />
                  
                  <Button
                    fullWidth
                    variant="outlined"
                    color="error"
                    startIcon={<Delete />}
                    onClick={handleDeleteAccount}
                  >
                    Delete Account
                  </Button>
                </Paper>
              </Grid>
            </Grid>
          )}
          
          {/* Orders Tab */}
          {tabValue === 1 && (
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Your Orders
              </Typography>
              <Divider sx={{ mb: 3 }} />
              
              {loadingOrders ? (
                <Box display="flex" justifyContent="center" sx={{ py: 4 }}>
                  <CircularProgress />
                </Box>
              ) : orders.length > 0 ? (
                <List>
                  {orders.map((order) => (
                    <Paper key={order._id} variant="outlined" sx={{ mb: 2, p: 2 }}>
                      <Box display="flex" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
                        <Typography variant="subtitle1">
                          Order #{order._id.substring(order._id.length - 8)}
                        </Typography>
                        <Chip
                          label={order.status}
                          color={
                            order.status === 'Delivered' ? 'success' :
                            order.status === 'Shipped' ? 'primary' :
                            order.status === 'Processing' ? 'info' :
                            order.status === 'Cancelled' ? 'error' : 'default'
                          }
                          size="small"
                        />
                      </Box>
                      
                      <Grid container spacing={2}>
                        <Grid item xs={12} sm={8}>
                          <Typography variant="body2" color="text.secondary" gutterBottom>
                            Ordered on {new Date(order.createdAt).toLocaleDateString()}
                          </Typography>
                          
                          <Box sx={{ mt: 1 }}>
                            {order.items.slice(0, 3).map((item) => (
                              <Box key={item._id} display="flex" alignItems="center" sx={{ mb: 1 }}>
                                <Box
                                  component="img"
                                  src={item.product.imageUrl || 'https://via.placeholder.com/50?text=No+Image'}
                                  alt={item.product.name}
                                  sx={{ width: 50, height: 50, mr: 2, objectFit: 'cover' }}
                                />
                                <Box>
                                  <Typography variant="body2">
                                    {item.product.name} x {item.quantity}
                                  </Typography>
                                  <Typography variant="body2" color="text.secondary">
                                    ₹{item.price.toLocaleString()}
                                  </Typography>
                                </Box>
                              </Box>
                            ))}
                            
                            {order.items.length > 3 && (
                              <Typography variant="body2" color="text.secondary">
                                +{order.items.length - 3} more items
                              </Typography>
                            )}
                          </Box>
                        </Grid>
                        
                        <Grid item xs={12} sm={4}>
                          <Box display="flex" flexDirection="column" alignItems="flex-end">
                            <Typography variant="h6" color="primary" gutterBottom>
                              ₹{order.totalAmount.toLocaleString()}
                            </Typography>
                            
                            <Button
                              variant="outlined"
                              size="small"
                              endIcon={<ArrowForward />}
                              onClick={() => navigate(`/orders/${order._id}`)}
                              sx={{ mt: 1 }}
                            >
                              View Details
                            </Button>
                          </Box>
                        </Grid>
                      </Grid>
                    </Paper>
                  ))}
                </List>
              ) : (
                <Box sx={{ p: 3, textAlign: 'center' }}>
                  <ShoppingBag sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
                  <Typography variant="h6" gutterBottom>
                    No orders yet
                  </Typography>
                  <Typography variant="body2" color="text.secondary" paragraph>
                    You haven't placed any orders yet.
                  </Typography>
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={() => navigate('/products')}
                  >
                    Start Shopping
                  </Button>
                </Box>
              )}
            </Paper>
          )}
          
          {/* Favorites Tab */}
          {tabValue === 2 && (
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Your Favorites
              </Typography>
              <Divider sx={{ mb: 3 }} />
              
              {loadingFavorites ? (
                <Box display="flex" justifyContent="center" sx={{ py: 4 }}>
                  <CircularProgress />
                </Box>
              ) : favorites.length > 0 ? (
                <Grid container spacing={3}>
                  {favorites.map((product) => (
                    <Grid item key={product._id} xs={12} sm={6} md={4} lg={3}>
                      <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                        <CardMedia
                          component="img"
                          height={160}
                          image={product.imageUrl || 'https://via.placeholder.com/300x200?text=No+Image'}
                          alt={product.name}
                          sx={{ objectFit: 'cover', cursor: 'pointer' }}
                          onClick={() => navigate(`/products/${product._id}`)}
                        />
                        <CardContent sx={{ flexGrow: 1 }}>
                          <Box display="flex" justifyContent="space-between" alignItems="flex-start">
                            <Typography gutterBottom variant="h6" component="h2" sx={{ cursor: 'pointer' }} onClick={() => navigate(`/products/${product._id}`)}>
                              {product.name}
                            </Typography>
                            <IconButton 
                              size="small" 
                              color="secondary"
                              onClick={() => handleRemoveFavorite(product._id)}
                            >
                              <Favorite />
                            </IconButton>
                          </Box>
                          
                          <Box display="flex" justifyContent="space-between" alignItems="flex-start">
                            <Typography gutterBottom variant="h6" component="h2" sx={{ cursor: 'pointer' }} onClick={() => navigate(`/products/${product._id}`)}>
                              {product.name}
                            </Typography>
                            <IconButton 
                              size="small" 
                              color="secondary"
                              onClick={() => handleRemoveFavorite(product._id)}
                            >
                              <Favorite />
                            </IconButton>
                          </Box>
                          
                          <Box display="flex" justifyContent="space-between" alignItems="center">
                            <Typography variant="body2" color="text.secondary">
                              {product.category}
                            </Typography>
                            <Rating value={product.rating || 0} precision={0.5} size="small" readOnly />
                          </Box>
                          
                          <Box display="flex" justifyContent="space-between" alignItems="center" sx={{ mt: 1 }}>
                            <Typography variant="h6" color="primary">
                              ₹{product.price.toLocaleString()}
                            </Typography>
                            <Button
                              size="small"
                              variant="outlined"
                              onClick={() => navigate(`/products/${product._id}`)}
                            >
                              View
                            </Button>
                          </Box>
                        </CardContent>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              ) : (
                <Box sx={{ p: 3, textAlign: 'center' }}>
                  <Favorite sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
                  <Typography variant="h6" gutterBottom>
                    No favorites yet
                  </Typography>
                  <Typography variant="body2" color="text.secondary" paragraph>
                    You haven't added any products to your favorites yet.
                  </Typography>
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={() => navigate('/products')}
                  >
                    Explore Products
                  </Button>
                </Box>
              )}
            </Paper>
          )}
          
          {/* Recently Viewed Tab */}
          {tabValue === 3 && (
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Recently Viewed Products
              </Typography>
              <Divider sx={{ mb: 3 }} />
              
              {loadingHistory ? (
                <Box display="flex" justifyContent="center" sx={{ py: 4 }}>
                  <CircularProgress />
                </Box>
              ) : recentlyViewed.length > 0 ? (
                <Grid container spacing={3}>
                  {recentlyViewed.map((product) => (
                    <Grid item key={product._id} xs={12} sm={6} md={4} lg={3}>
                      <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                        <CardMedia
                          component="img"
                          height={160}
                          image={product.imageUrl || 'https://via.placeholder.com/300x200?text=No+Image'}
                          alt={product.name}
                          sx={{ objectFit: 'cover', cursor: 'pointer' }}
                          onClick={() => navigate(`/products/${product._id}`)}
                        />
                        <CardContent sx={{ flexGrow: 1 }}>
                          <Typography gutterBottom variant="h6" component="h2" sx={{ cursor: 'pointer' }} onClick={() => navigate(`/products/${product._id}`)}>
                            {product.name}
                          </Typography>
                          
                          <Box display="flex" justifyContent="space-between" alignItems="center">
                            <Typography variant="body2" color="text.secondary">
                              {product.category}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              Viewed {new Date(product.viewedAt).toLocaleDateString()}
                            </Typography>
                          </Box>
                          
                          <Box display="flex" justifyContent="space-between" alignItems="center" sx={{ mt: 1 }}>
                            <Typography variant="h6" color="primary">
                              ₹{product.price.toLocaleString()}
                            </Typography>
                            <Button
                              size="small"
                              variant="outlined"
                              onClick={() => navigate(`/products/${product._id}`)}
                            >
                              View Again
                            </Button>
                          </Box>
                        </CardContent>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              ) : (
                <Box sx={{ p: 3, textAlign: 'center' }}>
                  <History sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
                  <Typography variant="h6" gutterBottom>
                    No recently viewed products
                  </Typography>
                  <Typography variant="body2" color="text.secondary" paragraph>
                    You haven't viewed any products recently.
                  </Typography>
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={() => navigate('/products')}
                  >
                    Browse Products
                  </Button>
                </Box>
              )}
            </Paper>
          )}
        </Grid>
      </Grid>
      
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
          <Button onClick={handleCloseDialog}>
            Cancel
          </Button>
          <Button 
            onClick={confirmDialog.onConfirm} 
            color="error" 
            autoFocus
            disabled={loading}
          >
            {loading ? 'Processing...' : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default ProfilePage;