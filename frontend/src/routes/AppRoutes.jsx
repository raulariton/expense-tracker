import React, { useContext } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Auth from "../pages/Auth";
import Dashboard from "../pages/Dashboard";
import AddExpense from "../pages/AddExpense";
import Statistics from "../pages/Statistics";
import Home from "../pages/Home";
import Settings from "../pages/Settings";
import App, { AuthContext } from "../App";
import AdminDashboard from "../pages/DashboardAdmin";

const AppRoutes = () => {
  const { isAuthenticated } = useContext(AuthContext);

  return (
    <Routes>
      {/* Public routes */}
      <Route path="/" element={isAuthenticated ? <Dashboard /> : <Home />} />
      <Route path="/auth" element={<Auth />} />
      <Route path="/home" element={<Home />} />
      {/* Protected Routes */}
      <Route
        path="/dashboard"
        element={isAuthenticated ? <Dashboard /> : <Navigate to="/auth" />}
      />
       <Route
        path="/admin_dashboard"
        element={isAuthenticated ? <AdminDashboard /> : <Navigate to="/auth" />}
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
        path="/settings"
        element={isAuthenticated ? <Settings /> : <Navigate to="/auth" />}
      />

      {/* Fallback redirect */}
      <Route path="*" element={<Navigate to="/home" />} />
    </Routes>
  );
};

export default AppRoutes;
