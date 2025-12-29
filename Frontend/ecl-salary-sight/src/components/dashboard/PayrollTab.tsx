import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Search, ChevronLeft, ChevronRight, Calendar, Building2, MapPin, Filter, X, CalendarDays } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useEmployeeData } from '@/contexts/EmployeeDataContext';

const currentYear = new Date().getFullYear();
const years = ['All Years', ...Array.from({ length: 5 }, (_, i) => String(currentYear - i))];
const months = ['All Months', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const departments = ['All Departments', 'Mining', 'HR', 'Finance', 'Operations', 'IT'];
const collieryAreas = ['All Areas', 'Rajmahal', 'Sonepur Bazari', 'Kunustoria', 'Sripur', 'Kajora'];

const PayrollTab = () => {
  const { employeeData } = useEmployeeData();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedYear, setSelectedYear] = useState(String(currentYear));
  const [selectedMonth, setSelectedMonth] = useState('All Months');
  const [selectedDepartment, setSelectedDepartment] = useState('All Departments');
  const [selectedCollieryArea, setSelectedCollieryArea] = useState('All Areas');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const filteredData = useMemo(() => employeeData.filter((employee) => {
    const matchesSearch =
      employee.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      employee.code.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesYear = selectedYear === 'All Years' || employee.month?.includes(selectedYear);
    const matchesMonth = selectedMonth === 'All Months' || employee.month?.startsWith(selectedMonth);
    const matchesDepartment = selectedDepartment === 'All Departments' || employee.department === selectedDepartment;
    const matchesCollieryArea = selectedCollieryArea === 'All Areas' || employee.collieryArea === selectedCollieryArea;
    return matchesSearch && matchesYear && matchesMonth && matchesDepartment && matchesCollieryArea;
  }), [employeeData, searchQuery, selectedYear, selectedMonth, selectedDepartment, selectedCollieryArea]);

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const paginatedData = filteredData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const resetFilters = () => {
    setCurrentPage(1);
  };

  const clearAllFilters = () => {
    setSearchQuery('');
    setSelectedYear(String(currentYear));
    setSelectedMonth('All Months');
    setSelectedDepartment('All Departments');
    setSelectedCollieryArea('All Areas');
    setCurrentPage(1);
  };

  const hasActiveFilters = searchQuery || selectedYear !== String(currentYear) || selectedMonth !== 'All Months' || selectedDepartment !== 'All Departments' || selectedCollieryArea !== 'All Areas';

  const activeFilterCount = [
    searchQuery,
    selectedYear !== String(currentYear) ? selectedYear : null,
    selectedMonth !== 'All Months' ? selectedMonth : null,
    selectedDepartment !== 'All Departments' ? selectedDepartment : null,
    selectedCollieryArea !== 'All Areas' ? selectedCollieryArea : null,
  ].filter(Boolean).length;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="stat-card"
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <h2 className="text-lg font-semibold text-foreground">Payroll Data</h2>
          {activeFilterCount > 0 && (
            <Badge variant="secondary" className="bg-primary/10 text-primary">
              {activeFilterCount} filter{activeFilterCount > 1 ? 's' : ''} active
            </Badge>
          )}
        </div>
        <div className="flex items-center gap-2">
          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearAllFilters}
              className="text-muted-foreground hover:text-foreground gap-1"
            >
              <X className="w-4 h-4" />
              Clear all
            </Button>
          )}
        </div>
      </div>

      {/* Filters Card */}
      <div className="bg-muted/30 rounded-xl p-4 mb-6 border border-border/50">
        <div className="flex items-center gap-2 mb-4">
          <Filter className="w-4 h-4 text-primary" />
          <span className="text-sm font-medium text-foreground">Filters</span>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search name or ID..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                resetFilters();
              }}
              className="pl-10 bg-background"
            />
          </div>

          {/* Year Filter */}
          <div className="space-y-1.5">
            <Select
              value={selectedYear}
              onValueChange={(value) => {
                setSelectedYear(value);
                resetFilters();
              }}
            >
              <SelectTrigger className="bg-background">
                <div className="flex items-center gap-2">
                  <CalendarDays className="w-4 h-4 text-muted-foreground" />
                  <SelectValue placeholder="Select Year" />
                </div>
              </SelectTrigger>
              <SelectContent>
                {years.map((year) => (
                  <SelectItem key={year} value={year}>
                    {year}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Month Filter */}
          <div className="space-y-1.5">
            <Select
              value={selectedMonth}
              onValueChange={(value) => {
                setSelectedMonth(value);
                resetFilters();
              }}
            >
              <SelectTrigger className="bg-background">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-muted-foreground" />
                  <SelectValue placeholder="Select Month" />
                </div>
              </SelectTrigger>
              <SelectContent>
                {months.map((month) => (
                  <SelectItem key={month} value={month}>
                    {month}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Department Filter */}
          <div className="space-y-1.5">
            <Select
              value={selectedDepartment}
              onValueChange={(value) => {
                setSelectedDepartment(value);
                resetFilters();
              }}
            >
              <SelectTrigger className="bg-background">
                <div className="flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-muted-foreground" />
                  <SelectValue placeholder="Select Department" />
                </div>
              </SelectTrigger>
              <SelectContent>
                {departments.map((dept) => (
                  <SelectItem key={dept} value={dept}>
                    {dept}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Colliery Area Filter */}
          <div className="space-y-1.5">
            <Select
              value={selectedCollieryArea}
              onValueChange={(value) => {
                setSelectedCollieryArea(value);
                resetFilters();
              }}
            >
              <SelectTrigger className="bg-background">
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-muted-foreground" />
                  <SelectValue placeholder="Select Area" />
                </div>
              </SelectTrigger>
              <SelectContent>
                {collieryAreas.map((area) => (
                  <SelectItem key={area} value={area}>
                    {area}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
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
              <th className="text-left py-3 px-4 text-sm font-semibold text-foreground">Month</th>
              <th className="text-left py-3 px-4 text-sm font-semibold text-foreground">Gross</th>
              <th className="text-left py-3 px-4 text-sm font-semibold text-foreground">Net</th>
            </tr>
          </thead>
          <tbody>
            {paginatedData.map((employee, index) => (
              <motion.tr
                key={`${employee.code}-${employee.month}`}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.03, duration: 0.3 }}
                className="table-row"
              >
                <td className="py-3 px-4 text-sm text-muted-foreground">{employee.code}</td>
                <td className="py-3 px-4 text-sm font-medium text-foreground">{employee.name}</td>
                <td className="py-3 px-4 text-sm text-muted-foreground">{employee.department}</td>
                <td className="py-3 px-4 text-sm text-muted-foreground">{employee.collieryArea}</td>
                <td className="py-3 px-4 text-sm text-muted-foreground">{employee.month}</td>
                <td className="py-3 px-4 text-sm text-muted-foreground">{employee.gross}</td>
                <td className="py-3 px-4 text-sm font-medium text-ecl-green">{employee.net}</td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>

      {filteredData.length === 0 && (
        <div className="text-center py-8 text-muted-foreground">No records found</div>
      )}

      {/* Pagination */}
      <div className="flex items-center justify-between mt-4 pt-4 border-t border-border">
        <span className="text-sm text-muted-foreground">
          Showing {paginatedData.length} of {filteredData.length} records
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

export default PayrollTab;
