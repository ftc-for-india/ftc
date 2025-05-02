const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('./models/user');
const crypto = require('crypto');

// Enhanced token generation with more security features
const generateToken = (user) => {
  return jwt.sign(
    { 
      id: user._id, 
      role: user.userType,
      email: user.email,
      name: user.name,
      version: 1, // For token versioning
      iat: Date.now() // Issued at time
    }, 
    process.env.JWT_SECRET, 
    { 
      expiresIn: '7d',
      algorithm: 'HS256'
    }
  );
};

// Enhanced validation with more comprehensive checks
const validateUserData = (userData, userType) => {
  const requiredFields = [
    'name', 'email', 'password', 'phone',
    'address', 'city', 'state', 'pincode'
  ];

  // Email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(userData.email)) {
    throw new Error('Invalid email format');
  }

  // Phone validation
  const phoneRegex = /^\+?[\d\s-]{10,}$/;
  if (!phoneRegex.test(userData.phone)) {
    throw new Error('Invalid phone number format');
  }

  // Pincode validation
  const pincodeRegex = /^\d{6}$/;
  if (!pincodeRegex.test(userData.pincode)) {
    throw new Error('Invalid pincode format');
  }

  // Password strength validation
  if (userData.password.length < 8) {
    throw new Error('Password must be at least 8 characters long');
  }

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
    if (!['farmer', 'consumer', 'admin'].includes(userType)) {
      return res.status(400).json({ 
        message: 'Invalid user type',
        allowedTypes: ['farmer', 'consumer', 'admin']
      });
    }

    // Enhanced validation
    try {
      validateUserData(req.body, userType);
    } catch (validationError) {
      return res.status(400).json({ 
        message: validationError.message,
        status: 'validation_error'
      });
    }

    // Check for existing user with case-insensitive email
    const existingUser = await User.findOne({ 
      email: { $regex: new RegExp(`^${email}$`, 'i') }
    });
    
    if (existingUser) {
      return res.status(409).json({ 
        message: 'Email already registered',
        suggestion: 'Please try logging in or use a different email'
      });
    }

    // Generate verification token
    const verificationToken = crypto.randomBytes(32).toString('hex');
    const verificationTokenExpires = Date.now() + 24 * 60 * 60 * 1000; // 24 hours

    // Enhanced password hashing
    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create new user with enhanced security features
    const newUser = new User({
      name,
      email: email.toLowerCase(),
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
      verificationToken,
      verificationTokenExpires,
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

    await newUser.save();
    const token = generateToken(newUser);

    // TODO: Send verification email with verificationToken

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
      token,
      verificationRequired: true
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
    const { email, password, deviceInfo } = req.body;

    // Enhanced input validation
    if (!email || !password) {
      return res.status(400).json({
        message: 'Email and password are required',
        status: 'validation_error'
      });
    }

    // Find user with case-insensitive email search
    const user = await User.findOne({ 
      email: { $regex: new RegExp(`^${email}$`, 'i') }
    });

    if (!user) {
      return res.status(401).json({
        message: 'Invalid credentials',
        suggestion: 'Please check your email or register a new account'
      });
    }

    // Check if account is locked
    if (user.isLocked) {
      const lockTime = new Date(user.loginAttempts.lockUntil);
      return res.status(423).json({
        message: 'Account is temporarily locked',
        unlockTime: lockTime,
        remainingTime: lockTime - Date.now()
      });
    }

    // Check account status
    if (user.status !== 'active') {
      return res.status(403).json({
        message: 'Account is not active',
        status: user.status,
        suggestion: 'Please contact support for assistance'
      });
    }

    // Verify password and handle login attempts
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      await user.incrementLoginAttempts();
      
      if (user.isLocked) {
        return res.status(423).json({
          message: 'Account has been locked due to too many failed attempts',
          unlockTime: user.loginAttempts.lockUntil
        });
      }

      return res.status(401).json({
        message: 'Invalid credentials',
        attemptsRemaining: 5 - user.loginAttempts.count
      });
    }

    // Reset login attempts on successful login
    await user.resetLoginAttempts();

    // Update last login with device tracking
    await user.updateLastLogin({
      deviceId: deviceInfo?.deviceId || 'unknown',
      browser: req.headers['user-agent'],
      os: deviceInfo?.os || 'unknown',
      lastUsed: new Date()
    });

    const token = generateToken(user);

    res.status(200).json({
      message: 'Login successful',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.userType,
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

// Add password reset functionality
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      return res.status(404).json({ 
        message: 'If a user with this email exists, password reset instructions will be sent'
      });
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = Date.now() + 3600000; // 1 hour

    await user.save();

    // TODO: Send password reset email with resetToken

    res.json({
      message: 'Password reset instructions have been sent to your email'
    });
  } catch (error) {
    console.error('Password reset error:', error);
    res.status(500).json({ message: 'Error processing password reset request' });
  }
};

// Add email verification
exports.verifyEmail = async (req, res) => {
  try {
    const { token } = req.params;
    const user = await User.findOne({
      verificationToken: token,
      verificationTokenExpires: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({
        message: 'Invalid or expired verification token'
      });
    }

    user.isVerified = true;
    user.verificationToken = undefined;
    user.verificationTokenExpires = undefined;
    await user.save();

    res.json({
      message: 'Email verified successfully'
    });
  } catch (error) {
    console.error('Email verification error:', error);
    res.status(500).json({ message: 'Error verifying email' });
  }
};