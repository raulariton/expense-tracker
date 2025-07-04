import React, { useEffect, useState } from "react";
import MainLayout from "../layouts/MainLayout";
import SummaryCard from "../components/SummaryCard";
import ActivityItem from "../components/ActivityItem";
import {
  FaCalendarAlt,
} from "react-icons/fa";

import "../styles/dashboard.css";
import axios from "axios";
import { useLanguage } from "../context/LanguageContext.jsx";
import toast from "react-hot-toast";

const Dashboard = () => {
  const { lang } = useLanguage();

  const [summary, setSummary] = useState(null);
  const [userRecentExpenses, setUserRecentExpenses] = useState(null);

  // TODO: one useEffect for all requests

  // get summary
  useEffect( () => {
    const getSummary = async () => {
      const token = localStorage.getItem("access_token");

      // submit request with token
      try {
        const response = await axios.get(
          "http://localhost:8000/expenses/total-summary",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );

        setSummary(response.data);
      } catch (error) {
        toast.error("Error occurred: " + error.message);

      }
    }

    getSummary();
  }, []);

  // get recent expenses (by default 5 most recent)
  useEffect(() => {
    const getRecentExpenses = async () => {
      const limit = 5;
      const token = localStorage.getItem("access_token");

      // submit request with token
      try {
        const response = await axios.get(
          `http://localhost:8000/expenses/`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
            params: {
              limit: limit
            }
          },
        );

        setUserRecentExpenses(response.data.expenses);
      } catch (error) {
        toast.error("Error occurred: " + error.message);
      }
    }

    getRecentExpenses();
  }, []);

  return (
    <MainLayout>
      <div className="dashboard">
        {/* Summary Cards */}
        <div className="summary-cards">
          <SummaryCard
            title={lang.dashboard.totalSpent}
            amount={`${(summary?.total_month || 0).toFixed(2)} RON`}
            subtitle={lang.dashboard.subtitleMonth}
            icon={<FaCalendarAlt />}
          />
          <SummaryCard
            title={lang.dashboard.spentToday}
            amount={`${(summary?.total_day || 0).toFixed(2)} RON`}
            subtitle={lang.dashboard.subtitleToday}
            icon={<FaCalendarAlt />}
          />
          <SummaryCard
            title={lang.dashboard.thisWeek}
            amount={`${(summary?.total_week || 0).toFixed(2)} RON`}
            subtitle={lang.dashboard.subtitleWeek}
            icon={<FaCalendarAlt />}
          />
        </div>

        {/* Recent Expenses */}
        <div className="expenses-card">
          <h3>{lang.dashboard.recentExpenses}</h3>
          <div className="expense-list">
            {userRecentExpenses && userRecentExpenses.map((expense, index) => (
              <ActivityItem
                key={index}
                category={expense.category}
                name={expense.vendor}
                dateTime={expense.datetime}
                amount={`${(expense.total).toFixed(2)} RON`}
              />
            ))}
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default Dashboard;
