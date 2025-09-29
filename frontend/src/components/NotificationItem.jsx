
import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/NotificationItem.css'; 

const NotificationItem = ({ notification, onMarkAsRead }) => {
  // Clases que definirás en NotificationItem.css
  const itemClasses = `notification-item ${notification.isRead ? 'is-read' : 'is-unread'}`;
  const iconContainerClasses = "notification-item-icon-container"; // Para un ícono basado en notification.type
  const contentClasses = "notification-item-content";
  const messageClasses = "notification-item-message";
  const timestampClasses = "notification-item-timestamp";
  // const actionsClasses = "notification-item-actions"; // Si tienes acciones como "Marcar como leída"

  // Placeholder para un ícono basado en el tipo (puedes expandir esto con SVGs reales)
  const getIconForType = (type) => {
    if (type === 'new_task') return '📝';
    if (type === 'reminder') return '⏰';
    if (type === 'event_update') return '🔄';
    if (type === 'achievement') return '🏆';
    return '🔔'; // Default
  };

  const content = (
    <>
      <div className={iconContainerClasses}>
        {getIconForType(notification.type)}
      </div>
      <div className={contentClasses}>
        <p className={messageClasses}>{notification.message}</p>
        <small className={timestampClasses}>{notification.timestamp}</small>
      </div>
    </>
  );

  return notification.link ? (
    <Link to={notification.link} className={itemClasses} onClick={() => onMarkAsRead(notification.id)}>
      {content}
    </Link>
  ) : (
    <div className={itemClasses} onClick={() => onMarkAsRead(notification.id)}>
      {content}
    </div>
  );
};

export default NotificationItem;