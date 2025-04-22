import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  Container, Grid, Typography, Box, Button, Divider, Rating,
  Card, CardContent, CardMedia, Chip, TextField, IconButton,
  Tabs, Tab, Paper, CircularProgress, Alert, Snackbar,
  List, ListItem, ListItemAvatar, ListItemText, Avatar
} from '@mui/material';
import {
  ShoppingCart, Favorite, FavoriteBorder, Share, ArrowBack,
  Add, Remove, LocalShipping, VerifiedUser, Storefront,
  LocationOn, Phone, AccessTime, Comment
} from '@mui/icons-material';
import { useAuth } from './contexts/AuthContext';
import { useCart } from './contexts/CartContext';
import { useNotification } from './contexts/NotificationContext';
import ProductImageGallery from '../components/ProductImageGallery';
import RelatedProducts from '../components/RelatedProducts';
import ReviewForm from '../components/ReviewForm';

const ProductPage = () => {
  const { productId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { addToCart } = useCart();
  const { showNotification } = useNotification();
  
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState(0);
  const [isFavorite, setIsFavorite] = useState(false);
  const [reviews, setReviews] = useState([]);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [openSnackbar, setOpenSnackbar] = useState(false);
  
  useEffect(() => {
    fetchProduct();
  }, [productId]);
  
  const fetchProduct = async () => {
    setLoading(true);
    try {
      const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000';
      const token = localStorage.getItem('token');
      
      const productResponse = await axios.get(
        `${apiUrl}/api/products/${productId}`,
        token ? { headers: { Authorization: `Bearer ${token}` } } : {}
      );
      
      setProduct(productResponse.data);
      
      // Check if product is in favorites
      if (user) {
        try {
          const favResponse = await axios.get(
            `${apiUrl}/api/users/favorites`,
            { headers: { Authorization: `Bearer ${token}` } }
          );
          
          setIsFavorite(favResponse.data.some(fav => fav._id === productId));
        } catch (err) {
          console.error('Error fetching favorites:', err);
        }
      }
      
      // Fetch reviews
      const reviewsResponse = await axios.get(`${apiUrl}/api/products/${productId}/reviews`);
      setReviews(reviewsResponse.data);
      
      // Fetch related products
      const relatedResponse = await axios.get(
        `${apiUrl}/api/products/related/${productId}`
      );
      setRelatedProducts(relatedResponse.data);
      
    } catch (err) {
      console.error('Error fetching product:', err);
      setError('Failed to load product. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  const handleQuantityChange = (e) => {
    const value = parseInt(e.target.value);
    if (!isNaN(value) && value > 0 && value <= product.stock) {
      setQuantity(value);
    }
  };
  
  const handleIncreaseQuantity = () => {
    if (quantity < product.stock) {
      setQuantity(quantity + 1);
    }
  };
  
  const handleDecreaseQuantity = () => {
    if (quantity > 1) {
      setQuantity(quantity - 1);
    }
  };
  
  const handleAddToCart = () => {
    if (!user) {
      showNotification('Please login to add items to cart', 'warning');
      navigate('/loginpage');
      return;
    }
    
    addToCart(product, quantity);
    setOpenSnackbar(true);
  };
  
  const handleBuyNow = () => {
    if (!user) {
      showNotification('Please login to proceed with purchase', 'warning');
      navigate('/loginpage');
      return;
    }
    
    addToCart(product, quantity);
    navigate('/checkout');
  };
  
  const handleToggleFavorite = async () => {
    if (!user) {
      showNotification('Please login to add to favorites', 'warning');
      navigate('/loginpage');
      return;
    }
    
    try {
      const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000';
      const token = localStorage.getItem('token');
      
      if (isFavorite) {
        await axios.delete(
          `${apiUrl}/api/users/favorites/${productId}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        showNotification('Removed from favorites', 'success');
      } else {
        await axios.post(
          `${apiUrl}/api/users/favorites`,
          { productId },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        showNotification('Added to favorites', 'success');
      }
      
      setIsFavorite(!isFavorite);
    } catch (err) {
      console.error('Error updating favorites:', err);
      showNotification('Failed to update favorites', 'error');
    }
  };
  
  const handleShareProduct = () => {
    if (navigator.share) {
      navigator.share({
        title: product.name,
        text: `Check out this ${product.name} on Farmer's Market!`,
        url: window.location.href,
      })
      .catch((error) => console.log('Error sharing:', error));
    } else {
      // Fallback for browsers that don't support the Web Share API
      navigator.clipboard.writeText(window.location.href);
      showNotification('Link copied to clipboard', 'success');
    }
  };
  
  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };
  
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-US', options);
  };
  
  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <CircularProgress />
      </Box>
    );
  }
  
  if (error || !product) {
    return (
      <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
        <Alert severity="error" sx={{ mb: 3 }}>
          {error || 'Product not found'}
        </Alert>
        <Button
          variant="contained"
          startIcon={<ArrowBack />}
          onClick={() => navigate('/products')}
        >
          Back to Products
        </Button>
      </Container>
    );
  }
  
  // Calculate average rating
  const averageRating = reviews.length > 0
    ? reviews.reduce((acc, review) => acc + review.rating, 0) / reviews.length
    : 0;
  
  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 8 }}>
      <Button
        variant="text"
        startIcon={<ArrowBack />}
        onClick={() => navigate(-1)}
        sx={{ mb: 2 }}
      >
        Back
      </Button>
      
      <Grid container spacing={4}>
        {/* Product Images */}
        <Grid item xs={12} md={6}>
          <ProductImageGallery 
            images={[
              product.imageUrl,
              ...(product.additionalImages || [])
            ]} 
          />
        </Grid>
        
        {/* Product Details */}
        <Grid item xs={12} md={6}>
          <Box>
            <Box display="flex" justifyContent="space-between" alignItems="center">
              <Typography variant="h4" component="h1" gutterBottom>
                {product.name}
              </Typography>
              <Box>
                <IconButton color={isFavorite ? "error" : "default"} onClick={handleToggleFavorite}>
                  {isFavorite ? <Favorite /> : <FavoriteBorder />}
                </IconButton>
                <IconButton color="primary" onClick={handleShareProduct}>
                  <Share />
                </IconButton>
              </Box>
            </Box>
            
            <Box display="flex" alignItems="center" mb={1}>
              <Rating value={averageRating} precision={0.5} readOnly />
              <Typography variant="body2" sx={{ ml: 1 }}>
                ({reviews.length} reviews)
              </Typography>
            </Box>
            
            <Typography variant="h5" color="primary" gutterBottom>
              ₹{product.price.toLocaleString()}
              {product.mrp && product.mrp > product.price && (
                <>
                  <Typography
                    component="span"
                    variant="body1"
                    sx={{ textDecoration: 'line-through', ml: 2, color: 'text.secondary' }}
                  >
                    ₹{product.mrp.toLocaleString()}
                  </Typography>
                  <Chip
                    label={`${Math.round((1 - product.price / product.mrp) * 100)}% OFF`}
                    color="error"
                    size="small"
                    sx={{ ml: 2 }}
                  />
                </>
              )}
            </Typography>
            
            <Box display="flex" alignItems="center" mb={2}>
              <Chip
                label={product.category}
                color="primary"
                variant="outlined"
                size="small"
              />
              <Chip
                label={product.isOrganic ? 'Organic' : 'Regular'}
                color={product.isOrganic ? 'success' : 'default'}
                variant="outlined"
                size="small"
                sx={{ ml: 1 }}
              />
              <Chip
                label={product.stock > 0 ? 'In Stock' : 'Out of Stock'}
                color={product.stock > 0 ? 'success' : 'error'}
                variant="outlined"
                size="small"
                sx={{ ml: 1 }}
              />
            </Box>
            
            <Divider sx={{ my: 2 }} />
            
            <Typography variant="body1" paragraph>
              {product.description}
            </Typography>
            
            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle1" gutterBottom>
                Quantity:
              </Typography>
              <Box display="flex" alignItems="center">
                <IconButton onClick={handleDecreaseQuantity} disabled={quantity <= 1}>
                  <Remove />
                </IconButton>
                <TextField
                  value={quantity}
                  onChange={handleQuantityChange}
                  inputProps={{ min: 1, max: product.stock, style: { textAlign: 'center' } }}
                  sx={{ width: '60px' }}
                />
                <IconButton onClick={handleIncreaseQuantity} disabled={quantity >= product.stock}>
                  <Add />
                </IconButton>
                <Typography variant="body2" sx={{ ml: 2, color: 'text.secondary' }}>
                  {product.stock} available
                </Typography>
              </Box>
            </Box>
            
            <Box display="flex" gap={2} mb={3}>
              <Button
                variant="contained"
                color="primary"
                startIcon={<ShoppingCart />}
                onClick={handleAddToCart}
                disabled={product.stock === 0}
                fullWidth
              >
                Add to Cart
              </Button>
              <Button
                variant="contained"
                color="secondary"
                onClick={handleBuyNow}
                disabled={product.stock === 0}
                fullWidth
              >
                Buy Now
              </Button>
            </Box>
            
            <Box sx={{ bgcolor: 'background.paper', p: 2, borderRadius: 1 }}>
              <Box display="flex" alignItems="center" mb={1}>
                <LocalShipping color="primary" sx={{ mr: 1 }} />
                <Typography variant="body2">
                  Free delivery for orders above ₹500
                </Typography>
              </Box>
              <Box display="flex" alignItems="center" mb={1}>
                <VerifiedUser color="primary" sx={{ mr: 1 }} />
                <Typography variant="body2">
                  100% Authentic Products
                </Typography>
              </Box>
              <Box display="flex" alignItems="center">
                <Storefront color="primary" sx={{ mr: 1 }} />
                <Typography variant="body2">
                  Sold by: {product.farmer?.name || 'Farmer\'s Market'}
                </Typography>
              </Box>
            </Box>
          </Box>
        </Grid>
        
        {/* Tabs Section */}
        <Grid item xs={12}>
          <Paper sx={{ mt: 4 }}>
            <Tabs
              value={activeTab}
              onChange={handleTabChange}
              indicatorColor="primary"
              textColor="primary"
              variant="fullWidth"
            >
              <Tab label="Details" />
              <Tab label="Reviews" />
              <Tab label="Shipping" />
              <Tab label="Seller Info" />
            </Tabs>
            
            <Box sx={{ p: 3 }}>
              {activeTab === 0 && (
                <Box>
                  <Typography variant="h6" gutterBottom>
                    Product Details
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={12} md={6}>
                      <Typography variant="subtitle1" gutterBottom>
                        Specifications:
                      </Typography>
                      <List>
                        {Object.entries(product.specifications || {}).map(([key, value]) => (
                          <ListItem key={key} sx={{ py: 0.5 }}>
                            <ListItemText
                              primary={key}
                              secondary={value}
                              primaryTypographyProps={{ variant: 'body2', fontWeight: 'bold' }}
                            />
                          </ListItem>
                        ))}
                      </List>
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <Typography variant="subtitle1" gutterBottom>
                        Features:
                      </Typography>
                      <List>
                        {(product.features || []).map((feature, index) => (
                          <ListItem key={index} sx={{ py: 0.5 }}>
                            <ListItemText primary={feature} />
                          </ListItem>
                        ))}
                      </List>
                    </Grid>
                  </Grid>
                </Box>
              )}
              
              {activeTab === 1 && (
                <Box>
                  <Typography variant="h6" gutterBottom>
                    Customer Reviews
                  </Typography>
                  
                  <Box display="flex" alignItems="center" mb={3}>
                    <Box sx={{ mr: 3 }}>
                      <Typography variant="h3" color="primary">
                        {averageRating.toFixed(1)}
                      </Typography>
                      <Rating value={averageRating} precision={0.5} readOnly />
                      <Typography variant="body2">
                        {reviews.length} reviews
                      </Typography>
                    </Box>
                    
                    <Box>
                      {[5, 4, 3, 2, 1].map((star) => {
                                                const count = reviews.filter(review => review.rating === star).length;
                                                const percentage = reviews.length > 0 ? (count / reviews.length) * 100 : 0;
                                                
                                                return (
                                                  <Box key={star} display="flex" alignItems="center" mb={0.5}>
                                                    <Box width={30}>
                                                      <Typography variant="body2">{star}★</Typography>
                                                    </Box>
                                                    <Box width="60%" mx={1} bgcolor="background.paper" borderRadius={1}>
                                                      <Box
                                                        height={8}
                                                        width={`${percentage}%`}
                                                        bgcolor={
                                                          star >= 4 ? 'success.main' :
                                                          star >= 3 ? 'warning.main' : 'error.main'
                                                        }
                                                        borderRadius={1}
                                                      />
                                                    </Box>
                                                    <Typography variant="body2" color="text.secondary">
                                                      {count}
                                                    </Typography>
                                                  </Box>
                                                );
                                              })}
                                            </Box>
                                          </Box>
                                          
                                          {user ? (
                                            <ReviewForm
                                              productId={productId}
                                              onReviewSubmitted={fetchProduct}
                                            />
                                          ) : (
                                            <Box sx={{ mt: 2, p: 2, bgcolor: 'background.paper', borderRadius: 1 }}>
                                              <Typography variant="body1">
                                                Please <Button onClick={() => navigate('/loginpage')}>login</Button> to write a review.
                                              </Typography>
                                            </Box>
                                          )}
                                          
                                          <Divider sx={{ my: 3 }} />
                                          
                                          <List>
                                            {reviews.length > 0 ? (
                                              reviews.map((review) => (
                                                <ListItem
                                                  key={review._id}
                                                  alignItems="flex-start"
                                                  sx={{ 
                                                    mb: 2, 
                                                    p: 2, 
                                                    bgcolor: 'background.paper', 
                                                    borderRadius: 1 
                                                  }}
                                                >
                                                  <ListItemAvatar>
                                                    <Avatar>
                                                      {review.user.firstName ? review.user.firstName.charAt(0) : 'U'}
                                                    </Avatar>
                                                  </ListItemAvatar>
                                                  <ListItemText
                                                    primary={
                                                      <Box display="flex" justifyContent="space-between" alignItems="center">
                                                        <Typography variant="subtitle1">
                                                          {review.user.firstName} {review.user.lastName}
                                                        </Typography>
                                                        <Typography variant="body2" color="text.secondary">
                                                          {formatDate(review.createdAt)}
                                                        </Typography>
                                                      </Box>
                                                    }
                                                    secondary={
                                                      <>
                                                        <Rating value={review.rating} size="small" readOnly sx={{ mt: 0.5, mb: 1 }} />
                                                        <Typography variant="body1" color="text.primary">
                                                          {review.title}
                                                        </Typography>
                                                        <Typography variant="body2" paragraph>
                                                          {review.comment}
                                                        </Typography>
                                                      </>
                                                    }
                                                  />
                                                </ListItem>
                                              ))
                                            ) : (
                                              <Box sx={{ textAlign: 'center', py: 3 }}>
                                                <Comment sx={{ fontSize: 60, color: 'text.disabled', mb: 2 }} />
                                                <Typography variant="h6" color="text.secondary">
                                                  No Reviews Yet
                                                </Typography>
                                                <Typography variant="body2" color="text.secondary">
                                                  Be the first to review this product
                                                </Typography>
                                              </Box>
                                            )}
                                          </List>
                                        </Box>
                                      )}
                                      
                                      {activeTab === 2 && (
                                        <Box>
                                          <Typography variant="h6" gutterBottom>
                                            Shipping Information
                                          </Typography>
                                          
                                          <Box sx={{ mb: 3 }}>
                                            <Typography variant="subtitle1" gutterBottom>
                                              Delivery Options:
                                            </Typography>
                                            <List>
                                              <ListItem>
                                                <ListItemAvatar>
                                                  <Avatar sx={{ bgcolor: 'primary.main' }}>
                                                    <LocalShipping />
                                                  </Avatar>
                                                </ListItemAvatar>
                                                <ListItemText
                                                  primary="Standard Delivery"
                                                  secondary="Delivery within 3-5 business days"
                                                />
                                              </ListItem>
                                              <ListItem>
                                                <ListItemAvatar>
                                                  <Avatar sx={{ bgcolor: 'secondary.main' }}>
                                                    <AccessTime />
                                                  </Avatar>
                                                </ListItemAvatar>
                                                <ListItemText
                                                  primary="Express Delivery"
                                                  secondary="Delivery within 24-48 hours (additional charges apply)"
                                                />
                                              </ListItem>
                                            </List>
                                          </Box>
                                          
                                          <Box sx={{ mb: 3 }}>
                                            <Typography variant="subtitle1" gutterBottom>
                                              Shipping Policy:
                                            </Typography>
                                            <Typography variant="body2" paragraph>
                                              • Free shipping on orders above ₹500
                                            </Typography>
                                            <Typography variant="body2" paragraph>
                                              • Shipping charges of ₹50 for orders below ₹500
                                            </Typography>
                                            <Typography variant="body2" paragraph>
                                              • Products are typically shipped within 24 hours of order confirmation
                                            </Typography>
                                            <Typography variant="body2" paragraph>
                                              • Delivery times may vary based on your location
                                            </Typography>
                                          </Box>
                                          
                                          <Box>
                                            <Typography variant="subtitle1" gutterBottom>
                                              Return Policy:
                                            </Typography>
                                            <Typography variant="body2" paragraph>
                                              • Easy returns within 7 days of delivery
                                            </Typography>
                                            <Typography variant="body2" paragraph>
                                              • Products must be unused and in original packaging
                                            </Typography>
                                            <Typography variant="body2" paragraph>
                                              • Refunds will be processed within 5-7 business days after inspection
                                            </Typography>
                                            <Typography variant="body2" paragraph>
                                              • For perishable items, returns are accepted only if the product is damaged or of poor quality
                                            </Typography>
                                          </Box>
                                        </Box>
                                      )}
                                      
                                      {activeTab === 3 && (
                                        <Box>
                                          <Typography variant="h6" gutterBottom>
                                            Seller Information
                                          </Typography>
                                          
                                          <Card sx={{ mb: 3 }}>
                                            <CardContent>
                                              <Box display="flex" alignItems="center" mb={2}>
                                                <Avatar
                                                  src={product.farmer?.profileImage}
                                                  sx={{ width: 64, height: 64, mr: 2 }}
                                                >
                                                  {product.farmer?.name ? product.farmer.name.charAt(0) : 'F'}
                                                </Avatar>
                                                <Box>
                                                  <Typography variant="h6">
                                                    {product.farmer?.name || "Farmer's Market"}
                                                  </Typography>
                                                  <Typography variant="body2" color="text.secondary">
                                                    Seller since {product.farmer?.joinedDate ? 
                                                      formatDate(product.farmer.joinedDate) : 
                                                      'January 2023'}
                                                  </Typography>
                                                </Box>
                                              </Box>
                                              
                                              <Divider sx={{ my: 2 }} />
                                              
                                              <Box display="flex" flexWrap="wrap" gap={2}>
                                                <Box flex={1} minWidth={200}>
                                                  <Typography variant="subtitle2" gutterBottom>
                                                    Contact Information
                                                  </Typography>
                                                  <Box display="flex" alignItems="center" mb={1}>
                                                    <Phone fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
                                                    <Typography variant="body2">
                                                      {product.farmer?.phone || 'Contact through platform'}
                                                    </Typography>
                                                  </Box>
                                                  <Box display="flex" alignItems="center">
                                                    <Email fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
                                                    <Typography variant="body2">
                                                      {product.farmer?.email || 'support@farmersmarket.com'}
                                                    </Typography>
                                                  </Box>
                                                </Box>
                                                
                                                <Box flex={1} minWidth={200}>
                                                  <Typography variant="subtitle2" gutterBottom>
                                                    Location
                                                  </Typography>
                                                  <Box display="flex" alignItems="center">
                                                    <LocationOn fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
                                                    <Typography variant="body2">
                                                      {product.farmer?.location || 'Local Farm, India'}
                                                    </Typography>
                                                  </Box>
                                                </Box>
                                              </Box>
                                              
                                              <Box sx={{ mt: 3 }}>
                                                <Typography variant="subtitle2" gutterBottom>
                                                  About the Seller
                                                </Typography>
                                                <Typography variant="body2">
                                                  {product.farmer?.description || 
                                                    "We are committed to providing fresh, high-quality farm products directly from our fields to your table. Our farming practices prioritize sustainability and natural growing methods to ensure the best taste and nutritional value."}
                                                </Typography>
                                              </Box>
                                              
                                              <Button
                                                variant="outlined"
                                                color="primary"
                                                sx={{ mt: 3 }}
                                                onClick={() => navigate(`/farmers/${product.farmer?._id || 'store'}`)}
                                              >
                                                Visit Seller Store
                                              </Button>
                                            </CardContent>
                                          </Card>
                                          
                                          <Typography variant="subtitle1" gutterBottom>
                                            Other Products by this Seller
                                          </Typography>
                                          
                                          <RelatedProducts 
                                            products={relatedProducts.filter(p => p._id !== productId)}
                                            limit={4}
                                          />
                                        </Box>
                                      )}
                                    </Box>
                                  </Paper>
                                </Grid>
                                
                                {/* Related Products */}
                                <Grid item xs={12} sx={{ mt: 4 }}>
                                  <Typography variant="h5" gutterBottom>
                                    Related Products
                                  </Typography>
                                  <RelatedProducts 
                                    products={relatedProducts.filter(p => p._id !== productId)}
                                    limit={6}
                                  />
                                </Grid>
                              </Grid>
                              
                              <Snackbar
                                open={openSnackbar}
                                autoHideDuration={3000}
                                onClose={() => setOpenSnackbar(false)}
                                anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
                              >
                                <Alert severity="success" variant="filled">
                                  Product added to cart!
                                </Alert>
                              </Snackbar>
                            </Container>
                          );
                        };
                        
                        export default ProductPage;