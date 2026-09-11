const UAParser = require('ua-parser-js');
const axios = require('axios');
const Analytics = require('../models/Analytics');
const Url = require('../models/Url');
const { hashIp, getClientIp, getReferrer } = require('../utils/helpers');

/**
 * Parse device type from UA parser result
 * @param {object} uaResult
 * @returns {string}
 */
const parseDeviceType = (uaResult) => {
  const deviceType = uaResult.device?.type;
  if (!deviceType) return 'desktop';
  if (deviceType === 'mobile') return 'mobile';
  if (deviceType === 'tablet') return 'tablet';
  return 'desktop';
};

/**
 * Get country from IP address using ip-api.com (free, no key needed)
 * Non-blocking — returns defaults if it fails or times out
 * @param {string} ip
 * @returns {Promise<{country: string, city: string}>}
 */
const getGeoLocation = async (ip) => {
  // Skip localhost/private IPs
  if (!ip || ip === '::1' || ip === '127.0.0.1' || ip.startsWith('192.168.') || ip.startsWith('10.')) {
    return { country: 'Local', city: 'Local' };
  }

  try {
    const response = await axios.get(`http://ip-api.com/json/${ip}?fields=country,city,status`, {
      timeout: 1500, // 1.5s max — redirect must stay fast
    });
    if (response.data?.status === 'success') {
      return {
        country: response.data.country || 'Unknown',
        city: response.data.city || 'Unknown',
      };
    }
    return { country: 'Unknown', city: 'Unknown' };
  } catch {
    return { country: 'Unknown', city: 'Unknown' };
  }
};

/**
 * Record a URL visit asynchronously (doesn't block redirect)
 * @param {object} params
 */
const recordVisit = async ({ urlId, userId, req }) => {
  try {
    const ip = getClientIp(req);
    const hashedIp = hashIp(ip);
    const referrer = getReferrer(req);
    const userAgent = req.headers['user-agent'] || '';

    // Parse UA
    const parser = new UAParser(userAgent);
    const uaResult = parser.getResult();
    const device = parseDeviceType(uaResult);
    const browser = uaResult.browser?.name || 'Unknown';
    const os = uaResult.os?.name || 'Unknown';

    // Get geo (non-blocking — fire and forget with result)
    const geoPromise = getGeoLocation(ip);

    // Check if this visitor (hashed IP) has visited this URL today
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const [isNewVisitor, geo] = await Promise.all([
      Analytics.countDocuments({
        urlId,
        hashedIp,
        timestamp: { $gte: todayStart },
      }).then((count) => count === 0),
      geoPromise,
    ]);

    // Save analytics record
    await Analytics.create({
      urlId,
      userId,
      hashedIp,
      referrer,
      country: geo.country,
      city: geo.city,
      device,
      browser,
      os,
      userAgent: userAgent.slice(0, 500), // cap length
      timestamp: new Date(),
    });

    // Increment click counter and optionally unique visitor counter
    const updateOp = isNewVisitor
      ? { $inc: { clicks: 1, uniqueVisitors: 1 } }
      : { $inc: { clicks: 1 } };

    await Url.findByIdAndUpdate(urlId, updateOp);
  } catch (err) {
    // Analytics failures should never break the redirect
    console.error('Analytics recording error:', err.message);
  }
};

module.exports = { recordVisit };
