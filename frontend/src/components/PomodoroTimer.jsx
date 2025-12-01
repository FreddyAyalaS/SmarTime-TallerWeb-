import React, { useState, useEffect, useRef } from 'react';
import '../styles/PomodoroTimer.css';

const PomodoroTimer = ({ sesion, onClose, onComplete }) => {
  const [timeLeft, setTimeLeft] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [currentPhase, setCurrentPhase] = useState('estudio'); // 'estudio' o 'descanso'
  const [cycleCount, setcycleCount] = useState(1);
  const intervalRef = useRef(null);

  // Configuración Pomodoro según el método
  const pomodoroConfig = {
    Pomodoro: {
      estudio: 25,
      descanso: 5,
      ciclos: 4
    },
    Feynman: {
      estudio: 30,
      descanso: 10,
      ciclos: 3
    },
    Leitner: {
      estudio: 20,
      descanso: 5,
      ciclos: 5
    }
  };

  const config = pomodoroConfig[sesion.metodo_estudio] || pomodoroConfig.Pomodoro;

  useEffect(() => {
    // Inicializar con tiempo de estudio
    setTimeLeft(config.estudio * 60);
  }, []);

  useEffect(() => {
    if (isRunning && timeLeft > 0) {
      intervalRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            // Tiempo terminado
            handlePhaseComplete();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRunning, timeLeft]);

  const handlePhaseComplete = () => {
    setIsRunning(false);
    
    if (currentPhase === 'estudio') {
      // Cambiar a descanso
      setCurrentPhase('descanso');
      setTimeLeft(config.descanso * 60);
      // Reproducir sonido de notificación si está disponible
      playNotificationSound();
    } else {
      // Descanso terminado, volver a estudio
      setcycleCount(prev => prev + 1);
      
      if (cycleCount >= config.ciclos) {
        // Sesión completa
        alert('¡Sesión de estudio completada! 🎉');
        if (onComplete) onComplete();
        onClose();
      } else {
        setCurrentPhase('estudio');
        setTimeLeft(config.estudio * 60);
        playNotificationSound();
      }
    }
  };

  const playNotificationSound = () => {
    // Reproducir sonido simple
    try {
      const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBzvLaiTcIGWi77eefTRAMUKfj8LZjHAY4ktfyy3ksBSR3x/DdkEAKFF606+uoVRQKRp/g8r5sIQUrjKn1'); 
      audio.play().catch(() => {});
    } catch (e) {
      console.log('No se pudo reproducir sonido');
    }
  };

  const handleStart = () => {
    setIsRunning(true);
  };

  const handlePause = () => {
    setIsRunning(false);
  };

  const handleReset = () => {
    setIsRunning(false);
    setCurrentPhase('estudio');
    setcycleCount(1);
    setTimeLeft(config.estudio * 60);
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getProgress = () => {
    const totalTime = currentPhase === 'estudio' ? config.estudio * 60 : config.descanso * 60;
    return ((totalTime - timeLeft) / totalTime) * 100;
  };

  return (
    <div className="pomodoro-overlay" onClick={onClose}>
      <div className="pomodoro-modal" onClick={(e) => e.stopPropagation()}>
        <button className="pomodoro-close" onClick={onClose}>×</button>
        
        <div className="pomodoro-header">
          <h2>⏱️ {sesion.tema_nombre}</h2>
          <p className="pomodoro-course">{sesion.curso_nombre}</p>
          <p className="pomodoro-method">Método: {sesion.metodo_estudio}</p>
        </div>

        <div className="pomodoro-body">
          <div className="pomodoro-cycle-info">
            <span className="cycle-badge">Ciclo {cycleCount} de {config.ciclos}</span>
            <span className={`phase-badge ${currentPhase}`}>
              {currentPhase === 'estudio' ? '📚 Estudiando' : '☕ Descanso'}
            </span>
          </div>

          <div className="pomodoro-timer-display">
            <svg className="progress-ring" width="200" height="200">
              <circle
                className="progress-ring-circle-bg"
                cx="100"
                cy="100"
                r="85"
              />
              <circle
                className="progress-ring-circle"
                cx="100"
                cy="100"
                r="85"
                style={{
                  strokeDasharray: `${2 * Math.PI * 85}`,
                  strokeDashoffset: `${2 * Math.PI * 85 * (1 - getProgress() / 100)}`
                }}
              />
            </svg>
            <div className="timer-text">
              {formatTime(timeLeft)}
            </div>
          </div>

          <div className="pomodoro-controls">
            {!isRunning ? (
              <button className="btn-timer btn-start" onClick={handleStart}>
                ▶ Iniciar
              </button>
            ) : (
              <button className="btn-timer btn-pause" onClick={handlePause}>
                ⏸ Pausar
              </button>
            )}
            <button className="btn-timer btn-reset" onClick={handleReset}>
              🔄 Reiniciar
            </button>
          </div>

          <div className="pomodoro-info">
            <div className="info-item">
              <span className="info-label">Estudio:</span>
              <span className="info-value">{config.estudio} min</span>
            </div>
            <div className="info-item">
              <span className="info-label">Descanso:</span>
              <span className="info-value">{config.descanso} min</span>
            </div>
            <div className="info-item">
              <span className="info-label">Dificultad:</span>
              <span className={`difficulty-badge ${sesion.dificultad}`}>
                {sesion.dificultad}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PomodoroTimer;
