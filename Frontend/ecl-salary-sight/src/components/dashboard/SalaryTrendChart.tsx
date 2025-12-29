import { motion } from 'framer-motion';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts';

const data = [
  { month: 'Jan', average: 85000, projected: 85000 },
  { month: 'Feb', average: 92000, projected: 92000 },
  { month: 'Mar', average: 98000, projected: 98000 },
  { month: 'Apr', average: 105000, projected: 105000 },
  { month: 'May', average: 115000, projected: 115000 },
  { month: 'Jun', average: 125000, projected: 125000 },
  { month: 'Jul', average: null, projected: 132000 },
  { month: 'Aug', average: null, projected: 138000 },
];

const formatValue = (value: number) => {
  if (value >= 100000) return `₹${(value / 1000).toFixed(0)}K`;
  return `₹${value.toLocaleString()}`;
};

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-ecl-navy text-primary-foreground px-4 py-2 rounded-lg shadow-lg">
        <p className="font-semibold mb-1">{label}</p>
        {payload.map((item: any, index: number) => (
          <p key={index} className="text-sm">
            {item.name}: {formatValue(item.value)}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

const SalaryTrendChart = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5, duration: 0.5 }}
      className="stat-card"
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-foreground">Employee Salary Trend</h3>
        <div className="flex items-center gap-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-primary" />
            <span className="text-muted-foreground">Average Salary</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-ecl-green" />
            <span className="text-muted-foreground">Projected</span>
          </div>
        </div>
      </div>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="colorAverage" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.2} />
                <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
            <XAxis
              dataKey="month"
              axisLine={false}
              tickLine={false}
              tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
              tickFormatter={(value) => `₹${(value / 1000).toFixed(0)}K`}
            />
            <Tooltip content={<CustomTooltip />} />
            <Area
              type="monotone"
              dataKey="average"
              stroke="hsl(var(--primary))"
              strokeWidth={3}
              fill="url(#colorAverage)"
              dot={{ fill: 'hsl(var(--primary))', strokeWidth: 2, r: 4 }}
              connectNulls={false}
              name="Average Salary"
            />
            <Line
              type="monotone"
              dataKey="projected"
              stroke="hsl(var(--accent))"
              strokeWidth={2}
              strokeDasharray="5 5"
              dot={false}
              name="Projected"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
};

export default SalaryTrendChart;
