// server.js or index.js
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
require('dotenv').config(); // Load environment variables

const app = express();

// ✅ Use CORS and allow your frontend domain
app.use(cors({
  origin: ['http://localhost:3000', 'http://ftcmarket.free.nf'], // Add your frontend URL
  credentials: true
}));

app.use(express.json());

connectDB(); // Connect MongoDB

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
