import axios from 'axios';
import { getToken, clearToken } from './auth';

const api = axios.create({ baseURL: process.env.REACT_APP_API_URL || 'http://localhost:8800', timeout: 15000 });
api.interceptors.request.use(config => {
  const token = getToken();
  if (token && !['/auth/login', '/auth/register', '/auth/config'].includes(config.url))
    config.headers.Authorization = `Bearer ${token}`;
  return config;
});
api.interceptors.response.use(response => response, error => {
  if (error.response?.status === 401 && !['/auth/login', '/auth/register'].includes(error.config?.url)) {
    clearToken(); window.dispatchEvent(new Event('session-expired'));
  }
  return Promise.reject(error);
});
export const errorMessage = error => error.response?.data?.error || 'Não foi possível conectar à API. Tente novamente.';
export default api;
