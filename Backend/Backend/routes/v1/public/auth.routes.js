const express = require('express');
const router = express.Router();
const authController = require('../../../controllers/auth.controller');

// Login/Register - No authorization needed
router.post('/login', authController.login);
router.post('/register', authController.register);

module.exports = router; 