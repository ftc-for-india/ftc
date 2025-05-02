const mongoose = require('mongoose');
require('dotenv').config();

const connectDB = async () => {
  try {
    // Set MongoDB URI with fallback
    const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/farmers';

    // Enhanced connection options for MongoDB Atlas
    const options = {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      autoIndex: true,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      family: 4,
      retryWrites: true,
      w: 'majority'
    };

    // Initialize connection
    const conn = await mongoose.connect(mongoURI, options);

    // Connection event handlers
    mongoose.connection.on('connected', () => {
      console.log('✅ MongoDB connected successfully!');
    });

    mongoose.connection.on('error', (err) => {
      console.error('❌ MongoDB connection error:', err);
      // Attempt to reconnect on error
      setTimeout(() => {
        mongoose.connect(mongoURI, options);
      }, 5000);
    });

    mongoose.connection.on('disconnected', () => {
      console.log('⚠️ MongoDB disconnected. Attempting to reconnect...');
      setTimeout(() => {
        mongoose.connect(mongoURI, options);
      }, 5000);
    });

    // Handle application termination
    process.on('SIGINT', async () => {
      try {
        await mongoose.connection.close();
        console.log('MongoDB connection closed through app termination');
        process.exit(0);
      } catch (err) {
        console.error('Error closing MongoDB connection:', err);
        process.exit(1);
      }
    });

    // Handle uncaught exceptions
    process.on('uncaughtException', async (err) => {
      console.error('Uncaught Exception:', err);
      try {
        await mongoose.connection.close();
        console.log('MongoDB connection closed due to uncaught exception');
        process.exit(1);
      } catch (closeErr) {
        console.error('Error closing MongoDB connection:', closeErr);
        process.exit(1);
      }
    });

    console.log(`✅ MongoDB Connected to: ${conn.connection.host}`);
    return conn;
  } catch (err) {
    console.error("❌ MongoDB connection failed:", err.message);
    
    // Enhanced error handling with specific error types
    if (err.name === 'MongoServerSelectionError') {
      console.error("Could not connect to MongoDB. Please check your network connection and MongoDB server status.");
    } else if (err.name === 'MongoParseError') {
      console.error("Invalid MongoDB connection string. Please check your MONGODB_URI format.");
    } else if (err.name === 'MongoNetworkError') {
      console.error("Network error occurred. Please check your internet connection and MongoDB server accessibility.");
    }
    
    process.exit(1);
  }
};

module.exports = connectDB;