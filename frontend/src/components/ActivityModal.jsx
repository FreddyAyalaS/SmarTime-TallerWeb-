import React from 'react';
import '../styles/ActivityModal.css';

const getColorByType = (type) => {
  switch (type) {
    case 'Tarea': return '#4A90E2';
    case 'Estudio': return '#2ECC71';
    case 'Clase': return '#F39C12';
    case 'Act. no académica': return '#95A5A6';
    default: return '#cccccc';
  }
};

const ActivityModal = ({ activity, onClose, onEdit, onDelete }) => {
  if (!activity) return null;

  const color = getColorByType(activity.type);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="activity-modal" onClick={(e) => e.stopPropagation()}>
        <h2 style={{ color }}>{activity.type}</h2>

        {activity.title && <p><strong>Título:</strong> {activity.title}</p>}
        {activity.course && <p><strong>Curso:</strong> {activity.course}</p>}
        {activity.fecha && <p><strong>Fecha:</strong> {activity.fecha}</p>}
        {activity.realizationDate && <p><strong>Fecha de realización:</strong> {activity.realizationDate}</p>}
        {activity.startTime && <p><strong>Hora inicio:</strong> {activity.startTime}</p>}
        {activity.deliveryTime && <p><strong>Hora entrega:</strong> {activity.deliveryTime}</p>}
        {activity.hInicio && <p><strong>Hora inicio:</strong> {activity.hInicio}</p>}
        {activity.hFin && <p><strong>Hora fin:</strong> {activity.hFin}</p>}
        {activity.complexity && <p><strong>Complejidad:</strong> {activity.complexity}</p>}
        {activity.temas && <p><strong>Temas:</strong> {activity.temas}</p>}
        {activity.description && <p><strong>Descripción:</strong> {activity.description}</p>}
        {activity.repetir && <p><strong>Repite:</strong> {activity.semanas || 1} semana(s)</p>}

        <div className="modal-buttons">
          <button onClick={() => onEdit(activity)} className="edit-btn">Editar</button>
          <button onClick={() => onDelete(activity)} className="delete-btn">Eliminar</button>
          <button onClick={onClose} className="close-btn">Cerrar</button>
        </div>
      </div>
    </div>
  );
};

export default ActivityModal;
