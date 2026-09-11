const Url = require('../models/Url');
const { generateShortCode } = require('../utils/helpers');

/**
 * Generate a unique short code that doesn't collide with existing ones
 * @param {number} length
 * @param {number} maxAttempts
 * @returns {Promise<string>}
 */
const generateUniqueShortCode = async (length = 7, maxAttempts = 10) => {
  for (let i = 0; i < maxAttempts; i++) {
    const code = generateShortCode(length);
    const existing = await Url.findOne({ shortCode: code }).lean();
    if (!existing) return code;
  }
  // Try with longer code if we're hitting collisions (shouldn't happen in practice)
  return generateShortCode(length + 1);
};

/**
 * Check if a custom alias is available
 * @param {string} alias
 * @param {string|null} excludeUrlId - ID to exclude from check (for updates)
 * @returns {Promise<boolean>}
 */
const isAliasAvailable = async (alias, excludeUrlId = null) => {
  const query = { shortCode: alias };
  if (excludeUrlId) {
    query._id = { $ne: excludeUrlId };
  }
  const existing = await Url.findOne(query).lean();
  return !existing;
};

/**
 * Find URL by shortCode with lean query (fast for redirects)
 * Selects password field explicitly since it's excluded by default
 * @param {string} shortCode
 * @param {boolean} includePassword - whether to include hashed password
 * @returns {Promise<object|null>}
 */
const findUrlByShortCode = async (shortCode, includePassword = false) => {
  const query = Url.findOne({ shortCode });
  if (includePassword) {
    query.select('+password');
  }
  return query.lean({ virtuals: true });
};

module.exports = {
  generateUniqueShortCode,
  isAliasAvailable,
  findUrlByShortCode,
};
