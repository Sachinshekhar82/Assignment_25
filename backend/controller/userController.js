const User = require('../models/User');
const jwt = require('jsonwebtoken');exports.registerUser = async (req, res) => {
 const { name,email, password } = req.body;
 const user = new User({ name,email, password });
 await user.save();
 res.send('User registered');
};exports.loginUser = async (req, res) => {
 const { email, password } = req.body;
 const user = await User.findOne({ email });
 if (!user || user.password !== password) {
 return res.status(401).send('Invalid credentials');
 }const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN });
 res.send({ message: 'Login successful', token });
};

