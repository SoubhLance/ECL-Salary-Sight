import { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, Download, User } from 'lucide-react';

const employeeDatabase: Record<string, { name: string; department: string; designation: string; salaryData: Array<{ month: string; gross: string; deductions: string; net: string }> }> = {
  ECL001: {
    name: 'Rajesh Kumar',
    department: 'Mining',
    designation: 'Senior Mining Engineer',
    salaryData: [
      { month: 'Jan 2024', gross: '₹1,35,000', deductions: '₹43,000', net: '₹92,000' },
      { month: 'Feb 2024', gross: '₹1,36,000', deductions: '₹43,000', net: '₹93,000' },
      { month: 'Mar 2024', gross: '₹1,37,000', deductions: '₹43,000', net: '₹94,000' },
      { month: 'Apr 2024', gross: '₹1,38,000', deductions: '₹43,500', net: '₹94,500' },
      { month: 'May 2024', gross: '₹1,38,500', deductions: '₹43,500', net: '₹95,000' },
      { month: 'Jun 2024', gross: '₹1,39,000', deductions: '₹44,000', net: '₹95,000' },
    ],
  },
  ECL002: {
    name: 'Priya Sharma',
    department: 'HR',
    designation: 'HR Manager',
    salaryData: [
      { month: 'Jan 2024', gross: '₹92,000', deductions: '₹16,500', net: '₹75,500' },
      { month: 'Feb 2024', gross: '₹93,000', deductions: '₹16,500', net: '₹76,500' },
      { month: 'Mar 2024', gross: '₹93,500', deductions: '₹16,500', net: '₹77,000' },
      { month: 'Apr 2024', gross: '₹94,000', deductions: '₹16,500', net: '₹77,500' },
      { month: 'May 2024', gross: '₹94,500', deductions: '₹16,500', net: '₹78,000' },
      { month: 'Jun 2024', gross: '₹95,000', deductions: '₹16,500', net: '₹78,500' },
    ],
  },
  ECL003: {
    name: 'Amit Singh',
    department: 'Finance',
    designation: 'Chief Financial Officer',
    salaryData: [
      { month: 'Jan 2024', gross: '₹1,45,000', deductions: '₹35,000', net: '₹1,10,000' },
      { month: 'Feb 2024', gross: '₹1,46,000', deductions: '₹35,000', net: '₹1,11,000' },
      { month: 'Mar 2024', gross: '₹1,47,000', deductions: '₹35,000', net: '₹1,12,000' },
      { month: 'Apr 2024', gross: '₹1,48,000', deductions: '₹35,000', net: '₹1,13,000' },
      { month: 'May 2024', gross: '₹1,49,000', deductions: '₹35,000', net: '₹1,14,000' },
      { month: 'Jun 2024', gross: '₹1,50,000', deductions: '₹34,940', net: '₹1,15,060' },
    ],
  },
  ECL004: {
    name: 'Chunab Kumar',
    department: 'Operations',
    designation: 'Operations Manager',
    salaryData: [
      { month: 'Jan 2024', gross: '₹90,000', deductions: '₹10,000', net: '₹80,000' },
      { month: 'Feb 2024', gross: '₹91,000', deductions: '₹10,000', net: '₹81,000' },
      { month: 'Mar 2024', gross: '₹92,000', deductions: '₹10,000', net: '₹82,000' },
      { month: 'Apr 2024', gross: '₹93,000', deductions: '₹10,000', net: '₹83,000' },
      { month: 'May 2024', gross: '₹94,000', deductions: '₹10,000', net: '₹84,000' },
      { month: 'Jun 2024', gross: '₹95,000', deductions: '₹10,000', net: '₹85,000' },
    ],
  },
  ECL005: {
    name: 'Neya Kumar',
    department: 'IT',
    designation: 'Software Developer',
    salaryData: [
      { month: 'Jan 2024', gross: '₹80,000', deductions: '₹10,000', net: '₹70,000' },
      { month: 'Feb 2024', gross: '₹81,000', deductions: '₹10,000', net: '₹71,000' },
      { month: 'Mar 2024', gross: '₹82,000', deductions: '₹10,000', net: '₹72,000' },
      { month: 'Apr 2024', gross: '₹83,000', deductions: '₹10,000', net: '₹73,000' },
      { month: 'May 2024', gross: '₹84,000', deductions: '₹10,000', net: '₹74,000' },
      { month: 'Jun 2024', gross: '₹85,000', deductions: '₹10,000', net: '₹75,000' },
    ],
  },
};

const ReportsTab = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedEmployee, setSelectedEmployee] = useState<string | null>(null);

  const handleSearch = () => {
    const query = searchQuery.toUpperCase().trim();
    if (employeeDatabase[query]) {
      setSelectedEmployee(query);
    } else {
      // Search by name
      const found = Object.entries(employeeDatabase).find(
        ([, emp]) => emp.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
      if (found) {
        setSelectedEmployee(found[0]);
      } else {
        setSelectedEmployee(null);
      }
    }
  };

  const handleDownloadPDF = () => {
    if (!selectedEmployee) return;
    const employee = employeeDatabase[selectedEmployee];
    
    // Create simple text content for download
    let content = `SALARY REPORT - ${employee.name}\n`;
    content += `${'='.repeat(50)}\n\n`;
    content += `Employee Code: ${selectedEmployee}\n`;
    content += `Name: ${employee.name}\n`;
    content += `Department: ${employee.department}\n`;
    content += `Designation: ${employee.designation}\n\n`;
    content += `${'='.repeat(50)}\n`;
    content += `MONTHLY SALARY DETAILS\n`;
    content += `${'='.repeat(50)}\n\n`;
    
    employee.salaryData.forEach((row) => {
      content += `${row.month}\n`;
      content += `  Gross: ${row.gross}\n`;
      content += `  Deductions: ${row.deductions}\n`;
      content += `  Net: ${row.net}\n\n`;
    });

    content += `\nGenerated on: ${new Date().toLocaleDateString()}\n`;
    content += `ECL Salary Sight - Eastern Coalfields Limited`;

    // Download as text file
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${employee.name.replace(/\s+/g, '_')}_Salary_Report.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const employee = selectedEmployee ? employeeDatabase[selectedEmployee] : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      {/* Search Section */}
      <div className="stat-card">
        <h2 className="text-lg font-semibold text-foreground mb-4">Employee Salary Report</h2>
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search by Employee ID (e.g., ECL001) or Name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              className="input-field pl-10 py-2.5 w-full"
            />
          </div>
          <button onClick={handleSearch} className="btn-primary px-6 py-2.5">
            Search
          </button>
        </div>
      </div>

      {/* Employee Details */}
      {employee && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="stat-card"
        >
          {/* Employee Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-border">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center">
                <User className="w-7 h-7 text-primary" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-foreground">{employee.name}</h3>
                <p className="text-sm text-muted-foreground">
                  {selectedEmployee} • {employee.department} • {employee.designation}
                </p>
              </div>
            </div>
            <button
              onClick={handleDownloadPDF}
              className="btn-primary flex items-center gap-2 px-4 py-2"
            >
              <Download className="w-4 h-4" />
              Download Report
            </button>
          </div>

          {/* Salary Table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-4 text-sm font-semibold text-foreground">Month</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-foreground">Gross Salary</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-foreground">Deductions</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-foreground">Net Salary</th>
                </tr>
              </thead>
              <tbody>
                {employee.salaryData.map((row, index) => (
                  <motion.tr
                    key={row.month}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05, duration: 0.3 }}
                    className="table-row"
                  >
                    <td className="py-3 px-4 text-sm font-medium text-foreground">{row.month}</td>
                    <td className="py-3 px-4 text-sm text-muted-foreground">{row.gross}</td>
                    <td className="py-3 px-4 text-sm text-destructive">{row.deductions}</td>
                    <td className="py-3 px-4 text-sm font-medium text-ecl-green">{row.net}</td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      )}

      {/* No Results */}
      {searchQuery && !employee && (
        <div className="stat-card text-center py-12">
          <p className="text-muted-foreground">No employee found. Try searching by ID (e.g., ECL001) or name.</p>
        </div>
      )}
    </motion.div>
  );
};

export default ReportsTab;
