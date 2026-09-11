const rateLimit = require('express-rate-limit');

/**
 * General API rate limiter: 100 requests per 15 minutes
 */
const apiLimiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000,
  max: parseInt(process.env.RATE_LIMIT_MAX) || 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many requests. Please try again later.',
  },
  skip: (req) => process.env.NODE_ENV === 'test',
});

/**
 * Strict limiter for auth routes: 20 requests per 15 minutes
 */
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many auth attempts. Please try again in 15 minutes.',
  },
  skip: (req) => process.env.NODE_ENV === 'test',
});

/**
 * URL creation limiter: 30 URLs per 15 minutes per user
 */
const urlCreateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: parseInt(process.env.URL_CREATE_LIMIT) || 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many URLs created. Please wait before creating more.',
  },
  keyGenerator: (req) => req.user?.id || req.ip,
  skip: (req) => process.env.NODE_ENV === 'test',
});

/**
 * Redirect limiter: prevent excessive redirect abuse
 */
const redirectLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 60,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many redirect requests. Slow down!',
  },
  skip: (req) => process.env.NODE_ENV === 'test',
});

module.exports = { apiLimiter, authLimiter, urlCreateLimiter, redirectLimiter };
