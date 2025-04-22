import React, { useState, useEffect } from 'react';
import {
  Container, Grid, Paper, Typography, Box,
  CircularProgress, TextField, MenuItem,
  Button, Card, CardContent
} from '@mui/material';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer,
  BarChart, Bar, PieChart, Pie, Cell
} from 'recharts';
import axios from 'axios';
import { useLocation } from '../contexts/LocationContext';  // Fixed import path


const MarketAnalyticsPage = () => {
  const { currentLocation } = useLocation();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [selectedCrop, setSelectedCrop] = useState('all');
  const [timeRange, setTimeRange] = useState('month');
  const [marketData, setMarketData] = useState({
    priceHistory: [],
    demandSupply: [],
    cropDistribution: [],
    marketTrends: []
  });

  const crops = [
    { value: 'all', label: 'All Crops' },
    { value: 'rice', label: 'Rice' },
    { value: 'wheat', label: 'Wheat' },
    { value: 'corn', label: 'Corn' },
    { value: 'potato', label: 'Potato' },
    { value: 'tomato', label: 'Tomato' }
  ];

  const timeRanges = [
    { value: 'week', label: 'Last Week' },
    { value: 'month', label: 'Last Month' },
    { value: 'quarter', label: 'Last Quarter' },
    { value: 'year', label: 'Last Year' }
  ];

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

  useEffect(() => {
    fetchMarketData();
  }, [selectedCrop, timeRange, currentLocation]);

  const fetchMarketData = async () => {
    setLoading(true);
    try {
      const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000';
      const token = localStorage.getItem('token');

      const params = new URLSearchParams({
        crop: selectedCrop,
        timeRange,
        latitude: currentLocation?.latitude || '',
        longitude: currentLocation?.longitude || ''
      });

      const response = await axios.get(
        `${apiUrl}/api/market-analytics?${params}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setMarketData(response.data);
    } catch (err) {
      setError('Failed to fetch market data');
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (value) => `₹${value.toFixed(2)}`;
  
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <Paper sx={{ p: 2 }}>
          <Typography variant="body2">
            Date: {label}
          </Typography>
          {payload.map((entry, index) => (
            <Typography
              key={index}
              variant="body2"
              color={entry.color}
            >
              {entry.name}: {formatPrice(entry.value)}
            </Typography>
          ))}
        </Paper>
      );
    }
    return null;
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 8 }}>
        <Paper sx={{ p: 3, textAlign: 'center' }}>
          <Typography color="error" gutterBottom>
            {error}
          </Typography>
          <Button
            variant="contained"
            onClick={fetchMarketData}
          >
            Retry
          </Button>
        </Paper>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 8 }}>
      <Typography variant="h4" gutterBottom>
        Market Analytics
      </Typography>

      <Paper sx={{ p: 3, mb: 4 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={4}>
            <TextField
              select
              fullWidth
              label="Select Crop"
              value={selectedCrop}
              onChange={(e) => setSelectedCrop(e.target.value)}
            >
              {crops.map((crop) => (
                <MenuItem key={crop.value} value={crop.value}>
                  {crop.label}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid item xs={12} sm={4}>
            <TextField
              select
              fullWidth
              label="Time Range"
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
            >
              {timeRanges.map((range) => (
                <MenuItem key={range.value} value={range.value}>
                  {range.label}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Location
            </Typography>
            <Typography>
              {currentLocation?.address || 'Location not available'}
            </Typography>
          </Grid>
        </Grid>
      </Paper>

      <Grid container spacing={4}>
        {/* Price History Chart */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Price History
            </Typography>
            <ResponsiveContainer width="100%" height={400}>
              <LineChart data={marketData.priceHistory}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis tickFormatter={formatPrice} />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="price"
                  stroke="#8884d8"
                  name="Market Price"
                />
                <Line
                  type="monotone"
                  dataKey="avgPrice"
                  stroke="#82ca9d"
                  name="Average Price"
                />
              </LineChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        {/* Supply and Demand */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Supply vs Demand
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={marketData.demandSupply}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="supply" fill="#8884d8" name="Supply" />
                <Bar dataKey="demand" fill="#82ca9d" name="Demand" />
              </BarChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        {/* Crop Distribution */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Crop Distribution
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={marketData.cropDistribution}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  label
                >
                  {marketData.cropDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        {/* Market Insights */}
        <Grid item xs={12}>
          <Grid container spacing={2}>
            {marketData.marketTrends.map((trend, index) => (
              <Grid item xs={12} sm={6} md={4} key={index}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      {trend.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {trend.description}
                    </Typography>
                    {trend.change && (
                      <Typography
                        variant="h6"
                        color={trend.change > 0 ? 'success.main' : 'error.main'}
                        sx={{ mt: 2 }}
                      >
                        {trend.change > 0 ? '+' : ''}{trend.change}%
                      </Typography>
                    )}
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Grid>
      </Grid>
    </Container>
  );
};

export default MarketAnalyticsPage;