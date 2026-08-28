import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';

const RealTimeChart = ({ data, dataKey, color, name, unit }) => {
  return (
    <div className="bg-slate-800 p-4 rounded-xl border border-slate-700 h-[300px] w-full">
      <h3 className="text-slate-400 font-medium text-sm mb-4 tracking-wider uppercase">{name} ({unit})</h3>
      <div className="h-[230px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
            <XAxis 
              dataKey="time" 
              stroke="#94a3b8" 
              fontSize={12} 
              tickMargin={10} 
              minTickGap={30}
            />
            <YAxis 
              stroke="#94a3b8" 
              fontSize={12} 
              tickMargin={10}
              domain={['auto', 'auto']}
            />
            <Tooltip 
              contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', color: '#f8fafc' }}
              itemStyle={{ color: '#f8fafc' }}
              labelStyle={{ color: '#94a3b8' }}
            />
            <Line 
              type="monotone" 
              dataKey={dataKey} 
              stroke={color} 
              strokeWidth={2} 
              dot={false} 
              activeDot={{ r: 6, fill: color, stroke: '#0f172a', strokeWidth: 2 }}
              isAnimationActive={false} // Disable animation for better performance on high tick rate
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default RealTimeChart;
