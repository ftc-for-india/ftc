import React, { useState, useEffect } from 'react';
import {
  Container, Grid, Paper, Typography, Box, CircularProgress,
  Card, CardContent, Divider, TextField, Button, IconButton,
  InputAdornment, Alert
} from '@mui/material';
import {
  WbSunny, Opacity, Air, Thermostat, Search,
  MyLocation, ArrowUpward, ArrowDownward, CalendarToday
} from '@mui/icons-material';
import axios from 'axios';
import { useNotification } from '../contexts/NotificationContext';

const WeatherForecastPage = () => {
  const { showSnackbar } = useNotification();
  const [loading, setLoading] = useState(false);
  const [weatherData, setWeatherData] = useState(null);
  const [forecast, setForecast] = useState([]);
  const [location, setLocation] = useState('');
  const [error, setError] = useState(null);
  const [usingCurrentLocation, setUsingCurrentLocation] = useState(false);

  useEffect(() => {
    // Try to get user's location on initial load
    if (navigator.geolocation) {
      setUsingCurrentLocation(true);
      navigator.geolocation.getCurrentPosition(
        (position) => {
          fetchWeatherByCoords(position.coords.latitude, position.coords.longitude);
          setUsingCurrentLocation(false);
        },
        (err) => {
          console.error("Error getting location:", err);
          setUsingCurrentLocation(false);
          showSnackbar('Unable to get your location. Please enter a location manually.', 'warning');
        }
      );
    }
  }, []);

  const fetchWeatherByCoords = async (lat, lon) => {
    setLoading(true);
    setError(null);
    
    try {
      const apiKey = process.env.REACT_APP_WEATHER_API_KEY || 'your_api_key';
      
      // Current weather
      const currentResponse = await axios.get(
        `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=${apiKey}`
      );
      
      // 5-day forecast
      const forecastResponse = await axios.get(
        `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&units=metric&appid=${apiKey}`
      );
      
      setWeatherData(currentResponse.data);
      
      // Process forecast data to get one entry per day
      const dailyForecasts = processForecastData(forecastResponse.data.list);
      setForecast(dailyForecasts);
      
      // Update location field with the fetched location name
      setLocation(currentResponse.data.name);
    } catch (err) {
      console.error('Error fetching weather data:', err);
      setError('Failed to fetch weather data. Please try again.');
      showSnackbar('Failed to fetch weather data', 'error');
    } finally {
      setLoading(false);
    }
  };

  const fetchWeatherByLocation = async (e) => {
    e.preventDefault();
    
    if (!location.trim()) {
      showSnackbar('Please enter a location', 'warning');
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      const apiKey = process.env.REACT_APP_WEATHER_API_KEY || 'your_api_key';
      
      // Current weather
      const currentResponse = await axios.get(
        `https://api.openweathermap.org/data/2.5/weather?q=${location}&units=metric&appid=${apiKey}`
      );
      
      // 5-day forecast
      const forecastResponse = await axios.get(
        `https://api.openweathermap.org/data/2.5/forecast?q=${location}&units=metric&appid=${apiKey}`
      );
      
      setWeatherData(currentResponse.data);
      
      // Process forecast data to get one entry per day
      const dailyForecasts = processForecastData(forecastResponse.data.list);
      setForecast(dailyForecasts);
    } catch (err) {
      console.error('Error fetching weather data:', err);
      setError('Location not found. Please check the spelling and try again.');
      showSnackbar('Location not found', 'error');
    } finally {
      setLoading(false);
    }
  };

  const processForecastData = (forecastList) => {
    const dailyData = {};
    
    forecastList.forEach(item => {
      const date = new Date(item.dt * 1000).toLocaleDateString();
      
      if (!dailyData[date] || new Date(item.dt * 1000).getHours() === 12) {
        dailyData[date] = item;
      }
    });
    
    return Object.values(dailyData).slice(0, 5);
  };

  const handleGetCurrentLocation = () => {
    if (navigator.geolocation) {
      setUsingCurrentLocation(true);
      navigator.geolocation.getCurrentPosition(
        (position) => {
          fetchWeatherByCoords(position.coords.latitude, position.coords.longitude);
          setUsingCurrentLocation(false);
        },
        (err) => {
          console.error("Error getting location:", err);
          setUsingCurrentLocation(false);
          showSnackbar('Unable to get your location', 'error');
        }
      );
    } else {
      showSnackbar('Geolocation is not supported by your browser', 'error');
    }
  };

  const getWeatherIcon = (iconCode) => {
    return `https://openweathermap.org/img/wn/${iconCode}@2x.png`;
  };

  const getFormattedDate = (timestamp) => {
    const date = new Date(timestamp * 1000);
    return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
  };

  const getWindDirection = (degrees) => {
    const directions = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
    const index = Math.round(degrees / 45) % 8;
    return directions[index];
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" gutterBottom>
        Weather Forecast
      </Typography>
      <Typography variant="body1" color="text.secondary" paragraph>
        Get the latest weather information for your farming needs
      </Typography>
      
      <Paper sx={{ p: 3, mb: 4 }}>
        <form onSubmit={fetchWeatherByLocation}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} sm={9}>
              <TextField
                fullWidth
                label="Enter Location"
                variant="outlined"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="City name, e.g. Mumbai"
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={handleGetCurrentLocation}
                        disabled={usingCurrentLocation}
                        title="Use current location"
                      >
                        <MyLocation />
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={12} sm={3}>
              <Button
                type="submit"
                variant="contained"
                color="primary"
                fullWidth
                startIcon={<Search />}
                disabled={loading || usingCurrentLocation}
                sx={{ height: '56px' }}
              >
                {loading ? 'Searching...' : 'Search'}
              </Button>
            </Grid>
          </Grid>
        </form>
      </Paper>
      
      {error && (
        <Alert severity="error" sx={{ mb: 4 }}>
          {error}
        </Alert>
      )}
      
      {loading ? (
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="300px">
          <CircularProgress />
        </Box>
      ) : weatherData ? (
        <>
          {/* Current Weather */}
          <Paper sx={{ p: 3, mb: 4 }}>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Box display="flex" alignItems="center">
                  <Box>
                    <Typography variant="h5" gutterBottom>
                      {weatherData.name}, {weatherData.sys.country}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {new Date().toLocaleDateString('en-US', { 
                        weekday: 'long', 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                      })}
                    </Typography>
                  </Box>
                </Box>
                
                <Box display="flex" alignItems="center" sx={{ mt: 2 }}>
                  <img 
                    src={getWeatherIcon(weatherData.weather[0].icon)} 
                    alt={weatherData.weather[0].description}
                    style={{ width: 80, height: 80 }}
                  />
                  <Box sx={{ ml: 2 }}>
                    <Typography variant="h2">
                      {Math.round(weatherData.main.temp)}°C
                    </Typography>
                    <Typography variant="body1" sx={{ textTransform: 'capitalize' }}>
                      {weatherData.weather[0].description}
                    </Typography>
                  </Box>
                </Box>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <Card variant="outlined">
                      <CardContent>
                        <Box display="flex" alignItems="center">
                          <Thermostat color="primary" />
                          <Typography variant="body1" sx={{ ml: 1 }}>
                            Feels Like
                          </Typography>
                        </Box>
                        <Typography variant="h6" sx={{ mt: 1 }}>
                          {Math.round(weatherData.main.feels_like)}°C
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                  
                  <Grid item xs={6}>
                    <Card variant="outlined">
                      <CardContent>
                        <Box display="flex" alignItems="center">
                          <Opacity color="primary" />
                          <Typography variant="body1" sx={{ ml: 1 }}>
                            Humidity
                          </Typography>
                        </Box>
                        <Typography variant="h6" sx={{ mt: 1 }}>
                          {weatherData.main.humidity}%
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                  
                  <Grid item xs={6}>
                    <Card variant="outlined">
                      <CardContent>
                        <Box display="flex" alignItems="center">
                          <Air color="primary" />
                          <Typography variant="body1" sx={{ ml: 1 }}>
                            Wind
                          </Typography>
                        </Box>
                        <Typography variant="h6" sx={{ mt: 1 }}>
                          {Math.round(weatherData.wind.speed * 3.6)} km/h {getWindDirection(weatherData.wind.deg)}
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                  
                  <Grid item xs={6}>
                    <Card variant="outlined">
                      <CardContent>
                        <Box display="flex" alignItems="center">
                          <WbSunny color="primary" />
                          <Typography variant="body1" sx={{ ml: 1 }}>
                            Min/Max
                          </Typography>
                        </Box>
                        <Box display="flex" alignItems="center" sx={{ mt: 1 }}>
                          <ArrowDownward color="info" fontSize="small" />
                          <Typography variant="body1" sx={{ mr: 1 }}>
                            {Math.round(weatherData.main.temp_min)}°
                          </Typography>
                          <ArrowUpward color="error" fontSize="small" />
                          <Typography variant="body1">
                            {Math.round(weatherData.main.temp_max)}°
                          </Typography>
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                </Grid>
              </Grid>
            </Grid>
          </Paper>
          
          {/* 5-Day Forecast */}
          <Typography variant="h5" gutterBottom>
            5-Day Forecast
          </Typography>
          <Paper sx={{ p: 3 }}>
            <Grid container spacing={2}>
              {forecast.map((day, index) => (
                <Grid item xs={12} sm={6} md={2.4} key={index}>
                  <Card variant="outlined" sx={{ height: '100%' }}>
                    <CardContent>
                      <Box display="flex" flexDirection="column" alignItems="center">
                        <Box display="flex" alignItems="center">
                          <CalendarToday fontSize="small" color="action" sx={{ mr: 1 }} />
                          <Typography variant="body2" color="text.secondary">
                            {getFormattedDate(day.dt)}
                          </Typography>
                        </Box>
                        
                        <img 
                          src={getWeatherIcon(day.weather[0].icon)} 
                          alt={day.weather[0].description}
                          style={{ width: 60, height: 60, margin: '8px 0' }}
                        />
                        
                        <Typography variant="h6">
                          {Math.round(day.main.temp)}°C
                        </Typography>
                        
                        <Typography variant="body2" sx={{ textTransform: 'capitalize', mb: 1 }}>
                          {day.weather[0].description}
                        </Typography>
                        
                        <Divider sx={{ width: '100%', my: 1 }} />
                        
                        <Box display="flex" justifyContent="space-between" width="100%">
                          <Box display="flex" alignItems="center">
                            <ArrowDownward color="info" fontSize="small" />
                            <Typography variant="body2">
                              {Math.round(day.main.temp_min)}°
                            </Typography>
                          </Box>
                          <Box display="flex" alignItems="center">
                            <ArrowUpward color="error" fontSize="small" />
                            <Typography variant="body2">
                              {Math.round(day.main.temp_max)}°
                            </Typography>
                          </Box>
                        </Box>
                        
                        <Box display="flex" justifyContent="space-between" width="100%" sx={{ mt: 1 }}>
                          <Box display="flex" alignItems="center">
                            <Opacity fontSize="small" color="action" sx={{ mr: 0.5 }} />
                            <Typography variant="body2">
                              {day.main.humidity}%
                            </Typography>
                          </Box>
                          <Box display="flex" alignItems="center">
                            <Air fontSize="small" color="action" sx={{ mr: 0.5 }} />
                            <Typography variant="body2">
                              {Math.round(day.wind.speed * 3.6)} km/h
                            </Typography>
                          </Box>
                        </Box>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Paper>
          
          {/* Farming Tips based on weather */}
          <Typography variant="h5" gutterBottom sx={{ mt: 4 }}>
            Farming Recommendations
          </Typography>
          <Paper sx={{ p: 3 }}>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Typography variant="h6" gutterBottom>
                  Based on Current Weather
                </Typography>
                <Box sx={{ mb: 2 }}>
                  {weatherData.main.temp > 30 ? (
                    <Alert severity="warning" sx={{ mb: 2 }}>
                      <Typography variant="body1" fontWeight="bold">
                        High Temperature Alert
                      </Typography>
                      <Typography variant="body2">
                        • Ensure adequate irrigation for crops
                        <br />
                        • Consider providing shade for sensitive plants
                        <br />
                        • Avoid spraying pesticides during peak heat
                      </Typography>
                    </Alert>
                  ) : weatherData.main.temp < 15 ? (
                    <Alert severity="info" sx={{ mb: 2 }}>
                      <Typography variant="body1" fontWeight="bold">
                        Cool Weather Advisory
                      </Typography>
                      <Typography variant="body2">
                        • Protect sensitive crops from cold
                        <br />
                        • Optimal time for planting cool-season crops
                        <br />
                        • Reduce irrigation frequency
                      </Typography>
                    </Alert>
                  ) : (
                    <Alert severity="success" sx={{ mb: 2 }}>
                      <Typography variant="body1" fontWeight="bold">
                        Favorable Growing Conditions
                      </Typography>
                      <Typography variant="body2">
                        • Ideal temperature for most crops
                        <br />
                        • Good time for regular farm activities
                        <br />
                        • Maintain normal irrigation schedule
                      </Typography>
                    </Alert>
                  )}
                  
                  {weatherData.main.humidity > 80 ? (
                    <Alert severity="warning">
                      <Typography variant="body1" fontWeight="bold">
                        High Humidity Alert
                      </Typography>
                      <Typography variant="body2">
                        • Monitor for fungal diseases
                        <br />
                        • Ensure proper spacing between plants for air circulation
                        <br />
                        • Consider preventative fungicide application
                      </Typography>
                    </Alert>
                  ) : weatherData.main.humidity < 30 ? (
                    <Alert severity="warning">
                      <Typography variant="body1" fontWeight="bold">
                        Low Humidity Alert
                      </Typography>
                      <Typography variant="body2">
                        • Increase irrigation frequency
                        <br />
                        • Consider mulching to retain soil moisture
                        <br />
                        • Monitor for water stress in plants
                      </Typography>
                    </Alert>
                  ) : null}
                </Box>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Typography variant="h6" gutterBottom>
                  Seasonal Crop Recommendations
                </Typography>
                <Card variant="outlined" sx={{ mb: 2 }}>
                  <CardContent>
                    <Typography variant="subtitle1" gutterBottom>
                      Recommended Crops for Current Weather
                    </Typography>
                    <Divider sx={{ mb: 2 }} />
                    
                    {weatherData.main.temp > 25 ? (
                      <Box>
                        <Typography variant="body2" paragraph>
                          <strong>Warm Weather Crops:</strong> Tomatoes, Peppers, Eggplant, Okra, Cucumbers, Melons
                        </Typography>
                        <Typography variant="body2">
                          These crops thrive in the current warm conditions. Ensure adequate water supply and monitor for pests that are more active in warm weather.
                        </Typography>
                      </Box>
                    ) : weatherData.main.temp < 20 ? (
                      <Box>
                        <Typography variant="body2" paragraph>
                          <strong>Cool Weather Crops:</strong> Spinach, Lettuce, Peas, Cabbage, Cauliflower, Broccoli
                        </Typography>
                        <Typography variant="body2">
                          These crops perform well in cooler temperatures. They can tolerate light frost and generally require less water than warm-season crops.
                        </Typography>
                      </Box>
                    ) : (
                      <Box>
                        <Typography variant="body2" paragraph>
                          <strong>Moderate Weather Crops:</strong> Beans, Carrots, Radishes, Beets, Onions, Potatoes
                        </Typography>
                        <Typography variant="body2">
                          These versatile crops do well in the current moderate temperatures. Good time for planting and general maintenance.
                        </Typography>
                      </Box>
                    )}
                  </CardContent>
                </Card>
                
                <Alert severity="info">
                  <Typography variant="body2">
                    <strong>Weather Forecast Summary:</strong> Based on the 5-day forecast, plan your farming activities accordingly. {
                      forecast.some(day => day.weather[0].main === 'Rain') 
                        ? 'Rain is expected in the coming days. Consider postponing activities like spraying or harvesting during rainy periods.'
                        : 'No significant precipitation is expected in the next 5 days. Ensure adequate irrigation for your crops.'
                    }
                  </Typography>
                </Alert>
              </Grid>
            </Grid>
          </Paper>
        </>
      ) : null}
    </Container>
  );
};

export default WeatherForecastPage;