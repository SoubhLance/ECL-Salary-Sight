import { useMemo } from "react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

const SalaryTrendChart = ({ rows }: { rows: any[] }) => {
  const data = useMemo(() => {
    const map = new Map<string, { sum: number; count: number }>();

    rows.forEach((r) => {
      if (!r.month_year) return;
      const month = r.month_year.slice(0, 7);
      if (!map.has(month)) map.set(month, { sum: 0, count: 0 });

      map.get(month)!.sum += Number(r.gross_salary || 0);
      map.get(month)!.count += 1;
    });

    return Array.from(map.entries()).map(([month, v]) => ({
      month,
      average: v.sum / v.count,
    }));
  }, [rows]);

  return (
    <div className="stat-card h-64">
      <h3 className="font-semibold mb-2">Employee Salary Trend</h3>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <XAxis dataKey="month" />
          <YAxis />
          <Tooltip />
          <Line dataKey="average" stroke="#16a34a" />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default SalaryTrendChart;
