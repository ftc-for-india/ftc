import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container, Grid, Typography, Box, Button, Divider,
  Paper, Chip, Rating, TextField, Avatar, Card, CardContent, CardMedia,
  CircularProgress, IconButton, Breadcrumbs, Link, Tabs, Tab,
  Table, TableBody, TableCell, TableContainer, TableRow,
  Snackbar, Alert, ImageList, ImageListItem
} from '@mui/material';
import {
  ShoppingCart, Favorite, FavoriteBorder, Share, ArrowBack,
  Add, Remove, LocationOn, Person, CalendarToday, Info
} from '@mui/icons-material';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';  // Fixed import path
import { useCart } from '../contexts/CartContext';  // Fixed import path
import { useNotification } from '../contexts/NotificationContext';  // Fixed import path


const ProductDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const { addToCart } = useCart();
  const { showSnackbar } = useNotification();
  
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [isFavorite, setIsFavorite] = useState(false);
  const [tabValue, setTabValue] = useState(0);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [reviewText, setReviewText] = useState('');
  const [reviewRating, setReviewRating] = useState(5);
  const [submittingReview, setSubmittingReview] = useState(false);
  const [selectedImage, setSelectedImage] = useState(0);
  
  useEffect(() => {
    fetchProductDetails();
    window.scrollTo(0, 0);
  }, [id]);
  
  const fetchProductDetails = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const token = localStorage.getItem('token');
      const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000';
      
      const response = await axios.get(
        `${apiUrl}/products/${id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      
      setProduct(response.data);
      setIsFavorite(response.data.isFavorite || false);
      
      // Fetch related products
      const relatedResponse = await axios.get(
        `${apiUrl}/products/related/${id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      
      setRelatedProducts(relatedResponse.data || []);
    } catch (err) {
      console.error('Error fetching product details:', err);
      setError(err.response?.data?.message || 'Failed to fetch product details');
      showSnackbar('Failed to load product details', 'error');
    } finally {
      setLoading(false);
    }
  };
  
  const handleAddToCart = async () => {
    try {
      await addToCart(product, quantity);
      showSnackbar(`${quantity} ${product.name} added to cart`, 'success');
    } catch (err) {
      showSnackbar('Failed to add product to cart', 'error');
    }
  };
  
  const handleQuantityChange = (value) => {
    const newQuantity = Math.max(1, Math.min(product.stock, quantity + value));
    setQuantity(newQuantity);
  };
  
  const handleToggleFavorite = async () => {
    try {
      const token = localStorage.getItem('token');
      const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000';
      
      if (isFavorite) {
        await axios.delete(
          `${apiUrl}/users/favorites/${id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        );
        setIsFavorite(false);
        showSnackbar('Removed from favorites', 'info');
      } else {
        await axios.post(
          `${apiUrl}/users/favorites/${id}`,
          {},
          {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        );
        setIsFavorite(true);
        showSnackbar('Added to favorites', 'success');
      }
    } catch (err) {
      console.error('Error updating favorites:', err);
      showSnackbar('Failed to update favorites', 'error');
    }
  };
  
  const handleShareProduct = () => {
    if (navigator.share) {
      navigator.share({
        title: product.name,
        text: product.description,
        url: window.location.href,
      })
      .then(() => showSnackbar('Product shared successfully', 'success'))
      .catch((error) => console.error('Error sharing:', error));
    } else {
      // Fallback for browsers that don't support the Web Share API
      navigator.clipboard.writeText(window.location.href)
        .then(() => showSnackbar('Link copied to clipboard', 'success'))
        .catch(() => showSnackbar('Failed to copy link', 'error'));
    }
  };
  
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };
  
  const handleSubmitReview = async (e) => {
    e.preventDefault();
    
    if (!reviewText.trim()) {
      showSnackbar('Please enter a review', 'error');
      return;
    }
    
    setSubmittingReview(true);
    
    try {
      const token = localStorage.getItem('token');
      const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000';
      
      await axios.post(
        `${apiUrl}/products/${id}/reviews`,
        {
          rating: reviewRating,
          comment: reviewText
        },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      
      showSnackbar('Review submitted successfully', 'success');
      setReviewText('');
      setReviewRating(5);
      
      // Refresh product details to show the new review
      fetchProductDetails();
    } catch (err) {
      console.error('Error submitting review:', err);
      showSnackbar(err.response?.data?.message || 'Failed to submit review', 'error');
    } finally {
      setSubmittingReview(false);
    }
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
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Box sx={{ p: 3, textAlign: 'center' }}>
          <Typography variant="h6" color="error">
            {error || 'Product not found'}
          </Typography>
          <Button 
            variant="contained" 
            color="primary" 
            sx={{ mt: 2 }}
            onClick={() => navigate('/products')}
            startIcon={<ArrowBack />}
          >
            Back to Products
          </Button>
        </Box>
      </Container>
    );
  }
  
  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      {/* Breadcrumbs */}
      <Breadcrumbs sx={{ mb: 2 }}>
        <Link 
          underline="hover" 
          color="inherit" 
          sx={{ cursor: 'pointer' }}
          onClick={() => navigate('/')}
        >
          Home
        </Link>
        <Link 
          underline="hover" 
          color="inherit" 
          sx={{ cursor: 'pointer' }}
          onClick={() => navigate('/products')}
        >
          Products
        </Link>
        <Link 
          underline="hover" 
          color="inherit" 
          sx={{ cursor: 'pointer' }}
          onClick={() => navigate(`/products?category=${product.category}`)}
        >
          {product.category}
        </Link>
        <Typography color="text.primary">{product.name}</Typography>
      </Breadcrumbs>
      
      <Grid container spacing={4}>
        {/* Product Images */}
        <Grid item xs={12} md={6}>
          <Paper elevation={2} sx={{ p: 2, mb: 2 }}>
            <Box
              component="img"
              sx={{
                width: '100%',
                height: 400,
                objectFit: 'contain',
                mb: 2
              }}
              src={product.images && product.images.length > 0 
                ? product.images[selectedImage] 
                : product.imageUrl || 'https://via.placeholder.com/600x400?text=No+Image'}
              alt={product.name}
            />
            
            {product.images && product.images.length > 1 && (
              <ImageList cols={4} rowHeight={80} sx={{ mt: 1 }}>
                {product.images.map((image, index) => (
                  <ImageListItem 
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    sx={{ 
                      cursor: 'pointer',
                      border: index === selectedImage ? '2px solid' : 'none',
                      borderColor: 'primary.main',
                      borderRadius: 1
                    }}
                  >
                    <img
                      src={image}
                      alt={`${product.name} ${index + 1}`}
                      style={{ height: '100%', objectFit: 'cover' }}
                    />
                  </ImageListItem>
                ))}
              </ImageList>
            )}
          </Paper>
        </Grid>
        
        {/* Product Details */}
        <Grid item xs={12} md={6}>
          <Paper elevation={2} sx={{ p: 3 }}>
            <Box display="flex" justifyContent="space-between" alignItems="flex-start">
              <Typography variant="h4" component="h1" gutterBottom>
                {product.name}
              </Typography>
              <Box>
                <IconButton 
                  color="secondary" 
                  onClick={handleToggleFavorite}
                  aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
                >
                  {isFavorite ? <Favorite /> : <FavoriteBorder />}
                </IconButton>
                <IconButton 
                  color="primary" 
                  onClick={handleShareProduct}
                  aria-label="Share product"
                >
                  <Share />
                </IconButton>
              </Box>
            </Box>
            
            <Box display="flex" alignItems="center" sx={{ mb: 2 }}>
              <Rating 
                value={product.rating || 0} 
                precision={0.5} 
                readOnly 
              />
              <Typography variant="body2" color="text.secondary" sx={{ ml: 1 }}>
                ({product.reviewCount || 0} reviews)
              </Typography>
            </Box>
            
            <Typography variant="h5" color="primary" gutterBottom>
              ₹{product.price.toLocaleString()}
            </Typography>
            
            <Divider sx={{ my: 2 }} />
            
            <Typography variant="body1" paragraph>
              {product.description}
            </Typography>
            
            <Box display="flex" alignItems="center" sx={{ mb: 2 }}>
              <Chip 
                label={product.category} 
                color="secondary" 
                sx={{ mr: 1 }}
              />
              <Chip 
                label={product.stock > 0 ? 'In Stock' : 'Out of Stock'} 
                color={product.stock > 0 ? 'success' : 'error'}
              />
            </Box>
            
            {product.stock > 0 && (
              <Box sx={{ mb: 3 }}>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Available: {product.stock} units
                </Typography>
                <Box display="flex" alignItems="center">
                  <Typography variant="body1" sx={{ mr: 2 }}>
                    Quantity:
                  </Typography>
                  <IconButton 
                    size="small" 
                    onClick={() => handleQuantityChange(-1)}
                    disabled={quantity <= 1}
                  >
                    <Remove />
                  </IconButton>
                  <Typography sx={{ mx: 2 }}>
                    {quantity}
                  </Typography>
                  <IconButton 
                    size="small" 
                    onClick={() => handleQuantityChange(1)}
                    disabled={quantity >= product.stock}
                  >
                    <Add />
                  </IconButton>
                </Box>
              </Box>
            )}
            
            <Button
              variant="contained"
              color="primary"
              size="large"
              startIcon={<ShoppingCart />}
              fullWidth
              onClick={handleAddToCart}
              disabled={product.stock <= 0}
              sx={{ mb: 2 }}
            >
              {product.stock > 0 ? 'Add to Cart' : 'Out of Stock'}
            </Button>
            
            {product.farmer && (
              <Box sx={{ mt: 3 }}>
                <Typography variant="subtitle1" gutterBottom>
                  Seller Information
                </Typography>
                <Box display="flex" alignItems="center" sx={{ mb: 1 }}>
                  <Person fontSize="small" color="action" sx={{ mr: 1 }} />
                  <Typography variant="body2">
                    {product.farmer.name}
                  </Typography>
                </Box>
                <Box display="flex" alignItems="center">
                  <LocationOn fontSize="small" color="action" sx={{ mr: 1 }} />
                  <Typography variant="body2">
                    {product.farmer.city}, {product.farmer.state}
                  </Typography>
                </Box>
              </Box>
            )}
          </Paper>
        </Grid>
        
        {/* Tabs for Details, Reviews, etc. */}
        <Grid item xs={12}>
          <Paper elevation={2} sx={{ mt: 2 }}>
            <Tabs
              value={tabValue}
              onChange={handleTabChange}
              variant="fullWidth"
              indicatorColor="primary"
              textColor="primary"
            >
              <Tab label="Details" />
              <Tab label="Reviews" />
              <Tab label="Shipping & Returns" />
            </Tabs>
            
            <Box sx={{ p: 3 }}>
              {tabValue === 0 && (
                <Box>
                  <Typography variant="h6" gutterBottom>
                    Product Details
                  </Typography>
                  <TableContainer component={Paper} variant="outlined" sx={{ mb: 3 }}>
                    <Table>
                      <TableBody>
                        <TableRow>
                          <TableCell component="th" scope="row" sx={{ width: '30%', bgcolor: 'background.default' }}>
                            Category
                          </TableCell>
                          <TableCell>{product.category}</TableCell>
                        </TableRow>
                        {product.weight && (
                          <TableRow>
                            <TableCell component="th" scope="row" sx={{ bgcolor: 'background.default' }}>
                              Weight
                            </TableCell>
                            <TableCell>{product.weight} kg</TableCell>
                          </TableRow>
                        )}
                        {product.harvestDate && (
                          <TableRow>
                            <TableCell component="th" scope="row" sx={{ bgcolor: 'background.default' }}>
                              Harvest Date
                            </TableCell>
                            <TableCell>{new Date(product.harvestDate).toLocaleDateString()}</TableCell>
                          </TableRow>
                        )}
                        {product.organic !== undefined && (
                          <TableRow>
                            <TableCell component="th" scope="row" sx={{ bgcolor: 'background.default' }}>
                              Organic
                            </TableCell>
                            <TableCell>{product.organic ? 'Yes' : 'No'}</TableCell>
                          </TableRow>
                        )}
                        {product.shelfLife && (
                          <TableRow>
                            <TableCell component="th" scope="row" sx={{ bgcolor: 'background.default' }}>
                              Shelf Life
                            </TableCell>
                            <TableCell>{product.shelfLife} days</TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </TableContainer>
                  
                  {product.nutritionInfo && (
                    <Box sx={{ mb: 3 }}>
                      <Typography variant="h6" gutterBottom>
                        Nutrition Information
                      </Typography>
                      <Typography variant="body1" paragraph>
                        {product.nutritionInfo}
                      </Typography>
                    </Box>
                  )}
                  
                  {product.storageInstructions && (
                    <Box>
                      <Typography variant="h6" gutterBottom>
                        Storage Instructions
                      </Typography>
                      <Typography variant="body1" paragraph>
                        {product.storageInstructions}
                      </Typography>
                    </Box>
                  )}
                </Box>
              )}
              
              {tabValue === 1 && (
                <Box>
                  <Typography variant="h6" gutterBottom>
                    Customer Reviews
                  </Typography>
                  
                  {/* Review Form */}
                  <Paper variant="outlined" sx={{ p: 2, mb: 3 }}>
                    <Typography variant="subtitle1" gutterBottom>
                      Write a Review
                    </Typography>
                    <form onSubmit={handleSubmitReview}>
                      <Box sx={{ mb: 2 }}>
                        <Typography component="legend">Your Rating</Typography>
                        <Rating
                          name="review-rating"
                          value={reviewRating}
                          onChange={(event, newValue) => {
                            setReviewRating(newValue);
                          }}
                          precision={0.5}
                        />
                      </Box>
                      <TextField
                        fullWidth
                        multiline
                        rows={4}
                        variant="outlined"
                        placeholder="Share your experience with this product..."
                        value={reviewText}
                        onChange={(e) => setReviewText(e.target.value)}
                        sx={{ mb: 2 }}
                      />
                      <Button
                        type="submit"
                        variant="contained"
                        color="primary"
                        disabled={submittingReview}
                      >
                        {submittingReview ? 'Submitting...' : 'Submit Review'}
                      </Button>
                    </form>
                  </Paper>
                  
                  {/* Reviews List */}
                  {product.reviews && product.reviews.length > 0 ? (
                    product.reviews.map((review) => (
                      <Card key={review._id} sx={{ mb: 2 }}>
                        <CardContent>
                          <Box display="flex" alignItems="center" sx={{ mb: 1 }}>
                            <Avatar sx={{ mr: 2 }}>
                              {review.user.name.charAt(0)}
                            </Avatar>
                            <Box>
                              <Typography variant="subtitle1">
                                {review.user.name}
                              </Typography>
                              <Box display="flex" alignItems="center">
                                <Rating value={review.rating} readOnly size="small" />
                                <Typography variant="body2" color="text.secondary" sx={{ ml: 1 }}>
                                  <CalendarToday fontSize="small" sx={{ fontSize: 14, mr: 0.5, verticalAlign: 'middle' }} />
                                  {new Date(review.createdAt).toLocaleDateString()}
                                </Typography>
                              </Box>
                            </Box>
                          </Box>
                          <Typography variant="body1">
                            {review.comment}
                          </Typography>
                        </CardContent>
                      </Card>
                    ))
                  ) : (
                    <Typography variant="body2" color="text.secondary">
                      No reviews yet. Be the first to review this product!
                    </Typography>
                  )}
                </Box>
              )}
              
              {tabValue === 2 && (
                <Box>
                  <Typography variant="h6" gutterBottom>
                    Shipping Information
                  </Typography>
                  <Typography variant="body1" paragraph>
                    We offer fast and reliable shipping across the country. Most orders are processed and shipped within 24 hours.
                  </Typography>
                  <Typography variant="body1" paragraph>
                    Shipping costs are calculated based on your location and the weight of the products. Free shipping is available for orders above ₹500.
                  </Typography>
                  
                  <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
                    Return Policy
                  </Typography>
                  <Typography variant="body1" paragraph>
                    We accept returns within 7 days of delivery if the product is damaged or not as described. Please contact our customer service team to initiate a return.
                  </Typography>
                  <Typography variant="body1" paragraph>
                    For perishable items, please report any issues within 24 hours of receiving the product.
                  </Typography>
                  
                  <Box sx={{ mt: 3, p: 2, bgcolor: 'background.default', borderRadius: 1 }}>
                    <Box display="flex" alignItems="flex-start">
                      <Info color="primary" sx={{ mr: 1, mt: 0.5 }} />
                      <Typography variant="body2">
                        For any questions regarding shipping or returns, please contact our customer support at support@farmerapp.com or call us at +91-1234567890.
                      </Typography>
                    </Box>
                  </Box>
                </Box>
              )}
            </Box>
          </Paper>
        </Grid>
        
        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <Grid item xs={12}>
            <Typography variant="h5" gutterBottom sx={{ mt: 4 }}>
              Related Products
            </Typography>
            <Grid container spacing={3}>
              {relatedProducts.map((relatedProduct) => (
                <Grid item key={relatedProduct._id} xs={12} sm={6} md={3}>
                  <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                    <CardMedia
                      component="img"
                      height={160}
                      image={relatedProduct.imageUrl || 'https://via.placeholder.com/300x200?text=No+Image'}
                      alt={relatedProduct.name}
                      sx={{ objectFit: 'cover', cursor: 'pointer' }}
                      onClick={() => navigate(`/products/${relatedProduct._id}`)}
                    />
                    <CardContent sx={{ flexGrow: 1 }}>
                      <Typography gutterBottom variant="h6" component="h2" sx={{ cursor: 'pointer' }} onClick={() => navigate(`/products/${relatedProduct._id}`)}>
                        {relatedProduct.name}
                      </Typography>
                      <Box display="flex" justifyContent="space-between" alignItems="center">
                        <Typography variant="h6" color="primary">
                          ₹{relatedProduct.price.toLocaleString()}
                        </Typography>
                        <Rating value={relatedProduct.rating || 0} readOnly size="small" />
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Grid>
        )}
      </Grid>
    </Container>
  );
};

export default ProductDetailPage;