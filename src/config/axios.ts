import axios from 'axios';

const baseURL = 'http://localhost:8080';

axios.defaults.baseURL = baseURL;

export default axios; 