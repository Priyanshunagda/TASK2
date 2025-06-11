// routes/authRoutes.js (partial login logic)
const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Role = require('../models/Role');

router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email }).populate({
      path: 'roleId',
      populate: { path: 'permissions' },
    });

    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign({ id: user._id, roleId: user.roleId._id }, process.env.JWT_SECRET, {
      expiresIn: '1d'
    });

    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: {
          name: user.roleId.name,
          permissions: user.roleId.permissions
        }
      }
    });
  } catch (err) {
    res.status(500).json({ error: 'Server error during login' });
  }
});

module.exports = router;
