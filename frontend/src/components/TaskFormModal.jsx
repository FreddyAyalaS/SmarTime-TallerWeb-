// src/components/TaskFormModal.jsx
import React, { useState, useEffect } from 'react';
import '../styles/TaskFormModal.css';
import Input from './Input';
import Button from './Button';

const TaskFormModal = ({ isOpen, onClose, onSubmit, initialData = null }) => {
  const [titulo, setTitulo] = useState('');
  const [curso, setCurso] = useState('');
  const [desc, setDesc] = useState('');
  const [fEntrega, setFEntrega] = useState('');
  const [hEntrega, setHEntrega] = useState('');
  const [fTarea, setFTarea] = useState('');
  const [hInicio, setHInicio] = useState('');
  const [hFin, setHFin] = useState('');
  const [complejidad, setComplejidad] = useState(1);
  const [estado, setEstado] = useState('inicio');

  useEffect(() => {
    if (initialData) {
      setTitulo(initialData.titulo || '');
      setCurso(initialData.curso || '');
      setDesc(initialData.desc || '');
      setFEntrega(initialData.fEntrega || '');
      setHEntrega(initialData.hEntrega || '');
      setFTarea(initialData.fTarea || '');
      setHInicio(initialData.hInicio || '');
      setHFin(initialData.hFin || '');
      setComplejidad(initialData.complejidad || 1);
      setEstado(initialData.estado || 'inicio');
    } else {
      setTitulo('');
      setCurso('');
      setDesc('');
      setFEntrega('');
      setHEntrega('');
      setFTarea('');
      setHInicio('');
      setHFin('');
      setComplejidad(1);
      setEstado('inicio');
    }
  }, [initialData, isOpen]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const complejidadNormalizada = Math.min(5, Math.max(1, parseInt(complejidad, 10)));

    const taskData = {
      titulo,
      curso,
      descripcipon:desc,
      fechaEntrega: fEntrega,
      horaEntrega: hEntrega,
      fechaRealizacion: fTarea,
      horaInicio: hInicio,
      horaFin: hFin,
      complejidad: complejidadNormalizada,
      estado,
      ...(initialData && { id: initialData.id }),
    };
    if (!titulo || !fEntrega || !hEntrega || !fTarea || !hInicio || !hFin) {
      alert("Por favor completa todos los campos obligatorios");
      return;
    }
    onSubmit(taskData);
  };

  if (!isOpen) return null;

  const modalOverlayClasses = "task-form-modal-overlay";
  const modalContentClasses = "task-form-modal-content";
  const modalHeaderClasses = "task-form-modal-header";
  const modalTitleClasses = "task-form-modal-title";
  const modalCloseButtonClasses = "task-form-modal-close-button";
  const modalBodyClasses = "task-form-modal-body";
  const modalFormClasses = "task-form-actual-form";
  const modalFooterClasses = "task-form-modal-footer";
  const cancelButtonClasses = "task-form-cancel-button";
  const submitButtonClasses = "task-form-submit-button";

  return (
    <div className={modalOverlayClasses} onClick={onClose}>
      <div className={modalContentClasses} onClick={(e) => e.stopPropagation()}>
        <div className={modalHeaderClasses}>
          <h3 className={modalTitleClasses}>
            {initialData ? 'Editar Tarea' : 'Añadir Nueva Tarea'}
          </h3>
          <button onClick={onClose} className={modalCloseButtonClasses}>×</button>
        </div>
        <div className={modalBodyClasses}>
          <form onSubmit={handleSubmit} className={modalFormClasses}>
            <Input label="Título de la Tarea" name="titulo" value={titulo} onChange={(e) => setTitulo(e.target.value)} required />
            <Input label="Curso" name="curso" value={curso} onChange={(e) => setCurso(e.target.value)} />
            <Input label="Descripción (Opcional)" name="desc" type="textarea" value={desc} onChange={(e) => setDesc(e.target.value)} />
            <Input label="Fecha de Entrega" name="fEntrega" type="date" value={fEntrega} onChange={(e) => setFEntrega(e.target.value)} />
            <Input label="Hora de Entrega" name="hEntrega" type="time" value={hEntrega} onChange={(e) => setHEntrega(e.target.value)} />
            <Input label="Fecha de Realización" name="fTarea" type="date" value={fTarea} onChange={(e) => setFTarea(e.target.value)} />
            <Input label="Hora de Inicio" name="hInicio" type="time" value={hInicio} onChange={(e) => setHInicio(e.target.value)} />
            <Input label="Hora de Fin" name="hFin" type="time" value={hFin} onChange={(e) => setHFin(e.target.value)} />
            <Input
              label="Nivel de Complejidad (1-5)"
              name="complejidad"
              type="number"
              min="1"
              max="5"
              value={complejidad}
              onChange={(e) => {
                const val = parseInt(e.target.value, 10);
                if (!isNaN(val)) {
                  if (val >= 1 && val <= 5) {
                    setComplejidad(val);
                  } else if (val < 1) {
                    setComplejidad(1);
                  } else if (val > 5) {
                    setComplejidad(5);
                  }
                } else {
                  setComplejidad('');
                }
              }}
            />
            <div className={modalFooterClasses}>
              <Button type="button" variant="secondary" onClick={onClose} className={cancelButtonClasses}>
                Cancelar
              </Button>
              <Button type="submit" variant="primary" className={submitButtonClasses}>
                {initialData ? 'Guardar Cambios' : 'Crear Tarea'}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default TaskFormModal;
