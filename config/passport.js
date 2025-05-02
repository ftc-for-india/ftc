const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const FacebookStrategy = require('passport-facebook').Strategy;
const User = require('../models/User'); // Adjust path as needed

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

// Google Strategy
passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: "/api/auth/google/callback",
    profileFields: ['id', 'displayName', 'email']
  },
  async (accessToken, refreshToken, profile, done) => {
    try {
      // Check if user already exists
      let user = await User.findOne({ email: profile.emails[0].value });
      
      if (user) {
        return done(null, user);
      }
      
      // Create new user
      user = new User({
        name: profile.displayName,
        email: profile.emails[0].value,
        // Set a default userType, can be updated later
        userType: 'consumer',
        // Generate a random password or handle it differently
        password: Math.random().toString(36).slice(-8) + Math.random().toString(36).slice(-8)
      });
      
      await user.save();
      return done(null, user);
    } catch (error) {
      return done(error, null);
    }
  }
));

// Facebook Strategy
passport.use(new FacebookStrategy({
    clientID: process.env.FACEBOOK_APP_ID,
    clientSecret: process.env.FACEBOOK_APP_SECRET,
    callbackURL: "/api/auth/facebook/callback",
    profileFields: ['id', 'displayName', 'email']
  },
  async (accessToken, refreshToken, profile, done) => {
    try {
      // Facebook might not always provide email
      const email = profile.emails && profile.emails[0] ? profile.emails[0].value : `${profile.id}@facebook.com`;
      
      // Check if user already exists
      let user = await User.findOne({ email });
      
      if (user) {
        return done(null, user);
      }
      
      // Create new user
      user = new User({
        name: profile.displayName,
        email: email,
        // Set a default userType, can be updated later
        userType: 'consumer',
        // Generate a random password or handle it differently
        password: Math.random().toString(36).slice(-8) + Math.random().toString(36).slice(-8)
      });
      
      await user.save();
      return done(null, user);
    } catch (error) {
      return done(error, null);
    }
  }
));

module.exports = passport;