import React, { useState, useEffect } from 'react';
import '../styles/SettingsPage.css';
import Input from '../components/Input';
import Button from '../components/Button';
import config from '../config';

const userService = config.USE_MOCK_USER_SERVICE
  ? require('../services/userService.mock')
  : require('../services/userService');

const {
  getUserProfile,
  updateUserProfile,
  // updateUserPreferences, // ❌ Eliminado, ya no usamos backend para preferencias
} = userService;

const EditProfileSection = () => {
  const sectionClasses = "settings-edit-profile-section";
  const formContainerClasses = "settings-form-container";
  const profilePictureContainerClasses = "settings-profile-picture-container";
  const profilePictureClasses = "settings-profile-picture";
  const changePhotoButtonClasses = "settings-change-photo-button";
  const formClasses = "settings-profile-form";
  const saveButtonContainerClasses = "settings-save-button-container";

  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');
  const [career, setCareer] = useState('');
  const [birthDate, setBirthDate] = useState('');

  useEffect(() => {
    getUserProfile()
      .then((data) => {
        setName(data.first_name || '');
        setUsername(data.username || '');
        setEmail(data.email || '');
        setCareer(data.escuela_profesional || '');
        setBirthDate(data.fecha_nacimiento || '');
      })
      .catch((err) => console.error('Error al obtener perfil:', err));
  }, []);

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    try {
      await updateUserProfile({
        first_name: name,
        username,
        email,
        escuela_profesional: career,
        fecha_nacimiento: birthDate,
        ...(password && { password }),
      });
      alert('Perfil actualizado con éxito');
    } catch (err) {
      console.error('Error al actualizar perfil:', err);
      alert('Error al guardar los cambios');
    }
  };

  return (
    <div className={sectionClasses}>
      <div className={formContainerClasses}>
        <form onSubmit={handleProfileSubmit} className={formClasses}>
          <Input label="Nombre real:   " name="name" value={name} onChange={(e) => setName(e.target.value)} />
          <Input label="Nombre de Usuario:   " name="username" value={username} onChange={(e) => setUsername(e.target.value)} />
          <Input label="Contraseña:   " name="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Nueva contraseña (opcional)" />
          <Input label="Email:   " name="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
          <Input label="Carrera:   " name="career" value={career} onChange={(e) => setCareer(e.target.value)} />
          <Input label="Fecha de nacimiento:   " name="birthDate" value={birthDate} onChange={(e) => setBirthDate(e.target.value)} />
          <div className={saveButtonContainerClasses}>
            <Button type="submit" variant="success">Guardar</Button>
          </div>
        </form>
      </div>
      <div className={profilePictureContainerClasses}>
        <div className={profilePictureClasses}>
          <span style={{ fontSize: '5rem' }}>👤</span>
        </div>
        <Button variant="secondary" className={changePhotoButtonClasses}>Cambiar foto</Button>
      </div>
    </div>
  );
};

const ToggleSwitch = ({ label, checked, onChange, name }) => {
  const switchContainer = "settings-toggle-switch-container";
  const switchLabel = "settings-toggle-label";

  return (
    <div className={switchContainer}>
      <label htmlFor={name} className={switchLabel}>{label}</label>
      <label className="relative inline-flex items-center cursor-pointer">
        <input type="checkbox" id={name} name={name} checked={checked} onChange={onChange} className="sr-only peer" />
        <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-focus:ring-2 peer-checked:bg-blue-600"></div>
      </label>
    </div>
  );
};

const PreferencesSection = () => {
  const sectionClasses = "settings-preferences-section";
  const preferenceItemClasses = "settings-preference-item";
  const saveButtonContainerClasses = "settings-save-button-container";

  const [antiProcrastination, setAntiProcrastination] = useState(false);
  const [notifications, setNotifications] = useState(true);
  const [suggestions, setSuggestions] = useState(false);
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    const storedPrefs = JSON.parse(localStorage.getItem('userPreferences')) || {};
    setAntiProcrastination(storedPrefs.antiProcrastination ?? false);
    setNotifications(storedPrefs.notifications ?? true);
    setSuggestions(storedPrefs.suggestions ?? false);
    setDarkMode(storedPrefs.darkMode ?? false);
  }, []);

  const handlePreferencesSubmit = () => {
    const preferences = {
      antiProcrastination,
      notifications,
      suggestions,
      darkMode
    };
    localStorage.setItem('userPreferences', JSON.stringify(preferences));
    alert('Preferencias guardadas');
  };

  return (
    <div className={sectionClasses}>
      <div className={preferenceItemClasses}>
        <ToggleSwitch label="Activar Modo Anti-Procrastinación" name="antiProcrastination" checked={antiProcrastination} onChange={() => setAntiProcrastination(!antiProcrastination)} />
      </div>
      <div className={preferenceItemClasses}>
        <ToggleSwitch label="Activar Notificaciones" name="notifications" checked={notifications} onChange={() => setNotifications(!notifications)} />
      </div>
      <div className={preferenceItemClasses}>
        <ToggleSwitch label="Activar Sugerencias" name="suggestions" checked={suggestions} onChange={() => setSuggestions(!suggestions)} />
      </div>
      <div className={preferenceItemClasses}>
        <ToggleSwitch label="Activar Modo Oscuro" name="darkMode" checked={darkMode} onChange={() => setDarkMode(!darkMode)} />
      </div>
      <div className={saveButtonContainerClasses}>
        <Button variant="success" onClick={handlePreferencesSubmit}>Guardar</Button>
      </div>
    </div>
  );
};

const SettingsPage = () => {
  const [activeTab, setActiveTab] = useState('profile');

  const pageContainerClasses = "settings-page-container";
  const tabsContainerClasses = "settings-tabs-container";
  const tabButtonClasses = "settings-tab-button";
  const tabButtonActiveClasses = "settings-tab-button-active";
  const tabContentClasses = "settings-tab-content";

  return (
    <div className={pageContainerClasses}>
      <div className={tabsContainerClasses}>
        <button
          className={`${tabButtonClasses} ${activeTab === 'profile' ? tabButtonActiveClasses : ''}`}
          onClick={() => setActiveTab('profile')}
        >
          Editar Perfil
        </button>
        <button
          className={`${tabButtonClasses} ${activeTab === 'preferences' ? tabButtonActiveClasses : ''}`}
          onClick={() => setActiveTab('preferences')}
        >
          Preferencias
        </button>
      </div>
      <div className={tabContentClasses}>
        {activeTab === 'profile' && <EditProfileSection />}
        {activeTab === 'preferences' && <PreferencesSection />}
      </div>
    </div>
  );
};

export default SettingsPage;
