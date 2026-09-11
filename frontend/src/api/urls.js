import api from './axios';

export const createUrl = (data) => api.post('/urls', data);
export const getUserUrls = (params) => api.get('/urls', { params });
export const getUrlById = (id) => api.get(`/urls/${id}`);
export const updateUrl = (id, data) => api.put(`/urls/${id}`, data);
export const deleteUrl = (id) => api.delete(`/urls/${id}`);
export const getQRCode = (id, format = 'dataurl') =>
  api.get(`/urls/${id}/qr`, { params: { format } });
export const verifyPassword = (shortCode, password) =>
  api.post(`/urls/${shortCode}/verify-password`, { password });
