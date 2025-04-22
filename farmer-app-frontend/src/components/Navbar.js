import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  AppBar, Toolbar, Typography, Button, IconButton, Badge,
  Menu, MenuItem, Avatar, Box, Drawer, List, ListItem,
  ListItemIcon, ListItemText, Divider, useMediaQuery, useTheme
} from '@mui/material';
import {
  ShoppingCart, Notifications, AccountCircle, Menu as MenuIcon,
  Dashboard, Store, Receipt, Person, ExitToApp, LocationOn
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';
import { useNotification } from '../contexts/NotificationContext';

const Navbar = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const navigate = useNavigate();
  const { currentUser, logout, isAuthenticated } = useAuth();
  const { getCartItemCount } = useCart();
  const { unreadCount } = useNotification();
  
  const [anchorEl, setAnchorEl] = useState(null);
  const [notificationAnchor, setNotificationAnchor] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  
  const handleProfileMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };
  
  const handleMenuClose = () => {
    setAnchorEl(null);
  };
  
  const handleNotificationOpen = (event) => {
    setNotificationAnchor(event.currentTarget);
  };
  
  const handleNotificationClose = () => {
    setNotificationAnchor(null);
  };
  
  const handleDrawerToggle = () => {
    setDrawerOpen(!drawerOpen);
  };
  
  const handleLogout = () => {
    logout();
    handleMenuClose();
    navigate('/loginpage');
  };
  
  const cartItemCount = getCartItemCount();
  
  const renderMenu = (
    <Menu
      anchorEl={anchorEl}
      anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      keepMounted
      transformOrigin={{ vertical: 'top', horizontal: 'right' }}
      open={Boolean(anchorEl)}
      onClose={handleMenuClose}
    >
      <MenuItem onClick={() => { handleMenuClose(); navigate('/profile'); }}>
        <ListItemIcon>
          <Person fontSize="small" />
        </ListItemIcon>
        <ListItemText>Profile</ListItemText>
      </MenuItem>
      
      {currentUser?.userType === 'farmer' && (
        <MenuItem onClick={() => { handleMenuClose(); navigate('/farmer-dashboard'); }}>
          <ListItemIcon>
            <Dashboard fontSize="small" />
          </ListItemIcon>
          <ListItemText>Farmer Dashboard</ListItemText>
        </MenuItem>
      )}
      
      {currentUser?.userType === 'admin' && (
        <MenuItem onClick={() => { handleMenuClose(); navigate('/admin'); }}>
          <ListItemIcon>
            <Dashboard fontSize="small" />
          </ListItemIcon>
          <ListItemText>Admin Dashboard</ListItemText>
        </MenuItem>
      )}
      
      <MenuItem onClick={handleLogout}>
        <ListItemIcon>
          <ExitToApp fontSize="small" />
        </ListItemIcon>
        <ListItemText>Logout</ListItemText>
      </MenuItem>
    </Menu>
  );
  
  const renderNotifications = (
    <Menu
      anchorEl={notificationAnchor}
      anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      keepMounted
      transformOrigin={{ vertical: 'top', horizontal: 'right' }}
      open={Boolean(notificationAnchor)}
      onClose={handleNotificationClose}
    >
      <MenuItem>
        <Typography variant="subtitle1" fontWeight="bold">Notifications</Typography>
      </MenuItem>
      <Divider />
      {/* Render notifications here */}
      <MenuItem onClick={() => navigate('/orders')}>
        <ListItemText primary="View all notifications" />
      </MenuItem>
    </Menu>
  );
  
  const drawer = (
    <Box sx={{ width: 250 }} role="presentation" onClick={handleDrawerToggle}>
      <List>
        <ListItem>
          <Typography variant="h6" color="primary">
            Farmer App
          </Typography>
        </ListItem>
        <Divider />
        
        {isAuthenticated ? (
          <>
            <ListItem button onClick={() => navigate('/dashboard')}>
              <ListItemIcon><Dashboard /></ListItemIcon>
              <ListItemText primary="Dashboard" />
            </ListItem>
            
            <ListItem button onClick={() => navigate('/products')}>
              <ListItemIcon><Store /></ListItemIcon>
              <ListItemText primary="Products" />
            </ListItem>
            
            <ListItem button onClick={() => navigate('/cart')}>
              <ListItemIcon>
                <Badge badgeContent={cartItemCount} color="secondary">
                  <ShoppingCart />
                </Badge>
              </ListItemIcon>
              <ListItemText primary="Cart" />
            </ListItem>
            
            <ListItem button onClick={() => navigate('/orders')}>
              <ListItemIcon><Receipt /></ListItemIcon>
              <ListItemText primary="Orders" />
            </ListItem>
            
            <ListItem button onClick={() => navigate('/profile')}>
              <ListItemIcon><Person /></ListItemIcon>
              <ListItemText primary="Profile" />
            </ListItem>
            
            <ListItem button onClick={() => navigate('/weather')}>
              <ListItemIcon><LocationOn /></ListItemIcon>
              <ListItemText primary="Weather" />
            </ListItem>
            
            <Divider />
            
            <ListItem button onClick={handleLogout}>
              <ListItemIcon><ExitToApp /></ListItemIcon>
              <ListItemText primary="Logout" />
            </ListItem>
          </>
        ) : (
          <>
            <ListItem button onClick={() => navigate('/loginpage')}>
              <ListItemIcon><Person /></ListItemIcon>
              <ListItemText primary="Login" />
            </ListItem>
            
            <ListItem button onClick={() => navigate('/register')}>
              <ListItemIcon><Person /></ListItemIcon>
              <ListItemText primary="Register" />
            </ListItem>
          </>
        )}
      </List>
    </Box>
  );
  
  return (
    <>
      <AppBar position="static" color="primary">
        <Toolbar>
          {isMobile && (
            <IconButton
              edge="start"
              color="inherit"
              aria-label="menu"
              onClick={handleDrawerToggle}
              sx={{ mr: 2 }}
            >
              <MenuIcon />
            </IconButton>
          )}
          
          <Typography
            variant="h6"
            component={Link}
            to="/"
            sx={{
              flexGrow: 1,
              textDecoration: 'none',
              color: 'inherit',
              fontWeight: 'bold'
            }}
          >
            Farmer App
          </Typography>
          
          {!isMobile && isAuthenticated && (
            <>
              <Button color="inherit" component={Link} to="/dashboard">
                Dashboard
              </Button>
              <Button color="inherit" component={Link} to="/products">
                Products
              </Button>
              <Button color="inherit" component={Link} to="/orders">
                Orders
              </Button>
            </>
          )}
          
          {isAuthenticated ? (
            <>
              <IconButton color="inherit" onClick={() => navigate('/cart')}>
                <Badge badgeContent={cartItemCount} color="secondary">
                  <ShoppingCart />
                </Badge>
              </IconButton>
              
              <IconButton color="inherit" onClick={handleNotificationOpen}>
                <Badge badgeContent={unreadCount} color="error">
                  <Notifications />
                </Badge>
              </IconButton>
              
              <IconButton
                edge="end"
                aria-label="account of current user"
                aria-haspopup="true"
                onClick={handleProfileMenuOpen}
                color="inherit"
              >
                {currentUser?.profileImage ? (
                  <Avatar 
                    src={currentUser.profileImage} 
                    alt={currentUser.name}
                    sx={{ width: 32, height: 32 }}
                  />
                ) : (
                  <AccountCircle />
                )}
              </IconButton>
            </>
          ) : (
            <>
              <Button color="inherit" component={Link} to="/loginpage">
                Login
              </Button>
              <Button color="inherit" component={Link} to="/register">
                Register
              </Button>
            </>
          )}
        </Toolbar>
      </AppBar>
      
      {renderMenu}
      {renderNotifications}
      
      <Drawer
        anchor="left"
        open={drawerOpen}
        onClose={handleDrawerToggle}
      >
        {drawer}
      </Drawer>
    </>
  );
};

export default Navbar;