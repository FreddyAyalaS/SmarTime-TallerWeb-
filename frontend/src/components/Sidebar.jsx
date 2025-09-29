// src/components/Sidebar/Sidebar.jsx
import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';

import '../styles/Sidebar.css';
import homeIcon from '../assets/Icons/home.svg';
import calendarIcon from '../assets/Icons/calendar.svg';
import logoutIcon from '../assets/Icons/logout.svg';
import settingsIcon from '../assets/Icons/settings.svg';
import statsIcon from '../assets/Icons/stats.svg';
import tasksIcon from '../assets/Icons/tasks.svg';
import antiProcrastinationIcon from '../assets/Icons/anti-procrastination.svg';
import AppLogo from '../assets/Icons/Logo.png';

import { logoutUser } from '../services/authService';

const navItemsData = [
  { id: 'dashboard', text: 'Dashboard', icon: homeIcon, path: '/dashboard' },
  { id: 'calendario', text: 'Calendario', icon: calendarIcon, path: '/calendar' },
  { id: 'tareas', text: 'Tareas', icon: tasksIcon, path: '/tasks' },
  { id: 'modo', text: 'Modo Antiprocrastinación', icon: antiProcrastinationIcon, path: '/anti-procrastination' },
  { id: 'estadistica', text: 'Estadística', icon: statsIcon, path: '/analytics' },
  { id: 'configuracion', text: 'Configuración', icon: settingsIcon, path: '/settings' },
];

const Sidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logoutUser();
      alert('Has cerrado sesión.');
      navigate('/login');
    } catch (error) {
      console.error('Error al cerrar sesión:', error.message);
      alert('Error al cerrar sesión, pero se ha limpiado la sesión local.');
      navigate('/login');
    }
  };

  const allNavItems = [
    ...navItemsData,
    { id: 'logout', text: 'Cerrar Sesión', icon: logoutIcon, action: handleLogout, isLogout: true }
  ];

  return (
    <aside className="app-sidebar-container">
      <div className="app-sidebar-logo-section">
        <img src={AppLogo} alt="SmartTime Logo" className="app-sidebar-logo-image" />
        <span className="app-sidebar-logo-text">SmartTime</span>
      </div>

      <nav className="app-sidebar-nav">
        {allNavItems.map((item) => {
          const isActive = !item.isLogout && (location.pathname === item.path || (item.path && item.path !== "/" && location.pathname.startsWith(item.path)));

          if (item.isLogout) {
            return (
              <div
                key={item.id}
                className="app-sidebar-nav-item app-sidebar-footer"
                onClick={item.action}
                role="button"
                tabIndex={0}
                onKeyPress={(e) => e.key === 'Enter' && item.action()}
              >
                <img src={item.icon} alt={`${item.text} icon`} className="app-sidebar-nav-item-icon" />
                <span className="app-sidebar-nav-item-text">{item.text}</span>
              </div>
            );
          }

          return (
            <Link
              key={item.id}
              to={item.path}
              className={`app-sidebar-nav-item ${isActive ? 'app-sidebar-nav-item-active' : ''}`}
            >
              <img src={item.icon} alt={`${item.text} icon`} className="app-sidebar-nav-item-icon" />
              <span className="app-sidebar-nav-item-text">{item.text}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
};

export default Sidebar;
