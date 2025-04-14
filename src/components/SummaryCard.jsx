import React from "react";
import "../styles/SummaryCard.css";

const SummaryCard = ({ icon, title, amount, subtitle }) => {
  return (
    <div className="summary-card">
      <div className="summary-header">
        <span>{title}</span>
        {icon && <span className="summary-icon">{icon}</span>}
      </div>
      <h2 className="summary-amount">{amount}</h2>
      <p className="summary-subtitle">{subtitle}</p>
    </div>
  );
};

export default SummaryCard;
