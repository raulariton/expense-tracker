import React, { useState } from "react";
import MainLayout from "../layouts/MainLayout";
import "../styles/AddExpense.css";

const AddExpense = () => {
  const [tab, setTab] = useState("manual");

  return (
    <MainLayout>
      <div className="add-expense-container">
        <h1>Add Expense</h1>

        {/* Tabs */}
        <div className="tabs">
          <button
            className={tab === "manual" ? "tab active" : "tab"}
            onClick={() => setTab("manual")}
          >
            Manual Entry
          </button>
          <button
            className={tab === "scan" ? "tab active" : "tab"}
            onClick={() => setTab("scan")}
          >
            Scan Receipt
          </button>
        </div>

        {tab === "manual" && (
          <form className="expense-form">
            <label>
              Amount (required)
              <input type="number" placeholder=" 0.00" required />
            </label>

            <label>
              Category
              <select>
                <option>Food & Dining</option>
                <option>Transport</option>
                <option>Shopping</option>
                <option>Bills</option>
              </select>
            </label>

            <label>
              Vendor (optional)
              <input type="text" placeholder="Enter vendor name" />
            </label>

            <label>
              Date/Time
              <input type="datetime-local" />
            </label>

            <button type="submit" className="submit-btn">
              Submit Expense
            </button>
          </form>
        )}

        {tab === "scan" && (
          <div className="scan-placeholder">
            <p>..................</p>
          </div>
        )}
      </div>
    </MainLayout>
  );
};

export default AddExpense;
