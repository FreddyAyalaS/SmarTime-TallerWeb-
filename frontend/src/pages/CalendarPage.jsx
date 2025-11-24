// CalendarPage.jsx
import React, { useState } from 'react';
import TaskForm from '../components/TaskForm';
import CalendarDay from '../components/CalendarDay';
import ActivityModal from '../components/ActivityModal';
import '../styles/Calendar.css';
import {
  createTarea,
  createClase,
  createEstudio,
  createActividadNoAcademica,
} from '../services/calendarService';
import {
  getTareas,
  getClases,
  getEstudios,
  getActividadesNoAcademicas,
} from '../services/calendarService';
import { useEffect } from 'react';
import {
  deleteTarea,
  deleteClase,
  deleteEstudio,
  deleteActividadNoAcademica,
} from '../services/calendarService';

import {
  updateTarea,
  updateClase,
  updateEstudio,
  updateActividadNoAcademica,
} from '../services/calendarService';
import apiClient from "../services/apiClient";
import ModalPlanEstudio from "../components/ModalPlanEstudio";
import { getTemasConDificultad, generarPlanificacion } from '../services/aprendizajeService';


const Calendar = () => {
  const [showOptions, setShowOptions] = useState(false);
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [selectedType, setSelectedType] = useState('');
  const [tasks, setTasks] = useState([]);
  const [planSugerido, setPlanSugerido] = useState(null);
  const [mostrarModalPlan, setMostrarModalPlan] = useState(false);
  const [currentDate, setCurrentDate] = useState(new Date());
  const toggleOptions = () => setShowOptions(!showOptions);
  const generateId = () => '_' + Math.random().toString(36).substr(2, 9);
  const [selectedTask, setSelectedTask] = useState(null);
  const [showActivityModal, setShowActivityModal] = useState(false);
  const [temas, setTemas] = useState([]);
  useEffect(() => {
  const fetchData = async () => {
    try {
      const temas = await getTemasConDificultad();
      setTemas(temas);
    } catch (err) {
      console.error(err);
    }
  };

  fetchData();
}, []);



  const formatToHHMM = (timeStr) => {
    if (!timeStr) return '';
    return timeStr.slice(0, 5);
  };

  const handleDeleteActivity = async (activity) => {
    console.log("Intentando eliminar actividad:", activity);

    try {
      if (!activity.id) {
        alert("No se puede eliminar la actividad porque no tiene ID válido.");
        return;
      }

      if (activity.id.toString().startsWith('_')) {
        console.log("Eliminando del frontend (actividad local)");
        setTasks(prev => prev.filter(t => t.id !== activity.id));
        setShowActivityModal(false);
        return;
      }

      switch (activity.type) {
        case 'Tarea':
          await deleteTarea(activity.id);
          break;
        case 'Clase':
          await deleteClase(activity.id);
          break;
        case 'Estudio':
          await deleteEstudio(activity.id);
          break;
        case 'Act. no académica':
          await deleteActividadNoAcademica(activity.id);
          break;
        default:
          console.warn("Tipo no soportado para eliminación:", activity.type);
          return;
      }

      setTasks(prev => prev.filter(t => t.id !== activity.id));
      setShowActivityModal(false);

    } catch (error) {
      console.error("Error al eliminar:", error);
      alert("No se pudo eliminar la actividad.");
    }
  };
  

  const handleEditActivity = (activity) => {
    setSelectedType(activity.type);
    setSelectedTask(activity);
    setShowActivityModal(false);
    setShowTaskForm(true);
  };
  
  const fetchActivities = async () => {
      try {
        const tareas = await getTareas();
        const clases = await getClases();
        const estudios = await getEstudios();
        const actividadesNoAcad = await getActividadesNoAcademicas();

        const mappedTareas = tareas.map(t => mapToFrontendTask('Tarea', t));
        const mappedEstudios = estudios.map(e => mapToFrontendTask('Estudio', e));
        const mappedClases = clases.map(c => mapToFrontendTask('Clase', c));
        const mappedNoAcad = actividadesNoAcad.map(a => mapToFrontendTask('Act. no académica', a));

        setTasks([
          ...mappedTareas,
          ...mappedClases,
          ...mappedEstudios,
          ...mappedNoAcad,
        ]);
      } catch (error) {
        console.error("Error al cargar actividades:", error.message);
      }
    };

  useEffect(() => {
    fetchActivities();
  }, []);

  const handleOptionClick = (type) => {
    setSelectedType(type);
    setShowTaskForm(true);
    setShowOptions(false);
  };

  const mapToFrontendTask = (type, task) => {
    const common = {
      id: task.id,
      type,
      startTime: formatToHHMM(task.horaInicio || task.horaEntrega),
    };

    switch (type) {
      case 'Tarea':
        return {
          ...common,
          title: task.titulo,
          course: task.curso,
          description: task.descripcion,
          fecha: task.fechaRealizacion,
          realizationDate: task.fechaRealizacion,
          deliveryDate: task.fechaEntrega,
          deliveryTime: task.horaEntrega,
          endTime: task.horaFin,
          complexity: task.complejidad,
        };
      case 'Estudio':
        return {
          ...common,
          title: task.titulo,
          course: task.curso,
          temas: task.temas,
          fecha: task.fecha,
          endTime: task.horaFin,
          hInicio: task.horaInicio,
          hFin: task.horaFin,
        };
      case 'Clase':
        return {
          ...common,
          title: task.curso,
          description: task.descripcion,
          fecha: task.fecha,
          endTime: task.horaFin,
          hInicio: task.horaInicio,
          hFin: task.horaFin,
          repetir: task.repetir,
          semanas: task.semanas,
        };
      case 'Act. no académica':
        return {
          ...common,
          title: task.titulo,
          description: task.descripcion,
          fecha: task.fecha,
          endTime: task.horaFin,
          hInicio: task.horaInicio,
          hFin: task.horaFin,
          repetir: task.repetir,
          semanas: task.semanas,
        };
      default:
        return {};
    }
  };

  

  const handleSaveTask = async (taskData) => {
    const isEdit = !!selectedTask?.id;

    if (isEdit) {
      try {
        switch (selectedType) {
          case 'Tarea':
            await updateTarea(selectedTask.id, {
              titulo: taskData.title,
              curso: taskData.course,
              descripcion: taskData.description,
              fechaEntrega: taskData.deliveryDate,
              horaEntrega: taskData.deliveryTime,
              fechaRealizacion: taskData.realizationDate,
              horaInicio: taskData.startTime,
              horaFin: taskData.endTime,
              complejidad: taskData.complexity,
            });
            break;
          case 'Estudio':
            await updateEstudio(selectedTask.id, {
              titulo: taskData.title,
              curso: taskData.course,
              temas: taskData.temas,
              fecha: taskData.fecha,
              horaInicio: taskData.hInicio,
              horaFin: taskData.hFin,
            });
            break;
          case 'Clase':
            await updateClase(selectedTask.id, {
              curso: taskData.course,
              descripcion: taskData.description,
              fecha: taskData.fecha,
              horaInicio: taskData.hInicio,
              horaFin: taskData.hFin,
              repetir: taskData.repetir,
              semanas: taskData.semanas,
            });
            break;
          case 'Act. no académica':
            await updateActividadNoAcademica(selectedTask.id, {
              titulo: taskData.title,
              descripcion: taskData.description,
              fecha: taskData.fecha,
              horaInicio: taskData.hInicio,
              horaFin: taskData.hFin,
              repetir: taskData.repetir,
              semanas: taskData.semanas,
            });
            break;
          default:
            console.warn("Tipo no manejado:", selectedType);
        }

        setTasks(prev =>
          prev.map(t =>
            t.id === selectedTask.id ? { ...t, ...taskData } : t
          )
        );
      } catch (err) {
        console.error("Error actualizando:", err);
        alert("Error al guardar cambios.");
      }
      return;
    }

    try {
      let newTask = null;
      let frontendTask = null;

      switch (selectedType) {
        case 'Tarea':
          newTask = await createTarea({
            titulo: taskData.title,
            curso: taskData.course,
            descripcion: taskData.description,
            fechaEntrega: taskData.deliveryDate,
            horaEntrega: taskData.deliveryTime,
            fechaRealizacion: taskData.realizationDate,
            horaInicio: taskData.startTime,
            horaFin: taskData.endTime,
            complejidad: taskData.complexity,
          });
          const tareaBackend = newTask.tarea;
          frontendTask = mapToFrontendTask('Tarea', {
            ...tareaBackend,
            horaInicio: tareaBackend.horaInicio || tareaBackend.horaEntrega,
          });
          break;

        case 'Estudio':
          newTask = await createEstudio({
            titulo: taskData.title,
            curso: taskData.course,
            temas: taskData.temas,
            fecha: taskData.fecha,
            horaInicio: taskData.hInicio,
            horaFin: taskData.hFin,
          });
          const estudioBackend = newTask.estudio;
          frontendTask = mapToFrontendTask('Estudio', estudioBackend);
          break;

        case 'Clase':
          newTask = await createClase({
            curso: taskData.course,
            descripcion: taskData.description,
            fecha: taskData.fecha,
            horaInicio: taskData.hInicio,
            horaFin: taskData.hFin,
            repetir: taskData.repetir,
            semanas: taskData.semanas,
          });
          const claseBackend = newTask.clase;
          frontendTask = mapToFrontendTask('Clase', claseBackend);
          break;

        case 'Act. no académica':
          newTask = await createActividadNoAcademica({
            titulo: taskData.title,
            descripcion: taskData.description,
            fecha: taskData.fecha,
            horaInicio: taskData.hInicio,
            horaFin: taskData.hFin,
            repetir: taskData.repetir,
            semanas: taskData.semanas,
          });
          const actBackend = newTask.actividad;
          frontendTask = mapToFrontendTask('Act. no académica', actBackend);
          break;

        default:
          console.warn("Tipo no manejado:", selectedType);
          return;
      }

      const allTasks = [frontendTask];

      if ((selectedType === 'Clase' || selectedType === 'Act. no académica') && taskData.repetir) {
        const weeks = parseInt(taskData.semanas) || 1;
        for (let i = 1; i < weeks; i++) {
          const repeatedDate = new Date(frontendTask.fecha);
          repeatedDate.setDate(repeatedDate.getDate() + 7 * i);
          allTasks.push({
            ...frontendTask,
            id: generateId(),
            fecha: repeatedDate.toISOString().split('T')[0],
          });
        }
      }

      setTasks(prev => [...prev, ...allTasks]);

    } catch (error) {
      console.error("Error al guardar en backend:", error.message);
      alert("Ocurrió un error al guardar en el backend: " + error.message);
    }
  };

  const getMonthDays = (year, month) => {
    const firstDayOfMonth = new Date(year, month, 1);
    const lastDayOfMonth = new Date(year, month + 1, 0);
    const daysInMonth = lastDayOfMonth.getDate();

    let firstDayOfWeek = firstDayOfMonth.getDay();
    firstDayOfWeek = (firstDayOfWeek + 6) % 7;

    const days = [];

    for (let i = 0; i < firstDayOfWeek; i++) {
      days.push(null);
    }

    for (let i = 1; i <= daysInMonth; i++) {
      days.push(i);
    }

    return days;
  };

  const handlePrevMonth = () => {
    const prevMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1);
    setCurrentDate(prevMonth);
  };

  const handleNextMonth = () => {
    const nextMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1);
    setCurrentDate(nextMonth);
  };

  const monthDays = getMonthDays(currentDate.getFullYear(), currentDate.getMonth());
  const monthName = currentDate.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' });

  // Dentro de CalendarPage.jsx — reemplaza tu handleGenerarPlanInteligente actual
const handleGenerarPlanInteligente = async () => {
  try {
    // 1) Obtener temas/dificultades del usuario
    const temas = await getTemasConDificultad();

    if (!Array.isArray(temas) || temas.length === 0) {
      alert("No tienes temas con dificultad asignada. Ve a 'Perfil' o 'Cursos' y asigna dificultad a un tema primero.");
      return;
    }

    const temaDificultad = temas[0];
    const tema_dificultad_id = temaDificultad.id;

    const hoy = new Date();
    const fecha_inicio = hoy.toISOString().split('T')[0]; // 'YYYY-MM-DD'

    const payload = {
      tema_dificultad_id,
      fecha_inicio,
      hora_preferida: '09:00',
      dias_disponibles: ['lunes','martes','miercoles','jueves','viernes'],
    };

    // 4) Llamar al endpoint real
    const resultado = await generarPlanificacion(payload);

    // Normalizar array de sesiones/bloques (varios nombres posibles)
    let sesionesRaw = [];
    if (Array.isArray(resultado.sesiones)) sesionesRaw = resultado.sesiones;
    else if (Array.isArray(resultado.bloques)) sesionesRaw = resultado.bloques;
    else if (Array.isArray(resultado.sesiones_creadas)) sesionesRaw = resultado.sesiones_creadas;
    else if (Array.isArray(resultado.data)) sesionesRaw = resultado.data;
    // si no hay detalle, dejamos sesionesRaw = []

    // Deduplicar por clave compuesta (fecha + horaInicio + tipo + numero)
    const seen = new Set();
    const sesionesUnicas = sesionesRaw.filter(s => {
      const fecha = s.fecha || s.fecha_inicio || s.date || '';
      const hora = (s.hora_inicio || s.hora || s.inicio || '').toString().slice(0,8);
      const tipo = s.tipo_sesion || s.tipo || s.nombre || s.tarea || '';
      const numero = s.numero_sesion ?? s.numero ?? '';
      const key = `${fecha}|${hora}|${tipo}|${numero}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });

    // Guardar un objeto que incluya la info original + sesiones deduplicadas
    const planToShow = {
      ...resultado,
      sesiones: sesionesUnicas
    };

    setPlanSugerido(planToShow);
    setMostrarModalPlan(true);

  } catch (error) {
    console.error("Error generando plan inteligente:", error);
    const msg = error?.response?.data?.error || error?.message || "Hubo un problema al generar el plan inteligente.";
    alert(msg);
  }
};


   const handleAceptarPlan = async () => {
    try {
      // IMPORTANTE: La generación ya guardó las sesiones en el backend (GenerarPlanificacionView crea SesionEstudio).
      // Por eso NO llamamos a un endpoint /guardar_plan/ (inexistente).
      // Simplemente cerramos el modal y recargamos actividades desde el backend.
      setMostrarModalPlan(false);

      // Recargar eventos del calendario (usa tu función ya existente)
      await fetchActivities();

      alert("Plan agregado exitosamente al calendario.");
    } catch (error) {
      console.error(error);
      alert("Error al procesar la aceptación del plan.");
    }
  };


  return (
    <div className="calendar">
      <div className="calendar-header">
        <button onClick={handlePrevMonth}>{'<'}</button>
        <h1>{monthName.charAt(0).toUpperCase() + monthName.slice(1)}</h1>
        <button onClick={handleNextMonth}>{'>'}</button>

        <div className="create-container">
          <button className="create-btn" onClick={toggleOptions}>
            Crear actividad ➕
          </button>
          {showOptions && (
            <div className="activity-options">
              <button className="option blue" onClick={() => handleOptionClick("Tarea")}>Tarea</button>
              <button className="option green" onClick={() => handleOptionClick("Estudio")}>Estudio</button>
              <button className="option orange" onClick={() => handleOptionClick("Clase")}>Clase</button>
              <button className="option gray" onClick={() => handleOptionClick("Act. no académica")}>Act. no académica</button>
            </div>
          )}
        </div>

        <button 
          className="create-btn"
          style={{ backgroundColor: "#6f42c1", marginLeft: "10px" }}
          onClick={handleGenerarPlanInteligente}
        >
          Plan Inteligente 📅
        </button>
      </div>

      <div className="calendar-day-names">
        {['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'].map((dayName, i) => (
          <div key={i} className="calendar-day-name">
            {dayName}
          </div>
        ))}
      </div>
      
      <div className="calendar-grid">
        {monthDays.map((dayNumber, index) => (
          <CalendarDay
            key={index}
            dayNumber={dayNumber}
            month={currentDate.getMonth()}
            year={currentDate.getFullYear()}
            tasks={tasks}
            setTasks={setTasks}
            onDayClick={(task) => {
              if (Array.isArray(task)) return;
              setSelectedTask(task);
              setShowActivityModal(true);
            }}
          />
        ))}
      </div>

      {showTaskForm && (
        <TaskForm
          onClose={() => setShowTaskForm(false)}
          onSave={handleSaveTask}
          type={selectedType}
          initialData={selectedTask}
        />
      )}

      {showActivityModal && (
        <ActivityModal
          activity={selectedTask}
          onClose={() => {
            setSelectedTask(null);
            setShowActivityModal(false);
          }}
          onEdit={handleEditActivity}
          onDelete={handleDeleteActivity}
        />
      )}

      {/* AQUÍ VA EL MODAL DE PLAN INTELIGENTE */}
      {mostrarModalPlan && (
        <ModalPlanEstudio
          plan={planSugerido}
          onAceptar={handleAceptarPlan}
          onRechazar={() => setMostrarModalPlan(false)}
        />
      )}
    </div>
  );
};

export default Calendar;
