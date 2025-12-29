import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const employeeData = [
  { code: 'ECL001', name: 'Rajesh Kumar', department: 'Mining', month: 'Jun 2024', gross: '₹1,39,000', net: '₹95,000' },
  { code: 'ECL002', name: 'Priya Sharma', department: 'HR', month: 'Jun 2024', gross: '₹95,000', net: '₹78,500' },
  { code: 'ECL003', name: 'Amit Singh', department: 'Finance', month: 'Jun 2024', gross: '₹1,50,000', net: '₹1,15,060' },
  { code: 'ECL004', name: 'Chunab Kumar', department: 'Operations', month: 'Jun 2024', gross: '₹95,000', net: '₹85,000' },
  { code: 'ECL005', name: 'Neya Kumar', department: 'IT', month: 'Jun 2024', gross: '₹85,000', net: '₹75,000' },
];

const EmployeeTable = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.6, duration: 0.5 }}
      className="stat-card"
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <button className="btn-primary py-2 px-4 text-sm w-fit">
          View Excel Data
        </button>
        <div className="flex flex-wrap items-center gap-3 text-sm">
          <div className="flex items-center gap-2">
            <span className="text-muted-foreground">Month:</span>
            <select className="input-field py-1 px-3 text-sm min-w-[120px]">
              <option>Jun 2024</option>
              <option>May 2024</option>
              <option>Apr 2024</option>
            </select>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-muted-foreground">Name:</span>
            <select className="input-field py-1 px-3 text-sm min-w-[140px]">
              <option>All Employees</option>
            </select>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-muted-foreground">Department:</span>
            <select className="input-field py-1 px-3 text-sm min-w-[140px]">
              <option>All Departments</option>
              <option>Mining</option>
              <option>HR</option>
              <option>Finance</option>
              <option>Operations</option>
              <option>IT</option>
            </select>
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
              <th className="text-left py-3 px-4 text-sm font-semibold text-foreground">Gross</th>
              <th className="text-left py-3 px-4 text-sm font-semibold text-foreground">Net</th>
              <th className="text-left py-3 px-4 text-sm font-semibold text-foreground">Month</th>
            </tr>
          </thead>
          <tbody>
            {employeeData.map((employee, index) => (
              <motion.tr
                key={employee.code}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.7 + index * 0.05, duration: 0.3 }}
                className="table-row"
              >
                <td className="py-3 px-4 text-sm text-muted-foreground">{employee.code}</td>
                <td className="py-3 px-4 text-sm font-medium text-foreground">{employee.name}</td>
                <td className="py-3 px-4 text-sm text-muted-foreground">{employee.gross}</td>
                <td className="py-3 px-4 text-sm font-medium text-ecl-green">{employee.net}</td>
                <td className="py-3 px-4 text-sm text-muted-foreground">{employee.month}</td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-end gap-2 mt-4 pt-4 border-t border-border">
        <button className="p-2 rounded-lg hover:bg-muted transition-colors">
          <ChevronLeft className="w-4 h-4 text-muted-foreground" />
        </button>
        <span className="text-sm text-muted-foreground">Page 1 of 10</span>
        <button className="p-2 rounded-lg hover:bg-muted transition-colors">
          <ChevronRight className="w-4 h-4 text-muted-foreground" />
        </button>
      </div>
    </motion.div>
  );
};

export default EmployeeTable;
