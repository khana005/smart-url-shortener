import api from './axios';

export const getDashboardAnalytics = () => api.get('/analytics/dashboard');
export const getUrlAnalytics = (urlId, days = 30) =>
  api.get(`/analytics/${urlId}`, { params: { days } });
