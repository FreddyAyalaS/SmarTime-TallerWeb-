// src/pages/AntiProPage.jsx
import React, { useState, useEffect } from 'react';
import '../styles/AntiProPage.css';

const AntiProPage = () => {
  const [isActive, setIsActive] = useState(false);
  const [blockedSites, setBlockedSites] = useState([]);
  const [newSite, setNewSite] = useState('');
  const [hours, setHours] = useState('00');
  const [minutes, setMinutes] = useState('00');
  const [remainingTime, setRemainingTime] = useState(null);

  useEffect(() => {
    let timer;
    if (isActive && remainingTime > 0) {
      timer = setInterval(() => {
        setRemainingTime((prev) => prev - 1);
      }, 1000);
    } else if (remainingTime === 0) {
      setIsActive(false);
    }
    return () => clearInterval(timer);
  }, [isActive, remainingTime]);

  const handleToggle = () => {
    const totalSeconds = parseInt(hours) * 3600 + parseInt(minutes) * 60;
    setIsActive((prev) => !prev);
    if (!isActive && totalSeconds > 0) {
      setRemainingTime(totalSeconds);
    }
  };

  const handleAddSite = () => {
    if (newSite && !blockedSites.includes(newSite)) {
      setBlockedSites([...blockedSites, newSite]);
      setNewSite('');
    }
  };

  const handleRemoveSite = (site) => {
    setBlockedSites(blockedSites.filter((s) => s !== site));
  };

  const formatTime = (seconds) => {
    const h = String(Math.floor(seconds / 3600)).padStart(2, '0');
    const m = String(Math.floor((seconds % 3600) / 60)).padStart(2, '0');
    const s = String(seconds % 60).padStart(2, '0');
    return `${h}:${m}:${s}`;
  };

  return (
    <div className="antipro-container">
      <h2>Modo Antiprocrastinación</h2>

      <div className="antipro-section">
        <label>Activar modo antiprocrastinación</label>
        <label className="switch">
          <input type="checkbox" checked={isActive} onChange={handleToggle} />
          <span className="slider round"></span>
        </label>
        {remainingTime !== null && isActive && (
          <p>Tiempo restante: {formatTime(remainingTime)}</p>
        )}
      </div>

      <div className="antipro-section">
        <h3>Sitios bloqueados</h3>
        <input
          type="text"
          placeholder="Escribir url de sitio web"
          value={newSite}
          onChange={(e) => setNewSite(e.target.value)}
        />
        <button className="add-site-btn" onClick={handleAddSite}>+ agregar sitio</button>

        <ul className="site-list">
          {blockedSites.map((site, i) => (
            <li key={i}>
              {site}
              <button className="remove-btn" onClick={() => handleRemoveSite(site)}>❌</button>
            </li>
          ))}
        </ul>
      </div>

      <div className="antipro-section">
        <h3>Duración del bloqueo</h3>
        <input
          type="number"
          min="0"
          max="99"
          value={hours}
          onChange={(e) => setHours(e.target.value)}
          placeholder="Horas"
        />
        <input
          type="number"
          min="0"
          max="59"
          value={minutes}
          onChange={(e) => setMinutes(e.target.value)}
          placeholder="Minutos"
        />
      </div>
    </div>
  );
};

export default AntiProPage;