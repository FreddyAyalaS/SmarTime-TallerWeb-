import React from 'react';
import '../styles/TaskItem.css';

const TrashIcon = () => <span className="task-action-icon">🗑️</span>;

const TaskItemT = ({ task, onToggleEntregado, onDelete, onSetStatus, onEdit }) => {
  const isEntregado = task.estado === 'entregado' || !!task.entregado;
  const rowClasses = `task-item-row ${isEntregado ? 'task-entregado' : ''}`;
  const statusButtonContainerClasses = "task-item-status-buttons";
  const actionsContainerClasses = "task-item-actions";
  const actionButtonClasses = "task-action-button";

  const estadoActual = task.estado || 'inicio';

  return (
    <tr className={rowClasses}>
      <td>{task.titulo || 'Sin título'}</td>
      <td>{task.curso || 'N/A'}</td>
      <td>{task.complejidad || 'N/A'}</td>
      <td className={statusButtonContainerClasses}>
        <button
          className={`status-button status-inicio ${estadoActual === 'inicio' ? 'activo' : ''}`}
          onClick={() => onSetStatus(task.id, 'inicio')}
        >
          Inicio
        </button>
        <button
          className={`status-button status-en-desarrollo ${estadoActual === 'en_desarrollo' ? 'activo' : ''}`}
          onClick={() => onSetStatus(task.id, 'en_desarrollo')}
        >
          En Desarrollo
        </button>
        <button
          className={`status-button status-finalizado ${estadoActual === 'finalizado' ? 'activo' : ''}`}
          onClick={() => onSetStatus(task.id, 'finalizado')}
        >
          Finalizado
        </button>
      </td>
      <td className={actionsContainerClasses}>
        <button
          onClick={() => onEdit(task)}
          className={`${actionButtonClasses} edit-button`}
          aria-label="Editar tarea"
        >
          ✏️
        </button>
        <button
          onClick={() => onDelete(task.id)}
          className={`${actionButtonClasses} delete-button`}
          aria-label="Eliminar tarea"
        >
          <TrashIcon />
        </button>
      </td>
    </tr>
  );
};

export default TaskItemT;
