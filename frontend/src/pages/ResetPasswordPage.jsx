import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';

import Input from '../components/Input';
import Button from '../components/Button';
import Card from '../components/Card';
import '../styles/ResetPasswordPage.css';

import { resetPasswordWithToken } from '../services/authService';

const ResetPasswordPage = () => {
  const { uidb64, token } = useParams();
  console.log("uidb64:", uidb64);
  console.log("token:", token); // ✅ capturar ambos
  const navigate = useNavigate();

  const [password, setPassword] = useState('');
  const [confirmar_password, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirmar_password) {
      setError('Las contraseñas no coinciden.');
      return;
    }
    if (!uidb64 || !token) {
      setError('Enlace de restablecimiento inválido.');
      return;
    }

    setIsLoading(true);
    setError('');
    setSuccessMessage('');

    try {
      const response = await resetPasswordWithToken( uidb64,token, password, confirmar_password);
      setSuccessMessage(response.mensaje || '¡Contraseña restablecida con éxito! Ya puedes iniciar sesión.');
      alert('¡Contraseña restablecida!');
      setTimeout(() => navigate('/login'), 2000);
    } catch (err) {
      setError(err.message || 'Error al restablecer la contraseña.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="reset-password-page-container">
      <Card title="SmartTime" className="reset-password-form-card" titleClassName="reset-password-app-name">
        <h2 className="reset-password-page-title">Establecer Nueva Contraseña</h2>

        <form onSubmit={handleSubmit} className="reset-password-form">
          <Input
            label="Nueva Contraseña"
            type="password"
            name="password"
            placeholder="Ingresa tu nueva contraseña"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <Input
            label="Confirmar Nueva Contraseña"
            type="password"
            name="confirmar_password"
            placeholder="Confirma tu nueva contraseña"
            value={confirmar_password}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />

          {error && <p className="reset-password-error-message">{error}</p>}
          {successMessage && <p className="reset-password-success-message">{successMessage}</p>}

          <Button
            type="submit"
            variant="primary"
            fullWidth
            className="reset-password-submit-button"
            disabled={isLoading || !!successMessage}
          >
            {isLoading ? 'Estableciendo...' : 'Restablecer Contraseña'}
          </Button>
        </form>

        {successMessage && (
          <div className="reset-password-login-link-container">
            <Link to="/login" className="link-styled">
              Ir a Iniciar Sesión
            </Link>
          </div>
        )}
      </Card>
    </div>
  );
};

export default ResetPasswordPage;
