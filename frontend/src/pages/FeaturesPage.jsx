import React from 'react';
import UniversityIcon from '../assets/Icons/universidad.svg';
import BrainBookIcon from '../assets/Icons/libro-cerebro.svg';
import AntiProcrastinationIcon from '../assets/Icons/anti-procrastination.svg';

// Importar el archivo CSS
import '../styles/FeaturesPage.css';

const FeaturesPage = () => {
  return (
    <div className="features-page-container">
      <h1 className="features-title">Funcionalidades</h1>

      <div className="features-grid">
        <div className="feature-card">
          <img src={UniversityIcon} alt="Planificación y Organización Integral" className="feature-icon" />
          <h2>Planificación y Organización Integral</h2>
          <p>
            Visualiza tu mes, semana y día. Añade tareas, exámenes, bloques de estudio y eventos personales, todo en un solo lugar.
          </p>
        </div>

        <div className="feature-card down">
          <img src={BrainBookIcon} alt="Asistente con Inteligencia Artificial" className="feature-icon" />
          <h2>Asistente con Inteligencia Artificial</h2>
          <p>
            Recibe sugerencias personalizadas para optimizar tu horario, equilibrar tu carga de trabajo, y prepararte mejor para tus evaluaciones.
          </p>
        </div>

        <div className="feature-card">
          <img src={AntiProcrastinationIcon} alt="Modo Anti-Procrastinación y Enfoque" className="feature-icon" />
          <h2>Modo Anti-Procrastinación y Enfoque</h2>
          <p>
            Minimiza las distracciones activando el modo enfoque. Configura el bloqueo de sitios web que te hacen perder tiempo durante tus sesiones de estudio.
          </p>
        </div>
      </div>
    </div>
  );
};

export default FeaturesPage;