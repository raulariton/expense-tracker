import React, { useEffect, useState } from "react";
import MainLayout from "../layouts/MainLayout";
import "../styles/DashboardAdmin.css";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer
} from "recharts";
import axios from "axios";
import toast from "react-hot-toast";

const AdminDashboard = () => {

  const [stats, setStats] = useState(null);
  const fakeData = {
    "receiptsScanned": 14,
    "ocrAccuracy": 0.999,
  }
  const colorOfCategory = {
    "Food & Dining": "#264653",
    "Shopping": "#2A9D8F",
    "Transport": "#B1871B",
    "Bills": "#F4A261",
    "Other": "#E76F51"
  };

  useEffect(() => {
    const fetchData = async () => {
      const token = localStorage.getItem("access_token");

      try {
        const response = await axios.get(
          "http://localhost:8000/admin/stats",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );

        setStats(response.data);
      } catch (error) {
        toast.error("Error occurred: " + error.message);
      }
    };

    fetchData();
  }, []);

  return (
    <MainLayout>
      <div className="admin-dashboard">
        <div className="admin-columns">
          <div className="admin-col">
            <div className="admin-card-small">
              <h2>{stats?.user_count || '-'}</h2>
              <p>Users registered</p>
            </div>
            <div className="admin-card-large">
              <h2>${stats?.expenses_total || '-'}</h2>
              <p>worth of expenses logged</p>
            </div>
          </div>

          <div className="admin-col">
            <div className="admin-card-large chart-card">
              <h3>Expense categorization (all users)</h3>
              <ResponsiveContainer width="100%" height={260}>
                <PieChart>
                  <Pie
                    data={stats?.expenses_count_grouped_by_category || []}
                    dataKey="total"
                    nameKey="category"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                  >
                    {stats?.expenses_count_grouped_by_category.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={colorOfCategory[entry.category]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend verticalAlign="bottom" height={36} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="admin-card-small">
              <h2>{stats?.expenses_count || '-'}</h2>
              <p>Expenses logged</p>
            </div>
          </div>

          <div className="admin-col">
            <div className="admin-card-small">
              <h2>{stats?.receipts_scanned_count || fakeData.receiptsScanned}</h2>
              <p>Receipts scanned</p>
            </div>
            <div className="admin-card-large">
              <h2>{(stats?.receipt_scan_accuracy || fakeData.ocrAccuracy) * 100}%</h2>
              <p>Receipt scanning accuracy</p>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default AdminDashboard;
