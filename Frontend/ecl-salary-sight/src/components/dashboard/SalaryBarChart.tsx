import { useMemo } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

const SalaryBarChart = ({ rows }: { rows: any[] }) => {
  const data = useMemo(() => {
    const map = new Map<string, number>();

    rows.forEach((r) => {
      if (!r.month_year) return;
      const month = r.month_year.slice(0, 7); // YYYY-MM
      map.set(month, (map.get(month) || 0) + Number(r.gross_salary || 0));
    });

    return Array.from(map.entries()).map(([month, gross]) => ({
      month,
      gross: gross / 1e7, // Cr
    }));
  }, [rows]);

  return (
    <div className="stat-card h-64">
      <h3 className="font-semibold mb-2">Total Gross by Month</h3>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data}>
          <XAxis dataKey="month" />
          <YAxis />
          <Tooltip />
          <Bar dataKey="gross" fill="#2563eb" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default SalaryBarChart;
