import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Import routes
import routes from './routes/index.js';

const app = express();

/**
 * Middleware
 */
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.use(cookieParser());

/**
 * Routes
 */
app.use('/api', routes);

/**
 * Health Check
 */
app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Server is running',
  });
});

/**
 * 404 Handler
 */
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
  });
});

/**
 * Error Handler
 */
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Server error',
  });
});

export default app;
