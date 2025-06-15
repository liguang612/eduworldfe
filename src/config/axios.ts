import axios from 'axios';

// export const baseURL = 'http://localhost:8080';
export const baseURL = 'https://eduworldbe-production-2272.up.railway.app';

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