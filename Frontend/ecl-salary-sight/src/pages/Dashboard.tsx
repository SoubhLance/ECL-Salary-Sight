import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import {
  Wallet,
  TrendingDown,
  Banknote,
  FileText,
  Bell,
  LogOut,
  User,
  LayoutDashboard,
  Receipt,
  ClipboardList,
  Calendar,
} from "lucide-react";

import StatCard from "@/components/dashboard/StatCard";
import SalaryBarChart from "@/components/dashboard/SalaryBarChart";
import SalaryTrendChart from "@/components/dashboard/SalaryTrendChart";
import EmployeeTable from "@/components/dashboard/EmployeeTable";
import PayrollTab from "@/components/dashboard/PayrollTab";
import ReportsTab from "@/components/dashboard/ReportsTab";
import FinancialYearReportTab from "@/components/dashboard/FinancialYearReportTab";
import UploadDataModal from "@/components/dashboard/UploadDataModal";

import { fetchAllSalary } from "@/lib/salaryApi";
import eclLogo from "@/assets/ecl-logo.png";

type TabType = "dashboard" | "payroll" | "reports" | "fy-report";

const Dashboard = () => {
  const { logout, user } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<TabType>("dashboard");

  const [rows, setRows] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const year = new Date().getFullYear();

  useEffect(() => {
    if (activeTab !== "dashboard") return;

    const load = async () => {
      setLoading(true);
      try {
        const res = await fetchAllSalary(year);
        setRows(res.data || []);
      } catch (e) {
        console.error("Dashboard fetch failed", e);
        setRows([]);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [activeTab, year]);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const tabs = [
    { id: "dashboard" as TabType, label: "Dashboard", icon: LayoutDashboard },
    { id: "payroll" as TabType, label: "Payroll", icon: Receipt },
    { id: "reports" as TabType, label: "Reports", icon: ClipboardList },
    { id: "fy-report" as TabType, label: "FY Report", icon: Calendar },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* HEADER (unchanged) */}
      <motion.header className="bg-card border-b border-border sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <img
              src={eclLogo}
              alt="ECL"
              className="h-10 cursor-pointer"
              onClick={() => setActiveTab("dashboard")}
            />
            <nav className="hidden md:flex gap-1">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-4 py-2 rounded-lg text-sm flex gap-2 ${
                    activeTab === tab.id
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:bg-muted"
                  }`}
                >
                  <tab.icon className="w-4 h-4" />
                  {tab.label}
                </button>
              ))}
              <UploadDataModal />
            </nav>
          </div>

          <div className="flex items-center gap-3">
            <Bell className="w-5 h-5 text-muted-foreground" />
            <span className="text-sm">{user?.employeeId || "Admin"}</span>
            <button onClick={handleLogout} className="text-destructive">
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </motion.header>

      {/* MAIN */}
      <main className="max-w-7xl mx-auto px-4 py-6">
        {activeTab === "dashboard" && (
          <>
            <h1 className="text-2xl font-bold mb-6">
              Salary Dashboard – {year}
            </h1>

            {/* STATS */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              <StatCard type="gross" rows={rows} />
              <StatCard type="net" rows={rows} />
              <StatCard type="deductions" rows={rows} />
              <StatCard type="headcount" rows={rows} />
            </div>

            {/* CHARTS */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              <SalaryBarChart rows={rows} />
              <SalaryTrendChart rows={rows} />
            </div>

            {/* TABLE */}
            {/* <EmployeeTable rows={rows} loading={loading} /> */}
          </>
        )}

        {activeTab === "payroll" && <PayrollTab />}
        {activeTab === "reports" && <ReportsTab />}
        {activeTab === "fy-report" && <FinancialYearReportTab />}
      </main>
    </div>
  );
};

export default Dashboard;
