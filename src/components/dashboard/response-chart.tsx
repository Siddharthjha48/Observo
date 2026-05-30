'use client';

import React from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts';

interface ChartDataPoint {
  time: string;
  latency: number;
}

interface ResponseChartProps {
  data: ChartDataPoint[];
}

export const ResponseChart: React.FC<ResponseChartProps> = ({ data }) => {
  if (!data || data.length === 0) {
    return (
      <div className="h-64 border-2 border-black border-dashed flex items-center justify-center font-mono text-zinc-500 uppercase">
        No latency check logs recorded yet
      </div>
    );
  }

  // Custom high-contrast Neobrutalism Tooltip
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white border-2 border-black p-3 shadow-neo-sm font-mono text-xs uppercase">
          <p className="font-black text-black mb-1">{`Time: ${label}`}</p>
          <p className="font-bold text-neo-coral">{`Latency: ${payload[0].value}ms`}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="w-full h-64 font-mono text-xs">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={data}
          margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
          <XAxis
            dataKey="time"
            stroke="#000000"
            tickLine={{ stroke: '#000000', strokeWidth: 1 }}
            axisLine={{ stroke: '#000000', strokeWidth: 2 }}
            className="font-bold text-[10px]"
          />
          <YAxis
            stroke="#000000"
            tickLine={{ stroke: '#000000', strokeWidth: 1 }}
            axisLine={{ stroke: '#000000', strokeWidth: 2 }}
            className="font-bold text-[10px]"
            unit="ms"
          />
          <Tooltip content={<CustomTooltip />} />
          <Line
            type="monotone"
            dataKey="latency"
            stroke="#000000"
            strokeWidth={3}
            dot={{ r: 4, stroke: '#000000', strokeWidth: 2, fill: '#FFEE00' }}
            activeDot={{ r: 6, stroke: '#000000', strokeWidth: 2, fill: '#FF6B6B' }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};
export default ResponseChart;
