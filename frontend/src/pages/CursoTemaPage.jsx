import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  getCursosYTemas, 
  getTemasDificultad, 
  asignarDificultadTema,
  eliminarDificultadTema,
  obtenerRecomendacionMetodo,
  generarPlanificacion,
  getPerfilAprendizaje
} from '../services/aprendizajeService';
import Button from '../components/Button';
import Input from '../components/Input';
import '../styles/CursoTemaPage.css';

const CursoTemaPage = () => {
  const [cursos, setCursos] = useState([]);
  const [temas, setTemas] = useState([]);
  const [temasDificultad, setTemasDificultad] = useState([]);
  const [cursoSeleccionado, setCursoSeleccionado] = useState(null);
  const [temaSeleccionado, setTemaSeleccionado] = useState(null);
  const [busqueda, setBusqueda] = useState('');
  const [dificultad, setDificultad] = useState('media');
  const [loading, setLoading] = useState(true);
  const [perfilAprendizaje, setPerfilAprendizaje] = useState(null);
  const [mostrarModalTest, setMostrarModalTest] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [temaConDificultad, setTemaConDificultad] = useState(null);
  const [recomendacion, setRecomendacion] = useState(null);
  const [cargandoRecomendacion, setCargandoRecomendacion] = useState(false);
  const [mostrarPlanificacion, setMostrarPlanificacion] = useState(false);
  const [fechaInicio, setFechaInicio] = useState('');
  const [horaPreferida, setHoraPreferida] = useState('09:00');
  const [diasDisponibles, setDiasDisponibles] = useState({
    lunes: true, martes: true, miercoles: true, jueves: true, viernes: true,
    sabado: false, domingo: false
  });
  const [generandoPlanificacion, setGenerandoPlanificacion] = useState(false);

  const navigate = useNavigate();

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
      
      const [cursosTemasData, temasDificultadData, perfilData] = await Promise.all([
        getCursosYTemas(),
        getTemasDificultad(),
        getPerfilAprendizaje()
      ]);

      setCursos(cursosTemasData.cursos || []);
      setTemas(cursosTemasData.temas || []);
      setTemasDificultad(temasDificultadData || []);
      setPerfilAprendizaje(perfilData);
    } catch (err) {
      console.error('Error al cargar datos:', err);
      setError('Error al cargar los cursos y temas. Por favor, intenta nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  // Filtrar cursos por búsqueda
  const cursosFiltrados = cursos.filter(curso =>
    curso.nombre.toLowerCase().includes(busqueda.toLowerCase())
  );

  // Obtener temas del curso seleccionado
  const temasDelCurso = cursoSeleccionado
    ? temas.filter(tema => tema.curso === cursoSeleccionado.id)
    : [];

  // Filtrar temas por búsqueda
  const temasFiltrados = temasDelCurso.filter(tema =>
    tema.nombre.toLowerCase().includes(busqueda.toLowerCase())
  );

  const handleSeleccionarCurso = (curso) => {
    // Verificar si el usuario ha completado el test
    if (!perfilAprendizaje) {
      setMostrarModalTest(true);
      return;
    }
    
    setCursoSeleccionado(curso);
    setTemaSeleccionado(null);
    setMostrarFormulario(false);
    setBusqueda(''); // Limpiar búsqueda al seleccionar curso
  };

  const handleSeleccionarTema = (tema) => {
    // Verificar si el usuario ha completado el test
    if (!perfilAprendizaje) {
      setMostrarModalTest(true);
      return;
    }
    
    // Seleccionar el curso del tema automáticamente
    const cursoDelTema = cursos.find(c => c.id === tema.curso);
    if (cursoDelTema) {
      setCursoSeleccionado(cursoDelTema);
    }
    
    setTemaSeleccionado(tema);
    setMostrarFormulario(true);
    setRecomendacion(null);
    setMostrarPlanificacion(false);
    
    // Verificar si el tema ya tiene dificultad asignada
    const temaConDificultad = temasDificultad.find(td => td.tema === tema.id);
    if (temaConDificultad) {
      setDificultad(temaConDificultad.dificultad);
      setTemaConDificultad(temaConDificultad);
    } else {
      setDificultad('media');
      setTemaConDificultad(null);
    }
  };

  const handleAsignarDificultad = async (e) => {
    e.preventDefault();
    
    if (!temaSeleccionado) {
      alert('Por favor, selecciona un tema primero.');
      return;
    }

    try {
      setSubmitting(true);
      setError(null);
      setSuccess(null);

      const resultado = await asignarDificultadTema(
        temaSeleccionado.id,
        dificultad
      );

      setSuccess(resultado.mensaje || 'Dificultad asignada con éxito');
      
      // Recargar temas con dificultad
      const temasDificultadData = await getTemasDificultad();
      setTemasDificultad(temasDificultadData || []);
      
      // Actualizar tema con dificultad asignada para mostrar recomendación/planificación
      const nuevoTemaDificultad = temasDificultadData.find(td => td.tema === temaSeleccionado.id);
      if (nuevoTemaDificultad) {
        setTemaConDificultad(nuevoTemaDificultad);
        setDificultad(nuevoTemaDificultad.dificultad);
        // Mantener el formulario abierto para mostrar recomendación/planificación
      }
    } catch (err) {
      console.error('Error al asignar dificultad:', err);
      setError('Error al asignar la dificultad. Por favor, intenta nuevamente.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCambiarTema = () => {
    setTemaSeleccionado(null);
    setMostrarFormulario(false);
    setTemaConDificultad(null);
    setRecomendacion(null);
    setMostrarPlanificacion(false);
  };

  const handleObtenerRecomendacion = async () => {
    if (!temaSeleccionado || !temaConDificultad) {
      setError('Primero debes asignar dificultad al tema.');
      return;
    }

    try {
      setCargandoRecomendacion(true);
      setError(null);

      const resultado = await obtenerRecomendacionMetodo(temaSeleccionado.id);
      setRecomendacion(resultado.recomendacion);
    } catch (err) {
      console.error('Error al obtener recomendación:', err);
      setError(err.response?.data?.error || 'Error al obtener la recomendación. Por favor, intenta nuevamente.');
    } finally {
      setCargandoRecomendacion(false);
    }
  };

  const handleToggleDia = (dia) => {
    setDiasDisponibles(prev => ({
      ...prev,
      [dia]: !prev[dia]
    }));
  };

  const handleGenerarPlanificacion = async (e) => {
    e.preventDefault();
    
    if (!temaConDificultad || !fechaInicio) {
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
      setGenerandoPlanificacion(true);
      setError(null);
      setSuccess(null);

      const resultado = await generarPlanificacion(
        temaConDificultad.id,
        fechaInicio,
        horaPreferida,
        diasSeleccionados
      );

      setSuccess(`Planificación generada con éxito. Se crearon ${resultado.sesiones_generadas} sesiones. Ve al calendario para verlas.`);
      setMostrarPlanificacion(false);
      
      // Recargar temas con dificultad
      const temasDificultadData = await getTemasDificultad();
      setTemasDificultad(temasDificultadData || []);
      
      setTimeout(() => {
        setSuccess(null);
      }, 5000);
    } catch (err) {
      console.error('Error al generar planificación:', err);
      setError(err.response?.data?.error || 'Error al generar la planificación. Por favor, intenta nuevamente.');
    } finally {
      setGenerandoPlanificacion(false);
    }
  };

  const handleEliminarDificultad = async (temaDificultadId) => {
    if (!window.confirm('¿Estás seguro de que deseas eliminar esta asignación de dificultad?')) {
      return;
    }

    try {
      setError(null);
      await eliminarDificultadTema(temaDificultadId);
      setSuccess('Asignación de dificultad eliminada con éxito.');
      
      // Recargar temas con dificultad
      const temasDificultadData = await getTemasDificultad();
      setTemasDificultad(temasDificultadData || []);
      
      // Si el tema eliminado era el seleccionado, limpiar selección
      if (temaConDificultad?.id === temaDificultadId) {
        setTemaSeleccionado(null);
        setMostrarFormulario(false);
        setTemaConDificultad(null);
      }
      
      setTimeout(() => {
        setSuccess(null);
      }, 3000);
    } catch (err) {
      console.error('Error al eliminar dificultad:', err);
      setError('Error al eliminar la asignación de dificultad. Por favor, intenta nuevamente.');
    }
  };

  const getTemaDificultadInfo = (temaId) => {
    return temasDificultad.find(td => td.tema === temaId);
  };

  if (loading) {
    return (
      <div className="curso-tema-container">
        <div className="curso-tema-loading">
          <p>Cargando cursos y temas...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="curso-tema-container">
      <div className="curso-tema-content">
        <h1>Seleccionar Curso y Tema</h1>
        <p className="page-intro">
          Selecciona un curso y luego elige el tema que deseas estudiar.
          Puedes asignar una dificultad al tema para recibir recomendaciones personalizadas.
        </p>

        {error && (
          <div className="curso-tema-error">
            <p>{error}</p>
          </div>
        )}

        {success && (
          <div className="curso-tema-success">
            <p>{success}</p>
          </div>
        )}

        {/* Búsqueda */}
        <div className="busqueda-container">
          <input
            type="text"
            placeholder="Buscar curso o tema..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            className="busqueda-input"
          />
        </div>

        <div className="curso-tema-layout">
          {/* Sección de Cursos */}
          <div className="cursos-section">
            <h2>Cursos</h2>
            {cursoSeleccionado && (
              <div className="curso-seleccionado-info">
                <p>Curso seleccionado: <strong>{cursoSeleccionado.nombre}</strong></p>
                <Button
                  onClick={() => {
                    setCursoSeleccionado(null);
                    setTemaSeleccionado(null);
                    setMostrarFormulario(false);
                  }}
                  className="btn-cambiar-curso"
                >
                  Cambiar Curso
                </Button>
              </div>
            )}
            
            <div className="cursos-list">
              {cursosFiltrados.length === 0 ? (
                <p className="no-results">No se encontraron cursos</p>
              ) : (
                cursosFiltrados.map(curso => (
                  <div
                    key={curso.id}
                    className={`curso-item ${cursoSeleccionado?.id === curso.id ? 'selected' : ''}`}
                    onClick={() => handleSeleccionarCurso(curso)}
                  >
                    <h3>{curso.nombre}</h3>
                    <p className="curso-temas-count">
                      {temas.filter(t => t.curso === curso.id).length} tema(s)
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Sección de Temas */}
          {cursoSeleccionado && (
            <div className="temas-section">
              <h2>Temas de {cursoSeleccionado.nombre}</h2>
              
              {temaSeleccionado && mostrarFormulario && (
                <div className="formulario-dificultad">
                  <h3>Asignar Dificultad: {temaSeleccionado.nombre}</h3>
                  
                  <form onSubmit={handleAsignarDificultad}>
                    <div className="form-group">
                      <label>Dificultad:</label>
                      <select
                        value={dificultad}
                        onChange={(e) => setDificultad(e.target.value)}
                        className="select-dificultad"
                      >
                        <option value="baja">Baja (Fácil)</option>
                        <option value="media">Media</option>
                        <option value="alta">Alta (Difícil)</option>
                      </select>
                    </div>
                    <p className="helper-text">El método de estudio será recomendado automáticamente según tu perfil</p>

                    <div className="form-actions">
                      <Button
                        type="submit"
                        disabled={submitting}
                        className="btn-guardar"
                      >
                        {submitting ? "Guardando..." : "Guardar"}
                      </Button>
                      <Button
                        type="button"
                        onClick={handleCambiarTema}
                        className="btn-cancelar"
                      >
                        Cancelar
                      </Button>
                    </div>
                  </form>

                  {/* La recomendación y la configuración de planificación se mostrará
                      en el panel derecho para mayor espacio y separación visual. */}
                </div>
              )}

              <div className="temas-list">
                {temasFiltrados.length === 0 ? (
                  <p className="no-results">No se encontraron temas para este curso</p>
                ) : (
                  temasFiltrados.map(tema => {
                    const temaDificultad = getTemaDificultadInfo(tema.id);
                    return (
                      <div
                        key={tema.id}
                        className={`tema-item ${temaSeleccionado?.id === tema.id ? 'selected' : ''} ${temaDificultad ? 'con-dificultad' : ''}`}
                        onClick={() => handleSeleccionarTema(tema)}
                      >
                        <h4>{tema.nombre}</h4>
                        {temaDificultad && (
                          <div className="tema-dificultad-info">
                            <span className={`badge-dificultad ${temaDificultad.dificultad}`}>
                              {temaDificultad.dificultad}
                            </span>
                            <span className="badge-metodo">
                              {temaDificultad.metodo_estudio}
                            </span>
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}
        </div>

        {/* Panel de Recomendación y Planificación - Debajo de todo, ancho completo */}
        {temaSeleccionado && temaConDificultad && (
          <div className="recomendacion-planificacion-fullwidth">
            <div className="recomendacion-planificacion-container">
              <div className="recomendacion-card">
                <h3>Recomendación Personalizada</h3>
                {recomendacion ? (
                  <div className="recomendacion-detalle">
                    <div className="metodo-recomendado">
                      <p className="tecnica-label">Técnica recomendada</p>
                      <h2 className="tecnica-principal">
                        {recomendacion.metodo_principal.toUpperCase()}
                        {recomendacion.metodo_complementario && ` + ${recomendacion.metodo_complementario.toUpperCase()}`}
                      </h2>
                    </div>
                    <div className="explicacion-aplicacion">
                      <div className="explicacion-contenido" dangerouslySetInnerHTML={{ __html: recomendacion.razon }} />
                    </div>
                  </div>
                ) : (
                  <div className="recomendacion-placeholder">
                    <p>Obtén una recomendación personalizada basada en tu perfil y este tema</p>
                    <Button
                      onClick={handleObtenerRecomendacion}
                      disabled={cargandoRecomendacion}
                      className="btn-obtener-recomendacion"
                    >
                      {cargandoRecomendacion ? 'Generando...' : 'Obtener Recomendación'}
                    </Button>
                  </div>
                )}
              </div>

              <div className="planificacion-card">
                <h3>📅 Generar Planificación</h3>
                {!mostrarPlanificacion ? (
                  <div className="planificacion-placeholder">
                    <p>Genera sesiones de estudio automáticamente distribuidas en el tiempo</p>
                    <Button
                      onClick={() => setMostrarPlanificacion(true)}
                      className="btn-mostrar-planificacion"
                    >
                      Configurar Planificación
                    </Button>
                  </div>
                ) : (
                  <form onSubmit={handleGenerarPlanificacion} className="form-planificacion">
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
                    <div className="form-actions">
                      <Button
                        type="submit"
                        disabled={generandoPlanificacion}
                        className="btn-generar-planificacion"
                      >
                        {generandoPlanificacion ? 'Generando...' : 'Generar Planificación'}
                      </Button>
                      <Button
                        type="button"
                        onClick={() => setMostrarPlanificacion(false)}
                        className="btn-cancelar"
                      >
                        Cancelar
                      </Button>
                    </div>
                  </form>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Sección de Temas Asignados */}
        <div className="curso-tema-layout">
          {temasDificultad.length > 0 && (
            <div className="temas-asignados-section">
              <h2>Temas con Dificultad Asignada</h2>
              <div className="temas-asignados-list">
                {temasDificultad.map(td => {
                  const tema = temas.find(t => t.id === td.tema);
                  const curso = cursos.find(c => c.id === tema?.curso);
                  return (
                    <div key={td.id} className="tema-asignado-item">
                      <div className="tema-asignado-header">
                        <h4>{tema?.nombre || 'Tema no encontrado'}</h4>
                        <span className="curso-badge">{curso?.nombre || 'N/A'}</span>
                      </div>
                      <div className="tema-asignado-details">
                        <span className={`badge-dificultad ${td.dificultad}`}>
                          Dificultad: {td.dificultad}
                        </span>
                        <span className="badge-metodo">
                          Método: {td.metodo_estudio}
                        </span>
                        <div className="tema-asignado-actions">
                          <Button
                            onClick={() => {
                              if (tema) {
                                handleSeleccionarTema(tema);
                              }
                            }}
                            className="btn-actualizar-tema"
                          >
                            Actualizar
                          </Button>
                          <Button
                            onClick={() => handleEliminarDificultad(td.id)}
                            className="btn-eliminar-tema"
                          >
                            Eliminar
                          </Button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modal: Test no completado */}
      {mostrarModalTest && (
        <div className="modal-overlay" onClick={() => setMostrarModalTest(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>⚠️ Test de Aprendizaje Requerido</h2>
            <p>Antes de elegir cursos y temas, debes completar el test de perfil de aprendizaje.</p>
            <p>Este test nos ayudará a recomendarte los mejores métodos de estudio personalizados.</p>
            <div className="modal-actions">
              <Button onClick={() => navigate('/test-perfil')} className="btn-primary">
                Ir al Test
              </Button>
              <Button onClick={() => setMostrarModalTest(false)} className="btn-secondary">
                Cerrar
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CursoTemaPage;

