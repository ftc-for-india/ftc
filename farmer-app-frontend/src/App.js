import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import { CssBaseline, CircularProgress, Box } from "@mui/material";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";

// Page imports
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import DashboardPage from "./pages/DashboardPage";
import ProductListingPage from "./pages/ProductListingPage";
import ProductDetailPage from "./pages/ProductDetailPage";
import CartPage from "./pages/CartPage";
import CheckoutPage from "./pages/CheckoutPage";
import OrderTrackingPage from "./pages/OrderTrackingPage";
import OrderHistoryPage from "./pages/OrderHistoryPage";
import AdminDashboard from "./pages/AdminDashboard";
import FarmerDashboard from "./pages/FarmerDashboard";
import ProfilePage from "./pages/ProfilePage";
import LandingPage from "./pages/LandingPage";
import NotFoundPage from "./pages/NotFoundPage";
import MarketAnalyticsPage from "./pages/MarketAnalyticsPage";
import WeatherForecastPage from "./pages/WeatherForecastPage";

// Context providers
import { AuthProvider } from "./contexts/AuthContext";
import { CartProvider } from "./contexts/CartContext";
import { NotificationProvider } from "./contexts/NotificationContext";
import { LocationProvider } from "./contexts/LocationContext";

// Create a theme instance with agriculture-inspired colors
const theme = createTheme({
  palette: {
    primary: {
      main: "#2e7d32", // Green for agriculture theme
      light: "#60ad5e",
      dark: "#005005",
    },
    secondary: {
      main: "#ff8f00", // Amber/orange for contrast
      light: "#ffc046",
      dark: "#c56000",
    },
    background: {
      default: "#f9f9f9",
    },
  },
  typography: {
    fontFamily: "'Poppins', 'Roboto', 'Arial', sans-serif",
    h4: {
      fontWeight: 600,
    },
    h5: {
      fontWeight: 500,
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          textTransform: "none",
          fontWeight: 500,
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
        },
      },
    },
  },
});

// Enhanced ProtectedRoute with role-based access control
const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    
    setIsAuthenticated(!!token);
    setUserRole(user.userType || "consumer");
    setIsLoading(false);
  }, []);

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <CircularProgress />
        
      </Box>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/loginpage" />;
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(userRole)) {
    return <Navigate to="/dashboard" />;
  }

  return children;
};

const App = () => {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <LocationProvider>
          <NotificationProvider>
            <CartProvider>
              <Router>
                <Navbar />
                <Routes>
                  {/* Public routes */}
                  <Route path="/" element={<LandingPage />} />
                  <Route path="/loginpage" element={<LoginPage />} />
                  <Route path="/login" element={<Navigate to="/loginpage" />} />
                  <Route path="/register" element={<RegisterPage />} />
                  
                  {/* Protected routes for all authenticated users */}
                  <Route
                    path="/dashboard"
                    element={
                      <ProtectedRoute>
                        <DashboardPage />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/products"
                    element={
                      <ProtectedRoute>
                        <ProductListingPage />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/products/:id"
                    element={
                      <ProtectedRoute>
                        <ProductDetailPage />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/cart"
                    element={
                      <ProtectedRoute>
                        <CartPage />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/checkout"
                    element={
                      <ProtectedRoute>
                        <CheckoutPage />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/order-tracking/:id"
                    element={
                      <ProtectedRoute>
                        <OrderTrackingPage />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/order-tracking"
                    element={
                      <ProtectedRoute>
                        <OrderTrackingPage />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/orders"
                    element={
                      <ProtectedRoute>
                        <OrderHistoryPage />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/profile"
                    element={
                      <ProtectedRoute>
                        <ProfilePage />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/weather"
                    element={
                      <ProtectedRoute>
                        <WeatherForecastPage />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/market-analytics"
                    element={
                      <ProtectedRoute>
                        <MarketAnalyticsPage />
                      </ProtectedRoute>
                    }
                  />
                  
                  {/* Farmer-specific routes */}
                  <Route
                    path="/farmer-dashboard"
                    element={
                      <ProtectedRoute allowedRoles={["farmer"]}>
                        <FarmerDashboard />
                      </ProtectedRoute>
                    }
                  />
                  
                  {/* Admin-specific routes */}
                  <Route
                    path="/admin"
                    element={
                      <ProtectedRoute allowedRoles={["admin"]}>
                        <AdminDashboard />
                      </ProtectedRoute>
                    }
                  />
                  
                  {/* 404 route */}
                  <Route path="*" element={<NotFoundPage />} />
                </Routes>
                <Footer />
              </Router>
            </CartProvider>
          </NotificationProvider>
        </LocationProvider>
      </AuthProvider>
    </ThemeProvider>
  );
};

export default App;