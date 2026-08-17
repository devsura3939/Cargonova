import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { HeroSearch } from './components/HeroSearch';
import { MapView } from './components/MapView';
import { KpiCard } from './components/KpiCard';
import { PeerChart } from './components/PeerChart';
import { SupplyGauge } from './components/SupplyGauge';
import { BusinessList } from './components/BusinessList';
import { OpportunityScanner } from './components/OpportunityScanner';
import { MethodologyModal } from './components/MethodologyModal';
import { runClientSideAnalysis } from './clientEngine';
import { MASTER_CATEGORIES_DATA, CATEGORY_FAMILIES_DATA } from './categoriesData';

import type {
  CategoryInfo,
  CategoryFamily,
  MarketAnalysisResponse,
  OpportunitiesScanResponse,
  Place
} from './types';

import {
  Building2,
  Target,
  TrendingUp,
  ShieldCheck,
  Download,
  FileSpreadsheet,
  Sparkles,
  AlertTriangle
} from 'lucide-react';

export function App() {
  const [mode, setMode] = useState<'analyze' | 'discover'>('analyze');
  const [country, setCountry] = useState<string>('Spain');
  const [city, setCity] = useState<string>('Valencia');
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('bar_pub');

  // Pre-initialize with master static data so dropdowns are NEVER blank
  const [categories, setCategories] = useState<CategoryInfo[]>(MASTER_CATEGORIES_DATA);
  const [families, setFamilies] = useState<Record<string, CategoryFamily>>(CATEGORY_FAMILIES_DATA);
  const [analysis, setAnalysis] = useState<MarketAnalysisResponse | null>(null);
  const [opportunities, setOpportunities] = useState<OpportunitiesScanResponse | null>(null);

  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const [selectedPlace, setSelectedPlace] = useState<Place | null>(null);
  const [isMethodologyOpen, setIsMethodologyOpen] = useState<boolean>(false);

  // Helper to resolve API endpoint
  const getApiUrl = (endpoint: string) => {
    const host = window.location.hostname;
    if (
      host === 'localhost' ||
      host === '127.0.0.1' ||
      host.includes('serveousercontent.com') ||
      host.includes('trycloudflare.com') ||
      host.includes('e2b.app')
    ) {
      return endpoint;
    }
    return `https://018c11c708034d39-136-67-93-101.serveousercontent.com${endpoint}`;
  };

  // Fetch Categories taxonomy on mount
  useEffect(() => {
    fetch(getApiUrl('/api/categories'))
      .then((res) => res.json())
      .then((data) => {
        if (data.categories && data.categories.length > 0) setCategories(data.categories);
        if (data.families) setFamilies(data.families);
      })
      .catch((err) => console.warn('Categories API fallback active:', err));
  }, []);

  // Run analysis with automatic client-side Overpass/Nominatim spatial fallback
  const handleRunAnalysis = async (
    targetCountry?: string,
    targetCity?: string,
    targetCategory?: string
  ) => {
    const runCountry = targetCountry || country;
    const runCity = targetCity || city;
    const runCategory = targetCategory || selectedCategoryId;

    setLoading(true);
    setError(null);
    setSelectedPlace(null);

    const catInfo = categories.find((c) => c.id === runCategory) || MASTER_CATEGORIES_DATA.find((c) => c.id === runCategory) || {
      id: runCategory,
      title: runCategory.replace(/_/g, ' ').toUpperCase(),
      family: 'services',
      keywords: [runCategory],
      overture_keys: [runCategory],
      hierarchy_matchers: [runCategory]
    };

    try {
      if (mode === 'analyze') {
        let data: MarketAnalysisResponse | null = null;

        // Try backend API first with short timeout
        try {
          const controller = new AbortController();
          const timer = setTimeout(() => controller.abort(), 6000);

          const resp = await fetch(getApiUrl('/api/analyze'), {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              country: runCountry,
              city: runCity,
              category_id: runCategory
            }),
            signal: controller.signal
          });

          clearTimeout(timer);
          if (resp.ok) {
            data = await resp.json();
          }
        } catch (apiErr) {
          console.warn('Backend API timeout/unavailable, triggering client-side spatial engine fallback...');
        }

        // Fallback to standalone client-side spatial engine if backend was unreachable
        if (!data) {
          data = await runClientSideAnalysis(runCountry, runCity, catInfo);
        }

        setAnalysis(data);
      } else {
        const resp = await fetch(getApiUrl('/api/opportunities'), {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            country: runCountry,
            city: runCity
          })
        });

        if (resp.ok) {
          const data: OpportunitiesScanResponse = await resp.json();
          setOpportunities(data);
        }
      }
    } catch (err: any) {
      console.error('Analysis error:', err);
      setError(err.message || `An error occurred while analyzing ${runCity}, ${runCountry}.`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    handleRunAnalysis();
  }, [mode]);

  // Export Excel (.xlsx)
  const handleExportExcel = async () => {
    if (!analysis) return;
    try {
      const resp = await fetch(getApiUrl('/api/export/excel'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          country: analysis.city_metadata.country,
          city: analysis.city_metadata.city,
          category_id: analysis.category_info.id
        })
      });

      if (!resp.ok) throw new Error('Failed to generate Excel download');

      const blob = await resp.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${analysis.target_city}_${analysis.category_info.id}_analysis.xlsx`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err: any) {
      alert('Generating CSV export fallback...');
      handleExportCSV();
    }
  };

  // Export CSV
  const handleExportCSV = () => {
    if (!analysis) return;
    const headers = ['Business Name', 'Category', 'Address', 'Brand', 'Confidence', 'Website', 'Phone', 'Lon', 'Lat'];
    const rows = analysis.matched_places.map((p) => [
      `"${p.name.replace(/"/g, '""')}"`,
      `"${p.category_primary}"`,
      `"${(p.address || '').replace(/"/g, '""')}"`,
      `"${p.brand || ''}"`,
      p.confidence,
      `"${p.website || ''}"`,
      `"${p.phone || ''}"`,
      p.lon,
      p.lat
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `${analysis.target_city}_${analysis.category_info.id}_analysis.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Export JSON
  const handleExportJSON = () => {
    if (!analysis) return;
    const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(JSON.stringify(analysis, null, 2))}`;
    const link = document.createElement('a');
    link.setAttribute('href', jsonString);
    link.setAttribute('download', `${analysis.target_city}_${analysis.category_info.id}_analysis.json`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-brand-500 selection:text-white pb-16">
      {/* Top Navbar */}
      <Navbar
        mode={mode}
        setMode={setMode}
        onOpenMethodology={() => setIsMethodologyOpen(true)}
        overtureRelease={analysis?.city_metadata?.release || '2026-08 Live Engine'}
      />

      {/* Hero & Search Header */}
      <HeroSearch
        country={country}
        setCountry={setCountry}
        city={city}
        setCity={setCity}
        selectedCategoryId={selectedCategoryId}
        setSelectedCategoryId={setSelectedCategoryId}
        categories={categories}
        mode={mode}
        onSearch={handleRunAnalysis}
        loading={loading}
      />

      {/* Main Content Area */}
      <main className="mx-auto max-w-7xl px-4 sm:px-6 pt-6 sm:pt-8">
        {error && (
          <div className="mb-6 rounded-2xl border border-rose-500/30 bg-rose-500/10 p-4 text-xs text-rose-300 flex items-center space-x-3 shadow-lg">
            <AlertTriangle className="h-5 w-5 text-rose-400 shrink-0" />
            <div>
              <div className="font-bold mb-0.5 font-sans">Analysis Request Notice</div>
              <div>{error}</div>
            </div>
          </div>
        )}

        {/* MODE A — ANALYZE INDUSTRY DASHBOARD */}
        {mode === 'analyze' && analysis && !loading && (
          <div className="space-y-6 sm:space-y-8">
            {/* Header Title Banner */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 rounded-2xl border border-slate-800 bg-slate-900/90 p-5 sm:p-6 shadow-xl">
              <div>
                <div className="inline-flex items-center space-x-2 rounded-full bg-brand-500/10 border border-brand-500/20 px-3 py-1 text-xs font-semibold text-brand-400 mb-2">
                  <Building2 className="h-3.5 w-3.5" />
                  <span>Market Intelligence Analysis</span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
                  {analysis.category_info.title} in {analysis.target_city}, {analysis.city_metadata.country}
                </h1>
                <p className="text-xs text-slate-400 mt-1">
                  Population: <strong className="text-white">{(analysis.target_population / 1_000_000).toFixed(2)}M</strong> ({analysis.population_year} {analysis.city_metadata.population_source}) •
                  Engine: <strong className="text-slate-300">{analysis.city_metadata.release}</strong>
                </p>
              </div>

              {/* Action / Export Buttons */}
              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={handleExportExcel}
                  className="flex items-center space-x-1.5 rounded-xl bg-emerald-600/20 border border-emerald-500/30 hover:bg-emerald-600 hover:text-white px-3.5 py-2 text-xs font-bold text-emerald-400 transition-all cursor-pointer"
                >
                  <FileSpreadsheet className="h-4 w-4" />
                  <span>Export Excel (.xlsx)</span>
                </button>
                <button
                  onClick={handleExportCSV}
                  className="flex items-center space-x-1.5 rounded-xl border border-slate-800 bg-slate-950 hover:bg-slate-800 px-3.5 py-2 text-xs font-semibold text-slate-300 transition-colors cursor-pointer"
                >
                  <Download className="h-3.5 w-3.5 text-brand-400" />
                  <span>CSV</span>
                </button>
                <button
                  onClick={handleExportJSON}
                  className="flex items-center space-x-1.5 rounded-xl border border-slate-800 bg-slate-950 hover:bg-slate-800 px-3.5 py-2 text-xs font-semibold text-slate-300 transition-colors cursor-pointer"
                >
                  <Download className="h-3.5 w-3.5 text-brand-400" />
                  <span>JSON</span>
                </button>
              </div>
            </div>

            {/* KPI Cards Row */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
              <KpiCard
                title="Existing POIs"
                value={analysis.existing_count}
                subtitle={`${analysis.per_10k.toFixed(2)} per 10k residents`}
                icon={Building2}
                badge="Detected"
                badgeType="info"
              />

              <KpiCard
                title="Peer Benchmark"
                value={`${analysis.benchmark_per_10k.toFixed(2)}`}
                subtitle={`~${analysis.expected_count} expected supply`}
                icon={Target}
                badge="Peer Median"
                badgeType="info"
              />

              <KpiCard
                title="Opportunity Score"
                value={`${analysis.opportunity_score}/100`}
                subtitle={analysis.opportunity_label}
                icon={TrendingUp}
                badge={analysis.opportunity_label}
                badgeType={analysis.opportunity_score >= 80 ? 'success' : 'warning'}
                highlight={true}
              />

              <KpiCard
                title="Data Confidence"
                value={`${analysis.data_confidence_score}/100`}
                subtitle="OpenStreetMap + Nominatim + Wikidata"
                icon={ShieldCheck}
                badge="High Quality"
                badgeType="success"
              />
            </div>

            {/* Natural Language Explanation Card */}
            <div className="rounded-2xl border border-slate-800 bg-gradient-to-r from-slate-900 via-slate-900 to-brand-950/30 p-5 shadow-xl">
              <div className="flex items-center space-x-2 font-bold text-xs uppercase tracking-wider text-brand-400 mb-2">
                <Sparkles className="h-4 w-4" />
                <span>Market Gap Intelligence Summary</span>
              </div>
              <p className="text-xs sm:text-sm text-slate-200 leading-relaxed font-medium">
                {analysis.explanation}
              </p>
            </div>

            {/* Interactive Map & Supply Position */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              <div className="lg:col-span-8">
                <div className="mb-2 flex items-center justify-between">
                  <h3 className="text-xs sm:text-sm font-bold text-white uppercase tracking-wider">
                    Geographic Competition Map
                  </h3>
                  <span className="text-[11px] text-slate-400">
                    Click pins for details & phone/website links
                  </span>
                </div>
                <MapView
                  places={analysis.matched_places}
                  center={[analysis.city_metadata.lon, analysis.city_metadata.lat]}
                  bbox={analysis.city_metadata.bbox}
                  geojsonBoundary={analysis.city_metadata.geojson}
                  selectedPlaceId={selectedPlace?.id}
                  onSelectPlace={setSelectedPlace}
                />
              </div>

              <div className="lg:col-span-4 flex flex-col justify-between space-y-6">
                <SupplyGauge
                  existingCount={analysis.existing_count}
                  expectedCount={analysis.expected_count}
                  estimatedGap={analysis.estimated_gap}
                  gapPercent={analysis.gap_percent}
                  opportunityScore={analysis.opportunity_score}
                  opportunityLabel={analysis.opportunity_label}
                />

                {/* Neighborhood Quadrant Density */}
                <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-5 shadow-xl">
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-2">
                    Neighborhood Quadrant Density
                  </h3>
                  <p className="text-xs text-slate-400 mb-4">
                    Spatial distribution across city sub-zones.
                  </p>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    {Object.entries(analysis.neighborhood_density).map(([quad, count]) => (
                      <div key={quad} className="bg-slate-950 p-2.5 rounded-xl border border-slate-800 flex justify-between items-center">
                        <span className="text-slate-400 font-medium">{quad}</span>
                        <strong className="text-white">{count} POIs</strong>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Peer City Comparison Chart */}
            <PeerChart
              targetCity={analysis.target_city}
              targetPer10k={analysis.per_10k}
              benchmarkPer10k={analysis.benchmark_per_10k}
              peerCities={analysis.peer_cities}
            />

            {/* Business Directory Table & Cards */}
            <BusinessList
              places={analysis.matched_places}
              onSelectPlace={(p) => setSelectedPlace(p)}
              selectedPlaceId={selectedPlace?.id}
              onExportExcel={handleExportExcel}
              onExportCSV={handleExportCSV}
            />
          </div>
        )}

        {/* MODE B — DISCOVER OPPORTUNITIES DASHBOARD */}
        {mode === 'discover' && (
          <OpportunityScanner
            city={city}
            country={country}
            population={opportunities?.population || 841558}
            populationYear={opportunities?.population_year || '2024'}
            opportunities={opportunities?.opportunities || []}
            families={families}
            onSelectCategory={(catId) => {
              setSelectedCategoryId(catId);
              setMode('analyze');
              handleRunAnalysis(country, city, catId);
            }}
            loading={loading}
          />
        )}
      </main>

      {/* Methodology Drawer/Modal */}
      <MethodologyModal
        isOpen={isMethodologyOpen}
        onClose={() => setIsMethodologyOpen(false)}
        overtureRelease={analysis?.city_metadata?.release}
      />
    </div>
  );
}

export default App;
