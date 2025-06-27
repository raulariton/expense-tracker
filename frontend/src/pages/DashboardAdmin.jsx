import React, { useEffect, useState } from "react";
import MainLayout from "../layouts/MainLayout";
import "../styles/DashboardAdmin.css";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import axios from "axios";
import toast from "react-hot-toast";
import { useLanguage } from "../context/LanguageContext.jsx";

const chartConfig = {
  "Food & Dining": {
    color: "green",
    label: "Food & Dining",
  },
  Shopping: {
    color: "pink",
    label: "Shopping",
  },
  Transport: {
    color: "yellow",
    label: "Transport",
  },
  Bills: {
    color: "blue",
    label: "Bills",
  },
  Other: {
    color: "red",
    label: "Other",
  },
};

const DashboardTile = ({
  description,
  value,
  columnsToSpan = 1,
  gradientClass,
}) => {
  return (
    // tile container
    <div
      className={`$col-span-${columnsToSpan} flex flex-col items-center justify-center rounded-md p-6 py-14 shadow-sm transition-all duration-300 hover:scale-105 hover:shadow-lg ${gradientClass}`}
    >
      <h2 className="text-4xl font-bold">{value}</h2>
      <p className="text-lg font-normal">{description}</p>
    </div>
  );
};

const colorOfCategory = {
  "Food & Dining": "#264653",
  Shopping: "#2A9D8F",
  Transport: "#B1871B",
  Bills: "#F4A261",
  Other: "#E76F51",
};

const currency = "RON";

const ExpensesByCategoryChart = ({ data }) => {
  const { lang } = useLanguage();

  return (
    <div className="rounded-md p-4 shadow-lg">
      <h2 className="text-center text-lg font-semibold">
        {lang.adminDashboard.expenseCountByCategory}
      </h2>
      <ChartContainer config={chartConfig} className="min-h-[300px] lg:min-h-[200px] w-full">
        <PieChart>
          <ChartTooltip
            cursor={false}
            content={<ChartTooltipContent hideLabel />}
          />
          <Pie
            data={data?.map((category) => ({
              ...category,
              fill: colorOfCategory[category.category],
            }))}
            dataKey="total"
            nameKey="category"
          />
        </PieChart>
      </ChartContainer>
    </div>
  );
};

const ExpensesByAmountChart = ({ data }) => {
  const { lang } = useLanguage();

  return (
    <div className="rounded-md p-4 shadow-lg">
      <h2 className="text-center text-lg font-semibold">
        {lang.adminDashboard.expenseAmountByCategory}
      </h2>
      <ChartContainer config={chartConfig} className="min-h-[300px] lg:min-h-[200px] w-full">
        <PieChart>
          <ChartTooltip
            cursor={false}
            content={<ChartTooltipContent hideLabel />}
          />
          <Pie
            data={data?.map((category) => ({
              ...category,
              fill: colorOfCategory[category.category],
            }))}
            dataKey="total"
            nameKey="category"
          />
        </PieChart>
      </ChartContainer>
    </div>
  );
};

const LegendCategoryCard = ({
  category,
  categoryExpenseCount,
  categoryExpensePercentage,
}) => {
  const { lang } = useLanguage();

  return (
    <div className="flex max-w-full justify-between gap-6 rounded-md bg-gray-100 p-3 transition-all transition-colors duration-2000 hover:shadow-sm">
      <div className="flex items-center justify-between gap-2">
        <span
          className="align-center h-4 w-4 shrink-0 rounded-[2px] border-[var(--color-border)] bg-[var(--color-bg)]"
          style={{
            "--color-bg": colorOfCategory[category],
            "--color-border": colorOfCategory[category],
          }}
        ></span>
        <span className="text-lg font-medium">{lang.expenseCategories[category]}</span>
      </div>
      <div className="flex flex-col items-end">
        <span className="text-xl font-bold text-right">
          {categoryExpensePercentage ? `${categoryExpensePercentage}%` : "0%"}
        </span>
        <span className="text-right">{categoryExpenseCount} {lang.adminDashboard.entries}</span>
      </div>
    </div>
  );
};

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    expenses_count_grouped_by_category: null,
    expenses_amount_grouped_by_category: null,
    expenses_count: null,
    expenses_total: null,
    user_count: null,
    expenses_logged: null,
    receipts_scanned: null,
    ocr_accuracy: null,
  });
  const { lang } = useLanguage();


  const fakeData = {
    receipts_scanned: 14,
    ocr_accuracy: 0.999,
  };

  const tiles = [
    {
      description: lang.adminDashboardTileDescriptions.usersRegistered,
      value: stats?.user_count || "-",
      gradient: "bg-gradient-to-tr from-teal-400 to-teal-500",
    },
    {
      description: lang.adminDashboardTileDescriptions.totalExpensesLogged,
      value: stats?.expenses_count || "-",
      gradient: "bg-gradient-to-tr from-primary-200 to-primary-300",
    },
    {
      description:
        lang.adminDashboardTileDescriptions.totalAmountExpensesLogged,
      value: stats?.expenses_total
        ? `${stats?.expenses_total} ${currency}`
        : "-",
      gradient: "bg-gradient-to-tr from-violet-300 to-violet-400",
    },
  ];

  useEffect(() => {
    const fetchData = async () => {
      const token = localStorage.getItem("access_token");

      try {
        const response = await axios.get("http://localhost:8000/admin/stats", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        setStats(response.data);
      } catch (error) {
        toast.error("Error occurred: " + error.message);
      }
    };

    fetchData();
  }, []);

  return (
    <MainLayout>
      {/* grid tiles */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {tiles.map((tile, index) => (
          <DashboardTile
            key={index}
            description={tile.description}
            value={tile.value}
            columnsToSpan={1}
            gradientClass={tile.gradient}
          />
        ))}
      </div>

      {/* charts and legend container */}
      <div className="align-center mt-8 flex flex-col lg:flex-row gap-4 rounded-md bg-white p-6 shadow-md transition-all duration-300 hover:shadow-lg">
        {/* charts container */}
        <div className="align-center flex lg:w-2/5 flex-col gap-4">
          {/* expenses grouped by category chart */}
          <ExpensesByCategoryChart
            data={stats.expenses_count_grouped_by_category || []}
          />
          {/* expenses amount grouped by category chart */}
          <ExpensesByAmountChart
            data={stats.expenses_amount_grouped_by_category || []}
          />
        </div>

        {/* legend container */}
        <div className="flex flex-1 flex-col justify-center gap-2 px-4 sm:px-6 lg:px-8">
          <h2 className="text-lg font-semibold">{lang.adminDashboard.legend}</h2>
          <div className="flex flex-col flex-wrap gap-4">
            {Object.entries(colorOfCategory).map(([categoryName, color]) => {
              const categoryExpensePercentage =
                stats.expenses_count_grouped_by_category?.find(
                  (entry) => entry.category === categoryName,
                )?.percentage || 0;
              const categoryExpenseCount =
                stats.expenses_count_grouped_by_category?.find(
                  (entry) => entry.category === categoryName,
                )?.total || 0;

              return (
                <LegendCategoryCard
                  key={categoryName}
                  category={categoryName}
                  categoryExpenseCount={categoryExpenseCount}
                  categoryExpensePercentage={categoryExpensePercentage}
                />
              );
            })}
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default AdminDashboard;
