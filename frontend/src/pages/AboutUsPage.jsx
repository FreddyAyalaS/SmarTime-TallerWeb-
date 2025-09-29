import React from 'react';
import lp2Image from '../assets/Icons/lp2.svg';

// Importar el archivo CSS
import '../styles/AboutUsPage.css';

const AboutUsPage = () => {
  return (
    <div className="about-us-page-container">
      <h1 className="about-us-title">¿Quiénes somos?</h1>

      <div className="about-us-content">
        <div className="about-us-description">
          <p>
            En Smart-Time, somos más que una aplicación; somos tus aliados en el camino hacia el éxito académico.
            Entendemos que la vida de estudiante puede ser un torbellino de plazos, exámenes y la constante búsqueda de equilibrio.
          </p>
          <img src={lp2Image} alt="¿Quiénes somos?" className="about-us-image" />
        </div>

        <div className="about-us-details">
          <div className="about-us-mission">
            <h2>Nuestra misión</h2>
            <p>
              Empoderarte. Queremos que dejes de sentirte abrumado y que organices tus estudios fácilmente, para que puedas concentrarte en aprender y crecer, no solo en sobrevivir a las entregas.
            </p>
          </div>

          <div className="about-us-why">
            <h2>¿Por qué Smart-Time?</h2>
            <p>
              Porque también hemos estado ahí. Smart-Time nació de la necesidad de una herramienta que realmente comprendiera los desafíos únicos de los estudiantes y ofreciera soluciones inteligentes, no solo listas de tareas.
              Creímos que se podía hacer mejor, y por eso estamos aquí.
            </p>
          </div>

          <div className="about-us-values">
            <h2>Nuestros valores</h2>
            <ul>
              <li>Tu Éxito Primero: Cada función está diseñada pensando en ti.</li>
              <li>Inteligencia Práctica: Usamos la tecnología para darte sugerencias que realmente ayudan.</li>
              <li>Simplicidad Poderosa: Fácil de usar, para que no pierdas tiempo aprendiendo a usarla.</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AboutUsPage;