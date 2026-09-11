const crypto = require('crypto');

/**
 * Generate a random short code using crypto (no ESM dependency needed)
 * @param {number} length - Length of the short code (default 7)
 * @returns {string}
 */
const generateShortCode = (length = 7) => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const bytes = crypto.randomBytes(length);
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars[bytes[i] % chars.length];
  }
  return result;
};

/**
 * Hash an IP address for privacy-respecting analytics storage
 * @param {string} ip
 * @returns {string}
 */
const hashIp = (ip) => {
  if (!ip) return 'unknown';
  return crypto.createHash('sha256').update(ip + (process.env.JWT_SECRET || 'salt')).digest('hex').slice(0, 16);
};

/**
 * Validate URL format
 * @param {string} url
 * @returns {boolean}
 */
const isValidUrl = (url) => {
  try {
    const parsed = new URL(url);
    return ['http:', 'https:'].includes(parsed.protocol);
  } catch {
    return false;
  }
};

/**
 * Validate alias format (alphanumeric + hyphens + underscores)
 * @param {string} alias
 * @returns {boolean}
 */
const isValidAlias = (alias) => {
  return /^[a-zA-Z0-9_-]{3,30}$/.test(alias);
};

/**
 * Extract hostname/domain from a URL for display
 * @param {string} url
 * @returns {string}
 */
const extractDomain = (url) => {
  try {
    return new URL(url).hostname;
  } catch {
    return url;
  }
};

/**
 * Get real client IP from request (handles proxies)
 * @param {object} req - Express request object
 * @returns {string}
 */
const getClientIp = (req) => {
  return (
    req.headers['x-forwarded-for']?.split(',')[0]?.trim() ||
    req.headers['x-real-ip'] ||
    req.connection?.remoteAddress ||
    req.ip ||
    'unknown'
  );
};

/**
 * Extract referrer from request headers
 * @param {object} req
 * @returns {string}
 */
const getReferrer = (req) => {
  const referer = req.headers.referer || req.headers.referrer;
  if (!referer) return 'Direct';
  try {
    return new URL(referer).hostname || 'Direct';
  } catch {
    return 'Direct';
  }
};

/**
 * Format a date to YYYY-MM-DD string
 * @param {Date} date
 * @returns {string}
 */
const formatDate = (date) => {
  return new Date(date).toISOString().split('T')[0];
};

/**
 * Create an AppError with status code
 */
class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = {
  generateShortCode,
  hashIp,
  isValidUrl,
  isValidAlias,
  extractDomain,
  getClientIp,
  getReferrer,
  formatDate,
  AppError,
};
