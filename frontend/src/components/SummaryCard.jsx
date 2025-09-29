import React from 'react';
import '../styles/SummaryCard.css'; 

const SummaryCard = ({ title, children }) => {
  // Clases que definirás en SummaryCard.css
  const cardClasses = "summary-card";
  const titleClasses = "summary-card-title";
  const contentClasses = "summary-card-content";

  return (
    <div className={cardClasses}>
      {title && <h2 className={titleClasses}>{title}</h2>}
      <div className={contentClasses}>
        {children}
      </div>
    </div>
  );
};

export default SummaryCard;