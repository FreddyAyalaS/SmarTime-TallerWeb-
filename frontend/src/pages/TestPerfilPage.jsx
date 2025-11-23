import React, { useState, useEffect } from 'react';
import { getPreguntasTest, enviarRespuestasTest } from '../services/aprendizajeService';
import Button from '../components/Button';
import '../styles/TestPerfilPage.css';

const TestPerfilPage = () => {
  const [preguntas, setPreguntas] = useState([]);
  const [respuestas, setRespuestas] = useState({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [perfilResultado, setPerfilResultado] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    cargarPreguntas();
  }, []);

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
      const respuestasArray = Object.entries(respuestas).map(([pregunta, valor]) => ({
        pregunta: parseInt(pregunta),
        valor: parseInt(valor)
      }));

      const resultado = await enviarRespuestasTest(respuestasArray);
      setPerfilResultado(resultado);
    } catch (err) {
      console.error('Error al enviar respuestas:', err);
      setError('Error al procesar tus respuestas. Por favor, intenta nuevamente.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleActualizarTest = () => {
    setPerfilResultado(null);
    // Reiniciar respuestas
    const respuestasIniciales = {};
    preguntas.forEach(pregunta => {
      respuestasIniciales[pregunta.id] = null;
    });
    setRespuestas(respuestasIniciales);
  };

  const getMetodoDescripcion = (metodo) => {
    const descripciones = {
      'Pomodoro': 'Técnica Pomodoro: Estudia en bloques cortos de 25 minutos con descansos regulares. Ideal para mantener la concentración y evitar el agotamiento.',
      'Feynman': 'Técnica Feynman: Explica los conceptos como si se los enseñaras a otra persona. Ideal para comprender profundamente los temas.',
      'Leitner': 'Técnica Leitner: Repasa conceptos usando tarjetas de memoria con intervalos espaciados. Ideal para memorizar fórmulas y definiciones.',
    };
    return descripciones[metodo] || `Método ${metodo}`;
  };

  if (loading) {
    return (
      <div className="test-perfil-container">
        <div className="test-perfil-loading">
          <p>Cargando preguntas del test...</p>
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
          {preguntas.map((pregunta, index) => (
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

