import React, { useState, useEffect } from 'react';
import { getPreguntasTest, enviarRespuestasTest, getPerfilAprendizaje } from '../services/aprendizajeService';
import Button from '../components/Button';
import '../styles/TestPerfilPage.css';

const TestPerfilPage = () => {
  const [preguntas, setPreguntas] = useState([]);
  const [respuestas, setRespuestas] = useState({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [perfilResultado, setPerfilResultado] = useState(null);
  const [error, setError] = useState(null);
  const [cargandoPerfil, setCargandoPerfil] = useState(true);

  useEffect(() => {
    cargarDatosIniciales();
  }, []);

  const cargarDatosIniciales = async () => {
    try {
      setCargandoPerfil(true);
      setLoading(true);
      // Primero intentar cargar el perfil existente
      const perfilExistente = await getPerfilAprendizaje();
      if (perfilExistente) {
        setPerfilResultado(perfilExistente);
        setCargandoPerfil(false);
        setLoading(false);
        return; // Si hay perfil, no cargar preguntas
      }
    } catch (err) {
      console.log('No hay perfil existente o error al cargar:', err);
    } finally {
      setCargandoPerfil(false);
    }
    
    // Si no hay perfil, cargar preguntas para hacer el test
    await cargarPreguntas();
  };

  const cargarPreguntas = async () => {
    try {
      setLoading(true);
      const data = await getPreguntasTest();
      setPreguntas(data);
      // Inicializar respuestas vacías
      const respuestasIniciales = {};
      data.forEach(pregunta => {
        respuestasIniciales[pregunta.id] = null;
      });
      setRespuestas(respuestasIniciales);
      setError(null);
    } catch (err) {
      console.error('Error al cargar preguntas:', err);
      setError('Error al cargar las preguntas del test. Por favor, intenta nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleRespuestaChange = (preguntaId, valor) => {
    setRespuestas(prev => ({
      ...prev,
      [preguntaId]: valor
    }));
  };

  const todasRespondidas = () => {
    return Object.values(respuestas).every(valor => valor !== null && valor !== undefined);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!todasRespondidas()) {
      alert('Por favor, responde todas las preguntas antes de enviar.');
      return;
    }

    try {
      setSubmitting(true);
      setError(null);
      
      // Convertir respuestas al formato esperado por el backend
      const respuestasArray = Object.entries(respuestas)
        .filter(([pregunta, valor]) => valor !== null && valor !== undefined)
        .map(([pregunta, valor]) => ({
          pregunta: parseInt(pregunta),
          valor: parseInt(valor)
        }));

      // Validar que todas las preguntas tengan respuesta
      if (respuestasArray.length !== preguntas.length) {
        setError('Por favor, responde todas las preguntas antes de enviar.');
        setSubmitting(false);
        return;
      }

      console.log('Enviando respuestas:', respuestasArray);
      const resultado = await enviarRespuestasTest(respuestasArray);
      console.log('Resultado recibido:', resultado);
      setPerfilResultado(resultado);
    } catch (err) {
      console.error('Error al enviar respuestas:', err);
      const errorMessage = err.response?.data?.error || err.message || 'Error al procesar tus respuestas. Por favor, intenta nuevamente.';
      setError(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  const handleActualizarTest = async () => {
    setPerfilResultado(null);
    setCargandoPerfil(false);
    
    // Si no hay preguntas cargadas, cargarlas primero
    if (preguntas.length === 0) {
      await cargarPreguntas();
    } else {
      // Reiniciar respuestas
      const respuestasIniciales = {};
      preguntas.forEach(pregunta => {
        respuestasIniciales[pregunta.id] = null;
      });
      setRespuestas(respuestasIniciales);
    }
  };

  const getMetodoDescripcion = (metodo) => {
    const descripciones = {
      'Pomodoro': 'Técnica Pomodoro: Estudia en bloques cortos de 25 minutos con descansos regulares. Ideal para mantener la concentración y evitar el agotamiento.',
      'Feynman': 'Técnica Feynman: Explica los conceptos como si se los enseñaras a otra persona. Ideal para comprender profundamente los temas.',
      'Leitner': 'Técnica Leitner: Repasa conceptos usando tarjetas de memoria con intervalos espaciados. Ideal para memorizar fórmulas y definiciones.',
    };
    return descripciones[metodo] || `Método ${metodo}`;
  };

  if (loading || cargandoPerfil) {
    return (
      <div className="test-perfil-container">
        <div className="test-perfil-loading">
          <p>{cargandoPerfil ? 'Cargando tu perfil...' : 'Cargando preguntas del test...'}</p>
        </div>
      </div>
    );
  }

  if (perfilResultado) {
    return (
      <div className="test-perfil-container">
        <div className="test-perfil-resultado">
          <h1>Tu Perfil de Aprendizaje</h1>
          <div className="resultado-card">
            <h2>Método Principal</h2>
            <div className="metodo-principal">
              <span className="metodo-nombre">{perfilResultado.metodo_principal}</span>
              <p className="metodo-descripcion">
                {getMetodoDescripcion(perfilResultado.metodo_principal)}
              </p>
            </div>
            
            {perfilResultado.metodo_secundario && (
              <>
                <h3>Método Secundario</h3>
                <div className="metodo-secundario">
                  <span className="metodo-nombre">{perfilResultado.metodo_secundario}</span>
                  <p className="metodo-descripcion">
                    {getMetodoDescripcion(perfilResultado.metodo_secundario)}
                  </p>
                </div>
              </>
            )}

            <p className="fecha-actualizacion">
              Última actualización: {new Date(perfilResultado.fecha_actualizacion).toLocaleDateString('es-PE', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}
            </p>

            <div className="resultado-actions">
              <Button 
                onClick={handleActualizarTest}
                className="btn-actualizar-test"
              >
                Realizar Test Nuevamente
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Si no hay preguntas y no está cargando, mostrar mensaje
  if (preguntas.length === 0 && !loading) {
    return (
      <div className="test-perfil-container">
        <div className="test-perfil-content">
          <h1>Test de Perfil de Aprendizaje</h1>
          <p className="test-intro">
            Cargando preguntas del test...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="test-perfil-container">
      <div className="test-perfil-content">
        <h1>Test de Perfil de Aprendizaje</h1>
        <p className="test-intro">
          Responde las siguientes preguntas para identificar tu perfil de aprendizaje.
          El test tomará aproximadamente 5 minutos.
        </p>

        {error && (
          <div className="test-error">
            <p>{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="test-form">
          {preguntas.length > 0 && preguntas.map((pregunta, index) => (
            <div key={pregunta.id} className="pregunta-item">
              <div className="pregunta-header">
                <span className="pregunta-numero">{index + 1}</span>
                <p className="pregunta-texto">{pregunta.texto}</p>
              </div>
              
              <div className="respuesta-escala">
                <label className="escala-label-inicio">En desacuerdo</label>
                <div className="escala-opciones">
                  {[1, 2, 3, 4, 5].map(valor => (
                    <label key={valor} className="escala-opcion">
                      <input
                        type="radio"
                        name={`pregunta-${pregunta.id}`}
                        value={valor}
                        checked={respuestas[pregunta.id] === valor}
                        onChange={() => handleRespuestaChange(pregunta.id, valor)}
                      />
                      <span className="escala-valor">{valor}</span>
                    </label>
                  ))}
                </div>
                <label className="escala-label-fin">Totalmente de acuerdo</label>
              </div>
            </div>
          ))}

          <div className="test-actions">
            <Button
              type="submit"
              disabled={!todasRespondidas() || submitting}
              className="btn-submit-test"
            >
              {submitting ? "Procesando..." : "Enviar Test"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TestPerfilPage;

