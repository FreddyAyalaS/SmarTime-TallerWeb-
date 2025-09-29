import React, { useState } from 'react';
import '../styles/TaskForm.css';

const TaskForm = ({ onClose, onSave, type, initialData }) => {
  const [taskData, setTaskData] = useState({
    title: initialData?.title || '',
    course: initialData?.course || '',
    description: initialData?.description || '',
    deliveryDate: initialData?.deliveryDate || '',
    deliveryTime: initialData?.deliveryTime || '',
    realizationDate: initialData?.realizationDate || '',
    startTime: initialData?.startTime || '',
    endTime: initialData?.endTime || '',
    complexity: initialData?.complexity || 0,
    temas: initialData?.temas || '',
    fecha: initialData?.fecha || '',
    hInicio: initialData?.hInicio || '',
    hFin: initialData?.hFin || '',
    repetir: initialData?.repetir || false,
    semanas: initialData?.semanas || 1,
  });


  const handleChange = (e) => {
    const { name, value, type: inputType, checked } = e.target;
    setTaskData({
      ...taskData,
      [name]: inputType === 'checkbox' ? checked : value,
    });
  };

  const handleComplexityClick = (level) => {
    setTaskData({ ...taskData, complexity: level });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(taskData);
    onClose();
  };

  const getTypeClass = (type) => {
    switch (type) {
      case 'Tarea': return 'tarea';
      case 'Estudio': return 'estudio';
      case 'Clase': return 'clase';
      case 'Act. no académica': return 'act_no_academica';
      default: return 'default';
    }
  };

  return (
    <div className="modal-overlay">
      <form className={`task-form ${getTypeClass(type)}`} onSubmit={handleSubmit}>

        <div className="form-header">
          <h2>{type}:</h2>
          <input
            type="text"
            name="title"
            placeholder="Título"
            value={taskData.title}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-body">
          {type === 'Tarea' && (
            <>
              <div className="form-row">
                <label htmlFor="course">Curso:</label>
                <input type="text" name="course" placeholder="Curso" value={taskData.course} onChange={handleChange} required />
              </div>
              <div className="form-row">
                <label htmlFor="description">Descripción:</label>
                <textarea name="description" placeholder="Añade una descripción breve de la tarea" value={taskData.description} onChange={handleChange} />
              </div>
              <div className="form-row">
                <label htmlFor="deliveryDate">F. Entrega:</label>
                <input type="date" name="deliveryDate" value={taskData.deliveryDate} onChange={handleChange} required />
              </div>
              <div className="form-row">
                <label htmlFor="deliveryTime">H. Entrega:</label>
                <input type="time" name="deliveryTime" value={taskData.deliveryTime} onChange={handleChange} required />
              </div>
              <div className="form-row">
                <label htmlFor="realizationDate">F. Realización:</label>
                <input type="date" name="realizationDate" value={taskData.realizationDate} onChange={handleChange} />
              </div>
              <div className="form-row">
                <label htmlFor="startTime">H. Inicio:</label>
                <input type="time" name="startTime" value={taskData.startTime} onChange={handleChange} />
              </div>
              <div className="form-row">
                <label htmlFor="endTime">H. Fin:</label>
                <input type="time" name="endTime" value={taskData.endTime} onChange={handleChange} />
              </div>
              <div className="complexity">
                <span>Complejidad:</span>
                {[1, 2, 3, 4, 5].map((level) => (
                  <button
                    type="button"
                    key={level}
                    className={taskData.complexity === level ? 'selected' : ''}
                    onClick={() => handleComplexityClick(level)}
                  >
                    {level}
                  </button>
                ))}
              </div>
            </>
          )}

          {type === 'Estudio' && (
            <>
              <div className="form-row">
                <label>Curso:</label>
                <input type="text" name="course" placeholder="Curso" value={taskData.course} onChange={handleChange} required />
              </div>
              <div className="form-row">
                <label>Temas:</label>
                <input type="text" name="temas" placeholder="Temas a estudiar" value={taskData.temas} onChange={handleChange} />
              </div>
              <div className="form-row">
                <label>Fecha:</label>
                <input type="date" name="fecha" value={taskData.fecha} onChange={handleChange} required />
              </div>
              <div className="form-row">
                <label>H. Inicio:</label>
                <input type="time" name="hInicio" value={taskData.hInicio} onChange={handleChange} />
              </div>
              <div className="form-row">
                <label>H. Fin:</label>
                <input type="time" name="hFin" value={taskData.hFin} onChange={handleChange} />
              </div>
            </>
          )}

          {type === 'Clase' && (
            <>
              <div className="form-row">
                <label>Curso:</label>
                <input type="text" name="course" placeholder="Curso" value={taskData.course} onChange={handleChange} required />
              </div>
              <div className="form-row">
                <label>Descripción:</label>
                <textarea name="description" placeholder="Descripción" value={taskData.description} onChange={handleChange} />
              </div>
              <div className="form-row">
                <label>Fecha:</label>
                <input type="date" name="fecha" value={taskData.fecha} onChange={handleChange} required />
              </div>
              <div className="form-row">
                <label>H. Inicio:</label>
                <input type="time" name="hInicio" value={taskData.hInicio} onChange={handleChange} />
              </div>
              <div className="form-row">
                <label>H. Fin:</label>
                <input type="time" name="hFin" value={taskData.hFin} onChange={handleChange} />
              </div>
              <div className="form-row">
                <label>¿Repetir semanalmente?</label>
                <input type="checkbox" name="repetir" checked={taskData.repetir} onChange={handleChange} />
              </div>
              {taskData.repetir && (
                <div className="form-row">
                  <label>Nº semanas:</label>
                  <input type="number" name="semanas" min="1" value={taskData.semanas} onChange={handleChange} />
                </div>
              )}
            </>
          )}

          {type === 'Act. no académica' && (
            <>
              <div className="form-row">
                <label>Descripción:</label>
                <textarea name="description" placeholder="Descripción" value={taskData.description} onChange={handleChange} />
              </div>
              <div className="form-row">
                <label>Fecha:</label>
                <input type="date" name="fecha" value={taskData.fecha} onChange={handleChange} />
              </div>
              <div className="form-row">
                <label>H. Inicio:</label>
                <input type="time" name="hInicio" value={taskData.hInicio} onChange={handleChange} />
              </div>
              <div className="form-row">
                <label>H. Fin:</label>
                <input type="time" name="hFin" value={taskData.hFin} onChange={handleChange} />
              </div>
              <div className="form-row">
                <label>¿Repetir semanalmente?</label>
                <input type="checkbox" name="repetir" checked={taskData.repetir} onChange={handleChange} />
              </div>
              {taskData.repetir && (
                <div className="form-row">
                  <label>Nº semanas:</label>
                  <input type="number" name="semanas" min="1" value={taskData.semanas} onChange={handleChange} />
                </div>
              )}
            </>
          )}

          <div className="buttons">
            <button type="submit" className="save-btn">
              {initialData ? 'Guardar cambios' : 'Guardar'}
            </button>

            <button type="button" className="cancel-btn" onClick={onClose}>Cancelar</button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default TaskForm;
