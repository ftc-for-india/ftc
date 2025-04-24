const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/User.js');
require('dotenv').config();

const router = express.Router();

// ========== REGISTER ==========
router.post('/register', async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      phone,
      address,
      city,
      state,
      userType,
      farmDetails,
      pincode
    } = req.body;

    // Enhanced validation for required fields
    const requiredFields = ['name', 'email', 'password', 'phone', 'address', 'city', 'state', 'userType', 'pincode'];
    const missingFields = requiredFields.filter(field => !req.body[field]);
    
    if (missingFields.length > 0) {
      return res.status(400).json({ 
        message: 'Missing required fields', 
        fields: missingFields 
      });
    }

    // Enhanced userType validation
    if (!['farmer', 'consumer'].includes(userType)) {
      return res.status(400).json({ 
        message: 'Invalid user type',
        allowedTypes: ['farmer', 'consumer']
      });
    }

    // Validate farmer-specific details
    if (userType === 'farmer' && (!farmDetails || !farmDetails.farmName)) {
      return res.status(400).json({ 
        message: 'Farm details are required for farmer registration',
        required: ['farmName']
      });
    }

    // Enhanced email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: 'Invalid email format' });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ 
        message: 'Email already registered',
        suggestion: 'Please try logging in or use a different email'
      });
    }

    // Enhanced password validation
    if (password.length < 6) {
      return res.status(400).json({ 
        message: 'Password too short',
        requirement: 'Password must be at least 6 characters long'
      });
    }

    // Validate pincode
    const pincodeRegex = /^\d{6}$/;
    if (!pincodeRegex.test(pincode)) {
      return res.status(400).json({ 
        message: 'Invalid pincode format',
        requirement: 'Pincode must be 6 digits'
      });
    }

    // Hash the password
    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create new user
    const newUser = new User({
      name,
      email,
      password: hashedPassword,
      phone,
      address,
      city,
      state,
      pincode,
      userType,
      farmDetails: userType === 'farmer' ? farmDetails : undefined,
      isVerified: false,
      status: 'active',
      lastLogin: new Date()
    });

    // Validate user data
    const validationError = newUser.validateSync();
    if (validationError) {
      return res.status(400).json({ 
        message: 'Validation failed', 
        errors: Object.values(validationError.errors).map(err => err.message)
      });
    }

    // Save user to database
    await newUser.save();

    // Generate JWT token
    const token = jwt.sign(
      { 
        id: newUser._id, 
        role: newUser.userType,
        email: newUser.email
      },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    // Send success response
    res.status(201).json({
      message: `${userType.charAt(0).toUpperCase() + userType.slice(1)} registered successfully`,
      user: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.userType,
        userType: newUser.userType,
        isVerified: newUser.isVerified,
        registrationDate: newUser.createdAt
      },
      token
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ 
      message: 'Registration failed',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

module.exports =router;
// ... existing code ...m