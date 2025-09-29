// src/services/authService.js
import apiClient from './apiClient';

const AUTH_BASE_PATH = '/autenticacion'; // Centraliza el prefijo de la ruta

const getErrorMessage = (error, defaultMessage) => {
  if (error.response && error.response.data) {
    const data = error.response.data;
    if (data.detail) return data.detail;
    if (data.message) return data.message;
    if (typeof data === 'string') return data;
    if (typeof data === 'object' && Object.keys(data).length > 0) {
      const fieldErrors = Object.values(data).flat().join(' ');
      if (fieldErrors) return fieldErrors;
    }
  }
  return error.message || defaultMessage;
};

export const loginUser = async (credentials) => {
  console.log('authService: Intentando login con:', credentials);
  try {
    const response = await apiClient.post(`${AUTH_BASE_PATH}/login/`, credentials);
    console.log('authService: Login exitoso:', response.data);
    return response.data;
  } catch (error) {
    const errorMessage = getErrorMessage(error, 'Error al iniciar sesión. Verifica tus credenciales.');
    console.error('Error en loginUser service:', errorMessage, error.response);
    throw new Error(errorMessage);
  }
};

export const registerUser = async (userData) => {
  console.log('authService: Intentando registrar con:', userData);
  try {
    const response = await apiClient.post(
      `${AUTH_BASE_PATH}/registro/`,
      userData,
      {
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );
    console.log('authService: Registro exitoso:', response.data);
    return response.data;
  } catch (error) {
    const errorMessage = getErrorMessage(error, 'Error durante el registro. Inténtalo de nuevo.');
    console.error('Error en registerUser service:', errorMessage, error.response);
    throw new Error(errorMessage);
  }
};

export const requestPasswordReset = async (email) => {
  console.log('authService: Solicitando restablecimiento para:', email);
  try {
    const response = await apiClient.post(`${AUTH_BASE_PATH}/solicitarNuevaContrasena/`, { email });
    console.log('authService: Solicitud de restablecimiento enviada:', response.data);
    return response.data;
  } catch (error) {
    const errorMessage = getErrorMessage(error, 'Error al solicitar el restablecimiento de contraseña.');
    console.error('Error en requestPasswordReset service:', errorMessage, error.response);
    throw new Error(errorMessage);
  }
};

export const logoutUser = async () => {
  console.log('authService: Intentando cerrar sesión...');
  localStorage.removeItem('authToken');
  try {
    const response = await apiClient.post(`${AUTH_BASE_PATH}/logout/`, {});
    console.log('authService: Logout en backend exitoso:', response.data);
    return response.data;
  } catch (error) {
    const errorMessage = getErrorMessage(error, 'Error durante el logout en el servidor, pero la sesión local ha sido limpiada.');
    console.warn('Error en logoutUser service (backend call):', errorMessage, error.response);
    return null;
  }
};

export const resetPasswordWithToken = async (uidb64, token, password, confirmar_password) => {
  console.log('authService: Intentando generar nueva contraseña...');
  try {
    const payload = {
      uidb64,
      token,
      password,
      confirmar_password
    };

    const response = await apiClient.post(`${AUTH_BASE_PATH}/generarNuevaContrasena/`, payload);
    console.log('authService: Nueva contraseña generada:', response.data);
    return response.data;
  } catch (error) {
    const errorMessage = getErrorMessage(
      error,
      'Error al generar la nueva contraseña. El token podría ser inválido o haber expirado.'
    );
    console.error('Error en resetPasswordWithToken service:', errorMessage, error.response);
    throw new Error(errorMessage);
  }
};