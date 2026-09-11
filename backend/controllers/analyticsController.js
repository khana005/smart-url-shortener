const Analytics = require('../models/Analytics');
const Url = require('../models/Url');
const { AppError, formatDate } = require('../utils/helpers');

/**
 * GET /api/analytics/dashboard — Aggregate stats for user's dashboard
 */
const getDashboard = async (req, res, next) => {
  try {
    const userId = req.user._id;

    const [totalLinks, urlStats, topLinks, recentLinks, clicksOverTime] = await Promise.all([
      // Total links count
      Url.countDocuments({ userId }),

      // Aggregate total clicks + unique visitors across all user URLs
      Url.aggregate([
        { $match: { userId } },
        {
          $group: {
            _id: null,
            totalClicks: { $sum: '$clicks' },
            totalUniqueVisitors: { $sum: '$uniqueVisitors' },
          },
        },
      ]),

      // Top 5 links by clicks
      Url.find({ userId })
        .sort({ clicks: -1 })
        .limit(5)
        .lean({ virtuals: true }),

      // 5 most recent links
      Url.find({ userId })
        .sort({ createdAt: -1 })
        .limit(5)
        .lean({ virtuals: true }),

      // Clicks over last 30 days
      Analytics.aggregate([
        {
          $match: {
            userId,
            timestamp: {
              $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
            },
          },
        },
        {
          $group: {
            _id: {
              $dateToString: { format: '%Y-%m-%d', date: '$timestamp' },
            },
            clicks: { $sum: 1 },
          },
        },
        { $sort: { _id: 1 } },
        { $project: { date: '$_id', clicks: 1, _id: 0 } },
      ]),
    ]);

    const BASE_URL = process.env.BASE_URL || 'http://localhost:5000';

    res.json({
      success: true,
      data: {
        totalLinks,
        totalClicks: urlStats[0]?.totalClicks || 0,
        totalUniqueVisitors: urlStats[0]?.totalUniqueVisitors || 0,
        topLinks: topLinks.map((u) => ({
          ...u,
          shortUrl: `${BASE_URL}/${u.shortCode}`,
        })),
        recentLinks: recentLinks.map((u) => ({
          ...u,
          shortUrl: `${BASE_URL}/${u.shortCode}`,
        })),
        clicksOverTime,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/analytics/:urlId — Detailed analytics for a single URL
 */
const getUrlAnalytics = async (req, res, next) => {
  try {
    const { urlId } = req.params;
    const { days = 30 } = req.query;

    // Verify ownership
    const url = await Url.findOne({ _id: urlId, userId: req.user._id }).lean({ virtuals: true });
    if (!url) {
      return next(new AppError('URL not found.', 404));
    }

    const daysNum = Math.min(90, Math.max(1, parseInt(days)));
    const startDate = new Date(Date.now() - daysNum * 24 * 60 * 60 * 1000);
    const matchQuery = { urlId: url._id, timestamp: { $gte: startDate } };
    const allTimeMatch = { urlId: url._id };

    const [
      clicksOverTime,
      deviceBreakdown,
      browserBreakdown,
      osBreakdown,
      topReferrers,
      topCountries,
      recentClicks,
      uniqueVisitorsCount,
    ] = await Promise.all([
      // Clicks per day
      Analytics.aggregate([
        { $match: matchQuery },
        {
          $group: {
            _id: { $dateToString: { format: '%Y-%m-%d', date: '$timestamp' } },
            clicks: { $sum: 1 },
          },
        },
        { $sort: { _id: 1 } },
        { $project: { date: '$_id', clicks: 1, _id: 0 } },
      ]),

      // Device breakdown
      Analytics.aggregate([
        { $match: allTimeMatch },
        { $group: { _id: '$device', value: { $sum: 1 } } },
        { $project: { name: '$_id', value: 1, _id: 0 } },
        { $sort: { value: -1 } },
      ]),

      // Browser breakdown
      Analytics.aggregate([
        { $match: allTimeMatch },
        { $group: { _id: '$browser', value: { $sum: 1 } } },
        { $project: { name: '$_id', value: 1, _id: 0 } },
        { $sort: { value: -1 } },
        { $limit: 8 },
      ]),

      // OS breakdown
      Analytics.aggregate([
        { $match: allTimeMatch },
        { $group: { _id: '$os', value: { $sum: 1 } } },
        { $project: { name: '$_id', value: 1, _id: 0 } },
        { $sort: { value: -1 } },
        { $limit: 8 },
      ]),

      // Top referrers
      Analytics.aggregate([
        { $match: allTimeMatch },
        { $group: { _id: '$referrer', count: { $sum: 1 } } },
        { $project: { referrer: '$_id', count: 1, _id: 0 } },
        { $sort: { count: -1 } },
        { $limit: 10 },
      ]),

      // Top countries
      Analytics.aggregate([
        { $match: allTimeMatch },
        { $group: { _id: '$country', value: { $sum: 1 } } },
        { $project: { name: '$_id', value: 1, _id: 0 } },
        { $sort: { value: -1 } },
        { $limit: 10 },
      ]),

      // Recent 20 clicks
      Analytics.find(allTimeMatch)
        .sort({ timestamp: -1 })
        .limit(20)
        .select('device browser os country referrer timestamp')
        .lean(),

      // Unique visitors (distinct hashed IPs)
      Analytics.aggregate([
        { $match: allTimeMatch },
        { $group: { _id: '$hashedIp' } },
        { $count: 'unique' },
      ]),
    ]);

    const BASE_URL = process.env.BASE_URL || 'http://localhost:5000';

    res.json({
      success: true,
      data: {
        url: {
          ...url,
          shortUrl: `${BASE_URL}/${url.shortCode}`,
        },
        totalClicks: url.clicks,
        uniqueVisitors: uniqueVisitorsCount[0]?.unique || 0,
        clicksOverTime,
        deviceBreakdown,
        browserBreakdown,
        osBreakdown,
        topReferrers,
        topCountries,
        recentClicks,
        period: `${daysNum} days`,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { getDashboard, getUrlAnalytics };
