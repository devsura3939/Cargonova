import React from 'react';
import { TrendingUp, AlertTriangle } from 'lucide-react';

interface SupplyGaugeProps {
  existingCount: number;
  expectedCount: number;
  estimatedGap: number;
  gapPercent: number;
  opportunityScore: number;
  opportunityLabel: string;
}

export const SupplyGauge: React.FC<SupplyGaugeProps> = ({
  existingCount,
  expectedCount,
  estimatedGap,
  gapPercent,
  opportunityScore,
  opportunityLabel
}) => {
  const isDeficit = estimatedGap > 0;
  const ratio = Math.min(Math.max((existingCount / Math.max(expectedCount, 1)) * 100, 0), 100);

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/95 p-5 shadow-2xl flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-xs sm:text-sm font-extrabold text-white uppercase tracking-wider">
            Supply Position & Market Deficit
          </h3>
          <span className="rounded-full bg-slate-800 px-2.5 py-0.5 text-[11px] font-bold text-brand-400 border border-slate-700">
            {opportunityLabel} ({opportunityScore}/100)
          </span>
        </div>
        <p className="text-xs text-slate-400">
          Comparing detected POI supply against the peer-adjusted baseline requirement.
        </p>
      </div>

      <div className="my-6">
        <div className="flex justify-between text-xs font-bold text-slate-300 mb-2">
          <span>Existing Supply: <strong className="text-white">{existingCount}</strong></span>
          <span>Peer Benchmark: <strong className="text-brand-400">{expectedCount}</strong></span>
        </div>

        <div className="relative h-4 w-full rounded-full bg-slate-800 overflow-hidden border border-slate-700">
          <div
            className={`h-full transition-all duration-1000 ${
              isDeficit ? 'bg-gradient-to-r from-brand-500 to-blue-400' : 'bg-rose-500'
            }`}
            style={{ width: `${ratio}%` }}
          />
        </div>

        <div className="mt-3 flex items-center justify-between text-xs text-slate-400 font-medium">
          <span>0%</span>
          <span className="text-amber-400 font-bold">
            {isDeficit ? `Deficit: ${gapPercent}%` : `Surplus: ${Math.abs(gapPercent)}%`}
          </span>
          <span>100% Benchmark</span>
        </div>
      </div>

      <div className={`rounded-xl p-3.5 border flex items-start space-x-3 ${
        isDeficit
          ? 'bg-brand-500/10 border-brand-500/20 text-brand-300'
          : 'bg-rose-500/10 border-rose-500/20 text-rose-300'
      }`}>
        {isDeficit ? (
          <TrendingUp className="h-5 w-5 text-brand-400 shrink-0 mt-0.5" />
        ) : (
          <AlertTriangle className="h-5 w-5 text-rose-400 shrink-0 mt-0.5" />
        )}
        <div className="text-xs">
          <div className="font-extrabold mb-0.5">
            {isDeficit ? `Estimated Supply Gap: +${estimatedGap} Businesses` : `Saturated Supply (-${Math.abs(estimatedGap)})`}
          </div>
          <p className="text-slate-300 leading-relaxed font-medium">
            {isDeficit
              ? `Market demonstrates room for ~${estimatedGap} additional establishments to reach peer-city median density.`
              : `Current POI density exceeds peer-city baseline. New market entrants face heavy competition.`}
          </p>
        </div>
      </div>
    </div>
  );
};
