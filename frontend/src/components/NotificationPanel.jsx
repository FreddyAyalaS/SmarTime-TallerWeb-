// src/components/Notifications/NotificationPanel.jsx
import React from 'react';
import NotificationItem from './NotificationItem';
import '../styles/NotificationPanel.css'; // O .module.css

const NotificationPanel = ({ notifications, onMarkAsRead, onClearAll, isVisible }) => {
  if (!isVisible) {
    return null; // No renderiza nada si no es visible
  }

  // Clases que definirás en NotificationPanel.css
  const panelClasses = "notification-panel";
  const headerClasses = "notification-panel-header";
  const titleClasses = "notification-panel-title";
  const clearAllButtonClasses = "notification-panel-clear-all";
  const listClasses = "notification-panel-list";
  const emptyStateClasses = "notification-panel-empty";

  return (
    <div className={panelClasses}>
      <div className={headerClasses}>
        <h3 className={titleClasses}>Notificaciones</h3>
        {notifications.length > 0 && (
          <button onClick={onClearAll} className={clearAllButtonClasses}>
            Limpiar todas
          </button>
        )}
      </div>
      <div className={listClasses}>
        {notifications.length === 0 ? (
          <p className={emptyStateClasses}>No tienes notificaciones nuevas.</p>
        ) : (
          notifications.map(notif => (
            <NotificationItem
              key={notif.id}
              notification={notif}
              onMarkAsRead={onMarkAsRead}
            />
          ))
        )}
      </div>
    </div>
  );
};

export default NotificationPanel;