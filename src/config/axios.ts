import axios from 'axios';

export const baseURL = import.meta.env.VITE_API_BASE_URL;

const axiosInstance = axios.create({
  baseURL,
  timeout: 20000,
});

axiosInstance.interceptors.request.use((config) => {
  if (!config.headers['Content-Type'] && !(config.data instanceof FormData)) {
    config.headers['Content-Type'] = 'application/json';
  }
  return config;
});

export default axiosInstance;