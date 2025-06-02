import axios from 'axios';

export const baseURL = 'http://localhost:8080';
// export const baseURL = 'https://eduworldbe-production-2272.up.railway.app';

const axiosInstance = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 2000,
});

export default axiosInstance;