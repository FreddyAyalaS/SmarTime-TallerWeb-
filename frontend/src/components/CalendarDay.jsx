import React from 'react';
import { useDrop } from 'react-dnd';
import TaskItem from './TaskItem';
import {
  updateTarea,
  updateEstudio,
  updateClase,
  updateActividadNoAcademica,
} from '../services/calendarService';

const CalendarDay = ({ dayNumber, month, year, tasks = [], setTasks, onDayClick }) => {
  const dateStr = dayNumber
    ? new Date(year, month, dayNumber).toISOString().split('T')[0]
    : null;


  const getTaskCalendarDate = (task) => {
    if (task.type === 'Tarea') return task.realizationDate;
    if (task.fecha) return task.fecha;
    if (task.date) return task.date;
    return null;
  };

  const dayTasks = tasks
    .filter(task => getTaskCalendarDate(task) === dateStr)
    .sort((a, b) => (a.startTime || '').localeCompare(b.startTime || ''));


  const [, drop] = useDrop({
    accept: "TASK",
    drop: async (item) => {
      if (!dayNumber) return;

      const newDate = new Date(year, month, dayNumber).toISOString().split('T')[0];

      try {
        if (item.id.toString().startsWith('_')) {
          // Solo frontend
          setTasks(prev =>
            prev.map(t =>
              t.id === item.id
                ? {
                  ...t,
                  ...(item.type === 'Tarea'
                    ? { realizationDate: newDate }
                    : { fecha: newDate }),
                }
                : t
            )
          );
        } else {
          // Backend + frontend update
          switch (item.type) {
            case 'Tarea':
              await updateTarea(item.id, { fechaRealizacion: newDate });
              break;
            case 'Estudio':
              await updateEstudio(item.id, { fecha: newDate });
              break;
            case 'Clase':
              await updateClase(item.id, { fecha: newDate });
              break;
            case 'Act. no académica':
              await updateActividadNoAcademica(item.id, { fecha: newDate });
              break;
            default:
              console.warn('Tipo no soportado:', item.type);
          }

          setTasks(prev =>
            prev.map(t =>
              t.id === item.id
                ? {
                  ...t,
                  ...(item.type === 'Tarea'
                    ? { realizationDate: newDate }
                    : { fecha: newDate }),
                }
                : t
            )
          );
        }
      } catch (error) {
        console.error("Error al actualizar fecha:", error);
        alert("No se pudo actualizar la fecha.");
      }
    },
  });

  const handleDayClick = () => {
    if (dayTasks.length > 0 && onDayClick) {
      onDayClick(dayTasks);
    }
  };

  return (
    <div ref={drop} className="calendar-day">
      <div className="day-number">{dayNumber}</div>
      <div className="calendar-cells">
        {dayTasks.map((task, i) => (
          <TaskItem key={i} task={task} onClick={() => onDayClick && onDayClick(task)} />
        ))}


      </div>
    </div>
  );
};

export default CalendarDay;
