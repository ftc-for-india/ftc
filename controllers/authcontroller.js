const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Enhanced token generation with more payload data
const generateToken = (user) => {
  return jwt.sign(
    { 
      id: user._id, 
      role: user.userType,
      email: user.email,
      name: user.name
    }, 
    process.env.JWT_SECRET, 
    { expiresIn: '7d' }
  );
};

// Validate required fields based on user type
const validateUserData = (userData, userType) => {
  const requiredFields = [
    'name', 'email', 'password', 'phone',
    'address', 'city', 'state'
  ];

  if (userType === 'farmer') {
    if (!userData.farmDetails || !userData.farmDetails.farmName) {
      throw new Error('Farm details are required for farmer registration');
    }
  }

  const missingFields = requiredFields.filter(field => !userData[field]);
  if (missingFields.length > 0) {
    throw new Error(`Missing required fields: ${missingFields.join(', ')}`);
  }
};

exports.registerUser = async (req, res) => {
  try {
    const {
      name, email, password, phone,
      address, city, state, userType,
      farmDetails, pincode
    } = req.body;

    // Validate user type
    if (!['farmer', 'consumer'].includes(userType)) {
      return res.status(400).json({ 
        message: 'Invalid user type',
        allowedTypes: ['farmer', 'consumer']
      });
    }

    // Validate required fields
    try {
      validateUserData(req.body, userType);
    } catch (validationError) {
      return res.status(400).json({ message: validationError.message });
    }

    // Check for existing user
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ 
        message: 'Email already registered',
        suggestion: 'Please try logging in or use a different email'
      });
    }

    // Enhanced password hashing with increased security
    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create new user with enhanced data structure
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

    // Validate user data against schema
    const validationError = newUser.validateSync();
    if (validationError) {
      return res.status(400).json({
        message: 'Validation failed',
        errors: Object.values(validationError.errors).map(err => err.message)
      });
    }

    await newUser.save();
    const token = generateToken(newUser);

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
};

exports.loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({
        message: 'Email and password are required'
      });
    }

    // Find user with enhanced error handling
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({
        message: 'Invalid credentials',
        suggestion: 'Please check your email or register a new account'
      });
    }

    // Check account status
    if (user.status !== 'active') {
      return res.status(403).json({
        message: 'Account is not active',
        status: user.status
      });
    }

    // Verify password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        message: 'Invalid credentials',
        suggestion: 'Please check your password and try again'
      });
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    const token = generateToken(user);

    res.status(200).json({
      message: 'Login successful',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.userType,
        userType: user.userType,
        isVerified: user.isVerified,
        lastLogin: user.lastLogin
      },
      token,
      expiresIn: '7 days'
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ 
      message: 'Login failed',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};