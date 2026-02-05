const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Helper function to generate JWT token
const generateToken = (user) => {
  return jwt.sign(
    {
      id: user._id,
      username: user.username,
      email: user.email,
      role: user.role
    },
    process.env.JWT_SECRET || 'your-secret-key',
    { expiresIn: '24h' }
  );
};

const authController = {
  // Register a new user
  register: async (req, res) => {
    try {
      const { username, email, password, confirmPassword } = req.body;

      // Basic validation
      if (!username || !email || !password) {
        return res.status(400).json({ message: 'All fields are required' });
      }

      if (password !== confirmPassword) {
        return res.status(400).json({ message: 'Passwords do not match' });
      }

      // Check if user already exists
      const existingUser = await User.findOne({
        $or: [{ email: email.toLowerCase() }, { username: username }]
      });

      if (existingUser) {
        return res.status(400).json({ message: 'User already exists with this email or username' });
      }

      // Hash password
      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash(password, saltRounds);

      // Create new user
      const newUser = new User({
        username: username.trim(),
        email: email.toLowerCase().trim(),
        password: hashedPassword,
        role: 'user' // Default role
      });

      await newUser.save();

      // Generate JWT token
      const token = generateToken(newUser);

      // Return success response (don't send password back)
      res.status(201).json({
        message: 'User registered successfully',
        token: token,
        user: {
          id: newUser._id,
          username: newUser.username,
          email: newUser.email,
          role: newUser.role
        }
      });

    } catch (error) {
      console.error('Registration error:', error);
      res.status(500).json({ message: 'Server error during registration' });
    }
  },

  // Login function (placeholder for completeness)
  login: async (req, res) => {
    try {
      const { username, password } = req.body;

      // Find user by username or email
      const user = await User.findOne({
        $or: [{ email: username.toLowerCase() }, { username: username }]
      });

      if (!user) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }

      // Check password
      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }

      // Generate JWT token
      const token = generateToken(user);

      // Return success response
      res.status(200).json({
        message: 'Login successful',
        token: token,
        user: {
          id: user._id,
          username: user.username,
          email: user.email,
          role: user.role
        }
      });

    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({ message: 'Server error during login' });
    }
  }
};

module.exports = authController;