const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
require('dotenv').config(); // ✅ Load environment variables

const app = express();
app.use(cors());
app.use(express.json());

connectDB(); // ✅ Connect MongoDB

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
