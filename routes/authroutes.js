const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const passport = require('passport');
const User = require('../models/user.js');
const router = express.Router();
require('dotenv').config();

// Input validation middleware
const validateRegistrationInput = (req, res, next) => {
  const { email, password, phone, pincode, userType } = req.body;
  
  const errors = {};
  
  // Email validation
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    errors.email = 'Invalid email format';
  }

  // Password strength validation
  if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/.test(password)) {
    errors.password = 'Password must contain at least 8 characters, one uppercase, one lowercase, one number and one special character';
  }

  // Phone validation
  if (!/^\+?[\d\s-]{10,}$/.test(phone)) {
    errors.phone = 'Invalid phone number format';
  }

  // Pincode validation
  if (!/^\d{6}$/.test(pincode)) {
    errors.pincode = 'Pincode must be 6 digits';
  }

  if (Object.keys(errors).length > 0) {
    return res.status(400).json({ errors });
  }
  
  next();
};

// Registration route
router.post('/register', validateRegistrationInput, async (req, res) => {
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

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({
        message: 'Email already registered',
        suggestion: 'Please try logging in or use a different email'
      });
    }

    // Create new user with enhanced security
    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = new User({
      name,
      email,
      password: hashedPassword,
      phone,
      address: {
        street: address,
        city,
        state,
        pincode
      },
      userType,
      farmDetails: userType === 'farmer' ? farmDetails : undefined,
      isVerified: false,
      status: 'active',
      lastLogin: new Date(),
      verificationToken: crypto.randomBytes(32).toString('hex'),
      verificationTokenExpires: Date.now() + 24 * 60 * 60 * 1000 // 24 hours
    });

    // Validate user data
    const validationError = newUser.validateSync();
    if (validationError) {
      return res.status(400).json({
        message: 'Validation failed',
        errors: Object.values(validationError.errors).map(err => err.message)
      });
    }

    await newUser.save();

    // Generate JWT with enhanced security
    const token = jwt.sign(
      {
        id: newUser._id,
        role: newUser.userType,
        email: newUser.email,
        version: 1 // For token versioning
      },
      process.env.JWT_SECRET,
      {
        expiresIn: '7d',
        algorithm: 'HS256'
      }
    );

    // Send success response
    res.status(201).json({
      message: `${userType.charAt(0).toUpperCase() + userType.slice(1)} registered successfully`,
      user: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.userType,
        isVerified: newUser.isVerified,
        registrationDate: newUser.createdAt
      },
      token
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      message: 'Registration failed',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// Login route
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Check if account is locked
    if (user.isLocked) {
      const lockTime = new Date(user.loginAttempts.lockUntil);
      return res.status(423).json({
        message: 'Account is temporarily locked',
        unlockTime: lockTime
      });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      await user.incrementLoginAttempts();
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Reset login attempts on successful login
    await user.resetLoginAttempts();

    // Update last login with device info
    await user.updateLastLogin({
      browser: req.headers['user-agent'],
      deviceId: req.headers['x-device-id'] || 'unknown'
    });

    const token = jwt.sign(
      {
        id: user._id,
        role: user.userType,
        email: user.email,
        version: 1
      },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      message: 'Login successful',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.userType,
        isVerified: user.isVerified
      },
      token
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      message: 'Login failed',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// Password reset request
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = Date.now() + 3600000; // 1 hour

    await user.save();

    // Send reset token (implement email service)
    res.json({ message: 'Password reset instructions sent to your email' });
  } catch (error) {
    res.status(500).json({ message: 'Error processing password reset request' });
  }
});

// Logout (token blacklisting would be implemented with Redis)
router.post('/logout', async (req, res) => {
  res.json({ message: 'Logged out successfully' });
});

// Google OAuth routes
router.get('/google', 
  passport.authenticate('google', { scope: ['profile', 'email'] })
);

router.get('/google/callback', 
  passport.authenticate('google', { failureRedirect: '/login' }),
  (req, res) => {
    // Generate JWT token
    const token = jwt.sign(
      { id: req.user._id, email: req.user.email },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );
    
    // Redirect to frontend with token
    res.redirect(`${process.env.FRONTEND_URL}/oauth-callback?token=${token}&user=${encodeURIComponent(JSON.stringify(req.user))}`);
  }
);

// Facebook OAuth routes
router.get('/facebook',
  passport.authenticate('facebook', { scope: ['email'] })
);

router.get('/facebook/callback',
  passport.authenticate('facebook', { failureRedirect: '/login' }),
  (req, res) => {
    // Generate JWT token
    const token = jwt.sign(
      { id: req.user._id, email: req.user.email },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );
    
    // Redirect to frontend with token
    res.redirect(`${process.env.FRONTEND_URL}/oauth-callback?token=${token}&user=${encodeURIComponent(JSON.stringify(req.user))}`);
  }
);

module.exports = router;