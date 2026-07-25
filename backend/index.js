require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');

const authRoutes = require('./routes/auth');
const listRoutes = require('./routes/lists');
const itemRoutes = require('./routes/items');
const publicRoutes = require('./routes/public');

const app = express();
const allowedOrigins = (process.env.CLIENT_ORIGIN || 'http://localhost:5173')
  .split(',')
  .map((o) => o.trim());

app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
  })
);
app.use(express.json());

app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

app.use('/api/auth', authRoutes);
app.use('/api/lists', listRoutes);
app.use('/api/lists/:listId/items', itemRoutes);
app.use('/api/public', publicRoutes);


app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});


app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.status || 500).json({ message: err.message || 'Server error' });
});

const PORT = process.env.PORT || 5000;
console.log(`Server is running on port ${PORT}`);

connectDB()




app.listen(5000, () => {
  console.log('Server is running on port 5000');
});

