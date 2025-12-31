import { motion } from "framer-motion";
import { useMemo } from "react";

interface StatCardProps {
  type: "gross" | "net" | "deductions" | "headcount";
  rows: any[];
}

const StatCard = ({ type, rows }: StatCardProps) => {
  const value = useMemo(() => {
    if (!rows || rows.length === 0) return "—";

    switch (type) {
      case "gross":
        return `₹${(
          rows.reduce((s, r) => s + Number(r.gross_salary || 0), 0) / 1e7
        ).toFixed(2)} Cr`;

      case "net":
        return `₹${(
          rows.reduce((s, r) => s + Number(r.net_pay || 0), 0) / 1e7
        ).toFixed(2)} Cr`;

      case "deductions":
        return `₹${(
          rows.reduce((s, r) => s + Number(r.total_deduction || 0), 0) / 1e7
        ).toFixed(2)} Cr`;

      case "headcount":
        return new Set(rows.map((r) => r.person_no)).size.toString();

      default:
        return "—";
    }
  }, [rows, type]);

  return (
    <motion.div className="stat-card">
      <p className="text-sm uppercase">{type}</p>
      <p className="text-2xl font-bold">{value}</p>
    </motion.div>
  );
};

export default StatCard;
