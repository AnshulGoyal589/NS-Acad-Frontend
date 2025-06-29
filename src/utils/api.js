import axios from 'axios';

const api = axios.create({
  baseURL: 'https://ns-acad-backend.onrender.com/',
  // baseURL: 'http://localhost:8000',
  headers: {
    'Content-Type': 'application/json'
  }
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
