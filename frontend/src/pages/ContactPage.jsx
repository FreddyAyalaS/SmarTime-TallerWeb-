import React from 'react';
import logoImage from '../assets/Icons/logo.svg'; // Logo principal
import calendarIcon from '../assets/Icons/calendar.svg'; // Icono del calendario
import facebookIcon from '../assets/Icons/facebook.svg'; // Logo de Facebook
import instagramIcon from '../assets/Icons/instagram.svg'; // Logo de Instagram
import twitterIcon from '../assets/Icons/twitter.svg'; // Logo de Twitter
import youtubeIcon from '../assets/Icons/youtube.svg'; // Logo de YouTube

import '../styles/ContactPage.css';


const ContactPage = () => {
    return (
        <div className="content">

            
            {/* Header */}
            <div className="logo-container">
                <img src={logoImage} alt="SmartTime Logo" className="imagen" />
            </div>


            {/* Main Content */}
            <main className="cuadros-container">
                <section className="bg-white rounded-lg shadow-md p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Aprende más */}
                    <div className='cuadro aprende-mas'>
                        <h2 className="text-lg font-bold mb-4">Aprende más</h2>
                        <div className="flex items-center mb-2">
                            SmartWork
                        </div>
                        <div className="flex items-center mb-2">
                            Trabajo
                        </div>
                        <div className="flex items-center">
                            Contáctanos
                        </div>
                    </div>

                    {/* Contáctanos */}
                    <div className='cuadro'>
                        <h2 className="text-lg font-bold mb-4">Contáctanos</h2>
                        <div className="flex items-center mb-2">
                            Teléfono: 999999999
                        </div>
                        <div className="flex items-center">
                            Correo: smart.time@gmail.com
                        </div>
                    </div>

                    {/* Redes Sociales */}
                    <div className='cuadro'>
                        <h2 className="text-lg font-bold mb-4">Redes Sociales</h2>
                        <div className="flex space-x-4">
                            <a href="#" className="redes-logo">
                                <img src={facebookIcon} alt="Facebook" className="w-6 h-6" />
                            </a>
                            <a href="#" className="redes-logo">
                                <img src={instagramIcon} alt="Instagram" className="w-6 h-6" />
                            </a>
                            <a href="#" className="redes-logo">
                                <img src={twitterIcon} alt="Twitter" className="w-6 h-6" />
                            </a>
                            <a href="#" className="redes-logo">
                                <img src={youtubeIcon} alt="YouTube" className="w-6 h-6" />
                            </a>
                        </div>
                    </div>
                </section>
            </main>

            {/* Footer */}
            <footer className="footer">
                <p>© 2025 SmartTime | All Rights Reserved</p>
            </footer>
        </div>
    );
};

export default ContactPage;