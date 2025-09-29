// src/services/taskStatusService.js
import apiClient from './apiClient'; // ya configurado con authToken

export const getTaskStatusPercentages = async () => {
  const response = await apiClient.get('/estado-tareas-semanal/'); // ajusta si tu endpoint tiene otra ruta
  return response.data;
};
