const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const authMiddleware = require('../middleware/authMiddleware');

// Register route
router.post('/register', authController.register);

// Login route
router.post('/login', authController.login);

// Protected routes examples
// Route accessible to any authenticated user
router.get('/profile', authMiddleware(), (req, res) => {
  res.json({
    message: 'Profile accessed successfully',
    user: req.user
  });
});

// Route accessible only to users with 'user' role
router.get('/user-dashboard', authMiddleware(['user']), (req, res) => {
  res.json({
    message: 'User dashboard accessed successfully',
    user: req.user
  });
});

// Route accessible only to users with 'admin' role
router.get('/admin-dashboard', authMiddleware(['admin']), (req, res) => {
  res.json({
    message: 'Admin dashboard accessed successfully',
    user: req.user
  });
});

// Route accessible to both 'user' and 'admin' roles
router.get('/shared-content', authMiddleware(['user', 'admin']), (req, res) => {
  res.json({
    message: 'Shared content accessed successfully',
    user: req.user
  });
});

module.exports = router;