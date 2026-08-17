import React, { useState } from 'react';
import type { Place } from '../types';
import { Search, ExternalLink, Phone, Globe, ShieldCheck, MapPin, Download, FileSpreadsheet } from 'lucide-react';

interface BusinessListProps {
  places: Place[];
  onSelectPlace: (p: Place) => void;
  selectedPlaceId?: string | null;
  onExportExcel: () => void;
  onExportCSV: () => void;
}

export const BusinessList: React.FC<BusinessListProps> = ({
  places,
  onSelectPlace,
  selectedPlaceId,
  onExportExcel,
  onExportCSV
}) => {
  const [filterQuery, setFilterQuery] = useState('');
  const [minConfFilter, setMinConfFilter] = useState<number>(0);

  const filteredPlaces = places.filter((p) => {
    const matchesName =
      p.name.toLowerCase().includes(filterQuery.toLowerCase()) ||
      p.category_primary.toLowerCase().includes(filterQuery.toLowerCase()) ||
      (p.address && p.address.toLowerCase().includes(filterQuery.toLowerCase())) ||
      (p.brand && p.brand.toLowerCase().includes(filterQuery.toLowerCase()));

    const matchesConf = p.confidence >= minConfFilter;
    return matchesName && matchesConf;
  });

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/95 p-4 sm:p-6 shadow-2xl">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h3 className="text-base font-extrabold text-white tracking-wide uppercase">
            Detected Establishments Directory ({filteredPlaces.length})
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Real location records retrieved from Overture Maps Places GeoParquet dataset.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="relative flex-1 sm:w-60">
            <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-500" />
            <input
              type="text"
              value={filterQuery}
              onChange={(e) => setFilterQuery(e.target.value)}
              placeholder="Search name, category, address..."
              className="w-full pl-9 pr-3 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-xs font-medium text-white placeholder-slate-500 focus:outline-none focus:border-brand-500"
            />
          </div>

          <select
            value={minConfFilter}
            onChange={(e) => setMinConfFilter(Number(e.target.value))}
            className="py-1.5 px-3 bg-slate-950 border border-slate-800 rounded-xl text-xs font-semibold text-slate-300 focus:outline-none focus:border-brand-500 cursor-pointer"
          >
            <option value={0}>All Confidence</option>
            <option value={0.5}>Conf &ge; 50%</option>
            <option value={0.75}>Conf &ge; 75%</option>
          </select>

          <button
            onClick={onExportExcel}
            className="flex items-center space-x-1.5 rounded-xl bg-emerald-600/20 border border-emerald-500/30 hover:bg-emerald-600 hover:text-white px-3 py-1.5 text-xs font-bold text-emerald-400 transition-all cursor-pointer"
            title="Download formatted Excel workbook (.xlsx)"
          >
            <FileSpreadsheet className="h-4 w-4" />
            <span>Export Excel (.xlsx)</span>
          </button>

          <button
            onClick={onExportCSV}
            className="flex items-center space-x-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 hover:text-white px-3 py-1.5 text-xs font-semibold transition-all cursor-pointer"
            title="Download CSV file"
          >
            <Download className="h-3.5 w-3.5 text-brand-400" />
            <span>CSV</span>
          </button>
        </div>
      </div>

      <div className="hidden sm:block overflow-x-auto max-h-[460px] rounded-xl border border-slate-800">
        <table className="w-full text-left text-xs text-slate-300">
          <thead className="bg-slate-950 text-[10px] font-bold text-slate-400 uppercase tracking-wider sticky top-0 border-b border-slate-800 z-10">
            <tr>
              <th className="py-3.5 px-4">Business Name & Brand</th>
              <th className="py-3.5 px-4">Category</th>
              <th className="py-3.5 px-4">Address / Locality</th>
              <th className="py-3.5 px-4">Confidence</th>
              <th className="py-3.5 px-4">Contact & Links</th>
              <th className="py-3.5 px-4 text-right">Map Focus</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 bg-slate-900/40">
            {filteredPlaces.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-12 text-center text-slate-500 font-medium">
                  No business records matched current filter criteria.
                </td>
              </tr>
            ) : (
              filteredPlaces.map((p) => {
                const isSelected = p.id === selectedPlaceId;
                return (
                  <tr
                    key={p.id}
                    className={`transition-colors hover:bg-slate-800/60 ${
                      isSelected ? 'bg-brand-500/15 border-l-4 border-brand-500 font-bold' : ''
                    }`}
                  >
                    <td className="py-3.5 px-4 font-bold text-white">
                      <div className="text-sm">{p.name}</div>
                      {p.brand && (
                        <span className="inline-block mt-1 rounded-md bg-emerald-500/10 px-2 py-0.5 text-[10px] font-semibold text-emerald-400 border border-emerald-500/20">
                          🏷️ {p.brand}
                        </span>
                      )}
                    </td>

                    <td className="py-3.5 px-4 text-slate-300 capitalize font-medium">
                      {p.taxonomy_primary !== 'unclassified'
                        ? p.taxonomy_primary.replace(/_/g, ' ')
                        : p.category_primary.replace(/_/g, ' ')}
                    </td>

                    <td className="py-3.5 px-4 text-slate-400">
                      {p.address || p.locality || 'Coordinates recorded'}
                    </td>

                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-flex items-center space-x-1 rounded-full px-2.5 py-0.5 text-[10px] font-bold border ${
                          p.confidence >= 0.75
                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                            : p.confidence >= 0.5
                            ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                            : 'bg-slate-800 text-slate-400 border-slate-700'
                        }`}
                      >
                        <ShieldCheck className="h-3 w-3" />
                        <span>{(p.confidence * 100).toFixed(0)}%</span>
                      </span>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="flex items-center space-x-2 text-slate-400">
                        {p.phone && (
                          <a
                            href={`tel:${p.phone}`}
                            className="p-1.5 rounded-lg bg-slate-800 hover:bg-brand-600 hover:text-white transition-colors"
                            title={`Call ${p.phone}`}
                          >
                            <Phone className="h-3.5 w-3.5" />
                          </a>
                        )}
                        {p.website && (
                          <a
                            href={p.website}
                            target="_blank"
                            rel="noreferrer"
                            className="p-1.5 rounded-lg bg-slate-800 hover:bg-brand-600 hover:text-white transition-colors"
                            title="Visit Website"
                          >
                            <Globe className="h-3.5 w-3.5" />
                          </a>
                        )}
                        <a
                          href={`https://www.google.com/maps/search/?api=1&query=${p.lat},${p.lon}`}
                          target="_blank"
                          rel="noreferrer"
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
                          title="Open Google Maps"
                        >
                          <ExternalLink className="h-3.5 w-3.5" />
                        </a>
                      </div>
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => onSelectPlace(p)}
                        className="inline-flex items-center space-x-1 rounded-xl bg-brand-600 hover:bg-brand-500 text-white px-3 py-1.5 text-xs font-semibold shadow-md shadow-brand-600/30 transition-all cursor-pointer"
                      >
                        <MapPin className="h-3.5 w-3.5" />
                        <span>Focus Pin</span>
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      <div className="sm:hidden space-y-3 max-h-[480px] overflow-y-auto pr-1">
        {filteredPlaces.length === 0 ? (
          <div className="p-8 text-center text-slate-500 text-xs font-medium">
            No business records matched current filter criteria.
          </div>
        ) : (
          filteredPlaces.map((p) => (
            <div
              key={p.id}
              className={`p-4 rounded-xl border bg-slate-950/80 transition-all ${
                p.id === selectedPlaceId ? 'border-brand-500 bg-brand-500/10' : 'border-slate-800'
              }`}
            >
              <div className="flex items-start justify-between gap-2 mb-2">
                <div>
                  <div className="font-extrabold text-white text-sm">{p.name}</div>
                  <div className="text-[11px] text-brand-300 font-semibold capitalize mt-0.5">
                    {(p.taxonomy_primary !== 'unclassified' ? p.taxonomy_primary : p.category_primary).replace(/_/g, ' ')}
                  </div>
                </div>
                <span className="shrink-0 rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-bold text-emerald-400 border border-emerald-500/20">
                  {(p.confidence * 100).toFixed(0)}% Conf
                </span>
              </div>

              {p.brand && (
                <div className="text-[10px] text-emerald-400 font-medium mb-1.5">
                  🏷️ Brand: {p.brand}
                </div>
              )}

              {p.address || p.locality ? (
                <div className="text-xs text-slate-300 mb-3">📍 {p.address || p.locality}</div>
              ) : null}

              <div className="flex items-center justify-between pt-2 border-t border-slate-800/80 text-xs">
                <div className="flex items-center space-x-2">
                  {p.phone && (
                    <a href={`tel:${p.phone}`} className="p-1.5 rounded-lg bg-slate-800 text-slate-300">
                      📞
                    </a>
                  )}
                  {p.website && (
                    <a href={p.website} target="_blank" rel="noreferrer" className="p-1.5 rounded-lg bg-slate-800 text-brand-400">
                      🌐
                    </a>
                  )}
                  <a
                    href={`https://www.google.com/maps/search/?api=1&query=${p.lat},${p.lon}`}
                    target="_blank"
                    rel="noreferrer"
                    className="p-1.5 rounded-lg bg-slate-800 text-slate-300"
                  >
                    📍
                  </a>
                </div>

                <button
                  onClick={() => onSelectPlace(p)}
                  className="rounded-lg bg-brand-600 text-white px-3 py-1.5 text-xs font-bold cursor-pointer"
                >
                  Focus Map
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
