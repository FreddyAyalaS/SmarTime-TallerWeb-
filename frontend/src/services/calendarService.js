// src/services/calendarService.js
import apiClient from './apiClient';

// --- TAREAS ---
export const getTareas = async () => {
  const response = await apiClient.get('/calendario/api/tareas/');
  return response.data;
};

export const createTarea = async (data) => {
  const response = await apiClient.post('/calendario/api/tareas/', data);
  return response.data;
};

export const updateTarea = async (id, data) => {
  const response = await apiClient.patch(`/calendario/api/tareas/${id}/`, data);
  return response.data;
};

export const deleteTarea = async (id) => {
  const response = await apiClient.delete(`/calendario/api/tareas/${id}/`);
  return response.data;
};

// --- CLASES ---
export const getClases = async () => {
  const response = await apiClient.get('/calendario/api/clases/');
  return response.data;
};

export const createClase = async (data) => {
  const response = await apiClient.post('/calendario/api/clases/', data);
  return response.data;
};

export const updateClase = async (id, data) => {
  const response = await apiClient.patch(`/calendario/api/clases/${id}/`, data);
  return response.data;
};

export const deleteClase = async (id) => {
  const response = await apiClient.delete(`/calendario/api/clases/${id}/`);
  return response.data;
};

// --- ESTUDIOS ---
export const getEstudios = async () => {
  const response = await apiClient.get('/calendario/api/estudios/');
  return response.data;
};

export const createEstudio = async (data) => {
  const response = await apiClient.post('/calendario/api/estudios/', data);
  return response.data;
};

export const updateEstudio = async (id, data) => {
  const response = await apiClient.patch(`/calendario/api/estudios/${id}/`, data);
  return response.data;
};

export const deleteEstudio = async (id) => {
  const response = await apiClient.delete(`/calendario/api/estudios/${id}/`);
  return response.data;
};

// --- ACTIVIDADES NO ACADÉMICAS ---
export const getActividadesNoAcademicas = async () => {
  const response = await apiClient.get('/calendario/api/actividadesNoAcademicas/');
  return response.data;
};

export const createActividadNoAcademica = async (data) => {
  const response = await apiClient.post('/calendario/api/actividadesNoAcademicas/', data);
  return response.data;
};

export const updateActividadNoAcademica = async (id, data) => {
  const response = await apiClient.patch(`/calendario/api/actividadesNoAcademicas/${id}/`, data);
  return response.data;
};

export const deleteActividadNoAcademica = async (id) => {
  const response = await apiClient.delete(`/calendario/api/actividadesNoAcademicas/${id}/`);
  return response.data;
};

export const getActividadesDeHoy = async () => {
  const response = await apiClient.get('/calendario/api/actividadesHoy/');
  return response.data;
};

