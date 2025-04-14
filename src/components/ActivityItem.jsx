import React from "react";
import "../styles/ActivityItem.css";

const ActivityItem = ({ icon, name, time, amount }) => {
  return (
    <div className="activity-item">
      {icon && <div className="activity-icon">{icon}</div>}
      <div className="activity-text">
        <strong>{name}</strong>
        <p>{time}</p>
      </div>
      <span className="expense-amount">–{amount}</span>
    </div>
  );
};

export default ActivityItem;
