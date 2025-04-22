import React, { useState, useEffect,useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container, Grid, Typography, Box, Button, Paper, Divider,
  TextField, MenuItem, Select, FormControl,
  Card, CardContent, CardMedia, CardActions, Pagination,
  Chip, CircularProgress, InputAdornment, IconButton,
  Drawer, useMediaQuery, useTheme, Rating, Snackbar
} from '@mui/material';
import {
  Search, FilterList, Close, ShoppingCart,
  Favorite, FavoriteBorder, Park
} from '@mui/icons-material';

import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';  // Fixed import path
import { useCart } from '../contexts/CartContext';  // Fixed import path

const ProductListingPage = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { user } = useAuth();
  const { addToCart } = useCart();
  
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [favorites, setFavorites] = useState([]);
  
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterDrawerOpen, setFilterDrawerOpen] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  
  // Filter states
  const [filters, setFilters] = useState({
    category: '',
    priceRange: [0, 10000],
    isOrganic: false,
    rating: 0,
    sortBy: 'newest'
  });
  
  const categories = [
    'Vegetables', 'Fruits', 'Dairy', 'Grains', 
    'Herbs', 'Honey', 'Nuts', 'Seeds'
  ];
  
  const sortOptions = [
    { value: 'newest', label: 'Newest' },
    { value: 'price_low', label: 'Price: Low to High' },
    { value: 'price_high', label: 'Price: High to Low' },
    { value: 'rating', label: 'Highest Rated' },
    { value: 'popularity', label: 'Most Popular' }
  ];
  
  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000';
      
      // Build query parameters
      const params = new URLSearchParams();
      params.append('page', page);
      params.append('limit', 12);
      
      if (searchQuery) {
        params.append('search', searchQuery);
      }
      
      if (filters.category) {
        params.append('category', filters.category);
      }
      
      if (filters.isOrganic) {
        params.append('isOrganic', true);
      }
      
      if (filters.priceRange[0] > 0 || filters.priceRange[1] < 10000) {
        params.append('minPrice', filters.priceRange[0]);
        params.append('maxPrice', filters.priceRange[1]);
      }
      
      if (filters.rating > 0) {
        params.append('minRating', filters.rating);
      }
      
      params.append('sortBy', filters.sortBy);
      
      const response = await axios.get(`${apiUrl}/api/products?${params.toString()}`);
      
      setProducts(response.data.products || response.data);
      setTotalPages(response.data.totalPages || 1);
    } catch (err) {
      console.error('Error fetching products:', err);
      setError('Failed to load products. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [page, searchQuery, filters]);
  
  useEffect(() => {
    fetchProducts();
    if (user) {
      fetchFavorites();
    }
  }, [page, filters, searchQuery, user, fetchProducts]); // Added fetchProducts to dependencies

 
  
  const fetchFavorites = async () => {
    try {
      const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000';
      const token = localStorage.getItem('token');
      
      const response = await axios.get(
        `${apiUrl}/api/users/favorites`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      setFavorites(response.data.map(item => item._id));
    } catch (err) {
      console.error('Error fetching favorites:', err);
    }
  };
  
  const handlePageChange = (event, value) => {
    setPage(value);
    window.scrollTo(0, 0);
  };
  
  const handleSearchChange = (event) => {
    setSearchQuery(event.target.value);
  };
  
  const handleSearchSubmit = (event) => {
    event.preventDefault();
    setPage(1);
    fetchProducts();
  };
  
  const handleFilterChange = (name, value) => {
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
    setPage(1);
  };
  
  const handleClearFilters = () => {
    setFilters({
      category: '',
      priceRange: [0, 10000],
      isOrganic: false,
      rating: 0,
      sortBy: 'newest'
    });
    setSearchQuery('');
    setPage(1);
  };
  
  const handleToggleFavorite = async (productId) => {
    if (!user) {
      setSnackbarMessage('Please login to add to favorites');
      setSnackbarOpen(true);
      return;
    }
    
    try {
      const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000';
      const token = localStorage.getItem('token');
      
      if (favorites.includes(productId)) {
        await axios.delete(
          `${apiUrl}/api/users/favorites/${productId}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setFavorites(prev => prev.filter(id => id !== productId));
        setSnackbarMessage('Removed from favorites');
        setSnackbarOpen(true);
      } else {
        await axios.post(
          `${apiUrl}/api/users/favorites`,
          { productId },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setFavorites(prev => [...prev, productId]);
        setSnackbarMessage('Added to favorites');
        setSnackbarOpen(true);
      }
    } catch (err) {
      console.error('Error updating favorites:', err);
      setSnackbarMessage('Failed to update favorites');
      setSnackbarOpen(true);
    }
  };
  
  const handleAddToCart = (product) => {
    addToCart({
      _id: product._id,
      name: product.name,
      price: product.price,
      imageUrl: product.imageUrl,
      category: product.category,
      quantity: 1,
      stock: product.stock,
      isOrganic: product.isOrganic,
      farmer: product.farmer
    });
    
    setSnackbarMessage('Added to cart');
    setSnackbarOpen(true);
  };
  
  const renderFilterDrawer = () => (
    <Drawer
      anchor="left"
      open={filterDrawerOpen}
      onClose={() => setFilterDrawerOpen(false)}
      PaperProps={{
        sx: { width: 280, padding: 2 }
      }}
    >
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6">Filters</Typography>
        <IconButton onClick={() => setFilterDrawerOpen(false)}>
          <Close />
        </IconButton>
      </Box>
      
      <Divider sx={{ mb: 2 }} />
      
      <Box sx={{ mb: 3 }}>
        <Typography variant="subtitle1" gutterBottom>
          Categories
        </Typography>
        <FormControl fullWidth size="small">
          <Select
            value={filters.category}
            onChange={(e) => handleFilterChange('category', e.target.value)}
            displayEmpty
          >
            <MenuItem value="">All Categories</MenuItem>
            {categories.map((category) => (
              <MenuItem key={category} value={category}>
                {category}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>
      
      <Box sx={{ mb: 3 }}>
        <Typography variant="subtitle1" gutterBottom>
          Price Range
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={6}>
            <TextField
              label="Min"
              type="number"
              size="small"
              fullWidth
              value={filters.priceRange[0]}
              onChange={(e) => handleFilterChange('priceRange', [
                parseInt(e.target.value) || 0,
                filters.priceRange[1]
              ])}
              InputProps={{
                startAdornment: <InputAdornment position="start">₹</InputAdornment>,
              }}
            />
          </Grid>
          <Grid item xs={6}>
            <TextField
              label="Max"
              type="number"
              size="small"
              fullWidth
              value={filters.priceRange[1]}
              onChange={(e) => handleFilterChange('priceRange', [
                filters.priceRange[0],
                parseInt(e.target.value) || 10000
              ])}
              InputProps={{
                startAdornment: <InputAdornment position="start">₹</InputAdornment>,
              }}
            />
          </Grid>
        </Grid>
      </Box>
      
      <Box sx={{ mb: 3 }}>
        <Typography variant="subtitle1" gutterBottom>
          Minimum Rating
        </Typography>
        <Rating
          value={filters.rating}
          onChange={(event, newValue) => {
            handleFilterChange('rating', newValue);
          }}
        />
      </Box>
      
      <Box sx={{ mb: 3 }}>
        <FormControl component="fieldset">
          <Typography variant="subtitle1" gutterBottom>
            Product Type
          </Typography>
          {/*  ... existing group...*/}
          <Button
            variant={filters.isOrganic ? "contained" : "outlined"}
            color="success"
            startIcon={<Park />}
            onClick={() => handleFilterChange('isOrganic', !filters.isOrganic)}
            sx={{ mb: 1 }}
          >
            Organic Only
          </Button>
        </FormControl>
      </Box>
      
      <Box sx={{ mb: 3 }}>
        <Typography variant="subtitle1" gutterBottom>
          Sort By
        </Typography>
        <FormControl fullWidth size="small">
          <Select
            value={filters.sortBy}
            onChange={(e) => handleFilterChange('sortBy', e.target.value)}
          >
            {sortOptions.map((option) => (
              <MenuItem key={option.value} value={option.value}>
                {option.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>
      
      <Button
        variant="outlined"
        color="secondary"
        fullWidth
        onClick={handleClearFilters}
        sx={{ mt: 2 }}
      >
        Clear All Filters
      </Button>
    </Drawer>
  );
  
  return (
    <>
    <Container maxWidth="xl" sx={{ mt: 4, mb: 8 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Farm Fresh Products
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Browse our selection of fresh, locally-sourced products directly from farmers
        </Typography>
      </Box>
      
      <Grid container spacing={3}>
        {/* Filters for desktop */}
        {!isMobile && (
          <Grid item xs={12} md={3}>
            <Paper sx={{ p: 2, position: 'sticky', top: 80 }}>
              <Typography variant="h6" gutterBottom>
                Filters
              </Typography>
              
              <Divider sx={{ mb: 2 }} />
              
              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle1" gutterBottom>
                  Categories
                </Typography>
                <FormControl fullWidth size="small">
                  <Select
                    value={filters.category}
                    onChange={(e) => handleFilterChange('category', e.target.value)}
                    displayEmpty
                  >
                    <MenuItem value="">All Categories</MenuItem>
                    {categories.map((category) => (
                      <MenuItem key={category} value={category}>
                        {category}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Box>
              
              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle1" gutterBottom>
                  Price Range
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <TextField
                      label="Min"
                      type="number"
                      size="small"
                      fullWidth
                      value={filters.priceRange[0]}
                      onChange={(e) => handleFilterChange('priceRange', [
                        parseInt(e.target.value) || 0,
                        filters.priceRange[1]
                      ])}
                      InputProps={{
                        startAdornment: <InputAdornment position="start">₹</InputAdornment>,
                      }}
                    />
                  </Grid>
                  <Grid item xs={6}>
                    <TextField
                      label="Max"
                      type="number"
                      size="small"
                      fullWidth
                      value={filters.priceRange[1]}
                      onChange={(e) => handleFilterChange('priceRange', [
                        filters.priceRange[0],
                        parseInt(e.target.value) || 10000
                      ])}
                      InputProps={{
                        startAdornment: <InputAdornment position="start">₹</InputAdornment>,
                      }}
                    />
                  </Grid>
                </Grid>
              </Box>
              
              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle1" gutterBottom>
                  Minimum Rating
                </Typography>
                <Rating
                  value={filters.rating}
                  onChange={(event, newValue) => {
                    handleFilterChange('rating', newValue);
                  }}
                />
              </Box>
              
              <Box sx={{ mb: 3 }}>
                <FormControl component="fieldset">
                  <Typography variant="subtitle1" gutterBottom>
                    Product Type
                  </Typography>
                  {/* ...existing code ...*/}
                  <Button
                    variant={filters.isOrganic ? "contained" : "outlined"}
                    color="success"
                    startIcon={<Park />}
                    onClick={() => handleFilterChange('isOrganic', !filters.isOrganic)}
                    sx={{ mb: 1 }}
                  >
                    Organic Only
                  </Button>
                </FormControl>
              </Box>
              
              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle1" gutterBottom>
                  Sort By
                </Typography>
                <FormControl fullWidth size="small">
                  <Select
                    value={filters.sortBy}
                    onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                  >
                    {sortOptions.map((option) => (
                      <MenuItem key={option.value} value={option.value}>
                        {option.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Box>
              
              <Button
                variant="outlined"
                color="secondary"
                fullWidth
                onClick={handleClearFilters}
              >
                Clear All Filters
              </Button>
            </Paper>
          </Grid>
        )}
        
        {/* Products grid */}
        <Grid item xs={12} md={!isMobile ? 9 : 12}>
          <Paper sx={{ p: 2, mb: 3 }}>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, alignItems: 'center' }}>
              <Box component="form" onSubmit={handleSearchSubmit} sx={{ flexGrow: 1, display: 'flex' }}>
                <TextField
                  fullWidth
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={handleSearchChange}
                  size="small"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Search />
                      </InputAdornment>
                    ),
                  }}
                />
                <Button type="submit" variant="contained" sx={{ ml: 1 }}>
                  Search
                </Button>
              </Box>
              
              {isMobile && (
                <Button
                  variant="outlined"
                  startIcon={<FilterList />}
                  onClick={() => setFilterDrawerOpen(true)}
                >
                  Filters
                </Button>
              )}
            </Box>
            
            {/* Active filters display */}
            {(filters.category || filters.isOrganic || filters.rating > 0 || 
              filters.priceRange[0] > 0 || filters.priceRange[1] < 10000) && (
              <Box sx={{ mt: 2, display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                <Typography variant="body2" sx={{ mr: 1 }}>
                  Active Filters:
                </Typography>
                
                {filters.category && (
                  <Chip
                    label={`Category: ${filters.category}`}
                    onDelete={() => handleFilterChange('category', '')}
                    size="small"
                  />
                )}
                
                {filters.isOrganic && (
                  <Chip
                    label="Organic Only"
                    onDelete={() => handleFilterChange('isOrganic', false)}
                    size="small"
                    color="success"
                  />
                )}
                
                {filters.rating > 0 && (
                  <Chip
                    label={`Rating: ${filters.rating}+ Stars`}
                    onDelete={() => handleFilterChange('rating', 0)}
                    size="small"
                  />
                )}
                
                {(filters.priceRange[0] > 0 || filters.priceRange[1] < 10000) && (
                  <Chip
                    label={`Price: ₹${filters.priceRange[0]} - ₹${filters.priceRange[1]}`}
                    onDelete={() => handleFilterChange('priceRange', [0, 10000])}
                    size="small"
                  />
                )}
                
                <Button
                  variant="text"
                  size="small"
                  onClick={handleClearFilters}
                >
                  Clear All
                </Button>
              </Box>
            )}
          </Paper>
          
          {loading ? (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="300px">
              <CircularProgress />
            </Box>
          ) : error ? (
            <Paper sx={{ p: 3, textAlign: 'center' }}>
              <Typography color="error">{error}</Typography>
              <Button
                variant="contained"
                onClick={fetchProducts}
                sx={{ mt: 2 }}
              >
                Try Again
              </Button>
            </Paper>
          ) : products.length === 0 ? (
            <Paper sx={{ p: 3, textAlign: 'center' }}>
              <Typography variant="h6" gutterBottom>
                No products found
              </Typography>
              <Typography variant="body1" color="text.secondary" paragraph>
                Try adjusting your filters or search query.
              </Typography>
              <Button
                variant="contained"
                onClick={handleClearFilters}
              >
                Clear Filters
              </Button>
            </Paper>
          ) : (
            <>
              <Grid container spacing={3}>
                {products.map((product) => (
                  <Grid item key={product._id} xs={12} sm={6} md={4} lg={4}>
                    <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                      <Box sx={{ position: 'relative' }}>
                        <CardMedia
                          component="img"
                          height="200"
                          image={product.imageUrl || 'https://via.placeholder.com/300?text=No+Image'}
                          alt={product.name}
                          sx={{ cursor: 'pointer' }}
                          onClick={() => navigate(`/products/${product._id}`)}
                        />
                        <IconButton
                          sx={{
                            position: 'absolute',
                            top: 8,
                            right: 8,
                            bgcolor: 'background.paper',
                            '&:hover': { bgcolor: 'background.paper' }
                          }}
                          onClick={() => handleToggleFavorite(product._id)}
                        >
                          {favorites.includes(product._id) ? (
                            <Favorite color="error" />
                          ) : (
                            <FavoriteBorder />
                          )}
                        </IconButton>
                        
                        {product.isOrganic && (
                          <Chip
                            label="Organic"
                            color="success"
                            size="small"
                            sx={{
                              position: 'absolute',
                              top: 8,
                              left: 8
                            }}
                          />
                        )}
                      </Box>
                      
                      <CardContent sx={{ flexGrow: 1 }}>
                        <Typography
                          variant="h6"
                          component="div"
                          sx={{
                            cursor: 'pointer',
                            '&:hover': { color: 'primary.main' }
                          }}
                          onClick={() => navigate(`/products/${product._id}`)}
                        >
                          {product.name}
                        </Typography>
                        
                        <Box display="flex" alignItems="center" sx={{ mb: 1 }}>
                          <Rating value={product.rating || 0} precision={0.5} readOnly size="small" />
                          <Typography variant="body2" color="text.secondary" sx={{ ml: 1 }}>
                            ({product.reviewCount || 0})
                          </Typography>
                        </Box>
                        
                        <Typography variant="body2" color="text.secondary" gutterBottom>
                          {product.category}
                        </Typography>
                        
                        <Typography variant="body2" color="text.secondary" noWrap sx={{ mb: 2 }}>
                          {product.description}
                        </Typography>
                        
                        <Box display="flex" alignItems="center" justifyContent="space-between">
                          <Typography variant="h6" color="primary">
                            ₹{product.price.toLocaleString()}
                          </Typography>
                          
                          {product.mrp && product.mrp > product.price && (
                            <Box display="flex" alignItems="center">
                              <Typography
                                variant="body2"
                                sx={{ textDecoration: 'line-through', mr: 1 }}
                                color="text.secondary"
                              >
                                ₹{product.mrp.toLocaleString()}
                              </Typography>
                              <Chip
                                label={`${Math.round((1 - product.price / product.mrp) * 100)}% OFF`}
                                color="error"
                                size="small"
                              />
                            </Box>
                          )}
                        </Box>
                      </CardContent>
                      
                      <CardActions sx={{ p: 2, pt: 0 }}>
                        <Button
                          variant="contained"
                          fullWidth
                          startIcon={<ShoppingCart />}
                          onClick={() => handleAddToCart(product)}
                          disabled={product.stock <= 0}
                        >
                          {product.stock > 0 ? 'Add to Cart' : 'Out of Stock'}
                        </Button>
                      </CardActions>
                    </Card>
                  </Grid>
                ))}
              </Grid>
              
              <Box display="flex" justifyContent="center" mt={4}>
                <Pagination
                  count={totalPages}
                  page={page}
                  onChange={handlePageChange}
                  color="primary"
                  size={isMobile ? "small" : "medium"}
                />
              </Box>
            </>
          )}
        </Grid>
      </Grid>
      
      {/* Mobile filter drawer */}
      {isMobile && renderFilterDrawer()}
    </Container>
    <Snackbar 
      open={snackbarOpen}
      autoHideDuration={3000}
      onClose={() => setSnackbarOpen(false)}
      message={snackbarMessage}
    /> 
  </>
  );
};

export default ProductListingPage;