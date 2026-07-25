const User = require('../models/User');
const jwt = require('jsonwebtoken');exports.registerUser = async (req, res) => {
 const { username, password } = req.body;
 const user = new User({ username, password });
 await user.save();
 res.send('User registered');
};exports.loginUser = async (req, res) => {
 const { username, password } = req.body;
 const user = await User.findOne({ username });
 if (!user || user.password !== password) {
 return res.status(401).send('Invalid credentials');
 }const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN });
 res.send({ message: 'Login successful', token });
};

