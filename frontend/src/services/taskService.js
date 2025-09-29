// src/services/taskService.js
import apiClient from './apiClient'; // Asume que apiClient está configurado con baseURL y manejo de token

const TASKS_BASE_PATH = '/calendario/api/tareas'; // Ajusta si tu backend tiene otro prefijo para tareas, ej. '/api/tareas'

/**
 * Obtiene todas las tareas del usuario.
 * Endpoint: GET /tareas/ (o el que sea)
 * @returns {Promise<Array<object>>} Promesa que resuelve con un array de tareas.
 */
export const getTasks = async () => {
  console.log('taskService: Obteniendo tareas...');
  try {
    const response = await apiClient.get(`${TASKS_BASE_PATH}/`); // Asume que el token se añade por apiClient
    console.log('taskService: Tareas obtenidas:', response.data);
    return response.data; // Asume que el backend devuelve un array de tareas
  } catch (error) {
    // Reutiliza tu getErrorMessage o maneja el error específicamente
    const errorMessage = error.response?.data?.detail || error.response?.data?.message || error.message || 'Error al obtener las tareas.';
    console.error('Error en getTasks service:', errorMessage, error.response);
    throw new Error(errorMessage);
  }
};

/**
 * Crea una nueva tarea.
 * Endpoint: POST /tareas/
 * @param {object} taskData - Datos de la nueva tarea.
 * @returns {Promise<object>} Promesa que resuelve con la tarea creada.
 */
export const createTask = async (taskData) => {
  console.log('taskService: Creando tarea con:', taskData);
  try {
    const response = await apiClient.post(`${TASKS_BASE_PATH}/`, taskData);
    console.log('taskService: Tarea creada:', response.data);
    return response.data;
  } catch (error) {
    const errorMessage = error.response?.data?.detail || error.response?.data?.message || error.message || 'Error al crear la tarea.';
    console.error('Error en createTask service:', errorMessage, error.response);
    throw new Error(errorMessage);
  }
};

/**
 * Actualiza una tarea existente.
 * Endpoint: PATCH /tareas/{taskId}/
 * @param {string|number} taskId - ID de la tarea a actualizar.
 * @param {object} taskUpdateData - Datos a actualizar en la tarea.
 * @returns {Promise<object>} Promesa que resuelve con la tarea actualizada.
 */
export const updateTask = async (taskId, taskUpdateData) => {
  console.log(`taskService: Actualizando tarea ${taskId} con:`, taskUpdateData);
  try {
    const response = await apiClient.patch(`${TASKS_BASE_PATH}/${taskId}/`, taskUpdateData);
    console.log('taskService: Tarea actualizada:', response.data);
    return response.data;
  } catch (error) {
    const errorMessage = error.response?.data?.detail || error.response?.data?.message || error.message || 'Error al actualizar la tarea.';
    console.error('Error en updateTask service:', errorMessage, error.response);
    throw new Error(errorMessage);
  }
};

/**
 * Elimina una tarea.
 * Endpoint: DELETE /tareas/{taskId}/
 * @param {string|number} taskId - ID de la tarea a eliminar.
 * @returns {Promise<object>} Promesa que resuelve con una respuesta vacía o un mensaje.
 */
export const deleteTask = async (taskId) => {
  console.log(`taskService: Eliminando tarea ${taskId}`);
  try {
    const response = await apiClient.delete(`${TASKS_BASE_PATH}/${taskId}/`);
    console.log('taskService: Tarea eliminada:', response.data); // A menudo es 204 No Content
    return response.data; // O un objeto de confirmación
  } catch (error) {
    const errorMessage = error.response?.data?.detail || error.response?.data?.message || error.message || 'Error al eliminar la tarea.';
    console.error('Error en deleteTask service:', errorMessage, error.response);
    throw new Error(errorMessage);
  }
};

/**
 * Cambia el estado de completado de una tarea.
 * O actualiza el campo 'estado' ('inicio', 'en_desarrollo', 'finalizado')
 * Endpoint: PATCH /tareas/{taskId}/ (o PUT) - depende de tu backend
 * @param {string|number} taskId - ID de la tarea.
 * @param {string} newState - El nuevo estado (ej. 'finalizado', 'en_desarrollo').
 * @returns {Promise<object>} Promesa que resuelve con la tarea actualizada.
 */
export const updateTaskStatus = async (taskId, newState) => {
  console.log(`taskService: Actualizando estado de tarea ${taskId} a:`, newState);
  try {
    // El backend podría esperar solo el campo a cambiar, ej. { estado: newState }
    // o { completado: true/false }
    const response = await apiClient.patch(`${TASKS_BASE_PATH}/${taskId}/`, { estado: newState });
    console.log('taskService: Estado de tarea actualizado:', response.data);
    return response.data;
  } catch (error) {
    const errorMessage = error.response?.data?.detail || error.response?.data?.message || error.message || 'Error al actualizar el estado de la tarea.';
    console.error('Error en updateTaskStatus service:', errorMessage, error.response);
    throw new Error(errorMessage);
  }
};

// Podrías tener una función getErrorMessage local o importarla si la centralizas
// const getErrorMessage = (error, defaultMessage) => { ... }
/**
 * Cambia el estado de entregado de una tarea.
 * Endpoint: PATCH /tareas/{taskId}/
 * @param {string|number} taskId - ID de la tarea.
 * @param {boolean} entregado - Nuevo valor para entregado.
 * @returns {Promise<object>} Promesa que resuelve con la tarea actualizada.
 */
export const updateTaskEntregado = async (taskId, entregado) => {
  try {
    const response = await apiClient.patch(`${TASKS_BASE_PATH}/${taskId}/`, { entregado });
    return response.data;
  } catch (error) {
    const errorMessage = error.response?.data?.detail || error.response?.data?.message || error.message || 'Error al actualizar entregado.';
    throw new Error(errorMessage);
  }
};