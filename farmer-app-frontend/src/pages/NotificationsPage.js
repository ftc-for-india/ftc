import React, { useEffect, useState } from 'react';
import {
  Container, Typography, Box, Paper, List, ListItem, ListItemText,
  ListItemAvatar, Avatar, IconButton, Divider, Button, Chip,
  CircularProgress, Menu, MenuItem, ListItemIcon, Tooltip
} from '@mui/material';
import {
  Notifications as NotificationsIcon, Delete, MarkEmailRead,
  MoreVert, FilterList, Refresh, NotificationsOff
} from '@mui/icons-material';
import { useNotification } from './contexts/NotificationContext';
import { formatDistanceToNow } from 'date-fns';

const NotificationsPage = () => {
  const { 
    notifications, 
    loading, 
    error, 
    fetchNotifications, 
    markAsRead, 
    markAllAsRead, 
    deleteNotification,
    showSnackbar
  } = useNotification();
  
  const [filter, setFilter] = useState('all'); // 'all', 'read', 'unread'
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedNotification, setSelectedNotification] = useState(null);
  
  useEffect(() => {
    fetchNotifications();
  }, []);
  
  const handleMenuOpen = (event, notification) => {
    setAnchorEl(event.currentTarget);
    setSelectedNotification(notification);
  };
  
  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedNotification(null);
  };
  
  const handleMarkAsRead = async () => {
    if (!selectedNotification) return;
    
    try {
      await markAsRead(selectedNotification._id);
      handleMenuClose();
    } catch (err) {
      console.error('Error marking notification as read:', err);
    }
  };
  
  const handleDeleteNotification = async () => {
    if (!selectedNotification) return;
    
    try {
      await deleteNotification(selectedNotification._id);
      handleMenuClose();
    } catch (err) {
      console.error('Error deleting notification:', err);
    }
  };
  
  const handleMarkAllAsReadClick = async () => {
    try {
      await markAllAsRead();
    } catch (err) {
      console.error('Error marking all notifications as read:', err);
    }
  };
  
  const handleRefresh = () => {
    fetchNotifications();
    showSnackbar('Notifications refreshed', 'info');
  };
  
  const handleFilterChange = (newFilter) => {
    setFilter(newFilter);
  };
  
  const getFilteredNotifications = () => {
    if (filter === 'read') {
      return notifications.filter(notification => notification.read);
    } else if (filter === 'unread') {
      return notifications.filter(notification => !notification.read);
    }
    return notifications;
  };
  
  const getNotificationIcon = (type) => {
    switch (type) {
      case 'order':
        return <Avatar sx={{ bgcolor: 'primary.main' }}>O</Avatar>;
      case 'payment':
        return <Avatar sx={{ bgcolor: 'success.main' }}>P</Avatar>;
      case 'alert':
        return <Avatar sx={{ bgcolor: 'error.main' }}>A</Avatar>;
      case 'info':
        return <Avatar sx={{ bgcolor: 'info.main' }}>I</Avatar>;
      default:
        return <Avatar sx={{ bgcolor: 'secondary.main' }}><NotificationsIcon /></Avatar>;
    }
  };
  
  const filteredNotifications = getFilteredNotifications();
  
  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
        <Typography variant="h4">
          Notifications
        </Typography>
        
        <Box>
          <Tooltip title="Refresh">
            <IconButton onClick={handleRefresh} color="primary">
              <Refresh />
            </IconButton>
          </Tooltip>
          
          <Tooltip title="Filter">
            <IconButton
              color="primary"
              onClick={(e) => setAnchorEl(e.currentTarget)}
              aria-label="filter notifications"
            >
              <FilterList />
            </IconButton>
          </Tooltip>
          
          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl) && !selectedNotification}
            onClose={handleMenuClose}
          >
            <MenuItem 
              onClick={() => {
                handleFilterChange('all');
                handleMenuClose();
              }}
              selected={filter === 'all'}
            >
              <ListItemIcon>
                <NotificationsIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText>All Notifications</ListItemText>
            </MenuItem>
            <MenuItem 
              onClick={() => {
                handleFilterChange('unread');
                handleMenuClose();
              }}
              selected={filter === 'unread'}
            >
              <ListItemIcon>
                <NotificationsIcon fontSize="small" color="primary" />
              </ListItemIcon>
              <ListItemText>Unread</ListItemText>
            </MenuItem>
            <MenuItem 
              onClick={() => {
                handleFilterChange('read');
                handleMenuClose();
              }}
              selected={filter === 'read'}
            >
              <ListItemIcon>
                <MarkEmailRead fontSize="small" />
              </ListItemIcon>
              <ListItemText>Read</ListItemText>
            </MenuItem>
          </Menu>
          
          <Button
            variant="outlined"
            color="primary"
            startIcon={<MarkEmailRead />}
            onClick={handleMarkAllAsReadClick}
            sx={{ ml: 1 }}
            disabled={!notifications.some(n => !n.read)}
          >
            Mark All as Read
          </Button>
        </Box>
      </Box>
      
      {error && (
        <Box sx={{ mb: 3 }}>
          <Typography color="error">{error}</Typography>
        </Box>
      )}
      
      <Paper elevation={2}>
        {loading ? (
          <Box display="flex" justifyContent="center" alignItems="center" sx={{ py: 4 }}>
            <CircularProgress />
          </Box>
        ) : filteredNotifications.length > 0 ? (
          <List>
            {filteredNotifications.map((notification, index) => (
              <React.Fragment key={notification._id}>
                <ListItem
                  alignItems="flex-start"
                  sx={{
                    bgcolor: notification.read ? 'inherit' : 'action.hover',
                    transition: 'background-color 0.3s'
                  }}
                  secondaryAction={
                    <IconButton
                      edge="end"
                      aria-label="more options"
                      onClick={(e) => handleMenuOpen(e, notification)}
                    >
                      <MoreVert />
                    </IconButton>
                  }
                >
                  <ListItemAvatar>
                    {getNotificationIcon(notification.type)}
                  </ListItemAvatar>
                  <ListItemText
                    primary={
                      <Box display="flex" alignItems="center">
                        <Typography
                          variant="subtitle1"
                          component="span"
                          sx={{ fontWeight: notification.read ? 'normal' : 'bold' }}
                        >
                          {notification.title}
                        </Typography>
                        {!notification.read && (
                          <Chip
                            label="New"
                            color="primary"
                            size="small"
                            sx={{ ml: 1, height: 20 }}
                          />
                        )}
                      </Box>
                    }
                    secondary={
                      <>
                        <Typography
                          component="span"
                          variant="body2"
                          color="text.primary"
                          sx={{ display: 'block', mb: 0.5 }}
                        >
                          {notification.message}
                        </Typography>
                        <Typography
                          component="span"
                          variant="body2"
                          color="text.secondary"
                        >
                          {notification.createdAt && formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                        </Typography>
                      </>
                    }
                    onClick={() => {
                      if (!notification.read) {
                        markAsRead(notification._id);
                      }
                    }}
                    sx={{ cursor: 'pointer' }}
                  />
                </ListItem>
                {index < filteredNotifications.length - 1 && <Divider variant="inset" component="li" />}
              </React.Fragment>
            ))}
          </List>
        ) : (
          <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" sx={{ py: 4 }}>
                        <NotificationsOff sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
            <Typography variant="h6" color="text.secondary" gutterBottom>
              No notifications found
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              {filter !== 'all' 
                ? `You don't have any ${filter === 'read' ? 'read' : 'unread'} notifications` 
                : "You don't have any notifications yet"}
            </Typography>
            {filter !== 'all' && (
              <Button 
                variant="outlined" 
                color="primary"
                onClick={() => setFilter('all')}
              >
                View All Notifications
              </Button>
            )}
          </Box>
        )}
      </Paper>
      
      {/* Notification Action Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl) && Boolean(selectedNotification)}
        onClose={handleMenuClose}
      >
        {selectedNotification && !selectedNotification.read && (
          <MenuItem onClick={handleMarkAsRead}>
            <ListItemIcon>
              <MarkEmailRead fontSize="small" />
            </ListItemIcon>
            <ListItemText>Mark as Read</ListItemText>
          </MenuItem>
        )}
        <MenuItem onClick={handleDeleteNotification}>
          <ListItemIcon>
            <Delete fontSize="small" />
          </ListItemIcon>
          <ListItemText>Delete</ListItemText>
        </MenuItem>
      </Menu>
    </Container>
  );
};

export default NotificationsPage;