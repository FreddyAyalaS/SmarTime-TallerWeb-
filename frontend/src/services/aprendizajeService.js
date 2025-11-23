// src/services/aprendizajeService.js
import apiClient from './apiClient';

const APRENDIZAJE_BASE_PATH = '/aprendizaje_adaptativo';

// ========== HU-18: Test de Perfil de Aprendizaje ==========

/**
 * Obtener todas las preguntas del test de perfil
 */
export const getPreguntasTest = async () => {
  try {
    const response = await apiClient.get(`${APRENDIZAJE_BASE_PATH}/perfil/`);
    return response.data;
  } catch (error) {
    console.error('Error al obtener preguntas del test:', error);
    throw error;
  }
};

/**
 * Enviar respuestas del test y obtener perfil calculado
 * @param {Array} respuestas - Array de objetos {pregunta: id, valor: 1-5}
 */
export const enviarRespuestasTest = async (respuestas) => {
  try {
    const response = await apiClient.post(`${APRENDIZAJE_BASE_PATH}/perfil/`, {
      respuestas: respuestas
    });
    return response.data;
  } catch (error) {
    console.error('Error al enviar respuestas del test:', error);
    throw error;
  }
};

/**
 * Obtener el perfil de aprendizaje del usuario actual
 */
export const getPerfilAprendizaje = async () => {
  try {
    // Nota: El backend no tiene un endpoint específico para obtener el perfil,
    // pero podemos usar el endpoint de perfil para obtenerlo si existe
    // Por ahora, esto sería una extensión futura del backend
    const response = await apiClient.get(`${APRENDIZAJE_BASE_PATH}/perfil/`);
    return response.data;
  } catch (error) {
    console.error('Error al obtener perfil de aprendizaje:', error);
    throw error;
  }
};

// ========== HU-19: Cursos y Temas ==========

/**
 * Obtener todos los cursos y temas disponibles
 */
export const getCursosYTemas = async () => {
  try {
    const response = await apiClient.get(`${APRENDIZAJE_BASE_PATH}/cursos-temas/`);
    return response.data;
  } catch (error) {
    console.error('Error al obtener cursos y temas:', error);
    throw error;
  }
};

/**
 * Obtener temas con dificultad asignada por el usuario
 */
export const getTemasDificultad = async () => {
  try {
    const response = await apiClient.get(`${APRENDIZAJE_BASE_PATH}/tema-dificultad/`);
    return response.data;
  } catch (error) {
    console.error('Error al obtener temas con dificultad:', error);
    throw error;
  }
};

/**
 * Asignar o actualizar dificultad a un tema
 * @param {number} tema_id - ID del tema
 * @param {string} dificultad - 'baja', 'media', 'alta'
 * @param {string} metodo_estudio - 'Pomodoro', 'Feynman', 'Leitner', etc.
 */
export const asignarDificultadTema = async (tema_id, dificultad, metodo_estudio) => {
  try {
    const response = await apiClient.post(`${APRENDIZAJE_BASE_PATH}/tema-dificultad/`, {
      tema_id: tema_id,
      dificultad: dificultad,
      metodo_estudio: metodo_estudio
    });
    return response.data;
  } catch (error) {
    console.error('Error al asignar dificultad al tema:', error);
    throw error;
  }
};

