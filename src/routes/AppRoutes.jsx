import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Auth from "../pages/Auth";
import Dashboard from "../pages/Dashboard";
import AddExpense from "../pages/AddExpense";
import Statistics from "../pages/Statistics";
import Home from "../pages/Home";
import Settings from "../pages/Settings";

const AppRoutes = ({ isAuthenticated }) => {
  isAuthenticated=true; //for testing purposes
  return (
    <Routes>
      {/* Public route */}
      <Route path="/auth" element={<Auth />} />
      {/* Public route */}
      <Route path="/Homepage" element={<Home />} />
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
       <Route
        path="/Settings"
        element={isAuthenticated ? <Settings /> : <Navigate to="/auth" />}
      />
      

      {/* Fallback redirect */}
      <Route path="*" element={<Navigate to="/Homepage" />} />
    </Routes>
  );
};

export default AppRoutes;
