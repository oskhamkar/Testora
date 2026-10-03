const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');
require('dotenv').config();

const connectDB = require('./config/db');
const errorHandler = require('./middleware/errorHandler');

// Route imports
const authRoutes = require('./routes/authRoutes');
const adminRoutes = require('./routes/adminRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const topicRoutes = require('./routes/topicRoutes');
const conceptRoutes = require('./routes/conceptRoutes');
const questionRoutes = require('./routes/questionRoutes');
const mockTestRoutes = require('./routes/mockTestRoutes');
const quizRoutes = require('./routes/quizRoutes');
const performanceRoutes = require('./routes/performanceRoutes');

// Connect to DB
connectDB();

const app = express();

// Security & parsing middleware
app.use(helmet());
app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:5173', credentials: true }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Static uploads folder
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/topics', topicRoutes);
app.use('/api/concepts', conceptRoutes);
app.use('/api/questions', questionRoutes);
app.use('/api/mock-tests', mockTestRoutes);
app.use('/api/quizzes', quizRoutes);
app.use('/api/performance', performanceRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ success: true, message: 'Testora API is running', timestamp: new Date() });
});

// 404
app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' });
});

// Error handler
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Testora server running on port ${PORT} [${process.env.NODE_ENV}]`);
});

module.exports = app;
