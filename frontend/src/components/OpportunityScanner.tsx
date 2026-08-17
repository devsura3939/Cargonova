import React, { useState } from 'react';
import type { OpportunityItem, CategoryFamily } from '../types';
import { Sparkles, Search, Filter, TrendingUp, ShieldCheck, ArrowRight } from 'lucide-react';

interface OpportunityScannerProps {
  city: string;
  country: string;
  population: number;
  populationYear: string;
  opportunities: OpportunityItem[];
  families: Record<string, CategoryFamily>;
  onSelectCategory: (catId: string) => void;
  loading: boolean;
}

export const OpportunityScanner: React.FC<OpportunityScannerProps> = ({
  city,
  country,
  population,
  populationYear,
  opportunities,
  families,
  onSelectCategory,
  loading
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFamily, setSelectedFamily] = useState<string>('all');
  const [minScoreFilter, setMinScoreFilter] = useState<number>(50);

  const filteredOpps = opportunities.filter((opp) => {
    const matchesSearch =
      opp.category_title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      opp.family_title.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesFamily = selectedFamily === 'all' || opp.family === selectedFamily;
    const matchesScore = opp.opportunity_score >= minScoreFilter;

    return matchesSearch && matchesFamily && matchesScore;
  });

  const getScoreBadge = (score: number) => {
    if (score >= 90) return 'bg-purple-500/10 text-purple-400 border-purple-500/30';
    if (score >= 80) return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';
    if (score >= 70) return 'bg-brand-500/10 text-brand-400 border-brand-500/30';
    if (score >= 60) return 'bg-amber-500/10 text-amber-400 border-amber-500/30';
    return 'bg-slate-800 text-slate-400 border-slate-700';
  };

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-slate-800 bg-gradient-to-r from-slate-900 via-brand-950/30 to-slate-900 p-6 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center space-x-2 rounded-full bg-brand-500/10 border border-brand-500/20 px-3 py-1 text-xs font-bold text-brand-400 mb-2">
              <Sparkles className="h-3.5 w-3.5" />
              <span>Blue Ocean Market Gap Scanner</span>
            </div>
            <h2 className="text-2xl font-extrabold text-white">
              Best Commercial Opportunities in {city}, {country}
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Population: <strong className="text-white">{(population / 1_000_000).toFixed(2)}M</strong> ({populationYear}) •
              Automated multi-category taxonomy benchmark analysis
            </p>
          </div>

          <div className="flex items-center space-x-3 bg-slate-950/80 border border-slate-800 rounded-xl p-3">
            <div className="text-right">
              <div className="text-xl font-extrabold text-brand-400">{opportunities.length}</div>
              <div className="text-[10px] uppercase text-slate-400 font-bold">Categories Scanned</div>
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-800 bg-slate-900/95 p-4 shadow-lg flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search category or family..."
              className="pl-9 pr-3 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-xs font-medium text-white placeholder-slate-500 focus:outline-none focus:border-brand-500 w-52 sm:w-64"
            />
          </div>

          <div className="flex items-center space-x-1.5">
            <Filter className="h-3.5 w-3.5 text-slate-400" />
            <select
              value={selectedFamily}
              onChange={(e) => setSelectedFamily(e.target.value)}
              className="py-1.5 px-3 bg-slate-950 border border-slate-800 rounded-xl text-xs font-semibold text-white focus:outline-none focus:border-brand-500 cursor-pointer"
            >
              <option value="all">All Category Families</option>
              {Object.entries(families).map(([famKey, fam]) => (
                <option key={famKey} value={famKey}>
                  {fam.title}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex items-center space-x-3 text-xs text-slate-300 font-semibold">
          <span>Min Score: <strong className="text-brand-400">{minScoreFilter}</strong></span>
          <input
            type="range"
            min={0}
            max={90}
            step={5}
            value={minScoreFilter}
            onChange={(e) => setMinScoreFilter(Number(e.target.value))}
            className="w-28 accent-brand-500 cursor-pointer"
          />
        </div>
      </div>

      <div className="rounded-2xl border border-slate-800 bg-slate-900/95 overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950 text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-800">
              <tr>
                <th className="py-3.5 px-5">Rank & Opportunity</th>
                <th className="py-3.5 px-4">Category Family</th>
                <th className="py-3.5 px-4 text-center">Existing Supply</th>
                <th className="py-3.5 px-4 text-center">Peer Expected</th>
                <th className="py-3.5 px-4 text-center">Estimated Gap</th>
                <th className="py-3.5 px-4 text-center">Opportunity Score</th>
                <th className="py-3.5 px-4 text-center">Data Confidence</th>
                <th className="py-3.5 px-5 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80 bg-slate-900/40">
              {loading ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400 font-medium">
                    <div className="inline-flex items-center space-x-2">
                      <div className="h-5 w-5 animate-spin rounded-full border-2 border-brand-500 border-t-transparent" />
                      <span>Scanning Overture GeoParquet business taxonomy for {city}...</span>
                    </div>
                  </td>
                </tr>
              ) : filteredOpps.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-500 font-medium">
                    No business categories matched the filter criteria.
                  </td>
                </tr>
              ) : (
                filteredOpps.map((opp, index) => (
                  <tr
                    key={opp.category_id}
                    onClick={() => onSelectCategory(opp.category_id)}
                    className="group cursor-pointer transition-colors hover:bg-slate-800/60"
                  >
                    <td className="py-4 px-5 font-bold text-white">
                      <div className="flex items-center space-x-3">
                        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-slate-800 text-[11px] font-extrabold text-brand-400">
                          #{index + 1}
                        </span>
                        <span className="group-hover:text-brand-300 transition-colors text-sm">
                          {opp.category_title}
                        </span>
                      </div>
                    </td>

                    <td className="py-4 px-4 text-slate-400 font-medium">
                      {opp.family_title}
                    </td>

                    <td className="py-4 px-4 text-center font-bold text-white">
                      {opp.existing_count} <span className="text-[10px] font-normal text-slate-500">({opp.per_10k.toFixed(2)}/10k)</span>
                    </td>

                    <td className="py-4 px-4 text-center font-semibold text-slate-300">
                      {opp.expected_count} <span className="text-[10px] font-normal text-slate-500">({opp.benchmark_per_10k.toFixed(2)}/10k)</span>
                    </td>

                    <td className="py-4 px-4 text-center font-extrabold">
                      {opp.estimated_gap > 0 ? (
                        <span className="text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                          +{opp.estimated_gap}
                        </span>
                      ) : (
                        <span className="text-rose-400">
                          {opp.estimated_gap}
                        </span>
                      )}
                    </td>

                    <td className="py-4 px-4 text-center">
                      <span className={`inline-flex items-center space-x-1 rounded-full px-2.5 py-1 text-xs font-bold border ${getScoreBadge(opp.opportunity_score)}`}>
                        <TrendingUp className="h-3 w-3" />
                        <span>{opp.opportunity_score}/100</span>
                      </span>
                    </td>

                    <td className="py-4 px-4 text-center">
                      <span className="inline-flex items-center space-x-1 text-xs font-semibold text-slate-300">
                        <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
                        <span>{opp.data_confidence_score}%</span>
                      </span>
                    </td>

                    <td className="py-4 px-5 text-right">
                      <button className="inline-flex items-center space-x-1 rounded-xl bg-brand-600 hover:bg-brand-500 text-white px-3 py-1.5 text-xs font-bold shadow-md shadow-brand-600/30 transition-all cursor-pointer">
                        <span>Inspect</span>
                        <ArrowRight className="h-3.5 w-3.5" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
