
import React from "react";
import MainLayout from "../layouts/MainLayout";
import "../styles/dashboardAdmin.css";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

const AdminDashboard = () => {
  const db = JSON.parse(localStorage.getItem("appData")) || {
    users: [],
    expenses: [],
    categories: [],
  };
//data vlaues
  const usersCount = db.users.length;
  const expensesCount = db.expenses.length;
  const totalSpent = db.expenses.reduce((sum, e) => sum + e.amount, 0);
  const receiptsScanned = db.expenses.filter((e) => e.source === "scan").length;
  const ocrAccuracy = "000%";
//map throw the categories 
  // and get the total number of expenses for each category
  const categoryData = db.categories
    .map((cat) => {
      const total = db.expenses.filter((e) => e.category_id === cat.id).length;
      return {
        name: cat.name,
        value: total,
      };
    })
    .filter((d) => d.value > 0);
//colors for the pie chart
  const COLORS = ["#1e3a8a", "#10b981", "#f59e0b", "#ef4444", "#a855f7"];

  return (
    <MainLayout>
      <div className="admin-dashboard">
        <div className="admin-columns">
          <div className="admin-col">
            <div className="admin-card-small">
              <h2>{usersCount.toLocaleString()}</h2>
              <p>Users registered</p>
            </div>
            <div className="admin-card-large">
              <h2>${totalSpent.toLocaleString()}</h2>
              <p>worth of expenses logged</p>
            </div>
          </div>

          <div className="admin-col">
            <div className="admin-card-large chart-card">
              <h3>Expense categorization (all users)</h3>
              <ResponsiveContainer width="100%" height={260}>
                <PieChart>
                  <Pie
                    data={categoryData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                  >
                    {categoryData.map((_, index) => (
                      <Cell key={index} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend verticalAlign="bottom" height={36} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="admin-card-small">
              <h2>{expensesCount.toLocaleString()}</h2>
              <p>Expenses logged</p>
            </div>
          </div>

          <div className="admin-col">
            <div className="admin-card-small">
              <h2>{receiptsScanned.toLocaleString()}</h2>
              <p>Receipts scanned</p>
            </div>
            <div className="admin-card-large">
              <h2>{ocrAccuracy}</h2>
              <p>Receipt scanning accuracy</p>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default AdminDashboard;
