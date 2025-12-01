// src/services/apiClient.js
import axios from 'axios';

// Determinar la URL base del API
// En desarrollo, Django normalmente corre en el puerto 8000
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://127.0.0.1:8000';

console.log('API Base URL configurada:', API_BASE_URL);

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000, // 15 segundos de timeout
});

// Interceptor para logs de requests (solo en desarrollo)
apiClient.interceptors.request.use(
  (config) => {
    console.log(`[API Request] ${config.method?.toUpperCase()} ${config.baseURL}${config.url}`);
    return config;
  },
  (error) => {
    console.error('[API Request Error]', error);
    return Promise.reject(error);
  }
);

// Interceptor para manejar errores de red
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.code === 'ERR_NETWORK' || error.message === 'Network Error') {
      console.error('Error de red:', error);
      const networkError = new Error('Error de conexión. Verifica que el backend esté corriendo en http://127.0.0.1:8000');
      networkError.isNetworkError = true;
      return Promise.reject(networkError);
    }
    return Promise.reject(error);
  }
);

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
