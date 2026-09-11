const { findUrlByShortCode } = require('../services/urlService');
const { recordVisit } = require('../services/analyticsService');

const FRONTEND_URL = () => process.env.FRONTEND_URL || 'http://localhost:5173';

/**
 * GET /:shortCode
 * Fast redirect endpoint — must be as quick as possible.
 * Order of operations:
 *   1. Find URL by shortCode
 *   2. Check existence
 *   3. Check expiration
 *   4. Check password protection
 *   5. Fire analytics recording (async, non-blocking)
 *   6. Redirect
 */
const redirect = async (req, res, next) => {
  try {
    const { shortCode } = req.params;

    // Fast lookup (indexed, lean query)
    const url = await findUrlByShortCode(shortCode, false);

    // 1. Not found
    if (!url) {
      return res.redirect(`${FRONTEND_URL()}/not-found`);
    }

    // 2. Inactive
    if (!url.isActive) {
      return res.redirect(`${FRONTEND_URL()}/not-found`);
    }

    // 3. Expired
    if (url.expiresAt && new Date() > new Date(url.expiresAt)) {
      return res.redirect(`${FRONTEND_URL()}/expired?code=${shortCode}`);
    }

    // 4. Password protected
    if (url.isPasswordProtected) {
      return res.redirect(`${FRONTEND_URL()}/gate/${shortCode}`);
    }

    // 5. Fire analytics asynchronously — do NOT await here
    recordVisit({ urlId: url._id, userId: url.userId, req }).catch(() => {});

    // 6. Redirect to original URL
    return res.redirect(301, url.originalUrl);
  } catch (error) {
    next(error);
  }
};

module.exports = { redirect };
