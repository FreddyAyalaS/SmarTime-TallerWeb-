// src/services/taskService.mock.js
import taskData from '../data/taskData.js';

let tasks = [...taskData]; // Copia local modificable

export const getTasks = async () => {
  return Promise.resolve(tasks);
};

export const updateTask = async (taskId, taskUpdateData) => {
  tasks = tasks.map(t => (t.id === taskId ? { ...t, ...taskUpdateData } : t));
  return Promise.resolve(tasks.find(t => t.id === taskId));
};

export const deleteTask = async (taskId) => {
  tasks = tasks.filter(t => t.id !== taskId);
  return Promise.resolve({ success: true });
};

export const updateTaskStatus = async (taskId, newState) => {
  tasks = tasks.map(t =>
    t.id === taskId ? { ...t, estado: newState, completado: newState === 'finalizado' } : t
  );
  return Promise.resolve(tasks.find(t => t.id === taskId));
};
export const createTask = async (taskData) => {
  const newTask = {
    ...taskData,
    id: Date.now(),
    completado: false,
    // Asegurar que los nombres sean consistentes con el resto del sistema
    fecha_entrega: taskData.fEntrega || taskData.fecha_entrega,
    hora_entrega: taskData.hEntrega || taskData.hora_entrega,
    descripcion: taskData.desc || taskData.descripcion,
    fecha_tarea: taskData.fTarea || taskData.fecha_tarea,
    hora_inicio: taskData.hInicio || taskData.hora_inicio,
    hora_fin: taskData.hFin || taskData.hora_fin,
  };

  // Eliminar los campos con nombres antiguos
  delete newTask.fEntrega;
  delete newTask.hEntrega;
  delete newTask.desc;
  delete newTask.fTarea;
  delete newTask.hInicio;
  delete newTask.hFin;

  tasks.push(newTask);
  return Promise.resolve(newTask);
};