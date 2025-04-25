const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const validator = require('validator');

const farmDetailsSchema = new mongoose.Schema({
  farmName: {
    type: String,
    required: [true, 'Farm name is required for farmers'],
    trim: true,
    maxlength: [100, 'Farm name cannot exceed 100 characters']
  },
  farmSize: {
    type: String,
    trim: true,
    validate: {
      validator: function(v) {
        return /^\d+(\.\d{1,2})?\s*(acres|hectares)$/i.test(v);
      },
      message: 'Farm size must be a number followed by acres or hectares'
    }
  },
  products: {
    type: [String],
    default: [],
    validate: {
      validator: function(products) {
        return products.every(product => product.trim().length > 0 && product.length <= 50);
      },
      message: 'Product names must be between 1 and 50 characters'
    }
  },
  farmLocation: {
    type: {
      coordinates: {
        type: [Number],
        required: true
      },
      address: {
        type: String,
        required: true,
        trim: true
      }
    },
    required: false
  },
  certifications: {
    type: [{
      name: {
        type: String,
        required: true,
        trim: true
      },
      issuedDate: {
        type: Date,
        required: true
      },
      expiryDate: {
        type: Date,
        required: true
      }
    }],
    default: []
  }
});

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    minlength: [2, 'Name must be at least 2 characters long'],
    maxlength: [50, 'Name cannot exceed 50 characters']
  },
  email: {
    type: String,
    unique: true,
    required: [true, 'Email is required'],
    lowercase: true,
    trim: true,
    validate: [validator.isEmail, 'Please enter a valid email address'],
    index: true
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [8, 'Password must be at least 8 characters long'],
    validate: {
      validator: function(v) {
        return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/.test(v);
      },
      message: 'Password must contain at least one uppercase letter, one lowercase letter, one number and one special character'
    }
  },
  phone: {
    type: String,
    required: [true, 'Phone number is required'],
    validate: {
      validator: function(v) {
        return /^\+?[\d\s-]{10,}$/.test(v);
      },
      message: 'Please enter a valid phone number'
    }
  },
  address: {
    street: {
      type: String,
      required: [true, 'Street address is required'],
      trim: true
    },
    city: {
      type: String,
      required: [true, 'City is required'],
      trim: true
    },
    state: {
      type: String,
      required: [true, 'State is required'],
      trim: true
    },
    pincode: {
      type: String,
      required: [true, 'Pincode is required'],
      validate: {
        validator: function(v) {
          return /^\d{6}$/.test(v);
        },
        message: 'Please enter a valid 6-digit pincode'
      }
    }
  },
  userType: {
    type: String,
    enum: {
      values: ['farmer', 'consumer', 'admin'],
      message: '{VALUE} is not a valid user type'
    },
    default: 'consumer',
    required: true,
    index: true
  },
  farmDetails: {
    type: farmDetailsSchema,
    required: function() {
      return this.userType === 'farmer';
    }
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  verificationToken: String,
  verificationTokenExpires: Date,
  resetPasswordToken: String,
  resetPasswordExpires: Date,
  status: {
    type: String,
    enum: ['active', 'inactive', 'suspended'],
    default: 'active'
  },
  loginAttempts: {
    count: { type: Number, default: 0 },
    lastAttempt: Date,
    lockUntil: Date
  },
  lastLogin: Date,
  deviceInfo: [{
    deviceId: String,
    browser: String,
    os: String,
    lastUsed: Date
  }]
}, { 
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

userSchema.index({ email: 1 });
userSchema.index({ userType: 1 });
userSchema.index({ status: 1 });

userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

userSchema.methods.comparePassword = async function(candidatePassword) {
  try {
    return await bcrypt.compare(candidatePassword, this.password);
  } catch (error) {
    throw new Error('Password comparison failed');
  }
};

userSchema.methods.updateLastLogin = async function(deviceInfo) {
  this.lastLogin = new Date();
  if (deviceInfo) {
    this.deviceInfo.push({
      ...deviceInfo,
      lastUsed: new Date()
    });
  }
  return this.save();
};

userSchema.methods.incrementLoginAttempts = async function() {
  this.loginAttempts.count += 1;
  this.loginAttempts.lastAttempt = new Date();
  
  if (this.loginAttempts.count >= 5) {
    this.loginAttempts.lockUntil = new Date(Date.now() + 30 * 60 * 1000); // Lock for 30 minutes
  }
  
  return this.save();
};

userSchema.methods.resetLoginAttempts = function() {
  this.loginAttempts = {
    count: 0,
    lastAttempt: null,
    lockUntil: null
  };
  return this.save();
};

userSchema.virtual('fullAddress').get(function() {
  return `${this.address.street}, ${this.address.city}, ${this.address.state} - ${this.address.pincode}`;
});

userSchema.virtual('isLocked').get(function() {
  return !!(this.loginAttempts.lockUntil && this.loginAttempts.lockUntil > Date.now());
});

const User = mongoose.model('User', userSchema);
module.exports = User;