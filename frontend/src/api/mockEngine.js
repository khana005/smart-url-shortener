// Local storage keys
const MOCK_USERS_KEY = 'smart_shortener_users';
const MOCK_URLS_KEY = 'smart_shortener_urls';
const MOCK_ANALYTICS_KEY = 'smart_shortener_analytics';

const getUsers = () => JSON.parse(localStorage.getItem(MOCK_USERS_KEY) || '[]');
const saveUsers = (users) => localStorage.setItem(MOCK_USERS_KEY, JSON.stringify(users));

const getUrls = () => JSON.parse(localStorage.getItem(MOCK_URLS_KEY) || '[]');
const saveUrls = (urls) => localStorage.setItem(MOCK_URLS_KEY, JSON.stringify(urls));

const getAnalytics = () => JSON.parse(localStorage.getItem(MOCK_ANALYTICS_KEY) || '[]');
const saveAnalytics = (analytics) => localStorage.setItem(MOCK_ANALYTICS_KEY, JSON.stringify(analytics));

const generateCode = () => Math.random().toString(36).substring(2, 8);

export const handleMockRequest = async (config) => {
  const { url = '', method = 'get', data: bodyData } = config;
  const methodLower = method.toLowerCase();
  const parsedData = typeof bodyData === 'string' ? JSON.parse(bodyData || '{}') : (bodyData || {});

  // ─── AUTH ROUTES ──────────────────────────────────────────────────────────
  if (url.includes('/auth/register') && methodLower === 'post') {
    const { name, email, password } = parsedData;
    const users = getUsers();
    let user = users.find((u) => u.email.toLowerCase() === email.toLowerCase());

    if (user) {
      // If user exists, log them in seamlessly
    } else {
      user = {
        id: 'usr_' + Date.now(),
        name: name || email.split('@')[0],
        email: email.toLowerCase(),
        password: password || '123456',
        createdAt: new Date().toISOString(),
      };
      users.push(user);
      saveUsers(users);
    }

    const token = 'mock_jwt_token_' + btoa(JSON.stringify({ id: user.id, email: user.email }));
    return {
      status: 200,
      data: {
        success: true,
        message: 'Account created successfully.',
        token,
        user: { id: user.id, name: user.name, email: user.email, createdAt: user.createdAt },
      },
    };
  }

  if (url.includes('/auth/login') && methodLower === 'post') {
    const { email, password } = parsedData;
    const users = getUsers();
    let user = users.find((u) => u.email.toLowerCase() === email.toLowerCase());

    if (!user) {
      // Auto-create account if logging in for first time in demo mode
      user = {
        id: 'usr_' + Date.now(),
        name: email.split('@')[0] || 'User',
        email: email.toLowerCase(),
        password: password || '123456',
        createdAt: new Date().toISOString(),
      };
      users.push(user);
      saveUsers(users);
    }

    const token = 'mock_jwt_token_' + btoa(JSON.stringify({ id: user.id, email: user.email }));
    return {
      status: 200,
      data: {
        success: true,
        message: 'Logged in successfully.',
        token,
        user: { id: user.id, name: user.name, email: user.email, createdAt: user.createdAt },
      },
    };
  }

  if (url.includes('/auth/me') && methodLower === 'get') {
    const currentUser = JSON.parse(localStorage.getItem('user') || 'null');
    return {
      status: 200,
      data: {
        success: true,
        user: currentUser || {
          id: 'usr_demo',
          name: 'Demo User',
          email: 'demo@example.com',
          createdAt: new Date().toISOString(),
        },
      },
    };
  }

  // ─── URL ROUTES ───────────────────────────────────────────────────────────
  if (url.includes('/urls') && methodLower === 'post') {
    const { originalUrl, customAlias, password, expiresAt, title } = parsedData;
    const urls = getUrls();
    const shortCode = customAlias || generateCode();
    const baseUrl = window.location.origin;
    const shortUrl = `${baseUrl}/${shortCode}`;

    const qrCode = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(shortUrl)}`;

    const newUrl = {
      _id: 'url_' + Date.now(),
      id: 'url_' + Date.now(),
      shortCode,
      shortUrl,
      originalUrl,
      title: title || originalUrl.replace(/^https?:\/\//, '').split('/')[0],
      isPasswordProtected: !!password,
      password: password || null,
      expiresAt: expiresAt || null,
      isActive: true,
      clicks: 0,
      uniqueVisitors: 0,
      status: 'active',
      createdAt: new Date().toISOString(),
      qrCode,
    };

    urls.unshift(newUrl);
    saveUrls(urls);

    return {
      status: 201,
      data: {
        success: true,
        message: 'Short URL created successfully.',
        url: newUrl,
      },
    };
  }

  if (url.includes('/urls') && methodLower === 'get') {
    const urls = getUrls();
    return {
      status: 200,
      data: {
        success: true,
        urls,
        pagination: {
          page: 1,
          limit: 10,
          total: urls.length,
          pages: 1,
        },
      },
    };
  }

  // ─── ANALYTICS ────────────────────────────────────────────────────────────
  if (url.includes('/analytics/dashboard')) {
    const urls = getUrls();
    const totalClicks = urls.reduce((acc, u) => acc + (u.clicks || 0), 0);
    const activeUrls = urls.filter((u) => u.isActive).length;

    return {
      status: 200,
      data: {
        success: true,
        summary: {
          totalUrls: urls.length,
          totalClicks,
          totalVisitors: Math.round(totalClicks * 0.8),
          activeUrls,
        },
        clickTrends: [
          { date: 'Mon', clicks: 12, visitors: 10 },
          { date: 'Tue', clicks: 19, visitors: 15 },
          { date: 'Wed', clicks: 8, visitors: 7 },
          { date: 'Thu', clicks: 24, visitors: 20 },
          { date: 'Fri', clicks: 35, visitors: 28 },
          { date: 'Sat', clicks: 42, visitors: 33 },
          { date: 'Sun', clicks: 28, visitors: 22 },
        ],
        topLocations: [
          { country: 'United States', code: 'US', clicks: 45 },
          { country: 'India', code: 'IN', clicks: 32 },
          { country: 'United Kingdom', code: 'GB', clicks: 18 },
          { country: 'Germany', code: 'DE', clicks: 12 },
        ],
        deviceBreakdown: [
          { device: 'Desktop', count: 65, percentage: 65 },
          { device: 'Mobile', count: 30, percentage: 30 },
          { device: 'Tablet', count: 5, percentage: 5 },
        ],
        referrerBreakdown: [
          { referrer: 'Direct', count: 50, percentage: 50 },
          { referrer: 'Google', count: 25, percentage: 25 },
          { referrer: 'Twitter', count: 15, percentage: 15 },
          { referrer: 'LinkedIn', count: 10, percentage: 10 },
        ],
      },
    };
  }

  // Fallback default
  return {
    status: 200,
    data: { success: true, message: 'OK' },
  };
};
