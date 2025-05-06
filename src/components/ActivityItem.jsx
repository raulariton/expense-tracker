import React from "react";
import "../styles/ActivityItem.css";
import {
  FaUtensils,
  FaShoppingBag,
  FaCar,
  FaFileInvoice,
  FaTag,
  FaQuestion
} from "react-icons/fa";

const ActivityItem = ({ category, name, dateTime, amount }) => {

  const getIconByCategory = (category) => {
    switch (category) {
      case "Food & Dining":
        return <FaUtensils />;
      case "Shopping":
        return <FaShoppingBag />;
      case "Transport":
        return <FaCar />;
      case "Bills":
        return <FaFileInvoice />;
      case "Other":
        return <FaTag />;
      default:
        return <FaQuestion />;
    }
  }

  return (
    <div className="activity-item">
      <div className="activity-icon">{getIconByCategory(category)}</div>
      <div className="activity-text">
        <strong>{name}</strong>
        {/* TODO: Format datetime */}
        <p>{dateTime}</p>
      </div>
      <span className="expense-amount">–{amount}</span>
    </div>
  );
};

export default ActivityItem;
