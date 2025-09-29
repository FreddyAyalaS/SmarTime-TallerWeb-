export const notificationsData = [
  {
    id: 'notif-001',
    type: 'new_task', // Para un posible ícono o estilo diferente
    message: 'Se te asignó una nueva tarea: "Investigación de Mercado".',
    timestamp: 'Hace 5 minutos', // O un objeto Date real si quieres formatearlo
    isRead: false,
    link: '/tasks/task-001', // Opcional: enlace a la tarea/evento
  },
  {
    id: 'notif-002',
    type: 'reminder',
    message: 'Recordatorio: Entrega de "Diagrama de Clases" vence mañana.',
    timestamp: 'Hace 1 hora',
    isRead: false,
    link: '/calendar',
  },
  {
    id: 'notif-003',
    type: 'event_update',
    message: 'El evento "Reunión de Equipo" ha sido reprogramado.',
    timestamp: 'Hace 3 horas',
    isRead: true, // Ejemplo de una notificación leída
  },
  {
    id: 'notif-004',
    type: 'achievement',
    message: '¡Felicidades! Completaste 5 tareas esta semana.',
    timestamp: 'Ayer',
    isRead: true,
  },
  {
    id: 'notif-005',
    type: 'deadline_soon',
    message: 'La tarea "Prototipo App" vence en 2 días.',
    timestamp: 'Ayer',
    isRead: false,
  },
];