require('dotenv').config();
const express = require('express');
const path = require('path');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const connectDB = require('./config/db');
const { errorHandler, notFound } = require('./middleware/errorHandler');
const { apiLimiter } = require('./middleware/rateLimiter');

// Routes
const authRoutes = require('./routes/auth');
const urlRoutes = require('./routes/urls');
const analyticsRoutes = require('./routes/analytics');
const redirectRoutes = require('./routes/redirect');

const app = express();

// ─── Connect Database ─────────────────────────────────────────────────────────
connectDB();

// ─── Security Headers ─────────────────────────────────────────────────────────
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
    contentSecurityPolicy: false, // Disable for API server
  })
);

// ─── CORS ─────────────────────────────────────────────────────────────────────
const getOrigins = () => {
  const envOrigins = (process.env.FRONTEND_URL || '')
    .split(',')
    .map((url) => url.trim())
    .filter(Boolean);

  const defaultOrigins = [
    'http://localhost:5173',
    'http://localhost:3000',
    'http://localhost:5001',
    'http://localhost:5000',
  ];

  return [...new Set([...envOrigins, ...defaultOrigins])];
};

app.use(
  cors({
    origin: (origin, callback) => {
      const allowedOrigins = getOrigins();
      // Allow requests with no origin (curl, Postman, server-to-server)
      // or matching explicit allowedOrigins or any Vercel deployment preview domain
      if (
        !origin ||
        allowedOrigins.includes(origin) ||
        (typeof origin === 'string' && origin.endsWith('.vercel.app'))
      ) {
        callback(null, true);
      } else {
        callback(new Error(`Not allowed by CORS: ${origin}`));
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

// ─── Body Parsing ─────────────────────────────────────────────────────────────
app.use(express.json({ limit: '10kb' })); // Limit payload size
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

// ─── Logging ─────────────────────────────────────────────────────────────────
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// ─── Global Rate Limiter ─────────────────────────────────────────────────────
app.use('/api', apiLimiter);

// ─── Health Check ─────────────────────────────────────────────────────────────
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'Smart URL Shortener API is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
  });
});

// ─── API Routes ───────────────────────────────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/urls', urlRoutes);
app.use('/api/analytics', analyticsRoutes);

// ─── Redirect Route (MUST be last — catches /:shortCode) ──────────────────────
app.use('/', redirectRoutes);

// ─── Serve Frontend (Production) ────────────────────────────────────────────────
if (process.env.NODE_ENV === 'production' || process.env.SERVE_FRONTEND === 'true') {
  app.use(express.static(path.join(__dirname, '../frontend/dist')));
  
  // React Router catch-all
  app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, '../frontend/dist/index.html'));
  });
} else {
  // ─── 404 & Error Handlers ─────────────────────────────────────────────────────
  app.use(notFound);
}

app.use(errorHandler);

// ─── Start Server ─────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => {
  console.log(`🚀 Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('❌ Unhandled Rejection:', err.message);
  server.close(() => process.exit(1));
});

module.exports = app;
