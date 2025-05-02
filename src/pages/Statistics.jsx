import React from "react";
import MainLayout from "../layouts/MainLayout";
import "../styles/statistics.css";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid
} from "recharts";
import { useLanguage } from "../context/LanguageContext";
//to do ** crate a a compoonet for both charts to make the code a bit more cleaner

const Statistics = () => {
  const { lang } = useLanguage();
  const currentUser = JSON.parse(localStorage.getItem("currentUser"));
  const db = JSON.parse(localStorage.getItem("appData"));

  if (!currentUser || !db) {
    return (
      <MainLayout>
        <div className="statistics-page">
          <p>{lang.statistics.loginMessage}</p>
        </div>
      </MainLayout>
    );
  }

  const userExpenses = db.expenses.filter(e => e.user_id === currentUser.id);

  const categoryChartData = db.categories.map(cat => {
    const total = userExpenses
      .filter(e => e.category_id === cat.id)
      .reduce((acc, e) => acc + e.amount, 0);
    return {
      name: cat.name,
      value: total
    };
  }).filter(d => d.value > 0);

  const COLORS = ["#2563eb", "#3b82f6", "#60a5fa", "#93c5fd", "#c7d2fe"];

  const dailyTotals = {};
  userExpenses.forEach(e => {
    const date = e.date_time.split("T")[0];
    dailyTotals[date] = (dailyTotals[date] || 0) + e.amount;
  });

  const dailyChartData = Object.entries(dailyTotals)
    .map(([date, value]) => ({ date_time: date, value }))
    .sort((a, b) => new Date(a.date_time) - new Date(b.date_time));

  const groupedExpenses = {};
  userExpenses.forEach(expense => {
    const date = expense.date_time.split("T")[0];
    if (!groupedExpenses[date]) {
      groupedExpenses[date] = [];
    }
    groupedExpenses[date].push(expense);
  });

  const sortedDates = Object.keys(groupedExpenses).sort((a, b) => new Date(b) - new Date(a));

  return (
    <MainLayout>
      <div className="statistics-page">
        <div className="chart-placeholder-section">
          {/* 📊 Spending by Category */}
          <div className="chart-card">
            <h3>{lang.statistics.byCategory}</h3>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={categoryChartData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  label
                >
                  {categoryChartData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* 📈 Spending Over Time */}
          <div className="chart-card">
            <h3>{lang.statistics.overTime}</h3>
            <ResponsiveContainer width="100%" height={250}>
              <AreaChart data={dailyChartData}>
                <defs>
                  <linearGradient id="colorSpend" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563eb" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="date" />
                <YAxis />
                <CartesianGrid strokeDasharray="3 3" />
                <Tooltip />
                <Area
                  type="monotone"
                  dataKey="value"
                  stroke="#2563eb"
                  fillOpacity={1}
                  fill="url(#colorSpend)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 🧾 Recent Expenses */}
        <div className="recent-expenses">
          <h2>{lang.statistics.title}</h2>
          {sortedDates.map(date => (
            <div className="expense-group" key={date}>
              <h4>{date}</h4>
              <ul>
                {groupedExpenses[date].map(entry => {
                  const category = db.categories.find(c => c.id === entry.category_id)?.name || "Other";
                  return (
                    <li key={entry.id}>
                      <span className="category">{category}</span> — {entry.description}
                      <span className="amount">- ${entry.amount.toFixed(2)}</span>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </MainLayout>
  );
};

export default Statistics;
