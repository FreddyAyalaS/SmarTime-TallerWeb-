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
    const response = await apiClient.get(`${APRENDIZAJE_BASE_PATH}/perfil-usuario/`);
    return response.data;
  } catch (error) {
    // Si no existe perfil (404), retornar null en lugar de lanzar error
    if (error.response && error.response.status === 404) {
      return null;
    }
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
 */
export const asignarDificultadTema = async (tema_id, dificultad) => {
  try {
    const response = await apiClient.post(`${APRENDIZAJE_BASE_PATH}/tema-dificultad/`, {
      tema_id: tema_id,
      dificultad: dificultad
    });
    return response.data;
  } catch (error) {
    console.error('Error al asignar dificultad al tema:', error);
    throw error;
  }
};

/**
 * Eliminar asignación de dificultad de un tema
 * @param {number} tema_dificultad_id - ID del tema con dificultad
 */
export const eliminarDificultadTema = async (tema_dificultad_id) => {
  try {
    const response = await apiClient.delete(`${APRENDIZAJE_BASE_PATH}/tema-dificultad/`, {
      params: { id: tema_dificultad_id }
    });
    return response.data;
  } catch (error) {
    console.error('Error al eliminar dificultad del tema:', error);
    throw error;
  }
};

// ========== HU-20: Recomendación de Método de Estudio Personalizado ==========

/**
 * Obtener recomendación de método de estudio para un tema
 * @param {number} tema_id - ID del tema
 */
export const obtenerRecomendacionMetodo = async (tema_id) => {
  try {
    const response = await apiClient.post(`${APRENDIZAJE_BASE_PATH}/recomendacion-metodo/`, {
      tema_id: tema_id
    });
    return response.data;
  } catch (error) {
    console.error('Error al obtener recomendación de método:', error);
    throw error;
  }
};

/**
 * Obtener historial de recomendaciones del usuario
 * @param {number|null} tema_id - ID del tema (opcional, para filtrar)
 */
export const getHistorialRecomendaciones = async (tema_id = null) => {
  try {
    const params = tema_id ? { tema_id } : {};
    const response = await apiClient.get(`${APRENDIZAJE_BASE_PATH}/recomendacion-metodo/`, {
      params: params
    });
    return response.data;
  } catch (error) {
    console.error('Error al obtener historial de recomendaciones:', error);
    throw error;
  }
};

// ========== HU-21: Generar Planificación Adaptativa Ponderada ==========

/**
 * Generar planificación adaptativa para un tema con dificultad
 * @param {number} tema_dificultad_id - ID del tema con dificultad asignada
 * @param {string} fecha_inicio - Fecha de inicio en formato YYYY-MM-DD
 * @param {string} hora_preferida - Hora preferida en formato HH:MM (opcional)
 * @param {Array<string>} dias_disponibles - Array con días disponibles (opcional)
 */
export const generarPlanificacion = async (tema_dificultad_id, fecha_inicio, hora_preferida = '09:00', dias_disponibles = ['lunes', 'martes', 'miercoles', 'jueves', 'viernes']) => {
  try {
    const response = await apiClient.post(`${APRENDIZAJE_BASE_PATH}/generar-planificacion/`, {
      tema_dificultad_id: tema_dificultad_id,
      fecha_inicio: fecha_inicio,
      hora_preferida: hora_preferida,
      dias_disponibles: dias_disponibles
    });
    return response.data;
  } catch (error) {
    console.error('Error al generar planificación:', error);
    throw error;
  }
};

/**
 * Obtener todas las planificaciones del usuario
 */
export const getPlanificaciones = async () => {
  try {
    const response = await apiClient.get(`${APRENDIZAJE_BASE_PATH}/planificaciones/`);
    return response.data;
  } catch (error) {
    console.error('Error al obtener planificaciones:', error);
    throw error;
  }
};

/**
 * Obtener sesiones de estudio del usuario
 * @param {string|null} fecha_inicio - Fecha de inicio en formato YYYY-MM-DD (opcional)
 * @param {string|null} fecha_fin - Fecha de fin en formato YYYY-MM-DD (opcional)
 */
export const getSesionesEstudio = async (fecha_inicio = null, fecha_fin = null) => {
  try {
    const params = {};
    if (fecha_inicio) params.fecha_inicio = fecha_inicio;
    if (fecha_fin) params.fecha_fin = fecha_fin;
    
    const response = await apiClient.get(`${APRENDIZAJE_BASE_PATH}/sesiones/`, {
      params: params
    });
    return response.data;
  } catch (error) {
    console.error('Error al obtener sesiones de estudio:', error);
    throw error;
  }
};

/**
 * Editar una sesión de estudio
 * @param {number} sesion_id - ID de la sesión
 * @param {Object} datos - Datos a actualizar (fecha, hora_inicio, hora_fin, completada)
 */
export const editarSesionEstudio = async (sesion_id, datos) => {
  try {
    const response = await apiClient.patch(`${APRENDIZAJE_BASE_PATH}/sesiones/${sesion_id}/`, datos);
    return response.data;
  } catch (error) {
    console.error('Error al editar sesión de estudio:', error);
    throw error;
  }
};

/**
 * Eliminar una sesión de estudio
 * @param {number} sesion_id - ID de la sesión
 */
export const eliminarSesionEstudio = async (sesion_id) => {
  try {
    const response = await apiClient.delete(`${APRENDIZAJE_BASE_PATH}/sesiones/${sesion_id}/`);
    return response.data;
  } catch (error) {
    console.error('Error al eliminar sesión de estudio:', error);
    throw error;
  }
};

