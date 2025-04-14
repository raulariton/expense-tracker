import React from "react";
import MainLayout from "../layouts/MainLayout";
import SummaryCard from "../components/SummaryCard";
import CategoryCard from "../components/CategoryCard";
import ActivityItem from "../components/ActivityItem";

import { FaCamera, FaCalendarAlt, FaUtensils, FaShoppingBag, FaCar, FaFileInvoice } from "react-icons/fa";
import data from "../data/demodata.json";
import "../styles/dashboard.css";

// Map string icon name → actual icon component
const iconMap = {
  food: <FaUtensils />,
  shopping: <FaShoppingBag />,
  transport: <FaCar />,
  bills: <FaFileInvoice />
};

const Dashboard = () => {
  const { summary, categories, recent } = data;

  return (
    <MainLayout>
      <div className="dashboard">
        {/* Summary */}
        <div className="summary-cards">
          <SummaryCard title="Total Spent" amount={`$${summary.total}`} subtitle="This month" icon={<FaCalendarAlt />} />
          <SummaryCard title="Spent Today" amount={`$${summary.today}`} subtitle="Today" icon={<FaCalendarAlt />} />
          <SummaryCard title="This Week" amount={`$${summary.week}`} subtitle="April 7 – April 13" icon={<FaCalendarAlt />} />
        </div>

        {/* Actions */}
        <div className="dashboard-actions">
          <button className="btn-primary">
            
            Add expense
          </button>
         
        </div>

        {/* Categories */}
        <div className="category-cards">
          {categories.map((cat, i) => (
            <CategoryCard
              key={i}
              title={cat.title}
              amount={`$${cat.amount}`}
              icon={iconMap[cat.icon]}
            />
          ))}
        </div>

        {/* Activity */}
        <div className="activity-card">
          <h3>Recent Activity</h3>
          <div className="activity-list">
            {recent.map((item, i) => (
              <ActivityItem
                key={i}
                icon={iconMap[item.icon]}
                name={item.name}
                time={item.time}
                amount={`$${item.amount}`}
              />
            ))}
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default Dashboard;
