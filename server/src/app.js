require('dotenv').config();
const express = require('express');
const cors = require('cors');

// Route Imports
const authRoutes = require('./routes/auth.routes');
const userRoutes = require('./routes/user.routes');
const storeRoutes = require('./routes/store.routes');
const ratingRoutes = require('./routes/rating.routes');
const dashboardRoutes = require('./routes/dashboard.routes');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({ origin: true, credentials: true }));
app.use(express.json());

// Health check routes
app.get('/', (req, res) => {
  res.json({ status: 'ok', message: 'Store Rating Platform API is running' });
});

app.get('/api/v1', (req, res) => {
  res.json({ status: 'ok', message: 'Store Rating Platform API v1 is active' });
});

// API Routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/stores', storeRoutes);
app.use('/api/v1/ratings', ratingRoutes);
app.use('/api/v1/dashboard', dashboardRoutes);

app.use((err, req, res, next) => {
  console.error('[Global Error]:', err);
  res.status(500).json({ message: 'An unexpected error occurred' });
});

if (!process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

module.exports = app;