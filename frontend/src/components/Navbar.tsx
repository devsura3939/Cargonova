import React from 'react';
import { Compass, Database, Layers, Info } from 'lucide-react';

interface NavbarProps {
  mode: 'analyze' | 'discover';
  setMode: (m: 'analyze' | 'discover') => void;
  onOpenMethodology: () => void;
  overtureRelease?: string;
}

export const Navbar: React.FC<NavbarProps> = ({
  mode,
  setMode,
  onOpenMethodology,
  overtureRelease = '2026-07-22.0'
}) => {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-800 bg-slate-950/90 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
        <div className="flex items-center space-x-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-brand-600 to-blue-400 shadow-lg shadow-brand-500/20">
            <Compass className="h-6 w-6 text-white animate-pulse" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xl font-bold tracking-tight text-white">
                GapFinder<span className="text-brand-400">.ai</span>
              </span>
              <span className="rounded-full bg-brand-500/10 px-2 py-0.5 text-[10px] font-bold text-brand-400 border border-brand-500/20">
                PRO
              </span>
            </div>
            <p className="text-[11px] text-slate-400 hidden sm:block">
              Global Business Gap & Blue Ocean Market Intelligence
            </p>
          </div>
        </div>

        <div className="flex items-center rounded-xl bg-slate-900 p-1 border border-slate-800">
          <button
            onClick={() => setMode('analyze')}
            className={`flex items-center space-x-2 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all cursor-pointer ${
              mode === 'analyze'
                ? 'bg-brand-600 text-white shadow-md shadow-brand-600/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <Layers className="h-3.5 w-3.5" />
            <span>Analyze Industry</span>
          </button>
          <button
            onClick={() => setMode('discover')}
            className={`flex items-center space-x-2 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all cursor-pointer ${
              mode === 'discover'
                ? 'bg-brand-600 text-white shadow-md shadow-brand-600/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <Compass className="h-3.5 w-3.5" />
            <span>Discover Opportunities</span>
          </button>
        </div>

        <div className="flex items-center space-x-3">
          <div className="hidden lg:flex items-center space-x-2 rounded-xl bg-slate-900 border border-slate-800 px-3 py-1.5 text-xs text-slate-300">
            <Database className="h-3.5 w-3.5 text-emerald-400" />
            <span>Overture GeoParquet: <strong className="text-white">{overtureRelease}</strong></span>
          </div>

          <button
            onClick={onOpenMethodology}
            className="flex items-center space-x-1.5 rounded-xl border border-slate-800 bg-slate-900 px-3 py-1.5 text-xs font-semibold text-slate-300 transition-colors hover:bg-slate-800 hover:text-white cursor-pointer"
            title="Methodology & Data Transparency"
          >
            <Info className="h-3.5 w-3.5 text-brand-400" />
            <span className="hidden sm:inline">Methodology</span>
          </button>
        </div>
      </div>
    </header>
  );
};
