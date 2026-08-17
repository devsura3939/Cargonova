import React, { useEffect, useRef, useState } from 'react';
import * as maplibregl from 'maplibre-gl';
import type { Place } from '../types';
import { Eye, EyeOff, MapPin, Phone, Globe, ExternalLink } from 'lucide-react';

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

  const [mapTheme, setMapTheme] = useState<'bright' | 'dark'>('bright');
  const [showPlaces, setShowPlaces] = useState(true);
  const [showBoundary, setShowBoundary] = useState(true);

  // Reliable high-definition raster map styles (100% uptime on mobile & web)
  const mapStyles: Record<string, any> = {
    bright: {
      version: 8,
      sources: {
        'carto-voyager': {
          type: 'raster',
          tiles: [
            'https://a.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}@2x.png',
            'https://b.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}@2x.png',
            'https://c.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}@2x.png'
          ],
          tileSize: 256,
          attribution: '&copy; OpenStreetMap contributors &copy; CARTO'
        }
      },
      layers: [
        {
          id: 'carto-voyager-layer',
          type: 'raster',
          source: 'carto-voyager',
          minzoom: 0,
          maxzoom: 19
        }
      ]
    },
    dark: {
      version: 8,
      sources: {
        'carto-dark': {
          type: 'raster',
          tiles: [
            'https://a.basemaps.cartocdn.com/rastertiles/dark_all/{z}/{x}/{y}@2x.png',
            'https://b.basemaps.cartocdn.com/rastertiles/dark_all/{z}/{x}/{y}@2x.png',
            'https://c.basemaps.cartocdn.com/rastertiles/dark_all/{z}/{x}/{y}@2x.png'
          ],
          tileSize: 256,
          attribution: '&copy; OpenStreetMap contributors &copy; CARTO'
        }
      },
      layers: [
        {
          id: 'carto-dark-layer',
          type: 'raster',
          source: 'carto-dark',
          minzoom: 0,
          maxzoom: 19
        }
      ]
    }
  };

  const getCategoryTheme = (cat: string) => {
    const s = cat.toLowerCase();
    if (s.includes('bar') || s.includes('pub') || s.includes('cocktail')) return { icon: '🍷', color: '#d97706' };
    if (s.includes('cafe') || s.includes('coffee') || s.includes('bakery')) return { icon: '☕', color: '#ea580c' };
    if (s.includes('restaurant') || s.includes('dining') || s.includes('food')) return { icon: '🍔', color: '#dc2626' };
    if (s.includes('beauty') || s.includes('hair') || s.includes('salon') || s.includes('barber')) return { icon: '✂️', color: '#db2777' };
    if (s.includes('gym') || s.includes('fitness') || s.includes('yoga') || s.includes('sports')) return { icon: '🏋️', color: '#0284c7' };
    if (s.includes('cinema') || s.includes('theater') || s.includes('movie')) return { icon: '🎬', color: '#4f46e5' };
    if (s.includes('pet') || s.includes('grooming') || s.includes('vet')) return { icon: '🐶', color: '#059669' };
    if (s.includes('hotel') || s.includes('lodging') || s.includes('resort')) return { icon: '🏨', color: '#0d9488' };
    if (s.includes('laundry') || s.includes('clean')) return { icon: '🧼', color: '#2563eb' };
    return { icon: '📍', color: '#0284c7' };
  };

  // Initialize Map
  useEffect(() => {
    if (!mapContainer.current) return;

    if (!map.current) {
      map.current = new maplibregl.Map({
        container: mapContainer.current,
        style: mapStyles[mapTheme],
        center: center,
        zoom: 12,
        attributionControl: false
      });

      map.current.addControl(new maplibregl.NavigationControl(), 'top-right');
    }
  }, []);

  // Update theme style
  useEffect(() => {
    if (!map.current) return;
    map.current.setStyle(mapStyles[mapTheme]);
    map.current.once('style.load', () => {
      updateBoundaryLayer();
      updateClusterLayers();
    });
  }, [mapTheme]);

  // Update bounds & boundary layer
  useEffect(() => {
    if (!map.current) return;

    if (bbox && bbox.length === 4) {
      map.current.fitBounds(
        [
          [bbox[0], bbox[1]],
          [bbox[2], bbox[3]]
        ],
        { padding: 40, maxZoom: 15, duration: 1000 }
      );
    } else {
      map.current.flyTo({ center, zoom: 12, duration: 800 });
    }

    if (map.current.isStyleLoaded()) {
      updateBoundaryLayer();
      updateClusterLayers();
    } else {
      map.current.on('load', () => {
        updateBoundaryLayer();
        updateClusterLayers();
      });
    }
  }, [geojsonBoundary, bbox, center, places]);

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
          'line-opacity': showBoundary ? 0.85 : 0
        }
      });
    }
  };

  const updateClusterLayers = () => {
    if (!map.current) return;

    const sourceId = 'places-cluster-source';
    const clusterLayerId = 'clusters-circle';
    const clusterCountId = 'cluster-count';
    const unclusteredPointId = 'unclustered-point';

    const geojsonFeatures: any = {
      type: 'FeatureCollection',
      features: places.map((p) => ({
        type: 'Feature',
        geometry: {
          type: 'Point',
          coordinates: [p.lon, p.lat]
        },
        properties: {
          id: p.id,
          name: p.name,
          category: p.category_primary || p.taxonomy_primary,
          address: p.address || p.locality || '',
          brand: p.brand || '',
          phone: p.phone || '',
          website: p.website || '',
          confidence: Math.round(p.confidence * 100),
          lat: p.lat,
          lon: p.lon
        }
      }))
    };

    if (map.current.getSource(sourceId)) {
      (map.current.getSource(sourceId) as maplibregl.GeoJSONSource).setData(geojsonFeatures);
    } else {
      map.current.addSource(sourceId, {
        type: 'geojson',
        data: geojsonFeatures,
        cluster: true,
        clusterMaxZoom: 14,
        clusterRadius: 45
      });

      // Clusters Layer
      map.current.addLayer({
        id: clusterLayerId,
        type: 'circle',
        source: sourceId,
        filter: ['has', 'point_count'],
        paint: {
          'circle-color': [
            'step',
            ['get', 'point_count'],
            '#0284c7',
            30,
            '#f59e0b',
            100,
            '#ef4444'
          ],
          'circle-radius': ['step', ['get', 'point_count'], 18, 30, 24, 100, 30],
          'circle-stroke-width': 3,
          'circle-stroke-color': '#ffffff'
        }
      });

      // Cluster Count Text
      map.current.addLayer({
        id: clusterCountId,
        type: 'symbol',
        source: sourceId,
        filter: ['has', 'point_count'],
        layout: {
          'text-field': '{point_count_abbreviated}',
          'text-size': 12
        },
        paint: {
          'text-color': '#ffffff'
        }
      });

      // Individual Point Layer
      map.current.addLayer({
        id: unclusteredPointId,
        type: 'circle',
        source: sourceId,
        filter: ['!', ['has', 'point_count']],
        paint: {
          'circle-color': '#0284c7',
          'circle-radius': 9,
          'circle-stroke-width': 2.5,
          'circle-stroke-color': '#ffffff'
        }
      });

      // Click on cluster to zoom
      map.current.on('click', clusterLayerId, (e) => {
        if (!map.current) return;
        const features = map.current.queryRenderedFeatures(e.point, { layers: [clusterLayerId] });
        const clusterId = features[0].properties.cluster_id;
        (map.current.getSource(sourceId) as maplibregl.GeoJSONSource).getClusterExpansionZoom(
          clusterId,
          (err, zoom) => {
            if (err || !map.current) return;
            map.current.easeTo({
              center: (features[0].geometry as any).coordinates,
              zoom: zoom
            });
          }
        );
      });

      // Click on point for Google Maps Popup card
      map.current.on('click', unclusteredPointId, (e) => {
        if (!map.current || !e.features || e.features.length === 0) return;
        const props = e.features[0].properties;
        const coords = (e.features[0].geometry as any).coordinates.slice();

        const catTheme = getCategoryTheme(props.category || 'business');

        const popupNode = document.createElement('div');
        popupNode.className = 'p-2 max-w-xs text-xs font-sans text-slate-100';
        popupNode.innerHTML = `
          <div class="flex items-start justify-between gap-2 mb-1">
            <div class="font-extrabold text-white text-sm leading-tight">${props.name}</div>
            <span class="shrink-0 rounded bg-slate-800 border border-slate-700 px-1.5 py-0.5 text-[9px] font-bold text-emerald-400">
              ${props.confidence}% Conf
            </span>
          </div>

          <div class="text-[11px] text-brand-300 font-semibold mb-2 capitalize flex items-center space-x-1">
            <span>${catTheme.icon}</span>
            <span>${String(props.category).replace(/_/g, ' ')}</span>
          </div>

          ${props.brand ? `<div class="text-[10px] text-emerald-300 font-medium mb-1">🏷️ Brand: <strong>${props.brand}</strong></div>` : ''}
          ${props.address ? `<div class="text-[11px] text-slate-300 mb-2 leading-tight">📍 ${props.address}</div>` : ''}

          <div class="flex flex-wrap items-center gap-1.5 pt-2 border-t border-slate-800 text-[10px]">
            ${props.phone ? `<a href="tel:${props.phone}" class="bg-brand-600/30 hover:bg-brand-600 text-brand-300 hover:text-white px-2 py-1 rounded-lg border border-brand-500/30 transition-colors">📞 Call</a>` : ''}
            ${props.website ? `<a href="${props.website}" target="_blank" class="bg-brand-600/30 hover:bg-brand-600 text-brand-300 hover:text-white px-2 py-1 rounded-lg border border-brand-500/30 transition-colors">🌐 Website ↗</a>` : ''}
            <a href="https://www.google.com/maps/search/?api=1&query=${props.lat},${props.lon}" target="_blank" class="bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white px-2 py-1 rounded-lg border border-slate-700 transition-colors">📍 Google Maps ↗</a>
          </div>
        `;

        new maplibregl.Popup({ offset: 15, closeButton: true })
          .setLngLat(coords)
          .setDOMContent(popupNode)
          .addTo(map.current);

        if (onSelectPlace) {
          const match = places.find((p) => p.id === props.id);
          if (match) onSelectPlace(match);
        }
      });

      map.current.on('mouseenter', clusterLayerId, () => {
        if (map.current) map.current.getCanvas().style.cursor = 'pointer';
      });
      map.current.on('mouseleave', clusterLayerId, () => {
        if (map.current) map.current.getCanvas().style.cursor = '';
      });
      map.current.on('mouseenter', unclusteredPointId, () => {
        if (map.current) map.current.getCanvas().style.cursor = 'pointer';
      });
      map.current.on('mouseleave', unclusteredPointId, () => {
        if (map.current) map.current.getCanvas().style.cursor = '';
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
    const clusterLayerId = 'clusters-circle';
    const clusterCountId = 'cluster-count';
    const unclusteredPointId = 'unclustered-point';

    const vis = showPlaces ? 'visible' : 'none';
    if (map.current.getLayer(clusterLayerId)) map.current.setLayoutProperty(clusterLayerId, 'visibility', vis);
    if (map.current.getLayer(clusterCountId)) map.current.setLayoutProperty(clusterCountId, 'visibility', vis);
    if (map.current.getLayer(unclusteredPointId)) map.current.setLayoutProperty(unclusteredPointId, 'visibility', vis);
  }, [showPlaces]);

  return (
    <div className="relative w-full h-[420px] sm:h-[540px] rounded-2xl overflow-hidden border border-slate-800 shadow-2xl bg-slate-900">
      <div ref={mapContainer} className="w-full h-full" />

      {/* Map Control Box */}
      <div className="absolute top-3 left-3 z-20 flex flex-col space-y-1.5 bg-slate-900/95 backdrop-blur-md border border-slate-800 p-2.5 rounded-2xl text-xs shadow-2xl text-slate-200">
        <div className="font-bold text-[10px] uppercase tracking-wider text-slate-400 px-1 mb-0.5">
          Map Style
        </div>
        <div className="grid grid-cols-2 gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800 mb-1">
          <button
            onClick={() => setMapTheme('bright')}
            className={`px-2 py-1 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${
              mapTheme === 'bright' ? 'bg-brand-600 text-white shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            Streets
          </button>
          <button
            onClick={() => setMapTheme('dark')}
            className={`px-2 py-1 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${
              mapTheme === 'dark' ? 'bg-brand-600 text-white shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            Dark
          </button>
        </div>

        <button
          onClick={() => setShowPlaces(!showPlaces)}
          className={`flex items-center space-x-2 px-2.5 py-1.5 rounded-xl transition-colors text-[11px] cursor-pointer ${
            showPlaces ? 'bg-brand-500/20 text-brand-300 font-semibold' : 'text-slate-400 hover:bg-slate-800'
          }`}
        >
          {showPlaces ? <Eye className="h-3.5 w-3.5 text-brand-400" /> : <EyeOff className="h-3.5 w-3.5" />}
          <span>Clustered POIs ({places.length})</span>
        </button>

        <button
          onClick={() => setShowBoundary(!showBoundary)}
          className={`flex items-center space-x-2 px-2.5 py-1.5 rounded-xl transition-colors text-[11px] cursor-pointer ${
            showBoundary ? 'bg-brand-500/20 text-brand-300 font-semibold' : 'text-slate-400 hover:bg-slate-800'
          }`}
        >
          {showBoundary ? <Eye className="h-3.5 w-3.5 text-brand-400" /> : <EyeOff className="h-3.5 w-3.5" />}
          <span>City Boundary</span>
        </button>
      </div>

      {/* Counter Badge */}
      <div className="absolute bottom-3 right-3 z-20 bg-slate-900/95 backdrop-blur-md border border-slate-800 px-3.5 py-2 rounded-2xl text-xs text-slate-300 shadow-xl flex items-center space-x-2">
        <span className="h-2.5 w-2.5 rounded-full bg-emerald-400 animate-pulse" />
        <span>Displaying <strong className="text-white font-extrabold">{places.length}</strong> Locations</span>
      </div>
    </div>
  );
};
