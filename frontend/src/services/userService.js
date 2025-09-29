import apiClient from './apiClient';

const USER_BASE_PATH = '/usuarios'; // Ajusta según tu backend

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

// Obtener perfil del usuario autenticado
export const getUserProfile = async () => {
  try {
    const response = await apiClient.get(`${USER_BASE_PATH}/me/`);
    return response.data;
  } catch (error) {
    const errorMessage = getErrorMessage(error, 'Error al obtener el perfil de usuario.');
    throw new Error(errorMessage);
  }
};

// Actualizar perfil (nombre, username, email, carrera, fecha de nacimiento)
export const updateUserProfile = async (profileData) => {
  try {
    const response = await apiClient.put(`${USER_BASE_PATH}/me/`, profileData);
    return response.data;
  } catch (error) {
    const errorMessage = getErrorMessage(error, 'Error al actualizar el perfil.');
    throw new Error(errorMessage);
  }
};

// Cambiar contraseña
export const changePassword = async ({ oldPassword, newPassword }) => {
  try {
    const response = await apiClient.post(`${USER_BASE_PATH}/me/cambiar-contrasena/`, {
      old_password: oldPassword,
      new_password: newPassword,
    });
    return response.data;
  } catch (error) {
    const errorMessage = getErrorMessage(error, 'Error al cambiar la contraseña.');
    throw new Error(errorMessage);
  }
};

// Cambiar foto de perfil
export const updateProfilePicture = async (formData) => {
  try {
    const response = await apiClient.post(`${USER_BASE_PATH}/me/foto-perfil/`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  } catch (error) {
    const errorMessage = getErrorMessage(error, 'Error al actualizar la foto de perfil.');
    throw new Error(errorMessage);
  }
};

