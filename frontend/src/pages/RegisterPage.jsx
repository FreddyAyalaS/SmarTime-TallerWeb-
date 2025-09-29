// src/pages/RegisterPage.jsx
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import Input from '../components/Input'; // Ajusta la ruta si es necesario
import Button from '../components/Button';
import Card from '../components/Card';
import '../styles/RegisterPage.css'; // O tu ruta correcta
import AppLogoIcon from '../assets/Icons/Logo.png';

import { registerUser } from '../services/authService'; // Ajusta la ruta si es necesario

const RegisterPage = () => {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [career, setCareer] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState(''); // Estado para confirmar contraseña

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');

    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden.');
      // No es necesario setIsLoading(false) aquí si la validación es antes de iniciar la carga.
      return;
    }

    setIsLoading(true);

    // --- CAMBIO PRINCIPAL: Incluir el campo de confirmación de contraseña ---
    //    Asegúrate de que el nombre de la propiedad (ej. 'confirmar_password')
    //    coincida EXACTAMENTE con lo que espera tu backend.
    const userData = {
      first_name: name,
      username,
      email,
      fecha_nacimiento: birthDate,
      escuela_profesional: career,
      password,
      confirmar_password: confirmPassword // <--- CAMBIO AQUÍ
      // Si tu backend espera otro nombre, como 'password_confirmation', cámbialo:
      // password_confirmation: confirmPassword,
    };

    try {
      const response = await registerUser(userData); // registerUser en authService.js enviará este objeto userData
      console.log('Registro exitoso desde el componente:', response);
      setSuccessMessage(response.message || '¡Registro exitoso! Serás redirigido.');
      
      // Limpiar formulario después de un registro exitoso
      setName('');
      setUsername('');
      setEmail('');
      setBirthDate('');
      setCareer('');
      setPassword('');
      setConfirmPassword('');

      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (err) {
      console.error('Error en handleRegister (componente):', err.message);
      setError(err.message || 'Error durante el registro. Inténtalo de nuevo.');
    } finally {
      setIsLoading(false);
    }
  };

  // Tus clases CSS (sin cambios)
  const pageContainerClasses = "register-page-container";
  const formSectionClasses = "register-form-section";
  const logoHeaderContainerClasses = "register-logo-header-container";
  const logoImageClasses = "register-logo-image";
  const appNameTextClasses = "register-app-name-text";
  const formCardClasses = "register-form-card";
  const pageTitleClasses = "register-page-title";
  const formClasses = "register-form";
  const submitButtonClasses = "register-submit-button";
  const loginPromptClasses = "register-login-prompt";
  const linkClasses = "register-link";
  const imageSectionClasses = "register-image-section";
  const errorMessageClasses = "register-form-error-message";
  const successMessageClasses = "register-form-success-message";

  return (
    <div className={pageContainerClasses}>
      <div className={formSectionClasses}>
        <Card className={formCardClasses}>
          <div className={logoHeaderContainerClasses}>
            <img src={AppLogoIcon} alt="SmartTime Logo Icono" className={logoImageClasses} />
            <span className={appNameTextClasses}>SmartTime</span>
          </div>
          <h2 className={pageTitleClasses}>Regístrate</h2>

          <form onSubmit={handleRegister} className={formClasses}>
            <Input
              label="Nombre" type="text" name="first_name" placeholder="Ingresa tu nombre completo"
              value={name} onChange={(e) => setName(e.target.value)} required
            />
            <Input
              label="Usuario" type="text" name="username" placeholder="Ingresa tu usuario"
              value={username} onChange={(e) => setUsername(e.target.value)} required
            />
            <Input
              label="Email" type="email" name="email" placeholder="Ingresa tu email"
              value={email} onChange={(e) => setEmail(e.target.value)} required
            />
            <Input
              label="Fecha de nacimiento" type="date" name="fecha_nacimiento" placeholder="YYYY-MM-DD"
              value={birthDate} onChange={(e) => setBirthDate(e.target.value)} required
            />
            <Input
              label="Carrera" type="text" name="escuela_profesional" placeholder="Ingresa tu carrera"
              value={career} onChange={(e) => setCareer(e.target.value)} required
            />
            <Input
              label="Contraseña" type="password" name="password" placeholder="Crea una contraseña"
              value={password} onChange={(e) => setPassword(e.target.value)} required
            />
            <Input // Este ya lo tenías, solo verificamos que se envíe
              label="Confirmar Contraseña"
              type="password"
              name="confirmPassword"
              placeholder="Vuelve a escribir tu contraseña"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />

            {error && <p className={errorMessageClasses}>{error}</p>}
            {successMessage && <p className={successMessageClasses}>{successMessage}</p>}

            <Button
              type="submit"
              variant="primary"
              fullWidth
              className={submitButtonClasses}
              disabled={isLoading}
            >
              {isLoading ? 'Registrando...' : 'Registrarse'}
            </Button>
          </form>

          <p className={loginPromptClasses}>
            ¿Ya tienes una cuenta?{' '}
            <Link to="/login" className={linkClasses}>
              Inicia sesión
            </Link>
          </p>
        </Card>
      </div>
      <div className={imageSectionClasses}></div>
    </div>
  );
};

export default RegisterPage;