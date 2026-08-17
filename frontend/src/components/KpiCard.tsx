import React from 'react';
import type { LucideIcon } from 'lucide-react';

interface KpiCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  badge?: string;
  badgeType?: 'success' | 'warning' | 'info' | 'danger';
  highlight?: boolean;
}

export const KpiCard: React.FC<KpiCardProps> = ({
  title,
  value,
  subtitle,
  icon: Icon,
  badge,
  badgeType = 'info',
  highlight = false
}) => {
  const badgeStyles = {
    success: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    warning: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    info: 'bg-brand-500/10 text-brand-400 border-brand-500/20',
    danger: 'bg-rose-500/10 text-rose-400 border-rose-500/20'
  };

  return (
    <div
      className={`relative overflow-hidden rounded-2xl p-4 sm:p-5 border transition-all ${
        highlight
          ? 'bg-gradient-to-br from-slate-900 via-brand-950/40 to-slate-900 border-brand-500/40 shadow-xl shadow-brand-500/10'
          : 'bg-slate-900/95 border-slate-800 hover:border-slate-700'
      }`}
    >
      <div className="flex items-center justify-between">
        <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-slate-400">
          {title}
        </span>
        <div className="flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-xl bg-slate-800/80 border border-slate-700 text-brand-400">
          <Icon className="h-4 w-4" />
        </div>
      </div>

      <div className="mt-2 sm:mt-3 flex items-baseline justify-between gap-1">
        <div className="text-xl sm:text-2xl md:text-3xl font-extrabold tracking-tight text-white">
          {value}
        </div>
        {badge && (
          <span className={`rounded-full px-2 py-0.5 text-[10px] sm:text-[11px] font-bold border ${badgeStyles[badgeType]}`}>
            {badge}
          </span>
        )}
      </div>

      {subtitle && (
        <p className="mt-1.5 text-[11px] sm:text-xs text-slate-400 font-medium leading-snug">
          {subtitle}
        </p>
      )}
    </div>
  );
};
