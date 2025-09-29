// src/pages/LandingPageScroll.jsx
import React, { useRef } from 'react';

import '../styles/LandingPageScroll.css';

import Logo from '../assets/Icons/logo.svg';
import ChicoSmartTime from '../assets/Icons/chico-smartime.svg';
import lp2Image from '../assets/Icons/lp2.svg';
import UniversityIcon from '../assets/Icons/universidad.svg';
import BrainBookIcon from '../assets/Icons/libro-cerebro.svg';
import AntiProcrastinationIcon from '../assets/Icons/anti-procrastination.svg';
import facebookIcon from '../assets/Icons/facebook.svg';
import instagramIcon from '../assets/Icons/instagram.svg';
import twitterIcon from '../assets/Icons/twitter.svg';
import youtubeIcon from '../assets/Icons/youtube.svg';

const LandingPageScroll = () => {
    const quienesSomosRef = useRef(null);
    const funcionalidadesRef = useRef(null);
    const contactoRef = useRef(null);

    const scrollTo = (ref) => {
        ref.current?.scrollIntoView({ behavior: 'smooth' });
    };

    return (
        <div className="landing-page-container">
            {/* HEADER */}
            <header className="header">
                <nav className="navbar">
                    <div className="logo-container">
                        <img src={Logo} alt="SmartTime Logo" className="logo" />
                        <span className="site-title">SmartTime</span>
                    </div>
                    <ul className="menu">
                        <li onClick={() => scrollTo(quienesSomosRef)} className="menu-link">¿Quiénes somos?</li>
                        <li onClick={() => scrollTo(funcionalidadesRef)} className="menu-link">Funcionalidades</li>
                        <li onClick={() => scrollTo(contactoRef)} className="menu-link">Contáctanos</li>
                    </ul>
                    <a href="/login" className="login-button">Iniciar Sesión</a>
                </nav>
            </header>

            {/* HERO */}
            <main className="main-content">
                <section className="section-container">
                    <div className="text-and-image-section">
                        <div className="text-section">
                            <h1 className="title">
                                Deja de sentirte abrumado.<br />
                                Organiza tus estudios fácilmente con <span className="highlight">Smart-Time</span>
                            </h1>
                            <p className="description">
                                Organiza tu vida académica sin esfuerzo. Smart-Time te ayuda a planificar sesiones, seguir tareas y cumplir plazos.
                                Concéntrate mejor con el <span className="bold-text">modo anti-procrastinación</span> y optimiza tu rutina con <span className="bold-text">sugerencias inteligentes</span>.
                                Di adiós al estrés y hola a la productividad con nuestra plataforma intuitiva todo en uno.
                            </p>
                        </div>
                        <div className="image-section">
                            <img src={ChicoSmartTime} alt="Estudiante usando Smart-Time" className="hero-image" />
                        </div>
                    </div>
                </section>
            </main>

            {/* QUIÉNES SOMOS */}
            <section ref={quienesSomosRef} className="section-container">
                <h1 className="about-us-title">¿Quiénes somos?</h1>
                <div className="about-us-content">
                    <div className="about-us-description">
                        <p>En Smart-Time, somos más que una aplicación; somos tus aliados en el camino hacia el éxito académico. Entendemos que la vida de estudiante puede ser un torbellino de plazos, exámenes y la constante búsqueda de equilibrio.</p>
                        <img src={lp2Image} alt="¿Quiénes somos?" className="about-us-image" />
                    </div>
                    <div className="about-us-details">
                        <div className="about-us-mission">
                            <h2>Nuestra misión</h2>
                            <p>Empoderarte. Queremos que dejes de sentirte abrumado y que organices tus estudios fácilmente, para que puedas concentrarte en aprender y crecer, no solo en sobrevivir a las entregas.</p>
                        </div>
                        <div className="about-us-why">
                            <h2>¿Por qué Smart-Time?</h2>
                            <p>Porque también hemos estado ahí. Smart-Time nació de la necesidad de una herramienta que realmente comprendiera los desafíos únicos de los estudiantes y ofreciera soluciones inteligentes, no solo listas de tareas. Creímos que se podía hacer mejor, y por eso estamos aquí. </p>
                        </div>
                        <div className="about-us-values">
                            <h2>Nuestros valores</h2>
                            <ul>
                                <li>Tu Éxito Primero: Cada función está diseñada pensando en ti.</li>
                                <li>Inteligencia Práctica: Usamos la tecnología para darte sugerencias que realmente ayudan.</li>
                                <li>Simplicidad Poderosa: Fácil de usar, para que no pierdas tiempo aprendiendo a usarla.</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </section>

            {/* FUNCIONALIDADES */}
            <section ref={funcionalidadesRef} className="section-container">
                <h1 className="features-title">Funcionalidades</h1>
                <div className="features-grid">
                    <div className="feature-card">
                        <img src={UniversityIcon} alt="Planificación" className="feature-icon" />
                        <h2>Planificación y Organización Integral</h2>
                        <p>Visualiza tu mes, semana y día. Añade tareas, exámenes, bloques de estudio y eventos personales, todo en un solo lugar.</p>
                    </div>
                    <div className="feature-card down">
                        <img src={BrainBookIcon} alt="Asistente IA" className="feature-icon" />
                        <h2>Asistente con IA</h2>
                        <p>Recibe sugerencias personalizadas para optimizar tu horario, equilibrar tu carga de trabajo, y prepararte mejor para tus evaluaciones.</p>
                    </div>
                    <div className="feature-card">
                        <img src={AntiProcrastinationIcon} alt="Modo enfoque" className="feature-icon" />
                        <h2>Modo Anti-Procrastinación</h2>
                        <p>Minimiza las distracciones activando el modo enfoque. Configura el bloqueo de sitios web que te hacen perder tiempo durante tus sesiones de estudio.</p>
                    </div>
                </div>
            </section>

            {/* CONTACTO */}
            <div className="section-container"> {/* Contenedor principal para la disposición lado a lado */}
                <div className="contact-icon-container"> {/* Contenedor para el icono */}
                    {/* Usa la imagen del calendario aquí si es diferente del logo principal */}
                    <img src={Logo} alt="SmartTime Contact Icon" className="contact-main-icon" />
                </div>
                <div className="contact-info-container"> {/* Contenedor para toda la información de la derecha */}

                    {/* Bloque: Aprende más */}
                    <div className='contact-info-block'>
                        <h2>Aprende más</h2>
                        <div className="contact-items-flex"> {/* Contenedor para items en línea horizontal */}
                            <span>SmartWork</span>
                            <span>Trabajo</span>
                            <span>Contáctanos</span>
                        </div>
                    </div>

                    {/* Bloque: Contáctanos */}
                    <div className='contact-info-block'>
                        <h2>Contáctanos</h2>
                        <div className="contact-items-flex"> {/* Contenedor para items en línea horizontal */}
                            <span>Teléfono: 999999999</span>
                            <span>Correo: smart.time@gmail.com</span>
                        </div>
                    </div>

                    {/* Bloque: Redes Sociales */}
                    <div className='contact-info-block'>
                        <h2>Redes Sociales</h2>
                        <div className="contact-items-flex social-icons-flex"> {/* Contenedor para íconos en línea horizontal */}
                            <img src={facebookIcon} alt="Facebook" className="social-icon" />
                            <img src={instagramIcon} alt="Instagram" className="social-icon" />
                            <img src={twitterIcon} alt="Twitter" className="social-icon" />
                            <img src={youtubeIcon} alt="YouTube" className="social-icon" />
                        </div>
                    </div>

                </div>
            </div>

            {/* FOOTER */}
            <footer className="footer">
                <p>© 2025 SmartTime | All Rights Reserved</p>
            </footer>
        </div>
    );
};

export default LandingPageScroll;
