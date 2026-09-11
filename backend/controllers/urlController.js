const Url = require('../models/Url');
const { generateUniqueShortCode, isAliasAvailable, findUrlByShortCode } = require('../services/urlService');
const { generateQRCode, generateQRCodeBuffer } = require('../services/qrService');
const { AppError, isValidUrl } = require('../utils/helpers');

const BASE_URL = () => process.env.BASE_URL || 'http://localhost:5000';

/**
 * POST /api/urls — Create a new short URL
 */
const createUrl = async (req, res, next) => {
  try {
    const { originalUrl, customAlias, password, expiresAt, title } = req.body;

    // Determine short code
    let shortCode;
    if (customAlias) {
      const available = await isAliasAvailable(customAlias);
      if (!available) {
        return next(new AppError('This custom alias is already taken. Please choose another.', 409));
      }
      shortCode = customAlias;
    } else {
      shortCode = await generateUniqueShortCode();
    }

    // Build URL document
    const urlData = {
      shortCode,
      originalUrl,
      title: title || '',
      userId: req.user._id,
      expiresAt: expiresAt ? new Date(expiresAt) : null,
    };

    if (password) {
      urlData.password = password; // Model pre-save hook will hash it
    }

    const url = await Url.create(urlData);

    // Generate QR for the response
    const shortUrl = `${BASE_URL()}/${shortCode}`;
    const qrDataUrl = await generateQRCode(shortUrl);

    res.status(201).json({
      success: true,
      message: 'Short URL created successfully.',
      url: {
        id: url._id,
        shortCode: url.shortCode,
        shortUrl,
        originalUrl: url.originalUrl,
        title: url.title,
        isPasswordProtected: url.isPasswordProtected,
        expiresAt: url.expiresAt,
        clicks: url.clicks,
        uniqueVisitors: url.uniqueVisitors,
        status: url.status,
        createdAt: url.createdAt,
        qrCode: qrDataUrl,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/urls — Get user's URLs with pagination, search, sort
 */
const getUserUrls = async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 10,
      search = '',
      sortBy = 'createdAt',
      order = 'desc',
      status = '',
    } = req.query;

    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(50, Math.max(1, parseInt(limit)));
    const skip = (pageNum - 1) * limitNum;

    // Build filter
    const filter = { userId: req.user._id };
    if (search) {
      filter.$or = [
        { shortCode: { $regex: search, $options: 'i' } },
        { originalUrl: { $regex: search, $options: 'i' } },
        { title: { $regex: search, $options: 'i' } },
      ];
    }

    // Status filter (active/expired/inactive)
    if (status === 'active') {
      filter.isActive = true;
      filter.$or = [{ expiresAt: null }, { expiresAt: { $gt: new Date() } }];
    } else if (status === 'expired') {
      filter.expiresAt = { $lte: new Date() };
    } else if (status === 'inactive') {
      filter.isActive = false;
    }

    const sortOrder = order === 'asc' ? 1 : -1;
    const validSortFields = ['createdAt', 'clicks', 'uniqueVisitors', 'title'];
    const sortField = validSortFields.includes(sortBy) ? sortBy : 'createdAt';

    const [urls, total] = await Promise.all([
      Url.find(filter)
        .sort({ [sortField]: sortOrder })
        .skip(skip)
        .limit(limitNum)
        .lean({ virtuals: true }),
      Url.countDocuments(filter),
    ]);

    const baseUrl = BASE_URL();

    res.json({
      success: true,
      data: {
        urls: urls.map((u) => ({
          ...u,
          shortUrl: `${baseUrl}/${u.shortCode}`,
        })),
        pagination: {
          currentPage: pageNum,
          totalPages: Math.ceil(total / limitNum),
          totalItems: total,
          itemsPerPage: limitNum,
          hasNextPage: pageNum < Math.ceil(total / limitNum),
          hasPrevPage: pageNum > 1,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/urls/:id — Get single URL detail
 */
const getUrlById = async (req, res, next) => {
  try {
    const url = await Url.findOne({
      _id: req.params.id,
      userId: req.user._id,
    }).lean({ virtuals: true });

    if (!url) {
      return next(new AppError('URL not found.', 404));
    }

    const shortUrl = `${BASE_URL()}/${url.shortCode}`;
    const qrCode = await generateQRCode(shortUrl);

    res.json({
      success: true,
      url: { ...url, shortUrl, qrCode },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * PUT /api/urls/:id — Update a URL
 */
const updateUrl = async (req, res, next) => {
  try {
    const { title, password, expiresAt, isActive } = req.body;

    const url = await Url.findOne({
      _id: req.params.id,
      userId: req.user._id,
    }).select('+password');

    if (!url) {
      return next(new AppError('URL not found.', 404));
    }

    if (title !== undefined) url.title = title;
    if (isActive !== undefined) url.isActive = isActive;
    if (expiresAt !== undefined) url.expiresAt = expiresAt ? new Date(expiresAt) : null;

    // Handle password update: null = remove, string = update
    if (password === null || password === '') {
      url.password = null;
      url.isPasswordProtected = false;
    } else if (password) {
      url.password = password; // Pre-save hook hashes it
      url.isPasswordProtected = true;
    }

    await url.save();

    const shortUrl = `${BASE_URL()}/${url.shortCode}`;

    res.json({
      success: true,
      message: 'URL updated successfully.',
      url: {
        id: url._id,
        shortCode: url.shortCode,
        shortUrl,
        originalUrl: url.originalUrl,
        title: url.title,
        isPasswordProtected: url.isPasswordProtected,
        expiresAt: url.expiresAt,
        isActive: url.isActive,
        clicks: url.clicks,
        uniqueVisitors: url.uniqueVisitors,
        status: url.status,
        createdAt: url.createdAt,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * DELETE /api/urls/:id — Delete a URL
 */
const deleteUrl = async (req, res, next) => {
  try {
    const url = await Url.findOneAndDelete({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!url) {
      return next(new AppError('URL not found.', 404));
    }

    // Also clean up analytics (background, don't wait)
    const Analytics = require('../models/Analytics');
    Analytics.deleteMany({ urlId: url._id }).catch(() => {});

    res.json({ success: true, message: 'URL deleted successfully.' });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/urls/:id/qr — Get QR code for a URL
 */
const getQRCode = async (req, res, next) => {
  try {
    const url = await Url.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!url) {
      return next(new AppError('URL not found.', 404));
    }

    const shortUrl = `${BASE_URL()}/${url.shortCode}`;

    const format = req.query.format || 'dataurl';

    if (format === 'png') {
      const buffer = await generateQRCodeBuffer(shortUrl);
      res.setHeader('Content-Type', 'image/png');
      res.setHeader('Content-Disposition', `attachment; filename="qr-${url.shortCode}.png"`);
      return res.send(buffer);
    }

    const qrCode = await generateQRCode(shortUrl);
    res.json({ success: true, qrCode, shortUrl });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/urls/:shortCode/verify-password — Verify password and return original URL
 */
const verifyPassword = async (req, res, next) => {
  try {
    const { password } = req.body;
    const { shortCode } = req.params;

    const url = await Url.findOne({ shortCode }).select('+password').lean(false);

    if (!url) {
      return next(new AppError('URL not found.', 404));
    }

    if (!url.isPasswordProtected) {
      return res.json({ success: true, originalUrl: url.originalUrl });
    }

    const isMatch = await url.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Incorrect password.' });
    }

    res.json({ success: true, originalUrl: url.originalUrl });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createUrl,
  getUserUrls,
  getUrlById,
  updateUrl,
  deleteUrl,
  getQRCode,
  verifyPassword,
};
