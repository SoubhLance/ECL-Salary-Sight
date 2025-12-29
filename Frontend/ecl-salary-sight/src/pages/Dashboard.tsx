import { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Wallet, TrendingDown, Banknote, FileText, Bell, LogOut, User, LayoutDashboard, Receipt, ClipboardList, Calendar } from 'lucide-react';
import StatCard from '@/components/dashboard/StatCard';
import SalaryBarChart from '@/components/dashboard/SalaryBarChart';
import SalaryTrendChart from '@/components/dashboard/SalaryTrendChart';
import EmployeeTable from '@/components/dashboard/EmployeeTable';
import PayrollTab from '@/components/dashboard/PayrollTab';
import ReportsTab from '@/components/dashboard/ReportsTab';
import FinancialYearReportTab from '@/components/dashboard/FinancialYearReportTab';
import UploadDataModal from '@/components/dashboard/UploadDataModal';
import eclLogo from '@/assets/ecl-logo.png';

type TabType = 'dashboard' | 'payroll' | 'reports' | 'fy-report';

const Dashboard = () => {
  const { logout, user } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const tabs = [
    { id: 'dashboard' as TabType, label: 'Dashboard', icon: LayoutDashboard },
    { id: 'payroll' as TabType, label: 'Payroll', icon: Receipt },
    { id: 'reports' as TabType, label: 'Reports', icon: ClipboardList },
    { id: 'fy-report' as TabType, label: 'FY Report', icon: Calendar },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-card border-b border-border shadow-sm sticky top-0 z-50"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo and Nav */}
            <div className="flex items-center gap-8">
              <img 
                src={eclLogo} 
                alt="ECL" 
                className="h-10 object-contain cursor-pointer" 
                onClick={() => setActiveTab('dashboard')}
              />
              <nav className="hidden md:flex items-center gap-1">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors flex items-center gap-2 ${
                      activeTab === tab.id
                        ? 'text-primary bg-primary/10'
                        : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                    }`}
                  >
                    <tab.icon className="w-4 h-4" />
                    {tab.label}
                  </button>
                ))}
                <UploadDataModal />
              </nav>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3">
              <button className="p-2 rounded-lg hover:bg-muted transition-colors relative">
                <Bell className="w-5 h-5 text-muted-foreground" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-destructive rounded-full" />
              </button>
              <div className="flex items-center gap-2 px-3 py-1.5 bg-muted rounded-lg">
                <User className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm font-medium text-foreground hidden sm:inline">
                  {user?.employeeId || 'Admin'}
                </span>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-destructive hover:bg-destructive/10 rounded-lg transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Tab Navigation */}
        <div className="md:hidden border-t border-border">
          <div className="flex">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 py-3 text-sm font-medium text-center transition-colors ${
                  activeTab === tab.id
                    ? 'text-primary border-b-2 border-primary'
                    : 'text-muted-foreground'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </motion.header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
        {activeTab === 'dashboard' && (
          <>
            {/* Page Title */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, duration: 0.5 }}
              className="mb-6 lg:mb-8"
            >
              <h1 className="text-2xl lg:text-3xl font-bold text-foreground">Salary Dashboard - {new Date().getFullYear()}</h1>
              <p className="text-muted-foreground mt-1">Overview of employee salary data and analytics</p>
            </motion.div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-6 lg:mb-8">
              <StatCard
                title="Total Gross"
                value="₹4.52 Cr"
                change="+2.5% from last month"
                changeType="positive"
                icon={Wallet}
                iconBg="bg-primary"
                delay={0.1}
              />
              <StatCard
                title="Total Net"
                value="₹3.85 Cr"
                change="+2.1%"
                changeType="positive"
                icon={Banknote}
                iconBg="bg-ecl-green"
                delay={0.15}
              />
              <StatCard
                title="Total Deductions"
                value="₹67.0 L"
                change="-1.2%"
                changeType="negative"
                icon={TrendingDown}
                iconBg="bg-amber-500"
                delay={0.2}
              />
              <StatCard
                title="Headcount"
                value="1,450"
                change="+12 new hires"
                changeType="neutral"
                icon={FileText}
                iconBg="bg-ecl-slate"
                delay={0.25}
              />
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6 mb-6 lg:mb-8">
              <SalaryBarChart />
              <SalaryTrendChart />
            </div>

            {/* Employee Table */}
            <EmployeeTable />
          </>
        )}

        {activeTab === 'payroll' && <PayrollTab />}
        {activeTab === 'reports' && <ReportsTab />}
        {activeTab === 'fy-report' && <FinancialYearReportTab />}
      </main>

      {/* Footer */}
      <footer className="border-t border-border mt-8 py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-center text-sm text-muted-foreground">
            © {new Date().getFullYear()} Eastern Coalfields Limited. ECL Salary Sight - All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Dashboard;
