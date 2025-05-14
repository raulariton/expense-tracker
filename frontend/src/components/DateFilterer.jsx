import React, { useState } from "react";
import { FaCalendarAlt } from "react-icons/fa";
import "../styles/DateFilterer.css";

const DateFilterer = ({ onFilterApply }) => {
  const [selectedFilter, setSelectedFilter] = useState(null);
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());

  // formatting to send to backend
  const formatDate = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const handleFilterButtonClick = (filter) => {
    setSelectedFilter(filter);

    // function temp variables
    const today = new Date();
    let startDate = new Date();
    let endDate = new Date();

    switch (filter) {
      case "thisWeek":
        // Set to beginning of current week (Monday)
        startDate = new Date(today);
        // + 1 to start from Monday
        startDate.setDate(today.getDate() - today.getDay() + 1);
        endDate = new Date(today);
        break;
      case "thisMonth":
        // Set to beginning of current month
        startDate = new Date(today.getFullYear(), today.getMonth(), 1);
        endDate = new Date(today);
        break;
      case "lastMonth":
        // Set to beginning of last month
        startDate = new Date(today.getFullYear(), today.getMonth() - 1, 1);
        endDate = new Date(today.getFullYear(), today.getMonth(), 0);
        break;
    }

    setStartDate(startDate);
    setEndDate(endDate);
    onFilterApply({ startDate, endDate });
  };

  const handleManualDateChange = (e) => {
    const { name, value } = e.target;

    // unselect any filter button
    setSelectedFilter(null);

    if (name === "startDate") {
      setStartDate(new Date(value));
    } else if (name === "endDate") {
      setEndDate(new Date(value));
    }
  };

  const applyFilter = () => {
    if (startDate && endDate) {
      onFilterApply({ startDate, endDate });
    }
  };

  return (
    <div className="date-filterer-container">
      {/* TODO: Add locale */}
      <h2 className="filter-title">Filter by Date Range</h2>
      <div className="filter-buttons">
        <button
          className={`filter-btn ${selectedFilter === "thisWeek" ? "selected" : ""}`}
          onClick={() => handleFilterButtonClick("thisWeek")}
        >
          This Week
        </button>
        <button
          className={`filter-btn ${selectedFilter === "thisMonth" ? "selected" : ""}`}
          onClick={() => handleFilterButtonClick("thisMonth")}
        >
          This Month
        </button>
        <button
          className={`filter-btn ${selectedFilter === "lastMonth" ? "selected" : ""}`}
          onClick={() => handleFilterButtonClick("lastMonth")}
        >
          Last Month
        </button>
      </div>
      <div className="date-range-picker">
        <div className="date-input-wrapper">
          <input
            type="date"
            className="date-input"
            value={formatDate(startDate)}
            onChange={(e) => handleManualDateChange(e)}
          />
        </div>
        <span className="date-range-separator">to</span>
        <div className="date-input-wrapper">
          <input
            type="date"
            className="date-input"
            value={formatDate(endDate)}
            onChange={(e) => handleManualDateChange(e)}
          />
        </div>
        <button className="apply-btn" onClick={applyFilter}>
          Apply
        </button>
      </div>
    </div>
  );
};

export default DateFilterer;
