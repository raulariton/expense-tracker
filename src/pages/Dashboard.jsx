import React, { useContext, useEffect, useState } from "react";
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
import axios from "axios";
import { useLanguage } from "../context/LanguageContext.jsx";

const icon_of_category = {
  "Food & Dining": <FaUtensils />,
  "Shopping": <FaShoppingBag />,
  "Transport": <FaCar />,
  "Bills": <FaFileInvoice />,
  "Other": <FaTag />,
};

const Dashboard = () => {
  const navigate = useNavigate();
  const { lang } = useLanguage();

  const isAuthenticated = useContext(AuthContext);
  const [summary, setSummary] = useState(null);
  const [categoryTotals, setCategoryTotals] = useState([
    { category: "Food & Dining", total: 0 },
    { category: "Shopping", total: 0 },
    { category: "Transport", total: 0 },
    { category: "Bills", total: 0 },
    { category: "Other", total: 0 },
  ]);
  const [userRecentExpenses, setUserRecentExpenses] = useState(null);

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
        console.log(error);
        // Display error message on frontend
        alert(error);
      }
    }

    getSummary();
  }, []);

  // get total expenses by category
  useEffect( () => {
    const getCategoryTotals = async () => {
      const token = localStorage.getItem("access_token");

      // submit request with token
      try {
        const response = await axios.get(
          "http://localhost:8000/expenses/category-summary",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );

        // setCategoryTotals(response.data.category_summary);
        setCategoryTotals((prevTotals) =>
          prevTotals.map((category) => {
            const updatedCategory = response.data.category_summary.find(
              (item) => item.category === category.category
            );
            return updatedCategory ? updatedCategory : category;
          })
        );
      } catch (error) {
        // Display error message on frontend
        alert(error);
      }
    }

    getCategoryTotals();
  }, []);

  // get recent expenses (by default 5 most recent)
  useEffect(() => {
    const getRecentExpenses = async () => {
      const limit = 5;
      const token = localStorage.getItem("access_token");

      // submit request with token
      try {
        const response = await axios.get(
          `http://localhost:8000/expenses/?limit=${limit}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );

        setUserRecentExpenses(response.data.expenses);
      } catch (error) {
        // Display error message on frontend
        alert(error);
      }
    }

    getRecentExpenses();
  }, []);


  const displayCategoryNameUsingLocale = (category) => {
    switch (category) {
      case "Food & Dining":
        return lang.expense_categories.food_and_dining;
      case "Shopping":
        return lang.expense_categories.shopping;
      case "Transport":
        return lang.expense_categories.transport;
      case "Bills":
        return lang.expense_categories.bills;
      default:
        return lang.expense_categories.other;
    }
  }

  return (
    <MainLayout>
      <div className="dashboard">
        {/* Summary Cards */}
        <div className="summary-cards">
          <SummaryCard
            title={lang.dashboard.totalSpent}
            amount={`$${(summary?.total_month || 0).toFixed(2)}`}
            subtitle={lang.dashboard.subtitleMonth}
            icon={<FaCalendarAlt />}
          />
          <SummaryCard
            title={lang.dashboard.spentToday}
            amount={`$${(summary?.total_day || 0).toFixed(2)}`}
            subtitle={lang.dashboard.subtitleToday}
            icon={<FaCalendarAlt />}
          />
          <SummaryCard
            title={lang.dashboard.thisWeek}
            amount={`$${(summary?.total_week || 0).toFixed(2)}`}
            subtitle={lang.dashboard.subtitleWeek}
            icon={<FaCalendarAlt />}
          />
        </div>

        {/*TODO: "Add expense button"*/}
        {/*/!* Action Buttons *!/*/}
        {/*<div className="dashboard-actions">*/}
        {/*  <button className="btn-primary" onClick={goToAddExpense}>*/}
        {/*    <FaCamera className="btn-icon" />*/}
        {/*    Add Expense*/}
        {/*  </button>*/}
        {/*</div>*/}

        {/* Categories */}
        <div className="category-cards">
          {categoryTotals && categoryTotals.map((categoryTotal, index) => (
            <CategoryCard
              key={index}
              title={displayCategoryNameUsingLocale(categoryTotal.category)}
              amount={`$${(categoryTotal.total.toFixed(2))}`}
              icon={icon_of_category[categoryTotal.category]}
            />
          ))}
        </div>

        {/* Recent Expenses */}
        <div className="activity-card">
          <h3>{lang.dashboard.recentExpenses}</h3>
          <div className="activity-list">
            {userRecentExpenses && userRecentExpenses.map((expense, index) => (
              <ActivityItem
                key={index}
                icon={icon_of_category[expense.category]}
                name={expense.vendor}
                time={expense.datetime}
                amount={`$${(expense.total).toFixed(2)}`}
              />
            ))}
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default Dashboard;
