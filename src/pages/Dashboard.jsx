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

const category_and_icon = {
  "Food & Dining": <FaUtensils />,
  "Shopping": <FaShoppingBag />,
  "Transport": <FaCar />,
  "Bills": <FaFileInvoice />,
  "Other": <FaTag />,
};

const Dashboard = () => {
  const navigate = useNavigate();

  const isAuthenticated = useContext(AuthContext);
  const [summary, setSummary] = useState(null);
  const [categoryTotals, setCategoryTotals] = useState([
    { category: "Food & Dining", total: 0 },
    { category: "Shopping", total: 0 },
    { category: "Transport", total: 0 },
    { category: "Bills", total: 0 },
    { category: "Other", total: 0 },
  ]);

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

  // const summary = {
  //   total: userExpenses.reduce((acc, e) => acc + e.amount, 0).toFixed(2),
  //   today: userExpenses
  //     .filter((e) => e.date.startsWith(todayDate))
  //     .reduce((acc, e) => acc + e.amount, 0)
  //     .toFixed(2),
  //   week: userExpenses
  //     .filter((e) => {
  //       const date = new Date(e.date);
  //       const today = new Date();
  //       const oneWeekAgo = new Date();
  //       oneWeekAgo.setDate(today.getDate() - 7);
  //       return date >= oneWeekAgo && date <= today;
  //     })
  //     .reduce((acc, e) => acc + e.amount, 0)
  //     .toFixed(2),
  // };

  /*
  const recent = userExpenses
    .slice(-5)
    .reverse()
    .map((e) => ({
      name: e.description,
      amount: e.amount,
      time: new Date(e.date).toLocaleString(),
      icon: db.categories.find((c) => c.id === e.category_id)?.icon || "tag",
    }));

  const categoryTotals = db.categories.map((cat) => {
    const total = userExpenses
      .filter((e) => e.category_id === cat.id)
      .reduce((acc, e) => acc + e.amount, 0)
      .toFixed(2);
    return { title: cat.name, amount: total, icon: cat.icon };
  });
   */

  return (
    <MainLayout>
      <div className="dashboard">
        {/* Summary Cards */}
        <div className="summary-cards">
          <SummaryCard
            title="Total Spent"
            amount={`$${(summary?.total_month || 0).toFixed(2)}`}
            subtitle="This month"
            icon={<FaCalendarAlt />}
          />
          <SummaryCard
            title="Spent Today"
            amount={`$${(summary?.total_day || 0).toFixed(2)}`}
            subtitle="Today"
            icon={<FaCalendarAlt />}
          />
          <SummaryCard
            title="This Week"
            amount={`$${(summary?.total_week || 0).toFixed(2)}`}
            subtitle="Last 7 Days"
            icon={<FaCalendarAlt />}
          />
        </div>

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
              title={categoryTotal.category}
              amount={`$${(categoryTotal.total.toFixed(2))}`}
              icon={category_and_icon[categoryTotal.category]}
            />
          ))}
        </div>

        {/* Recent Activity */}
        {/*<div className="activity-card">*/}
        {/*  <h3>Recent Activity</h3>*/}
        {/*  <div className="activity-list">*/}
        {/*    {recent.map((item, i) => (*/}
        {/*      <ActivityItem*/}
        {/*        key={i}*/}
        {/*        icon={iconMap[item.icon]}*/}
        {/*        name={item.name}*/}
        {/*        time={item.time}*/}
        {/*        amount={`-$${item.amount}`}*/}
        {/*      />*/}
        {/*    ))}*/}
        {/*  </div>*/}
        {/*</div>*/}
      </div>
    </MainLayout>
  );
};

export default Dashboard;
