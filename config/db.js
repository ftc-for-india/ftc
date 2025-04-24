const mongoose = require('mongoose');
require('dotenv').config();

const connectDB = async () => {
  try {
    // Check if MONGODB_URI is defined
    if (!process.env.MONGODB_URI) {
      throw new Error('MONGODB_URI is not defined in environment variables');
    }

    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      autoIndex: true
    });

    console.log("✅ MongoDB connected successfully!");
    return conn;
  } catch (err) {
    console.error("❌ MongoDB connection failed:", err.message);
    console.error("Please check your .env file and MongoDB URI configuration");
    process.exit(1);
  }
};

module.exports = connectDB;