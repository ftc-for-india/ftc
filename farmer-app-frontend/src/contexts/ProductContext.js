import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';
import { useNotification } from './NotificationContext';
import { useAuth } from './AuthContext';

const ProductContext = createContext();

export const useProduct = () => useContext(ProductContext);

export const ProductProvider = ({ children }) => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [favorites, setFavorites] = useState([]);
  const { showSnackbar } = useNotification();
  const { isAuthenticated } = useAuth();
  
  // Fetch categories on mount
  useEffect(() => {
    fetchCategories();
  }, []);
  
  // Fetch user favorites when authenticated
  useEffect(() => {
    if (isAuthenticated) {
      fetchFavorites();
    } else {
      setFavorites([]);
    }
  }, [isAuthenticated]);
  
  const fetchProducts = async (filters = {}) => {
    setLoading(true);
    setError(null);
    
    try {
      const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000';
      
      // Build query string from filters
      const queryParams = new URLSearchParams();
      
      if (filters.category) queryParams.append('category', filters.category);
      if (filters.search) queryParams.append('search', filters.search);
      if (filters.minPrice) queryParams.append('minPrice', filters.minPrice);
      if (filters.maxPrice) queryParams.append('maxPrice', filters.maxPrice);
      if (filters.sortBy) queryParams.append('sortBy', filters.sortBy);
      if (filters.sortOrder) queryParams.append('sortOrder', filters.sortOrder);
      if (filters.page) queryParams.append('page', filters.page);
      if (filters.limit) queryParams.append('limit', filters.limit);
      
      const response = await axios.get(
        `${apiUrl}/products?${queryParams.toString()}`
      );
      
      setProducts(response.data.products || []);
      return response.data;
    } catch (err) {
      console.error('Error fetching products:', err);
      setError(err.response?.data?.message || 'Failed to fetch products');
      return { products: [], totalPages: 0, currentPage: 1, totalProducts: 0 };
    } finally {
      setLoading(false);
    }
  };
  
  const fetchProductById = async (productId) => {
    setLoading(true);
    setError(null);
    
    try {
      const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000';
      
      const response = await axios.get(
        `${apiUrl}/products/${productId}`
      );
      
      // Track product view if authenticated
      if (isAuthenticated) {
        try {
          const token = localStorage.getItem('token');
          await axios.post(
            `${apiUrl}/users/recently-viewed/${productId}`,
            {},
            {
              headers: {
                Authorization: `Bearer ${token}`
              }
            }
          );
        } catch (viewErr) {
          console.error('Error tracking product view:', viewErr);
        }
      }
      
      return response.data;
    } catch (err) {
      console.error('Error fetching product:', err);
      setError(err.response?.data?.message || 'Failed to fetch product');
      throw err;
    } finally {
      setLoading(false);
    }
  };
  
  const fetchCategories = async () => {
    try {
      const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000';
      
      const response = await axios.get(
        `${apiUrl}/products/categories`
      );
      
      setCategories(response.data || []);
    } catch (err) {
      console.error('Error fetching categories:', err);
    }
  };
  
  const fetchFavorites = async () => {
    if (!isAuthenticated) return;
    
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
      
      setFavorites(response.data.map(product => product._id) || []);
    } catch (err) {
      console.error('Error fetching favorites:', err);
    }
  };
  
  const addToFavorites = async (productId) => {
    if (!isAuthenticated) {
      showSnackbar('Please login to add to favorites', 'info');
      return false;
    }
    
    try {
      const token = localStorage.getItem('token');
      const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000';
      
      await axios.post(
        `${apiUrl}/users/favorites/${productId}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      
      setFavorites(prev => [...prev, productId]);
      showSnackbar('Added to favorites', 'success');
      return true;
    } catch (err) {
      console.error('Error adding to favorites:', err);
      showSnackbar('Failed to add to favorites', 'error');
      return false;
    }
  };
  
  const removeFromFavorites = async (productId) => {
    if (!isAuthenticated) return false;
    
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
      
      setFavorites(prev => prev.filter(id => id !== productId));
      showSnackbar('Removed from favorites', 'success');
      return true;
    } catch (err) {
      console.error('Error removing from favorites:', err);
      showSnackbar('Failed to remove from favorites', 'error');
      return false;
    }
  };
  
  const toggleFavorite = async (productId) => {
    if (favorites.includes(productId)) {
      return removeFromFavorites(productId);
    } else {
      return addToFavorites(productId);
    }
  };
  
  const isFavorite = (productId) => {
    return favorites.includes(productId);
  };
  
  const value = {
    products,
    categories,
    loading,
    error,
    favorites,
    fetchProducts,
    fetchProductById,
    fetchCategories,
    addToFavorites,
    removeFromFavorites,
    toggleFavorite,
    isFavorite
  };
  
  return (
    <ProductContext.Provider value={value}>
      {children}
    </ProductContext.Provider>
  );
};

export default ProductProvider;