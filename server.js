const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const passport = require('passport');
const session = require('express-session');
const connectDB = require('./config/db.js');
const authRoutes = require('./routes/authRoutes.js');
require('dotenv').config();
require('./config/passport');

const app = express();
// Enhanced CORS configuration
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:5173', 'https://ftc-2.onrender.com'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Body parser middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Morgan logger
app.use(morgan('dev'));

// Session middleware for passport
app.use(session({
  secret: process.env.JWT_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: { secure: process.env.NODE_ENV === 'production' }
}));

// Initialize passport
app.use(passport.initialize());
app.use(passport.session());
const errorHandler = (err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    message: err.message || 'Internal Server Error',
    error: process.env.NODE_ENV === 'development' ? err : {}
  });
};

// Connect to MongoDB before starting the serverconnectDB()
connectDB()
  .then(() => {
    // Health check route
    app.get('/health', (req, res) => {
      res.json({ status: 'ok', timestamp: new Date() });
    });

    // API routes
    app.use('/api/auth', authRoutes);

    // Welcome route
    app.get('/', (req, res) => {
      res.json({ message: 'Welcome to Farmer-to-Consumer API' });
    });

    // 404 handler
    app.use((req, res) => {
      res.status(404).json({ message: 'Route not found' });
    });

    // Global error handler
    app.use(errorHandler);


    // Global error handler
    app.use(errorHandler);

    // ... existing code ...
    // Dynamic port selection with fallback
    const startServer = async (retries = 3) => {
      const basePort = process.env.PORT || 5000;
      
      for (let i = 0; i < retries; i++) {
        const port = basePort + i;
        try {
          const server = await new Promise((resolve, reject) => {
            const server = app.listen(port, () => {
              console.log(`✅ Server running on port ${port}`);
              console.log(`📚 API Documentation: http://localhost:${port}/api-docs`);
              resolve(server);
            }).on('error', (err) => {
              if (err.code === 'EADDRINUSE') {
                console.log(`⚠️ Port ${port} is in use, trying next port...`);
                reject(err);
              } else {
                reject(err);
              }
            });
          });

          // Store server instance for graceful shutdown
          global.server = server;
          return;
        } catch (err) {
          if (i === retries - 1) {
            console.error(`❌ Could not find an available port after ${retries} attempts`);
            process.exit(1);
          }
        }
      }
    };

    startServer();

    // Graceful shutdown handlers
    const gracefulShutdown = async () => {
      if (global.server) {
        console.log('Performing graceful shutdown...');
        await new Promise((resolve) => {
          global.server.close(resolve);
        });
        console.log('Server closed. Exiting process.');
      }
      process.exit(0);
    };

    process.on('SIGTERM', gracefulShutdown);
    process.on('SIGINT', gracefulShutdown);
  })
  .catch(error => {
    console.error('❌ Failed to connect to MongoDB:', error);
    process.exit(1);
  });
