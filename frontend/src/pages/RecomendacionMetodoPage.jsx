import React, { useState, useEffect } from 'react';
import { 
  getTemasDificultad,
  obtenerRecomendacionMetodo,
  getHistorialRecomendaciones 
} from '../services/aprendizajeService';
import Button from '../components/Button';
import '../styles/RecomendacionMetodoPage.css';

const RecomendacionMetodoPage = () => {
  const [temasDificultad, setTemasDificultad] = useState([]);
  const [temaSeleccionado, setTemaSeleccionado] = useState(null);
  const [recomendacion, setRecomendacion] = useState(null);
  const [historial, setHistorial] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cargandoRecomendacion, setCargandoRecomendacion] = useState(false);
  const [error, setError] = useState(null);
  const [busqueda, setBusqueda] = useState('');

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [temasData, historialData] = await Promise.all([
        getTemasDificultad(),
        getHistorialRecomendaciones()
      ]);

      setTemasDificultad(temasData || []);
      setHistorial(historialData || []);
    } catch (err) {
      console.error('Error al cargar datos:', err);
      setError('Error al cargar los temas con dificultad. Por favor, intenta nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleSeleccionarTema = (tema) => {
    setTemaSeleccionado(tema);
    setRecomendacion(null);
    setError(null);
  };

  const handleObtenerRecomendacion = async () => {
    if (!temaSeleccionado) {
      setError('Por favor, selecciona un tema primero.');
      return;
    }

    try {
      setCargandoRecomendacion(true);
      setError(null);

      const resultado = await obtenerRecomendacionMetodo(temaSeleccionado.tema);
      setRecomendacion(resultado.recomendacion);
      
      // Recargar historial
      const historialData = await getHistorialRecomendaciones();
      setHistorial(historialData || []);
    } catch (err) {
      console.error('Error al obtener recomendación:', err);
      setError(err.response?.data?.error || 'Error al obtener la recomendación. Por favor, intenta nuevamente.');
    } finally {
      setCargandoRecomendacion(false);
    }
  };

  // Filtrar temas por búsqueda
  const temasFiltrados = temasDificultad.filter(tema =>
    tema.tema_nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
    tema.curso_nombre.toLowerCase().includes(busqueda.toLowerCase())
  );

  if (loading) {
    return (
      <div className="recomendacion-container">
        <div className="recomendacion-loading">
          <p>Cargando datos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="recomendacion-container">
      <div className="recomendacion-content">
        <h1>Recomendación de Método de Estudio</h1>
        <p className="page-intro">
          Selecciona un tema con dificultad asignada y obtén una recomendación personalizada del método de estudio
          más adecuado según tu perfil de aprendizaje y la dificultad del tema.
        </p>

        {error && (
          <div className="recomendacion-error">
            <p>{error}</p>
          </div>
        )}

        {temasDificultad.length === 0 ? (
          <div className="no-temas-container">
            <div className="no-temas-message">
              <h2>No tienes temas con dificultad asignada</h2>
              <p>Para obtener recomendaciones personalizadas, primero debes asignar dificultad a los temas.</p>
              <p>Ve a la sección <strong>"Cursos y Temas"</strong> para asignar dificultades a tus temas de estudio.</p>
            </div>
          </div>
        ) : (
          <>
            {/* Búsqueda */}
            <div className="busqueda-container">
              <input
                type="text"
                placeholder="Buscar tema o curso..."
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                className="busqueda-input"
              />
            </div>

            <div className="recomendacion-layout">
              {/* Sección de Temas con Dificultad */}
              <div className="seleccion-section">
                <div className="temas-section">
                  <h2>Temas con Dificultad Asignada</h2>
                  <p className="section-subtitle">
                    Selecciona un tema para obtener una recomendación personalizada
                  </p>
                  <div className="temas-list">
                    {temasFiltrados.length === 0 ? (
                      <p className="no-results">No se encontraron temas que coincidan con tu búsqueda</p>
                    ) : (
                      temasFiltrados.map(tema => (
                        <div
                          key={tema.id}
                          className={`tema-item ${temaSeleccionado?.id === tema.id ? 'selected' : ''}`}
                          onClick={() => handleSeleccionarTema(tema)}
                        >
                          <div className="tema-header">
                            <h4>{tema.tema_nombre}</h4>
                            <span className="curso-badge">{tema.curso_nombre}</span>
                          </div>
                          <div className="tema-details">
                            <span className={`badge-dificultad ${tema.dificultad}`}>
                              Dificultad: {tema.dificultad}
                            </span>
                            <span className="badge-metodo">
                              Método actual: {tema.metodo_estudio}
                            </span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>

              {/* Sección de Recomendación */}
              <div className="recomendacion-section">
                {temaSeleccionado ? (
                  <div className="recomendacion-panel">
                    <h2>Recomendación para: {temaSeleccionado.tema_nombre}</h2>
                    <p className="tema-info-recomendacion">
                      <strong>Curso:</strong> {temaSeleccionado.curso_nombre} | 
                      <strong> Dificultad:</strong> {temaSeleccionado.dificultad}
                    </p>
                    
                    <Button
                      onClick={handleObtenerRecomendacion}
                      disabled={cargandoRecomendacion}
                      className="btn-obtener-recomendacion"
                    >
                      {cargandoRecomendacion ? 'Generando...' : 'Obtener Recomendación'}
                    </Button>

                    {recomendacion && (
                      <div className="recomendacion-detalle">
                        <div className="metodo-principal">
                          <h3>Método Principal: {recomendacion.metodo_principal}</h3>
                          {recomendacion.metodo_complementario && (
                            <div className="metodo-complementario">
                              <span>+ {recomendacion.metodo_complementario}</span>
                            </div>
                          )}
                        </div>

                        <div className="descripcion-metodo">
                          <h4>Descripción del Método</h4>
                          <p>{recomendacion.descripcion}</p>
                        </div>

                        <div className="razon-recomendacion">
                          <h4>¿Por qué este método?</h4>
                          <p>{recomendacion.razon}</p>
                        </div>

                        <div className="recomendacion-meta">
                          <p className="fecha-recomendacion">
                            Recomendación generada: {new Date(recomendacion.fecha_recomendacion).toLocaleDateString('es-ES', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="recomendacion-placeholder">
                    <p>👈 Selecciona un tema de la lista para obtener una recomendación personalizada</p>
                    <p className="placeholder-hint">
                      La recomendación se basará en tu perfil de aprendizaje y la dificultad del tema seleccionado.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </>
        )}

        {/* Historial de Recomendaciones */}
        {historial.length > 0 && (
          <div className="historial-section">
            <h2>Historial de Recomendaciones</h2>
            <div className="historial-list">
              {historial.map((rec) => (
                <div key={rec.id} className="historial-item">
                  <div className="historial-header">
                    <h4>{rec.tema_nombre}</h4>
                    <span className="curso-badge">{rec.curso_nombre}</span>
                  </div>
                  <div className="historial-metodos">
                    <span className="metodo-badge principal">{rec.metodo_principal}</span>
                    {rec.metodo_complementario && (
                      <span className="metodo-badge complementario">+ {rec.metodo_complementario}</span>
                    )}
                  </div>
                  <p className="historial-fecha">
                    {new Date(rec.fecha_recomendacion).toLocaleDateString('es-ES', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric'
                    })}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default RecomendacionMetodoPage;

