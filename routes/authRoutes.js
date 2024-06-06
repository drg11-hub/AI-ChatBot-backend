const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const nodemailer = require('nodemailer');
const { check, validationResult } = require('express-validator');
const { authMiddleware } = require('../routes/authMiddleware');
const router = express.Router();

// Nodemailer setup for sending email confirmation
const transporter = nodemailer.createTransport({
  service: 'Gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Signup Route
router.post(
  '/signup',
  [
    check('name', 'Username is required').not().isEmpty(),
    check('name', 'Username must be alphanumeric and 5-15 characters long')
      .isLength({ min: 5, max: 15 })
      .isAlphanumeric(),
    check('email', 'Please include a valid email').isEmail(),
    check('password', 'Password must be 6-15 characters long and include at least one numeric digit and one special character')
      .isLength({ min: 6, max: 15 })
      .matches(/\d/)
      .matches(/[!@#$%^&*(),.?":{}|<>]/),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array().map(err => err.msg) });
    }

    const { name, email, password } = req.body;

    try {
      let user = await User.findOne({ email });
      if (user) {
        return res.status(400).json({ errors: ['User already exists'] });
      }

      user = new User({
        name,
        email,
        password,
      });

      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(password, salt);

      await user.save();

      const payload = {
        user: {
          id: user.id,
        },
      };

      const token = jwt.sign(payload, process.env.JWT_SECRET, {
        expiresIn: '1h',
      });

      // Send email confirmation
      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: user.email,
        subject: 'Account Registration Successful',
        text: `Hello ${user.name},\n\nYour account has been successfully created!\nWe hope you enjoy your conversation with our AI Bot and our product adds value to your needs.\n\nThank You!`,
      };

      transporter.sendMail(mailOptions, (err, info) => {
        if (err) {
          console.log(err);
          return res.status(500).json({ errors: ['Email could not be sent'] });
        }
        res.status(201).json({ token, message: 'Signup successful!' });
      });
    } catch (error) {
      res.status(500).json({ errors: ['Server error'] });
    }
  }
);

// Login Route
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ errors: ['Invalid email or password'] });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ errors: ['Invalid email or password'] });
    }

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: '1h',
    });

    res.json({ token, user });
  } catch (error) {
    res.status(500).json({ errors: ['Server error'] });
  }
});

// Get authenticated user details
router.get('/me', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password'); // Exclude password
    if (!user) {
      return res.status(404).json({ errors: ['User not found'] });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ errors: ['Server error'] });
  }
});

// Reset Password Route
router.post('/reset-password', async (req, res) => {
  const { email, newPassword } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ errors: ['User not found'] });
    }

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    await user.save();

    res.status(200).json({ message: 'Password reset successful!' });
  } catch (error) {
    res.status(500).json({ errors: ['Server error'] });
  }
});

module.exports = router;

// ----------google signup code: