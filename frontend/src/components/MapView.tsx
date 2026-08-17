import React, { useEffect, useRef, useState } from 'react';
import * as maplibregl from 'maplibre-gl';
import type { Place } from '../types';
import { Eye, EyeOff } from 'lucide-react';

interface MapViewProps {
  places: Place[];
  center: [number, number]; // [lon, lat]
  bbox?: [number, number, number, number];
  geojsonBoundary?: any;
  selectedPlaceId?: string | null;
  onSelectPlace?: (place: Place | null) => void;
}

export const MapView: React.FC<MapViewProps> = ({
  places,
  center,
  bbox,
  geojsonBoundary,
  selectedPlaceId,
  onSelectPlace
}) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<maplibregl.Map | null>(null);
  const markersRef = useRef<maplibregl.Marker[]>([]);

  const [mapStyle, setMapStyle] = useState<'voyager' | 'dark'>('voyager');
  const [showPlaces, setShowPlaces] = useState(true);
  const [showBoundary, setShowBoundary] = useState(true);

  const styleUrls = {
    voyager: 'https://basemaps.cartocdn.com/gl/voyager-gl-style/style.json',
    dark: 'https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json'
  };

  const getCategoryTheme = (cat: string, tax: string) => {
    const s = `${cat} ${tax}`.toLowerCase();
    if (s.includes('bar') || s.includes('pub') || s.includes('cocktail')) return { icon: '🍷', bg: '#f59e0b' };
    if (s.includes('cafe') || s.includes('coffee') || s.includes('bakery')) return { icon: '☕', bg: '#ea580c' };
    if (s.includes('restaurant') || s.includes('dining') || s.includes('food')) return { icon: '🍔', bg: '#ef4444' };
    if (s.includes('beauty') || s.includes('hair') || s.includes('salon') || s.includes('barber')) return { icon: '✂️', bg: '#ec4899' };
    if (s.includes('gym') || s.includes('fitness') || s.includes('yoga') || s.includes('sports')) return { icon: '🏋️', bg: '#0284c7' };
    if (s.includes('cinema') || s.includes('theater') || s.includes('movie')) return { icon: '🎬', bg: '#6366f1' };
    if (s.includes('pet') || s.includes('grooming') || s.includes('vet')) return { icon: '🐶', bg: '#10b981' };
    if (s.includes('hotel') || s.includes('lodging') || s.includes('resort')) return { icon: '🏨', bg: '#14b8a6' };
    if (s.includes('laundry') || s.includes('clean')) return { icon: '🧼', bg: '#3b82f6' };
    return { icon: '📍', bg: '#0c93e7' };
  };

  useEffect(() => {
    if (!mapContainer.current) return;

    if (!map.current) {
      map.current = new maplibregl.Map({
        container: mapContainer.current,
        style: styleUrls[mapStyle],
        center: center,
        zoom: 12,
        attributionControl: false
      });

      map.current.addControl(new maplibregl.NavigationControl(), 'top-right');
    }
  }, []);

  useEffect(() => {
    if (!map.current) return;
    map.current.setStyle(styleUrls[mapStyle]);
    map.current.once('style.load', () => {
      updateBoundaryLayer();
    });
  }, [mapStyle]);

  useEffect(() => {
    if (!map.current) return;

    if (bbox && bbox.length === 4) {
      map.current.fitBounds(
        [
          [bbox[0], bbox[1]],
          [bbox[2], bbox[3]]
        ],
        { padding: 50, maxZoom: 15, duration: 1200 }
      );
    } else {
      map.current.flyTo({ center, zoom: 12, duration: 1000 });
    }

    if (map.current.isStyleLoaded()) {
      updateBoundaryLayer();
    } else {
      map.current.on('load', updateBoundaryLayer);
    }
  }, [geojsonBoundary, bbox, center]);

  const updateBoundaryLayer = () => {
    if (!map.current || !geojsonBoundary) return;

    const sourceId = 'city-boundary-source';
    const fillId = 'city-boundary-fill';
    const lineId = 'city-boundary-line';

    if (map.current.getSource(sourceId)) {
      (map.current.getSource(sourceId) as maplibregl.GeoJSONSource).setData({
        type: 'Feature',
        geometry: geojsonBoundary,
        properties: {}
      });
    } else {
      map.current.addSource(sourceId, {
        type: 'geojson',
        data: {
          type: 'Feature',
          geometry: geojsonBoundary,
          properties: {}
        }
      });

      map.current.addLayer({
        id: fillId,
        type: 'fill',
        source: sourceId,
        paint: {
          'fill-color': '#0284c7',
          'fill-opacity': showBoundary ? 0.15 : 0
        }
      });

      map.current.addLayer({
        id: lineId,
        type: 'line',
        source: sourceId,
        paint: {
          'line-color': '#0284c7',
          'line-width': 2.5,
          'line-opacity': showBoundary ? 0.9 : 0
        }
      });
    }
  };

  useEffect(() => {
    if (!map.current) return;
    if (map.current.getLayer('city-boundary-fill')) {
      map.current.setLayoutProperty('city-boundary-fill', 'visibility', showBoundary ? 'visible' : 'none');
    }
    if (map.current.getLayer('city-boundary-line')) {
      map.current.setLayoutProperty('city-boundary-line', 'visibility', showBoundary ? 'visible' : 'none');
    }
  }, [showBoundary]);

  useEffect(() => {
    if (!map.current) return;

    markersRef.current.forEach((m) => m.remove());
    markersRef.current = [];

    if (!showPlaces) return;

    places.forEach((place) => {
      const isSelected = place.id === selectedPlaceId;
      const theme = getCategoryTheme(place.category_primary, place.taxonomy_primary);

      const el = document.createElement('div');
      el.className = `marker-pin flex items-center justify-center cursor-pointer transition-all duration-200 hover:scale-135 ${
        isSelected ? 'z-30 scale-140' : 'z-10'
      }`;

      el.innerHTML = `
        <div style="background-color: ${theme.bg}; border: 2px solid ${isSelected ? '#f59e0b' : '#ffffff'}; box-shadow: 0 8px 16px rgba(0,0,0,0.35);" 
             class="h-7 w-7 rounded-full flex items-center justify-center text-white text-[11px] font-extrabold">
          ${theme.icon}
        </div>
      `;

      const popupNode = document.createElement('div');
      popupNode.className = 'p-2 max-w-xs text-xs font-sans text-slate-100';
      popupNode.innerHTML = `
        <div class="flex items-start justify-between gap-2 mb-1">
          <div class="font-extrabold text-white text-sm leading-tight">${place.name}</div>
          <span class="shrink-0 rounded bg-slate-800 border border-slate-700 px-1.5 py-0.5 text-[9px] font-semibold text-emerald-400">
            ${(place.confidence * 100).toFixed(0)}% Conf
          </span>
        </div>

        <div class="text-[11px] text-brand-300 font-semibold mb-2 capitalize flex items-center space-x-1">
          <span>${theme.icon}</span>
          <span>${(place.taxonomy_primary !== 'unclassified' ? place.taxonomy_primary : place.category_primary).replace(/_/g, ' ')}</span>
        </div>

        ${place.brand ? `<div class="text-[10px] text-emerald-300 font-medium mb-1">🏷️ Brand: <strong>${place.brand}</strong></div>` : ''}
        ${place.address || place.locality ? `<div class="text-[11px] text-slate-300 mb-2 leading-tight">📍 ${place.address || place.locality}</div>` : ''}

        <div class="flex flex-wrap items-center gap-1.5 pt-2 border-t border-slate-800 text-[10px]">
          ${place.phone ? `<a href="tel:${place.phone}" class="bg-brand-600/30 hover:bg-brand-600 text-brand-300 hover:text-white px-2 py-1 rounded-lg border border-brand-500/30 transition-colors">📞 Call</a>` : ''}
          ${place.website ? `<a href="${place.website}" target="_blank" class="bg-brand-600/30 hover:bg-brand-600 text-brand-300 hover:text-white px-2 py-1 rounded-lg border border-brand-500/30 transition-colors">🌐 Website ↗</a>` : ''}
          <a href="https://www.google.com/maps/search/?api=1&query=${place.lat},${place.lon}" target="_blank" class="bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white px-2 py-1 rounded-lg border border-slate-700 transition-colors">📍 Google Maps ↗</a>
        </div>
      `;

      const popup = new maplibregl.Popup({ offset: 18, closeButton: true }).setDOMContent(popupNode);

      const marker = new maplibregl.Marker({ element: el })
        .setLngLat([place.lon, place.lat])
        .setPopup(popup)
        .addTo(map.current!);

      el.addEventListener('click', () => {
        if (onSelectPlace) onSelectPlace(place);
      });

      markersRef.current.push(marker);
    });
  }, [places, showPlaces, selectedPlaceId]);

  return (
    <div className="relative w-full h-[400px] sm:h-[520px] rounded-2xl overflow-hidden border border-slate-800 shadow-2xl bg-slate-900">
      <div ref={mapContainer} className="w-full h-full" />

      <div className="absolute top-3 left-3 z-20 flex flex-col space-y-1.5 bg-slate-900/95 backdrop-blur-md border border-slate-800 p-2.5 rounded-2xl text-xs shadow-2xl text-slate-200">
        <div className="font-bold text-[10px] uppercase tracking-wider text-slate-400 px-1 mb-0.5">
          Map Theme
        </div>
        <div className="grid grid-cols-2 gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800 mb-1">
          <button
            onClick={() => setMapStyle('voyager')}
            className={`px-2 py-1 rounded-lg text-[10px] font-bold transition-all ${
              mapStyle === 'voyager' ? 'bg-brand-600 text-white shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            Light / Streets
          </button>
          <button
            onClick={() => setMapStyle('dark')}
            className={`px-2 py-1 rounded-lg text-[10px] font-bold transition-all ${
              mapStyle === 'dark' ? 'bg-brand-600 text-white shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            Dark Mode
          </button>
        </div>

        <button
          onClick={() => setShowPlaces(!showPlaces)}
          className={`flex items-center space-x-2 px-2.5 py-1.5 rounded-xl transition-colors text-[11px] ${
            showPlaces ? 'bg-brand-500/20 text-brand-300 font-semibold' : 'text-slate-400 hover:bg-slate-800'
          }`}
        >
          {showPlaces ? <Eye className="h-3.5 w-3.5 text-brand-400" /> : <EyeOff className="h-3.5 w-3.5" />}
          <span>Businesses ({places.length})</span>
        </button>

        <button
          onClick={() => setShowBoundary(!showBoundary)}
          className={`flex items-center space-x-2 px-2.5 py-1.5 rounded-xl transition-colors text-[11px] ${
            showBoundary ? 'bg-brand-500/20 text-brand-300 font-semibold' : 'text-slate-400 hover:bg-slate-800'
          }`}
        >
          {showBoundary ? <Eye className="h-3.5 w-3.5 text-brand-400" /> : <EyeOff className="h-3.5 w-3.5" />}
          <span>City Boundary</span>
        </button>
      </div>

      <div className="absolute bottom-3 right-3 z-20 bg-slate-900/95 backdrop-blur-md border border-slate-800 px-3.5 py-2 rounded-2xl text-xs text-slate-300 shadow-xl flex items-center space-x-2">
        <span className="h-2.5 w-2.5 rounded-full bg-emerald-400 animate-pulse" />
        <span>Displaying <strong className="text-white font-extrabold">{places.length}</strong> Locations</span>
      </div>
    </div>
  );
};
