import axios from 'axios';

export const baseURL = 'http://localhost:8080';

const axiosInstance = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export default axiosInstance; 