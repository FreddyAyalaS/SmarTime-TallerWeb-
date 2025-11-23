import React, { useState, useEffect } from 'react';
import { 
  getCursosYTemas, 
  getTemasDificultad, 
  asignarDificultadTema 
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
  const [metodoEstudio, setMetodoEstudio] = useState('Pomodoro');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [cursosTemasData, temasDificultadData] = await Promise.all([
        getCursosYTemas(),
        getTemasDificultad()
      ]);

      setCursos(cursosTemasData.cursos || []);
      setTemas(cursosTemasData.temas || []);
      setTemasDificultad(temasDificultadData || []);
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
    setCursoSeleccionado(curso);
    setTemaSeleccionado(null);
    setMostrarFormulario(false);
    setBusqueda(''); // Limpiar búsqueda al seleccionar curso
  };

  const handleSeleccionarTema = (tema) => {
    setTemaSeleccionado(tema);
    setMostrarFormulario(true);
    
    // Verificar si el tema ya tiene dificultad asignada
    const temaConDificultad = temasDificultad.find(td => td.tema === tema.id);
    if (temaConDificultad) {
      setDificultad(temaConDificultad.dificultad);
      setMetodoEstudio(temaConDificultad.metodo_estudio);
    } else {
      setDificultad('media');
      setMetodoEstudio('Pomodoro');
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
        dificultad,
        metodoEstudio
      );

      setSuccess(resultado.mensaje || 'Dificultad asignada con éxito');
      
      // Recargar temas con dificultad
      const temasDificultadData = await getTemasDificultad();
      setTemasDificultad(temasDificultadData || []);
      
      // Limpiar selección después de un momento
      setTimeout(() => {
        setTemaSeleccionado(null);
        setMostrarFormulario(false);
        setSuccess(null);
      }, 2000);
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
                        <option value="baja">Baja</option>
                        <option value="media">Media</option>
                        <option value="alta">Alta</option>
                      </select>
                    </div>

                    <div className="form-group">
                      <label>Método de Estudio:</label>
                      <select
                        value={metodoEstudio}
                        onChange={(e) => setMetodoEstudio(e.target.value)}
                        className="select-metodo"
                      >
                        <option value="Pomodoro">Pomodoro</option>
                        <option value="Feynman">Feynman</option>
                        <option value="Leitner">Leitner</option>
                      </select>
                    </div>

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

          {/* Sección de Temas Asignados */}
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
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CursoTemaPage;

