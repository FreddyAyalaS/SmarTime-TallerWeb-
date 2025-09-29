// src/data/calendarData.js

const calendarData = [
  {
    id: 1,
    tipo: 'Tarea',
    title: 'Diagrama de clases - Arqui de SW',
    realizationDate: '2025-06-30',
    startTime: '10:00',
    endTime: '12:00',
    course: 'Arquitectura de Software',
  },
  {
    id: 2,
    tipo: 'Estudio',
    course: 'Base de Datos II',
    temas: 'Repaso de modelado relacional',
    fecha: '2025-06-30',
    hInicio: '21:00',
    hFin: '22:00',
  },
  {
    id: 3,
    tipo: 'Clase',
    course: 'Redes y transmisión de datos',
    description: 'Clase teórica de protocolo TCP/IP',
    fecha: '2025-06-30',
    hInicio: '08:00',
    hFin: '12:00',
  },
  {
    id: 4,
    tipo: 'Act. no académica',
    description: 'Almuerzo',
    fecha: '2025-06-30',
    hInicio: '12:00',
    hFin: '14:00',
  },
  {
    id: 5,
    tipo: 'Estudio',
    course: 'Inglés',
    temas: 'Taller de conversación',
    fecha: '2025-06-30',
    hInicio: '15:00',
    hFin: '18:00',
  }
];

export default calendarData;