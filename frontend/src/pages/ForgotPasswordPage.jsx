// src/pages/ForgotPasswordPage.jsx
import React, { useState } from 'react';
import { Link } from 'react-router-dom';

import Input from '../components/Input';
import Button from '../components/Button';
import Card from '../components/Card';
import '../styles/ForgotPasswordPage.css'; 

// 1. IMPORTA LA FUNCIÓN DEL SERVICIO
import { requestPasswordReset } from '../services/authService'; // Ajusta la ruta

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [isError, setIsError] = useState(false); // Para diferenciar el estilo del mensaje

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage('');
    setIsError(false);

    try {
      const response = await requestPasswordReset(email);
      console.log('Solicitud de restablecimiento (componente):', response);
      setMessage(response.message || 'Solicitud enviada con éxito. Revisa tu correo.');
      setIsError(false);
      // setEmail(''); // Opcional: limpiar el campo
    } catch (err) {
      console.error('Error en handleSubmit de ForgotPassword (componente):', err.message);
      setMessage(err.message || 'Error al procesar la solicitud.');
      setIsError(true);
    } finally {
      setIsLoading(false);
    }
  };

  const pageContainerClasses = "forgot-password-page-container";
  const formClasses = "forgot-password-form";
  const submitButtonClasses = "forgot-password-submit-button";
  const messageClasses = `forgot-password-message ${isError ? 'error' : 'success'}`;

  return (
    <div className={pageContainerClasses}>
      <Card title="SmartTime" className="forgot-password-form-card" titleClassName="forgot-password-app-name">
        <h2 className="forgot-password-page-title">¿Olvidaste tu contraseña?</h2>
        <p className="forgot-password-instructions">
          Ingresa tu correo electrónico y te enviaremos un enlace para restablecer tu contraseña.
        </p>

        {message && <p className={messageClasses}>{message}</p>}

        <form onSubmit={handleSubmit} className={formClasses}>
          <Input
            label="Correo Electrónico" type="email" name="email" placeholder="tuemail@ejemplo.com"
            value={email} onChange={(e) => setEmail(e.target.value)} required
          />
          <Button type="submit" variant="primary" fullWidth className={submitButtonClasses} disabled={isLoading}>
            {isLoading ? 'Enviando...' : 'Enviar Enlace de Restablecimiento'}
          </Button>
        </form>
        <div className="forgot-password-back-link">
          <Link to="/login" className="link-styled">Volver a Iniciar Sesión</Link>
        </div>
      </Card>
    </div>
  );
};
export default ForgotPasswordPage;