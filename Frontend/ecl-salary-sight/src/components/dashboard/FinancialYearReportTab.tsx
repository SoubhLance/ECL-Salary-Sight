import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Search, ChevronLeft, ChevronRight, Download, Calendar } from 'lucide-react';

const fullEmployeeData = [
  { code: 'ECL001', name: 'Rajesh Kumar', department: 'Mining', collieryArea: 'Rajmahal', month: 'Jan 2024', gross: '₹1,35,000', net: '₹92,000' },
  { code: 'ECL001', name: 'Rajesh Kumar', department: 'Mining', collieryArea: 'Rajmahal', month: 'Feb 2024', gross: '₹1,36,000', net: '₹93,000' },
  { code: 'ECL001', name: 'Rajesh Kumar', department: 'Mining', collieryArea: 'Rajmahal', month: 'Mar 2024', gross: '₹1,37,000', net: '₹94,000' },
  { code: 'ECL001', name: 'Rajesh Kumar', department: 'Mining', collieryArea: 'Rajmahal', month: 'Apr 2024', gross: '₹1,38,000', net: '₹94,500' },
  { code: 'ECL001', name: 'Rajesh Kumar', department: 'Mining', collieryArea: 'Rajmahal', month: 'May 2024', gross: '₹1,38,500', net: '₹95,000' },
  { code: 'ECL001', name: 'Rajesh Kumar', department: 'Mining', collieryArea: 'Rajmahal', month: 'Jun 2024', gross: '₹1,39,000', net: '₹95,000' },
  { code: 'ECL001', name: 'Rajesh Kumar', department: 'Mining', collieryArea: 'Rajmahal', month: 'Jul 2024', gross: '₹1,40,000', net: '₹96,000' },
  { code: 'ECL001', name: 'Rajesh Kumar', department: 'Mining', collieryArea: 'Rajmahal', month: 'Aug 2024', gross: '₹1,41,000', net: '₹97,000' },
  { code: 'ECL001', name: 'Rajesh Kumar', department: 'Mining', collieryArea: 'Rajmahal', month: 'Sep 2024', gross: '₹1,42,000', net: '₹98,000' },
  { code: 'ECL001', name: 'Rajesh Kumar', department: 'Mining', collieryArea: 'Rajmahal', month: 'Oct 2024', gross: '₹1,43,000', net: '₹99,000' },
  { code: 'ECL001', name: 'Rajesh Kumar', department: 'Mining', collieryArea: 'Rajmahal', month: 'Nov 2024', gross: '₹1,44,000', net: '₹1,00,000' },
  { code: 'ECL001', name: 'Rajesh Kumar', department: 'Mining', collieryArea: 'Rajmahal', month: 'Dec 2024', gross: '₹1,45,000', net: '₹1,01,000' },
  { code: 'ECL002', name: 'Priya Sharma', department: 'HR', collieryArea: 'Sonepur Bazari', month: 'Apr 2024', gross: '₹94,000', net: '₹77,500' },
  { code: 'ECL002', name: 'Priya Sharma', department: 'HR', collieryArea: 'Sonepur Bazari', month: 'May 2024', gross: '₹94,500', net: '₹78,000' },
  { code: 'ECL002', name: 'Priya Sharma', department: 'HR', collieryArea: 'Sonepur Bazari', month: 'Jun 2024', gross: '₹95,000', net: '₹78,500' },
  { code: 'ECL002', name: 'Priya Sharma', department: 'HR', collieryArea: 'Sonepur Bazari', month: 'Jul 2024', gross: '₹95,500', net: '₹79,000' },
  { code: 'ECL002', name: 'Priya Sharma', department: 'HR', collieryArea: 'Sonepur Bazari', month: 'Aug 2024', gross: '₹96,000', net: '₹79,500' },
  { code: 'ECL002', name: 'Priya Sharma', department: 'HR', collieryArea: 'Sonepur Bazari', month: 'Sep 2024', gross: '₹96,500', net: '₹80,000' },
  { code: 'ECL002', name: 'Priya Sharma', department: 'HR', collieryArea: 'Sonepur Bazari', month: 'Oct 2024', gross: '₹97,000', net: '₹80,500' },
  { code: 'ECL002', name: 'Priya Sharma', department: 'HR', collieryArea: 'Sonepur Bazari', month: 'Nov 2024', gross: '₹97,500', net: '₹81,000' },
  { code: 'ECL002', name: 'Priya Sharma', department: 'HR', collieryArea: 'Sonepur Bazari', month: 'Dec 2024', gross: '₹98,000', net: '₹81,500' },
  { code: 'ECL002', name: 'Priya Sharma', department: 'HR', collieryArea: 'Sonepur Bazari', month: 'Jan 2025', gross: '₹98,500', net: '₹82,000' },
  { code: 'ECL002', name: 'Priya Sharma', department: 'HR', collieryArea: 'Sonepur Bazari', month: 'Feb 2025', gross: '₹99,000', net: '₹82,500' },
  { code: 'ECL002', name: 'Priya Sharma', department: 'HR', collieryArea: 'Sonepur Bazari', month: 'Mar 2025', gross: '₹99,500', net: '₹83,000' },
  { code: 'ECL003', name: 'Amit Singh', department: 'Finance', collieryArea: 'Kunustoria', month: 'Apr 2024', gross: '₹1,48,000', net: '₹1,13,000' },
  { code: 'ECL003', name: 'Amit Singh', department: 'Finance', collieryArea: 'Kunustoria', month: 'May 2024', gross: '₹1,49,000', net: '₹1,14,000' },
  { code: 'ECL003', name: 'Amit Singh', department: 'Finance', collieryArea: 'Kunustoria', month: 'Jun 2024', gross: '₹1,50,000', net: '₹1,15,000' },
  { code: 'ECL003', name: 'Amit Singh', department: 'Finance', collieryArea: 'Kunustoria', month: 'Jul 2024', gross: '₹1,51,000', net: '₹1,16,000' },
  { code: 'ECL003', name: 'Amit Singh', department: 'Finance', collieryArea: 'Kunustoria', month: 'Aug 2024', gross: '₹1,52,000', net: '₹1,17,000' },
  { code: 'ECL003', name: 'Amit Singh', department: 'Finance', collieryArea: 'Kunustoria', month: 'Sep 2024', gross: '₹1,53,000', net: '₹1,18,000' },
  { code: 'ECL003', name: 'Amit Singh', department: 'Finance', collieryArea: 'Kunustoria', month: 'Oct 2024', gross: '₹1,54,000', net: '₹1,19,000' },
  { code: 'ECL003', name: 'Amit Singh', department: 'Finance', collieryArea: 'Kunustoria', month: 'Nov 2024', gross: '₹1,55,000', net: '₹1,20,000' },
  { code: 'ECL003', name: 'Amit Singh', department: 'Finance', collieryArea: 'Kunustoria', month: 'Dec 2024', gross: '₹1,56,000', net: '₹1,21,000' },
  { code: 'ECL003', name: 'Amit Singh', department: 'Finance', collieryArea: 'Kunustoria', month: 'Jan 2025', gross: '₹1,57,000', net: '₹1,22,000' },
  { code: 'ECL003', name: 'Amit Singh', department: 'Finance', collieryArea: 'Kunustoria', month: 'Feb 2025', gross: '₹1,58,000', net: '₹1,23,000' },
  { code: 'ECL003', name: 'Amit Singh', department: 'Finance', collieryArea: 'Kunustoria', month: 'Mar 2025', gross: '₹1,59,000', net: '₹1,24,000' },
];

const financialYears = ['2024-25', '2023-24'];
const fyMonthOrder = ['Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar'];

const parseAmount = (amount: string) => {
  return parseInt(amount.replace(/[₹,]/g, ''), 10);
};

const formatAmount = (amount: number) => {
  return '₹' + amount.toLocaleString('en-IN');
};

const FinancialYearReportTab = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFY, setSelectedFY] = useState('2024-25');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const getFYDateRange = (fy: string) => {
    const [startYear, endYear] = fy.split('-').map((y, i) => i === 0 ? parseInt(y) : parseInt('20' + y));
    return { startYear, endYear };
  };

  const isInFY = (monthStr: string, fy: string) => {
    const [month, year] = monthStr.split(' ');
    const yearNum = parseInt(year);
    const { startYear, endYear } = getFYDateRange(fy);
    
    if (['Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'].includes(month)) {
      return yearNum === startYear;
    } else {
      return yearNum === endYear;
    }
  };

  const aggregatedData = useMemo(() => {
    const employeeMap = new Map<string, {
      code: string;
      name: string;
      department: string;
      collieryArea: string;
      totalGross: number;
      totalNet: number;
      monthCount: number;
      months: string[];
    }>();

    fullEmployeeData
      .filter((emp) => isInFY(emp.month, selectedFY))
      .forEach((emp) => {
        const key = emp.code;
        if (!employeeMap.has(key)) {
          employeeMap.set(key, {
            code: emp.code,
            name: emp.name,
            department: emp.department,
            collieryArea: emp.collieryArea,
            totalGross: 0,
            totalNet: 0,
            monthCount: 0,
            months: [],
          });
        }
        const data = employeeMap.get(key)!;
        data.totalGross += parseAmount(emp.gross);
        data.totalNet += parseAmount(emp.net);
        data.monthCount += 1;
        data.months.push(emp.month);
      });

    return Array.from(employeeMap.values());
  }, [selectedFY]);

  const filteredData = aggregatedData.filter((employee) => {
    const matchesSearch =
      employee.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      employee.code.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const paginatedData = filteredData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const totals = useMemo(() => {
    return filteredData.reduce(
      (acc, emp) => ({
        gross: acc.gross + emp.totalGross,
        net: acc.net + emp.totalNet,
      }),
      { gross: 0, net: 0 }
    );
  }, [filteredData]);

  const handleDownload = () => {
    const csvContent = [
      ['Employee Code', 'Name', 'Department', 'Colliery Area', 'FY Total Gross', 'FY Total Net', 'Months Worked'].join(','),
      ...filteredData.map((emp) =>
        [emp.code, emp.name, emp.department, emp.collieryArea, formatAmount(emp.totalGross), formatAmount(emp.totalNet), emp.monthCount].join(',')
      ),
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `FY_${selectedFY}_Report.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="stat-card"
    >
      {/* Header */}
      <div className="flex flex-col gap-4 mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Calendar className="w-5 h-5 text-primary" />
            <h2 className="text-lg font-semibold text-foreground">Financial Year Report</h2>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <select
              value={selectedFY}
              onChange={(e) => {
                setSelectedFY(e.target.value);
                setCurrentPage(1);
              }}
              className="input-field py-2 px-3 text-sm min-w-[120px] bg-card"
            >
              {financialYears.map((fy) => (
                <option key={fy} value={fy}>
                  FY {fy}
                </option>
              ))}
            </select>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search by name or ID..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                className="input-field pl-10 py-2 text-sm min-w-[200px]"
              />
            </div>
            <button
              onClick={handleDownload}
              className="btn-primary py-2 px-4 text-sm flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              Export CSV
            </button>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-primary/10 rounded-lg p-4">
            <p className="text-sm text-muted-foreground">FY Total Gross</p>
            <p className="text-xl font-bold text-foreground">{formatAmount(totals.gross)}</p>
          </div>
          <div className="bg-ecl-green/10 rounded-lg p-4">
            <p className="text-sm text-muted-foreground">FY Total Net</p>
            <p className="text-xl font-bold text-ecl-green">{formatAmount(totals.net)}</p>
          </div>
          <div className="bg-amber-500/10 rounded-lg p-4">
            <p className="text-sm text-muted-foreground">Total Employees</p>
            <p className="text-xl font-bold text-foreground">{filteredData.length}</p>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left py-3 px-4 text-sm font-semibold text-foreground">Employee Code</th>
              <th className="text-left py-3 px-4 text-sm font-semibold text-foreground">Name</th>
              <th className="text-left py-3 px-4 text-sm font-semibold text-foreground">Department</th>
              <th className="text-left py-3 px-4 text-sm font-semibold text-foreground">Colliery Area</th>
              <th className="text-left py-3 px-4 text-sm font-semibold text-foreground">FY Gross</th>
              <th className="text-left py-3 px-4 text-sm font-semibold text-foreground">FY Net</th>
              <th className="text-left py-3 px-4 text-sm font-semibold text-foreground">Months</th>
            </tr>
          </thead>
          <tbody>
            {paginatedData.map((employee, index) => (
              <motion.tr
                key={employee.code}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.03, duration: 0.3 }}
                className="table-row"
              >
                <td className="py-3 px-4 text-sm text-muted-foreground">{employee.code}</td>
                <td className="py-3 px-4 text-sm font-medium text-foreground">{employee.name}</td>
                <td className="py-3 px-4 text-sm text-muted-foreground">{employee.department}</td>
                <td className="py-3 px-4 text-sm text-muted-foreground">{employee.collieryArea}</td>
                <td className="py-3 px-4 text-sm text-muted-foreground">{formatAmount(employee.totalGross)}</td>
                <td className="py-3 px-4 text-sm font-medium text-ecl-green">{formatAmount(employee.totalNet)}</td>
                <td className="py-3 px-4 text-sm text-muted-foreground">{employee.monthCount}/12</td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>

      {filteredData.length === 0 && (
        <div className="text-center py-8 text-muted-foreground">No records found for this financial year</div>
      )}

      {/* Pagination */}
      <div className="flex items-center justify-between mt-4 pt-4 border-t border-border">
        <span className="text-sm text-muted-foreground">
          Showing {paginatedData.length} of {filteredData.length} employees
        </span>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="p-2 rounded-lg hover:bg-muted transition-colors disabled:opacity-50"
          >
            <ChevronLeft className="w-4 h-4 text-muted-foreground" />
          </button>
          <span className="text-sm text-muted-foreground">
            Page {currentPage} of {totalPages || 1}
          </span>
          <button
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages || totalPages === 0}
            className="p-2 rounded-lg hover:bg-muted transition-colors disabled:opacity-50"
          >
            <ChevronRight className="w-4 h-4 text-muted-foreground" />
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default FinancialYearReportTab;
