import React from "react";
import "../styles/CategoryCard.css";
//card layout for catg items
const CategoryCard = ({ icon, title, amount }) => {
  return (
    <div className="category-card">
      {icon && <div className="category-icon">{icon}</div>}
      <span>{title}</span>
      <h4>{amount}</h4>
    </div>
  );
};

export default CategoryCard;
