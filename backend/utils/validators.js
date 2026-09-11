const { body, param, query, validationResult } = require('express-validator');

/**
 * Middleware to check validation results and return errors
 */
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array().map((e) => ({ field: e.path, message: e.msg })),
    });
  }
  next();
};

// --- Auth validators ---
const registerValidator = [
  body('name')
    .trim()
    .notEmpty().withMessage('Name is required')
    .isLength({ max: 50 }).withMessage('Name cannot exceed 50 characters'),
  body('email')
    .trim()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Please provide a valid email')
    .normalizeEmail(),
  body('password')
    .notEmpty().withMessage('Password is required')
    .isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  validate,
];

const loginValidator = [
  body('email')
    .trim()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Please provide a valid email')
    .normalizeEmail(),
  body('password')
    .notEmpty().withMessage('Password is required'),
  validate,
];

// --- URL validators ---
const createUrlValidator = [
  body('originalUrl')
    .trim()
    .notEmpty().withMessage('Original URL is required')
    .isURL({ protocols: ['http', 'https'], require_protocol: true })
    .withMessage('Please provide a valid URL starting with http:// or https://'),
  body('customAlias')
    .optional({ nullable: true, checkFalsy: true })
    .trim()
    .matches(/^[a-zA-Z0-9_-]{3,30}$/)
    .withMessage('Alias must be 3-30 characters (letters, numbers, hyphens, underscores)'),
  body('password')
    .optional({ nullable: true, checkFalsy: true })
    .isLength({ min: 4 }).withMessage('Link password must be at least 4 characters'),
  body('expiresAt')
    .optional({ nullable: true, checkFalsy: true })
    .isISO8601().withMessage('Invalid expiration date')
    .custom((value) => {
      if (new Date(value) <= new Date()) {
        throw new Error('Expiration date must be in the future');
      }
      return true;
    }),
  body('title')
    .optional({ nullable: true, checkFalsy: true })
    .trim()
    .isLength({ max: 100 }).withMessage('Title cannot exceed 100 characters'),
  validate,
];

const updateUrlValidator = [
  body('title')
    .optional({ nullable: true, checkFalsy: true })
    .trim()
    .isLength({ max: 100 }).withMessage('Title cannot exceed 100 characters'),
  body('password')
    .optional({ nullable: true })
    .custom((value) => {
      if (value !== null && value !== '' && value.length < 4) {
        throw new Error('Link password must be at least 4 characters');
      }
      return true;
    }),
  body('expiresAt')
    .optional({ nullable: true })
    .custom((value) => {
      if (value && new Date(value) <= new Date()) {
        throw new Error('Expiration date must be in the future');
      }
      return true;
    }),
  validate,
];

const verifyPasswordValidator = [
  body('password').notEmpty().withMessage('Password is required'),
  validate,
];

module.exports = {
  validate,
  registerValidator,
  loginValidator,
  createUrlValidator,
  updateUrlValidator,
  verifyPasswordValidator,
};
