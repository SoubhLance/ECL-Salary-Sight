import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  ChevronLeft,
  ChevronRight,
  CalendarDays,
  MapPin,
  Search,
  FileSpreadsheet,
} from "lucide-react";

import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";

import { fetchAllSalary } from "@/lib/salaryApi";

const ITEMS_PER_PAGE = 10;
const currentYear = new Date().getFullYear();
const years = Array.from({ length: 5 }, (_, i) =>
  String(currentYear - i)
);

const months = [
  { label: "All Months", value: "All" },
  { label: "January", value: "01" },
  { label: "February", value: "02" },
  { label: "March", value: "03" },
  { label: "April", value: "04" },
  { label: "May", value: "05" },
  { label: "June", value: "06" },
  { label: "July", value: "07" },
  { label: "August", value: "08" },
  { label: "September", value: "09" },
  { label: "October", value: "10" },
  { label: "November", value: "11" },
  { label: "December", value: "12" },
];

const PayrollTab = () => {
  const [rows, setRows] = useState<any[]>([]);
  const [columns, setColumns] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedYear, setSelectedYear] = useState(String(currentYear));
  const [selectedArea, setSelectedArea] = useState("All");
  const [selectedMonth, setSelectedMonth] = useState("All");

  const [currentPage, setCurrentPage] = useState(1);

  /* ================= FETCH DATA ================= */
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const res = await fetchAllSalary(Number(selectedYear));
        const data = res.data || [];

        setRows(data);

        if (data.length > 0) {
          setColumns(Object.keys(data[0]));
        } else {
          setColumns([]);
        }
      } catch (err) {
        console.error("Payroll fetch failed:", err);
        setRows([]);
        setColumns([]);
      } finally {
        setLoading(false);
        setCurrentPage(1);
      }
    };

    loadData();
  }, [selectedYear]);

  /* ================= FILTERS ================= */
  const filteredData = useMemo(() => {
    return rows.filter((r) => {
      const searchMatch =
        r.person_no?.toString().includes(searchQuery) ||
        r.name_of_employee
          ?.toLowerCase()
          .includes(searchQuery.toLowerCase());

      const areaMatch =
        selectedArea === "All" || r.personnel_area === selectedArea;

      const monthMatch =
        selectedMonth === "All" ||
        (r.month_year &&
          String(r.month_year).substring(5, 7) === selectedMonth);

      return searchMatch && areaMatch && monthMatch;
    });
  }, [rows, searchQuery, selectedArea, selectedMonth]);

  /* ================= PAGINATION ================= */
  const totalPages = Math.ceil(filteredData.length / ITEMS_PER_PAGE);
  const paginatedRows = filteredData.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  /* ================= FORMAT CELL VALUE ================= */
  const formatCellValue = (value: any, columnName: string) => {
    if (value === null || value === undefined) return "-";
    
    // Columns that are IDs/codes/numbers (bigint in DB) - should NOT have decimal formatting
    const noDecimalColumns = [
      'person_no',
      'bank_account_number',
      'pf_number',
      'aadhar_no',
      'for_period',
      'non_practicing_allowance',
      'npa_arrears',
      'gardener_allowance',
      'washing_allow_arr',
      'medical_reim_nex_arr',
      'attendance_bon_qtrly_adj',
      'exgratia_adj',
      'night_duty_allowat35',
      'night_duty_allow_arr',
      'rescue_allowance',
      'rescue_allow_adj',
      'rescue_allowance_arr',
      'misc_adv_adjustnottouse',
      'travel_assist_bharatbhram',
      'travel_assist_bhrtbh_arr',
      'home_ltc_nex',
      'cmpf_refund',
      'spec_reim_non_taxable',
      'employee_pf',
      'employee_vpf',
      'professional_tax',
      'income_tax',
      'monthly_tax_paid_by_er',
      'professional_tax_arr',
      'mgmt_trainee_bond_dedn',
      'ta_advance_recovery',
      'company_bus',
      'benevolent_fund_recovery',
      'canteen_recovery',
      'car_usage_recovery',
      'natural_calamity_fund',
      'ee_pf_contribution',
      'cmps_ee_dedn',
      'cmps_ee_dedn_arr',
      'farewell_fund',
      'school_bus',
      'festival_ded',
      'cil_relief_fund_dedn',
      'mcl_relief_fund_dedn',
      'rent_deduction_cla_coa',
      'income_tax_adjhperks',
      'court_deduction',
      'ee_pf_cont_arr',
      'ee_vpf_cont_arr',
      'leave_without_pay',
      'cprmsne_lo',
      'club_deduction',
      'cmoai_contribution',
      'co_op_dednfixamt',
      'co_op_soc_dedn',
      'union_deduction',
      'mandir_deduction',
      'cmpf_arr',
      'absences_days',
      'ug_days',
      'weekly_off',
      'physical_attendance',
      'rest_day',
      'holiday',
      'others',
      'half_pay_leave',
      'sick_leave',
      'earned_leave',
      'commuted_leave',
      'special_leave_non_ex',
      'study_leave',
      'restricted_holiday',
      'other_leaves',
      'iod',
      'maternity_leave',
      'child_care_leave',
      'cf_billable_arr',
      'cf_absence_arr',
      'cf_ug_days_arr',
      'cf_weekly_off_arr',
      'cf_phisical_att_arr',
      'cf_rest_day_arr',
      'cf_holiday_arr',
      'cf_others_arr',
      'cf_hpl_arr',
      'cf_sl_arr',
      'cf_el_arr',
      'cf_cml_arr',
      'cf_spl_nex_arr',
      'night_shift_days',
      'year'
    ];
    
    // Special handling for person_no - pad to 8 digits
    if (columnName === 'person_no') {
      const numStr = String(value).trim();
      if (!isNaN(Number(numStr)) && numStr !== '') {
        return numStr.padStart(8, '0');
      }
      return value;
    }
    
    // If column is in noDecimalColumns list, return as-is (no decimal formatting)
    if (noDecimalColumns.includes(columnName)) {
      return String(value);
    }
    
    // Check if value is a number (including 0) - format with 2 decimals (for salary amounts)
    if (typeof value === 'number') {
      return value.toFixed(2);
    }
    
    // Check if string is a valid number - format with 2 decimals (for salary amounts)
    if (typeof value === 'string' && !isNaN(Number(value)) && value.trim() !== '') {
      return Number(value).toFixed(2);
    }
    
    return value;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      className="stat-card"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-lg font-semibold">Payroll Data</h2>
        <div className="text-sm text-muted-foreground">
          {filteredData.length.toLocaleString()} records
        </div>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
          <Input
            placeholder="Search by name or code"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            className="pl-9"
          />
        </div>

        <Select value={selectedYear} onValueChange={setSelectedYear}>
          <SelectTrigger>
            <CalendarDays className="w-4 h-4 mr-2" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {years.map((y) => (
              <SelectItem key={y} value={y}>
                {y}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={selectedMonth} onValueChange={setSelectedMonth}>
          <SelectTrigger>
            <CalendarDays className="w-4 h-4 mr-2" />
            <SelectValue placeholder="Month" />
          </SelectTrigger>
          <SelectContent>
            {months.map((m) => (
              <SelectItem key={m.value} value={m.value}>
                {m.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={selectedArea} onValueChange={setSelectedArea}>
          <SelectTrigger>
            <MapPin className="w-4 h-4 mr-2" />
            <SelectValue placeholder="Area" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="All">All Areas</SelectItem>
            {[...new Set(rows.map((r) => r.personnel_area).filter(Boolean))].map(
              (area) => (
                <SelectItem key={area} value={area}>
                  {area}
                </SelectItem>
              )
            )}
          </SelectContent>
        </Select>
      </div>

      {/* TABLE - Supabase Style */}
      <div className="border rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-border">
            <thead>
              <tr className="bg-muted/50">
                {columns.map((col) => (
                  <th
                    key={col}
                    className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider whitespace-nowrap"
                  >
                    {col.replace(/_/g, " ")}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody className="bg-background divide-y divide-border">
              {loading ? (
                <tr>
                  <td colSpan={columns.length} className="px-4 py-12 text-center">
                    <div className="flex flex-col items-center gap-2">
                      <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                      <p className="text-sm text-muted-foreground">Loading...</p>
                    </div>
                  </td>
                </tr>
              ) : paginatedRows.length === 0 ? (
                <tr>
                  <td colSpan={columns.length} className="px-4 py-12 text-center">
                    <div className="flex flex-col items-center gap-2">
                      <FileSpreadsheet className="w-8 h-8 text-muted-foreground" />
                      <p className="text-sm font-medium">No records found</p>
                      <p className="text-xs text-muted-foreground">Try adjusting your filters</p>
                    </div>
                  </td>
                </tr>
              ) : (
                paginatedRows.map((row, i) => (
                  <tr 
                    key={i} 
                    className="hover:bg-muted/30 transition-colors"
                  >
                    {columns.map((col) => (
                      <td 
                        key={col} 
                        className="px-4 py-3 text-sm whitespace-nowrap text-foreground"
                      >
                        {formatCellValue(row[col], col)}
                      </td>
                    ))}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* PAGINATION */}
      <div className="flex items-center justify-between mt-4">
        <div className="text-sm text-muted-foreground">
          Showing {paginatedRows.length} of {filteredData.length} results
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={currentPage === 1}
            onClick={() => setCurrentPage((p) => p - 1)}
          >
            <ChevronLeft className="w-4 h-4" />
            Previous
          </Button>

          <div className="text-sm text-muted-foreground px-3">
            Page {currentPage} of {totalPages || 1}
          </div>

          <Button
            variant="outline"
            size="sm"
            disabled={currentPage === totalPages || totalPages === 0}
            onClick={() => setCurrentPage((p) => p + 1)}
          >
            Next
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </motion.div>
  );
};

export default PayrollTab;