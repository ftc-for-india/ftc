const mongoose = require('mongoose');
require('dotenv').config();

const connectDB = async () => {
  try {
    // Set MongoDB URI with fallback
    const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/farmer';

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

    const conn = await mongoose.connect(mongoURI, options);

    // Add connection event handlers
    mongoose.connection.on('connected', () => {
      console.log('✅ MongoDB Atlas connected successfully!');
    });

    mongoose.connection.on('error', (err) => {
      console.error('❌ MongoDB connection error:', err);
    });

    mongoose.connection.on('disconnected', () => {
      console.log('⚠️ MongoDB disconnected. Attempting to reconnect...');
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

    console.log(`✅ MongoDB Connected to: ${conn.connection.host}`);
    return conn;
  } catch (err) {
    console.error("❌ MongoDB connection failed:", err.message);
    
    // More detailed error information
    if (err.name === 'MongoServerSelectionError') {
      console.error("Could not connect to MongoDB Atlas. Please check your network connection and credentials.");
    } else if (err.name === 'MongoParseError') {
      console.error("Invalid MongoDB connection string. Please check your MONGODB_URI format.");
    }
    
    process.exit(1);
  }
};

module.exports = connectDB;