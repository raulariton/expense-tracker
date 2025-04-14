import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Auth from "../pages/Auth";
import Dashboard from "../pages/Dashboard";
import AddExpense from "../pages/AddExpense";
import Statistics from "../pages/Statistics";

const AppRoutes = ({ isAuthenticated }) => {
  isAuthenticated=true; //for testing purposes
  return (
    <Routes>
      {/* Public route */}
      <Route path="/auth" element={<Auth />} />

      {/* Protected Routes */}
      <Route
        path="/dashboard"
        element={isAuthenticated ? <Dashboard /> : <Navigate to="/auth" />}
      />
      <Route
        path="/add-expense"
        element={isAuthenticated ? <AddExpense /> : <Navigate to="/auth" />}
      />
      <Route
        path="/statistics"
        element={isAuthenticated ? <Statistics /> : <Navigate to="/auth" />}
      />

      {/* Fallback redirect */}
      <Route path="*" element={<Navigate to="/auth" />} />
    </Routes>
  );
};

export default AppRoutes;
