// src/services/calendarService.mock.js
import calendarData from '../data/calendarData';

let activities = [...calendarData];

// Separar por tipo
const getByType = (type) => activities.filter(a => a.tipo === type);

export const getTareas = async () => Promise.resolve(getByType('tarea'));
export const createTarea = async (data) => {
  const newItem = { ...data, id: Date.now(), tipo: 'tarea' };
  activities.push(newItem);
  return Promise.resolve(newItem);
};
export const updateTarea = async (id, updatedData) => {
  activities = activities.map(a => a.id === id ? { ...a, ...updatedData } : a);
  return Promise.resolve(activities.find(a => a.id === id));
};
export const deleteTarea = async (id) => {
  activities = activities.filter(a => a.id !== id);
  return Promise.resolve({ success: true });
};

export const getClases = async () => Promise.resolve(getByType('clase'));
export const createClase = async (data) => {
  const newItem = { ...data, id: Date.now(), tipo: 'clase' };
  activities.push(newItem);
  return Promise.resolve(newItem);
};
export const updateClase = async (id, updatedData) => {
  activities = activities.map(a => a.id === id ? { ...a, ...updatedData } : a);
  return Promise.resolve(activities.find(a => a.id === id));
};
export const deleteClase = async (id) => {
  activities = activities.filter(a => a.id !== id);
  return Promise.resolve({ success: true });
};

export const getEstudios = async () => Promise.resolve(getByType('estudio'));
export const createEstudio = async (data) => {
  const newItem = { ...data, id: Date.now(), tipo: 'estudio' };
  activities.push(newItem);
  return Promise.resolve(newItem);
};
export const updateEstudio = async (id, updatedData) => {
  activities = activities.map(a => a.id === id ? { ...a, ...updatedData } : a);
  return Promise.resolve(activities.find(a => a.id === id));
};
export const deleteEstudio = async (id) => {
  activities = activities.filter(a => a.id !== id);
  return Promise.resolve({ success: true });
};

export const getActividadesNoAcademicas = async () => Promise.resolve(getByType('actividadNoAcademica'));
export const createActividadNoAcademica = async (data) => {
  const newItem = { ...data, id: Date.now(), tipo: 'actividadNoAcademica' };
  activities.push(newItem);
  return Promise.resolve(newItem);
};
export const updateActividadNoAcademica = async (id, updatedData) => {
  activities = activities.map(a => a.id === id ? { ...a, ...updatedData } : a);
  return Promise.resolve(activities.find(a => a.id === id));
};
export const deleteActividadNoAcademica = async (id) => {
  activities = activities.filter(a => a.id !== id);
  return Promise.resolve({ success: true });
};


export const getActivities = async () => {
  const [tareas, estudios, clases, otras] = await Promise.all([
    getTareas(),
    getEstudios(),
    getClases(),
    getActividadesNoAcademicas(),
  ]);

  return [...tareas, ...estudios, ...clases, ...otras];
};
