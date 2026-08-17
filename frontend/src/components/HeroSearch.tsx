import React, { useState, useEffect } from 'react';
import { Search, MapPin, Building2, Globe, Sparkles, X } from 'lucide-react';
import type { CategoryInfo } from '../types';

interface HeroSearchProps {
  country: string;
  setCountry: (c: string) => void;
  city: string;
  setCity: (c: string) => void;
  selectedCategoryId: string;
  setSelectedCategoryId: (id: string) => void;
  categories: CategoryInfo[];
  mode: 'analyze' | 'discover';
  onSearch: (targetCountry?: string, targetCity?: string, targetCat?: string) => void;
  loading: boolean;
}

const COUNTRY_CITIES_MAP: Record<string, string[]> = {
  Spain: ['Valencia', 'Barcelona', 'Madrid', 'Seville', 'Zaragoza', 'Malaga', 'Bilbao', 'Alicante', 'Cordoba', 'Granada'],
  Georgia: ['Tbilisi', 'Batumi', 'Kutaisi', 'Gori', 'Rustavi', 'Poti', 'Zugdidi', 'Telavi', 'Akhaltsikhe'],
  Germany: ['Berlin', 'Munich', 'Hamburg', 'Frankfurt', 'Cologne', 'Stuttgart', 'Leipzig', 'Dresden', 'Hannover', 'Nuremberg'],
  Poland: ['Warsaw', 'Krakow', 'Wroclaw', 'Poznan', 'Gdansk', 'Szczecin', 'Bydgoszcz', 'Lublin'],
  'United Kingdom': ['London', 'Manchester', 'Birmingham', 'Edinburgh', 'Glasgow', 'Bristol', 'Leeds', 'Liverpool'],
  France: ['Paris', 'Lyon', 'Marseille', 'Toulouse', 'Nice', 'Nantes', 'Strasbourg', 'Bordeaux'],
  Italy: ['Rome', 'Milan', 'Naples', 'Turin', 'Palermo', 'Genoa', 'Bologna', 'Florence', 'Venice'],
  'United States': ['New York', 'Los Angeles', 'Chicago', 'Houston', 'Phoenix', 'Philadelphia', 'San Antonio', 'San Diego', 'Austin', 'Seattle', 'Denver', 'Miami', 'Atlanta'],
  Japan: ['Tokyo', 'Osaka', 'Yokohama', 'Nagoya', 'Sapporo', 'Fukuoka', 'Kobe', 'Kyoto'],
  Armenia: ['Yerevan', 'Gyumri', 'Vanadzor'],
  Bulgaria: ['Sofia', 'Plovdiv', 'Varna', 'Burgas'],
  Albania: ['Tirana', 'Durres', 'Vlore'],
  Croatia: ['Zagreb', 'Split', 'Rijeka'],
  Serbia: ['Belgrade', 'Novi Sad', 'Nis'],
  'Czech Republic': ['Prague', 'Brno', 'Ostrava'],
  Hungary: ['Budapest', 'Debrecen', 'Szeged'],
  Romania: ['Bucharest', 'Cluj-Napoca', 'Timisoara']
};

export const HeroSearch: React.FC<HeroSearchProps> = ({
  country,
  setCountry,
  city,
  setCity,
  selectedCategoryId,
  setSelectedCategoryId,
  categories,
  mode,
  onSearch,
  loading
}) => {
  const [localCountry, setLocalCountry] = useState(country);
  const [localCity, setLocalCity] = useState(city);
  const [localCategory, setLocalCategory] = useState(selectedCategoryId);

  useEffect(() => {
    setLocalCountry(country);
  }, [country]);

  useEffect(() => {
    setLocalCity(city);
  }, [city]);

  useEffect(() => {
    setLocalCategory(selectedCategoryId);
  }, [selectedCategoryId]);

  const handleCountryChange = (newCountry: string) => {
    setLocalCountry(newCountry);
    setCountry(newCountry);
    const availableCities = COUNTRY_CITIES_MAP[newCountry] || [];
    if (availableCities.length > 0) {
      const defaultCity = availableCities[0];
      setLocalCity(defaultCity);
      setCity(defaultCity);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanCity = localCity.trim();
    if (cleanCity) {
      setCountry(localCountry);
      setCity(cleanCity);
      setSelectedCategoryId(localCategory);
      onSearch(localCountry, cleanCity, localCategory);
    }
  };

  const popularCountries = Object.keys(COUNTRY_CITIES_MAP);
  const availableCities = COUNTRY_CITIES_MAP[localCountry] || [];

  const handleQuickSample = (sampleCountry: string, sampleCity: string, sampleCat: string) => {
    setLocalCountry(sampleCountry);
    setLocalCity(sampleCity);
    setLocalCategory(sampleCat);

    setCountry(sampleCountry);
    setCity(sampleCity);
    setSelectedCategoryId(sampleCat);

    onSearch(sampleCountry, sampleCity, sampleCat);
  };

  return (
    <div className="relative overflow-hidden bg-gradient-to-b from-slate-900 via-slate-900/95 to-slate-950 border-b border-slate-800/80 py-6 sm:py-10 px-4 sm:px-6">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-40 bg-brand-500/10 blur-3xl pointer-events-none rounded-full" />

      <div className="relative mx-auto max-w-5xl text-center">
        <h1 className="text-2xl font-extrabold tracking-tight sm:text-4xl md:text-5xl text-white">
          Find What Your City Is <span className="bg-gradient-to-r from-brand-400 via-blue-300 to-indigo-300 bg-clip-text text-transparent">Missing</span>
        </h1>
        <p className="mt-2 text-xs sm:text-sm text-slate-400 max-w-2xl mx-auto leading-relaxed">
          Discover underserved business categories, benchmark against peer cities globally, and unlock Blue Ocean commercial opportunities using Overture Maps GeoParquet location intelligence.
        </p>

        <form
          onSubmit={handleSubmit}
          className="mt-6 p-3 sm:p-4 bg-slate-900/95 border border-slate-800 rounded-2xl sm:rounded-3xl shadow-2xl shadow-slate-950/90 max-w-4xl mx-auto grid grid-cols-1 gap-3 sm:grid-cols-12 items-center"
        >
          {/* Country Selector */}
          <div className="sm:col-span-3 text-left">
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 px-1">
              Country
            </label>
            <div className="relative flex items-center">
              <Globe className="absolute left-3 h-4 w-4 text-brand-400 pointer-events-none" />
              <select
                value={localCountry}
                onChange={(e) => handleCountryChange(e.target.value)}
                className="w-full pl-9 pr-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs font-semibold text-white focus:outline-none focus:border-brand-500 appearance-none cursor-pointer"
              >
                {popularCountries.map((c) => (
                  <option key={c} value={c} className="bg-slate-900 text-white">
                    {c}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* City Selector & Custom Input */}
          <div className="sm:col-span-4 text-left">
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 px-1">
              City
            </label>
            <div className="relative flex items-center">
              <MapPin className="absolute left-3 h-4 w-4 text-brand-400 pointer-events-none" />
              <input
                type="text"
                list="city-options"
                value={localCity}
                onChange={(e) => setLocalCity(e.target.value)}
                placeholder="Select or type city..."
                className="w-full pl-9 pr-8 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs font-semibold text-white placeholder-slate-500 focus:outline-none focus:border-brand-500"
              />
              <datalist id="city-options">
                {availableCities.map((cityName) => (
                  <option key={cityName} value={cityName} />
                ))}
              </datalist>
              {localCity && (
                <button
                  type="button"
                  onClick={() => setLocalCity('')}
                  className="absolute right-2.5 text-slate-500 hover:text-white"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Industry Selector (Mode A) */}
          {mode === 'analyze' && (
            <div className="sm:col-span-3 text-left">
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 px-1">
                Business Industry
              </label>
              <div className="relative flex items-center">
                <Building2 className="absolute left-3 h-4 w-4 text-brand-400 pointer-events-none" />
                <select
                  value={localCategory}
                  onChange={(e) => setLocalCategory(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs font-semibold text-white focus:outline-none focus:border-brand-500 appearance-none cursor-pointer"
                >
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id} className="bg-slate-900 text-white">
                      {cat.title}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {/* Action Trigger Button */}
          <div className={`${mode === 'analyze' ? 'sm:col-span-2' : 'sm:col-span-5'} text-left sm:pt-4`}>
            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center space-x-2 py-2.5 px-4 bg-gradient-to-r from-brand-600 via-brand-500 to-blue-500 hover:from-brand-500 hover:to-blue-400 text-white rounded-xl text-xs font-bold shadow-lg shadow-brand-600/30 transition-all disabled:opacity-50 cursor-pointer"
            >
              {loading ? (
                <>
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  <span>Analyzing...</span>
                </>
              ) : mode === 'analyze' ? (
                <>
                  <Search className="h-4 w-4" />
                  <span>Analyze</span>
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" />
                  <span>Find Gap Opportunities</span>
                </>
              )}
            </button>
          </div>
        </form>

        <div className="mt-4 flex flex-wrap items-center justify-center gap-2 text-xs text-slate-400">
          <span className="text-slate-500 font-semibold text-[11px]">Popular Quick Searches:</span>
          {[
            { country: 'Georgia', city: 'Gori', cat: 'bar_pub', label: 'Gori • Bar & Pub' },
            { country: 'Germany', city: 'Berlin', cat: 'gym', label: 'Berlin • Gym' },
            { country: 'Spain', city: 'Valencia', cat: 'bar_pub', label: 'Valencia • Bar & Pub' },
            { country: 'Spain', city: 'Barcelona', cat: 'cafe', label: 'Barcelona • Cafe' },
            { country: 'Georgia', city: 'Tbilisi', cat: 'pet_grooming', label: 'Tbilisi • Pet Grooming' },
            { country: 'Poland', city: 'Warsaw', cat: 'laundry', label: 'Warsaw • Laundromat' }
          ].map((sample) => (
            <button
              key={sample.label}
              type="button"
              onClick={() => handleQuickSample(sample.country, sample.city, sample.cat)}
              className="rounded-full bg-slate-900 border border-slate-800 px-3 py-1 text-[11px] font-medium text-slate-300 hover:border-brand-500/50 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            >
              {sample.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
