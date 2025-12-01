import React, { useState, useEffect } from 'react';
import { 
  getTemasDificultad,
  generarPlanificacion,
  getPlanificaciones,
  getSesionesEstudio,
  editarSesionEstudio,
  eliminarSesionEstudio
} from '../services/aprendizajeService';
import Button from '../components/Button';
import '../styles/PlanificacionPage.css';

const PlanificacionPage = () => {
  const [temasDificultad, setTemasDificultad] = useState([]);
  const [planificaciones, setPlanificaciones] = useState([]);
  const [sesiones, setSesiones] = useState([]);
  const [temaSeleccionado, setTemaSeleccionado] = useState(null);
  const [fechaInicio, setFechaInicio] = useState('');
  const [horaPreferida, setHoraPreferida] = useState('09:00');
  const [diasDisponibles, setDiasDisponibles] = useState({
    lunes: true,
    martes: true,
    miercoles: true,
    jueves: true,
    viernes: true,
    sabado: false,
    domingo: false
  });
  const [loading, setLoading] = useState(true);
  const [generando, setGenerando] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [planificacionSeleccionada, setPlanificacionSeleccionada] = useState(null);
  const [editandoSesion, setEditandoSesion] = useState(null);

  useEffect(() => {
    cargarDatos();
    // Establecer fecha de inicio por defecto (hoy)
    const hoy = new Date();
    setFechaInicio(hoy.toISOString().split('T')[0]);
  }, []);

  const cargarDatos = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [temasData, planificacionesData] = await Promise.all([
        getTemasDificultad(),
        getPlanificaciones()
      ]);

      setTemasDificultad(temasData || []);
      setPlanificaciones(planificacionesData || []);
      
      // Cargar sesiones de las planificaciones activas
      if (planificacionesData && planificacionesData.length > 0) {
        const sesionesData = await getSesionesEstudio();
        setSesiones(sesionesData || []);
      }
    } catch (err) {
      console.error('Error al cargar datos:', err);
      setError('Error al cargar los datos. Por favor, intenta nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleSeleccionarTema = (tema) => {
    setTemaSeleccionado(tema);
    setMostrarFormulario(true);
    setError(null);
    setSuccess(null);
  };

  const handleToggleDia = (dia) => {
    setDiasDisponibles(prev => ({
      ...prev,
      [dia]: !prev[dia]
    }));
  };

  const handleGenerarPlanificacion = async (e) => {
    e.preventDefault();
    
    if (!temaSeleccionado || !fechaInicio) {
      setError('Por favor, completa todos los campos requeridos.');
      return;
    }

    const diasSeleccionados = Object.keys(diasDisponibles).filter(
      dia => diasDisponibles[dia]
    );

    if (diasSeleccionados.length === 0) {
      setError('Selecciona al menos un día disponible.');
      return;
    }

    try {
      setGenerando(true);
      setError(null);
      setSuccess(null);

      const resultado = await generarPlanificacion(
        temaSeleccionado.id,
        fechaInicio,
        horaPreferida,
        diasSeleccionados
      );

      setSuccess(`Planificación generada con éxito. Se crearon ${resultado.sesiones_generadas} sesiones.`);
      setMostrarFormulario(false);
      setTemaSeleccionado(null);
      
      // Recargar datos
      await cargarDatos();
      
      // Mostrar la planificación generada
      const planificacionesData = await getPlanificaciones();
      if (planificacionesData && planificacionesData.length > 0) {
        const nuevaPlanificacion = planificacionesData[0];
        setPlanificacionSeleccionada(nuevaPlanificacion);
        const sesionesData = await getSesionesEstudio();
        setSesiones(sesionesData || []);
      }
    } catch (err) {
      console.error('Error al generar planificación:', err);
      setError(err.response?.data?.error || 'Error al generar la planificación. Por favor, intenta nuevamente.');
    } finally {
      setGenerando(false);
    }
  };

  const handleEditarSesion = async (sesionId, datos) => {
    try {
      await editarSesionEstudio(sesionId, datos);
      await cargarDatos();
      setEditandoSesion(null);
      setSuccess('Sesión actualizada con éxito.');
    } catch (err) {
      console.error('Error al editar sesión:', err);
      setError('Error al editar la sesión. Por favor, intenta nuevamente.');
    }
  };

  const handleEliminarSesion = async (sesionId) => {
    if (!window.confirm('¿Estás seguro de que deseas eliminar esta sesión?')) {
      return;
    }

    try {
      await eliminarSesionEstudio(sesionId);
      await cargarDatos();
      setSuccess('Sesión eliminada con éxito.');
    } catch (err) {
      console.error('Error al eliminar sesión:', err);
      setError('Error al eliminar la sesión. Por favor, intenta nuevamente.');
    }
  };

  const sesionesDePlanificacion = planificacionSeleccionada
    ? sesiones.filter(s => s.tema_dificultad === planificacionSeleccionada.tema_dificultad)
    : [];

  // Agrupar sesiones por fecha
  const sesionesPorFecha = sesionesDePlanificacion.reduce((acc, sesion) => {
    const fecha = sesion.fecha;
    if (!acc[fecha]) {
      acc[fecha] = [];
    }
    acc[fecha].push(sesion);
    return acc;
  }, {});

  if (loading) {
    return (
      <div className="planificacion-container">
        <div className="planificacion-loading">
          <p>Cargando datos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="planificacion-container">
      <div className="planificacion-content">
        <h1>Planificación Adaptativa Ponderada</h1>
        <p className="page-intro">
          Genera una planificación de estudio personalizada según la dificultad del tema
          y el método de estudio asignado.
        </p>

        {error && (
          <div className="planificacion-error">
            <p>{error}</p>
          </div>
        )}

        {success && (
          <div className="planificacion-success">
            <p>{success}</p>
          </div>
        )}

        {/* Formulario de Generación */}
        {!mostrarFormulario && (
          <div className="temas-section">
            <h2>Temas con Dificultad Asignada</h2>
            {temasDificultad.length === 0 ? (
              <div className="no-temas">
                <p>No tienes temas con dificultad asignada.</p>
                <p>Ve a la sección de Cursos y Temas para asignar dificultades primero.</p>
              </div>
            ) : (
              <div className="temas-list">
                {temasDificultad.map((tema) => (
                  <div
                    key={tema.id}
                    className="tema-item"
                    onClick={() => handleSeleccionarTema(tema)}
                  >
                    <div className="tema-header">
                      <h3>{tema.tema_nombre}</h3>
                      <span className="curso-badge">{tema.curso_nombre}</span>
                    </div>
                    <div className="tema-details">
                      <span className={`badge-dificultad ${tema.dificultad}`}>
                        Dificultad: {tema.dificultad}
                      </span>
                      <span className="badge-metodo">
                        Método: {tema.metodo_estudio}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Formulario de Generación */}
        {mostrarFormulario && temaSeleccionado && (
          <div className="formulario-planificacion">
            <h2>Generar Planificación para: {temaSeleccionado.tema_nombre}</h2>
            
            <form onSubmit={handleGenerarPlanificacion}>
              <div className="form-group">
                <label>Fecha de Inicio:</label>
                <input
                  type="date"
                  value={fechaInicio}
                  onChange={(e) => setFechaInicio(e.target.value)}
                  required
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label>Hora Preferida:</label>
                <input
                  type="time"
                  value={horaPreferida}
                  onChange={(e) => setHoraPreferida(e.target.value)}
                  required
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label>Días Disponibles:</label>
                <div className="dias-checkbox">
                  {Object.keys(diasDisponibles).map((dia) => (
                    <label key={dia} className="checkbox-label">
                      <input
                        type="checkbox"
                        checked={diasDisponibles[dia]}
                        onChange={() => handleToggleDia(dia)}
                      />
                      <span>{dia.charAt(0).toUpperCase() + dia.slice(1)}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="form-info">
                <p><strong>Método:</strong> {temaSeleccionado.metodo_estudio}</p>
                <p><strong>Dificultad:</strong> {temaSeleccionado.dificultad}</p>
              </div>

              <div className="form-actions">
                <Button
                  type="submit"
                  disabled={generando}
                  className="btn-generar"
                >
                  {generando ? 'Generando...' : 'Generar Planificación'}
                </Button>
                <Button
                  type="button"
                  onClick={() => {
                    setMostrarFormulario(false);
                    setTemaSeleccionado(null);
                    setError(null);
                  }}
                  className="btn-cancelar"
                >
                  Cancelar
                </Button>
              </div>
            </form>
          </div>
        )}

        {/* Lista de Planificaciones */}
        {planificaciones.length > 0 && (
          <div className="planificaciones-section">
            <h2>Mis Planificaciones</h2>
            <div className="planificaciones-list">
              {planificaciones.map((plan) => (
                <div
                  key={plan.id}
                  className={`planificacion-item ${planificacionSeleccionada?.id === plan.id ? 'selected' : ''}`}
                  onClick={() => {
                    setPlanificacionSeleccionada(plan);
                    const sesionesFiltradas = sesiones.filter(
                      s => s.tema_dificultad === plan.tema_dificultad
                    );
                    setSesiones(sesionesFiltradas);
                  }}
                >
                  <div className="planificacion-header">
                    <h3>{plan.tema_nombre}</h3>
                    <span className={`badge-activa ${plan.activa ? 'activa' : 'inactiva'}`}>
                      {plan.activa ? 'Activa' : 'Inactiva'}
                    </span>
                  </div>
                  <div className="planificacion-details">
                    <p><strong>Curso:</strong> {plan.curso_nombre}</p>
                    <p><strong>Método:</strong> {plan.metodo_estudio}</p>
                    <p><strong>Dificultad:</strong> {plan.dificultad}</p>
                    <p><strong>Fecha Inicio:</strong> {new Date(plan.fecha_inicio).toLocaleDateString('es-ES')}</p>
                    <p><strong>Fecha Fin:</strong> {new Date(plan.fecha_fin).toLocaleDateString('es-ES')}</p>
                    <p><strong>Sesiones:</strong> {plan.sesiones_completadas} / {plan.total_sesiones}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Visualización de Sesiones */}
        {planificacionSeleccionada && sesionesPorFecha && Object.keys(sesionesPorFecha).length > 0 && (
          <div className="sesiones-section">
            <h2>Sesiones de Estudio</h2>
            <div className="sesiones-calendario">
              {Object.keys(sesionesPorFecha)
                .sort()
                .map((fecha) => (
                  <div key={fecha} className="sesiones-dia">
                    <h3 className="fecha-header">
                      {new Date(fecha).toLocaleDateString('es-ES', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </h3>
                    <div className="sesiones-list">
                      {sesionesPorFecha[fecha]
                        .sort((a, b) => a.hora_inicio.localeCompare(b.hora_inicio))
                        .map((sesion) => (
                          <div key={sesion.id} className={`sesion-item ${sesion.tipo_sesion} ${sesion.completada ? 'completada' : ''}`}>
                            <div className="sesion-info">
                              <span className="sesion-hora">
                                {sesion.hora_inicio} - {sesion.hora_fin}
                              </span>
                              <span className={`badge-tipo ${sesion.tipo_sesion}`}>
                                {sesion.tipo_sesion}
                              </span>
                              <span className="sesion-duracion">
                                {sesion.duracion_minutos} min
                              </span>
                            </div>
                            <div className="sesion-actions">
                              <input
                                type="checkbox"
                                checked={sesion.completada}
                                onChange={(e) => {
                                  handleEditarSesion(sesion.id, {
                                    completada: e.target.checked
                                  });
                                }}
                              />
                              <label>Completada</label>
                              <Button
                                onClick={() => handleEliminarSesion(sesion.id)}
                                className="btn-eliminar"
                              >
                                Eliminar
                              </Button>
                            </div>
                          </div>
                        ))}
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PlanificacionPage;


