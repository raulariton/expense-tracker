import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Auth from "../pages/Auth";
import Dashboard from "../pages/Dashboard";
import AddExpense from "../pages/AddExpense";
import Statistics from "../pages/Statistics";
import Home from "../pages/Home";
import Settings from "../pages/Settings";
import AdminDashboard from "../pages/DashboardAdmin";
import AdminManagement from "../pages/AdminManagement.jsx";
import { useAuth } from "../context/AuthContext";
import ScanReceiptAdmin from "../pages/ScanReceiptAdmin.jsx";

const AppRoutes = () => {
  const auth = useAuth();
  const isAdmin = auth.userRole === "Admin";

  return (
    <Routes>
      {/* Public routes */}
      <Route path="/" element={
        auth.isAuthenticated ? (isAdmin ? <AdminDashboard /> : <Dashboard />) : <Home/>
      }/>

      <Route path="/auth" element={<Auth />} />
      <Route path="/home" element={<Home />} />

      {/* Protected Routes */}
      <Route
        path="/dashboard"
        element={auth.isAuthenticated ? <Dashboard /> : <Navigate to="/auth" />}
      />
       <Route
        path="/admin_dashboard"
        element={auth.isAuthenticated && isAdmin ? <AdminDashboard /> : <Navigate to="/auth" />}
      />
      <Route
        path="/admin-management"
        element={auth.isAuthenticated && isAdmin ? <AdminManagement /> : <Navigate to="/auth" />}
      />
      <Route
        path="/admin-scan-receipt"
        element={auth.isAuthenticated ? <ScanReceiptAdmin /> : <Navigate to="/auth" />}
      />
      <Route
        path="/add-expense"
        element={auth.isAuthenticated ? <AddExpense /> : <Navigate to="/auth" />}
      />
      <Route
        path="/statistics"
        element={auth.isAuthenticated ? <Statistics /> : <Navigate to="/auth" />}
      />
      <Route
        path="/settings"
        element={auth.isAuthenticated ? <Settings /> : <Navigate to="/auth" />}
      />

      {/* Fallback redirect */}
      <Route path="*" element={<Navigate to="/home" />} />
    </Routes>
  );
};

export default AppRoutes;
