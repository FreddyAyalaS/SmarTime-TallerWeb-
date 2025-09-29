// src/services/apiClient.js
import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://127.0.0.1:8000/';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para añadir el token JWT a las peticiones (excepto login/registro)
apiClient.interceptors.request.use(
  (config) => {
    const excludedPaths = [
      '/autenticacion/login/',
      '/autenticacion/registro/',
    ];

    const isExcluded = excludedPaths.some(path =>
      config.url.endsWith(path) || config.url.includes(path)
    );

    if (!isExcluded) {
      const token = localStorage.getItem('authToken');
      if (token) {
        config.headers['Authorization'] = `Bearer ${token}`;
      }
    }

    return config;
  },
  (error) => Promise.reject(error)
);

export default apiClient;
