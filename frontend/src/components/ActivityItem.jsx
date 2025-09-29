
import React from 'react';
 import '../styles/ActivityItem.css'; 

const ActivityItem = ({ startTime, endTime, title, categoryColor }) => {
  // Clases que definirás en ActivityItem.css
  const itemClasses = "activity-item";
  const timeClasses = "activity-item-time";
  const titleClasses = "activity-item-title";

  // Estilo en línea para el color de fondo, ya que es dinámico
  // En CSS real, podrías tener clases predefinidas (.activity-orange, .activity-gray, etc.)
  // o pasar el color como una variable CSS.
  const itemStyle = {
    backgroundColor: categoryColor || '#f0f0f0', // Color por defecto si no se provee
  };

  return (
    <div className={itemClasses} style={itemStyle}>
      <div className={timeClasses}>
        <span>{startTime}</span>
        <span>{endTime}</span>
      </div>
      <div className={titleClasses}>
        {title}
      </div>
    </div>
  );
};

export default ActivityItem;