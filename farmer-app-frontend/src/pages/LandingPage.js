import React from 'react';
import { Container, Typography, Button, Box } from '@mui/material';
import { useNavigate } from 'react-router-dom';

const LandingPage = () => {
  const navigate = useNavigate();

  return (
    <Container maxWidth="lg">
      <Box sx={{ mt: 8, textAlign: 'center' }}>
        <Typography variant="h2" component="h1" gutterBottom>
          Welcome to Farmer's Market
        </Typography>
        <Typography variant="h5" color="text.secondary" paragraph>
          Connect directly with local farmers and get fresh produce delivered to your doorstep
        </Typography>
        <Box sx={{ mt: 4 }}>
          <Button 
            variant="contained" 
            color="primary" 
            size="large"
            onClick={() => navigate('/products')}
            sx={{ mr: 2 }}
          >
            Browse Products
          </Button>
          <Button 
            variant="outlined" 
            color="primary" 
            size="large"
            onClick={() => navigate('/register')}
          >
            Join Now
          </Button>
        </Box>
      </Box>
    </Container>
  );
};

export default LandingPage;