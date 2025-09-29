import React, { useState, useEffect } from 'react';
import '../styles/TaskPage.css';

import TaskItem from '../components/TaskItemT';
import TaskFormModal from '../components/TaskFormModal';
import Button from '../components/Button';

import {
  getTareas,
  createTarea,
  updateTarea,
  deleteTarea,
} from '../services/calendarService';
import { updateTaskStatus, updateTaskEntregado } from '../services/taskService';

const TasksPage = () => {
  const [tasks, setTasks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [editingTask, setEditingTask] = useState(null);

  useEffect(() => {
    const fetchTasks = async () => {
      setIsLoading(true);
      setError('');
      try {
        const fetchedTasks = await getTareas();
        setTasks(fetchedTasks || []);
      } catch (err) {
        setError(err.message || 'Error al cargar las tareas.');
        setTasks([]);
      } finally {
        setIsLoading(false);
      }
    };
    fetchTasks();
  }, []);

  const handleOpenNewTaskModal = () => {
    setEditingTask(null);
    setShowTaskModal(true);
  };

  const handleOpenEditTaskModal = (task) => {
    setEditingTask(task);
    setShowTaskModal(true);
  };

  const handleFormSubmit = async (taskData) => {
    setIsLoading(true);
    setError('');
    try {
      if (editingTask && editingTask.id) {
        const updatedTask = await updateTarea(editingTask.id, taskData);
        setTasks(prevTasks =>
          prevTasks.map(t => t.id === editingTask.id ? updatedTask : t)
        );
      } else {
        const createdTask = await createTarea(taskData);
        setTasks(prevTasks => [...prevTasks, createdTask]);
      }
      setShowTaskModal(false);
      setEditingTask(null);
    } catch (err) {
      setError(err.message || (editingTask ? 'Error al actualizar la tarea.' : 'Error al crear la tarea.'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteTask = async (taskId) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar esta tarea?')) {
      try {
        await deleteTarea(taskId);
        setTasks(prevTasks => prevTasks.filter(task => task.id !== taskId));
      } catch (err) {
        setError(err.message || 'Error al eliminar la tarea.');
      }
    }
  };

  const handleToggleEntregado = async (taskId, isEntregado) => {
    try {
      const updatedTask = await updateTaskEntregado(taskId, !isEntregado);
      setTasks(prevTasks =>
        prevTasks.map(t => t.id === taskId ? updatedTask : t)
      );
    } catch (err) {
      setError(err.message || 'Error al actualizar entregado.');
    }
  };

  const handleSetStatus = async (taskId, newStatus) => {
    try {
      const updatedTask = await updateTaskStatus(taskId, newStatus);
      setTasks(prevTasks =>
        prevTasks.map(t => t.id === taskId ? updatedTask : t)
      );
    } catch (err) {
      setError(err.message || 'Error al cambiar el estado de la tarea.');
    }
  };

  const pageContainerClasses = "tasks-page-container";
  const pageHeaderClasses = "tasks-page-header";
  const pageTitleClasses = "tasks-page-title";
  const addTaskButtonClasses = "tasks-add-button";
  const tasksTableContainerClasses = "tasks-table-container";
  const tasksTableClasses = "tasks-table";
  const errorMessageClasses = "tasks-error-message";
  const loadingMessageClasses = "tasks-loading-message";

  return (
    <div className={pageContainerClasses}>
      <div className={pageHeaderClasses}>
        <h1 className={pageTitleClasses}>Lista de Tareas</h1>
        <Button onClick={handleOpenNewTaskModal} className={addTaskButtonClasses} variant="primary">
          + Añadir Tarea
        </Button>
      </div>

      {isLoading && tasks.length === 0 && <p className={loadingMessageClasses}>Cargando tareas...</p>}
      {error && <p className={errorMessageClasses}>{error}</p>}

      {!isLoading && !error && tasks.length === 0 && (
        <p>No hay tareas. ¡Crea una nueva!</p>
      )}

      {!isLoading && !error && tasks.length > 0 && (
        <div className={tasksTableContainerClasses}>
          <table className={tasksTableClasses}>
            <thead>
              <tr>
                <th>Tarea</th>
                <th>Curso</th>
                <th>Complejidad</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {tasks.map(task => (
                <TaskItem
                  key={task.id}
                  task={task}
                  onToggleEntregado={handleToggleEntregado}
                  onDelete={handleDeleteTask}
                  onSetStatus={handleSetStatus}
                  onEdit={handleOpenEditTaskModal}
                />
              ))}
            </tbody>
          </table>
        </div>
      )}

      <TaskFormModal
        isOpen={showTaskModal}
        onClose={() => { setShowTaskModal(false); setEditingTask(null); }}
        onSubmit={handleFormSubmit}
        initialData={editingTask}
      />
    </div>
  );
};

export default TasksPage;
