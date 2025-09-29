
import React from 'react';


const Card = ({ children, title, className = '', titleClassName = '' }) => {
  const cardClasses = `card ${className}`;

  const finalTitleClasses = `card-title ${titleClassName}`;

  return (
    <div className={cardClasses}>
      {title && <h1 className={finalTitleClasses}>{title}</h1>}
      {children}
    </div>
  );
};

export default Card;