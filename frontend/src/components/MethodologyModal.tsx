import React from 'react';
import { X, Database, ShieldCheck, Scale, Info } from 'lucide-react';

interface MethodologyModalProps {
  isOpen: boolean;
  onClose: () => void;
  overtureRelease?: string;
}

export const MethodologyModal: React.FC<MethodologyModalProps> = ({
  isOpen,
  onClose,
  overtureRelease = '2026-07-22.0'
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
      <div className="relative w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-3xl border border-slate-800 bg-slate-900 p-6 sm:p-8 shadow-2xl text-slate-200">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="flex items-center space-x-3 mb-6 border-b border-slate-800 pb-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-500/10 border border-brand-500/20 text-brand-400">
            <Info className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">Methodology & Data Transparency</h2>
            <p className="text-xs text-slate-400">
              Deterministic statistics, peer-city normalization, and open geospatial data pipelines.
            </p>
          </div>
        </div>

        <div className="space-y-6 text-xs text-slate-300 leading-relaxed font-medium">
          <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-4">
            <div className="flex items-center space-x-2 font-bold text-sm text-white mb-2">
              <Database className="h-4 w-4 text-brand-400" />
              <span>1. Data Pipeline & Sources</span>
            </div>
            <p className="mb-2">
              All commercial business locations (POIs) are retrieved from <strong>Overture Maps Places</strong> public GeoParquet release (<code className="text-brand-300">{overtureRelease}</code>) hosted on AWS S3, queried dynamically via <strong>DuckDB Spatial & httpfs</strong>.
            </p>
            <ul className="list-disc pl-5 space-y-1 text-slate-400">
              <li><strong>Administrative Containment:</strong> Cities are resolved via Nominatim to extract official administrative boundary GeoJSON polygons. Points are verified using spatial containment (<code className="text-slate-300">ST_Within</code>).</li>
              <li><strong>Population & Recency:</strong> Population metrics are queried dynamically from official census data via Wikidata SPARQL.</li>
              <li><strong>Operating Status:</strong> Permanently closed establishments are automatically excluded.</li>
            </ul>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-4">
            <div className="flex items-center space-x-2 font-bold text-sm text-white mb-2">
              <Scale className="h-4 w-4 text-brand-400" />
              <span>2. Deterministic Opportunity Score (0–100)</span>
            </div>
            <p className="mb-3">
              The Opportunity Score is calculated strictly through deterministic statistical formulas:
            </p>
            <div className="bg-slate-900 border border-slate-800 p-3 rounded-xl font-mono text-[11px] text-brand-300 mb-3">
              OpportunityScore = 0.60 &times; GapScore + 0.25 &times; UndersupplyPercentile + 0.15 &times; MarketSizeScore
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-[11px]">
              <div className="bg-slate-900/80 p-2.5 rounded-lg border border-slate-800">
                <span className="font-bold text-white block mb-1">Supply Gap Score (60%)</span>
                Measures how far current POI supply lies below the peer-adjusted median baseline.
              </div>
              <div className="bg-slate-900/80 p-2.5 rounded-lg border border-slate-800">
                <span className="font-bold text-white block mb-1">Undersupply Percentile (25%)</span>
                Percentile rank of the target city's per-10,000 residents rate compared to peer cities.
              </div>
              <div className="bg-slate-900/80 p-2.5 rounded-lg border border-slate-800">
                <span className="font-bold text-white block mb-1">Market Size Score (15%)</span>
                Logarithmic population modifier ensuring large market gaps carry appropriate commercial weight.
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-4">
            <div className="flex items-center space-x-2 font-bold text-sm text-white mb-2">
              <ShieldCheck className="h-4 w-4 text-emerald-400" />
              <span>3. Independent Data Confidence Score (0–100)</span>
            </div>
            <p className="mb-2">
              Data Confidence is calculated separately from commercial opportunity:
            </p>
            <ul className="list-disc pl-5 space-y-1 text-slate-400">
              <li><strong>Source Confidence:</strong> Average Overture POI confidence score in the city.</li>
              <li><strong>Peer Consistency:</strong> Variance among peer city supply rates.</li>
              <li><strong>Coverage Anomaly Safeguard:</strong> Automatically reduces confidence and flags warnings if city POI coverage is suspiciously sparse.</li>
            </ul>
          </div>
        </div>

        <div className="mt-6 border-t border-slate-800 pt-4 flex justify-end">
          <button
            onClick={onClose}
            className="rounded-xl bg-brand-600 hover:bg-brand-500 text-white px-5 py-2 text-xs font-semibold shadow-lg shadow-brand-600/30 transition-all cursor-pointer"
          >
            Got It
          </button>
        </div>
      </div>
    </div>
  );
};
