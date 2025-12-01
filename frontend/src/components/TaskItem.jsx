import React from 'react';
import { useDrag } from 'react-dnd';

const getColorByType = (type, task) => {
  // Si el task tiene un color definido (sesiones de estudio), usarlo
  if (task?.color) {
    return task.color;
  }
  
  switch (type) {
    case 'Tarea': return '#4A90E2';
    case 'Estudio': return '#2ECC71';
    case 'Clase': return '#F39C12';
    case 'Act. no académica': return '#95A5A6';
    case 'Sesión Estudio': return '#667eea'; // Morado para sesiones de estudio
    case 'Sesión Repaso': return '#ff9800'; // Naranja para repaso
    case 'Descanso': return '#4caf50'; // Verde para descanso
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
        opacity: isDragging ? 0.5 : (task.completada ? 0.6 : 1),
        backgroundColor: getColorByType(task.type, task),
        color: '#fff',
        padding: '8px',
        borderRadius: '8px',
        marginBottom: '5px',
        cursor: 'grab',
        outline: 'none',
        boxShadow: task.type?.includes('Sesión') ? '0 2px 8px rgba(102, 126, 234, 0.3)' : 'none',
        border: task.type?.includes('Sesión') ? '2px solid rgba(255, 255, 255, 0.3)' : 'none',
        transition: 'transform 0.2s, box-shadow 0.2s',
      }}
      onMouseEnter={(e) => {
        if (!isDragging) {
          e.currentTarget.style.transform = 'translateX(2px)';
          e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.2)';
        }
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateX(0)';
        e.currentTarget.style.boxShadow = task.type?.includes('Sesión') ? '0 2px 8px rgba(102, 126, 234, 0.3)' : 'none';
      }}


    >
      <div className="task-title" style={{ fontWeight: 'bold', fontSize: '14px' }}>
        {title}
      </div>

      {startTime && (
        <div className="task-time" style={{ fontSize: '11px', opacity: 0.9 }}>
          {startTime}
          {task.duracion_minutos && ` • ${task.duracion_minutos} min`}
        </div>
      )}
      {task.completada && (
        <div style={{ fontSize: '10px', opacity: 0.8, marginTop: '4px' }}>
          ✓ Completada
        </div>
      )}
    </div>
  );
};

export default TaskItem;
