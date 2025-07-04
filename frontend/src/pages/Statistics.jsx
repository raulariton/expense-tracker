import React, { useEffect, useState } from "react";
import MainLayout from "../layouts/MainLayout";
import "../styles/statistics.css";
import axios from "axios";
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
import toast from "react-hot-toast";
import ActivityItem from "../components/ActivityItem.jsx";
import PaginationButtons from "../components/PaginationButtons.jsx";
import DateFilterer from "../components/DateFilterer.jsx";
import { useAuth } from "../context/AuthContext.jsx";

const Statistics = () => {
  const { lang } = useLanguage();
  const { isAuthenticated } = useAuth();
  const colorOfCategory = {
    "Food & Dining": "#264653",
    "Shopping": "#2A9D8F",
    "Transport": "#B1871B",
    "Bills": "#F4A261",
    "Other": "#E76F51"
  };

  const [totalByDay, setTotalByDay] = useState([]);
  const [expensesList, setExpensesList] = useState(null);
  const [categoryTotals, setCategoryTotals] = useState([
    { category: "Food & Dining", total: 0 },
    { category: "Shopping", total: 0 },
    { category: "Transport", total: 0 },
    { category: "Bills", total: 0 },
    { category: "Other", total: 0 }
  ]);

  // for pagination
  const [pageNumber, setPageNumber] = useState(1);
  const expensesPerPage = 5; // number of expenses to show per page
  const [paginatedExpenses, setPaginatedExpenses] = useState([]);
  const [totalExpenses, setTotalExpenses] = useState(0);
  const [dateRangeFilter, setDateRangeFilter] = useState({
    startDate: null,
    endDate: null
  });

  useEffect(() => {
    // get all expenses
    const getAllExpenses = async () => {
      const token = localStorage.getItem("access_token");

      // submit GET request with token
      try {
        const response = await axios.get(
          "http://localhost:8000/expenses/",
          {
            headers: {
              Authorization: `Bearer ${token}`
            },
            params: {
              start_date: dateRangeFilter.startDate ?? null,
              end_date: dateRangeFilter.endDate ?? null
            }
          }
        );

        // avoid setting expensesList if date filter is applied
        // to avoid rendering the area chart with data filtered by date
        if (!dateRangeFilter.startDate && !dateRangeFilter.endDate)
          setExpensesList(response.data.expenses);

        setTotalExpenses(response.data.expenses.length);

      } catch (error) {
        toast.error("Error occurred: " + error.message);
      }
    };

    getAllExpenses();

  }, [dateRangeFilter.startDate, dateRangeFilter.endDate]);

  useEffect(() => {
    const getCategoryTotals = async () => {
      const token = localStorage.getItem("access_token");

      // submit GET request with token
      try {
        const response = await axios.get(
          "http://localhost:8000/expenses/category-summary",
          {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        );

        setCategoryTotals((prevTotals) =>
          prevTotals.map((category) => {
            const updatedCategory = response.data.category_summary.find(
              (item) => item.category === category.category
            );
            return updatedCategory ? updatedCategory : category;
          })
        );

      } catch (error) {
        toast.error("Error occurred: " + error.message);
      }
    };

      // get total by category
      getCategoryTotals();

    }, []);

  useEffect(() => {
    const groupExpensesByDate = () => {
      let totalPerDay = {};

      expensesList.forEach(expenseEntry => {
        // extract date
        const date = expenseEntry.datetime.split("T")[0];

        // if date not in totalByDay, create it
        // otherwise add the expense to the existing date
        // NOTE: we use dictionary instead of array to avoid duplicate date keys
        // and to make it easier to access the date to update its value
        totalPerDay[date] = (totalPerDay[date] ? totalPerDay[date] : 0) + expenseEntry.total;
      });

      // now we can convert totalByDay to array of objects
      totalPerDay = Object.entries(totalPerDay);

      // dailyChartData: array [] of objects {}
      // each object has properties 'date_time' and 'total_amount'
      // the array is sorted based on 'date_time', in chronological order
      setTotalByDay(totalPerDay
        .map(([date, total_amount]) => ({ date_time: date, total_amount }))
        .sort((a, b) => new Date(a.date_time) - new Date(b.date_time)));
    }

    if (expensesList) {
      // group expenses by date
      groupExpensesByDate();
    }
  }, [expensesList]);

  useEffect(() => {
    // expense pagination
    const getExpensesWithPagination = async () => {
      const token = localStorage.getItem("access_token");

      // submit GET request with token
      try {
        const response = await axios.get(
          "http://localhost:8000/expenses/",
          {
            headers: {
              Authorization: `Bearer ${token}`
            },
            params: {
              limit: expensesPerPage,
              offset: (pageNumber - 1) * expensesPerPage,
              start_date: dateRangeFilter.startDate ?? null,
              end_date: dateRangeFilter.endDate ?? null
            }
          }
        );

        setPaginatedExpenses(response.data.expenses);

        // only set total expenses (for pagination) if date filter has been applied
        // if (dateRangeFilter.startDate && dateRangeFilter.endDate)
        //   setTotalExpenses(response.data.expenses.length)

      } catch (error) {
        toast.error("Error occurred: " + error.message);
      }
    }

    getExpensesWithPagination();
  }, [pageNumber, expensesPerPage, dateRangeFilter.startDate, dateRangeFilter.endDate]);

  if (!isAuthenticated) {
    return (
      <MainLayout>
        <div className="statistics-page">
          <p>{lang.statistics.loginMessage}</p>
        </div>
      </MainLayout>
    );
  }

  const handleDateFilterApply = (dateRange) => {
    setDateRangeFilter({
      startDate: dateRange.startDate,
      endDate: dateRange.endDate
    });

    // reset page number to 1 when applying a new filter
    setPageNumber(1);
  }

  const localizedCategoryTotals = categoryTotals.map(item => ({
    ...item,
    category: lang.expenseCategories[item.category]
  }))

    return (
      <MainLayout>
        <div className="statistics-page">
          <div className="chart-placeholder-section">
            {/* spending by category - pie chart */}
            <div className="chart-card">
              <h3>{lang.statistics.byCategory}</h3>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={localizedCategoryTotals}
                    dataKey="total"
                    nameKey="category"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                  >
                    {categoryTotals.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={colorOfCategory[entry.category]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* spending over time - area chart */}
            <div className="chart-card">
              <h3>{lang.statistics.overTime}</h3>
              <ResponsiveContainer width="100%" height={250}>
                <AreaChart data={totalByDay}>
                  <defs>
                    <linearGradient id="colorSpend" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#2563eb" stopOpacity={0.8} />
                      <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="date_time" />
                  <YAxis />
                  <CartesianGrid strokeDasharray="3 3" />
                  <Tooltip />
                  <Area
                    type="monotone"
                    dataKey="total_amount"
                    stroke="#2563eb"
                    fillOpacity={1}
                    fill="url(#colorSpend)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* expense list */}
          {/* TODO: Grouping by date */}
          <div className="expense-card">
            <h3>{lang.statistics.title}</h3>
            <DateFilterer onFilterApply={handleDateFilterApply}/>
            <div className="expense-list"
             style={{ height: `${expensesPerPage * 4.1}rem` }}>
            {paginatedExpenses && paginatedExpenses.map((expense, index) => (
              <ActivityItem
                key={index}
                category={expense.category}
                name={expense.vendor}
                dateTime={expense.datetime}
                amount={`${(expense.total).toFixed(2)} RON`}
              />
            ))}
            </div>

            <PaginationButtons
              pageNumber={pageNumber}
              setPageNumber={setPageNumber}
              totalItems={totalExpenses}
              displayPerPage={expensesPerPage}
            />
          </div>
        </div>
      </MainLayout>
    );
  };

  export default Statistics;
