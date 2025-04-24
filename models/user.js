const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const validator = require('validator');

// Define farm details schema separately for better organization
const farmDetailsSchema = new mongoose.Schema({
  farmName: {
    type: String,
    required: [true, 'Farm name is required for farmers'],
    trim: true
  },
  farmSize: {
    type: String,
    trim: true
  },
  products: {
    type: [String],
    default: [],
    validate: {
      validator: function(products) {
        return products.every(product => product.trim().length > 0);
      },
      message: 'Product names cannot be empty'
    }
  },
  farmLocation: {
    type: String,
    trim: true
  },
  certifications: {
    type: [String],
    default: []
  }
});

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    minlength: [2, 'Name must be at least 2 characters long']
  },
  email: {
    type: String,
    unique: true,
    required: [true, 'Email is required'],
    lowercase: true,
    trim: true,
    validate: [validator.isEmail, 'Please enter a valid email address']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters long']
  },
  phone: {
    type: String,
    required: [true, 'Phone number is required'],
    validate: {
      validator: function(v) {
        return /^\d{10}$/.test(v);
      },
      message: props => `${props.value} is not a valid phone number! Must be 10 digits.`
    }
  },
  address: {
    type: String,
    required: [true, 'Address is required'],
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
      message: props => `${props.value} is not a valid pincode! Must be 6 digits.`
    }
  },
  userType: {
    type: String,
    enum: {
      values: ['farmer', 'consumer', 'admin'],
      message: '{VALUE} is not a valid user type'
    },
    default: 'consumer',
    required: true
  },
  farmDetails: {
    type: farmDetailsSchema,
    required: function() {
      return this.userType === 'farmer';
    },
    validate: {
      validator: function(v) {
        return this.userType !== 'farmer' || (v && v.farmName);
      },
      message: 'Farm details are required for farmer accounts'
    }
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'suspended'],
    default: 'active'
  },
  lastLogin: {
    type: Date
  }
}, { 
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Index for better query performance
userSchema.index({ email: 1 });
userSchema.index({ userType: 1 });

// Pre-save middleware for password hashing
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

// Method to compare password for login
userSchema.methods.comparePassword = async function(candidatePassword) {
  try {
    return await bcrypt.compare(candidatePassword, this.password);
  } catch (error) {
    throw new Error('Password comparison failed');
  }
};

// Method to update last login
userSchema.methods.updateLastLogin = function() {
  this.lastLogin = new Date();
  return this.save();
};

// Virtual for full address
userSchema.virtual('fullAddress').get(function() {
  return `${this.address}, ${this.city}, ${this.state} - ${this.pincode}`;
});

const User = mongoose.model('User', userSchema);
module.exports = User;