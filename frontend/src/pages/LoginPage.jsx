import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import Input from '../components/Input';
import Button from '../components/Button';
import Card from '../components/Card';
import '../styles/LoginPage.css';
import AppLogo from '../assets/Icons/Logo.png';

import { loginUser } from '../services/authService';

const LoginPage = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const responseData = await loginUser({ username, password });

      if (responseData.access) {
        // Guardamos el token de acceso en localStorage
        localStorage.setItem('authToken', responseData.access);
        // También el refresh token si lo quieres usar más adelante
        localStorage.setItem('refreshToken', responseData.refresh);

        alert('¡Inicio de sesión exitoso!');
        navigate('/dashboard');
      } else {
        setError(responseData.mensaje || 'Respuesta inesperada del servidor.');
      }
    } catch (err) {
      console.error('Error en handleLogin:', err.message);
      setError(err.message || 'Error al iniciar sesión. Verifica tu usuario y contraseña.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-page-container">
      <div className="login-form-section">
        <Card
          title={
            <div className="login-logo-container">
              <img src={AppLogo} alt="SmartTime Logo" className="login-logo-image" />
              <span className="login-app-name">SmartTime</span>
            </div>
          }
          className="login-form-card"
        >
          <h2 className="login-page-title">Iniciar Sesión</h2>

          <Button variant="google" fullWidth className="login-google-button">
            Continuar con Google
          </Button>

          <div className="login-divider-container">
            <hr className="login-divider-line" />
            <span className="login-divider-text">O con su cuenta</span>
            <hr className="login-divider-line" />
          </div>

          <form onSubmit={handleLogin} className="login-form">
            <Input
              label="Usuario"
              type="text"
              name="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Ingresa tu nombre de usuario"
              required
            />
            <Input
              label="Contraseña"
              type="password"
              name="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            {error && <p className="login-form-error-message">{error}</p>}

            <div className="login-forgot-password">
              <Link to="/forgot-password" className="login-link">
                ¿Olvidó su contraseña?
              </Link>
            </div>

            <Button
              type="submit"
              variant="primary"
              fullWidth
              className="login-submit-button"
              disabled={isLoading}
            >
              {isLoading ? 'Ingresando...' : 'Iniciar Sesión'}
            </Button>
          </form>

          <p className="login-signup-prompt">
            ¿Aún no eres miembro?{' '}
            <Link to="/register" className="login-link">
              Regístrate
            </Link>
          </p>
        </Card>
      </div>
      <div className="login-image-section"></div>
    </div>
  );
};

export default LoginPage;
