import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  ReferenceLine
} from 'recharts';
import type { PeerCityResult } from '../types';

interface PeerChartProps {
  targetCity: string;
  targetPer10k: number;
  benchmarkPer10k: number;
  peerCities: PeerCityResult[];
}

export const PeerChart: React.FC<PeerChartProps> = ({
  targetCity,
  targetPer10k,
  benchmarkPer10k,
  peerCities
}) => {
  const chartData = [
    {
      city: `${targetCity} (Target)`,
      per_10k: targetPer10k,
      isTarget: true
    },
    ...peerCities.map((p) => ({
      city: p.city,
      per_10k: p.per_10k,
      isTarget: false
    }))
  ];

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/95 p-4 sm:p-6 shadow-2xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
        <div>
          <h3 className="text-xs sm:text-sm font-extrabold text-white uppercase tracking-wider">
            Businesses per 10,000 Residents Comparison
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Target city supply rate normalized against comparable peer cities.
          </p>
        </div>
        <div className="flex items-center space-x-3 text-xs font-semibold">
          <span className="flex items-center space-x-1.5">
            <span className="h-3 w-3 rounded bg-brand-500" />
            <span className="text-slate-200">Target City</span>
          </span>
          <span className="flex items-center space-x-1.5">
            <span className="h-3 w-3 rounded bg-slate-700" />
            <span className="text-slate-400">Peer Cities</span>
          </span>
        </div>
      </div>

      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 20, right: 20, left: -10, bottom: 20 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
            <XAxis
              dataKey="city"
              stroke="#64748b"
              fontSize={11}
              tickLine={false}
            />
            <YAxis stroke="#64748b" fontSize={11} tickLine={false} />
            <Tooltip
              contentStyle={{
                backgroundColor: '#0f172a',
                borderColor: '#334155',
                borderRadius: '0.75rem',
                fontSize: '12px',
                color: '#f8fafc'
              }}
              formatter={(value: any) => [`${value} per 10k`, 'Supply Rate']}
            />
            <ReferenceLine
              y={benchmarkPer10k}
              stroke="#eab308"
              strokeDasharray="4 4"
              label={{
                value: `Median: ${benchmarkPer10k}`,
                fill: '#eab308',
                fontSize: 11,
                position: 'top'
              }}
            />
            <Bar dataKey="per_10k" radius={[6, 6, 0, 0]}>
              {chartData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={entry.isTarget ? '#0284c7' : '#334155'}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
