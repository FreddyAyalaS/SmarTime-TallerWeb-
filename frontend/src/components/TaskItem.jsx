import React from 'react';
import { useDrag } from 'react-dnd';

const getColorByType = (type) => {
  switch (type) {
    case 'Tarea': return '#4A90E2';
    case 'Estudio': return '#2ECC71';
    case 'Clase': return '#F39C12';
    case 'Act. no académica': return '#95A5A6';
    default: return '#cccccc';
  }
};

const TaskItem = ({ task, onClick }) => {
  const [{ isDragging }, drag] = useDrag({
    type: "TASK",
    item: { ...task },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  // Normalizar datos por si vienen con distintos nombres:
  const title = task.title || task.titulo || 'Sin título';
  const startTime =
    task.hInicio || task.startTime || task.horaInicio || task.horaEntrega || null;

  return (
    <div
      ref={drag}
      className="calendar-task"
      onClick={onClick}
      style={{
        opacity: isDragging ? 0.5 : 1,
        backgroundColor: getColorByType(task.type),
        color: '#fff',
        padding: '5px',
        borderRadius: '8px',
        marginBottom: '5px',
        cursor: 'grab',
        outline: 'none',
        boxShadow: 'none',
        border: 'none',
      }}


    >
      <div className="task-title" style={{ fontWeight: 'bold', fontSize: '14px' }}>
        {title}
      </div>

      {startTime && (
        <div className="task-time" style={{ fontSize: '11px' }}>
          Inicio: {startTime}
        </div>
      )}
    </div>
  );
};

export default TaskItem;
