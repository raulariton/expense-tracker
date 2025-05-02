import React from "react";
import MainLayout from "../layouts/MainLayout";
import SummaryCard from "../components/SummaryCard";
import CategoryCard from "../components/CategoryCard";
import ActivityItem from "../components/ActivityItem";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../App.jsx";
import {
  FaCamera,
  FaCalendarAlt,
  FaUtensils,
  FaShoppingBag,
  FaCar,
  FaFileInvoice,
  FaTag,
} from "react-icons/fa";

import "../styles/dashboard.css";

const iconMap = {
  utensils: <FaUtensils />,
  shopping: <FaShoppingBag />,
  transport: <FaCar />,
  invoice: <FaFileInvoice />,
  tag: <FaTag />,
};

const Dashboard = () => {
  const navigate = useNavigate();

  const isAuthenticated = useContext(AuthContext);

  if (!isAuthenticated) {
    // TODO: Redirect to login page, and then back to dashboard
    //  (proper handling)
    return (
      <MainLayout>
        <div className="dashboard">
          <p>Please log in to view your dashboard.</p>
        </div>
      </MainLayout>
    );
  }
  const navigate = useNavigate();

const goToAddExpense = () => {
  navigate("/add-expense");
};


  const userExpenses = db.expenses.filter((e) => e.user_id === currentUser.id);

  const todayDate = new Date().toISOString().split("T")[0];

  const summary = {
    total: userExpenses.reduce((acc, e) => acc + e.amount, 0).toFixed(2),
    today: userExpenses
      .filter((e) => e.date.startsWith(todayDate))
      .reduce((acc, e) => acc + e.amount, 0)
      .toFixed(2),
    week: userExpenses
      .filter((e) => {
        const date = new Date(e.date);
        const today = new Date();
        const oneWeekAgo = new Date();
        oneWeekAgo.setDate(today.getDate() - 7);
        return date >= oneWeekAgo && date <= today;
      })
      .reduce((acc, e) => acc + e.amount, 0)
      .toFixed(2)
  };

  const recent = userExpenses
    .slice(-5)
    .reverse()
    .map((e) => ({
      name: e.description,
      amount: e.amount,
      time: new Date(e.date).toLocaleString(),
      icon: db.categories.find((c) => c.id === e.category_id)?.icon || "tag"
    }));

  const categoryTotals = db.categories.map((cat) => {
    const total = userExpenses
      .filter((e) => e.category_id === cat.id)
      .reduce((acc, e) => acc + e.amount, 0)
      .toFixed(2);
    return { title: cat.name, amount: total, icon: cat.icon };
  });

  return (
    <MainLayout>
      <div className="dashboard">
        {/* Summary Cards */}
        <div className="summary-cards">
          <SummaryCard
            title="Total Spent"
            amount={`$${summary.total}`}
            subtitle="This month"
            icon={<FaCalendarAlt />}
          />
          <SummaryCard
            title="Spent Today"
            amount={`$${summary.today}`}
            subtitle="Today"
            icon={<FaCalendarAlt />}
          />
          <SummaryCard
            title="This Week"
            amount={`$${summary.week}`}
            subtitle="Last 7 Days"
            icon={<FaCalendarAlt />}
          />
        </div>

        {/* Action Buttons */}
        <div className="dashboard-actions">
          <button className="btn-primary" onClick={goToAddExpense}>
            <FaCamera className="btn-icon" />
            Add Expense
          </button>
        </div>

        {/* Categories */}
        <div className="category-cards">
          {categoryTotals.map((cat, i) => (
            <CategoryCard
              key={i}
              title={cat.title}
              amount={`$${cat.amount}`}
              icon={iconMap[cat.icon]}
            />
          ))}
        </div>

        {/* Recent Activity */}
        <div className="activity-card">
          <h3>Recent Activity</h3>
          <div className="activity-list">
            {recent.map((item, i) => (
              <ActivityItem
                key={i}
                icon={iconMap[item.icon]}
                name={item.name}
                time={item.time}
                amount={`-$${item.amount}`}
              />
            ))}
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default Dashboard;
