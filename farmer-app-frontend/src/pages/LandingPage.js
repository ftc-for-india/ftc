import React from 'react';
import { Container, Typography, Button, Box } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

const LandingPage = () => {
  const navigate = useNavigate();

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 1,
        staggerChildren: 0.3
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        backgroundImage: 'url("../public/background imagge.jpg")',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed',
        position: 'relative',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          zIndex: 1
        }
      }}
    >
      <Container 
        maxWidth="lg"
        component={motion.div}
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        sx={{
          position: 'relative',
          zIndex: 2
        }}
      >
        <Box sx={{ 
          mt: 8, 
          textAlign: 'center',
          color: 'white',
          pt: 15,
          pb: 15
        }}>
          <motion.div variants={itemVariants}>
            <Typography 
              variant="h2" 
              component="h1" 
              gutterBottom
              sx={{
                fontWeight: 700,
                textShadow: '2px 2px 4px rgba(0,0,0,0.3)'
              }}
            >
              Welcome to Farmer's Market
            </Typography>
          </motion.div>

          <motion.div variants={itemVariants}>
            <Typography 
              variant="h5" 
              paragraph
              sx={{
                mb: 4,
                textShadow: '1px 1px 2px rgba(0,0,0,0.3)'
              }}
            >
              Connect directly with local farmers and get fresh produce delivered to your doorstep
            </Typography>
          </motion.div>

          <Box sx={{ mt: 4 }}>
            <motion.div
              variants={itemVariants}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button 
                variant="contained" 
                color="primary" 
                size="large"
                onClick={() => navigate('/products')}
                sx={{ 
                  mr: 2,
                  backgroundColor: '#2e7d32',
                  '&:hover': {
                    backgroundColor: '#1b5e20'
                  }
                }}
              >
                Browse Products
              </Button>
            </motion.div>

            <motion.div
              variants={itemVariants}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              style={{ display: 'inline-block' }}
            >
              <Button 
                variant="outlined" 
                size="large"
                onClick={() => navigate('/dashboard')}
                sx={{ 
                  borderColor: 'white',
                  color: 'white',
                  '&:hover': {
                    borderColor: '#2e7d32',
                    backgroundColor: 'rgba(46, 125, 50, 0.1)'
                  }
                }}
              >
                Join Now
              </Button>
            </motion.div>
          </Box>
        </Box>
      </Container>
    </Box>
  );
};

export default LandingPage;